(() => {
  const { setHtml } = window.CellViaDom;
  const repo = () => window.CellViaRepository;

  function mount() {
    const pricing = window.CellViaPackageWorkflow.pricing;
    setHtml("#packages-grid", repo().packages.all().map((pack) => window.CellViaPackageCard.packageCard(pack, repo(), pricing)).join("") + `
      <article class="data-card custom">
        <div class="data-card-body">
          <h3>Skapa eget paket</h3>
          <p>Välj anstalt först och bygg ett paket utifrån produkter som passar bättre för vald anstalt.</p>
          <a class="button small" href="skapa-paket.html">Skapa eget paket</a>
        </div>
      </article>
    `);
  }

  window.CellViaPackagesPage = { mount };
})();
