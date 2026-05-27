# Family-Hub Session 39 — Agency Signal Tier 1 security LIVE (2026-05-26)

**Date:** 2026-05-26
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `main`
**Predecessor:** [`SESSION_38_HANDOFF.md`](SESSION_38_HANDOFF.md) + SESSION_38.5 doctrine pivot (D-034)
**HEAD at session open:** `2a8943c` (SESSION_38 close-out docs)
**HEAD at session close (docs commit):** TBD after this commit pushes
**Supabase project:** `sdlsdovuljuymgymarou` (Agency Signal satellite, Pro)

---

## Theme — Apply Agency Signal Tier 1 security baseline

Per family Queued #0 priority order from `reference_family_supabase_security_baseline.md`. Agency Signal is the family's highest customer-PII surface (master agency/contact/saved_list + producer contact + carrier appointment data). Mandatory before any "tell my network" / charter outreach push per pre-launch security gates doctrine.

Override of BACKLOG `0b` (design system v1.1 rightRail polish) for one-arc-this-session discipline (Rule 3). Pivot authorized by Master O directive ("yes go forward" on the S39 plan proposal).

---

## Phase-by-phase execution

### Phase 1 — Read-only inventory (~5 min)

`mcp.get_advisors security` on `sdlsdovuljuymgymarou`:

| Level | Count | Notes |
|---|---|---|
| ERROR | 0 | clean baseline |
| WARN | 90 | 43 `anon_security_definer_function_executable` + 45 `authenticated_security_definer_function_executable` + 1 `extension_in_public` (pg_trgm) + 1 `materialized_view_in_api` (mv_vertical_summary) |
| INFO | 1 | pre-existing `rls_enabled_no_policy` on `public._trucking_load_log` |

Direct `pg_proc` query confirmed the **43 SECURITY DEFINER functions with anon EXECUTE** match the punch list at [`docs/security/agency-signal-tier1-audit.md`](../security/agency-signal-tier1-audit.md) authored 2026-05-26 (cross-product audit done from the dotintel2 working dir).

`pg_class` query confirmed the **2 `ax_staging` tables without RLS** also match the punch list — `agency_assignments` + `agency_assignments_idx` (the other 5 `ax_staging.*` tables already have RLS forced).

Storage buckets query: **0 buckets exist.** Punch-list bucket review is a no-op.

RPC-grep across `app/` directory: all 43 functions' callers are on authenticated routes (admin pages, dashboards, `/api/team/*`, `/api/admin/*`). **No anon-facing landing page** hits any of the 43 — punch-list prediction confirmed.

### Phase 2 — Tier classification spot-check (~5 min)

Punch-list classifications verified against actual usage:
- **Tier A** (8 trigger fns): `fn_audit_trigger`, `fn_audit_trigger_text_pk`, `fn_auto_provision_app_user`, `fn_block_inactive_account_type`, `fn_feature_flags_touch_updated_at`, `fn_guard_company_email_signup`, `fn_tenant_limits_touch_updated_at`, `link_app_user_on_auth`. All have empty `()` arg signatures consistent with trigger functions.
- **Tier B** (7 admin/cron fns): `find_duplicate_*` × 3, `get_system_health`, `log_admin_action`, `refresh_vertical_summary`, `scan_watermark_canaries`.
- **Tier C** (28 authenticated-only): the remaining 28 (see migration file for full list).
- 2 already-locked: `staging_finalize_appointment_load` + `staging_insert_appointment_rows`.

### Phase 3a — Migration `0096_pre_launch_security_tier1.sql` (first attempt)

Authored applying the dotintel2-pattern Postgres PUBLIC-inheritance recipe per family memory `feedback_supabase_anon_security_definer_default_revoke.md`:
- `REVOKE EXECUTE FROM PUBLIC` on all 43 functions
- `GRANT EXECUTE TO authenticated` on the 28 Tier C functions
- `ENABLE + FORCE ROW LEVEL SECURITY` on the 2 `ax_staging` tables

