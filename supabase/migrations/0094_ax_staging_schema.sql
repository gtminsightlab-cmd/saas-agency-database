-- ============================================================
-- Migration 0094 — ax_staging schema for state DOI appointment ETL
-- ============================================================
--
-- Per family doctrine "Bulk public-data ingest is ETL, not API integration"
-- (feedback_bulk_etl_architecture_rules.md): any ingest >100k rows must run
-- through a staging schema with an ingest-run ledger + per-page checkpoints
-- + rejected-rows holding table + validation gates before promoting to prod.
--
-- The Texas 2026 file (367k rows) is the first load that exercises this
-- pattern in Agency Signal. Schema is reusable for the other 49 state DOI
-- feeds + future vendor / scraped sources.
--
-- LOCKDOWN:
--   • Schema is internal ETL only — NOT exposed via PostgREST (no
--     authenticator.pgrst.db_schemas addition). Service role only.
--   • Force RLS on every table even though only service_role accesses them
--     (D-006 / Principle #1 / belt-and-suspenders).
--   • Revoke usage from anon + authenticated.
--
-- TABLES:
--   1. ax_staging.appointment_loads        — ingest-run ledger
--   2. ax_staging.appointment_load_pages   — per-page checkpoint
--   3. ax_staging.appointments_raw         — landing zone (all text + raw_json)
--   4. ax_staging.appointment_rows_rejected — validation fail bucket
-- ============================================================

-- ============================================================
-- 0. Create schema + lock down
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ax_staging;

COMMENT ON SCHEMA ax_staging IS
  'D-025 / ETL doctrine — staging schema for bulk public-data ingests (first use: Texas DOI 2026 appointments). Internal-only; not exposed via PostgREST; service_role access only.';

REVOKE ALL ON SCHEMA ax_staging FROM PUBLIC;
REVOKE ALL ON SCHEMA ax_staging FROM anon;
REVOKE ALL ON SCHEMA ax_staging FROM authenticated;
GRANT USAGE ON SCHEMA ax_staging TO service_role;

-- ============================================================
-- 1. ax_staging.appointment_loads — ingest-run ledger
-- ============================================================
-- One row per file ingest. Tracks lifecycle, counts, status.

CREATE TABLE IF NOT EXISTS ax_staging.appointment_loads (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type         TEXT         NOT NULL,
  source_state        TEXT         NOT NULL,
  source_year         SMALLINT     NOT NULL,
  source_file_name    TEXT         NOT NULL,
  source_file_sha256  TEXT,
  started_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  row_count_raw       INTEGER,
  row_count_loaded    INTEGER,
  row_count_rejected  INTEGER,
  status              TEXT         NOT NULL DEFAULT 'running'
                      CHECK (status IN ('running','completed','failed','rolled_back')),
  notes               TEXT,
  created_by          TEXT         DEFAULT current_user
);

CREATE INDEX IF NOT EXISTS idx_appointment_loads_state_year
  ON ax_staging.appointment_loads(source_state, source_year);

CREATE INDEX IF NOT EXISTS idx_appointment_loads_status
  ON ax_staging.appointment_loads(status);

COMMENT ON TABLE ax_staging.appointment_loads IS
  'Ingest-run ledger. One row per state DOI file load. Tracks lifecycle, file provenance, row counts, and status. Required per ETL doctrine for any ingest >100k rows.';

ALTER TABLE ax_staging.appointment_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_staging.appointment_loads FORCE ROW LEVEL SECURITY;

CREATE POLICY appointment_loads_service_role_all
  ON ax_staging.appointment_loads
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. ax_staging.appointment_load_pages — per-page checkpoint
-- ============================================================
-- Resumable ingest. If a load crashes mid-flight, we can restart from the
-- last completed page rather than rewinding the entire file.

CREATE TABLE IF NOT EXISTS ax_staging.appointment_load_pages (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id       UUID         NOT NULL REFERENCES ax_staging.appointment_loads(id) ON DELETE CASCADE,
  page_no       INTEGER      NOT NULL,
  row_offset    INTEGER      NOT NULL,
  row_count     INTEGER,
  started_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  status        TEXT         NOT NULL DEFAULT 'running'
                CHECK (status IN ('running','completed','failed')),
  error_message TEXT,
  UNIQUE (load_id, page_no)
);

CREATE INDEX IF NOT EXISTS idx_appointment_load_pages_load
  ON ax_staging.appointment_load_pages(load_id, page_no);

COMMENT ON TABLE ax_staging.appointment_load_pages IS
  'Per-page checkpoint for resumable ingests. Allows restart from last completed page on crash. Required per ETL doctrine.';

ALTER TABLE ax_staging.appointment_load_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_staging.appointment_load_pages FORCE ROW LEVEL SECURITY;

CREATE POLICY appointment_load_pages_service_role_all
  ON ax_staging.appointment_load_pages
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. ax_staging.appointments_raw — landing zone
-- ============================================================
-- All columns text-typed for fault-tolerant bulk insert. Date parsing +
-- type coercion happens AFTER landing, not during. raw_json preserves the
-- full row payload for retro-debug + replay.

CREATE TABLE IF NOT EXISTS ax_staging.appointments_raw (
  id                            BIGSERIAL    PRIMARY KEY,
  load_id                       UUID         NOT NULL REFERENCES ax_staging.appointment_loads(id) ON DELETE CASCADE,
  row_no                        INTEGER      NOT NULL,
  naic_id_raw                   TEXT,
  insurance_company_name_raw    TEXT,
  appointment_active_date_raw   TEXT,
  appointment_type_raw          TEXT,
  agency_npn_raw                TEXT,
  agency_ein_raw                TEXT,
  agency_name_raw               TEXT,
  raw_json                      JSONB,
  ingested_at                   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_raw_load
  ON ax_staging.appointments_raw(load_id);

CREATE INDEX IF NOT EXISTS idx_appointments_raw_npn
  ON ax_staging.appointments_raw(agency_npn_raw)
  WHERE agency_npn_raw IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_raw_naic
  ON ax_staging.appointments_raw(naic_id_raw)
  WHERE naic_id_raw IS NOT NULL;

COMMENT ON TABLE ax_staging.appointments_raw IS
  'Landing zone for state DOI appointment rows. All text-typed for fault-tolerant bulk insert; coercion happens AFTER landing. raw_json preserves full row payload for replay + retro-debug.';

ALTER TABLE ax_staging.appointments_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_staging.appointments_raw FORCE ROW LEVEL SECURITY;

CREATE POLICY appointments_raw_service_role_all
  ON ax_staging.appointments_raw
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. ax_staging.appointment_rows_rejected — validation fail bucket
-- ============================================================
-- Rows that fail validation get parked here with a reason code + full raw
-- payload. NOT promoted to prod. Reviewable via service-role queries.

CREATE TABLE IF NOT EXISTS ax_staging.appointment_rows_rejected (
  id            BIGSERIAL    PRIMARY KEY,
  load_id       UUID         NOT NULL REFERENCES ax_staging.appointment_loads(id) ON DELETE CASCADE,
  raw_row_id    BIGINT,
  row_no        INTEGER,
  reason_code   TEXT         NOT NULL,
  reason_detail TEXT,
  raw_json      JSONB,
  rejected_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_rows_rejected_load
  ON ax_staging.appointment_rows_rejected(load_id);

CREATE INDEX IF NOT EXISTS idx_appointment_rows_rejected_reason
  ON ax_staging.appointment_rows_rejected(reason_code);

COMMENT ON TABLE ax_staging.appointment_rows_rejected IS
  'Validation fail bucket. Rows that fail validation gates land here with reason_code + raw payload. NOT promoted to prod. Required per ETL doctrine.';

ALTER TABLE ax_staging.appointment_rows_rejected ENABLE ROW LEVEL SECURITY;
ALTER TABLE ax_staging.appointment_rows_rejected FORCE ROW LEVEL SECURITY;

CREATE POLICY appointment_rows_rejected_service_role_all
  ON ax_staging.appointment_rows_rejected
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 5. Final lockdown — explicit object-level grants (service_role only)
-- ============================================================

GRANT ALL ON ALL TABLES    IN SCHEMA ax_staging TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ax_staging TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA ax_staging
  GRANT ALL ON TABLES    TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ax_staging
  GRANT ALL ON SEQUENCES TO service_role;
