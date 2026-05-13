# Pricing — Enterprise Layer (Second ICP)

**Date locked:** 2026-05-12
**Decision log entry:** D-015
**Companion to:** [MASTER_CONTEXT.md](MASTER_CONTEXT.md), [DECISION_LOG.md](DECISION_LOG.md), [PRICING_CREDITS_AND_TOPUPS.md](PRICING_CREDITS_AND_TOPUPS.md)

> This brief defines pricing for the **second ICP** — Distribution Expanders (VPs of Distribution at MGAs / wholesalers / carriers; the Neilson-replacement buyer). Explicitly **outside D-011's small-firm design target**. Lives ABOVE the locked subscription tiers, inside the existing $399+ (Agency Signal) and $499+ (DOT Intel) Enterprise bands. Includes: (1) Agency Signal Enterprise+ state-based slider with $1,000–$2,000/state and $12,500 all-50 ceiling, (2) DOT Intel Enterprise+ volume credit packs and API access, (3) Distribution+ outcome SKU for cross-product appointment success fees. Per-state numerical tiers are **structure-locked, price-pending** until `agency_count_by_state` and `email_completion_pct_by_state` queries run.

---

## 1. The second ICP — explicitly out of D-011's design target

D-011 codifies the small-firm wedge: every consumer tier under the $500 P-card threshold, designed for the producer who can't justify procurement. That's the right design target for $19 Producer / $99 Growth / $29 Pro / $149 Business.

The second ICP is fundamentally different:

| ICP attribute | Small firm (D-011) | Distribution Expander (this brief) |
|---|---|---|
| **Buyer title** | Producer / Owner / SBO | VP of Distribution / Director of Producer Development / Head of Sales |
| **Org type** | Retail agency, 1–10 producers | MGA, wholesaler, carrier, aggregator, insurtech |
| **Decision economics** | P-card swipe ($<500/mo) | Annual contract, procurement-routed |
| **Time to close** | Same-session credit-card | 30–90 day sales cycle |
| **KPI being served** | "Help me bind more accounts" | "Help me appoint more agents" / "Help me grow distribution" |
| **WTP anchor** | $19–$149/mo | $12,500–$25,000/yr (Neilson-anchored) |
| **Tools they compare against** | Free FMCSA portals, sales tools | Neilson Marketing, DOT Analysis, Annex, internal data teams |

D-011 says larger customers are "welcome but never the design target." This brief is how we **welcome them with intent** — without distorting the small-firm product surface.

---

## 2. Why a second pricing surface exists

The Distribution Expander cannot be served by the $19 / $99 / $399+ tiers as-published. Specifically:

- $399/mo is the floor of "Enterprise" in MASTER_CONTEXT, but the floor description is vague — there's no published packaging. Neilson trained this buyer to expect: per-state pricing, all-states ceiling, demo-led sales, annual contracts.
- The locked credit-and-top-up engine (D-014) is designed for self-serve usage. Distribution Expanders don't want to track credits — they want predictable annual access to defined data scope.
- The Distribution Expander's KPI (agent appointments) cannot be priced as access. It has to be priced as outcomes — see §5.

So Enterprise+ is a different pricing **surface** sharing the same product, not a different product. Same database, same Supabase satellites, same auth — different SKU configuration in `seven16-platform.plans`.

---

## 3. Agency Signal Enterprise+ — state-based slider

### 3.1 The buyer journey

1. Buyer lands on Enterprise tier page (or is routed from a demo conversation).
2. Selects states via an **interactive US map UI** with per-state price labels visible on hover.
3. Running total updates live, plus a persistent "Buy all 50 for $12,500 — save $X" anchor button.
4. At checkout, the selection is annualized; renewal cadence is annual with state-mix lock for the term.

### 3.2 Per-state pricing formula

```
state_price = max($1,000, min($2,000, $500 + contacts_with_email × $0.20))
```

