(() => {
  const { setHtml } = window.CellViaDom;
  const { escapeHtml } = window.CellViaFormat;

  function mount() {
    setHtml("#faq-list", window.CellViaRepository.faq.all().map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join(""));
  }

  window.CellViaFaqPage = { mount };
})();
