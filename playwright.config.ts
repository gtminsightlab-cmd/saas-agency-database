import { defineConfig, devices } from "@playwright/test";

/**
 * Cross-browser QC screenshot suite.
 *
 * `npm run qc` runs every page in tests/qc/screenshots.spec.ts across:
 *   - 3 desktop browsers (Chromium / Firefox / WebKit) × 2 color schemes
 *   - 2 mobile devices (Pixel 5 / iPhone 13) × 2 color schemes
 *   = 10 projects total
 *
 * Target defaults to the production hostname. Override with QC_TARGET:
 *   QC_TARGET=http://localhost:3000 npm run qc
 *
 * View results: `npm run qc:report` (opens the HTML report).
 *
 * Family-wide adoption guidance: docs/cross-repo/playwright-qc-adoption.md
 */
export default defineConfig({
  testDir: "./tests/qc",
  timeout: 45 * 1000,
  expect: { timeout: 10 * 1000 },
  retries: 0,
  // Cap parallelism so the screenshot folder writes don't thrash the disk.
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL: process.env.QC_TARGET ?? "https://seven16intel.com",
    trace: "off",
    screenshot: "off", // Tests call page.screenshot() explicitly per project.
    video: "off",
    actionTimeout: 10 * 1000,
    navigationTimeout: 20 * 1000,
  },
  projects: [
    // ---------- Desktop ----------
    { name: "chromium-light",  use: { ...devices["Desktop Chrome"],  colorScheme: "light" } },
    { name: "chromium-dark",   use: { ...devices["Desktop Chrome"],  colorScheme: "dark"  } },
    { name: "firefox-light",   use: { ...devices["Desktop Firefox"], colorScheme: "light" } },
    { name: "firefox-dark",    use: { ...devices["Desktop Firefox"], colorScheme: "dark"  } },
    { name: "webkit-light",    use: { ...devices["Desktop Safari"],  colorScheme: "light" } },
    { name: "webkit-dark",     use: { ...devices["Desktop Safari"],  colorScheme: "dark"  } },
    // ---------- Mobile ----------
    { name: "mobile-chrome-light", use: { ...devices["Pixel 5"],   colorScheme: "light" } },
    { name: "mobile-chrome-dark",  use: { ...devices["Pixel 5"],   colorScheme: "dark"  } },
    { name: "mobile-safari-light", use: { ...devices["iPhone 13"], colorScheme: "light" } },
    { name: "mobile-safari-dark",  use: { ...devices["iPhone 13"], colorScheme: "dark"  } },
  ],
});
