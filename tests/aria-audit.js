/* ARIA audit — static checks for landmark/headings/labels discipline.
   Runs with plain node (no browser): node tests/aria-audit.js */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

let n = 0;
function ok(name, cond, hint) {
  n++;
  assert.ok(cond, "ARIA-AUDIT FAIL: " + name + " — " + hint);
  console.log("  ok " + n + " - " + name);
}

console.log("ARIA-AUDIT — index.html:");

// 0. Tag balance: every close must match the open top (catches stray
// closers that pop landmarks — browsers obey </div> when a div is in scope).
const STACKED = new Set(["div", "section", "main", "ul", "ol", "li", "nav", "form", "table", "thead", "tbody", "tr", "button", "span", "a", "p", "h1", "h2", "h3"]);
const stack = [];
const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
let m2, bad = null;
const stripped = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
while ((m2 = tagRe.exec(stripped))) {
  const full = m2[0], tag = m2[1].toLowerCase();
  if (!STACKED.has(tag) || /\/>$/.test(full)) continue;
  if (full[1] === "/") {
    if (stack.length && stack[stack.length - 1] === tag) stack.pop();
    else if (!bad) bad = `stray </${tag}> with <${stack[stack.length - 1] || "nothing"}> open`;
  } else stack.push(tag);
}
ok("tag-balance", !bad && stack.length === 0, bad || "unclosed: " + stack.join(", "));

// 1. Document + landmarks.
ok("html-lang", /<html[^>]*lang="en"/.test(html), "html needs lang=en");
ok("single-main", (html.match(/<main\b/g) || []).length === 1, "exactly one <main>");
ok("nav-labelled", /<nav[^>]*aria-label=/.test(html), "nav needs aria-label");
ok("skip-link", html.includes('class="skip-link"') && html.includes('href="#main-content"'), "skip link to #main-content");

// 2. Headings: exactly one h1, no skipped levels in demo sections.
ok("single-h1", (html.match(/<h1\b/g) || []).length === 1, "exactly one h1");
const levels = [...html.matchAll(/<h([1-3])\b/g)].map((m) => Number(m[1]));
let ordered = true;
for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) ordered = false;
ok("heading-order", ordered, "headings must not skip levels");

// 3. Every input/select/textarea has an associated label (for= or wrapping).
const fields = [...html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)];
const missing = fields.filter((m) => {
  const attrs = m[2];
  const id = (attrs.match(/\sid="([^"]+)"/) || [])[1];
  if (m[1] === "input" && /type="(hidden|submit|button)"/.test(attrs)) return false;
  if (/aria-label=/.test(attrs) || /aria-labelledby=/.test(attrs)) return false;
  if (id && html.includes(`for="${id}"`)) return false;
  return true;
});
ok("fields-labelled", missing.length === 0, missing.length + " field(s) without label: " + missing.map((m) => m[0].slice(0, 60)).join(" | "));

// 4. Buttons all named (text or aria-label).
const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
const unnamed = buttons.filter((m) => m[2].replace(/<[^>]+>/g, "").trim() === "" && !/aria-label=/.test(m[1]));
ok("buttons-named", unnamed.length === 0, unnamed.length + " unnamed button(s)");

// 5. Toasts announce via live regions (region is created by components.js).
const cjs = fs.readFileSync(path.join(root, "components.js"), "utf8");
ok("live-regions", html.includes('aria-live="polite"') || (cjs.includes('aria-live') && cjs.includes('role", "status"')), "toasts need an aria-live polite status region");

// 6. Dialogs: modal roles + focus guards.
ok("dialog-roles", (html.match(/role="dialog"/g) || []).length >= 1, "demo dialog needs role=dialog");
ok("aria-modal", html.includes('aria-modal="true"'), "dialogs need aria-modal");

// 7. Tables have scope=col headers and labelled scroll regions.
const thTags = [...html.matchAll(/<th[\s>][^>]*>/g)];
const unscoped = thTags.filter((m) => !/scope=/.test(m[0]));
ok("th-scope", unscoped.length === 0, unscoped.length + " th without scope");
ok("table-regions", (html.match(/role="region"/g) || []).length >= 1, "scrollable tables need role=region + aria-label");

console.log("ARIA-AUDIT OK — " + n + " checks.");
