/* Mobile overflow gate — no page may scroll sideways at 390px.
   Run: part of `npm run test:e2e`. Catches unwrapped flex rows,
   unshrinkable grid items, and wide fixed content. */
const { test, expect } = require("@playwright/test");

test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

for (const page of ["index.html", "playground.html", "docs.html"]) {
  test(`${page} fits 390px with no horizontal scroll`, async ({ page: p }) => {
    await p.goto(`/${page}`);
    const scrollW = await p.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(391);
  });
}
