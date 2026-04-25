-- get_effective_limits(tenant_id) returns effective caps merging override + default.
CREATE OR REPLACE FUNCTION public.get_effective_limits(p_tenant_id uuid)
RETURNS TABLE (
  metric       public.usage_metric,
  monthly_cap  integer,
  is_hard_cap  boolean,
  is_override  boolean,
  default_cap  integer,
  default_hard boolean,
  note         text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  IF NOT (SELECT public.is_super_admin())
     AND (p_tenant_id IS NULL OR p_tenant_id <> (SELECT public.current_tenant_id())) THEN
    RAISE EXCEPTION 'get_effective_limits: not authorized for tenant %', p_tenant_id;
  END IF;

  RETURN QUERY
  WITH defaults AS (
    SELECT tl.metric AS m, tl.monthly_cap AS def_cap, tl.is_hard_cap AS def_hard
    FROM public.tenant_limits tl WHERE tl.tenant_id IS NULL
  ),
  overrides AS (
    SELECT tl.metric AS m, tl.monthly_cap AS over_cap, tl.is_hard_cap AS over_hard, tl.note AS over_note
    FROM public.tenant_limits tl WHERE tl.tenant_id = p_tenant_id
  )
  SELECT
    d.m                                                AS metric,
    coalesce(o.over_cap,  d.def_cap)                   AS monthly_cap,
    coalesce(o.over_hard, d.def_hard)                  AS is_hard_cap,
    (o.over_cap IS NOT NULL OR o.over_hard IS NOT NULL) AS is_override,
    d.def_cap                                           AS default_cap,
    d.def_hard                                          AS default_hard,
    o.over_note                                         AS note
  FROM defaults d
  LEFT JOIN overrides o USING (m)
  ORDER BY d.m;
END
$$;

REVOKE ALL ON FUNCTION public.get_effective_limits(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_effective_limits(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
