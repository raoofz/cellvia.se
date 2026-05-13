(() => {
  const { escapeHtml, formatCurrency } = window.CellViaFormat;

  function packageTotal(pack, repo, pricing) {
    const productTotal = pack.productIds.reduce((sum, id) => sum + (repo.products.find(id)?.price || 0), 0);
    return productTotal + pack.serviceFee + pricing.packing + pricing.shipping;
  }

  function packageCard(pack, repo, pricing) {
    const productNames = pack.productIds.map((id) => repo.products.find(id)?.name).filter(Boolean);
    const categories = [...new Set(pack.productIds.map((id) => repo.products.find(id)?.category).filter(Boolean))];
    const prisons = pack.compatiblePrisons.map((id) => repo.prisons.find(id)?.name).filter(Boolean);
    const total = packageTotal(pack, repo, pricing);
    return `
      <article class="data-card package-card" id="${pack.id}">
        ${pack.image ? `<img src="${escapeHtml(pack.image)}" alt="${escapeHtml(pack.name)}" loading="lazy" decoding="async" />` : ""}
        <div class="data-card-body">
          <div class="card-topline"><span class="badge">${escapeHtml(pack.compatibilityLevel || "Kräver kontroll")}</span>${pack.popular ? `<span class="trust-indicator">Populärt val</span>` : ""}</div>
          <h3>${escapeHtml(pack.name)}</h3>
          <p>${escapeHtml(pack.purpose || pack.description)}</p>
          <div class="product-card-meta">
            <span>${pack.productIds.length} produkter</span>
            <strong>${formatCurrency(total)}</strong>
            <span>${escapeHtml(pack.firstDelivery ? "Första leverans" : "Kontroll")}</span>
          </div>
          <div class="tag-row">${categories.slice(0, 3).map((name) => `<span>${escapeHtml(name)}</span>`).join("")}</div>
          <p class="compatibility-note">${escapeHtml(pack.notes[0] || window.CellViaSeed.complianceNotice)}</p>
          <details class="package-details">
            <summary>Visa detaljer</summary>
            <ul>${productNames.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>
            <p>${prisons.length ? `Passar bättre för: ${escapeHtml(prisons.slice(0, 5).join(", "))}` : "Kräver manuell kontroll."}</p>
          </details>
          <a class="button small" href="skapa-paket.html?package=${pack.id}">Välj paket</a>
        </div>
      </article>
    `;
  }

  window.CellViaPackageCard = { packageCard, packageTotal };
})();
