# Family-wide Playwright QC adoption — paste-ready

**Source of truth:** the canonical config + test + npm scripts live in `saas-agency-database` (the Seven16 Intel repo). This doc tells every satellite session how to adopt the same pattern with minimal local customization.

**Why:** every Seven16 family product ships marketing pages + auth pages + admin pages. Brand-string drift, cross-engine rendering bugs, light/dark-mode regressions, and mobile-viewport overflow all live in the gap between "looks fine in Chrome on my laptop" and "the customer sees a broken layout in Safari at 390px." The same Playwright matrix below catches every class of bug across every product without each satellite reinventing the wheel.

---

## What to install in each satellite

```bash
npm install --save-dev @playwright/test
npx playwright install
```

The browser binaries (~500 MB) are downloaded once per machine and shared across all satellites that adopt this.

---

## What to copy

Four files. Copy them verbatim from `saas-agency-database`, change ONLY the `PAGES` array inside `tests/qc/screenshots.spec.ts` to match the satellite's public routes.

| File | Customize? |
|---|---|
| `playwright.config.ts` | No — copy verbatim. The 10-project matrix is the family standard. |
| `tests/qc/screenshots.spec.ts` | **Yes — replace the `PAGES` array** with the satellite's routes. |
| `tests/qc/README.md` | Yes — change the example URLs from `seven16intel.com` to that satellite's canonical hostname. Keep the rest. |
| `.gitignore` additions | No — append the three `test-results/`, `playwright-report/`, `tests/qc/screenshots/` lines. |

NPM scripts to add to `package.json`:

```json
"qc": "playwright test",
"qc:install": "playwright install",
"qc:report": "playwright show-report",
"qc:local": "QC_TARGET=http://localhost:3000 playwright test"
```

---

## What each satellite changes in `PAGES`

The structure is locked:

```ts
type QcPage = {
  path: string;       // e.g. "/pricing"
  name: string;       // e.g. "01-pricing" (numeric prefix keeps screenshots sorted)
  waitFor?: string;   // optional CSS selector
  expectText?: string;// optional smoke-test text
};
```

Each satellite swaps their routes. Example for `dotintel2`:

```ts
const PAGES: QcPage[] = [
  { path: "/",                 name: "00-home",         expectText: "DOT Intel" },
  { path: "/pricing",          name: "01-pricing" },
  { path: "/lookup",           name: "02-lookup" },
  { path: "/learn",            name: "03-learn" },
  // ...etc
];
```

The numeric prefix on `name` keeps screenshots sorted in the filesystem AND in the HTML report.

---

## Paste-ready BACKLOG entries per satellite

Copy the matching block to the satellite's `docs/BACKLOG.md` Queued list. Each is acting-cold ready — file paths + commands + scope.

### `seven16-group-site` (partners.seven16group.com)

```markdown
**[QC] Playwright cross-browser screenshot suite** — adopt the Seven16 family
Playwright QC pattern. Source: `saas-agency-database/playwright.config.ts` +
`tests/qc/screenshots.spec.ts` + `tests/qc/README.md` (commit `cfb246d` or
later). Copy verbatim except the PAGES array — replace with this repo's public
routes (`/`, `/products/seven16intel`, `/products/dotintel`, `/products/bindlab`,
`/products/dotcarriers`, `/products/dotagencies`, `/products/seven16academy`,
`/apply`, `/about`, etc.). Add npm scripts (`qc`, `qc:install`, `qc:report`,
`qc:local`). Append `.gitignore` entries (`test-results/`, `playwright-report/`,
`tests/qc/screenshots/`). Run `npm run qc:install` + `npm run qc` to verify.
~30 min adoption + ~5 min per QC run after. Time triggers: before any
marketing-page PR merge, after design-system changes, before family campaign
launches.
```

### `dotintel2` (dotintel.io)

```markdown
**[QC] Playwright cross-browser screenshot suite** — adopt the Seven16 family
Playwright QC pattern. Source: `saas-agency-database/playwright.config.ts` +
`tests/qc/screenshots.spec.ts` + `tests/qc/README.md` (commit `cfb246d` or
later). Copy verbatim except the PAGES array — replace with DOT Intel public
routes (`/`, `/pricing`, `/lookup`, `/lookup/[dot]`, `/learn`, `/about`,
`/methodology`, `/sign-in`, `/sign-up`, plus the cluster routes for
dotcarriers.io and dotagencies.io if multi-tenant routing still active).
Add npm scripts + gitignore entries. ~30 min adoption + ~5 min per QC run.
```

### `bindlab` (bindlab.io — Wholesale & MGA Operating System)