`mcp.apply_migration` returned `success: true`. But post-application ACL check showed **anon EXECUTE still true on all 43** — the migration was a no-op against direct grants.

**Discovery:** `pg_proc.proacl` inspection revealed Agency Signal's functions have DIRECT per-role grants (`anon=X/postgres,authenticated=X/postgres,service_role=X/postgres`), NOT inheritance from PUBLIC. `REVOKE FROM PUBLIC` against direct grants is a no-op. This is **Pattern B** — distinct from DOT Intel's **Pattern A** (PUBLIC inheritance only).

### Phase 3a-corrective — Migration `0097_pre_launch_security_tier1_followup.sql`

Authored + applied the actual lockdown:
- `REVOKE EXECUTE FROM anon` on all 43 functions (drops the direct anon grant)
- `REVOKE EXECUTE FROM authenticated` on the 15 Tier A + Tier B functions (drops the direct auth grant for triggers + admin/cron; Tier C keeps authenticated EXECUTE for app code)

`mcp.apply_migration` returned `success: true`. Both migrations recorded in `supabase_migrations.schema_migrations`:
- `20260526222815 pre_launch_security_tier1` (the no-op original)
- `20260526223007 pre_launch_security_tier1_direct_anon_revoke` (the actual fix)

The local repo carries both files (`0096_*` + `0097_*`) so the migration journey is documented in git history. `0096` is now annotated with a "⚠️ INCOMPLETE on its own — see 0097" header explaining the Pattern A vs B distinction.

### Phase 3b — Tier 2 scope (~5 min — N/A on DB side)

Audit findings:
- ❌ 0 `function_search_path_mutable` warnings — all SECURITY DEFINER fns already have `search_path` set; only pg_trgm extension fns lack it (built-in, not user-authored)
- ❌ 0 storage buckets exist (no bucket policy review needed)
- ❌ 0 anon-INSERT policies in `public` schema (no lead-form / signup-form public surface today; Supabase Auth CAPTCHA handles signup at the Auth level via SESSION_36 Turnstile widget)

Tier 2 reduces to documentation only. Updated `.env.local.example` to add the full production env-var roster:
- Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`)
- Upstash Redis (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
- Sentry (`SENTRY_AUTH_TOKEN` + `SENTRY_ORG=seven16` + `SENTRY_PROJECT=agency-signal`)
- Cron + Edge Function (`CRON_SECRET` + `EDGE_FN_AUTH_SECRET`)
- Stripe (`STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`)
- `NEXT_PUBLIC_APP_URL=https://agencysignal.co` (canonical post-SESSION_38)

`lib/security/rate-limit.ts` already production-shaped from SESSION_D (sliding-window Upstash limiter with 4 LIMITER_CONFIG keys). No `turnstile.ts` server-helper needed at this stage — Supabase Auth's native CAPTCHA integration covers all anon-INSERT surfaces.

### Phase 4 — Verify (~5 min)

Post-corrective `get_advisors security` re-run:

| Level | Before (Phase 1) | After (Phase 4) | Delta |
|---|---:|---:|---:|
| ERROR | 0 | 0 | — |
| WARN | 90 | **32** | **−58 (−64%)** |
| INFO | 1 | 3 | +2 (intentional — RLS-on-no-policy on the 2 newly-forced ax_staging tables; pre-existing `_trucking_load_log` unchanged) |

Remaining 32 WARN breakdown:
- 30 × `authenticated_security_definer_function_executable` (28 Tier C app-functions + 2 already-locked staging fns) — INTENTIONAL; these are functions authenticated users SHOULD call by design
- 1 × `extension_in_public` (pg_trgm) — pre-existing, out of S39 scope
- 1 × `materialized_view_in_api` (`mv_vertical_summary`) — pre-existing, out of S39 scope

