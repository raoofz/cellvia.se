(() => {
  const routes = {
    products: () => window.CellViaProductsPage.mountList(),
    "product-detail": () => window.CellViaProductsPage.mountDetail(),
    prisons: () => window.CellViaPrisonsPage.mountList(),
    "prison-detail": () => window.CellViaPrisonsPage.mountDetail(),
    packages: () => window.CellViaPackagesPage.mount(),
    create: () => {
      if (document.querySelector("#create-order-form")) window.CellViaPackageWorkflow.mount();
    },
    track: () => window.CellViaTrackingPage.mount(),
    help: () => {
      if (document.querySelector("#faq-list")) window.CellViaFaqPage.mount();
    },
    contact: () => window.CellViaContactForm.mount(),
    admin: () => window.CellViaAdminPage.mount()
  };

  window.CellViaLayout.mount();
  const page = document.body.dataset.page;
  if (routes[page]) routes[page]();
})();
