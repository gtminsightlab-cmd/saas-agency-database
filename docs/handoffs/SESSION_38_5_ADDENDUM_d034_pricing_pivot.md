# SESSION_38.5 Addendum — D-034 LOCKED: family pricing + Charter Member KILLED (2026-05-26)

**Date:** 2026-05-26 (continuation after SESSION_38 close commit `2a8943c`)
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `main`
**Predecessor:** [`SESSION_38_HANDOFF.md`](SESSION_38_HANDOFF.md)
**Commits added this addendum:** TBD (single commit at close)
**Outcome:** D-034 locked + 4 prior pricing decisions marked SUPERSEDED + customer surface scrubbed of Charter Member references + pricing-page rebuilt as lean 4-tier overview

---

## Why this is an addendum, not its own session

SESSION_38 close-out (cutover + Stripe webhook end-to-end verified) was committed as `2a8943c`. After close-out, Master O surfaced a competitive pricing proposal (Neilson-style transparent pricing, paid sample, monthly subscription, bulk per-record, national license). After reading the proposal against existing decisions, I flagged the conflict with D-014/D-015/D-018/D-021 and recommended **Option B: lock the doctrine now (~30-45 min), retire `/charter` page, queue Stripe catalog cleanup as a follow-up**. Master O confirmed: "going with recommended path. B."

Doctrine pivot was scoped + executable inline. Spawning a SESSION_39 would have left a multi-hour gap with the customer surface (homepage + `/charter` + `/pricing` + nav + footer) still selling a killed program. Handling inline kept the customer experience honest from the moment Master O made the call.

---

## What Master O directive killed

**"we are not doing charter member program anymore or family pricing. Its too confusing."**

Confirmed kill-scope:
- **D-014** — Universal credits engine inside locked subscription tiers ($0.15/credit base + bonus bands)
- **D-015** — Enterprise+ state-based slider ($1,000–$2,000/state + $12,500 all-50 ceiling + Distribution+ outcome SKU)
- **D-018** — Charter Member program (50–75 cap / lifetime-locked / value-exchange-for-discount)
- **D-021** — Universal Credit Currency family-wide + à la carte SKUs + cross-sell discount bands

**Per-product pricing autonomy adopted** — each Seven16 family product now decides its own pricing model independently. DOT Intel + Bind Lab + Bind Lab Academy + DotCarriers + DotAgencies each pick their own model when their dedicated build sessions land. AS adopts the 4-tier transparent buying model in this session.

---

## What survives (no changes)

