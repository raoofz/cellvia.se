(() => {
  const repo = () => window.CellViaRepository;
  const { qs, qsa, setHtml, getParam } = window.CellViaDom;
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { setStatus } = window.CellViaStatus;

  function mountList() {
    const categorySelect = qs("#product-category");
    const prisonSelect = qs("#product-prison");
    if (categorySelect) categorySelect.innerHTML = `<option value="">Alla kategorier</option>${window.CellViaSeed.categories.map((category) => `<option>${escapeHtml(category)}</option>`).join("")}`;
    if (prisonSelect) prisonSelect.innerHTML = `<option value="">Alla anstalter</option>${repo().prisons.all().map((prison) => `<option value="${prison.id}">${escapeHtml(prison.name)}</option>`).join("")}`;

    function render() {
      const prisonId = prisonSelect?.value || "";
      const filters = {
        query: qs("#product-search")?.value || "",
        category: categorySelect?.value || "",
        prisonId
      };
      const base = repo().products.all();
      const filtered = window.CellViaFilters.filterProducts(base, filters, window.CellViaCompatibility);
      const results = filtered.map((product) => window.CellViaCompatibility.evaluateProductForPrison(product, repo().prisons.find(prisonId)));
      setHtml("#products-grid", results.length
        ? results.map((result) => window.CellViaProductCard.productCard(result, { showPrisonNote: Boolean(prisonId) })).join("")
        : `<div class="empty-state">Inga produkter matchar filtret. Prova en bredare sökning eller börja med en annan anstalt.</div>`);
    }

    qsa("[data-product-filter]").forEach((input) => input.addEventListener("input", render));
    window.CellViaDom.on(document, "click", "[data-add-product]", (_, button) => {
      const current = window.CellViaStore.read("cellvia-cart-v2", []);
      window.CellViaStore.write("cellvia-cart-v2", [...new Set([...current, button.dataset.addProduct])]);
      setStatus("#page-status", "Produkten har lagts till. Fortsätt till Skapa paket när du är redo.", "success");
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
          <p class="lead">${escapeHtml(product.description)}</p>
          <p class="price">${formatCurrency(product.price)}</p>
          <p>${escapeHtml(window.CellViaSeed.legalNotice)}</p>
          <dl class="meta-list">
            <div><dt>Kategori</dt><dd>${escapeHtml(product.category)}</dd></div>
            <div><dt>Lager</dt><dd>${escapeHtml(product.stockStatus)}</dd></div>
            <div><dt>Manuell kontroll</dt><dd>${product.requiresManualReview ? "Ja" : "Nej"}</dd></div>
          </dl>
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
