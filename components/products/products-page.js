(() => {
  const repo = () => window.CellViaRepository;
  const { qs, qsa, setHtml, getParam } = window.CellViaDom;
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { setStatus } = window.CellViaStatus;

  function mountList() {
    const categorySelect = qs("#product-category");
    const prisonSelect = qs("#product-prison");
    const securitySelect = qs("#product-security");
    const packageSelect = qs("#product-package");
    const statusSelect = qs("#product-status");
    const availabilitySelect = qs("#product-availability");
    const sortSelect = qs("#product-sort");
    const quickFilters = [
      ["popular", "Populära"],
      ["ready-package", "Färdiga paket"],
      ["electronics", "Elektronik"],
      ["most-ordered", "Mest valda"],
      ["low-stock", "Lågt lager"],
      ["new", "Nya"]
    ];
    let activeQuickFilter = "";
    let visibleCount = 48;
    let lastFilterKey = "";
    const categories = window.CellViaSchema.categoryDefinitions || window.CellViaSeed.productCategories || window.CellViaSeed.categories.map((name) => ({ name, icon: "•", description: "", note: "" }));
    if (qs("#product-categories")) {
      setHtml("#product-categories", categories.map((category) => `
        <article class="catalog-category-card" data-catalog-category="${escapeHtml(category.name)}" tabindex="0">
          <span aria-hidden="true">${escapeHtml(category.icon || "•")}</span>
          <strong>${escapeHtml(category.name)}</strong>
          <p>${escapeHtml(category.description || "")}</p>
          <small>${escapeHtml(category.note || window.CellViaSeed.complianceNotice)}</small>
        </article>
      `).join(""));
    }
    if (qs("#product-quick-filters")) {
      setHtml("#product-quick-filters", quickFilters.map(([value, label]) => `<button type="button" data-product-quick="${value}">${escapeHtml(label)}</button>`).join(""));
    }
    if (qs("#chance2buy-overview") && window.CellViaChance2Buy) {
      const imported = window.CellViaChance2Buy.summary;
      const top = window.CellViaChance2Buy.topCategories.slice(0, 5);
      setHtml("#chance2buy-overview", `
        <article class="catalog-summary">
          <span class="badge">Importerad katalog</span>
          <h2>${imported.savedProductCount} produkter i kontrollerbart underlag</h2>
          <p>Katalogen används som urvalsstöd. Produkter kontrolleras före köp, packning och leverans.</p>
          <div class="tag-row">${top.map((item) => `<span>${escapeHtml(item.name)} · ${item.count}</span>`).join("")}</div>
        </article>
      `);
    }
    if (qs("#compliance-rules")) {
      setHtml("#compliance-rules", window.CellViaSeed.generalRules.map((rule) => `
        <article>
          <span class="badge ${window.CellViaFormat.slugify(rule.status)}">${escapeHtml(rule.status)}</span>
          <h3>${escapeHtml(rule.title)}</h3>
          <ul>${rule.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          <p>${escapeHtml(rule.note)}</p>
        </article>
      `).join(""));
    }
    if (categorySelect) categorySelect.innerHTML = `<option value="">Alla kategorier</option>${categories.map((category) => `<option>${escapeHtml(category.name || category)}</option>`).join("")}`;
    if (prisonSelect) prisonSelect.innerHTML = `<option value="">Alla anstalter</option>${repo().prisons.all().map((prison) => `<option value="${prison.id}">${escapeHtml(prison.name)}</option>`).join("")}`;
    const securityLevels = [...new Set(repo().prisons.all().map((prison) => prison.securityLevel).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "sv"));
    if (securitySelect) securitySelect.innerHTML = `<option value="">Alla säkerhetsklasser</option>${securityLevels.map((level) => `<option value="${escapeHtml(level)}">Säkerhetsklass ${escapeHtml(level)}</option>`).join("")}`;
    const packageTags = [...new Set(repo().products.all().flatMap((product) => product.packageTags || []))];
    if (packageSelect) packageSelect.innerHTML = `<option value="">Alla paketkopplingar</option>${packageTags.map((tag) => `<option>${escapeHtml(tag)}</option>`).join("")}`;
    const statuses = [...new Set(repo().products.all().map((product) => product.compatibilityStatus))];
    if (statusSelect) statusSelect.innerHTML = `<option value="">Alla kompatibiliteter</option>${statuses.map((status) => `<option>${escapeHtml(status)}</option>`).join("")}`;
    const availability = [...new Set(repo().products.all().map((product) => product.stockStatus).filter(Boolean))].sort((a, b) => a.localeCompare(b, "sv"));
    if (availabilitySelect) availabilitySelect.innerHTML = `<option value="">All tillgänglighet</option>${availability.map((status) => `<option>${escapeHtml(status)}</option>`).join("")}`;
    if (sortSelect) sortSelect.innerHTML = `<option value="recommended">Populärt</option><option value="name">Namn A-Ö</option><option value="price-asc">Pris: lägst först</option><option value="price-desc">Pris: högst först</option><option value="status">Kompatibilitet först</option>`;
    const categoryParam = getParam("category");
    if (categoryParam && categorySelect && [...categorySelect.options].some((option) => option.value === categoryParam)) {
      categorySelect.value = categoryParam;
    }

    function sortResults(results) {
      const mode = sortSelect?.value || "recommended";
      const statusScore = { "Vanligt lämplig": 1, "Kräver kontroll": 2, "Begränsad": 3, "Ej rekommenderad": 4, "Inte tillåten": 5 };
      return [...results].sort((a, b) => {
        if (mode === "price-asc") return a.product.price - b.product.price;
        if (mode === "price-desc") return b.product.price - a.product.price;
        if (mode === "name") return a.product.name.localeCompare(b.product.name, "sv");
        if (mode === "status") return (statusScore[a.status] || 9) - (statusScore[b.status] || 9);
        return b.score - a.score || a.product.name.localeCompare(b.product.name, "sv");
      });
    }

    function render() {
      const prisonId = prisonSelect?.value || "";
      const filters = {
        query: qs("#product-search")?.value || "",
        category: categorySelect?.value || "",
        prisonId,
        packageTag: packageSelect?.value || "",
        status: statusSelect?.value || "",
        availability: availabilitySelect?.value || ""
      };
      const filterKey = JSON.stringify({ ...filters, security: securitySelect?.value || "", quick: activeQuickFilter, sort: sortSelect?.value || "" });
      if (filterKey !== lastFilterKey) {
        visibleCount = 48;
        lastFilterKey = filterKey;
      }
      const base = repo().products.all();
      const securityLevel = securitySelect?.value || "";
      const securityPrisonIds = securityLevel ? new Set(repo().prisons.all().filter((prison) => prison.securityLevel === securityLevel).map((prison) => prison.id)) : null;
      const filtered = window.CellViaFilters.filterProducts(base, filters, window.CellViaCompatibility)
        .filter((product) => {
          const packageCount = (product.packageTags || []).length;
          const text = [product.catalogCategory, product.category, product.sourceCategory, product.name].join(" ").toLowerCase();
          const stock = (product.stockStatus || "").toLowerCase();
          const matchesSecurity = !securityPrisonIds || (product.compatiblePrisons || []).some((id) => securityPrisonIds.has(id)) || product.requiresManualReview;
          const matchesQuick = !activeQuickFilter
            || (activeQuickFilter === "popular" && (product.featured || packageCount > 0 || product.checkedByCellVia))
            || (activeQuickFilter === "ready-package" && packageCount > 0)
            || (activeQuickFilter === "electronics" && /elektronik|musik|ljud|hörlur|batteri|cd/i.test(text))
            || (activeQuickFilter === "most-ordered" && (product.featured || packageCount > 1))
            || (activeQuickFilter === "low-stock" && /begränsat|tillfälligt slut|ej i lager|slut|lågt/.test(stock))
            || (activeQuickFilter === "new" && product.source);
          return matchesSecurity && matchesQuick;
        });
      const results = sortResults(filtered.map((product) => window.CellViaCompatibility.evaluateProductForPrison(product, repo().prisons.find(prisonId))));
      const visible = results.slice(0, visibleCount);
      qsa("[data-catalog-category]").forEach((card) => card.classList.toggle("active", Boolean(filters.category) && card.dataset.catalogCategory === filters.category));
      setHtml("#products-grid", results.length
        ? `
          <div class="results-count"><strong>${visible.length}</strong> av ${results.length} produkter visas</div>
          ${visible.map((result) => window.CellViaProductCard.productCard(result, { showPrisonNote: Boolean(prisonId) })).join("")}
          ${visible.length < results.length ? `<button type="button" class="button secondary load-more" data-show-more-products>Visa fler produkter</button>` : ""}
        `
        : `<div class="empty-state">Inga produkter matchar filtret. Prova en bredare sökning eller börja med en annan anstalt.</div>`);
    }

    qsa("[data-product-filter]").forEach((input) => input.addEventListener("input", render));
    window.CellViaDom.on(document, "click", "[data-product-quick]", (_, button) => {
      activeQuickFilter = activeQuickFilter === button.dataset.productQuick ? "" : button.dataset.productQuick;
      qsa("[data-product-quick]").forEach((item) => item.classList.toggle("active", item.dataset.productQuick === activeQuickFilter));
      render();
    });
    window.CellViaDom.on(document, "click", "[data-catalog-category]", (_, card) => {
      if (!categorySelect) return;
      categorySelect.value = card.dataset.catalogCategory || "";
      render();
      qs("#products-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    window.CellViaDom.on(document, "keydown", "[data-catalog-category]", (event, card) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      card.click();
    });
    window.CellViaDom.on(document, "click", "[data-add-product]", (_, button) => {
      const current = window.CellViaStore.read("cellvia-cart-v2", []);
      window.CellViaStore.write("cellvia-cart-v2", [...new Set([...current, button.dataset.addProduct])]);
      setStatus("#page-status", "Produkten har lagts till. Fortsätt till Skapa paket när du är redo.", "success");
    });
    window.CellViaDom.on(document, "click", "[data-show-more-products]", () => {
      visibleCount += 48;
      render();
    });
    render();
  }

  function mountDetail() {
    const product = repo().products.find(getParam("id"));
    if (!product) {
      setHtml("#product-detail", `<div class="empty-state">Produkten hittades inte.</div>`);
      return;
    }
    document.title = `${product.name} | CellVia`;
    const compatiblePrisons = product.compatiblePrisons.map((id) => repo().prisons.find(id)).filter(Boolean);
    const image = product.image || product.fallbackImage || "assets/images/products/vardag.svg";
    const fallback = product.fallbackImage || "assets/images/products/vardag.svg";
    setHtml("#product-detail", `
      <section class="detail-layout">
        <img class="detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${escapeHtml(fallback)}';" />
        <div>
          <span class="badge ${window.CellViaFormat.slugify(product.compatibilityStatus)}">${escapeHtml(product.compatibilityStatus)}</span>
          <h1>${escapeHtml(product.name)}</h1>
          ${product.source ? `<p class="source-line">${escapeHtml(product.source)} · ${escapeHtml(product.sourceCategoryPath || product.sourceCategory || "Katalog")}</p>` : ""}
          <p class="lead">${escapeHtml(product.description)}</p>
          ${product.usefulFor ? `<p>${escapeHtml(product.usefulFor)}</p>` : ""}
          <p class="price">${formatCurrency(product.price)}</p>
          <p>${escapeHtml(product.compatibilityNote || window.CellViaSeed.complianceNotice)}</p>
          <p>${escapeHtml(window.CellViaSeed.legalNotice)}</p>
          <dl class="meta-list">
            <div><dt>Kategori</dt><dd>${escapeHtml(product.catalogCategory || product.category)}</dd></div>
            <div><dt>Ursprunglig kategori</dt><dd>${escapeHtml(product.category)}</dd></div>
            <div><dt>Lager</dt><dd>${escapeHtml(product.stockStatus)}</dd></div>
            <div><dt>CellVia-kontroll</dt><dd>${product.checkedByCellVia ? "Förkontrollerad" : "Extra verifiering"}</dd></div>
            <div><dt>Manuell kontroll</dt><dd>${product.requiresManualReview ? "Ja" : "Nej"}</dd></div>
          </dl>
          <div class="institutional-note"><strong>Förberedelse</strong><p>${escapeHtml(product.packagingNote || "Produkten förbereds med dokumentation, tydlig packning och kontroll mot vald anstalts kända rutiner.")}</p></div>
          ${(product.packageTags || []).length ? `<h2>Ingår ofta i</h2><div class="tag-row">${product.packageTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
          ${product.sourceUrl ? `<h2>Källa</h2><p><a class="text-link" href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noreferrer">Visa produkt hos ${escapeHtml(product.source || "leverantör")}</a></p>` : ""}
          <h2>Noteringar</h2>
          <ul>${product.warningNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
          <h2>Säkrare alternativ</h2>
          <p>${escapeHtml(product.saferAlternative)}</p>
          <h2>Passar bättre för</h2>
          <p>${compatiblePrisons.length ? escapeHtml(compatiblePrisons.map((prison) => prison.name).join(", ")) : "Produkten kräver manuell kontroll innan den kopplas till en anstalt."}</p>
          <a class="button primary" href="skapa-paket.html?product=${product.id}">Lägg till i paket</a>
        </div>
      </section>
    `);
  }

  window.CellViaProductsPage = { mountList, mountDetail };
})();
