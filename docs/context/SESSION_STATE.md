# Session State — Seven16 Group

**Last updated:** 2026-05-03 (session 18 — DOT Intel demo-blockers (a)/(b)/(c) closed: force-dynamic, canonical demo carrier, /contact RLS fix)
**Companion to:** [MASTER_CONTEXT.md](MASTER_CONTEXT.md)

> Snapshot of where each product stands **right now**. Three platform products in the family — Agency Signal (live), DOT Intel (demo build at dotintel.io), Threshold IQ (build in progress in another session) — plus standalone-capable add-ons (Growtheon reseller, Seven16Recruit stealth) and parked future products. Read the relevant section before starting work.

### Quick-ref: where each repo lives + latest commit (end of session 15 → updated session 16)

| Repo | Canonical clone | Latest `origin/main` commit |
|---|---|---|
| `saas-agency-database` (family hub + Agency Signal) | `C:\Users\GTMin\Projects\saas-agency-database\` | `efd830f` — `docs(playbooks): lock canonical demo carrier (DOT 1073091) + soften coverage line` (will bump after session 18 handoff push) |
| `dotintel2` (DOT Intel marketing + demo dashboard) | `C:\Users\GTMin\Projects\dotintel2\` | `b7e088a` — session 18 chain: `ab7904f` force-dynamic on Carrier Intelligence (demo blocker (a)) → `88285ec` /contact RLS fix (demo blocker (c)) → `b7e088a` STATE.md bump |
| `seven16-distribution` (Threshold IQ) | `C:\Users\GTMin\Projects\seven16-distribution\` | `fe2381d` — Threshold IQ session 2026-05-02 handoff committed |
| `dotintel-intelligence` (parked) | `C:\Users\GTMin\Projects\dotintel-intelligence\` | `d302a3a` — no new work, parked |

### Memory files seeded today

Auto-loaded by Claude Code via `MEMORY.md` at `C:\Users\GTMin\.claude\projects\...\memory\`:

- `reference_seven16recruit_mgaproducer_lineage.md` — Seven16Recruit's design is based on **MGAProducer.com**. Reference when scoping the product. Open question: exact relationship (competitor / inspiration / licensed / partnered) — confirm with Master O before assuming.
- `reference_vertibrands_competitive_landscape.md` — **Vertibrands.com** is a partial competitor; more importantly, Seven16 Group's long-term operating model resembles Vertibrands' multi-brand operator shape (with Master O's industry-specific perspective). Directional only — does NOT supersede D-003 (Seven16 = trust layer for now).

---

## Part 0 — seven16-platform (D-008 control plane)

> **Sprint 1B closed 2026-05-01 (session 14).** Project created and base schema applied. 7 tables (tenants, profiles, tenant_memberships, products, plans, entitlements, audit_log) + RLS day-one + 9 plans seeded with locked pricing. All security advisors clean. All performance WARN-level advisors clean (only INFO `unused_index` warnings remain — expected on empty tables).
>
> **2026-05-02 update:** Family taxonomy expanded — three new products seeded into `public.products` (Threshold IQ, Growtheon, Seven16Recruit). Decisions D-009, D-010, D-011 added to Decision Log. Growtheon clarified as third-party SaaS reseller (NOT a Seven16 Supabase satellite).

| Check | Value | Status |
|---|---|---|
| Project ID | `soqqmkfasufusoxxoqzx` | ✅ ACTIVE_HEALTHY |
| Project name | `seven16-platform` | — |
| Region | `us-east-1` | — |
| Postgres version | 17.6.1.111 | — |
| Organization | `ommujdigmtnmqkxahfgc` (Pro plan; cost +$10/mo) | — |
| DB host | `db.soqqmkfasufusoxxoqzx.supabase.co` | — |
| Migrations applied | `0001_platform_schema`, `0002_platform_rls`, `0003_platform_seed`, `0004_platform_advisor_fixes`, `0005_platform_perf_fixes`, `0006_platform_seed_more_products` | ✅ Repo + DB in sync |
| Security advisors | 0 warnings | ✅ Clean |
| Performance advisors | 0 WARN; 17 INFO `unused_index` (expected on empty tables) + 1 INFO auth-conn (defer until scale) | ✅ Clean |

**Schema (public):** tenants(id,name,slug,…) · profiles(user_id→auth.users,…) · tenant_memberships(tenant_id,user_id,role:owner/admin/member,…) · products(id,name,domain) · plans(id,product_id,monthly_price_cents,stripe_price_id,…) · entitlements(tenant_id,product_id,plan_id,status,stripe_*) · audit_log(actor_*,action,subject_*).
**Schema (private):** helper functions for RLS — `current_user_tenant_ids()`, `current_user_is_tenant_admin()`, `current_user_is_tenant_owner()`. Hidden from PostgREST RPC surface; SECURITY DEFINER, set search_path.

**Seeded products (5 total):**
- `agency_signal` — Agency Signal — agencysignal.co — active
- `dot_intel` — DOT Intel — dotintel.io — active
- `threshold_iq` — Threshold IQ — thresholdiq.io — active (build elsewhere)
- `growtheon` — Growtheon — no domain (reseller white-label) — active
- `seven16recruit` — Seven16Recruit — no domain (stealth) — **inactive** until attorney W-2 review

**Seeded plans (9 total — locked pricing only):** Agency Signal Free/Producer($19)/Growth($99)/Enterprise + DOT Intel Free/Pro($29)/Business($149)/Enterprise + Seven16 Intelligence Bundle ($179, available_from 2027-01-01). **Pending:** Threshold IQ, Growtheon, Seven16Recruit pricing — collaborative session needed before seeding.

**Future Supabase satellites per D-008** (not yet created):
- `seven16-agency-signal` — repurpose existing `sdlsdovuljuymgymarou` (currently Agency Signal's prod DB)
- `seven16-dot-intel` — when DOT Intel rebuild kicks off (Phase 2, May–July)
- `seven16-threshold-iq` — when Threshold IQ build moves from local-only to deploy
- `seven16-recruit` — when Seven16Recruit moves from stealth to dev
- (Growtheon does NOT get a satellite — runs on third-party reseller infra per D-010)

**Next sprints:**
- Sprint 1C: shared JWT secret across `seven16-platform` ↔ `sdlsdovuljuymgymarou` (Agency Signal) + `yyuchyzmzzwbfoovsskz` (Threshold IQ — joined client list 2026-05-02 when staging went live); Doppler + Sentry rollout. NEEDS Vercel API token + Master O time on Doppler signup.
- Sprint 1D (planned window): migrate `auth.users` from Agency Signal → platform; rewire app reads via shared JWT. Threshold IQ folds in same sprint (or follows immediately).

---

## Part 0.5 — Threshold IQ (live staging, separate Claude Code session)

> Build name `seven16-distribution`. Market name **Threshold IQ** locked 2026-05-02 (D-009). Domain `thresholdiq.io` secured on Cloudflare 2026-05-02. **Staging went live 2026-05-02** — Phase A foundation + Phase B item 2 (AI extraction primitive) shipped end-to-end in a single session.
>
> **Inside-view state doc:** [`seven16-distribution/docs/STATE.md`](../../../seven16-distribution/docs/STATE.md) (commit `c5f2bb5`) — written by the Threshold IQ session itself; mirrors this Part 0.5 from the inside.
> **Most recent handoff:** [`seven16-distribution/docs/handoffs/2026-05-02_THRESHOLD_IQ_HANDOFF.md`](../../../seven16-distribution/docs/handoffs/2026-05-02_THRESHOLD_IQ_HANDOFF.md) (commit `fe2381d`) — chronological log + identifiers + gotchas.

| What | Where |
|---|---|
| Live staging URL | `https://staging.thresholdiq.io` ✅ HTTP 200, magic-link auth verified end-to-end |
| Vercel project | `prj_c6kzFEhpw6Uwb12TECUidKlBxOwr` on team `team_RCXpUhGENcLjR2loNIRyEmT3` (project name `seven16-distribution`) |
| Custom domain | `staging.thresholdiq.io` A → `76.76.21.21` (Cloudflare DNS-only / gray cloud, Vercel handles SSL) |
| GitHub repo | `gtminsightlab-cmd/seven16-distribution` (private), default branch `main` (renamed from `master` during migration) |
| Canonical working clone | `C:\Users\GTMin\Projects\seven16-distribution\` (native git, GCM auth, outside OneDrive) |
| OneDrive copy | `C:\Users\GTMin\OneDrive\...\CRM for MGU and Recruiting\seven16-distribution\` — **legacy, not source of truth.** Pending deletion when user confirms confidence in new tree. |
| Stack | Next 16.2.4 + React 19 + shadcn/ui + Supabase SSR + Tailwind |
| Supabase satellite | `yyuchyzmzzwbfoovsskz` (us-east-1, pg 17.6.1) — Threshold IQ satellite per D-008. **Not yet integrated with `seven16-platform`** — that's the family-integration debt for first real customer. 12 migrations applied (0001–0012); repo and DB in sync (no drift). |

### 0.5.1 Phase A status (foundation hardening)

| Item | Status |
|---|---|
| **A1** Repo migration out of OneDrive → private GitHub remote | ✅ Done |
| **A2** CI pipeline (`tsc --noEmit`, `next lint`, `next build`) on push + PR to main | ✅ Green at `9c48c70` |
| **A3** RLS test harness | ⏸️ Pending — deferred until before first outside customer |
| **A4** Vercel staging deploy with auto-deploy + magic-link auth verified end-to-end | ✅ Done |
| **A4-bonus** Custom domain `staging.thresholdiq.io` (Cloudflare + Vercel SSL + Supabase Auth allowlist) | ✅ Done |

### 0.5.2 Phase B status (submissions domain)

| Item | Status |
|---|---|
| **B1** Agent portal shell + PDF upload UI | ⏸️ Pending — recommended next work |
| **B2** AI extraction primitive (`POST /api/ai/extract`, Claude Sonnet 4.6 with Zod-validated 13-field output, token bookkeeping in `ai_token_usage`) | ✅ Shipped + verified — `b02a8e3` |
| **B3** Carrier clearance UI | ⏸️ Pending — needs B1 to have data |
| **B-opt** `pdf-parse` pre-extraction (drops AI cost ~70%) | ⏸️ Pending — best done as part of B1 |

### 0.5.3 Known issues / family-level flags from Threshold IQ session

| Item | Severity | Notes |
|---|---|---|
| **Anthropic key briefly visible in chat** (truncated 60 chars: `sk-ant-api03-c0_JclGl0n3MBAEedi9tBA2YwD_phjoon6VdXMzEIsFaJ4Q...`) | 🟡 Medium | Recommended action when staging stabilizes: rotate the key + set $10/mo cap on the new one in Anthropic console. **Cross-product hygiene reminder — surfaced from Part 0.5 to ensure family ledger tracks it.** |
| Vercel preview-branch env scope missing for `NEXT_PUBLIC_*` + `ANTHROPIC_API_KEY` | 🟡 Low | Vercel CLI quirk: preview-branch add returns `git_branch_required` even with `--yes`. Not blocking main. Address when first significant PR opens. |
| OneDrive legacy copy of seven16-distribution still on disk | 🟡 Low | Stale `.env.local` with old Anthropic key line — remove when copy is deleted. |
| Magic-link PKCE cross-browser fragility | 🟢 By design | Verifier stored per-browser; if request and click happen in different browsers, fails. Document for users; long-term consider OTP. |
| DOT Intel cross-product integration | 🟢 Future | `INTEGRATION_DOTINTEL.md` is target spec, not hard contract yet. Wire against `dotintel2`'s real API surface when first trucking customer onboards. |

### 0.5.4 Pricing review queue

Threshold IQ's draft tiers ($99 / $199 / $299 per seat, "1M tokens/mo" Starter quota) are **mathematically undersized** vs. real Sonnet 4.6 PDF extraction cost (~$215/mo at 500 submissions). User-preferred resolution paths (locked, do not relitigate):
1. **Caps + overage.** Starter includes N submissions/mo bundled, $X per extra. Standard SaaS metered billing.
2. **BYOK.** Customer provides Anthropic key, Threshold IQ charges flat per-seat platform fee.

**Rejected (do not re-propose):** tier-by-AI-quality (Haiku-only Starter, Sonnet on Growth+). User reason: bad customer narrative.

Cost math + citations live in memory `project_pricing_ai_extraction_economics.md` in the Threshold IQ session's memory dir. **Surface in next family pricing collaborative session** alongside the deferred Threshold IQ + Growtheon + Seven16Recruit pricing items.

### 0.5.5 Cross-session pattern: `STATE.md` per repo

Threshold IQ session established the pattern: each product repo has a `docs/STATE.md` written from inside (by the session that owns that product) that mirrors this family-ledger Part N. Both should agree; the inside `STATE.md` updates as that session ships changes, so it's always current. Other sessions read it via cross-repo file access.

**Adopted.** Companion `STATE.md` files for the other repos:
- `dotintel2/docs/STATE.md` — DOT Intel inside view (queued for session 16 alongside light-mode fix)
- `saas-agency-database/docs/STATE.md` — Agency Signal inside view (queued; lower priority since family ledger lives in this same repo)

**Family integration owed:** When first real Threshold IQ customer onboards, register tenants/auth via `seven16-platform` with shared JWT pattern. Folds into Sprint 1C runbook (see Part 0).

---

## Part 1 — Agency Signal (live)

> **Tier 0 closed 2026-05-01 (session 13).** All 7 Tier 0 tasks complete: service-role key rotated, migration drift fixed (0057–0083 in repo), D-008 added, 4 context docs in repo, Vercel env vars verified, prod healthy.
>
> **Sprint 0 closed 2026-05-01 (session 14, Claude Code migration).** Working clone moved outside OneDrive to `C:\Users\GTMin\Projects\saas-agency-database\`. Native git, Git Credential Manager-cached creds (no more per-session PAT). `CLAUDE.md` added at repo root for future Claude Code sessions. OneDrive folder deprecated for code edits — kept only for vendor `data/` archive. Production verified READY post-push (commit `c75c96b`).

### 1.1 Production health (verified 2026-05-01, session 14)

| Check | Value | Status |
|---|---|---|
| Live URL | https://directory.seven16group.com | ✅ HTTP 200 |
| `origin/main` HEAD | `c75c96b` (chore: add CLAUDE.md) — to be bumped after Sprint 1B push | — |
| Canonical working clone | `C:\Users\GTMin\Projects\saas-agency-database\` | ✅ Native git, GCM auth |
| OneDrive copy | `C:\Users\GTMin\OneDrive\...\Saas Agency Database\` | 🟡 Deprecated for code; vendor data/ archive only |
| Supabase project | `sdlsdovuljuymgymarou` (seven16group, us-east-1, pg 17.6.1) | ✅ Healthy — unchanged in Sprint 1B |

### 1.2 Database counts (tenant `ce52fe1e-aac7-4eee-8712-77e71e2837ce`)

| Table | Count |
|---|---|
| `agencies` | **20,739** |
| `agency_carriers` | **191,201** |
| `contacts` | ~87,214 (snapshot from session 7 — verify before quoting publicly) |

Carrier coverage from session 12 multi-file load:
- Cincinnati Insurance Company: 1,681 appointments
- Guard Insurance Group: 1,116
- Berkley National Insurance Company: 1,470 (+ 13 wholesalers from migration 0082)
- Utica National Insurance Group: 599

### 1.3 ✅ RESOLVED — migration drift fixed 2026-05-01

The live Supabase has migrations through **0083**. The repo's `supabase/migrations/` folder only has migrations through **0055**.

Migrations **0057–0083** were applied via Supabase MCP during sessions 10–12 and never committed back to the repo. This is a live audit-trail gap.

| Where | Has |
|---|---|
| Live Supabase | migrations 0001–0055 + **0057–0083** (0056 was the v5 attempt; reverted via 0060) |
| Repo `supabase/migrations/` | migrations 0001–0055 only |

**Why it happened:** sessions 11+12 were Supabase-DML-only (data loads) plus session 10 v5 work that got reverted. The MCP applies migrations directly to the database — there's no automatic "also write a file to the repo" step.

**What to do about it:**
- **Don't panic** — production is fine; the live DB is the source of truth for schema.
- **Catch-up task:** dump the SQL of migrations 0057–0083 from `supabase_migrations.schema_migrations` and write them to `supabase/migrations/` so the repo matches. Owner: future Claude session.
- **Going forward:** when you apply a migration via MCP, also write the same SQL to a file in `supabase/migrations/` and include it in the commit.

### 1.4 Session-by-session log (sessions 4 → 12)

| Session | Date | Theme | HEAD at end | Migrations applied |
|---|---|---|---|---|
| 4 | 2026-04-25 | Counts verified, advisors clean, sb_secret_ key noted for rotation | (early) | 0011–0015 (CRM scaffolding) |
| 5 | 2026-04-25 | RLS initplan opt = 485× speedup | `1f975c9` | 0033–0036 |
| 6 | 2026-04-25 | Admin shell + Catalog editor (20 files, dark-theme 13-module sidebar) | — | (UI-only) |
| 7 | 2026-04-25 | All 13 admin modules Live, saved-list bugfix sweep | `afb33aa` | 0037–0046 |
| 8 | 2026-04-25 | AI Support page shipped at /ai-support | — | 0047 (pg_trgm + RPC) |
| 9 | 2026-04-26 | Multi-seat invitations + CMO Phase 1+2 copy | `ad8f31a` | 0055 |
| 10 | 2026-04-26 | /analytics/carriers + 5 MiEdge carriers + V5 grain finding | `0484afd` (in repo); local later went to that + uncommitted | 0057–0069 |
| 11 | 2026-04-27 | Berkley operating-units mapping (migration 0082), 13 wholesalers wired, ISC fix | `0484afd` (no app commits — Supabase-only) | 0070–0082 |
| 12 | 2026-04-27 | 8-file vendor xlsx load: 634 new agencies + 3,819 carrier appointments + multi-carrier patch + broken-prod fix | `8829d38` then `2ee77ff` (epilogue + opening prompt) | 0083 |
| 13 | 2026-05-01 | **Tier 0 cleanup:** rotated leaked service-role key (legacy JWT revoked, new `sb_secret_`), synced 27 migrations from live DB to repo, added D-008, saved 4 context docs to repo, env vars verified | `02e78bc` | (none — DML/sync only) |

**Most-recent state of detail** is in `docs/handoffs/SESSION_12_HANDOFF.md` (293 lines, exhaustive). Earlier sessions in `SESSION_9/10/11_HANDOFF.md`. Session 4-8 handoffs live as memory files only (`project_saas_agency_db_handoff_session4..8.md`).

### 1.5 Deferred items (Agency Signal)

From session 12 §5 + standing backlog:

| # | Item | Why deferred / trigger to unpause |
|---|---|---|
| 1 | **Contacts load for the 8 session-12 vendor files** | Session 12 was option B (agencies + carriers only). Each row has FirstName/LastName/Title/CEmail — could feed `contacts`. Ready any time. |
| 2 | **`account_type_id` backfill for the 634 new agencies** | Session 12 loader left it NULL. Source has `AccountType` ("Agency", "Agency/Wholesaler", etc.) — needs mapping table joined and updated. |
| 3 | **WRB.xlsx vs AdList-17028.xlsx duplicate-file confirmation** | Likely the same export saved twice. Future-proof: don't trust filenames as carrier indicators without verifying file content. |
| 4 | **MiEdge confidence-tiered fuzzy matcher** | Carry from session 10. ~1 session of build + 1-2 hrs human review. Required for V5 parent-grain integration. |
| 5 | **V5 parent grain remediation** | Cluster Supabase branches into synthetic parent rows; populate `agencies.parent_agency_id`. Enables v5 join. Three strategies in `docs/roadmaps/V5_DATA_INTEGRATION.md`. |
| 6 | **Repo↔DB migration drift** | Dump migrations 0057–0083 from Supabase into `supabase/migrations/` so repo matches DB. |
| 7 | **Retail trucking load** (1,328 agents + appointments + contacts) | Needs Python script run from Master O's terminal — context cost too high in-session. |
| 8 | **Phase 3 CMO rewrite** (testimonials/customer logos) | Trigger: 2-3 paying customers. |
| 9 | **A/B test sweep** (3 tests) | Trigger: 500+ visitors/week. |
| 10 | **Stripe sandbox → production cutover** | Trigger: first paying customer ready to convert. |
| 11 | **Hygiene Credit billing wiring** | Stripe Subscription Schedule with phased pricing OR programmatic coupon at month 6 + 12. Roll out with the trust-copy refresh. |
| 12 | **8 empty verticals** (added migration 0051) | Need data + carrier mapping per vertical. |
| 13 | **First Light + Maximum account_type reclassification** | Cosmetic; carry from session 11. |
| 14 | **Pre-existing advisor cleanup:** `_trucking_load_log` RLS, 84 SECURITY DEFINER warnings, extension-in-public | None introduced this session — all pre-existing. |

### 1.6 Security / hygiene reminders (do these soon)

- ✅ **Service-role key rotated 2026-05-01 (session 13 Tier 0a).** Old leaked JWT permanently revoked. New `sb_secret_vercel_prod_2026_05_01` live in Vercel env vars. Production verified READY post-rotation. Two unused secret keys (`default`, `seven16group`) remain in Supabase dashboard — minor cleanup, low priority.
- 🟡 **JWT signing secret rotation pending.** A JWT signing-secret value was pasted in chat during session 13 — needs separate rotation in a planned low-traffic window (disruptive — invalidates all live sessions). Done on the **JWT Keys** panel, not API Keys.
- 🟡 Pre-existing advisor warns (84 SECURITY DEFINER, extension-in-public) — backlog cleanup.

### 1.7 Stripe state (sandbox)

- Account: `acct_1TLUF6HmqSDkUoqw` ("DOT Intel sandbox")
- Products / prices live: Growth Member `price_1TPxtFHmqSDkUoqwRvnHOqhx` ($99/mo) + One-Time Snapshot `price_1TPxtHHmqSDkUoqwXa3zfPOV` ($125 one-time).
- Routes shipped: `/api/stripe/checkout` (GET), `/api/stripe/webhook` (POST, signature-verified).
- **Vercel env vars verified set + functional 2026-05-01 (session 13 Tier 0e)** via prod endpoint tests: `STRIPE_SECRET_KEY` ✓, `STRIPE_WEBHOOK_SECRET` ✓, `SUPABASE_SERVICE_ROLE_KEY` ✓ (rotated to `sb_secret_vercel_prod_2026_05_01`), `NEXT_PUBLIC_APP_URL` ✓. Vercel "Sensitive" type prevents API value retrieval — confirmed via `/api/stripe/webhook` and `/api/stripe/checkout` returning proper 400 errors (not 500).
- Webhook endpoint to register in Stripe dashboard: `https://directory.seven16group.com/api/stripe/webhook` for events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`.

