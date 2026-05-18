# Stripe Catalog — Seven16 Family

**Locked:** 2026-05-18 (Path A Stripe catalog migration per session 25 continuation)
**Stripe account:** `acct_1TLUF6HmqSDkUoqw` ("Seven16" — sandbox, shared with DOT Intel)
**Parent decisions:** D-014 / D-015 / D-018 / D-021 / D-022 / D-023
**Companion specs:** `PRICING_CREDITS_AND_TOPUPS.md`, `PRICING_DOT_ALERTS.md`, `PRICING_DIRECTORY_LISTINGS.md`, `PRICING_LEAD_DOWNLOADS.md`, `PRICING_LEARNING_CENTER.md`, `PRICING_ENTERPRISE_LAYER.md`

> Canonical map of Stripe Product / Price IDs ↔ D-021 pricing surfaces. Read this when wiring checkout, computing entitlements, or troubleshooting which SKU corresponds to which AS feature. Sandbox-only until first paying customer triggers production cutover.

---

## Status legend

- ✅ **Active** — created 2026-05-18, ready for checkout
- ⚫ **Archived** — pre-D-021 era, retired
- 🟡 **Pending** — needs additional implementation (webhooks, entitlements migration)

---

## Surface 1 — Universal Credits (D-021 §3-4, D-014)

**Product:** `prod_UXg4cZMy59DjoS` — "Seven16 Credits — Universal Top-Up" ✅

One-time top-up purchases. 5 fixed price anchors mapped to D-021 bonus bands. Webhook reads `price.metadata.credits_delivered` to issue credits to account wallet. Charter Members always receive +40% bonus regardless of tier selected (override in webhook).

| Tier | Price ID | Amount | Credits | Bonus | Effective $/credit |
|---|---|---:|---:|---:|---:|
| Starter ($5-$49 band) | `price_1TYaoKHmqSDkUoqwYNMxbwoY` | $5.00 | 33 | 0% | $0.152 |
| Growth ($50-$199 band) | `price_1TYaoNHmqSDkUoqw6IlQOd9H` | $50.00 | 367 | +10% | $0.136 |
| Professional ($200-$499 band) | `price_1TYaoQHmqSDkUoqwMTbQYL0g` | $200.00 | 1,600 | +20% | $0.125 |
| Team ($500-$999 band) | `price_1TYaoSHmqSDkUoqwY62MiqDU` | $500.00 | 4,333 | +30% | $0.115 |
| Scale ($1,000+ band / Charter rate) | `price_1TYaoVHmqSDkUoqwPC4VETQ7` | $1,000.00 | 9,333 | +40% | $0.107 |

**Credit consumption** — handled by application layer per `PRICING_LEAD_DOWNLOADS.md`:
- 1 credit = standard contact download
- 0.5 credits = name-only record (no email/phone)
- 3 credits = DOT lookup + PDF export
- 0.8 credits/DOT = bulk DOT lookup (50+)
- 5 base + variable = PDF upload + AI analysis
- 2 credits/image = image OCR

**Schema (deferred):** `credit_wallets` + `credit_ledger` exist (scaffolded, 2 test rows); `credit_consumption_rates` missing — BACKLOG #6.

---

## Surface 2 — DOT Alerts (D-021 §6, locked `PRICING_DOT_ALERTS.md` 2026-05-15)

6 monthly recurring tiers. Flat per-band pricing (no per-unit add-on). Customers self-select based on driver count under their DOT number.

| Tier | Product ID | Price ID | Monthly | Driver cap |
|---|---|---|---:|---:|
| Owner-Operator | `prod_UXgH5AbZiR6Eg2` | `price_1TYawZHmqSDkUoqwixOJzGgN` | $25 | 1 |
| Small Fleet | `prod_UXgHskUN1S7HvJ` | `price_1TYawcHmqSDkUoqw7St5DXOA` | $50 | 2-5 |
| Growing Fleet | `prod_UXgHOH3fuoUaBH` | `price_1TYawfHmqSDkUoqwi8NKB5cX` | $90 | 6-15 |
| Regional Fleet | `prod_UXgHaf7nnlHq4v` | `price_1TYawiHmqSDkUoqwejfvfSDp` | $175 | 16-40 |
| Large Fleet | `prod_UXgHDyVqkkAwHm` | `price_1TYawlHmqSDkUoqwMCQFXi8w` | $350 | 41-100 |
| Enterprise (starting) | `prod_UXgHGYk4nOHvHz` | `price_1TYawoHmqSDkUoqwSmmXXOsw` | $500 | 101+ custom |

**Charter Member rate:** 25% off via coupon `L1Ngigfc` (see §Charter Member below). Owner-Op effective $18.75/mo, Scale Enterprise $375+/mo.

---