`has_function_privilege` spot-checks on 5 representative fns confirmed all 4 tier outcomes:
- Tier A `fn_audit_trigger`: anon=F, auth=F, svc=T ✓
- Tier B `get_system_health`: anon=F, auth=F, svc=T ✓
- Tier C `is_super_admin`: anon=F, auth=T, svc=T ✓
- Tier C `count_contacts_for_filters`: anon=F, auth=T, svc=T ✓
- Already-locked `staging_insert_appointment_rows`: anon=F, auth=T, svc=T (unchanged) ✓

### Phase 5 — Cross-product family-security dashboard prep artifact (Rule 2(b))

Written at `docs/cross-repo/agency-signal-tier1-update-for-seven16-group-site.md`. Contains:
- Row update for the `family-security-dashboard.md` Agency Signal entry (status flip + advisor delta)
- Lessons-section addition: Pattern A vs Pattern B doctrine + combined belt-and-suspenders recipe
- Family-roster next-up list (3-7 remaining audits + 2 greenfield)
- Carry-forward verification: 0 new Master O actions from S39 side

Next `seven16-group-site` session paste-applies. Per Rule 2(b), zero file writes to that repo from this session.

---

## Family memory updates

Two new family-memory files written + indexed in `MEMORY.md`:

1. **`feedback_supabase_definer_direct_anon_grant_pattern.md`** (NEW) — Pattern A vs B distinction; combined belt-and-suspenders recipe; how to detect via `pg_proc.proacl` inspection; supersedes the narrower Pattern A framing of `feedback_supabase_anon_security_definer_default_revoke.md`.

2. **`project_dotintel_pricing_strategy_v1.md`** (NEW) — DOT Intel pricing model delivered by Master O mid-session for next dotintel2 `/pricing` session. Free 10/mo + credit packs ($49/$199/$599/$2,499) + 3 monthly plans ($49/$129/$299) + paste-ready website copy. Positions DOT Intel as intelligence layer, NOT a CRM (InsuranceApps/CHIP differentiator).

`MEMORY.md` index updated to point at both new files + the existing Pattern A entry annotated as superseded.

---

## Quality gates — all passed

| Gate | Result |
|---|---|
| Migration 0096 applied via Supabase MCP | ✅ (no-op on direct grants; documented) |
| Migration 0097 applied via Supabase MCP (corrective) | ✅ |
| Advisor delta: 90 → 32 WARN, 0 ERROR sustained | ✅ |
| `has_function_privilege` ACL spot-check on 5 fns matches expected per tier | ✅ |
| `ax_staging.agency_assignments` + `_idx`: `rls_enabled=T`, `rls_forced=T` | ✅ |
| `lib/security/rate-limit.ts` audit (already production-shaped) | ✅ |
| `.env.local.example` documents full production env-var roster | ✅ |
| Cross-repo prep artifact written per Rule 2(b) | ✅ |
| Local migration files annotated honestly (0096 INCOMPLETE / 0097 followup) | ✅ |

Build smoke + lint not required this session — DDL-only + docs + env example changes (no TS code touched).

---

## What's NOT in scope

- **Remaining family security audits** — seven16-group-site (Hub + Partners), Bind Lab, Seven16 Email, Seven16 Survey/Activator (Tier 2c MANDATORY), Seven16 Group Support. Each gets its own session in its own repo per Rule 2.
- **Pre-existing `extension_in_public` (pg_trgm)** + **`materialized_view_in_api` (mv_vertical_summary)** — out of S39 scope; address in a future polish session if they become priorities.
- **BACKLOG `0e`** (`/pricing` page build per D-034) — flips back to active arc after S39 close.
- **`lib/security/turnstile.ts` server-helper** — not needed at this stage; Supabase Auth handles. Add when first marketing-side lead-capture endpoint lands.

---

## Carry-forward Master O actions

**None new from Agency Signal side.** Tier 2c env vars (Turnstile + Upstash) already in production per SESSION_36 LAUNCH_CHECKLIST.

