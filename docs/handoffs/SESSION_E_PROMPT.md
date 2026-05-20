# SESSION_E — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-19 (end of Session D — SESSION_28 Path A shipped)
**Predecessor:** Session D (commit forthcoming on `main`) + [`SESSION_28_PROMPT.md`](SESSION_28_PROMPT.md) (original 6-slice epic plan)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com

---

## What changed since Session D close

**Session D SHIPPED 2026-05-19** — SESSION_28 delivered as Path A (preserved `/verticals` dual-purpose marketing surface; new `/home` route + `/verticals/[slug]` AppShell polish for authed users). 7 files, ~770 lines added. `mv_vertical_summary` refreshed mid-session and now reflects Session B's TX DOI data (Agriculture 11,149; Transportation 1,603). `eslint-plugin-react-hooks` is now wired into the flat config. Sidebar has a Home link. Brand link points to `/home`.

Active arc remains the Sessions 27-32 epic. **Slices 1 + 2 of 6 SHIPPED.** Next slice = **SESSION_29 — Build Recruit List Stepper + StickySummaryPanel + Recruit Lists table polish + SWR client-cache fold-in (~6 hrs, ~20 files).**

---

## Session E = SESSION_29 (per CMO brief 2 slice 3 of 6)

**Goal:** Bring the Build Recruit List workflow (`/build-list` + `/build-list/review` + `/build-list/download`) up to the same chrome + D-024 bar as Recruit Lists (SESSION_27) and `/home` (Session D). Also polish the Recruit Lists table inside the new chrome. Fold SWR client-cache wiring into the Stepper as you go (the AS Session 5 Option A deferred item is most naturally implemented here).

### Suggested 9-slice plan (~6 hrs, ~20 files)

1. **Audit the existing Build Recruit List flow** (~20 min, 0 writes). Read `app/build-list/page.tsx` + `app/build-list/review/page.tsx` + `app/build-list/download/page.tsx` + `app/build-list/review/save-button.tsx`. Note where the existing 9-query reference-data loader (`lib/cache/build-list-refs.ts`) is consumed; map out the multi-step form's current shape (likely a single long form vs. proper stepper).

2. **NEW `<Stepper>` primitive** (~30 min, 1 file). `components/app/stepper.tsx`. Numbered step indicator with current/completed/upcoming states. Per D-024: aria-current="step" on active; semantic ordered list; keyboard navigable. Lives alongside other `components/app/*` primitives shipped Session 27.

3. **NEW `<StickySummaryPanel>` primitive** (~30 min, 1 file). `components/app/sticky-summary-panel.tsx`. Right-rail container that shows running KPI counts (matched agencies / matched contacts / verified emails) as the user toggles filters. Position: `lg:sticky lg:top-20`. Mobile: collapses to a bottom sheet OR is hidden behind a "Show summary" button (judgment call: simpler = hide on mobile, surface inline preview only).

4. **`/build-list` page redesign** (~75 min, ~3 files). Wrap in `<AppShell>` + `<PageHeader title="Build Recruit List" actions={Save / Reset}/>` + `<Stepper>` (3-4 steps: Targeting → Filters → Geography → Review). Split the form into step-scoped sub-components. Keep the existing reference-data loader unchanged.

5. **`/build-list/review` page redesign** (~60 min, ~2 files). Wrap in AppShell + Breadcrumbs (`Home > Build Recruit List > Review`) + PageHeader. Add MetricCard row (total agencies / contacts / verified emails / writing companies represented). Wrap the agencies table in `<DataTable>` chrome with loading/empty/error states.

6. **`/build-list/download` page polish** (~45 min, 1 file). Same chrome treatment. Add post-download confirmation toast (sonner) + clear next-step CTA.

7. **`/saved-lists` polish (already shipped Session 27; quick D-024 sweep)** (~20 min, 1 file). Add Breadcrumbs (`Home > Recruit Lists`). Spot-check the existing table chrome — Session 27 used the new primitives, so this should be mostly a no-op + lint pass.

8. **SWR client-cache fold-in** (~45 min, ~3 files). Install `swr` (~5KB), wrap the Build Recruit List data loaders + Recruit Lists table fetcher in `useSWR` with revalidateOnFocus + manual refresh handlers. Note: only the client-component pieces need this — server components stay as-is.

9. **D-024 DoD walk + lint + build + commit + push + Vercel verify + SESSION_F_PROMPT** (~45 min). Apply-on-touch sweep on any `@typescript-eslint/no-explicit-any` rule-not-found errors flagged in the touched files (8 currently — most in build-list). Commit `feat(d-024,intel-app): Build Recruit List Stepper + StickySummaryPanel + SWR (Session 29)`. SESSION_F = SESSION_30 (Exports + Agency Search 4-tab + AI Research Assistant).

---

## Three small carry-forwards from Session D

1. **Per-route error.tsx boundaries.** `/home` and `/verticals/[slug]` rely on `app/global-error.tsx` for error catch (now with `lang="en"` after Session D's apply-on-touch fix). If Session 29 adds client-side interactions to `/build-list`, consider per-route `error.tsx` boundaries with retry buttons.

2. **`/home` redirect on sign-in (deferred from Session D).** `auth/callback` still redirects to `/build-list`. Recommend flipping to `/home` once Session D has been in production for a week with no edge-case reports on the Recent Recruit Lists section. Trivial 1-line change.

3. **8 pre-existing `@typescript-eslint/no-explicit-any` rule-not-found lint errors.** All in files Session 29 will touch (`build-list/*`, `analytics/carriers`, `verticals/[slug]`, `verticals/[slug]/save-button`). Apply-on-touch policy: either install `@typescript-eslint/eslint-plugin` + wire to flat config (~30 min), or just remove the eslint-disable directives that reference the missing rule. Fold into slice 9.

---

## Two flags for the next session's radar

1. **`react-hooks/set-state-in-effect` is now active.** It already caught a new error in `app/admin/verticals/[slug]/manager.tsx:40` (Session D suppressed only the sign-up form one). That's a real anti-pattern that should be refactored when admin/verticals is next touched.

2. **`@typescript-eslint/no-explicit-any` plugin is NOT installed** but multiple files reference it via eslint-disable directives. Either install the plugin + add `recommended` config, or sweep the directives. Cost-benefit: installing the plugin will turn on dozens of TS-style rules across the codebase, likely surfacing 50-100+ new errors. Recommend the directive-sweep path unless we're committing to a broader TypeScript-strict pass.

---

## Standing discipline (unchanged)

- Verify CWD = `C:\Users\GTMin\Projects\saas-agency-database\` before any writes
- Plan-before-execute: propose 5-10 bullet plan, wait for thumbs-up
- D-024 12-point DoD on every UI surface touched
- Apply-on-touch D-024 cleanup on any file edited
- Always recommend next path as CTO/PM
- Native git from canonical Projects path
- Secrets never in chat — clipboard → dashboard
- Architecture rule still LOCKED: support-INTEGRATABLE not -DEPENDENT (Session C); don't undo by accident when wiring screens

---

— end Session E prompt —
