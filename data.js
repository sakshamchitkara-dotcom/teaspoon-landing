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
// `contains` (milk, egg) and `caffeine` are sample notes shown by the allergen toggle,
// inferred from the drink descriptions, not from a real recipe. Calories are left as a
// placeholder: add `kcal: 180` to an item to show a number instead of [calories].
export const CATEGORIES = ["all", "milk", "fruit", "special", "topping"];

export const MENU = [
  { id: "black", cat: "milk", tea: "#b98a5e", contains: ["milk"], caffeine: true },
  { id: "jasmine", cat: "milk", tea: "#d9cf9a", contains: ["milk"], caffeine: true },
  { id: "taro", cat: "milk", tea: "#b9a3d6", contains: ["milk"], caffeine: true },
  { id: "oolong", cat: "milk", tea: "#a87650", contains: ["milk"], caffeine: true },
  { id: "mango", cat: "fruit", tea: "#f2b54a", contains: [], caffeine: true },
  { id: "passion", cat: "fruit", tea: "#e8c24d", contains: [], caffeine: true },
  { id: "lychee", cat: "fruit", tea: "#ecd9b4", contains: [], caffeine: true },
  { id: "strawMatcha", cat: "special", tea: "#8fae5a", milk: "#f0a3a8", contains: ["milk"], caffeine: true },
  { id: "brownSugar", cat: "special", tea: "#f2e6d4", milk: "#7a4a24", contains: ["milk"], caffeine: false },
  { id: "seaSalt", cat: "special", tea: "#b58a5c", milk: "#f7f1e6", contains: ["milk"], caffeine: true },
  { id: "pearls", cat: "topping", tea: "#3b2417", contains: [], caffeine: false },
  { id: "jelly", cat: "topping", tea: "#efe4c8", contains: [], caffeine: false },
  { id: "pudding", cat: "topping", tea: "#f1c65a", contains: ["egg", "milk"], caffeine: false },
  { id: "crystal", cat: "topping", tea: "#e9e6de", contains: [], caffeine: false },
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

// Seasonal specials repeat every year. `from` / `to` are "MM-DD", both inclusive,
// and a range may wrap past New Year. Sample drinks for the concept, like MENU.
export const SPECIALS = [
  { id: "strawberry", from: "03-01", to: "05-31", tea: "#f3a6ae" },
  { id: "watermelon", from: "06-01", to: "08-31", tea: "#f0707a", ice: 2 },
  { id: "horchata", from: "09-01", to: "11-30", tea: "#b98a5e", milk: "#eadcc4", bits: ["#3b2417"] },
  { id: "persimmon", from: "10-15", to: "12-15", tea: "#f08a3c", ice: 1 },
  { id: "ginger", from: "12-01", to: "02-29", tea: "#f2e6d4", milk: "#7a4a24", bits: ["#3b2417"] },
];

// "Find your drink" quiz. Each answer sets one part of a builder drink, so a result is
// always something the builder (and a saved-drink link) can show. Labels live in i18n.js (quiz.*).
export const QUIZ = {
  flavor: { bold: "black", creamy: "taro", floral: "jasmine", fruity: "mango" }, // -> base
  sweet: { low: 25, mid: 50, high: 75 }, // -> sweetness %
  chew: { chewy: ["pearls"], silky: ["pudding"], bouncy: ["crystal"], none: [] }, // -> toppings
  day: { hot: 2, mild: 1, cold: 0 }, // -> ice level
};
