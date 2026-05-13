(() => {
  const { setHtml, qs, qsa } = window.CellViaDom;
  const { escapeHtml } = window.CellViaFormat;
  const repo = () => window.CellViaRepository;

  function mount() {
    const pricing = window.CellViaPackageWorkflow.pricing;
    const statuses = ["Vanligt lämplig", "Kräver kontroll", "Begränsad", "Manuell kontroll"];
    const purposes = [
      ["popular", "Populära paket"],
      ["first", "Rekommenderas för första leverans"],
      ["extra", "Kräver extra verifiering"]
    ];
    const statusSelect = qs("#package-compatibility");
    const purposeSelect = qs("#package-purpose");
    if (statusSelect) statusSelect.innerHTML = `<option value="">Alla paket</option>${statuses.map((status) => `<option>${escapeHtml(status)}</option>`).join("")}`;
    if (purposeSelect) purposeSelect.innerHTML = `<option value="">Alla pakettyper</option>${purposes.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;

    function render() {
      const query = (qs("#package-search")?.value || "").toLowerCase();
      const status = statusSelect?.value || "";
      const purpose = purposeSelect?.value || "";
      const filtered = repo().packages.all().filter((pack) => {
        const text = [pack.name, pack.description, pack.purpose, pack.suitableFor, pack.compatibilityLevel].join(" ").toLowerCase();
        const level = pack.compatibilityLevel || "";
        const purposeMatch = !purpose
          || (purpose === "popular" && pack.popular)
          || (purpose === "first" && pack.firstDelivery)
          || (purpose === "extra" && (level.includes("kontroll") || level.includes("Begränsad")));
        const statusMatch = !status || pack.compatibilityLevel === status || (status === "Manuell kontroll" && /kontroll|begränsad/i.test(pack.compatibilityLevel || ""));
        return (!query || text.includes(query)) && statusMatch && purposeMatch;
      });
      setHtml("#packages-grid", (filtered.length ? filtered.map((pack) => window.CellViaPackageCard.packageCard(pack, repo(), pricing)).join("") : `<div class="empty-state">Inga paket matchar filtret. Prova en bredare sökning.</div>`) + `
        <article class="data-card custom">
          <div class="data-card-body">
            <h3>Skapa eget paket</h3>
            <p>Välj anstalt först och bygg ett paket utifrån produkter som passar bättre för vald anstalt.</p>
            <p class="compatibility-note">${escapeHtml(window.CellViaSeed.complianceNotice)}</p>
            <a class="button small" href="skapa-paket.html">Skapa eget paket</a>
          </div>
        </article>
      `);
    }
    qsa("[data-package-filter]").forEach((input) => input.addEventListener("input", render));
    render();
  }

  window.CellViaPackagesPage = { mount };
})();
