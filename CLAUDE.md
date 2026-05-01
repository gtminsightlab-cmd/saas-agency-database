# Seven16 Group — Agency Signal

Multi-tenant B2B commercial insurance agency directory. **Live in production** at https://directory.seven16group.com (cutting over to agencysignal.co). Part of the Seven16 family of products (sister product: DOT Intel — full rebuild greenlit).

---

## Read these first, in order

1. [docs/context/MASTER_CONTEXT.md](docs/context/MASTER_CONTEXT.md) — the hub. Single source of truth.
2. [docs/context/DECISION_LOG.md](docs/context/DECISION_LOG.md) — every locked decision (D-001 through D-008). If you're about to relitigate something, check here first.
3. [docs/context/SESSION_STATE.md](docs/context/SESSION_STATE.md) — what's live, what's deferred, current DB counts, deployment HEAD.
4. [docs/context/FOLDER_AND_MEMORY_MAP.md](docs/context/FOLDER_AND_MEMORY_MAP.md) — folder layout + infrastructure IDs (Supabase, Vercel, Stripe, GitHub).
5. [docs/handoffs/](docs/handoffs/) — most recent session handoff for chronological context.

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

**Tier 1 of Seven16 master-plan rollout** — foundation for the three-Supabase-project topology (D-008). Specifically:

1. Create `seven16-platform` Supabase project (auth + tenants + entitlements + master control center).
2. Decide JWT-sharing pattern between platform and product satellites.
3. Plan Agency Signal auth migration (build alongside, don't execute on day one).
4. Doppler + Sentry + 1Password rollout in parallel.

Detailed opening move in [docs/handoffs/SESSION_13_HANDOFF.md](docs/handoffs/SESSION_13_HANDOFF.md) under "Tier 1 — opening move for session 14".

---

## End-of-session checklist

When you change scope, deployment state, DB counts, or deferred items:

1. Update [docs/context/SESSION_STATE.md](docs/context/SESSION_STATE.md). Bump the date at the top.
2. Create `docs/handoffs/SESSION_<N>_HANDOFF.md` (exhaustive — see existing handoffs as templates).
3. Commit + push. Verify the Vercel auto-deploy goes READY (not ERROR) before declaring done.
4. If a new architectural decision lands, add it to [docs/context/DECISION_LOG.md](docs/context/DECISION_LOG.md) with date + Why line.
