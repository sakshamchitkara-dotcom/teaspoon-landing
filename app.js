// Teaspoon concept page. Facts come from data.js, words from i18n.js.
import { SHOP, CATEGORIES, MENU, BUILDER, SPECIALS } from "./data.js";
import { STRINGS } from "./i18n.js";

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Saved choice, then the browser's languages, then English.
function initialLang() {
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  return [saved, ...navigator.languages.map((l) => l.slice(0, 2).toLowerCase())].find((l) => l in STRINGS) || "en";
}
let lang = initialLang();
const lookup = (obj, key) => key.split(".").reduce((o, k) => o?.[k], obj);
// t("menu.showing", { n: 3 }) -> "Showing 3 items"; falls back to English, then the key.
export function t(key, vars = {}) {
  const s = lookup(STRINGS[lang], key) ?? lookup(STRINGS.en, key) ?? key;
  return typeof s === "string" ? s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m) : s;
}

// One cup drawing, reused by the menu board and the builder.
// fill: 0..1 how full; ice: 0..2 cubes level; bits: array of topping colors.
let cupId = 0;
export function cup({ tea, milk, fill = 0.8, ice = 0, bits = [], sweet = null }) {
  const id = `c${cupId++}`;
  const top = 290 - 230 * fill;
  const cubes = [[62, 70], [104, 96], [140, 64], [80, 118], [128, 124]].slice(0, ice * 2 + (ice ? 1 : 0))
    .map(([x, y]) => `<rect x="${x}" y="${top + y - 60}" width="30" height="30" rx="6" transform="rotate(${(x % 30) - 15} ${x + 15} ${top + y - 45})" fill="#fff" fill-opacity=".55" stroke="var(--line)" stroke-width="2"/>`).join("");
  const dots = bits.flatMap((c, i) => [0, 1, 2, 3, 4].map((k) =>
    `<circle cx="${62 + k * 24 + (i % 2) * 12}" cy="${274 - i * 18}" r="10" fill="${c}" stroke="var(--line)" stroke-width="1.5"/>`)).join("");
  const layer = milk ? `<rect x="0" y="${top + (290 - top) * 0.5}" width="220" height="300" fill="${milk}"/>` : "";
  const sugar = sweet == null ? "" : `<rect x="0" y="${290 - 36 * (sweet / 100)}" width="220" height="40" fill="${"#7a4a24"}" opacity=".35"/>`;
  return `<svg viewBox="0 0 220 300" aria-hidden="true" focusable="false">
    <defs><clipPath id="${id}"><path d="M34 60 H186 L166 286 H54 Z"/></clipPath></defs>
    <rect class="straw" x="118" y="4" width="18" height="230" rx="9" transform="rotate(12 127 120)"/>
    <g clip-path="url(#${id})">
      <rect width="220" height="300" fill="var(--cup)"/>
      <rect x="0" y="${top}" width="220" height="300" fill="${tea}"/>
      ${layer}${sugar}${cubes}${dots}
    </g>
    <path class="cup-line" d="M34 60 H186 L166 286 H54 Z" fill="none"/>
    <path class="cup-line" d="M28 60 H192"/>
  </svg>`;
}

// Static copy in index.html, tagged with data-i18n (text), data-i18n-html (our own markup), data-i18n-label (aria-label)
function staticText() {
  const vars = { handle: SHOP.instagram };
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n, vars); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml, vars); });
  document.querySelectorAll("[data-i18n-label]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nLabel)); });
  document.title = t("meta.title");
  $('meta[name="description"]').content = t("meta.description");
}

// Seasonal specials: what's pouring on `date`, plus the next one to start
export function specialsOn(date, list = SPECIALS) {
  const pad = (n) => String(n).padStart(2, "0");
  const today = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const on = (s) => (s.from <= s.to ? today >= s.from && today <= s.to : today >= s.from || today <= s.to);
  // "0" sorts starts later this year ahead of ones that already passed (next year)
  const soon = (s) => (s.from > today ? "0" : "1") + s.from;
  const next = list.filter((s) => !on(s)).sort((a, b) => soon(a).localeCompare(soon(b)))[0];
  return { now: list.filter(on), next };
}
function specials(date = new Date()) {
  const { now, next } = specialsOn(date);
  const day = new Intl.DateTimeFormat(lang, { month: "long", day: "numeric" });
  const fmt = (md) => day.format(new Date(2000, Number(md.slice(0, 2)) - 1, Number(md.slice(3))));
  const item = (s, when, cls = "") => {
    const [name, note] = t(`specials.items.${s.id}`);
    return `<li class="${cls}">${cup({ fill: 0.82, ...s })}<div><h3>${esc(name)}</h3><p>${esc(note)}</p><p class="when">${esc(when)}</p></div></li>`;
  };
  $("#specials-list").innerHTML =
    now.map((s) => item(s, t("specials.now", { from: fmt(s.from), to: fmt(s.to) }))).join("") +
    (next ? item(next, t("specials.next", { date: fmt(next.from) }), "is-next") : "");
}

