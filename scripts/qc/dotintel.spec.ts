/**
 * QC screenshots — DOT Intel
 *
 * Run:  npm run qc:dotintel
 * Prerequisite: `npm run dev` running in dotintel2 on port 3000
 */
import { test } from "@playwright/test";
import { mkdirSync } from "fs";

const PRODUCT = "dotintel";
const BASE_URL = process.env.QC_BASE_URL ?? "http://localhost:3000";

const PAGES = [
  { path: "/", label: "home" },
  { path: "/login", label: "login" },
  { path: "/pricing", label: "pricing" },
  { path: "/dashboard", label: "dashboard" },
  { path: "/about", label: "about" },
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
