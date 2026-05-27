# SESSION_38.6 Addendum — BACKLOG `0e` SHIPPED: full polished `/pricing` page live per D-034 (2026-05-26)

**Date:** 2026-05-26 (continuation after SESSION_38.5 close commit `1571d7b` + parallel-session SESSION_39 commit `75f0ace`)
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `main`
**Predecessor:** [`SESSION_38_5_ADDENDUM_d034_pricing_pivot.md`](SESSION_38_5_ADDENDUM_d034_pricing_pivot.md)
**Commits this addendum:** `5db738d` (components + wiring) + `bf59017` (build-fix for `/charter` `isAuthed` prop)
**Outcome:** `agencysignal.co/pricing` now serves the full polished pricing experience per Master O's pasted Neilson-alternative proposal copy locked in family memory `project_agencysignal_pricing_v2_neilson_alternative.md`

---

## Why SESSION_38.6 instead of SESSION_39 or SESSION_40

Parallel session committed `75f0ace fix(security): SESSION_39 — Agency Signal Tier 1 baseline LIVE (90→32 WARN, 0 ERROR)` after my SESSION_38.5 close-out and before this addendum landed. They claimed the SESSION_39 numbering. To keep the doctrine-pivot session arc clean + avoid collision, this addendum is numbered **SESSION_38.6** — final continuation of the SESSION_38 → SESSION_38.5 → SESSION_38.6 arc that started with the domain cutover.

Naming hierarchy through the day:
- **SESSION_38** — domain cutover (mine, commit `2a8943c`)
- **SESSION_38.5** — D-034 doctrine pivot + customer-surface scrub (mine, commit `1571d7b`)
- **SESSION_39** — Agency Signal Tier 1 security baseline (parallel, commit `75f0ace`)
- **SESSION_38.6** — BACKLOG `0e` /pricing build (mine, this addendum)

---

## What shipped

### Four new marketing components

| Component | Type | Role |
|---|---|---|
| `SliderCalculator.tsx` | Client (`"use client"`) | Record-count slider 100 → 15,000+ with live tier detection, dynamic discount messages, computed total honoring $500 minimum |
| `ComparisonTable.tsx` | Server | 6-row Agency Signal vs legacy quote-driven vendors comparison |
| `PricingFAQ.tsx` | Server | 6 questions via native `<details>`/`<summary>` disclosure |
| `SampleOfferBanner.tsx` | Server | Bottom-of-page cyan-bordered conversion banner ($75 sample offer) |

All four under `components/marketing/`.

### `/pricing` page wired

Section order in `app/pricing/page.tsx`:
1. **PageHero** (dark) — "Commercial-insurance agent data, without the legacy pricing"
2. **4-tier grid** — Sample / Monthly / Build Your File / National License (kept from SESSION_38.5 skeleton)
3. **SliderCalculator** — in muted Section, "See your price as you build your list"
4. **"Why Agency Signal"** — in light Section, narrative + 4-bullet list
5. **ComparisonTable** — in muted Section, "Why buyers choose Agency Signal"
6. **PricingFAQ** — in light Section, "Common questions"
7. **SampleOfferBanner** — in muted Section (no header chrome)
8. **CTASection** — "Try a $75 sample or talk to us about the founder license"
9. **MarketingFooter**

### D-024 a11y compliance notes

- `SliderCalculator`: `aria-valuetext` narrates state ("X records at $Y each — discount-message. Total $Z."); `focus-visible:ring-2 ring-teal-700` on slider; tabular-nums on the numeric displays so visually-impaired users see stable digit columns.
- `ComparisonTable`: semantic `<table>` with `<caption>` (sr-only), `<thead>/scope=col`, `<th scope="row">` per row; `Check`/`Minus` icons have `aria-hidden="true"` and `<span className="sr-only">` companion labels.
- `PricingFAQ`: native `<details>`/`<summary>` disclosure (free a11y + keyboard navigation); rotating "+" is `aria-hidden`.
- `SampleOfferBanner`: `<aside aria-label="Starter sample offer">` for screen-reader landmarking; focus-visible ring on the CTA.

---

## Build break + fix

First push (`5db738d`) failed Vercel build with:

```
./app/charter/page.tsx:18:8
Type error: Property 'isAuthed' is missing in type '{}' but required in type 'MarketingHeaderProps'.
```

**Root cause:** SESSION_38.5 retired the `/charter` page to a "program ended" notice and called `<MarketingHeader />` without the required `isAuthed` prop. That branch passed Vercel's build that session because the prop was made required AFTER the deploy (`MarketingHeaderProps` was tightened somewhere between SESSION_38.5 and now — likely in the parallel session's work). Type error surfaced only on the next build.

