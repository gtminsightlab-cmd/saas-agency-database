# Pricing — Credits and Top-ups (Consumption Engine)

**Date locked:** 2026-05-12
**Decision log entry:** D-014
**Companion to:** [MASTER_CONTEXT.md](MASTER_CONTEXT.md), [DECISION_LOG.md](DECISION_LOG.md)

> This brief defines the **consumption engine** that sits inside the locked subscription tiers from D-002 / D-005 / D-011. It does not change any locked price point. It adds three things: (1) included-credit allotments per tier, (2) a $5-increment top-up slider with stepped bonus credits, (3) credit-expiry rules. The small-firm wedge is preserved; heavy users self-extract additional spend through frictionless micro-transactions instead of being forced into a tier upgrade.

---

## 1. The mental model — two layers, one bill

| Layer | Purpose | Friction |
|---|---|---|
| **Membership floor** (locked subscription) | "I'm in." Predictable, expensible, under the $500 P-card threshold. | Low — one decision per year. |
| **Consumption engine** (credits + top-ups) | "I need more right now." Pay-per-value, frictionless. | Near-zero — one click, payment on file. |

The membership floor is what survives D-002 and D-011 untouched. The consumption engine is where the heavy user reveals their willingness-to-pay without us having to ask for it. **Cursor, Replit, Lovable, and Bolt all run this exact pattern**; the trends-report "126% YoY credits surge" is this model at scale.

---

## 2. Locked tiers — confirmed unchanged

Reproduced verbatim from DECISION_LOG.md §2 for context. No price changes proposed here.

| Product | Free | Mission | Mid | Enterprise |
|---|---|---|---|---|
| **Agency Signal** | Free | **$19 Producer** | $99 Growth | $399+ Enterprise |
| **DOT Intel** | Free | $29 Pro | $149 Business | $499+ Enterprise |
| **2027 Bundle** | — | — | **$179/mo** Seven16 Intelligence | — |

---

## 3. Credit allotments and per-tool costs

### 3.1 Credit reference value

**1 credit ≈ $0.29 face value at the subscription anchor** ($29 Pro → 100 credits). This anchor governs all per-tool credit costs below. Top-up users pay slightly more per credit at baseline ($0.20/credit at $5 = 25 credits) but unlock bonus tiers as they spend more (§4).

Trivial UI actions (browsing, filtering, viewing dashboards, name autocomplete) are always free. Credits are spent only at the moment of *value capture* — when the user pulls data, generates a report, or runs an analysis.

### 3.2 DOT Intel — per-tool credit costs

| Tool / action | Credits | Implicit $ value | Notes |
|---|---|---|---|
| Carrier name autocomplete + basic header card | Free | — | Drives discovery, never paywall |
| Basic FMCSA profile view (public fields) | 1 | $0.29 | The minimum-viable pull |
| **DOT lookup + PDF export** | **2** | $0.58 | Master O's anchor example. $29 Pro → 50 of these. |
| Risk-scored profile (+ PU band, historical insurance signal) | 3 | $0.87 | Adds Seven16 enrichment layer |
| Appetite-matched profile (+ Berkley parent/child lineage + wholesaler recommendation) | 5 | $1.45 | Full intelligence pull |
| Premium signal pull (CSA delta, MCS-90 flag, ghost-unit detection) | 2 each *or* included free in 3/5-credit pulls for Business tier | — | Business-tier perk converts these from per-pull cost to inclusion |
| Carrier safety report (rendered PDF, multi-section) | 3 | $0.87 | Brandable / exportable |
| **BDM pre-call brief** (AI-generated, multi-source synthesis) | 8 | $2.32 | The adoption driver per Prompt 6. High-value, justifies higher cost. |
| Bulk export (CSV, per 100 carriers) | 25 | $7.25 | Power-user move; intentionally pricier per record than single pulls |
| **PDF document upload + AI analysis** | 5 base + 1 per 5MB over baseline | $1.45+ | Variable — see §3.4 |
| **Image / placard upload** (OCR + classify) | 2 per image (≤5MB) | $0.58 | Flat for normal-sized images |
| API access (per call) | 1 per equivalent UI action | — | Business tier and up; metered same as UI |

