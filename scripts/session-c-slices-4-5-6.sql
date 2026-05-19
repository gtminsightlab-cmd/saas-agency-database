-- ============================================================
-- Session C / Slices 4-6 — Validation → Resolve → Promote
-- ============================================================
--
-- RUN ONLY AFTER scripts/load-tx-appointments.py completes successfully
-- (367,484 rows expected in ax_staging.appointments_raw for the active load).
--
-- Pass via Supabase MCP execute_sql, slice at a time. Verify counts between
-- slices. Active load_id (from Session B Slice 2):
--
--   1b83ad57-e3dc-4e50-b673-4722ac612d1c
--
-- Replace :LOAD_ID below with that uuid (or whatever the active load_id is
-- when Session C runs).
-- ============================================================

-- ============================================================
-- SLICE 4 — Validation gates
-- ============================================================
-- For each gate, INSERT failing rows into ax_staging.appointment_rows_rejected
-- with reason_code + raw_json. Rows surviving all gates remain in
-- appointments_raw and proceed to Slice 5 resolution.
--
-- Kill-switch: if any single reason_code exceeds 1% of 367k = ~3,670 rows,
-- STOP and surface to Master O before promoting.
-- ============================================================

-- Gate 4a: npn_or_ein_required
INSERT INTO ax_staging.appointment_rows_rejected (load_id, raw_row_id, row_no, reason_code, reason_detail, raw_json)
SELECT load_id, id, row_no, 'npn_or_ein_required',
       'Both agency_npn_raw and agency_ein_raw are NULL or empty',
       raw_json
  FROM ax_staging.appointments_raw
 WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND (agency_npn_raw IS NULL OR agency_npn_raw = '')
   AND (agency_ein_raw IS NULL OR agency_ein_raw = '');

-- Gate 4b: npn_format (5-10 digits if present)
INSERT INTO ax_staging.appointment_rows_rejected (load_id, raw_row_id, row_no, reason_code, reason_detail, raw_json)
SELECT load_id, id, row_no, 'npn_format',
       'agency_npn_raw is not 5-10 digits: ' || agency_npn_raw,
       raw_json
  FROM ax_staging.appointments_raw r
 WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND agency_npn_raw IS NOT NULL
   AND agency_npn_raw <> ''
   AND agency_npn_raw !~ '^[0-9]{5,10}$'
   AND NOT EXISTS (SELECT 1 FROM ax_staging.appointment_rows_rejected j WHERE j.raw_row_id = r.id);

-- Gate 4c: ein_format (9 digits, optional one hyphen at position 3)
INSERT INTO ax_staging.appointment_rows_rejected (load_id, raw_row_id, row_no, reason_code, reason_detail, raw_json)
SELECT load_id, id, row_no, 'ein_format',
       'agency_ein_raw is not 9 digits (with optional hyphen): ' || agency_ein_raw,
       raw_json
  FROM ax_staging.appointments_raw r
 WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND agency_ein_raw IS NOT NULL
   AND agency_ein_raw <> ''
   AND agency_ein_raw !~ '^[0-9]{9}$'
   AND agency_ein_raw !~ '^[0-9]{2}-[0-9]{7}$'
   AND NOT EXISTS (SELECT 1 FROM ax_staging.appointment_rows_rejected j WHERE j.raw_row_id = r.id);

-- Gate 4d: naic_format (4-5 digit numeric)
INSERT INTO ax_staging.appointment_rows_rejected (load_id, raw_row_id, row_no, reason_code, reason_detail, raw_json)
SELECT load_id, id, row_no, 'naic_format',
       'naic_id_raw is not 4-5 digits: ' || COALESCE(naic_id_raw, '<null>'),
       raw_json
  FROM ax_staging.appointments_raw r
 WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND (naic_id_raw IS NULL OR naic_id_raw !~ '^[0-9]{4,5}$')
   AND NOT EXISTS (SELECT 1 FROM ax_staging.appointment_rows_rejected j WHERE j.raw_row_id = r.id);

