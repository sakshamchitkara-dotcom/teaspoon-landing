# Teaspoon San Jose (concept landing page)

> Concept design — not affiliated with or endorsed by Teaspoon.

A portfolio concept for a boba shop landing page in San Jose, CA. No logos, photos,
or copy were taken from the real brand. All illustrations are hand-built SVG and CSS.

Live: https://sakshamchitkara-dotcom.github.io/teaspoon-landing/

## What's in it

- Hero with a pouring-cup illustration (the one page-load animation)
- Seasonal specials band that changes with the calendar
- Menu board rendered from data, filterable by milk tea, fruit tea, specialty, and toppings
- Build-your-drink: base, sweetness, ice, and up to 3 toppings with a live cup preview and summary
- "Save my drink": turns the current drink into a link you can bookmark or copy and send
- English, Español, and Tiếng Việt, with a picker that remembers your choice
- Works offline after the first visit and can be installed as an app
- San Jose story, illustrated social feed, visit info with a Google Maps search link, FAQ
- Light and dark themes (follows the OS, with a toggle), reduced-motion support, keyboard friendly

## Placeholders

Address, phone, hours, and Instagram handle are deliberately placeholders like `[address]`.
Edit them in one place: `SHOP` in [`data.js`](data.js). The sample menu and specials there
are invented for the concept and have no prices. The structured data in `index.html`
leaves out street address, phone, hours, and prices for the same reason.

## Editing content

| What | Where |
| --- | --- |
| Shop facts, menu ids and colors, builder options | `data.js` |
| Seasonal specials (`from` / `to` as `MM-DD`, may wrap past New Year) | `SPECIALS` in `data.js` |
| Every visible word, per language | `i18n.js` (English is the fallback for missing keys) |

To add a language, copy the `en` block in `i18n.js`, translate it, and add an `<option>`
to the `#lang` select in `index.html`. If its script needs glyphs the Latin fonts lack,
swap fonts with a `:lang()` rule the way Vietnamese does in the `<style>` block of `index.html`.

### Saved-drink links

`?base=taro&sweet=25&ice=0&top=pearls,jelly#build`. `ice` is 0 (none), 1 (less), or 2 (regular).
Unknown values fall back to the default drink, and toppings are capped at 3.

## Run locally

Zero build. Any static server works:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` from disk won't load the ES modules.)

The service worker caches the site after the first visit. If you edit files and see
old content, reload once, or bump `VERSION` in `sw.js`.

## Tests

```sh
npm ci
npx playwright install chromium
npm test
```

Playwright smoke tests (`tests/smoke.spec.js`) run on desktop and mobile Chromium: each
language in light and dark with [axe](https://github.com/dequelabs/axe-core) checks and
no console errors, the language picker, saved-drink links, the specials date logic,
and offline loading. GitHub Actions runs them on every push and pull request.

## Images

`icons/*.svg` and `og.svg` are the sources. After editing one, regenerate the PNGs
(app icons, Apple touch icon, and the 1200x630 social preview):

```sh
npm run rasterize
```

## SEO notes

`sitemap.xml` and `robots.txt` are included. Crawlers only read `robots.txt` at a host's
root, so on a GitHub Pages project site it is informational; the sitemap is also linked
from `index.html`.

## Files

- `index.html` page structure, meta tags, structured data, and all styles (inlined in `<style>` so first paint needs one request)
- `data.js` shop config, menu, builder options, seasonal specials
- `i18n.js` all copy in English, Spanish, and Vietnamese
- `app.js` renders every section, language picker, saved-drink links, service worker registration
- `sw.js` offline cache
- `manifest.webmanifest`, `icons/` installable app
- `og.svg` / `og.png` social preview image
- `scripts/rasterize.mjs` SVG to PNG
- `tests/`, `playwright.config.js`, `.github/workflows/smoke.yml` smoke tests and CI
