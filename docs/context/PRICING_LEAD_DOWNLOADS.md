# Lead Downloads & DOT Lookups — Pricing Spec

**Locked:** 2026-05-15
**Parent decision:** D-021 (Seven16 Credits & Usage Pricing Architecture) §2 + §3 + §4
**Surfaces:** DOT Intel (`dotintel.io/dashboard`) + Agency Signal (`directory.seven16group.com` → eventually `agencysignal.co`)
**Buyers:** retail producers, agencies, wholesalers, MGAs, MGUs, carriers, distribution teams

---

## 1. Universal credit currency (per D-021)

One credit currency across all Seven16 lead-download + lookup actions. **Base list price: $0.15/credit.**

Credits owned at the **account (org) level**, not per-user — any user under the account spends from the shared wallet. Top-ups in $5 increments from $5 to $1,000+ with tiered bonus credits:

| Top-up amount | Bonus | Effective per-credit price |
|---|---|---|
| $5–$49 | 0% | $0.150 |
| $50–$199 | +10% | $0.136 |
| $200–$499 | +20% | $0.125 |
| $500–$999 | +30% | $0.115 |
| $1,000+ | +40% | $0.107 |

**Charter Member rate (D-018):** **+40% bonus on every top-up, regardless of size** → effective $0.107/credit forever.

---

## 2. Lead download consumption rates

| Action | Credit cost | List price ($/credit at $0.15) |
|---|---|---|
| **Standard lead/contact download** (Agency Signal contact or DOT Intel carrier-contact) | **1 credit** | **$0.15** |
| Contact with email AND phone (when both available) | 1 credit (same) | $0.15 |
| Contact with email only OR phone only | 1 credit (same) | $0.15 |
| Contact with neither email nor phone (basic record only) | **0.5 credits** | $0.075 |

**Rationale:** the contact's value to the buyer is dominated by reachability. A name-only record is meaningfully less valuable than a name+email+phone record. Half-credit cost for low-reachability records aligns price with delivered value. **Skip-on-import / dedupe** is account-level — same contact downloaded twice in the same month doesn't double-charge.

---

## 3. DOT lookup consumption rates

| Action | Credit cost | List price |
|---|---|---|
| **In-app DOT lookup view** (search-and-display, on-screen) | **0 credits** (negligible/free) | $0 |
| **DOT lookup + PDF export/report** (richer action: pulls full carrier profile, generates downloadable PDF including risk score + insurance history + filings) | **3 credits** | **$0.45** |
| **DOT lookup + JSON/CSV export** (for programmatic ingestion) | **3 credits** | **$0.45** |
| **DOT bulk lookup** (50+ DOTs in one batch operation) | **0.8 credits per DOT** (20% volume discount over individual PDF exports) | **$0.12/DOT** |

**Why in-app lookup is free:** lowest-friction utility surface; we want producers using DOT Intel multiple times per day. The lookup-loyalty-bumps (next section) reward heavy usage indirectly by improving their NEXT top-up.

---

## 4. Lookup-loyalty bumps (per D-021 §4)

Heavy DOT lookup usage drives bonus credit bumps on the customer's **NEXT** top-up — without the customer needing to understand the table.

Monthly account-level lookup volume → next-purchase bonus:

| Lookups/month | Next-top-up bonus bump (on top of standard bonus) |
|---|---|
| 0–49 | 0% |
| 50–99 | +10% on next top-up |
| 100–249 | +15% on next top-up |
| 250+ | +20% on next top-up |

**Example:** an account doing 150 lookups/month in October buys $200 in credits in November. Standard $200 tier bonus = +20%. Loyalty bump from October = +15%. Combined bonus on this $200 purchase = +35% → 1,800 credits (vs. standard 1,600 at +20% alone).

**Important constraint:** lookup-loyalty bumps DO NOT compound with charter member +40% (charter members already get the max bonus). Loyalty bumps apply only to non-charter accounts.

---

## 5. Full-database SKU (large-buyer alternative)

For buyers who want the entire Agency Signal contact universe in one prepaid bundle:

