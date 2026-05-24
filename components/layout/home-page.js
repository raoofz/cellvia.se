(() => {
  const repo = () => window.CellViaRepository;
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { setHtml, qs, on } = window.CellViaDom;
  const { badge } = window.CellViaBadges;

  const homeCategories = [
    { name: "Hygien", icon: "H", categories: ["Hygien"], description: "Tvål, tandkräm och milda basprodukter.", href: "produkter.html?category=Hygien" },
    { name: "Hörlurar", icon: "L", categories: ["Musik & ljud"], description: "Enkla modeller och tydliga varningar.", href: "produkter.html?category=Musik%20%26%20ljud" },
    { name: "Kläder", icon: "K", categories: ["Kläder"], description: "Basplagg utan hårda detaljer.", href: "produkter.html?category=Kl%C3%A4der" },
    { name: "Böcker", icon: "B", categories: ["Böcker & läsning"], description: "Böcker och läsmaterial.", href: "produkter.html?category=B%C3%B6cker%20%26%20l%C3%A4sning" },
    { name: "Skrivmaterial", icon: "S", categories: ["Skrivmaterial"], description: "Brev, block och enkla skrivval.", href: "produkter.html?category=Skrivmaterial" },
    { name: "Elektronik", icon: "E", categories: ["Elektronik med kontroll", "Batterier"], description: "Visas med extra kontroll före köp.", href: "produkter.html?category=Elektronik%20med%20kontroll" },
    { name: "Färdiga paket", icon: "P", categories: [], description: "Startpaket och tydliga paketval.", href: "paket.html", isPackage: true }
  ];

  const featuredPackageIds = ["startpaket", "hygienpaket", "musikpaket", "langvistelsepaket"];
  const ITEMS_PER_PAGE = 10;
  let currentPage = 1;
  let allProducts = [];

  function categoryCount(item) {
    if (item.isPackage) return `${repo().packages.all().length} paket`;
    const count = repo().products.all().filter((product) => item.categories.includes(product.catalogCategory || product.category) || item.categories.includes(product.category)).length;
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

  function renderProductCard(product) {
    return `
      <article class="home-product-card">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />
        <div>
          <div class="card-topline">${badge(product.compatibilityStatus)}</div>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.catalogCategory || product.category)}</p>
          <small>Kontrolleras före leverans</small>
          <div class="home-card-actions">
            <a class="button ghost small" href="produkt.html?id=${escapeHtml(product.id)}">Snabbvy</a>
            <a class="button small" href="skapa-paket.html?product=${escapeHtml(product.id)}">Lägg i paket</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderProducts(page = 1) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const products = allProducts.slice(start, end);

    if (page === 1) {
      setHtml("#home-product-grid", products.map(renderProductCard).join(""));
    } else {
      const grid = qs("#home-product-grid");
      const html = products.map(renderProductCard).join("");
      grid.innerHTML += html;
    }

    const hasMore = end < allProducts.length;
    const loadMoreBtn = qs("#home-load-more-products");

    if (loadMoreBtn) {
      if (hasMore) {
        loadMoreBtn.style.display = "flex";
        loadMoreBtn.dataset.page = page + 1;
      } else {
        loadMoreBtn.style.display = "none";
      }
    }
  }

  function setupLoadMore() {
    const btn = qs("#home-load-more-products");
    if (btn) {
      on(btn, "click", () => {
        const nextPage = parseInt(btn.dataset.page) || 2;
        renderProducts(nextPage);
        window.scrollBy({ top: 200, behavior: "smooth" });
      });
    }
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
    allProducts = repo().products.all().slice(0, 100);
    renderCategories();
    renderProducts(1);
    setupLoadMore();
    renderPackages();
  }

  window.CellViaHomePage = { mount };
})();
