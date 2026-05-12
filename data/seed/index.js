(() => {
const legalNotice = "Slutlig kontroll och beslut görs alltid av anstalten.";

const categories = [
  "Hygien",
  "Kläder & textil",
  "Skriv & papper",
  "Böcker",
  "Elektronik",
  "Hörlurar",
  "CD-spelare",
  "Batterier",
  "Mat & dryck",
  "Övrigt"
];

const prisons = [
  {
    id: "saltvik",
    name: "Anstalten Saltvik",
    city: "Härnösand",
    type: "Anstalt",
    securityLevel: "Hög",
    generalNotes: "Kontrollera alltid aktuell information innan paketet skickas. Produkter med elektronik eller försegling kräver extra försiktighet.",
    packagingNotes: "Tydlig märkning, obruten originalförpackning där det är möjligt och inga lösa batterier.",
    allowedCategories: ["Hygien", "Kläder & textil", "Skriv & papper", "Böcker"],
    restrictedCategories: ["Elektronik", "Hörlurar", "CD-spelare", "Batterier", "Mat & dryck"],
    recommendedProducts: ["mild-tvål", "brev-kit", "bomullsstrumpor", "pocketbok"],
    riskyProducts: ["trådlösa hörlurar", "lösa batterier", "glasförpackning"],
    ruleUpdates: [
      { date: "2026-04-18", title: "Extra kontroll av elektronik", body: "Elektronik bör granskas manuellt före beställning." }
    ],
    lastUpdated: "2026-04-18"
  },
  {
    id: "kumla",
    name: "Anstalten Kumla",
    city: "Kumla",
    type: "Anstalt",
    securityLevel: "Hög",
    generalNotes: "Välj enkla produkter med tydlig innehållsförteckning. Undvik produkter med metall, vätskor i stora volymer eller oklar förpackning.",
    packagingNotes: "Packa kompakt, separera produktgrupper och dokumentera innehållet internt.",
    allowedCategories: ["Hygien", "Skriv & papper", "Böcker"],
    restrictedCategories: ["Elektronik", "Hörlurar", "CD-spelare", "Batterier", "Mat & dryck", "Kläder & textil"],
    recommendedProducts: ["tandkräm", "brev-kit", "pocketbok"],
    riskyProducts: ["schampo stor flaska", "kläder med dragkedja", "elektronik"],
    ruleUpdates: [
      { date: "2026-03-28", title: "Textil behöver extra kontroll", body: "Kläder och textil hanteras med försiktighet och bör kontrolleras före köp." }
    ],
    lastUpdated: "2026-03-28"
  },
  {
    id: "hall",
    name: "Anstalten Hall",
    city: "Södertälje",
    type: "Anstalt",
    securityLevel: "Hög",
    generalNotes: "Prioritera basprodukter och tydlig dokumentation. Produkter som kan misstolkas bör bytas mot enklare alternativ.",
    packagingNotes: "Undvik blandade smådelar i samma påse. Märk paketet tydligt i orderunderlaget.",
    allowedCategories: ["Hygien", "Skriv & papper", "Böcker", "Kläder & textil"],
    restrictedCategories: ["Elektronik", "Hörlurar", "CD-spelare", "Batterier", "Mat & dryck"],
    recommendedProducts: ["bomullsstrumpor", "brev-kit", "mild-tvål"],
    riskyProducts: ["hörlurar", "batterier", "parfymerade produkter"],
    ruleUpdates: [
      { date: "2026-02-14", title: "Doftstarka produkter", body: "Välj milda produkter framför starkt parfymerade alternativ." }
    ],
    lastUpdated: "2026-02-14"
  },
  {
    id: "hinseberg",
    name: "Anstalten Hinseberg",
    city: "Frövi",
    type: "Anstalt",
    securityLevel: "Medel",
    generalNotes: "Basprodukter fungerar oftast bäst. Kontrollera storlek, material och förpackning innan beställning.",
    packagingNotes: "Packa varje produktgrupp tydligt och undvik extra ytteremballage.",
    allowedCategories: ["Hygien", "Kläder & textil", "Skriv & papper", "Böcker"],
    restrictedCategories: ["Elektronik", "Batterier", "Mat & dryck"],
    recommendedProducts: ["hygien-bas", "komfort-kit", "pocketbok"],
    riskyProducts: ["lösa batterier", "okända kosttillskott", "glas"],
    ruleUpdates: [
      { date: "2026-01-20", title: "Förpackning", body: "Produkter bör vara lätta att kontrollera utan onödig ytterförpackning." }
    ],
    lastUpdated: "2026-01-20"
  }
];

const products = [
  {
    id: "mild-tval",
    name: "Mild tvål",
    category: "Hygien",
    price: 39,
    image: "assets/images/process-products.jpg",
    description: "En enkel mild tvål med tydlig innehållsförteckning.",
    compatibilityStatus: "Vanligt lämplig",
    compatiblePrisons: ["saltvik", "kumla", "hall", "hinseberg"],
    warningNotes: ["Undvik stark parfym."],
    saferAlternative: "Oparfymerad hygienprodukt",
    requiresManualReview: false,
    stockStatus: "I lager"
  },
  {
    id: "tandkram",
    name: "Tandkräm",
    category: "Hygien",
    price: 34,
    image: "assets/images/process-products.jpg",
    description: "Standardtandkräm i mindre tub med tydlig märkning.",
    compatibilityStatus: "Vanligt lämplig",
    compatiblePrisons: ["saltvik", "kumla", "hall", "hinseberg"],
    warningNotes: ["Välj mindre förpackning."],
    saferAlternative: "Mindre tub utan specialfunktioner",
    requiresManualReview: false,
    stockStatus: "I lager"
  },
  {
    id: "brev-kit",
    name: "Brev & kontakt-kit",
    category: "Skriv & papper",
    price: 89,
    image: "assets/images/documented-packing.jpg",
    description: "Papper och kuvert för vardagskontakt.",
    compatibilityStatus: "Vanligt lämplig",
    compatiblePrisons: ["saltvik", "kumla", "hall", "hinseberg"],
    warningNotes: ["Frimärken kan hanteras olika."],
    saferAlternative: "Papper och kuvert utan extra tillbehör",
    requiresManualReview: false,
    stockStatus: "I lager"
  },
  {
    id: "bomullsstrumpor",
    name: "Bomullsstrumpor",
    category: "Kläder & textil",
    price: 79,
    image: "assets/images/cellvia-worker.jpg",
    description: "Enkla strumpor utan dragkedja, metall eller lösa detaljer.",
    compatibilityStatus: "Kräver kontroll",
    compatiblePrisons: ["saltvik", "hall", "hinseberg"],
    warningNotes: ["Textil kan behöva extra kontroll på vissa anstalter."],
    saferAlternative: "Enkla vita bomullsstrumpor",
    requiresManualReview: true,
    stockStatus: "I lager"
  },
  {
    id: "pocketbok",
    name: "Pocketbok",
    category: "Böcker",
    price: 119,
    image: "assets/images/process-sealed-package.jpg",
    description: "En pocketbok med enkelt format.",
    compatibilityStatus: "Kräver kontroll",
    compatiblePrisons: ["saltvik", "kumla", "hall", "hinseberg"],
    warningNotes: ["Titel och innehåll kan behöva bedömas."],
    saferAlternative: "Neutral fackbok eller roman i pocketformat",
    requiresManualReview: true,
    stockStatus: "Begränsat lager"
  },
  {
    id: "cd-spelare-enkel",
    name: "Enkel CD-spelare",
    category: "CD-spelare",
    price: 349,
    image: "assets/images/process-sealed-package.jpg",
    description: "Elektronisk produkt som alltid bör kontrolleras manuellt före köp.",
    compatibilityStatus: "Begränsad",
    compatiblePrisons: [],
    warningNotes: ["Elektronik är känsligt och varierar kraftigt mellan anstalter."],
    saferAlternative: "Bok eller skrivmaterial",
    requiresManualReview: true,
    stockStatus: "Begränsat lager"
  },
  {
    id: "tradlosa-horlurar",
    name: "Trådlösa hörlurar",
    category: "Hörlurar",
    price: 299,
    image: "assets/images/process-products.jpg",
    description: "Trådlösa produkter är ofta riskabla i anstaltsmiljö.",
    compatibilityStatus: "Ej rekommenderad",
    compatiblePrisons: [],
    warningNotes: ["Trådlös elektronik och batterier kan leda till avslag."],
    saferAlternative: "Välj icke-elektroniska produkter.",
    requiresManualReview: true,
    stockStatus: "Tillfälligt slut"
  },
  {
    id: "batterier-aa",
    name: "AA-batterier",
    category: "Batterier",
    price: 49,
    image: "assets/images/documented-packing.jpg",
    description: "Lösa batterier bör undvikas om inte anstalten uttryckligen tillåter dem.",
    compatibilityStatus: "Ej rekommenderad",
    compatiblePrisons: [],
    warningNotes: ["Lösa batterier är markerade som riskprodukt i flera testposter."],
    saferAlternative: "Produkt utan batteribehov",
    requiresManualReview: true,
    stockStatus: "I lager"
  }
];

const packages = [
  {
    id: "bas-hygien",
    name: "Bas Hygien",
    description: "Ett lugnt baspaket med hygienprodukter som ofta är enklare att kontrollera.",
    productIds: ["mild-tval", "tandkram"],
    compatiblePrisons: ["saltvik", "kumla", "hall", "hinseberg"],
    notes: ["Välj milda produkter och mindre förpackningar."],
    serviceFee: 79
  },
  {
    id: "brev-kontakt",
    name: "Brev & Kontakt",
    description: "För brev, studier och vardagskontakt.",
    productIds: ["brev-kit", "pocketbok"],
    compatiblePrisons: ["saltvik", "kumla", "hall", "hinseberg"],
    notes: ["Böcker kan behöva manuell kontroll."],
    serviceFee: 89
  },
  {
    id: "komfort",
    name: "Komfort",
    description: "Varsamt utvalda basprodukter med fokus på enkel kontroll.",
    productIds: ["mild-tval", "bomullsstrumpor", "brev-kit"],
    compatiblePrisons: ["saltvik", "hall", "hinseberg"],
    notes: ["Textil kontrolleras extra innan ordern skickas vidare."],
    serviceFee: 99
  },
  {
    id: "elektronik-kontroll",
    name: "Elektronik Kontroll",
    description: "Enbart för förfrågan och manuell bedömning. Rekommenderas inte utan tydlig kontroll.",
    productIds: ["cd-spelare-enkel"],
    compatiblePrisons: [],
    notes: ["Elektronik kräver alltid manuell kontroll och kan nekas av anstalten."],
    serviceFee: 129
  }
];

const trackingStatuses = [
  "Beställning mottagen",
  "Produkter kontrolleras",
  "Paket förbereds",
  "Paket skickat",
  "Levererat till anstalt",
  "Väntar på anstaltens interna kontroll"
];

const faq = [
  { question: "Kan CellVia garantera att ett paket godkänns?", answer: "Nej. Slutlig kontroll och beslut görs alltid av anstalten." },
  { question: "Köper CellVia produkterna?", answer: "Ja, i normalflödet köper CellVia in produkterna, kontrollerar dem, packar dem och skickar paketet vidare." },
  { question: "Varför visas vissa produkter som riskabla?", answer: "Vissa kategorier kan vara känsliga, till exempel elektronik, batterier eller produkter med oklar förpackning." },
  { question: "Kan jag skapa ett eget paket?", answer: "Ja. Välj anstalt först, fyll i uppgifter och lägg till produkter som passar bättre för vald anstalt." }
];

const sampleOrders = [
  {
    id: "CV-2026-1001",
    inmateName: "Exempelperson",
    inmateNumber: "A12345",
    prisonId: "saltvik",
    notes: "Testorder för spårningsvyn.",
    productIds: ["mild-tval", "brev-kit"],
    status: "Paket förbereds",
    cellviaNotes: "Produkterna är kontrollerade och paketet förbereds.",
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-05-12T12:30:00.000Z"
  }
];

window.CellViaSeed = {
  legalNotice,
  categories,
  prisons,
  products,
  packages,
  trackingStatuses,
  faq,
  sampleOrders
};
})();
