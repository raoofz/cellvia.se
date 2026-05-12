const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "public");

const rootFiles = [
  "index.html",
  "admin.html",
  "anstalt.html",
  "anstalter.html",
  "hjalp.html",
  "integritet.html",
  "kontakt.html",
  "nasta-steg.html",
  "paket.html",
  "produkt.html",
  "produkter.html",
  "skapa-paket.html",
  "spara.html",
  "villkor.html"
];

const directories = [
  "assets",
  "components",
  "data",
  "lib",
  "pages",
  "scripts",
  "styles"
];

function copyItem(source, target) {
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    filter: (item) => !item.includes(`${path.sep}.git${path.sep}`)
  });
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of rootFiles) {
  copyItem(path.join(root, file), path.join(output, file));
}

for (const directory of directories) {
  copyItem(path.join(root, directory), path.join(output, directory));
}

console.log(`CellVia static output created in ${path.relative(root, output)}.`);
