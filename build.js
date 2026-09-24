/* build.js — bundles the kit into dist/. Requires devDependencies (esbuild)
   for minified output + SRI hashes. Run: npm run build. */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = __dirname;
const pkg = require(path.join(root, "package.json"));
const banner = `/*! ${pkg.name} v${pkg.version} — Blueprint kit. MIT. See README "Reuse in any website". */\n`;

function read(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function write(p, content) {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("wrote", p, "(" + Buffer.byteLength(content) + " bytes)");
}
function sri(content) {
  return "sha384-" + crypto.createHash("sha384").update(content).digest("base64");
}

// Core kit: one stylesheet + one script = drop into any site.
const css = banner + read("tokens.css") + "\n" + read("components.css");
const js = banner + read("components.js");
write("dist/blueprint.css", css);
write("dist/blueprint.js", js);

// Minified variants + integrity manifest (esbuild, devDependency).
const esbuild = require("esbuild");
const cssMin = esbuild.transformSync(css, { loader: "css", minify: true }).code;
const jsMin = esbuild.transformSync(js, { loader: "js", minify: true }).code;
write("dist/blueprint.min.css", cssMin);
write("dist/blueprint.min.js", jsMin);

const integrity = {
  "dist/blueprint.css": sri(css),
  "dist/blueprint.js": sri(js),
  "dist/blueprint.min.css": sri(cssMin),
  "dist/blueprint.min.js": sri(jsMin)
};
write("dist/integrity.json", JSON.stringify(integrity, null, 2) + "\n");

// Preset themes from themes.json (source of truth; playground mirrors them).
const themes = JSON.parse(read("themes.json"));
for (const [name, preset] of Object.entries(themes)) {
  if (name.startsWith("_")) continue;
  const block = (sel, vars) =>
    sel + " {\n" + Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n") + "\n}\n";
  const out = banner + `/* Preset: ${preset.label}. Include after blueprint.css. */\n` +
    block(":root", preset.light) + block('[data-theme="dark"]', preset.dark);
  write(`dist/theme-${name}.css`, out);
  integrity[`dist/theme-${name}.css`] = sri(out);
}
write("dist/integrity.json", JSON.stringify(integrity, null, 2) + "\n");

write("dist/manifest.json", JSON.stringify({
  name: pkg.name, version: pkg.version,
  kit: ["dist/blueprint.css", "dist/blueprint.js"]
}, null, 2) + "\n");

console.log("build ok — copy dist/blueprint.css + dist/blueprint.js into any website.");
