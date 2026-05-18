# Domain — Build Lists / Saved List Intelligence (Pillars 5 + 6)

**Locked:** 2026-05-18 (D-023 / ADR-023)
**Status:** Build Lists shipped · Saved List Intelligence partial (refresh backend BACKLOG #1)

> Per D-023, **Build Lists (Pillar 5)** and **Saved List Intelligence (Pillar 6)** are distinct pillars. They share infrastructure and live in this combined domain doc per the architect's filename. The distinction matters: Build Lists = build flow; Saved List Intelligence = refresh + change-detection (the SaaS differentiator vs. static-export vendors).

## Purpose

**Pillar 5 (Build Lists):** Let users create targeted agency or producer lists from filters.

**Pillar 6 (Saved List Intelligence):** Turn static exports into SaaS — refresh, detect changes, alert on stale data.

## Primary Users

- Working Producer (build prospect lists)
- Small Retail Agency (build niche growth lists)
- MGA/MGU/Wholesaler (campaign-ready segmentation)
- Carrier / Program Admin (territory lists with refresh)

## Included

### Build Lists

- filters (state, vertical, carrier, contact confidence, size)
- saved criteria
- export to CSV
- list naming
- vertical filters (Pillar 4 cross-cut)
- carrier filters (Pillar 3 cross-cut)
- geography filters
- contact confidence filters (Pillar 8 cross-cut)

### Saved List Intelligence

- saved list snapshots (point-in-time payload capture)
- update detection (BACKLOG #1)
- change types: new agencies / removed agencies / new contacts / stale contacts / new appointment indicators
- refresh alerts (UI tints row when `has_updates=true`)
- delta-only download ("Download Updates" button)
- snapshot diffs

## Excluded

- CRM follow-up workflows (Growtheon's lane per ADR-023)
- Email/SMS marketing automation (Growtheon's lane)
- Custom analytics/dashboards beyond saved-list scope (Pillar 7 for that)
- Public sharing of saved lists (privacy/IP concern)

## Data Sources

- All other pillars feed in via filters
- Refresh job pulls from current `public.agencies` + `public.contacts` + `public.agency_carriers` and compares to last snapshot

## Tables

| Table | Rows | Role |
|---|---:|---|
| `public.saved_lists` | 4 | Saved lists registry |
| `public.downloads` · `public.downloads_ledger` | 0 / 0 | Export tracking |
| **`saved_list_snapshots`** (proposed, D-023 migration 0091) | 0 | NEW — point-in-time payload for change detection |
| **`saved_list_changes`** (proposed, D-023 migration 0091) | 0 | NEW — diff records per refresh |
| `public.saved_list_hygiene_flags` | 0 | Stub for hygiene cross-cut (Pillar 8) |

## UI Routes

- `/build-list` — build flow
- `/build-list/review` — review filters before save
- `/build-list/download` — export
- `/saved-lists` — saved-list management

## API Routes

- `/api/saved-lists/[id]` — saved-list CRUD
- `/api/export` — export
- Future: `/api/cron/saved-lists-refresh` — Vercel-Cron trigger
- Future: `supabase/functions/recompute-saved-lists/index.ts` — Edge Function (D-013 family template)

## Pricing / Packaging Impact

- **Free:** limited saved lists, limited exports
- **Producer:** more saved lists, more exports
- **Growth:** **saved-list refresh + change detection** unlocks (the SaaS differentiator)
- **Enterprise:** export jobs, custom segments via Distribution Expander (Pillar 7)

## Compliance Notes

- RLS forced (D-006), per-user saved-list scoping
- Audit log captures saved-list mutations
- Data load denylist (Pillar 8) applies during refresh

## Current Status

Build flow: shipped (`app/build-list/*`, `app/saved-lists/page.tsx`). UI tints row on `has_updates=true` since AS Session 3 (commit `e1bfc89`). **Refresh backend = BACKLOG #1** (~4–5 hr lift): migration 0091 + Vercel Cron + Edge Function + delta-export button.

## Future Expansion

- Saved-list refresh backend (BACKLOG #1 — D-023 priority 1)
- Change-type taxonomy expansion (new appointment / verified-flag change / vertical reclassification / etc.)
- Per-saved-list refresh cadence options (daily / weekly / monthly)
- Snapshot retention policy
- "Download deltas only" UX
- Confidence-score threshold filters during refresh
