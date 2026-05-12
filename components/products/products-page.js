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
    if (categorySelect) categorySelect.innerHTML = `<option value="">Alla kategorier</option>${categories.map((category) => `<option>${escapeHtml(category.name || category)}</option>`).join("")}`;
    if (prisonSelect) prisonSelect.innerHTML = `<option value="">Alla anstalter</option>${repo().prisons.all().map((prison) => `<option value="${prison.id}">${escapeHtml(prison.name)}</option>`).join("")}`;
    const packageTags = [...new Set(repo().products.all().flatMap((product) => product.packageTags || []))];
    if (packageSelect) packageSelect.innerHTML = `<option value="">Alla paketkopplingar</option>${packageTags.map((tag) => `<option>${escapeHtml(tag)}</option>`).join("")}`;
    const statuses = [...new Set(repo().products.all().map((product) => product.compatibilityStatus))];
    if (statusSelect) statusSelect.innerHTML = `<option value="">Alla kompatibiliteter</option>${statuses.map((status) => `<option>${escapeHtml(status)}</option>`).join("")}`;

    function render() {
      const prisonId = prisonSelect?.value || "";
      const filters = {
        query: qs("#product-search")?.value || "",
        category: categorySelect?.value || "",
        prisonId,
        packageTag: packageSelect?.value || "",
        status: statusSelect?.value || ""
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