### 3.3 DOT Intel — monthly allotments

Practical capacity column reflects a **balanced usage mix** (mostly standard pulls with some enrichment). Heavy mix of premium tools shifts the user toward top-ups — that's the engine working as designed.

| Tier | Subscription | Included credits / mo | Rollover cap | Practical capacity at balanced mix |
|---|---|---|---|---|
| Free | $0 | 25 | None | ~12 basic pulls or ~8 PDF exports |
| **$29 Pro** | $29/mo | **100** | 200 (2× cap) | ~50 DOT lookups + PDF exports, *or* ~33 enriched profiles, *or* ~20 appetite-matches, *or* ~12 BDM briefs |
| **$149 Business** | $149/mo | **600** + premium signals included in 3/5-credit pulls | 1,200 (2× cap) | ~300 DOT lookups + PDF exports, or proportional mix |
| $499+ Enterprise | quote | Effectively unlimited normal use + API + outcome SKU eligibility | n/a | — |

### 3.4 Variable consumption — uploads and AI analysis

Some tools' real cost to us scales with content size (Claude API tokens, OCR compute). These tools meter by content weight to keep margins predictable.

| Operation | Base cost | Surcharge | Hard cap |
|---|---|---|---|
| PDF upload + analysis (≤5 MB) | 5 credits | — | — |
| PDF upload + analysis (>5 MB) | 5 credits | +1 credit per 5 MB over baseline | 25 credits / doc (~100 MB) |
| Image / placard upload (≤5 MB) | 2 credits | — | — |
| Image / placard upload (>5 MB, e.g., scanned multi-page) | 2 credits | +1 credit per 5 MB | 10 credits / image |
| Batch upload (multiple files) | Sum of individual costs | — | — |

**UX rule:** show estimated credit cost *before* upload, computed from file size client-side. The user clicks "Analyze (8 credits)" — never gets surprised. If the estimate is off because actual content density is higher, the system absorbs the difference for that session and recalibrates the estimator.

### 3.5 Agency Signal — per-tool credit costs

| Tool / action | Credits | Implicit $ value |
|---|---|---|
| Agency profile view (full detail) | 1 | $0.29 |
| Export single record (CSV or contact append) | 2 | $0.58 |
| X-date pull (single agency) | 3 | $0.87 |
| Email enrichment (per verified contact) | 1 | $0.29 |
| Phone enrichment (per verified contact) | 2 | $0.58 |
| Carrier appointment crosswalk (per agency) | 2 | $0.58 |
| LinkedIn append (via licensed enrichment partner) | 5 | $1.45 |
| Bulk export (per 100 records) | 25 | $7.25 |

### 3.6 Agency Signal — monthly allotments

| Tier | Subscription | Included credits / mo | Rollover cap |
|---|---|---|---|
| Free | $0 | 10 | None |
| **$19 Producer** | $19/mo | **50** | 100 (2× cap) |
| **$99 Growth** | $99/mo | **400** | 800 (2× cap) |
| $399+ Enterprise | quote | Effectively unlimited normal use | n/a |

---

## 4. The top-up slider — $5 increments, stepped bonus credits

When users run out of monthly credits, top-ups are available to **every paid tier**. The purchase surface is a single slider that snaps in $5 increments.

### Slider mechanic

- **Increment:** $5 (the psychological frictionless unit — see §6 for behavioral rationale)
- **Visual:** drag-to-spend slider with live credit count + bonus-tier badge
- **Bonus tiers** snap at thresholds, not linearly — so crossing a tier is a visible reward moment

### Bonus ladder (applies to both products) — extends to $1,000

The slider has no hard cap. As Master O slides higher, each new bonus tier unlocks visibly. The user always sees: dollars spent, bonus % unlocked, total credits received, effective rate.

