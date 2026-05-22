# SESSION_H — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-22 (end of Session 31 — Data Coverage + Team chrome polish shipped + missing Session 30 handoff recovered)
**Predecessors:** Session 31 (commit `597520b` on `claude/session-30-recovery-D4xSt`; PR #2 draft awaiting merge) + [`SESSION_G_PROMPT.md`](SESSION_G_PROMPT.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com

---

## What changed since Session 30 close

**Session 31 SHIPPED 2026-05-22** — chrome polish on `/data-stats` + `/team`, plus the missing `SESSION_30_HANDOFF.md` was recovered onto a dedicated `claude/session-30-recovery-D4xSt` branch (parent Session 30 session went silent before close-out). 2 files + 1 handoff doc / +232 net lines.

Audit during Session 31 surfaced a **Path A descope** on `/methodology` + `/resources`: both are full marketing surfaces (hero design, dual-rendered for anonymous + authed) — they're NOT bare authed pages waiting for chrome. Stamping `<Breadcrumbs>` + `<PageHeader>` above their existing in-hero `<h1>` would clash with the marketing design and degrade the public-SEO surface. Same Path A pattern Session D locked for `/verticals` — preserve dual-purpose marketing surface; no app-chrome wrapper.

Active arc remains the Sessions 27-32 epic. **5 of 6 slices SHIPPED.** Next slice = **SESSION_32 — Admin polish (AdminSidebar dark + Master Control Room + System Health + Billing + Integrations).**

Pattern alert: **four consecutive sessions (28, 29, 30, 31) have come in 30-80% under the SESSION_*_PROMPT estimates after audit-first.** Same risk applies to Session 32 — read the actual admin code before locking the plan.

---

## Step 0 (BLOCKING): confirm PR #2 merge status

Recovery branch `claude/session-30-recovery-D4xSt` is two commits ahead of `main` and the PR is draft. Before any SESSION_32 writes:

1. Check PR #2: https://github.com/gtminsightlab-cmd/saas-agency-database/pull/2
2. If merged → proceed off `main`.
3. If still draft → ask Master O: "Merge PR #2 first, or land SESSION_32 on the same recovery branch?" Recommendation = merge first (cleaner audit trail).

Do not start SESSION_32 audit until the merge state is decided.

---

## Session H = SESSION_32 (per CMO brief 2 slice 6 of 6 — final epic slice)

**Goal:** Polish the admin surface — AdminSidebar dark variant + Master Control Room (`/admin`) + System Health (`/admin/system-health`) + Billing + Integrations (`/admin/integrations`) — to a distinct-but-coherent chrome bar that visually separates super-admin surfaces from the customer-facing app.

### Suggested slice plan (audit-first; SESSION_28/29/30/31 each came in 30-80% under prompt estimates)

1. **Audit all admin surfaces** (~45 min, 0 writes). Read:
   - `app/admin/page.tsx` (Master Control Room landing)
   - `app/admin/_shell/sidebar.tsx` + `_shell/topbar.tsx` (existing admin chrome — note: topbar carries 5 of the 11 pre-existing lint errors per SESSION_31 verification)
   - `app/admin/system-health/page.tsx`
   - `app/admin/integrations/page.tsx`
   - `app/admin/customers/page.tsx` + `[id]/page.tsx` (billing-adjacent)
   - `app/admin/usage/*` + `app/admin/alerts/page.tsx` (carries 1 Date.now() lint error)
   - `app/admin/hygiene/*` + `app/admin/verticals/*` + `app/admin/settings/page.tsx`

   Confirm which already use any admin shell + which use AppShell + which are bare. Three sessions in a row found ~50% of the planned primitives already in place — same risk here.

2. **AdminSidebar dark variant** (~60 min, 1 file new + 1 file refactor). The Tailwind `intel-dark` (#07111F) token added in SESSION_27 was specifically for this. Mirror the structure of `components/app/sidebar.tsx` but dark-themed; sections likely = (a) Operations (control room, system health, alerts), (b) Customers (customers, usage, billing), (c) Data (verticals, carriers, catalogs), (d) Integrations + Settings. Lock the section list with Master O before writing.

3. **Master Control Room (`/admin`)** (~60 min, ~2 files). PageHeader + Breadcrumbs. Likely needs a KPI strip — but use **MetricCard** not the bespoke `Stat` from /team since admin KPIs are 4-up (tenant count / active subscriptions / monthly revenue / system uptime). Source: pull from existing admin tables.

4. **System Health (`/admin/system-health`)** (~45 min, ~2 files). PageHeader + Breadcrumbs + MetricCard row (uptime / error rate / queue depth / last cron run). Likely has live data already; just wrap.

5. **Integrations (`/admin/integrations`)** (~45 min, ~1-2 files). PageHeader + Breadcrumbs. Cards or table for each family integration (Seven16 Support readiness already shipped per Session C; Stripe webhook health; Supabase edge function status). Don't fabricate integrations that don't exist — list only what's wired.

6. **Billing surface** (~45 min, ~1-2 files). Verify route first — may be `/admin/customers/[id]` (per-customer view) or a new `/admin/billing` route. PageHeader + Breadcrumbs + DataTable on invoices/subscriptions list. **Do NOT touch** Stripe webhook integration code — that's separate scope and lives behind the dashboard. Read-only view only.

7. **Apply-on-touch lint sweep** (~30 min). The 5× admin/topbar jsx-a11y errors + 1× admin/alerts Date.now() + 3× admin/hygiene + 1× admin/usage/limits-editor are all known. Sweep using the patterns from Session 29 (typed RpcRow interfaces) + Session D (`getServerNow()` helper module for Date.now). Should net the lint count to single digits (or zero, if /analytics/carriers is touched too).

8. **D-024 DoD + lint + build + commit + push + Vercel verify + SESSION_31 + 32 close-out** (~30 min). After SESSION_32 ships, the Sessions 27-32 epic is **DONE** — write a brief epic-close note in BACKLOG.md and FAMILY_HEALTH.md. Active arc flips back to whichever queued item Master O wants next (likely BACKLOG #1 — `/home` personalization v1 + redirect flip, or BACKLOG #2 — Quick Search 4-tab feature build).

---

## Carry-forwards from Sessions 28-31 (worth knowing in Session 32 planning)

1. **Quick Search 4-tab feature build still queued at BACKLOG #2.** Real product work, ~6-8 hrs. Not in Session 32 scope. Sequence after the epic closes; jump-queue if customer demos hinge.

2. **`/home` personalization v1 still queued at BACKLOG #1.** Sessions 27-32 epic finishes with SESSION_32; the redirect flip can land any time after as a small dedicated session.

3. **GitHub Dependabot still flagging 3 vulnerabilities** (1 high, 2 moderate). Pre-existing from SESSION_27. Standalone triage session needed.

4. **Audit-first pattern is now non-negotiable.** Four sessions in a row landed 30-80% under prompt estimates because the actual code held more (or different intent) than the prompt assumed. Treat SESSION_*_PROMPT.md estimates as ceilings, not floors. Read the code, then lock the plan.

5. **MetricCard vs bespoke inline cards** — sessions 31 (`/data-stats` 10-tile grid) and 30 (`/ai-support` 6-tile KpiCard) both kept purpose-built inline renders rather than consolidating to MetricCard. MetricCard is sized for 4-up dashboard rows with delta/icon/href slots. Use it for SESSION_32 admin dashboards where the 4-up fit applies; keep bespoke for denser grids.

6. **PR #2 merge sequencing** — confirm before SESSION_32 begins (Step 0 above).

---

## Standing discipline (unchanged)

- Verify CWD = `C:\Users\GTMin\Projects\saas-agency-database\` before any writes
- Plan-before-execute: audit first, propose 5-10 bullet plan, wait for thumbs-up
- D-024 12-point DoD on every UI surface touched
- Apply-on-touch D-024 cleanup on any file edited
- Always recommend next path as CTO/PM
- Native git from canonical Projects path
- Secrets never in chat — clipboard → dashboard
- Architecture rule still LOCKED: support-INTEGRATABLE not -DEPENDENT (Session C)
- Anti-slop: NO decorative buttons without onClick handlers; NO placeholder copy that promises features not yet built
- D-017 standing rule: NO source-attribution copy in directory.* surfaces

---

— end Session H prompt —
