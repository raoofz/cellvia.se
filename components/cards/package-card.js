(() => {
  const { escapeHtml, formatCurrency } = window.CellViaFormat;

  function packageTotal(pack, repo, pricing) {
    const productTotal = pack.productIds.reduce((sum, id) => sum + (repo.products.find(id)?.price || 0), 0);
    return productTotal + pack.serviceFee + pricing.packing + pricing.shipping;
  }

  function packageCard(pack, repo, pricing) {
    const productNames = pack.productIds.map((id) => repo.products.find(id)?.name).filter(Boolean);
    const prisons = pack.compatiblePrisons.map((id) => repo.prisons.find(id)?.name).filter(Boolean);
    return `
      <article class="data-card" id="${pack.id}">
        <div class="data-card-body">
          <h3>${escapeHtml(pack.name)}</h3>
          <p>${escapeHtml(pack.description)}</p>
          <p class="price">${formatCurrency(packageTotal(pack, repo, pricing))}</p>
          <ul>${productNames.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>
          <p class="small-muted">${prisons.length ? `Passar bättre för: ${escapeHtml(prisons.join(", "))}` : "Kräver manuell kontroll."}</p>
          <p class="quiet-warning">${escapeHtml(pack.notes.join(" "))}</p>
          <a class="button small" href="skapa-paket.html?package=${pack.id}">Välj paket</a>
        </div>
      </article>
    `;
  }

  window.CellViaPackageCard = { packageCard, packageTotal };
})();
