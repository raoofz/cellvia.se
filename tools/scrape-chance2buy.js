const fs = require("node:fs/promises");
const path = require("node:path");

const BASE_URL = "https://www.chance2buy.se";
const API_BASE = `${BASE_URL}/wp-json/wc/store/v1`;
const OUT_DIR = path.join(__dirname, "..", "data", "chance2buy");
const GENERATED_AT = new Date().toISOString();

const explicitAdultCategorySlugs = new Set(["avklatt"]);
const adultMagazineTerms = [
  "adult",
  "erotik",
  "erotisk",
  "erotic",
  "herrtidning",
  "naken",
  "nude",
  "playboy",
  "porn",
  "porr",
  "sex"
];

function decodeHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return decodeHtml(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "CellVia product import (+local data export)"
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return {
    data: await response.json(),
    totalPages: Number(response.headers.get("x-wp-totalpages") || "1")
  };
}

async function fetchAll(endpoint) {
  const firstUrl = `${API_BASE}/${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=1`;
  const first = await fetchJson(firstUrl);
  const pages = [first.data];

  for (let page = 2; page <= first.totalPages; page += 1) {
    const url = `${API_BASE}/${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=${page}`;
    const next = await fetchJson(url);
    pages.push(next.data);
  }

  return pages.flat();
}

function buildCategoryPath(category, categoriesById) {
  const pathParts = [];
  let cursor = category;
  const seen = new Set();
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id);
    pathParts.unshift(decodeHtml(cursor.name));
    cursor = categoriesById.get(cursor.parent);
  }
  return pathParts;
}

function topLevelCategoryFor(product, categoriesById) {
  const paths = product.categories
    .map((category) => categoriesById.get(category.id))
    .filter(Boolean)
    .map((category) => buildCategoryPath(category, categoriesById));
  return paths.find((parts) => parts.length)?.[0] || decodeHtml(product.categories[0]?.name || "Okategoriserat");
}

function isAdultMagazine(product) {
  const categorySlugs = product.categories.map((category) => category.slug);
  if (categorySlugs.some((slug) => explicitAdultCategorySlugs.has(slug))) {
    return true;
  }

  const categoryNames = product.categories.map((category) => decodeHtml(category.name).toLowerCase()).join(" ");
  const text = [
    product.name,
    product.slug,
    decodeHtml(product.short_description),
    decodeHtml(product.description),
    categoryNames
  ].join(" ").toLowerCase();

  const looksLikeMagazine = /\b(tidning|tidningar|magazine|magasin|prenumeration)\b/i.test(text);
  return looksLikeMagazine && adultMagazineTerms.some((term) => text.includes(term));
}

function normalizeProduct(product, categoriesById) {
  const categoryPaths = product.categories
    .map((category) => categoriesById.get(category.id))
    .filter(Boolean)
    .map((category) => buildCategoryPath(category, categoriesById));

  const topCategory = topLevelCategoryFor(product, categoriesById);
  const cents = Number(product.prices?.price || 0);

  return {
    sourceId: product.id,
    id: `chance2buy-${product.id}`,
    name: decodeHtml(product.name),
    slug: product.slug,
    sku: product.sku || "",
    topCategory,
    categories: product.categories.map((category) => decodeHtml(category.name)),
    categorySlugs: product.categories.map((category) => category.slug),
    categoryPaths,
    price: cents / 100,
    currency: product.prices?.currency_code || "SEK",
    priceText: decodeHtml(product.price_html),
    stockStatus: product.stock_availability?.text || (product.is_in_stock ? "I lager" : "Slut"),
    isInStock: Boolean(product.is_in_stock),
    isPurchasable: Boolean(product.is_purchasable),
    shortDescription: decodeHtml(product.short_description),
    description: decodeHtml(product.description),
    image: product.images?.[0]?.src || "",
    thumbnail: product.images?.[0]?.thumbnail || product.images?.[0]?.src || "",
    sourceUrl: product.permalink,
    scrapedAt: GENERATED_AT
  };
}

function categorySummary(category, categoriesById) {
  return {
    sourceId: category.id,
    name: decodeHtml(category.name),
    slug: category.slug,
    parentId: category.parent || null,
    path: buildCategoryPath(category, categoriesById),
    sourceCount: category.count,
    image: category.image?.src || "",
    sourceUrl: category.permalink
  };
}

async function main() {
  const [rawCategories, rawProducts] = await Promise.all([
    fetchAll("products/categories"),
    fetchAll("products")
  ]);

  const categoriesById = new Map(rawCategories.map((category) => [category.id, category]));
  const removedProducts = [];
  const products = [];

  for (const product of rawProducts) {
    const normalized = normalizeProduct(product, categoriesById);
    if (isAdultMagazine(product)) {
      removedProducts.push({
        ...normalized,
        removedReason: "Adult magazine/category filtered per request"
      });
    } else {
      products.push(normalized);
    }
  }

  const topCategories = [...new Set(products.map((product) => product.topCategory))]
    .sort((a, b) => a.localeCompare(b, "sv"));

  const productsByCategory = Object.fromEntries(
    topCategories.map((category) => [
      category,
      products
        .filter((product) => product.topCategory === category)
        .sort((a, b) => a.name.localeCompare(b.name, "sv"))
    ])
  );

  const categories = rawCategories
    .map((category) => categorySummary(category, categoriesById))
    .filter((category) => !explicitAdultCategorySlugs.has(category.slug))
    .sort((a, b) => a.path.join(" / ").localeCompare(b.path.join(" / "), "sv"));

  const summary = {
    source: BASE_URL,
    generatedAt: GENERATED_AT,
    rawProductCount: rawProducts.length,
    savedProductCount: products.length,
    removedProductCount: removedProducts.length,
    rawCategoryCount: rawCategories.length,
    savedCategoryCount: categories.length,
    topCategories: topCategories.map((name) => ({
      name,
      count: productsByCategory[name].length
    }))
  };

  await fs.mkdir(OUT_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(OUT_DIR, "products.json"), `${JSON.stringify(products, null, 2)}\n`),
    fs.writeFile(path.join(OUT_DIR, "categories.json"), `${JSON.stringify(categories, null, 2)}\n`),
    fs.writeFile(path.join(OUT_DIR, "products-by-category.json"), `${JSON.stringify(productsByCategory, null, 2)}\n`),
    fs.writeFile(path.join(OUT_DIR, "removed-products.json"), `${JSON.stringify(removedProducts, null, 2)}\n`),
    fs.writeFile(path.join(OUT_DIR, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`)
  ]);

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
