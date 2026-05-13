const fs = require("node:fs/promises");
const path = require("node:path");

const DATA_DIR = path.join(__dirname, "..", "data", "chance2buy");
const ASSET_ROOT = path.join(__dirname, "..", "assets", "images", "chance2buy");
const PRODUCT_DIR = path.join(ASSET_ROOT, "products");
const CATEGORY_DIR = path.join(ASSET_ROOT, "categories");
const CONCURRENCY = 1;
const REQUEST_DELAY_MS = 300;
const RETRIES = 5;

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "item";
}

function extensionFor(url, contentType) {
  const pathname = new URL(url).pathname.toLowerCase();
  const match = pathname.match(/\.(jpe?g|png|webp|gif)$/);
  if (match) return match[0];
  if (/png/.test(contentType)) return ".png";
  if (/webp/.test(contentType)) return ".webp";
  if (/gif/.test(contentType)) return ".gif";
  return ".jpg";
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function existingImage(fileBase) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".gif"]) {
    const filePath = `${fileBase}${ext}`;
    if (await exists(filePath)) {
      return {
        ok: true,
        filePath,
        relativePath: path.relative(path.join(__dirname, ".."), filePath).replace(/\\/g, "/"),
        skipped: true
      };
    }
  }
  return null;
}

async function downloadImage(url, fileBase) {
  if (!url) return { ok: false, reason: "missing-url" };
  const existing = await existingImage(fileBase);
  if (existing) return existing;

  let lastReason = "";
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    await sleep(attempt === 1 ? REQUEST_DELAY_MS : REQUEST_DELAY_MS * attempt * 3);
    const response = await fetch(url, {
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "user-agent": "Mozilla/5.0 CellVia image import (+local catalog)"
      }
    });

    if (!response.ok) {
      lastReason = `${response.status} ${response.statusText}`;
      if (response.status === 429 || response.status >= 500) continue;
      return { ok: false, reason: lastReason };
    }

    const contentType = response.headers.get("content-type") || "";
    const ext = extensionFor(url, contentType);
    const filePath = `${fileBase}${ext}`;
    const relativePath = path.relative(path.join(__dirname, ".."), filePath).replace(/\\/g, "/");
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    return { ok: true, filePath, relativePath, bytes: buffer.length };
  }

  return { ok: false, reason: lastReason || "request-failed" };
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;

  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function main() {
  const products = JSON.parse(await fs.readFile(path.join(DATA_DIR, "products.json"), "utf8"));
  const categories = JSON.parse(await fs.readFile(path.join(DATA_DIR, "categories.json"), "utf8"));

  await fs.mkdir(PRODUCT_DIR, { recursive: true });
  await fs.mkdir(CATEGORY_DIR, { recursive: true });

  const productResults = await mapLimit(products, CONCURRENCY, async (product, index) => {
    const categorySlug = slugify(product.topCategory);
    const productFolder = path.join(PRODUCT_DIR, categorySlug);
    await fs.mkdir(productFolder, { recursive: true });
    const fileBase = path.join(productFolder, `${product.sourceId}-${slugify(product.name)}`);
    const sourceImage = product.thumbnail || product.image;
    const result = await downloadImage(sourceImage, fileBase);
    if (result.ok) {
      product.localImage = result.relativePath;
      product.originalImage = product.image || "";
      product.image = result.relativePath;
    }
    if ((index + 1) % 100 === 0 || index + 1 === products.length) {
      console.log(`products ${index + 1}/${products.length}`);
    }
    return { sourceId: product.sourceId, name: product.name, sourceImage, ...result };
  });

  const categoryResults = await mapLimit(categories, CONCURRENCY, async (category) => {
    const fileBase = path.join(CATEGORY_DIR, `${category.sourceId || category.slug}-${slugify(category.name)}`);
    const result = await downloadImage(category.image, fileBase);
    if (result.ok) {
      category.localImage = result.relativePath;
      category.originalImage = category.image || "";
      category.image = result.relativePath;
    }
    return { sourceId: category.sourceId, name: category.name, sourceImage: category.originalImage || category.image, ...result };
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    productCount: products.length,
    downloadedProducts: productResults.filter((item) => item.ok).length,
    failedProducts: productResults.filter((item) => !item.ok),
    categoryCount: categories.length,
    downloadedCategories: categoryResults.filter((item) => item.ok).length,
    failedCategories: categoryResults.filter((item) => !item.ok)
  };

  await fs.writeFile(path.join(DATA_DIR, "products-local.json"), `${JSON.stringify(products, null, 2)}\n`);
  await fs.writeFile(path.join(DATA_DIR, "categories-local.json"), `${JSON.stringify(categories, null, 2)}\n`);
  await fs.writeFile(path.join(DATA_DIR, "image-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(JSON.stringify({
    productCount: manifest.productCount,
    downloadedProducts: manifest.downloadedProducts,
    failedProducts: manifest.failedProducts.length,
    categoryCount: manifest.categoryCount,
    downloadedCategories: manifest.downloadedCategories,
    failedCategories: manifest.failedCategories.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
