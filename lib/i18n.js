/**
 * Minimal i18n for EN/HU. Default locale is "hu".
 * Usage: const t = getTranslations(locale);  t("key")
 */

export const DEFAULT_LOCALE = "hu";
export const SUPPORTED_LOCALES = ["hu", "en"];
export const LOCALE_COOKIE = "am_locale";

const translations = {
  en: {
    // Nav / common
    "nav.admin": "Admin",
    "nav.items": "Items",
    "nav.public": "Public",
    "nav.logout": "Sign out",

    // Home
    "home.title": "Artifact Museum",
    "home.subtitle": "Scan a code or browse the collection",
    "home.scan": "Scan Code",
    "home.scan.desc": "Point your camera at a QR or barcode",
    "home.browse": "Browse All",
    "home.browse.desc": "Explore the entire collection",

    // Browse
    "browse.title": "Collection",
    "browse.empty.title": "No items yet",
    "browse.empty.desc": "The collection is empty — check back later.",
    "browse.back": "Back to home",
    "browse.unnamed": "Unnamed item",

    // Item detail
    "item.collected": "Collected",
    "item.details": "Details",
    "item.price": "Price",
    "item.shop": "Shop",
    "item.recipient": "Recipient",
    "item.consumed": "Consumed",
    "item.gifted": "Gifted",
    "item.yes": "Yes",
    "item.no": "No",
    "item.map": "View on map",
    "item.unnamed": "Unnamed item",

    // Scan
    "scan.title": "Scan Code",
    "scan.start": "Start camera",
    "scan.scanning": "Scanning…",
    "scan.not_found": "Code not recognised",
    "scan.not_found.desc": "This code isn't in the collection.",
    "scan.error": "Camera error",

    // Admin – items list
    "admin.items.title": "All items",
    "admin.items.name": "Name",
    "admin.items.category": "Category",
    "admin.items.collected": "Collected",
    "admin.items.views": "Views",
    "admin.items.public": "Public",
    "admin.items.edit": "Edit",
    "admin.items.yes": "Yes",
    "admin.items.no": "No",
    "admin.items.unnamed": "Unnamed",
    "admin.items.search.placeholder": "Search by name…",
    "admin.items.filter.all": "All categories",
    "admin.items.filter.visibility": "All",
    "admin.items.filter.public": "Public only",
    "admin.items.filter.hidden": "Hidden only",
    "admin.items.empty.filtered": "No items match the current filter.",

    // Admin – edit item
    "admin.edit.back": "Back",
    "admin.edit.title": "Edit item",
    "admin.edit.analytics": "Analytics",
    "admin.edit.views": "views",
    "admin.edit.from": "from",
    "admin.edit.source": "Source data",
    "admin.edit.source.code": "Code",
    "admin.edit.source.category": "Category",
    "admin.edit.source.collected": "Collected",
    "admin.edit.source.price": "Price",
    "admin.edit.source.shop": "Shop",
    "admin.edit.source.recipient": "Recipient",
    "admin.edit.source.location": "Location",
    "admin.edit.source.map": "Map",
    "admin.edit.display": "Display text",
    "admin.edit.label": "Label (display name)",
    "admin.edit.notes.public": "Public notes",
    "admin.edit.visibility": "Visibility",
    "admin.edit.visibility.public": "Public (visible to guests)",
    "admin.edit.visibility.show": "Show these fields to guests:",
    "admin.edit.show.photo": "Photo",
    "admin.edit.show.notes": "Notes",
    "admin.edit.show.price": "Price",
    "admin.edit.show.shop": "Shop / source",
    "admin.edit.show.recipient": "Recipient",
    "admin.edit.show.consumed": "Consumed status",
    "admin.edit.show.gifted": "Gifted status",
    "admin.edit.show.location": "Location (map link)",
    "admin.edit.admin_notes": "Admin notes (private)",
    "admin.edit.admin_notes.placeholder": "Internal notes, not shown to guests",
    "admin.edit.save": "Save changes",
    "admin.edit.cancel": "Cancel",

    // Admin – edit item – data fields section
    "admin.edit.data": "Edit item data",
    "admin.edit.data.photo": "Replace photo",
    "admin.edit.data.photo.hint": "Select an image to replace the current photo",
    "admin.edit.data.photo.clear": "Clear photo",
    "admin.edit.data.price": "Price",
    "admin.edit.data.currency": "Currency",
    "admin.edit.data.shop": "Shop / source",
    "admin.edit.data.recipient": "Recipient",
    "admin.edit.data.consumed": "Consumed",
    "admin.edit.data.gifted": "Gifted",

    // Admin – dashboard
    "admin.dashboard.title": "Import data",
    "admin.dashboard.upload": "Upload JSON export",
    "admin.dashboard.import": "Import",

    // Visitor login
    "visitor.password": "Password",
    "visitor.enter": "Enter",
    "visitor.wrongPassword": "Incorrect password.",

    // Language switcher
    "lang.switch": "Language",
  },

  hu: {
    // Nav / common
    "nav.admin": "Admin",
    "nav.items": "Tárgyak",
    "nav.public": "Nyilvános",
    "nav.logout": "Kijelentkezés",

    // Home
    "home.title": "Tárgyak Múzeuma",
    "home.subtitle": "Olvass be egy kódot, vagy böngéssz a gyűjteményben",
    "home.scan": "Kód beolvasása",
    "home.scan.desc": "Irányítsd a kamerát egy QR- vagy vonalkódra",
    "home.browse": "Összes megtekintése",
    "home.browse.desc": "Böngéssz a teljes gyűjteményben",

    // Browse
    "browse.title": "Gyűjtemény",
    "browse.empty.title": "Még nincs tárgy",
    "browse.empty.desc": "A gyűjtemény üres – nézz vissza később.",
    "browse.back": "Vissza a főoldalra",
    "browse.unnamed": "Névtelen tárgy",

    // Item detail
    "item.collected": "Gyűjtve",
    "item.details": "Részletek",
    "item.price": "Ár",
    "item.shop": "Bolt",
    "item.recipient": "Megkapó",
    "item.consumed": "Elfogyasztva",
    "item.gifted": "Ajándékba adva",
    "item.yes": "Igen",
    "item.no": "Nem",
    "item.map": "Megtekintés térképen",
    "item.unnamed": "Névtelen tárgy",

    // Scan
    "scan.title": "Kód beolvasása",
    "scan.start": "Kamera indítása",
    "scan.scanning": "Beolvasás…",
    "scan.not_found": "Kód nem található",
    "scan.not_found.desc": "Ez a kód nem szerepel a gyűjteményben.",
    "scan.error": "Kamera hiba",

    // Admin – items list
    "admin.items.title": "Összes tárgy",
    "admin.items.name": "Név",
    "admin.items.category": "Kategória",
    "admin.items.collected": "Gyűjtve",
    "admin.items.views": "Megtekintés",
    "admin.items.public": "Nyilvános",
    "admin.items.edit": "Szerkesztés",
    "admin.items.yes": "Igen",
    "admin.items.no": "Nem",
    "admin.items.unnamed": "Névtelen",
    "admin.items.search.placeholder": "Keresés név alapján…",
    "admin.items.filter.all": "Minden kategória",
    "admin.items.filter.visibility": "Összes",
    "admin.items.filter.public": "Csak nyilvános",
    "admin.items.filter.hidden": "Csak rejtett",
    "admin.items.empty.filtered": "Nincs a szűrőnek megfelelő tárgy.",

    // Admin – edit item
    "admin.edit.back": "Vissza",
    "admin.edit.title": "Tárgy szerkesztése",
    "admin.edit.analytics": "Statisztika",
    "admin.edit.views": "megtekintés",
    "admin.edit.from": "ebből",
    "admin.edit.source": "Forrásadat",
    "admin.edit.source.code": "Kód",
    "admin.edit.source.category": "Kategória",
    "admin.edit.source.collected": "Gyűjtve",
    "admin.edit.source.price": "Ár",
    "admin.edit.source.shop": "Bolt",
    "admin.edit.source.recipient": "Megkapó",
    "admin.edit.source.location": "Helyszín",
    "admin.edit.source.map": "Térkép",
    "admin.edit.display": "Megjelenített szöveg",
    "admin.edit.label": "Megjelenített név",
    "admin.edit.notes.public": "Nyilvános megjegyzés",
    "admin.edit.visibility": "Láthatóság",
    "admin.edit.visibility.public": "Nyilvános (látható a látogatóknak)",
    "admin.edit.visibility.show": "Ezeket a mezőket mutasd meg a látogatóknak:",
    "admin.edit.show.photo": "Fotó",
    "admin.edit.show.notes": "Megjegyzés",
    "admin.edit.show.price": "Ár",
    "admin.edit.show.shop": "Bolt / forrás",
    "admin.edit.show.recipient": "Megkapó",
    "admin.edit.show.consumed": "Elfogyasztva státusz",
    "admin.edit.show.gifted": "Ajándék státusz",
    "admin.edit.show.location": "Helyszín (térkép link)",
    "admin.edit.admin_notes": "Admin megjegyzés (privát)",
    "admin.edit.admin_notes.placeholder": "Belső megjegyzés, a látogatóknak nem látható",
    "admin.edit.save": "Mentés",
    "admin.edit.cancel": "Mégse",

    // Admin – edit item – data fields section
    "admin.edit.data": "Tárgy adatainak szerkesztése",
    "admin.edit.data.photo": "Fotó cseréje",
    "admin.edit.data.photo.hint": "Válassz képet a jelenlegi fotó cseréjéhez",
    "admin.edit.data.photo.clear": "Fotó törlése",
    "admin.edit.data.price": "Ár",
    "admin.edit.data.currency": "Pénznem",
    "admin.edit.data.shop": "Bolt / forrás",
    "admin.edit.data.recipient": "Megkapó",
    "admin.edit.data.consumed": "Elfogyasztva",
    "admin.edit.data.gifted": "Ajándékba adva",

    // Admin – dashboard
    "admin.dashboard.title": "Adatok importálása",
    "admin.dashboard.upload": "JSON exportfájl feltöltése",
    "admin.dashboard.import": "Importálás",

    // Visitor login
    "visitor.password": "Jelszó",
    "visitor.enter": "Belépés",
    "visitor.wrongPassword": "Helytelen jelszó.",

    // Language switcher
    "lang.switch": "Nyelv",
  },
};

export function getTranslations(locale) {
  const lang = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const dict = translations[lang];
  return function t(key) {
    return dict[key] ?? translations["en"][key] ?? key;
  };
}
