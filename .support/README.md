# `.support/` — Knowledge source for Agency Signal's support agents

**Status:** Drafted Session 6.5 POC by Claude 2026-05-23, awaiting Master O voice review.

Source-of-truth files for the AI support agents at `seven16groupsupport.com` that answer questions about Agency Signal. Inherits Seven16 Group holdco-level knowledge from `seven16-group-site/.support/` and adds Agency-Signal-specific content.

## Files (7 + README)

| File | Component | Coverage |
|---|---|---|
| `product-identity.md` | product-identity | D-023 positioning lock, 9 product pillars with status, 4 personas, 2 ICPs, OWNS / does-NOT-OWN explicit scope, category-level competitive context (no vendor names per P4), stage + credibility framing |
| `buyer-personas.md` | buyer-personas | 4 personas across 2 ICPs: Working Producer / Small Retail Agency (ICP 1 self-serve) + MGA-MGU-Wholesaler / Carrier-Program-Administrator (ICP 2 Enterprise+). Anti-personas + routing matrix. Charter Member program note. |
| `problem-library.md` | problem-library | 6 distribution-intelligence pains with honest pillar-status caveats: cold lists / vertical prospecting / renewal-watch (CRON_SECRET blocker) / Enterprise pricing gatekeeping / data quality invisibility / which-product-fits-which-use-case |
| `capability-library.md` | capability-library | All 9 pillars with explicit status (Shipped / Schema-in-UI-light / Engine-in-UI-light / Refresh-queued / GTM-queued / PARKED). Pricing architecture stack (D-014 + D-015 + D-021). Explicit "does NOT do" boundary list. |
| `objection-handling.md` | objection-handling | 10 concerns: list-broker confusion / list-broker + marketplace category comparisons (no vendor names) / AMS-CRM-PAS scope clarity / empty verticals / CRON_SECRET blocker honesty / pricing transparency / trucking handoff to DOT Intel / personal lines out-of-scope / Pillar 9 parked status risk |
| `sales-playbook.md` | sales-playbook | 9-pillar framework as conversation backbone. Persona-specific discovery (5-6 questions each). Demo flow grounded in Pillar 3 (carrier appointment intelligence — the core differentiator). Common asks + escalation rules. |
| `prohibited-claims.md` | prohibited-claims | **HARD GUARDRAIL** — Agency-Signal-specific anti-claims INHERITS Seven16 Group P1-P11: P1 NO list-broker positioning / P2 NO appointment-binding decisions / P3 NO parked-or-queued-as-live / P4 NO naming of specific competing vendors (use category framing only) / P5 NO naming of specific insurance companies / carriers / agencies in customer-facing content (per Master O directive 2026-05-23) / P6 NO out-of-D-023-scope claims / P7 NO specific pricing dollar amounts / P8 NO Threshold IQ as family product / P9 NO internal architecture details / P10 NO universal appointment-data freshness claims |

## Voice

Commercial-insurance-distribution operator. Sophisticated audience that knows the difference between an appointment and a license, between a wholesaler and an MGA, between a class code and an exposure rating variable. The 9-pillar framework + D-023 lock means every conversation is grounded in documented architecture.

## Key honesty positions (must hold consistently across files)

1. **Pre-revenue.** Stripe catalog SHIPPED to sandbox 2026-05-18 (`acct_1TLUF6HmqSDkUoqw`). Production cutover pending Master O dashboard actions (Stripe webhook + Sentry token + CRON_SECRET).
2. **9-pillar status:** 4 SHIPPED (1, 3, 5, and partial 4) + 2 schema-in-UI-light (2, 8) + 1 refresh-queued (6, blocked on CRON_SECRET) + 1 GTM-queued (7) + 1 PARKED (9).
3. **Texas DOI inaugural** load complete (367k appointment rows, 938 carriers, 16,785 new TX agencies). 49 other states queued.
4. **Vertical coverage:** 12 shipped / 8 empty.
5. **D-023 positioning lock:** "Distribution intelligence for commercial insurance" — NOT a lead list, NOT a marketplace, NOT an AMS.
6. **No vendor naming (P4):** competitive context spoken in CATEGORIES, never named vendors. Per Master O directive 2026-05-23.
7. **Charter Member program (D-014):** "Best pricing tier permanently." Active acquisition motion.
8. **Sessions 27-32 epic CLOSED 2026-05-22** — internal-app foundation rebuild + design system shipped.
9. **BACKLOG #1 (/home v1) SHIPPED** with smart-degradation pending CRON_SECRET activation.

## How this connects to the support platform

Per the design doc at `Seven16GroupSupport/docs/knowledge-sync-from-product-repos.md`:
- Slug convention: `agency-signal-<component>` (e.g., `agency-signal-product-identity`)
- When support platform's "Sync from GitHub" button ships, these files pull into `knowledge_items` rows automatically
- Until then: read-only artifacts that inform Master O's review + future sync

## Cross-product knowledge

The Agency Signal agent should ALSO be aware of:
- `seven16group-*.md` — holdco-level knowledge (partner program, family-wide infrastructure)
- `dotintel-*.md` — DOT Intel for trucking-carrier intelligence handoff (separate scope per D-007 + D-022)
- `bindlab-*.md` — Bindlab for wholesale/MGA operating software handoff (separate scope per D-022)
- `dotcarriers-*.md` + `dotagencies-*.md` (when written) — adjacent DOT-side brands

When DotCarriers + DotAgencies + Seven16 Email + Seven16 Group Support + Seven16 Survey `.support/` folders are drafted, the Agency Signal agent gains family-wide cross-pitch ability.
