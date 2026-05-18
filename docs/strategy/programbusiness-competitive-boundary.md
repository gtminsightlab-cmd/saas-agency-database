# ProgramBusiness — Competitive Boundary

**Locked:** 2026-05-18 (ADR-023 / family D-023)
**Reference:** [`docs/decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md`](../decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md)

---

## What ProgramBusiness is

A searchable insurance markets / program discovery platform. Users browse by coverage or keyword to find markets, list programs, access storefronts, get alerts, and submit business.

## What ProgramBusiness validates

Insurance users need:
- searchable insurance markets
- program discovery
- storefront profiles
- coverage / category browsing
- new-market alerts
- retail-agent market utility
- featured-program patterns

## What Agency Signal should borrow (when Pillar 9 triggers)

- searchable profile UX
- storefront / listing model
- featured markets concept
- category browsing
- market alert pattern

## What Agency Signal should avoid

- full quote marketplace now
- broad all-lines program directory too early
- insurance-news bloat
- duplicating submission workflows that belong elsewhere

## Our edge

| ProgramBusiness-style | Agency Signal-style |
|---|---|
| Find a market | Find the right agency / producer / channel |
| Storefront directory | Agency + producer + market intelligence |
| Broad market listings | Distribution expansion by state / vertical |
| Submission routing | Relationship targeting |
| Retail-agent placement utility | MGA / wholesaler / carrier growth intelligence |

## Suggested framing

> Agency Signal maps the agency and producer side of distribution. Future market discovery helps connect agencies to relevant markets — but only after the agency + producer intelligence layer is mature enough that market discovery is enriched by it, not duplicated by it.

## Sequencing — Pillar 9 is parked

Market Discovery is Pillar 9 in Agency Signal's product taxonomy but **explicitly parked**. Build only when:

1. Saved-list intelligence (Pillar 6) is shipped and proven (BACKLOG #1 closes)
2. Data trust signals are visible in product (Pillar 8 surfaces — verified badges, confidence scores, stale alerts in UI)
3. Enterprise+ demos (5–8) validate genuine demand for market-side discovery

Until then, ProgramBusiness is a benchmark, not a build target.

## When this gets out of date

Update if:
- ProgramBusiness launches in our adjacent space (MGA distribution intelligence)
- One of the three trigger conditions above is met
- Master O decides to pull market discovery forward into active build
