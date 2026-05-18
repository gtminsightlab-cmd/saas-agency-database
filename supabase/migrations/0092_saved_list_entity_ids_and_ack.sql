-- ============================================================
-- Migration 0092 — Saved-list refresh support (D-023 Pillar 6 / BACKLOG #1)
-- ============================================================
--
-- (a) Adds `last_acknowledged_at` column to public.saved_lists for tracking
--     when the user last downloaded a delta export (drives the
--     "show changes since last download" filter on delta-export endpoint).
--
-- (b) Adds RPC `get_saved_list_entity_ids` — sibling to
--     `get_save_summary_counts` (migration 0068) but returns the actual
--     uuid[] arrays instead of just counts. Used by the recompute-saved-lists
--     Edge Function to compute set-diffs between snapshots.
--
-- Same filter signature as 0068 for parity with the existing save-button
-- code path that already calls get_save_summary_counts.
-- ============================================================

-- ============================================================
-- 1. Extend public.saved_lists
-- ============================================================

ALTER TABLE public.saved_lists
  ADD COLUMN IF NOT EXISTS last_acknowledged_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_saved_lists_last_ack ON public.saved_lists(last_acknowledged_at);

COMMENT ON COLUMN public.saved_lists.last_acknowledged_at IS
  'D-023 Pillar 6 — timestamp of last delta-export download. Drives "changes since last download" filter on /api/saved-lists/[id]/delta-export.';

-- ============================================================
-- 2. RPC: get_saved_list_entity_ids
-- ============================================================
-- Returns the current agency_ids[] + contact_ids[] for a given filter.
-- The Edge Function calls this for each saved_list, then diffs against
-- the previous snapshot to detect agency_added/removed and contact_added/removed.

CREATE OR REPLACE FUNCTION public.get_saved_list_entity_ids(
  p_carrier_ids        uuid[]    DEFAULT NULL,
  p_affiliation_ids    uuid[]    DEFAULT NULL,
  p_sic_ids            uuid[]    DEFAULT NULL,
  p_account_type_ids   uuid[]    DEFAULT NULL,
  p_location_type_ids  uuid[]    DEFAULT NULL,
  p_ams_ids            uuid[]    DEFAULT NULL,
  p_state_codes        text[]    DEFAULT NULL,
  p_country            text      DEFAULT NULL,
  p_premium_min        numeric   DEFAULT NULL,
  p_premium_max        numeric   DEFAULT NULL,
  p_revenue_min        numeric   DEFAULT NULL,
  p_revenue_max        numeric   DEFAULT NULL,
  p_emp_min            int       DEFAULT NULL,
  p_emp_max            int       DEFAULT NULL,
  p_minority           boolean   DEFAULT NULL,
  p_account_name       text      DEFAULT NULL,
  p_account_name_mode  text      DEFAULT 'contains'
)
RETURNS TABLE (
  agency_ids  uuid[],
  contact_ids uuid[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH filtered_agencies AS (
    SELECT a.id
    FROM public.agencies a
    WHERE
      (p_carrier_ids IS NULL OR a.id IN (
        SELECT agency_id FROM public.agency_carriers
         WHERE carrier_id = ANY(p_carrier_ids)
      ))
      AND (p_affiliation_ids IS NULL OR a.id IN (
        SELECT agency_id FROM public.agency_affiliations
         WHERE affiliation_id = ANY(p_affiliation_ids)
      ))
      AND (p_sic_ids IS NULL OR a.id IN (
        SELECT agency_id FROM public.agency_sic_codes
         WHERE sic_code_id = ANY(p_sic_ids)
      ))
      AND (p_account_type_ids  IS NULL OR a.account_type_id  = ANY(p_account_type_ids))
      AND (p_location_type_ids IS NULL OR a.location_type_id = ANY(p_location_type_ids))
      AND (p_ams_ids           IS NULL OR a.agency_mgmt_system_id = ANY(p_ams_ids))
      AND (p_state_codes       IS NULL OR a.state = ANY(p_state_codes))
      AND (p_country           IS NULL OR a.country = p_country)
      AND (p_premium_min       IS NULL OR a.premium_volume >= p_premium_min)
      AND (p_premium_max       IS NULL OR a.premium_volume <= p_premium_max)
      AND (p_revenue_min       IS NULL OR a.revenue >= p_revenue_min)
      AND (p_revenue_max       IS NULL OR a.revenue <= p_revenue_max)
      AND (p_emp_min           IS NULL OR a.employees >= p_emp_min)
      AND (p_emp_max           IS NULL OR a.employees <= p_emp_max)
      AND (p_minority          IS NULL OR a.minority_owned = p_minority)
      AND (
        p_account_name IS NULL OR (
          CASE p_account_name_mode
            WHEN 'exact'        THEN a.name = p_account_name
            WHEN 'starts_with'  THEN a.name ILIKE p_account_name || '%'
            ELSE                     a.name ILIKE '%' || p_account_name || '%'
          END
        )
      )
  )
  SELECT
    COALESCE(
      (SELECT ARRAY_AGG(id ORDER BY id) FROM filtered_agencies),
      ARRAY[]::uuid[]
    ) AS agency_ids,
    COALESCE(
      (SELECT ARRAY_AGG(c.id ORDER BY c.id)
         FROM public.contacts c
        WHERE c.agency_id IN (SELECT id FROM filtered_agencies)),
      ARRAY[]::uuid[]
    ) AS contact_ids;
$$;

GRANT EXECUTE ON FUNCTION public.get_saved_list_entity_ids(
  uuid[], uuid[], uuid[], uuid[], uuid[], uuid[],
  text[], text,
  numeric, numeric, numeric, numeric, int, int,
  boolean,
  text, text
) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.get_saved_list_entity_ids IS
  'D-023 Pillar 6 — returns agency_ids[] + contact_ids[] for a saved-list filter. Sibling to get_save_summary_counts (mig 0068); used by recompute-saved-lists Edge Function for set-diff change detection.';
