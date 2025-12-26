// Teaspoon concept page. All content comes from data.js.
import { SHOP, CATEGORIES, MENU, BUILDER } from "./data.js";

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

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

// Menu board with category filter
function menu() {
  const filters = $(".filters"), board = $(".board"), status = $("#menu-status");
  if (!board) return;
  const label = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
  filters.innerHTML = CATEGORIES.map((c, i) =>
    `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${i === 0}">${esc(c.label)}</button>`).join("");
  const show = (cat) => {
    const items = MENU.filter((d) => cat === "all" || d.cat === cat);
    board.innerHTML = items.map((d) => `<li>
      ${cup(d.cat === "topping" ? { tea: "var(--cup)", bits: [d.tea, d.tea], fill: 0 } : d)}
      <div><h3>${esc(d.name)}</h3><p>${esc(d.note)}</p>${cat === "all" ? `<span class="tag">${esc(label[d.cat])}</span>` : ""}</div>
    </li>`).join("");
    status.textContent = `Showing ${items.length} ${cat === "all" ? "items" : label[cat].toLowerCase() + " items"}`;
    filters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === cat));
  };
  filters.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) show(b.dataset.cat); });
  show("all");
}

// Build-your-drink: form state -> live cup + summary
const MAX_TOPPINGS = 3;
function builder() {
  const form = $("#builder");
  if (!form) return;
  const opt = (type, name, value, text, checked, swatch) => `<label class="opt">
    <input type="${type}" name="${name}" value="${esc(value)}"${checked ? " checked" : ""}>
    <span>${swatch ? `<i class="swatch" style="background:${swatch}" aria-hidden="true"></i>` : ""}${esc(text)}</span></label>`;
  const group = (legend, body, hint = "") =>
    `<fieldset><legend>${legend}</legend><div class="options">${body}</div>${hint}</fieldset>`;
  form.innerHTML =
    group("Base", BUILDER.bases.map((b, i) => opt("radio", "base", b.id, b.label, i === 0, b.tea)).join("")) +
    group("Sweetness", BUILDER.sweetness.map((v) => opt("radio", "sweet", v, `${v}%`, v === 50)).join("")) +
    group("Ice", BUILDER.ice.map((v, i) => opt("radio", "ice", i, v, i === 1)).join("")) +
    group("Toppings", BUILDER.toppings.map((t) => opt("checkbox", "top", t.id, t.label, t.id === "pearls", t.color)).join(""),
      `<p class="hint" id="top-hint">Up to ${MAX_TOPPINGS}.</p>`);

  const render = () => {
    const f = new FormData(form);
    const base = BUILDER.bases.find((b) => b.id === f.get("base"));
    const sweet = Number(f.get("sweet"));
    const ice = Number(f.get("ice"));
    const tops = BUILDER.toppings.filter((t) => f.getAll("top").includes(t.id));
    form.querySelectorAll('input[name="top"]').forEach((i) => { i.disabled = !i.checked && tops.length >= MAX_TOPPINGS; });
    $("#preview-cup").innerHTML = cup({ tea: base.tea, ice, sweet, bits: tops.map((t) => t.color), fill: 0.82 });
    const list = tops.map((t) => t.label.toLowerCase());
    const withText = list.length ? `with ${list.length > 1 ? list.slice(0, -1).join(", ") + " and " + list.at(-1) : list[0]}` : "no toppings";
    $("#summary").innerHTML = `<strong>${esc(base.label)}</strong>${sweet}% sweet, ${BUILDER.ice[ice].toLowerCase()}, ${esc(withText)}.`;
  };
  form.addEventListener("change", render);
  render();
}

// Shop facts from the single config object
function shopFacts() {
  document.querySelectorAll("[data-shop]").forEach((el) => { el.textContent = SHOP[el.dataset.shop]; });
  $("#map-link").href = SHOP.mapUrl;
  $("#hours").innerHTML = SHOP.hours.map((h) => `<tr><th scope="row">${esc(h.days)}</th><td>${esc(h.time)}</td></tr>`).join("");
}

menu();
builder();
shopFacts();
