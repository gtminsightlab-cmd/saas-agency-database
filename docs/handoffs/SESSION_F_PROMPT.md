# SESSION_F — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-20 (end of Session 29 — Build Recruit List chrome polish shipped)
**Predecessors:** Session 29 (commit forthcoming on `main`) + [`SESSION_E_PROMPT.md`](SESSION_E_PROMPT.md) (Session 29 opener)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com

---

## What changed since Session 29 close

**Session 29 SHIPPED 2026-05-20** — Build Recruit List flow polished. 8 files, ~115 net lines added. Lint 20 → 11 (-9; zero in touched files). Scope landed 30% under SESSION_E_PROMPT estimate after audit revealed existing primitives in place. SWR client-cache fold-in deferred — no client-side fetcher in current architecture benefits.

Active arc remains the Sessions 27-32 epic. **3 of 6 slices SHIPPED.** Next slice = **SESSION_30 — Exports + Agency Search (4 tabs) + AI Research Assistant (~6 hrs, ~22 files per original plan).**

---

## Session F = SESSION_30 (per CMO brief 2 slice 4 of 6)

**Goal:** Polish the 3 remaining intelligence surfaces — Exports (`/downloads`), Agency Search (`/quick-search`), and AI Research Assistant (`/ai-support`) — to the same chrome + D-024 bar as /home, /verticals, /saved-lists, /build-list (Sessions 27-29).

### Suggested slice plan (audit first before locking; SESSION_29 showed the estimates can be over by 30%)

1. **Audit all 3 surfaces** (~30 min, 0 writes). Read app/downloads/page.tsx + app/quick-search/page.tsx + app/ai-support/page.tsx + app/ai-support/search-form.tsx + any related row-actions/sub-components. Confirm which already use AppShell + which are missing PageHeader/Breadcrumbs. SESSION_29 audit revealed half the original scope was already done — same risk here.

2. **`/downloads` chrome** (~45 min, ~2 files). Breadcrumbs (Home → Exports), PageHeader, MetricCard row (Available downloads / Used this period / Total exports). DataTable wrap on the list of past exports.

3. **`/quick-search` Agency Search 4-tab redesign** (~90 min, ~4 files). Breadcrumbs (Home → Agency Search), PageHeader, sticky search bar. Tabs: Agencies / Contacts / Carriers / Verticals (per CMO brief 2 — may need to confirm 4-tab scope hasn't drifted). Result lists use DataTable chrome. SWR fold-in here is more natural than in /build-list because /quick-search is genuinely interactive (typing → debounced search → live results).

4. **`/ai-support` AI Research Assistant chrome** (~60 min, ~3 files). Breadcrumbs (Home → AI Research Assistant), PageHeader, conversation transcript inside a `<DataTable>`-style container, suggested-query chips, input textarea. D-024 client-side interactions need loading/error/retry handling.

5. **Apply-on-touch lint sweep** (~30 min, ~3 files). Most touched files have pre-existing `@typescript-eslint/no-explicit-any` rule-not-found directives; sweep using the typed-interface pattern from Session 29 (`AgencyRpcRow`/`ContactRpcRow` shapes; can hoist to a shared file like `lib/types/rpc.ts` if used by 3+ pages).

6. **D-024 DoD + lint + build + commit + push + Vercel verify + SESSION_G_PROMPT** (~45 min). SESSION_G = SESSION_31 (Data Coverage + Methodology + Resources + Team — ~5 hrs / ~15 files).

---

## Carry-forwards from Session 29 (worth surfacing in Session 30 planning)

1. **SWR client-cache fold-in becomes most natural in `/quick-search`.** That page is genuinely interactive (live typing → debounced search). Wrapping the fetcher in `useSWR` with `revalidateOnFocus: false` (because searches shouldn't auto-refetch on focus) + a stable cache key is the right pattern. Install `swr` as part of Session 30 slice 3.

2. **Generic `<Stepper>` extraction still deferred.** Only `/build-list` uses one. If Session 30's AI Research Assistant ends up wanting a "Query → Results → Refinement" stepper, extract then.

3. **Generic `<StickySummaryPanel>` still deferred.** RecordsCounter (top-sticky) is the de-facto pattern; right-rail variant only worth extracting if Session 30 has a use case.

4. **Shared `lib/types/rpc.ts` file** — Session 29 defined `AgencyRpcRow` + `ContactRpcRow` + `CarrierRpcRow` inline per page. If Session 30 needs them too, hoist to a shared file. The interfaces are stable (driven by the RPC contracts, not the consuming pages).

5. **8 explicit-any directives still queued in 1 untouched file** — `app/analytics/carriers/page.tsx:59`. Sweep when next touched (Session 30 may touch it if Agency Search 4-tab includes a Carriers tab).

---

## Three flags for the next session's radar

1. **/home redirect flip still queued at BACKLOG #1** as Session 29.5. Not done yet; Sessions 27-32 epic still has slices 4-6 to ship first. Reconsider sequencing if user feedback suggests the dashboard-first flip should jump the queue.

2. **`react-hooks/set-state-in-effect` rule is active and catching real issues.** Session 29 didn't trip any new violations, but the rule continues to flag pre-existing patterns. If Session 30's AI Research Assistant uses `useEffect` heavily for streaming/typing UX, design carefully — prefer event handlers (see Flag 2 refactor pattern in `manager.tsx`).

3. **GitHub Dependabot still shows 3 vulnerabilities (1 high, 2 moderate).** Pre-existing from SESSION_27 close. Standalone triage session needed when bandwidth allows.

---

## Standing discipline (unchanged)

- Verify CWD = `C:\Users\GTMin\Projects\saas-agency-database\` before any writes
- Plan-before-execute: audit first, propose 5-10 bullet plan, wait for thumbs-up (SESSION_29 demonstrated audit-first saves 30%+ scope)
- D-024 12-point DoD on every UI surface touched
- Apply-on-touch D-024 cleanup on any file edited
- Always recommend next path as CTO/PM
- Native git from canonical Projects path
- Secrets never in chat — clipboard → dashboard
- Architecture rule still LOCKED: support-INTEGRATABLE not -DEPENDENT (Session C)
- Anti-slop: NO decorative buttons without onClick handlers; NO placeholder copy that promises features not yet built

---

— end Session F prompt —