```markdown
**[QC] Playwright cross-browser screenshot suite** — adopt the Seven16 family
Playwright QC pattern. Source: `saas-agency-database/playwright.config.ts`
(commit `cfb246d` or later). Bind Lab is operational-tool-heavy so the PAGES
array should cover both marketing surface (`/`, `/pricing`, `/about`) AND
key authenticated screens (`/dashboard`, `/submissions`, `/recruiting`).
For authed routes, add a `beforeEach` storage-state setup. See README for
the pattern. ~45 min adoption (extra time for authed-screen setup).
```

### `seven16-survey` (seven16survey.com)

```markdown
**[QC] Playwright cross-browser screenshot suite** — adopt the Seven16 family
Playwright QC pattern. Source: `saas-agency-database/playwright.config.ts`
(commit `cfb246d` or later). Survey routes (`/`, `/take/[slug]`, `/results`,
`/admin/surveys`, plus the prospect-survey landing surfaces at
dotintel.io/score, seven16intel.com/score/*). Pay particular attention to
mobile-viewport screenshots — assessment-taking surface is mobile-first
per the product's lead-gen positioning. ~30 min adoption.
```

### `seven16-command-center` (seven16command.com)

```markdown
**[QC] Playwright cross-browser screenshot suite** — adopt the Seven16 family
Playwright QC pattern. Source: `saas-agency-database/playwright.config.ts`
(commit `cfb246d` or later). Command is CRM-heavy; PAGES array covers
`/`, `/login`, `/dashboard`, `/contacts`, `/events`, `/integrations`,
`/api/events/ingest` (POST endpoint health). Authed-route storage-state
setup required. ~45 min adoption.
```

### `seven16-email` (seven16email.com / api.seven16email.com)

```markdown
**[QC] Playwright cross-browser screenshot suite** — adopt the Seven16 family
Playwright QC pattern. Source: `saas-agency-database/playwright.config.ts`
(commit `cfb246d` or later). Seven16 Email is mostly API + admin so PAGES
focuses on `/`, `/login`, `/admin/sequences`, `/admin/templates`,
`/admin/audiences`. ~30 min adoption.
```

### `bindlab-academy` (seven16academy.com — academy product)

```markdown
**[QC] Playwright cross-browser screenshot suite** — adopt the Seven16 family
Playwright QC pattern. Source: `saas-agency-database/playwright.config.ts`
(commit `cfb246d` or later). Academy is mobile-first PWA so mobile-viewport
projects matter the most. PAGES: `/`, `/catalog`, `/course/[slug]`,
`/cert/[id]`, `/admin`, plus the cert-issuance + cert-viewer endpoints.
~30 min adoption.
```

---

## The QC habit

After adoption, each satellite's CLAUDE.md should mention:

> **Run cross-browser QC before merging any marketing-surface change:**
> ```bash
> npm run qc
> npm run qc:report
> ```

Treat the QC matrix the same way as `npm run lint` or `npm run build` — it's a pre-merge gate, not a "we'll get to it." Customer-visible regressions on Safari mobile cost more than the 5 minutes of QC time.

---

## Why these specific 10 projects

| Engine | Real-world coverage | Catches |
|---|---|---|
| Chromium (light + dark) | Chrome, Edge, Brave, Opera, Arc — ~70% of desktop traffic | Most common case; baseline expectation |
| Firefox (light + dark) | ~5% desktop traffic + privacy-conscious users | Different CSS engine; catches `:has()` and grid edge cases |
| WebKit (light + dark) | Safari (~20% desktop, ~30% mobile) | Catches Safari-only flexbox bugs, font-loading races, sticky-positioning regressions |
| Pixel 5 (Chromium, light + dark) | Android Chrome (~50% mobile traffic) | Catches mobile-viewport overflow, tap-target sizing |
| iPhone 13 (WebKit, light + dark) | iOS Safari (~45% mobile traffic) | Catches the highest-stakes mobile bugs — iOS Safari is the most divergent |

Skipping any pair is fine in a pinch (run `npm run qc -- --project=chromium-light` for the fastest sanity check) but the full sweep is the trusted "ready to ship" signal.

---

## Maintenance

- **Update the family standard here first**, then notify each satellite to re-sync. Keeps the family aligned without per-satellite drift.
- **Don't commit screenshots to git** — they're in `.gitignore`. They live in `tests/qc/screenshots/` locally and in `playwright-report/` for the HTML viewer; both regenerate each run.
- **Add new browser projects sparingly** — every project doubles compute time. The current 10 cover ~95% of real traffic; adding tablet viewports etc. is a per-product decision.
- **When this pattern changes**, update this doc + every satellite's `playwright.config.ts` together. Coordinated via the family-doctrine session pattern (Rule 2(b) cross-repo prep).

---

*Locked 2026-05-30 as the family QC standard. Source: `saas-agency-database` `cfb246d` or later. Next satellite session that opens, paste the matching BACKLOG entry above into that repo's `docs/BACKLOG.md` Queued list.*
