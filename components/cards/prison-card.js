(() => {
  const { escapeHtml } = window.CellViaFormat;
  const { badge } = window.CellViaBadges;

  function prisonCard(prison) {
    return `
      <article class="data-card prison-index-card">
        <div class="data-card-body">
          <div class="card-topline">${badge(`${prison.securityLevel} säkerhet`)}<span class="trust-indicator">${escapeHtml(prison.region || "Region")}</span></div>
          <h3>${escapeHtml(prison.name)}</h3>
          <p>${escapeHtml(prison.city)} · ${escapeHtml(prison.type)}</p>
          <p>${escapeHtml(prison.generalNotes)}</p>
          <dl class="meta-list">
            <div><dt>Kategorier</dt><dd>${escapeHtml(prison.allowedCategories.join(", "))}</dd></div>
            <div><dt>Elektronik</dt><dd>${prison.electronicsPolicy === "restricted" ? "Kräver kontroll" : "Verifieras"}</dd></div>
            <div><dt>Uppdaterad</dt><dd>${escapeHtml(prison.lastUpdated)}</dd></div>
          </dl>
          <div class="card-actions">
            <a class="button small" href="anstalt.html?id=${prison.id}">Visa detaljer</a>
            <a class="text-link" href="skapa-paket.html?prison=${prison.id}">Skapa paket</a>
          </div>
        </div>
      </article>
    `;
  }

  window.CellViaPrisonCard = { prisonCard };
})();
