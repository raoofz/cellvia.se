(() => {
  const STORAGE_KEY = "cellvia-db-v6";
  const store = window.CellViaStore;
  const schema = window.CellViaSchema;
  const { validateOrder, validateContact } = window.CellViaUtils;
  let memoryDb = null;

  function readDb() {
    if (memoryDb) return memoryDb;
    const fallback = schema.initialState();
    const state = store.read(STORAGE_KEY, fallback);
    memoryDb = { ...fallback, ...state };
    return memoryDb;
  }

  function writeDb(nextState) {
    memoryDb = nextState;
    return store.write(STORAGE_KEY, nextState);
  }

  function updateDb(updater) {
    return writeDb(updater(readDb()));
  }

  function list(collection) {
    return readDb()[collection] || [];
  }

  function byId(collection, id) {
    return list(collection).find((item) => item.id === id);
  }

  const prisons = {
    all: () => list("prisons"),
    find: (id) => byId("prisons", id),
    addRuleUpdate(prisonId, title, body) {
      const date = new Date().toISOString().slice(0, 10);
      const update = { date, title: title.trim(), body: body.trim() };
      updateDb((db) => ({
        ...db,
        prisons: db.prisons.map((prison) => prison.id === prisonId ? {
          ...prison,
          ruleUpdates: [update, ...prison.ruleUpdates],
          lastUpdated: date
        } : prison),
        rule_updates: [{ prisonId, ...update }, ...db.rule_updates]
      }));
      return update;
    }
  };

  const products = {
    all: () => list("products"),
    find: (id) => byId("products", id),
    update(productId, patch) {
      updateDb((db) => ({
        ...db,
        products: db.products.map((product) => product.id === productId ? { ...product, ...patch } : product)
      }));
    }
  };

  const packagesRepo = {
    all: () => list("packages"),
    find: (id) => byId("packages", id)
  };

  const orders = {
    all: () => list("orders"),
    find: (id) => list("orders").find((order) => order.id.toUpperCase() === String(id || "").trim().toUpperCase()),
    create(payload) {
      const errors = validateOrder(payload);
      if (errors.length) return { ok: false, errors };
      const now = new Date().toISOString();
      const id = `CV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const order = {
        id,
        inmateName: payload.inmateName.trim(),
        inmateNumber: payload.inmateNumber.trim(),
        inmateDepartment: (payload.inmateDepartment || "").trim(),
        customerName: payload.customerName.trim(),
        customerEmail: payload.customerEmail.trim(),
        customerPhone: (payload.customerPhone || "").trim(),
        consent: Boolean(payload.consent),
        prisonId: payload.prisonId,
        notes: (payload.notes || "").trim(),
        productIds: [...payload.productIds],
        status: "Beställning mottagen",
        cellviaNotes: "Beställningen är mottagen. CellVia kontrollerar uppgifterna innan nästa steg.",
        createdAt: now,
        updatedAt: now
      };
      updateDb((db) => ({
        ...db,
        orders: [order, ...db.orders],
        order_items: [...order.productIds.map((productId) => ({ orderId: id, productId })), ...db.order_items],
        tracking_events: [
          { id: `${id}-event-1`, orderId: id, status: order.status, note: order.cellviaNotes, createdAt: now },
          ...db.tracking_events
        ]
      }));
      return { ok: true, order };
    },
    updateStatus(orderId, status, note = "") {
      const now = new Date().toISOString();
      updateDb((db) => ({
        ...db,
        orders: db.orders.map((order) => order.id === orderId ? {
          ...order,
          status,
          cellviaNotes: note || order.cellviaNotes,
          updatedAt: now
        } : order),
        tracking_events: [
          { id: `${orderId}-event-${Date.now()}`, orderId, status, note: note || "Status uppdaterad av CellVia.", createdAt: now },
          ...db.tracking_events
        ]
      }));
    }
  };

  const contacts = {
    all: () => list("contact_messages"),
    create(payload) {
      const errors = validateContact(payload);
      if (errors.length) return { ok: false, errors };
      const message = {
        id: `MSG-${Date.now()}`,
        name: payload.name.trim(),
        email: payload.email.trim(),
        message: payload.message.trim(),
        createdAt: new Date().toISOString(),
        status: "Ny"
      };
      updateDb((db) => ({ ...db, contact_messages: [message, ...db.contact_messages] }));
      return { ok: true, message };
    }
  };

  const tracking = {
    eventsFor: (orderId) => list("tracking_events").filter((event) => event.orderId === orderId)
  };

  const faq = { all: () => list("faq") };
  const adminNotes = {
    create(note) {
      const item = { id: `NOTE-${Date.now()}`, ...note, createdAt: new Date().toISOString() };
      updateDb((db) => ({ ...db, admin_notes: [item, ...db.admin_notes] }));
      return item;
    },
    all: () => list("admin_notes")
  };

  window.CellViaRepository = {
    readDb,
    writeDb,
    updateDb,
    prisons,
    products,
    packages: packagesRepo,
    orders,
    contacts,
    tracking,
    faq,
    adminNotes
  };
})();
