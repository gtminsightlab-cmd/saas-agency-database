# Domain — Agency Directory (Pillar 1)

**Locked:** 2026-05-18 (D-023 / ADR-023)
**Status:** Shipped

## Purpose

Search and profile commercial insurance agencies. The foundational pillar — every other pillar references the agency identity.

## Primary Users

All 4 personas: Working Producer · Small Retail Agency · MGA/MGU/Wholesaler · Carrier/Program Admin.

## Included

- agency name + normalized name
- locations + office data (parent-vs-branch grain)
- website + phone + email
- contact data (cross-references Pillar 2)
- states served
- lines of business
- specialties + vertical tags (cross-references Pillar 4)
- claimed / verified profile status (future)
- account type (retail / wholesale / MGA / etc.)
- agency management system used (informational)

## Excluded

- Individual producer profiles (Pillar 2)
- Detailed carrier appointment intelligence (Pillar 3)
- Vertical scoring + segmentation (Pillar 4)
- Save / export workflows (Pillar 5)
- Distribution recommendations (Pillar 7)

## Data Sources

- Vendor xlsx loads (`scripts/load-adlist.ts`, plus session-12 8-file load)
- DOT Intel sync (`sync_to_agency_signal.py`, lives outside repo in `scrapers/seven16-scraper/`)
- AdList load (commit `e1bfc89`, 31,746 contact gap-fill + 3,328 agencies)
- Manual `/admin/catalog` entries
- Canary scrub + Neilson denylist (Pillar 8 cross-cuts)

## Tables

| Table | Rows (2026-05-18) | Role |
|---|---:|---|
| `public.agencies` | 32,951 | Primary entity |
| `public.account_types` | 33 | retail / wholesale / MGA / etc. |
| `public.agency_management_systems` | 63 | informational |
| `public.lines_of_business` | 25 | tag set |
| `public.agency_sic_codes` | 99,764 | SIC linkages |
| `public.states` · `public.metro_areas` · `public.location_types` | 64 · 40 · 3 | geo refs |
| **`agency_profiles`** (proposed, D-023 migration 0091) | 0 | claimed/verified extension — overlaps existing `agencies`; may instead become columns on `agencies` |

## UI Routes

- `/agency-directory` — primary search surface
- `/verticals/[slug]` — vertical-filtered agency lists (Pillar 4 cross-cut)
- `/quick-search` — fast lookup
- Future: `/agency/[slug]` — claimed profile page

## API Routes

- `/api/export` — export query results (Pillar 5 cross-cut)
- Future: `/api/agencies/[slug]/claim` — claim flow

## Pricing / Packaging Impact

- **Free:** basic search, limited profile views
- **Producer:** extended search, vertical filters, carrier filters, basic contact visibility
- **Growth:** larger exports, advanced segmentation, better contact confidence filters
- **Enterprise:** Pillar 7 Distribution Expander unlocked

## Compliance Notes

- RLS forced (D-006); tenant-scoped via `current_tenant_id()`
- Audit log (`public.audit_log`, 1,317 rows) trigger-populated on mutations
- No source attribution leak to consumers (D-017 enforced on DOT Intel mirror)

## Current Status

Shipped 2026-04-23+. 17 admin pages support the directory CRUD. Fuzzy search via `pg_trgm` (per D-006 standing rule). 32,951 agencies live.

## Future Expansion

- `agency_profiles` extension (D-023 migration 0091, proposed) — verified / claimed profile workflow
- Public profile pages (`/agency/[slug]`) for SEO + claim flow
- Confidence scores surfaced in UI (Pillar 8 cross-cut)
- Producer-centric segmentation views (Pillar 2 cross-cut)
