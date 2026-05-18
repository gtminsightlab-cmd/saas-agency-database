# Domain — Data Quality / Hygiene (Pillar 8)

**Locked:** 2026-05-18 (D-023 / ADR-023)
**Status:** Engine in · UI light · trust-as-feature work queued

## Purpose

Build trust. Data trust is a product feature, not just backend plumbing. Surface confidence + verification + freshness in UI so users can act on data they can trust.

## Primary Users

All 4 personas — trust is a universal product attribute. Most leveraged by:
- MGA/MGU/Wholesaler (high-stakes appointment decisions)
- Carrier / Program Admin (distribution investments)

## Included

- canary filtering (16-pattern Neilson watermark scrub)
- dedupe (multi-signal cascade: email → web → phone+state → name+state+zip → addr+state+zip)
- confidence scoring (per record)
- email domain filtering (disposable/junk denylist, 36 rows)
- stale record detection
- verified profile indicators
- audit logs (1,317 rows live)
- claimed profile corrections (Pillar 1 + 2 cross-cut)
- data refresh visibility ("last refreshed" timestamps)
- "needs verification" flags
- hygiene events for saved-list refresh integration (Pillar 6 cross-cut)

## Excluded

- Source attribution to consumers (D-017 — kept opaque)
- External data-quality vendor integration (no paid services until DOT Intel revenue per family standing rule)
- Manual record-level editing by end users (would create attribution chaos)

## Data Sources

- `public.data_load_denylist` (16 Neilson canary patterns)
- `public.email_domain_denylist` (36 disposable/junk patterns)
- Internal dedup heuristics in `scripts/load-adlist.ts`
- Audit trail from all mutating operations

## Tables

| Table | Rows | Role |
|---|---:|---|
| `public.audit_log` | 1,317 | SOC 2 trail; trigger-populated (mig 0044) |
| `public.data_load_denylist` | 16 | Neilson watermark patterns |
| `public.email_domain_denylist` | 36 | Disposable/junk email filter |
| `public.hygiene_events` | 0 | Stub for refresh-time signals (Pillar 6 cross-cut) |
| `public.saved_list_hygiene_flags` | 0 | Stub for per-row hygiene tags |
| `public.feature_flags` | 8 | Used for hygiene-feature gating |
| `public._trucking_load_log` | 71 | Trucking load history (RLS disabled — BACKLOG #10) |

## UI Routes

- `/admin/hygiene` — hygiene & refresh module (partial)
- `/admin/data-quality` — data quality module
- `/admin/data-engine/sources` — source curation
- `/admin/system-health` — health indicators
- Future: confidence badges in `/agency-directory` + `/saved-lists`
- Future: "needs verification" flags + stale alerts in UI

## API Routes

- `/api/admin/data-engine/upload` — vendor xlsx upload + canary scrub
- Internal: `mig 0041_scan_watermark_canaries_rpc` — canary scan RPC

## Pricing / Packaging Impact

- **Free:** records visible but with confidence redacted
- **Producer:** basic confidence indicators
- **Growth:** confidence filters + stale-record alerts
- **Enterprise:** full data-quality dashboard + custom thresholds inside Distribution Expander (Pillar 7)

## Compliance Notes

- RLS forced (D-006) — `_trucking_load_log` currently RLS-disabled, BACKLOG #10 quick-win
- Audit log trigger-populated on every high-value table mutation (mig 0044)
- 100% canary scrub success across 16 patterns AS Dedicated 2 (commit history `2026-05-09`)
- Neilson exclusion separately enforced per `data_load_denylist`; D-017 attribution scrub on directory.* mirror

## Current Status

Engine in. **UI light** — confidence + freshness signals exist in data layer but aren't surfaced as a product feature yet. New per D-023: surface confidence badges + stale alerts + verified flags in UI (Tier 1.x backlog).

## Future Expansion

- Confidence badges + stale alerts in `/agency-directory` + `/saved-lists` (Tier 1.x new 2026-05-18)
- Verified / claimed profile flow (Pillar 1 + 2 cross-cut, new 2026-05-18)
- Hygiene events integration with saved-list refresh (Pillar 6 cross-cut, BACKLOG #1 dependency)
- `_trucking_load_log` RLS cleanup (BACKLOG #10)
- 84 pre-existing SECURITY DEFINER advisor cleanup (deferred — pre-existing, not session-introduced)
- Contacts dedup edge case (+16,273 churn from AS Dedicated 2 re-run — NULL handling in `keyOf()`; deferred)
- Pre-launch security gates (PITR, CSP, Upstash rate limiting, Better Stack uptime per `project_pre_launch_security_gates.md`)
