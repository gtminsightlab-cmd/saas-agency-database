# Family-Hub Session 26 — Marketing homepage redesign (D-024 first application) + Sessions 27-32 epic queued (2026-05-18)

**Date:** 2026-05-18
**Repo:** `saas-agency-database` (family hub)
**Branch:** `claude/intelligent-leavitt-9243ef` worktree → fast-forwarded to `main`
**Predecessor:** [`SESSION_25_HANDOFF.md`](SESSION_25_HANDOFF.md)
**HEAD at session open:** `5db5603` (Stripe catalog migration, 2026-05-18 SESSION_25 close) — main had drifted 4 commits to `726d1f8` (4 docs commits queued the SESSION_26 priority) by session open
**HEAD at session close:** `f24b3f3` (`.npmrc` legacy-peer-deps fix)
**Commits added to main:** 2 (`b8defba` body + `f24b3f3` hot-fix)
**Live URL:** https://directory.seven16group.com (deploy `dpl_u5ATG82juVK1dikTz7gkhqk5HrEN` READY)

---

## Theme

**SESSION_26 Path A — marketing homepage redesign per Master O CMO brief.** First major application of the D-024 Front-End Production Standard locked SESSION_25. Reframed the homepage from a long-form explainer + pricing dive into a "distribution intelligence command center" per Apollo.io + AM Best + Palantir aesthetic.

Plus session-close: Master O pasted a **second CMO brief — the internal-app redesign**. That work is sized as a 6-session epic (Sessions 27-32) with Session 27 = Foundation + Recruit Lists wrap. Pre-execution resolution flags locked.

---

## What shipped

### Commit `b8defba` — homepage redesign (24 files, +1939/-1334)

**6 D-024 shared primitives at [`components/ui/`](../../components/ui/):**

| File | Purpose |
|---|---|
| `LoadingState.tsx` | Spinner + skeleton, `role="status"` + `aria-busy` + `aria-live="polite"`, 3 size variants + 3 layout variants (inline/block/overlay). Also exports `<Skeleton />`. |
| `EmptyState.tsx` | Icon + heading + body + optional action slot. Dashed-border / muted-bg pattern. |
| `ErrorState.tsx` | `role="alert"` + `aria-live="assertive"` + retry button + optional support-link slot. |
| `SuccessToast.tsx` | Typed wrapper around `sonner`'s `toast.success` / `toast.error` / `toast()` — keeps duration defaults consistent across the app. |
| `ErrorBoundary.tsx` | React 19 class-component boundary; falls back to `<ErrorState onRetry={resetState}>` by default. |
| `StatusPill.tsx` | Accessible status indicator with 6 tones (`success / warning / danger / info / neutral / verified`) — never color-alone; always icon + text. |

**13 marketing section components at [`components/marketing/`](../../components/marketing/):**

| File | What it does |
|---|---|
| `MarketingHeader.tsx` | Sticky top, light-surface, 6-link nav + Charter link + auth-aware CTAs. Mobile burger menu with `aria-expanded` / `aria-controls`. |
| `HeroSection.tsx` | Dark `bg-slate-950` hero, eyebrow chip + "Stop targeting agency titles. Start targeting verified carrier appointments." headline + 5-stat trust strip + mockup slot. |
| `AppointmentSearchMockup.tsx` | Centerpiece data terminal — Carolina Casualty / W.R. Berkley parent filter + 6-filter grid + chips + 3-row results table with StatusPills. `role="img"` + sr-only `<caption>` + scope attrs. |
| `ProblemSection.tsx` | 3 pain cards (title-only targeting / stale agency websites / decaying CRM lists). |
| `ComparisonSection.tsx` | Generic-contact-database vs. Agency Signal — 5-row comparison with red-X / green-check rails. |
| `HowItWorksSection.tsx` | 4-step pipeline (Collect / Normalize / Score / Activate) as numbered `<ol>`. |
| `VerticalCardsSection.tsx` | **Live data** — consumes `mv_vertical_summary` from `sdlsdovuljuymgymarou`. 12 cards, each with agency / contact / carrier counts. EmptyState fallback if MV returns []. |
| `RecruitPlaysSection.tsx` | 5 plays (Displace / Launch / Map / Identify / Reduce). |
| `MethodologySection.tsx` | Dark `bg-navy-900` section with the "Agency Recruit Score = Volume + Specialization + Carrier Diversity + Verified Freshness" formula visual. |
| `DataTrustSection.tsx` | 6 tiles (DOI filings / writing-company normalization / parent-group mapping / 30-day refresh / dual-agent / verified-as-of). |
| `PricingPreview.tsx` | 3-tier homepage preview (Free $0 / Growth $99/mo / Snapshot $125 one-time). Detailed credit math linked to /pricing. |
| `FinalCTA.tsx` | Dark `bg-slate-950` closer with "Browse agencies free" + "Talk to distribution team" CTAs. |
| `MarketingFooter.tsx` | "Agency Signal — by Seven16 Group" + 3-column link grid (Product / Plans / Company). |

