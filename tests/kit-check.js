/* kit-check — packaging gate. Verifies dist integrity (SRI recompute),
   the scaffolder end-to-end, and required ship files. Run: node tests/kit-check.js */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
let n = 0;
function ok(name, cond, hint) {
  n++;
  assert.ok(cond, "KIT-CHECK FAIL: " + name + " — " + hint);
  console.log("  ok " + n + " - " + name);
}

console.log("KIT-CHECK — packaging:");

// 1. dist bundle + minified variants exist.
for (const f of ["dist/blueprint.css", "dist/blueprint.js", "dist/blueprint.min.css", "dist/blueprint.min.js", "dist/manifest.json", "dist/integrity.json"]) {
  ok("dist-" + path.basename(f), fs.existsSync(path.join(root, f)), f + " must be built");
}

// 1b. Deep imports must resolve under strict bundlers (Vite 8/Rolldown
// failed on @chomuiro/saisei/dist/blueprint.css before "./dist/*" existed).
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
ok("exports-dist", pkg.exports && pkg.exports["./dist/*"] === "./dist/*", 'exports must map "./dist/*"');
ok("exports-adapters", pkg.exports && pkg.exports["./adapters/*"] === "./adapters/*", 'exports must map "./adapters/*"');

// 2. Minified is actually smaller and non-empty.
const css = fs.readFileSync(path.join(root, "dist/blueprint.css"), "utf8");
const cssMin = fs.readFileSync(path.join(root, "dist/blueprint.min.css"), "utf8");
const js = fs.readFileSync(path.join(root, "dist/blueprint.js"), "utf8");
const jsMin = fs.readFileSync(path.join(root, "dist/blueprint.min.js"), "utf8");
ok("min-smaller-css", cssMin.length > 0 && cssMin.length < css.length, "min css must be smaller");
ok("min-smaller-js", jsMin.length > 0 && jsMin.length < js.length, "min js must be smaller");

// 3. integrity.json hashes recompute exactly (SRI you can paste into <link>/<script>).
const integrity = JSON.parse(fs.readFileSync(path.join(root, "dist/integrity.json"), "utf8"));
for (const [f, claimed] of Object.entries(integrity)) {
  const content = fs.readFileSync(path.join(root, f));
  const actual = "sha384-" + crypto.createHash("sha384").update(content).digest("base64");
  ok("sri-" + path.basename(f), actual === claimed, f + " hash mismatch");
}

// 4. Scaffolder end-to-end into a temp dir.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bpk-"));
execFileSync(process.execPath, [path.join(root, "bin/init.js"), tmp], { stdio: "pipe" });
for (const f of ["blueprint.css", "blueprint.js", "index.html"]) {
  ok("scaffold-" + f, fs.existsSync(path.join(tmp, f)), "init must scaffold " + f);
}
const scaffolded = fs.readFileSync(path.join(tmp, "index.html"), "utf8");
ok("scaffold-refs", scaffolded.includes("blueprint.css") && scaffolded.includes("blueprint.js"), "scaffolded page must reference the kit");
fs.rmSync(tmp, { recursive: true, force: true });

// 5. Ship files: types, playground, license.
for (const f of ["react/index.d.ts", "adapters/react.d.ts", "adapters/vue.d.ts", "adapters/svelte.d.ts", "playground.html", "docs.html", "LICENSE", "CHANGELOG.md"]) {
  ok("ship-" + path.basename(f), fs.existsSync(path.join(root, f)), f + " must ship");
}

// 6. Preset themes build + tokens.json mirrors tokens.css.
const themes = JSON.parse(fs.readFileSync(path.join(root, "themes.json"), "utf8"));
for (const name of Object.keys(themes).filter((k) => !k.startsWith("_"))) {
  const f = `dist/theme-${name}.css`;
  const content = fs.readFileSync(path.join(root, f), "utf8");
  ok("theme-" + name, content.includes(":root") && content.includes('[data-theme="dark"]'), f + " must carry both themes");
  const claimed = integrity[`dist/theme-${name}.css`];
  const actual = "sha384-" + crypto.createHash("sha384").update(fs.readFileSync(path.join(root, f))).digest("base64");
  ok("sri-theme-" + name, actual === claimed, f + " hash mismatch");
}
const cssSrc = fs.readFileSync(path.join(root, "tokens.css"), "utf8");
const tokens = JSON.parse(fs.readFileSync(path.join(root, "tokens.json"), "utf8"));
const flat = {};
for (const group of Object.values(tokens)) {
  if (typeof group !== "object") continue;
  for (const [k, v] of Object.entries(group)) {
    if (v && typeof v.value === "string") flat["--" + k] = v.value;
  }
}
for (const [v, val] of [["--paper", "#FFFFFF"], ["--ink-soft", "#5F5F5F"], ["--radius-sm", "2px"], ["--duration-fast", "160ms"], ["--space-4", "16px"]]) {
  ok("tokens-" + v, cssSrc.includes(`${v}: ${flat[v]}`) && flat[v] === val, `tokens.json ${v} must equal tokens.css`);
}

console.log("KIT-CHECK OK — " + n + " checks.");
