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
      await expect(page.locator(".board li")).toHaveCount(14);
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
