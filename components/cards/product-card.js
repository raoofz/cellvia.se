(() => {
  const { escapeHtml, formatCurrency } = window.CellViaFormat;
  const { badge } = window.CellViaBadges;

  function productCard(result, options = {}) {
    const product = result.product || result;
    const status = result.status || product.compatibilityStatus;
    const warnings = result.warnings || product.warningNotes || [];
    const showActions = options.showActions !== false;
    const compact = options.compact ? " compact-card" : "";
    const sourceLabel = product.source ? `${product.source} · ${product.sourceCategory || "Katalog"}` : "";
    const warning = warnings[0] || (product.requiresManualReview ? "Behöver kontrolleras före nästa steg." : "");
    return `
      <article class="data-card product-card${compact}">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" />
        <div class="data-card-body">
          <div class="card-topline">${badge(status)}</div>
          <h3>${escapeHtml(product.name)}</h3>
          ${sourceLabel ? `<p class="source-line">${escapeHtml(sourceLabel)}</p>` : ""}
          <p>${escapeHtml(product.description)}</p>
          <div class="product-card-meta">
            <span>${escapeHtml(product.category)}</span>
            <strong>${formatCurrency(product.price)}</strong>
            <span>${escapeHtml(product.stockStatus)}</span>
          </div>
          ${warning ? `<p class="quiet-warning compact-warning">${escapeHtml(warning)}</p>` : ""}
          ${result.prisonNote && options.showPrisonNote ? `<p class="small-muted">${escapeHtml(result.prisonNote)}</p>` : ""}
          ${showActions ? `<div class="card-actions compact-actions"><button type="button" class="button small" data-add-product="${product.id}">Lägg till</button><a class="text-link" href="produkt.html?id=${product.id}">Detaljer</a></div>` : ""}
        </div>
      </article>
    `;
  }

  window.CellViaProductCard = { productCard };
})();
