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
    const pageTitle = document.title;
    const pageDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "CellVia - En svensk plattform för tryggare och tydligare paketförberedelse till anstalter.";
    const pageUrl = window.location.href;

    const metaTags = [
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: pageDesc },
      { property: "og:type", content: "website" },
      { property: "og:url", content: pageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: pageDesc },
      { name: "theme-color", content: "#1f6b4a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" }
    ];

    metaTags.forEach(tag => {
      const attr = tag.property ? "property" : "name";
      const selector = `meta[${attr}="${tag[attr]}"]`;
      if (!document.querySelector(selector)) {
        const meta = document.createElement("meta");
        meta.setAttribute(attr, tag[attr]);
        meta.setAttribute("content", tag.content);
        document.head.appendChild(meta);
      }
    });

    addJsonLd();
  }

  function addJsonLd() {
    if (document.querySelector('script[type="application/ld+json"]')) return;

    const baseData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "CellVia",
      "url": "https://cellvia.se",
      "description": "En svensk plattform för tryggare och tydligare paketförberedelse till anstalter",
      "logo": "https://cellvia.se/assets/cellvia-logo.svg",
      "sameAs": [
        "https://www.linkedin.com/company/cellvia"
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(baseData);
    document.head.appendChild(script);
  }

  function setupErrorTracking() {
    window.addEventListener("error", (event) => {
      console.error("Runtime error:", event.error);
      trackEvent("error", { message: event.message, source: event.filename, line: event.lineno });
    });
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      trackEvent("unhandledRejection", { reason: String(event.reason) });
    });
  }

  function trackEvent(eventType, data) {
    if (window.CellViaAnalytics && typeof window.CellViaAnalytics.track === "function") {
      window.CellViaAnalytics.track(eventType, data);
    }
  }

  function mount() {
    activateNav();
    renderLegalNotice();
    wireMobileNavigation();
    wireHomeSearch();
    addSeoBasics();
    setupErrorTracking();
  }

  window.CellViaLayout = { mount };
})();
