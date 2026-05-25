---
slug: agency-signal-capability-library
component: capability-library
last_updated: 2026-05-23
status: active
source: drafted Session 6.5 POC by Claude, awaiting Master O voice review
---

# Agency Signal — Capability library

Mapped to the 9 product pillars locked per D-023. Each pillar has explicit status — the agent must respect status when pitching.

## Pillar status legend

- **Shipped** = fully working in production today
- **Schema in / UI light** = backend exists; user-visible surface minimal
- **Engine in / UI light** = backend logic runs; user-visible surface minimal
- **Refresh queued** = backend exists; ongoing refresh / cron / signal-detection scheduled
- **GTM queued** = feature exists; go-to-market motion not active yet
- **PARKED** = explicitly NOT building until 3-condition trigger fires

## Pillar 1 — Agency Directory (SHIPPED)

Comprehensive commercial-insurance agency directory. Production today.

**Surface:** `directory.seven16group.com` — searchable agency directory with state / vertical / size filters
**Schema:** `agencies` table (16,785+ new TX agencies added Session B 2026-05-19; ongoing expansion)
**Outcomes delivered:** Find an agency by name / location / vertical. Cross-reference appointments + producers.

## Pillar 2 — Producer Intelligence (Schema in · UI light)

Individual-producer-level data: name, agency affiliations, license states, vertical focus.

**Backend:** Schema exists (per D-023 architect proposal — `producer_profiles` column-add on existing `contacts` table)
**UI:** Light. Producer profile UI not yet front-and-center.

**Honest framing for agent:** "Producer-level data is in the schema; the UI emphasizes agency-level view today. If you want producer-level detail, ask — we can surface what we have."

## Pillar 3 — Carrier Appointment Intelligence (SHIPPED — CORE DIFFERENTIATOR)

The reason Agency Signal exists. Identifies which agencies have appointments with which carriers across which classes.

**Surface:** `agency_carriers` table + appointment-aware filters in build-list workflows
**Schema:**
- `agency_carriers.appointment_active_date` (per D-025 Texas DOI ingest)
- `agency_carriers.state_filed`
- `agency_carriers.source_year`
- Multi-source (state DOI filings, public records)

**Production data:** Texas DOI 2026 inaugural load: 367k appointment rows + 938 carriers added in Session B with NAIC backfill.

**Outcomes delivered:**
- Filter: "which agencies in [state] are appointed with [carrier]"
- Filter: "which agencies are NOT appointed with [carrier] in [state] in [vertical]" (the prospecting question)
- Cross-state appointment patterns

**Scope:** 49 states queued for ingest (prioritized CA/FL/NY then D-015 Tier 1/2). Texas was the inaugural; remaining states roll out per family doctrine `project_state_doi_appointment_load_architecture.md`.

## Pillar 4 — Vertical / Segment Intelligence (12 shipped · 8 empty)

Industry-vertical and class-of-business intelligence at the agency level.

**Backend:** `mv_vertical_summary` materialized view + per-vertical filters
**Production data (post-Session-D refresh 2026-05-20):** Agriculture 11,149 / Transportation +37% / Real Estate 2,521 / 9 more verticals shipped / 8 verticals empty

**Outcomes delivered:**
- Find agencies meaningful in [vertical]
- Cross-reference vertical + state + appointment-status

**Honest constraint:** 8 verticals empty. The agent must clarify which verticals are populated when asked. Empty verticals will fill as additional data sources ingest.

## Pillar 5 — Build Lists (SHIPPED)

Filter + segment + export the agency universe into actionable prospect lists.

**Surface:** Build-list UI at `directory.seven16group.com`
**Filters:** state, vertical, appointment status, carrier, agency size, confidence

**Outcomes delivered:**
- Producer / agency builds a prospecting list with appointment-context built in
- Export-ready CSV / JSON datasets
- List name + metadata for ongoing reference

## Pillar 6 — Saved List Intelligence (Refresh queued — BACKLOG #1 backend SHIPPED)

Track changes in a saved list over time. Renewal-watch / change-detection / new-appointment-alert workflow.

