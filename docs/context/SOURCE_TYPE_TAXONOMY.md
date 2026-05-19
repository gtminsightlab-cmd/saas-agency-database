# `agency_carriers.source_type` taxonomy

**Locked:** 2026-05-19 (Session A, D-025)
**Owner:** Agency Signal · `sdlsdovuljuymgymarou`
**Companion:** `supabase/migrations/0093_extend_for_state_doi_appointments.sql`

This doc locks the values that may appear in `public.agency_carriers.source_type`. Adding a new value requires updating this doc in the same PR.

---

## Convention

Lowercase, snake_case, no slashes, no whitespace. Format `<category>_<identifier>` where `<category>` is one of:

| Category | Pattern | Example |
|---|---|---|
| **state_doi_*** | `state_doi_<two_letter_state>` | `state_doi_tx`, `state_doi_fl`, `state_doi_ca` |
| **vendor_*** | `vendor_<vendor_slug>` | `vendor_miedge`, `vendor_adlist` |
| **manual_*** | `manual_<context>` | `manual_research`, `manual_curation` |
| **self_*** | `self_reported` | `self_reported` (agency claimed/submitted) |
| **survey_*** | `survey_<survey_id>` | `survey_2026q2_carrier_appts` |
| **inferred_*** | `inferred_<method>` | `inferred_premium_volume`, `inferred_account_pattern` |

---

## Why this matters

- **Provenance & trust scoring.** Pillar 8 (Data Quality / Hygiene) per D-023 surfaces confidence + freshness in customer-facing UI. The first dimension of "how should I trust this row" is "where did it come from." `state_doi_*` rows are regulatory ground truth; `inferred_*` rows are model output. Customers will (eventually) see those badges differently.
- **Refresh strategy.** State DOI feeds refresh at the cadence of each state's filing schedule (varies; some monthly, some quarterly). Vendor feeds refresh by purchase. Manual rows don't refresh. The category determines the refresh handler.
- **Audit + replay.** When a row's correctness is challenged, `source_type` + `source_year` + the original load_id in `ax_staging.appointment_loads` lets us trace back to the exact ingest run.

---

## Currently in use

As of 2026-05-19, all 263,657 existing `public.agency_carriers` rows have `source_type IS NULL` — pre-D-025 backfill state. They predate this taxonomy and have unknown provenance. Backfill (or replace) strategy for those rows is a **separate decision** not covered by D-025; see Session B notes / future session.

The first source_type to actually appear in data will be **`state_doi_tx`** at the start of Session B (Texas 2026 load).

---

## Reserved values

These categories may be defined here in advance even before any data uses them, so future ingests don't bikeshed naming:

- `state_doi_<XX>` for all 50 states + DC (use lowercase USPS 2-letter codes; DC = `state_doi_dc`)
- `vendor_neilson` — reserved but **never use without explicit decision**, since per D-023 Neilson is a competitor we benchmark against, not a vendor we license data from. If we ever ingest Neilson data via a partnership, decision required first.
- `inferred_*` — reserved; do NOT use without an accompanying ADR explaining the inference method and the confidence floor.

---

## Out of scope (DO NOT use as source_type values)

- The two-letter state code alone (e.g. `TX`) — that goes in `agency_carriers.state_filed`, not `source_type`.
- The year (e.g. `2026`) — that goes in `agency_carriers.source_year`, not `source_type`.
- The file name — that goes in `ax_staging.appointment_loads.source_file_name` (staging ledger), not on the prod row.

---

## How to add a new value

1. Update this doc with the new value, category, and an example.
2. Add it to the relevant Session-N migration or doc commit.
3. Apply it as part of an ingest. Don't backfill existing rows just to use the new value — only set source_type at ingest time so the provenance reflects when the row actually landed.
