# DOT Alerts — Pricing Spec

**Locked:** 2026-05-15
**Parent decision:** D-021 (Seven16 Credits & Usage Pricing Architecture) — this doc refines D-021 §6 which had a "rough starting model" of $20 base + tiered per-unit add-on. **Master O has tuned the actual numbers against cost-curve modeling**; structure shifts from base+per-unit to **flat tier bands**.
**Product family placement:** DOT Alerts is a Seven16 SKU powered by DOT Intel's data infrastructure, sold primarily to **carriers / fleets / owner-operators** (buyer #1, the focus of this spec) — and potentially also to agents monitoring their book of business (buyer #2, future spec).
**Primary surface:** dotcarriers.io claim flow + agent-portal upsell on dotagencies.io / dotintel.io.

---

## 1. Positioning

DOT Alerts is priced to be **simple for owner-operators and fair for growing fleets.** Start with a single driver, then add units as your operation scales. Pricing structure: flat monthly tier bands based on number of drivers (or power units) tied to a single DOT number. No per-alert charges. No per-message metering. Predictable on the invoice.

The commercial logic: a single roadside problem, missed inspection, or surprise CSA hit can cost far more than a year of monitoring for an owner-operator — and for fleets, the risk multiplies with every additional driver. DOT Alerts replaces manual monitoring + spreadsheet work + missed-issue exposure at a fraction of what fleets already spend on admin time, offshore data entry, or compliance back-office labor.

---

## 2. Owner-Operator tier

| Field | Value |
|---|---|
| Drivers / DOT numbers | 1 driver / 1 DOT number |
| **Monthly fee** | **$25/month** |

Includes:
- Real-time DOT monitoring for one unit
- Email and SMS alerts for key compliance + safety events
- Basic dashboard and history

**Positioning:** Single-unit operators that want professional-level monitoring without fleet software complexity.

---

## 3. Fleet tiers — LOCKED 2026-05-15

Plans scale based on the number of drivers (or power units) tied to a single DOT number.

| Tier | Drivers | **Monthly fee** | Effective per-driver |
|---|---|---|---|
| **Small Fleet** | 2–5 | **$50/mo** | $10–$25/driver |
| **Growing Fleet** | 6–15 | **$90/mo** | $6–$15/driver |
| **Regional Fleet** | 16–40 | **$175/mo** | $4.38–$10.94/driver |
| **Large Fleet** | 41–100 | **$350/mo** | $3.50–$8.54/driver |
| **Enterprise** | 101+ | **Starting at $500/mo per DOT number** | Custom |

All fleet plans include:
- Continuous monitoring for all enrolled drivers/units
- SMS + email alerts for key compliance and safety events
- Web dashboard and history by driver, unit, and DOT number
- Basic admin tools to add/remove drivers and units

---

## 4. Relationship to D-021 §6 (structural change)

D-021 §6 specified DOT alerts as **"$20/mo base + tiered per-unit add-on"** (rough starting model: 2–10 units = +$2/unit, 11–50 = +$1.50/unit, 51+ custom). Master O has now tuned the actual numbers against cost-curve modeling and **the structure has changed:**

- **Old (D-021 rough model):** $20 base + per-unit add-on
- **New (this spec, locked):** Flat monthly tier bands

**Why the structural shift:**
- Flat tier bands are dramatically simpler for the customer to understand (one number, not "$20 + 23 × $1.50 = $54.50/mo")
- Per-unit pricing creates friction at the tier boundary (adding 1 driver feels like punishment)
- Real SMS + email + compute cost curves don't scale linearly per unit — they bucket by infrastructure provisioning (alert routing setup, monitoring frequency, dashboard load)
- Flat bands match how fleets actually budget — "we're a 25-truck operation" → "we're on Regional Fleet at $175/mo" → checkable monthly line item, not a moving target

