const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, colorScheme: "dark" });
  for (const page of ["index.html", "docs.html"]) {
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:8000/${page}`, { waitUntil: "load" });
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const hits = [];
      const all = document.querySelectorAll("body *");
      for (const el of all) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.position === "fixed") continue;
        if (cs.visibility === "hidden" && el.closest(".palette-overlay,.modal-overlay,.drawer-overlay")) continue;
        const rect = el.getBoundingClientRect();
        if (rect.right > 391 && rect.width > 0) {
          hits.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}#${el.id} right=${Math.round(rect.right)} w=${Math.round(rect.width)} vis=${cs.visibility} pos=${cs.position}`);
          if (hits.length > 14) break;
        }
      }
      return hits;
    });
    console.log("== " + page);
    r.forEach((l) => console.log("  " + l));
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
