# V5 Data-Integration Roadmap

**Goal:** wire the v5 scoring signals (`Specialization_Tier`, `Diversity_Class`, `Composite_Score`, `Recruit_Priority`) from `Zywave_Vertical_Analysis_v5.xlsx` into Supabase and surface them inside the directory so users can filter, sort, and act on them.

**Status:** not started. Methodology page (`/methodology`) and resources hub (`/resources`) shipped session 10. The signals are documented publicly on `/methodology` but not yet computable from data in the live directory. This roadmap is the next session's playbook.

---

## When to do this

Three clean trigger points, in order of priority:

1. **As soon as you want to convert site copy into product.** Today, the methodology page asks readers to "filter to Specialist + Diversified" — but the live `/build-list` doesn't expose those filters yet. Closing that gap is the highest-value next move.
2. **Before the next CMO Phase 3 push (testimonials).** Customers will ask "show me the recruit list you'd run for me" — better to have the actual filter UI when that happens.
3. **Before any sales demo where the methodology page is the entry point.** A prospect reading `/methodology` and clicking through to `/build-list` should see the same vocabulary applied.

It is **not** dependent on:
- Customer evidence (Phase 3 trigger)
- Stripe production cutover
- AdList loads for the eight empty verticals

So this can ship anytime — it's pure ICE on existing infrastructure.

---

## What's in v5 (recap from `HANDOFF_Seven16_Methodology.docx`)

The workbook is in `/sessions/.../uploads/Zywave_Vertical_Analysis_v5.xlsx`. Source pickles preserved at `outputs/zywave_analysis/*.pkl` on Master O's machine.

| Sheet | Rows | What's in it |
|-------|------|---------------|
| `Master Ranking` | 19,378 | One row per `(Agency × Vertical × State)`. 25 columns including the four signals. |
| `Agency Index` | 8,608 | One row per agency. Total_Policies, States_Active, Verticals_Active, Diversity_Index, Diversity_Class, Size_Tier. |
| `Hot Leads` | 209 | Pre-filtered Master Ranking rows where `Recruit_Priority='Hot Lead'`. |
| `Vertical Summary` | 12 | Per-vertical aggregates. |
| `Top Brokers per Vertical` | ~200 | Pre-rolled top recruit list per vertical. |
| `Specialty Carriers per Vertical` | ~100 | Carrier parents that qualify as specialty per vertical. |
| `Carrier Parent Map` | 291 | Writing-company → parent group rollup. |
| `Excluded Entries` | ~30 | Payroll/PEO + carrier-direct strings that get removed every load. |

The four signals are computed at the `(Agency × Vertical × State)` level — i.e., the same agency can be Specialist in Construction-Florida and Exposure in Construction-California. Some rollups (Diversity_Class) are stable per agency and don't vary by vertical.

---

## Migration shape — Option A (recommended)

Add v5-derived columns alongside the existing `agencies` table. Cell-level data goes into a new partition.

### Migration `0056_v5_signals.sql`