| Slider position | Spend | Bonus credits | Credits received | Effective rate |
|---|---|---|---|---|
| 1 increment | $5 | +0% (baseline) | 25 | $0.200 / credit |
| 2–3 increments | $10 – $15 | **+10%** | 55 / 83 | $0.182 / $0.181 |
| 4–9 increments | $20 – $45 | **+20%** | 120 – 270 | $0.167 |
| 10–19 increments | $50 – $95 | **+30%** | 325 – 618 | $0.154 |
| 20–39 increments | $100 – $195 | **+35%** | 675 – 1,317 | $0.148 |
| 40–99 increments | $200 – $495 | **+40%** | 1,400 – 3,465 | $0.143 |
| 100–199 increments | $500 – $995 | **+45%** | 3,625 – 7,213 | $0.138 |
| 200+ increments | **$1,000+** | **+45% (cap)** | 7,250+ | $0.138 |

**Why the cap stays at +45%, not climbing further:** Past $1,000, the customer should be on Enterprise (D-014 §7). The slider going indefinitely with bigger discounts cannibalizes Enterprise contract value. +45% at $1,000 is the bonus ceiling; for higher commitment, route to a quoted Enterprise contract that includes outcome-SKU access, dedicated support, and SSO — perks the slider doesn't unlock at any volume.

**Why bonus credits, not a price discount?** "Get 30% more credits" frames the value as abundance (more fuel). "Pay 30% less" frames it as a discount (cheaper fuel). Abundance framing drives higher average spend. Twin Agents proves this empirically — Master O's lived $50/week was abundance behavior, not discount-hunting.

**Where the slider stops mattering:** A user buying $500+ in credit packs has effectively self-identified as Enterprise-ready. The in-app flow should detect this pattern (3+ top-ups above $200 in a 30-day window) and surface a one-click "Talk to us about a contract" CTA. The slider stays available — but the sales motion gets warmed up.

### Worked example (matches Master O's vibe-coding pattern)

A $29 Pro user runs out of credits mid-week while prospecting trucking accounts:

1. Day 1: Drags slider to $5 → 25 credits. Spends them by EOD.
2. Day 2: Drags to $5 again → 25 credits. Same pattern, three more times that week.
3. Day 5: Realizes they're spending — drags to $20 → 120 credits (+20% bonus unlocked). One purchase covers next 4 days.

Total week: $5 × 4 + $20 × 1 = **$40 in top-ups** on top of the $29 subscription. **$69 total spend on a tier with $29 headline price.** No tier upgrade decision. No procurement conversation. The user feels in control the entire time because every purchase was a $5 or $20 click.

---

## 5. Credit expiry — hybrid rules

| Credit source | Expiry rule | Reason |
|---|---|---|
| **Subscription credits** (the monthly allotment) | Expire at end of next month — i.e., 1-month rollover cap at 2× monthly allotment | Forces usage, prevents stockpiling, drives top-up purchases in heavy weeks |
| **Top-up credits** | **Never expire** | Rewards larger packs, builds trust, removes use-it-or-lose-it anxiety |
| **Wallet display** | Always shows total balance with subscription credits consumed first (FIFO) | User intuition matches — "spend the free stuff first" |

This is the cleanest customer story while preserving the consumption loop. Cursor and Replit both run variants; the never-expire top-up is what makes the slider purchases feel safe enough to make casually.

---

## 6. UX placement — where the slider appears

The slider's effectiveness depends entirely on **when** it appears, not just that it exists.

| Trigger | Surface | Behavior |
|---|---|---|
| **10% credits remaining** | Persistent header chip — "12 credits left → top up" | Soft nudge before the wall. Conversion at this moment is highest. |
| **Action would consume credits user doesn't have** | Inline modal at the moment of value capture — "This pull costs 3 credits. You have 1. $5 unlocks 25 more." | Conversion 5–10× higher than email reminders. Never break the user flow. |
| **End of session** | Optional email recap (only if user opted in) | Reminder without pressure. |

**Three things to NEVER do:**

1. ❌ Force-upgrade to higher tier when credits run out. Let the user stay at $29 Pro and top up forever if they want — they tip you for free.
2. ❌ Hide the slider behind a billing page. It must appear inline, at the moment of need.
3. ❌ Apply rate-limits or hard paywalls. The product should always remain *usable*; users without credits see public-data tier output (basic FMCSA fields only) instead of being blocked.

