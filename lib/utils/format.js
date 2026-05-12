(() => {
  function formatCurrency(amount) {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0
    }).format(amount);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll("ä", "a")
      .replaceAll("å", "a")
      .replaceAll("ö", "o")
      .replace(/[^a-z0-9-]/g, "");
  }

  window.CellViaFormat = { formatCurrency, escapeHtml, slugify };
})();
