# Session 21 Handoff — Pricing Strategy Locked (D-014 + D-015)

**Date:** 2026-05-12
**Product:** Family hub (`saas-agency-database`) — affects Agency Signal + DOT Intel pricing strategy
**Session type:** Strategy + decision-log session (no code, all docs)

---

## What shipped this session

Three pricing decisions, fully documented and committed. All three honor the locked D-002 / D-011 small-firm wedge — none of the published $19 / $29 / $99 / $149 / $179-bundle / $399+ / $499+ tiers were touched.

### D-014 — Credit + top-up consumption engine inside locked subscription tiers

**Brief:** [`docs/context/PRICING_CREDITS_AND_TOPUPS.md`](../context/PRICING_CREDITS_AND_TOPUPS.md)

- Monthly credit allotments per tier: **DOT Intel 100/600** (Pro / Business), **Agency Signal 50/400** (Producer / Growth)
- **Credit reference value: 1 credit ≈ $0.29 face** ($29 Pro → 100 credits anchor)
- **Top-up slider** snaps in $5 increments with bonus thresholds:
  - $5 (+0%) → $10–$15 (+10%) → $20–$45 (+20%) → $50–$95 (+30%) → $100–$195 (+35%) → $200–$495 (+40%) → $500–$1,000+ (+45% cap)
- Above $1,000 the slider keeps the +45% rate; bigger commitments route to a quoted Enterprise contract
- **Variable consumption** for AI/upload tools: PDF analysis = 5 credits base + 1/5MB over baseline (cap 25); image OCR = 2 base + 1/5MB (cap 10)
- **Hybrid expiry**: subscription credits expire monthly with 2× rollover cap; top-up credits **never expire**
- **Per-tool credit costs locked** in brief §3.2 — anchor: DOT lookup + PDF export = 2 credits ($0.58 face)
- **UX rules**: slider appears at 10%-remaining (header chip) + inline at moment of value capture (modal); never force-upgrades; never hard-paywalls (out-of-credit users still get basic public-data tier)

### D-015 — Enterprise+ pricing layer for the second ICP (Distribution Expanders)

**Brief:** [`docs/context/PRICING_ENTERPRISE_LAYER.md`](../context/PRICING_ENTERPRISE_LAYER.md)

Second ICP = VPs of Distribution at MGAs/wholesalers/carriers (Neilson-replacement buyers). Explicitly outside D-011's small-firm design target ("welcome but never the design target"). Sits inside the existing $399+ (Agency Signal) and $499+ (DOT Intel) Enterprise bands — published packaging, not new tiers.

**Agency Signal state-based slider — FULLY LOCKED against live data:**

```
state_price = max($1,000, min($2,000, $500 + contacts_with_email × $0.20))
```

Note: pricing unit is **verified email contacts**, not agency count. Agency-count pricing structurally undercharged high-density states.

| Tier | Price | Rule (verified email contacts) | States |
|---|---|---|---|
| **Tier 1** | **$2,000** | ≥5,000 | CA, MI, NY, OH, PA (5) |
| **Tier 2** | **$1,500** | 2,000–4,999 | CO, FL, GA, IA, IL, IN, KY, LA, MA, MN, MO, NC, NJ, TX, WI (15) |
| **Tier 3** | **$1,000** | <2,000 | AL, AR, AZ, CT, DE, ID, KS, MD, ME, MS, MT, ND, NE, NH, NM, NV, OK, OR, RI, SC, SD, TN, UT, VA, VT, WA, WV, WY (28) |
| **$0 add-ons** | **Free** | <50 | AK (17), DC (17), HI (6) — included with any purchase |

**Surprises in the data (defensible to a buyer who challenges):**
- **MI is Tier 1** despite ranking #7 by agency count — 7.2 contacts/agency, densest data in DB
- **TX and FL are Tier 2**, not Tier 1 — many agencies but fewer contacts/agency
- **NH at Tier 3** has 96% email rate + 10.3 contacts/agency but only 1,746 total emails

