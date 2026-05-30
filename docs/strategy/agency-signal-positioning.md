# Seven16 Intel — Positioning

> **⚠️ BRAND RENAME 2026-05-30 (Master O directive):** Product renamed from "Agency Signal" to "Seven16 Intel". Domain: `agencysignal.co` → `seven16intel.com`. Internal DB id (`agency_signal`) and Stripe slug (`agencysignal`) unchanged pending separate coordinated migration. D-023 positioning ("Distribution intelligence for commercial insurance") remains fully valid. Update the admin product-positioning page at `/admin/product-positioning` (canonical source) first; this strategy doc is secondary.

**Locked:** 2026-05-18 (ADR-023 / family D-023) — rebrand note 2026-05-30
**Source:** Architect strategy review, consolidated Product Definition
**Canonical decision:** [`docs/context/DECISION_LOG.md`](../context/DECISION_LOG.md) D-023 + [`docs/decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md`](../decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md)

---

## One-line definition

Agency Signal is the **commercial insurance agency, producer, carrier appointment, and distribution intelligence product** that helps producers, agencies, MGAs, wholesalers, carriers, and program administrators find, segment, prioritize, and understand commercial insurance agencies and producers.

## Core positioning

> **Distribution intelligence for commercial insurance.**

Agency Signal is not a generic lead list. Agency Signal is an intelligence layer. The moat is appointment-aware targeting + vertical specialization + saved-list refresh + data hygiene + Enterprise+ distribution recommendations — not raw row count.

## What Agency Signal helps users understand

- who the agencies are
- who the producers are
- what markets they appear connected to
- what verticals they likely serve
- what states they operate in
- which agencies fit a distribution strategy
- which producers or agencies are worth targeting first

## Two ICP model

### ICP 1 — Consumer / Producer Tier (self-serve wedge)

**Users:** working producers · small retail agencies · small wholesalers · commercial insurance operators

**Jobs:** search directory · build lists · save lists · download lists · research agencies · identify carrier appointments · find niche opportunities

**Pricing:** Free / Producer / Growth / Enterprise (all under $500 P-card threshold per family D-002)

### ICP 2 — Enterprise+ Distribution Expander (higher-value data product)

**Users:** MGA distribution leaders · carrier distribution leaders · wholesaler growth teams · program administrators · insurtechs

**Jobs:** map agency universe · segment by state · segment by vertical · identify appointment opportunities · build campaign-ready agency lists · identify distribution white space · prioritize agency recruiting

**Pricing:** D-015 state-based slider ($1,000–$2,000/state · $12,500 all-50 ceiling = 50% Neilson undercut · Distribution+ outcome SKU $300–$500/qualified appointment)

This is the Neilson-adjacent product layer.

## 9 product pillars

| # | Pillar | Status |
|---|---|---|
| 1 | Agency Directory | Shipped |
| 2 | Producer Intelligence | Schema in · UI light |
| 3 | Carrier Appointment Intelligence | Shipped (core differentiator) |
| 4 | Vertical / Segment Intelligence | 12 verticals shipped · 8 empty |
| 5 | Build Lists | Shipped |
| 6 | Saved List Intelligence | Refresh queued — BACKLOG #1 |
| 7 | Distribution Expander | D-015 locked · GTM queued |
| 8 | Data Quality / Hygiene | Engine in · UI light |
| 9 | Future Market Discovery | **Parked** — trigger: saved-list intelligence + data trust + Enterprise+ demos mature |

Each pillar has its own domain doc at [`docs/domains/`](../domains/).

## Personas (more granular than the two-ICP frame)

- **Working Producer** — find agencies, research niches, build prospect lists, identify carrier appointments
- **Small Retail Agency** — find other agencies/markets, understand competitors, identify wholesalers, build niche growth lists, affordable data without enterprise pricing
- **MGA / MGU / Wholesaler** — identify retail agencies to recruit, segment by geography + vertical, identify appointment clues, prioritize fit, build state-by-state distribution plans
- **Carrier / Program Administrator** — identify target agencies, expand distribution, find by vertical, understand appointment density, build territory lists, analyze distribution whitespace

## Rejected positioning language

- "Multi-tenant directory" — undersells
- "ZoomInfo for insurance" — overlaps
- "Neilson replacement" — commercially risky framing
- "Lead-gen tool" / "prospecting platform" — commodity positioning
- "Agency database" — implies static, not intelligence

## Adjacent competitive references

- **Neilson Marketing** — primary anchor for Enterprise+ Distribution Expander pricing (D-015 50% undercut). See [`neilson-competitive-boundary.md`](neilson-competitive-boundary.md).
- **ProgramBusiness** — long-term anchor for Pillar 9 Market Discovery once saved-list intelligence + data trust + Enterprise+ demos mature. See [`programbusiness-competitive-boundary.md`](programbusiness-competitive-boundary.md).

## When this gets out of date

Update when:
- Master O surfaces a new direct competitor not yet captured
- A pillar transitions Status (queued → active → shipped)
- Pricing model shifts (e.g., D-021 amendment)
- ADR-023 revisit-trigger fires (5 paying producer-tier customers, first Enterprise+ demo, first verified enterprise data request)
