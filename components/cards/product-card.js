(() => {
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { badge } = window.CellViaBadges;

  function productCard(result, options = {}) {
    const product = result.product || result;
    const status = result.status || product.compatibilityStatus;
    const warnings = result.warnings || product.warningNotes || [];
    const showActions = options.showActions !== false;
    const compact = options.compact ? " compact-card" : "";
    return `
      <article class="data-card product-card${compact}">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />
        <div class="data-card-body">
          ${badge(status)}
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description)}</p>
          <dl class="meta-list">
            <div><dt>Kategori</dt><dd>${escapeHtml(product.category)}</dd></div>
            <div><dt>Pris</dt><dd>${formatCurrency(product.price)}</dd></div>
            <div><dt>Lager</dt><dd>${escapeHtml(product.stockStatus)}</dd></div>
          </dl>
          ${warnings.length ? `<p class="quiet-warning">${escapeHtml(warnings[0])}</p>` : ""}
          ${result.prisonNote && options.showPrisonNote ? `<p class="small-muted">${escapeHtml(result.prisonNote)}</p>` : ""}
          ${showActions ? `<div class="card-actions"><a class="text-link" href="produkt.html?id=${product.id}">Visa detaljer</a><button type="button" class="button small" data-add-product="${product.id}">Lägg till</button></div>` : ""}
        </div>
      </article>
    `;
  }

  window.CellViaProductCard = { productCard };
})();
