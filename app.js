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

menu();
