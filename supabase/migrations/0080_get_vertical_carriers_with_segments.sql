-- Returns the carrier list for a vertical with parsed trucking_segment + agency count.
CREATE OR REPLACE FUNCTION public.get_vertical_carriers_with_segments(p_slug text)
RETURNS TABLE (
  carrier_id    uuid,
  carrier_name  text,
  group_name    text,
  segment       text,
  rationale     text,
  agency_count  bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    c.id,
    c.name,
    c.group_name,
    COALESCE(
      NULLIF(SPLIT_PART(SPLIT_PART(cv.note, ' | ', 1), 'trucking_segment: ', 2), ''),
      'unknown'
    ) AS segment,
    NULLIF(SPLIT_PART(cv.note, 'rationale: ', 2), '') AS rationale,
    COALESCE((SELECT COUNT(DISTINCT ac.agency_id)
              FROM public.agency_carriers ac
              WHERE ac.carrier_id = c.id), 0)::bigint AS agency_count
  FROM public.carrier_verticals cv
  JOIN public.carriers c ON c.id = cv.carrier_id
  JOIN public.vertical_markets v ON v.id = cv.vertical_id
  WHERE v.slug = p_slug
  ORDER BY agency_count DESC, c.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_vertical_carriers_with_segments(text) TO anon, authenticated;
