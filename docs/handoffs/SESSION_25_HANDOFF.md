# Family-Hub Session 25 — D-023 + Pillar 6 backend + Stripe catalog (2026-05-18)

**Date:** 2026-05-18
**Repo:** `saas-agency-database` (family hub)
**Branch:** `main` (work performed on worktree `claude/elastic-sanderson-03c205`)
**Predecessor:** [`SESSION_24_HANDOFF.md`](SESSION_24_HANDOFF.md) (family-hub) · [`AGENCY_SIGNAL_SESSION_4_HANDOFF.md`](AGENCY_SIGNAL_SESSION_4_HANDOFF.md) (AS product)
**HEAD at session open:** `fd3b360` (D-022 family-doc cleanup, 2026-05-15)
**HEAD at session close:** `5db5603` (Stripe catalog migration)
**Commits added to main:** 5
**Live URL:** https://directory.seven16group.com (deploy `5db5603` READY)
**Vercel deploy state:** ✅ READY (after one `fix(d-023):` to exclude Deno-runtime Edge Function from Next.js TS build — see commit `7b2a471`)

---

## Theme — three arcs in one session

1. **D-023 architect strategy review + 9-pillar product taxonomy locked** — replaces the prior internal 5-domain operational framing with a customer-facing 9-pillar taxonomy. Neilson + ProgramBusiness added as adjacent competitive references. Bindlab references stripped from AS-tagged docs per Master O directive "no longer intersecting AS with Bindlab."
2. **BACKLOG #1 Saved-list refresh backend + delta export shipped (Pillar 6)** — the D-023 "static export → SaaS" differentiator. Migration + Edge Function + cron route + ack/delta-export APIs + UI surface. End-to-end pipeline validated via SQL simulation (saved list `97636b60` shows +1 agency / +148 contacts delta vs. save time, ready for first cron run).
3. **Stripe catalog migration shipped to sandbox (Path A from SESSION_25_PROMPT)** — 6 D-021 surfaces created (Universal Credits + DOT Alerts + Directory Listings + Full DB SKU + Learning Center + Charter Member coupon). 5 obsolete pre-D-021 products archived. Canonical SKU map at `docs/context/PRICING_STRIPE_CATALOG.md`.

---

## What shipped

### Doctrine (commit `c355b43`)

**D-023 Agency Signal positioning lock — "Distribution intelligence for commercial insurance."** Family DECISION_LOG entry + 22 file deliverables:

- `docs/decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md` (Bindlab refs reframed as "out of Seven16 family per D-022" per Master O directive)
- 5 strategy docs: `docs/strategy/agency-signal-positioning.md`, `agency-signal-product-boundaries.md`, `neilson-competitive-boundary.md`, `programbusiness-competitive-boundary.md`, `distribution-expander-thesis.md`
- 8 domain docs at `docs/domains/` covering all 9 pillars (Pillar 9 Market Discovery PARKED with 3-condition trigger)
- `docs/agency-signal-status.html` refactored to 9-pillar product taxonomy (was 5 operational domains)
- `docs/STATE.md` §1.5 product boundary added + §3 row counts refreshed + §6 admin module count corrected 13→17
- `docs/BACKLOG.md` parks Pillar 9, adds 5 Tier 1.x items, source-of-truth pointers
- `docs/context/DECISION_LOG.md` D-023 entry locked
- Memory: `project_agency_signal_positioning.md` (new), `reference_competitive_landscape_full.md` extended (ProgramBusiness added), `MEMORY.md` pointer

### Schema extensions (commit `dc59721`)

**Migration 0091 — Agency Signal D-023 schema extensions.** Applied to `sdlsdovuljuymgymarou` via Path B (ALTER TABLE column-add on overlapping tables; CREATE TABLE for genuinely new ones):