**Price ladder is materially higher than D-021's initial model:**
- D-021 rough: 5 units = $20 + 4×$2 = $28/mo; this spec: 5 units = $50/mo
- D-021 rough: 100 units = $20 + 50×$1.50 = $95/mo; this spec: 100 units = $350/mo
- The new ladder reflects observed cost curves AND meaningful margin protection at scale. The owner-operator entry ($25/mo) is the loss-leader; the value capture is at the fleet tiers.

---

## 5. How billing works

- Customer chooses the plan matching their current driver/unit count.
- Adds or removes drivers at any time; if active count moves into a new band for a full billing period, billing adjusts on the next cycle.
- Each monitored driver/unit shares the same DOT Alerts feature set — no "lite" seats.

---

## 6. Customer-facing FAQ (drop-in copy)

**What counts as a driver or unit?**
Any driver or power unit you enroll for DOT monitoring and alerts counts toward your total. You can enroll by driver, by tractor, or both — most fleets pick one convention and stick with it.

**Can I mix owner-operators and company drivers?**
Yes. As long as they are tied to the same DOT number, they can all sit under the same plan.

**What if my driver count changes during the month?**
You can add or remove drivers at any time. If your active count moves into a different band for a full billing period, your subscription adjusts to that band on the next renewal.

**Do I pay per alert or per message?**
No. Plans are based on the number of monitored drivers/units, not per-alert charges. Reasonable SMS and email usage is included for all plans.

**Can I upgrade or downgrade later?**
Yes. You can change plans as your fleet grows or contracts. Upgrades are prorated; downgrades take effect on your next billing cycle.

---

## 7. "Why DOT Alerts Pricing Is Fair" — website FAQ blurb

> DOT Alerts is priced to replace a lot of manual monitoring and spreadsheet work at a fraction of what fleets already spend on admin time, offshore data entry, or missed issues. A single roadside problem, missed inspection, or surprise CSA hit can cost far more than a year of monitoring for an owner-operator, and for fleets the risk multiplies with every additional driver. By charging a simple monthly fee per fleet size — rather than nickel-and-diming per alert or per message — DOT Alerts stays predictable on the invoice while still covering the real costs of SMS, email, and compute in the background. Fleets get professional-grade visibility and peace of mind for an amount that comfortably fits inside what they already budget for safety, compliance, and back-office support.

---

## 8. Charter Member integration — LOCKED 2026-05-15 (option (a))

D-018 (amended by D-021) states "Charter Members get best alerts per-unit rate locked for life." Master O confirmed CTO recommendation of **option (a)** on 2026-05-15.

**The mechanic:**
- **25% off whatever fleet-size tier the charter member is on**
- Discount applies at every tier; scales with charter member's fleet growth
- Locked for life per D-018 amended

**Charter Member DOT Alerts pricing:**

| Tier | Drivers | Standard fee | **Charter fee** | Charter effective per-driver |
|---|---|---|---|---|
| **Owner-Operator** | 1 | $25/mo | **$18.75/mo** | $18.75/driver |
| **Small Fleet** | 2–5 | $50/mo | **$37.50/mo** | $7.50–$18.75/driver |
| **Growing Fleet** | 6–15 | $90/mo | **$67.50/mo** | $4.50–$11.25/driver |
| **Regional Fleet** | 16–40 | $175/mo | **$131.25/mo** | $3.28–$8.20/driver |
| **Large Fleet** | 41–100 | $350/mo | **$262.50/mo** | $2.63–$6.40/driver |
| **Enterprise** | 101+ | $500+/mo | **$375+/mo** (25% off negotiated) | Custom |

**Why option (a):**
1. Compounds cleanly with credit max-bonus (Charter Members already get +40% credit bonus from D-018 amended) + TIQ charter rate (25% off subscription + always Scale-tier overage from PRICING_THRESHOLD_IQ §10)
2. Marketing copy is dead simple: **"Charter Members get 25% off DOT Alerts forever, at any fleet size."**
3. Scales with fleet growth — the discount applies at each new tier the charter member moves into
4. Doesn't create tier semantic weirdness (charter member on Growing Fleet really IS on Growing Fleet, just at charter rate)
5. Aligns with the "predictable monthly fee per fleet size" core value prop (just at a charter rate)