Family-wide carry-forward unchanged from FAMILY_HEALTH.md "Items requiring attention" — flip `NEXT_PUBLIC_APP_URL` in Vercel Preview env (~30 sec dashboard); verify first real Stripe event hits 200 in Vercel logs.

---

## Working Agreement Rule 5 close — artifacts

| # | Artifact | Status |
|---|---|---|
| 1 | `docs/context/FAMILY_HEALTH.md` — Last refresh updated + AS row refreshed + Items entries added | ✅ |
| 2 | `docs/handoffs/SESSION_39_HANDOFF.md` (this file) | ✅ |
| 3 | `docs/BACKLOG.md` — Last reviewed line refreshed; S39 close prepended | ✅ |
| 4 | `docs/handoffs/SESSION_40_PROMPT.md` — refreshed at S39 close to reflect post-D-035 + D-036 priorities | ✅ |
| 5 | `git push origin main` directly | ✅ commit `75f0ace` (security) + `410b012` (cross-repo prep) + `861d1b9` (1000-cap addendum) + close-out commit (TBD) |
| 6 | Vercel auto-deploy reaches READY (docs-only commit; no code change but Vercel rebuilds) | ⏳ on push |

---

## Post-close addendum (mid-session-close findings — landed before commit)

Three substantive findings landed AFTER the original S39 handoff was authored but BEFORE the close commit, all stemming from Master O directives during the session-close conversation. Codified at session close + locked as **DECISION_LOG D-035 + D-036**.

### Finding 1 — Corpus reality (50,298 IS sample data)

Master O caught the gap that I'd been pushing back on: the 50,298-row `public.carriers` count IS a sample. SQL verification confirmed:
- `count(*)` on `public.carriers` = **50,298**
- `max(source_last_refreshed)` = **2026-04-13** (frozen at original seed, 6 weeks stale at S39 close)
- `count(*) WHERE authority_granted_date IS NOT NULL` = **0 of 50,298** (critical underwriting field empty everywhere)
- Daily SODA cron processes deltas post-watermark only; **has never run a historical-universe pull**
- Full SODA `6eyk-hxee` queryable: ~1.86M rows
- Full FMCSA Census register: ~2.6M entities

I owe Master O the correction — earlier framing of "those aren't sample numbers" was technically right (the rows are real) but misleading (the corpus IS the original sample seed, never expanded).

**Sprint 0 plan locked** in family memory `project_dotintel_corpus_backfill_plan.md`. Two sessions:
- **Sprint 0a:** Path B filtered universe pull from SODA `6eyk-hxee` → ~250-300k motor-carrier + active-common-authority rows
- **Sprint 0b:** MCS-150 detail backfill from SODA `kjg3-diqy` → fills `authority_granted_date`, officer/principal names (unblocks Module 6 Chameleon Detection), operating radius + cargo detail (unblocks Module 7 Litigation Exposure)

### Finding 2 — Territory Intelligence 1000-per-state UI cap bug

Master O screenshot confirmed: `/dashboard/territory-intelligence` Top-States table shows EXACTLY 1,000 carriers in every row (HI/AK/CO/MN/NM/GA/OK/NY/FL/KY all showing 1000). That's a SQL or RPC `LIMIT 1000` per state — not real data. Corrupts the "Addressable" and "Penetration %" math underneath (numerator capped while displayed as full population).

Fix folded into Sprint 0 alongside corpus backfill (~0.5 session). Logged at cross-repo addendum entry **0-uicap**.

### Finding 3 — 8-module risk intelligence framework locked

Master O ChatGPT-CTO review surfaced 8 modules that translate raw FMCSA data into insurance-grade carrier intelligence. The trust-layer 6-score architecture from `project_dotintel_trust_layer_architecture.md` covers 6 of them; **Chameleon Detection (Module 6)** + **Litigation Exposure (Module 7)** are net-new and become the family's competitive moat (no competitor — CHIP / eCarrierCheck / DOT Analysis / InsuranceApps — has both).

