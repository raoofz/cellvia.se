(() => {
  const repo = () => window.CellViaRepository;
  const { qs, setHtml, getParam } = window.CellViaDom;
  const { escapeHtml } = window.CellViaFormat;

  function mount() {
    const input = qs("#tracking-id");
    const initial = getParam("order");
    if (input && initial) input.value = initial;

    function showOrder() {
      const order = repo().orders.find(input?.value);
      if (!order) {
        setHtml("#tracking-result", `<div class="empty-state">Ingen order hittades. Kontrollera ordernumret, till exempel CV-2026-1001.</div>`);
        return;
      }
      const prison = repo().prisons.find(order.prisonId);
      const products = order.productIds.map((id) => repo().products.find(id)).filter(Boolean);
      const events = repo().tracking.eventsFor(order.id);
      setHtml("#tracking-result", `
        <article class="data-card tracking-card">
          <div class="data-card-body">
            <span class="badge">${escapeHtml(order.status)}</span>
            <h2>${escapeHtml(order.id)}</h2>
            <p>${escapeHtml(prison?.name || "Okänd anstalt")}</p>
            <h3>Produkter</h3>
            <ul>${products.map((product) => `<li>${escapeHtml(product.name)}</li>`).join("")}</ul>
            <h3>CellVia-notering</h3>
            <p>${escapeHtml(order.cellviaNotes)}</p>
            <p class="small-muted">Senast uppdaterad: ${new Date(order.updatedAt).toLocaleString("sv-SE")}</p>
            <div class="timeline">${events.map((event) => `<article><strong>${escapeHtml(event.status)}</strong><p>${escapeHtml(event.note)}</p></article>`).join("")}</div>
          </div>
        </article>
      `);
    }

    qs("#tracking-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      showOrder();
    });
    if (initial) showOrder();
  }

  window.CellViaTrackingPage = { mount };
})();
