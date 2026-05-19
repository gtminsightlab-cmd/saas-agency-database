# SESSION_26 — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-18 (end of SESSION_25)
**Predecessor handoff:** [`SESSION_25_HANDOFF.md`](SESSION_25_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT the OneDrive path)
**Live site:** https://directory.seven16group.com
**Latest deploy:** `5db5603` (READY 2026-05-18)

Paste the block below verbatim into the first message of the next Claude Code session.

---

```
This is the SESSION_OPENER for Seven16 family-hub SESSION_26.

═══════════════════════════════════════════════════════════════
STEP 0 — VERIFY WORKING DIRECTORY BEFORE ANYTHING ELSE
═══════════════════════════════════════════════════════════════

Run `pwd` (or `Get-Location` in PowerShell) and confirm output is:

  C:\Users\GTMin\Projects\saas-agency-database

If you see ANY of these paths instead, STOP and alert Master O:
  - C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database
  - Any path under \OneDrive\
  - Any path other than the canonical native-git clone above

Per family memory `reference_git_repo_state.md`, the OneDrive `.git` is
PERMANENTLY BROKEN.

If wrong directory, tell Master O exactly this:
  "Wrong working directory. Please close this Claude Code session and
   relaunch from the Desktop shortcut 'Open Claude — Agency Signal.bat',
   then paste this prompt again."

DO NOT proceed past Step 0 if the working directory is wrong.

═══════════════════════════════════════════════════════════════
STEP 1 — CONTEXT (only after Step 0 passes)
═══════════════════════════════════════════════════════════════

You are continuing the Seven16 family-hub track — SESSION_26.

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
  2. docs/handoffs/SESSION_26_HOMEPAGE_REDESIGN_BRIEF.md  ← **Path A
     source brief** (Master O CMO review, archived 2026-05-18 at
     SESSION_25 close). Read this if doing the homepage redesign.
     Includes pre-session resolution flags (brand naming + hosting
     destination) Master O answers at open.
  3. docs/handoffs/SESSION_25_HANDOFF.md  ← What shipped 2026-05-18
     (D-023 + Pillar 6 + Stripe catalog + D-024 doctrine).
  4. docs/context/FAMILY_HEALTH.md  ← Cross-product snapshot; refreshed
     end of SESSION_25.
  5. docs/context/DECISION_LOG.md  ← D-001 through D-024 + §6 standing
     rules. **D-024 is the latest lock (Front-End Production Standard,
     2026-05-18)** — every screen meets a 10-standard / 12-point-DoD bar
     before "done."
  6. docs/context/ENGINEERING_DOCTRINE.md  ← §"Front-end production
     standard (D-024)" + tooling locks (`sonner`, `eslint-plugin-jsx-a11y`)
     + shared `components/ui/*` primitive list. **Required reading for
     Path A.**
  7. docs/context/PRICING_STRIPE_CATALOG.md  ← Canonical Stripe SKU
     map (shipped SESSION_25).
  8. (optional) docs/decisions/adr-023-*.md + docs/strategy/ + docs/domains/
     ← D-023 supporting docs if you need deeper context.

═══════════════════════════════════════════════════════════════
STEP 2 — STATE AT SESSION OPEN
═══════════════════════════════════════════════════════════════

  • HEAD: 5db5603 (5 commits added to main during SESSION_25, all on
    branch claude/elastic-sanderson-03c205 and fast-forwarded to main).
  • D-023 9-pillar Agency Signal taxonomy locked + 22-file deliverable
    set shipped (ADR + 5 strategy + 8 domain docs + status dashboard
    refactor + STATE/BACKLOG updates + memory).
  • Pillar 6 saved-list refresh backend SHIPPED end-to-end:
    migration 0091 (column extensions on 3 existing tables + 3 new
    Pillar 6/7 tables), migration 0092 (get_saved_list_entity_ids RPC
    + saved_lists.last_acknowledged_at column), Edge Function
    recompute-saved-lists deployed (v1 ACTIVE verify_jwt:true),
    Vercel cron route + vercel.json (daily 04:00 UTC), 2 new API
    routes (acknowledge + delta-export), UI updates on /saved-lists.
  • Stripe catalog migration shipped to sandbox: 5 obsolete products
    archived; 13 new products + 22 prices created for the 6 D-021
    surfaces; Charter Member coupon L1Ngigfc (25% off forever).
  • Vercel deploy 5db5603 READY at directory.seven16group.com.

═══════════════════════════════════════════════════════════════
STEP 3 — ACTIVE ARC FOR SESSION_26 (CTO recommendation)
═══════════════════════════════════════════════════════════════

**Path A — Marketing homepage redesign per Master O CMO brief
(~5-6 hrs, ~19-22 files). First major application of D-024
Front-End Production Standard.**

**Source brief:** `docs/handoffs/SESSION_26_HOMEPAGE_REDESIGN_BRIEF.md`
(archived 2026-05-18 at SESSION_25 close, verbatim from Master O).

**Thesis:** "Stop targeting agency titles. Start targeting verified
carrier appointments." Reframe the homepage from "long-form explainer
+ pricing dive" to "distribution intelligence command center." Apollo.io
+ AM Best + Palantir aesthetic — serious, precise, data-rich.

**Pre-session resolution flags (Master O answers at open):**

  1. **Brand naming.** Brief uses "Seven16" as the product name; per
     family D-001/D-003 Seven16 Group is the trust/authority layer
     (NOT a product), and per D-004 the product is named "Agency
     Signal." Options: (a) rename product Agency Signal → Seven16
     (amends D-004), (b) keep Agency Signal canonical with "Seven16"
     as customer-facing shorthand, (c) marketing-only name change.

  2. **Hosting destination.** Push to current `main` and let Vercel
     auto-deploy to `directory.seven16group.com` (default), OR build
     behind a feature flag, OR build directly on `agencysignal.co`
     as cutover trigger.

**Scope (preview — full detail in SESSION_26_HOMEPAGE_REDESIGN_BRIEF.md):**

  (a) Tooling install (~10 min):
      - `npm i sonner` (D-024 toast library)
      - `npm i -D eslint-plugin-jsx-a11y` (D-024 a11y lint)
      - `npx shadcn-ui@latest init` if not already configured

  (b) Shared D-024 primitives at `components/ui/` (~45 min):
      - LoadingState.tsx · EmptyState.tsx · ErrorState.tsx
      - SuccessToast.tsx · ErrorBoundary.tsx · StatusPill.tsx

  (c) 13 marketing section components at `components/marketing/`
      (~3-4 hrs) per the brief:
      - MarketingHeader · HeroSection · AppointmentSearchMockup
      - ProblemSection · ComparisonSection · HowItWorksSection
      - VerticalCardsSection · RecruitPlaysSection · MethodologySection
      - DataTrustSection · PricingPreview · FinalCTA · MarketingFooter

  (d) Page assembly (~30 min): `app/page.tsx` replaces current home
      with new composition; `app/layout.tsx` adds <Toaster />.

  (e) D-024 DoD checklist pass (~30 min): every section hits the
      12-point bar (loading / empty / error / retry / success / mobile /
      keyboard / screen reader / partial data / slow connection / user
      leaving mid-request / malformed response).

  (f) Pre-publish data verification: brief uses claims like "36,212
      verified agencies" + "87,000+ contacts" + "60 parent groups" —
      current DB shows different numbers (32,951 / 135,453 / TBD).
      Per family standing rule "pricing copy is placeholder until
      data inventory catches up" — pull live counts via SQL before
      hardcoding into marketing copy.

**Files in scope:** ~19-22 (well above ~5 typical) — needs
plan-before-execute discipline + 7-10 bullet plan + thumbs-up before
writes. Single-decision conceptual change so doesn't need to split.

**Why this is the right Path A:**
  • D-024 just locked SESSION_25 — first application is highest-value
    when it's a customer-facing surface (vs. internal Pillar 6 UI)
  • Master O explicit directive: "make this first priority next session"
  • Current homepage is the conversion bottleneck (CMO finding)
  • Builds D-024 shared primitives organically as we ship sections
  • Pillar 6 UI hardening folds into this session naturally — the
    components/ui/* primitives built here get applied to row-actions.tsx
    as a bonus tail-end task if time allows

═══════════════════════════════════════════════════════════════
STEP 4 — ALTERNATIVES (if Master O wants to redirect)
═══════════════════════════════════════════════════════════════

  • **Path B — D-024 shared primitives + Pillar 6 UI hardening
    (focused, no marketing redesign)** (~3-4 hrs, ~8-10 files).
    The narrower version of Path A's D-024 build — just the
    components/ui/* primitives (LoadingState, EmptyState, ErrorState,
    SuccessToast, ErrorBoundary, StatusPill) + apply them to today's
    Pillar 6 UI (replace alert() with toast, add visible loading
    spinner, add success confirmation, add error boundary,
    aria-labels on icon buttons, handle "zero changes" empty state).
    No marketing redesign. Pick this if Master O wants D-024 shipped
    cleanly without bundling with the homepage redesign scope.

  • **Path C — Pillar 7 entitlements schema in seven16-platform
    satellite** (~30-45 min, ~1 migration). BACKLOG #5. Unblocks:
    D-015 Enterprise+ state-level RLS scoping, Distribution+ outcome
    SKU attribution, cross-product credit-wallet flow. Schema:
    `public.customer_entitlements` + `public.appointment_attributions`
    in soqqmkfasufusoxxoqzx, RLS forced + tenant-scoped. Pair with
    BACKLOG #6 credit_consumption_rates table (~10 min addition).
    Lower lift; valuable but no live Enterprise+ customer waiting.

  • **Path D — AS Session 5 Option A SWR client-cache** (~2-2.5 hrs).
    Install swr, wrap data loaders on /build-list + /saved-lists,
    revalidation on focus + manual refresh. Closes the perf story
    from AS Session 3.

  • **Path E — Distribution Expander UX thesis spec** (~half session).
    Document the Pillar 7 enterprise workflow: state → vertical →
    target agency profile → carrier-appointment filter → recommended
    agency list → export. Spec the screen flow BEFORE building.

  • **Path F — STATE.md refresh sweep** (~30 min). Reconcile §3 row
    counts + §6 admin module count + migration list against live DB.
    Doc-trust win. Pair with any other path as session tail-end.

  • **Path G — Verified/claimed profile flow scoping** (~30 min).
    Tier 1.x feature; agency_profiles + producer_profiles columns
    landed in migration 0091; flow UX needs design. Spec only,
    build later.

═══════════════════════════════════════════════════════════════
STEP 5 — MASTER-O TASKS (block on these before some paths)
═══════════════════════════════════════════════════════════════

These don't block Claude work but Master O should do them when bandwidth
allows. None require a Claude session — Master O's dashboard actions:

  1. **CRON_SECRET in Vercel** (5 min). Without this the daily Pillar 6
     cron returns 500. Generate `openssl rand -base64 32`, Vercel
     dashboard → Settings → Env Variables → Add new (Sensitive,
     Production: CRON_SECRET).

  2. **Stripe webhook endpoint registration** (5 min). Dashboard at
     dashboard.stripe.com/acct_1TLUF6HmqSDkUoqw/test/webhooks. Endpoint
     URL: https://directory.seven16group.com/api/stripe/webhook
     Events to register:
       - checkout.session.completed
       - customer.subscription.created
       - customer.subscription.updated
       - customer.subscription.deleted
       - invoice.paid
       - invoice.payment_failed
     Use the URL-prefilled-events trick from
     `feedback_stripe_mcp_webhook_dashboard_only.md`.

  3. **Sentry org token rotation** (5 min). Every deploy logs "Invalid
     org token (401)" on the @sentry/nextjs After Production Compile
     step. Non-fatal but log spam. Sentry dashboard → org settings →
     rotate auth token → set `SENTRY_AUTH_TOKEN` in Vercel
     (Sensitive, Production).

═══════════════════════════════════════════════════════════════
STEP 6 — DO NOT in this session
═══════════════════════════════════════════════════════════════

  • Build Enterprise+ state slider SKUs (D-015 complexity — its own
    session AFTER entitlements schema lands)
  • Build /api/stripe/checkout extension (its own session AFTER
    entitlements schema + credit_consumption_rates land)
  • Touch the cron schedule (already 04:00 UTC, leave alone)
  • Re-litigate D-023 9-pillar taxonomy (locked per Rule 4 — any
    refinement requires a superseding decision)
  • Treat Bindlab as a Seven16-family sibling product (per D-022 it's
    outside the family; per Master O 2026-05-18 directive, AS does
    not intersect with Bindlab going forward)
  • Ship ANY screen below the D-024 Front-End Production Standard
    (locked 2026-05-18). 10 standards + 12-point Definition of Done
    is the ship gate. Use shared components/ui/* primitives (build
    them this session if doing Path A); apply-on-touch policy for
    existing screens not yet brought up to standard.

═══════════════════════════════════════════════════════════════
STEP 7 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

  • Plan-before-execute: 5-10 bullet plan + thumbs-up before files
  • ~5 files typical per slice, ask above ~7
  • Always recommend next path as CTO/PM, not flat menu
  • Native git from C:\Users\GTMin\Projects\saas-agency-database\
  • Secrets never in chat — clipboard → dashboard
  • Anti-slop on any copy (per `feedback_no_slop_in_copy.md`)
  • RLS forced on every new multi-tenant table (D-006 / Principle #1)
  • Run advisors after any DDL — expect zero NEW SECURITY DEFINER
    warnings (84 pre-existing in family memory; don't introduce more)

═══════════════════════════════════════════════════════════════

Confirm Step 0 passed, then start reading the files in Step 1 order.
After reading, propose a 5-10 bullet plan for Path A (entitlements
schema) — or whichever path Master O picks. Wait for thumbs-up before
executing.
```

---

— end SESSION_26 prompt —
