# Domain — Producer Intelligence (Pillar 2)

**Locked:** 2026-05-18 (D-023 / ADR-023)
**Status:** Schema in · UI light

## Purpose

Identify and segment individual producers within agencies. Agency Signal's existing UI is agency-first; producer-centric segmentation is a known gap.

## Primary Users

- Working Producer (peer research)
- MGA/MGU/Wholesaler (producer-level recruiting + outreach)
- Carrier / Program Admin (producer-level appointment tracking)

## Included

- producer name
- agency affiliation
- title / role + management level
- contact confidence
- specialties
- states served
- vertical focus
- email + phone
- profile status (unclaimed / claimed / verified)
- future: activity / credibility signals

## Excluded

- Agency-level profile data (Pillar 1)
- Agency × carrier appointments (Pillar 3) — those are agency-level, not producer-level
- Saved-list workflows (Pillar 5)

## Data Sources

- `public.contacts` table (135,453 rows live)
- AdList vendor load (31,746 contact gap-fill)
- Future: claimed-profile self-correction flow

## Tables

| Table | Rows | Role |
|---|---:|---|
| `public.contacts` | 135,453 | Primary entity (contact = producer in current schema) |
| `public.contact_title_roles` | 8 | Title taxonomy |
| `public.departments` | 18 | Functional segmentation |
| `public.management_levels` | 6 | Role hierarchy |
| **`producer_profiles`** (proposed, D-023 migration 0091) | 0 | Verified/claimed extension — overlaps existing `contacts`; may instead become columns on `contacts` |

## UI Routes

- Current: producer data surfaces inside agency detail pages
- Future: `/producer/[slug]` — claimed producer profile
- Future: producer-centric search + segmentation views

## API Routes

- `/api/export` (Pillar 5 cross-cut)
- Future: `/api/producers/[slug]/claim`

## Pricing / Packaging Impact

- **Free:** producer name visible, contact data redacted/limited
- **Producer:** basic contact visibility
- **Growth:** advanced segmentation by title / department / management level
- **Enterprise:** full producer-level intelligence inside Distribution Expander

## Compliance Notes

- RLS forced (D-006)
- Email-domain denylist (`public.email_domain_denylist`, 36 rows) filters disposable/junk
- No source attribution leak (D-017)
- Pre-launch security gates: PII handling per `project_pre_launch_security_gates.md`

## Current Status

Schema-rich, UI-light. 135,453 contact rows live. Producer-level segmentation views queued (BACKLOG addition 2026-05-18 per D-023).

## Future Expansion

- Producer-centric segmentation views (Tier 1.x backlog new 2026-05-18)
- Claimed/verified producer profile flow (Tier 1.x backlog new 2026-05-18)
- Activity / credibility signals (Tier 2 / deferred)
- Producer × LinkedIn integration (deferred, requires data partner)
