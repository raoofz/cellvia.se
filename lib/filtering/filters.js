(() => {
  const { includesText } = window.CellViaSearch;

  function filterProducts(products, { query = "", category = "", prisonId = "" }, compatibility) {
    return products.filter((product) => {
      const matchesText = includesText(product, query, ["name", "description", "category"]);
      const matchesCategory = !category || product.category === category;
      const matchesPrison = !prisonId || compatibility.productsForPrison(prisonId, { includeHidden: true }).some((item) => item.product.id === product.id && !item.hiddenByDefault);
      return matchesText && matchesCategory && matchesPrison;
    });
  }

  function filterPrisons(prisons, { query = "", city = "", level = "" }) {
    return prisons.filter((prison) => {
      const matchesText = includesText(prison, query, ["name", "city", "generalNotes", "packagingNotes"]);
      return matchesText && (!city || prison.city === city) && (!level || prison.securityLevel === level);
    });
  }

  window.CellViaFilters = { filterProducts, filterPrisons };
})();
