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
      <article class="data-card package-card" id="${pack.id}">
        ${pack.image ? `<img src="${escapeHtml(pack.image)}" alt="${escapeHtml(pack.name)}" loading="lazy" decoding="async" />` : ""}
        <div class="data-card-body">
          <div class="card-topline"><span class="badge">${escapeHtml(pack.compatibilityLevel || "Kräver kontroll")}</span>${pack.popular ? `<span class="trust-indicator">Populärt val</span>` : ""}</div>
          <h3>${escapeHtml(pack.name)}</h3>
          <p>${escapeHtml(pack.description)}</p>
          ${pack.purpose ? `<p class="small-muted"><strong>Syfte:</strong> ${escapeHtml(pack.purpose)}</p>` : ""}
          ${pack.suitableFor ? `<p class="small-muted"><strong>Passar för:</strong> ${escapeHtml(pack.suitableFor)}</p>` : ""}
          <p class="price">${formatCurrency(packageTotal(pack, repo, pricing))}</p>
          <ul>${productNames.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>
          <p class="small-muted">${prisons.length ? `Passar bättre för: ${escapeHtml(prisons.join(", "))}` : "Kräver manuell kontroll."}</p>
          <p class="compatibility-note">${escapeHtml(window.CellViaSeed.packageTrustMessage)}</p>
          <p class="quiet-warning">${escapeHtml(pack.notes.join(" "))}</p>
          <a class="button small" href="skapa-paket.html?package=${pack.id}">Välj paket</a>
        </div>
      </article>
    `;
  }

  window.CellViaPackageCard = { packageCard, packageTotal };
})();