| SKU | Price | Includes |
|---|---|---|
| **Agency Signal Full Database** | **$12,500** one-time | ~130,000 contacts / ~80,000 with verified email; extended data rights (CRM integration allowed, internal redistribution within organization allowed); 12-month freshness refresh included |

Framed as "a very large prepaid credit pack with extended rights" rather than a separate product. Charter Members get 20% off ($10,000) on this SKU.

**Customer guidance:** the full-database SKU breaks even at ~83,000 contacts downloaded (vs. $0.15/credit × 83,333). For most retail/MGU buyers, credit top-ups are more efficient. The SKU is targeted at distribution teams, carriers building national programs, and M&A sourcing analysts.

---

## 6. Variable consumption on AI/upload tools (per D-021 + D-014)

For AI-assisted features that consume more compute per action:

| Action | Base credits | Variable | Cap |
|---|---|---|---|
| **PDF analysis (TIQ submission intake)** | 5 credits base | + 1 credit per 5 MB over baseline | 25 credits/doc cap |
| **Image OCR (e.g., loss-run image scan)** | 2 credits base | + 1 credit per 5 MB over baseline | 10 credits/image cap |

Estimated cost displayed client-side BEFORE upload — user never gets surprised.

(These are TIQ-side AI actions but use the same universal credit wallet — a TIQ-licensed MGU's account wallet covers both their lead downloads AND their PDF analysis AND their lookups.)

---

## 7. Wallet behavior

- **Subscription credits** (included with TIQ/etc. tiers, if any) expire monthly with **2× rollover cap** (you can hold up to 2× your monthly allotment before forfeit)
- **Top-up credits never expire** — accumulate indefinitely in the wallet
- **First-in-first-out** consumption ordering: subscription credits spent first (to avoid forfeit), then top-up credits
- **Out-of-credits behavior:** users still get basic public-data tier output (no hard paywall); paid features (PDF export, full contact unlock, etc.) prompt a top-up

---

## 8. Cross-product cross-sell

The universal-credit wallet IS the cross-sell mechanic:
- Producer buys $50 in credits to download Agency Signal leads → has 367 credits in wallet (with +10% bonus)
- Same producer can spend those credits on DOT Intel lookups + PDFs (3 credits each)
- Same wallet covers cross-product consumption — no separate currency conversions

Marketing this on the /pricing page is critical: "Your credits work everywhere — buy once, spend across Agency Signal, DOT Intel, and your team's TIQ workflow."

---

## 9. Strategic rationale

- **$0.15/credit base** aligned with $0.50 reference price for DOT lookup + PDF (3 credits) and $0.15 reference for single lead — both psychologically anchored
- **Account-level wallet** matches how teams actually consume: producers + account managers + admins share the wallet
- **Lookup-loyalty bumps** reward heavy usage without requiring user to understand bonus tables (just shows up on next purchase)
- **Half-credit cost for low-reachability records** aligns price with delivered value (data without contact info IS less valuable)
- **Bulk-lookup volume discount** (3 → 0.8 credits/DOT at 50+) encourages cohort-prospecting workflows
- **Full-database SKU at $12,500** anchors the high end without competing with credit top-ups for typical buyers

---

## 10. Open numeric refinements

- **Lookup-loyalty bump bands** — currently 50/100/250 lookups/mo; refine as actual usage data informs whether these thresholds are well-calibrated
- **Bulk-lookup discount** at 50+ DOTs — verify margin holds at 0.8 credits/DOT after cost-modeling
- **Full-database SKU** — $12,500 anchor may move based on what large-buyer Distribution Expander prospects actually pay (relates to D-015 Enterprise+ economics)
- **Subscription credit allotments per TIQ tier** — D-014 had reference allotments (DOT Intel 100/600, Agency Signal 50/400) but these may need refinement under D-021's universal-wallet architecture

---

## 11. When this doc gets out of date

Update when: (a) base credit price changes (currently $0.15), (b) any consumption rate changes per action, (c) loyalty-bump bands or top-up bonus bands shift, (d) full-database SKU pricing changes, (e) new AI-consumption feature ships that needs its own variable rate.

---

*End PRICING_LEAD_DOWNLOADS.md*
