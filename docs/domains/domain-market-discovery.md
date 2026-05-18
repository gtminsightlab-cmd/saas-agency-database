# Domain — Future Market Discovery (Pillar 9 · PARKED)

**Locked:** 2026-05-18 (D-023 / ADR-023)
**Status:** **PARKED — future-state pillar.** Do not build broad market discovery yet.

> Per D-023 + ADR-023, this pillar is documented for future direction but explicitly **parked** until triggers fire. ProgramBusiness is the long-term anchor benchmark.

## Purpose

ProgramBusiness-adjacent future layer — searchable insurance markets and programs, connecting agencies (which AS already maps) to relevant markets (programs, MGAs, wholesalers offering specific coverages).

## Primary Users

- Working Producer (find a market for a hard-to-place risk)
- Small Retail Agency (program/MGA discovery)
- Future enterprise: bidirectional market-to-agency matching

## Included (future-state)

- market profiles
- program profiles
- coverage categories
- state availability
- target classes
- contact instructions
- featured markets
- new-market alerts
- storefront / listing model

## Excluded (firm — even at future build)

- broad quote marketplace
- submission marketplace
- broad all-lines program directory
- insurance-news sprawl
- duplicating submission workflows (out of family per ADR-023)
- generic ZoomInfo-clone or ProgramBusiness-clone

## Data Sources

- TBD when build triggers
- Likely: program/MGA submissions, public market signals, coverage-category tagging

## Tables

| Table | Status | Role |
|---|---|---|
| `markets` | Future | Market entity |
| `programs` | Future | Program entity (linked to market or MGA) |
| `coverage_categories` | Future | Coverage taxonomy |
| `market_alerts` | Future | New-market notification subscriptions |

**No D-023 migration 0091 entries for this pillar** — schema design deferred until trigger fires.

## UI Routes (future)

- `/app/markets/search`
- `/app/markets/programs`
- `/app/markets/[market_slug]`
- `/app/markets/featured`

## API Routes (future)

- TBD

## Pricing / Packaging Impact (future)

- Likely free-tier-driven for discovery, with premium routing/alerts as upsell
- Detailed model deferred until pillar enters active build

## Compliance Notes

- Will inherit family-wide RLS + audit log discipline
- Market data attribution will need a D-XXX boundary decision (analogous to D-017 for agency mirror)

## Current Status

**Parked.** Do NOT build broad market discovery, quote marketplace, or program directory now. Path forward is via the ProgramBusiness benchmark when triggers fire.

## Trigger conditions (all three must hold)

Build only when:

1. **Saved-list intelligence (Pillar 6) is shipped and proven** — BACKLOG #1 closes; saved-list refresh + change detection live in production with real usage.
2. **Data trust signals are visible in product (Pillar 8 UI surfaces)** — verified badges, confidence scores, stale alerts in UI; users can see + act on data quality.
3. **Enterprise+ Distribution Expander demos (5–8) validate market-side demand** — buyers explicitly ask for the market-discovery view, not just the agency-side view.

Until all three: ProgramBusiness is a benchmark, not a build target.

## Future Expansion

Documented separately when triggers fire. Initial scope likely:
- ProgramBusiness-style searchable market profiles
- Storefront / listing UX patterns
- Featured-market concept
- Coverage-category browsing
- Tie back to Pillar 7 Distribution Expander for bidirectional market ↔ agency intelligence
