(() => {
  const CART_KEY = "cellvia-cart-v2";
  const store = window.CellViaStore;

  function createPackageState(initial = {}) {
    let state = {
      inmateName: "",
      inmateNumber: "",
      prisonId: "",
      notes: "",
      productIds: store.read(CART_KEY, []),
      ...initial
    };
    const listeners = new Set();

    function emit() {
      store.write(CART_KEY, [...new Set(state.productIds)]);
      listeners.forEach((listener) => listener(get()));
    }

    function get() {
      return structuredClone(state);
    }

    function set(patch) {
      state = { ...state, ...patch };
      emit();
    }

    function addProduct(productId) {
      state = { ...state, productIds: [...new Set([...state.productIds, productId])] };
      emit();
    }

    function removeProduct(productId) {
      state = { ...state, productIds: state.productIds.filter((id) => id !== productId) };
      emit();
    }

    function clearProducts() {
      state = { ...state, productIds: [] };
      emit();
    }

    function reset() {
      state = { inmateName: "", inmateNumber: "", prisonId: "", notes: "", productIds: [] };
      store.remove(CART_KEY);
      emit();
    }

    function subscribe(listener) {
      listeners.add(listener);
      listener(get());
      return () => listeners.delete(listener);
    }

    return { get, set, addProduct, removeProduct, clearProducts, reset, subscribe };
  }

  window.CellViaPackageState = { createPackageState };
})();
