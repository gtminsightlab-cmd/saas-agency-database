-- ============================================================
-- Migration 0093 — Extend agencies + agency_carriers for state DOI appointment loads
-- ============================================================
--
-- Prepares schema to ingest state Department of Insurance public appointment
-- records (e.g. Texas DOI 2026 file). First ingest target is Texas; pattern
-- is reusable for the other 49 states.
--
-- Decisions locked per D-025 (proposed this session):
--   • Agency identity is keyed by NPN (National Producer Number) + EIN.
--     These are federal IDs published by every state DOI; they are the only
--     reliable join key across state feeds.
--   • State DOI feeds are AUTHORITATIVE for appointment data — preferred over
--     vendor-scraped, modeled, or self-reported sources. source_type taxonomy:
--     'state_doi_<two_letter_state>' lowercase (see docs/context/SOURCE_TYPE_TAXONOMY.md).
--
-- Additions:
--
-- (a) agencies.npn (text, nullable, non-unique B-tree index)
--     Branches may share a parent NPN; unique constraint deferred until load
--     data proves the right shape.
--
-- (b) agencies.ein (text, nullable, non-unique B-tree index)
--     Federal tax ID. Used together with NPN for agency resolution.
--
-- (c) agency_carriers.appointment_active_date (date)
--     When the state turned the appointment on. Distinct from first_observed_at
--     (which records when WE first saw the row).
--
-- (d) agency_carriers.state_filed (text)
--     The state that filed THIS appointment row. Distinct from the existing
--     `states` array (which represents coverage on the relationship itself).
--     A national agency-carrier relationship may have one row per state filed.
--
-- (e) agency_carriers.source_year (smallint)
--     Vintage of the source feed (e.g. 2026). Enables refresh tracking +
--     stale-data alerts later.
--
-- (f) Composite B-tree on agency_carriers(agency_id, carrier_id, state_filed)
--     for the dominant query pattern: "what carriers does this agency have
--     state-X appointments with?"
--
-- RLS: no new policies. Existing agency_carriers RLS policies apply to
-- new columns automatically.
-- ============================================================

-- ============================================================
-- 1. Extend public.agencies — federal agency identity columns
-- ============================================================

ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS npn TEXT,
  ADD COLUMN IF NOT EXISTS ein TEXT;

CREATE INDEX IF NOT EXISTS idx_agencies_npn ON public.agencies(npn) WHERE npn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agencies_ein ON public.agencies(ein) WHERE ein IS NOT NULL;

COMMENT ON COLUMN public.agencies.npn IS
  'D-025 — National Producer Number (federal). Primary agency-identity key for state DOI ingests. Non-unique B-tree (branches may share parent NPN).';

COMMENT ON COLUMN public.agencies.ein IS
  'D-025 — Federal tax ID. Secondary agency-identity key paired with NPN for state DOI ingests.';

-- ============================================================
-- 2. Extend public.agency_carriers — state-filed appointment provenance
-- ============================================================

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

COMMENT ON COLUMN public.agency_carriers.appointment_active_date IS
  'D-025 — Date the state DOI activated this appointment. Distinct from first_observed_at (which records when WE first saw the row).';

COMMENT ON COLUMN public.agency_carriers.state_filed IS
  'D-025 — Two-letter state code identifying which state filed THIS row. Distinct from the existing `states` array (coverage). Multiple state_filed rows per agency-carrier pair are expected.';

COMMENT ON COLUMN public.agency_carriers.source_year IS
  'D-025 — Vintage year of the source feed (e.g. 2026). Enables refresh tracking + stale-data flags.';
