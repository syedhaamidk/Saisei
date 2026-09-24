/* Real axe-core run against the rendered page (light, dark, modal-open).
   Run: npm run test:e2e (needs `npx playwright install chromium` once). */
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("index.html has no axe violations in light mode", async ({ page }) => {
  await page.goto("/index.html");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("no violations in dark mode", async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("no violations with modal open", async ({ page }) => {
  await page.goto("/index.html");
  await page.getByRole("button", { name: "Open modal" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("no violations in RTL", async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => { document.documentElement.dir = "rtl"; });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("no violations with drawer open", async ({ page }) => {
  await page.goto("/index.html");
  await page.getByRole("button", { name: "Open drawer" }).click();
  await expect(page.getByRole("dialog", { name: "Revision notes" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
test("playground has no violations", async ({ page }) => {
  await page.goto("/playground.html");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("no violations with palette open", async ({ page }) => {
  await page.goto("/index.html");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
