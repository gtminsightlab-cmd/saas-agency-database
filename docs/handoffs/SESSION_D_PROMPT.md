# SESSION_D — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-19 (end of Session C — Seven16 Group Support integration readiness shipped)
**Predecessor:** [`SESSION_C_PROMPT.md`](SESSION_C_PROMPT.md) (Session C work) + [`SESSION_B_HANDOFF.md`](SESSION_B_HANDOFF.md) (Texas DOI load)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com

---

## What changed since Session C close

**Session C SHIPPED 2026-05-19 evening** — Stage-1 Seven16 Group Support integration readiness for Agency Signal. 10 new files + 2 doc updates. Widget placeholder, lib helpers, 4 API stubs, full spec doc, CLAUDE.md awareness, cross-repo memory. Architecture rule locked: "support-INTEGRATABLE, not support-DEPENDENT." Build + lint smoke green.

Active arc reverts to **Sessions 27-32 epic / SESSION_28 (Intelligence Home + Vertical Intelligence redesign)** per the original plan — the next slice of Master O's CMO brief 2 (internal app redesign).

**Vertical Intelligence redesign is meaningfully stronger now:** Session B's Texas DOI load means `/verticals/[slug]` can show real state-level appointment density for the first time. `mv_vertical_summary` materialized view is the live data source.

---

## Session D = SESSION_28

The full opener for Session D is the original **[`SESSION_28_PROMPT.md`](SESSION_28_PROMPT.md)** — no changes needed. That doc covers:

- NEW `/home` authenticated dashboard route (KPI strip + recommended plays + recent activity + quick actions)
- Vertical Intelligence (`/verticals`) redesign with `VerticalOpportunityCard` (live data from `mv_vertical_summary`)
- `/verticals/[slug]` detail polish
- Add Home link to sidebar (now that route exists)
- Apply-on-touch D-024 cleanup on jsx-a11y errors flagged in SESSION_26 (`app/sign-up/form.tsx` + `app/global-error.tsx`)

Scope: ~6 hrs, ~18 files.

---

## Two small notes to fold into Session D

1. **TX appointment density.** `mv_vertical_summary` was last refreshed before Session B. Run `REFRESH MATERIALIZED VIEW mv_vertical_summary;` against `sdlsdovuljuymgymarou` early in Session D (or via the admin Refresh button if BACKLOG #9 ships first) so the new VerticalOpportunityCard pulls the 367k TX rows correctly. Spot-check that Transportation / Insurance verticals show the bump.

2. **Pre-existing lint debt surfaced during Session C build smoke.** 42 errors across ~10 files, all flagged in BACKLOG as apply-on-touch tech debt. Session D's planned apply-on-touch list (`app/sign-up/form.tsx` + `app/global-error.tsx`) covers ~3 of those 42. The remaining 39 are in `app/admin/*`, `app/build-list/*`, `app/analytics/*`, `app/verticals/[slug]/page.tsx` — left for whichever future session next touches each file. Also: `.claude/worktrees/intelligent-leavitt-9243ef/` is being lint-scanned (eslint.config.mjs ignore list doesn't cover it) — adding `.claude/**` to the ignores would suppress the duplicate errors at no risk. ~30 sec hygiene fix; recommend folding into Session D's apply-on-touch pass.

---

## Standing discipline (unchanged)

- Verify CWD = `C:\Users\GTMin\Projects\saas-agency-database\` before any writes
- Plan-before-execute: propose 5-10 bullet plan, wait for thumbs-up
- D-024 12-point DoD on every UI surface touched
- Apply-on-touch D-024 cleanup on any file edited
- Always recommend next path as CTO/PM
- Native git from canonical Projects path
- Secrets never in chat — clipboard → dashboard
- Architecture rule: support-INTEGRATABLE, not support-DEPENDENT (don't undo Session C scaffolding when wiring screens)

---

— end Session D prompt —