---

## 7. What this brief does NOT change

Explicit deferrals to keep blast radius small:

| Item | Status | Picked up in |
|---|---|---|
| All locked subscription tiers (D-002, D-005, D-011) | **Unchanged.** | — |
| 2027 Bundle at $179/mo (D-005) | **Unchanged.** Bundle gets combined credit allotment (DOT Intel Business credits + Agency Signal Growth credits). | — |
| AgencySignal Enterprise+ (state-based ladder, Neilson-replacement layer) | **Deferred** — separate brief targeting the second ICP (Distribution Expander), explicitly outside D-011's design target. | `PRICING_ENTERPRISE_LAYER.md` (next) |
| Distribution+ outcome SKU (per-appointment success fee) | **Deferred** — same brief. | `PRICING_ENTERPRISE_LAYER.md` |
| Threshold IQ pricing | **Deferred** (D-009 — pricing set in build session, family-integration session pending). | Future Threshold IQ family-integration session |
| Growtheon margin model | **Deferred** (open question #2). | Future Growtheon offer-page session |

---

## 8. Open questions — surface when implementing

1. **Shared credit wallet across DOT Intel + Agency Signal?** Bundling math would benefit ("$179 bundle = 1,000 credits, spend them anywhere"). But it complicates per-product cost accounting and entitlement logic. Recommendation: launch with product-scoped wallets, design schema with `wallet_scope` enum so we can flip to shared without migration pain. *Surface when:* implementing Stripe metering + Supabase wallet schema.
2. **Free-tier credit refresh cadence — monthly or weekly?** Weekly (7 credits/wk vs. 25/mo) might smooth the funnel but adds engineering work. Recommendation: start monthly; revisit if Day-30 free-to-paid conversion is under 15%.
3. **Bonus-tier thresholds (10% / 20% / 30%) vs. continuous curve.** Stepped tiers create visible reward moments; continuous curves feel smoother. Recommendation: stepped at launch (matches Twin Agents pattern Master O has lived). A/B test against linear curve at month 3 if data warrants.
4. **Credit cost calibration.** $0.29/credit reference value (anchored to $29 → 100) assumes acceptable willingness-to-pay at the per-tool costs in §3.2. Validate against demo conversations before printing on the page. *Surface when:* running the 5–8 ICP demos.
5. **Unit-economics check on variable-consumption tools.** PDF analysis at 5 credits ($1.45 face) needs to clear our actual Claude API + OCR cost per doc with target 70%+ gross margin. If a PDF analysis costs us $0.50, 5 credits is fine ($0.95 margin). If it costs $1.00, 5 credits is barely break-even and the base should be 7+ credits. *Surface when:* engineering scopes the PDF-analysis feature and can estimate per-doc API cost.
6. **Bonus-tier ceiling at +45% / $1,000.** This cap exists to protect Enterprise contract value, but it's the call most likely to need adjustment based on actual usage. If self-serve users routinely top up $500+ without converting to Enterprise, the cap is doing the wrong job. *Surface when:* 90 days post-launch, against revenue-by-channel data.

---

## 9. Schema implications (heads-up to engineering)

To implement this brief, the platform needs:

- **`credit_wallets`** table: `tenant_id`, `product_id`, `subscription_balance`, `subscription_expires_at`, `topup_balance`
- **`credit_ledger`** table: append-only entries for grants (subscription refresh, top-up purchase) and consumption (per-action spend). Required for audit and dispute resolution.
- **`credit_consumption_rates`** table: per-action cost lookup, keyed by `product_id` × `action_type` × `tier_id`. Allows tier-specific rates (e.g., Business tier pays the same 3 credits for an enriched pull but gets premium signals included).
- **Stripe metered billing** integration for top-up purchases. One-click purchase with saved payment method, ≤ 2-second latency to credit availability.
- **In-app slider component** with live preview of credits + bonus tier as the user drags.

None of this is built yet. Schema design + Stripe wiring lives in the next implementation session.

---

— end of brief —
