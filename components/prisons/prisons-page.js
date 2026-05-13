(() => {
  const repo = () => window.CellViaRepository;
  const { qs, qsa, setHtml, getParam } = window.CellViaDom;
  const { escapeHtml } = window.CellViaFormat;

  function mountList() {
    const citySelect = qs("#prison-city");
    const levelSelect = qs("#prison-level");
    const regionSelect = qs("#prison-region");
    const categorySelect = qs("#prison-category");
    const electronicsSelect = qs("#prison-electronics");
    const initialQuery = getParam("q");
    if (qs("#prison-search") && initialQuery) qs("#prison-search").value = initialQuery;
    const prisons = repo().prisons.all();
    const cities = [...new Set(prisons.map((prison) => prison.city))];
    const levels = [...new Set(prisons.map((prison) => prison.securityLevel))];
    const regions = [...new Set(prisons.map((prison) => prison.region).filter(Boolean))];
    if (citySelect) citySelect.innerHTML = `<option value="">Alla städer</option>${cities.map((city) => `<option>${escapeHtml(city)}</option>`).join("")}`;
    if (levelSelect) levelSelect.innerHTML = `<option value="">Alla nivåer</option>${levels.map((level) => `<option value="${escapeHtml(level)}">Säkerhetsklass ${escapeHtml(level)}</option>`).join("")}<option value="unknown">Övrigt / kräver kontroll</option>`;
    if (regionSelect) regionSelect.innerHTML = `<option value="">Alla regioner</option>${regions.map((region) => `<option>${escapeHtml(region)}</option>`).join("")}`;
    if (categorySelect) categorySelect.innerHTML = `<option value="">Alla produktkategorier</option>${window.CellViaSeed.categories.map((category) => `<option>${escapeHtml(category)}</option>`).join("")}`;
    if (electronicsSelect) electronicsSelect.innerHTML = `<option value="">Elektronik: alla</option><option value="restricted">Kräver kontroll</option>`;
    if (qs("#prison-rule-foundation")) {
      setHtml("#prison-rule-foundation", window.CellViaSeed.complianceSources.slice(0, 4).map((source) => `
        <article>
          <span class="badge">${escapeHtml(source.type)}</span>
          <h3>${escapeHtml(source.title)}</h3>
          <p>${escapeHtml(source.summary)}</p>
          <a class="text-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Visa källa</a>
        </article>
      `).join(""));
    }

    function render() {
      const filtered = window.CellViaFilters.filterPrisons(prisons, {
        query: qs("#prison-search")?.value || "",
        city: citySelect?.value || "",
        level: levelSelect?.value === "unknown" ? "" : levelSelect?.value || "",
        region: regionSelect?.value || "",
        category: categorySelect?.value || "",
        electronics: electronicsSelect?.value || ""
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
    const packages = repo().packages.all().filter((pack) => pack.compatiblePrisons.includes(prison.id)).slice(0, 4);
    setHtml("#prison-detail", `
      <section class="detail-layout">
        <img class="detail-image" src="${escapeHtml(prison.image || "assets/images/prisons/klass-2.svg")}" alt="${escapeHtml(prison.name)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/images/prisons/klass-2.svg';" />
        <div>
          <div class="card-topline"><span class="badge">${escapeHtml(prison.securityLevel)} säkerhet</span><span class="trust-indicator">${escapeHtml(prison.region || "")}</span></div>
          <h1>${escapeHtml(prison.name)}</h1>
          <p class="lead">${escapeHtml(prison.city)} · ${escapeHtml(prison.type)}</p>
          <p>${escapeHtml(prison.generalNotes)}</p>
          <p class="legal-note inline">${escapeHtml(window.CellViaSeed.legalNotice)}</p>
          <div class="institutional-note"><strong>Regler kan ändras.</strong><p>${escapeHtml(prison.compatibilityGuidance || window.CellViaSeed.complianceNotice)}</p></div>
          <div class="institutional-note"><strong>Central regelgrund</strong><p>${escapeHtml(prison.centralRuleSummary || window.CellViaSeed.officialRuleSummary)}</p><p>${escapeHtml(prison.joGuidance || window.CellViaSeed.joPackageSummary)}</p></div>
          <div class="rule-grid">
            <article><h3>Leverans</h3><p>${escapeHtml(prison.deliveryNotes || prison.packagingNotes)}</p></article>
            <article><h3>Packning</h3><p>${escapeHtml(prison.packagingNotes)}</p></article>
            <article><h3>Elektronik</h3><p>${escapeHtml(prison.electronicsNotes || window.CellViaSeed.limitedPublicInfo)}</p></article>
            <article><h3>Kläder</h3><p>${escapeHtml(prison.clothingNotes || window.CellViaSeed.limitedPublicInfo)}</p></article>
            <article><h3>Hygien</h3><p>${escapeHtml(prison.hygieneNotes || window.CellViaSeed.limitedPublicInfo)}</p></article>
            <article><h3>Brev & dokument</h3><p>${escapeHtml(prison.mailNotes || window.CellViaSeed.limitedPublicInfo)}</p></article>
          </div>
          <div class="split-grid">
            <article><h3>Kategorier som ofta passar bättre</h3><ul>${prison.allowedCategories.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
            <article><h3>Kategorier som kräver försiktighet</h3><ul>${prison.restrictedCategories.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
          </div>
          <h2>Rekommenderade paket</h2>
          <div class="mini-grid">${packages.map((pack) => window.CellViaPackageCard.packageCard(pack, repo(), window.CellViaPackageWorkflow.pricing)).join("") || `<p>${escapeHtml(window.CellViaSeed.limitedPublicInfo)}</p>`}</div>
          <h2>Regeluppdateringar</h2>
          <div class="timeline">${prison.ruleUpdates.map((update) => `<article><strong>${escapeHtml(update.date)} · ${escapeHtml(update.title)}</strong><p>${escapeHtml(update.body)}</p></article>`).join("")}</div>
          <h2>Produkter som passar bättre</h2>
          <div class="mini-grid">${products.map((result) => window.CellViaProductCard.productCard(result, { showActions: false, compact: true })).join("") || "<p>Inga produkter är kopplade ännu.</p>"}</div>
          <h2>Officiell referens</h2>
          <p><a class="text-link" href="${escapeHtml(prison.officialSource)}" target="_blank" rel="noreferrer">${escapeHtml(prison.sourceLabel || "Kriminalvården")}</a></p>
          <div class="source-list">
            ${window.CellViaSeed.complianceSources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.type)} · ${escapeHtml(source.title)}</a>`).join("")}
          </div>
          <p class="small-muted">Senast kontrollerad: ${escapeHtml(prison.lastUpdated)}</p>
          <a class="button primary" href="skapa-paket.html?prison=${prison.id}">Skapa paket för denna anstalt</a>
        </div>
      </section>
    `);
  }

  window.CellViaPrisonsPage = { mountList, mountDetail };
})();