| Variable | Value | Why |
|---|---|---|
| `base` | $500 | Per-state activation overhead (engineering, entitlement, support onboarding) |
| `per_lead_value` | $0.20 | Per verified email contact. Anchored against typical B2B data benchmarks ($0.10–$0.50 per verified record); positions Seven16 mid-market. |
| Floor | **$1,000/state** | Minimum state price. Covers activation cost regardless of data depth. |
| Cap | **$2,000/state** | Maximum state price. Prevents a single premium state from anchoring above ~$12,500 ÷ 6. |

**Why verified email contacts, not agencies?** A buyer values reachable people, not entities. Contacts-per-agency varies wildly (NH 10.3, MI 7.2, FL 5.7) — pricing on agency count alone undercharges high-density states like NY and MI. **Contacts-with-email is the buyer's actual KPI**: people they can put on an email outreach the day after purchase. Pricing on this unit aligns vendor revenue with buyer value.

This formula is the calibration tool; **the customer never sees the formula** — they see tier-grouped per-state prices (§3.3).

### 3.3 State tier assignment — FULLY LOCKED (2026-05-12)

Tier assignment rule: **verified-email-contact buckets**. Buyer-facing UI shows the tier price; the rule explains the rationale. Validated against live data on 2026-05-12 against `sdlsdovuljuymgymarou` (Agency Signal Supabase satellite).

| Tier | Price / state | Rule | Count | States |
|---|---|---|---|---|
| **Tier 1 — High density** | **$2,000** | ≥5,000 verified email contacts | 5 | CA, MI, NY, OH, PA |
| **Tier 2 — Medium density** | **$1,500** | 2,000–4,999 verified email contacts | 15 | CO, FL, GA, IA, IL, IN, KY, LA, MA, MN, MO, NC, NJ, TX, WI |
| **Tier 3 — Lower density** | **$1,000** | <2,000 verified email contacts | 28 | AL, AR, AZ, CT, DE, ID, KS, MD, ME, MS, MT, ND, NE, NH, NM, NV, OK, OR, RI, SC, SD, TN, UT, VA, VT, WA, WV, WY |
| **Territorial add-ons** | **$0** | <50 verified email contacts | 3 | AK (17 contacts), DC (17), HI (6) |

**Totals:** 5 + 15 + 28 + 3 = **51 jurisdictions covered**. The three territorial add-ons (AK, DC, HI) are no-charge inclusions to any purchase — completes the "all jurisdictions" story without charging for trivially-small data.

**Surprises in the data worth noting (defensible if a buyer challenges):**
- **MI is Tier 1** despite ranking #7 by agency count — it has the densest contact data (7.2 contacts/agency).
- **TX and FL are Tier 2**, not Tier 1 — they have many agencies but fewer contacts-per-agency.
- **NH at Tier 3** is genuinely high-quality (96% email rate, 10.3 contacts/agency) but only 1,746 total emails — below the Tier 2 threshold.

### 3.4 Bundle discount ladder

À la carte adds up fast. The bundle ladder funnels heavy buyers toward the $12,500 ceiling without crushing à la carte single-state purchases:

| Selection size | Pricing | Effective per-state |
|---|---|---|
| **1–4 states** | Sum at full tier price | $1,000–$2,000 |
| **5–9 states** | Sum × 0.85 (15% bundle discount) | ~$850–$1,700 |
| **10–24 states** | Sum × 0.70 (30% bundle discount) | ~$700–$1,400 |
| **25–49 states** | Flat **$9,500** | ~$190–$380 |
| **All 50 states + 3 territorial add-ons (AK, DC, HI)** | Flat **$12,500** | **$250** |

**Overflow protection (mandatory):** `final_price = min(computed_bundle, $12,500)`. The bundle ladder NEVER exceeds the all-50 ceiling. Worked example: a buyer picks the top 9 premium states (5 Tier 1 + 4 Tier 2) = 5×$2,000 + 4×$1,500 = $16,000 × 0.85 = **$13,600** at the ladder rate. UI displays: *"Your 9 states cost $13,600. Upgrade to all 50 + 3 territories for $12,500 — you'd save $1,100."* The arbitrage becomes a conversion event; the buyer self-selects all-50 every time the ladder exceeds the ceiling. Implementation: client-side comparison runs on every state-selection state change.

