const fs = require("node:fs");
const path = require("node:path");

const outDir = path.join(__dirname, "..", "data", "chance2buy");
const productsFile = fs.existsSync(path.join(outDir, "products-local.json")) ? "products-local.json" : "products.json";
const categoriesFile = fs.existsSync(path.join(outDir, "categories-local.json")) ? "categories-local.json" : "categories.json";
const rawProducts = JSON.parse(fs.readFileSync(path.join(outDir, productsFile), "utf8"));
const rawCategories = JSON.parse(fs.readFileSync(path.join(outDir, categoriesFile), "utf8"));
const summary = JSON.parse(fs.readFileSync(path.join(outDir, "summary.json"), "utf8"));

const externalNotice = "Extern katalogprodukt. CellVia behöver kontrollera produkt, förpackning, kvitto/faktura och vald anstalts rutiner innan leverans.";

function mapCategory(topCategory, categoryNames = []) {
  const text = [topCategory, ...categoryNames].join(" ").toLowerCase();
  if (/hygien|kontaktlins|vård/.test(text)) return "Hygien & personlig vård";
  if (/kläder|skor|för henne|underkläder/.test(text)) return "Kläder & basplagg";
  if (/bok|böcker|tidning|prenumeration/.test(text)) return "Böcker & skrivmaterial";
  if (/brev|vykort/.test(text)) return "Brev & dokument";
  if (/audio|hörlur|cd-spelare|elektronik/.test(text)) return "CD-spelare & enklare elektronik";
  if (/musik|skivor|cd/.test(text)) return "Musik & ljud";
  if (/presentkort|removeme|anonymisering/.test(text)) return "Produkter som kräver extra kontroll";
  if (/klock|smyck|träning|hobby|fritid|muck|permission/.test(text)) return "Tillbehör";
  return "Produkter som kräver extra kontroll";
}

function statusFor(product, category) {
  const text = [product.topCategory, ...product.categories, product.name].join(" ").toLowerCase();
  if (/presentkort|removeme|anonymisering/.test(text)) return "Ej rekommenderad";
  if (/audio|hörlur|cd-spelare|elektronik|klock|smyck|skor|träning|hobby|muck|permission/.test(text)) return "Begränsad";
  if (category === "Musik & ljud" || category === "Böcker & skrivmaterial") return "Kräver kontroll";
  return "Kräver kontroll";
}

function tagsFor(category, topCategory) {
  const tags = ["Chance2Buy-katalog"];
  if (category === "Hygien & personlig vård") tags.push("Hygienpaket");
  if (category === "Kläder & basplagg") tags.push("Klädpaket");
  if (category === "Böcker & skrivmaterial" || category === "Brev & dokument") tags.push("Skrivpaket");
  if (category === "Musik & ljud" || category === "CD-spelare & enklare elektronik") tags.push("Musikpaket");
  if (/begagnade skivor/i.test(topCategory)) tags.push("Begagnade skivor");
  return tags;
}

function imageFor(category) {
  if (category === "Hygien & personlig vård") return "assets/images/process-products.jpg";
  if (category === "Kläder & basplagg") return "assets/images/cellvia-worker.jpg";
  if (category === "Böcker & skrivmaterial" || category === "Brev & dokument") return "assets/images/documented-packing.jpg";
  if (category === "Musik & ljud" || category === "CD-spelare & enklare elektronik") return "assets/images/process-sealed-package.jpg";
  return "assets/images/process-products.jpg";
}

function productImageFor(product, category) {
  return product.localImage || imageFor(category);
}

function descriptionFor(product, category) {
  const base = product.shortDescription || product.description;
  if (base && base.length > 12) return base.slice(0, 220);
  return `Katalogprodukt från Chance2Buy inom ${category.toLowerCase()}. Produkten behöver alltid kontrolleras mot vald anstalts regler innan leverans.`;
}

const products = rawProducts.map((product) => {
  const category = mapCategory(product.topCategory, product.categories);
  const status = statusFor(product, category);
  const risky = status === "Ej rekommenderad";
  return {
    id: product.id,
    source: "Chance2Buy",
    sourceId: product.sourceId,
    sourceUrl: product.sourceUrl,
    sourceCategory: product.topCategory,
    sourceCategoryPath: product.categoryPaths?.[0]?.join(" / ") || product.topCategory,
    name: product.name,
    category,
    packageTags: tagsFor(category, product.topCategory),
    price: Math.round(Number(product.price || 0)),
    image: productImageFor(product, category),
    sourceImage: product.originalImage || product.thumbnail || product.image || "",
    localImage: product.localImage || "",
    description: descriptionFor(product, category),
    usefulFor: `Kan vara relevant som katalogval inom ${product.topCategory}. Produkten visas som vägledning och kräver kontroll före köp och leverans.`,
    compatibilityStatus: status,
    compatibilityNote: risky ? "Produkten bör normalt undvikas i standardpaket och kräver särskild manuell bedömning." : externalNotice,
    compatiblePrisons: [],
    warningNotes: [risky ? "Kategorin kan vara olämplig eller praktiskt svår att hantera i anstaltsflöde." : "Extern produkt som behöver kontrolleras mot anstalt, förpackning och fakturaunderlag."],
    saferAlternative: category === "Musik & ljud" ? "Bok, brev-kit eller skrivmaterial" : "Välj en enklare basprodukt med tydlig förpackning",
    requiresManualReview: true,
    stockStatus: product.stockStatus || (product.isInStock ? "I lager" : "Slut"),
    checkedByCellVia: false
  };
});

const topCategories = summary.topCategories.map((item) => ({
  name: item.name,
  count: item.count,
  mappedCategory: mapCategory(item.name),
  note: "Importerad källa. Produkter visas som katalogunderlag och behöver verifieras före leverans."
}));

const categories = rawCategories.map((category) => ({
  name: category.name,
  slug: category.slug,
  path: category.path,
  sourceCount: category.sourceCount,
  mappedCategory: mapCategory(category.path?.[0] || category.name),
  image: category.image,
  localImage: category.localImage || "",
  sourceImage: category.originalImage || category.image || "",
  sourceUrl: category.sourceUrl
}));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "catalog.js"),
  `(() => {\nwindow.CellViaChance2Buy = ${JSON.stringify({ source: summary.source, generatedAt: summary.generatedAt, summary, topCategories, categories, products }, null, 2)};\n})();\n`,
  "utf8"
);

console.log(`Imported ${products.length} Chance2Buy products and ${categories.length} categories.`);
