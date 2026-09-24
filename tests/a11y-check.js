/* Static a11y/hw contract check — runs with `npm run test:a11y`. No browser needed.
   Fails on regressions that previously shipped: focusable hidden modal/panels,
   missing error associations, unlabelled tables. */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "components.css"), "utf8");
const cjs = fs.readFileSync(path.join(root, "components.js"), "utf8");

const failures = [];
function check(name, cond, hint) {
  if (!cond) failures.push(name + " — " + hint);
}

// 1. Hidden modal/panels must not be focusable: CSS visibility + JS inert.
check("modal-visibility-css", css.includes(".modal-overlay") && css.includes("visibility: hidden"), "components.css must hide .modal-overlay with visibility");
check("tabpanel-visibility-css", css.includes('.tab-panel[aria-hidden="true"]') && css.includes("visibility:hidden") || css.includes("visibility: hidden"), "tab panels need visibility:hidden");
check("modal-inert-js", cjs.includes("overlay.inert"), "components.js must toggle overlay.inert");
check("panel-inert-js", cjs.includes("panel.inert"), "components.js must toggle panel.inert");
check("modal-boot-inert", html.includes('id="demo-modal"') && html.includes("inert"), "demo modal must ship inert+aria-hidden");

// 2. Form errors associated.
check("email-aria", html.includes('aria-describedby="email-error"') && html.includes('aria-invalid="true"'), "email input needs aria-invalid+describedby");

// 3. Tables scrollable + labelled.
check("table-wrap", html.includes("table-wrap") && html.includes('role="region"'), "tables need .table-wrap region");

// 4. Motion pack ships in the kit CSS (durations collapse under reduced-motion).
for (const token of ["ticker-tape", "draw-in", "tape-scroll", "sheen", "card-enter", "menu-in", "palette-in"]) {
  check("motion-" + token, css.includes(token), "components.css must contain " + token);
}
check("countup-js", cjs.includes("data-countup"), "components.js must wire [data-countup]");
check("countup-demo", html.includes("data-countup"), "index.html must demo count-up stats");
check("tilt-js", cjs.includes("data-tilt") && cjs.includes(".spotlight"), "components.js must wire tilt + spotlight");
check("tilt-demo", html.includes("data-tilt"), "index.html must demo tilt");
check("draw-js", cjs.includes("data-draw"), "components.js must wire draw-on");
check("draw-demo", html.includes("data-draw"), "index.html must demo draw-on");
check("scrollrule", cjs.includes("scroll-rule") && html.includes("scroll-rule"), "scroll rule needs JS + markup");

// 5. DataTable: styles + auto-wiring + demo markup.
check("datatable-css", css.includes(".datatable-bar") && css.includes("th[data-sort]"), "components.css must contain datatable styles");
check("datatable-js", cjs.includes("data-datatable") && cjs.includes("data-table-filter"), "components.js must wire [data-datatable]");
check("datatable-demo", html.includes("data-datatable") && html.includes("data-table-filter"), "index.html must demo the datatable");

// 6. Command palette: styles + wiring + markup.
check("palette-css", css.includes(".palette-overlay") && css.includes(".palette-list"), "components.css must contain palette styles");
check("palette-js", cjs.includes('getElementById("palette")'), "components.js must wire #palette");
check("palette-markup", html.includes('id="palette"') && html.includes("data-palette-open"), "index.html must contain palette markup + trigger");

// 7. Scroll reveals.
check("reveals-js", cjs.includes("reveal-on-scroll") && cjs.includes("IntersectionObserver"), "components.js must reveal on scroll");

// 5. Motion + focus.
check("reduced-motion", css.includes("prefers-reduced-motion"), "CSS must respect prefers-reduced-motion");
check("focus-visible", css.includes(":focus-visible"), "CSS must style :focus-visible");
check("skip-link", html.includes("skip-link") && html.includes("#main-content"), "skip link needed");

if (failures.length) {
  console.error("A11Y-CONTRACT FAIL (" + failures.length + "):\n - " + failures.join("\n - "));
  process.exit(1);
} else {
  console.log("A11Y-CONTRACT OK — " + new Date().toISOString());
}
