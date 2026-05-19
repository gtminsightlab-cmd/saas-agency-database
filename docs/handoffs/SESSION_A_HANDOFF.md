# Family-Hub Session A — State DOI appointment ETL schema prep (2026-05-19)

**Date:** 2026-05-19
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `main`
**Predecessor:** [`SESSION_27_HANDOFF.md`](SESSION_27_HANDOFF.md)
**HEAD at session open:** `726d1f8` locally (7 commits behind `origin/main`); fast-forwarded to `7c86825` mid-Slice-1
**HEAD at session close:** *TBD — set after commit at Slice 6*
**Live URL:** https://directory.seven16group.com (no app changes — DB-only session; Vercel rebuild expected to pass cleanly)
**Working directory:** `C:\Users\GTMin\Projects\saas-agency-database\` (canonical, NOT OneDrive)

---

## Why this session interrupted SESSION_28

Master O dropped a path mid-SESSION-28-prep:

```
C:\Users\GTMin\OneDrive\Desktop\Agency Level Carrier Appointments
```

One file in that folder: `Texas 2026.csv`. 45.9 MB, 367,484 data rows + header. Schema:

```
NAIC ID, Insurance company name, Appointment active date, Appointment type,
Agency NPN, Agency EIN, Agency name
```

Each row = "Agency X is regulator-authorized in Texas to write line-of-business Z for Carrier Y, as of date D." This is **Pillar 3 regulatory ground-truth per D-023** (Carrier Appointment Intelligence).

CTO recommendation: **this data jumps the queue ahead of SESSION_28 UI redesign.** Data that makes the underlying product 10× more valuable beats UI re-skinning. SESSION_28 (Intelligence Home + Vertical Intelligence) pushed to queued; Sessions 27-32 epic paused until the appointment data lands.

**Master O greenlit a 2-session arc:**
- **Session A (this session, ~3 hrs):** Schema + ETL doctrine prep. No row writes to prod. ← SHIPPED
- **Session B (next, ~4 hrs):** Actual Texas load with checkpoints + validation gates + canary verification.

---

## Pre-flight findings (read-only DB inspection)

Three structural gaps surfaced before any schema work — these shaped the migration:

1. **No NPN or EIN columns on `agencies`** — file's primary agency keys had nowhere to land. Migration 0093 added them.
2. **All 1,369 `carriers` rows have `naic_code IS NULL`** — file's primary carrier key has nothing to match against today. Session A produced a 937-row mapping CSV for Session B backfill. Master O spot-checks before any `carriers.naic_code` writes.
3. **All 263,657 existing `agency_carriers` rows have `source_type IS NULL` and ZERO have 'TX' in `states`.** They predate D-025 taxonomy. Backfill / replace strategy for them is a separate decision (NOT covered this session).

State coverage in `agencies` table at session open: CA 3913 / NY 3185 / TX 3086 / FL 2853 / PA 2167 / OH 2053 / MI 1959 / NC 1724 / IL 1714 / GA 1360. Texas DOI file likely contains tens of thousands of distinct agencies — most are small retail producers we don't track yet.

---

## What shipped — 6 slices

### Slice 1 — Pre-flight & orient (~15 min)
- `git pull --ff-only` fast-forwarded local main `726d1f8` → `7c86825` (7 commits behind — SESSION_26 marketing homepage + SESSION_27 foundation shell already on remote)
- Confirmed latest applied migration `0092_saved_list_entity_ids_and_ack` (version `20260518230459`)
- Read updated BACKLOG, SESSION_27_HANDOFF, ENGINEERING_DOCTRINE, DECISION_LOG D-023/D-024

### Slice 2 — Migration 0093 (~45 min)
File: `supabase/migrations/0093_extend_for_state_doi_appointments.sql`

Applied via Supabase MCP `apply_migration` to project `sdlsdovuljuymgymarou`. Verified column-by-column.

```sql
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS npn TEXT,
  ADD COLUMN IF NOT EXISTS ein TEXT;

CREATE INDEX IF NOT EXISTS idx_agencies_npn ON public.agencies(npn) WHERE npn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agencies_ein ON public.agencies(ein) WHERE ein IS NOT NULL;

