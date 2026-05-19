# SESSION_28 — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-19 (end of SESSION_27)
**Predecessor handoff:** [`SESSION_27_HANDOFF.md`](SESSION_27_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT the OneDrive path)
**Live site:** https://directory.seven16group.com
**Latest deploy:** `0a8b2dc` READY 2026-05-19

Paste the block below verbatim into the first message of the next Claude Code session.

---

```
This is the SESSION_OPENER for Seven16 family-hub SESSION_28.

═══════════════════════════════════════════════════════════════
STEP 0 — VERIFY WORKING DIRECTORY BEFORE ANYTHING ELSE
═══════════════════════════════════════════════════════════════

Run `pwd` (or `Get-Location` in PowerShell) and confirm output is:

  C:\Users\GTMin\Projects\saas-agency-database

If you see ANY of these paths instead, STOP and alert Master O:
  - C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database
  - Any path under \OneDrive\
  - Any path other than the canonical native-git clone above

Per family memory, the OneDrive `.git` is PERMANENTLY BROKEN
(corrupted by OneDrive sync).

DO NOT proceed past Step 0 if the working directory is wrong.

═══════════════════════════════════════════════════════════════
STEP 1 — CONTEXT (only after Step 0 passes)
═══════════════════════════════════════════════════════════════

You are continuing the Seven16 family-hub track — SESSION_28.

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
     Active arc is now "Session 28 — Intelligence Home + Vertical
     Intelligence" (Sessions 27-32 epic, 2 of 6).
  2. docs/handoffs/SESSION_27_HANDOFF.md  ← What shipped 2026-05-19
     (palette swap + 5 components/app/* primitives + Sidebar relabel
     + Recruit Lists wrap).
  3. docs/context/FAMILY_HEALTH.md  ← Refreshed end of SESSION_27.
  4. docs/context/DECISION_LOG.md  ← D-024 still active doctrine —
     every screen meets 10-standard / 12-point-DoD bar.
  5. docs/context/ENGINEERING_DOCTRINE.md  ← §"Front-end production
     standard (D-024)" + tooling locks. REQUIRED reading.
  6. Existing app surfaces (read what you're touching):
     - app/verticals/page.tsx (current /verticals — needs redesign)
     - app/verticals/[slug]/page.tsx (detail page — needs polish)
     - components/marketing/VerticalCardsSection.tsx (the homepage
       version — reference for live-data wiring patterns, but does
       NOT use AppShell; don't reuse directly)
     - components/app/* (5 primitives shipped Session 27 — use these)
     - components/app/sidebar.tsx (add Home link when /home exists)

═══════════════════════════════════════════════════════════════
STEP 2 — STATE AT SESSION OPEN
═══════════════════════════════════════════════════════════════

  • HEAD: 0a8b2dc on main (SESSION_27 close: foundation shell +
    Recruit Lists wrap).
  • Vercel deploy dpl_8SRxpyK5q3kwXVBnUzpmM5zdBn8s READY at
    directory.seven16group.com (42s build).
  • 5 components/app/* primitives shipped (PageHeader, Breadcrumbs,
    TopBar, MetricCard, DataTable) — USE these, don't rebuild.
  • 6 components/ui/* primitives shipped Session 26 (LoadingState,
    EmptyState, ErrorState, SuccessToast, ErrorBoundary, StatusPill).
  • Tailwind palette: brand-* = #0F766E teal-700 anchor + intel-cyan
    (#0891B2) + intel-dark (#07111F).
  • Sidebar relabeled per Master O lock (5 nav label renames; URLs
    untouched).
  • AppShell pattern is per-page composition: pages render their
    own <PageHeader> + <Breadcrumbs> inside <AppShell>{children}.
  • sonner Toaster mounted in app/layout.tsx since SESSION_26.
  • jsx-a11y flat-config lint at eslint.config.mjs.
  • .npmrc legacy-peer-deps=true for Vercel install.
  • Pre-existing jsx-a11y errors NOT yet cleaned (apply-on-touch
    targets this session): app/sign-up/form.tsx 2× anchor-is-valid +
    1× missing react-hooks plugin; app/global-error.tsx html-has-lang.

═══════════════════════════════════════════════════════════════
STEP 2.5 — STANDING REMINDER: Seven16 Group Partner Program
═══════════════════════════════════════════════════════════════

HEADS UP — SEVEN16 GROUP PARTNER PROGRAM INTEGRATION

We are creating a parent Seven16 Group Partner Program that will live at:

partners.seven16group.com

This will be the shared referral, affiliate, certified partner, deal
registration, demo access, and commission tracking system for all
Seven16 Group products.

Important:
Do NOT build a standalone referral, affiliate, partner, or commission
system inside this product.

This product should only prepare to integrate with the parent Seven16
partner hub.

Parent ownership:
- Seven16 Group owns the partner program.
- This product (Agency Signal) participates in the partner program.
- Product-specific referral/partner logic should use the shared
  Seven16 system.

Future integration requirements for this product (not for Session 28):
1. Add a lightweight public page: /partners
2. The /partners page should explain participation + referral mechanics.
3. Primary CTA: https://partners.seven16group.com/apply?product=agency_signal
4. Signup should eventually support ?ref=REFERRAL_CODE + cookie +
   product_key metadata.
5. Billing should eventually forward invoice.paid + invoice.refunded /
   charge.dispute.* to parent reward handler.
6. Admin should eventually show referral attribution (read-only, no
   manual payouts in-product).
7. Security: partners must not access live customer data; demo access
   uses seeded fake data only.

For now, do not implement the full partner system here. Just avoid
architectural decisions that would block future integration.

Full doctrine (family-wide, cross-repo) at family memory
`project_seven16_partner_program.md`. PRODUCT_KEY per product:
agency_signal (this repo) / dotintel / dotagencies.

═══════════════════════════════════════════════════════════════
STEP 3 — ACTIVE ARC FOR SESSION_28 (CTO recommendation)
═══════════════════════════════════════════════════════════════

**SESSION_28 — Intelligence Home + Vertical Intelligence redesign
(~6 hrs, ~18 files).** Second slice of the Sessions 27-32 internal-app
redesign epic.

**Goal:** Ship the daily command center (`/home`) + redesign the
flagship Pillar 4 surface (`/verticals` + `/verticals/[slug]`) inside
the new chrome.

**9-slice plan (mirrors the SESSION_27 slicing methodology):**

  1. **Audit existing surfaces** (~15 min, 0 writes).
     Read app/verticals/page.tsx + app/verticals/[slug]/page.tsx +
     components/marketing/VerticalCardsSection.tsx. Note what live-data
     queries already exist (mv_vertical_summary, vertical_to_carrier
     joins, contact counts per vertical). Plan which data the /home
     KPI strip will share with /verticals (cache them once if possible).

  2. **NEW `/home` route scaffolding** (~30 min, 2 files).
     Create app/home/page.tsx + app/home/layout.tsx (if needed).
     Compose <AppShell><PageHeader title="Home" subtitle="Your
     distribution-intel command center"/>{stub sections}</AppShell>.
     Server component with auth gating via AppShell.

  3. **VerticalOpportunityCard primitive** (~30 min, 1 file).
     New components/app/vertical-opportunity-card.tsx — card variant
     for vertical cards showing: vertical name + icon + agency count +
     contact count + writing companies + best-fit indicator
     (StatusPill) + drill-in link to /verticals/[slug]. Composes
     MetricCard-style layout with a CTA footer. Per D-024: loading
     skeleton + partial-data fallbacks + accessible.

  4. **/home page body** (~60 min, 1 file).
     Populate `/home` with:
     - Top KPI strip (4 MetricCards): Total Agencies / Total Contacts
       / Verified Appointments / Writing Companies
     - "Recommended Plays" section: 3-4 PlayCards linking to common
       Build Recruit List workflows (Displace Carolina Casualty in
       Trucking / Launch Inland Marine / Map Liberty Mutual exits / etc.)
     - "Recent Activity": last N recruit lists touched (querying
       saved_lists ordered by last_run_at desc, top 5)
     - "Quick Actions" sidebar: Build Recruit List / Browse Verticals /
       Agency Search

  5. **/verticals page redesign** (~60 min, 1 file).
     Replace existing chrome with <AppShell> + <PageHeader title=
     "Vertical Intelligence" subtitle="..."/>. Top KPI strip
     (3-4 cards: Active Verticals / Total Specialist Agencies /
     Top Vertical by Volume / Vertical Coverage %).
     Grid of <VerticalOpportunityCard> components (live from
     mv_vertical_summary). EmptyState fallback if MV returns [].

  6. **/verticals/[slug] detail polish** (~45 min, 1 file).
     <AppShell> + <Breadcrumbs items={[Home, Vertical Intelligence,
     slug]} /> + <PageHeader title={vertical.name}/>. Keep existing
     content sections but wrap data tables in <DataTable> chrome.
     Add MetricCard row for: Agencies in vertical / Contacts /
     Top Writing Companies / Verified appointments.

  7. **Add Home link to sidebar** (~10 min, 1 file).
     components/app/sidebar.tsx — add Home as the first link in the
     Intelligence section (above Vertical Intelligence), OR as a
     standalone link at the very top above all sections. URL: /home.
     Brand link can also be updated to point to /home now that the
     route exists (currently points to /build-list as placeholder).

  8. **Apply-on-touch D-024 cleanup** (~30 min, 2 files).
     Fix 3 pre-existing jsx-a11y errors flagged in SESSION_26:
     - app/sign-up/form.tsx: 2× anchor-is-valid + install
       eslint-plugin-react-hooks dev dep
     - app/global-error.tsx: add lang attribute to <html>
     These are NOT Session 28 introductions — but per D-024
     apply-on-touch policy, clean them while in the area.

  9. **D-024 DoD verify + commit + push + Vercel deploy verify**
     (~30 min).
     12-point DoD walk on /home + /verticals + /verticals/[slug] +
     jsx-a11y lint pass + npm run build smoke + commit
     `feat(d-024,intel-app): /home + Vertical Intelligence redesign
     (Session 28)` + push to main + verify deploy READY at
     directory.seven16group.com.

**Total estimate: ~6 hours, ~10-12 files across 1 squash commit.**

═══════════════════════════════════════════════════════════════
STEP 4 — ALTERNATIVES (if Master O wants to redirect)
═══════════════════════════════════════════════════════════════

  • **Skip /home, deliver /verticals + /verticals/[slug] only** (~3.5
    hrs, ~6 files). Higher signal-per-hour if /verticals is the more
    visited surface. /home then becomes a Session 29 task. Not
    recommended — /home is the natural daily landing page; without it
    users land on /build-list which doesn't tell them what's new.

  • **Compress /verticals/[slug] polish into Session 29.** Ship /home
    + /verticals only this session. Cleaner scope. Detail page polish
    folds into Build Recruit List session if the page is the input
    surface for building vertical-targeted lists.

  • **Path B — Master O dashboard actions** (~10 min Master O time):
    CRON_SECRET + Stripe webhook + Sentry token. Still pending from
    SESSION_25. No Claude time needed.

  • **Path C — GitHub Dependabot triage** (~30 min Claude). 3 pre-
    existing vulns flagged on push (1 high, 2 moderate). Triage,
    classify, decide upgrade vs accept. Standalone session.

═══════════════════════════════════════════════════════════════
STEP 5 — MASTER-O TASKS (block on these — dashboard only)
═══════════════════════════════════════════════════════════════

  1. **CRON_SECRET in Vercel** (5 min) — still pending from SESSION_25.
     Generate `openssl rand -base64 32`, Vercel dashboard →
     Settings → Env Variables → Add (Sensitive, Production:
     CRON_SECRET). Without this Pillar 6 daily cron returns 500.

  2. **Stripe webhook endpoint registration** (5 min) — still pending
     from SESSION_25. dashboard.stripe.com → acct_1TLUF6HmqSDkUoqw →
     test/webhooks. URL: https://directory.seven16group.com/api/stripe/
     webhook. Events: checkout.session.completed / customer.subscription.
     created/updated/deleted / invoice.paid / invoice.payment_failed.

  3. **Sentry org token rotation** (5 min) — still pending. Every
     deploy logs `Invalid org token (401)`. Sentry dashboard →
     rotate org token → set SENTRY_AUTH_TOKEN in Vercel (Sensitive,
     Production).

═══════════════════════════════════════════════════════════════
STEP 6 — DO NOT in this session
═══════════════════════════════════════════════════════════════

  • Build Stepper / StickySummaryPanel components (Session 29 scope)
  • Redesign Agency Search / AI Research Assistant / Exports (Session 30)
  • Polish admin pages (Session 32)
  • Touch DB tables, Stripe webhook URLs, or Pillar 6 Edge Function URLs
  • Re-litigate the Sidebar 4-section regroup or label renames (locked
    SESSION_27)
  • Re-litigate the Tailwind palette swap (locked SESSION_27)
  • Re-litigate the per-page composition pattern (locked SESSION_27 —
    pages render their own PageHeader + Breadcrumbs inside AppShell)
  • Build StatusChip as a separate component (reuse StatusPill —
    SESSION_27 judgment call carried forward)
  • Build a standalone referral/affiliate/partner/commission system
    (Step 2.5 doctrine — parent hub owns it)
  • Build a mobile sidebar drawer (deferred to future session — keep
    existing mobile sign-out strip)

═══════════════════════════════════════════════════════════════
STEP 7 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

  • Plan-before-execute: announce the 9 slices, get thumbs-up
    before files (Master O may want to compress or expand)
  • ~5 files typical per slice, ask above ~7
  • Always recommend next path as CTO/PM, not flat menu
  • Native git from C:\Users\GTMin\Projects\saas-agency-database\
  • Secrets never in chat — clipboard → dashboard
  • Anti-slop on any copy
  • RLS forced on every new multi-tenant table (D-006 / Principle #1)
  • Run advisors after any DDL (none planned this session, but
    standing rule)
  • D-024 12-point DoD on every screen touched
  • Apply-on-touch D-024 cleanup on pre-existing tech debt

═══════════════════════════════════════════════════════════════

Confirm Step 0 passed, then start reading the files in Step 1 order.
After reading, propose the 9-slice Session 28 plan (or whatever slice
count Master O wants) for thumbs-up before executing.
```

---

— end SESSION_28 prompt —
