(() => {
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { badge } = window.CellViaBadges;

  function productCard(result, options = {}) {
    const product = result.product || result;
    const status = result.status || product.compatibilityStatus;
    const warnings = result.warnings || product.warningNotes || [];
    const showActions = options.showActions !== false;
    const compact = options.compact ? " compact-card" : "";
    const tags = product.packageTags || [];
    const trust = product.checkedByCellVia ? "Checked by CellVia" : "Kräver extra verifiering";
    const sourceLabel = product.source ? `${product.source} · ${product.sourceCategory || "Katalog"}` : "";
    return `
      <article class="data-card product-card${compact}">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />
        <div class="data-card-body">
          <div class="card-topline">${badge(status)}<span class="trust-indicator">${escapeHtml(trust)}</span></div>
          <h3>${escapeHtml(product.name)}</h3>
          ${sourceLabel ? `<p class="source-line">${escapeHtml(sourceLabel)}</p>` : ""}
          <p>${escapeHtml(product.description)}</p>
          ${product.usefulFor ? `<p class="small-muted">${escapeHtml(product.usefulFor)}</p>` : ""}
          <dl class="meta-list">
            <div><dt>Kategori</dt><dd>${escapeHtml(product.category)}</dd></div>
            <div><dt>Pris</dt><dd>${formatCurrency(product.price)}</dd></div>
            <div><dt>Lager</dt><dd>${escapeHtml(product.stockStatus)}</dd></div>
          </dl>
          <div class="verification-list">
            <span>Förpackning kontrolleras</span>
            <span>Kvitto/faktura verifieras</span>
            <span>Villkor granskas före leverans</span>
          </div>
          ${tags.length ? `<div class="tag-row">${tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
          <p class="compatibility-note">${escapeHtml(product.compatibilityNote || "Produkten behöver kontrolleras mot aktuell anstalts regler före leverans.")}</p>
          ${warnings.length ? `<p class="quiet-warning">${escapeHtml(warnings[0])}</p>` : ""}
          ${result.prisonNote && options.showPrisonNote ? `<p class="small-muted">${escapeHtml(result.prisonNote)}</p>` : ""}
          ${showActions ? `<div class="card-actions"><a class="text-link" href="produkt.html?id=${product.id}">Visa detaljer</a><a class="text-link" href="skapa-paket.html?product=${product.id}">Kontrollera kompatibilitet</a><button type="button" class="button small" data-add-product="${product.id}">Lägg till</button></div>` : ""}
        </div>
      </article>
    `;
  }

  window.CellViaProductCard = { productCard };
})();
