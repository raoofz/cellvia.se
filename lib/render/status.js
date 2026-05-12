(() => {
  const { escapeHtml } = window.CellViaFormat;

  function setStatus(target, messages, type = "info") {
    const element = typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;
    const list = Array.isArray(messages) ? messages : [messages];
    element.className = `status-message ${type}`;
    element.innerHTML = list.map((message) => `<p>${escapeHtml(message)}</p>`).join("");
  }

  function clearStatus(target) {
    const element = typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;
    element.className = "";
    element.innerHTML = "";
  }

  window.CellViaStatus = { setStatus, clearStatus };
})();
