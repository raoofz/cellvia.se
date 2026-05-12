(() => {
  const repo = () => window.CellViaRepository;
  const { qs } = window.CellViaDom;
  const { setStatus } = window.CellViaStatus;

  function mount() {
    qs("#contact-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = repo().contacts.create({
        name: qs("#contact-name").value,
        email: qs("#contact-email").value,
        message: qs("#contact-message").value
      });
      if (!result.ok) {
        setStatus("#contact-status", result.errors, "error");
        return;
      }
      event.target.reset();
      setStatus("#contact-status", "Tack. Meddelandet är sparat och CellVia kan följa upp det internt.", "success");
    });
  }

  window.CellViaContactForm = { mount };
})();
