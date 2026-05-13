(() => {
  const seed = window.CellViaSeed;

  const categoryDefinitions = [
    { id: "hygien", name: "Hygien", icon: "H", image: "assets/images/products/hygien.svg", match: /hygien|vard|vård|tval|tvål|tand|schampo|rak|kam|borste/i, description: "Milda produkter för personlig vård.", note: "Milda produkter med tydlig märkning och enkel förpackning." },
    { id: "skrivmaterial", name: "Skrivmaterial", icon: "S", image: "assets/images/products/skrivmaterial.svg", match: /skriv|brev|papper|penna|block|vykort|dokument/i, description: "Brev, block, pennor och dokument.", note: "Papper och skrivprodukter kan vara enklare att kontrollera." },
    { id: "musik-ljud", name: "Musik & ljud", icon: "M", image: "assets/images/products/musik-ljud.svg", match: /musik|ljud|audio|hörlur|horlur|cd|skiv/i, description: "Ljud, CD och enklare lyssning.", note: "Ljudprodukter och media kräver ofta extra kontroll." },
    { id: "klader", name: "Kläder", icon: "K", image: "assets/images/products/klader.svg", match: /kläder|klader|textil|strump|t-shirt|underkl|skor|sandal|bh|tros/i, description: "Basplagg och textil med låg komplexitet.", note: "Textil behöver ofta verifieras mot lokal rutin." },
    { id: "batterier", name: "Batterier", icon: "B", image: "assets/images/products/batterier.svg", match: /batter/i, description: "Batterier och batterinära produkter.", note: "Lösa batterier bör alltid hanteras som kontrollprodukt." },
    { id: "bocker", name: "Böcker & läsning", icon: "L", image: "assets/images/products/bocker.svg", match: /bok|böcker|bocker|läs|las|tidning|prenumeration/i, description: "Böcker, tidningar och läsmaterial.", note: "Böcker och tidskrifter kan behöva innehållskontroll." },
    { id: "elektronik", name: "Elektronik med kontroll", icon: "E", image: "assets/images/products/elektronik.svg", match: /elektronik|spel|radio|laddare|klock|trimmer/i, description: "Produkter som kräver manuell verifiering.", note: "Elektronik visas som vägledning och kräver manuell verifiering." },
    { id: "forvaring", name: "Förvaring", icon: "F", image: "assets/images/products/forvaring.svg", match: /förvaring|forvaring|påse|pase|väska|vaska|fodral/i, description: "Mjuka och enkla förvaringsval.", note: "Förvaring ska vara mjuk, enkel och lätt att kontrollera." },
    { id: "anpassad", name: "Anpassade produkter", icon: "A", image: "assets/images/products/anpassad.svg", match: /kontaktlins|presentkort|anpass|muck|permission|anonym/i, description: "Särskilda produkter som kräver bedömning.", note: "Produkter som behöver särskild bedömning före nästa steg." },
    { id: "vardag", name: "Vardagstillbehör", icon: "V", image: "assets/images/products/vardag.svg", match: /.*/i, description: "Övriga enkla produkter och tillbehör.", note: "Enkla vardagsprodukter visas med försiktig kompatibilitetsinformation." }
  ];

  function categoryFor(product) {
    const text = [product.category, product.sourceCategory, product.sourceCategoryPath, product.name, product.description].filter(Boolean).join(" ");
    return categoryDefinitions.find((category) => category.match.test(text)) || categoryDefinitions[categoryDefinitions.length - 1];
  }

  function normalizeProduct(product) {
    const group = categoryFor(product);
    const image = !product.image || /assets\/images\/(process|cellvia-worker|documented-packing)/.test(product.image) ? group.image : product.image;
    return {
      ...product,
      catalogCategory: group.name,
      catalogCategoryId: group.id,
      catalogCategoryIcon: group.icon,
      catalogCategoryNote: group.note,
      fallbackImage: group.image,
      image,
      stockStatus: product.stockStatus || product.availability || "Kontrolleras",
      availability: product.stockStatus || product.availability || "Kontrolleras",
      featured: Boolean(product.featured || (product.packageTags || []).includes("Startpaket")),
      riskLevel: product.riskLevel || (product.requiresManualReview ? "manual-review" : "low"),
      warningNotes: product.warningNotes || [],
      compatiblePrisons: product.compatiblePrisons || [],
      packageTags: product.packageTags || [],
      requiresManualReview: Boolean(product.requiresManualReview),
      checkedByCellVia: Boolean(product.checkedByCellVia)
    };
  }

  function normalizePackage(pack) {
    const imageMap = {
      startpaket: "assets/images/packages/startpaket.svg",
      hygienpaket: "assets/images/packages/hygienpaket.svg",
      basvardagspaket: "assets/images/packages/basvardagspaket.svg",
      skrivpaket: "assets/images/packages/skrivpaket.svg",
      musikpaket: "assets/images/packages/musikpaket.svg",
      kladpaket: "assets/images/packages/kladpaket.svg",
      langvistelsepaket: "assets/images/packages/langvistelsepaket.svg",
      "anpassat-paket": "assets/images/packages/anpassat-paket.svg"
    };
    return {
      ...pack,
      image: imageMap[pack.id] || pack.image || "assets/images/packages/anpassat-paket.svg",
      status: pack.compatibilityLevel || "Kräver kontroll",
      contains: [...pack.productIds],
      productCount: pack.productIds.length,
      servicePriceFrom: pack.serviceFee,
      ctaLabel: "Välj paket",
      detailLabel: "Visa innehåll",
      riskLevel: /begränsad|kontroll/i.test(pack.compatibilityLevel || "") ? "manual-review" : "low",
      featured: Boolean(pack.popular || pack.firstDelivery)
    };
  }

  function normalizePrison(prison) {
    const level = String(prison.securityLevel || "").toLowerCase();
    const isRemand = /häkte|hakte/i.test(`${prison.type} ${prison.name}`);
    const image = isRemand ? "assets/images/prisons/hakte.svg"
      : level.includes("1") || level.includes("hög") || level.includes("hog") ? "assets/images/prisons/klass-1.svg"
        : level.includes("2") || level.includes("medel") ? "assets/images/prisons/klass-2.svg"
          : level.includes("3") || level.includes("låg") || level.includes("lag") ? "assets/images/prisons/klass-3.svg"
            : "assets/images/prisons/klass-2.svg";
    return {
      ...prison,
      image,
      securityClassLabel: prison.securityLevel ? `Säkerhetsklass ${prison.securityLevel}` : "Klass behöver verifieras",
      shortDescription: `${prison.city} · ${prison.type}. Information visas som vägledning och ska verifieras före leverans.`,
      compatibilityNote: prison.compatibilityGuidance || window.CellViaSeed.complianceNotice,
      detailUrl: `anstalt.html?id=${prison.id}`,
      status: prison.securityLevel ? "Kontroll krävs" : "Klass behöver verifieras"
    };
  }

  function initialState() {
    const orders = structuredClone(seed.sampleOrders);
    const importedProducts = structuredClone(window.CellViaChance2Buy?.products || []);
    const products = [...structuredClone(seed.products), ...importedProducts].map(normalizeProduct);
    const prisons = structuredClone(seed.prisons).map(normalizePrison);
    const packages = structuredClone(seed.packages).map(normalizePackage);
    return {
      users: [],
      orders,
      order_items: orders.flatMap((order) => order.productIds.map((productId) => ({ orderId: order.id, productId }))),
      products,
      prisons,
      packages,
      package_items: packages.flatMap((pack) => pack.productIds.map((productId) => ({ packageId: pack.id, productId }))),
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

  window.CellViaSchema = { initialState, categoryDefinitions };
})();
