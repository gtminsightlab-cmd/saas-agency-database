# Family-Hub Session 22 — Pricing Architecture Marathon (2026-05-15)

**Date:** 2026-05-15 (single multi-arc family-hub session, sprawling across the full day)
**Repo:** `saas-agency-database` (family hub)
**Branch:** `main`
**Predecessor:** [`SESSION_21_PRICING_HANDOFF.md`](SESSION_21_PRICING_HANDOFF.md) (2026-05-12 — D-014 + D-015 locked)
**HEAD at session close:** TBD (after final commits this session)

> **Cross-repo touch note:** this session touched both `saas-agency-database` (family hub — DECISION_LOG + memory + 4 new PRICING_*.md docs) and `seven16-distribution` (TIQ STATE + BACKLOG + SESSION_2_HANDOFF banner + SESSION_3_PROMPT cascade). Per Working Agreement Rule 2 the cross-repo touch is intentional because the family-hub pricing decisions cascade structurally into TIQ-side rendering surfaces; both sides are committed + pushed.

---

## Theme

**Full Seven16 pricing architecture locked.** Started the day with D-014 + D-015 in DECISION_LOG (plus the soon-to-supersede D-019 attempt + the still-valid D-020). Ended the day with **6 family decisions + 4 operational pricing docs + 1 placeholder** covering every monetizable surface in the portfolio.

The session ran in 6 distinct arcs:

1. **D-018 Charter Member program** — initial lock as "$89.50/mo Charter Bundle" (50% off DOT Intel Business + Agency Signal Growth)
2. **D-019 TIQ tier pricing** — Starter $99 / Growth $299 / Scale $799 — **superseded same-day** (see arc 4)
3. **D-020 TIQ positioning lock** — "Run your MGU like a bigger shop" — still valid
4. **D-021 Pricing Architecture Pivot** — universal credit currency at $0.15/credit + à la carte SKUs + cross-sell discounts via volume bonus bands. Supersedes D-019, amends D-018 (Charter Member shape → "best pricing tier permanently across everything you buy"), amends D-014 base credit price $0.29 → $0.15
5. **TIQ pricing numeric refinement** — Launch $500 / Growth $1,500 / Scale $4,000 monthly + overage + storage + onboarding model. Locked in new `PRICING_THRESHOLD_IQ.md`
6. **DOT Alerts pricing numeric refinement** — flat tier bands $25 → $50 → $90 → $175 → $350 → $500+ replacing D-021's rough base+per-unit model. Locked in new `PRICING_DOT_ALERTS.md`
7. **Charter Member integrations locked + remaining specs shipped** — TIQ + Alerts + Directory all integrated at 25% off; Lead Downloads + Directory Listings + Learning Center placeholder shipped

---

## What's in family DECISION_LOG at session close

| # | Decision | Status |
|---|---|---|
| D-018 | Charter Member program | ✅ Locked + AMENDED by D-021 (best-tier-on-everything shape) |
| D-019 | TIQ subscription tiers ($99/$299/$799) | ⚠️ SUPERSEDED by D-021 (preserved per Rule 4) |
| D-020 | TIQ positioning lock | ✅ Locked + still valid (independent of pricing structure) |
| D-021 | Seven16 Credits & Usage Pricing Architecture | ✅ Locked — universal credit currency, à la carte SKUs, cross-sell discounts |

---

## What's in `docs/context/` at session close (operational pricing docs)

| File | Scope | Status |
|---|---|---|
| `PRICING_CREDITS_AND_TOPUPS.md` | D-014 original credit engine spec | Pre-existing; needs amendment note for D-021 base price change ($0.29 → $0.15) — captured in D-021 entry; can be done in a follow-up |
| `PRICING_ENTERPRISE_LAYER.md` | D-015 Enterprise+ state slider | Pre-existing; untouched this session |
| **`PRICING_THRESHOLD_IQ.md`** | TIQ tiers + onboarding + Charter integration | ✅ NEW this session; full spec with Charter Member integration locked (option (a): 25% off + always Scale-tier overage) |
| **`PRICING_DOT_ALERTS.md`** | Flat-tier-band alerts pricing + Charter integration | ✅ NEW this session; full spec with Charter Member integration locked (option (a): 25% off whatever tier) |
| **`PRICING_DIRECTORY_LISTINGS.md`** | Producer / agency / DOT carrier listing pricing + Charter integration | ✅ NEW this session; full spec including annual prepay + multi-listing discount + 25% Charter |
| **`PRICING_LEAD_DOWNLOADS.md`** | Universal credit consumption rates + lookup loyalty bumps + full-database SKU | ✅ NEW this session; pulls together D-021 §2/§3/§4 into a focused operational doc |
| **`PRICING_LEARNING_CENTER.md`** | DOTAgencies Learning Center pricing | ⚠️ PLACEHOLDER this session; 3 pricing-model decisions surfaced for Master O input; CTO recommendations included |

