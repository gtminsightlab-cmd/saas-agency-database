-- scan_watermark_canaries() — runs the live canary check from the Alerts page.
-- Returns 1 row per active canary with current live-match count.
-- SECURITY DEFINER so it can read agencies/contacts under super_admin authority
-- (RLS would otherwise filter by tenant — we want a tenant-agnostic scan).
CREATE OR REPLACE FUNCTION public.scan_watermark_canaries()
RETURNS TABLE (
  id          uuid,
  source      text,
  kind        text,
  match_mode  text,
  pattern     text,
  note        text,
  hits        integer
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  IF NOT (SELECT public.is_super_admin()) THEN
    RAISE EXCEPTION 'scan_watermark_canaries: super_admin required';
  END IF;

  RETURN QUERY
  SELECT
    c.id, c.source, c.kind, c.match_mode, c.pattern, c.note,
    (CASE
      WHEN c.kind='email' AND c.match_mode='exact'
        THEN (SELECT count(*) FROM contacts WHERE email_primary = c.pattern)
      WHEN c.kind='email' AND c.match_mode='contains'
        THEN (SELECT count(*) FROM contacts WHERE email_primary ILIKE c.pattern)
      WHEN c.kind='agency_name' AND c.match_mode='contains'
        THEN (SELECT count(*) FROM agencies WHERE name ILIKE '%' || c.pattern || '%')
      WHEN c.kind='agency_name' AND c.match_mode='exact'
        THEN (SELECT count(*) FROM agencies WHERE name = c.pattern)
      WHEN c.kind='phone' AND c.match_mode='digits_only'
        THEN
             (SELECT count(*) FROM agencies WHERE regexp_replace(coalesce(main_phone,''), '\D','','g') = c.pattern)
           + (SELECT count(*) FROM contacts WHERE
               regexp_replace(coalesce(work_phone,''), '\D','','g') = c.pattern
               OR regexp_replace(coalesce(mobile_phone,''), '\D','','g') = c.pattern)
      WHEN c.kind='fax' AND c.match_mode='digits_only'
        THEN (SELECT count(*) FROM agencies WHERE regexp_replace(coalesce(fax,''), '\D','','g') = c.pattern)
      ELSE 0
    END)::integer AS hits
  FROM public.data_load_denylist c
  WHERE c.active = true
  ORDER BY c.source, c.kind;
END
$$;

REVOKE ALL ON FUNCTION public.scan_watermark_canaries() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.scan_watermark_canaries() TO authenticated;

NOTIFY pgrst, 'reload schema';