-- Gate 4e: date_parse (M/D/YYYY format)
INSERT INTO ax_staging.appointment_rows_rejected (load_id, raw_row_id, row_no, reason_code, reason_detail, raw_json)
SELECT load_id, id, row_no, 'date_parse',
       'appointment_active_date_raw is not parseable M/D/YYYY: ' || COALESCE(appointment_active_date_raw, '<null>'),
       raw_json
  FROM ax_staging.appointments_raw r
 WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND (appointment_active_date_raw IS NULL
        OR appointment_active_date_raw !~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$')
   AND NOT EXISTS (SELECT 1 FROM ax_staging.appointment_rows_rejected j WHERE j.raw_row_id = r.id);

-- Gate 4f: carrier_resolution (NAIC must match a row in public.carriers)
-- This catches NAICs in the Texas file that aren't in our carriers table
-- even after Slice 1 backfill. Expect this count to be 0 if Slice 1 was
-- complete (every distinct NAIC in the file got either UPDATE or INSERT).
INSERT INTO ax_staging.appointment_rows_rejected (load_id, raw_row_id, row_no, reason_code, reason_detail, raw_json)
SELECT load_id, r.id, r.row_no, 'unknown_naic',
       'NAIC ' || r.naic_id_raw || ' not found in public.carriers',
       r.raw_json
  FROM ax_staging.appointments_raw r
 WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND r.naic_id_raw IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM public.carriers c WHERE c.naic_code = r.naic_id_raw)
   AND NOT EXISTS (SELECT 1 FROM ax_staging.appointment_rows_rejected j WHERE j.raw_row_id = r.id);

-- Slice 4 verify: rejection counts by reason. Kill-switch if any > 3670.
SELECT reason_code, count(*) AS n
  FROM ax_staging.appointment_rows_rejected
 WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
 GROUP BY reason_code
 ORDER BY n DESC;

-- ============================================================
-- SLICE 5 — Resolve agencies + carriers
-- ============================================================
-- Build a working materialized table ax_staging.appointments_resolved
-- (created on-the-fly) with one row per surviving raw row that maps to
-- (carrier_id, agency_id, parsed date, canonical line). Agency resolution
-- has 5 tiers (a-e per Session B prompt); we log which tier hit.
-- ============================================================

-- Drop + recreate the resolved working table (idempotent for re-runs)
DROP TABLE IF EXISTS ax_staging.appointments_resolved;

CREATE TABLE ax_staging.appointments_resolved (
  raw_row_id              BIGINT       PRIMARY KEY,
  load_id                 UUID         NOT NULL REFERENCES ax_staging.appointment_loads(id) ON DELETE CASCADE,
  row_no                  INTEGER      NOT NULL,
  carrier_id              UUID,
  agency_id               UUID,
  agency_match_method     TEXT         NOT NULL,  -- npn_ein_exact | npn_exact | ein_exact | fuzzy_name_tx | created_new
  carrier_match_method    TEXT         NOT NULL,  -- naic_exact
  appointment_active_date DATE,
  appointment_line        TEXT,
  npn_used                TEXT,
  ein_used                TEXT
);

CREATE INDEX idx_appointments_resolved_load ON ax_staging.appointments_resolved(load_id);
CREATE INDEX idx_appointments_resolved_method ON ax_staging.appointments_resolved(agency_match_method);

-- Stage A: carrier resolution + date/line normalization for surviving rows
WITH survivors AS (
  SELECT r.*
    FROM ax_staging.appointments_raw r
   WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
     AND NOT EXISTS (
       SELECT 1 FROM ax_staging.appointment_rows_rejected j
        WHERE j.raw_row_id = r.id
     )
)
INSERT INTO ax_staging.appointments_resolved
  (raw_row_id, load_id, row_no, carrier_id, agency_id, agency_match_method,
   carrier_match_method, appointment_active_date, appointment_line,
   npn_used, ein_used)
