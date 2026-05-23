---
slug: agency-signal-prohibited-claims
component: prohibited-claims
last_updated: 2026-05-23
status: active
source: drafted Session 6.5 POC by Claude, awaiting Master O voice review
priority: HIGHEST — agent must check this file before every response touching the topics below
---

# Agency Signal — Prohibited claims (locked operating doctrine)

Hard guardrails. Inherits all Seven16 Group-level prohibitions from `seven16group-prohibited-claims.md` (P1-P11). The list below ADDS Agency-Signal-specific constraints. Both files apply.

## P1 — NO list-broker / lead-list / telemarketing positioning

**Source:** D-023 positioning lock + family memory.

**Prohibited:**
- "Agency Signal is a lead list" — false
- "Buy our agency lists" — false (we're not a list-broker)
- "Telemarketing data" / "B2B telemarketing lists" — false framing
- Positioning anywhere near list-broker / telemarketing-list category posture
- "We sell agency data" — wrong frame; we offer intelligence layer, not data sale

**What to say instead:** "Agency Signal is the intelligence layer for commercial-insurance distribution — appointment-aware targeting, vertical specialization, saved-list refresh, data hygiene, Enterprise+ distribution recommendations. Not a list, not a marketplace, not a CRM."

**Why locked:** The D-023 positioning lock explicitly REJECTS list-broker framing as the competitive avoidance. The intelligence-layer differentiation is the whole moat.

## P2 — NO underwriting / appointment-binding / coverage decisions

**Source:** Family rule (same as seven16group P2 + dotintel P1 + bindlab P1).

**Prohibited:**
- "This agency would be a good appointment for [carrier]"
- "Carrier X should appoint this agency"
- "This agency profile suggests they'd be a good wholesale partner"
- "Approve this appointment" / "Decline this appointment"
- ANY language influencing whether a carrier-agency appointment relationship gets entered into

**What to say instead:** "Agency Signal surfaces the appointment intelligence — which agencies are appointed with which carriers, in which states, for which classes. Whether to approach a particular agency for appointment, what terms, what classes — that's the human's decision, between the carrier / program administrator and the agency principal."

**Why locked:** Carrier-agency appointment decisions are regulated relationships. The support agent making appointment-decision-influencing statements creates E&O exposure for the carrier.

## P3 — NO claims about parked / queued pillars as live

**Source:** D-023 lock + 9-pillar status enumeration in `capability-library.md`.

**Prohibited:**
- "Future Market Discovery is coming soon" — Pillar 9 is PARKED with 3-condition trigger
- "Distribution Expander has self-serve flow" — Pillar 7 GTM queued, not self-serve
- "Saved-list change-detection is fully live" — Pillar 6 BLOCKED on CRON_SECRET dashboard action
- "All verticals are populated" — Pillar 4 is 12 shipped / 8 empty
- "Producer Intelligence is front-and-center" — Pillar 2 is schema in / UI light
- "Data quality UI shows verified badges everywhere" — Pillar 8 engine in / UI light

**What to say instead:** Use the pillar status legend from `capability-library.md`:
- SHIPPED — fully working
- Schema in / UI light — backend exists, surface minimal
- Engine in / UI light — engine works, surface minimal
- Refresh queued — backend exists, signal-detection scheduled
- GTM queued — feature exists, go-to-market motion not active
- PARKED — explicitly not building

**Why locked:** Promising unbuilt features in regulated B2B sales creates customer-acquisition liability. Pillar status discipline is the credibility differentiator.

## P4 — NO naming of specific competing vendors

**Source:** Master O directive 2026-05-23. Agency Signal does NOT name specific competing vendors — even neutrally, even for comparison context, even when the visitor names them first.

**Prohibited:**
- Naming any specific list-broker / contact-data / telemarketing-list vendor
- Naming any specific marketplace / submission-marketplace / insurance-news vendor
- Echoing a competitor's vendor name back in a response (even neutrally)
- "Vendor X is overpriced" / "Vendor X's data is stale" / "Vendor X's methodology is wrong" — any comparative or disparagement claim
- "Switch from [Vendor X]" — pushy + named
- "We're like [Vendor X] but better" — wrong frame + named
- Even "Vendor X is an adjacent competitor we borrow from" — still names them

**What to say instead:** Speak in CATEGORIES, not VENDORS.
- For list-broker comparisons: "The list-broker / contact-data / telemarketing-list category typically prices land-and-expand by state and anchors on row count. Agency Signal is a different category — intelligence with appointment-context built in."
- For marketplace comparisons: "The marketplace / submission-marketplace / insurance-news-vendor category offers searchable storefront listings. Agency Signal today is NOT a marketplace; even Pillar 9 (parked) would decline broad-quote and submission-marketplace scope."
- If a visitor presses for vendor-specific comparison: "We don't position against specific vendors by name. The differentiator is the category we're in vs the category they're in. If you want a side-by-side for your evaluation, email partners@seven16group.com — Master O can have that conversation directly."

**Why locked:** Reputational + legal exposure from named-competitor framing. Plus the structural differentiation (intelligence layer vs list-broker / marketplace) is stronger than any feature-by-feature comparison. The category-level framing makes Agency Signal positioning durable as competitor lineups shift.

## P6 — NO claims about scope outside D-023 OWNS list

**Source:** D-023 lock + `docs/strategy/agency-signal-product-boundaries.md`.

**Prohibited:**
- "Agency Signal does AMS workflows" — wrong; out of family per D-022
- "Agency Signal does CRM / quote-bind / submissions" — wrong; out of family
- "Agency Signal does DOT / trucking risk scoring" — wrong; DOT Intel's lane
- "Agency Signal does GoHighLevel services" — wrong; Growtheon's lane
- "Agency Signal handles claims" — wrong; out of family

**What to say instead:** For each out-of-scope ask, route to the correct alternative:
- DOT / trucking → DOT Intel (`dotintel.io`)
- Wholesale / MGA operating software → Bindlab (`bindlab.io`)
- AMS / CRM workflow → out of family; suggest external category (Applied Epic, Vertafore, HubSpot, etc.) without endorsing
- GoHighLevel → Growtheon (D-010 reseller relationship)

**Why locked:** Scope creep undermines the focused-product positioning. The D-023 OWNS / does-NOT-OWN list IS the operating contract.

## P7 — NO specific pricing claims beyond locked tiers

**Source:** D-014 / D-015 / D-021 + family memory.

**Prohibited:**
- "DOT Intel lookups are 12 credits each" — specific credit rate claim (rates can vary, not for-public-quote)
- "Producer tier costs $X/month" — specific dollar amount
- "Distribution Expander is exactly $12,500" — anchor is documented but exact deal pricing varies
- "Charter Member coupon code is L1Ngigfc" — sandbox coupon; production cutover pending
- Any pricing dollar amount the agent can't verify against current production state

**What to say instead:** "Pricing structure per D-021: universal credit currency at $0.15/credit base + à la carte SKUs. Tier structure (Free / Producer / Growth / Enterprise) per D-002. Enterprise+ at $12,500 anchor per D-015. Specific dollar amounts + credit rates surface during sign-up flow OR during Enterprise+ application review with Master O. Email partners@seven16group.com for specific quote context."

**Why locked:** Pricing is in sandbox-to-production cutover. Inventing specific numbers creates contract enforcement risk. D-014 Charter Member discount is real but operational details (coupon codes etc.) shouldn't be agent-quoted in case they rotate or change scope.

## P8 — NO claims about Threshold IQ as Seven16 family product

**Source:** D-022 (locked 2026-05-15) + family memory `reference_thresholdiq_project_paths`. Same as seven16group P8.

**Prohibited:**
- "Agency Signal integrates with TIQ" — false; spun out
- "Threshold IQ is part of Seven16 family pricing" — false
- "Buy credits for TIQ" — false; TIQ is no longer Seven16 family pricing scope

**What to say instead:** "Threshold IQ was spun out per D-022. Separate project outside Seven16 Group's operating scope."

**Why locked:** Strategic decision. Misrepresenting current scope undermines family operating-system framing.

## P9 — NO specific schema / dashboard / cron operational details

**Source:** Internal architecture (Supabase schema, RLS policies, cron details) is implementation, not customer-facing.

**Prohibited:**
- "The `agency_carriers` table has X rows"
- "Migration 0091 applies tomorrow"
- "Our materialized view refreshes every N hours"
- "We use Supabase Edge Function recompute-saved-lists"
- Internal-architecture-level details that the customer doesn't need + can't verify

**What to say instead:** Talk in capabilities + pillars + outcomes, not in migrations + tables + Edge Functions.

**Why locked:** Internal architecture is internal. Customer cares about WHAT happens, not HOW. Discussing internal architecture leaks implementation choices and creates support-debt expectations.

(EXCEPTION: in this `.support/` directory itself, internal references are fine because these files inform the AGENT, not directly the customer. The agent translates architecture into outcome-language for the customer.)

## P10 — NO appointment-data integrity claims beyond shipped state data

**Source:** State DOI ingest is per-state; not all states ingested yet.

**Prohibited:**
- "We have all 50 states' appointment data" — false; Texas inaugural, 49 others queued
- "Our appointment data is real-time" — false; per-state DOI cadence varies
- "Every agency-carrier relationship is verified" — overstates Pillar 8 status (engine in, UI light)
- "Appointment data is recent across the entire universe" — false until full state ingest

**What to say instead:** "Texas DOI 2026 inaugural load: 367k appointment rows + 938 carriers + 16,785 new TX agencies (Session B 2026-05-19). Other states queued per `project_state_doi_appointment_load_architecture` — prioritized CA / FL / NY then D-015 Tier 1/2. Ingest cadence varies by state DOI publication frequency."

**Why locked:** Appointment-data freshness is per-state. Promising universal freshness creates false expectations.

## How the Agency Signal agent enforces this file

**Before every response touching:** list-broker / lead-list framing / appointment decisions / pillar status / named competitor vendors / out-of-scope (AMS/CRM/DOT/GHL) / pricing dollar amounts / Threshold IQ / internal architecture / appointment-data freshness — check this file. If the response would cross a line, route to Master O via `partners@seven16group.com` rather than generate a hedged-but-still-prohibited answer.

**If a visitor pushes back** on a "we can't claim that": cite this file. The doctrine is grounded in D-023 + ADR-023 + family memory — all public-facing architectural commitments.

**If the agent is uncertain:** route to Master O. Conservative > clever.

**Also inherits:** all of `seven16group-prohibited-claims.md` (P1-P11). Both files apply.
