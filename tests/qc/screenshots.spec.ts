import { test, expect } from "@playwright/test";

/**
 * Full-page screenshot QC.
 *
 * Adds a screenshot per (page × project). Output lands in:
 *   tests/qc/screenshots/<page-name>--<project-name>.png
 *
 * To add a route: extend the PAGES list below.
 * To customize per-product (other satellites adopting this config):
 *   replace the PAGES list with that satellite's public routes.
 */

type QcPage = {
  /** URL path relative to baseURL (e.g. "/pricing"). */
  path: string;
  /** Stable filename slug for the screenshot. */
  name: string;
  /** Optional CSS selector to wait for before snapping (handles SPA hydration timing). */
  waitFor?: string;
  /** Optional smoke-test heading text expected on the page. */
  expectText?: string;
};

const PAGES: QcPage[] = [
  { path: "/",                 name: "00-home",        expectText: "Seven16 Intel" },
  { path: "/pricing",          name: "01-pricing",     expectText: "Commercial-insurance" },
  { path: "/charter",          name: "02-charter",     expectText: "program has ended" },
  { path: "/verticals",        name: "03-verticals" },
  { path: "/methodology",      name: "04-methodology" },
  { path: "/resources",        name: "05-resources" },
  { path: "/use-cases",        name: "06-use-cases" },
  { path: "/enterprise",       name: "07-enterprise" },
  { path: "/about",            name: "08-about" },
  { path: "/faq",              name: "09-faq" },
  { path: "/privacy",          name: "10-privacy" },
  { path: "/terms",            name: "11-terms" },
  { path: "/sign-in",          name: "12-sign-in" },
  { path: "/sign-up",          name: "13-sign-up" },
  { path: "/account/delete",   name: "14-account-delete" },
];

for (const p of PAGES) {
  test(`${p.name}`, async ({ page }, testInfo) => {
    const response = await page.goto(p.path, { waitUntil: "domcontentloaded" });
    expect(response, `no response for ${p.path}`).not.toBeNull();
    // 307/308 on auth-gated routes is acceptable for QC; 5xx is not.
    const status = response!.status();
    expect(status, `unexpected status ${status} on ${p.path}`).toBeLessThan(500);

    // Wait for network to settle so above-the-fold finishes hydrating.
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {
      // Some SPA routes never reach networkidle (open WebSockets, polling). That's OK.
    });

    if (p.waitFor) {
      await page.waitForSelector(p.waitFor, { timeout: 5000 });
    }
    if (p.expectText) {
      await expect(page.locator(`text=${p.expectText}`).first()).toBeVisible({ timeout: 5000 });
    }

    const project = testInfo.project.name;
    const file = `tests/qc/screenshots/${p.name}--${project}.png`;
    await page.screenshot({ path: file, fullPage: true });
  });
}
