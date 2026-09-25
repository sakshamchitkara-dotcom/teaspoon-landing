// Renders the SVG sources to the PNGs that browsers and link previews need.
// Run after editing any of the SVGs: npm run rasterize
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const jobs = [
  ["icons/icon.svg", "icons/icon-192.png", 192, 192],
  ["icons/icon.svg", "icons/icon-512.png", 512, 512],
  ["icons/icon-maskable.svg", "icons/icon-maskable-512.png", 512, 512],
  ["icons/icon-maskable.svg", "icons/apple-touch-icon.png", 180, 180],
  ["og.svg", "og.png", 1200, 630],
];
// og.svg sets its text in the site's Google Fonts; load them so the PNG matches the page.
const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400&family=DynaPuff:wght@700&display=block">`;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [src, out, width, height] of jobs) {
  await page.setViewportSize({ width, height });
  await page.setContent(`${FONTS}<style>html,body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${readFileSync(src, "utf8")}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: true });
  console.log(`${src} -> ${out} (${width}x${height})`);
}
await browser.close();
