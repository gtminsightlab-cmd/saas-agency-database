/**
 * Playwright QC Config — Seven16 Family Hub
 *
 * Covers 8 browser + color-scheme + device combos for visual cross-browser QC.
 * Run:  npm run qc:<product>   (see package.json for the full list)
 *
 * Browsers are downloaded once via:  npx playwright install
 * Screenshots land in:  qc-screenshots/<product>/<project-name>/<page>.png
 * HTML report opens automatically after each run.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./scripts/qc",
  // Retry once on flaky navigation (network-idle wait can be slow locally)
  retries: 1,
  // Run all projects in parallel for speed
  fullyParallel: true,
  reporter: [
    ["list"],
    ["html", { outputFolder: "qc-report", open: "on-failure" }],
  ],
  use: {
    // Auto-attach screenshot at end of every test (shows in HTML report)
    screenshot: "only-on-failure",
    video: "off",
    // Give slow dev-server pages time to hydrate
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  projects: [
    // ── Desktop browsers ────────────────────────────────────────────────────
    {
      name: "chromium-light",
      use: { ...devices["Desktop Chrome"], colorScheme: "light" },
    },
    {
      name: "chromium-dark",
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
    },
    {
      name: "firefox-light",
      use: { ...devices["Desktop Firefox"], colorScheme: "light" },
    },
    {
      name: "firefox-dark",
      use: { ...devices["Desktop Firefox"], colorScheme: "dark" },
    },
    {
      name: "webkit-light",
      use: { ...devices["Desktop Safari"], colorScheme: "light" },
    },
    {
      name: "webkit-dark",
      use: { ...devices["Desktop Safari"], colorScheme: "dark" },
    },
    // ── Mobile (iPhone 14 Pro — 393 × 852 logical px) ───────────────────────
    {
      name: "iphone-light",
      use: { ...devices["iPhone 14 Pro"], colorScheme: "light" },
    },
    {
      name: "iphone-dark",
      use: { ...devices["iPhone 14 Pro"], colorScheme: "dark" },
    },
  ],
});
