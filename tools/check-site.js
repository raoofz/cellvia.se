const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const root = path.resolve(__dirname, "..");
const banned = [
  /QR/i,
  /Barcode/i,
  /garanterar/i,
  /garanti/i,
  /officiellt godkänd/i,
  /officiellt godkända/i,
  /godkänns garanterat/i,
  /Godkänd av/i
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== ".git" && entry.name !== "PortableGit") return walk(full);
    if (entry.isFile()) return [full];
    return [];
  });
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const jsFiles = files.filter((file) => file.endsWith(".js"));

for (const file of jsFiles) {
  const result = childProcess.spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) fail(result.stderr || result.stdout || `Syntax check failed: ${file}`);
}

for (const file of [...htmlFiles, ...jsFiles.filter((file) => !file.endsWith(path.join("tools", "check-site.js"))), path.join(root, "styles", "site.css")]) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of banned) {
    if (pattern.test(text)) fail(`Forbidden wording found in ${path.relative(root, file)}: ${pattern}`);
  }
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`Missing title: ${path.relative(root, file)}`);
  if (!/<meta name="description"/.test(html)) fail(`Missing description: ${path.relative(root, file)}`);
  if (html.includes('type="module"')) fail(`Module script can break local file usage: ${path.relative(root, file)}`);
  const scriptOrder = [
    "data/seed/index.js",
    "lib/utils/format.js",
    "lib/utils/dom.js",
    "lib/validators/index.js",
    "lib/store/local-storage.js",
    "lib/db/schema.js",
    "lib/db/repositories.js",
    "lib/search/text-search.js",
    "lib/filtering/compatibility-engine.js",
    "lib/filtering/filters.js",
    "lib/render/status.js",
    "components/ui/badges.js",
    "components/cards/product-card.js",
    "components/cards/prison-card.js",
    "components/cards/package-card.js",
    "lib/state/package-state.js",
    "components/forms/package-workflow.js",
    "components/products/products-page.js",
    "components/prisons/prisons-page.js",
    "components/packages/packages-page.js",
    "components/tracking/tracking-page.js",
    "components/forms/contact-form.js",
    "components/layout/faq-page.js",
    "components/admin/admin-page.js",
    "components/layout/site-layout.js",
    "scripts/app.js"
  ].map((ref) => html.indexOf(ref));
  if (scriptOrder.some((index) => index < 0)) fail(`Missing shared scripts: ${path.relative(root, file)}`);
  if (scriptOrder.join(",") !== [...scriptOrder].sort((a, b) => a - b).join(",")) fail(`Wrong script order: ${path.relative(root, file)}`);

  for (const match of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
    const ref = match[1];
    if (!ref || ref === "#") fail(`Empty link in ${path.relative(root, file)}`);
    if (/^(https?:|mailto:|tel:|data:)/.test(ref) || ref.startsWith("#")) continue;
    const clean = ref.split("#")[0].split("?")[0];
    if (!clean) continue;
    if (!fs.existsSync(path.join(root, clean))) fail(`Missing referenced file in ${path.relative(root, file)}: ${ref}`);
  }
}

const css = fs.readFileSync(path.join(root, "styles", "site.css"), "utf8");
const balance = [...css].reduce((sum, char) => sum + (char === "{" ? 1 : char === "}" ? -1 : 0), 0);
if (balance !== 0) fail("CSS brace balance failed.");

if (!process.exitCode) console.log(`CellVia static checks passed: ${htmlFiles.length} pages, ${jsFiles.length} scripts.`);
