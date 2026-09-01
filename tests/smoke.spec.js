import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Fail on anything the page logs as an error or throws. (One test at a time per worker.)
let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
});
test.afterEach(() => { expect(errors, "console errors").toEqual([]); });

for (const [lang, heading] of [["en", "Build your drink"], ["es", "Arma tu bebida"], ["vi", "Tự pha đồ uống"]]) {
  for (const theme of ["light", "dark"]) {
    test(`${lang} ${theme}: renders and has no axe violations`, async ({ page }) => {
      await page.addInitScript(([l, t]) => { localStorage.setItem("lang", l); localStorage.setItem("theme", t); }, [lang, theme]);
      await page.goto("./");
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator("#build-title")).toHaveText(heading);
      await expect(page.locator(".board > li")).toHaveCount(14);
      await expect(page.locator("#specials-list li").first()).toBeVisible();
      await expect(page.locator(".foot__note")).toContainText("Teaspoon");
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    });
  }
}

test("language picker updates lang and is remembered", async ({ page }) => {
  await page.goto("./");
  await page.selectOption("#lang", "vi");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.locator("#menu-title")).toHaveText("Trên bảng");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.locator("#lang")).toHaveValue("vi");
});

test("saved drink link restores the drink", async ({ page }) => {
  await page.goto("./");
  await page.check('input[name="base"][value="taro"]');
  await page.check('input[name="sweet"][value="25"]');
  await page.check('input[name="top"][value="jelly"]');
  await page.click("#save");
  const url = await page.inputValue("#share-url");
  expect(url).toContain("?base=taro&sweet=25&ice=1&top=pearls,jelly#build");
  await page.goto(url);
  await expect(page.locator("#summary")).toHaveText("Taro 25% sweet, less ice, with tapioca pearls and lychee jelly.");
  // hand-edited junk falls back to the defaults
  await page.goto("./?base=nope&sweet=7&ice=9&top=x,x,x,x");
  await expect(page.locator("#summary")).toHaveText("Black milk tea 50% sweet, less ice, no toppings.");
});

test("seasonal specials follow the calendar, including across New Year", async ({ page }) => {
  await page.goto("./");
  const at = (d) => page.evaluate(async (d) => {
    const { specialsOn } = await import("./app.js");
    const r = specialsOn(new Date(`${d}T12:00`));
    return [r.now.map((s) => s.id), r.next?.id];
  }, d);
  expect(await at("2026-09-25")).toEqual([["horchata"], "persimmon"]);
  expect(await at("2026-12-10")).toEqual([["persimmon", "ginger"], "strawberry"]);
  expect(await at("2027-01-15")).toEqual([["ginger"], "strawberry"]);
  expect(await at("2026-08-31")).toEqual([["watermelon"], "horchata"]);
});

test("works offline after the first visit", async ({ page, context }) => {
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.goto("./?base=mango&sweet=0&ice=2&top=crystal#build");
  await expect(page.locator("#summary")).toHaveText("Mango green 0% sweet, regular ice, with crystal boba.");
  await context.setOffline(false);
});

test("a missing page doesn't replace the offline copy", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.goto("./no-such-page");
  errors.length = 0; // the 404 itself is logged as a failed load; that's expected here
  await page.waitForTimeout(300); // give a (buggy) background cache write time to land
  // Checked in the cache directly: offline, the browser's HTTP cache can mask a bad copy.
  const cached = await page.evaluate(async () => (await caches.match("./")).status);
  expect(cached).toBe(200);
});

test("404 page links home, keeps the disclaimer, and has no axe violations", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("./404.html");
    await expect(page.locator("h1")).toHaveText("This cup is empty.");
    await expect(page.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/teaspoon-landing/");
    await expect(page.locator("footer")).toContainText("not affiliated with or endorsed by Teaspoon");
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => v.id)).toEqual([]);
  }
});

test("allergen toggle shows the sample notes", async ({ page }) => {
  await page.goto("./");
  const pudding = page.locator(".board > li", { hasText: "Egg pudding" }).locator(".info");
  await expect(pudding).toBeHidden();
  await page.click("#info-toggle");
  await expect(page.locator("#info-toggle")).toHaveAttribute("aria-pressed", "true");
  await expect(pudding).toHaveText(["Egg, Milk", "No caffeine", "[calories] calories"].join(""));
  await expect(page.locator(".info-note")).toContainText("not checked against a real recipe");
  // survives a category change and a language change
  await page.click('.chip[data-cat="fruit"]');
  await expect(page.locator(".board .info").first()).toContainText("No milk or egg");
  await page.selectOption("#lang", "es");
  await expect(page.locator(".board .info").first()).toContainText("Sin leche ni huevo");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});

