(() => {
  const repo = () => window.CellViaRepository;
  const { qs, qsa, setHtml } = window.CellViaDom;
  const { escapeHtml } = window.CellViaFormat;
  const { setStatus } = window.CellViaStatus;

  function renderOrders() {
    setHtml("#admin-orders", repo().orders.all().map((order) => {
      const prison = repo().prisons.find(order.prisonId);
      return `
        <article class="admin-row">
          <div><strong>${escapeHtml(order.id)}</strong><p>${escapeHtml(order.inmateName)} · ${escapeHtml(prison?.name || "")}</p></div>
          <select data-admin-status="${order.id}">
            ${window.CellViaSeed.trackingStatuses.map((status) => `<option ${status === order.status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}
          </select>
          <button type="button" class="button small" data-admin-save="${order.id}">Spara status</button>
        </article>
      `;
    }).join("") || `<p>Inga order ännu.</p>`);
  }

  function renderPanels() {
    const reviewProducts = repo().products.all().filter((product) => product.requiresManualReview);
    setHtml("#admin-products", reviewProducts.slice(0, 80).map((product) => `<li>${escapeHtml(product.name)} · ${escapeHtml(product.category)} · ${escapeHtml(product.compatibilityStatus)}</li>`).join("") + (reviewProducts.length > 80 ? `<li class="small-muted">Visar 80 av ${reviewProducts.length}. Använd produktsidan för full sökning.</li>` : "") || "<li>Inga produkter kräver granskning.</li>");
    setHtml("#admin-prisons", repo().prisons.all().map((prison) => `<option value="${prison.id}">${escapeHtml(prison.name)}</option>`).join(""));
    setHtml("#admin-messages", repo().contacts.all().map((message) => `<article><strong>${escapeHtml(message.name)}</strong><p>${escapeHtml(message.email)}</p><p>${escapeHtml(message.message)}</p></article>`).join("") || "<p>Inga kontaktmeddelanden ännu.</p>");
    const allProducts = repo().products.all();
    setHtml("#admin-product-management", `<p class="small-muted">${allProducts.length} produkter i katalogen. De första 120 visas här för snabb kontroll.</p>` + allProducts.slice(0, 120).map((product) => `
      <article class="compact-admin-item">
        <strong>${escapeHtml(product.name)}</strong>
        <p>${escapeHtml(product.category)} · ${escapeHtml(product.stockStatus)} · ${escapeHtml(product.compatibilityStatus)}</p>
        <a class="text-link" href="produkt.html?id=${product.id}">Öppna produkt</a>
      </article>
    `).join(""));
    setHtml("#admin-prison-management", repo().prisons.all().map((prison) => `
      <article class="compact-admin-item">
        <strong>${escapeHtml(prison.name)}</strong>
        <p>${escapeHtml(prison.city)} · ${escapeHtml(prison.securityLevel)} · uppdaterad ${escapeHtml(prison.lastUpdated)}</p>
        <a class="text-link" href="anstalt.html?id=${prison.id}">Öppna anstalt</a>
      </article>
    `).join(""));
    const warnings = repo().products.all()
      .filter((product) => product.warningNotes.length || product.requiresManualReview)
      .slice(0, 100)
      .map((product) => `<article class="compact-admin-item"><strong>${escapeHtml(product.name)}</strong><p>${escapeHtml(product.warningNotes.join(" ") || "Kräver manuell kontroll.")}</p></article>`)
      .join("");
    setHtml("#admin-warnings", warnings || "<p>Inga varningar i aktuell data.</p>");
    setHtml("#admin-notes", repo().adminNotes.all().map((note) => `<article class="compact-admin-item"><strong>${escapeHtml(note.title)}</strong><p>${escapeHtml(note.body)}</p><p class="small-muted">${new Date(note.createdAt).toLocaleString("sv-SE")}</p></article>`).join("") || "<p>Inga interna noteringar ännu.</p>");
  }

  function mount() {
    renderOrders();
    renderPanels();
    window.CellViaDom.on(document, "click", "[data-admin-save]", (_, button) => {
      const orderId = button.dataset.adminSave;
      const status = qs(`[data-admin-status="${orderId}"]`).value;
      repo().orders.updateStatus(orderId, status, "Status uppdaterad i adminpanelen.");
      renderOrders();
      setStatus("#admin-status", `Order ${orderId} uppdaterades.`, "success");
    });

    qs("#rule-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const prisonId = qs("#admin-prisons").value;
      const title = qs("#rule-title").value;
      const body = qs("#rule-body").value;
      if (!title.trim() || !body.trim()) {
        setStatus("#admin-status", "Fyll i titel och uppdatering.", "error");
        return;
      }
      repo().prisons.addRuleUpdate(prisonId, title, body);
      event.target.reset();
      renderPanels();
      setStatus("#admin-status", "Regeluppdateringen sparades.", "success");
    });

    qs("#admin-note-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = qs("#admin-note-title").value.trim();
      const body = qs("#admin-note-body").value.trim();
      if (!title || !body) {
        setStatus("#admin-status", "Fyll i rubrik och intern notering.", "error");
        return;
      }
      repo().adminNotes.create({ title, body });
      event.target.reset();
      renderPanels();
      setStatus("#admin-status", "Intern notering sparades.", "success");
    });
  }

  window.CellViaAdminPage = { mount };
})();