**Marketing math (locked):**
- À la carte all-50: 5×$2,000 + 15×$1,500 + 28×$1,000 = **$64,500**
- Bundle ceiling: **$12,500**
- Effective bundle discount: **81%**
- vs. Neilson's $25k all-50: **50% undercut**

**Why this shape works:**
- Single-state buyers (small MGAs testing the data) still pay full freight at $1,000–$2,000 — covers our cost easily.
- Multi-state buyers see clear bundle savings unlocking as they click more.
- 25-state cliff at $9,500 creates a moment where the buyer's brain says "for $3,000 more I get the entire country" — the same psychology Neilson ran on Master O at renewal.
- All-50 ceiling at $12,500 covers Agency Signal's full $35k/yr maintenance cost from **3 customers**.

### 3.5 Included credits at Enterprise+

Enterprise+ buyers want predictability, not metering. State purchases come with **generous credit allotments for per-record actions** (export, append, X-date pulls, etc.):

| Purchase | Included credits / year |
|---|---|
| 1 state | 200 credits/yr |
| Bundle (5–24 states) | 100 credits × state count |
| 25-state flat | 3,000 credits/yr |
| **All-50 flat** | **5,000 credits/yr** |

Top-up slider (per D-014) remains available for overage, but at Enterprise+ rates (start at +30% bonus, not +0%). Credit overage past included allotment uses the standard ladder.

---

## 4. DOT Intel Enterprise+ — volume packs and API

DOT Intel's second-ICP buyer is different: carriers building distribution networks, MGUs prospecting carrier accounts, aggregators doing market analysis. Their pricing model is closer to API/data-licensing than state-based.

| SKU | Price | What's included |
|---|---|---|
| **Enterprise Volume — Starter** | **$499/mo** ($5,988/yr) | 2,500 credits/mo, API access (5 calls/sec rate-limited), SSO |
| **Enterprise Volume — Pro** | **$1,499/mo** ($17,988/yr) | 10,000 credits/mo, API (20 calls/sec), priority support, custom BDM brief templates |
| **Enterprise Volume — Custom** | **Quote** | Unlimited normal use, dedicated data feeds, white-label PDF exports, eligible for Distribution+ outcome SKU |

The $499/mo Starter aligns with the locked "$499+ Enterprise" floor in MASTER_CONTEXT — it's the published packaging of that tier, not a new tier.

**Credit overage at Enterprise:** Starts at +30% bonus rate (same as $50–$95 slider tier). Heavy users still consume the slider but always at the discounted rate.

---

## 5. Distribution+ outcome SKU (cross-product)

This is the SKU that gives MGAs / carriers a **success-fee path** aligned to their actual KPI: agent appointments closed. Available as a layer on top of any Enterprise+ contract (AgencySignal Enterprise+ all-50 OR DOT Intel Enterprise Volume — Custom).

| Component | Pricing | Why |
|---|---|---|
| **Per qualified appointment** | **$300–$500** depending on contract size | A single agent appointment is worth $50k+ in lifetime premium to the MGA — $400 is a rounding error to them, near-pure margin to us |
| **Qualification standard** | Mutually defined at contract — typically: agent meets MGA's appetite criteria + signs producer agreement + completes carrier onboarding within 90 days of introduction | Prevents "credit for any name in the list" abuse; aligns incentive to real outcome |
| **Reporting** | Monthly attribution dashboard showing introductions → submissions → bound → appointed pipeline | Auditable, defensible, supports the contract conversation |

**Why Neilson can't follow:**
- Neilson's cost model (massive data acquisition + heavy salesforce) precludes success-fee pricing — they need predictable annual revenue per customer.
- Seven16's $35k/yr AgencySignal cost base is ~14% of a single Distribution+ customer paying for 100 appointments/yr at $400 ($40k). The margin shape is unrecognizable to a legacy data competitor.

