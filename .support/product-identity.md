---
slug: agency-signal-product-identity
component: product-identity
last_updated: 2026-05-23
status: active
source: drafted Session 6.5 POC by Claude, awaiting Master O voice review
---

# Agency Signal — Product identity

## What Agency Signal is

Agency Signal is **distribution intelligence for commercial insurance**. The commercial insurance agency, producer, carrier appointment, and distribution intelligence product that helps producers, agencies, MGAs, wholesalers, carriers, and program administrators find, segment, prioritize, and understand commercial insurance agencies and producers.

**This is the canonical positioning.** Locked 2026-05-18 via family ledger D-023 + repo ADR-023. Codified after architect strategy review.

**Anchor:** "Distribution intelligence for commercial insurance."

**Not:** a generic lead list. An intelligence layer. The moat is appointment-aware targeting + vertical specialization + saved-list refresh + data hygiene + Enterprise+ distribution recommendations — NOT raw row count.

Live at `directory.seven16group.com` (canonical URL per D-016 three-domain split). Future brand redirect at `agencysignal.co`. Part of the Seven16 Group operating system (see `seven16group-product-identity.md` for the holdco frame).

## The 9 product pillars (D-023 lock)

The structure for what Agency Signal does. Each pillar has explicit status — the agent must respect status when answering capability questions.

| # | Pillar | Status |
|---|---|---|
| 1 | Agency Directory | **Shipped** |
| 2 | Producer Intelligence | Schema in · UI light |
| 3 | Carrier Appointment Intelligence | **Shipped** (core differentiator) |
| 4 | Vertical / Segment Intelligence | **12 verticals shipped · 8 empty** |
| 5 | Build Lists | **Shipped** |
| 6 | Saved List Intelligence | Refresh queued — BACKLOG #1 |
| 7 | Distribution Expander | D-015 locked · GTM queued |
| 8 | Data Quality / Hygiene | Engine in · UI light |
| 9 | Future Market Discovery | **PARKED** (3-condition trigger) |

**Status definitions:**
- **Shipped** — fully working in production today
- **Schema in / UI light** — backend exists; UI minimal
- **Engine in / UI light** — backend exists; surfaces minimal
- **Refresh queued** — design locked, scheduled build
- **GTM queued** — product exists; go-to-market motion not active yet
- **PARKED** — explicitly not building; 3-condition trigger documented

The agent CANNOT pitch parked or queued capabilities as if shipped.

## Two ICPs

Agency Signal serves two distinct ICPs with different pricing models:

**ICP 1 — Consumer / Producer Tier:** working producers, small retail agencies, small wholesalers, commercial insurance operators. Free / Producer / Growth / Enterprise pricing tiers (all under $500 P-card per D-002). Self-serve.

**ICP 2 — Enterprise+ Distribution Expander:** MGA distribution leaders, carrier distribution leaders, wholesaler growth teams, program administrators, insurtechs. D-015 state-based slider + Distribution+ outcome SKU. Pricing anchor: 50% undercut vs Neilson Marketing ($12,500 vs $25,000 all-50-states). Conversation-driven sales.

## Four personas

1. **Working Producer** — individual commercial-insurance producer at a brokerage or agency
2. **Small Retail Agency** — full agency operator, soloist to ~25 employees
3. **MGA / MGU / Wholesaler** — wholesale or managing-general-agent / underwriter
4. **Carrier / Program Administrator** — carrier distribution team or program administrator

Each gets a different module view inside the app. See `buyer-personas.md` for depth.

## What Agency Signal OWNS

The complete scope, locked per D-023:

- Agency directory
- Producer directory
- Agency profile intelligence
- Producer profile intelligence
- Carrier appointment intelligence
- Vertical / niche segmentation
- Build-list workflows
- Saved-list workflows
- Saved-list refresh / change detection (Pillar 6 — queued)
- Data hygiene / confidence scoring (Pillar 8)
- Enterprise distribution expansion (Pillar 7)
- Agency universe mapping
- State / vertical / carrier filtering
- Export-ready datasets
- Future market / program discovery layer (Pillar 9 — parked)

## What Agency Signal does NOT OWN

Hard scope boundaries. Locked. The agent must redirect to the in-family or out-of-family alternative.

- **DOT / FMCSA risk scoring → DOT Intel's lane (D-007 / D-022)**
- **Trucking pricing analysis / DOT alerts / quote routing / readiness → DOT Intel**
- **AMS workflows / CRM workflows / submission management / policy admin / quote-bind / claims → OUT OF FAMILY per D-022** (Bindlab covers wholesale/MGA operating software but doesn't replace AMS)
- **Go High Level services directly → Growtheon's lane (D-010 reseller)**

If a visitor asks Agency Signal for any of these, the agent routes them — does not invent capability.

## Competitive references

Two adjacent competitive references — used for positioning context, NOT for disparagement.

**Neilson Marketing:**
- Enterprise+ pricing anchor (50% undercut per D-015 at $12,500 vs $25,000 all-50)
- **Borrow:** state/vertical segmentation, verified contact emphasis, distribution-growth framing
- **Avoid:** list-broker / telemarketing positioning (Agency Signal is intelligence, not list-broker)
- **Per family memory `feedback_neilson_is_competitor_not_vendor`:** Neilson is a COMPETITOR we benchmark against, NOT a data vendor we license from.

**ProgramBusiness:**
- Pillar 9 long-term anchor (when Pillar 9 unparks)
- **Borrow:** searchable profile UX, storefront/listing model, featured markets, market alerts
- **Avoid:** broad quote marketplace, submission marketplace, insurance-news sprawl

## Stage and credibility

- **Pre-revenue.** Stripe catalog SHIPPED to sandbox 2026-05-18 (`acct_1TLUF6HmqSDkUoqw` — Charter Member catalog). **Production Stripe cutover pending** (gates: webhook endpoint registration via Master O dashboard action + first paying customer trigger).
- **Sessions 27-32 epic CLOSED 2026-05-22** — internal-app foundation rebuild + design system + 5 of 6 slices shipped. Lint progression 42 → 1 across the epic.
- **BACKLOG #1 (/home v1) SHIPPED** 2026-05-22 — personalization + post-login redirect flip.
- **Charter Member outreach** queued (D-021 catalog live in sandbox; pending CRON_SECRET in Vercel + Stripe webhook endpoint registration + Sentry org token rotation — all Master O dashboard actions).
- **Pricing structure locked:** D-014 Charter Members (best pricing tier permanently), D-015 Enterprise+ state slider, D-021 universal credits at $0.15/credit base + à la carte SKUs.

## Surface-trigger rules for the support agent

Use this file when answering:
- "What is Agency Signal?"
- "Is this a lead list?" (NO — intelligence layer)
- "What's the difference between Agency Signal and Neilson?"
- "Who is Agency Signal for?"
- "What pillars are shipped vs queued?"
- "What does Agency Signal NOT do?"
- "Are you an AMS / CRM?"

Do NOT use this file as the source of truth for:
- DOT / trucking questions → route to DOT Intel
- Wholesale / MGA operating-software questions → route to Bindlab
- AMS / CRM / quote-bind / claims questions → out of family; suggest external category
- Underwriting / coverage / binding decisions — those NEVER come from the agent (see `prohibited-claims.md`)
