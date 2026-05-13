(() => {
  const repo = () => window.CellViaRepository;
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { setHtml } = window.CellViaDom;
  const { badge } = window.CellViaBadges;

  const homeCategories = [
    { name: "Hygien", icon: "H", categories: ["Hygien & personlig vård"], description: "Tvål, tandkräm och milda basprodukter.", href: "produkter.html?category=Hygien%20%26%20personlig%20v%C3%A5rd" },
    { name: "Elektronik", icon: "E", categories: ["CD-spelare & enklare elektronik"], description: "Visas med extra kontroll före köp.", href: "produkter.html?category=CD-spelare%20%26%20enklare%20elektronik" },
    { name: "Hörlurar", icon: "L", categories: ["Hörlurar"], description: "Enkla modeller och tydliga varningar.", href: "produkter.html?category=H%C3%B6rlurar" },
    { name: "CD-spelare", icon: "C", categories: ["CD-spelare & enklare elektronik"], description: "Endast efter anstaltskontroll.", href: "produkter.html?category=CD-spelare%20%26%20enklare%20elektronik" },
    { name: "Batterier", icon: "B", categories: ["Batterier"], description: "Riskkategori som kräver försiktighet.", href: "produkter.html?category=Batterier" },
    { name: "Kläder", icon: "K", categories: ["Kläder & basplagg"], description: "Basplagg utan hårda detaljer.", href: "produkter.html?category=Kl%C3%A4der%20%26%20basplagg" },
    { name: "Böcker & skrivmaterial", icon: "S", categories: ["Böcker & skrivmaterial", "Brev & dokument"], description: "Brev, block och enkla böcker.", href: "produkter.html?category=B%C3%B6cker%20%26%20skrivmaterial" },
    { name: "Färdiga paket", icon: "P", categories: [], description: "Startpaket och tydliga paketval.", href: "paket.html", isPackage: true }
  ];

  const featuredProductIds = ["mild-tval", "tandkram", "brev-kit", "skrivblock", "pocketbok", "bomullsstrumpor", "horlurar-kabel", "cd-spelare-enkel"];
  const featuredPackageIds = ["startpaket", "hygienpaket", "musikpaket", "langvistelsepaket"];

  function categoryCount(item) {
    if (item.isPackage) return `${repo().packages.all().length} paket`;
    const count = repo().products.all().filter((product) => item.categories.includes(product.category)).length;
    return `${count} produkter`;
  }

  function renderCategories() {
    setHtml("#home-category-grid", homeCategories.map((item) => `
      <article class="home-category-card">
        <span aria-hidden="true">${escapeHtml(item.icon)}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.description)}</p>
        <small>${escapeHtml(categoryCount(item))}</small>
        <a class="text-link" href="${escapeHtml(item.href)}">Visa produkter</a>
      </article>
    `).join(""));
  }

  function renderProducts() {
    const products = featuredProductIds.map((id) => repo().products.find(id)).filter(Boolean);
    setHtml("#home-product-grid", products.map((product) => `
      <article class="home-product-card">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />
        <div>
          <div class="card-topline">${badge(product.compatibilityStatus)}</div>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.category)}</p>
          <small>${escapeHtml(product.compatibilityNote)}</small>
          <div class="home-card-actions">
            <a class="text-link" href="produkt.html?id=${escapeHtml(product.id)}">Visa detaljer</a>
            <a class="button small" href="skapa-paket.html?product=${escapeHtml(product.id)}">Lägg i paket</a>
          </div>
        </div>
      </article>
    `).join(""));
  }

  function renderPackages() {
    const packages = featuredPackageIds.map((id) => repo().packages.find(id)).filter(Boolean);
    setHtml("#home-package-grid", packages.map((pack) => `
      <article class="home-package-card">
        <img src="${escapeHtml(pack.image)}" alt="${escapeHtml(pack.name)}" loading="lazy" decoding="async" />
        <div>
          <span class="badge">${escapeHtml(pack.compatibilityLevel)}</span>
          <h3>${escapeHtml(pack.name)}</h3>
          <p>${escapeHtml(pack.description)}</p>
          <small>${pack.productIds.length} produkter · från ${formatCurrency(pack.serviceFee)} service</small>
          <a class="button small" href="skapa-paket.html?package=${escapeHtml(pack.id)}">Välj paket</a>
        </div>
      </article>
    `).join(""));
  }

  function mount() {
    renderCategories();
    renderProducts();
    renderPackages();
  }

  window.CellViaHomePage = { mount };
})();
