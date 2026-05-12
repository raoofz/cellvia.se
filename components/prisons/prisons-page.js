(() => {
  const repo = () => window.CellViaRepository;
  const { qs, qsa, setHtml, getParam } = window.CellViaDom;
  const { escapeHtml } = window.CellViaFormat;

  function mountList() {
    const citySelect = qs("#prison-city");
    const levelSelect = qs("#prison-level");
    const initialQuery = getParam("q");
    if (qs("#prison-search") && initialQuery) qs("#prison-search").value = initialQuery;
    const prisons = repo().prisons.all();
    const cities = [...new Set(prisons.map((prison) => prison.city))];
    const levels = [...new Set(prisons.map((prison) => prison.securityLevel))];
    if (citySelect) citySelect.innerHTML = `<option value="">Alla städer</option>${cities.map((city) => `<option>${escapeHtml(city)}</option>`).join("")}`;
    if (levelSelect) levelSelect.innerHTML = `<option value="">Alla nivåer</option>${levels.map((level) => `<option>${escapeHtml(level)}</option>`).join("")}`;

    function render() {
      const filtered = window.CellViaFilters.filterPrisons(prisons, {
        query: qs("#prison-search")?.value || "",
        city: citySelect?.value || "",
        level: levelSelect?.value || ""
      });
      setHtml("#prisons-grid", filtered.length ? filtered.map(window.CellViaPrisonCard.prisonCard).join("") : `<div class="empty-state">Ingen anstalt matchar filtret.</div>`);
    }
    qsa("[data-prison-filter]").forEach((input) => input.addEventListener("input", render));
    render();
  }

  function mountDetail() {
    const prison = repo().prisons.find(getParam("id"));
    if (!prison) {
      setHtml("#prison-detail", `<div class="empty-state">Anstalten hittades inte.</div>`);
      return;
    }
    document.title = `${prison.name} | CellVia`;
    const products = window.CellViaCompatibility.productsForPrison(prison.id).filter((result) => result.score >= 70);
    setHtml("#prison-detail", `
      <section class="detail-layout no-media">
        <div>
          <span class="badge">${escapeHtml(prison.securityLevel)} säkerhet</span>
          <h1>${escapeHtml(prison.name)}</h1>
          <p class="lead">${escapeHtml(prison.city)} · ${escapeHtml(prison.type)}</p>
          <p>${escapeHtml(prison.generalNotes)}</p>
          <p class="legal-note inline">${escapeHtml(window.CellViaSeed.legalNotice)}</p>
          <h2>Packning</h2>
          <p>${escapeHtml(prison.packagingNotes)}</p>
          <div class="split-grid">
            <article><h3>Kategorier som ofta passar bättre</h3><ul>${prison.allowedCategories.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
            <article><h3>Kategorier som kräver försiktighet</h3><ul>${prison.restrictedCategories.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
          </div>
          <h2>Regeluppdateringar</h2>
          <div class="timeline">${prison.ruleUpdates.map((update) => `<article><strong>${escapeHtml(update.date)} · ${escapeHtml(update.title)}</strong><p>${escapeHtml(update.body)}</p></article>`).join("")}</div>
          <h2>Produkter som passar bättre</h2>
          <div class="mini-grid">${products.map((result) => window.CellViaProductCard.productCard(result, { showActions: false, compact: true })).join("") || "<p>Inga produkter är kopplade ännu.</p>"}</div>
          <a class="button primary" href="skapa-paket.html?prison=${prison.id}">Skapa paket för denna anstalt</a>
        </div>
      </section>
    `);
  }

  window.CellViaPrisonsPage = { mountList, mountDetail };
})();
