# Domain — Carrier Appointment Intelligence (Pillar 3)

**Locked:** 2026-05-18 (D-023 / ADR-023)
**Status:** Shipped (core differentiator)

## Purpose

Understand agency-market relationships. This is what makes Agency Signal more than a list — appointment-aware targeting is the moat per D-023.

## Primary Users

- MGA/MGU/Wholesaler (which agencies likely have which markets)
- Carrier / Program Admin (appointment density + concentration analysis)
- Working Producer (research peer agency portfolios)

## Included

- agency × carrier relationships
- appointment indicators (active / observed / inferred)
- confidence score per relationship
- state availability of the appointment
- LOB indicators (which lines the appointment supports)
- vertical indicators (which Pillar 4 verticals the carrier supports)
- carrier concentration per agency
- appointment density per carrier (how many agencies)
- temporal indicators (first_observed_at / last_observed_at — future)

## Excluded

- Underwriting decisions or quote workflows (out of family per ADR-023)
- Carrier-side relationship management (carriers don't log in to AS)
- Premium tracking (out of family)

## Data Sources

- `public.agency_carriers` table (264,063 rows live)
- Vendor xlsx loads + DOT Intel sync (cross-feed)
- Berkley operating-units mapping (migration 0081/0082/0085 — 1-14 PU non-fleet / 15-75 mid-fleet / 1-100+ umbrella / 75+ large-fleet)
- ISC fix (migration 0083)
- 13 wholesalers mapped (session 11)

## Tables

| Table | Rows | Role |
|---|---:|---|
| `public.agency_carriers` | 264,063 | Primary relationship table |
| `public.carriers` | 1,369 | Carrier catalog including Berkley OpCos |
| `public.affiliations` | 106 | UIIA / TRS / IIABA / Trusted Choice / etc. (cross-cut) |
| `public.agency_affiliations` | 20,266 | Agency × affiliation linkages |
| **`agency_carrier_appointments`** (proposed, D-023 migration 0091) | 0 | Richer appointment shape — **overlaps `agency_carriers`**; recommend extending existing table instead of creating new |

## UI Routes

- `/analytics/carriers` — carrier appointment analytics dashboard
- `/verticals/[slug]` — vertical-filtered with appointment overlay
- Inside agency detail pages (Pillar 1 cross-cut)
- `/methodology` — explains the appointment-detection approach

## API Routes

- Internal RPCs (`mig 0046_list_carriers_with_appointments`, `mig 0062-0063_analytics_carriers_rpcs`, `mig 0067_carriers_by_min_agency_count`, `mig 0080_get_vertical_carriers_with_segments`)

## Pricing / Packaging Impact

- **Free:** carrier list visible, appointment indicators redacted
- **Producer:** basic carrier filters
- **Growth:** appointment density + concentration analysis
- **Enterprise:** appointment-opportunity analysis inside Distribution Expander (Pillar 7)
- **Enterprise+ outcome SKU:** qualified appointment tracking ($300–$500/appointment per D-015)

## Compliance Notes

- RLS forced (D-006)
- Fuzzy/strong-match carrier lookup via `pg_trgm` (D-006 standing rule, tolerates Inc/Corp/Co suffix)
- Internal linking by `carrier_id` (not name) — see `feedback_carrier_search_strong_match.md`
- No source attribution to consumers (D-017)

## Current Status

Shipped (core differentiator). 264,063 agency × carrier rows, 1,369 carriers indexed. Trucking-segment badges shipped (migration 0079: Non-fleet specialist / Mid-market / Mid-fleet / Large-fleet / Specialty E&S / Unsegmented).

## Future Expansion

- Richer appointment shape: `first_observed_at` + `last_observed_at` + `appointment_status` + `verified` columns (D-023 migration 0091 proposed)
- Appointment timeline / "new appointment detected" alerts (Pillar 6 cross-cut)
- Carrier-table dedupe (4× Cincinnati, 3× Selective, 3× Nationwide → first-match-wins works today, future migration tidies — BACKLOG #11)
- ~150 long-tail unmatched carriers → `/admin/catalog` entries (BACKLOG #12)
