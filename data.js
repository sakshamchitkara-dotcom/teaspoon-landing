// Every shop-specific fact lives here. Values in [brackets] are placeholders:
// this is a concept design, so no real address, phone, hours, or prices are claimed.
// Words shown to visitors live in i18n.js, keyed by the ids below.
export const SHOP = {
  name: "Teaspoon",
  city: "San Jose, CA",
  address: "[address]",
  phone: "[phone]",
  // `days` is a key into STRINGS[lang].visit.days
  hours: [
    { days: "monThu", time: "[hours]" },
    { days: "friSat", time: "[hours]" },
    { days: "sun", time: "[hours]" },
  ],
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Teaspoon+San+Jose",
  instagram: "[instagram handle]",
};

// Sample menu for the concept. Not the shop's actual menu; no prices on purpose.
// `tea` / `milk` are the colors used to draw each cup.
export const CATEGORIES = ["all", "milk", "fruit", "special", "topping"];

export const MENU = [
  { id: "black", cat: "milk", tea: "#b98a5e" },
  { id: "jasmine", cat: "milk", tea: "#d9cf9a" },
  { id: "taro", cat: "milk", tea: "#b9a3d6" },
  { id: "oolong", cat: "milk", tea: "#a87650" },
  { id: "mango", cat: "fruit", tea: "#f2b54a" },
  { id: "passion", cat: "fruit", tea: "#e8c24d" },
  { id: "lychee", cat: "fruit", tea: "#ecd9b4" },
  { id: "strawMatcha", cat: "special", tea: "#8fae5a", milk: "#f0a3a8" },
  { id: "brownSugar", cat: "special", tea: "#f2e6d4", milk: "#7a4a24" },
  { id: "seaSalt", cat: "special", tea: "#b58a5c", milk: "#f7f1e6" },
  { id: "pearls", cat: "topping", tea: "#3b2417" },
  { id: "jelly", cat: "topping", tea: "#efe4c8" },
  { id: "pudding", cat: "topping", tea: "#f1c65a" },
  { id: "crystal", cat: "topping", tea: "#e9e6de" },
];

// Options for the build-your-drink section. Labels live in i18n.js (build.*).
export const BUILDER = {
  bases: [
    { id: "black", tea: "#b98a5e" },
    { id: "jasmine", tea: "#d9cf9a" },
    { id: "taro", tea: "#b9a3d6" },
    { id: "mango", tea: "#f2b54a" },
  ],
  sweetness: [0, 25, 50, 75, 100],
  ice: [0, 1, 2], // none, less, regular
  toppings: [
    { id: "pearls", color: "#3b2417" },
    { id: "jelly", color: "#efe4c8" },
    { id: "pudding", color: "#f1c65a" },
    { id: "crystal", color: "#e9e6de" },
  ],
};
