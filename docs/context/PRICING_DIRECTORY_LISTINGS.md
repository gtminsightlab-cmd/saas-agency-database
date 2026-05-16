# Directory Listings — Pricing Spec

**Locked:** 2026-05-15
**Parent decision:** D-021 (Seven16 Credits & Usage Pricing Architecture) §5
**Surfaces:** dotcarriers.io (carrier directory), dotagencies.io (agent + wholesaler directory)
**Buyers:** owner-operators / fleets (carrier listings), retail producers / agencies (agent listings), wholesalers / MGAs (wholesaler listings)

---

## 1. Free vs. paid listings

**Free tier (every entity):**
- Basic auto-seeded listing visible in directory
- Limited profile fields (name, city, state, basic identifiers)
- Owner can CLAIM the listing (free) to gain edit rights

**Paid tier (claimed + upgraded):**
- Full profile customization (description, specialties, photos, contact details, hours, service area)
- Premium placement (sort priority within filter results)
- Direct contact CTAs (request quote, schedule call, book demo)
- Analytics on profile views + contact attempts
- Badge eligibility (e.g., training-cert-completion badge on DOTAgencies)

---

## 2. Producer / agency listings (DOTAgencies)

### 2.1 Retail Producer (individual)

| Field | Value |
|---|---|
| Free listing | Auto-seeded basic profile, claimable |
| **Paid Producer listing** | **$20/month** |
| Charter Member rate (D-018) | **$15/mo** (25% off) |

Includes:
- Full profile customization
- Specialty tags (trucking, construction, agriculture, etc.)
- Direct contact CTA from prospects
- Training-cert badge visibility (if cert holder)
- Profile analytics

### 2.2 Agency (multi-location)

| Field | Value |
|---|---|
| Free agency listing | Auto-seeded basic profile, claimable |
| **Paid agency — first location** | **$50/month** |
| **Each additional location** | **$25/month per location** |
| Charter Member rate (D-018) | **$37.50 first location + $18.75 per additional** (25% off) |

Includes (per location):
- Full agency profile customization
- Office hours, service area, license info
- Team member display (producers under this agency, each with their own claimed Producer listing)
- Cross-link to all producer profiles under the agency
- Profile analytics per location

**Example pricing:**
- Single-office agency: $50/mo (charter: $37.50/mo)
- 3-office agency: $50 + 2×$25 = $100/mo (charter: $37.50 + 2×$18.75 = $75/mo)
- 5-office agency: $50 + 4×$25 = $150/mo (charter: $37.50 + 4×$18.75 = $112.50/mo)

---

## 3. DOT carrier listings (DOTCarriers)

Pricing scales by fleet size — power unit (PU) bands.

| Tier | Power Units | **Monthly fee** | Charter rate (25% off) |
|---|---|---|---|
| **Small carrier** | 1–3 PU | **$20/month** | **$15/mo** |
| **Mid-fleet carrier** | 4–25 PU | **$50/month** | **$37.50/mo** |
| **Large-fleet carrier** | 50+ PU | **$65/month** | **$48.75/mo** |

Includes:
- Full carrier profile (operating details, types of loads, operating distance, years in business, web presence, current insurance relationships)
- Premium placement in carrier directory results
- Quote-request routing (when renewal windows approach, see `project_dotagencies_dotcarriers_monetization_model.md` for routing rules)
- Profile analytics
- Direct prospect CTA from agents browsing the directory

**Note:** the 26–49 PU range is not explicitly covered above; defaulting to Mid-fleet ($50/mo) per D-021 §5 ("higher band may be added later" — track for refinement if customer signal suggests a band gap).

---

## 4. Annual prepay discount

Available at all listing tiers: **10% off when paid annually** (12 months for the price of ~10.8).

Charter Members still get their 25% off the monthly rate AND can stack annual prepay for additional savings:
- Charter Producer paid annually: $15 × 12 × 0.90 = **$162/yr** (vs. $20 × 12 = $240 standard monthly, or $216 standard annual)
- Charter 3-office agency paid annually: $75 × 12 × 0.90 = **$810/yr** (vs. $1,200 standard monthly, $1,080 standard annual)

---

## 5. Multi-listing discount (for entities with multiple listing types)

When a single account holds multiple listing types simultaneously, bundle pricing applies:

- **2 listings** (e.g., agency + producer): 5% off total
- **3+ listings**: 10% off total
- Applies to non-charter rates; charter rate already best-in-class

(Example: a small agency where the principal also has a Producer listing = $50 + $20 = $70 standard → $66.50 with 5% multi-listing discount.)

---

## 6. What's NOT charged

- Free basic listing (auto-seeded) — always free
- Claim flow — always free
- Browsing the directory as a visitor — always free
- DOTAgencies Learning Center cert badge display — free (cert itself is paid; see `PRICING_LEARNING_CENTER.md`)
- Cross-linking to product surfaces (DOT Intel, Agency Signal) from directory profiles — always free

---

## 7. Strategic rationale

- **Free basic + paid premium** maximizes directory inventory (every entity gets seeded) while monetizing the entities who actually want visibility + control
- **Fleet-size bands on carrier listings** reflect value asymmetry — a 50-PU carrier extracts ~3× the value of a 1-PU operator from the same directory presence
- **Location-based agency pricing** reflects how agencies actually scale (each new office is a new lead-generation surface, deserves separate fee)
- **Charter Member 25% off** compounds with credit + TIQ + alerts charter rates per D-018 amended
- **Annual prepay 10% off** is the standard SaaS lever for cash-flow predictability

---

## 8. Open numeric refinements

- **26–49 PU band** for DOTCarriers — currently defaults to Mid-fleet ($50/mo); may need its own band if data shows different value capture
- **Add-on premium features** (top-of-search-results sponsored placement, etc.) — Phase 2 monetization
- **Lead-routing fees** for DOTCarriers carriers receiving routed quote requests — separate from listing fee; see `project_dotagencies_dotcarriers_monetization_model.md` (exclusive agent-paid leads $100–300, carrier-free leads — that monetization is for AGENTS receiving leads, not for carriers paying for listing)
- **Verified-badge tier** (separate badge for agencies that pass a verification process) — Phase 2; current badge is training-cert-derived

---

## 9. When this doc gets out of date

Update when: (a) any listing price changes, (b) a new PU band is added for carriers, (c) annual prepay discount or multi-listing discount changes, (d) verified-badge tier ships, (e) sponsored placement product ships.

---

*End PRICING_DIRECTORY_LISTINGS.md*
