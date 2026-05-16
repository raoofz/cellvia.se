(() => {
  const { escapeHtml, formatCurrency } = window.CellViaFormat || {};

  /**
   * NEW PRODUCT CARD: Compact, elegant, institutional
   * 180px cards with status badge, verification, price, and dual actions
   */
  function createProductCard(product, compatibility = {}) {
    const status = compatibility.status || product.compatibilityStatus || "Kontroll";
    const image = product.image || "assets/images/products/placeholder.svg";
    const category = product.catalogCategory || product.category || "Övriga";
    const verified = product.checkedByCellVia ? true : false;
    const price = product.price || 0;
    const description = product.compatibilityNote || product.description || "Produkten förbereds och kontrolleras.";

    // Status badge styling
    let statusClass = "kompatibel";
    if (status.toLowerCase().includes("kräver")) statusClass = "kraver-kontroll";
    if (status.toLowerCase().includes("ej rekommenderad")) statusClass = "ej-rekommenderad";

    const html = `
      <article class="product-card" data-product-id="${product.id}">
        <img 
          src="${escapeHtml(image)}" 
          alt="${escapeHtml(product.name)}" 
          class="product-image"
          loading="lazy"
          decoding="async"
        />
        <div class="product-content">
          <span class="product-status-badge ${statusClass}">${escapeHtml(status)}</span>
          <h3 class="product-name">${escapeHtml(product.name)}</h3>
          <p class="product-description">${escapeHtml(description)}</p>
          <div class="product-meta">
            <span>${escapeHtml(category)}</span>
            <span class="product-price">${formatCurrency ? formatCurrency(price) : price + " kr"}</span>
          </div>
          ${verified ? '<div class="product-verification">Förkontrollerad</div>' : ''}
          <div class="product-actions">
            <button type="button" class="product-add-btn" data-add-product="${product.id}">Lägg till</button>
            <a href="produkt.html?id=${product.id}" class="product-info-link" aria-label="Mer info">ℹ</a>
          </div>
        </div>
      </article>
    `;

    return html;
  }

  window.CellViaProductCardV2 = { createProductCard };
})();
