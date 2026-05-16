# Family-Hub Session 23 — Pricing Refinement + Anti-Decay Protocol (2026-05-15)

**Date:** 2026-05-15 (continuation of the same calendar day as SESSION_22; treated as separate session because it closes a discrete arc after SESSION_22 was officially committed and pushed)
**Repo:** `saas-agency-database` (family hub)
**Branch:** `main`
**Predecessor:** [`SESSION_22_PRICING_HANDOFF.md`](SESSION_22_PRICING_HANDOFF.md)
**HEAD at session close:** TBD (after final commits this session)

---

## Theme

**Pricing refinement marathon part 2 + cross-product Anti-Decay Protocol.** Picked up after SESSION_22 with two pivots:

1. **Learning Center pricing locked** (was placeholder at SESSION_22 close) — single course v1 at $29.95/seat + agency team-pack toggle 1-25 with volume discounts (5=12% off, 6-14=20%, 15-19=30%, 20-25=35%)
2. **Directory listings REFINED** (material change from SESSION_22's locked numbers) — DOT carrier listings now FREE (was $20/$50/$65 paid); retail agent listings $120/year annual-only (was $20/mo); NEW Wholesaler/Insurance-Carrier listing tier $1,000/mo (premium recruiting surface with email-blast inclusion + missed-opportunity dashboard)
3. **Account-support tooling recommendation** — Scribe-anchored 3-phase plan ($29 NOW → Pendo at 50 customers → Help Scout + CSM at 200 customers)
4. **Charter Member deck content fully updated** — slides 9, 10, 17, 18 now reflect locked numbers with concrete $5,000+/year compound-savings example
5. **Anti-Decay Protocol** — new family-hub operational doc to prevent project drift across the 3+ repos as the portfolio grows

---

## What shipped

### Locked pricing (post-SESSION_22)

| Surface | Status before SESSION_23 | Status after SESSION_23 |
|---|---|---|
| **DOTAgencies Learning Center** | PLACEHOLDER (3 sub-decisions pending) | ✅ LOCKED: $29.95/seat single course v1 + 1-25 team-pack toggle; agency dashboard for progress+scores tracking added as BUILD TODO |
| **Directory listings — DOT carriers** | $20 / $50 / $65 by PU band (paid) | ✅ REFINED: FREE (carriers as free side of three-sided marketplace; strategic data-collection + marketing surface, not a revenue product) |
| **Directory listings — retail agents** | $20/mo standard | ✅ REFINED: $120/year annual-only ($10/mo effective); Charter $90/year |
| **Directory listings — agencies** | $50/mo first + $25/mo per add'l (monthly) | ✅ REFINED: $120/yr first + $60/yr per add'l (annual); Charter $90 + $45/loc |
| **Directory listings — wholesalers/insurance carriers** | (not specced) | ✅ NEW TIER: $1,000/mo premium recruiting listing — capabilities directory + email blast inclusion + missed-opportunity dashboard + access-point recommendations; Charter $750/mo |

### New family memory file

- **`reference_account_support_tooling.md`** — Scribe-anchored 3-phase plan. Phase 1 NOW (~$30-60/mo) = Scribe Pro + Notion for SOPs + KB; Phase 2 (50+ customers, ~$500-2k/mo) = Pendo or Whatfix for in-app tours; Phase 3 (200+ customers, ~$50-200k/yr loaded) = Intercom or Help Scout + dedicated customer success manager hire. Per-product matrix included (TIQ / DOT Intel / Agency Signal / DOTCarriers / DOTAgencies / Learning Center / Growtheon).

### New family-hub operational doc

- **`docs/context/ANTI_DECAY_PROTOCOL.md`** (NEW) — 6-mechanism system to prevent cross-product drift: (1) Family Health Snapshot doc, (2) Stale Detection Convention with timestamps on Queued items, (3) Weekly Cross-Product Review ritual (~15 min), (4) Monthly Anti-Decay Sweep, (5) Protected-Priority flag, (6) Cross-Product Dependency Tracking. See doc for full implementation guide.

### Deck content updates (Charter Member deck on Desktop)

Slides 9, 10, 17, 18 in `seven16_charter_member_deck_FINAL.md` fully updated:
- **Slide 9 (TIQ walkthrough)** — now cites Launch/Growth/Scale tier prices + 30-day trial + Charter 25% off
- **Slide 10 (DOTCarriers + DOTAgencies + Alerts + Learning)** — 4 product cards with locked pricing; Wholesaler $1k/mo tier added as 5th card
- **Slide 17 (Charter program)** — best-tier-on-everything framing across 5 surfaces with locked Charter rates
- **Slide 18 (Charter compound savings)** — concrete 15-truck-fleet example with $5,000+/year baseline savings calculation

Stale-warning banner collapsed to "pricing fully locked" status note.

---

## What's in family DECISION_LOG at session close

| # | Decision | Status |
|---|---|---|
| D-014 | Consumption engine (credits) | Amended by D-021 (base price $0.29 → $0.15) |
| D-018 | Charter Member program | ✅ Locked + AMENDED by D-021 (best-tier-on-everything shape) + integrations LOCKED in SESSION_22 + extended in SESSION_23 to cover Learning Center + refined Directory |
| D-019 | TIQ subscription tiers | ⚠️ SUPERSEDED by D-021 (preserved per Rule 4) |
| D-020 | TIQ positioning lock | ✅ Locked + still valid (independent of pricing) |
| D-021 | Seven16 Credits & Usage Pricing Architecture | ✅ Locked + REFINED in SESSION_23 (Learning Center + Directory + new wholesaler tier) |

---

## Operational pricing docs at session close

| File | Status |
|---|---|
| `PRICING_CREDITS_AND_TOPUPS.md` | D-014 original (amended by D-021 — should get banner note in next pass) |
| `PRICING_ENTERPRISE_LAYER.md` | D-015 Enterprise+ (unchanged this session) |
| `PRICING_THRESHOLD_IQ.md` | ✅ Charter integration LOCKED (option (a) in §10) |
| `PRICING_DOT_ALERTS.md` | ✅ Charter integration LOCKED (option (a) in §8) |
| `PRICING_DIRECTORY_LISTINGS.md` | ✅ REFINED — carriers FREE, agents annual $120/yr, NEW wholesaler $1k/mo tier |
| `PRICING_LEAD_DOWNLOADS.md` | Unchanged this session; still current |
| `PRICING_LEARNING_CENTER.md` | ✅ LOCKED (was placeholder) — $29.95/seat + 1-25 toggle |

---

## What's NOT done — queued for next family-hub session

### Top of family-hub queue (CTO priority order)

1. **Stripe catalog migration around D-021 architecture** (~1 full session). Every locked pricing surface now has real SKUs to render. Migration creates the actual Stripe products + prices + entitlements that unblock Charter Member outreach revenue capture. Highest single-session ROI from here.

2. **Implement Anti-Decay Protocol mechanism #1 (Family Health Snapshot doc)** (~30 min). Create `FAMILY_HEALTH.md` at saas-agency-database/docs/context/ with first-snapshot of all 3 repo states. Auto-update convention captured in WORKING_AGREEMENT.md Rule 5 amendment OR a new Rule 8.

3. **Growtheon SKU pricing** — D-008/D-010 says Growtheon is third-party reseller; pricing model + reseller margin still open (DECISION_LOG §9 open question #2). Needs its own operational spec.

4. **Quote-routing fees for DOT Carrier agent-paid leads** — exclusive lead pricing $100-300 per `project_dotagencies_dotcarriers_monetization_model.md` memory; needs operational spec when marketplace ships.

5. **PRICING_CREDITS_AND_TOPUPS.md amendment banner** — should explicitly note "AMENDED 2026-05-15 by D-021 — base credit price $0.29 → $0.15; canonical now in D-021 + PRICING_LEAD_DOWNLOADS.md." Trivial follow-up.

### Cross-product queued items (for individual product sessions)

6. **SESSION_3 (seven16-distribution): build TIQ `/pricing` page** — fully unblocked. All 5 family-pricing specs now locked; the build session can render directly from them. ~120 min.

7. **Agency dashboard for Learning Center team-pack purchasers** (BUILD TODO from PRICING_LEARNING_CENTER.md §5) — defer to dotintel2 session when team packs ship.

8. **Lead-routing match-criteria operationalization** (per PRICING_DIRECTORY_LISTINGS.md §8 + memory `project_dotagencies_dotcarriers_monetization_model.md`) — code-side build of the matching algorithm; defer to dotintel2 / DOTAgencies surface session.

---

## Anti-Decay Protocol — why this matters now

Master O direct quote 2026-05-15 (the prompt that triggered this protocol's creation):

> "We need to make sure we are working and progressing all projects forward so they do not get left behind, lost context and forgotten. Make sure to build a prevention plan so that does not happen."

**Why this is real:** the family has 4 active code repos (saas-agency-database, dotintel2, seven16-distribution, future seven16-platform) plus 5+ parked/spinoff repos. Cross-product drift is the #1 risk to portfolio velocity at this scale. Working Agreement Rule 6 (backlog read first/written last) is necessary but not sufficient — it works within a repo but doesn't address cross-repo coordination.

The Anti-Decay Protocol adds:
- **Cross-repo visibility** (Family Health Snapshot)
- **Stale detection** (timestamps + auto-flag at 30/60/90 days)
- **Recurring cadence** (weekly review + monthly sweep)
- **Important-item protection** (PROTECTED flag)
- **Cross-product dependency tracking** (explicit dependency map)
- **Heartbeat events** (specific triggers that force attention)

Full implementation guide in `docs/context/ANTI_DECAY_PROTOCOL.md`. Next family-hub session should implement mechanism #1 (Family Health Snapshot doc) as the foundation.

---

## How to pick up the family-hub thread

Next family-hub session opens with:
1. Read this handoff
2. Read `docs/context/DECISION_LOG.md` (D-001 through D-021)
3. Read `docs/context/ANTI_DECAY_PROTOCOL.md` (new this session)
4. Pick one of three paths:
   - **Path A (recommended): Stripe catalog migration.** Unblocks Charter Member outreach revenue capture. ~1 full session.
   - **Path B: Implement Anti-Decay Protocol mechanism #1** (Family Health Snapshot). ~30 min, foundational for the rest of the protocol.
   - **Path C: Growtheon SKU pricing spec.** Closes the last open-question pricing item.

CTO recommendation: **B then A.** Health Snapshot takes 30 min and gives Master O the cross-product visibility he asked for. Then Stripe catalog (full session) unblocks revenue capture.

Family-hub queue priorities visible in `saas-agency-database/docs/BACKLOG.md` (last updated AS Session 4; should refresh in next session that touches it).

---

## Cross-product implications (already cascaded)

- `seven16-distribution/docs/STATE.md` — TIQ pricing section reflects Learning Center + Directory refinement + all Charter integrations locked
- `seven16-distribution/docs/handoffs/SESSION_3_PROMPT.md` — pricing-page scope updated with locked Learning Center + refined Directory + Wholesaler tier
- `~/.claude/.../memory/project_charter_member_program.md` — Charter Member offer fully integrated across all 5 paid surfaces
- `~/.claude/.../memory/MEMORY.md` — D-range still through D-021 (no new D-decisions this session; all changes are refinements within D-021)
- `~/.claude/.../memory/reference_account_support_tooling.md` — NEW (Scribe-anchored 3-phase plan)
- Charter Member deck on Desktop — slides 9/10/17/18 fully updated with locked pricing; banner collapsed

---

## Commits this session

| Commit | Theme |
|---|---|
| `67dfbc5` | docs(pricing-refinement): Learning Center LOCKED + Directory REFINED + tooling memo |
| `035c7ce` | docs(pricing-refinement-cascade): Learning Center + Directory pricing locked across TIQ docs |
| (this commit) | docs(session-23-close): handoff + SESSION_24 prompt + ANTI_DECAY_PROTOCOL |

---

*End SESSION_23_PRICING_REFINEMENT_HANDOFF — family-hub pricing refinement arc closed 2026-05-15.*