ALTER TABLE public.agency_carriers
  ADD COLUMN IF NOT EXISTS appointment_active_date DATE,
  ADD COLUMN IF NOT EXISTS state_filed             TEXT,
  ADD COLUMN IF NOT EXISTS source_year             SMALLINT;

CREATE INDEX IF NOT EXISTS idx_agency_carriers_agency_carrier_state
  ON public.agency_carriers(agency_id, carrier_id, state_filed)
  WHERE state_filed IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agency_carriers_state_filed
  ON public.agency_carriers(state_filed)
  WHERE state_filed IS NOT NULL;
```

**Design choices locked at start of session:**
- Non-unique NPN/EIN B-tree (branches may share parent NPN; promote to unique later if data proves it)
- Partial indexes `WHERE NOT NULL` to keep index size minimal during backfill period

### Slice 3 — Migration 0094 (~15 min)
File: `supabase/migrations/0094_ax_staging_schema.sql`

Applied via Supabase MCP. New schema `ax_staging` with 4 tables, all with RLS enabled + forced + service-role policy:

| Table | Purpose | Key fields |
|---|---|---|
| `appointment_loads` | Ingest-run ledger | source_type, source_state, source_year, source_file_name, source_file_sha256, started_at, completed_at, row_count_raw/loaded/rejected, status CHECK(running/completed/failed/rolled_back) |
| `appointment_load_pages` | Per-page checkpoint | load_id FK, page_no, row_offset, row_count, started_at, completed_at, status, UNIQUE(load_id, page_no) |
| `appointments_raw` | Landing zone (text-typed) | load_id FK, row_no, naic_id_raw, insurance_company_name_raw, appointment_active_date_raw, appointment_type_raw, agency_npn_raw, agency_ein_raw, agency_name_raw, raw_json (jsonb) |
| `appointment_rows_rejected` | Validation fail bucket | load_id FK, raw_row_id, row_no, reason_code, reason_detail, raw_json |

**Lockdown verified:**
- `REVOKE ALL ON SCHEMA ax_staging FROM PUBLIC, anon, authenticated;`
- `GRANT USAGE ... TO service_role;` only
- **NOT** added to `authenticator.pgrst.db_schemas` — schema NOT exposed via PostgREST
- ALTER DEFAULT PRIVILEGES grants service_role on future tables/sequences

**Verification query result:**
```
appointment_load_pages    | rls=t | force=t | policy=1
appointment_loads         | rls=t | force=t | policy=1
appointment_rows_rejected | rls=t | force=t | policy=1
appointments_raw          | rls=t | force=t | policy=1
```

### Slice 4 — NAIC mapping CSV (~45 min)
**Script:** `scripts/texas-naic-mapping.py` (committed)
**Output:** `tmp/texas_naic_mapping.csv` (NOT committed; `tmp/` added to `.gitignore`)

Approach:
1. Read carriers JSON from a saved Supabase MCP tool-result file (envelope: `{"result": "<text with <untrusted-data-...> markers wrapping JSON array>"}`)
2. Read Texas 2026 CSV and extract distinct (NAIC ID, Insurance company name) pairs with appearance counts
3. For each Texas pair: fuzzy-match against all 1,369 carriers using stdlib `difflib.SequenceMatcher` on normalized names (lowercase + strip "insurance/company/co/corp/inc/llc/ltd/group/grp/the/and/of/a" + strip punctuation)
4. Bucket by score: ≥0.92 → `map`, ≥0.75 → `review`, <0.75 → `create`
5. Write mapping CSV with naic_id, csv_carrier_name, csv_appearance_count, matched_carrier_id, matched_carrier_name, matched_group_name, match_score, action

**Results:** 937 distinct Texas carriers → **300 map / 301 review / 336 create**

**Sample quality (eyeball):**
- `map` band: 10014 Affiliated FM Insurance Company → Affiliated FM (1.000); 10030 Westchester Fire Insurance Company → Westchester Fire Insurance Company (1.000); 10111 American Bankers Insurance Company of Florida → identical (1.000)
- `review` band: 10043 American National Lloyds → American National (0.829, likely match); 10052 Chubb National → Columbia National (0.774, FALSE match — needs eyeball); 10072 ENCOMPASS P&C → NJM P&C (0.833, FALSE match)
- `create` band: 10006 Cerity Insurance → ACUITY (0.667, correct: Cerity is net-new); 10216 Texas Bonding Company → AIU Holdings (0.560, correct: net-new)

**Why difflib not rapidfuzz:** stdlib only on Master O's Python 3.14 (no PyO3 forward-compat hassle per family memory). ~937 × 1,369 comparisons = trivial; ran in seconds.

### Slice 5 — Doc updates (~30 min)
- **NEW** `docs/context/SOURCE_TYPE_TAXONOMY.md` — locks `state_doi_<state>` lowercase convention + reserved values (`vendor_*`, `manual_*`, `self_*`, `survey_*`, `inferred_*`) + out-of-scope rules (state code goes in `state_filed`, year in `source_year`, file name in staging ledger)
- **APPEND** `docs/context/DECISION_LOG.md` — D-025 logged in §1 Brand architecture table; "Last updated" header bumped to 2026-05-19
- **BUMP** `docs/context/SESSION_STATE.md` — date + Session A delta at top
- **RESHUFFLE** `docs/BACKLOG.md` — Last reviewed line + Active arc switched to Session A/B; Sessions 27-32 epic marked `[paused]`; Done section gets Session A entry
- **NEW** `.gitignore` — added `tmp/` to keep mapping CSV out of git

### Slice 6 — Commit, push, verify, handoff (in progress)
Single squash commit `feat(d-023,etl): migrations 0093+0094 prep state DOI appointment loads (Session A)`.

Files in commit:
```
M  .gitignore
M  docs/BACKLOG.md
M  docs/context/DECISION_LOG.md
M  docs/context/SESSION_STATE.md
A  docs/context/SOURCE_TYPE_TAXONOMY.md
A  docs/handoffs/SESSION_A_HANDOFF.md       ← this file
A  docs/handoffs/SESSION_B_PROMPT.md        ← paste-ready Session B opener
A  scripts/texas-naic-mapping.py
A  supabase/migrations/0093_extend_for_state_doi_appointments.sql
A  supabase/migrations/0094_ax_staging_schema.sql
```

10 files. No app code touched — Vercel will rebuild and deploy READY without functional change.

---

## D-025 logged

**Decision:** Agency identity keyed by NPN+EIN; state DOI feeds are authoritative for appointment data.

**Why:** NPN + EIN are the only reliable join keys across 50 state DOI feeds. Fuzzy-matching agency names across state files would compound resolution error catastrophically. State DOI feeds are the regulator's record — preferred over vendor-scraped, modeled, or self-reported data. Structural defensibility moat vs Neilson ($1,500/state vendor pricing per family memory).

**Non-unique indexes are conservative-now/strict-later** — promoting to unique would block ingest if duplicates surface and costs almost nothing at our query scale. Decision deferred until Texas load proves the right shape.

**Full text:** `docs/context/DECISION_LOG.md` §1 (search for `D-025`).

---

## DB state at session close

```
public.agencies         32,951 rows (3,086 TX)  — npn + ein columns added, both null today
public.contacts        135,453 rows
public.agency_carriers 263,657 rows  — appointment_active_date / state_filed / source_year added, all null today
public.carriers          1,369 rows  — naic_code column already existed, all null today (Session B backfill)
ax_staging.appointment_loads          0 rows  — ETL ledger empty
ax_staging.appointment_load_pages     0 rows
ax_staging.appointments_raw           0 rows
ax_staging.appointment_rows_rejected  0 rows
```

Two applied migration versions logged in `supabase_migrations.schema_migrations`:
- `<TBD timestamp>` `extend_for_state_doi_appointments`
- `<TBD timestamp>` `ax_staging_schema`

---

## What's blocked vs. unblocked

**Unblocked (Session B can start whenever Master O spot-checks NAIC mapping):**
- Texas 2026 CSV load via `ax_staging` ETL pipeline
- Future 49-state DOI ingests reuse the same schema + pattern
- `agency_carriers.source_type='state_doi_tx'` + `state_filed='TX'` + `source_year=2026` tagging now legal

**Blocked / pending decisions:**
- **NAIC mapping spot-check (Master O, ~30-60 min):** open `tmp/texas_naic_mapping.csv` in Excel. Accept all `map` rows (300). Eyeball `review` rows (301) and flip false matches to `create`. Confirm `create` rows (336) are actually new carriers. Output: a confirmed-action CSV that Session B applies as `UPDATE carriers SET naic_code = ? WHERE id = ?` (for map+review-accept) and `INSERT INTO carriers (name, naic_code) VALUES ...` (for create).
- **Decision on existing 263,657 source_type-NULL `agency_carriers` rows:** keep / re-tag / overlay / replace? Recommend deferring to Session B+1 — Session B should focus on cleanly landing Texas without disturbing the pre-existing rows.
- **NPN uniqueness promotion:** wait until Texas load completes and we can SELECT npn, count(*) GROUP BY npn HAVING count(*) > 1 to see actual collision shape.

**Still pending from earlier sessions (Master O dashboard tasks, NOT this session):**
1. **CRON_SECRET in Vercel** (5 min, SESSION_25 pending)
2. **Stripe webhook endpoint registration** (5 min, SESSION_25 pending)
3. **Sentry org token rotation** (5 min, SESSION_25 pending)

---

## Risks + open questions for Session B

1. **NPN/EIN collisions.** Texas file may contain (NPN, EIN) duplicates across name variations — same agency registered with multiple display names. Session B resolver needs to handle: prefer (NPN, EIN) exact match; if name strings differ, log to `appointment_rows_rejected` for review, not silently merge.

2. **Branches sharing NPN.** A multi-location agency may show up as multiple `agencies` rows after Texas load, each tied to the same NPN — that's fine, the non-unique index allows it. But our existing `agencies.parent_agency_id` graph may need reconciliation later (not Session B).

3. **What if Texas file has agency rows our existing 3,086 TX agencies should be linked to?** Resolver should try fuzzy name match within TX BEFORE creating a new agency row. Threshold: 0.85+ on normalized names with city match. Below threshold → create new agency row, accept some duplication, plan for a future dedup migration.

4. **264k pre-existing `agency_carriers` rows.** Texas load will ADD on top (with state_filed='TX' + source_type='state_doi_tx'), NOT overwrite. Possible double-coverage for TX agencies that already have agency_carriers rows. That's surface-level harmless — UI filters/queries can prefer state-tagged rows. But long-term it's untidy; flag for cleanup session post-Texas-load.

5. **Validation gates to enforce in Session B:**
   - NPN format: numeric string, 5-10 digits typical
   - EIN format: 9 digits (with or without hyphen)
   - NAIC: numeric string in carrier registry range
   - Date parse: `M/D/YYYY` → DATE; reject malformed
   - Required: at least NPN OR EIN must be present (not both null)
   - Carrier resolution: NAIC must match a row in `carriers` (after NAIC backfill); if not, reject to `appointment_rows_rejected` with reason `unknown_naic`

6. **Source attribution discipline.** Per D-017, `directory.*` schemas have NO source attribution. But `public.agency_carriers` is the Agency Signal native schema, not `directory.*` — and D-025 is explicit that source_type is a feature there for trust scoring. No conflict, but worth restating: do NOT propagate `source_type` into any `directory.*` mirror downstream.

---

## Session-close protocol

Per Working Agreement Rule 5:
1. ✅ Updated `docs/BACKLOG.md` (active arc + done log)
2. ✅ Updated `docs/context/SESSION_STATE.md`
3. ✅ Wrote this handoff
4. ⏳ Single commit + push (Slice 6 in progress)
5. ⏳ Verify Vercel deploy READY
6. ✅ Wrote Session B prompt at `docs/handoffs/SESSION_B_PROMPT.md`
7. ⏳ FAMILY_HEALTH.md refresh — DEFER (no cross-product impact; Agency Signal-internal data work)

---

## Next session opener

Paste the contents of [`SESSION_B_PROMPT.md`](SESSION_B_PROMPT.md) into the first message of the next Claude Code session.

— Session A close —
