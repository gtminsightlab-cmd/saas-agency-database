---
slug: agency-signal-buyer-personas
component: buyer-personas
last_updated: 2026-05-23
status: active
source: drafted Session 6.5 POC by Claude, awaiting Master O voice review
---

# Agency Signal — Buyer personas

Four personas locked per D-023, organized across two ICPs.

## ICP 1 — Consumer / Producer Tier

Self-serve. Free / Producer / Growth / Enterprise pricing all under $500 P-card per D-002.

### Persona 1 — Working Producer

- **Who:** Individual commercial-insurance producer at a brokerage or agency. Writes 5-50 new accounts per year. Mix of cold prospecting + book-renewal work.
- **Daily problem:** Finding the right prospects to call. Cold lists are dead-on-arrival. Built-list prospecting from scratch is slow. Knowing which agencies are already appointed with which carriers (so the producer knows what they CAN bind for them) takes manual research.
- **What they need from Agency Signal:**
  - Agency directory + carrier-appointment lookup (Pillars 1 + 3)
  - Build-list workflow (Pillar 5) — define filters, get an export-ready list
  - Producer profile intelligence (Pillar 2 — light UI but schema exists)
- **What matters most:** Carrier-appointment data. The producer's primary discovery question is "which agencies in [my territory / vertical] aren't appointed with [carrier I rep]?" This is Agency Signal's core differentiator.
- **Pricing tolerance:** Self-serve sub-$500 P-card. Producer tier or Growth tier per D-021.
- **Qualification signals:** "Producer," "commercial lines," "I cold call agencies," "prospecting," "carrier appointment data"

### Persona 2 — Small Retail Agency

- **Who:** Full agency operator. Soloist (1-3 people) to small operation (~25 employees). Multi-producer or producer-owner overlap.
- **Daily problem:** Producer enablement (their producers want better data), market access (which carriers should we pursue appointments with?), retention risk (which clients are showing signal of leaving), automation readiness (when do we move off Excel?).
- **What they need from Agency Signal:**
  - All of Persona 1's needs PLUS multi-producer / team views
  - Vertical / segment intelligence (Pillar 4 — 12 verticals shipped) for niche-focus decisions
  - Saved-list refresh (Pillar 6) — once it ships — for ongoing renewal-watch automation
- **What matters most:** Vertical intelligence + saved-list workflows for the team's recurring prospecting motion.
- **Pricing tolerance:** Self-serve up to Growth or Enterprise tier (still sub-$500 per D-002). Charter Member discount per D-014 if they buy now.
- **Qualification signals:** "Small agency," "we have producers," "we work [vertical]," "renewal prep," "we need our team to find prospects together"

## ICP 2 — Enterprise+ Distribution Expander

D-015 lock. State-based slider + Distribution+ outcome SKU. $12,500 all-50-states anchor. Conversation-driven sales, not self-serve.

### Persona 3 — MGA / MGU / Wholesaler

- **Who:** Managing General Agent, Managing General Underwriter, or wholesale brokerage with distribution growth ambition. Targeting "we need to grow our agency book by N agencies across N states in Q3."
- **Daily problem:** Identifying the agency universe in target states. Understanding which agencies have appointments with competing wholesalers / MGAs. Building a structured prospecting list segmented by vertical + state + appointment status + appetite fit.
- **What they need from Agency Signal:**
  - Distribution Expander (Pillar 7) — D-015 locked, GTM queued
  - State / vertical / carrier filtering at scale
  - Carrier appointment intelligence to identify which agencies are appointed where
  - Export-ready datasets at Enterprise+ scale
- **Pricing tolerance:** $12,500-class engagement (D-015 all-50-states anchor). State slider scales with footprint.
- **Qualification signals:** "Distribution growth," "agency recruitment," "appoint more agencies," "expand into [states]," "competitive intel on which agencies are with our competitors"

### Persona 4 — Carrier / Program Administrator

- **Who:** Carrier distribution leader, program administrator, insurtech distribution team. Operating at the carrier-side or program-side of the appointment relationship.
- **Daily problem:** Identifying agencies for new appointment programs. Monitoring distribution-channel performance. Evaluating geographic / vertical gaps in current agency footprint.
- **What they need from Agency Signal:**
  - All of Persona 3's needs PLUS carrier-side viewing (which programs are agencies running today)
  - Future: market / program discovery (Pillar 9 — currently PARKED with 3-condition trigger)
- **Pricing tolerance:** Highest of any persona. Enterprise+ engagements with state-slider customization.
- **Qualification signals:** "Carrier," "program administrator," "we're expanding distribution," "we need to find agencies in [class]," "appointment program"

## Anti-personas (do NOT pitch)

- **Personal-lines-only agencies** — Agency Signal is COMMERCIAL focused per D-023
- **DOT-only / trucking-only buyers** — route to DOT Intel (D-007 lane)
- **Wholesale operators looking for an AMS / submission management** — route to Bindlab (different scope per D-022)
- **Carriers seeking underwriting decisions on specific risks** — Agency Signal surfaces distribution data, not underwriting decisions
- **List-broker / cold-data resellers** — Agency Signal is intelligence layer, NOT a list-broker (the explicit list-broker-category avoidance per D-023)
- **General-purpose SaaS shoppers** without insurance-distribution context — they won't understand the positioning; route to documentation

## How the support agent should route

| Conversation signal | Likely persona | Next move |
|---|---|---|
| "I'm a producer" / "cold calling agencies" / "carrier appointment" | 1 | Pitch agency directory + carrier-appointment lookup + build lists. Producer or Growth tier pricing. |
| "Small agency" / "we have producers" / "team prospecting" | 2 | Pitch vertical intelligence + team workflows + (queued) saved-list refresh. Growth or Enterprise tier. |
| "MGA" / "wholesaler" / "agency recruitment" / "distribution growth" | 3 | Pitch Distribution Expander (D-015) — conversation-driven sales, NOT self-serve. Route to Master O. |
| "Carrier" / "program administrator" / "appointment program" | 4 | Pitch Enterprise+ engagement. Note Pillar 9 (parked) for future. Route to Master O. |
| "Personal lines" | Anti-persona | "Agency Signal is commercial-focused per our positioning. Personal lines is outside scope." |
| "Trucking" / "DOT data" | Anti-persona | Route to DOT Intel (`dotintel.io`). |
| "I need an AMS" / "CRM" | Anti-persona | "Out of family. Agency Signal is distribution intelligence, not workflow management." |
| "I want raw data lists" | Anti-persona | "We're intelligence layer, not list-broker — the list-broker / telemarketing-list category is a different product type. Our value is appointment-aware targeting, not row count." |
| "Threshold IQ" / "TIQ" | Anti-persona | "Threshold IQ was spun out per family doctrine D-022. Separate project outside Seven16 Group's operating scope today." |

## Charter Member program (cross-persona)

Per D-014: Charter Members occupy "best pricing tier permanently" across everything they buy. Applies to ICP 1 (Producer / Growth / Enterprise tiers) AND ICP 2 (Enterprise+ engagements). Charter Member coupon code `L1Ngigfc` (sandbox; production cutover pending). Pre-revenue stage means Charter outreach is the active acquisition motion — see family memory item "Charter Member outreach."
