# DOTAgencies Learning Center — Pricing Spec

**Locked:** 2026-05-15
**Parent decision:** D-021 §"Training (DOTAgencies Learning Center) — individual modules + agency/wholesaler team packages"
**Surface:** dotagencies.io/learn
**Buyers:** retail producers (individual), agencies (team packs), wholesalers/MGAs (team packs)

> **Supersedes prior placeholder version of this doc.** Master O locked pricing model + Learning Center v1 scope 2026-05-15.

---

## 1. Learning Center v1 — single course (with more to follow)

The Learning Center launches with **one course / one module** in v1. It is intentionally a funnel-input product designed to get producers interested in the DOT Intel platform.

**Course topic:** how to use DOT Intel to (a) generate trucking insurance leads and (b) determine which insurance markets a given DOT account should be matched to, based on risk profile.

**Why this single-course-first launch matters:**
- Producer completes the course → understands the product → high probability of trying DOT Intel paid tier
- Cert holders get a badge visible on their DOTAgencies directory listing → directory becomes more useful for everyone
- Single course is shippable NOW; future modules ship as additional SKUs (purchased separately OR bundled later)

**Future module pipeline (not in v1, but architectural placeholder for):** advanced lead-gen techniques, niche specialization paths (per insurance company appointment), wholesaler operating playbook, MGU launch toolkit, etc. Each future module is its own SKU at launch.

---

## 2. Individual Producer pricing — LOCKED

| Item | Value |
|---|---|
| **Course price (individual producer)** | **$29.95** one-time |
| Charter Member rate (per D-018 amended) | **$22.46** (25% off) |
| Certificate at completion | Included; displays as badge on DOTAgencies directory listing |
| Course access | Lifetime (no subscription) |

---

## 3. Agency team packs — LOCKED (toggle 1–25 producers with volume discount)

Agencies can purchase team packs covering multiple producers. UI uses a toggle slider 1–25; discount tier shows based on selected quantity.

| Producer count | Discount | Per-seat effective | Pack price | Charter pack (25% off pack price) |
|---|---|---|---|---|
| **1–4** | 0% (no discount) | $29.95 | $29.95 × N | $22.46 × N |
| **5** | **12%** off | $26.36 | $131.78 | $98.83 |
| **6–10** | **20%** off | $23.96 | $143.76 (6) → $239.60 (10) | $107.82 (6) → $179.70 (10) |
| **11–14** | **20%** off (continues from 6–10 band — no new tier mid-range) | $23.96 | $263.56 (11) → $335.44 (14) | $197.67 (11) → $251.58 (14) |
| **15–19** | **30%** off | $20.97 | $314.48 (15) → $398.34 (19) | $235.86 (15) → $298.76 (19) |
| **20–25** | **35%** off | $19.47 | $389.35 (20) → $486.69 (25) | $292.01 (20) → $365.01 (25) |

**Charter Member rate on team packs: 25% off the calculated pack price** (per D-018 amended, applies to Learning Center as it does to every other paid product).

**Note on 11–14 band:** Master O's spec defined explicit discount bands at 5 (12%), 6–10 (20%), 15–19 (30%), 20–25 (35%) but did not specify 11–14. CTO call: continue the 20% rate through 11–14 to avoid introducing a 5th discount tier in the middle range (keeps the UI toggle simple). If a different intermediate rate is preferred, supersede this in a follow-up amendment.

---

## 4. Wholesaler team packs

Wholesalers / MGAs / MGUs purchasing for their producer networks use the same 1–25 toggle as agencies. **Above 25 producers, pricing moves to custom quote** (volume-negotiated, typically wholesalers will exceed 25 producers).

Wholesaler team packs of 26+ → contact for custom rate. Internal anchor for negotiation: ~$15/seat at 50+ producers, ~$10/seat at 100+. To be refined as first wholesaler deal informs.

---

## 5. Agency dashboard for team-pack purchasers — BUILD TODO

**Required feature when team packs are built (NOT live in v1 of Learning Center):** agencies that purchase team packs get access to an admin dashboard showing:
- Progress of each producer through the course (modules started, completed, in-progress)
- Quiz scores per producer per module
- Certification status (passed / failed / not-yet-attempted) per producer
- Ability to nudge producers who haven't completed
- Ability to re-assign seats if a producer leaves the agency