SELECT
  s.id,
  s.load_id,
  s.row_no,
  c.id,
  NULL,                       -- agency_id filled in Stage B
  'pending',                  -- agency_match_method filled in Stage B
  'naic_exact',
  to_date(s.appointment_active_date_raw, 'FMMM/FMDD/YYYY'),
  CASE upper(trim(s.appointment_type_raw))
    WHEN 'PROPERTY AND CASUALTY' THEN 'P&C'
    WHEN 'LIFE'                  THEN 'Life'
    WHEN 'HEALTH'                THEN 'Health'
    WHEN 'TITLE'                 THEN 'Title'
    WHEN 'SURETY'                THEN 'Surety'
    WHEN 'SURPLUS LINES'         THEN 'Surplus Lines'
    ELSE s.appointment_type_raw
  END,
  s.agency_npn_raw,
  s.agency_ein_raw
FROM survivors s
JOIN public.carriers c ON c.naic_code = s.naic_id_raw;

-- Stage B: agency resolution tier (a) — NPN+EIN exact match
UPDATE ax_staging.appointments_resolved r
   SET agency_id = a.id,
       agency_match_method = 'npn_ein_exact'
  FROM public.agencies a
 WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND r.agency_match_method = 'pending'
   AND r.npn_used IS NOT NULL
   AND r.ein_used IS NOT NULL
   AND a.npn = r.npn_used
   AND a.ein = r.ein_used;