// Menu board with category filter
let menuCat = "all";
function showMenu(cat = menuCat) {
  const filters = $(".filters"), board = $(".board");
  menuCat = cat;
  const items = MENU.filter((d) => cat === "all" || d.cat === cat);
  board.innerHTML = items.map((d) => {
    const [name, note] = t(`menu.items.${d.id}`);
    return `<li>
      ${cup(d.cat === "topping" ? { tea: "var(--cup)", bits: [d.tea, d.tea], fill: 0 } : d)}
      <div><h3>${esc(name)}</h3><p>${esc(note)}</p>${cat === "all" ? `<span class="tag">${esc(t(`menu.cats.${d.cat}`))}</span>` : ""}${info(d)}</div>
    </li>`;
  }).join("");
  $("#menu-status").textContent = cat === "all" ? t("menu.showing", { n: items.length }) : t("menu.showingCat", { n: items.length, cat: t(`menu.cats.${cat}`) });
  filters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === cat));
}
// Sample allergen / caffeine notes, hidden until the toggle is on (always shown in print)
const info = (d) => {
  const tags = [
    d.contains.length ? d.contains.map((a) => t(`menu.info.allergens.${a}`)).join(", ") : t("menu.info.none"),
    t(d.caffeine ? "menu.info.caffeine" : "menu.info.noCaffeine"),
    t("menu.info.calories", { n: d.kcal ?? "[calories]" }),
  ];
  return `<ul class="info">${tags.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
};
$("#info-toggle").addEventListener("click", (e) => {
  const on = e.currentTarget.getAttribute("aria-pressed") !== "true";
  e.currentTarget.setAttribute("aria-pressed", on);
  $(".menu").classList.toggle("show-info", on);
});
// Printing always shows the full board, then puts the visitor's filter back
let catBeforePrint = null;
addEventListener("beforeprint", () => { catBeforePrint = menuCat; showMenu("all"); });
addEventListener("afterprint", () => { if (catBeforePrint) showMenu(catBeforePrint); catBeforePrint = null; });
$("#print-menu").addEventListener("click", () => print());
function menu() {
  const filters = $(".filters");
  filters.innerHTML = CATEGORIES.map((c) =>
    `<button type="button" class="chip" data-cat="${c}" aria-pressed="${c === menuCat}">${esc(t(`menu.cats.${c}`))}</button>`).join("");
  showMenu();
}
$(".filters").addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) showMenu(b.dataset.cat); });

// Build-your-drink: form state -> live cup + summary
const MAX_TOPPINGS = 3;
const form = $("#builder");
const DEFAULT_DRINK = { base: "black", sweet: 50, ice: 1, top: ["pearls"] };
function readDrink() {
  const f = new FormData(form);
  return { base: f.get("base"), sweet: Number(f.get("sweet")), ice: Number(f.get("ice")), top: f.getAll("top") };
}
// Shareable drink link: ?base=taro&sweet=25&ice=0&top=pearls,jelly#build
// Anything unknown in the URL falls back to the default, so a hand-edited link can't break the builder.
export function drinkFromQuery(search) {
  const q = new URLSearchParams(search);
  if (!q.has("base")) return null;
  const pick = (list, v, fallback) => (list.includes(v) ? v : fallback);
  const tops = new Set((q.get("top") || "").split(","));
  return {
    base: pick(BUILDER.bases.map((b) => b.id), q.get("base"), DEFAULT_DRINK.base),
    sweet: pick(BUILDER.sweetness, Number(q.get("sweet")), DEFAULT_DRINK.sweet),
    ice: pick(BUILDER.ice, Number(q.get("ice")), DEFAULT_DRINK.ice),
    top: BUILDER.toppings.map((tp) => tp.id).filter((id) => tops.has(id)).slice(0, MAX_TOPPINGS),
  };
}
const drinkUrl = (d) => {
  // ids are plain [a-z] words, so the commas can stay readable instead of %2C
  const q = `base=${d.base}&sweet=${d.sweet}&ice=${d.ice}&top=${d.top.join(",")}`;
  return `${location.origin}${location.pathname}?${q}#build`;
};
function builder(drink = form.elements.length ? readDrink() : drinkFromQuery(location.search) || DEFAULT_DRINK) {
  const opt = (type, name, value, text, checked, swatch) => `<label class="opt">
    <input type="${type}" name="${name}" value="${esc(value)}"${checked ? " checked" : ""}>
    <span>${swatch ? `<i class="swatch" style="background:${swatch}" aria-hidden="true"></i>` : ""}${esc(text)}</span></label>`;
  const group = (legend, body, hint = "") =>
    `<fieldset><legend>${esc(legend)}</legend><div class="options">${body}</div>${hint}</fieldset>`;
  form.innerHTML =
    group(t("build.base"), BUILDER.bases.map((b) => opt("radio", "base", b.id, t(`build.bases.${b.id}`), b.id === drink.base, b.tea)).join("")) +
    group(t("build.sweet"), BUILDER.sweetness.map((v) => opt("radio", "sweet", v, `${v}%`, v === drink.sweet)).join("")) +
    group(t("build.ice"), BUILDER.ice.map((v) => opt("radio", "ice", v, t(`build.iceLevels.${v}`), v === drink.ice)).join("")) +
    group(t("build.toppings"), BUILDER.toppings.map((tp) => opt("checkbox", "top", tp.id, t(`build.tops.${tp.id}`), drink.top.includes(tp.id), tp.color)).join(""),
      `<p class="hint" id="top-hint">${esc(t("build.hint", { n: MAX_TOPPINGS }))}</p>`);
  $("#save-status").textContent = "";
  renderDrink();
}
function renderDrink() {
  const d = readDrink();
  const base = BUILDER.bases.find((b) => b.id === d.base);
  const tops = BUILDER.toppings.filter((tp) => d.top.includes(tp.id));
  form.querySelectorAll('input[name="top"]').forEach((i) => { i.disabled = !i.checked && tops.length >= MAX_TOPPINGS; });
  $("#preview-cup").innerHTML = cup({ tea: base.tea, ice: d.ice, sweet: d.sweet, bits: tops.map((tp) => tp.color), fill: 0.82 });
  const lower = (s) => s.toLocaleLowerCase(lang);
  const list = tops.map((tp) => lower(t(`build.tops.${tp.id}`)));
  const joined = list.length > 1 ? `${list.slice(0, -1).join(", ")} ${t("build.and")} ${list.at(-1)}` : list[0];
  const text = t("build.summary", { sweet: d.sweet, ice: lower(t(`build.iceLevels.${d.ice}`)), tops: list.length ? t("build.with", { list: joined }) : t("build.none") });
  $("#summary").innerHTML = `<strong>${esc(t(`build.bases.${base.id}`))}</strong> ${esc(text)}`;
  if (!$("#save-link").hidden) syncSaved();
}
// Once saved, the address bar and link field follow every change
function syncSaved() {
  const url = drinkUrl(readDrink());
  history.replaceState(null, "", url);
  $("#share-url").value = url;
}
$("#save").addEventListener("click", () => {
  $("#save-link").hidden = false;
  syncSaved();
  $("#save-status").textContent = t("build.saved");
});
$("#copy").addEventListener("click", async () => {
  const input = $("#share-url");
  try {
    await navigator.clipboard.writeText(input.value);
    $("#save-status").textContent = t("build.copied");
  } catch (e) {
    input.select();
    $("#save-status").textContent = t("build.copyFail");
  }
});
form.addEventListener("change", renderDrink);

