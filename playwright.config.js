const { defineConfig } = require("@playwright/test");

/* Serves the repo root with python (present on CI runners + this machine)
   and runs axe against the real rendered page.
   reducedMotion: axe must snapshot settled final states, not mid-flight
   animation frames (320ms entrances, overlay fades). Our CSS collapses all
   motion under prefers-reduced-motion, so this is exactly what
   reduced-motion users get — deterministic and honest. */
module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  use: { baseURL: "http://localhost:8000", reducedMotion: "reduce" },
  webServer: {
    command: "python3 -m http.server 8000",
    url: "http://localhost:8000/index.html",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
