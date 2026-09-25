// Every shop-specific fact lives here. Values in [brackets] are placeholders:
// this is a concept design, so no real address, phone, hours, or prices are claimed.
export const SHOP = {
  name: "Teaspoon",
  city: "San Jose, CA",
  address: "[address]",
  phone: "[phone]",
  hours: [
    { days: "Monday to Thursday", time: "[hours]" },
    { days: "Friday and Saturday", time: "[hours]" },
    { days: "Sunday", time: "[hours]" },
  ],
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Teaspoon+San+Jose",
  instagram: "[instagram handle]",
};

// Sample menu for the concept. Not the shop's actual menu; no prices on purpose.
// `tea` / `milk` are the colors used to draw each cup.
export const CATEGORIES = [
  { id: "all", label: "Everything" },
  { id: "milk", label: "Milk tea" },
  { id: "fruit", label: "Fruit tea" },
  { id: "special", label: "Specialty" },
  { id: "topping", label: "Toppings" },
];

export const MENU = [
  { name: "Classic black milk tea", cat: "milk", tea: "#b98a5e", note: "Strong black tea, fresh milk. The one to judge a shop by." },
  { name: "Jasmine green milk tea", cat: "milk", tea: "#d9cf9a", note: "Floral and light, good at low sugar." },
  { name: "Taro milk tea", cat: "milk", tea: "#b9a3d6", note: "Nutty, a little sweet, unmistakably purple." },
  { name: "Roasted oolong latte", cat: "milk", tea: "#a87650", note: "Toasty oolong with a clean finish." },
  { name: "Mango green tea", cat: "fruit", tea: "#f2b54a", note: "Bright green tea shaken with mango." },
  { name: "Passion fruit green tea", cat: "fruit", tea: "#e8c24d", note: "Tart, bright, and best with lots of ice." },
  { name: "Lychee oolong", cat: "fruit", tea: "#ecd9b4", note: "Delicate lychee over light oolong." },
  { name: "Strawberry matcha latte", cat: "special", tea: "#8fae5a", milk: "#f0a3a8", note: "Layered strawberry, milk, and matcha." },
  { name: "Brown sugar pearl milk", cat: "special", tea: "#f2e6d4", milk: "#7a4a24", note: "No tea, just warm brown sugar syrup and cold milk." },
  { name: "Sea salt cream oolong", cat: "special", tea: "#b58a5c", milk: "#f7f1e6", note: "Oolong under a salty-sweet cream cap." },
  { name: "Tapioca pearls", cat: "topping", tea: "#3b2417", note: "Chewy, slow-cooked, made in small batches." },
  { name: "Lychee jelly", cat: "topping", tea: "#efe4c8", note: "Soft cubes with a light fruit taste." },
  { name: "Egg pudding", cat: "topping", tea: "#f1c65a", note: "Silky custard that sinks to the bottom." },
  { name: "Crystal boba", cat: "topping", tea: "#e9e6de", note: "Translucent and bouncy, lighter than tapioca." },
];

// Options for the build-your-drink section.
export const BUILDER = {
  bases: [
    { id: "black", label: "Black milk tea", tea: "#b98a5e" },
    { id: "jasmine", label: "Jasmine green", tea: "#d9cf9a" },
    { id: "taro", label: "Taro", tea: "#b9a3d6" },
    { id: "mango", label: "Mango green", tea: "#f2b54a" },
  ],
  sweetness: [0, 25, 50, 75, 100],
  ice: ["No ice", "Less ice", "Regular ice"],
  toppings: [
    { id: "pearls", label: "Tapioca pearls", color: "#3b2417" },
    { id: "jelly", label: "Lychee jelly", color: "#efe4c8" },
    { id: "pudding", label: "Egg pudding", color: "#f1c65a" },
    { id: "crystal", label: "Crystal boba", color: "#e9e6de" },
  ],
};