**App shell updates:**

- [`app/page.tsx`](../../app/page.tsx) rewritten — composes all 13 sections, fetches live counts (`agencies` / `contacts` / `carriers` / `agency_carriers` / `mv_vertical_summary`) in parallel, falls back to STAT_FALLBACK constants if any count returns null. Auth-aware CTAs.
- [`app/layout.tsx`](../../app/layout.tsx) — `<Toaster position="top-right" closeButton richColors />` mounted. Metadata updated to "Agency Signal — distribution intelligence for commercial insurance."

**Tooling locks:**

- `sonner@^2.0.7` installed (D-024 toast lock)
- `eslint-plugin-jsx-a11y@^6.10.2` installed direct (was transitive via `eslint-config-next` but flat config needs direct resolution)
- `@typescript-eslint/parser@^8.59.3` installed direct (for TSX parsing in flat config)
- `@eslint/eslintrc@^3.3.5` installed (FlatCompat shim)
- [`eslint.config.mjs`](../../eslint.config.mjs) — minimal flat config: jsx-a11y recommended ruleset scoped to `**/*.tsx`, parser = ts-eslint, ignores `.next/` `node_modules/` `supabase/functions/` `scripts/` `out/` `build/`
- [`package.json`](../../package.json) lint script changed `next lint` → `eslint .` (Next.js 16 deprecated `next lint`)

### Commit `f24b3f3` — Vercel npm install hot-fix (1 file, +1)

First Vercel build (`dpl_7MjsuCVpwaqaHdofbvc8DvAmMK2w`) errored on `npm install` because Vercel doesn't use `--legacy-peer-deps` by default and `eslint-plugin-jsx-a11y@6.10.2` peer-caps at eslint 9 (we run eslint 10). Plugin works fine with eslint 10; the peer range just hasn't been bumped upstream.

Fix: added [`.npmrc`](../../.npmrc) with `legacy-peer-deps=true`. Applies to local + Vercel + CI consistently.

Subsequent deploy `dpl_u5ATG82juVK1dikTz7gkhqk5HrEN` for SHA `f24b3f3` → **READY** at directory.seven16group.com.

### Live data audit replaced brief's understated numbers

| Trust strip stat | Brief said | Live (2026-05-18) | Used |
|---|---|---|---|
| Verified agencies | 36,212 | 41,705 | **41,700+** |
| Contacts indexed | 87,000+ | 135,453 (85.5% with email) | **135K+** |
| Writing companies | 400+ | 1,369 | **1,300+** |
| Verified appointments | (not in brief) | 263,657 | **260K+** |
| Geographic coverage | (not in brief) | 52 (50 + DC + PR) | **All 50 states + DC** |
| Parent groups | 60 | 1,068 total; 100 multi-carrier; 82 with ≥3 carriers | (referenced as "100+ insurance groups" in MethodologySection copy) |

Per family standing rule "pricing copy is placeholder until data inventory catches up," strong actuals shipped instead of the brief's smaller numbers.

---

## Commits this session (chronological)

| Commit | Title |
|---|---|
| `b8defba` | feat(d-024,homepage): marketing homepage overhaul per CMO brief (24 files, +1939/-1334) |
| `f24b3f3` | fix(d-024): add .npmrc legacy-peer-deps for Vercel install (1 file, +1) |

2 commits, 25 files. Both fast-forwarded to main via `git push origin claude/intelligent-leavitt-9243ef:main`.

---

## D-024 Definition-of-Done verification (code-review walk)

Per ENGINEERING_DOCTRINE §"Front-end production standard" — 12-point DoD on the redesigned homepage:

| Point | Status | Where |
|---|---|---|
| Loading | ✓ N/A | Server-rendered; fetches block render. No client-side data state. |
| Empty | ✓ | `VerticalCardsSection` falls back to `<EmptyState heading="Vertical data is loading">` if MV returns []. |
| Error | ✓ | `STAT_FALLBACK` constants kick in if any Supabase fetch returns null `count`. Defensive UI. |
| Retry | ✓ N/A | Server-rendered; no user-initiated action mid-flight to retry. |
| Success | ✓ N/A | No form submission on the homepage; `<Toaster />` mounted for downstream pages. |
| Mobile | ✓ | Header has full mobile menu; Hero `lg:grid-cols-12` collapses below `lg`; vertical cards 1/2/3-col; pricing 1/3-col; AppointmentSearchMockup uses `overflow-x-auto` on the table. |
| Keyboard nav | ✓ | All interactive elements `<button>` / `<Link>` (no role=button divs); `aria-expanded` + `aria-controls` on mobile burger; `focus-visible:ring-*` on every CTA. |
| Screen readers | ✓ | `aria-labelledby` per section; decorative icons `aria-hidden="true"`; sr-only `<caption>` on mockup table; `role="img"` + descriptive `aria-label` on mockup figure; proper `scope="col"` / `<th scope="row">`. |
| Partial data | ✓ | `useCase ?? v.description ?? ""` chains; null-safe icon resolution; `STAT_FALLBACK` for any missing count. |
| Slow connection | ✓ | Server-rendered, blocks at request. No client-side hydration delays for above-the-fold content. |
| User leaving mid-request | ✓ N/A | No client-side mutations on homepage. |
| Malformed response | ✓ | `VerticalCard` shape typed; null-safe field access; falls back to defaults. |

jsx-a11y lint pass: clean across all 19 new TSX files (`npx eslint "components/ui/**/*.tsx" "components/marketing/**/*.tsx" "app/page.tsx" "app/layout.tsx"` → 0 errors).

Pre-existing lint errors NOT touched (apply-on-touch per D-024 policy): `app/sign-up/form.tsx` (2× jsx-a11y/anchor-is-valid + 1× missing react-hooks plugin), `app/global-error.tsx` (jsx-a11y/html-has-lang), pre-existing `// eslint-disable-next-line @typescript-eslint/no-explicit-any` references that need the ts-eslint plugin loaded.

---

## What's NOT done — queued for next session

### 🔴 Still pending Master O dashboard actions (carried from SESSION_25)

1. **CRON_SECRET in Vercel production env** — daily 04:00 UTC cron for Pillar 6 saved-list refresh still returns 500 until set. `openssl rand -base64 32` → Vercel Settings → Env Variables → Add (Sensitive, Production).
2. **Stripe webhook endpoint registration** at `https://directory.seven16group.com/api/stripe/webhook` for 6 events (`checkout.session.completed` / `customer.subscription.*` / `invoice.paid` / `invoice.payment_failed`). Dashboard-only per `feedback_stripe_mcp_webhook_dashboard_only.md`.
3. **Sentry org token rotation** — every deploy still logs `Invalid org token (401)` on @sentry/nextjs After Production Compile.

### 🟡 Sessions 27-32 internal-app redesign epic (NEW arc, SESSION_27 kicks off)

Per Master O CMO brief 2 pasted at session close 2026-05-18. **6-session structure:**