// Gallery: illustrated "posts", no photos
function gallery() {
  const posts = [
    { bg: "var(--mango)", art: cup({ tea: "#b9a3d6", bits: ["#3b2417"], ice: 1 }) },
    { bg: "var(--pearl)", cls: "tile--pearls" },
    { bg: "#cfe0b4", art: cup({ tea: "#8fae5a", milk: "#f0a3a8" }) },
    { bg: "var(--surface)", text: t("gallery.text") },
    { bg: "var(--accent)", art: cup({ tea: "#f2b54a", bits: ["#e9e6de"], ice: 2 }) },
    { bg: "#e7c9a0", art: cup({ tea: "#f2e6d4", milk: "#7a4a24", bits: ["#3b2417", "#3b2417"] }) },
  ];
  $("#feed").innerHTML = posts.map((p, i) => `<li><div class="tile ${p.cls || ""}" style="--tile:${p.bg}" role="img" aria-label="${esc(t(`gallery.posts.${i}`))}">
    ${p.art || ""}${p.text ? `<span class="tile__text" aria-hidden="true">${p.text}</span>` : ""}</div></li>`).join("");
}

// Shop facts from the single config object
function shopFacts() {
  document.querySelectorAll("[data-shop]").forEach((el) => { el.textContent = SHOP[el.dataset.shop]; });
  $("#map-link").href = SHOP.mapUrl;
  $("#hours").innerHTML = SHOP.hours.map((h) => `<tr><th scope="row">${esc(t(`visit.days.${h.days}`))}</th><td>${esc(h.time)}</td></tr>`).join("");
}

// Theme toggle: follows the OS until the visitor picks one
function theme() {
  const btn = $("#theme"), root = document.documentElement;
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const sync = () => btn.setAttribute("aria-pressed", isDark());
  btn.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    sync();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sync);
  sync();
}

// Everything that holds words; rerun when the language changes.
function render() {
  staticText();
  specials();
  menu();
  builder();
  gallery();
  shopFacts();
}

// Language picker: rerenders every string in place and remembers the choice
function setLang(l) {
  lang = l;
  document.documentElement.lang = l;
  $("#lang").value = l;
  render();
}
$("#lang").addEventListener("change", (e) => {
  try { localStorage.setItem("lang", e.target.value); } catch (err) {}
  setLang(e.target.value);
});

theme();
setLang(lang);

// Offline support (see sw.js). Registered after load so it never competes with first paint.
if ("serviceWorker" in navigator) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
