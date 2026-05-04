// Renders the SVG sources to the PNGs that browsers and link previews need.
// Run after editing any of the SVGs: npm run rasterize
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const jobs = [
  ["icons/icon.svg", "icons/icon-192.png", 192, 192],
  ["icons/icon.svg", "icons/icon-512.png", 512, 512],
  ["icons/icon-maskable.svg", "icons/icon-maskable-512.png", 512, 512],
  ["icons/icon-maskable.svg", "icons/apple-touch-icon.png", 180, 180],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [src, out, width, height] of jobs) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${readFileSync(src, "utf8")}`);
  await page.screenshot({ path: out, omitBackground: true });
  console.log(`${src} -> ${out} (${width}x${height})`);
}
await browser.close();
