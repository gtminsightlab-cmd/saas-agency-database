# Session 14 Handoff — 2026-05-01

**Theme:** Migration from Cowork → Claude Code + Sprint 0 (foundation hardening) + Sprint 1B (create `seven16-platform` Supabase project per D-008). Production unchanged throughout.

**HEAD at end of session:** `c55e0b4` on `origin/main`
**Live URL:** https://directory.seven16group.com (HTTP 200, unchanged)
**New Supabase project:** `soqqmkfasufusoxxoqzx` (seven16-platform, us-east-1, ACTIVE_HEALTHY)

---

## Pre-session state

- `origin/main` HEAD: `47430eb` (session 13's final commit)
- OneDrive `.git` permanently broken — every push from a `/tmp` clone via fresh PAT
- No working clone outside OneDrive
- D-008 (three-project Supabase topology) decided 2026-05-01 in session 13, but no platform project created yet
- Master plan and 4 context docs already in repo from session 13 Tier 0
- User concern: "I just saw you fix a lot of Cowork's work in a separate session and that worries me" — wanted foundation verified before going deeper

## Chronological log

### 1. Context absorption (read-only)
- Read all 4 docs/context/*.md files end to end (MASTER_CONTEXT, DECISION_LOG, SESSION_STATE, FOLDER_AND_MEMORY_MAP)
- Read SESSION_13_HANDOFF.md to understand Tier 0 closure state
- Verified file artifacts: 27 migrations (0057-0083) present in supabase/migrations/, D-008 in DECISION_LOG row 23, all 4 docs/context/ md files
- Spot-checked code structure (app/, components/, lib/) and SESSION_12_HANDOFF.md for current numbers

### 2. Hybrid-vs-consolidation discussion
- Master O asked whether to keep Cowork as strategy layer + Claude Code for code (Cowork's recommendation), or consolidate to Claude Code only
- Recommended consolidation. Reasons: two sources of truth = drift; Cowork's strategic value over Claude Code is small once CLAUDE.md exists; Master O's stated concern about Cowork mistakes was itself a "consolidate" signal
- Master O: "let's move forward with your CTO and saas PM recommended sprints"

### 3. Sprint 0 — foundation hardening
- Verified env: git 2.53.0.windows.2 ✓, gh CLI not installed (decided to skip — Git Credential Manager already at system-level handles auth)
- Created `C:\Users\GTMin\Projects\` directory + cloned repo there
- New clone HEAD = `47430eb`, working tree clean, 195 files
- Diff'd new clone vs OneDrive: line-ending-agnostic showed OneDrive was BEHIND repo (missing `app/hygiene/`, `components/hygiene/`, `lib/email-policy.ts`). Dropped the idea of syncing OneDrive → new clone since OneDrive was strictly a stale subset
- Wrote `CLAUDE.md` at repo root (70 lines) pointing every future Claude Code session at docs/context/
- First push: `git push origin main` succeeded WITHOUT browser popup — GCM already had cached creds from prior local git use (better than expected). Committed as `c75c96b`
- Verified prod auto-deploy via curl: HTTP 200 in 1.4s
- Updated SESSION_STATE.md §1.1 to reflect new canonical clone location → commit `a2052a3`

### 4. Sprint 1A — design + cost confirmation
- Loaded Supabase MCP tools: list_projects, get_organization, list_organizations, get_cost
- Verified org `ommujdigmtnmqkxahfgc` is on Pro plan (NOT free)
- `get_cost(project)` returned **$10/mo** for a new project (correction from earlier $25/mo estimate — D-008's note about ~$50/mo extra is now actually ~$20/mo at full three-project topology)
- Presented schema design (7 tables: tenants, profiles, tenant_memberships, products, plans, entitlements, audit_log) + JWT-sharing recommendation (Option A — shared secret) + 4-sprint plan (1A→1D)
- Master O signed off on cost, schema, project name, region

### 5. Sprint 1B — create platform project + apply schema
- `confirm_cost(amount=10, recurrence=monthly, type=project)` → `BGoZHqqJd2JYMt+cWSDFH7qDeNkZZAwbTytJrHy7r+E=`
- `create_project(name=seven16-platform, region=us-east-1, organization_id=ommujdigmtnmqkxahfgc, ...)` → ID `soqqmkfasufusoxxoqzx`, status UNKNOWN
- Polled 90s, status → ACTIVE_HEALTHY, pg 17.6.1.111
- Wrote and applied **5 migrations** to platform DB AND saved files to `platform/migrations/`:
  - `0001_platform_schema.sql` — 7 tables, indexes, FKs, updated_at trigger helper. 187 lines.
  - `0002_platform_rls.sql` — RLS enable on all 7 tables + helper functions (`is_service_role`, `current_user_tenant_ids`, `current_user_is_tenant_admin`, `current_user_is_tenant_owner`) + policies. Used `(select auth.uid())` initplan pattern from Agency Signal session 5 for the 485× speedup.
  - `0003_platform_seed.sql` — products (`agency_signal`, `dot_intel`) + 9 plans (4 Agency Signal tiers + 4 DOT Intel tiers + Seven16 Intelligence bundle). Locked pricing per DECISION_LOG §2.
  - `0004_platform_advisor_fixes.sql` — fixed 8 security WARNs: added `set search_path = public, pg_catalog` to 2 public functions; moved 3 SECURITY DEFINER helpers from `public` → new `private` schema (PostgREST won't expose them as RPC, but RLS policies can still call them via explicit grants). Recreated 9 policies pointing at `private.*`.
  - `0005_platform_perf_fixes.sql` — fixed 12 performance WARNs by dropping the redundant `*_service_role_all` policies (Supabase service_role has BYPASSRLS — those policies never gated anything but doubled RLS evaluation cost) + added missing FK indexes for `tenants.created_by` and `entitlements.plan_id`
- Verified after each: `list_tables` (rls_enabled=true on all 7), `execute_sql` (9 plans seeded correctly), advisors clean
- Final advisor state: **0 security warnings**, **0 performance WARN warnings**, 17 INFO unused_index (expected on empty tables — will resolve as queries land), 1 INFO auth-conn (defer until scale)

### 6. Push + verify
- Committed all 5 migrations + SESSION_STATE.md update → `c55e0b4`
- Push clean
- Verified Agency Signal prod still 200 (HTTP 200, 2.5s) — Sprint 1B didn't touch it

## Files changed in commits this session

**`c75c96b`** — chore: add CLAUDE.md (1 file, 70 insertions)
**`a2052a3`** — docs(state): mark Sprint 0 closed (1 file, 9/7 +/-)
**`c55e0b4`** — feat(platform): create seven16-platform + base schema (6 files, 620/4 +/-)
  - `docs/context/SESSION_STATE.md` (modified)
  - `platform/migrations/0001_platform_schema.sql` (new, 187 lines)
  - `platform/migrations/0002_platform_rls.sql` (new, 142 lines)
  - `platform/migrations/0003_platform_seed.sql` (new, 32 lines)
  - `platform/migrations/0004_platform_advisor_fixes.sql` (new, 130 lines)
  - `platform/migrations/0005_platform_perf_fixes.sql` (new, 17 lines)

## Identifiers added/changed

| What | Identifier |
|---|---|
| New Supabase project | `soqqmkfasufusoxxoqzx` (seven16-platform) |
| New cost obligation | +$10/mo (Pro plan, 3rd project) |
| Org (unchanged) | `ommujdigmtnmqkxahfgc` |
| New helper-function schema | `private` |
| Canonical working clone (NEW) | `C:\Users\GTMin\Projects\saas-agency-database\` |
| Latest commit | `c55e0b4` |

## Architectural decisions made this session

**Repo layout for migrations going forward:**
- `supabase/migrations/` — Agency Signal (existing, don't touch)
- `platform/migrations/` — `seven16-platform` (NEW this session)
- `dot-intel/migrations/` — when DOT Intel rebuild kicks off
- One repo, three projects, three migration trees. Each project's migrations stay on their own numeric line.

**Helper-function schema pattern:**
- Public-facing tables in `public` schema
- SECURITY DEFINER helpers in `private` schema with explicit grants to `authenticated` + `service_role`
- Avoids exposing helpers as PostgREST RPC endpoints while keeping them callable from RLS

**Service role policies:**
- Don't write `*_service_role_all` policies. Service role has BYPASSRLS in Supabase — these policies never gate anything but force authenticated queries to evaluate two policies per row. Pattern from Agency Signal sessions was unintentionally suboptimal; corrected here in 0005.

## Lessons learned (carry forward)

1. **GCM cached creds work invisibly.** Master O's machine already had Git Credential Manager configured at the system level — first push from new clone needed zero browser popup. Don't assume per-session PATs are needed when GCM is in play.

2. **Cost estimates from D-008 were 2.5× too high.** Real per-project cost on Pro plan is $10/mo, not $25. Three-project topology = +$20/mo total (one extra for each new project beyond the 2 included), not $50/mo. Update D-008's note when next touching the decision log.

3. **Don't write service_role policies.** BYPASSRLS makes them dead weight that doubles RLS evaluation cost. The `*_service_role_all` policy pattern from Agency Signal's playbook should not be repeated.

4. **Move SECURITY DEFINER helpers out of `public`.** PostgREST exposes everything in `public` as RPC endpoints — even functions that should be implementation details. The `private` schema with explicit grants is the right pattern.

5. **OneDrive copy was BEHIND the repo, not ahead.** Three files in repo (`app/hygiene/`, `components/hygiene/`, `lib/email-policy.ts`) were missing from OneDrive. OneDrive sync had silently truncated them at some point. Confirms the deprecation decision was correct.

## Cleanup items still open from session 13

- Revoke session-13 GitHub PAT and Vercel API token (auto-expired 2026-05-02)
- Delete unused Supabase secret keys `default` and `seven16group` on Agency Signal API Keys page
- **Rotate the JWT signing secret** that leaked in chat earlier — disruptive (invalidates live sessions); plan for low-traffic window

## Open questions surfaced this session — none new

Same 4 from the master plan, raise contextually:
1. Directory domain strategy (Phase 3, mid-Oct 2026)
2. Growtheon margin model (Growtheon offer pages)
3. Seven16Recruit attorney engagement (any public Recruit work)
4. BDM pre-call brief in DOT Intel Phase 2 spec (DOT Intel rebuild kickoff)

## Sprint 1C — opening move for next session

**Goal:** wire shared JWT secret across `seven16-platform` ↔ `sdlsdovuljuymgymarou` so satellites trust platform-issued tokens. Stand up Doppler + Sentry. Production stays unchanged.

**Required from Master O at session start:**
1. **Vercel API token** (for env-var management without dashboard clicks). Generate at https://vercel.com/account/tokens, scope to team `gtminsightlab-7170s-projects`, expiration 1 day. Paste in chat — bounded leak window, can't read Supabase.
2. **Doppler signup** at https://dashboard.doppler.com/signup. Free tier is sufficient. Master O creates project `seven16` with config `prd_agency_signal`. Then I can add a service token with read access for Vercel integration.
3. **Sentry signup** at https://sentry.io/signup. Free tier covers up to 5K errors/mo — fine for current scale. Create org `seven16` and project `agency-signal` (Next.js).

**Sprint 1C steps:**
1. Read `auth.config` from `sdlsdovuljuymgymarou` to get current JWT secret. Set the same secret on `seven16-platform`. Both projects can validate each other's tokens.
2. Configure Doppler with all current Vercel env vars from Agency Signal. Add Vercel integration via Doppler (one-time OAuth dance, Master O clicks).
3. Install `@sentry/nextjs` in Agency Signal. Add `sentry.client.config.ts` + `sentry.server.config.ts`. Configure Vercel integration so source maps upload on deploy. Test with a deliberate `throw` route, confirm event lands in Sentry.
4. Plan dry-run runbook for Sprint 1D auth migration. Don't execute.

**Deferred to Sprint 1D (planned window):**
- Migrate `auth.users` from Agency Signal → platform
- Update Agency Signal app to read auth via shared JWT + tenant/entitlement data via service-role bridge
- Test in staging first; cutover during low-traffic window (~4am Sunday or similar)

## Opening prompt for session 15

```
Session 15: continuing Seven16 master-plan rollout. Sprint 1B closed in
session 14 — seven16-platform Supabase project created, 7 tables + RLS +
seeded plans, advisors clean, all pushed to origin/main as c55e0b4.

Working clone at C:\Users\GTMin\Projects\saas-agency-database\ (NOT OneDrive).

Read silently before anything else:
1. CLAUDE.md (auto-loaded by Claude Code)
2. docs/context/MASTER_CONTEXT.md
3. docs/context/DECISION_LOG.md (focus on D-006 + D-008)
4. docs/context/SESSION_STATE.md (Part 0 — platform state, Part 1 — Agency Signal state)
5. docs/handoffs/SESSION_14_HANDOFF.md

Today's job: Sprint 1C — shared JWT secret + Doppler + Sentry rollout.

Need from Master O at start:
- Vercel API token (per-session, 1-day expiry)
- Doppler signup confirmation
- Sentry signup confirmation

Standing rules in effect:
- Secrets never in chat (clipboard → dashboard only)
- Native git from canonical clone — no /tmp clone needed (GCM cached creds)
- Plugins-first, escalate to Master O last
- Explain like 5 for any clicks/typing
```

— end SESSION_14_HANDOFF —
