# Agency Signal — Product Boundaries

**Locked:** 2026-05-18 (ADR-023 / family D-023)
**Reference:** [`docs/decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md`](../decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md)

---

## Agency Signal owns

- commercial insurance agency directory
- producer directory
- agency profile intelligence
- producer profile intelligence
- agency × carrier appointment intelligence
- vertical / niche segmentation
- build-list workflows
- saved-list workflows
- saved-list refresh / change detection
- data hygiene / confidence scoring
- enterprise distribution expansion
- agency universe mapping
- state / vertical / carrier filtering
- export-ready agency and producer datasets
- future market / program discovery layer (Pillar 9 — parked)

## Agency Signal does NOT own

- DOT / FMCSA risk scoring → **DOT Intel's lane**
- trucking company pricing analysis → DOT Intel
- motor carrier DOT alerts → DOT Intel
- trucking quote request routing → DOT Intel
- trucking company insurance readiness → DOT Intel
- AMS workflows → out of family (per D-022)
- CRM workflows → out of family
- submission management → out of family
- policy administration → out of family
- quote / bind workflows → out of family
- claims → out of family
- Go High Level services directly → **Growtheon's lane** (per D-010 reseller arrangement)

## Rationale by boundary

**DOT-specific work belongs in DOT Intel** because:
- DOT Intel is the family-active product purpose-built for FMCSA/SMS data + carrier-side intelligence
- Agency Signal's appointment + vertical signals on trucking are useful CROSS-references but the underlying motor-carrier monitoring + risk scoring lives in dotintel2 (separate Supabase satellite per D-008)
- AS → DOT Intel directory mirror (D-013) is the canonical integration; do not duplicate carrier intelligence in AS

**AMS / CRM / submissions / policy / claims / quote-bind belong elsewhere** because:
- Per D-011 (small-firm design target), AS is intentionally narrower than full-stack operating tools
- Per D-022, AMS/CRM-shape workflows live in product(s) outside the Seven16 family architecture
- Adopting any of these would dilute AS's positioning as an intelligence layer and create operational overhead AS isn't sized for

**Go High Level / generic marketing automation belongs in Growtheon** because:
- Per D-010(a), Growtheon is Seven16's white-label reseller of GHL-shape services
- AS surfaces inform Growtheon campaigns (export → CRM handoff), but the CRM + email/SMS automation itself is Growtheon
- AS should never absorb Growtheon workflows; the handoff pattern is "AS exports a segment → Growtheon runs the campaign"

## What this means for product decisions

When evaluating a new feature request for Agency Signal:

1. Does it fit one of the 9 pillars? → potentially in scope
2. Does it appear in "does NOT own"? → out of scope, redirect to the right product
3. Is it adjacent and unclear? → escalate to a D-XXX conversation rather than building first

## When this gets out of date

Update when:
- A new family product launches and absorbs a "does not own" item
- A "does not own" item turns out to belong in Agency Signal after all (would need a superseding ADR)
- Growtheon scope changes (currently parked in family memory, per D-010)
