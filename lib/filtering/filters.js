(() => {
  const { includesText } = window.CellViaSearch;

  function filterProducts(products, { query = "", category = "", prisonId = "", status = "", packageTag = "" }, compatibility) {
    return products.filter((product) => {
      const matchesText = includesText(product, query, ["name", "description", "category", "usefulFor", "compatibilityNote"]);
      const matchesCategory = !category || product.category === category;
      const evaluation = prisonId ? compatibility.evaluateProductForPrison(product, window.CellViaRepository.prisons.find(prisonId)) : null;
      const matchesPrison = !prisonId || Boolean(evaluation && !evaluation.hiddenByDefault);
      const matchesStatus = !status || (evaluation ? evaluation.status : product.compatibilityStatus) === status;
      const matchesPackage = !packageTag || (product.packageTags || []).includes(packageTag);
      return matchesText && matchesCategory && matchesPrison && matchesStatus && matchesPackage;
    });
  }

  function filterPrisons(prisons, { query = "", city = "", level = "", region = "", acceptsPackages = "", electronics = "", category = "" }) {
    return prisons.filter((prison) => {
      const matchesText = includesText(prison, query, ["name", "city", "region", "generalNotes", "packagingNotes", "deliveryNotes"]);
      return matchesText
        && (!city || prison.city === city)
        && (!level || prison.securityLevel === level)
        && (!region || prison.region === region)
        && (!acceptsPackages || prison.acceptsPackages === acceptsPackages)
        && (!electronics || prison.electronicsPolicy === electronics)
        && (!category || prison.allowedCategories.includes(category) || prison.restrictedCategories.includes(category));
    });
  }

  window.CellViaFilters = { filterProducts, filterPrisons };
})();
