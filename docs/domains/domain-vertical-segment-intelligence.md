# Domain — Vertical / Segment Intelligence (Pillar 4)

**Locked:** 2026-05-18 (D-023 / ADR-023)
**Status:** 12 verticals shipped · 8 empty awaiting carrier mapping

## Purpose

Make the directory useful by commercial insurance niche. This is what separates Agency Signal from a generic list vendor — verticals + appointment overlay = targeted distribution intelligence.

## Primary Users

- Working Producer (find agencies in my niche)
- Small Retail Agency (vertical-driven prospecting)
- MGA/MGU/Wholesaler (which agencies fit our program's vertical)
- Carrier / Program Admin (vertical-density analysis by state)

## Included

Commercial insurance verticals:
- trucking (Transportation)
- construction
- workers compensation
- general liability
- commercial auto
- BOP (Business Owner's Policy)
- property
- E&S (Excess & Surplus)
- professional liability
- cyber
- habitational
- manufacturing

Each vertical includes:
- carrier mapping (which carriers support which verticals)
- per-vertical agency lists
- segment badges (5 tiers: Non-fleet specialist · Mid-market · Mid-fleet · Large-fleet · Specialty E&S · Unsegmented — trucking exemplar)
- vertical scoring

## Excluded

- Individual policy data (out of family)
- Vertical-specific quote/bind workflows (out of family)
- Carrier-side vertical product configuration (carriers don't log in)

## Data Sources

- Master Trucking DB (1,419 rows, session 11)
- Vendor xlsx vertical tagging
- Manual `/admin/verticals/[slug]` curation
- Carrier-vertical mapping migrations (0050, 0052, 0053, 0054, 0078, 0080, 0081)

## Tables

| Table | Rows | Role |
|---|---:|---|
| `public.vertical_markets` | 12 | Vertical catalog |
| `public.carrier_verticals` | 136 | Carrier × vertical mapping (8 verticals still empty) |
| `public.agency_carriers` | 264,063 | Cross-references Pillar 3 |
| `mv_vertical_summary` | — | Materialized view, cached vertical premium counts |

## UI Routes

- `/verticals` — vertical landing
- `/verticals/[slug]` — per-vertical agency lists with segment badges
- `/admin/verticals` — admin curation
- `/admin/verticals/[slug]` — per-vertical admin
- `/methodology` — explains vertical scoring approach

## API Routes

- Internal RPCs (`mig 0050_mv_vertical_summary_premium_counts`, `mig 0080_get_vertical_carriers_with_segments`)
- `revalidateVerticalsRefs()` server action (BACKLOG #9 — needs admin button wiring)

## Pricing / Packaging Impact

- **Free:** basic vertical browse
- **Producer:** vertical filters in build-list
- **Growth:** advanced vertical segmentation + cross-vertical analysis
- **Enterprise:** per-state vertical-density inside Distribution Expander (Pillar 7)

## Compliance Notes

- RLS forced (D-006)
- `mv_vertical_summary` flagged as API-readable in pre-existing advisor cleanup (deferred)

## Current Status

Shipped 4 original verticals + 8 added migration 0051 = 12 total. **8 of 12 still empty** awaiting carrier mapping data (BACKLOG deferred — trigger: carrier mapping per vertical defined). Trucking is the canonical exemplar.

## Future Expansion

- Fill 8 empty verticals with carrier mapping (deferred)
- Wire `revalidateVerticalsRefs()` to admin "Refresh verticals" button (BACKLOG #9)
- Per-vertical confidence scoring overlay (Pillar 8 cross-cut)
- Cross-vertical density analysis for Distribution Expander (Pillar 7 cross-cut)
- First Light + Maximum account_type reclassification (carry from session 11; deferred)