**Bundle ladder:** 1–4 full / 5–9 −15% / 10–24 −30% / 25–49 flat $9,500 / **all-50 flat $12,500** (50% undercut of Neilson's $25k). **Overflow protection mandatory**: `final_price = min(computed_bundle, $12,500)` — never exceeds the all-50 ceiling. Arbitrage becomes conversion event in UI.

**À la carte total:** 5×$2,000 + 15×$1,500 + 28×$1,000 = **$64,500** → bundle = **81% effective discount**

**Other Enterprise+ SKUs:**
- **DOT Intel volume packs:** $499/$1,499/quote (Starter / Pro / Custom)
- **Distribution+ outcome SKU:** $300–$500 per qualified appointment (cross-product, layered on either Enterprise+)
- **Distribution Suite bundle:** $22,500/yr (AS all-50 + DI Enterprise Volume Pro + 10,000 unified credits)

### Data snapshot refresh — MASTER_CONTEXT hub doc

Live database query against `sdlsdovuljuymgymarou` (Agency Signal Supabase satellite) on 2026-05-12 revealed material drift in the hub doc's data snapshot:

| Metric | Hub doc (before) | Live (now) |
|---|---|---|
| Agencies | 20,739 | **41,705** |
| Carrier appointments | 191,201 | **263,657** |
| Writing companies | 400+ | **1,085** active (1,369 total) |
| Contacts | — | **135,453 (85.6% with verified email)** |

MASTER_CONTEXT §1 updated. **Marketing copy on the live site is intentionally NOT touched** — DECISION_LOG §2 "pricing copy is placeholder until data inventory catches up" remains in force for the public surface.

---

## Commits made (canonical repo `saas-agency-database`, all on `main`, none pushed)

| Commit | Subject |
|---|---|
| `915e4fe` | docs(pricing): D-014 consumption engine + D-015 Enterprise+ layer |
| `f11287b` | docs(pricing): D-015 fully locked — state tiers validated against live data |
| `769400d` | docs(master-context): refresh Agency Signal data snapshot (live db query) |

Each commit has a complete HEREDOC commit message capturing the decision context. Co-Authored-By: Claude Opus 4.7 (1M context).

---

## Decision log entries added

| # | Decision | One-line summary |
|---|---|---|
| **D-014** | Consumption engine inside locked tiers | $5-increment top-up slider + variable consumption for AI/upload tools |
| **D-015** | Enterprise+ layer for second ICP | State pricing on verified email contacts; $12,500 all-50 ceiling; 50% undercut of Neilson |

---

## Memory updated

`C:\Users\GTMin\.claude\projects\C--Users-GTMin-OneDrive-Documents-Claude-Projects-Saas-Agency-Database\memory\`:

- **New file**: `reference_neilson_pricing_mechanics.md` — Neilson's land-and-expand mechanics ($10k entry for 5+2 states, $1,500/state add-on, $25k all-50 ceiling at renewal). Direct anchor for AgencySignal Enterprise+ pricing.
- **MEMORY.md index** updated with the new pointer.

---

## What's queued for follow-up sessions (in dependency order)

1. **Schema migration** for `customer_entitlements` + `appointment_attributions` in `seven16-platform` satellite per D-015 §7. State-level RLS enforcement + outcome SKU attribution tracking. *Per PRICING_ENTERPRISE_LAYER.md §11.3.*
2. **Schema migration** for `credit_wallets`, `credit_ledger`, `credit_consumption_rates` per D-014. Some scaffolding may already exist in `seven16group` (saw `credit_wallets` and `credit_ledger` tables in list_tables — verify state in next session).
3. **Stripe product catalog setup** — ~50 state SKUs across the three Agency Signal tiers + bundle SKUs (Distribution Suite Standard + Outcome) + DOT Intel Enterprise Volume SKUs + Distribution+ usage-based SKU. Implement the overflow-protection rule (D-015 §3.4) in cart logic.
4. **Enterprise tier page copy** — uses locked tier assignments from D-015 §3.3. Persona = VP of Distribution at MGAs/wholesalers/carriers. *Highest leverage next thing.*
5. **5–8 Distribution Expander demos** — pressure-test the $12,500 ceiling and the MI-is-Tier-1 surprise against live reactions before publishing prices.
6. **RLS advisory cleanup** — `public._trucking_load_log` in `sdlsdovuljuymgymarou` has RLS disabled (flagged during pricing session). Decide: enable + add super-admin-only policy, or rename to confirm internal-only.

---

## If a future Claude session opens this

**Opening move (read these in order, 5 minutes):**

1. [`docs/context/MASTER_CONTEXT.md`](../context/MASTER_CONTEXT.md) — family hub
2. [`docs/context/DECISION_LOG.md`](../context/DECISION_LOG.md) — see D-014 and D-015 at the bottom
3. [`docs/context/PRICING_CREDITS_AND_TOPUPS.md`](../context/PRICING_CREDITS_AND_TOPUPS.md) — D-014 spec
4. [`docs/context/PRICING_ENTERPRISE_LAYER.md`](../context/PRICING_ENTERPRISE_LAYER.md) — D-015 spec
5. Then ask Master O what's next.

**Highest-leverage next session = item #4 above (Enterprise tier page copy).** Strategy is locked, paper trail is complete, schema work needs engineering bandwidth. The tier page translates strategy into selling and is the natural next move.

**One thing to remember:** Master O likes opinionated CTO/PM recommendations, not flat menus (`memory/feedback_always_recommend_next_path.md`). Lead with a path before listing alternatives.

— end of handoff —