This is the SKU that captures **outcome economics** the trends-report flagged: charge for the value created, not the access provided.

---

## 6. Bundle Enterprise+ — Distribution Suite

For the customer that wants both products on a single contract:

| SKU | Price | Includes |
|---|---|---|
| **Distribution Suite — Standard** | **$22,500/yr** | AgencySignal all-50 + DOT Intel Enterprise Volume — Pro + 10,000 unified credits/yr |
| **Distribution Suite — Outcome** | **Quote (base $22,500/yr + $300–500/appointment)** | Standard + Distribution+ outcome SKU |

$22,500/yr undercuts the sum of standalone Enterprise pricing (AgencySignal all-50 $12,500 + DOT Intel Enterprise Volume Pro $17,988 = $30,488) by ~26%. Anchors the bundle as the obvious choice for any MGA serious about distribution growth.

**Coexistence with the locked $179/mo 2027 Seven16 Intelligence Bundle (D-005):** Two different bundles for two different ICPs. The $179 bundle is for emerging agencies (DOT Intel Business + AgencySignal Growth); the $22,500 Distribution Suite is for MGAs/carriers (Enterprise tier of both). No conflict — these don't share a pricing page or a sales motion.

---

## 7. Architecture implications

State-level entitlements + outcome-SKU attribution both require new schema:

```sql
-- seven16-platform satellite
create table customer_entitlements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,           -- Stripe customer
  product_id uuid not null,            -- agency_signal | dot_intel
  scope_type text not null,            -- 'state' | 'all_states' | 'unlimited' | 'api_access'
  scope_value text,                    -- 'CA', 'TX', '*', null
  starts_at timestamptz not null,
  expires_at timestamptz,
  contract_id uuid,                    -- optional FK to enterprise contract
  created_at timestamptz default now()
);
create unique index on customer_entitlements (customer_id, product_id, scope_value);

-- distribution_plus attribution
create table appointment_attributions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,           -- the MGA/carrier paying the success fee
  agent_record_id uuid not null,       -- the agent that was introduced
  introduced_at timestamptz not null,
  submitted_at timestamptz,
  bound_at timestamptz,
  appointed_at timestamptz,
  qualified boolean,                   -- meets contract qualification standard
  fee_amount numeric(10,2),            -- contract-specific $300-$500
  invoiced_at timestamptz,
  contract_id uuid not null
);
```

**Query pattern:** every AgencySignal data fetch joins `customer_entitlements` to filter by `scope_value IN (selected_states)` OR `scope_type = 'all_states'`. Implementation lives in the row-level-security policy on `directory.agencies`.

---

## 8. Validation — completed 2026-05-12

### 8.1 Database snapshot at validation

Live query against `sdlsdovuljuymgymarou` (Agency Signal Supabase satellite) on 2026-05-12 produced:

| Metric | Value |
|---|---|
| Total agencies | **41,705** |
| Total contacts | **135,453** |
| Contacts with verified email | **115,892 (85.6%)** |
| Jurisdictions with data | 51 (50 states + DC; PR excluded — 1 agency only) |

### 8.2 Pricing unit changed from agency count → verified email contacts

