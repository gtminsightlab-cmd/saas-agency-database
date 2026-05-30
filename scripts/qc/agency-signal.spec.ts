/**
 * QC screenshots — Agency Signal
 *
 * Run:  npm run qc:agency-signal
 * Prerequisite: `npm run dev` running in saas-agency-database on port 3000
 */
import { test } from "@playwright/test";
import { mkdirSync } from "fs";

const PRODUCT = "agency-signal";
const BASE_URL = process.env.QC_BASE_URL ?? "http://localhost:3000";

const PAGES = [
  { path: "/", label: "home" },
  { path: "/sign-in", label: "sign-in" },
  { path: "/pricing", label: "pricing" },
  { path: "/about", label: "about" },
  { path: "/admin", label: "admin-hub" },
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
