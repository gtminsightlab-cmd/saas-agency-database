---
slug: agency-signal-problem-library
component: problem-library
last_updated: 2026-05-23
status: active
source: drafted Session 6.5 POC by Claude, awaiting Master O voice review
---

# Agency Signal — Problem library

Distribution-intelligence-specific pains. Holdco-level pains live in `seven16group-problem-library.md`. Per-product trucking pains live in `dotintel-problem-library.md`. Per-product wholesale/MGA pains live in `bindlab-problem-library.md`.

## Problem 1 — Cold lists are dead-on-arrival

**The pain:** Producers and growth teams buy or build agency / producer prospect lists from generic list-broker / telemarketing-list / B2B-contact-data sources. Conversion is brutal because the lists carry no appointment context — the producer doesn't know which agencies are ALREADY appointed with their carriers vs which are gap targets.

**Who feels it:** Persona 1 (working producer), Persona 2 (small agency), Persona 3 (MGA/wholesaler), Persona 4 (carrier). Universal across the four personas.

**How Agency Signal addresses it:**
- Pillar 3 (Carrier Appointment Intelligence) — SHIPPED, core differentiator. Identifies which agencies are appointed with which carriers + which classes.
- Pillar 1 (Agency Directory) — SHIPPED. Comprehensive commercial-insurance agency universe.
- Pillar 5 (Build Lists) — SHIPPED. Filter by state / vertical / appointment-status / class to produce a targeted prospect list with appointment context built in.

**Verifiable evidence:**
- Production at agencysignal.io
- Schema includes `agencies`, `agency_carriers` (appointment data), `agency_carriers.appointment_active_date` (per D-025 Texas DOI ingest)
- Live appointment data ingested from state DOI sources (Texas DOI: 367k appointment rows + 16,785 new TX agencies + 638 new carriers, loaded Session B 2026-05-19)

**Key differentiator vs list-broker / contact-data category:** Agency Signal is NOT a list-broker. It's intelligence with appointment-context built in. The producer asks "which agencies in X aren't appointed with my carrier" and gets a structured answer; list-broker tools can only answer "which agencies exist in X."

## Problem 2 — Vertical / niche prospecting at scale is manual

**The pain:** A producer or wholesaler who specializes in a vertical (restaurants, contractors, trucking, manufacturing) wants to find agencies that ALREADY write meaningfully in that vertical. The signal is buried in agency profiles, websites, association memberships, social posts. Manual prospecting researches one agency at a time — doesn't scale.

**Who feels it:** Persona 1 (vertical-specialist producer), Persona 3 (vertical-specialist wholesaler/MGA).

**How Agency Signal addresses it:**
- Pillar 4 (Vertical / Segment Intelligence) — **12 verticals shipped · 8 empty** as of 2026-05-23
- Schema: `mv_vertical_summary` materialized view (Agriculture 11,149 / Transportation +37% / Real Estate 2,521 per Session D refresh 2026-05-20)
- Filter by vertical at scale across the agency universe

**Honest caveats:**
- 8 verticals still empty — agent must clarify which verticals are populated when asked
- Vertical data comes from multiple source signals (agency website, carrier appointments, public records) — confidence scoring per Pillar 8

## Problem 3 — Renewal-watch + change detection is reactive

**The pain:** Producers and growth teams want to know WHEN an agency changes — new carrier appointment added, lost an appointment, moved offices, key person change, hiring. Currently this signal arrives via word-of-mouth or LinkedIn alerts (slow + noisy). By the time the signal reaches the producer, the renewal opportunity is gone.

**Who feels it:** Persona 1, 2, 3 — anyone running ongoing renewal-watch.

**How Agency Signal addresses it (PARTIALLY — Pillar 6 refresh queued):**
- Pillar 6 (Saved List Intelligence) — refresh-detection backend **SHIPPED Session 25** (Edge Function `recompute-saved-lists` v1 ACTIVE + Vercel cron + API routes + UI)
- BUT: daily 04:00 UTC cron is blocked on `CRON_SECRET` Master-O-dashboard action being completed
- Once cron fires, saved-list snapshots populate `saved_list_snapshots` + `saved_list_changes` and the agent can answer "what changed in my saved list since last week"

