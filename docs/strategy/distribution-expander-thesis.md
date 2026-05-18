# Distribution Expander — Enterprise+ Thesis

**Locked:** 2026-05-18 (ADR-023 / family D-023)
**Pricing source-of-truth:** [`docs/context/PRICING_ENTERPRISE_LAYER.md`](../context/PRICING_ENTERPRISE_LAYER.md) (D-015)
**Page surface:** [`app/enterprise/page.tsx`](../../app/enterprise/page.tsx) (832 lines, shipped 2026-05-14, commit `e77c29d`)

---

## The thesis

The Distribution Expander is Agency Signal's **second-ICP product** — built for VPs of Distribution at MGAs, wholesalers, carriers, program administrators, and insurtechs answering a single operational question:

> "Which agencies should we appoint, recruit, contact, or prioritize in this state / vertical / product line?"

Neilson Marketing currently owns this conversation at $25k/all-50. Agency Signal undercuts at $12,500/all-50 (50% under) while delivering a richer answer through appointment-aware targeting and outcome SKU pricing.

## Buyer

**Not** D-011's small-firm design target. The Distribution Expander buyer is:

- VP of Distribution at MGAs and wholesalers
- Distribution / Channel leaders at carriers
- Growth teams at program administrators
- Insurtech BD leaders building agency networks

This buyer has budget authority. The $500 P-card threshold does not apply.

## The enterprise workflow (Pillar 7 build target)

```
Select state(s)
  ↓
Select vertical / LOB
  ↓
Select target agency profile (size band, contact density, vertical focus)
  ↓
Filter by carrier appointments + contact quality
  ↓
Generate recommended agency list
  ↓
Export / save / assign / track outcomes
```

This is what gets built in the Distribution Expander pillar. The state targeting + vertical segmentation + appointment intelligence + verified-contact density + universe mapping + whitespace analysis + opportunity scoring + qualified appointment targets are all sub-features of this single workflow.

## Pricing structure (D-015 locked)

### State-based slider

Anchored on **verified email contacts** (buyer's reachable-people KPI), not agency count.

| Tier | Verified emails / state | Price / state | States | Total if all |
|---|---|---:|---:|---:|
| 1 | ≥ 5,000 | $2,000 | 5 (CA, MI, NY, OH, PA) | $10,000 |
| 2 | 2,000–4,999 | $1,500 | 15 | $22,500 |
| 3 | < 2,000 | $1,000 | 28 | $28,000 |
| Add-on | < 50 (territorial) | $0 | 3 (AK, DC, HI) | included |

À la carte total all-50: ~$60,500

### Bundle ladder

| Selection | Discount |
|---|---|
| 1–4 states | Full price |
| 5–9 states | −15% |
| 10–24 states | −30% |
| 25–49 states | Flat $9,500 |
| All 50 + 3 add-ons | **Flat $12,500** |

Mandatory overflow protection: `final_price = min(computed_bundle, $12,500)`. Buyer never sees a price higher than the ceiling — the bundle ladder becomes a conversion event ("Your 9 states cost $13,600 — upgrade to all 50 for $12,500").

### Outcome SKU

**Distribution+:** $300–$500 per qualified appointment. Layered on top of either Enterprise+ tier. Qualification standard mutually defined at contract. Neilson's cost model precludes following this pricing motion — this is the moat.

### Bundle

**Distribution Suite:** $22,500/yr = Agency Signal all-50 + DOT Intel Enterprise Volume Pro + 10,000 unified credits.

À la carte all-50 totals $64,500 — bundle ceiling $12,500 = **81% effective discount**.

## Schema dependency

This pillar requires schema work in `seven16-platform` satellite (`soqqmkfasufusoxxoqzx`):

- `customer_entitlements (customer_id, product_id, scope_type, scope_value, ...)` — for state-level RLS
- `appointment_attributions` — for outcome SKU tracking

Both currently **missing** per BACKLOG #5. Required before the pillar can ship end-to-end.

## GTM gate

- 5–8 Distribution Expander demos pressure-test the ceiling + tier surprises (MI is Tier 1, TX is Tier 2, NH is Tier 3) before broad publication.
- `/enterprise` page is the demo driver.
- Demo cohort target: ICP 2 buyers found through Master O's existing network.

## What this pillar is NOT

- Not a quote marketplace
- Not a submission workflow
- Not a CRM for the buyer's sales team
- Not a generic distribution audit consultancy
- Not a Neilson clone — outcome SKU + appointment-aware targeting is the differentiator

## When this gets out of date

Update if:
- Pricing tiers shift (D-015 amendment)
- Outcome SKU mechanics change
- 5+ demos generate insight requiring tier rebalancing
- Schema migration ships and surfaces edge cases
