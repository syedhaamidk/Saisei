/* ssr-check — importing components.js must never throw without a DOM
   (Next.js / Remix / plain node). Run: node tests/ssr-check.js */
const assert = require("node:assert/strict");

assert.equal(typeof document, "undefined", "precondition: no DOM in this process");
assert.equal(typeof window, "undefined", "precondition: no window in this process");

let threw = null;
try {
  require("../components.js");
} catch (e) {
  threw = e;
}
assert.equal(threw, null, "components.js must import cleanly without a DOM, threw: " + threw);

console.log("SSR-CHECK OK — components.js imports with no document/window.");
