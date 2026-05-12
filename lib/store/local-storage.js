(() => {
  function canUseStorage() {
    try {
      return typeof window !== "undefined" && Boolean(window.localStorage);
    } catch {
      return false;
    }
  }

  function read(key, fallback) {
    if (!canUseStorage()) return structuredClone(fallback);
    const raw = window.localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    try {
      return JSON.parse(raw);
    } catch {
      window.localStorage.removeItem(key);
      return structuredClone(fallback);
    }
  }

  function write(key, value) {
    if (canUseStorage()) window.localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function remove(key) {
    if (canUseStorage()) window.localStorage.removeItem(key);
  }

  window.CellViaStore = { read, write, remove };
})();
