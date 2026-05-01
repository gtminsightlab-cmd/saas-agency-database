-- New RPC powering the expanded /analytics/carriers page (threshold mode):
-- returns all carriers with at least p_min_agency_count appointed agencies,
-- ordered by count desc. Replaces get_top_carriers_by_agency_count for the
-- 50→212 expansion.
CREATE OR REPLACE FUNCTION public.get_carriers_by_min_agency_count(
  p_min_agency_count int DEFAULT 150
)
RETURNS TABLE (
  id           uuid,
  name         text,
  group_name   text,
  agency_count bigint
)
LANGUAGE sql
STABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT c.id, c.name, c.group_name, COUNT(DISTINCT ac.agency_id) AS agency_count
  FROM public.carriers c
  JOIN public.agency_carriers ac ON ac.carrier_id = c.id
  WHERE c.active = true
  GROUP BY c.id, c.name, c.group_name
  HAVING COUNT(DISTINCT ac.agency_id) >= p_min_agency_count
  ORDER BY COUNT(DISTINCT ac.agency_id) DESC, c.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_carriers_by_min_agency_count(int) TO anon, authenticated;
