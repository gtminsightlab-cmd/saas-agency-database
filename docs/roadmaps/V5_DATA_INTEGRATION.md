# V5 Data-Integration Roadmap

> **STATUS — 2026-04-26: SUPERSEDED. Plan revised after dry-run findings (see "Why this doc was rewritten" below). The original "match on `name_normalized`" approach does not work at the grain we have today. A new approach is required before any loader work begins.**

## Why this doc was rewritten

The first version of this roadmap (committed 2026-04-26 as part of `5f9b380`) assumed v5 agency names would join 1:1 to Supabase `agencies` rows on a `name_normalized` column. We tried it. It failed.

**Dry-run results (top 500 v5 agencies by policy count):**
- Exact-match rate: **32.4%** (162 / 500)
- Policy-weighted match rate: **52.6%** (16,891 of 32,123 policies)
- Threshold the loader strategy required: **≥ 90%**

The 90% threshold is missed by a wide margin, and the missing matches aren't a normalization problem — they're a **grain mismatch**.

## The structural finding

v5's `Agency Index` sheet is at **parent-agency grain**: one row per agency identity. Example:
- v5: `ACRISURE` (1 row, 1,802 policies, 41 states active)

The Supabase `agencies` table is at **branch grain**: one row per office location. The same Acrisure parent identity is represented as 30+ rows like:
- `Acrisure - Atlanta GA`
- `Acrisure of Texas LLC`
- `Acrisure - Tulsa OK`
- ...

When the dry-run normalizes both sides and tries equality, v5's `ACRISURE` finds zero matches because Supabase has no row called just "Acrisure" — only branch rows. Same pattern for AON, MARSH (117 candidates), IMA (48), LOCKTON, HYLANT (9), TROXELL, LEAVITT GROUP (25), HUB INTERNATIONAL, USI INSURANCE SERVICES, etc. The 32% that did match are agencies small enough that v5 and Supabase happen to use the same single name (no branches).

**The agencies are in Supabase. They just don't join cleanly on name.**

## What was applied to production then reverted

Three Supabase migrations (0057, 0058, 0059) were applied during session 10 to scaffold the failed approach:
- `0057_agencies_name_normalized` — added a generated `name_normalized` column + index on `agencies`
- `0058_normalize_agency_name_fix_trailing_and` — bug fix on the normalization function
- `0059_normalize_agency_name_lock_search_path` — security advisor fix

Plus a transient staging table `public._dryrun_v5_names` for the dry-run.

After the dry-run revealed the grain mismatch, Master O chose full revert. Migration `0060_revert_v5_dryrun_infrastructure` was applied to drop the column, the function, and the staging table. **Database is now back at the ad8f31a-equivalent baseline.**

The Supabase migration log retains the four entries (0057, 0058, 0059, 0060) for audit purposes, but the repo's `supabase/migrations/` folder is unchanged (none of these were committed to the repo).

## What the next attempt needs to solve

Before any loader work, the next session needs to pick a strategy for the parent-vs-branch grain gap. Three options on the table, in order of cleanliness:

### Option A: Populate `agencies.parent_agency_id` via clustering pass (cleanest)
The Supabase schema already has `parent_agency_id uuid REFERENCES agencies(id)` and `parent_name text` columns. Today they're empty. Run a one-time clustering pass that groups branch rows under a synthetic parent row, populates `parent_agency_id` on each branch, and inserts the parent row.

After the clustering pass, v5 joins to **the parent row** by name (branches never need to match v5 directly). This makes the v5 signals naturally apply to the whole agency family.

Lift: ~1 day. Clustering is the hard part (NLP-style string-similarity bucketing on the 17,176 distinct Supabase names; manual review of the top 100 mappings). Migration to add the parent rows is straightforward.

### Option B: Denormalize v5 to per-branch (fastest, lossy)
Instead of joining v5 → Supabase parent, broadcast each v5 row across ALL Supabase rows whose `name_normalized` starts with the v5 name. So v5's `ACRISURE` row becomes 30 score rows in `agency_vertical_scores`, one per branch.