test("print shows the whole menu with allergen notes and nothing else", async ({ page }) => {
  await page.goto("./");
  await page.click('.chip[data-cat="fruit"]');
  await page.evaluate(() => dispatchEvent(new Event("beforeprint")));
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".board > li")).toHaveCount(14);
  await expect(page.locator(".board .info").first()).toBeVisible();
  await expect(page.locator(".hero")).toBeHidden();
  await expect(page.locator("#build")).toBeHidden();
  await expect(page.locator(".menu__tools")).toBeHidden();
  await expect(page.locator(".foot__note")).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => dispatchEvent(new Event("afterprint")));
  await expect(page.locator(".board > li")).toHaveCount(3);
});

test("quiz turns four answers into a drink the builder can open", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#quiz-result")).toContainText("Answer all four");
  await page.click("#quiz-form .btn"); // unanswered: native validation keeps the empty state
  await expect(page.locator("#quiz-result")).toContainText("Answer all four");
  for (const [q, a] of [["flavor", "creamy"], ["sweet", "low"], ["chew", "silky"], ["day", "cold"]]) {
    await page.check(`#quiz-form input[name="${q}"][value="${a}"]`);
  }
  await page.click("#quiz-form .btn");
  await expect(page.locator("#quiz-result .preview__summary")).toHaveText("Taro 25% sweet, no ice, with egg pudding.");
  await page.selectOption("#lang", "es");
  await expect(page.locator("#quiz-result .preview__summary")).toHaveText("Taro 25% de dulzura, sin hielo, con flan de huevo.");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.click("#quiz-result a");
  await expect(page).toHaveURL(/\?base=taro&sweet=25&ice=0&top=pudding#build$/);
  await expect(page.locator("#summary")).toHaveText("Taro 25% de dulzura, sin hielo, con flan de huevo.");
});

test("a CORS fetch of a cached font stylesheet still works", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForLoadState("networkidle"); // the <link> has now cached an opaque copy
  const href = await page.locator("link[rel=preload][as=style], link[rel=stylesheet][href*=fonts]").first().getAttribute("href");
  const ok = await page.evaluate((u) => fetch(u).then((r) => r.ok, () => false), href);
  expect(ok).toBe(true);
});

test("stamp card demo counts, remembers, fills up, and resets", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".stamps")).toContainText("aren't worth anything");
  await expect(page.locator("#stamp-status")).toHaveText("0 of 10 stamps");
  for (let i = 0; i < 3; i++) await page.click("#stamp-add");
  await page.reload();
  await expect(page.locator("#stamp-status")).toHaveText("3 of 10 stamps");
  await expect(page.locator("#stamp-grid .is-on")).toHaveCount(3);
  for (let i = 0; i < 7; i++) await page.click("#stamp-add");
  await expect(page.locator("#stamp-status")).toContainText("only a demo");
  await expect(page.locator("#stamp-add")).toBeDisabled();
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await page.click("#stamp-reset");
  await expect(page.locator("#stamp-status")).toHaveText("0 of 10 stamps");
  await expect(page.locator("#stamp-add")).toBeFocused();
  // junk in storage is clamped, not trusted
  await page.evaluate(() => localStorage.setItem("stamps", "999"));
  await page.reload();
  await expect(page.locator("#stamp-grid .is-on")).toHaveCount(10);
});

test("gallery carousel moves one post at a time and reports where it is", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); // instant scrolling keeps the checks simple
  await page.goto("./");
  const status = page.locator("#feed-status");
  await expect(status).toHaveText(isMobile ? "Post 1 of 6" : "Posts 1 to 3 of 6");
  await expect(page.locator("#feed-prev")).toBeDisabled();
  await page.click("#feed-next");
  await expect(status).toHaveText(isMobile ? "Post 2 of 6" : "Posts 2 to 4 of 6");
  await expect(page.locator("#feed-prev")).toBeEnabled();
  // keyboard: the focused track scrolls with the arrow keys and snaps to the next post
  await page.focus("#feed");
  await page.keyboard.press("ArrowRight");
  await expect(status).toHaveText(isMobile ? "Post 3 of 6" : "Posts 3 to 5 of 6");
  const last = isMobile ? 3 : 1;
  for (let i = 0; i < last; i++) await page.click("#feed-next");
  await expect(page.locator("#feed-next")).toBeDisabled();
  await expect(status).toHaveText(isMobile ? "Post 6 of 6" : "Posts 4 to 6 of 6");
  await expect(page.locator("#feed > li")).toHaveCount(6);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});
