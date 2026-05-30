/**
 * QC screenshots — Bind Lab
 *
 * Run:  npm run qc:bindlab
 * Prerequisite: `npm run dev` running in bindlab on port 3000
 */
import { test } from "@playwright/test";
import { mkdirSync } from "fs";

const PRODUCT = "bindlab";
const BASE_URL = process.env.QC_BASE_URL ?? "http://localhost:3000";

const PAGES = [
  { path: "/request-access", label: "request-access" },
  { path: "/signup", label: "signup" },
  { path: "/awaiting-approval", label: "awaiting-approval" },
  { path: "/privacy", label: "privacy" },
  { path: "/terms", label: "terms" },
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
