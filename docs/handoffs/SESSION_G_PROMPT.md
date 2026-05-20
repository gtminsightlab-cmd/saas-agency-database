# SESSION_G — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-20 (end of Session 30 — Exports/Agency Search/AI Research chrome polish shipped)
**Predecessors:** Session 30 (commit forthcoming on `main`) + [`SESSION_F_PROMPT.md`](SESSION_F_PROMPT.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com

---

## What changed since Session 30 close

**Session 30 SHIPPED 2026-05-20** — chrome polish on `/downloads`, `/quick-search`, `/ai-support`. 3 files, ~2.5 hrs. Audit revealed the SESSION_F_PROMPT "4-tab Agency Search" was a feature build mistaken for chrome polish; descoped to a separate ~6-8 hr session queued at BACKLOG #2. Also caught + fixed a stale page title ("AI Support" → "AI Research Assistant" matching the SESSION_27 sidebar rename).

Active arc remains the Sessions 27-32 epic. **4 of 6 slices SHIPPED.** Next slice = **SESSION_31 — Data Coverage + Methodology + Resources + Team (~5 hrs, ~15 files per CMO brief 2).**

Pattern alert: three consecutive sessions (28, 29, 30) have come in 30-65% under the SESSION_*_PROMPT.md estimates after audit-first. Same risk applies to Session 31 — read the actual code before locking the plan.

---

## Session G = SESSION_31 (per CMO brief 2 slice 5 of 6)

**Goal:** Polish the 4 remaining trust + reference surfaces — Data Coverage (`/data-stats`), Methodology (`/methodology`), Resources (`/resources`), Team (`/team`) — to the same chrome bar as the rest of the authed app.

### Suggested slice plan (audit-first; don't lock until you see the actual code)

1. **Audit all 4 surfaces** (~30 min, 0 writes). Read `app/data-stats/page.tsx`, `app/methodology/page.tsx`, `app/resources/page.tsx`, `app/team/page.tsx`. Confirm which already use AppShell, PageHeader, Breadcrumbs. Three sessions in a row found ~50% of the planned primitives already in place — same risk here.

2. **`/data-stats` chrome** (~30 min, ~1 file). Likely needs Breadcrumbs + PageHeader. May or may not need MetricCard row depending on existing structure. Per D-023 / D-017, **no source-attribution copy** in directory.* — keep that rule in mind if Data Coverage shows vendor lineage.

3. **`/methodology` chrome** (~30 min, ~1 file). Breadcrumbs + PageHeader. This page is anonymous-readable per the public-SEO surfaces decision in SESSION_27 / SESSION_28 Path A — may be dual-purpose like `/verticals`. Watch for the same "preserve marketing content for anonymous" pattern (Path A win from Session D).

4. **`/resources` chrome** (~30 min, ~1 file). Breadcrumbs + PageHeader. Likely a card grid of external links / downloadable PDFs / docs.

5. **`/team` chrome** (~30 min, ~1 file). Breadcrumbs + PageHeader + DataTable wrap on the team-members list. Existing seat-invitation flow (per AS Session 9 / migration 0055) shouldn't be touched — only chrome.

6. **Apply-on-touch lint sweep** (~30 min, ~3 files at most). The `analytics/carriers/page.tsx:59` explicit-any directive is the only known queued one; touch only if Session 31 visits that file.

7. **D-024 DoD + lint + build + commit + push + Vercel verify + SESSION_H_PROMPT** (~30 min). SESSION_H = SESSION_32 (Admin polish — AdminSidebar dark + Master Control Room + System Health + Billing + Integrations).

---

## Carry-forwards from Session 30 (worth knowing in Session 31 planning)

1. **Quick Search 4-tab feature build queued at BACKLOG #2.** Real product work, ~6-8 hrs. Not in Session 31 scope. Decision point: sequence after Session 32 (chrome epic closes first) or jump the queue if customer demos hinge on it. Currently sequenced after Session 32.

2. **SWR client-cache fold-in still queued.** Lives most naturally in the Quick Search 4-tab build. Other sessions in the epic don't have live client fetchers to wrap.

3. **`/home` redirect flip still queued at Session 29.5.** Sessions 27-32 epic still has slices 5-6 to ship first. Reconsider sequencing only if user feedback suggests the dashboard-first flip should jump the queue.

4. **GitHub Dependabot still flagging 3 vulnerabilities (1 high, 2 moderate).** Pre-existing from SESSION_27. Standalone triage when bandwidth allows.

5. **Audit-first pattern is now load-bearing.** Three sessions in a row landed 30-65% under prompt estimates because the actual code had primitives in place. Treat SESSION_*_PROMPT.md estimates as ceilings, not floors. Read the code, then lock the plan.

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
- D-017 standing rule: NO source-attribution copy in directory.* surfaces — applies especially to /data-stats if it shows vendor lineage

---

— end Session G prompt —