---

## Charter Member program — fully integrated state

**D-018 amended by D-021 gave the Charter Member shape ("best pricing tier permanently across everything they buy"). Today's session locked the SURFACE-SPECIFIC integrations:**

| Surface | Charter Member benefit | Locked in |
|---|---|---|
| **Universal credits** | +40% bonus on every top-up forever (effective ~$0.107/credit) | D-018 amended by D-021 |
| **TIQ subscription** | 25% off subscription at whatever tier + always Scale-tier overage rate ($1/sub) | PRICING_THRESHOLD_IQ.md §10 |
| **DOT Alerts** | 25% off whatever fleet-size tier they're on | PRICING_DOT_ALERTS.md §8 |
| **Directory listings** | 25% off Producer / Agency / DOT carrier listings (+ stack with annual prepay) | PRICING_DIRECTORY_LISTINGS.md §2-§3 |
| **Lead downloads + DOT lookups** | Universal +40% credit bonus applies (no separate discount needed; already best-rate) | PRICING_LEAD_DOWNLOADS.md §1 |
| **Learning Center** | 25% off (pending pricing-model lock per §"NEEDS MASTER O DECISION" in LEARNING_CENTER doc) | PRICING_LEARNING_CENTER.md (placeholder) |

**Compound charter member savings example:** 15-truck fleet running TIQ Growth + Agency Signal credits + DOT Alerts + claimed agency listing = **$5,000+/year baseline savings, scaling much higher with usage volume.**

---

## What's NOT done — queued for follow-up

### Top of family-hub queue (Master O input required)

1. **Learning Center pricing model lock** — pick from §"NEEDS MASTER O DECISION" in `PRICING_LEARNING_CENTER.md`. Three sub-decisions: (a) per-module vs bundle vs hybrid vs subscription, (b) team package model, (c) future-modules policy. CTO recommendations included for each. ~10 min once decided.

### TIQ-side queue (Active arc per `seven16-distribution/docs/BACKLOG.md`)

2. **SESSION_3: Build TIQ `/pricing` page on marketing v2 surface.** Now has all real numbers to render (TIQ tiers + DOT Alerts tiers + directory listings + lead-download credit math + Charter Member compound math). Only Learning Center pricing is hand-wave-pending. Estimated ~120 min, ~5-6 files. Paste-ready prompt at `seven16-distribution/docs/handoffs/SESSION_3_PROMPT.md`.

### Charter Member deck (Master O's action)

3. **Update Charter Member deck slides 9, 10, 17, 18 before Gamma ship.** See banner at top of `seven16_charter_member_deck_FINAL.md` on Desktop — lists which slides need refresh and what locked numbers to cite. ~20-30 min of slide rewrite, then Gamma import is clean.

### Other pricing not yet specced (lower priority, can wait for Phase 2)

