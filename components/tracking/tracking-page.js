(() => {
  const repo = () => window.CellViaRepository;
  const { qs, setHtml, getParam } = window.CellViaDom;
  const { escapeHtml } = window.CellViaFormat;
  const stages = [
    { status: "Beställning mottagen", label: "Mottagen", note: "Ordern är registrerad och väntar på första kontroll." },
    { status: "Produkter kontrolleras", label: "Kontrolleras", note: "CellVia granskar produkter, kategori och anstaltsvägledning." },
    { status: "Paket förbereds", label: "Paketeras", note: "Innehåll packas, dokumenteras och stäms av mot ordern." },
    { status: "Verifierad", label: "Verifierad", note: "Avvikelser, kvitto/faktura och packningsnoteringar är genomgångna." },
    { status: "Överlämnad till transport", label: "Överlämnad", note: "Paketet är överlämnat till transportflöde mot anstalt." },
    { status: "Väntar på intern kontroll", label: "Anstaltskontroll", note: "Slutlig kontroll och beslut görs av anstalten." }
  ];

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
      const currentIndex = Math.max(0, stages.findIndex((stage) => stage.status === order.status || stage.label === order.status));
      setHtml("#tracking-result", `
        <article class="data-card tracking-card">
          <div class="data-card-body">
            <div class="card-topline"><span class="badge">${escapeHtml(order.status)}</span><span class="trust-indicator">Dokumenterat flöde</span></div>
            <h2>${escapeHtml(order.id)}</h2>
            <p>${escapeHtml(prison?.name || "Okänd anstalt")}</p>
            <div class="tracking-stages">
              ${stages.map((stage, index) => `
                <article class="${index <= currentIndex ? "active" : ""}">
                  <span>${index + 1}</span>
                  <strong>${escapeHtml(stage.label)}</strong>
                  <p>${escapeHtml(stage.note)}</p>
                </article>
              `).join("")}
            </div>
            <h3>Produkter</h3>
            <ul>${products.map((product) => `<li>${escapeHtml(product.name)}</li>`).join("")}</ul>
            <h3>CellVia-notering</h3>
            <p>${escapeHtml(order.cellviaNotes)}</p>
            <p class="small-muted">Senast uppdaterad: ${new Date(order.updatedAt).toLocaleString("sv-SE")}</p>
            <h3>Händelser</h3>
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
