-- Third RPC for the build-list/review page: returns paginated contacts for
-- the same filter set, server-side. Replaces the broken JS materialization
-- in the contacts tab (lines 318-358 of /build-list/review/page.tsx).

CREATE OR REPLACE FUNCTION public.search_contacts_for_filters(
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
  p_sort               text      DEFAULT 'last_name',
  p_dir                text      DEFAULT 'asc',
  p_offset             int       DEFAULT 0,
  p_limit              int       DEFAULT 50
)
RETURNS TABLE (
  id              uuid,
  first_name      text,
  last_name       text,
  title           text,
  email_primary   text,
  mobile_phone    text,
  city            text,
  state           text,
  address_1       text,
  agency_id       uuid,
  agency_name     text,
  account_type_id uuid,
  account_type_label text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH filtered_agencies AS (
    SELECT a.id, a.name, a.account_type_id
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
    c.id,
    c.first_name,
    c.last_name,
    c.title,
    c.email_primary,
    c.mobile_phone,
    c.city,
    c.state,
    c.address_1,
    c.agency_id,
    fa.name              AS agency_name,
    fa.account_type_id,
    at.label             AS account_type_label
  FROM public.contacts c
  JOIN filtered_agencies fa ON fa.id = c.agency_id
  LEFT JOIN public.account_types at ON at.id = fa.account_type_id
  ORDER BY
    CASE WHEN p_sort = 'last_name'    AND p_dir = 'asc'  THEN c.last_name     END ASC  NULLS LAST,
    CASE WHEN p_sort = 'last_name'    AND p_dir = 'desc' THEN c.last_name     END DESC NULLS LAST,
    CASE WHEN p_sort = 'email'        AND p_dir = 'asc'  THEN c.email_primary END ASC  NULLS LAST,
    CASE WHEN p_sort = 'email'        AND p_dir = 'desc' THEN c.email_primary END DESC NULLS LAST,
    CASE WHEN p_sort = 'mobile'       AND p_dir = 'asc'  THEN c.mobile_phone  END ASC  NULLS LAST,
    CASE WHEN p_sort = 'mobile'       AND p_dir = 'desc' THEN c.mobile_phone  END DESC NULLS LAST,
    CASE WHEN p_sort = 'agency'       AND p_dir = 'asc'  THEN fa.name         END ASC  NULLS LAST,
    CASE WHEN p_sort = 'agency'       AND p_dir = 'desc' THEN fa.name         END DESC NULLS LAST,
    CASE WHEN p_sort = 'location'     AND p_dir = 'asc'  THEN c.state         END ASC  NULLS LAST,
    CASE WHEN p_sort = 'location'     AND p_dir = 'desc' THEN c.state         END DESC NULLS LAST,
    c.last_name ASC NULLS LAST,
    c.first_name ASC NULLS LAST
  OFFSET GREATEST(p_offset, 0)
  LIMIT  GREATEST(LEAST(p_limit, 1000), 1);
$$;

GRANT EXECUTE ON FUNCTION public.search_contacts_for_filters(
  uuid[], uuid[], uuid[], uuid[], uuid[], uuid[],
  text[], text,
  numeric, numeric, numeric, numeric, int, int,
  boolean,
  text, text,
  text, text,
  int, int
) TO anon, authenticated;
