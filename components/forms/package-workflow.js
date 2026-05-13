(() => {
  const repo = () => window.CellViaRepository;
  const compatibility = () => window.CellViaCompatibility;
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { setHtml, qs, qsa } = window.CellViaDom;
  const { setStatus, clearStatus } = window.CellViaStatus;
  const pricing = { service: 89, packing: 59, shipping: 79 };
  let visibleChoiceCount = 40;

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

  function renderSteps(state) {
    const steps = [
      { label: "Mottagare", done: Boolean(state.inmateName && state.inmateNumber) },
      { label: "Anstalt", done: Boolean(state.prisonId) },
      { label: "Produkter", done: state.productIds.length > 0 },
      { label: "Kontakt", done: Boolean(state.customerEmail) },
      { label: "Bekräftelse", done: false }
    ];
    setHtml("#create-steps", steps.map((step, index) => `
      <article class="${step.done ? "done" : ""}">
        <span>${index + 1}</span>
        <strong>${escapeHtml(step.label)}</strong>
      </article>
    `).join(""));
  }

  function renderSummary(state) {
    const selected = state.productIds.map((id) => repo().products.find(id)).filter(Boolean);
    const warnings = compatibility().packageWarnings(state.prisonId, state.productIds);
    const price = totals(state.productIds);
    setHtml("#package-summary", `
      <h3>Sammanfattning</h3>
      ${selected.length ? `<ul>${selected.map((product) => `<li>${escapeHtml(product.name)} <button type="button" class="remove-link" data-remove-product="${product.id}">Ta bort</button></li>`).join("")}</ul>` : `<p>Inga produkter valda ännu.</p>`}
      ${warnings.length ? `<div class="calm-alert"><strong>Att kontrollera innan nästa steg</strong>${warnings.map((item) => `<p>${escapeHtml(item.product.name)}: ${escapeHtml(item.warnings[0] || item.saferAlternative)}</p>`).join("")}</div>` : ""}
      <div class="verification-list summary-verification">
        <span>Produktvillkor kontrolleras</span>
        <span>Förpackning dokumenteras</span>
        <span>Kvitto/faktura sparas internt</span>
        <span>Avvikelse hanteras före leverans</span>
      </div>
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
        <p>${escapeHtml(prison.deliveryNotes || "Kontrollera mottagningens aktuella leveransrutin före nästa steg.")}</p>
        <p>${escapeHtml(window.CellViaSeed.legalNotice)}</p>
      </div>
    ` : `<div class="status-message info"><p>Välj anstalt först. Då visas produkter och varningar utifrån vald anstalt.</p></div>`);
  }

  function renderChoices(state) {
    const search = (qs("#create-product-search")?.value || "").trim().toLowerCase();
    const category = qs("#create-category-filter")?.value || "";
    const results = state.prisonId
      ? compatibility().productsForPrison(state.prisonId, { includeHidden: false })
      : repo().products.all().map((product) => compatibility().evaluateProductForPrison(product, null));

    const filtered = results.filter((result) => {
      const product = result.product;
      const text = [product.name, product.description, product.category, product.sourceCategory, product.compatibilityNote].join(" ").toLowerCase();
      return (!search || text.includes(search)) && (!category || product.category === category || product.catalogCategory === category);
    });
    const visible = filtered.slice(0, visibleChoiceCount);

    setHtml("#create-products", `
      <div class="results-count">${visible.length} av ${filtered.length} produkter visas i paketbyggaren</div>
      ${visible.map((result) => {
      const product = result.product;
      return `
        <article class="choice-row ${result.isRisky ? "risky-choice" : ""}">
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <span class="badge ${window.CellViaFormat.slugify(result.status)}">${escapeHtml(result.status)}</span>
            <p>${escapeHtml(product.description)}</p>
            <p class="small-muted">${escapeHtml(product.packagingNote || product.compatibilityNote || "Förpackning och innehåll kontrolleras före leverans.")}</p>
            ${result.warnings.length ? `<p class="quiet-warning">${escapeHtml(result.warnings[0])} Säkrare alternativ: ${escapeHtml(result.saferAlternative)}</p>` : ""}
          </div>
          <div class="choice-actions">
            <button type="button" class="button small" data-create-check="${product.id}">Kontrollera</button>
            <button type="button" class="button small" data-create-add="${product.id}">Lägg till</button>
          </div>
        </article>
      `;
    }).join("")}
      ${visible.length < filtered.length ? `<button type="button" class="button secondary load-more" data-create-show-more>Visa fler produkter</button>` : ""}
      ${!filtered.length ? `<div class="empty-state">Inga produkter matchar sökningen. Prova en bredare sökning eller byt kategori.</div>` : ""}
    `);
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
    const createCategory = qs("#create-category-filter");
    if (createCategory) {
      const categories = [...new Set(repo().products.all().map((product) => product.catalogCategory || product.category))].sort((a, b) => a.localeCompare(b, "sv"));
      createCategory.innerHTML = `<option value="">Alla kategorier</option>${categories.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}`;
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
      renderSteps(current);
    });

    prisonSelect?.addEventListener("change", () => {
      clearStatus("#create-status");
      visibleChoiceCount = 40;
      state.set({ prisonId: prisonSelect.value });
    });

    qsa("#create-product-search, #create-category-filter").forEach((input) => {
      input.addEventListener("input", () => {
        visibleChoiceCount = 40;
        renderChoices(state.get());
      });
    });

    qsa("#inmate-name, #inmate-number, #inmate-department, #customer-email, #order-notes, #order-consent").forEach((input) => {
      const syncFormState = () => {
        state.set({
          inmateName: qs("#inmate-name")?.value || "",
          inmateNumber: qs("#inmate-number")?.value || "",
          inmateDepartment: qs("#inmate-department")?.value || "",
          customerEmail: qs("#customer-email")?.value || "",
          consent: Boolean(qs("#order-consent")?.checked),
          notes: qs("#order-notes")?.value || ""
        });
      };
      input.addEventListener("input", syncFormState);
      input.addEventListener("change", syncFormState);
    });

    window.CellViaDom.on(document, "click", "[data-create-add]", (_, button) => state.addProduct(button.dataset.createAdd));
    window.CellViaDom.on(document, "click", "[data-create-show-more]", () => {
      visibleChoiceCount += 40;
      renderChoices(state.get());
    });
    window.CellViaDom.on(document, "click", "[data-create-check]", (_, button) => {
      const current = state.get();
      const product = repo().products.find(button.dataset.createCheck);
      const prison = current.prisonId ? repo().prisons.find(current.prisonId) : null;
      const result = product ? compatibility().evaluateProductForPrison(product, prison) : null;
      if (!result) return;
      setStatus("#create-status", [
        `${product.name}: ${result.status}`,
        result.warnings[0] || product.compatibilityNote || "Produkten behöver kontrolleras mot vald anstalt.",
        window.CellViaSeed.legalNotice
      ], result.isRisky ? "error" : "info");
    });
    window.CellViaDom.on(document, "click", "[data-remove-product]", (_, button) => state.removeProduct(button.dataset.removeProduct));

    qs("#create-order-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const current = {
        ...state.get(),
        inmateName: qs("#inmate-name").value,
        inmateNumber: qs("#inmate-number").value,
        inmateDepartment: qs("#inmate-department").value,
        customerEmail: qs("#customer-email").value,
        consent: qs("#order-consent").checked,
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
