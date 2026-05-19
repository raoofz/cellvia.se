(() => {
  class PerformanceOptimizer {
    constructor() {
      this.imageObserver = null;
      this.initLazyLoading();
      this.monitorCoreWebVitals();
    }

    initLazyLoading() {
      if (!("IntersectionObserver" in window)) {
        this.fallbackLazyLoading();
        return;
      }

      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              this.imageObserver.unobserve(img);
            }
          }
        });
      }, { rootMargin: "50px" });

      document.querySelectorAll("img[data-src]").forEach(img => {
        this.imageObserver.observe(img);
      });
    }

    fallbackLazyLoading() {
      document.querySelectorAll("img[data-src]").forEach(img => {
        img.src = img.dataset.src;
      });
    }

    monitorCoreWebVitals() {
      if ("web-vital" in window || !window.requestIdleCallback) return;

      window.addEventListener("load", () => {
        const perfData = performance.getEntriesByType("navigation")[0];
        if (!perfData) return;

        const metrics = {
          fcp: this.getMetricValue("first-contentful-paint"),
          lcp: this.getMetricValue("largest-contentful-paint"),
          fid: this.getMetricValue("first-input"),
          cls: this.calculateCLS(),
          ttfb: perfData.responseStart - perfData.requestStart,
          domInteractive: perfData.domInteractive - perfData.requestStart
        };

        if (window.CellViaAnalytics) {
          window.CellViaAnalytics.track("pageMetrics", metrics);
        }
      });
    }

    getMetricValue(entryType) {
      const entry = performance.getEntriesByType(entryType)[0];
      return entry ? entry.startTime : null;
    }

    calculateCLS() {
      let clsValue = 0;
      performance.getEntriesByType("layout-shift").forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      return clsValue;
    }
  }

  window.CellViaPerformance = new PerformanceOptimizer();
})();