```sql
-- 1. Per-agency rollups (one-to-one with agencies table)
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS size_tier text
    CHECK (size_tier IN ('National','Large','Medium','Small')),
  ADD COLUMN IF NOT EXISTS diversity_index numeric(4,3),
  ADD COLUMN IF NOT EXISTS diversity_class text
    CHECK (diversity_class IN ('Diversified','Balanced','Concentrated','Single-Carrier')),
  ADD COLUMN IF NOT EXISTS effective_carriers numeric(5,2),
  ADD COLUMN IF NOT EXISTS top_carrier_parent text,
  ADD COLUMN IF NOT EXISTS top_carrier_share numeric(4,3),
  ADD COLUMN IF NOT EXISTS total_policies_v5 int,
  ADD COLUMN IF NOT EXISTS states_active int,
  ADD COLUMN IF NOT EXISTS verticals_active int,
  ADD COLUMN IF NOT EXISTS v5_loaded_at timestamptz;

CREATE INDEX IF NOT EXISTS agencies_size_tier_idx ON public.agencies(size_tier);
CREATE INDEX IF NOT EXISTS agencies_diversity_class_idx ON public.agencies(diversity_class);

-- 2. Per (agency × vertical × state) cell scores
CREATE TABLE IF NOT EXISTS public.agency_vertical_scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id       uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  vertical_slug   text NOT NULL REFERENCES public.vertical_markets(slug),
  state_code      text NOT NULL,                -- 'FL', 'CA', etc.
  size_tier       text,
  recruit_priority text NOT NULL
    CHECK (recruit_priority IN ('Hot Lead','Warm Lead','Watch','Skip')),
  grade_in_tier   text CHECK (grade_in_tier IN ('A','B','C','D','F')),
  composite_score numeric(5,2),
  specialization_tier text NOT NULL
    CHECK (specialization_tier IN ('Specialist','Growing','Exposure','—')),
  specialty_carriers_appointed int NOT NULL DEFAULT 0,
  policies_in_cell int NOT NULL DEFAULT 0,
  local_market_share numeric(5,4),
  vertical_strength_index numeric(5,3),
  share_of_vertical_for_agency numeric(5,4),
  share_of_state_for_agency numeric(5,4),
  share_of_agency_book numeric(5,4),
  carrier_appointments_in_vert int,
  top_carrier_in_vert text,
  top_carrier_share_in_vert numeric(4,3),
  diversity_index_in_vert numeric(4,3),
  diversity_class_in_vert text,
  loaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, vertical_slug, state_code)
);

CREATE INDEX agency_vertical_scores_agency_idx ON public.agency_vertical_scores(agency_id);
CREATE INDEX agency_vertical_scores_vertical_idx ON public.agency_vertical_scores(vertical_slug);
CREATE INDEX agency_vertical_scores_recruit_idx ON public.agency_vertical_scores(recruit_priority);
CREATE INDEX agency_vertical_scores_composite_idx ON public.agency_vertical_scores(composite_score DESC);
CREATE INDEX agency_vertical_scores_compound_idx
  ON public.agency_vertical_scores(vertical_slug, state_code, recruit_priority, composite_score DESC);

-- 3. RLS — same model as existing agency tables
ALTER TABLE public.agency_vertical_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agency_vertical_scores read for authed"
  ON public.agency_vertical_scores
  FOR SELECT
  TO authenticated
  USING (true);  -- Same as agencies.public_select policy; v5 signals are
                  -- non-sensitive directory metadata, no per-tenant gating needed.

-- (no INSERT/UPDATE/DELETE policy = nobody writes via PostgREST; only the
--  loader script using the service role key can mutate)
```

### Why a new table, not just columns on `agencies`

Master Ranking has 19,378 rows; `agencies` has 8,608. The agency × vertical × state grain is denormalized for `agencies`. A separate table keeps `agencies` clean and lets `agency_vertical_scores` carry the (vertical, state) dimensions without making `agencies` a wide-and-mostly-null table.

### What about the existing `agencies` columns?

A handful of existing per-agency rollup fields make sense to update directly on `agencies` (size_tier, diversity_index, diversity_class) rather than via the score table. That's why the migration touches both.

---

## Data load pipeline

Two options — Edge Function (preferred for refresh cadence) or one-shot psql script (faster to ship first time).

### Option A — One-shot loader (fastest to ship)

