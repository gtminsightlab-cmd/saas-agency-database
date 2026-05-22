# BACKLOG #2 — Quick Search 4-tab feature build plan

**Date:** 2026-05-22 (drafted parallel to BACKLOG #1 ship)
**Status:** **READY TO START** — audit complete, all RPC dependencies exist, paste-ready as session opener whenever Master O greenlights
**Scope estimate:** ~6-8 hrs (audit-first pattern says likely 4-5 hrs)
**Source:** Session 30 audit — `/quick-search` currently a placeholder form, not a real 4-tab search; CMO brief 2 calls for cross-entity search across Agencies / Contacts / Carriers / Verticals

---

## Why now

`/quick-search` is the most-used surface in the authenticated app per the sidebar position + sub-nav routing analysis, but it currently shows a 6-field placeholder form with a **disabled Search button**. This is the largest remaining slop surface after Sessions 27-32 epic close. Real-product build that:

1. Replaces a disabled stub with a working feature
2. Becomes a referenceable demo surface for prospects (4-tab cross-entity search is a competitive table-stakes feature for ZoomInfo / Apollo / Cognism)
3. Closes the SWR client-cache fold-in deferred from AS Session 5 Option A (`/quick-search` is the most natural insertion point because typing → debounced → live results is genuinely interactive)

---

## Audit findings (read-only, completed 2026-05-22)

### Current state of `/quick-search`

- `app/quick-search/page.tsx` — chrome-polished in Session 30 (AppShell + Breadcrumbs + PageHeader). Renders a `<RecordsCounter>` (live KPI strip with 3 counts) + `<QuickSearchForm>` (the placeholder form).
- `app/quick-search/form.tsx` — 6-field contact-centric form (Email / Mobile / Name / Domain / Department multi-select / Title multi-select) with **disabled Search button** + tooltip "Available after contact records are loaded."
- The form's filters target CONTACT attributes, not the 4-tab cross-entity search BACKLOG #2 calls for. This file will likely be **replaced wholesale**, not extended.

### Existing RPC surface (all already shipped — no new migrations needed for v1)

| RPC | File | Purpose | v1 use |
|---|---|---|---|
| `search_agencies_for_filters` | migration 0064 | Server-side paginated search with 24 optional filter params + `p_account_name` text contains + sort + offset/limit + window-function `total_count` | **Agencies tab.** Pass typed query as `p_account_name`. Server pagination from day 1. |
| `search_contacts_for_filters` | migration 0066 | Same shape, returns contact rows with `agency_id` + `agency_name` joined | **Contacts tab.** Pass typed query as `p_account_name` for company-name match OR build a separate variant for first/last name match (see Open Questions). |
| `list_carriers_with_appointments` | migration 0046 | No params, returns all ~2,000 active carriers with appointment counts (SECURITY DEFINER + STABLE) | **Carriers tab.** Client-side filter on `name` + `group_name`. Cache once per session via SWR. |
| `mv_vertical_summary` | (existing MV) | All 12 verticals + agency_count + contact_count + carrier_count | **Verticals tab.** Already cached via `lib/cache/build-list-refs.ts`. Client-side filter on `name`. |

### Volume check (informs pagination strategy)

- Agencies: 58,490 (server pagination required) ← `p_offset` / `p_limit` already in RPC
- Contacts: 135,453 (server pagination required) ← `p_offset` / `p_limit` already in RPC
- Carriers: 2,007 (client-side filter fine; single SWR fetch with `revalidateOnFocus: false` + ~1 hr TTL)
- Verticals: 12 (client-side trivial; reuse existing `getVerticalsSummary` cache)

### What's missing — none for v1

Every RPC needed already exists. No new migrations. No new SECURITY DEFINER functions. Just glue UI.

---

## Suggested slice plan

Audit-first will likely shrink this further once we start coding. The 5 sessions prior to this came in 30-85% under their respective prompt estimates — read the actual code at session start before locking the writes.

### Slice 1 — Tab shell + URL state model (~45 min, ~2 files)

- New `app/quick-search/search-shell.tsx` (client component) — wraps the 4 tabs + URL-state machine
- Reads `?q=`, `?tab=agencies|contacts|carriers|verticals`, `?sort=`, `?dir=`, `?page=` from `useSearchParams`
- Each tab persists its own sort + page state in the URL (per-tab keys to avoid collision: `?aSort=name&aDir=asc&aPage=1&cSort=last_name&cDir=asc&cPage=1`)
- Tabs render as `<nav role="tablist">` with `<button role="tab" aria-selected>` — full keyboard nav per WAI-ARIA Tab pattern

### Slice 2 — Debounced search input + cleanup (~30 min, ~1 file)

- Replace the `<QuickSearchForm>` import in `app/quick-search/page.tsx` with the new `<SearchShell>` server-component wrapper
- Sticky search bar at top: single text input + `useDebouncedValue(query, 300ms)` hook
- "Clear" button + ⌘K keyboard shortcut to focus
- **Delete** `app/quick-search/form.tsx` (placeholder, no longer needed)

### Slice 3 — Agencies tab (~60 min, ~2 files)

- `app/quick-search/_tabs/agencies-tab.tsx` (client component, uses SWR)
- Fetcher hits `search_agencies_for_filters` with `{ p_account_name: query, p_account_name_mode: 'contains', p_sort, p_dir, p_offset, p_limit: 25 }`
- Renders `<DataTable>` chrome with: Name / Type / Location / Revenue (when populated) / Carriers (count) / Score
- Pagination: window-function `total_count` from RPC drives Prev/Next buttons + page count
- SWR config: `keepPreviousData: true`, `revalidateOnFocus: false`, cache key `["agencies", q, sort, dir, page]`

### Slice 4 — Contacts tab (~60 min, ~2 files)

- `app/quick-search/_tabs/contacts-tab.tsx` (client component, uses SWR)
- Same pattern as agencies-tab; calls `search_contacts_for_filters` with `p_account_name`
- Renders contacts with: Name / Title / Email / Mobile / Agency / Location
- Note on `p_account_name` for contacts: it filters by **agency name** (the contact's company). If first/last name search is needed, see Open Question #1.

### Slice 5 — Carriers tab (~45 min, ~2 files)

- `app/quick-search/_tabs/carriers-tab.tsx` (client component)
- Fetcher hits `list_carriers_with_appointments` ONCE per session (no query param — RPC returns full set)
- Client-side filter on `name` + `group_name` matching the debounced query (case-insensitive `.includes`)
- Sort by appointment_count desc by default; toggle to name asc
- Renders: Carrier name / Parent group / Appointments / Verticals (badges from `mv_vertical_summary` join — server-side compute)

### Slice 6 — Verticals tab (~30 min, ~1 file)

- `app/quick-search/_tabs/verticals-tab.tsx` (client component)
- Reuses `getVerticalsSummary` cache (already 1-hr TTL)
- Client-side filter on `name`
- Renders existing `<VerticalOpportunityCard>` primitive (from Session D) in a 2-column grid
- Each card already deep-links to `/verticals/[slug]` (no new wiring)

### Slice 7 — Empty / loading / error states per tab (~30 min, applied across all 4 tabs)

- `<DataTable state="loading">` skeleton on initial fetch
- `<DataTable state="empty">` per tab when 0 results:
  - Agencies: "No agencies match. Try a broader query or check spelling."
  - Contacts: "No contacts match. Try searching by agency name."
  - Carriers: "No carriers match." (rare given the small set)
  - Verticals: "No vertical matches \"{q}\"." (essentially impossible with 12 verticals)
- `<DataTable state="error">` on RPC failure with retry button (server action re-fetches)

### Slice 8 — Apply-on-touch D-024 cleanup (~15 min)

- Any pre-existing lint errors in files touched → swept in same commit
- Confirm `RecordsCounter` still mounts above the search bar (preserves the data trust signal Session 30 explicitly preserved)

### Slice 9 — D-024 12-point DoD + lint + build + commit + push + PR (~30 min)

- Lint should stay at 0 (currently at 0 post-2026-05-22 sweep)
- Build verify all 4 tab routes render dynamically
- Verify deep-linking: `?q=acme&tab=agencies` shared link reproduces state
- Verify back/forward browser nav cycles through search history correctly
- Mobile test: tabs stack OR scroll horizontally on narrow viewports

---

## Total scope summary

| Item | Files | Time |
|---|---:|---:|
| Tab shell + URL state | 2 | 45m |
| Debounced search + cleanup | 1 + delete 1 | 30m |
| Agencies tab | 2 | 60m |
| Contacts tab | 2 | 60m |
| Carriers tab | 2 | 45m |
| Verticals tab | 1 | 30m |
| Empty/loading/error per tab | (in slice files) | 30m |
| Apply-on-touch sweep | varies | 15m |
| DoD + lint + build + ship | — | 30m |
| **Total** | **~10 new + 1 delete** | **~5.5 hrs** |

Vs original BACKLOG #2 estimate of ~6-8 hrs / ~10-15 files. About 20% under at the planning level. Audit-first execution likely takes it to ~4 hrs / ~10 files.

---

## Open design questions to surface at session start

### Q1 — Contact search semantics: agency-name vs person-name?

`search_contacts_for_filters` filters by `p_account_name` which is the agency/company name. Most cross-entity-search products let users type a person's name and surface contacts whose first/last matches. Two options:

- **(A) Mirror the existing RPC** — Contact tab searches by agency name (consistent with Agencies tab; uses existing RPC unchanged). Simpler v1. UX: "Find contacts at agencies whose name contains 'acme'."
- **(B) Add a new RPC** `search_contacts_by_name` that filters by first/last/full name match (~45 min addition: 1 new migration + RPC + GRANT). UX: "Find contacts named 'John Smith'."

**Recommendation: (A) for v1.** Ship the agency-name version first, validate usage, add the person-name variant as a v1.5 enhancement if Master O sees prospects asking for it.

### Q2 — Single search input or per-tab search?

Single sticky search input at the top whose query applies to whichever tab is active (my current plan) OR each tab has its own input?

**Recommendation: single shared input.** Lower cognitive load, matches industry pattern (Apollo, ZoomInfo). The active tab determines what entity the query searches; switching tabs preserves the query and re-runs against the new entity.

### Q3 — Default tab on initial load?

- (A) Agencies (most common entity)
- (B) "All" merged view (most cross-entity-search UX) — would require a new aggregated RPC + ranked-relevance scoring (not in v1 scope)
- (C) Whatever the last-active tab was (per-user preference stored in localStorage)

**Recommendation: (A) Agencies for v1.** "All" view is genuinely valuable (per industry pattern) but adds ~2 hrs of relevance-ranking work — defer to v2 once we see real usage.

### Q4 — Empty-query behavior?

When user lands on `/quick-search` with no query (`?q=` is empty):
- (A) Show empty state on each tab ("Type to search...")
- (B) Pre-populate with "Recent searches" (would require schema — out of v1 scope) OR "Top agencies / contacts / carriers / verticals" lists
- (C) Show the live `<RecordsCounter>` + a brief explainer of each tab

**Recommendation: (C) for v1.** Reuses the existing `RecordsCounter` from Session 30 + adds a brief explainer above the tab list. Anti-slop honesty about the v1 scope.

### Q5 — SWR install — pull into bundle, or skip for v1?

`swr` adds ~5KB. v1 could ship with vanilla `useEffect` + `fetch` + manual debouncing (no SWR), then layer SWR in as v1.5 for the caching benefits.

**Recommendation: install SWR now.** The cache benefits (instant tab-switch, no refetch on focus) are first-class UX wins. ~5 min `npm install swr`. The SWR client-cache fold-in is the deferred AS Session 5 Option A — this is the natural insertion point per Session 29 + Session 30 notes.

---

## Pre-launch readiness checklist

Before opening the session that builds this:

- [ ] PR #4 merged (`/home` v1 + redirect flip) — clean main baseline
- [ ] Lint at 0 (already there post-2026-05-22 sweep)
- [ ] Confirm `npm install swr` adds the right version (`^2.x`)
- [ ] Confirm `search_agencies_for_filters` + `search_contacts_for_filters` exist in production Supabase (audit confirmed they do)
- [ ] Decide Q1-Q5 above OR queue as in-session decisions

---

## Suggested session-open paste

When Master O wants to start this build, paste-ready opener:

```
Start BACKLOG #2 (Quick Search 4-tab feature build). Full plan at
docs/roadmaps/BACKLOG_2_QUICK_SEARCH_4TAB_PLAN.md — audit was done
2026-05-22 parallel to BACKLOG #1 ship. RPC dependencies all exist
(search_agencies_for_filters, search_contacts_for_filters,
list_carriers_with_appointments, mv_vertical_summary cache). No new
migrations needed for v1.

Q1-Q5 decisions: (A1) Agency-name semantics for Contacts tab v1.
(A2) Single shared search input. (A3) Default tab = Agencies. (A4)
Empty-query shows RecordsCounter + brief explainer per tab. (A5)
Install SWR now (closes deferred AS Session 5 Option A).

Estimated ~4-5 hrs via audit-first; ceiling per plan is ~5.5 hrs.
Proceed with Slice 1 — tab shell + URL state — and propose plan
adjustments after reading the current code if anything has drifted
since the 2026-05-22 audit.
```

---

## Cross-product implications

- **DotIntel + DotAgencies:** No impact. Search is Agency-Signal-specific.
- **Family-hub doctrine:** Carry-forward standing rules apply (D-024 12-point DoD, audit-first, anti-slop, secrets-never-in-chat).
- **No schema changes:** Pure UI build on top of existing RPC surface. Zero migration risk.
- **No Stripe / payments / RLS changes:** Pure search read-path. Existing SECURITY DEFINER on the RPCs handles permissioning.

---

*End plan — paste-ready when bandwidth allows.*