| Session | Scope | Files | Output |
|---|---|---|---|
| **27 Foundation + Recruit Lists wrap** (next) | Tailwind palette refresh (`brand-*` → #0F766E + new `intel-cyan` #0891B2 + `intel-dark` #07111F) · AppShell + CustomerSidebar (light) + PageHeader + Breadcrumbs + TopBar · MetricCard + StatusChip + DataTable wrapper · Nav-label rename (labels only, URLs untouched) · Recruit Lists page composed inside new chrome with full D-024 row-actions polish | ~15-18 | Proof-of-shell on the highest-traffic authenticated page |
| 28 Intelligence Home + Vertical Intelligence | NEW `/home` authenticated dashboard route (KPIs + recommended plays + recent activity + quick actions) · Vertical Intelligence redesign with `VerticalOpportunityCard` | ~18 | Daily command center |
| 29 Build Recruit List + Recruit Lists | Stepper-based builder + StickySummaryPanel + Recruit Lists table refresh | ~20 | Core workflow surface |
| 30 Exports + Agency Search + AI Research Assistant | Exports rename + multi-tab Agency Search + AI prompt UX | ~22 | Three medium-complexity surfaces |
| 31 Data Coverage + Methodology + Resources + Team | Four lighter surfaces in one session | ~15 | Closes customer side |
| 32 Admin polish | AdminSidebar (dark variant) + Master Control Room + System Health + Billing + Integrations cards | ~25 | Polished control room |

**Resolution flags locked at session close (carry into every session of the epic):**
- Product name = **Agency Signal** (D-004 holds). Seven16 Group = holding company owning Agency Signal + BindLab + DotIntel.
- Nav rename = **labels only**. URLs stay `/saved-lists`, `/downloads`, `/quick-search`, `/data-stats`, `/ai-support`. DB tables stay `saved_lists`. Pillar 6 Edge Function URLs untouched.
- Tailwind palette = **REPLACE `brand-*` with #0F766E** (teal-700 anchor) + add `intel-cyan` (#0891B2) + `intel-dark` (#07111F). Visual ripple on every existing brand-styled CTA (charter, enterprise, sign-in/sign-up, build-list, admin). Marketing homepage uses Tailwind `blue-600` natively so it's insulated.
- Session 27 wraps **Recruit Lists** (Saved Lists rename) as proof.

### 🟢 Tier 1.x carry-forwards

- AS Session 5 Option A SWR client-cache → folded into Session 29 Build Recruit List redesign
- Pillar 7 schema migration in `seven16-platform` (`customer_entitlements` + `appointment_attributions`) — BACKLOG #5, blocks Distribution Expander state-level RLS
- `credit_consumption_rates` schema (BACKLOG #6) per D-014
- Enterprise+ state SKUs (D-015) — its own session
- `/api/stripe/checkout` extension for universal-credits + tier-pick + Charter-member-discount flow

---

## Cross-product implications

- **AS does NOT intersect with BindLab functionally** (per SESSION_25 directive from Master O) — but BindLab IS family-owned under Seven16 Group holding company (clarified at SESSION_26 close 2026-05-18). FAMILY_HEALTH "Parked/spinoff repos" reframed to reflect this. DECISION_LOG §4 "retired brands" entry for BindLab needs amendment in a future family-hub session.
- **DotIntel** remains Seven16 Group-owned (lives in `dotintel2` repo); unchanged from prior state.
- **Brand palette ripple in upcoming Session 27** — replacing `brand-*` from #00A896 → #0F766E will shift every authenticated app surface using `bg-brand-600` / `text-brand-600` / `border-brand-*` (sign-in, sign-up, build-list, saved-lists, charter, enterprise, admin nav, hygiene). Marketing homepage uses Tailwind `blue-600` literal so it's NOT affected. Expect a single Session 27 commit that visibly shifts the auth-area teal to a deeper shade.

---

## Memory updates needed (queued for future family-hub bookkeeping session)

- `MEMORY.md` is 25.3KB and over the 24.4KB limit per the system warning; needs a consolidation pass (mechanism #4 monthly anti-decay sweep). Not blocking; surface at next family-hub session.
- DECISION_LOG §4 amendment re: BindLab (see "Cross-product implications" above).
- Memory file recommended (deferred): `reference_internal_app_redesign_epic.md` summarizing the Sessions 27-32 plan + resolution flags, to load on Session 27 open. Likely not needed if the BACKLOG active arc + this handoff carry the context.

---

## How to pick up the next thread

Next family-hub session opens with:
1. Read this handoff
2. Read [`docs/BACKLOG.md`](../BACKLOG.md) — active arc is now "Sessions 27-32 internal-app redesign epic"
3. Read [`docs/context/FAMILY_HEALTH.md`](../context/FAMILY_HEALTH.md) — refreshed at SESSION_26 close
4. Open [`SESSION_27_PROMPT.md`](SESSION_27_PROMPT.md) for the paste-ready opener

**Recommended next move:** start Session 27 Slice 1 — palette audit + `brand-*` ripple-impact grep. Then Slice 2 = palette swap. Then Slices 3-9 build the shell and wrap Recruit Lists.

---

## What I'd do if I were the next Claude opening this

**5-minute orientation:**
1. Read this handoff
2. `git log --oneline -5` to confirm HEAD at `f24b3f3`
3. Verify Vercel deploy READY via MCP (`get_deployment` for `directory.seven16group.com`)
4. Open `https://directory.seven16group.com` in browser, scroll through the new homepage, confirm hero mockup renders + 12 vertical cards populate + pricing tiers visible
5. `grep -rn "brand-" app components` to confirm the ripple surface before Session 27 palette swap

**Then:** start Session 27 per the prompt. Slice 1 = palette audit (read-only, 0 writes). Slice 2 = `tailwind.config.ts` palette swap. The remaining 7 slices build the AppShell + Recruit Lists wrap.

---

*End SESSION_26_HANDOFF — homepage redesign shipped, internal-app redesign epic queued. Family ledger D-001 through D-024. Live HEAD `f24b3f3` on main, deploy READY at directory.seven16group.com.*