```python
# scripts/load_v5_signals.py
# Run from a machine with the service-role key. ~30 min for 19k rows.
import pandas as pd
from supabase import create_client

sb = create_client(URL, SERVICE_ROLE_KEY)

# 1. Load Agency Index → upsert into agencies (only the v5 columns)
agency_idx = pd.read_excel("Zywave_Vertical_Analysis_v5.xlsx", sheet_name="Agency Index")
for _, row in agency_idx.iterrows():
    # match on normalized name OR EIN (v5 doesn't have agency UUIDs from Supabase yet —
    # we need a `name_normalized` join key; if no match, log and skip)
    sb.table("agencies").update({
      "size_tier": row["Size_Tier"],
      "diversity_index": row["Diversity_Index"],
      "diversity_class": row["Diversity_Class"],
      "effective_carriers": row["Effective_Carriers"],
      "top_carrier_parent": row["Top_Carrier_Parent"],
      "top_carrier_share": row["Top_Carrier_Share"],
      "total_policies_v5": row["Total_Policies"],
      "states_active": row["States_Active"],
      "verticals_active": row["Verticals_Active"],
      "v5_loaded_at": now,
    }).eq("name_normalized", row["Agency_Normalized"]).execute()

# 2. Load Master Ranking → upsert into agency_vertical_scores
master = pd.read_excel("Zywave_Vertical_Analysis_v5.xlsx", sheet_name="Master Ranking")
batch = []
for _, row in master.iterrows():
    agency_id = lookup_agency_id(row["Agency"])
    if not agency_id: continue
    vertical_slug = remap_to_s16_slug(row["Vertical"])
    if not vertical_slug: continue
    batch.append({...})
    if len(batch) >= 500:
        sb.table("agency_vertical_scores").upsert(batch, on_conflict="agency_id,vertical_slug,state_code").execute()
        batch = []
```

### Critical join key issue

The `agencies` table currently uses Supabase UUIDs. The v5 workbook uses normalized agency name strings (e.g., `"ALLIANT INSURANCE SERVICES"`). The loader needs a name-match step — and we know from session 7 that this is fragile. **Build a `name_normalized` column on `agencies` first** (lowercased, punctuation-stripped, branch-suffix-removed) and use that as the join key. Migration `0057_agencies_name_normalized.sql`.

### Option B — Edge function with cron

For monthly refresh cadence (which the methodology page promises), wrap the loader in a Supabase Edge Function and trigger via `pg_cron` or a Vercel cron. Defer until refresh becomes a recurring need.

---

## UI changes

### `/build-list` filter chips (highest leverage)

Add three filter facets above the existing column filters:

```
┌─ Recruit Priority ──┬─ Specialization ──┬─ Diversity Class ──┐
│ Hot Lead   (209)   │ Specialist  (1351)│ Diversified (2133) │
│ Warm Lead  (919)   │ Growing     (853) │ Balanced     (232) │
│ Watch      (256)   │ Exposure   (1104) │ Concentrated  (52) │
│ Skip       (n/a)   │ —          (16070)│ Single-Carrier ( 6174)│
└────────────────────┴───────────────────┴────────────────────┘
```

Each chip is a multi-select. Default state: nothing selected (full directory). Clicking "Specialist" filters to specialty agencies. Clicking "Diversified" filters out captives. Combining "Specialist + Diversified" runs Recruit Play 01 from the methodology page.

Implementation: `app/build-list/filter-chips.tsx`. Read state from URL query params so filters survive refresh. Wire up `recruit_priority`, `specialization_tier`, `diversity_class` to a server action that filters `agency_vertical_scores`.

### Agency card columns

In `/build-list/review` and `/quick-search` results, add three new columns/badges:

| Column | Visual |
|--------|--------|
| Specialization Tier | Pill: 🟢 Specialist / 🟡 Growing / 🟠 Exposure / — |
| Diversity Class | Pill: 🟢 Diversified / 🔵 Balanced / 🟠 Concentrated / ⚪ Single-Carrier |
| Composite Score | 0-100 number, sortable column |

Components: `components/app/specialization-pill.tsx`, `components/app/diversity-pill.tsx`. Reuse the color tokens defined in the methodology page.

### Vertical pages — top 25 view

On `/verticals/<slug>`, add a "Top 25 recruit targets" tab that's a pre-rolled view over `agency_vertical_scores` filtered to that vertical, sorted by composite score, with state filter. This is essentially Recruit Play 03 turned into a one-click view.

### Sort default

Once `composite_score` is on every cell, change the default sort on `/build-list/review` from policy_count to composite_score. This is the single most impactful change for users who haven't read the methodology page — they'll get a pre-sorted recruit list automatically.