**Honest caveat:** Until Master O sets CRON_SECRET in Vercel production env, the cron returns 500 daily and no snapshots get written. Functionally the system is shipped + waiting for that one dashboard action. The /home v1 dashboard renders counters that auto-light-up post-CRON_SECRET.

## Problem 4 — Enterprise distribution-growth tooling is gatekept by enterprise pricing

**The pain:** Best-in-class agency-distribution data is enterprise-priced. Incumbent state-based pricing in this category is structured as land-and-expand (initial entry + per-state add-ons + all-states ceiling). MGAs / wholesalers / carriers who want sub-enterprise distribution intelligence get priced out at the entry tier. Mid-market operators can't afford the on-ramp.

**Who feels it:** Persona 3 (MGA/wholesaler), Persona 4 (carrier/program admin) — specifically the mid-market operators within those personas.

**How Agency Signal addresses it:**
- Pillar 7 (Distribution Expander) — D-015 locked. Enterprise+ state-based slider + Distribution+ outcome SKU.
- State slider scales pricing with footprint — buyer pays for the states they want
- Pricing transparency relative to category incumbents
- Mid-market-accessible entry tier rather than enterprise-only land-and-expand

**Verifiable evidence:**
- D-015 brief locked in `docs/context/PRICING_ENTERPRISE_LAYER.md`
- Stripe catalog shipped to sandbox (`acct_1TLUF6HmqSDkUoqw`)

**Honest caveat:** GTM motion is queued, not active. Distribution Expander conversations happen 1:1 with Master O until first 5-8 Enterprise+ demos validate market demand (ADR-023 revisit trigger). No public Distribution+ self-serve flow yet.

## Problem 5 — Data quality + confidence scoring is invisible in most distribution tools

**The pain:** When a producer prospects from a list, they have no idea whether a given record is recent, verified, or stale. A "phone number" might be 3 years old. An "appointment" might be lapsed. Without confidence signals, every record looks equally valid — and the producer wastes time on stale data.

**Who feels it:** Persona 1 (producer doing high-volume outreach), Persona 3 (MGA running campaigns).

**How Agency Signal addresses it:**
- Pillar 8 (Data Quality / Hygiene) — **Engine in · UI light**
- Backend: confidence scoring on key fields (verified contact, verified appointment, stale-alert)
- Frontend: UI surfaces for verified badges + confidence scores + stale alerts are LIGHT (Pillar 9 trigger #2 specifies "Data trust signals visible in UI" as gate condition)

**Honest caveat:** UI surfaces minimal today. Backend engine works; the visible-in-UI piece is queued.

## Problem 6 — Knowing which agency-data product fits which use case

**The pain:** A buyer evaluating distribution-data tools faces a confusing landscape — list-broker tools, general B2B contact data, professional-network platforms, marketplace tools, and intelligence layers (like Agency Signal). Each has different framing; "agency directory" sounds the same across products.

**Who feels it:** First-time evaluators across all four personas.

**How Agency Signal addresses it:**
- Clear positioning: "Distribution intelligence for commercial insurance" — NOT a list, NOT a marketplace, NOT a general B2B tool
- Explicit OWNS vs does-NOT-OWN scope (in `product-identity.md`)
- Category-based positioning in `objection-handling.md` (no vendor names per `prohibited-claims.md` P4)

**Verifiable evidence:**
- D-023 positioning lock + ADR-023 documents
- Family memory `project_agency_signal_positioning.md` enumerates the scope

## How the support agent should use this file

When a visitor describes a pain:
1. Match to one of the 6 problems above
2. Cite the verifiable evidence (D-numbers, family memory references, schema state) rather than making marketing claims
3. Be HONEST about partial coverage (Pillars 6 + 8 backends shipped, UI light; Pillar 7 GTM queued; Pillar 4 has empty verticals; Pillar 9 parked)
4. If the pain doesn't match the six, surface to Master O via the partner channel rather than invent
5. NEVER violate `prohibited-claims.md` — pricing, OWNS-vs-NOT-OWNS scope, no-vendor-naming policy (P4) all have hard guardrails

The Agency Signal agent's posture: commercial-insurance-distribution operator voice. The audience runs producers, agencies, MGAs, programs — they know the difference between an appointment and a license. Speak to them like that.
