(() => {
  const { qs, qsa, setHtml } = window.CellViaDom || {};
  const { escapeHtml } = window.CellViaFormat || {};
  const { createPackageCard } = window.CellViaPackageCardV2 || {};

  /**
   * PACKAGES PAGE V2: Standardized institutional packages
   * Features:
   * - Clean filtering for packages
   * - 240px package cards with contents preview
   * - Dual actions (Select / Customize)
   * - Responsive grid
   */

  function initPackagesPage() {
    if (!createPackageCard) {
      console.warn("PackageCard component not loaded");
      return;
    }
    renderFilters();
    renderPackages();
    attachEventListeners();
  }

  function renderFilters() {
    const filterContainer = qs(".packages-filter-section");
    if (!filterContainer) return;

    const repo = window.CellViaRepository;
    if (!repo) return;

    const prisons = repo.prisons?.all?.() || [];
    const statuses = [...new Set(repo.packages?.all?.().map(p => p.compatibilityLevel).filter(Boolean))] || [];

    const filterHTML = `
      <div class="filter-bar">
        <input type="text" 
               class="filter-input" 
               id="package-search"
               placeholder="Sök paket..."
               aria-label="Sök paket" />
        
        <select class="filter-select" id="package-prison" aria-label="Filtrera anstalt">
          <option value="">Alla anstalter</option>
          ${prisons.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}
        </select>

        <select class="filter-select" id="package-compatibility" aria-label="Filtrera kompatibilitet">
          <option value="">Alla nivåer</option>
          ${statuses.map(s => `<option>${escapeHtml(s)}</option>`).join("")}
        </select>

        <select class="filter-select" id="package-sort" aria-label="Sortera paket">
          <option value="popular">Populärt</option>
          <option value="name">Namn A-Ö</option>
          <option value="price-asc">Pris: lägst först</option>
        </select>
      </div>

      <div class="quick-filters">
        <button type="button" class="quick-filter-btn" data-quick-filter="popular">⭐ Populärt</button>
        <button type="button" class="quick-filter-btn" data-quick-filter="custom">✏️ Anpassat</button>
      </div>

      <div class="institutional-message">
        <h4 class="institutional-message-title">FÄRDIGA PAKET FÖR ENKLARE VAL</h4>
        <p class="institutional-message-text">
          Väl förberedda paket med tydlig innehållslista och anstaltspecifik kompatibilitet.
        </p>
      </div>
    `;

    setHtml(filterContainer, filterHTML);
  }

  function renderPackages(filters = {}) {
    const gridContainer = qs(".packages-grid");
    if (!gridContainer) return;

    const repo = window.CellViaRepository;
    if (!repo) return;

    let packages = repo.packages?.all?.() || [];

    // Apply search filter
    if (filters.query) {
      const q = filters.query.toLowerCase();
      packages = packages.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.purpose || "").toLowerCase().includes(q)
      );
    }

    // Apply prison filter
    if (filters.prison) {
      packages = packages.filter(p =>
        !p.compatiblePrisons || p.compatiblePrisons.length === 0 || 
        p.compatiblePrisons.includes(filters.prison)
      );
    }

    // Apply compatibility filter
    if (filters.compatibility) {
      packages = packages.filter(p => p.compatibilityLevel === filters.compatibility);
    }

    // Apply quick filters
    if (filters.quickFilter) {
      if (filters.quickFilter === "popular") {
        packages = packages.filter(p => p.popular);
      } else if (filters.quickFilter === "custom") {
        packages = packages.filter(p => p.custom);
      }
    }

    // Apply sorting
    packages = sortPackages(packages, filters.sort || "popular");

    if (packages.length === 0) {
      setHtml(gridContainer, `
        <div class="empty-results" style="grid-column: 1 / -1;">
          <div class="empty-results-icon">◯</div>
          <h3 class="empty-results-title">Inga paket hittades</h3>
          <p class="empty-results-text">Prova att justera filtren eller börja med att skapa ett eget paket.</p>
        </div>
      `);
      return;
    }

    const allProducts = repo.products?.all?.() || [];
    const packagesHTML = packages.map(pack => createPackageCard(pack, allProducts)).join("");

    setHtml(gridContainer, `
      <div class="results-count" role="status">
        <strong>${packages.length}</strong> ${packages.length === 1 ? "paket" : "paket"}
      </div>
      ${packagesHTML}
    `);
  }

  function sortPackages(packages, sortMode) {
    const sorted = [...packages];

    switch (sortMode) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, "sv"));
      case "price-asc":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "popular":
      default:
        return sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }
  }

  function attachEventListeners() {
    // Search input
    qs("#package-search")?.addEventListener("input", collectAndRender);
    // Prison select
    qs("#package-prison")?.addEventListener("change", collectAndRender);
    // Compatibility select
    qs("#package-compatibility")?.addEventListener("change", collectAndRender);
    // Sort select
    qs("#package-sort")?.addEventListener("change", collectAndRender);

    // Quick filter buttons
    qsa("[data-quick-filter]").forEach(btn => {
      btn.addEventListener("click", function() {
        this.classList.toggle("active");
        collectAndRender();
      });
    });

    // Package actions
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("package-select-btn")) {
        const packageId = e.target.dataset.selectPackage;
        window.location.href = `skapa-paket.html?package=${packageId}`;
      } else if (e.target.classList.contains("package-customize-btn")) {
        const packageId = e.target.dataset.customizePackage;
        window.location.href = `skapa-paket.html?package=${packageId}&customize=1`;
      }
    });
  }

  function collectAndRender() {
    const filters = {
      query: qs("#package-search")?.value || "",
      prison: qs("#package-prison")?.value || "",
      compatibility: qs("#package-compatibility")?.value || "",
      sort: qs("#package-sort")?.value || "popular",
      quickFilter: getActiveQuickFilter()
    };
    renderPackages(filters);
  }

  function getActiveQuickFilter() {
    const activeBtn = qsa("[data-quick-filter].active")[0];
    return activeBtn?.dataset.quickFilter || "";
  }

  window.CellViaPackagesPageV2 = {
    initPackagesPage,
    renderFilters,
    renderPackages,
    sortPackages,
    attachEventListeners,
    collectAndRender
  };

  // Auto-init if DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPackagesPage);
  } else {
    initPackagesPage();
  }
})();
