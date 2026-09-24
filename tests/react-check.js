/* test:react — compile-checks every react/*.jsx with esbuild (no bundling).
   Run: npm run test:react (requires devDependencies installed). */
const esbuild = require("esbuild");
const fs = require("node:fs");
const path = require("node:path");

(async () => {
  const dir = path.join(__dirname, "..", "react");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsx") && !f.endsWith(".test.jsx"));
  if (!files.length) throw new Error("no JSX files in react/");
  for (const f of files) {
    await esbuild.transform(fs.readFileSync(path.join(dir, f), "utf8"), { loader: "jsx" });
    console.log("  ok - " + f);
  }
  // index.js must re-export every component file.
  const index = fs.readFileSync(path.join(dir, "index.js"), "utf8");
  const missing = files
    .map((f) => "./" + f)
    .filter((imp) => !index.includes(imp));
  if (missing.length) throw new Error("index.js missing exports: " + missing.join(", "));
  console.log("  ok - index.js exports all " + files.length + " components");
  console.log("REACT-CHECK OK");
})().catch((e) => { console.error("REACT-CHECK FAIL: " + e.message); process.exit(1); });