Initial brief draft used `agency_count × email_quality_multiplier` as the composite score. During validation Master O directed pricing to anchor on **verified email contacts** (the buyer's reachable-people KPI), not agency count. Formula was rewritten as `state_price = max($1,000, min($2,000, $500 + contacts_with_email × $0.20))`. Tier breakpoints at **≥5,000 / 2,000–4,999 / <2,000** verified contacts.

### 8.3 What is published vs. internal

| Buyer-facing | Internal-only |
|---|---|
| Tier 1/2/3 grouping (§3.3) | The pricing formula (§3.2) |
| Per-state price ($1,000 / $1,500 / $2,000) | The contact-count rule (≥5,000 etc.) |
| All-50 ceiling at $12,500 | The à la carte $64,500 calculation |
| The "50% undercut vs. Neilson" headline | Underlying contact counts per state |

Sales conversations may quote underlying contact counts to credibility-build with a Distribution Expander who's done their homework, but the pricing page shows tier-grouped prices only.

---

## 9. What this brief does NOT change

| Item | Status |
|---|---|
| Locked subscription tiers (D-002, D-005, D-011) | **Unchanged.** $19 / $29 / $99 / $149 / $179 bundle / $399+ / $499+ all stand. |
| Credit + top-up consumption engine (D-014) | **Unchanged.** Credit packs and slider remain the self-serve overflow path for the small-firm wedge. |
| $500 P-card threshold | **Preserved at consumer tier.** Enterprise+ is annual-contract / procurement-routed, not P-card — explicitly outside the threshold by design. |
| Threshold IQ pricing (D-009) | **Unchanged.** Family integration deferred. |
| Growtheon margin model | **Unchanged.** Open question #2. |
| Seven16Recruit pricing | **Unchanged.** Open question #3. |

---

## 10. Open questions — surface when implementing

1. **Map UI vs. multi-select for state slider.** Interactive US map is more delightful but harder to build and ADA-compliant; multi-select dropdown is simpler. Recommendation: ship multi-select first, iterate to map. *Surface when:* scoping the Enterprise tier page build.
2. **Future per-lead consumption layer.** State purchase = access entitlement (per §7). Per-record actions inside that access are metered via credits (per D-014). If a buyer specifically asks for "show me only the leads I'm going to act on" pricing, consider a "leads consumed" metric on top of the state subscription. *Surface when:* a customer specifically asks during a demo. (Per-state remains the primary unit — already validated by Neilson training the market on it.)
3. **Distribution+ qualification standard.** §5 says "mutually defined at contract" — but a default template would speed early deals. Draft template: "agent meets appetite criteria + signs producer agreement + bound first policy within 120 days." *Surface when:* first Distribution+ contract is negotiated.
4. **Renewal mechanics for state-mix changes.** What happens if a customer wants to drop NY and add OH at renewal? Recommendation: allow state-mix changes at renewal at the current tier price; charge a $500 admin fee for mid-term changes. *Surface when:* first renewal cycle approaches.
5. **DOT Intel Enterprise+ outcome SKU scope.** §5 references appointments as the outcome unit — that's clean for AgencySignal. For DOT Intel, the equivalent might be "qualified submission routed to MGA" or "carrier bound after intro." Needs definition with first carrier/MGU contract. *Surface when:* first DOT Intel Enterprise+ contract conversation.

---

## 11. Next implementation moves (post-commit)

In dependency order:

1. ~~**Run §8.1 query** against AgencySignal Supabase satellite. Fills in tier assignments.~~ **DONE 2026-05-12** (§8).
2. **Draft Enterprise tier page copy** using locked tier assignments from §3.3. Persona: VP of Distribution at MGAs/wholesalers/carriers.
3. **Schema migration** for `customer_entitlements` + `appointment_attributions` (§7). Lands in `seven16-platform` satellite per D-008.
4. **Stripe product catalog setup**: state SKUs (~50 line items per tier), bundle SKUs (Distribution Suite Standard + Outcome), Enterprise Volume SKUs, Distribution+ usage-based SKU. Implement the overflow-protection rule (§3.4) in the cart logic.
5. **Demo conversations**: 5–8 Distribution Expander demos before publishing prices. Validate the $12,500 ceiling and the tier breakpoints against live reactions. Watch specifically for pushback on MI being Tier 1 (data-driven, but counter-intuitive vs. brand-name perception of TX/FL).
6. **MASTER_CONTEXT.md refresh** — §1 still says "20,739 agencies" (stale). Live data shows 41,705 agencies / 135,453 contacts. Worth a separate `docs(master-context)` commit to keep the hub doc accurate.

---

— end of brief —