**Backend SHIPPED Session 25:**
- Edge Function `recompute-saved-lists` v1 ACTIVE
- Vercel cron scheduled (04:00 UTC daily)
- API routes for snapshot retrieval
- UI integration in /home (BACKLOG #1 SHIPPED 2026-05-22)

**Schema:**
- `saved_list_snapshots` — daily state captures
- `saved_list_changes` — diffs between snapshots

**Honest critical caveat (DASHBOARD ACTION PENDING):**
- Daily cron is BLOCKED on Master O setting `CRON_SECRET` in Vercel production env
- Until that one dashboard action lands, cron returns 500 daily and no snapshots get written
- The /home v1 dashboard renders counters that auto-light-up post-CRON_SECRET — currently shows 0 / OnboardingChecklist branches by design (smart-degradation)

**Outcomes delivered (once CRON_SECRET set):**
- "What changed in my saved list since [date]"
- New-appointment alerts
- Lost-appointment alerts
- Verified-contact change alerts

## Pillar 7 — Distribution Expander (D-015 locked · GTM queued)

Enterprise+ ICP 2 — distribution growth tooling for MGAs / wholesalers / carriers.

**D-015 lock includes:**
- State-based slider pricing ($12,500 anchor at all-50)
- Distribution+ outcome SKU
- Enterprise+ contract motion (NOT self-serve)

**Schema state:** D-023 migration 0091 proposed (`distribution_expander_segments` + `customer_entitlements`) — not yet applied. Pending validation via 5-8 Enterprise+ demos per ADR-023 revisit trigger.

**Stage:** Conversation-driven sales today. Production GTM motion pending demo signal.

**Outcomes delivered (when GTM active):**
- Enterprise-grade agency-universe segmentation
- State / vertical / carrier deep filtering at scale
- Custom export packages
- Account-level intelligence reports

**Honest caveat:** Pillar 7 has architecture + pricing + ADR locked but the public Distribution+ self-serve flow does NOT exist yet. Conversations happen 1:1 with Master O.

## Pillar 8 — Data Quality / Hygiene (Engine in · UI light)

Confidence scoring + verification + stale-alert engine.

**Backend:**
- Confidence scoring on key fields
- Verified-contact emphasis
- Stale-alert detection

**UI status:** LIGHT. Verified badges + confidence scores + stale alerts are not yet front-and-center in the agency / producer profile views.

**Pillar 9 trigger #2 specifies "Data trust signals visible in UI" as a gate condition for unparking Pillar 9 — so this surfaces are queued as part of Pillar 9 work.

## Pillar 9 — Future Market Discovery (PARKED)

**Explicitly NOT building** until ALL three conditions hold:

1. Saved-list intelligence (Pillar 6) shipped and PROVEN — BACKLOG #1 closes
2. Data trust signals visible in UI (Pillar 8 surfaces — verified badges, confidence scores, stale alerts)
3. Enterprise+ demos (5-8) validate genuine market-side demand

When unparked, Pillar 9 borrows from the marketplace / submission-marketplace category (searchable profile UX, storefront / listing model, featured markets, market alerts) WITHOUT taking on that category's broad-quote-marketplace / submission-marketplace / insurance-news-sprawl scope.

**The agent must NEVER pitch Pillar 9 as if it's coming soon.** It's parked until the 3-condition trigger fires.

## Pricing capability stack (D-014 / D-015 / D-021)

Universal credit currency at $0.15/credit base + à la carte SKUs (D-021):
- DOT lookups
- Lead downloads
- Directory listings
- Alerts (saved-list change detection)
- TIQ CRM (NOTE: TIQ spun out per D-022 — surface this carefully)
- Training (Learning Center)

Cross-sell discounts via volume bonus bands.

**Charter Member program (D-014):**
- "Best pricing tier permanently" across everything Charter Members buy
- Coupon code `L1Ngigfc` (sandbox; production cutover pending)
- Surfaces on Charter outreach flow

**Enterprise+ pricing (D-015):**
- State-based slider for Distribution Expander
- $12,500 all-50-states anchor
- Distribution+ outcome SKU

## What Agency Signal does NOT do (intentional, will not change)

Per D-023 locked scope:
- DOT / FMCSA risk scoring → DOT Intel (D-007 / D-022 lane)
- Trucking pricing analysis / DOT alerts / quote routing / readiness → DOT Intel
- AMS workflows / CRM workflows / submission management / policy admin / quote-bind / claims → OUT OF FAMILY per D-022
- Go High Level services directly → Growtheon (D-010 reseller)
- Underwriting decisions → carrier + licensed agent

## How the support agent should use this file

When a visitor asks "what can Agency Signal do for me":
1. Identify their pillar of interest based on persona (see `buyer-personas.md`)
2. Map to capabilities — honor SHIPPED vs SCHEMA-IN vs QUEUED vs PARKED status
3. Be explicit about pending dashboard actions (CRON_SECRET for Pillar 6)
4. Surface partial coverage honestly (8 empty verticals in Pillar 4, UI light on Pillars 2 + 8, GTM queued on Pillar 7)
5. If question outside Agency Signal scope: route to DOT Intel / Bind Lab / out-of-family as appropriate

The Agency Signal agent's posture: 9-pillar capability framework lets every conversation be grounded in WHICH pillar + WHICH stage. Don't invent capabilities; route or honestly mark queued / parked.
