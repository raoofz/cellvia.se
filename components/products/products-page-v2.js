(() => {
  const { qs, qsa, setHtml, getParam } = window.CellViaDom;
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { createProductCard } = window.CellViaProductCardV2;
  const repo = () => window.CellViaRepository;

  /**
   * NEW PRODUCTS PAGE: Premium institutional presentation
   * Focuses on:
   * - Clean filtering interface
   * - Compact product grid (180px cards)
   * - Category-driven organization
   * - Institutional compliance messaging
   */
  function initProductsPage() {
    renderFilters();
    renderCategories();
    renderProducts();
    attachEventListeners();
  }

  function renderFilters() {
    const filterContainer = qs(".products-filter-section");
    if (!filterContainer) return;

    const categories = window.CellViaSeed.productCategories || [];
    const prisons = repo().prisons.all();
    const availability = [...new Set(repo().products.all().map(p => p.stockStatus).filter(Boolean))];
    const statuses = [...new Set(repo().products.all().map(p => p.compatibilityStatus).filter(Boolean))];

    const filterHTML = `
      <div class="filter-bar">
        <input type="text" 
               class="filter-input search-input" 
               id="product-search"
               placeholder="Sök produkt eller beskrivning..."
               aria-label="Sök produkter" />
        
        <select class="filter-select" id="product-category" aria-label="Filtrera kategori">
          <option value="">Alla kategorier</option>
          ${categories.map(cat => `<option value="${escapeHtml(cat.name || cat)}">${escapeHtml(cat.name || cat)}</option>`).join("")}
        </select>

        <select class="filter-select" id="product-prison" aria-label="Filtrera anstalt">
          <option value="">Alla anstalter</option>
          ${prisons.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}
        </select>

        <select class="filter-select" id="product-status" aria-label="Filtrera kompatibilitet">
          <option value="">Alla kompatibiliteter</option>
          ${statuses.map(s => `<option>${escapeHtml(s)}</option>`).join("")}
        </select>

        <select class="filter-select" id="product-sort" aria-label="Sortera produkter">
          <option value="recommended">Rekommenderat</option>
          <option value="name">Namn A-Ö</option>
          <option value="price-asc">Pris: lägst först</option>
          <option value="price-desc">Pris: högst först</option>
        </select>
      </div>

      <div class="quick-filters">
        ${[
          ["popular", "🌟 Populärt"],
          ["ready-package", "📦 I paket"],
          ["low-stock", "⚡ Begränsat"],
          ["new", "✨ Ny"]
        ].map(([id, label]) => 
          `<button type="button" class="quick-filter-btn" data-quick-filter="${id}">${escapeHtml(label)}</button>`
        ).join("")}
      </div>

      <div class="institutional-message">
        <h4 class="institutional-message-title">Kontroll & Kompatibilitet</h4>
        <p class="institutional-message-text">
          Alla produkter är förkontrollerade av CellVia. Slutlig bedömning görs alltid av anstalten.
        </p>
      </div>
    `;

    setHtml(filterContainer, filterHTML);
  }

  function renderCategories() {
    const categoryContainer = qs(".category-rail");
    if (!categoryContainer) return;

    const categories = window.CellViaSeed.productCategories || [];
    const categoryHTML = categories.map(cat => `
      <article class="category-card" data-category="${escapeHtml(cat.name || cat)}">
        <span class="category-icon">${cat.icon || "•"}</span>
        <h4 class="category-name">${escapeHtml(cat.name || cat)}</h4>
        <p class="category-count">${repo().products.all().filter(p => 
          (p.catalogCategory || p.category) === (cat.name || cat)
        ).length} produkter</p>
      </article>
    `).join("");

    setHtml(categoryContainer, categoryHTML);
  }

  function renderProducts(filters = {}) {
    const gridContainer = qs(".products-grid");
    if (!gridContainer) return;

    let products = repo().products.all();

    // Apply search filter
    if (filters.query) {
      const q = filters.query.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (filters.category) {
      products = products.filter(p => 
        (p.catalogCategory || p.category) === filters.category
      );
    }

    // Apply prison filter
    if (filters.prison) {
      products = products.filter(p =>
        !p.compatiblePrisons || p.compatiblePrisons.length === 0 || 
        p.compatiblePrisons.includes(filters.prison)
      );
    }

    // Apply status filter
    if (filters.status) {
      products = products.filter(p => p.compatibilityStatus === filters.status);
    }

    // Apply quick filters
    if (filters.quickFilter) {
      const qf = filters.quickFilter;
      if (qf === "popular") {
        products = products.filter(p => p.featured || (p.packageTags?.length || 0) > 0);
      } else if (qf === "ready-package") {
        products = products.filter(p => (p.packageTags?.length || 0) > 0);
      } else if (qf === "low-stock") {
        products = products.filter(p => p.stockStatus?.toLowerCase().includes("begränsat"));
      } else if (qf === "new") {
        products = products.filter(p => p.source && p.dateAdded);
      }
    }

    // Apply sorting
    products = sortProducts(products, filters.sort || "recommended");

    if (products.length === 0) {
      setHtml(gridContainer, `
        <div class="empty-results">
          <div class="empty-results-icon">◯</div>
          <h3 class="empty-results-title">Inga produkter hittades</h3>
          <p class="empty-results-text">Prova att justera filtren eller sök på något annat.</p>
        </div>
      `);
      return;
    }

    const productsHTML = products.map(product => {
      const compatibility = window.CellViaCompatibility?.evaluateProductForPrison?.(product, null) || {};
      return createProductCard(product, compatibility);
    }).join("");

    setHtml(gridContainer, `
      <div class="results-count" role="status">
        <strong>${products.length}</strong> ${products.length === 1 ? "produkt" : "produkter"}
      </div>
      ${productsHTML}
    `);
  }

  function sortProducts(products, sortMode) {
    const sorted = [...products];

    switch (sortMode) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, "sv"));
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "recommended":
      default:
        return sorted.sort((a, b) => {
          const aScore = (a.featured ? 100 : 0) + ((a.packageTags?.length || 0) * 10);
          const bScore = (b.featured ? 100 : 0) + ((b.packageTags?.length || 0) * 10);
          return bScore - aScore;
        });
    }
  }

  function attachEventListeners() {
    // Search input
    qs("#product-search")?.addEventListener("input", () => collectAndRender());

    // Category select
    qs("#product-category")?.addEventListener("change", () => collectAndRender());

    // Prison select
    qs("#product-prison")?.addEventListener("change", () => collectAndRender());

    // Status select
    qs("#product-status")?.addEventListener("change", () => collectAndRender());

    // Sort select
    qs("#product-sort")?.addEventListener("change", () => collectAndRender());

    // Category cards
    qsa(".category-card").forEach(card => {
      card.addEventListener("click", () => {
        const category = card.dataset.category;
        qs("#product-category").value = category;
        qsa(".category-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        collectAndRender();
      });
    });

    // Quick filter buttons
    qsa("[data-quick-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.quickFilter;
        btn.classList.toggle("active");
        collectAndRender();
      });
    });

    // Add to cart buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("product-add-btn")) {
        const productId = e.target.dataset.addProduct;
        addToCart(productId);
      }
    });
  }

  function collectAndRender() {
    const filters = {
      query: qs("#product-search")?.value || "",
      category: qs("#product-category")?.value || "",
      prison: qs("#product-prison")?.value || "",
      status: qs("#product-status")?.value || "",
      sort: qs("#product-sort")?.value || "recommended",
      quickFilter: getActiveQuickFilter()
    };
    renderProducts(filters);
  }

  function getActiveQuickFilter() {
    const activeBtn = qsa("[data-quick-filter].active")[0];
    return activeBtn?.dataset.quickFilter || "";
  }

  function addToCart(productId) {
    const current = window.CellViaStore?.read?.("cellvia-cart-v2", []) || [];
    const updated = [...new Set([...current, productId])];
    window.CellViaStore?.write?.("cellvia-cart-v2", updated);
    
    // Show feedback
    const btn = qs(`[data-add-product="${productId}"]`);
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = "✓ Lagd till";
      setTimeout(() => { btn.textContent = originalText; }, 2000);
    }
  }

  window.CellViaProductsPageV2 = {
    initProductsPage,
    renderFilters,
    renderCategories,
    renderProducts,
    sortProducts,
    attachEventListeners,
    collectAndRender,
    addToCart
  };

  // Auto-init if DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductsPage);
  } else {
    initProductsPage();
  }
})();
