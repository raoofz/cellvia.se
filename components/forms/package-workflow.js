(() => {
  const repo = () => window.CellViaRepository;
  const compatibility = () => window.CellViaCompatibility;
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { setHtml, qs, qsa } = window.CellViaDom;
  const { setStatus, clearStatus } = window.CellViaStatus;
  const pricing = { service: 89, packing: 59, shipping: 79 };

  function totals(productIds) {
    const productTotal = productIds.reduce((sum, id) => sum + (repo().products.find(id)?.price || 0), 0);
    return {
      productTotal,
      service: pricing.service,
      packing: pricing.packing,
      shipping: pricing.shipping,
      total: productTotal + pricing.service + pricing.packing + pricing.shipping
    };
  }

  function renderSummary(state) {
    const selected = state.productIds.map((id) => repo().products.find(id)).filter(Boolean);
    const warnings = compatibility().packageWarnings(state.prisonId, state.productIds);
    const price = totals(state.productIds);
    setHtml("#package-summary", `
      <h3>Sammanfattning</h3>
      ${selected.length ? `<ul>${selected.map((product) => `<li>${escapeHtml(product.name)} <button type="button" class="remove-link" data-remove-product="${product.id}">Ta bort</button></li>`).join("")}</ul>` : `<p>Inga produkter valda ännu.</p>`}
      ${warnings.length ? `<div class="calm-alert"><strong>Att kontrollera innan nästa steg</strong>${warnings.map((item) => `<p>${escapeHtml(item.product.name)}: ${escapeHtml(item.warnings[0] || item.saferAlternative)}</p>`).join("")}</div>` : ""}
      <dl class="cost-list">
        <div><dt>Produkter</dt><dd>${formatCurrency(price.productTotal)}</dd></div>
        <div><dt>Service</dt><dd>${formatCurrency(price.service)}</dd></div>
        <div><dt>Packning och förberedelse</dt><dd>${formatCurrency(price.packing)}</dd></div>
        <div><dt>Frakt</dt><dd>${formatCurrency(price.shipping)}</dd></div>
        <div class="total"><dt>Totalt</dt><dd>${formatCurrency(price.total)}</dd></div>
      </dl>
      <p class="small-muted">${escapeHtml(window.CellViaSeed.legalNotice)}</p>
    `);
  }

  function renderGuidance(state) {
    const prison = state.prisonId ? repo().prisons.find(state.prisonId) : null;
    setHtml("#create-guidance", prison ? `
      <div class="status-message info">
        <p><strong>${escapeHtml(prison.name)}</strong></p>
        <p>${escapeHtml(prison.packagingNotes)}</p>
        <p>${escapeHtml(window.CellViaSeed.legalNotice)}</p>
      </div>
    ` : `<div class="status-message info"><p>Välj anstalt först. Då visas produkter och varningar utifrån vald anstalt.</p></div>`);
  }

  function renderChoices(state) {
    const results = state.prisonId
      ? compatibility().productsForPrison(state.prisonId, { includeHidden: false })
      : repo().products.all().map((product) => compatibility().evaluateProductForPrison(product, null));

    setHtml("#create-products", results.map((result) => {
      const product = result.product;
      return `
        <article class="choice-row ${result.isRisky ? "risky-choice" : ""}">
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <span class="badge ${window.CellViaFormat.slugify(result.status)}">${escapeHtml(result.status)}</span>
            <p>${escapeHtml(product.description)}</p>
            ${result.warnings.length ? `<p class="quiet-warning">${escapeHtml(result.warnings[0])} Säkrare alternativ: ${escapeHtml(result.saferAlternative)}</p>` : ""}
          </div>
          <button type="button" class="button small" data-create-add="${product.id}">Lägg till</button>
        </article>
      `;
    }).join(""));
  }

  function mount() {
    const state = window.CellViaPackageState.createPackageState();
    const prisonSelect = qs("#create-prison");
    const productSeed = window.CellViaDom.getParam("product");
    const packageSeed = window.CellViaDom.getParam("package");
    const prisonSeed = window.CellViaDom.getParam("prison");

    if (prisonSelect) {
      prisonSelect.innerHTML = `<option value="">Välj anstalt</option>${repo().prisons.all().map((prison) => `<option value="${prison.id}">${escapeHtml(prison.name)}</option>`).join("")}`;
      if (prisonSeed) state.set({ prisonId: prisonSeed });
    }
    if (productSeed) state.addProduct(productSeed);
    if (packageSeed) {
      const pack = repo().packages.find(packageSeed);
      if (pack) pack.productIds.forEach((id) => state.addProduct(id));
    }

    state.subscribe((current) => {
      if (prisonSelect && prisonSelect.value !== current.prisonId) prisonSelect.value = current.prisonId;
      renderGuidance(current);
      renderChoices(current);
      renderSummary(current);
    });

    prisonSelect?.addEventListener("change", () => {
      clearStatus("#create-status");
      state.set({ prisonId: prisonSelect.value });
    });

    qsa("#inmate-name, #inmate-number, #order-notes").forEach((input) => {
      input.addEventListener("input", () => {
        state.set({
          inmateName: qs("#inmate-name")?.value || "",
          inmateNumber: qs("#inmate-number")?.value || "",
          notes: qs("#order-notes")?.value || ""
        });
      });
    });

    window.CellViaDom.on(document, "click", "[data-create-add]", (_, button) => state.addProduct(button.dataset.createAdd));
    window.CellViaDom.on(document, "click", "[data-remove-product]", (_, button) => state.removeProduct(button.dataset.removeProduct));

    qs("#create-order-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const current = {
        ...state.get(),
        inmateName: qs("#inmate-name").value,
        inmateNumber: qs("#inmate-number").value,
        prisonId: prisonSelect.value,
        notes: qs("#order-notes").value
      };
      const result = repo().orders.create(current);
      if (!result.ok) {
        setStatus("#create-status", result.errors, "error");
        return;
      }
      event.target.reset();
      state.reset();
      setStatus("#create-status", [`Beställningen skapades: ${result.order.id}`, "Spara ordernumret för spårning. CellVia går igenom innehållet innan nästa steg."], "success");
    });
  }

  window.CellViaPackageWorkflow = { mount, totals, pricing };
})();
