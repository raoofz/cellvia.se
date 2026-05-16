(() => {
  const { escapeHtml, formatCurrency } = window.CellViaFormat || {};

  /**
   * NEW PACKAGE CARD: Standardized, institutional, prepared
   * 240px cards with contents preview, categories, and dual actions
   */
  function createPackageCard(pack, products = []) {
    const image = pack.image || "assets/images/packages/package-default.svg";
    const total = pack.price || 0;
    const itemCount = pack.productIds?.length || 0;
    const purpose = pack.purpose || pack.description || "Färdigt paket för enklare val";
    const popular = pack.popular ? true : false;
    const categories = pack.categories || [];
    const contents = pack.productIds?.slice(0, 4).map(id => {
      const product = products.find(p => p.id === id);
      return product?.name || "Produkt";
    }) || [];

    const contentsText = contents.length > 0 
      ? contents.join(", ") + (itemCount > 4 ? ` +${itemCount - 4} till` : "")
      : "Innehåll anpassas efter anstalt";

    const html = `
      <article class="package-card" data-package-id="${pack.id}">
        <img 
          src="${escapeHtml(image)}" 
          alt="${escapeHtml(pack.name)}" 
          class="package-image"
          loading="lazy"
          decoding="async"
        />
        <div class="package-content">
          <div class="package-header">
            <span class="package-status-badge">${escapeHtml(pack.compatibilityLevel || "Standardiserad")}</span>
            ${popular ? '<span class="package-popular-indicator">Populärt</span>' : ''}
          </div>
          <h3 class="package-name">${escapeHtml(pack.name)}</h3>
          <p class="package-purpose">${escapeHtml(purpose)}</p>
          <div class="package-meta">
            <span>${itemCount} ${itemCount === 1 ? "produkt" : "produkter"}</span>
            <span class="package-price">${formatCurrency ? formatCurrency(total) : total + " kr"}</span>
          </div>
          ${categories.length > 0 ? `
            <div class="package-categories">
              ${categories.slice(0, 3).map(cat => `<span class="package-category-tag">${escapeHtml(cat)}</span>`).join("")}
            </div>
          ` : ""}
          <p class="package-contents"><strong>Innehåller:</strong> ${escapeHtml(contentsText)}</p>
          <div class="package-compliance-note">
            Paketet förbereds och kontrolleras före leverans.
          </div>
          <div class="package-actions">
            <button type="button" class="package-select-btn" data-select-package="${pack.id}">Välj paket</button>
            <button type="button" class="package-customize-btn" data-customize-package="${pack.id}">Anpassa</button>
          </div>
        </div>
      </article>
    `;

    return html;
  }

  window.CellViaPackageCardV2 = { createPackageCard };
})();
