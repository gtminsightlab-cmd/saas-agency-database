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
  2. docs/handoffs/SESSION_25_HANDOFF.md  ← What shipped 2026-05-18
     (D-023 + Pillar 6 + Stripe catalog).
  3. docs/context/FAMILY_HEALTH.md  ← Cross-product snapshot; refreshed
     end of SESSION_25.
  4. docs/context/DECISION_LOG.md  ← D-001 through D-023 + §6 standing
     rules. D-023 is the latest lock (Agency Signal 9-pillar taxonomy).
  5. docs/context/PRICING_STRIPE_CATALOG.md  ← Canonical Stripe SKU
     map (shipped SESSION_25).
  6. (optional) docs/decisions/adr-023-*.md + docs/strategy/ + docs/domains/
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

**Path A — Pillar 7 entitlements schema in seven16-platform satellite
(~30-45 min, ~1 migration file + apply + verify).**

Lands the schema BACKLOG #5 calls for. Unblocks both:
  (i) D-015 Enterprise+ state-level RLS scoping (which agencies a
      buyer can see when they purchase per-state)
  (ii) Distribution+ outcome SKU attribution tracking
       ($300-$500/qualified appointment)
  (iii) Cross-product credit-wallet flow (universal credit purchases
        from AS or DOT Intel route through entitlements check)

Schema:
  - public.customer_entitlements (
      customer_id uuid, product_id uuid, scope_type text,
      scope_value text, granted_at timestamptz, expires_at timestamptz,
      ...
    ) per D-015 §7
  - public.appointment_attributions (
      customer_id, agency_id, attribution_type, qualified_at, ...
    ) for outcome SKU tracking

Both tenant-scoped via current_tenant_id() (same RLS pattern as
sdlsdovuljuymgymarou) but on `soqqmkfasufusoxxoqzx`. After apply, run
advisors to confirm zero new SECURITY DEFINER warnings.

Bundle option: pair with BACKLOG #6 — credit_consumption_rates table
in sdlsdovuljuymgymarou (~10 min addition). Same session.

═══════════════════════════════════════════════════════════════
STEP 4 — ALTERNATIVES (if Master O wants to redirect)
═══════════════════════════════════════════════════════════════

  • **Path B — AS Session 5 Option A SWR client-cache** (~2-2.5 hrs).
    Install swr, wrap data loaders on /build-list + /saved-lists,
    revalidation on focus + manual refresh. Closes the perf story
    from AS Session 3. Lower-priority than Path A but smaller risk.

  • **Path C — Distribution Expander UX thesis spec** (~half session).
    Document the Pillar 7 enterprise workflow: state → vertical →
    target agency profile → carrier-appointment filter → recommended
    agency list → export. Spec the screen flow BEFORE building.
    Depends on Path A entitlements schema being defined (can spec
    against the planned schema in parallel).

  • **Path D — STATE.md refresh sweep** (~30 min). Reconcile §3 row
    counts (already partially refreshed SESSION_25) + §6 admin module
    count + migration list against live DB. Doc-trust win. Pair with
    any of A/B/C as session tail-end.

  • **Path E — Verified/claimed profile flow scoping** (~30 min).
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
