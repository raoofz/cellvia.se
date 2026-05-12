(() => {
  function validateOrder(payload) {
    const errors = [];
    if (!payload.inmateName || payload.inmateName.trim().length < 2) errors.push("Ange namn på den intagne.");
    if (!payload.inmateNumber || payload.inmateNumber.trim().length < 2) errors.push("Ange nummer eller referens för den intagne.");
    if (!payload.prisonId) errors.push("Välj anstalt.");
    if (!payload.productIds || payload.productIds.length === 0) errors.push("Lägg till minst en produkt i paketet.");
    return errors;
  }

  function validateContact(payload) {
    const errors = [];
    if (!payload.name || payload.name.trim().length < 2) errors.push("Ange ditt namn.");
    if (!payload.email || !payload.email.includes("@")) errors.push("Ange en giltig e-postadress.");
    if (!payload.message || payload.message.trim().length < 10) errors.push("Skriv ett meddelande med minst 10 tecken.");
    return errors;
  }

  window.CellViaUtils = { validateOrder, validateContact };
})();
