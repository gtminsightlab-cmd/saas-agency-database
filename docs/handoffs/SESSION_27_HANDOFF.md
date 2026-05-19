# Family-Hub Session 27 — Internal-app foundation shell + Recruit Lists wrap (2026-05-19)

**Date:** 2026-05-19
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `claude/intelligent-leavitt-9243ef` worktree → fast-forwarded to `main`
**Predecessor:** [`SESSION_26_HANDOFF.md`](SESSION_26_HANDOFF.md)
**HEAD at session open:** `e9d163d` (`docs(status-dashboard): Seven16 Group Partner Program section + SESSION_25/26 refresh`, 2026-05-18 close of SESSION_26 tail)
**HEAD at session close:** `0a8b2dc` (`feat(d-024,intel-app): foundation shell + Recruit Lists wrap (Session 27)`)
**Commits added to main:** 1 (`0a8b2dc`)
**Live URL:** https://directory.seven16group.com (deploy `dpl_8SRxpyK5q3kwXVBnUzpmM5zdBn8s` READY, 42s build)

---

## Theme

**First slice of the Sessions 27-32 internal-app redesign epic** per Master O CMO brief 2 (pasted at SESSION_26 close 2026-05-18). Brings the authenticated app surface up to the same intelligence-workspace bar as the SESSION_26 marketing homepage. Tailwind palette swapped to a deeper teal-700 anchor; new component primitives layered on top of the existing AppShell; Recruit Lists page rewritten as the proof-of-shell template every subsequent epic session apes.

Master O greenlit Sprint 1 sequencing (internal-app foundation first, Charter outreach in parallel, revenue cutover on demand) at session open before slice-1 audit. Execution then followed the 9-slice plan with two judgment calls confirmed at thumbs-up: **skip StatusChip** (reuse existing `components/ui/StatusPill` — 6 tones cover app-surface semantics) and **per-page composition** for PageHeader / Breadcrumbs (vs slot props on AppShell).

---

## What shipped

### Commit `0a8b2dc` — Session 27 (10 files, +591/-245)

**Tailwind palette refresh** — [`tailwind.config.ts`](../../tailwind.config.ts)

`brand-*` ramp replaced with #0F766E (Tailwind teal-700) anchor at brand-600 + full 50-900 scale shifted up one position from Tailwind's teal scale (brand-700 = teal-800, brand-800 = teal-900, brand-900 = custom #042F2E). Two flat tokens added for upcoming data-viz + admin surfaces: `intel-cyan` (#0891B2, cyan-600) + `intel-dark` (#07111F).

256 `brand-*` occurrences across 40 files visually re-tinted automatically — no per-file edits required. Marketing homepage insulated (uses Tailwind `blue-600` literal, no brand-* references).

**5 new `components/app/*` primitives:**

| File | Purpose |
|---|---|
| [`page-header.tsx`](../../components/app/page-header.tsx) | Server component. Title + subtitle + actions slot. Semantic `<header>` landmark with `<h1>` — one per page. |
| [`breadcrumbs.tsx`](../../components/app/breadcrumbs.tsx) | Server component. `<nav aria-label="Breadcrumb">` + `<ol>`. Last item marked `aria-current="page"` and non-clickable. |
| [`top-bar.tsx`](../../components/app/top-bar.tsx) | Client component (`"use client"`). Desktop-only sticky bar above `<main>`. Global search input stub + plan/credits chip + user identity chip. Sign-out lives in sidebar (never buried — Master O ergonomic rule). |
| [`metric-card.tsx`](../../components/app/metric-card.tsx) | Server component. KPI tile: title + value + optional delta (positive/negative/neutral intent with arrow icons) + optional icon + optional href (makes card a link). Skeleton fallback when `loading=true`. |
| [`data-table.tsx`](../../components/app/data-table.tsx) | Server component chrome wrapper. State slots: `ready` (default — renders children) / `loading` (LoadingState block variant) / `empty` (EmptyState with heading + body + action) / `error` (ErrorState with message). |

