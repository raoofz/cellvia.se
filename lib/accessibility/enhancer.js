(() => {
  class AccessibilityEnhancer {
    constructor() {
      this.enhanceKeyboardNavigation();
      this.improveColorContrast();
      this.addSkipLinks();
      this.enhanceAriaLabels();
      this.setupFocusManagement();
    }

    enhanceKeyboardNavigation() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          document.activeElement?.blur();
          const openMenu = document.querySelector(".nav-links.open");
          if (openMenu) {
            openMenu.classList.remove("open");
            const button = document.querySelector(".menu-toggle");
            if (button) button.setAttribute("aria-expanded", "false");
          }
        }
        if (e.key === "/" && e.ctrlKey) {
          e.preventDefault();
          document.querySelector("#product-search")?.focus();
        }
      });

      document.querySelectorAll("a, button").forEach((element) => {
        if (!element.hasAttribute("tabindex")) {
          element.setAttribute("tabindex", "0");
        }
      });
    }

    addSkipLinks() {
      const skipLink = document.createElement("a");
      skipLink.href = "#main-content";
      skipLink.className = "skip-to-main";
      skipLink.textContent = "Hoppa till huvudinnehål";
      skipLink.setAttribute("aria-label", "Hoppa till huvudinnehål");
      document.body.insertBefore(skipLink, document.body.firstChild);

      const mainContent = document.querySelector("main");
      if (mainContent && !mainContent.id) {
        mainContent.id = "main-content";
      }
    }

    improveColorContrast() {
      const style = document.createElement("style");
      style.textContent = `
        :focus-visible {
          outline: 3px solid var(--authority-blue);
          outline-offset: 2px;
        }
        button, a {
          outline: 0;
        }
        .skip-to-main {
          position: absolute;
          top: -40px;
          left: 0;
          background: var(--authority-blue);
          color: white;
          padding: 8px 12px;
          z-index: 100;
        }
        .skip-to-main:focus {
          top: 0;
        }
      `;
      document.head.appendChild(style);
    }

    enhanceAriaLabels() {
      document.querySelectorAll("img[alt='']").forEach((img) => {
        img.setAttribute("role", "presentation");
      });

      document.querySelectorAll("button:not([aria-label])").forEach((btn) => {
        if (!btn.textContent.trim() && !btn.title) {
          btn.setAttribute("aria-label", "Button");
        }
      });

      document.querySelectorAll("form").forEach((form) => {
        if (!form.hasAttribute("aria-label")) {
          const heading = form.querySelector("h1, h2, h3");
          if (heading) {
            form.setAttribute("aria-label", heading.textContent.trim());
          }
        }
      });
    }

    setupFocusManagement() {
      const links = document.querySelectorAll("a[href^='http'], a[target='_blank']");
      links.forEach((link) => {
        if (!link.hasAttribute("rel")) {
          link.setAttribute("rel", "noopener noreferrer");
        }
      });
    }
  }

  window.CellViaAccessibility = new AccessibilityEnhancer();
})();