- `public.agencies` +10 cols (profile_status, verified, claimed_by_user_id, public_slug UNIQUE, agency_summary, specialties[], states_active[], lines_of_business[], confidence_score, last_verified_at) — Pillar 1 verified/claimed profile
- `public.contacts` +7 cols (profile_status, verified, app_user_id, states_active[], specialties[], vertical_focus[], confidence_score) — Pillar 2 producer profile
- `public.agency_carriers` +9 cols (appointment_status, states[], lines_of_business[], verticals[], confidence, source_type, first_observed_at, last_observed_at, verified) — Pillar 3 richer appointment shape
- NEW `public.saved_list_snapshots` (Pillar 6 / BACKLOG #1)
- NEW `public.saved_list_changes` (Pillar 6 / BACKLOG #1)
- NEW `public.distribution_expander_segments` (Pillar 7 future use)
- 9 new indexes; RLS forced + tenant-scoped policies on all 3 new tables; zero new advisor warnings

### Pillar 6 saved-list refresh backend (commit `b8ac2f5` + `7b2a471` build fix)

**Migration 0092** applied: `get_saved_list_entity_ids` RPC (sibling to `get_save_summary_counts` mig 0068) + `last_acknowledged_at` column on `saved_lists`.

**Edge Function `recompute-saved-lists` v1 ACTIVE** in `sdlsdovuljuymgymarou` (verify_jwt:true) — D-013 family pattern with direct `postgres.js` connection. Iterates saved_lists, resolves filter via RPC, set-diffs against latest snapshot, writes `saved_list_changes` rows (agency_added/removed, contact_added/removed), writes new snapshot, flips `has_updates=true` on detected changes.

**Vercel cron `app/api/cron/saved-lists-refresh/route.ts`** scheduled `0 4 * * *` UTC (daily) per new `vercel.json`. Validates `CRON_SECRET` header, invokes Edge Function with service-role JWT.

**API routes:**
- `app/api/saved-lists/[id]/acknowledge/route.ts` — POST flips has_updates=false + bumps last_acknowledged_at
- `app/api/saved-lists/[id]/delta-export/route.ts` — GET returns CSV of changes since last_acknowledged_at (hydrated with agency/contact fields), inline-acknowledges on success

**UI updates:**
- `app/saved-lists/row-actions.tsx` adds "Download Updates" button (visible only when has_updates=true), wires to delta-export + router.refresh()
- `app/saved-lists/page.tsx` selects `last_run_at` + `last_acknowledged_at`; tooltip shows "Last checked YYYY-MM-DD" on row

**Build fix (commit `7b2a471`):** `tsconfig.json` exclude added `supabase/functions/**` to keep Next.js TS build from choking on the Deno-style `https://deno.land/x/postgresjs@...` import in the Edge Function file.

### Stripe catalog (commit `5db5603`)

5 obsolete products archived (4× Prospecting Credits packs + Pro Unlimited DOT lookups). Created in sandbox `acct_1TLUF6HmqSDkUoqw`:

- **Universal Credits** product (`prod_UXg4cZMy59DjoS`) + 5 prices with bonus-tier metadata
- **DOT Alerts** — 6 tier products + monthly recurring prices ($25/$50/$90/$175/$350/$500)
- **Directory Listings** — 4 products (retail $120/yr, agency 1st loc $120/yr, agency addl loc $60/yr, wholesaler $1,000/mo)
- **Agency Signal Full Database** — `prod_UXgK5wtZVLcmDJ`, $12,500 one-time
- **Learning Center Course 1** — `prod_UXgKDu7x8QClJx` + 6 pack prices (1/5/10/15/20/25 seats with volume discounts)
- **Charter Member 25%** coupon (`L1Ngigfc`, percent_off 25, duration forever)

Canonical SKU map at [`docs/context/PRICING_STRIPE_CATALOG.md`](../context/PRICING_STRIPE_CATALOG.md).

---

## Commits this session (chronological)

| Commit | Title |
|---|---|
| `c355b43` | docs(d-023): agency signal positioning lock + 9-pillar product taxonomy (18 files, +1860/-13) |
| `dc59721` | feat(d-023): migration 0091 — agency signal schema extensions (1 file, +218) |
| `b8ac2f5` | feat(d-023): saved-list refresh backend + delta export (Pillar 6 / BACKLOG #1) (8 files, +903/-6) |
| `7b2a471` | fix(d-023): exclude supabase/functions from Next.js TS build (1 file, +2/-1) |
| `5db5603` | feat(d-021): Stripe catalog migration (6 D-021 surfaces in sandbox) (2 files, +213/-1) |

5 commits, ~30 files. All on main via fast-forward push (no PRs).

---

## What's NOT in family DECISION_LOG (new D-entries this session)

**D-023 — Agency Signal positioning lock.** "Distribution intelligence for commercial insurance." 9-pillar product taxonomy. Neilson + ProgramBusiness adjacent competitive references. 4 personas. Verified/claimed profile flow queued Tier 1.x. AS does NOT intersect with products outside Seven16 family architecture (AMS/CRM/submissions/quote-bind/claims/policy admin live elsewhere per D-022).

D-022 (TIQ spinout) + D-021 (universal credits) preserved as-is. Family ledger now at D-001 through D-023.

---

## What's NOT done — queued for next session (CTO priority order)

### 🔴 Blocked on Master O action (5 min each)

1. **Set `CRON_SECRET` in Vercel production env** — `openssl rand -base64 32`, paste to Vercel dashboard → Settings → Env Variables → Add new (Sensitive, Production). Without this the daily cron will return 500. Manual test post-set: `curl -X POST https://directory.seven16group.com/api/cron/saved-lists-refresh -H "Authorization: Bearer ${CRON_SECRET}"` should return `{ edge_response: { processed: 4, first_run_initialized: 4, ... } }`.

2. **Register Stripe webhook endpoint** at `https://directory.seven16group.com/api/stripe/webhook` for: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Dashboard-only per `feedback_stripe_mcp_webhook_dashboard_only.md`. Use URL-prefilled-events trick from the memory.

3. **Fix Sentry release-upload token** — Sentry post-build sourcemap upload is failing with "Invalid org token (401)" on every deploy. Non-fatal (deploys succeed) but should be cleaned up. Master O → Sentry dashboard → rotate org token → set `SENTRY_AUTH_TOKEN` in Vercel.

### 🟡 Top of Claude queue (next family-hub session)

4. **Pillar 7 schema migration in `seven16-platform` satellite** (`soqqmkfasufusoxxoqzx`): `customer_entitlements` + `appointment_attributions` per D-015 §7 / BACKLOG #5. Required before Distribution Expander state-level RLS + outcome SKU tracking can ship end-to-end.

5. **Credit consumption schema** in AS satellite: `credit_consumption_rates` table per BACKLOG #6 / D-014. `credit_wallets` + `credit_ledger` exist (2 test rows in wallets, 0 in ledger).

6. **Enterprise+ state SKUs (D-015)** — ~50 state SKUs + Distribution Suite bundle ($22,500/yr) + Distribution+ outcome SKU ($300-$500/qualified appointment). Its own session per D-015 complexity. Requires entitlements schema (#4) shipped first.

7. **`/api/stripe/checkout` extension** to support the new universal-credits + tier-pick + Charter-member-discount flow. Existing route handles legacy SKUs only. Its own session.

8. **Cart UI + tier-selection components** for à la carte purchase flow. Builds on #7. Its own session.

### 🟢 Smaller items in Tier 1.x

9. AS Session 5 Option A — SWR client-cache on `/build-list` + `/saved-lists` (~2–2.5 hrs)
10. Verified / claimed profile flow scoping (~30 min, D-023 new)
11. Producer-centric segmentation views (D-023 new)
12. Confidence badges + stale alerts in UI (Pillar 8 trust-as-feature, D-023 new)
13. 5–8 Distribution Expander demos (BACKLOG #8 — pressure-test D-015 pricing)
14. STATE.md row count refresh / additional sweep (partial refresh done this session)
15. `_trucking_load_log` RLS cleanup (BACKLOG #10)

---

## Cross-product implications

- **AS docs now Bindlab-free.** Family-history references in `DECISION_LOG.md §4 retired brands` register retained per Rule 4. Family-wide docs (MASTER_CONTEXT, FAMILY_HEALTH, PRODUCT_REPO_INDEX, FOLDER_AND_MEMORY_MAP) may still mention Bindlab — out of scope for this session per Master O's "we may mention it in about us later" framing.
- **Stripe catalog applies to family-wide pricing** but Master O has not yet enrolled any Charter Members. The coupon `L1Ngigfc` exists and is wireable; the customer-level metadata flag pattern is documented.
- **DOT Intel webhook integration** — when DOT Intel customer purchases credits via AS-side checkout, the universal credit wallet in `sdlsdovuljuymgymarou` is shared infrastructure. Pillar 7 schema migration (#4 above) needs to land in `seven16-platform` BEFORE end-to-end credit consumption can route across products.

---

## Memory updates

Already updated this session:
- NEW `memory/project_agency_signal_positioning.md` — D-023 positioning + 9 pillars + 4 personas + competitor boundaries
- UPDATED `memory/reference_competitive_landscape_full.md` — added ProgramBusiness + Apollo to Agency Signal section
- UPDATED `memory/MEMORY.md` — D-023 ledger reference + pointer to new positioning file

**Pending memory sweep** for next session:
- `memory/MEMORY.md` D-023 paragraph still says migration 0091 "NOT YET APPLIED" — needs correction (we DID apply it Path B inline in this session, plus 0092 + Stripe catalog + Edge Function). Stale claim only — context still useful, just the application status line is outdated.
- New memory file recommended: `reference_stripe_catalog_seven16.md` pointing at `docs/context/PRICING_STRIPE_CATALOG.md` as canonical SKU map (currently only in-repo).

---

## How to pick up the next thread

Next family-hub session opens with:
1. Read this handoff
2. Read [`docs/BACKLOG.md`](../BACKLOG.md) (already reflects this session's work)
3. Read [`docs/context/FAMILY_HEALTH.md`](../context/FAMILY_HEALTH.md) (refreshed at session close)
4. Open [`SESSION_26_PROMPT.md`](SESSION_26_PROMPT.md) for the paste-ready opener

**Recommended next move per CTO priority:** the entitlements schema migration in `seven16-platform` (BACKLOG #5 / Pillar 7 / Enterprise+ unblock). It's a small migration (~30 min) that unblocks both the Distribution Expander build AND the cross-product credit consumption flow. Once it lands, the Stripe Enterprise+ state SKUs can ship and Charter Member outreach revenue can flow end-to-end.

---

## What I'd do if I were the next Claude opening this

**5-minute orientation:**
1. Read this handoff
2. Check current Vercel deploy state (`mcp__da129817..._get_deployment` on latest)
3. Check whether CRON_SECRET is now set: `curl https://directory.seven16group.com/api/cron/saved-lists-refresh -H "Authorization: Bearer test"` — 401 (good) vs. 500 (CRON_SECRET still missing)
4. If CRON_SECRET set + cron fired overnight: query `SELECT count(*) FROM public.saved_list_snapshots` — should be 4+ (initialization) or higher if changes were detected

**Then:** pick up BACKLOG #5 entitlements schema. ~30 min. Unblocks the rest of the family pricing motion.

---

*End SESSION_25_HANDOFF — D-023 + Pillar 6 + Stripe catalog shipped 2026-05-18. Family ledger D-001 through D-023.*
