# Domain — Distribution Expander (Pillar 7)

**Locked:** 2026-05-18 (D-023 / ADR-023)
**Status:** D-015 pricing locked · `/enterprise` page shipped · build queued

## Purpose

The Enterprise+ second-ICP product — Agency Signal's higher-ACV product layer. Built for VPs of Distribution at MGAs / wholesalers / carriers / program administrators / insurtechs answering "which agencies should we appoint, recruit, contact, or prioritize in this state / vertical / product line?" See full thesis in [`docs/strategy/distribution-expander-thesis.md`](../strategy/distribution-expander-thesis.md).

## Primary Users

- MGA distribution leaders
- carrier distribution leaders
- wholesaler growth teams
- program administrators
- insurtechs

**Not** D-011's small-firm design target. Budget authority assumed; $500 P-card threshold does not apply.

## Included

- state targeting (per-state pricing via D-015 slider)
- vertical targeting (Pillar 4 cross-cut)
- carrier appointment analysis (Pillar 3 cross-cut)
- verified contact counts (Pillar 8 cross-cut — anchors per-state pricing)
- agency universe maps
- distribution white-space analysis
- opportunity scoring
- qualified appointment targets
- exportable target segments (Pillar 5 cross-cut)
- Distribution+ outcome SKU tracking (D-015)

## Excluded

- Quote/bind workflows (ADR-023 boundary)
- Carrier-side relationship management
- Submission routing (out of family)
- Custom CRM integration (Growtheon's lane)
- Generic distribution-audit consultancy (productized only)

## Data Sources

- All other pillars feed in
- D-015 state-tier classification (CA/MI/NY/OH/PA = Tier 1 ≥5k emails; 15 states Tier 2 2k-5k; 28 states Tier 3 <2k; AK/DC/HI territorial add-ons)
- Future: outcome SKU attribution tracked per appointment

## Tables

| Table | Rows | Role |
|---|---:|---|
| `public.agencies` · `public.contacts` · `public.agency_carriers` | 32,951 / 135,453 / 264,063 | Source signals |
| **`customer_entitlements`** in `seven16-platform` | 0 (missing) | State-level RLS scope — **BACKLOG #5** |
| **`appointment_attributions`** in `seven16-platform` | 0 (missing) | Outcome SKU tracking — **BACKLOG #5** |
| **`distribution_expander_segments`** (proposed, D-023 migration 0091) | 0 | NEW — saved enterprise segments + filter shapes |

## UI Routes

- `/enterprise` — Tier page (shipped 2026-05-14, commit `e77c29d`, 832 lines)
- Future:
  - `/app/enterprise/distribution-expander` — main workflow surface
  - `/app/enterprise/state-targeting` — state slider UX
  - `/app/enterprise/vertical-segments` — vertical mapping
  - `/app/enterprise/appointment-opportunities` — Pillar 3 cross-cut
  - `/app/enterprise/export-jobs` — large-export queue
  - `/app/enterprise/data-quality` — Pillar 8 cross-cut

## API Routes

- Future: `/api/enterprise/segments` — segment CRUD
- Future: `/api/enterprise/export-jobs` — large-export job queue

## Pricing / Packaging Impact

- **Enterprise+ slider:** $1,000–$2,000/state · $12,500 all-50 ceiling (50% Neilson undercut)
- **Bundle:** Distribution Suite $22,500/yr (AS all-50 + DOT Intel Enterprise Volume Pro + 10,000 unified credits)
- **Outcome SKU:** Distribution+ $300–$500 per qualified appointment
- Overflow protection: `final_price = min(computed_bundle, $12,500)`

## Compliance Notes

- State-level RLS via `customer_entitlements (scope_type='state', scope_value)` — required before pillar ships
- Outcome SKU attribution requires `appointment_attributions` table in platform satellite
- Per-state pricing on **verified email contacts** (buyer's reachable-people KPI), not raw agency count — anchors honest math

## Current Status

D-015 pricing **fully locked** 2026-05-12. `/enterprise` tier page shipped 2026-05-14. Workflow surface + schema migrations + Stripe SKU build queued. 5–8 demos = next pressure-test (BACKLOG #8).

## Future Expansion

- Schema migration: `customer_entitlements` + `appointment_attributions` in `seven16-platform` satellite (BACKLOG #5)
- Stripe catalog for Enterprise+ tier (~50 state SKUs + Distribution Suite bundle + Distribution+ outcome SKU)
- Workflow UX (state → vertical → target profile → filter → list → export)
- 5–8 Distribution Expander demos (BACKLOG #8)
- Outcome SKU attribution dashboard for buyers
