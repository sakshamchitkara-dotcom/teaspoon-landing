# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- The smoke tests also run in Firefox, desktop WebKit, and an iPhone 13 WebKit profile, locally and in CI.

### Changed
- Tests ignore console errors from Google Fonts downloads that fail or are cut off by a navigation (Firefox logs these; they are network noise, not page errors).
- The offline test is skipped in WebKit: Playwright's offline mode there blocks navigations before the service worker sees them.

## [0.3.0] - 2026-09-25

### Added
- "Find your drink" quiz: four questions map to a builder drink, shown with the same cup and summary, with a link that opens it in the builder.
- Allergen and caffeine toggle on the menu. Sample notes, labeled as not checked against a real recipe; calories stay a `[calories]` placeholder.
- Print stylesheet and a "Print the menu" button: all categories, allergen notes, and the non-affiliation note, nothing else.
- Stamp card demo under Visit. Counts stamps in this browser only and says they are worth nothing.
- The feed is now a scroll-snap carousel with previous/next buttons, a position status, and keyboard scrolling. No autoplay.
- A 404 page in the site's style (GitHub Pages serves it for missing URLs).
- Smoke tests for all of the above, plus the service worker fixes below.

### Changed
- The stylesheet is inlined into `index.html`, removing the only render-blocking request. Live Lighthouse mobile before: 91, 100, 100 (FCP 2.8 s on the slow run). After: 100 on five of five runs, FCP and LCP 0.9 to 1.0 s.

### Fixed
- The service worker stored every navigation as the offline page, so a mistyped URL replaced it with a 404.
- The service worker answered CORS requests for the font stylesheet with an opaque cached copy, which failed.
- The offline test could go offline before fonts were cached, which failed CI once.

## [0.2.0] - 2026-09-25

### Added
- Language picker with English, Español, and Tiếng Việt. Copy lives in `i18n.js`; the choice is remembered and sets the page's `lang`.
- Vietnamese uses Baloo 2 and Lexend, since the Latin display and body fonts have no Vietnamese glyphs.
- Seasonal specials band driven by yearly date ranges in `data.js`.
- "Save my drink": a shareable link that restores the builder, with a copy button.
- Installable web app: manifest, SVG and PNG icons, and a service worker for offline use.
- Open Graph image and social tags, LocalBusiness structured data (concept-labeled, unknown fields omitted), sitemap, and robots.txt.
- Playwright + axe smoke tests and a GitHub Actions workflow that runs them.

### Changed
- Google Fonts no longer block first paint; scripts are modulepreloaded. Lighthouse mobile performance went from 94 to 100 locally.

## [0.1.0] - 2026-09-25

### Added
- First concept: hero, menu board with filters, build-your-drink, San Jose story, illustrated feed, visit info, FAQ, footer with the non-affiliation note, and light/dark themes.