---

## Whitelisted vs gated columns

By tier:
- **Free plan:** see the badges (Specialization Tier, Diversity Class). Cannot filter by them.
- **Growth Member:** filter and sort by all three signals. Export with all v5 columns in the CSV.
- **One-Time Snapshot:** same as Growth for the snapshot vertical.

This matches the existing tier-gating model (PII reveal on contacts).

---

## RLS notes

`agency_vertical_scores` is non-sensitive directory metadata — same trust posture as the existing `agencies.public_select` policy. The CHECK constraints in the migration enforce data integrity at the DB layer.

There is one case where tier-gating belongs at the row-policy level: if we ever decide free-plan users can only SELECT a subset of cells (e.g., 25 rows). Until that's required, single permissive `to authenticated` policy is correct.

---

## Refresh cadence

Methodology page promises 30-day refresh. To honor that:

1. Master O's machine generates a fresh `Zywave_Vertical_Analysis_v6.xlsx` monthly (existing pipeline).
2. Loader script reads v6, computes a delta vs. v5 (changed cells only), and pushes upserts.
3. Add a `verified_at` column on `agency_vertical_scores` updated each load. Surface "Verified Mar 2026" on agency cards.

The very first load can ignore the delta logic and just truncate-and-load the whole table. Delta is an optimization for refresh #2+.

---

## Open questions to resolve before starting

1. **Agency name match rate** — Master O's pickles have `Agency_Normalized`. The Supabase `agencies` table needs a matching `name_normalized` column. What fraction of v5 names will match cleanly to existing agencies? (Run a dry-run first.)
2. **State coverage gap** — `agency_vertical_scores` is per-state. The Supabase `agencies` table has a per-agency state but we'd need to verify cell-level state assignments are well-formed (49 states? 50? DC?).
3. **Vertical taxonomy alignment** — v5 uses 9 verticals with data; Supabase has 12. The empty 3 (Tech/Cyber, Public Entity, Energy) won't have v5 rows. Does the UI handle "no v5 data for this vertical" gracefully? (Should show "Coming soon" or hide the tier filters.)
4. **Premium weighting** — only 19% of v5 rows have Est. Annual Prem. Methodology page is explicit that this is why we don't rank by premium. Don't surface premium-weighted scoring until coverage > 60%.

---

## Effort estimate

For one focused session:
- ~30 min: migration 0056 + 0057
- ~60 min: loader script + name-match dry-run
- ~45 min: filter chips on /build-list
- ~30 min: pill components + agency-card column additions
- ~15 min: default sort change
- ~30 min: end-to-end QA

Total: ~3.5 hours of focused work. Can fit in one session if no surprises in the name-match step.

---

## Files this work will touch

| File | Change |
|------|--------|
| `supabase/migrations/0056_v5_signals.sql` | NEW |
| `supabase/migrations/0057_agencies_name_normalized.sql` | NEW |
| `scripts/load_v5_signals.py` | NEW |
| `components/app/specialization-pill.tsx` | NEW |
| `components/app/diversity-pill.tsx` | NEW |
| `app/build-list/filter-chips.tsx` | NEW |
| `app/build-list/page.tsx` | MODIFY — add filter chip section |
| `app/build-list/review/page.tsx` | MODIFY — add columns, default sort |
| `app/quick-search/page.tsx` | MODIFY — add columns |
| `app/verticals/[slug]/page.tsx` | MODIFY — add "Top 25 recruit targets" tab |

10 files. Within the spirit of the two-file change limit (which applies to data ops; this is feature build).

---

## Out of scope for this work

- A/B testing of the new filter chips (deferred until traffic justifies it)
- Premium-weighted scoring (premium coverage too low)
- Real-time refresh (monthly is the promise, monthly is enough)
- Composite score recomputation in-database (compute offline, load result)
- Whitespace verticals (Tech/Cyber, Public Entity, Energy) — hide their tier filters until AdList loads happen

End of roadmap.