-- Stage B: agency resolution tier (b) — NPN exact (when (a) didn't hit)
UPDATE ax_staging.appointments_resolved r
   SET agency_id = a.id,
       agency_match_method = 'npn_exact'
  FROM public.agencies a
 WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND r.agency_match_method = 'pending'
   AND r.npn_used IS NOT NULL
   AND a.npn = r.npn_used;

-- Stage B: agency resolution tier (c) — EIN exact (when (a)+(b) didn't hit)
UPDATE ax_staging.appointments_resolved r
   SET agency_id = a.id,
       agency_match_method = 'ein_exact'
  FROM public.agencies a
 WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND r.agency_match_method = 'pending'
   AND r.ein_used IS NOT NULL
   AND a.ein = r.ein_used;

-- Stage B: agency resolution tier (d) — fuzzy name match within TX (pg_trgm)
-- Threshold 0.85; only against existing Texas agencies
UPDATE ax_staging.appointments_resolved r
   SET agency_id = match.id,
       agency_match_method = 'fuzzy_name_tx'
  FROM ax_staging.appointments_raw raw,
       LATERAL (
         SELECT a.id
           FROM public.agencies a
          WHERE a.state = 'TX'
            AND similarity(a.name, raw.agency_name_raw) > 0.85
          ORDER BY similarity(a.name, raw.agency_name_raw) DESC
          LIMIT 1
       ) AS match
 WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND r.agency_match_method = 'pending'
   AND raw.id = r.raw_row_id
   AND raw.agency_name_raw IS NOT NULL;

-- Stage B: agency resolution tier (e) — create new agency for un-resolved rows
-- Distinct NPN+EIN+name from un-resolved rows → new public.agencies rows.
-- Kill-switch: if this count exceeds 30,000, STOP and surface to Master O.
WITH unresolved AS (
  SELECT DISTINCT
         raw.agency_npn_raw  AS npn,
         raw.agency_ein_raw  AS ein,
         raw.agency_name_raw AS name
    FROM ax_staging.appointments_resolved r
    JOIN ax_staging.appointments_raw raw ON raw.id = r.raw_row_id
   WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
     AND r.agency_match_method = 'pending'
), inserted AS (
  INSERT INTO public.agencies (
    tenant_id, name, state, npn, ein, profile_status, verified, country
  )
  SELECT
    'ce52fe1e-aac7-4eee-8712-77e71e2837ce'::uuid,
    name,
    'TX',
    npn,
    ein,
    'imported',
    false,
    'US'
  FROM unresolved
  RETURNING id, npn, ein, name
)
UPDATE ax_staging.appointments_resolved r
   SET agency_id = inserted.id,
       agency_match_method = 'created_new'
  FROM inserted, ax_staging.appointments_raw raw
 WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND r.agency_match_method = 'pending'
   AND raw.id = r.raw_row_id
   AND raw.agency_npn_raw IS NOT DISTINCT FROM inserted.npn
   AND raw.agency_ein_raw IS NOT DISTINCT FROM inserted.ein
   AND raw.agency_name_raw IS NOT DISTINCT FROM inserted.name;

-- Slice 5 verify: resolution method distribution
SELECT agency_match_method, count(*) AS n
  FROM ax_staging.appointments_resolved
 WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
 GROUP BY agency_match_method
 ORDER BY n DESC;

-- Kill-switch sanity check
SELECT count(*) AS created_new_count
  FROM ax_staging.appointments_resolved
 WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
   AND agency_match_method = 'created_new';
-- If created_new_count > 30000, STOP.

-- ============================================================
-- SLICE 6 — Promote staging → public.agency_carriers
-- ============================================================
-- For each resolved row, insert into public.agency_carriers with
-- D-025 tagging. Bulk insert in a single SQL statement.
-- ============================================================

INSERT INTO public.agency_carriers (
  tenant_id, agency_id, carrier_id, appointment_status,
  appointment_active_date, state_filed, source_year, source_type,
  lines_of_business, first_observed_at, verified
)
SELECT
  'ce52fe1e-aac7-4eee-8712-77e71e2837ce'::uuid,
  r.agency_id,
  r.carrier_id,
  'active',
  r.appointment_active_date,
  'TX',
  2026,
  'state_doi_tx',
  ARRAY[r.appointment_line],
  r.appointment_active_date::timestamptz,
  true
FROM ax_staging.appointments_resolved r
WHERE r.load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'
  AND r.agency_id IS NOT NULL
  AND r.carrier_id IS NOT NULL;

-- Close the ingest run via the RPC (or directly here)
UPDATE ax_staging.appointment_loads
   SET completed_at = now(),
       row_count_raw = (SELECT count(*) FROM ax_staging.appointments_raw WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'),
       row_count_rejected = (SELECT count(*) FROM ax_staging.appointment_rows_rejected WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c'),
       row_count_loaded = (SELECT count(*) FROM ax_staging.appointments_resolved WHERE load_id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c' AND agency_id IS NOT NULL),
       status = 'completed'
 WHERE id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c';

-- ============================================================
-- SLICE 7 — Verification queries
-- ============================================================

-- Total Texas appointment rows landed
SELECT count(*) AS texas_appointments
  FROM public.agency_carriers
 WHERE state_filed = 'TX';

-- Distinct TX agencies + carriers
SELECT count(DISTINCT agency_id) AS tx_agencies,
       count(DISTINCT carrier_id) AS tx_carriers
  FROM public.agency_carriers
 WHERE state_filed = 'TX';

-- Source-type distribution (should be heavy on state_doi_tx now)
SELECT source_type, count(*) AS n
  FROM public.agency_carriers
 GROUP BY source_type
 ORDER BY n DESC NULLS LAST;

-- Spot-check: 3 specific agencies from CSV head
-- (NPN 2331759 = "DAY, DEADRICK & MARSHALL, INC." from row 1)
SELECT a.id, a.name, a.npn, a.ein, count(ac.*) AS appointment_count
  FROM public.agencies a
  LEFT JOIN public.agency_carriers ac ON ac.agency_id = a.id AND ac.state_filed = 'TX'
 WHERE a.npn = '2331759'
 GROUP BY a.id, a.name, a.npn, a.ein;

-- Final ingest-run ledger state
SELECT id, source_type, source_state, source_year, status,
       row_count_raw, row_count_loaded, row_count_rejected,
       started_at, completed_at
  FROM ax_staging.appointment_loads
 WHERE id = '1b83ad57-e3dc-4e50-b673-4722ac612d1c';
