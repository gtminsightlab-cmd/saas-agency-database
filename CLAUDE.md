# Seven16 Group — Seven16 Intel (and family hub)

This repo is **Seven16 Intel** — a multi-tenant B2B commercial-insurance distribution-intelligence platform live in production at https://seven16intel.com. It is **also the family hub** for Seven16 Group: every other product references `docs/context/` here as the single source of truth.

> **Brand history note:** the product was originally branded "Agency Signal" at `agencysignal.co`. Rebranded to **Seven16 Intel** at `seven16intel.com` on 2026-05-30 per D-046 (brand-collision pivot — `agencysignal.io` is owned by a third-party "AgencySignal" marketing-agency directory product). Both `agencysignal.co` and the older `directory.seven16group.com` 308-redirect to seven16intel.com. **Repo name + Stripe slug + Supabase ref preserved** as `saas-agency-database` / `agencysignal` / `sdlsdovuljuymgymarou` for blast-radius hygiene — only customer-visible brand strings + canonical hostname changed.

**Customer-facing products in the Seven16 family:**

| Product | Live URL | Repo | Supabase satellite |
|---|---|---|---|
| **Seven16 Intel** (this repo) | https://seven16intel.com | saas-agency-database | sdlsdovuljuymgymarou |
| **DOT Intel** | https://www.dotintel.io | dotintel2 | vbhlacdrcqdqnvftqtin |

Plus the **seven16-platform** control plane (`soqqmkfasufusoxxoqzx`, no app yet) for shared auth + entitlements per D-008.

---

## Session boot order (read in this order, every session)

1. [`docs/BACKLOG.md`](docs/BACKLOG.md) — strategic continuity. What's active, what's queued, what's deferred, what's done. **Read first.** (Working Agreement Rule 6.)
2. Latest handoff in [`docs/handoffs/`](docs/handoffs/) — tactical state. The highest-numbered file is current truth. (Rule 1.) **Note on numbering:** this repo has two handoff streams — `SESSION_<N>_HANDOFF.md` (family-hub work) and `AGENCY_SIGNAL_SESSION_<N>_HANDOFF.md (legacy filename retained — see Brand history note)` (Seven16 Intel product work). Read the highest-numbered of whichever stream is relevant to today's arc; check both if the arc isn't obvious.
3. [`docs/WORKING_AGREEMENT.md`](docs/WORKING_AGREEMENT.md) — the 7 standing rules + daily session protocol. Locked 2026-05-15. Identical across `dotintel2` / `saas-agency-database` / `seven16-distribution`.

After reading the three above, propose a 5–10 bullet plan and wait for thumbs-up before touching files. End every session by updating the backlog → writing the next handoff → `git push` → writing the next-session prompt (Rule 5).

---

## Deeper context (read on a need-to-know basis)

1. [docs/STATE.md](docs/STATE.md) — **Seven16 Intel inside-view, written from inside this repo.** Mirrors the family-ledger Part 1 with extra detail. Read this when this repo is the active focus.
2. [docs/context/MASTER_CONTEXT.md](docs/context/MASTER_CONTEXT.md) — the family hub. Single source of truth.
3. [docs/context/DECISION_LOG.md](docs/context/DECISION_LOG.md) — every locked decision (D-001 through D-015). If you're about to relitigate something, check here first.
4. [docs/context/SESSION_STATE.md](docs/context/SESSION_STATE.md) — what's live, what's deferred, current DB counts, deployment HEAD.
5. [docs/context/FOLDER_AND_MEMORY_MAP.md](docs/context/FOLDER_AND_MEMORY_MAP.md) — folder layout + infrastructure IDs (Supabase, Vercel, Stripe, GitHub).
6. [docs/handoffs/](docs/handoffs/) — most recent session handoff for chronological context. **Note:** if recent SESSION_N_HANDOFFs are all DOT-Intel-specific, also read [docs/handoffs/AGENCY_SIGNAL_REFRESH_2026_05_07.md (legacy filename)](docs/handoffs/AGENCY_SIGNAL_REFRESH_2026_05_07.md (legacy filename)) — orientation refresh that exists specifically because Seven16 Intel hasn't been the active focus since session 14.

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

## Seven16 Group Support — Stage-1 readiness shipped (Session C, 2026-05-19)

A new family product `seven16groupsupport.com` (centralized AI sales/support/onboarding/account-management/affiliate-vetting SaaS) will plug into all Seven16 products. This repo has lightweight integration scaffolding only — `.env.local.example` SUPPORT_* vars, `components/support/Seven16SupportWidget.tsx` (null-render placeholder), `lib/support/{context,events}.ts` helpers, 4× `app/api/internal/support/*/route.ts` stubs (health=200, others=501).

**Architecture rule (LOCKED):** Seven16 Intel is **support-integratable**, not **support-dependent**. Do not mount the widget globally, hard-code AI prompts, store conversation tables, or write any code path that breaks AS when `seven16groupsupport.com` is offline. Full spec at [docs/support-integration-readiness.md](docs/support-integration-readiness.md).

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

**As of 2026-05-07:** Seven16 Intel itself is in **steady-state production** (no active feature work — last app code commit was `8829d38` on 2026-04-27, 11 days silent). Active sessions across the family have been:

- **DOT Intel** (sessions 15-20) — mid-May working group demo prep. All three demo blockers closed (force-dynamic, canonical demo carrier, /contact RLS). Coverage amounts ETL completed (session 19). Premium Estimator module shipped (session 20).
- **Threshold IQ** (parallel) — Phase A foundation + Phase B item 2 (AI extraction) live at staging.thresholdiq.io.

**Likely next active scenarios for this repo:**
1. First paying customer surfaces → Stripe sandbox → production cutover.
2. Sprint 1C (shared JWT/Doppler/Sentry) ships across all three satellites → this satellite joins the runbook.
3. Family pricing collaborative session → Producer ($19) + Growth ($99) confirmation, possibly Hygiene Credit refresh.
4. Domain cutover → directory.seven16group.com → seven16intel.com.

Sprint 1B (D-008 control plane) closed in session 14 — `seven16-platform` is created, schema applied, 5 products + 9 plans seeded. Sprint 1C remains the next family-level architectural move.

For full inside-view context, read [docs/STATE.md](docs/STATE.md). For why Seven16 Intel has been quiet, read [docs/handoffs/AGENCY_SIGNAL_REFRESH_2026_05_07.md (legacy filename)](docs/handoffs/AGENCY_SIGNAL_REFRESH_2026_05_07.md (legacy filename)).

---

## End-of-session checklist

When you change scope, deployment state, DB counts, or deferred items:

1. Update [docs/context/SESSION_STATE.md](docs/context/SESSION_STATE.md). Bump the date at the top.
2. Create `docs/handoffs/SESSION_<N>_HANDOFF.md` (exhaustive — see existing handoffs as templates).
3. Commit + push. Verify the Vercel auto-deploy goes READY (not ERROR) before declaring done.
4. If a new architectural decision lands, add it to [docs/context/DECISION_LOG.md](docs/context/DECISION_LOG.md) with date + Why line.
