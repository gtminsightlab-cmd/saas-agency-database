/**
 * QC screenshots — Seven16 Academy
 *
 * Run:  npm run qc:academy
 * Prerequisite: `npm run dev` running in Seven16 Lead Stack on port 3000
 */
import { test } from "@playwright/test";
import { mkdirSync } from "fs";

const PRODUCT = "seven16-academy";
const BASE_URL = process.env.QC_BASE_URL ?? "http://localhost:3000";

const PAGES = [
  { path: "/", label: "home" },
  { path: "/signin", label: "signin" },
  { path: "/onboarding", label: "onboarding" },
  { path: "/coaches", label: "coaches" },
  { path: "/coaches/trucking-producer", label: "coach-trucking" },
  { path: "/coaches/commercial-lines", label: "coach-commercial-lines" },
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
