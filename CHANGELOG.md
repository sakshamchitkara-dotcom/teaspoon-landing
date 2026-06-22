# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