## Surface 3 — Directory Listings (D-021 §5, refined `PRICING_DIRECTORY_LISTINGS.md` 2026-05-15)

DOT carrier listings are FREE (no Stripe product). Monetization on the agent + wholesaler side.

| Tier | Product ID | Price ID | Cadence | Amount |
|---|---|---|---|---:|
| Retail Producer | `prod_UXgJ0gLtw1bFFb` | `price_1TYaxNHmqSDkUoqwUYzGFSdz` | annual | $120/yr |
| Agency First Location | `prod_UXgJt7MNhPL3qh` | `price_1TYaxQHmqSDkUoqwDVDva52J` | annual | $120/yr |
| Agency Additional Location (each) | `prod_UXgJ7CPfEWTUiW` | `price_1TYaxTHmqSDkUoqwqHz6IabN` | annual | $60/yr |
| Wholesaler / Insurance Carrier Premium | `prod_UXgJuNSmTWGtKj` | `price_1TYaxWHmqSDkUoqww9dHt7UX` | monthly | $1,000/mo |

**Charter Member rate:** 25% off via coupon `L1Ngigfc`. Retail Producer $90/yr, Agency First $90/yr + $45/yr addl, Wholesaler $750/mo.

**Example math (5-office agency):** Standard $120 + 4 × $60 = $360/yr. Charter: $90 + 4 × $45 = $270/yr.

---

## Surface 4 — Lead Downloads (D-021 §4, `PRICING_LEAD_DOWNLOADS.md`)

Per-record consumption flows through **Universal Credits (Surface 1)** — no separate Stripe SKU. Only the large-buyer alternative has its own Stripe product:

| Tier | Product ID | Price ID | Amount | Notes |
|---|---|---|---:|---|
| Agency Signal — Full Database | `prod_UXgK5wtZVLcmDJ` | `price_1TYay1HmqSDkUoqwb9wHrnmb` | $12,500 one-time | ~130k contacts / ~80k verified email + extended data rights + 12-mo refresh |

**Standard lead/contact download** (1 credit = $0.15) and **DOT lookup + PDF export** (3 credits = $0.45) consume from the universal wallet, not separate SKUs.

---

## Surface 5 — Learning Center (D-021, `PRICING_LEARNING_CENTER.md`)