Per-module **defensibility framework** locked: every module card answers 8 questions (signal / math / visualization / user takeaway / defense / reason codes + bindingUse / maturity + evidence requirements / for ❌: gap detail + path to ✅). The 8 questions become the sales-defense scaffold underwriters can be walked through.

Sprint sequencing: **Sprint 0 (corpus + UI cap) → Sprint A (Violation Intensity + Trend Forecast) → Sprint B (Chameleon Detection) → Sprint C (Litigation Exposure) → Sprint D (Market Fit).** ~10-14 dotintel2 sessions to ship all 8 at ✅ Preview maturity.

### Durable artifacts written + committed

**Family memory (canonical, accessible from any session):**
- NEW `project_dotintel_8_module_risk_spec.md` (canonical 8-module framework)
- NEW `project_dotintel_corpus_backfill_plan.md` (Sprint 0 detail with 2 paths + risk mitigations)
- NEW `project_dotintel_pricing_strategy_v1.md` (per-lookup credits + light subs)
- NEW `feedback_supabase_definer_direct_anon_grant_pattern.md` (Pattern A vs B doctrine)
- `MEMORY.md` index updated with all new pointers

**Cross-repo prep artifacts (saas-agency-database/docs/cross-repo/, committed + pushed):**
- `dotintel-risk-module-defense-matrix.md` — 8-module index doc + per-module summaries + UI viz framework
- `dotintel2-backlog-addendum-trust-layer-sprint-abcd.md` — 4 BACKLOG entries (0-corpus + 0-uicap + 0-modules + 0-defense) for next dotintel2 session to paste-apply

**DECISION_LOG (formal D-numbers — sessions cite by ID, don't relitigate):**
- D-035 — DOT Intel 8-module risk intelligence framework + Sprint 0 corpus backfill commitment
- D-036 — DOT Intel pricing strategy v1 (usage-based credits + light subscriptions)

### Carry-forward Master O actions (updated)

| Priority | Action | Where |
|---|---|---|
| 🔴 Pre-decision | Sprint 0 scope — Path A unfiltered (1.86M) vs Path B filtered to motor-carrier-active (~250-300k, recommended) | At next dotintel2 session open |
| 🔴 Pre-check | Confirm Supabase Pro disk allocation for ~250k new rows + ~1M new `carriers_history` audit rows | Supabase dashboard |
| 🟠 Pre-decision | Sprint C state-litigation data source — ATRI Tort Cost Index (recommended) vs ATA vs US Chamber vs public-verdict compile | At Sprint C session open (not blocking until then) |
| 🟡 Open from earlier sessions | Flip `NEXT_PUBLIC_APP_URL` in Vercel Preview env (dashboard only) | Quick fix, low priority |
| 🟡 Open from earlier sessions | Verify first real Stripe event hits 200 in Vercel logs | Passive observation |
| 🔵 dotintel2-side | Merge PR #32 (S55 customer_signup + paid_conversion wires); provision 9 Vercel env vars; run 5 post-deploy smoke tests | Different repo — open dotintel2 session |

---

**Author:** Session 39 close, 2026-05-26
**Companions:**
- [`SESSION_38_HANDOFF.md`](SESSION_38_HANDOFF.md) — domain cutover (prior session)
- [`SESSION_40_PROMPT.md`](SESSION_40_PROMPT.md) — opens S40
- `supabase/migrations/0096_pre_launch_security_tier1.sql` + `0097_pre_launch_security_tier1_followup.sql`
- `docs/security/agency-signal-tier1-audit.md` — Phase 1 punch list (no changes; doctrine validated)
- `docs/cross-repo/agency-signal-tier1-update-for-seven16-group-site.md` — Rule 2(b) prep artifact
- Family memory `feedback_supabase_definer_direct_anon_grant_pattern.md` (NEW)
- Family memory `project_dotintel_pricing_strategy_v1.md` (NEW; cross-product)
- Family memory `reference_family_supabase_security_baseline.md` (still authoritative; Pattern B addendum applies)
