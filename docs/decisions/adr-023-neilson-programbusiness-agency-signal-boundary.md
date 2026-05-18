# ADR-023 — Neilson / ProgramBusiness Boundary for Agency Signal

**Status:** Accepted
**Date:** 2026-05-18
**Family ledger reference:** [`docs/context/DECISION_LOG.md`](../context/DECISION_LOG.md) **D-023**
**Source:** Architect strategy review 2026-05-18 (consolidated Product Definition)
**Scope:** Agency Signal only. Does not apply to DOT Intel or to products outside the Seven16 family architecture.

---

## Context

Neilson Marketing and ProgramBusiness validate demand for insurance data, agency segmentation, producer intelligence, market discovery, and distribution growth tools.

Agency Signal owns the agency / producer / distribution intelligence layer within the Seven16 family.

Prior framing risked positioning Agency Signal as a generic list-broker (Neilson-style) or as a broad market-discovery marketplace (ProgramBusiness-style). Neither captures Agency Signal's actual moat: appointment-aware targeting + vertical specialization + saved-list refresh + data hygiene + Enterprise+ distribution recommendations.

---

## Decision

Agency Signal will treat Neilson Marketing and ProgramBusiness as adjacent benchmarks.

Agency Signal will borrow:
- segmented insurance data
- state / vertical slicing
- verified contact emphasis
- agency / producer profiles
- market discovery concepts
- program / profile listing patterns
- enterprise distribution-expansion framing

Agency Signal will not become:
- a generic list broker
- telemarketing service
- full CRM
- full AMS
- broad quote marketplace
- generic insurance-news portal
- DOT risk platform

---

## Product Boundary

**Agency Signal owns:**
- agency directory
- producer intelligence
- carrier appointment intelligence
- distribution expansion
- agency data products
- saved lists
- future market discovery

**DOT Intel owns:**
- trucking risk scoring
- FMCSA intelligence
- pricing analysis for trucking risks
- motor carrier monitoring

**Out of Seven16 family** (per D-022 — these workflows exist in products outside this family architecture):
- submissions
- clearance
- quote / bind workflow
- AMS workflows
- CRM workflows
- claims
- policy administration
- Go High Level services directly (Growtheon's lane per D-010 reseller)

---

## Revisit Trigger

Revisit after:
- 5 paying producer-tier customers
- first Enterprise Distribution Expander demo
- first verified enterprise data request

---

## Consequences

**Positive:**
- Clear product-scope discipline; future sessions can't relitigate without superseding ADR.
- Named competitive benchmarks (Neilson + ProgramBusiness) protect against scope drift.
- Free 9-pillar product taxonomy emerges with clean boundaries.

**Trade-offs:**
- Some adjacent demand (broad market discovery, claimed/verified profile flows, qualified appointment workflows) is explicitly parked. We may leave revenue on the table for the next 6–12 months while the core pillars mature.
- AS does not own AMS/CRM/submissions/quote-bind/claims. If a future family product absorbs any of those, this ADR will need amending.

---

## Cross-references

- [`docs/strategy/agency-signal-positioning.md`](../strategy/agency-signal-positioning.md) — full positioning thesis
- [`docs/strategy/neilson-competitive-boundary.md`](../strategy/neilson-competitive-boundary.md) — Neilson borrow / avoid / our-edge detail
- [`docs/strategy/programbusiness-competitive-boundary.md`](../strategy/programbusiness-competitive-boundary.md) — ProgramBusiness borrow / avoid / our-edge detail
- [`docs/strategy/distribution-expander-thesis.md`](../strategy/distribution-expander-thesis.md) — Enterprise+ thesis
- [`docs/strategy/agency-signal-product-boundaries.md`](../strategy/agency-signal-product-boundaries.md) — owns / does NOT own canonical list
- [`docs/domains/`](../domains/) — 8 domain docs covering the 8 active product pillars (Pillar 9 Market Discovery is parked but documented for future)
- [`docs/agency-signal-status.html`](../agency-signal-status.html) — single-pane-of-glass dashboard
- [`docs/context/DECISION_LOG.md`](../context/DECISION_LOG.md) — family ledger entry D-023
- [`supabase/migrations/0091_agency_signal_d023_tables_proposed.sql`](../../supabase/migrations/0091_agency_signal_d023_tables_proposed.sql) — proposed schema (not applied)
