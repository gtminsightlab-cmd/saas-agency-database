-- ============================================================
-- Migration 0095 — RPC bridge for loading ax_staging.appointments_raw
-- ============================================================
--
-- Session B Slice 3 enabler. The ax_staging schema is locked to service_role
-- and NOT exposed via PostgREST. But we need a way for a Python loader
-- (calling PostgREST with a service-role key) to bulk-insert rows into
-- ax_staging.appointments_raw without exposing the schema directly.
--
-- Solution: a SECURITY DEFINER function in public schema that:
--   • Accepts a jsonb array of row payloads + the load_id
--   • Validates the load_id exists and status='running' (kill-switch
--     against rogue calls)
--   • Inserts into ax_staging.appointments_raw with all columns mapped
--   • Manages the appointment_load_pages checkpoint row for this batch
--   • Returns count of rows inserted
--
-- This is the family pattern for cross-schema writes when PostgREST is
-- the only available path (see feedback_postgrest_schema_cache_stuck.md).
--
-- Auth: PostgREST callers must hold a valid service-role key. Any auth
-- failure returns 401 BEFORE this function is invoked.
-- ============================================================

CREATE OR REPLACE FUNCTION public.staging_insert_appointment_rows(
  p_load_id    UUID,
  p_page_no    INTEGER,
  p_row_offset INTEGER,
  p_rows       JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row_count       INTEGER;
  v_load_status     TEXT;
  v_page_id         UUID;
BEGIN
  -- Verify load_id exists + still running (prevents writes to closed loads)
  SELECT status INTO v_load_status
    FROM ax_staging.appointment_loads
   WHERE id = p_load_id;

  IF v_load_status IS NULL THEN
    RAISE EXCEPTION 'unknown_load_id: %', p_load_id USING ERRCODE = 'P0001';
  END IF;

  IF v_load_status <> 'running' THEN
    RAISE EXCEPTION 'load_not_running: load_id=% status=%', p_load_id, v_load_status USING ERRCODE = 'P0002';
  END IF;

  -- Open page checkpoint
  INSERT INTO ax_staging.appointment_load_pages (
    load_id, page_no, row_offset, status
  )
  VALUES (p_load_id, p_page_no, p_row_offset, 'running')
  ON CONFLICT (load_id, page_no) DO UPDATE
    SET started_at = now(),
        row_offset = EXCLUDED.row_offset,
        status     = 'running',
        error_message = NULL
  RETURNING id INTO v_page_id;

  -- Bulk insert raw rows. Each element in p_rows is a jsonb object with:
  --   row_no, naic_id_raw, insurance_company_name_raw,
  --   appointment_active_date_raw, appointment_type_raw,
  --   agency_npn_raw, agency_ein_raw, agency_name_raw
  -- raw_json gets the whole element for replay/retro-debug.
  WITH inserted AS (
    INSERT INTO ax_staging.appointments_raw (
      load_id, row_no,
      naic_id_raw, insurance_company_name_raw,
      appointment_active_date_raw, appointment_type_raw,
      agency_npn_raw, agency_ein_raw, agency_name_raw,
      raw_json
    )
    SELECT
      p_load_id,
      (elem ->> 'row_no')::INTEGER,
      elem ->> 'naic_id_raw',
      elem ->> 'insurance_company_name_raw',
      elem ->> 'appointment_active_date_raw',
      elem ->> 'appointment_type_raw',
      elem ->> 'agency_npn_raw',
      elem ->> 'agency_ein_raw',
      elem ->> 'agency_name_raw',
      elem
    FROM jsonb_array_elements(p_rows) AS elem
    RETURNING 1
  )
  SELECT count(*) INTO v_row_count FROM inserted;

  -- Close page checkpoint
  UPDATE ax_staging.appointment_load_pages
     SET completed_at = now(),
         row_count    = v_row_count,
         status       = 'completed'
   WHERE id = v_page_id;

  RETURN jsonb_build_object(
    'page_id', v_page_id,
    'page_no', p_page_no,
    'rows_inserted', v_row_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.staging_insert_appointment_rows(uuid, integer, integer, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.staging_insert_appointment_rows(uuid, integer, integer, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.staging_insert_appointment_rows(uuid, integer, integer, jsonb) TO service_role;

COMMENT ON FUNCTION public.staging_insert_appointment_rows IS
  'D-025 Session B Slice 3 — PostgREST bridge for bulk loads into ax_staging.appointments_raw. SECURITY DEFINER; service_role only. Validates load_id is running, opens/closes page checkpoint, inserts raw rows with raw_json. Returns {page_id, page_no, rows_inserted}.';

-- ============================================================
-- Companion: finalize_appointment_load — closes the ingest-run ledger
-- ============================================================

CREATE OR REPLACE FUNCTION public.staging_finalize_appointment_load(
  p_load_id           UUID,
  p_row_count_raw     INTEGER,
  p_status            TEXT DEFAULT 'completed',
  p_notes             TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_raw_count        INTEGER;
  v_rejected_count   INTEGER;
BEGIN
  IF p_status NOT IN ('completed','failed','rolled_back') THEN
    RAISE EXCEPTION 'invalid_status: %', p_status USING ERRCODE = 'P0003';
  END IF;

  SELECT count(*) INTO v_raw_count
    FROM ax_staging.appointments_raw
   WHERE load_id = p_load_id;

  SELECT count(*) INTO v_rejected_count
    FROM ax_staging.appointment_rows_rejected
   WHERE load_id = p_load_id;

  UPDATE ax_staging.appointment_loads
     SET completed_at       = now(),
         row_count_raw      = COALESCE(p_row_count_raw, v_raw_count),
         row_count_loaded   = v_raw_count - v_rejected_count,
         row_count_rejected = v_rejected_count,
         status             = p_status,
         notes              = COALESCE(p_notes, notes)
   WHERE id = p_load_id;

  RETURN jsonb_build_object(
    'load_id', p_load_id,
    'status', p_status,
    'row_count_raw', v_raw_count,
    'row_count_rejected', v_rejected_count,
    'row_count_loaded', v_raw_count - v_rejected_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.staging_finalize_appointment_load(uuid, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.staging_finalize_appointment_load(uuid, integer, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.staging_finalize_appointment_load(uuid, integer, text, text) TO service_role;

COMMENT ON FUNCTION public.staging_finalize_appointment_load IS
  'D-025 Session B Slice 3 — closes an appointment_loads run. Computes raw/rejected/loaded counts and sets status. SECURITY DEFINER; service_role only.';
