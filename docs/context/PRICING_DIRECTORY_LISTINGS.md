# Directory Listings — Pricing Spec

**Last updated:** 2026-05-15 (REFINED — DOT carrier listings now FREE; retail agent listings now annual at $120/yr; NEW Wholesaler/Insurance-Carrier listing tier at $1,000/mo)
**Parent decision:** D-021 (Seven16 Credits & Usage Pricing Architecture) §5, refined per Master O 2026-05-15
**Surfaces:** dotcarriers.io (carrier directory), dotagencies.io (agent + wholesaler/insurance-carrier directory)
**Buyers:** owner-operators / fleets (carrier listings — now FREE), retail producers / agencies (agent listings), wholesalers / insurance carriers / MGAs (NEW $1k/mo tier)

> **Note on supersession:** prior version of this doc (locked 2026-05-15 AM) had DOT carrier listings as paid ($20/$50/$65 by PU band) and retail agent listings as $20/mo. **Both were superseded later same day** per Master O strategic refinement. Wholesaler/insurance-carrier listing tier is NEW (not in prior spec).

---

## 1. DOT carrier listings — FREE (refined 2026-05-15)

**All upgraded carriers to claim are FREE.** No paid tier for carrier listings.

| Field | Value |
|---|---|
| Free basic listing | Auto-seeded; all ~50,298 DOTs already in dotcarriers.io |
| **Claimed listing** | **FREE** (no monthly fee) |
| Premium features (full profile, photos, contact CTAs, analytics) | **FREE** |
| Quote-request routing to agents | **FREE** (direct quote requests from carriers come through the directory at no charge to the agent; see §2) |

**Strategic rationale for free carrier listings (Master O 2026-05-15):**

> "We want them in the platform, so we can market them, send them marketing to request quotes when they are within 90 days of the policy renewal and give them risk analysis information and insurance companies that would be a fit for them based on risk score and industry data."

The carrier listing is **NOT a revenue product.** It's a **data collection + marketing surface** that funnels carriers into:
- Renewal-window quote-request flow (routes them to qualified agents)
- DOT Intel-powered risk analysis delivered to the carrier
- Insurance market recommendations based on their risk profile
- Marketing nurture (renewal reminders, alerts upsell, etc.)

**Monetization happens on the OTHER side of the marketplace** — agents pay $120/yr for listings + insurance carriers/wholesalers pay $1k/mo for premium listings. Carriers as the free side maximizes inventory for the marketplace.

---

## 2. Retail agent / producer directory listings — $120/year (refined 2026-05-15)

| Field | Value |
|---|---|
| Free basic listing | Auto-seeded basic profile, claimable |
| **Paid claimed listing — annual** | **$120/year** (= $10/mo effective; annual-only billing in v1) |
| Charter Member rate (per D-018 amended) | **$90/year** (25% off) |

Includes (per claimed listing):
- Logo on profile
- List of "go-to" insurance companies the agent represents
- List of insurance products sold (commercial auto, GL, WC, etc.)
- List of states the agent operates in
- List of designations + specialties + company sizes serviced
- **Ability for DOT carriers to submit a quote request directly from this profile**
- Profile analytics (views + quote requests received)
- Training-cert badge eligibility (if cert holder per Learning Center)

**Direct quote requests from DOT carriers = FREE leads to the agent.** The $120/year listing fee IS the monetization; subsequent quote requests through the directory are not separately charged. ("The directory doing its job.")

**Annual-only billing in v1:** simpler billing surface than monthly. Annual prepay anchored at $120; monthly billing option may be added later if customer demand exists.

---

## 3. Agency multi-location listings

Same model as individual producer but for agencies with multiple offices:

| Field | Value |
|---|---|
| First location | **$120/year** |
| Each additional location | **$60/year per additional location** (50% off first location, recognizing diminishing marginal value per office) |
| Charter Member rate | **$90 first + $45/loc** (25% off across the board) |

**Example:**
- Single-office agency: $120/yr (charter: $90/yr)
- 3-office agency: $120 + 2 × $60 = $240/yr (charter: $90 + 2 × $45 = $180/yr)
- 5-office agency: $120 + 4 × $60 = $360/yr (charter: $90 + 4 × $45 = $270/yr)

---

## 4. Insurance carrier / wholesaler / MGA listings — NEW TIER (locked 2026-05-15)

For insurance carriers, wholesalers, MGAs, and program administrators who want to be discoverable to retail trucking agents looking for new markets.

| Field | Value |
|---|---|
| **Monthly fee** | **$1,000/month** |
| Charter Member rate (D-018 amended) | **$750/month** (25% off; unusual buyer fit but offer extends per D-018 amended for any qualifying Charter Member) |

**Strategic rationale (Master O 2026-05-15): scarcity + recruiting value.**

> "Wholesalers/Carriers pay a premium because there are less, and they can be there to recruit agencies that miss out on leads because they are missing markets. We will notify them on their dashboard of missed opportunities due to the analysis and market access. We can recommend access points to carriers and wholesalers."

Includes:
- Premium capabilities directory profile (deep build-out — appetite, classes, geography, programs, premium ranges, contact info for new-business + production teams)
- **Listed in periodic email blasts + newsletters to trucking retail agents** (high-frequency exposure to the agent audience)
- **"Missed opportunities" dashboard** — wholesaler/insurance carrier sees which agents in their territory have lost recent quote requests because they were missing this market access; offers a recruiting flywheel
- **Access-point recommendations** — Seven16 surfaces specific agents who would be high-value targets for the wholesaler to recruit
- Inbound recruiting CTA on the directory profile (agents browsing wholesaler listings can submit appointment requests)

