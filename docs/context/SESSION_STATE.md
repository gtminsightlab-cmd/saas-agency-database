# Session State — Seven16 Group

**Last updated:** 2026-05-01 (start of session 13)
**Companion to:** [MASTER_CONTEXT.md](MASTER_CONTEXT.md)

> Snapshot of where each product stands **right now**. Two halves: Agency Signal (live, mid-build) and DOT Intel (rebuild greenlit, pre-kickoff). Read the relevant half before starting work on a product.

---

## Part 1 — Agency Signal (live)

### 1.1 Production health (verified 2026-05-01)

| Check | Value | Status |
|---|---|---|
| Live URL | https://directory.seven16group.com | ✅ Reachable |
| Latest Vercel deployment | `dpl_3P43zUn4cmwzXHuHACR3k7yLTMT2` (commit `2ee77ff`) | ✅ READY |
| `origin/main` HEAD | `2ee77ff7a4eee305a6fb769f34209997091657ba` | — |
| Bash sandbox | python3 + pandas + openpyxl | ✅ ok |
| Supabase project | `sdlsdovuljuymgymarou` (seven16group, us-east-1, pg 17.6.1) | ✅ Healthy |

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

### 1.3 ⚠️ Known drift: live DB ahead of repo

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

- 🔴 **Rotate `sb_secret_` service role key.** Master O pasted it in chat during session 12 (PowerShell debug). Should be rotated. Walk-through: Supabase dashboard → Project Settings → API → "Generate new secret key" → update `SUPABASE_SERVICE_ROLE_KEY` env var on Vercel + any local `.env.local`.
- 🟡 Pre-existing advisor warns (84 SECURITY DEFINER, extension-in-public) — backlog cleanup.

### 1.7 Stripe state (sandbox)

- Account: `acct_1TLUF6HmqSDkUoqw` ("DOT Intel sandbox")
- Products / prices live: Growth Member `price_1TPxtFHmqSDkUoqwRvnHOqhx` ($99/mo) + One-Time Snapshot `price_1TPxtHHmqSDkUoqwXa3zfPOV` ($125 one-time).
- Routes shipped: `/api/stripe/checkout` (GET), `/api/stripe/webhook` (POST, signature-verified).
- **Vercel env vars Master O still has to set** (Project Settings → Environment Variables): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` (after rotation), `NEXT_PUBLIC_APP_URL=https://directory.seven16group.com`.
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

## Part 2 — DOT Intel (rebuild)

### 2.1 Status: greenlit, pre-kickoff

D-007 (2026-04-30) locked the rebuild on the Seven16 stack. Same URL (`dotintel.io`), new bones. **No code is being migrated** from the old project — old DB stays running for reference, gets shut down once rebuild is shippable.

### 2.2 Old project state (reference only)

| What | Where |
|---|---|
| Old Supabase project | `vbhlacdrcqdqnvftqtin` (name: `dotintel`, region: us-east-2) |
| Old Vercel projects on the team | `dotintel-intelligence`, `dotintel-preview`, `dotintel` |
| Old project skill | `supabase-steward` skill in the skills index — DO NOT use against the new build. The four-zone raw/staging/master/activation pattern + Neilson exclusion + RLS-mandatory rules carry over informally; the project-specific UUIDs do not. |

**What's worth borrowing as learnings (not code):**
- Four-zone data architecture (raw → staging → master → activation).
- Neilson exclusion canary list pattern.
- 51+ credential gate.
- Power-unit bands for trucking (already absorbed into Agency Signal Berkley mapping — see migration 0082 + the Berkley reference memory).
- Parent–child insurer modeling.
- WR Berkley operating-unit attribution logic.

### 2.3 Bootstrap doc

374 lines, 12 sections covering scope, architecture inheritance, schema starter, pricing, data sources, operating doctrine, day-1/week-1/month-1 checklists, opening prompt for session 1, open questions.

**Location:** `docs/spinoffs/dot-carrier-intel/BOOTSTRAP.md` in the Agency Signal repo, until DOT Intel gets its own repo.

When DOT Intel rebuild kicks off, copy or migrate this doc into its new home.

### 2.4 Day-1 decisions still owed

Per BOOTSTRAP.md §1.5 + open question #1 in [Decision Log](DECISION_LOG.md) §9:

1. **New repo + new Supabase project, or new product surface inside the existing dotintel platform?** Recommendation = new repo + new Supabase, but pull FMCSA SAFER via shared ingestion if old project already has it loaded.
2. **Three-ICP scope confirmation:** insurance pros ($30-99/mo) / DOT carriers self-service ($10-20/mo) / lead-gen for small trucking ($TBD). Pricing locked in [Decision Log](DECISION_LOG.md) §2 — confirm scope hasn't drifted before kickoff.
3. **BDM pre-call brief feature scope** — must ship in September launch per Prompt 6 Objection #5. (Open question #4.)

### 2.5 What NOT to repeat from Agency Signal

The hard-earned lessons that cost real time on Agency Signal — bake into DOT Intel from minute zero:

- **Working clone OUTSIDE OneDrive.** Use `C:\Users\GTMin\Projects\dot-intel\`. Run `gh auth login` once. Don't put the canonical git tree under OneDrive sync.
- **For OneDrive doc workflows specifically:** use the `/tmp` heredoc + `cp` atomic-write pattern. Sandbox-write directly into OneDrive truncates files >5KB.
- **GitHub PAT:** sandbox doesn't retain creds between sessions — assume each session needs a fresh PAT until `gh auth login` is set up locally.
- **When loading vendor files:** canary filter + within-file dedupe + cross-file dedupe **before** insert. Dry-run + report stats. Ask Master O for canary patterns when the vendor isn't familiar.
- **When pricing copy depends on data scale:** it's placeholder until inventory catches up. Don't push numeric claims that exceed what's actually loaded.

---

## Part 3 — How to keep this doc fresh

This doc goes stale fastest of the three (because it tracks current state, not decisions). Standing rule:

- **At end of every session that changed DB counts, deployment state, or deferred-items list, update the relevant section here.**
- Bump the "Last updated" date at the top.
- Roll detail into `docs/handoffs/SESSION_N_HANDOFF.md` for the long version. Keep this doc as the at-a-glance summary.
- When something in §1.5 (deferred items) is unblocked or becomes work-in-progress, move it to that session's handoff and remove it from the deferred list.

— end of SESSION_STATE —