1 product (Course #1: Lead Gen + Market Matching) with 6 fixed-quantity pack prices.

| Pack | Product ID | Price ID | Seats | Amount | Per seat | Discount |
|---|---|---|---:|---:|---:|---:|
| Individual | `prod_UXgKDu7x8QClJx` | `price_1TYay4HmqSDkUoqwOR6PrCzo` | 1 | $29.95 | $29.95 | 0% |
| 5-pack | (same) | `price_1TYay7HmqSDkUoqwqtpaBM6N` | 5 | $131.78 | $26.36 | 12% |
| 10-pack | (same) | `price_1TYayAHmqSDkUoqwuWdZ6D0Y` | 10 | $239.60 | $23.96 | 20% |
| 15-pack | (same) | `price_1TYayFHmqSDkUoqwxXuAmCkv` | 15 | $314.48 | $20.97 | 30% |
| 20-pack | (same) | `price_1TYayLHmqSDkUoqwRlNDGH04` | 20 | $389.35 | $19.47 | 35% |
| 25-pack | (same) | `price_1TYayOHmqSDkUoqwqGiSds19` | 25 | $486.69 | $19.47 | 35% |

**11-14 seats:** buyer chooses 10-pack + individuals OR 15-pack (will overpay slightly). v1 simplification — refine if usage shows clustering.

**26+ seats (wholesaler):** custom quote, no Stripe SKU. Internal anchor ~$15/seat at 50+, ~$10/seat at 100+.

**Charter Member rate:** 25% off via coupon `L1Ngigfc`. Individual $22.46, 25-pack $365.01.

---

## Surface 6 — Charter Member (D-018 amended by D-021/D-022)

**NOT a separate Stripe Product/Price.** Charter Member status is a **customer-level metadata flag** that drives best-tier pricing across all the above surfaces.

### Mechanics

1. **Stripe Customer metadata:** when an account is enrolled as a Charter Member, set `customer.metadata.is_charter_member = "true"` and `customer.metadata.charter_enrolled_at = <ISO timestamp>` on the Stripe Customer record.

2. **Stripe Coupon `L1Ngigfc`** ("Charter Member 25%", 25% off, duration: forever) — applied automatically at checkout when the customer is flagged. Applies to: DOT Alerts subscriptions, Directory listings, Learning Center purchases.

3. **Universal Credits override:** the 25% coupon does NOT apply to credit top-ups (credits aren't priced that way). Instead, the webhook (or checkout endpoint) for credit purchases reads `customer.metadata.is_charter_member` and delivers credits at the +40% Scale-tier bonus rate (effective $0.107/credit) regardless of which $5/$50/$200/$500/$1000 price the customer paid.

4. **Full Database SKU:** Charter Member discount intentionally not applied — Full DB is the large-buyer alternative outside the small-firm wedge per D-018 explicit exclusion.

### Cap + enrollment (per D-018)

- Cap: 50-75 accounts total
- Enrollment window: 60-90 days from program launch (start date TBD)
- Required value-exchange: 1+ case study within 12 months + quarterly feedback + anonymized usage data + multi-product use
- Active-subscription rule: 6+ month full cancellation forfeits charter rate
- Transferability: M&A only

---

## Archived (pre-D-021 era) ⚫

Archived 2026-05-18 per D-021 / D-022. Not deleted (Stripe doesn't delete products with historical transactions); inactive in catalog.

| Product ID | Name | Why archived |
|---|---|---|
| `prod_UU9iDd4kqDzHyH` | Prospecting Credits — Starter (25) | D-021 replaced fixed packs with $5-increment slider |
| `prod_UU9iww8JAyuxjk` | Prospecting Credits — Pro (100) | Same |
| `prod_UU9ijD1ou6eU7I` | Prospecting Credits — Volume (500) | Same |
| `prod_UU9ipbrKYkegaL` | Prospecting Credits — Volume+ (2,000) | Same |
| `prod_UK8oOxtWE0suZZ` | Pro - Unlimited DOT lookups | D-021 replaced with universal credits + 3-credit DOT-lookup-with-PDF |

---

## Still Active (pre-D-021, kept) ✅

| Product ID | Name | Why kept |
|---|---|---|
| `prod_UOlPFKVe2LI741` | One-Time Snapshot — Seven16 Agency Directory ($125) | D-018 explicit exclusion from Charter program; still valid AS one-time SKU |
| `prod_UOlPzNmSokIq9s` | Growth Member — Seven16 Agency Directory ($99/mo) | D-002 locked, D-005 2027 bundle target |
| `price_1TPxtFHmqSDkUoqwRvnHOqhx` | Growth Member $99/mo recurring price | (per STATE.md §5) |
| `price_1TPxtHHmqSDkUoqwXa3zfPOV` | One-Time Snapshot $125 one-time price | (per STATE.md §5) |

---

## Webhook events (Master O dashboard action — Stripe MCP can't manage webhooks)

Required events to subscribe to at `https://directory.seven16group.com/api/stripe/webhook`:

- `checkout.session.completed` — fires credit delivery + entitlement grant
- `customer.subscription.created` — provisions subscription-tier features (DOT Alerts, Directory listings, etc.)
- `customer.subscription.updated` — tier upgrades/downgrades
- `customer.subscription.deleted` — entitlement revocation
- `invoice.paid` — renewal confirmation, anniversary triggers
- `invoice.payment_failed` — dunning flow

Per memory `feedback_stripe_mcp_webhook_dashboard_only.md`: use the URL-prefilled-events trick to skip the broken event-search UI.

---

## Pending implementation (deferred from this slice — BACKLOG carries forward)

🟡 **Schema migration in seven16-platform satellite** (`soqqmkfasufusoxxoqzx`): `customer_entitlements` + `appointment_attributions` tables per D-015 §7 / BACKLOG #5. Required before Distribution Expander state-level RLS + outcome SKU tracking can ship.

🟡 **Credit wallet wiring** in AS satellite (`sdlsdovuljuymgymarou`): `credit_consumption_rates` table missing per BACKLOG #6. `credit_wallets` + `credit_ledger` scaffolded but unused.

🟡 **Checkout API routes** + cart UI: `/api/stripe/checkout` exists for old SKUs; needs extension to new universal-credits + tier-pick flow. Cart UI for à la carte purchases. Their own session per the architect's "documentation + schema-alignment pass first" instruction.

🟡 **Stripe Tax / Sigma / production cutover:** all deferred until first paying customer per D-002 §"Stripe sandbox first, live cutover later."

---

## How to verify the catalog

```
# List all active products (Stripe MCP):
mcp__88ed113e..._list_products with limit:100

# Inspect a specific product's prices:
mcp__88ed113e..._list_prices with product:<product_id>

# Dashboard:
https://dashboard.stripe.com/acct_1TLUF6HmqSDkUoqw/test/products
```

---

## When this gets out of date

Update when:
- A new D-XXX adds or removes a pricing surface
- A price changes (per D-XXX amendment)
- Webhook endpoint registration changes
- Production cutover happens (replace sandbox IDs with live IDs)
- Charter Member program enters enrollment (cap progress, current count, etc.)
- New products in the family launch (e.g., Distribution Expander state SKUs from D-015 — likely future migration)
