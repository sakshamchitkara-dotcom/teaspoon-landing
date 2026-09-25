# Teaspoon San Jose (concept landing page)

> Concept design — not affiliated with or endorsed by Teaspoon.

A portfolio concept for a boba shop landing page in San Jose, CA. No logos, photos,
or copy were taken from the real brand. All illustrations are hand-built SVG and CSS.

## What's in it

- Hero with a pouring-cup illustration (the one page-load animation)
- Menu board rendered from data, filterable by milk tea, fruit tea, specialty, and toppings
- Build-your-drink: base, sweetness, ice, and up to 3 toppings with a live cup preview and summary
- San Jose story, illustrated social feed, visit info with a Google Maps search link, FAQ
- Light and dark themes (follows the OS, with a toggle), reduced-motion support, keyboard friendly

## Placeholders

Address, phone, hours, and Instagram handle are deliberately placeholders like `[address]`.
Edit them in one place: `SHOP` in [`data.js`](data.js). The sample menu there is invented
for the concept and has no prices.

## Run locally

Zero build. Any static server works:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` from disk won't load the ES module.)

## Files

- `index.html` page structure
- `styles.css` design tokens and styles
- `data.js` shop config, menu, and builder options
- `app.js` renders the menu, builder, gallery, and shop facts
