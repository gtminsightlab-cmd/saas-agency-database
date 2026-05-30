# Cross-browser QC — Playwright screenshot suite

One-command visual QC across Chromium / Firefox / WebKit, light / dark color schemes, desktop + mobile viewports. Catches brand-string drift, layout regressions, and cross-engine rendering bugs before customers see them.

---

## First-time setup (~2 min)

```powershell
npm install
npm run qc:install
```

The second command downloads the browser binaries (~500 MB; one-time per machine).

---

## Run the full sweep (~3-5 min)

```powershell
npm run qc
```

Defaults to the production hostname `https://seven16intel.com`. To target a different env:

```powershell
$env:QC_TARGET = "http://localhost:3000"; npm run qc
```

Or use the shortcut:

```powershell
npm run qc:local
```

(requires `npm run dev` already running in another terminal).

---

## See results

```powershell
npm run qc:report
```

Opens the Playwright HTML report — pass/fail per project, full-page screenshots embedded.

Raw screenshot files land at:

```
tests/qc/screenshots/<page>--<project>.png
```

For example:

```
tests/qc/screenshots/00-home--chromium-dark.png
tests/qc/screenshots/01-pricing--mobile-safari-light.png
```

---

## What the matrix covers

| Project | Browser engine | Color scheme | Viewport |
|---|---|---|---|
| `chromium-light` | Chromium (Chrome / Edge) | light | 1280×720 desktop |
| `chromium-dark` | Chromium | dark | 1280×720 desktop |
| `firefox-light` | Firefox | light | 1280×720 desktop |
| `firefox-dark` | Firefox | dark | 1280×720 desktop |
| `webkit-light` | WebKit (Safari engine) | light | 1280×720 desktop |
| `webkit-dark` | WebKit | dark | 1280×720 desktop |
| `mobile-chrome-light` | Chromium | light | Pixel 5 (393×851) |
| `mobile-chrome-dark` | Chromium | dark | Pixel 5 |
| `mobile-safari-light` | WebKit | light | iPhone 13 (390×844) |
| `mobile-safari-dark` | WebKit | dark | iPhone 13 |

10 projects × 15 pages = **150 screenshots per full run**.

---

## When to run

| Trigger | Why |
|---|---|
| Before merging a marketing-page PR | Catch regressions on legacy browsers / mobile |
| After a brand-string scrub | Verify no stale brand survives in screenshots |
| After a design-system change | Visual diff vs prior captures |
| After a Tailwind / theme refactor | Light/dark side-by-side |
| Before a charter outreach campaign launch | Customer-confidence pass |
| Anytime "looks fine on my machine" feels suspect | Single browser is never enough |

---

## Family-wide

This same config is the template for every Seven16 family product satellite. See
[`docs/cross-repo/playwright-qc-adoption.md`](../../docs/cross-repo/playwright-qc-adoption.md) for the per-satellite adoption guide.

The only file that customizes per product is `tests/qc/screenshots.spec.ts` — swap the `PAGES` array for that product's public routes. Everything else (config, scripts, matrix) is identical across the family.

---

## Adding a new page to QC

Open `tests/qc/screenshots.spec.ts` and append to the `PAGES` array:

```ts
{ path: "/new-route", name: "16-new-route" },
```

Optional fields:
- `waitFor`: CSS selector to wait for before snapping (handles SPA hydration)
- `expectText`: smoke-test heading visible on the page (test fails if missing)

The numeric prefix on `name` keeps screenshots sorted in the filesystem.

---

## Troubleshooting

**Screenshots blank / above-the-fold empty**

The page hasn't finished hydrating. Add a `waitFor` selector to that PAGES entry pointing at an element that only renders post-hydration.

**Test times out on networkidle**

The page has long-polling or WebSockets. That's already handled — the test catches the timeout and proceeds. If it consistently fails, add a `waitFor` with a more reliable signal.

**WebKit project fails on Windows / Linux**

WebKit on non-macOS Playwright is the engine, not full Safari. It's still useful for catching most Safari-class rendering bugs but won't catch macOS-specific font rendering. For full Safari fidelity, run on a Mac.

**"Browser binary not found"**

Run `npm run qc:install` once.
