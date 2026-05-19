(() => {
  class AnalyticsTracker {
    constructor() {
      this.events = [];
      this.sessionId = this.generateSessionId();
      this.pageStartTime = Date.now();
      this.enableLocalTracking();
    }

    generateSessionId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    track(eventType, data = {}) {
      const event = {
        timestamp: Date.now(),
        sessionId: this.sessionId,
        eventType,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        ...data
      };
      this.events.push(event);
      this.logEvent(event);
    }

    logEvent(event) {
      if (this.events.length % 10 === 0) {
        this.flushEvents();
      }
    }

    flushEvents() {
      if (this.events.length === 0) return;
      try {
        localStorage.setItem('cellvia-analytics-events', JSON.stringify(this.events));
      } catch (e) {
        console.warn("Failed to save analytics events:", e);
      }
    }

    enableLocalTracking() {
      document.addEventListener("click", (e) => {
        const link = e.target.closest("a, button");
        if (link) {
          this.track("interaction", {
            target: link.textContent || link.id,
            type: link.tagName
          });
        }
      });

      window.addEventListener("beforeunload", () => this.flushEvents());
    }

    getMetrics() {
      const pageLoadTime = Date.now() - this.pageStartTime;
      return {
        sessionId: this.sessionId,
        pageLoadTime,
        eventCount: this.events.length,
        events: this.events
      };
    }
  }

  window.CellViaAnalytics = new AnalyticsTracker();
})();
