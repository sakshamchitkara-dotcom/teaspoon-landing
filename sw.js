// Offline support. Pages go network-first so visitors see edits right away;
// everything else is stale-while-revalidate, so it loads from cache and refreshes behind the scenes.
// ponytail: a stale asset can survive one extra visit after a deploy; bump VERSION to force a clean cache.
const VERSION = "teaspoon-v4";
const SHELL = [
  "./", "app.js", "data.js", "i18n.js", "favicon.svg",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png",
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.origin !== location.origin && !FONT_HOSTS.includes(url.hostname)) return;

  if (req.mode === "navigate") {
    // Saved-drink links carry a query string; offline they all get the cached page.
    // Only a good response for the page itself refreshes that copy, so a mistyped
    // URL (404) can't replace the page people see offline.
    const isHome = url.pathname === new URL("./", location).pathname;
    e.respondWith(fetch(req).then((res) => {
      if (res.ok && isHome) {
        const copy = res.clone();
        e.waitUntil(caches.open(VERSION).then((c) => c.put("./", copy)));
      }
      return res;
    }).catch(() => caches.match("./")));
    return;
  }

  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(req);
    const fresh = fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    });
    // An opaque copy (from a no-cors <link>) can't answer a CORS fetch of the same URL;
    // the browser would fail that request, so only no-cors requests may reuse it.
    if (hit && (hit.type !== "opaque" || req.mode === "no-cors")) { e.waitUntil(fresh.catch(() => {})); return hit; }
    return fresh;
  }));
});