**AppShell refactor** — [`components/app/shell.tsx`](../../components/app/shell.tsx)

- Skip-to-content link (`<a href="#content" className="sr-only focus:not-sr-only ...">`) at top of layout
- Semantic `<main id="content">` landmark wrapping children (was a generic `<div>`)
- `<TopBar email={email} fullName={fullName} />` rendered above main (desktop-only via `hidden md:flex`)
- Mobile-only sign-out strip preserved (mobile sidebar drawer deferred to future session)
- Auth gating + `app_users` fetch unchanged

**Sidebar relabel** — [`components/app/sidebar.tsx`](../../components/app/sidebar.tsx)

Brand: "Seven16 / AGENCY DIRECTORY" → "Agency Signal / DISTRIBUTION INTELLIGENCE" (per D-023 positioning lock).

4-section regroup (was 4 sections with different titles + ordering):

| Section | Links |
|---|---|
| **Intelligence** | Vertical Intelligence (`/verticals`) · Carrier Map (`/analytics/carriers`) · Agency Search (`/quick-search`) · AI Research Assistant (`/ai-support`) |
| **Recruit Workflow** | Build Recruit List (`/build-list`) · Recruit Lists (`/saved-lists`) · Exports (`/downloads`) |
| **Trust & Reference** | Data Coverage (`/data-stats`) · Scoring Methodology (`/methodology`) · Resources (`/resources`) |
| **Account** | Team (`/team`) |
| **Admin** (super_admin only) | Control Room (`/admin`) · Users & Tenants (`/admin/customers`) |

5 label renames per Master O resolution lock (URLs untouched — DB tables stay `saved_lists`, Stripe webhook URLs stay, Pillar 6 Edge Function URLs stay):

| Old label | New label | URL (unchanged) |
|---|---|---|
| Saved Lists | Recruit Lists | `/saved-lists` |
| Downloads | Exports | `/downloads` |
| Quick Search | Agency Search | `/quick-search` |
| Data and Stats | Data Coverage | `/data-stats` |
| AI Support | AI Research Assistant | `/ai-support` |

Also: `aria-current="page"` added to active nav links; `aria-label="Sidebar"` on `<aside>`; `aria-label="Main navigation"` on `<nav>`; decorative icons marked `aria-hidden="true"`; helper components (`NavSection`, `NavLinkItem`) extracted to clean composition.

Note on Home link: NOT added in Session 27 because `/home` route doesn't exist yet (Session 28 builds it). Adding the link now would 404. SESSION_28 prompt includes adding Home to sidebar after `/home` ships.

**Recruit Lists page rewrite** — [`app/saved-lists/page.tsx`](../../app/saved-lists/page.tsx)