**Build implication:** new admin surface in dotagencies.io OR DOT Intel dashboard for agency-tier accounts. Schema additions to track per-producer-per-module progress + scores.

**Queue:** added to dotintel2 BACKLOG as a deferred-until-team-packs-ship item in the next dotintel2 session.

---

## 6. Future modules — pricing approach

When module #2 ships (and #3, #4, etc.):
- Each module priced individually at $29.95 (anchor maintained)
- Bundle discount available when buying multiple modules at once (TBD specific bands; suggest 2 modules = 10% off, 3+ = 15% off — to be locked when module #2 lands)
- "Trucking Specialist Path" bundle (all currently-shipped modules + cert): TBD when 3+ modules exist
- Existing customers who bought module #1 individually do NOT automatically get module #2 free; standalone purchase required
- Team-pack toggle extends per-module (i.e., agency buying module #2 for 10 producers uses the same toggle ladder)

---

## 7. Charter Member integration — LOCKED

Per D-018 amended: Charter Members get **25% off** any Learning Center purchase:
- Individual course: $22.46 (vs. $29.95 standard)
- Team packs: 25% off the calculated pack price at any discount tier
- Future modules: 25% off list

Charter Member benefit compounds with team-pack volume discounts — a charter agency buying a 15-producer pack pays $235.86 (vs. $314.48 standard at the 30% volume discount).

---

## 8. Strategic rationale

- **$29.95 single-module price** is psychologically a "yes" for a working producer — below the $50 threshold most agencies don't even require approval for
- **Volume discount ladder rewards agency scale** without crushing per-seat economics for small operators
- **Single-course v1 lets us validate** which producers actually complete + convert to DOT Intel paid users; the data informs module #2 design
- **Agency dashboard feature** transforms Learning Center from "individual training product" → "agency-wide capability investment" (much higher ARPU)
- **Future modules as standalone SKUs** preserves optionality — we can A/B test pricing on module #2 without disrupting module #1 buyers
- **Charter Member 25% off** keeps the Learning Center friendly to the founding network without compromising the per-seat economics

---

## 9. Cross-product flywheel role

Learning Center is **the lowest-friction entry point in the entire Seven16 family**. The job of this product is:

1. **CAC reducer for DOT Intel + Agency Signal.** Course completers are dramatically more likely to convert to paid SaaS subscriptions because they've already self-identified as specialists.
2. **Category authority signal.** Seven16 becomes the brand that trains trucking-insurance specialists.
3. **Cross-product flywheel input.** Cert holders get a badge on their DOTAgencies directory listing → directory becomes more useful → carriers/fleets choosing producers see who's actually trained → more business flows to cert holders → more producers want the cert.
4. **Wholesaler-side acquisition channel.** Wholesalers buying team packs for their producer network = direct cross-sell into TIQ for the wholesaler + Agency Signal for the wholesaler.

The course-as-funnel-input model is intentional — the $29.95 ROI calculation should show through the SaaS conversion math, not from the course revenue itself.

---

## 10. Open numeric refinements (refine as data informs)

- **11–14 producer band discount** — currently continues 20% from the 6–10 band; could be raised to 25% as intermediate tier if data shows that range is a common purchase point
- **Wholesaler 26+ custom rate** — anchor at ~$15/seat at 50+, ~$10/seat at 100+; refine after first wholesaler deal
- **Module #2 standalone vs. bundle pricing** — TBD when module #2 ships
- **Trucking Specialist Path bundle** — TBD when 3+ modules exist
- **Annual subscription option for all-modules-access** — explicitly NOT in v1; revisit when module catalog hits 5+

---

## 11. When this doc gets out of date

Update when: (a) module #2 or beyond ships, (b) any pricing band changes, (c) agency dashboard feature ships (remove the BUILD TODO), (d) annual subscription option is added, (e) first wholesaler team-pack deal informs the custom-rate anchor.

---

*End PRICING_LEARNING_CENTER.md — LOCKED 2026-05-15*