- **D-026** Stripe billing architecture — ONE Stripe account for parent Wyoming LLC, slug metadata, central webhook handler, entitlements table. Infrastructure layer is product-agnostic.
- **D-027** Family API integration mesh — Command CRM + Email API integration unchanged.
- **D-028** Stripe bundling flow — available pattern but no longer family default. Per-product bundles allowed if natural; no Family Pack SKU on roadmap.
- **D-023** AS positioning ("Distribution intelligence for commercial insurance") — body marketing keeps the intelligence-layer framing. Hero copy on `/pricing` uses "agent data, without the legacy pricing" framing for funnel-friction reduction (proposal's wording). Tension noted but not contradicted; positioning vs hero-copy are different surface layers.
- **D-029 / D-030 / D-033** — Bind Lab Academy + decouples + family product catalog all unchanged.

---

## What shipped this addendum

### DECISION_LOG.md updates

- New **D-034** entry at top of §1's recent block with full doctrine + supersession map + AS 4-tier spec + rationale + concerns acknowledged
- **D-014 / D-015 / D-018 / D-021** all marked SUPERSEDED in-place with cross-reference to D-034; original content preserved per Rule 4

### Customer-facing scrub

- **`app/charter/page.tsx`** — rewritten from 20kb Charter Member landing → clean "Charter Member program ended" notice with `robots: noindex` + link to /pricing + the 4 tiers explained briefly + email contact
- **`app/pricing/page.tsx`** — rewritten from D-014 credits/Charter-overlay placeholder → lean 4-tier overview (Sample $75 / Monthly $299-$999 / Bulk per-record sliding / National License $12,500/yr) per D-034 with new hero copy ("Commercial insurance agent data, without the legacy pricing"). Full polished version (slider calculator + comparison table + FAQ + sample-offer banner) deferred to BACKLOG `0e`.
- **`app/page.tsx`** — homepage Pricing section rebuilt: Free Browse / Growth Member / Snapshot cards → 4 cards (Starter Sample / Monthly Access / Build Your File / National License). Hero pricing description rewritten to drop "Charter Member pricing locks in permanently per D-014" framing.
- **`components/marketing/MarketingHeader.tsx`** — Charter chip in main nav removed (both desktop + mobile drawer)
- **`components/marketing/MarketingFooter.tsx`** — Charter Member link removed; Pricing link flipped to `/pricing` (was `/#pricing` anchor)
- **`components/marketing/CharterTermsPanel.tsx`** — orphan component deleted (was used only on the retired `/charter` page)

### Doctrine docs

- **`docs/BACKLOG.md`** — Active arc flipped to BACKLOG `0e` (full /pricing build); D-034 CLOSED entry added; rolling Last reviewed summary prepended with SESSION_38.5 narrative
- **`docs/context/FAMILY_HEALTH.md`** — Last refresh narrative prepended with D-034 pivot; AS row updated; `/charter` row marked RETIRED; new "D-034 follow-ups" action item; Stage 3 widget item de-Charterized; "Charter Member program status" section + "D-021 pricing architecture lock status" section both marked RETIRED with audit-trail framing

### Family memory

- **`project_charter_member_program.md`** — SUPERSEDED banner added at top; original content preserved struck-through
- **`MEMORY.md`** index — Charter Member entry struck through; new D-034 memory pointer added; PRICING_*.md pointer list marked superseded
- **NEW `project_agencysignal_pricing_v2_neilson_alternative.md`** — captures D-034 + full proposal copy + slider-calculator messages + comparison table + FAQ + concerns acknowledged. Referenced from D-034 in DECISION_LOG.

---

## What was NOT done in this addendum (queued)

### BACKLOG `0e` — Build the full polished `/pricing` page (~90 min, recommended SESSION_39 active arc)

Current `/pricing` is a clean 4-tier overview skeleton — readable + honest but not the full proposal experience. The full implementation needs:

- **Slider calculator** with discount-tier messages ("100 records: Base rate unlocked" → "15,000 records: highest bulk discount")
- **Comparison table** (Agency Signal vs legacy quote-driven vendors — 6-row table from proposal)
- **FAQ** section (6 questions from proposal)
- **Sample-offer banner** at bottom
- Full copy already drafted in proposal; implementation reads as copy + UX wiring.

### "Pricing migration" follow-up session (~45-60 min)

- Archive 6 D-021 surfaces in Stripe sandbox `acct_1TLUF6HmqSDkUoqw` via Stripe MCP (products + prices). Build new Stripe Products for the 4 tiers per D-034.
- Deactivate Charter coupon `L1Ngigfc`
- Add SUPERSEDED banners to historical pricing briefs: `PRICING_CREDITS_AND_TOPUPS.md` + `PRICING_ENTERPRISE_LAYER.md` + `PRICING_STRIPE_CATALOG.md` + `PRICING_DIRECTORY_LISTINGS.md` + `PRICING_LEAD_DOWNLOADS.md` + `PRICING_LEARNING_CENTER.md` + `PRICING_THRESHOLD_IQ.md` + `PRICING_DOT_ALERTS.md` (file kept per established pattern)
- Clean up dead code paths in `app/api/stripe/checkout/route.ts` + `app/api/stripe/webhook/route.ts` (Charter Member overlay logic that won't fire but should be removed for clarity)
- Audit + retire `/enterprise` page (still describes D-015 state-based slider)
- Audit + update `lib/family-integrations/command.ts` comment about `charter_member_enrolled` event

### Other family-product pricing decisions

Each satellite now picks its own model independently. DOT Intel + Bind Lab + Bind Lab Academy + DotCarriers + DotAgencies + Survey + Email + Command — each gets a dedicated pricing decision in its own session per Rule 3.

---

## Standing-rule callouts

- **Rule 4 honored**: D-014/D-015/D-018/D-021 marked SUPERSEDED in-place with cross-reference, NOT deleted. New D-034 explicitly cites which prior decisions it supersedes + acknowledges what survives.
- **Cancelled = closed scope**: Charter Member references on customer surface removed immediately (not deferred). The `/charter` page got a graceful "program ended" notice with link forward to `/pricing` rather than a 410 — better UX for any inbound traffic from earlier outreach drafts.
- **Always recommend next path as CTO/PM**: Option A vs Option B framed as a decision; Master O picked B; executed accordingly without re-framing mid-execution.
- **No SLOP in copy**: New `/pricing` + `/charter` copy uses direct operator language; no "unlock the power of" / "revolutionary platform" / generic feature copy. Proposal copy reads as written.
- **Plugins-first**: Stripe sandbox catalog archive deferred (would have required Stripe MCP product + price archive calls — supported but ~10 archive operations adds session bloat; queued cleanly).

---

## Pickup tasks for SESSION_39

### 🟠 Active arc — BACKLOG `0e` Build the full /pricing page per D-034

Open SESSION_39_PROMPT.md (the original SESSION_38 close wrote it for BACKLOG `0b` — needs amendment to reflect `0e` active arc now). Estimated ~90 min focused for the full proposal experience.

### 🟡 Low-priority follow-ups

1. Pricing migration session (Stripe sandbox cleanup + historical-banner pass) — separate ~45-60 min
2. `/enterprise` page audit (D-015 retired) — fold into pricing migration session
3. `NEXT_PUBLIC_APP_URL` in Vercel Preview env (SESSION_38 carry-forward) — dashboard, ~30 sec
4. Verify first real Stripe event hits 200 in Vercel logs (SESSION_38 carry-forward) — passive monitoring

---

*This addendum closes the doctrine pivot cleanly. Customer surface is honest from this moment forward. SESSION_39 picks up the full /pricing build with proposal copy already drafted.*