**Why $1,000/mo (vs. carrier free or agent $120/yr):** there are dramatically fewer wholesalers / insurance carriers than retail agents (single-digit thousands vs. tens of thousands) AND each wholesaler's economic upside from recruiting even ONE good producing agent is in the high-five to six figures of annual premium. The $12,000/yr listing fee is trivial against that economic return.

---

## 5. Annual prepay convention

In this refined model, paid directory tiers are **annual-only billing in v1**:
- Producer: $120/yr
- Agency: $120/yr first loc + $60/loc additional
- Wholesaler / insurance carrier: $1,000/mo billed monthly (large ARR commitment; monthly cash flow is real for buyers at this scale)

Annual prepay simplifies billing operations + reduces per-transaction Stripe fees + gives Seven16 cash-flow predictability.

---

## 6. Multi-listing discount (when one account holds multiple listing types)

When a single account holds multiple listing types simultaneously, bundle pricing applies:
- **2 listings**: 5% off total
- **3+ listings**: 10% off total

Applies to non-charter rates. Charter rate is already best-in-class.

**Example:** A small agency where the principal also has a Producer listing AND is themselves a producer in their own agency = Agency $120 + Producer $120 - 5% (multi-listing) = $228/yr total (vs. $240 separately).

---

## 7. What's NOT charged

- Free basic carrier / agent / wholesaler listing (auto-seeded) — always free
- Claim flow — always free
- Browsing the directory as a visitor — always free
- Training-cert badge display on DOTAgencies — free (cert itself paid; see `PRICING_LEARNING_CENTER.md`)
- Direct quote requests from carriers to agents via the directory — free (covered by agent listing fee)
- Cross-linking to product surfaces (DOT Intel, Agency Signal) from directory profiles — always free
- **DOT carriers claiming + upgrading their listing — FREE** (per refined model 2026-05-15)

---

## 8. Lead routing — separate from listing fees (operational detail)

Direct quote requests from carriers visiting an agent's claimed listing = FREE leads (covered by the $120/yr listing fee).

**Marketplace-routed exclusive leads** (when a DOT carrier searches via the dotcarriers.io main flow and the system matches them algorithmically to a qualified agent) = SEPARATE paid product, NOT covered by the directory listing fee. See family memory `project_dotagencies_dotcarriers_monetization_model.md` for the exclusive-lead pricing ($100–300/lead range) and routing-match criteria.

**Master O 2026-05-15 update on routing match criteria:**

> "When a DotIntel carrier/dot trucker requests a quote they will be routed to a qualified agency contact. For example a 25 fleet account and larger needs some one with experience, and we also look at the insurance companies they are appointed with and the risk profile of the account and if its a match the lead is routed. If not it goes to the next agency that qualified based on filters and abilities and designations and agency size are all factors to determine if its a match between the carrier/dot making the quote request and the retail agency."

Match scoring factors documented for the routing engine build:
- **Fleet size of the requesting carrier** (e.g., 25+ PU needs experienced agent)
- **Insurance companies the agent is appointed with** (must include carriers that have appetite for the requesting carrier's risk profile)
- **Risk profile of the account** (CSA scores, claims history, operating radius)
- **Agent designations** (TRS, specialty certifications, etc.)
- **Agent specialties + states served + company sizes serviced**
- **Agency size + experience** (e.g., 25-fleet account routed to agencies with sufficient handling capacity)

**Routing fallback:** if first-matched agency is not a fit or doesn't respond within SLA, system routes to next qualified agent per the same scoring criteria. Memory `project_dotagencies_dotcarriers_monetization_model.md` updated with these match-scoring specifics.

---

## 9. Strategic rationale (refined model)

- **Carriers free + agents paid + wholesalers premium-paid** = three-sided marketplace with the highest-value side paying the most
- **$120/yr agent listing** is a no-brainer for any active trucking producer (returns on 1 quote-request lead)
- **$1k/mo wholesaler listing** captures the high-LTV side that benefits most from directory exposure
- **Free carrier listings** maximize directory inventory → marketplace becomes more valuable for paying sides → flywheel
- **Charter Member 25% off** applies across all paid tiers; Charter wholesaler unusual but extends per D-018 amended

---

## 10. Open numeric refinements

- **Wholesaler / insurance-carrier listing add-ons** (sponsored email blast slots, recruitment-event sponsorship, branded content) — Phase 2 monetization
- **Agency multi-location pricing at $60/loc additional** — verify against margin once first 5 multi-location deals close
- **Monthly billing option for producer + agency tiers** — add if customer demand exceeds annual-only friction
- **Wholesaler / insurance-carrier $1k/mo annual prepay discount** — currently no discount; consider 10% off ($10,800/yr) if cash-flow signal supports it

---

## 11. When this doc gets out of date

Update when: (a) carrier listings re-introduce a paid tier, (b) producer or agency annual price changes, (c) wholesaler / insurance-carrier $1k/mo tier price changes, (d) sponsored add-ons ship for wholesaler tier, (e) monthly billing option is added for producer / agency tiers.

---

*End PRICING_DIRECTORY_LISTINGS.md — REFINED 2026-05-15*
