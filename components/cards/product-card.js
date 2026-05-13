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
    const image = product.image || product.fallbackImage || "assets/images/products/vardag.svg";
    const fallback = product.fallbackImage || "assets/images/products/vardag.svg";
    const category = product.catalogCategory || product.category;
    const subtitle = product.compatibilityNote || product.description || "Kontrolleras före leverans.";
    const microLabel = product.checkedByCellVia ? "Kontrollerad" : "Manuell kontroll";
    return `
      <article class="data-card product-card${compact}">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${escapeHtml(fallback)}';" />
        <div class="data-card-body">
          <div class="card-topline">${badge(status)}</div>
          <h3>${escapeHtml(product.name)}</h3>
          <p class="product-subtitle">${escapeHtml(subtitle)}</p>
          <div class="product-card-meta">
            <span>${escapeHtml(category)}</span>
            <strong>${formatCurrency(product.price)}</strong>
            <span>${escapeHtml(product.stockStatus)}</span>
          </div>
          <div class="micro-trust-row"><span>${escapeHtml(microLabel)}</span><span>Förpackas av CellVia</span></div>
          ${sourceLabel ? `<p class="source-line">${escapeHtml(sourceLabel)}</p>` : ""}
          ${warning ? `<p class="quiet-warning compact-warning">${escapeHtml(warning)}</p>` : ""}
          ${result.prisonNote && options.showPrisonNote ? `<p class="small-muted">${escapeHtml(result.prisonNote)}</p>` : ""}
          ${showActions ? `<div class="card-actions compact-actions"><button type="button" class="button small" data-add-product="${product.id}">Lägg till</button><a class="button ghost small" href="produkt.html?id=${product.id}">Snabbvy</a></div>` : ""}
        </div>
      </article>
    `;
  }

  window.CellViaProductCard = { productCard };
})();
