(() => {
  const repo = () => window.CellViaRepository;
  const { qs, qsa, setHtml, getParam } = window.CellViaDom;
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { setStatus } = window.CellViaStatus;

  function mountList() {
    const categorySelect = qs("#product-category");
    const prisonSelect = qs("#product-prison");
    const packageSelect = qs("#product-package");
    const statusSelect = qs("#product-status");
    const sortSelect = qs("#product-sort");
    let visibleCount = 48;
    let lastFilterKey = "";
    const categories = window.CellViaSeed.productCategories || window.CellViaSeed.categories.map((name) => ({ name, icon: "•", description: "", note: "" }));
    if (qs("#product-categories")) {
      setHtml("#product-categories", categories.map((category) => `
        <article>
          <span aria-hidden="true">${escapeHtml(category.icon || "•")}</span>
          <strong>${escapeHtml(category.name)}</strong>
          <p>${escapeHtml(category.description || "")}</p>
          <small>${escapeHtml(category.note || window.CellViaSeed.complianceNotice)}</small>
        </article>
      `).join(""));
    }
    if (qs("#chance2buy-overview") && window.CellViaChance2Buy) {
      const imported = window.CellViaChance2Buy.summary;
      const top = window.CellViaChance2Buy.topCategories.slice(0, 8);
      setHtml("#chance2buy-overview", `
        <article class="catalog-summary">
          <span class="badge">Importerad katalog</span>
          <h2>Chance2Buy-produkter för manuell kontroll</h2>
          <p>${imported.savedProductCount} produkter och ${imported.savedCategoryCount} kategorier har lagts till som katalogunderlag. Alla importerade produkter kräver CellVia-kontroll före köp, packning och leverans.</p>
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
    const packageTags = [...new Set(repo().products.all().flatMap((product) => product.packageTags || []))];
    if (packageSelect) packageSelect.innerHTML = `<option value="">Alla paketkopplingar</option>${packageTags.map((tag) => `<option>${escapeHtml(tag)}</option>`).join("")}`;
    const statuses = [...new Set(repo().products.all().map((product) => product.compatibilityStatus))];
    if (statusSelect) statusSelect.innerHTML = `<option value="">Alla kompatibiliteter</option>${statuses.map((status) => `<option>${escapeHtml(status)}</option>`).join("")}`;
    if (sortSelect) sortSelect.innerHTML = `<option value="recommended">Rekommenderad ordning</option><option value="price-asc">Pris: lägst först</option><option value="price-desc">Pris: högst först</option><option value="name">Namn A-Ö</option><option value="status">Kompatibilitet</option>`;

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
        status: statusSelect?.value || ""
      };
      const filterKey = JSON.stringify({ ...filters, sort: sortSelect?.value || "" });
      if (filterKey !== lastFilterKey) {
        visibleCount = 48;
        lastFilterKey = filterKey;
      }
      const base = repo().products.all();
      const filtered = window.CellViaFilters.filterProducts(base, filters, window.CellViaCompatibility);
      const results = sortResults(filtered.map((product) => window.CellViaCompatibility.evaluateProductForPrison(product, repo().prisons.find(prisonId))));
      const visible = results.slice(0, visibleCount);
      setHtml("#products-grid", results.length
        ? `
          <div class="results-count">${visible.length} av ${results.length} produkter visas</div>
          ${visible.map((result) => window.CellViaProductCard.productCard(result, { showPrisonNote: Boolean(prisonId) })).join("")}
          ${visible.length < results.length ? `<button type="button" class="button secondary load-more" data-show-more-products>Visa fler produkter</button>` : ""}
        `
        : `<div class="empty-state">Inga produkter matchar filtret. Prova en bredare sökning eller börja med en annan anstalt.</div>`);
    }

    qsa("[data-product-filter]").forEach((input) => input.addEventListener("input", render));
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
    setHtml("#product-detail", `
      <section class="detail-layout">
        <img class="detail-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />
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
            <div><dt>Kategori</dt><dd>${escapeHtml(product.category)}</dd></div>
            <div><dt>Lager</dt><dd>${escapeHtml(product.stockStatus)}</dd></div>
            <div><dt>CellVia-kontroll</dt><dd>${product.checkedByCellVia ? "Förkontrollerad" : "Extra verifiering"}</dd></div>
            <div><dt>Manuell kontroll</dt><dd>${product.requiresManualReview ? "Ja" : "Nej"}</dd></div>
          </dl>
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
