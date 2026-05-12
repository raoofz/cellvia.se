/**
 * @typedef {"Vanligt lämplig" | "Kräver kontroll" | "Begränsad" | "Ej rekommenderad"} CompatibilityStatus
 * @typedef {"I lager" | "Begränsat lager" | "Tillfälligt slut"} StockStatus
 * @typedef {"Beställning mottagen" | "Produkter kontrolleras" | "Paket förbereds" | "Paket skickat" | "Levererat till anstalt" | "Väntar på anstaltens interna kontroll"} TrackingStatus
 *
 * @typedef {Object} Prison
 * @property {string} id
 * @property {string} name
 * @property {string} city
 * @property {string} type
 * @property {string} securityLevel
 * @property {string} generalNotes
 * @property {string} packagingNotes
 * @property {string[]} allowedCategories
 * @property {string[]} restrictedCategories
 * @property {string[]} recommendedProducts
 * @property {string[]} riskyProducts
 * @property {{date:string,title:string,body:string}[]} ruleUpdates
 * @property {string} lastUpdated
 *
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {string} image
 * @property {string} description
 * @property {CompatibilityStatus} compatibilityStatus
 * @property {string[]} compatiblePrisons
 * @property {string[]} warningNotes
 * @property {string} saferAlternative
 * @property {boolean} requiresManualReview
 * @property {StockStatus} stockStatus
 */