**Local catch:** ran `npm run build` locally after Vercel notified ERROR. Caught the exact line + fix in 30s. Patched in `bf59017`:

```diff
-export default function CharterPage() {
+export default async function CharterPage() {
+  const supabase = await createClient();
+  const { data: { user } } = await supabase.auth.getUser();
+
   return (
     <main className="min-h-screen bg-white">
-      <MarketingHeader />
+      <MarketingHeader isAuthed={!!user} />
```

**Lesson codified in BACKLOG entry:** when touching prop interfaces across multiple files in a single session, run `npm run build` locally before push. SESSION_38.5 + this addendum both hit this trap — the discipline is now load-bearing.

---

## Verification

Post-deploy spot-check via curl (proves the right page is live, not a cached old version):

```bash
$ curl -sS https://agencysignal.co/pricing | grep -oE 'See your price as you build|Why buyers choose Agency Signal|Common questions|Not ready for a big purchase' | sort -u
Common questions
Not ready for a big purchase
See your price as you build
Why buyers choose Agency Signal
```

All 4 polished section markers present ✓. `/charter` and `/` also return 200 (sanity).

---

## Out of scope (deferred to follow-up "pricing migration" session)

Same as SESSION_38.5 addendum — these still queued:

- **Stripe sandbox catalog rebuild**: archive 6 D-021 surfaces in `acct_1TLUF6HmqSDkUoqw`; deactivate Charter coupon `L1Ngigfc`; build 4 new Products + Prices for the D-034 tiers (Sample $75 / Monthly Starter $299 / Growth $599 / Pro $999 / Bulk per-record / National License $12,500). Stripe MCP supports product archive + price create.
- **Historical banners** on 8 PRICING_*.md briefs in `docs/context/`.
- **Dead Charter-Member code paths** in `app/api/stripe/{checkout,webhook}/route.ts` (harmless but cluttering).
- **`/enterprise` page** — still describes killed D-015 state slider; needs rebuild or retirement.

---

## Pickup tasks for next session

### 🟠 Active arc — BACKLOG `0b` Design system v1.1 rightRail product-mockup harmonization

~60-90 min. Closes the homepage-vs-other-pages density gap. Per-page mockup concepts:
- `/verticals` — Vertical-tier-mockup (12 verticals with status pills + agency counts)
- `/use-cases` — Workflow-step-mockup (4-step horizontal numbered playbook)
- `/resources` — Editorial-row-mockup
- `/enterprise` — Enterprise-capabilities-mockup
- `/methodology` — Three-signals-mockup (3-signal flow diagram with scoring badges)
- `/pricing` — could promote SliderCalculator to rightRail or build a CreditMath-mockup
- `/charter` — N/A (retired, just shows program-ended notice — leave alone)

### 🟡 Pricing-migration follow-up session (separate)

Stripe sandbox catalog cleanup + historical banners + dead-code removal. ~45-60 min. Should land BEFORE first paying charter-replacement customer because Stripe checkout currently still references the killed D-014/D-021 SKUs (harmless but technically incorrect).

### 🟡 Carry-forward low-priority items

1. Master O — flip `NEXT_PUBLIC_APP_URL` in Vercel Preview env (dashboard, ~30 sec)
2. Verify first real Stripe event hits 200 in Vercel logs (passive)

---

## Standing-rule callouts

- **One arc per session held** — only `0e` shipped this addendum. Did NOT start `0b` mid-fix or fold in pricing-migration cleanup.
- **Local build before push** — codified this session as a discipline. The `bf59017` patch was 30s of work but the failed push wasted time + cluttered the Vercel deploy history.
- **Audit-first** — post-Vercel-error I ran `npm run build` locally rather than guessing at the error. Type checker pointed at the exact line.
- **No SLOP in copy** — new sections all use direct operator language from the proposal copy locked in family memory. No "unlock the power of" / "revolutionary platform" / generic feature copy.
- **Plugins-first** — Vercel MCP (`list_deployments` + `get_deployment` + `get_deployment_build_logs`) used to see build state, not Vercel dashboard.

---

*BACKLOG `0e` shipped clean. SESSION_38 → SESSION_38.5 → SESSION_38.6 arc is now complete: domain cutover + pricing doctrine pivot + polished pricing page all live on agencysignal.co. Next active arc returns to BACKLOG `0b` (rightRail polish).*
