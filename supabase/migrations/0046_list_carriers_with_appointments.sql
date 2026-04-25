-- 0046: list_carriers_with_appointments() — returns active carriers
-- that have at least one row in agency_carriers. Used to hide orphan
-- carriers (369 of 1,358 active rows) from the Build List dropdown.

CREATE OR REPLACE FUNCTION public.list_carriers_with_appointments()
RETURNS TABLE (
  id uuid,
  name text,
  group_name text,
  appointment_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT c.id, c.name, c.group_name, COUNT(ac.agency_id)::bigint AS appointment_count
  FROM public.carriers c
  JOIN public.agency_carriers ac ON ac.carrier_id = c.id
  WHERE c.active = true
  GROUP BY c.id, c.name, c.group_name
  ORDER BY c.name ASC;
$$;

REVOKE ALL ON FUNCTION public.list_carriers_with_appointments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_carriers_with_appointments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_carriers_with_appointments() TO anon;

COMMENT ON FUNCTION public.list_carriers_with_appointments() IS
  'Returns active carriers that have at least one row in agency_carriers. Used to hide orphan carriers from the Build List filter dropdown.';