**Compound discount example (charter member with multi-product adoption):**

Charter member running a 15-truck fleet + TIQ Growth + buying Agency Signal credits:
- **DOT Alerts** (Growing Fleet): $67.50/mo (vs. $90 standard) — saves $270/year
- **TIQ** (Growth tier, charter rate): $1,125/mo + $1/sub overage (vs. $1,500 + $2/sub standard) — saves $4,500/year base + overage savings scale with submission volume
- **Agency Signal credits:** +40% bonus on every top-up forever (vs. tier-bonus-bands for non-charter) — saves 20–40% on lead acquisition spend
- **Compound annual savings: $5,000+ baseline, scaling much higher with usage volume**

That's the founding-member offer in concrete dollar terms.

**Cascaded to:**
- `saas-agency-database/docs/context/DECISION_LOG.md` D-018 entry (amendment note)
- Charter Member deck on Desktop (slides 17-18 can now render real compound charter math)
- `seven16-distribution/docs/handoffs/SESSION_3_PROMPT.md` (alerts subsection of /pricing page can render charter math)
- Family memory `project_charter_member_program.md` (specific charter rates per surface)

## 9. Commercial guardrails

- No per-alert or per-message charges (preserve invoice predictability)
- No "lite seats" within a tier (each monitored unit has full feature parity)
- No mid-month band changes that surprise the customer (band changes apply on next billing cycle)
- Reasonable SMS + email volume included by default; if usage materially exceeds the cost model, surface as "high-usage account" conversation rather than auto-charging overage
- Enterprise tier ($500+ / 101+ drivers) is the gateway to custom-quoted pricing for very large operations — anchor at $500 so the conversation starts there

---

## 10. Strategic rationale (cross-reference)

This pricing aligns with:
- **D-021** — alerts as one of the à la carte SKUs in the Seven16 family; flat-band pricing replaces D-021's rough base+per-unit model
- **D-018** (amended) — Charter Members get best alerts per-unit rate locked for life (integration mechanics §8, pending decision)
- **dotcarriers.io monetization model** (per family memory `project_dotagencies_dotcarriers_monetization_model.md`) — DOT Alerts is one of the carrier-side monetization SKUs in the three-sided marketplace

**Why the structural change to flat bands works for this audience:**
- Owner-operators and small fleet owners are NOT enterprise-procurement buyers; they need a number they can quote at a kitchen-table conversation
- Fleet operators budgeting safety/compliance spend think in monthly line items, not in per-unit math
- The pricing ladder visibly rewards scale (per-driver effective rate drops at each band) without forcing the customer to do the math — they just pick their fleet size and the math is pre-done

---

## 11. Open numeric refinements (track and refine as data informs)

- **Enterprise tier (101+ drivers) starting price** — $500/mo is the floor; actual pricing per-DOT-number will depend on alert volume, custom-event setup, dedicated CSM expectations
- **Charter Member integration mechanics** — see §8, pending Master O decision
- **Future: buyer #2 (agents monitoring their book)** — pricing model TBD; likely a separate SKU or add-on to DOT Intel agent tier rather than fleet-size-band pricing
- **Multi-DOT-number accounts** — pricing assumes one DOT number per plan; multi-DOT discount structure not yet specified (probably 15–20% off second+ DOT number)

---

## 12. When this doc gets out of date

Update when: (a) Master O decides Charter Member integration option (§8), (b) any tier number changes (monthly fee, driver band, included features), (c) Enterprise tier floor or custom-pricing model is locked, (d) agent-side alerts pricing (buyer #2) is specified, (e) multi-DOT-number pricing structure is locked.

---

*End PRICING_DOT_ALERTS.md*
