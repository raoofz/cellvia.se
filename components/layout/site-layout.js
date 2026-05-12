(() => {
  const { qsa, qs } = window.CellViaDom;

  function activateNav() {
    const page = document.body.dataset.page;
    qsa("[data-nav]").forEach((link) => {
      link.classList.toggle("active", link.dataset.nav === page);
    });
  }

  function renderLegalNotice() {
    qsa("[data-legal-notice]").forEach((element) => {
      element.textContent = window.CellViaSeed.legalNotice;
    });
  }

  function wireHomeSearch() {
    const button = qs("[data-home-prison-search]");
    const input = qs(".search-row input");
    if (!button || !input) return;
    button.addEventListener("click", () => {
      const query = input.value.trim();
      window.location.href = query ? `anstalter.html?q=${encodeURIComponent(query)}` : "anstalter.html";
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") button.click();
    });
  }

  function wireMobileNavigation() {
    const nav = qs(".nav");
    const links = qs(".nav-links");
    if (!nav || !links || qs(".menu-toggle", nav)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "mobile-navigation");
    button.textContent = "Meny";
    links.id = "mobile-navigation";
    nav.insertBefore(button, links);
    button.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function addSeoBasics() {
    if (!document.querySelector('meta[property="og:title"]')) {
      const title = document.createElement("meta");
      title.setAttribute("property", "og:title");
      title.setAttribute("content", document.title);
      document.head.appendChild(title);
    }
    if (!document.querySelector('meta[property="og:description"]')) {
      const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "CellVia hjälper familjer med tydligare paketförberedelse.";
      const og = document.createElement("meta");
      og.setAttribute("property", "og:description");
      og.setAttribute("content", description);
      document.head.appendChild(og);
    }
    if (!document.querySelector('meta[property="og:type"]')) {
      const type = document.createElement("meta");
      type.setAttribute("property", "og:type");
      type.setAttribute("content", "website");
      document.head.appendChild(type);
    }
  }

  function mount() {
    activateNav();
    renderLegalNotice();
    wireMobileNavigation();
    wireHomeSearch();
    addSeoBasics();
  }

  window.CellViaLayout = { mount };
})();