Lift: half a day. But losing precision: every Acrisure branch in Atlanta gets the same Specialization Tier as Acrisure in Tulsa, even though their actual books may differ. This is fine for the "Specialist + Diversified" filter use case (the parent IS the recruit target — the branch is just where you call), less fine for state-by-state Top 25 views.

### Option C: Use prefix + post-filtering (compromise)
Match v5 by name_normalized prefix, but disambiguate using state. For the v5 `(Agency × Vertical × State)` cell, match against Supabase rows where `name_normalized` starts with v5 norm AND `state` matches. Then attribute the v5 cell's score to the matching Supabase branches in that state only.

Lift: ~1 day. More accurate than Option B for state-keyed views, but more loader complexity.

## Recommended strategy: Option A

Reasoning:
1. The parent-rollup is fundamentally needed regardless of v5 — it shows up everywhere in the UI (e.g., `/admin/customers`, `/build-list/review` group-by). Doing it once unlocks v5 AND fixes other latent issues.
2. The `parent_agency_id` column already exists. Just needs population.
3. The loader for v5 then becomes trivial: match v5 name → `agencies` row WHERE `parent_agency_id IS NULL` AND `name_normalized = v5_norm`. This is exactly what the original plan tried, but applied to the parent rows that don't exist yet.

## Phased plan (TO BE EXECUTED IN A FUTURE SESSION)

**Phase 0 — name normalization redux.** Re-add migrations 0057+0058+0059 (or equivalent). The normalization function is broadly useful regardless of v5; many other features (search, deduplication) want it.

**Phase 1 — parent clustering.** Build a Python script (or Postgres function) that groups Supabase agency rows by similarity and inserts parent rows. Acceptance test: Top 50 known parents (ACRISURE, AON, MARSH, etc.) each have a parent row with `parent_agency_id IS NULL` and 5+ branch rows pointing to them.

**Phase 2 — v5 loader.** Now the original plan works. Migration 0061 adds the v5 columns and `agency_vertical_scores` table. Loader script joins v5 → parent rows.

**Phase 3 — UI integration.** Filter chips on `/build-list`, pill components, default sort by composite_score. Same as the original roadmap's UI section.

## Files this work will touch (revised)

| File | Change | Phase |
|------|--------|-------|
| `supabase/migrations/0057_*.sql` (re-add normalization) | NEW | 0 |
| `scripts/cluster_agency_parents.py` | NEW | 1 |
| `supabase/migrations/0058_populate_parent_agency_id.sql` | NEW | 1 |
| `supabase/migrations/0061_v5_signals.sql` | NEW | 2 |
| `scripts/load_v5_signals.py` | NEW | 2 |
| `components/app/specialization-pill.tsx` | NEW | 3 |
| `components/app/diversity-pill.tsx` | NEW | 3 |
| `app/build-list/filter-chips.tsx` | NEW | 3 |
| `app/build-list/page.tsx` | MODIFY | 3 |
| `app/build-list/review/page.tsx` | MODIFY | 3 |
| `app/quick-search/page.tsx` | MODIFY | 3 |
| `app/verticals/[slug]/page.tsx` | MODIFY | 3 |

12 files across 4 phases.

## Open questions to answer before starting Phase 0

1. **Clustering threshold.** What string-similarity threshold (Jaro-Winkler? Levenshtein? Token-overlap?) groups Supabase branches together? Needs a manual review pass on top 100 candidate clusters before the script runs at scale.
2. **Parent-row creation.** Insert synthetic parent rows into `agencies` table (with `parent_agency_id IS NULL`)? Or create a separate `agency_parents` table? Schema implications either way.
3. **State coverage.** Some v5 cells are at `(Agency × Vertical × State)` grain. Even after parent rollup, the per-state cell needs to attribute to the branches in that state. Confirm this works before Phase 2.
4. **Premium-weighted scoring.** Only 19% of v5 rows have premium data. Skipped in original roadmap; still skipped.

## Out of scope for this work (unchanged from prior version)

- A/B testing of the new filter chips (deferred until traffic justifies it)
- Real-time refresh (monthly is the promise, monthly is enough)
- Whitespace verticals (Tech/Cyber, Public Entity, Energy) — hide their tier filters until AdList loads happen
- Composite score recomputation in-database (compute offline, load result)

End of revised roadmap.
