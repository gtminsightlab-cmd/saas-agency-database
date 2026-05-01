-- Returns ALL active carriers with their appointed-agency count, ordered by
-- count desc. Used by /analytics/carriers so the search input can find any
-- carrier (including the long tail like Canal Insurance with 108 agencies),
-- while the default grid still focuses on carriers >= some threshold.

CREATE OR REPLACE FUNCTION public.get_all_active_carriers_with_counts()
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
  SELECT
    c.id,
    c.name,
    c.group_name,
    COALESCE(COUNT(DISTINCT ac.agency_id), 0)::bigint AS agency_count
  FROM public.carriers c
  LEFT JOIN public.agency_carriers ac ON ac.carrier_id = c.id
  WHERE c.active = true
  GROUP BY c.id, c.name, c.group_name
  ORDER BY agency_count DESC, c.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_active_carriers_with_counts() TO anon, authenticated;
