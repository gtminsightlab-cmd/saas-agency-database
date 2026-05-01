-- Companion to search_agencies_for_filters: returns the contact count for
-- the same filter set, server-side. Replaces the broken pattern in
-- /build-list/review/page.tsx that materializes 50K agency IDs in JS then
-- does .in("agency_id", agencyIds) — same URL-too-long problem.

CREATE OR REPLACE FUNCTION public.count_contacts_for_filters(
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
RETURNS bigint
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
  SELECT COUNT(*)::bigint
  FROM public.contacts c
  WHERE c.agency_id IN (SELECT id FROM filtered_agencies);
$$;

GRANT EXECUTE ON FUNCTION public.count_contacts_for_filters(
  uuid[], uuid[], uuid[], uuid[], uuid[], uuid[],
  text[], text,
  numeric, numeric, numeric, numeric, int, int,
  boolean,
  text, text
) TO anon, authenticated;