### 1.8 Admin control center (13 modules)

Fully spec'd in memory `project_admin_control_center_spec.md`. All 13 modules have Live page routes per session 7. Build-out priority order (from the spec):
1. Layout shell ✅ done
2. Overview KPI strip ✅ done
3. Catalog editor ✅ done
4. Hygiene & Refresh — partial
5. System Health — partial
6. Customers + Billing — partial
7. Data Engine sources — backlog
8. Pipelines visual — design-heavy, deferred
9. Search Analytics + debug ranking — defer until usage data exists

---

## Part 2 — DOT Intel (live demo build)

### 2.1 Status: demo build live, mid-May 2026 working group review imminent

> **Updated 2026-05-02 (session 15).** The "old DOT Intel project" framing is no longer accurate — the existing Next.js app at [dotintel.io](https://www.dotintel.io) (repo `dotintel2`) was built on the Seven16-aligned stack and is actively the **demo target** for a mid-May working group of agents and underwriters. Sprint D0/D1/A/Light Mode shipped today. **D-007's "full rebuild" is still the longer-term Phase 2 direction**, but for the mid-May demo we are polishing the existing Next.js app, not rebuilding from scratch.

| Check | Value | Status |
|---|---|---|
| Live URL | https://www.dotintel.io | ✅ HTTP 200 |
| Demo dashboard | /dashboard (auth-gated) | ✅ Working with persona quick-fill |
| Vercel project | `dotintel` (`prj_4tnPATJjP4Bahg2RFw4DwlTuNa8S`) | ✅ Auto-deploys on push |
| Repo (canonical) | `gtminsightlab-cmd/dotintel2` at `C:\Users\GTMin\Projects\dotintel2\` | ✅ Native git, GCM auth |
| Stack | Next 16.2.3 + React 19.2.4 + Tailwind v4 + Supabase SSR | — |
| Supabase project | `vbhlacdrcqdqnvftqtin` (us-east-2) | ✅ ACTIVE_HEALTHY |
| Last deploy commit | `ab7904f` — fix(carrier-intel): force dynamic render (demo blocker (a)). Deploy `dpl_5rergT8wbbRtKQ6TTZkABiHrQ3TQ`. | ✅ READY |

### 2.2 Working data corpus on `vbhlacdrcqdqnvftqtin`

| Table | Rows | Notes |
|---|---|---|
| `carriers` | 50,298 | FMCSA carriers, sampled at ~1,000 per state |
| `carrier_insurance_current` | 19,767 | 39% insurance penetration in the corpus |
| `inshist_raw` | 7,471,443 | Insurance filing history; powerful but query-heavy |
| `insurer_parents` | 32 | Top-level insurer companies |
| `insurer_children` | 54 | Subsidiary brands with NAIC codes + fleet-size hints |
| `insurer_name_aliases` | 37 | Name-normalization for matching |

Top 10 insurer parents by carrier count (snapshot): Progressive 3,279 · Great West 2,964 · OOIDA 215 · Berkshire Hathaway 137 · "Other" 136 · Lancer 132 · Hartford 95 · Chubb 91 · Liberty Mutual 74 · Travelers 58.

### 2.3 What shipped today (session 15 — DOT Intel demo prep)

**Sprint D0 — Color match.** Tailwind v4 `@theme inline` block in `dotintel2/app/globals.css` aligned to Agency Signal anchors (brand-600 teal, gold-500, navy-900). Existing semantic class names preserved. Commit `91bf52b`.

**Sprint D1 — Carrier Intelligence module.** Full interactive module at `/dashboard/carrier-intelligence`:
- Migration `20260502_carrier_intelligence_rpcs` adds 4 RPCs: `get_carrier_market_overview()`, `search_carriers()`, `get_carrier_profile()`, `list_insurer_parents_with_counts()`.
- Server-rendered Market Overview (KPI strip, fleet-size mix bars, top-10 states clickable, top insurer parents).
- Browse table with URL-driven filters (state, PU band, insurance status, insurer parent, free-text search) and pagination.
- Carrier Profile drill-in at `/dashboard/carrier-intelligence/[dot]` — Operations, Fleet, Address, Authority & Safety, Current Insurance with parent rollup + "expiring soon" badge, Data freshness.
- Dashboard module card now a real Link. Footer stat changed from misleading "1.2M+ DOT carriers monitored" to "50K+ DOT carriers loaded". Commit `3d25c5e`.

**Sprint A — Demo coherence pass.**
- Migration `20260502_carrier_overview_v2` replaced misleading `authorized_for_hire` KPI (always 100%) with `avg_fleet_size` + `expiring_soon` (real prospecting signals).
- Gold disclaimer banner on Carrier Intelligence: "Demo dataset — 50,298 carriers sampled at ~1,000/state. Production launch will include the full FMCSA universe (~2M+ carriers)."
- Two new preview modules at `/dashboard/distribution-intelligence` and `/dashboard/competitive-benchmarking` — show real corpus data + "What ships Q3 2026" sections.
- Module status evolved from 2-state to 3-state (`active | preview | coming_soon`). Commit `5672c25`.

**Light Mode** — toggle shipped, **but broken on marketing pages** at session 15 close. Resolved sessions 16+, see §2.3a.

### 2.3a Sessions 16-18 summary

**Session 16 (2026-05-02) — Light Mode resolution + family-ledger sync.** Light-mode chain landed: scoped retreat to `[data-theme-zone="light-capable"]` subtrees (`8da1a2e`), inside-view `STATE.md` adoption (`af67e96`), toggle visibility revert (`3c3dd2d`), marketing-chrome split via `components/marketing/chrome.tsx` (`f36ea5c`), and the critical `@theme inline` drop so CSS variable overrides actually flow through utility classes (`4fe51fd`). Marketing pages stay dark in both modes (intentional cinematic Gotham); dashboard subtrees flip cleanly. Threshold IQ family ledger synced: D-009 (Threshold IQ name lock) + D-010 (standalone-capable add-ons) + D-011 (emerging-firm target market) added to Decision Log.

**Session 17 (2026-05-03) — Demo polish (option a).** Three landed changes: A1 reframe of the broken "Expiring within 60d" KPI to "No insurance on file" (30,531 / 61% addressable, zero DB backfill — uses already-computed data) via migration `20260503_market_overview_no_insurance_kpi` (`9c4d810`); UX commit for visible scrollbar + sticky section nav on Carrier Intelligence (`1fb93cc`); Option Z marketing reconciliation aligning /Solutions, /platform, and dashboard into one coherent narrative — 3 working modules featured at /Solutions, capabilities listed as verbs at /platform, three coming-soon items dated Q3/Q4 2026 (`634db5e`). Plus full Agent + Underwriter persona walks end-to-end against live site, /contact form schema verified via SQL roundtrip (verification incomplete — see session 18), light-mode visual sweep clean across all three module pages, pre-launch security gate established as memory rule, Supabase advisor baseline captured (14 findings, all post-demo).

**Session 18 (2026-05-03 evening) — All three demo blockers closed.**
- **(a) Browse Carriers default-render fix** — `export const dynamic = "force-dynamic"` added to `app/dashboard/carrier-intelligence/page.tsx` (`ab7904f`). Verified live by user via Agent persona — bare URL renders populated table ("Showing 1-25 of 50,298"), filter pills functional. The directive is now load-bearing for this route — DO NOT remove without an alternative caching strategy.
- **(b) Canonical demo carrier locked** — DOT 1073091 California Delivery Service Inc (Fontana CA, 11 PU / 11 drivers, Lancer Insurance active filing, real contact email `TABATHA@CDSTRUCKS.COM` + phone `(909) 355-7991` + address). Threaded into walkthrough as Underwriter step 3 search target + Agent step 9 drill-in fallback (`efd830f`). Backup: DOT 1082246 METTLER FARMS INC.
- **(c) /contact form end-to-end verified** — surfaced and fixed an RLS regression. Session 17's "Schema verified via SQL roundtrip" ran as `service_role` (which bypasses RLS) so it never exercised the actual auth/anon path. When the user submitted the form while still signed in as a demo persona, Postgres rejected with "new row violates row-level security policy for table leads" — `anon_insert_leads` was scoped to `{anon}` only. Fix: migration `20260503_leads_insert_policy_anon_and_authenticated` replaces it with `public_insert_leads` for `{anon, authenticated}` (`88285ec`). User retest: green success state fired, real row landed in `leads`. **Two new post-demo carry-forwards surfaced:** no mailbox at `info@dotintel.io` + no email notification on form submit; coverage amounts ETL gap (data in `inshist_raw.raw_row` JSONB but 0/19,767 populated in `carrier_insurance_current`).

**Late-session scrapers fragment-bug investigation.** Cross-session flag from another session: "entries like 'Agency LLC', 'Group LLC' with no state/ZIP showing up cross-source. That's parse_berkley_pastes.py capturing trailing fragments." Investigation: **both production databases are clean** (Agency Signal `sdlsdovuljuymgymarou` agencies 20,739 rows / DOT Intel `vbhlacdrcqdqnvftqtin` agencies 53 rows — zero fragment matches in either). The loader at `scripts/load_to_supabase.py:200` has a `if not (state and zip_code): continue` gate that kept the bug out of prod. Diagnosis was misdirected — `parse_berkley_pastes.py` already has its own state/zip guard. Actual culprit: `scripts/run_trustedchoice.py:106` `harvest_state()` regex `\b([A-Z][A-Za-z0-9.&\-' ]{2,80}?\s+(?:Insurance|Agency|...|LLC|Inc\.))\b` lazy-quantifier captures standalone footer-link / category text. Cross-source JSONL scan: 151 fragment rows in trustedchoice files (42 'Agency LLC', 41 'Services LLC', 35 'Group LLC', 22 'Associates LLC', 9 'Insurance LLC', 2 'Enterprises LLC'). Patched `run_trustedchoice.py` with a `SUFFIX_ONLY` post-filter rejecting names whose firm-name portion is itself a generic suffix word. Synthetic test: 5/5 fragments filtered, 4/4 real-shaped names preserved. **Patch is disk-only** — `scrapers/seven16-scraper/` is not a git repo. New post-demo carry-forward: clone the scrapers project out of OneDrive and `git init` (same fix applied to dotintel2 and saas-agency-database in earlier sessions).

### 2.4 Demo accounts (seeded in `vbhlacdrcqdqnvftqtin` auth.users)

| Persona | Email | Quick-fill button on /login |
|---|---|---|
| Agent | demo-agent@dotintel.io | "Agent" |
| Underwriter | demo-uw@dotintel.io | "Underwriter" |
| Risk Mgr | demo-risk@dotintel.io | "Risk Mgr" |
| Analyst | demo-analyst@dotintel.io | "Analyst" |

Mid-May audience = Agent + Underwriter only. Risk Mgr and Analyst flows are NOT polished for this demo.

### 2.5 ✅ Light Mode known issue — RESOLVED in session 16

The session-15 break (marketing pages rendered low-contrast under `.light`) was resolved across session 16's chain. Marketing pages are now hard-clamped to dark always (intentional cinematic Gotham aesthetic); dashboard subtrees scope-flip via `data-theme-zone="light-capable"`. The critical Tailwind v4 detail: `globals.css` uses `@theme {}` not `@theme inline {}` — the `inline` modifier bakes literal hex values into utility classes and breaks variable overrides. **Do not re-add `inline`** without a full rethink of the theming approach.

### 2.6 What's deferred until after the working group demo

Per [`docs/playbooks/dotintel_d2_prework.md`](../playbooks/dotintel_d2_prework.md):

- **Full D2** — making Distribution Intelligence + Competitive Benchmarking fully interactive (filters + drill-ins matching D1 quality). Cost: 8-12 hours. Reason for deferral: feedback could rescope what these modules actually do (e.g., "we don't care about territory builder, we care about agency-carrier crosswalk" would change 60% of the build).
- **Working group → 10 specific signal points** to capture (listed in the prework doc). That signal drives the real D2 spec.
- D-007 full rebuild scope — broader Phase 2 work — informed by what we learn from the demo.

### 2.7 Sister DOT-Intel repos (do NOT confuse)

| Repo | Vercel project | Status | Use for |
|---|---|---|---|
| `dotintel2` | `dotintel` → www.dotintel.io | ✅ ACTIVE — demo target | All demo work, all Sprint D0+ commits |
| `dotintel-intelligence` | `dotintel-intelligence` → intelligence.dotintel.io | 🟡 PARKED | Reference only. Different stack (Next 14, agency-intel positioning, empty data). NOT in demo. Decision later if to delete. |
| `dotintel-preview` | `dotintel-preview` | unknown | Not investigated; presumed legacy |
| (old Vite app `dotintel-app/`) | n/a | RETIRED | OneDrive folder — pre-rebuild artifact |

### 2.8 What's worth borrowing from old project work (learnings, not code)

- Four-zone data architecture (raw → staging → master → activation).
- Neilson exclusion canary list pattern.
- 51+ credential gate.
- Power-unit bands for trucking (already absorbed into Agency Signal Berkley mapping — see migration 0082 + the Berkley reference memory).
- Parent–child insurer modeling (already implemented in current `vbhlacdrcqdqnvftqtin`).
- WR Berkley operating-unit attribution logic.

---

## Part 3 — How to keep this doc fresh

This doc goes stale fastest of the three (because it tracks current state, not decisions). Standing rule:

- **At end of every session that changed DB counts, deployment state, or deferred-items list, update the relevant section here.**
- Bump the "Last updated" date at the top.
- Roll detail into `docs/handoffs/SESSION_N_HANDOFF.md` for the long version. Keep this doc as the at-a-glance summary.
- When something in §1.5 (deferred items) is unblocked or becomes work-in-progress, move it to that session's handoff and remove it from the deferred list.

— end of SESSION_STATE —