4. **Growtheon SKU pricing** — D-008/D-010 says Growtheon is a third-party SaaS reseller arrangement; pricing model + reseller margin still open (open question #2 in DECISION_LOG §9). Not blocking anything immediate.
5. **Quote-routing fees for DOT Carrier agent-paid leads** — exclusive lead pricing $100-300 per `project_dotagencies_dotcarriers_monetization_model.md` memory; needs its own operational spec when the marketplace ships.
6. **Full-database freshness refresh pricing** — $12,500 Full Database SKU includes 12-month refresh; renewal pricing TBD when first FDS customer renews.
7. **`PRICING_CREDITS_AND_TOPUPS.md` amendment note** — currently the original D-014 spec; should get an "AMENDED 2026-05-15 by D-021 — base credit price $0.29 → $0.15; canonical now in D-021" banner. Trivial follow-up; included in this commit cycle.

---

## How to pick up the family-hub thread

Next family-hub session opens with:
1. Read `docs/handoffs/SESSION_22_PRICING_HANDOFF.md` (this file)
2. Read `docs/context/DECISION_LOG.md` (D-001 through D-021)
3. Decide Learning Center pricing model OR move to Growtheon spec OR sequence Stripe catalog migration around D-021 architecture
4. Family-hub queue priorities visible in `saas-agency-database/docs/BACKLOG.md` (was last updated for AS Session 4; should refresh after this pricing arc)

Most likely next strategic call: **Stripe catalog migration around D-021 architecture.** Every locked pricing surface now has real SKUs to render → Stripe catalog can be built end-to-end → checkout becomes possible → Charter Member outreach can route to a working checkout. That's a SESSION_23 candidate (~1 full session, code + Stripe MCP + careful per-SKU work).

---

## Cross-product implications (already cascaded)

- `seven16-distribution/docs/STATE.md` — TIQ pricing section reflects locked numbers + DOT Alerts table + cross-references to all PRICING_*.md docs
- `seven16-distribution/docs/BACKLOG.md` — Active arc (SESSION_3 /pricing page) has all real numbers
- `seven16-distribution/docs/handoffs/SESSION_2_HANDOFF.md` — banner flagging D-019 supersession (preserved body per Rule 4)
- `seven16-distribution/docs/handoffs/SESSION_3_PROMPT.md` — fully rewritten with real TIQ + DOT Alerts numbers + Charter integration mechanics
- `~/.claude/.../memory/project_charter_member_program.md` — Charter Member offer concrete across all surfaces
- `~/.claude/.../memory/MEMORY.md` — D-range bumped through D-021
- Charter Member deck on Desktop — banner reflecting all 5 cascading updates (D-021 pivot, TIQ tiers, DOT Alerts tiers, directory + lead download pricing, Charter integration locks)

---

## Commits this session (chronological across the day)

| Commit | Repo | Theme |
|---|---|---|
| `c4a756f` | saas-agency-database | docs(decision-log): D-018 Charter Member program — locked |
| `d224d06` | seven16-distribution | docs(session-2): Charter-readiness Slice 1 closed — TIQ pricing + positioning locked (D-019 + D-020) |
| `8d9148d` | saas-agency-database | docs(decision-log): D-019 TIQ pricing + D-020 TIQ positioning locked |
| `f179469` | saas-agency-database | docs(decision-log): D-021 Seven16 Credits & Usage Pricing Architecture locked (supersedes D-019) |
| `3ec9f4c` | seven16-distribution | docs(d-021-pivot): rebuild TIQ docs around D-021 same-day supersession of D-019 |
| `dbe79e6` | saas-agency-database | docs(pricing): PRICING_THRESHOLD_IQ.md operational spec — TIQ tiers locked |
| `5000c3c` | seven16-distribution | docs(tiq-pricing): TIQ tier numbers locked — cascade STATE + BACKLOG + SESSION_3 prompt |
| `0f97bdc` | saas-agency-database | docs(pricing): PRICING_DOT_ALERTS.md operational spec — flat tier bands locked |
| `25aad8b` | seven16-distribution | docs(dot-alerts-pricing): cascade flat-tier-band alerts pricing to TIQ docs |
| (this commit) | saas-agency-database | docs(pricing-marathon-close): Charter integrations locked + 3 new pricing specs + SESSION_22 handoff |
| (this commit) | seven16-distribution | docs(charter-integration): cascade locked charter mechanics into TIQ docs |

---

## What I'd do if I were the next Claude opening this

**5-minute orientation:**
1. Read this handoff
2. Skim D-018/D-020/D-021 entries in DECISION_LOG.md (D-019 is superseded, skip)
3. Skim the 4 PRICING_*.md docs at high level

**Then pick one of three paths:**
- **Path A — Master O input received on Learning Center pricing model.** Lock §"NEEDS MASTER O DECISION" in PRICING_LEARNING_CENTER.md (~10 min); cascade to deck banner.
- **Path B — Stripe catalog migration.** Build the Stripe products + prices + entitlements that render the locked pricing architecture into actual checkout. ~1 full session. High leverage — unblocks Charter Member outreach revenue capture.
- **Path C — Quote-routing / lead marketplace spec.** Operationalize the dotagencies/dotcarriers monetization model memory entry into a real spec. Medium leverage — needed before lead marketplace launches but not on the critical path for first-revenue.

CTO recommendation: **Path A first** (~10 min, closes the last open pricing decision) **then Path B** (full session, unblocks revenue capture).

---

*End SESSION_22_PRICING_HANDOFF — family-hub pricing arc closed 2026-05-15.*
