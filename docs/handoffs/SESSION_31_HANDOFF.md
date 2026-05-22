# Family-Hub Session 31 — Data Coverage + Team chrome polish + Session 30 handoff recovery (2026-05-22)

**Date:** 2026-05-22
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `claude/session-30-recovery-D4xSt` — recovery branch carrying both the missing Session 30 handoff AND the Session 31 chrome polish work. **Not yet merged to main.**
**Predecessor:** [`SESSION_30_HANDOFF.md`](SESSION_30_HANDOFF.md) (also written this session) + [`SESSION_G_PROMPT.md`](SESSION_G_PROMPT.md) (Session 31 opener)
**HEAD at session open:** `33a17f7` (post-Session 30 docs sweep on main)
**HEAD at recovery-branch close:** `597520b` (Session 31 chrome polish commit)
**Commits added to recovery branch this session:** 2
- `4fcaba4` — docs(session-30): write missing exhaustive handoff (recovery)
- `597520b` — feat(d-024,intel-app): /data-stats + /team chrome polish (Session 31, partial)

**Live URL:** https://directory.seven16group.com — still at production `33a17f7` (recovery branch not merged yet; preview deploys exist for both recovery-branch commits).
**Open PR:** [#2](https://github.com/gtminsightlab-cmd/saas-agency-database/pull/2) (draft) — covers both commits on this branch.

---

## Theme

**Slice 5 of 6 in the Sessions 27-32 internal-app redesign epic** per Master O CMO brief 2 — plus a Working Agreement Rule 5 recovery for the parent Session 30 conversation that went silent before close-out. Brought the two remaining bare authed surfaces — Data Coverage (`/data-stats`) + Team (`/team`) — up to the same chrome bar as `/home` (Session D) + `/verticals/[slug]` (Session D) + `/build-list/*` (Session 29) + `/saved-lists` (Session 27) + `/downloads` + `/quick-search` + `/ai-support` (Session 30). 8 authed pages now ride on PageHeader + Breadcrumbs as of HEAD `597520b`.

**Big audit finding — Path A descope on `/methodology` + `/resources`:** both pages are full marketing surfaces (`/methodology` 869 lines, `/resources` 263 lines) with hero designs, dual-rendered using `<MarketingNav>` if anonymous or `<Sidebar>` wrap if authed (NOT `<AppShell>`). Stamping `<Breadcrumbs>` + `<PageHeader>` above their existing in-hero `<h1>` would clash with the marketing design and degrade the public-SEO surface. **Same Path A pattern Session D locked for `/verticals`** — preserve dual-purpose marketing surface; no app-chrome wrapper. Decision logged in commit message + carried into the SESSION_H_PROMPT for the next session.

Audit-first pattern continues to be load-bearing — fourth consecutive session where the actual code held more primitives (or different intent) than the prompt's estimate assumed. Sessions 28, 29, 30, 31 came in 30%, 30%, 65%, ~80% under their respective `SESSION_*_PROMPT.md` ceilings.

---

## What shipped

### Commit `4fcaba4` — Session 30 handoff recovery (1 file, +203/-0)

Wrote the missing [`docs/handoffs/SESSION_30_HANDOFF.md`](SESSION_30_HANDOFF.md). Closes the Working Agreement Rule 5 step that the parent Session 30 conversation didn't finish before going silent (~15 hr break that never resumed). Documents commit `b5519a4` (chrome polish on `/downloads` + `/quick-search` + `/ai-support`) + post-30 doc commits `e23de63` + `33a17f7`. Includes chronological log + scope-skipped rationale + D-024 12-point DoD walk + verification + queued follow-ups + cold-open guide for the next session.

### Commit `597520b` — Session 31 chrome polish (2 files, +29/-23)

**`/data-stats`** — [`app/data-stats/page.tsx`](../../app/data-stats/page.tsx)

- Wrapped in `<AppShell>` + `<Breadcrumbs items={[{ href: "/home", label: "Home" }, { label: "Data Coverage" }]}/>` + `<PageHeader title="Data Coverage" subtitle="Row counts across every catalog and data table. Refreshed live from the directory." />`.
- **Renamed visible page title "Data and Stats" → "Data Coverage"** to match the SESSION_27 sidebar rename. Same stale-label class as `/ai-support` → "AI Research Assistant" in Session 30 — the sidebar relabeled but the page `<h1>` didn't propagate.
- Kept the existing 10-tile KPI grid as-is: inline render with `text-3xl font-bold text-brand-600 tabular-nums` value treatment + `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` responsive layout. Purpose-built for the dense layout. Consolidating to `<MetricCard>` would lose the brand-600 color treatment (MetricCard uses neutral typography) + the 3-col compact rhythm (MetricCard is sized for 4-up dashboard rows with delta/icon/href slots that don't apply here).
- Dropped the inline `<h1>` + description `<p>` that PageHeader now owns.
- Other than the chrome wrap, the Supabase query (10 parallel `Promise.all` count queries) and the resulting `stats` array are untouched.

**`/team`** — [`app/team/page.tsx`](../../app/team/page.tsx)

- Wrapped in `<AppShell>` + `<Breadcrumbs items={[{ href: "/home", label: "Home" }, { label: "Team" }]}/>` + `<PageHeader title="Team" subtitle={seatSubtitle} />` where `seatSubtitle` = `"${seat.used} of ${seat.cap} seat${seat.cap === 1 ? "" : "s"} used${seat.plan_name ? \` · ${seat.plan_name} plan\` : ""}. Paid plans include the account owner plus up to 2 invited team members. Invitees sign in with their own login and inherit the same plan + tenant data."`.
- **Removed the `<Link href="/build-list">← Back</Link>` anti-slop link.** Sidebar (Session 27) handles navigation now. "Back" without history context is the same UI-lie class as decorative buttons without onClick handlers (per CLAUDE.md anti-slop rule).
- Dropped the now-unused `ArrowLeft` from the `lucide-react` import list.
- **Dropped a dead `owner` variable** that was defined as `const owner = rows.find((r) => r.invited_at === null);` but never referenced anywhere in the JSX. Apply-on-touch cleanup of pre-existing dead code. Confirmed orphan via grep before delete.
- Preserved the inline `<h1>` + seat-chip + description by absorbing all three into the PageHeader subtitle.
- **NOT TOUCHED:** `InviteForm`, `TeamRowActions`, the members table (`<table>` with header + body + `StatusPill` per row + invited-vs-active tinting), the 3-tile `<Stat>` strip (Active members / Pending invites / Seats remaining), the seat RPCs (`get_my_seat_info` + `list_my_team`), the upgrade gate (`!seat.has_active_plan` branch), the seat-cap exhausted branch (`remaining <= 0`), or the footer note. AS Session 9 / migration 0055 seat-invitation flow preserved end-to-end.

---

## Path A descope decision (logged in commit + carries into SESSION_H_PROMPT)

`/methodology` (869 lines) and `/resources` (263 lines) read very differently from the other authed pages:

| Quality | `/methodology` + `/resources` | Other authed pages |
|---|---|---|
| Layout root | Custom marketing layout with hero | `<AppShell>` |
| Anonymous render | `<MarketingNav isAuthed={false} />` at top | Redirect to sign-in |
| Authed render | Same body wrapped in `<Sidebar>` flex container | Inside `<AppShell>` |
| Existing `<h1>` | Inside hero gradient, design-integrated | Plain text below PageHeader (was) |
| Anonymous-readable purpose | YES — public-SEO marketing surface | NO |

Stamping `<Breadcrumbs>` + `<PageHeader>` on top would:
- Sit awkwardly above the gradient hero
- Compete visually with the in-hero `<h1>` ("How to identify target agencies by vertical" / "The case for targeted data over wide data")
- Degrade the public-SEO surface (anonymous users would see breadcrumbs pointing to a `/home` route they can't access)

**Decision:** descope. Preserve as-is. Same call Session D made for `/verticals`. No code change to either file.

This is NOT a permanent exclusion — if Master O later decides the authed-user experience of `/methodology` should have its own dashboard-style header that diverges from the anonymous marketing version, that's a Session 32+ scope question and a different design move (probably a new component primitive that adapts).

---

## D-024 12-point DoD verification on the 2 polished surfaces

| Point | `/data-stats` | `/team` |
|---|---|---|
| Loading | ✓ Server-rendered (10 parallel Supabase counts via `Promise.all`) | ✓ Server-rendered (2 RPCs via `Promise.all`) |
| Empty | n/a (10 fixed-label tiles always render with `count ?? 0`) | ✓ `{rows.length === 0 && <No members yet>}` row in members table |
| Error | ✓ `?? 0` fallback on every count | ✓ `(seatRows as SeatInfo[] | null)?.[0] ?? <fallback>` shape |
| Retry | ✓ Page-level reload (server-rendered) | ✓ Page-level reload + Invite form has its own retry on action error |
| Success | ✓ Rows render | ✓ Invite/revoke flows fire sonner toasts (unchanged from AS Session 9) |
| Mobile | ✓ `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` on KPI grid | ✓ `grid gap-3 md:grid-cols-3` on stat strip; table inside `overflow-hidden` rounded card |
| Keyboard | n/a (no interactive elements beyond AppShell + sidebar) | ✓ Invite button + TeamRowActions are native `<button>` / `<a>` |
| Screen readers | ✓ Breadcrumbs nav landmark + PageHeader h1 | ✓ Breadcrumbs nav landmark + PageHeader h1 |
| Partial data | ✓ All 10 counts default `?? 0` | ✓ Owner branch handled separately from invitee role; `r.full_name || r.email.split("@")[0]` fallback |
| Slow connection | ✓ Server-rendered above-the-fold | ✓ Server-rendered above-the-fold |
| User leaving mid-request | ✓ No client mutations | ✓ Existing InviteForm + RowActions cleanup unchanged |
| Malformed response | ✓ `count ?? 0` everywhere | ✓ `(teamRows ?? []) as TeamRow[]` shape |

---

## Verification

- **`npm run lint`** — stayed at 11 errors (no new; no Session 31 files in the error list). Pre-existing breakdown:
  - 5× `app/admin/_shell/topbar.tsx` (jsx-a11y on click handlers + autoFocus)
  - 1× `app/admin/alerts/page.tsx:49` (`Date.now()` purity violation)
  - 3× `app/admin/hygiene/email-domain-editor.tsx` (label-has-associated-control + autoFocus)
  - 1× `app/admin/usage/[tenantId]/limits-editor.tsx` (label-has-associated-control)
  - 1× `app/analytics/carriers/page.tsx:59` (explicit-any directive)

  All pre-existing; most are admin-page issues that SESSION_32 will encounter naturally as apply-on-touch.
- **`npm run build`** — ✓ Compiled successfully 14.0s. `/data-stats` + `/team` both register clean as dynamic functions. All 50+ routes register.
- **D-024 12-point DoD** — pass on both polished surfaces (table above).
- **Behavior preserved** — Supabase count queries on `/data-stats`; full seat-invitation flow on `/team` (invite + revoke + upgrade gate + cap exhausted branch).
- **GitHub PR #2** — opened draft 2026-05-22 12:54 UTC. Vercel preview check on `4fcaba4` (Session 30 handoff) READY at 12:55 UTC. Build on `597520b` (Session 31 polish) pending at handoff write time.

---

## Commits this session (chronological)

| Commit | Title | Files | Net |
|---|---|---|---|
| `4fcaba4` | docs(session-30): write missing exhaustive handoff (recovery) | 1 | +203/-0 |
| `597520b` | feat(d-024,intel-app): /data-stats + /team chrome polish (Session 31, partial) | 2 | +29/-23 |

2 commits on `claude/session-30-recovery-D4xSt`. Branch ahead of `main` by 2; behind by 0. **Awaiting merge** — PR #2 is draft.

---

## What's NOT done — queued for next session

### 🟡 Sessions 27-32 epic — final slice

| Session | Scope | Files | Output |
|---|---|---|---|
| **32 Admin polish** (next) | AdminSidebar (dark variant) + Master Control Room (`/admin`) + System Health (`/admin/system-health`) + Billing (under `/admin/customers` or its own route) + Integrations (`/admin/integrations`). Per CMO brief 2 slice 6. Audit-first — admin pages have known pre-existing lint debt that SESSION_32 will fold in via apply-on-touch (see verification section above). | ~25 | Polished control room |

Paste-ready opener: [`SESSION_H_PROMPT.md`](SESSION_H_PROMPT.md).

### 🟠 Recovery-branch merge

PR #2 is draft. Two paths to ship:
1. **Merge PR #2 into main** before opening SESSION_32 — clean main-tracking, single arc.
2. **Land SESSION_32 commits on the same branch** + merge once SESSION_32 wraps. Simpler PR review (one mega-arc PR), but mixes two epic slices in one merge.

**Recommendation:** Option 1. Merge PR #2 once Master O has skimmed; open SESSION_32 against a fresh branch off main. Cleaner audit trail; smaller blast radius if a SESSION_32 issue surfaces later.

### 🟠 BACKLOG queue (unchanged from Session 30)

- **BACKLOG #1 — Session 29.5 `/home` personalization v1 + post-login redirect flip** (~2-3 hrs, ~4 files). Sequencing unchanged: gate the `/build-list` → `/home` flip until user-scoped Signals + first-time empty state land.
- **BACKLOG #2 — Quick Search 4-tab feature build** (~6-8 hrs, ~10-15 files). Sequenced after Session 32 closes; jump-queue if customer demos hinge.

### 🟢 Side findings (not session-introduced)

- **GitHub Dependabot still flagging 3 vulnerabilities** (1 high, 2 moderate). Pre-existing from SESSION_27 close. Standalone triage session needed.
- **5 of 11 pre-existing lint errors are in `app/admin/*`** — SESSION_32 will encounter them naturally. Apply-on-touch will resolve as part of admin chrome polish.

### 🔴 Still pending Master O dashboard actions (carried from SESSION_25 → ...)

1. **CRON_SECRET in Vercel production env**
2. **Stripe webhook endpoint registration**
3. **Sentry org token rotation**

(Unchanged from SESSION_30 handoff. None are session-blocking.)

---

## Cross-product implications

- **No schema, Stripe, or satellite changes this session.** Pure UI chrome + dead-code apply-on-touch cleanup. No DB writes, no migration files, no advisor runs needed.
- **DotIntel + DotAgencies cross-product:** unchanged from SESSION_27/30 — the chrome primitives are Agency-Signal-specific and ride on the `brand-*` palette swap from SESSION_27. Don't propagate.
- **Partner Program standing reminder** — carried forward verbatim into SESSION_H_PROMPT.

---

## Memory updates queued (not done this session)

- None new from Session 31. Prior queued items (DECISION_LOG §4 BindLab amendment, MEMORY.md consolidation) all remain queued.

---

## How to pick up the next thread

Next family-hub session opens with:
1. Read this handoff
2. Read [`docs/BACKLOG.md`](../BACKLOG.md) — active arc now "Sessions 27-32 epic — 5 of 6 SHIPPED; SESSION_32 next"
3. **Verify PR #2 status:** if merged to main, proceed off main; if not, ask Master O whether to merge now or land SESSION_32 on the same recovery branch.
4. Read [`docs/context/ENGINEERING_DOCTRINE.md`](../context/ENGINEERING_DOCTRINE.md) §"Front-end production standard (D-024)" — REQUIRED before any screen work
5. Open [`SESSION_H_PROMPT.md`](SESSION_H_PROMPT.md) for the paste-ready opener

**Recommended next move:** Confirm PR #2 merge status first. Then start SESSION_32 audit (~45 min, 0 writes). Read `app/admin/page.tsx` + `app/admin/system-health/page.tsx` + `app/admin/integrations/page.tsx` + `app/admin/_shell/sidebar.tsx` + `app/admin/_shell/topbar.tsx` + any billing/customers admin surfaces. Confirm which already use `AdminShell` / which are missing PageHeader/Breadcrumbs / what dark-variant treatment looks like. Pre-existing lint errors in admin files are the apply-on-touch backlog for SESSION_32.

Watch for these per-page nuances in SESSION_32:
- **AdminSidebar dark variant** — per CMO brief 2, admin gets a darker chrome to visually distinguish from customer surfaces. Tailwind `intel-dark` (#07111F) was added in SESSION_27 specifically for this. The light AppSidebar shipped in Session 27 stays unchanged; this is a sibling component.
- **Master Control Room (`/admin`)** — the existing landing page may be bare. Look for an "admin home" pattern similar to `/home` (Session D), but with super-admin-only KPIs (tenant counts / usage / system health / billing health).
- **System Health (`/admin/system-health`)** — likely needs MetricCard row + status surfaces.
- **Billing** — verify route. May be `/admin/customers` extension or a new `/admin/billing` route. Don't touch any Stripe webhook integration code; that's separate scope.
- **Integrations (`/admin/integrations`)** — likely a panel showing which family-product integrations are wired (Seven16 Support, etc.). Don't fabricate integrations that don't exist.

---

## What I'd do if I were the next Claude opening this

**5-minute orientation:**
1. Read this handoff + the SESSION_30 handoff
2. `git log --oneline -7` → confirm HEAD on main is either `597520b` (if PR #2 merged) or `33a17f7` (if not yet merged; recovery branch still has the work)
3. `gh pr view 2` or equivalent — check PR #2 merge status
4. Open https://directory.seven16group.com/data-stats + `/team` → confirm chrome looks right (Breadcrumbs + PageHeader + new "Data Coverage" title)
5. `grep -rn "import.*PageHeader" app | sort` → 10 pages should now use it (8 from Session 30 + `/data-stats` + `/team`)
6. Open https://directory.seven16group.com/admin → see current admin surface state before scoping SESSION_32

**Then:** start SESSION_32 per the prompt. Audit-first remains load-bearing — 4 sessions in a row delivered well under prompt estimates because the actual code held more (or different) than the prompt assumed.

---

*End SESSION_31_HANDOFF — Sessions 27-32 epic 5 of 6 complete. Recovery branch HEAD `597520b`, PR #2 draft, awaiting merge. Next active head: SESSION_32 (Admin polish). Audit-first pattern remains non-negotiable.*
