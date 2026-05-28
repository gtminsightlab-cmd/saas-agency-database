# Seven16 Engineering Doctrine

**Scope:** All Seven16 Group product repositories — `dotintel2`, `saas-agency-database` / Agency Signal, `seven16-distribution` / Threshold IQ, and any future product.
**Status:** Active. Updated as decisions land.
**Owner:** Ronnie O'Dell (Master O), Seven16 Group.

This is the family-level engineering doctrine. **Every product repo's `CLAUDE.md` is required to point here as its first instruction.** Repo-local `CLAUDE.md` files cover repo-specific tactical rules only — stack version pinning, operational practices, demo accounts, end-of-session checklists. They never duplicate this doctrine.

For the *why* (product strategy, business context, locked architectural decisions) read the companion files in this same directory:
- [`MASTER_CONTEXT.md`](MASTER_CONTEXT.md) — Seven16 family overview, all products, locked architecture
- [`DECISION_LOG.md`](DECISION_LOG.md) — every locked architectural decision with date + reasoning
- [`SESSION_STATE.md`](SESSION_STATE.md) — current state across the family

---

## Project context

- **Owner:** Seven16 Group (Ronnie O'Dell). Confidential. **Zero relationship to BSB**, Master O's W-2 employer. Never co-mingle data, brand, or distribution.
- **Product line:**
  - **dotintel.io** — operator-facing fleet management + underwriting visibility
  - **directory.seven16group.com / agencysignal.io** — B2B agency directory + distribution intelligence
  - **thresholdiq.io** — wholesaler / capacity-side market intelligence
  - More products as the strategic plan progresses — see `MASTER_CONTEXT.md`
- **Stack:** Supabase (Postgres) + Vercel (Next.js) + Cloudflare. Stripe via Growtheon for billing.

## Stack conventions

- **Database:** Postgres on Supabase. RLS enabled on every table from day one, including partition children. No exceptions.
- **Schemas (target):** `directory.*`, `carrier_market.*`, `wholesaler.*`, `content.*`, `marketplace.*`. Existing repos may still have everything in `public.*` — that's a debt to migrate over time, not a green light to add new tables to `public`.
- **Migrations:** SQL files under `/supabase/migrations/` per repo. Apply via Supabase CLI or the Supabase MCP. Run advisors after every DDL.
- **Frontend:** Next.js App Router, Tailwind, TypeScript strict mode.
- **Auth:** `@supabase/ssr` middleware refresh on every request.

## Front-end production standard (D-024)

**Locked 2026-05-18 per Master O directive.** This is a standing architecture requirement for the entire build.

**The front end is not just the visual layer. It is part of the product architecture.** We are building a production-grade application, not a demo. Every screen, workflow, and component must be stable, responsive, accessible, and understandable to real users.

### The 10 standards (every major screen, workflow, and component)

1. **Responsive layout.** Desktop / tablet / mobile all work. No fixed-width layouts that break on smaller screens. Tables, dashboards, forms, workflows, admin screens, and settings pages need a mobile-safe layout strategy.

2. **Loading states.** The user should always know what the app is doing. When the app is saving, loading, uploading, analyzing, syncing, generating, checking, or processing — the UI must say so clearly (`Loading dashboard…` · `Saving changes…` · `Uploading file…` · `Processing document…` · `Running analysis…` · `Checking status…` · `Syncing records…` · `Generating result…`). The UI must never feel frozen or dead while work is happening in the background.

3. **Error states.** Every async action needs a friendly failure state. No raw technical errors to users. No blank screens. Provide clear recovery: retry / refresh / go back / contact support where appropriate.

4. **Empty states.** When there is no data, explain what that means and what the user can do next. Empty tables, dashboards, lists, tasks, uploads, reports, and search results must never feel broken.

5. **Success states.** When something saves, submits, uploads, completes, syncs, or generates successfully — tell the user. Confirmation matters.

6. **Accessibility.** Semantic HTML, proper labels, keyboard navigation, visible focus states, accessible modals/drawers, screen-reader-friendly status updates. **Color cannot be the only way to communicate meaning.**

7. **Error boundaries.** One broken section must not crash the entire application. Add top-level and section-level error boundaries around complex areas: dashboards, data tables, AI panels, file processing, integrations, workflow modules, admin tools.

8. **State management discipline.** Keep state clean and scoped. Do not overuse global state. Clean up timers, listeners, subscriptions, stale requests, and long-running async calls. Prevent memory leaks and stale updates after users leave a page.

9. **Performance.** Optimize for slow connections and older devices. Route-based code splitting. Lazy loading. Optimized assets. Pagination/virtualization for large lists. Minimal third-party bloat. Users do not download code for modules they are not using.

10. **Defensive UI.** Assume API data can be partial, missing, delayed, malformed, or unavailable. The UI must handle this gracefully without crashing.

### Definition of done

A screen is not complete until it handles all of:

- loading
- empty
- error
- retry
- success
- mobile
- keyboard navigation
- screen readers
- partial data
- slow connection
- user leaving mid-request
- malformed or missing response fields

### How we operationalize this

- **Shared primitives** — build per repo, compose everywhere:
  - `components/ui/LoadingState.tsx` — spinner + skeleton + "Saving…" / "Loading…" variants
  - `components/ui/EmptyState.tsx` — icon + heading + body + primary CTA pattern
  - `components/ui/ErrorState.tsx` — friendly message + retry button + optional support link
  - `components/ui/SuccessToast.tsx` — toast/inline with auto-dismiss
  - `components/ui/ErrorBoundary.tsx` — section + page-level error boundaries
  - `components/ui/StatusPill.tsx` — accessible status indicators (color + icon + text, never color-alone)

- **Toast library:** `sonner` (locked 2026-05-18) — modern, small bundle, accessible by default. Standardize across repos.

- **A11y lint:** `eslint-plugin-jsx-a11y` (locked 2026-05-18) enabled in each repo's lint config.

- **Apply on touch.** Existing screens that don't meet the standard are brought up to it whenever a session edits them. New screens hit the bar before merge.

- **The 12-point Definition of Done is the ship gate.** Code review (Claude or human) checks against the list before declaring a screen "done."

When this doctrine and a quick fix are in tension, the doctrine wins. When this doctrine and an existing memory note disagree, this doctrine wins — update the memory.

---

## Skills to consult before working

These are Claude Code skills — invoke when the task matches.

- **`supabase-steward`** — every Supabase change. Mandatory. Knows the four-zone raw/staging/master/activation pattern, parent-child insurer rollup, Neilson exclusion, RLS-from-day-one rule.
- **`tbm-qa-tester`** — when finishing a screen and asked to test it.
- **`meeting-notes-processor`** — when given a transcript or raw notes.

## Hard rules (do not break without explicit approval)

1. **RLS on every table.** Including partition children. Verify with `select rowsecurity from pg_tables where schemaname = '<schema>'` after every migration.
2. **Run advisors after DDL.** Use the Supabase advisors tool (`mcp__supabase__get_advisors`). Report findings before declaring task done.
3. **Stay in scope. ~5 files typical, ask above ~7.** Each commit ships a single conceptual change you can summarize in one sentence. **Strict 2-file cap** for high-risk changes: DB migrations affecting RLS / policy, anything touching billing or auth flows. *Plan-before-execute (rule 4) is the actual control mechanism — file count is a smell, not a hard cap.*
4. **Plan before executing.** For substantive technical work (schema, scoring, billing, auth, anything user-visible), show the plan in 5–10 bullets, get a thumbs-up, then implement. Pure housekeeping (file moves, doc updates, single-line fixes) skips the plan step but still gets announced before execution.
5. **Verify row counts.** Before and after any data load.
6. **No embedded sample data in production code.** Synthetic test data lives in `/tests/fixtures/` per repo.
7. **No premium amounts or carrier-specific underwriting numbers in code or content** — they're illustrative only and labeled as such.
8. **No agency data source attribution.** Internal data sourcing is internal.
9. **Neilson is excluded from every load.** Hard-coded exclusion in any agency import.
10. **The 51+ credential gate applies to wholesaler-level data access.**

## Standing operational rules (cross-repo)

- **No paid third-party data services until DOT Intel is generating revenue.** Free public data only — primarily FMCSA datasets which are all free with engineering work, plus USPS Web Tools (free with registration). Defer Twilio Lookup, paid VOIP detection, paid VIN history, commercial address validators, etc. to a post-revenue feature backlog. When scoping any new data source, sort into `free now` and `paid (defer)` buckets and explicitly mark the deferred ones as roadmap.
- **Secrets never in chat.** Clipboard → Vercel/Stripe/Supabase dashboard only. Three leaks in a single session prompted this rule — don't repeat.
- **Native git from canonical clones outside OneDrive.** OneDrive sync corrupts `.git`. Each repo has a `C:\Users\GTMin\Projects\<repo>\` canonical clone — git operations happen there.
- **Plugins-first, escalate-last.** Supabase / Vercel / Stripe MCPs available. Use them before walking Master O through a dashboard.
- **Explain like 5 when Master O has to do something himself.** Master O is a non-developer founder. Numbered steps + exact button names + paste-ready commands. Don't make him guess.

## When starting a new feature

1. Read the relevant spec in full before writing code (typically under `<repo>/docs/specs/`).
2. Read this file. Read the repo-local `CLAUDE.md`.
3. Read any related skill (`supabase-steward` at minimum for DB work).
4. Ask which numbered task in the spec you're working on.
5. Plan in 5–10 bullets. Wait for approval (rule 4 above).
6. Implement within the soft 5-file scope target (rule 3 above).
7. Verify (advisors + row counts + RLS check, per rules 1–2 and 5).
8. Update the spec's status file.
9. Stop and wait for review before committing.

## When you're stuck or blocked

- Don't guess. Ask Master O.
- Don't invent factors, schemas, or business logic that aren't in a spec.
- Don't suggest a fundamentally different architecture mid-task. If you think the spec is wrong, surface that as a question, don't act on it.
- When this doctrine and a memory note disagree, the doctrine wins. When this doctrine and a spec under `/docs/specs/` disagree, the spec wins for the scope of that work — surface the conflict.

## Where to find specs

Per-repo. Each repo's `/docs/specs/` directory holds engineering specs. Each spec has a companion `<spec>-status.md` that tracks acceptance criteria as work completes — Claude reads this on every session to know what's left.

Example for dotintel.io:
- `dotintel2/docs/specs/dotintel-risk-scoring-spec.md` — risk scoring engine
- `dotintel2/docs/specs/dotintel-risk-scoring-status.md` — live checklist

---

## Revision history

- **2026-05-10** — initial doctrine. Adapted from Master O's pasted CLAUDE doctrine; file-count rule softened from strict 2-file to "~5 typical, ask above ~7" with strict 2-file reserved for high-risk changes; added the "no paid services until revenue" standing rule; structured as family-level so repo-local CLAUDE.md files can point here.
- **2026-05-18** — added "Front-end production standard (D-024)" section per Master O directive. Codifies 10-standard / 12-point-DoD bar for every screen + tooling locks (`sonner`, `eslint-plugin-jsx-a11y`) + shared `components/ui/*` primitives + apply-on-touch policy for existing screens.
