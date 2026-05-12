(() => {
const legalNotice = "Slutlig kontroll och beslut görs alltid av anstalten.";
const complianceNotice = "Regler kan skilja sig mellan anstalter. Kompatibilitet visas som vägledning, inte som löfte.";
const packageTrustMessage = "Alla paket packas, kontrolleras och dokumenteras av CellVia innan leverans. Detta minskar risken för fel, förenklar mottagningens kontroll och skapar en tryggare process för både familjen och anstalten.";
const limitedPublicInfo = "Offentlig information är begränsad. CellVia rekommenderar kontroll direkt med anstalten före leverans.";
const officialRuleSummary = "Kriminalvården anger att post mellan avsändare och intagen kan granskas. Tidningar och böcker är oftast tillåtna, men fängelset bör kontaktas i förväg. Mat, godis, pengar samt föremål som bedöms äventyra säkerheten eller inte kan kontrolleras eller visiteras ska inte skickas.";
const joPackageSummary = "JO har 2026 konstaterat att regleringen och den praktiska hanteringen av paket till intagna är otydlig i flera avseenden. CellVia ska därför behandla paketflödet som ett verifieringsflöde, inte som ett löfte om godkännande.";

const complianceSources = [
  {
    id: "kv-brev-paket-intagen",
    type: "Officiell Kriminalvården",
    title: "Brev och paket till intagen",
    url: "https://www.kriminalvarden.se/hakte-fangelse-och-frivard/fangelse/kontakta-och-besok-intagen/brev-och-paket-till-intagen/",
    checkedAt: "2026-05-12",
    summary: officialRuleSummary
  },
  {
    id: "kv-kontakta-intagen",
    type: "Officiell Kriminalvården",
    title: "Kontakta häktad eller intagen",
    url: "https://www.kriminalvarden.se/kontakt/kontakta-haktad-eller-intagen/",
    checkedAt: "2026-05-12",
    summary: "Kriminalvården anger att häkte eller fängelse bestämmer vilka kontakter en häktad eller intagen får ha och att brev och paket kan vara ett sätt att hålla kontakt."
  },
  {
    id: "jo-1899-2025",
    type: "JO-beslut",
    title: "Om Kriminalvårdens hantering av paket till intagna",
    url: "https://www.jo.se/besluten/om-kriminalvardens-hantering-av-paket-till-intagna/",
    checkedAt: "2026-05-12",
    summary: joPackageSummary
  },
  {
    id: "jo-7464-2019",
    type: "JO-praxis",
    title: "Paket vid utlämningsställe och krav på kännedom om innehåll",
    url: "https://www.jo.se/app/uploads/resolve_pdfs/2052726_1899-2025.pdf",
    checkedAt: "2026-05-12",
    summary: "JO hänvisar i 2026 års beslut till dnr 7464-2019 och uttalar att det inte kan krävas att intagna alltid på förhand vet vad ett paket innehåller för att få ta emot det."
  },
  {
    id: "kvfs-2011-1",
    type: "Föreskrift",
    title: "KVFS 2011:1 / FARK Fängelse",
    url: "https://lagen.nu/kvfs/2011:1",
    checkedAt: "2026-05-12",
    summary: "Föreskrifter och allmänna råd för fängelse reglerar bl.a. personliga tillhörigheter, försändelser och kontrollåtgärder. Föreskrifter är bindande, allmänna råd vägleder tillämpningen."
  }
];

const generalRules = [
  {
    id: "usually-allowed",
    title: "Ofta möjliga efter kontroll",
    status: "Kan vara tillåten",
    items: ["Tidningar", "Böcker", "Brev", "Teckningar", "Enkla dokument"],
    note: "Kriminalvården anger att tidningar och böcker oftast är tillåtna, men rekommenderar kontakt med fängelset i förväg."
  },
  {
    id: "not-send",
    title: "Ska inte skickas",
    status: "Inte tillåten",
    items: ["Mat", "Godis", "Pengar"],
    note: "Kriminalvården anger uttryckligen att mat, godis och pengar inte får skickas till intagna i fängelse."
  },
  {
    id: "security-review",
    title: "Avvisas vid säkerhetsrisk",
    status: "Kräver kontroll",
    items: ["Föremål som inte kan kontrolleras", "Föremål som inte kan visiteras", "Föremål som bedöms äventyra säkerheten"],
    note: "Det är fängelset eller häktet som gör den slutliga bedömningen."
  },
  {
    id: "jo-process",
    title: "Paketflödet är praktiskt känsligt",
    status: "Behöver verifieras",
    items: ["Förhandshemställan kan förekomma", "Utlämningsställe kan skapa praktiska problem", "Innehåll kan kvarhållas eller omhändertas enligt förutsättningar"],
    note: "JO har pekat på otydlig reglering och praktiska problem. CellVia bör därför dokumentera, kontrollera och kommunicera försiktigt."
  }
];

const categories = [
  "Färdiga paket",
  "Hygien & personlig vård",
  "Kläder & basplagg",
  "Böcker & skrivmaterial",
  "Musik & ljud",
  "CD-spelare & enklare elektronik",
  "Hörlurar",
  "Batterier",
  "Tillbehör",
  "Brev & dokument",
  "Tillåtna vardagsprodukter",
  "Produkter som kräver extra kontroll"
];

const productCategories = [
  { id: "fardiga-paket", name: "Färdiga paket", icon: "▦", description: "Samlade paketförslag för familjer som vill börja med ett enkelt och tydligt val.", note: "Paket behöver alltid verifieras mot vald anstalt." },
  { id: "hygien", name: "Hygien & personlig vård", icon: "✓", description: "Milda basprodukter med tydlig innehållsförteckning och enkel förpackning.", note: "Doft, volym och förpackning kan påverka bedömningen." },
  { id: "klader", name: "Kläder & basplagg", icon: "□", description: "Enkla textilier utan metall, snören eller lösa detaljer.", note: "Textil kontrolleras ofta mer noggrant och kan variera lokalt." },
  { id: "bocker", name: "Böcker & skrivmaterial", icon: "▤", description: "Pocketböcker, papper och enkla skrivprodukter för kontakt och vardag.", note: "Titel, innehåll och tillbehör kan behöva kontrolleras." },
  { id: "musik", name: "Musik & ljud", icon: "♪", description: "Ljudrelaterade produkter visas med extra försiktighet och tydliga varningar.", note: "Elektronik och lagringsmedia kräver vanligtvis extra kontroll." },
  { id: "elektronik", name: "CD-spelare & enklare elektronik", icon: "◌", description: "Enbart produkter som kan hanteras genom manuell kontroll och dokumentation.", note: "Elektronik ska inte väljas utan verifiering före leverans." },
  { id: "horlurar", name: "Hörlurar", icon: "⌁", description: "Enkla modeller prioriteras framför trådlösa eller batteridrivna alternativ.", note: "Trådlös funktion och batterier ökar risken för avslag." },
  { id: "batterier", name: "Batterier", icon: "−", description: "Batterier visas främst som riskkategori för att undvika felval.", note: "Lösa batterier bör inte skickas utan uttrycklig kontroll." },
  { id: "tillbehor", name: "Tillbehör", icon: "+", description: "Små vardagstillbehör med enkel funktion och tydlig användning.", note: "Smådelar och metall behöver särskild försiktighet." },
  { id: "brev", name: "Brev & dokument", icon: "✉", description: "Papper, kuvert och dokumentrelaterade produkter för kontakt.", note: "Frimärken och extra tillbehör kan hanteras olika." },
  { id: "vardag", name: "Tillåtna vardagsprodukter", icon: "•", description: "Lugna basprodukter som ofta är enklare att kontrollera.", note: "Alla val ska ändå kontrolleras mot aktuell anstalt." },
  { id: "extra-kontroll", name: "Produkter som kräver extra kontroll", icon: "!", description: "Produkter som kan vara användbara men där regler ofta varierar.", note: "CellVia markerar dessa tydligt innan paketet skickas vidare." }
];

const sourceBase = "https://www.kriminalvarden.se/kontakt/hitta-och-kontakta/verksamhet/anstalt/";
function source(slug) {
  return `${sourceBase}${slug}/`;
}

const highSecurity = new Set(["hall", "kumla", "hallby", "norrtalje", "salberga", "saltvik", "tidaholm"]);
const mediumKnown = new Set(["hinseberg", "ystad", "osteraker", "skanninge", "viskan", "mariefred", "vastervik-norra", "boras"]);

const prisonNames = [
  ["asptuna", "Anstalten Asptuna", "Botkyrka", "Stockholm"],
  ["beateberg", "Anstalten Beateberg", "Trångsund", "Stockholm"],
  ["boras", "Anstalten Borås", "Borås", "Väst"],
  ["brinkeberg", "Anstalten Brinkeberg", "Vänersborg", "Väst"],
  ["faringso", "Anstalten Färingsö", "Färingsö", "Stockholm"],
  ["fosie", "Anstalten Fosie", "Malmö", "Syd"],
  ["gruvberget", "Anstalten Gruvberget", "Bollnäs", "Mitt"],
  ["gavle", "Anstalten Gävle", "Gävle", "Mitt"],
  ["hall", "Anstalten Hall", "Södertälje", "Stockholm"],
  ["halmstad", "Anstalten Halmstad", "Halmstad", "Väst"],
  ["helsingborg", "Anstalten Helsingborg", "Helsingborg", "Syd"],
  ["hinseberg", "Anstalten Hinseberg", "Frövi", "Mitt"],
  ["hallby", "Anstalten Hällby", "Eskilstuna", "Mitt"],
  ["hogsbo", "Anstalten Högsbo", "Göteborg", "Väst"],
  ["johannesberg", "Anstalten Johannesberg", "Mariestad", "Väst"],
  ["kalmar", "Anstalten Kalmar", "Kalmar", "Öst"],
  ["karlskoga", "Anstalten Karlskoga", "Karlskoga", "Mitt"],
  ["kristianstad", "Anstalten Kristianstad", "Kristianstad", "Syd"],
  ["kumla", "Anstalten Kumla", "Kumla", "Mitt"],
  ["ljustadalen", "Anstalten Ljustadalen", "Sundsvall", "Nord"],
  ["lulea", "Anstalten Luleå", "Luleå", "Nord"],
  ["mariefred", "Anstalten Mariefred", "Mariefred", "Mitt"],
  ["norrtalje", "Anstalten Norrtälje", "Norrtälje", "Stockholm"],
  ["nykoping", "Anstalten Nyköping", "Nyköping", "Öst"],
  ["ringsjon", "Anstalten Ringsjön", "Höör", "Syd"],
  ["rodjan", "Anstalten Rödjan", "Mariestad", "Väst"],
  ["salberga", "Anstalten Salberga", "Sala", "Mitt"],
  ["sagsjon", "Anstalten Sagsjön", "Lindome", "Väst"],
  ["saltvik", "Anstalten Saltvik", "Härnösand", "Nord"],
  ["skenas", "Anstalten Skenäs", "Vikbolandet", "Öst"],
  ["skanninge", "Anstalten Skänninge", "Skänninge", "Öst"],
  ["storboda", "Anstalten Storboda", "Rosersberg", "Stockholm"],
  ["svartsjo", "Anstalten Svartsjö", "Svartsjö", "Stockholm"],
  ["sorbyn", "Anstalten Sörbyn", "Umeå", "Nord"],
  ["tidaholm", "Anstalten Tidaholm", "Tidaholm", "Väst"],
  ["tillberga", "Anstalten Tillberga", "Västerås", "Mitt"],
  ["tygelsjo", "Anstalten Tygelsjö", "Tygelsjö", "Syd"],
  ["vastervik-norra", "Anstalten Västervik Norra", "Västervik", "Öst"],
  ["viskan", "Anstalten Viskan", "Ånge", "Nord"],
  ["ystad", "Anstalten Ystad", "Ystad", "Syd"],
  ["osteraker", "Anstalten Österåker", "Åkersberga", "Stockholm"]
];

function securityLevel(id) {
  if (highSecurity.has(id)) return "Klass 1";
  if (mediumKnown.has(id)) return "Klass 2";
  return "Behöver verifieras";
}

function prisonRecord([id, name, city, region]) {
  const high = highSecurity.has(id);
  const allowed = high
    ? ["Hygien & personlig vård", "Böcker & skrivmaterial", "Brev & dokument"]
    : ["Hygien & personlig vård", "Kläder & basplagg", "Böcker & skrivmaterial", "Brev & dokument", "Tillåtna vardagsprodukter"];
  const restricted = high
    ? ["Kläder & basplagg", "Musik & ljud", "CD-spelare & enklare elektronik", "Hörlurar", "Batterier", "Produkter som kräver extra kontroll"]
    : ["Musik & ljud", "CD-spelare & enklare elektronik", "Hörlurar", "Batterier", "Produkter som kräver extra kontroll"];
  return {
    id,
    name,
    city,
    region,
    type: "Anstalt",
    securityLevel: securityLevel(id),
    acceptsPackages: "requires-verification",
    electronicsPolicy: "restricted",
    generalNotes: `${limitedPublicInfo} Regler kan variera beroende på avdelning, säkerhetsbedömning och mottagningens aktuella rutiner.`,
    packagingNotes: "CellVia bör packa kompakt, separera produktgrupper, dokumentera innehållet internt och undvika otydliga eller öppnade förpackningar.",
    deliveryNotes: "Kontrollera aktuell mottagningsadress och instruktioner via Kriminalvården innan leverans.",
    mailNotes: "Brev och dokument bör hållas enkla. Extra bilagor, frimärken och tillbehör kan behöva kontrolleras.",
    electronicsNotes: "Elektronik, hörlurar, lagringsmedia och batterier kräver särskild verifiering före köp eller leverans.",
    clothingNotes: "Kläder bör vara enkla basplagg utan metall, snören, hårda detaljer eller otydlig märkning.",
    hygieneNotes: "Välj milda produkter, små eller rimliga volymer och tydlig innehållsförteckning.",
    packageNotes: packageTrustMessage,
    compatibilityGuidance: "Börja med anstalt, välj därefter produkter med låg risk och låt CellVia kontrollera innehållet före leverans.",
    allowedCategories: allowed,
    restrictedCategories: restricted,
    recommendedProducts: ["mild-tval", "tandkram", "brev-kit", "pocketbok", "skrivblock"],
    riskyProducts: ["trådlösa hörlurar", "lösa batterier", "glasförpackning", "elektronik", "stark parfym"],
    officialSource: source(id),
    sourceLabel: "Kriminalvården - hitta och kontakta anstalt",
    centralRuleSummary: officialRuleSummary,
    joGuidance: joPackageSummary,
    ruleBasis: ["kv-brev-paket-intagen", "jo-1899-2025", "kvfs-2011-1"],
    ruleUpdates: [
      { date: "2026-05-12", title: "Offentlig information kontrollerad", body: limitedPublicInfo }
    ],
    lastUpdated: "2026-05-12"
  };
}

const prisons = prisonNames.map(prisonRecord);

const products = [
  {
    id: "mild-tval",
    name: "Mild tvål",
    category: "Hygien & personlig vård",
    packageTags: ["Hygienpaket", "Startpaket"],
    price: 39,
    image: "assets/images/process-products.jpg",
    description: "En mild basprodukt med tydlig innehållsförteckning och enkel användning.",
    usefulFor: "Kan vara praktisk vid både kortare och längre vistelser när hygienprodukter behöver vara lätta att kontrollera.",
    compatibilityStatus: "Vanligt lämplig",
    compatibilityNote: "Kan vara tillåten när innehåll, doft och förpackning är tydliga. Regler kan variera.",
    compatiblePrisons: prisons.map((prison) => prison.id),
    warningNotes: ["Undvik stark parfym och otydlig innehållsförteckning."],
    saferAlternative: "Oparfymerad hygienprodukt med enkel förpackning",
    requiresManualReview: false,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "tandkram",
    name: "Tandkräm liten tub",
    category: "Hygien & personlig vård",
    packageTags: ["Hygienpaket", "Startpaket"],
    price: 34,
    image: "assets/images/process-products.jpg",
    description: "Standardtandkräm i mindre tub med tydlig märkning.",
    usefulFor: "Ett enkelt vardagsval som ofta är lättare att dokumentera än större specialprodukter.",
    compatibilityStatus: "Vanligt lämplig",
    compatibilityNote: "Behöver kontrolleras mot aktuell anstalts regler före leverans.",
    compatiblePrisons: prisons.map((prison) => prison.id),
    warningNotes: ["Välj mindre tub utan specialfunktioner."],
    saferAlternative: "Mindre tub utan extra tillbehör",
    requiresManualReview: false,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "schampo-milt",
    name: "Milt schampo",
    category: "Hygien & personlig vård",
    packageTags: ["Hygienpaket", "Långvistelsepaket"],
    price: 59,
    image: "assets/images/process-products.jpg",
    description: "Ett enkelt schampo i kontrollerbar förpackning.",
    usefulFor: "Kan vara användbart vid längre vistelser när produkten är tydligt märkt.",
    compatibilityStatus: "Kräver kontroll",
    compatibilityNote: "Volym, doft och förpackning behöver verifieras.",
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    warningNotes: ["Större flaskor och stark doft kan skapa oklarheter."],
    saferAlternative: "Mindre oparfymerad hygienprodukt",
    requiresManualReview: true,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "brev-kit",
    name: "Brev & kontakt-kit",
    category: "Brev & dokument",
    packageTags: ["Skrivpaket", "Startpaket"],
    price: 89,
    image: "assets/images/documented-packing.jpg",
    description: "Papper och kuvert för vardagskontakt.",
    usefulFor: "Gör det enklare att hålla kontakt utan tekniska produkter.",
    compatibilityStatus: "Vanligt lämplig",
    compatibilityNote: "Kan vara tillåten men frimärken och extra tillbehör kan hanteras olika.",
    compatiblePrisons: prisons.map((prison) => prison.id),
    warningNotes: ["Frimärken och extra bilagor kan kräva kontroll."],
    saferAlternative: "Papper och kuvert utan extra tillbehör",
    requiresManualReview: false,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "skrivblock",
    name: "Skrivblock enkelt",
    category: "Böcker & skrivmaterial",
    packageTags: ["Skrivpaket"],
    price: 45,
    image: "assets/images/documented-packing.jpg",
    description: "Ett enkelt skrivblock utan spiral eller hårda detaljer.",
    usefulFor: "Passar för brev, studier och anteckningar när materialet är enkelt att kontrollera.",
    compatibilityStatus: "Vanligt lämplig",
    compatibilityNote: "Kan vara lämpligt när blocket saknar metallspiral och extra fickor.",
    compatiblePrisons: prisons.map((prison) => prison.id),
    warningNotes: ["Undvik metallspiral och lösa plastfickor."],
    saferAlternative: "Limblock utan metall",
    requiresManualReview: false,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "kulspetspenna",
    name: "Enkel kulspetspenna",
    category: "Böcker & skrivmaterial",
    packageTags: ["Skrivpaket"],
    price: 19,
    image: "assets/images/documented-packing.jpg",
    description: "En enkel penna utan extra funktioner.",
    usefulFor: "Kan vara praktisk tillsammans med brev- och dokumentmaterial.",
    compatibilityStatus: "Kräver kontroll",
    compatibilityNote: "Pennor kan hanteras olika och bör verifieras före leverans.",
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    warningNotes: ["Välj enkel modell utan metall eller dolda delar."],
    saferAlternative: "Skrivblock och kuvert utan penna",
    requiresManualReview: true,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "pocketbok",
    name: "Pocketbok",
    category: "Böcker & skrivmaterial",
    packageTags: ["Skrivpaket", "Långvistelsepaket"],
    price: 119,
    image: "assets/images/process-sealed-package.jpg",
    description: "En pocketbok med enkelt format.",
    usefulFor: "Kan ge struktur och sysselsättning vid längre vistelser.",
    compatibilityStatus: "Kräver kontroll",
    compatibilityNote: "Titel, innehåll och skick behöver kontrolleras mot aktuell anstalts rutiner.",
    compatiblePrisons: prisons.map((prison) => prison.id),
    warningNotes: ["Titel och innehåll kan behöva bedömas."],
    saferAlternative: "Neutral fackbok eller roman i pocketformat",
    requiresManualReview: true,
    stockStatus: "Begränsat lager",
    checkedByCellVia: true
  },
  {
    id: "bomullsstrumpor",
    name: "Bomullsstrumpor",
    category: "Kläder & basplagg",
    packageTags: ["Klädpaket", "Basvardagspaket"],
    price: 79,
    image: "assets/images/cellvia-worker.jpg",
    description: "Enkla strumpor utan dragkedja, metall eller lösa detaljer.",
    usefulFor: "Ett basplagg som kan vara relevant vid längre vistelser.",
    compatibilityStatus: "Kräver kontroll",
    compatibilityNote: "Textil behöver ofta kontrolleras extra, särskilt vid högre säkerhetsnivå.",
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    warningNotes: ["Textil kan behöva extra kontroll på vissa anstalter."],
    saferAlternative: "Enkla vita bomullsstrumpor utan detaljer",
    requiresManualReview: true,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "tshirt-bas",
    name: "Bas T-shirt",
    category: "Kläder & basplagg",
    packageTags: ["Klädpaket"],
    price: 129,
    image: "assets/images/cellvia-worker.jpg",
    description: "Enkel enfärgad T-shirt utan tryck, metall eller extra detaljer.",
    usefulFor: "Kan passa som basplagg om anstalten tillåter textil i paketflödet.",
    compatibilityStatus: "Kräver kontroll",
    compatibilityNote: "Storlek, färg, material och anstaltens lokala rutin behöver verifieras.",
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    warningNotes: ["Kläder kan vara begränsade och behöver kontrolleras före köp."],
    saferAlternative: "Hygien- eller brevprodukt med lägre risk",
    requiresManualReview: true,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "underklader-bas",
    name: "Basunderkläder",
    category: "Kläder & basplagg",
    packageTags: ["Klädpaket", "Långvistelsepaket"],
    price: 99,
    image: "assets/images/cellvia-worker.jpg",
    description: "Enkla basunderkläder utan hårda detaljer.",
    usefulFor: "Kan vara relevant vid längre vistelser när textil är möjlig.",
    compatibilityStatus: "Kräver kontroll",
    compatibilityNote: "Behöver kontrolleras mot mottagningens aktuella textilrutiner.",
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    warningNotes: ["Textilregler kan variera mellan anstalter."],
    saferAlternative: "Bomullsstrumpor eller hygienprodukt",
    requiresManualReview: true,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "familjefoto-kuvert",
    name: "Dokumentkuvert",
    category: "Brev & dokument",
    packageTags: ["Skrivpaket", "Startpaket"],
    price: 29,
    image: "assets/images/documented-packing.jpg",
    description: "Enkla kuvert för dokument och brev.",
    usefulFor: "Hjälper familjen att hålla kommunikationen tydlig och ordnad.",
    compatibilityStatus: "Vanligt lämplig",
    compatibilityNote: "Kan vara tillåtet när innehåll och antal är tydligt.",
    compatiblePrisons: prisons.map((prison) => prison.id),
    warningNotes: ["Innehåll i dokument ska vara enkelt att kontrollera."],
    saferAlternative: "Standardkuvert utan extra material",
    requiresManualReview: false,
    stockStatus: "I lager",
    checkedByCellVia: true
  },
  {
    id: "horlurar-kabel",
    name: "Hörlurar med kabel",
    category: "Hörlurar",
    packageTags: ["Musikpaket"],
    price: 149,
    image: "assets/images/process-sealed-package.jpg",
    description: "En enkel kabelmodell utan trådlös funktion.",
    usefulFor: "Kan vara relevant där ljudprodukter uttryckligen kan hanteras efter kontroll.",
    compatibilityStatus: "Begränsad",
    compatibilityNote: "Behöver verifieras före köp. Slutligt beslut tas av anstalten.",
    compatiblePrisons: [],
    warningNotes: ["Hörlurar är känsliga och regler kan variera kraftigt."],
    saferAlternative: "Bok, skrivblock eller brev-kit",
    requiresManualReview: true,
    stockStatus: "Begränsat lager",
    checkedByCellVia: true
  },
  {
    id: "cd-spelare-enkel",
    name: "Enkel CD-spelare",
    category: "CD-spelare & enklare elektronik",
    packageTags: ["Musikpaket"],
    price: 349,
    image: "assets/images/process-sealed-package.jpg",
    description: "Elektronisk produkt som alltid behöver manuell kontroll före köp.",
    usefulFor: "Endast aktuell om anstalten uttryckligen kan hantera produkten.",
    compatibilityStatus: "Begränsad",
    compatibilityNote: "Elektronik kräver verifiering, dokumentation och anstaltens slutliga bedömning.",
    compatiblePrisons: [],
    warningNotes: ["Elektronik är känsligt och varierar kraftigt mellan anstalter."],
    saferAlternative: "Bok eller skrivmaterial",
    requiresManualReview: true,
    stockStatus: "Begränsat lager",
    checkedByCellVia: true
  },
  {
    id: "tradlosa-horlurar",
    name: "Trådlösa hörlurar",
    category: "Hörlurar",
    packageTags: ["Produkter som kräver extra kontroll"],
    price: 299,
    image: "assets/images/process-products.jpg",
    description: "Trådlös elektronik och batterier är ofta riskabla i anstaltsmiljö.",
    usefulFor: "Visas främst för att förklara risk och föreslå säkrare alternativ.",
    compatibilityStatus: "Ej rekommenderad",
    compatibilityNote: "Bör normalt undvikas utan direkt verifiering med anstalten.",
    compatiblePrisons: [],
    warningNotes: ["Trådlös elektronik och batterier kan leda till avslag."],
    saferAlternative: "Välj icke-elektroniska produkter.",
    requiresManualReview: true,
    stockStatus: "Tillfälligt slut",
    checkedByCellVia: false
  },
  {
    id: "batterier-aa",
    name: "AA-batterier",
    category: "Batterier",
    packageTags: ["Produkter som kräver extra kontroll"],
    price: 49,
    image: "assets/images/documented-packing.jpg",
    description: "Lösa batterier bör undvikas om inte anstalten uttryckligen tillåter dem.",
    usefulFor: "Visas som riskkategori så familjer inte väljer batterier av misstag.",
    compatibilityStatus: "Ej rekommenderad",
    compatibilityNote: "Lösa batterier kräver direkt kontroll och bör inte ingå i standardpaket.",
    compatiblePrisons: [],
    warningNotes: ["Lösa batterier är markerade som riskprodukt."],
    saferAlternative: "Produkt utan batteribehov",
    requiresManualReview: true,
    stockStatus: "I lager",
    checkedByCellVia: false
  },
  {
    id: "mat-godis",
    name: "Mat och godis",
    category: "Produkter som kräver extra kontroll",
    packageTags: ["Ej för CellVia-paket"],
    price: 0,
    image: "assets/images/process-products.jpg",
    description: "Mat och godis ska inte skickas till intagna enligt Kriminalvårdens allmänna information.",
    usefulFor: "Visas endast som tydlig varning så att familjer undviker fel innehåll.",
    compatibilityStatus: "Inte tillåten",
    compatibilityNote: "Kriminalvården anger uttryckligen att mat och godis inte får skickas.",
    compatiblePrisons: [],
    warningNotes: ["Ska inte ingå i CellVia-paket."],
    saferAlternative: "Välj brev, bok eller enkel hygienprodukt som kan kontrolleras.",
    requiresManualReview: true,
    stockStatus: "Ej för leverans",
    checkedByCellVia: false
  },
  {
    id: "pengar-kontanter",
    name: "Pengar och kontanter",
    category: "Produkter som kräver extra kontroll",
    packageTags: ["Ej för CellVia-paket"],
    price: 0,
    image: "assets/images/documented-packing.jpg",
    description: "Pengar ska inte skickas eller lämnas till intagna genom paket.",
    usefulFor: "Visas som stoppregel i produktvägledningen.",
    compatibilityStatus: "Inte tillåten",
    compatibilityNote: "Kriminalvården anger att den som sitter i fängelse inte får ta emot pengar.",
    compatiblePrisons: [],
    warningNotes: ["Ska inte skickas i paket eller brev."],
    saferAlternative: "Kontakta Kriminalvården för aktuell information om tillåtna kontaktvägar.",
    requiresManualReview: true,
    stockStatus: "Ej för leverans",
    checkedByCellVia: false
  },
  {
    id: "forvaringspase",
    name: "Enkel förvaringspåse",
    category: "Tillbehör",
    packageTags: ["Basvardagspaket"],
    price: 39,
    image: "assets/images/process-products.jpg",
    description: "Mjuk enkel påse utan hårda detaljer.",
    usefulFor: "Kan hjälpa till att hålla mindre basprodukter ordnade.",
    compatibilityStatus: "Kräver kontroll",
    compatibilityNote: "Material, storlek och användning behöver kontrolleras.",
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    warningNotes: ["Tillbehör med smådelar eller hårda detaljer ska undvikas."],
    saferAlternative: "CellVia dokumenterad packning utan extra påse",
    requiresManualReview: true,
    stockStatus: "I lager",
    checkedByCellVia: true
  }
];

const packages = [
  {
    id: "startpaket",
    name: "Startpaket",
    image: "assets/images/process-sealed-package.jpg",
    description: "Ett enkelt första paket med låg komplexitet och tydlig dokumentation.",
    purpose: "För familjer som vill börja försiktigt med basprodukter.",
    suitableFor: "Första leveransen eller när reglerna känns otydliga.",
    compatibilityLevel: "Vanligt lämplig",
    productIds: ["mild-tval", "tandkram", "brev-kit"],
    compatiblePrisons: prisons.map((prison) => prison.id),
    notes: ["Välj detta när du vill minimera komplexitet."],
    serviceFee: 79,
    popular: true,
    firstDelivery: true
  },
  {
    id: "hygienpaket",
    name: "Hygienpaket",
    image: "assets/images/process-products.jpg",
    description: "Milda hygienprodukter med tydlig märkning och kontrollerbar förpackning.",
    purpose: "För vardaglig personlig vård.",
    suitableFor: "Kortare och längre vistelser när hygienprodukter behöver förberedas tydligt.",
    compatibilityLevel: "Vanligt lämplig",
    productIds: ["mild-tval", "tandkram", "schampo-milt"],
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    notes: ["Schampo kräver extra kontroll av volym och doft."],
    serviceFee: 89,
    popular: true,
    firstDelivery: true
  },
  {
    id: "basvardagspaket",
    name: "Basvardagspaket",
    image: "assets/images/documented-packing.jpg",
    description: "Ett vardagligt paket med hygien, brev och enkla basprodukter.",
    purpose: "För en lugn kombination av praktiska produkter.",
    suitableFor: "Familjer som vill välja lite mer än ett startpaket utan att skapa onödig risk.",
    compatibilityLevel: "Kräver kontroll",
    productIds: ["mild-tval", "brev-kit", "skrivblock", "forvaringspase"],
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    notes: ["Tillbehör kontrolleras separat."],
    serviceFee: 99,
    popular: true,
    firstDelivery: false
  },
  {
    id: "musikpaket",
    name: "Musikpaket",
    image: "assets/images/process-sealed-package.jpg",
    description: "Ett paket för förfrågan där ljudprodukter alltid verifieras före köp.",
    purpose: "För familjer som vill undersöka om ljudprodukt kan vara möjlig.",
    suitableFor: "Endast efter tydlig kontroll av vald anstalt.",
    compatibilityLevel: "Begränsad",
    productIds: ["horlurar-kabel", "cd-spelare-enkel"],
    compatiblePrisons: [],
    notes: ["Elektronik och hörlurar kräver alltid extra verifiering."],
    serviceFee: 129,
    popular: false,
    firstDelivery: false
  },
  {
    id: "kladpaket",
    name: "Klädpaket",
    image: "assets/images/cellvia-worker.jpg",
    description: "Enkla basplagg som kontrolleras mot vald anstalts textilrutiner.",
    purpose: "För komplettering av basplagg där textil kan hanteras.",
    suitableFor: "Längre vistelser och anstalter där textil kan verifieras.",
    compatibilityLevel: "Kräver kontroll",
    productIds: ["bomullsstrumpor", "tshirt-bas", "underklader-bas"],
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    notes: ["Textil ska verifieras före köp."],
    serviceFee: 119,
    popular: false,
    firstDelivery: false
  },
  {
    id: "skrivpaket",
    name: "Skrivpaket",
    image: "assets/images/documented-packing.jpg",
    description: "Papper, kuvert och skrivmaterial för tydlig vardagskontakt.",
    purpose: "För brev, studier och ordnad kommunikation.",
    suitableFor: "Familjer som vill skicka icke-tekniska produkter.",
    compatibilityLevel: "Vanligt lämplig",
    productIds: ["brev-kit", "skrivblock", "kulspetspenna", "pocketbok"],
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    notes: ["Penna och bok kontrolleras extra."],
    serviceFee: 89,
    popular: true,
    firstDelivery: true
  },
  {
    id: "langvistelsepaket",
    name: "Långvistelsepaket",
    image: "assets/images/process-sealed-package.jpg",
    description: "Ett mer omfattande paket där flera kategorier verifieras stegvis.",
    purpose: "För längre vistelser där familjen vill skapa struktur över tid.",
    suitableFor: "När anstalt och produktkategorier redan har kontrollerats.",
    compatibilityLevel: "Kräver kontroll",
    productIds: ["mild-tval", "tandkram", "pocketbok", "bomullsstrumpor", "underklader-bas"],
    compatiblePrisons: prisons.filter((prison) => !highSecurity.has(prison.id)).map((prison) => prison.id),
    notes: ["Flera kategorier innebär fler kontrollpunkter."],
    serviceFee: 139,
    popular: false,
    firstDelivery: false
  },
  {
    id: "anpassat-paket",
    name: "Anpassat paket",
    image: "assets/images/cellvia-worker.jpg",
    description: "Bygg ett eget paket utifrån vald anstalt och CellVias kompatibilitetsvägledning.",
    purpose: "För familjer som behöver särskild anpassning.",
    suitableFor: "När standardpaketen inte räcker eller när reglerna kräver försiktigare val.",
    compatibilityLevel: "Kräver kontroll",
    productIds: [],
    compatiblePrisons: [],
    notes: ["Anpassade paket granskas alltid före nästa steg."],
    serviceFee: 99,
    popular: false,
    firstDelivery: false
  }
];

const trackingStatuses = [
  "Beställning mottagen",
  "Produkter kontrolleras",
  "Paket förbereds",
  "Skickat till anstalt",
  "Väntar på intern kontroll"
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
    cellviaNotes: "Produkterna är kontrollerade mot vald anstalt, kvitto/faktura sparas internt och paketet förbereds för dokumenterad packning.",
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-05-12T12:30:00.000Z"
  }
];

window.CellViaSeed = {
  legalNotice,
  complianceNotice,
  packageTrustMessage,
  limitedPublicInfo,
  officialRuleSummary,
  joPackageSummary,
  complianceSources,
  generalRules,
  categories,
  productCategories,
  prisons,
  products,
  packages,
  trackingStatuses,
  faq,
  sampleOrders
};
})();
