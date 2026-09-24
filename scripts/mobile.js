/* One-off mobile audit: 390px viewport, horizontal-overflow check + shots. */
const { chromium } = require("playwright");
const path = require("node:path");

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  for (const page of ["index.html", "playground.html", "docs.html"]) {
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:8000/${page}`, { waitUntil: "load" });
    await p.waitForTimeout(800);
    const overflow = await p.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      offenders: [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1);
        })
        .slice(0, 8)
        .map((el) => el.tagName.toLowerCase() + "." + String(el.className).split(" ").slice(0, 2).join(".")),
    }));
    console.log(page, "scrollW=" + overflow.scrollW, "innerW=" + overflow.innerW);
    console.log("  offenders:", JSON.stringify(overflow.offenders));
    await p.screenshot({ path: path.join(__dirname, "..", `assets/mobile-${page.replace(".html", ".png")}`) });
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
