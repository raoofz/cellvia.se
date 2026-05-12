(() => {
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  }

  function setHtml(selector, html) {
    const element = typeof selector === "string" ? qs(selector) : selector;
    if (element) element.innerHTML = html;
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function on(root, eventName, selector, handler) {
    root.addEventListener(eventName, (event) => {
      const target = event.target.closest(selector);
      if (target && root.contains(target)) handler(event, target);
    });
  }

  window.CellViaDom = { qs, qsa, setHtml, getParam, on };
})();