Re-composed inside the new chrome:
- `<AppShell>` (existing — now renders TopBar above)
- `<PageHeader title="Recruit Lists" subtitle="Saved targeting lists you can refresh, share, and export. Rows tinted teal have new data ready for delta export." actions={<Build a Recruit List CTA>} />`
- 5-KPI `<MetricCard>` row:
  - **Total Lists** — exact count from Supabase
  - **Agencies Saved** — sum of `accounts_count` (subtitle "Across all lists" — clarifies it's not unique)
  - **Contacts Saved** — sum of `contacts_count` (subtitle "Across all lists")
  - **Ready to Export** — count where `has_updates=true` (subtitle "Lists with new data"; clickable when > 0, links to `/saved-lists?sort=has_updates&dir=desc`)
  - **Last Refresh** — most recent `last_run_at` across rows, formatted YYYY-MM-DD
- Sort + total bar (kept from original, restyled)
- `<DataTable state={rows.length === 0 ? "empty" : "ready"} ...>` wrapper:
  - EmptyState slot: "No recruit lists yet" + "Build your first targeting list on the Build Recruit List page" + "Build a Recruit List" CTA
  - Inside ready state: existing sortable table with `SortableThLink` headers (unchanged)
  - Updates? cell: `<StatusPill tone={l.has_updates ? "success" : "neutral"} label={l.has_updates ? "Yes" : "No"} srPrefix="Updates available" />` (was text-based)
  - Row tint: `bg-brand-50/60 hover:bg-brand-50` retained for has_updates rows (now light teal per new palette)
- Dead non-functional search input removed (TopBar global search is the new home; list-level filter can come in Session 29 if needed)

**row-actions D-024 polish** — [`app/saved-lists/row-actions.tsx`](../../app/saved-lists/row-actions.tsx)

- 3× `alert()` replaced with `errorToast(message, { description })` from `@/components/ui/SuccessToast`
- `successToast()` fired on successful delete + delta-export download
- Component wrapped in `<ErrorBoundary>` with `<span className="text-xs text-rose-700">Actions unavailable</span>` fallback
- Visible `Loader2` spinner replaces icon during `busy` / `deltaBusy` states (was only opacity-50 on the button)
- `aria-label` on every interactive element (e.g. `aria-label={busy ? "Deleting ${name}" : "Delete list ${name}"}`)
- `focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1` rings on all buttons + links
- Decorative `Trash2`/`Download`/`Pencil` icons marked `aria-hidden="true"`
- Delete confirm copy updated: "Delete saved list" → "Delete recruit list"
- Delta CSV filename fallback: `saved-list-delta.csv` → `recruit-list-delta.csv`

`window.confirm()` retained for delete (native, keyboard-accessible — replacing with custom AlertDialog component is a separate scoped task, not Session 27).

---

## D-024 Definition-of-Done verification on Recruit Lists

Per ENGINEERING_DOCTRINE §"Front-end production standard" — 12-point DoD walked:

| Point | Status | Where |
|---|---|---|
| Loading | ✓ | DataTable loading-state slot + MetricCard Skeleton (when `loading=true`) + row-actions `<Loader2 animate-spin>` during async ops |
| Empty | ✓ | DataTable empty-state slot wired to `<EmptyState heading="No recruit lists yet" ... action={<Build a Recruit List CTA>}>` |
| Error | ✓ | DataTable error-state slot wired to `<ErrorState>`; row-actions wrapped in `<ErrorBoundary>`; sonner `errorToast` on every async failure path |
| Retry | ✓ | ErrorState has built-in retry button (server-rendered page level); user can re-click any failed action after toast |
| Success | ✓ | sonner `successToast` on delete + delta download; router.refresh() flips row state |
| Mobile | ✓ | KPI grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`; table inside `overflow-x-auto`; sidebar `hidden md:flex`; mobile sign-out strip stays accessible above main |
| Keyboard | ✓ | `focus-visible:ring-*` on all buttons + links; semantic `<button>` + `<a>` (no role=button divs); skip-to-content link at top of shell |
| Screen readers | ✓ | `aria-current="page"` on active nav; `aria-label` on every action button; decorative icons `aria-hidden="true"`; `sr-only` label on TopBar search input; `srPrefix="Updates available"` on Updates StatusPill |
| Partial data | ✓ | `l.accounts_count?.toLocaleString?.() ?? "—"` fallback chains; `lastRefreshAt` undefined → "—" label; `useCase ?? v.description ?? ""` patterns kept |
| Slow connection | ✓ | Server-rendered above-the-fold; client async ops show spinner immediately on click |
| User leaving mid-request | ✓ | try/catch with `finally { setBusy(false) }`; `URL.revokeObjectURL(url)` cleanup on delta download |
| Malformed response | ✓ | `.catch(() => ({}))` on JSON parse; `.text().catch(() => "")` on text body; sonner toast surfaces fallback message |

jsx-a11y lint: clean across `components/app/**/*.tsx` + `app/saved-lists/**/*.tsx` (0 errors). Build: green (`npm run build` → all 50+ routes compiled, no broken refs from palette swap).

---

## Live verification end-to-end

Master O tested on production at https://directory.seven16group.com/saved-lists (post-deploy):

- ✓ Sidebar brand "Agency Signal / DISTRIBUTION INTELLIGENCE" + new 4-section regroup + "Recruit Lists" active state shows deep teal background tint
- ✓ TopBar with global search stub + "Free" plan chip + user chip (info@echelonconsulti...) + chevron
- ✓ PageHeader with "Recruit Lists" h1 + subtitle + "Build a Recruit List" CTA (dark teal button) in actions slot
- ✓ 5 KPI tiles populated: Total Lists 4 / Agencies Saved 150 / Contacts Saved 674 / Ready to Export 0 / Last Refresh 2026-04-26
- ✓ Table with 4 rows, "No" StatusPill (gray neutral tone) on Updates column
- ✓ Delete flow: native confirm "Delete recruit list 4-25-2026 1:31pm? This cannot be undone." → green sonner success toast "Deleted 4-25-2026 1:31pm" (top-right) → table refreshes 4 → 3 rows → Total Lists KPI tile recomputes 4 → 3

Functional. No regressions on the existing sort behavior, edit-filters link, full-CSV download, or delta-CSV download.

---

## Commits this session (chronological)

| Commit | Title |
|---|---|
| `0a8b2dc` | feat(d-024,intel-app): foundation shell + Recruit Lists wrap (Session 27) — 10 files, +591/-245 |

1 commit. Fast-forwarded to main via `git push origin claude/intelligent-leavitt-9243ef:main`.

---

## What's NOT done — queued for next session

### 🔴 Still pending Master O dashboard actions (carried from SESSION_25 → SESSION_26 → SESSION_27)

1. **CRON_SECRET in Vercel production env** — daily 04:00 UTC cron for Pillar 6 saved-list refresh still returns 500 until set. `openssl rand -base64 32` → Vercel Settings → Env Variables → Add (Sensitive, Production).
2. **Stripe webhook endpoint registration** at `https://directory.seven16group.com/api/stripe/webhook` for 6 events. Dashboard-only per `feedback_stripe_mcp_webhook_dashboard_only.md`.
3. **Sentry org token rotation** — every deploy still logs `Invalid org token (401)` on @sentry/nextjs After Production Compile.

### 🟡 Sessions 28-32 epic continues (NEW active head: SESSION_28)

| Session | Scope | Files | Output |
|---|---|---|---|
| **28 Intelligence Home + Vertical Intelligence** (next) | NEW `/home` authenticated dashboard route (KPIs + recommended plays + recent activity + quick actions) · Vertical Intelligence (`/verticals`) redesign with VerticalOpportunityCard · `/verticals/[slug]` polish · add Home link to sidebar (route now exists) · apply-on-touch D-024 cleanup on 3 pre-existing jsx-a11y errors flagged in SESSION_26 | ~18 | Daily command center |
| 29 Build Recruit List + Recruit Lists polish | Stepper + StickySummaryPanel + SWR client-cache fold-in | ~20 | Core workflow surface |
| 30 Exports + Agency Search + AI Research Assistant | 3 medium-complexity surfaces | ~22 | Closes most-used surfaces |
| 31 Data Coverage + Methodology + Resources + Team | 4 lighter surfaces | ~15 | Closes customer side |
| 32 Admin polish | AdminSidebar (dark variant) + 4 admin pages | ~25 | Polished control room |

Paste-ready opener: [`SESSION_28_PROMPT.md`](SESSION_28_PROMPT.md).

### 🟢 Side findings (post-push, not session-introduced)

- **GitHub Dependabot — 3 vulnerabilities on `main` after push** (1 high, 2 moderate). Surfaced when push remote echoed Dependabot summary. Pre-existing — not from Session 27 changes. Queue for separate triage session: read `https://github.com/gtminsightlab-cmd/saas-agency-database/security/dependabot`, classify each, decide upgrade vs accept.
- **MEMORY.md size** still over the 24.4KB warning at session open (was 27.1KB at SESSION_26 close). Not session-blocking; surface in next family-hub bookkeeping session for consolidation pass (mechanism #4 monthly anti-decay sweep).

### Tier 1.x carry-forwards (from SESSION_26)

- AS Session 5 Option A SWR client-cache → folded into Session 29 Build Recruit List redesign
- Pillar 7 schema migration in `seven16-platform` (`customer_entitlements` + `appointment_attributions`) — BACKLOG #5
- `credit_consumption_rates` schema (BACKLOG #6) per D-014
- Enterprise+ state SKUs (D-015) — its own session
- `/api/stripe/checkout` extension for universal-credits + tier-pick + Charter-member-discount flow

---

## Cross-product implications

- **No schema, Stripe, or satellite changes this session.** Pure UI + palette swap. No DB writes, no migration files, no advisor runs needed.
- **DotIntel + DotAgencies cross-product:** the palette pattern (teal-700 anchor + intel-cyan + intel-dark flat tokens) is Agency-Signal-specific. DotIntel uses Tailwind v4 `@theme inline` with different anchors (per memory `feedback_nextjs_app_router_underscore_private.md` family). Don't propagate the `brand-* = #0F766E` swap there.
- **Partner Program standing reminder (Step 2.5)** carried into SESSION_28 prompt verbatim. Doctrine unchanged: parent hub at `partners.seven16group.com` (not yet built) owns referral / affiliate / commission. Agency Signal prepares only — no in-product partner system.

---

## Memory updates queued (not done this session)

- DECISION_LOG §4 BindLab amendment from SESSION_26 close — still queued; ~5-10 min doc edit when bandwidth allows.
- MEMORY.md consolidation pass — index entries running long, file at 27.1KB+ vs 24.4KB cap. Monthly sweep candidate.
- Optional `feedback_session27_workflow.md` capturing the "skip duplicate component / reuse existing" pattern (StatusChip → StatusPill judgment call) — only if it's a reusable lesson, otherwise skip.

---

## How to pick up the next thread

Next family-hub session opens with:
1. Read this handoff
2. Read [`docs/BACKLOG.md`](../BACKLOG.md) — active arc now "Session 28 — Intelligence Home + Vertical Intelligence"
3. Read [`docs/context/FAMILY_HEALTH.md`](../context/FAMILY_HEALTH.md) — refreshed at SESSION_27 close
4. Read [`docs/context/ENGINEERING_DOCTRINE.md`](../context/ENGINEERING_DOCTRINE.md) §"Front-end production standard (D-024)" — REQUIRED before any screen work
5. Open [`SESSION_28_PROMPT.md`](SESSION_28_PROMPT.md) for the paste-ready opener

**Recommended next move:** Start Session 28 Slice 1 — audit existing `/verticals` page + `components/marketing/VerticalCardsSection.tsx` (read-only, 0 writes) to confirm what survives from SESSION_26's marketing-side version. Slice 2 = NEW `/home` route scaffolding. Slice 3 = `VerticalOpportunityCard` primitive at `components/app/`. Slices 4-7 wrap surfaces + apply-on-touch D-024 cleanup + verify + commit.

---

## What I'd do if I were the next Claude opening this

**5-minute orientation:**
1. Read this handoff
2. `git log --oneline -3` → confirm HEAD at `0a8b2dc` (or whatever SESSION_27 close pushed)
3. Open https://directory.seven16group.com/saved-lists → scroll through, confirm chrome looks right (sidebar Agency Signal brand + 4 sections + active state + TopBar + PageHeader + 5 KPIs + DataTable)
4. `grep -rn "components/app" app components` → see what already imports the new primitives
5. Open `/verticals` page in browser → confirm it does NOT yet use AppShell + PageHeader (that's Session 28's job)

**Then:** start Session 28 per the prompt. The shell pattern is locked from Session 27 (per-page composition; pages render their own PageHeader + Breadcrumbs inside `<AppShell>`). Don't relitigate the architecture — apply it.

---

*End SESSION_27_HANDOFF — Sessions 27-32 epic 1 of 6 complete. Live HEAD `0a8b2dc` on main, deploy READY at directory.seven16group.com. Next active head: SESSION_28.*
