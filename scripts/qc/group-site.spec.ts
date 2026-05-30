/**
 * QC screenshots — Seven16 Group Site
 *
 * Run:  npm run qc:group-site
 * Prerequisite: `npm run dev` running in seven16-group-site on port 3000
 */
import { test } from "@playwright/test";
import { mkdirSync } from "fs";

const PRODUCT = "seven16-group-site";
const BASE_URL = process.env.QC_BASE_URL ?? "http://localhost:3000";

const PAGES = [
  { path: "/site", label: "marketing-home" },
  { path: "/site/about", label: "about" },
  { path: "/site/products", label: "products" },
  { path: "/site/consulting", label: "consulting" },
  { path: "/hub/login", label: "hub-login" },
  { path: "/hub/apply", label: "apply" },
];

for (const { path, label } of PAGES) {
  test(`${PRODUCT} › ${label}`, async ({ page }, testInfo) => {
    const dir = `qc-screenshots/${PRODUCT}/${testInfo.project.name}`;
    mkdirSync(dir, { recursive: true });

    await page.goto(BASE_URL + path);
    await page.waitForLoadState("networkidle");

    const screenshotPath = `${dir}/${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach(label, { path: screenshotPath, contentType: "image/png" });
  });
}
