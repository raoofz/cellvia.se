(() => {
  const repo = () => window.CellViaRepository;

  const scoreByStatus = {
    "Vanligt lämplig": 100,
    "Kräver kontroll": 70,
    "Begränsad": 35,
    "Ej rekommenderad": 0
  };

  function evaluateProductForPrison(product, prison) {
    if (!prison) {
      return {
        product,
        status: product.compatibilityStatus,
        score: scoreByStatus[product.compatibilityStatus] ?? 50,
        isCompatible: product.compatiblePrisons.length > 0,
        isRisky: product.compatibilityStatus === "Ej rekommenderad",
        hiddenByDefault: product.compatibilityStatus === "Ej rekommenderad",
        warnings: product.warningNotes,
        saferAlternative: product.saferAlternative,
        prisonNote: "Välj anstalt för mer exakt bedömning."
      };
    }

    const categoryAllowed = prison.allowedCategories.includes(product.category);
    const categoryRestricted = prison.restrictedCategories.includes(product.category);
    const explicitlyCompatible = product.compatiblePrisons.includes(prison.id);
    const riskyByName = prison.riskyProducts.some((item) => product.name.toLowerCase().includes(item.toLowerCase()));

    let status = product.compatibilityStatus;
    let score = scoreByStatus[status] ?? 50;
    const warnings = [...product.warningNotes];

    if (explicitlyCompatible && categoryAllowed && status === "Vanligt lämplig") {
      score = 100;
    } else if (explicitlyCompatible && categoryAllowed) {
      score = Math.max(score, 72);
    }

    if (categoryRestricted) {
      score = Math.min(score, 45);
      status = status === "Ej rekommenderad" ? status : "Begränsad";
      warnings.push(`${product.category} kräver extra försiktighet för ${prison.name}.`);
    }

    if (!explicitlyCompatible && product.requiresManualReview) {
      score = Math.min(score, 55);
      status = status === "Ej rekommenderad" ? status : "Kräver kontroll";
      warnings.push("Produkten behöver manuell kontroll för vald anstalt.");
    }

    if (!explicitlyCompatible && !product.requiresManualReview) {
      score = Math.min(score, 35);
      status = "Begränsad";
      warnings.push("Produkten är inte kopplad som lämplig för vald anstalt i nuvarande data.");
    }

    if (riskyByName || status === "Ej rekommenderad") {
      score = 0;
      status = "Ej rekommenderad";
      warnings.push("Produkten ligger nära en riskkategori för vald anstalt.");
    }

    return {
      product,
      status,
      score,
      isCompatible: score >= 70,
      isRisky: score <= 35,
      hiddenByDefault: score === 0,
      warnings: [...new Set(warnings)],
      saferAlternative: product.saferAlternative,
      prisonNote: prison.packagingNotes
    };
  }

  function productsForPrison(prisonId, options = {}) {
    const prison = repo().prisons.find(prisonId);
    return repo().products.all()
      .map((product) => evaluateProductForPrison(product, prison))
      .filter((result) => options.includeHidden || !result.hiddenByDefault);
  }

  function saferRecommendations(prisonId, productId) {
    const prison = repo().prisons.find(prisonId);
    const product = repo().products.find(productId);
    if (!product) return [];
    return repo().products.all()
      .map((candidate) => evaluateProductForPrison(candidate, prison))
      .filter((result) => result.product.id !== product.id && result.score >= 70)
      .slice(0, 3);
  }

  function packageWarnings(prisonId, productIds) {
    const prison = repo().prisons.find(prisonId);
    return productIds
      .map((id) => repo().products.find(id))
      .filter(Boolean)
      .map((product) => evaluateProductForPrison(product, prison))
      .filter((result) => result.warnings.length || result.isRisky);
  }

  window.CellViaCompatibility = {
    evaluateProductForPrison,
    productsForPrison,
    saferRecommendations,
    packageWarnings
  };
})();
