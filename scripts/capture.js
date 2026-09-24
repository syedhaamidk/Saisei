/* One-off asset capture: docs screenshots at a uniform 1280x800.
   Run: node scripts/capture.js (needs the repo served on :8000). Not part of CI. */
const { chromium } = require("playwright");
const path = require("node:path");

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce", colorScheme: "dark" });
  const shots = [
    ["http://127.0.0.1:8000/index.html", "assets/demo-kit.png", null],
    ["http://127.0.0.1:8000/playground.html", "assets/demo-playground.png", null],
    ["http://127.0.0.1:8000/docs.html", "assets/demo-docs.png", null],
    ["http://127.0.0.1:8000/index.html", "assets/demo-blueprint.png", "dist/theme-blueprint.css"],
  ];
  for (const [url, file, theme] of shots) {
    const p = await ctx.newPage();
    await p.goto(url, { waitUntil: "load" });
    if (theme) await p.addStyleTag({ path: path.join(__dirname, "..", theme) });
    await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(__dirname, "..", file) });
    console.log("shot", file);
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
