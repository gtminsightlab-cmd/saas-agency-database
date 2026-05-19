# SESSION_27 — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-18 (end of SESSION_26)
**Predecessor handoff:** [`SESSION_26_HANDOFF.md`](SESSION_26_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT the OneDrive path)
**Live site:** https://directory.seven16group.com
**Latest deploy:** `f24b3f3` READY 2026-05-18

Paste the block below verbatim into the first message of the next Claude Code session.

---

```
This is the SESSION_OPENER for Seven16 family-hub SESSION_27.

═══════════════════════════════════════════════════════════════
STEP 0 — VERIFY WORKING DIRECTORY BEFORE ANYTHING ELSE
═══════════════════════════════════════════════════════════════

Run `pwd` (or `Get-Location` in PowerShell) and confirm output is:

  C:\Users\GTMin\Projects\saas-agency-database

If you see ANY of these paths instead, STOP and alert Master O:
  - C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database
  - Any path under \OneDrive\
  - Any path other than the canonical native-git clone above

Per family memory, the OneDrive `.git` is PERMANENTLY BROKEN.

DO NOT proceed past Step 0 if the working directory is wrong.

═══════════════════════════════════════════════════════════════
STEP 1 — CONTEXT (only after Step 0 passes)
═══════════════════════════════════════════════════════════════

You are continuing the Seven16 family-hub track — SESSION_27.

Working directory: C:\Users\GTMin\Projects\saas-agency-database\
Live site: https://directory.seven16group.com
Vercel project: prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV (team_RCXpUhGENcLjR2loNIRyEmT3)
Supabase satellite (Agency Signal): sdlsdovuljuymgymarou
Supabase satellite (seven16-platform control plane): soqqmkfasufusoxxoqzx
Default tenant: ce52fe1e-aac7-4eee-8712-77e71e2837ce
Stripe sandbox: acct_1TLUF6HmqSDkUoqw

Before doing anything substantive, read in this order (Working
Agreement Rule 6):

  1. docs/BACKLOG.md  ← Anti-decay layer; read first per Rule 6.
     Active arc is now "Sessions 27-32 — Internal app redesign epic."
  2. docs/handoffs/SESSION_26_HANDOFF.md  ← What shipped 2026-05-18
     (homepage redesign + Sessions 27-32 epic queue + resolution
     flags locked).
  3. docs/context/FAMILY_HEALTH.md  ← Refreshed end of SESSION_26.
  4. docs/context/DECISION_LOG.md  ← D-001 through D-024. D-024 is
     the active doctrine — every screen meets 10-standard /
     12-point-DoD bar.
  5. docs/context/ENGINEERING_DOCTRINE.md  ← §"Front-end production
     standard (D-024)" + tooling locks (`sonner`, jsx-a11y) +
     shared `components/ui/*` primitives list. REQUIRED reading.
  6. Existing app surfaces (read what you're touching):
     - app/saved-lists/page.tsx + app/saved-lists/row-actions.tsx
     - app/build-list/page.tsx (for context only — don't touch
       Session 27, that's Session 29)
     - components/marketing/nav.tsx (existing nav, due for rename
       in this session)
     - tailwind.config.ts (palette refresh in Slice 2)
     - app/layout.tsx (Toaster already mounted from Session 26;
       app shell wrapper goes here too)

═══════════════════════════════════════════════════════════════
STEP 2 — STATE AT SESSION OPEN
═══════════════════════════════════════════════════════════════

  • HEAD: f24b3f3 on main (SESSION_26 close: marketing homepage
    redesign + .npmrc fix).
  • Vercel deploy dpl_u5ATG82juVK1dikTz7gkhqk5HrEN READY at
    directory.seven16group.com.
  • 6 D-024 primitives shipped at components/ui/ (LoadingState,
    EmptyState, ErrorState, SuccessToast, ErrorBoundary, StatusPill).
  • 13 marketing section components at components/marketing/.
  • sonner Toaster mounted in app/layout.tsx.
  • eslint flat config with jsx-a11y at eslint.config.mjs.
  • .npmrc legacy-peer-deps=true for Vercel install consistency.
  • Tailwind palette: brand-* still at #00A896 (PENDING REPLACE
    per Session 27 Slice 2).

═══════════════════════════════════════════════════════════════
STEP 3 — ACTIVE ARC FOR SESSION_27 (CTO recommendation)
═══════════════════════════════════════════════════════════════

**SESSION_27 — Foundation + Recruit Lists wrap (~5-6 hrs, ~15-18 files).**
First slice of the Sessions 27-32 internal-app redesign epic.

**Source:** Master O CMO brief 2 (pasted at SESSION_26 close
2026-05-18). Resolution flags already locked — see Step 2 of
SESSION_26_HANDOFF "Cross-product implications" and BACKLOG "Active
arc" for the full lock list.

**Resolution flags (locked, do NOT relitigate):**
1. Product name = **Agency Signal** (D-004 canonical)
2. Nav rename = **labels only**, URLs untouched (Saved Lists →
   Recruit Lists, Downloads → Exports, Quick Search → Agency
   Search, Data and Stats → Data Coverage, AI Support → AI
   Research Assistant). DB tables stay `saved_lists`. Stripe
   webhook URLs untouched. Pillar 6 Edge Function URLs untouched.
3. Tailwind palette = **REPLACE `brand-*` with #0F766E**
   (teal-700 anchor) + add `intel-cyan` (#0891B2) + `intel-dark`
   (#07111F). Visual ripple on every existing brand-styled CTA
   except marketing homepage (uses Tailwind `blue-600` literal).
4. Session 27 wraps **Recruit Lists** (Saved Lists rename) as
   proof-of-shell.

**9-Slice plan (mirrors the SESSION_26 slicing methodology):**

  1. **Audit existing app surfaces** (~15 min, 0 writes).
     Read app/saved-lists/ + app/build-list/ + components/marketing/nav.tsx
     to know what survives. `grep -rn "brand-" app components` to
     understand the palette ripple before Slice 2.

  2. **Tailwind palette refresh** (~20 min, 1 file).
     Rewrite tailwind.config.ts `brand` scale anchored at
     `brand-600 = #0F766E` (teal-700 hex, full 50-900 ramp). Add
     new tokens `intel-cyan` (#0891B2) + `intel-dark` (#07111F).
     Leave `navy`, `gold`, `success`, `admin` palettes untouched.
     Smoke-test with `npm run build` to confirm no broken refs.

  3. **AppShell + CustomerSidebar (light)** (~45 min, 2 files at
     components/app/).
     AppShell.tsx — responsive layout shell, sidebar + content
     area + header slot, mobile collapse via state.
     CustomerSidebar.tsx — renamed nav (Home / Vertical Intelligence
     / Build Recruit List / Recruit Lists / Exports / Agency Search
     / Carrier Map / Data Coverage / AI Research Assistant /
     Scoring Methodology / Resources / Team); active state from
     usePathname. Authed-user surface only.

  4. **PageHeader + Breadcrumbs + TopBar** (~30 min, 3 files).
     PageHeader.tsx — title + subtitle + actions slot
     Breadcrumbs.tsx — semantic <nav aria-label="Breadcrumb">
     TopBar.tsx — global search input stub + plan/credit indicator
     + user menu.

  5. **MetricCard + StatusChip + DataTable wrapper** (~30 min, 3 files).
     MetricCard.tsx — label + value + optional delta + sparkline slot
     StatusChip.tsx — extends SESSION_26 StatusPill with severity
     tones for app surfaces
     DataTable.tsx — sortable header wrapper + empty/loading/error
     slot wiring around a semantic <table>.

  6. **Nav rename — labels only** (~10 min, 1-2 files).
     Update existing top-level nav links to surface the 5 label
     renames. URLs untouched. DB tables untouched. Stripe SKU
     metadata untouched.

  7. **Recruit Lists page rewrite** (~60 min, 2 files).
     app/saved-lists/page.tsx re-composed inside <AppShell> +
     <PageHeader title="Recruit Lists" subtitle="...">. Add top
     KPI row (5 MetricCards: Total Lists / Agencies Saved /
     Contacts Saved / Ready to Export / Last Updated). Re-style
     existing table inside the new DataTable wrapper.

  8. **Recruit Lists row-actions D-024 pass** (~30 min, 1 file).
     app/saved-lists/row-actions.tsx — apply
     components/ui/SuccessToast on acknowledge + delete; replace
     any raw alert() with toast; wrap component in ErrorBoundary;
     add visible loading spinner during delta-export download
     using LoadingState.

  9. **D-024 DoD verification + commit + push + Vercel deploy
     verify** (~30 min).
     12-point DoD walk + jsx-a11y lint + `npm run build` smoke +
     commit `feat(d-024,intel-app): foundation shell + Recruit
     Lists wrap (Session 27)` + push to main + verify deploy
     READY at directory.seven16group.com.

**Total estimate: ~5-6 hours, ~15-18 files across 7-9 commits
(or one squash commit per Master O preference at end).**

═══════════════════════════════════════════════════════════════
STEP 4 — ALTERNATIVES (if Master O wants to redirect)
═══════════════════════════════════════════════════════════════

  • **Skip Slice 8 + 9, ship Foundation only** (~3.5 hrs, ~13
    files). Shell + primitives land but no page is wrapped yet.
    Cleaner separation; Session 28 starts the page wraps. Less
    visible payoff this session.

  • **Reverse Slice 7-8 with Build Recruit List instead of Recruit
    Lists**. Higher value if Build is the busier surface, but
    bigger lift (needs Stepper + StickySummaryPanel which I'd
    rather defer to Session 29). Not recommended unless Master O
    has telemetry showing Build > Recruit Lists traffic.

  • **Path B — Master O dashboard actions first** (~10 min Master
    O time, then Claude session): set CRON_SECRET + register Stripe
    webhook events + rotate Sentry token. Unblocks Pillar 6 daily
    cron + Stripe live cutover + clean Sentry logs. Doesn't need
    Claude time at all once Master O has 10 min of bandwidth.

  • **Path C — Pillar 7 entitlements schema in seven16-platform**
    (BACKLOG #5, ~30-45 min). Unblocks Distribution Expander
    state-level RLS + outcome SKU attribution. Standalone, doesn't
    block the app redesign epic.

  • **Path D — Apply-on-touch D-024 cleanup on existing tech debt**
    (~30-45 min). Fix the 3 pre-existing jsx-a11y errors surfaced
    by SESSION_26 (`app/sign-up/form.tsx` 2× anchor-is-valid + 1×
    missing react-hooks plugin install; `app/global-error.tsx`
    html-has-lang). Small but real lint wins.

═══════════════════════════════════════════════════════════════
STEP 5 — MASTER-O TASKS (block on these — Master O dashboard)
═══════════════════════════════════════════════════════════════

  1. **CRON_SECRET in Vercel** (5 min) — still pending from SESSION_25.
     Generate `openssl rand -base64 32`, Vercel dashboard →
     Settings → Env Variables → Add (Sensitive, Production:
     CRON_SECRET). Without this Pillar 6 daily cron returns 500.

  2. **Stripe webhook endpoint registration** (5 min) — still pending
     from SESSION_25. dashboard.stripe.com/acct_1TLUF6HmqSDkUoqw/test/webhooks
     URL: https://directory.seven16group.com/api/stripe/webhook
     Events: checkout.session.completed / customer.subscription.created
     / customer.subscription.updated / customer.subscription.deleted
     / invoice.paid / invoice.payment_failed.

  3. **Sentry org token rotation** (5 min) — still pending. Every
     deploy logs `Invalid org token (401)`. Sentry dashboard →
     rotate org token → set SENTRY_AUTH_TOKEN in Vercel
     (Sensitive, Production).

═══════════════════════════════════════════════════════════════
STEP 6 — DO NOT in this session
═══════════════════════════════════════════════════════════════

  • Build Stepper / StickySummaryPanel components (those are
    Session 29 scope; defer until then)
  • Build NEW /home authenticated dashboard route (Session 28)
  • Redesign Vertical Intelligence page (Session 28)
  • Redesign Agency Search / AI Research Assistant / Exports
    (Session 30)
  • Polish admin pages (Session 32)
  • Touch DB tables or Stripe webhook URLs (locked: labels-only
    rename, URLs untouched, schema untouched)
  • Rebrand the marketing homepage palette (it uses Tailwind
    blue-600 literal; insulated from the brand-* swap)
  • Relitigate any of the 4 resolution flags

═══════════════════════════════════════════════════════════════
STEP 7 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

  • Plan-before-execute: announce the 9 slices, get thumbs-up
    before files (Master O may want to compress or expand — same
    flexibility as SESSION_26)
  • ~5 files typical per slice, ask above ~7
  • Always recommend next path as CTO/PM, not flat menu
  • Native git from C:\Users\GTMin\Projects\saas-agency-database\
  • Secrets never in chat — clipboard → dashboard
  • Anti-slop on any copy
  • RLS forced on every new multi-tenant table (D-006 / Principle #1)
  • Run advisors after any DDL (none planned this session, but
    standing rule)
  • D-024 12-point DoD on every screen Touch

═══════════════════════════════════════════════════════════════

Confirm Step 0 passed, then start reading the files in Step 1 order.
After reading, propose the 9-slice Session 27 plan (or whatever
slice count Master O wants) for thumbs-up before executing.
```

---

— end SESSION_27 prompt —
