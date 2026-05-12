(() => {
  function includesText(record, query, fields) {
    const normalized = String(query || "").trim().toLowerCase();
    if (!normalized) return true;
    return fields
      .map((field) => String(record[field] || ""))
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  }

  window.CellViaSearch = { includesText };
})();
