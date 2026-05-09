# Seven16 Group — Agency Signal (and family hub)

This repo is **Agency Signal** — a multi-tenant B2B commercial insurance agency directory live in production at https://directory.seven16group.com (planned cutover to agencysignal.co). It is **also the family hub** for Seven16 Group: every other product references `docs/context/` here as the single source of truth.

**Three live or staging products in the Seven16 family:**

| Product | Live URL | Repo | Supabase satellite |
|---|---|---|---|
| **Agency Signal** (this repo) | https://directory.seven16group.com | saas-agency-database | sdlsdovuljuymgymarou |
| **DOT Intel** | https://www.dotintel.io | dotintel2 | vbhlacdrcqdqnvftqtin |
| **Threshold IQ** | https://staging.thresholdiq.io | seven16-distribution | yyuchyzmzzwbfoovsskz |

Plus the **seven16-platform** control plane (`soqqmkfasufusoxxoqzx`, no app yet) for shared auth + entitlements per D-008.

---

## Read these first, in order

1. [docs/STATE.md](docs/STATE.md) — **Agency Signal inside-view, written from inside this repo.** Mirrors the family-ledger Part 1 with extra detail. Read this when this repo is the active focus.
2. [docs/context/MASTER_CONTEXT.md](docs/context/MASTER_CONTEXT.md) — the family hub. Single source of truth.
3. [docs/context/DECISION_LOG.md](docs/context/DECISION_LOG.md) — every locked decision (D-001 through D-011). If you're about to relitigate something, check here first.
4. [docs/context/SESSION_STATE.md](docs/context/SESSION_STATE.md) — what's live, what's deferred, current DB counts, deployment HEAD.
5. [docs/context/FOLDER_AND_MEMORY_MAP.md](docs/context/FOLDER_AND_MEMORY_MAP.md) — folder layout + infrastructure IDs (Supabase, Vercel, Stripe, GitHub).
6. [docs/handoffs/](docs/handoffs/) — most recent session handoff for chronological context. **Note:** if recent SESSION_N_HANDOFFs are all DOT-Intel-specific, also read [docs/handoffs/AGENCY_SIGNAL_REFRESH_2026_05_07.md](docs/handoffs/AGENCY_SIGNAL_REFRESH_2026_05_07.md) — orientation refresh that exists specifically because Agency Signal hasn't been the active focus since session 14.

When the hub and a memory note disagree, the hub wins. Update the memory; don't leave a quiet contradiction.

---

## Standing rules (don't make Master O repeat these)

- **Plugins-first, escalate-last.** Supabase / Vercel / Stripe MCPs are available. Try them before asking Master O for anything.
- **Explain like 5.** When Master O has to click or type something, give numbered steps + exact button names + paste-ready commands. He's a non-developer founder.
- **Secrets never in chat.** Clipboard → dashboard only. Never paste keys/tokens/webhook secrets in conversation. (Codified after three leaks in session 13.)
- **Cancelled = closed scope.** "Skip that" means delete from list, not defer. See [DECISION_LOG.md §5](docs/context/DECISION_LOG.md).
- **Canary + dedupe + dry-run on every external data load.** Vendor files have decoys. Ask for canary patterns before guessing.
- **Pricing copy is placeholder until data inventory catches up.** Don't propose revisions to scale claims (100k producers, 70% email density) without checking counts.
- **Carrier search is fuzzy/strong-match (pg_trgm), not exact.** User-facing lookups tolerate suffix variants (Inc/Corp/Co).
- **Handoffs must be exhaustive.** Chronological log + migrations + commits + identifiers + lessons + opening move. End every state-changing session with one.

---

## Working clone — this is the canonical copy

**Canonical:** `C:\Users\GTMin\Projects\saas-agency-database\` (this folder). Native git, normal workflow.

**Deprecated:** `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database\`. The `.git` is permanently broken (OneDrive sync corrupts git internals). Kept for the vendor `data/` archive only — do NOT edit code there. Future Claude Code sessions should be launched from the canonical folder.

GitHub repo: https://github.com/gtminsightlab-cmd/saas-agency-database (public, auto-deploys to Vercel on push to `main`).

---

## Stack

Next.js 14 App Router · React 18 · TypeScript · Tailwind · Supabase Postgres 17 (RLS day-one, multi-tenant) · `@supabase/ssr` · Stripe v17 · Vercel · Cloudflare DNS.

Default tenant: `ce52fe1e-aac7-4eee-8712-77e71e2837ce` (slug `seven16`).

---

## Current focus

**As of 2026-05-07:** Agency Signal itself is in **steady-state production** (no active feature work — last app code commit was `8829d38` on 2026-04-27, 11 days silent). Active sessions across the family have been:

- **DOT Intel** (sessions 15-20) — mid-May working group demo prep. All three demo blockers closed (force-dynamic, canonical demo carrier, /contact RLS). Coverage amounts ETL completed (session 19). Premium Estimator module shipped (session 20).
- **Threshold IQ** (parallel) — Phase A foundation + Phase B item 2 (AI extraction) live at staging.thresholdiq.io.

**Likely next active scenarios for this repo:**
1. First paying customer surfaces → Stripe sandbox → production cutover.
2. Sprint 1C (shared JWT/Doppler/Sentry) ships across all three satellites → this satellite joins the runbook.
3. Family pricing collaborative session → Producer ($19) + Growth ($99) confirmation, possibly Hygiene Credit refresh.
4. Domain cutover → directory.seven16group.com → agencysignal.co.

Sprint 1B (D-008 control plane) closed in session 14 — `seven16-platform` is created, schema applied, 5 products + 9 plans seeded. Sprint 1C remains the next family-level architectural move.

For full inside-view context, read [docs/STATE.md](docs/STATE.md). For why Agency Signal has been quiet, read [docs/handoffs/AGENCY_SIGNAL_REFRESH_2026_05_07.md](docs/handoffs/AGENCY_SIGNAL_REFRESH_2026_05_07.md).

---

## End-of-session checklist

When you change scope, deployment state, DB counts, or deferred items:

1. Update [docs/context/SESSION_STATE.md](docs/context/SESSION_STATE.md). Bump the date at the top.
2. Create `docs/handoffs/SESSION_<N>_HANDOFF.md` (exhaustive — see existing handoffs as templates).
3. Commit + push. Verify the Vercel auto-deploy goes READY (not ERROR) before declaring done.
4. If a new architectural decision lands, add it to [docs/context/DECISION_LOG.md](docs/context/DECISION_LOG.md) with date + Why line.
