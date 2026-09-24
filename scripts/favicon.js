const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 200, height: 200 } });
  await p.goto("file:///C:/Users/syedh/stock/assets/favicon.svg");
  await p.evaluate(() => {
    const svg = document.querySelector("svg");
    svg.setAttribute("width", "180");
    svg.setAttribute("height", "180");
  });
  const el = await p.locator("svg");
  await el.screenshot({ path: "assets/favicon-180.png" });
  await b.close();
  console.log("rasterized");
})().catch((e) => { console.error(e); process.exit(1); });
