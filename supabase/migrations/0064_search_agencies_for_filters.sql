-- search_agencies_for_filters: replaces the broken JS materialize-then-filter
-- pattern in app/build-list/review/page.tsx. All filtering happens server-side
-- so we never have to pass thousands of UUIDs through a URL query string.
--
-- Returns paginated agencies with a window-function total_count column so the
-- caller gets count+rows in one round trip. SECURITY DEFINER + locked
-- search_path because callers won't necessarily have RLS access to all the
-- join tables (super_admin yes, regular tenant users no).

CREATE OR REPLACE FUNCTION public.search_agencies_for_filters(
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
  p_account_name_mode  text      DEFAULT 'contains',
  p_sort               text      DEFAULT 'name',
  p_dir                text      DEFAULT 'asc',
  p_offset             int       DEFAULT 0,
  p_limit              int       DEFAULT 50
)
RETURNS TABLE (
  id                  uuid,
  name                text,
  city                text,
  state               text,
  revenue             numeric,
  employees           int,
  account_type_id     uuid,
  account_type_label  text,
  location_type_id    uuid,
  location_type_name  text,
  total_count         bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH filtered AS (
    SELECT
      a.id,
      a.name,
      a.city,
      a.state,
      a.revenue,
      a.employees,
      a.account_type_id,
      at.label AS account_type_label,
      a.location_type_id,
      lt.name  AS location_type_name
    FROM public.agencies a
    LEFT JOIN public.account_types  at ON at.id = a.account_type_id
    LEFT JOIN public.location_types lt ON lt.id = a.location_type_id
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
  ),
  windowed AS (
    SELECT *, COUNT(*) OVER ()::bigint AS total_count FROM filtered
  )
  SELECT
    id, name, city, state, revenue, employees,
    account_type_id, account_type_label,
    location_type_id, location_type_name,
    total_count
  FROM windowed
  ORDER BY
    CASE WHEN p_sort = 'name'        AND p_dir = 'asc'  THEN name        END ASC  NULLS LAST,
    CASE WHEN p_sort = 'name'        AND p_dir = 'desc' THEN name        END DESC NULLS LAST,
    CASE WHEN p_sort = 'city'        AND p_dir = 'asc'  THEN city        END ASC  NULLS LAST,
    CASE WHEN p_sort = 'city'        AND p_dir = 'desc' THEN city        END DESC NULLS LAST,
    CASE WHEN p_sort = 'state'       AND p_dir = 'asc'  THEN state       END ASC  NULLS LAST,
    CASE WHEN p_sort = 'state'       AND p_dir = 'desc' THEN state       END DESC NULLS LAST,
    CASE WHEN p_sort = 'revenue'     AND p_dir = 'asc'  THEN revenue     END ASC  NULLS LAST,
    CASE WHEN p_sort = 'revenue'     AND p_dir = 'desc' THEN revenue     END DESC NULLS LAST,
    CASE WHEN p_sort = 'employees'   AND p_dir = 'asc'  THEN employees   END ASC  NULLS LAST,
    CASE WHEN p_sort = 'employees'   AND p_dir = 'desc' THEN employees   END DESC NULLS LAST,
    name ASC NULLS LAST
  OFFSET GREATEST(p_offset, 0)
  LIMIT  GREATEST(LEAST(p_limit, 1000), 1);
$$;

GRANT EXECUTE ON FUNCTION public.search_agencies_for_filters(
  uuid[], uuid[], uuid[], uuid[], uuid[], uuid[],
  text[], text,
  numeric, numeric, numeric, numeric, int, int,
  boolean,
  text, text,
  text, text,
  int, int
) TO anon, authenticated;
