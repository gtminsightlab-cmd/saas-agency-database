# SESSION_40 opener — paste-ready

Read in this order:
1. [`docs/BACKLOG.md`](../BACKLOG.md)
2. [`docs/handoffs/SESSION_39_HANDOFF.md`](SESSION_39_HANDOFF.md) — **includes post-close addendum with corpus + 1000-cap + 8-module findings + D-035/D-036 locks**
3. [`docs/WORKING_AGREEMENT.md`](../WORKING_AGREEMENT.md)
4. Family doctrine block in `saas-agency-database/CLAUDE.md`
5. Family memory hub: `C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\MEMORY.md`

---

## State at SESSION_40 open

### saas-agency-database side
- **Agency Signal Tier 1 security LIVE** (SESSION_39 close 2026-05-26). Migrations `0096` + `0097` applied. Advisor: 0 ERROR / 32 WARN / 3 INFO (down from 0/90/1).
- **New family-memory doctrine**: [[feedback_supabase_definer_direct_anon_grant_pattern]] — SECURITY DEFINER anon-lockdown has TWO patterns; use combined belt-and-suspenders REVOKE for all remaining family satellite audits.
- Domain cutover stable. Production at `agencysignal.io` (2026-05-27 cutover from SESSION_38's interim `agencysignal.co`; per D-037).
- D-034 pricing pivot doctrine intact from SESSION_38.5.
- **D-035 + D-036 locked at S39 close** in `docs/context/DECISION_LOG.md`:
  - D-035 = DOT Intel 8-module risk intelligence framework + Sprint 0 corpus backfill commitment
  - D-036 = DOT Intel pricing strategy v1 (usage-based credits + light subscriptions)

### dotintel2 side (cross-product context)
- Family API integration mesh wire-site arc closed (S52+S53+S54+S55, 5 of 5 actively-scoped Command events wired)
- PR #31 merged to main (S52+S53+S54). PR #32 (S55) still open as of S39 close
- **Discovered during AS S39**: `public.carriers` corpus = 50,298 (~2-3% of universe); `authority_granted_date = 0/50,298`; Territory Intelligence dashboard has 1000-per-state UI cap
- Cross-repo prep artifacts ready to paste-apply (see "Apply checklist" below)

---

## Default theme — choose based on which repo you open the session in

### Option 1 (RECOMMENDED) — Open dotintel2 session for Sprint 0a corpus backfill

**Why this is the highest-leverage move:** every DOT Intel module + dashboard + score operates on a 2-3% sample until Sprint 0 ships. Without it, the `/pricing` page build (Option 2 below) ships on top of a sample-data product. Sprint 0a is ~1 focused session and delivers a credibility leap (50k → ~250-300k carriers).

**Pre-session decisions Master O makes:**
1. Path A unfiltered (1.86M, includes brokers + passenger + intrastate) vs **Path B filtered to motor-carrier × active common authority (~250-300k — recommended)**
2. Confirm Supabase Pro disk allocation can absorb new rows
3. Authorize cron pause during the backfill window

**Paste-ready prompt for dotintel2 SESSION_56** — see "Copy-paste prompt" section below.

### Option 2 — Stay in saas-agency-database for BACKLOG `0e` `/pricing` page build

The polished `/pricing` page per D-034 (4-tier transparent buying model). Active arc pre-S39; flips back to top of queue. ~90 min focused — slider calculator + comparison table + FAQ + sample-offer banner.

Per the WORKING_AGREEMENT, this can run in parallel with Option 1 (different repos = no collision risk per Rule 2). But sequencing matters: Sprint 0 corpus arc is the highest-priority family-level work right now.

### Option 3 — Apply seven16-group-site Tier 1 security

Cross-repo prep artifact at `docs/cross-repo/agency-signal-tier1-update-for-seven16-group-site.md` is paste-ready. Different repo. Apply the combined belt-and-suspenders REVOKE recipe from `feedback_supabase_definer_direct_anon_grant_pattern.md`.

---

## Apply checklist — when next dotintel2 session opens

**Move cross-repo prep artifacts INTO dotintel2 (per Rule 2(b)):**

1. Copy `saas-agency-database/docs/cross-repo/dotintel-risk-module-defense-matrix.md` → `dotintel2/docs/specs/dotintel-risk-module-defense-matrix.md`
2. Open `dotintel2/docs/BACKLOG.md`. Paste the 4 entries from `saas-agency-database/docs/cross-repo/dotintel2-backlog-addendum-trust-layer-sprint-abcd.md` (0-corpus + 0-uicap + 0-modules + 0-defense) as new top-of-Queued items.
3. Update the "Last reviewed" line in dotintel2 BACKLOG.md with a S40 / Sprint 0 pickup note.
4. Family memory entries (`project_dotintel_8_module_risk_spec.md`, `project_dotintel_corpus_backfill_plan.md`, `project_dotintel_pricing_strategy_v1.md`, `feedback_supabase_definer_direct_anon_grant_pattern.md`) are already in the hub — no move needed; just reference them.
5. Delete `saas-agency-database/docs/cross-repo/dotintel-risk-module-defense-matrix.md` + `dotintel2-backlog-addendum-trust-layer-sprint-abcd.md` after the move (or leave as historical breadcrumb — Master O's call).

---

## Copy-paste prompt — for next dotintel2 session (SESSION_56, Sprint 0a opener)

```text
SESSION_56 opener — Sprint 0a corpus backfill (HIGHEST PRIORITY family work)

Read in this order:
1. dotintel2/docs/BACKLOG.md — top of queue should be 0-corpus, 0-uicap, 0-modules, 0-defense
   (paste-apply from saas-agency-database/docs/cross-repo/ prep artifacts if not yet done)
2. dotintel2/docs/SESSION_55_HANDOFF.md — last dotintel2 session (S55, wire-site arc close)
3. dotintel2/docs/WORKING_AGREEMENT.md — 7 rules + daily protocol
4. Family doctrine block in dotintel2/CLAUDE.md + AGENTS.md
5. Family memory hub:
   C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\MEMORY.md
   Particularly load-bearing:
     - project_dotintel_corpus_backfill_plan.md (THE PLAN — Sprint 0a + 0b detail)
     - project_dotintel_8_module_risk_spec.md (downstream context — why corpus matters)
     - reference_fmcsa_soda_resource_ids.md (SODA endpoint catalog)
     - feedback_fmcsa_data_refresh_architecture.md (6 ingest rules)
     - feedback_soda_delta_upsert_patterns.md (5 patches — apply at planning time)
     - feedback_pg_cron_session_statement_timeout.md (SET statement_timeout TO '0' prefix)
6. Saas-agency-database SESSION_39_HANDOFF.md post-close addendum — full corpus discovery narrative

THE PROBLEM (verified via SQL during AS S39):
  - dotintel2/public.carriers count = 50,298
  - source_last_refreshed FROZEN at 2026-04-13 (original seed)
  - authority_granted_date = 0 of 50,298 populated
  - Daily SODA cron processes deltas only; has NEVER run a historical universe pull
  - Full SODA 6eyk-hxee dataset has ~1.86M rows queryable RIGHT NOW
  - Master O's Territory Intelligence dashboard is operating on ~2-3% of the relevant FMCSA universe

ACTIVE ARC: Sprint 0a — Path B filtered universe pull from SODA 6eyk-hxee
  Filter: motor_carrier × common_stat='A' × US-domiciled
  Estimated result: ~250-300k rows
  Estimated wall: ~1 session (~10-15 min SODA pull + verification)
  Pairs with: Sprint 0b (MCS-150 detail from kjg3-diqy) — separate session

MASTER O PRE-DECISIONS BEFORE COMMITTING:
  1. Path A (unfiltered 1.86M, includes brokers/passenger/intrastate) OR Path B (filtered ~250-300k, recommended)?
  2. Confirm Supabase Pro disk can absorb ~250k new rows + ~1M new carriers_history audit rows
  3. Authorize 30-min cron pause during the backfill window
  4. Acknowledge that Territory Intelligence dashboard will show ~10x bigger state counts immediately after

CONFIRM YOUR APPROACH BEFORE TOUCHING FILES (Working Agreement Rule "plan before execute"):
  - 5-10 bullet plan
  - Wait for Master O thumbs-up
  - Execute one arc only (Rule 3)
  - Close per Rule 5: handoff + push + queue

ALT THEMES (if Master O overrides Sprint 0a):
  - Apply BACKLOG #14 follow-ups: merge PR #32 + provision 9 Vercel env vars + run 5 post-deploy smoke tests
  - DOT Intel /pricing page build per D-036 (usage-based credits + light subs) — needs Sprint 0 corpus first to be honest
  - Sprint A: Violation Intensity + Trend Forecast scorer refactor (gated on Sprint 0 — operates on richer corpus)
  - Continue family-mesh wire-site polish (cert_completion_received, etc.)
```

---

## Quick reference

- **D-035** — 8-module risk framework + Sprint 0 corpus backfill commitment (in DECISION_LOG.md)
- **D-036** — DOT Intel pricing strategy v1 (in DECISION_LOG.md)
- **Cross-repo prep**: `saas-agency-database/docs/cross-repo/dotintel-risk-module-defense-matrix.md` + `dotintel2-backlog-addendum-trust-layer-sprint-abcd.md`
- **Family memory NEW (this S39)**: `project_dotintel_8_module_risk_spec.md` + `project_dotintel_corpus_backfill_plan.md` + `project_dotintel_pricing_strategy_v1.md` + `feedback_supabase_definer_direct_anon_grant_pattern.md`
- **Active arc when AS reopens**: BACKLOG `0e` `/pricing` page build per D-034 (Agency Signal's own pricing page; ~90 min)
- **Highest-priority family work**: Sprint 0a corpus backfill (dotintel2 repo, different session)
