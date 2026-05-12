(() => {
  const seed = window.CellViaSeed;

  function initialState() {
    const orders = structuredClone(seed.sampleOrders);
    return {
      users: [],
      orders,
      order_items: orders.flatMap((order) => order.productIds.map((productId) => ({ orderId: order.id, productId }))),
      products: structuredClone(seed.products),
      prisons: structuredClone(seed.prisons),
      packages: structuredClone(seed.packages),
      package_items: seed.packages.flatMap((pack) => pack.productIds.map((productId) => ({ packageId: pack.id, productId }))),
      tracking_events: orders.map((order) => ({
        id: `${order.id}-event-1`,
        orderId: order.id,
        status: order.status,
        note: order.cellviaNotes,
        createdAt: order.updatedAt
      })),
      faq: structuredClone(seed.faq),
      contact_messages: [],
      admin_notes: [],
      rule_updates: seed.prisons.flatMap((prison) => prison.ruleUpdates.map((update) => ({ prisonId: prison.id, ...update }))),
      warnings: []
    };
  }

  window.CellViaSchema = { initialState };
})();
