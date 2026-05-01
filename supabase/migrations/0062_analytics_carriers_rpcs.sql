-- RPCs that power /analytics/carriers. Computed server-side, cached by query plan.

CREATE OR REPLACE FUNCTION public.get_top_carriers_by_agency_count(p_limit int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  name text,
  group_name text,
  agency_count bigint
)
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = public, pg_catalog
AS $$
  SELECT c.id, c.name, c.group_name, COUNT(DISTINCT ac.agency_id) AS agency_count
  FROM public.carriers c
  JOIN public.agency_carriers ac ON ac.carrier_id = c.id
  WHERE c.active = true
  GROUP BY c.id, c.name, c.group_name
  ORDER BY agency_count DESC, c.name
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_top_carriers_by_agency_count(int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_carrier_analytics_kpis()
RETURNS TABLE (
  active_carriers bigint,
  carriers_with_appointments bigint,
  total_appointments bigint,
  agencies_covered bigint
)
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = public, pg_catalog
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.carriers WHERE active = true)                            AS active_carriers,
    (SELECT COUNT(DISTINCT carrier_id) FROM public.agency_carriers)                         AS carriers_with_appointments,
    (SELECT COUNT(*) FROM public.agency_carriers)                                          AS total_appointments,
    (SELECT COUNT(DISTINCT agency_id) FROM public.agency_carriers)                          AS agencies_covered;
$$;

GRANT EXECUTE ON FUNCTION public.get_carrier_analytics_kpis() TO anon, authenticated;
