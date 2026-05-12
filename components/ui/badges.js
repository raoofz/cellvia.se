(() => {
  const { escapeHtml, slugify } = window.CellViaFormat;

  function badge(label, extra = "") {
    return `<span class="badge ${slugify(label)} ${extra}">${escapeHtml(label)}</span>`;
  }

  window.CellViaBadges = { badge };
})();
