# DOTAgencies Learning Center — Pricing Spec (PLACEHOLDER)

**Last updated:** 2026-05-15
**Parent decision:** D-021 §"Training (DOTAgencies Learning Center) — individual modules + agency/wholesaler team packages"
**Status:** ⚠️ PLACEHOLDER — substantive pricing decisions still need Master O input. This doc captures what's known + flags what needs locking before the Learning Center can ship full pricing on the SESSION_3 `/pricing` page.

---

## What's known (locked or near-locked)

| Item | Value | Source |
|---|---|---|
| Product surface | dotagencies.io/learn | Family STATE + D-016 brand split |
| Module count | 9 modules | Master O strategy doc + dotintel2 STATE.md |
| Module structure | Quizzes + flashcards + per-module exam | Master O strategy doc |
| Pass threshold | 70% score per module | Master O strategy doc |
| Cert at completion | Yes — visible on DOTAgencies directory listing | Existing implementation (session 28 training cert) |
| Entry price band | "Under $20" | Master O strategy doc |
| External cert recommended at completion | MCIEF TRS | Master O strategy doc |
| Charter Member rate | 25% off (per D-018 amended, applied family-wide) | D-018 amended by D-021 |
| Database row counts | 9 modules + 23 lessons + 106 flashcards | dotintel2 STATE.md §3 db state |

---

## ⚠️ NEEDS MASTER O DECISION

### Pricing model — pick one (or describe your own)

| Option | Mechanics | Pros | Cons |
|---|---|---|---|
| **(a) Pay-per-module** | $9–$15/module, buy individually | Lowest barrier to entry; clear value per module | Most users won't complete sequence without bundle |
| **(b) Course bundle (all 9 modules)** | $79 one-time for the full 9-module path + cert | Simple to explain; aligns with the "trucking specialist path" framing | Misses upsell from people only wanting 1-2 modules |
| **(c) Hybrid: per-module OR bundle** | $15/module OR $79 for all 9 + cert | Best of both worlds; "buy what you need, save with bundle" | Slight complexity; needs cart logic |
| **(d) Annual subscription** | $99/yr for all current modules + future modules + cert refresh | Recurring revenue; covers future module shipments | New SaaS billing surface for one-off product |

**My CTO recommendation: option (c) — hybrid per-module OR bundle.** Reasons:
1. "Under $20 per module" matches Master O's stated entry-price target
2. Bundle at $79 = ~$8.78/module effective (38% bundle discount) — significant enough to drive bundle uptake
3. Hybrid covers two buyer behaviors: dabblers (one or two modules) AND committed specialists (whole path)
4. Bundle creates clear value moment for the certificate completion (no one buys all 9 modules separately just to get the cert)
5. Charter Members at 25% off: $11.25/module OR $59.25 for full bundle — keeps the offer materially better than standard

**Master O decision needed.**

### Team packages — agency/wholesaler pricing

If an agency owner wants to put their 10 producers through the course as a team, what's the model?

| Option | Mechanics |
|---|---|
| **(a) Per-seat license** | $79 standard bundle × N producers (no discount) |
| **(b) Team pack discounts** | 5–9 producers: 10% off. 10–24: 20% off. 25+: 30% off. (Per-seat with volume discount.) |
| **(c) Flat agency license** | $499/yr for unlimited producers under one agency (covers all current employees + new hires for 12 months) |
| **(d) Hybrid: team pack OR flat license** | Smaller teams pick team pack; larger teams pick flat license; system surfaces the better deal |

**My CTO recommendation: option (d) — hybrid team pack OR flat license.** Reasons:
1. 10-producer team: 10 × $79 × 0.80 (team pack) = $632 OR flat $499 → system suggests flat license (better deal at this size)
2. 5-producer team: 5 × $79 × 0.90 = $355.50 OR flat $499 → system suggests team pack (better at this size)
3. The math automatically picks the right offer; reduces buyer's cognitive load
4. Charter Member agencies get 25% off whichever path they're on
5. Volume discount + flat-license alternative covers small-agency-to-MGA spectrum

**Master O decision needed.**

### Wholesaler team packages

Same model as agency but for wholesaler/MGA teams (which may be 25–100+ producers). The team pack discount could extend further OR the flat-license model could have a wholesaler-tier ($1,499/yr unlimited under wholesaler umbrella).

**Master O decision needed.**

### Future modules

When new modules ship (beyond the initial 9), what happens?
- Bundle buyers: do they get new modules free? Or upgrade fee?
- Annual subscribers (if option (d) above): yes, included
- Per-module buyers: pay separately for new modules

**Master O decision needed.**

---

## Charter Member integration (locked once core pricing is locked)

Per D-018 amended: Charter Members get 25% off whatever pricing model lands above. Applies to individual modules, bundles, team packages, and any future subscription product. Locked once core pricing model is locked.

---

## Strategic rationale (CTO/PM frame)

The Learning Center is **the lowest-friction entry point in the entire Seven16 family.** "Under $20" prices are below the impulse-purchase threshold for almost any working producer. The job of this product is:

1. **CAC reducer for DOT Intel + Agency Signal.** Course completers are 10× more likely to convert to paid SaaS subscriptions because they've already self-identified as trucking-niche specialists.
2. **Category authority signal.** Seven16 becomes the brand that trains trucking-insurance specialists, which builds long-term credibility independent of any single product.
3. **Cross-product flywheel input.** Cert holders get a badge on their DOTAgencies directory listing → directory becomes more useful → carriers/fleets choosing producers see who's actually trained → more business flows to cert holders → more producers want the cert.

This is why the pricing model matters: a too-high price kills the funnel-input function. A too-low price (free) loses the value-anchoring effect. "Under $20 per module" is the right band — needs the specific number locked.

---

## When this doc gets out of date

Update when: (a) Master O picks pricing model from §"NEEDS MASTER O DECISION" above, (b) any module pricing changes, (c) team-package model is locked, (d) new module ships (beyond the initial 9), (e) annual subscription option is added, (f) external partnership pricing (e.g., MCIEF discount path) is added.

---

*End PRICING_LEARNING_CENTER.md (PLACEHOLDER — needs Master O input on pricing model + team packages)*
