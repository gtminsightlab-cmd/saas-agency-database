-- get_system_health() — admin-only DB snapshot for /admin/system-health.
-- Returns jsonb with database stats, RLS coverage, recent migrations, biggest tables.
-- SECURITY DEFINER so it can read pg_policies + supabase_migrations from the authenticated role.
-- search_path is locked to the function-creator's resolution to satisfy the
-- function_search_path_mutable advisor.
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT (SELECT public.is_super_admin()) THEN
    RAISE EXCEPTION 'system_health: super_admin required';
  END IF;

  WITH
  table_count AS (
    SELECT count(*)::int AS n
    FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
  ),
  rls_tables AS (
    SELECT count(DISTINCT tablename)::int AS n FROM pg_policies WHERE schemaname='public'
  ),
  no_rls AS (
    SELECT pt.table_name
    FROM information_schema.tables pt
    LEFT JOIN (SELECT DISTINCT tablename FROM pg_policies WHERE schemaname='public') tw
      ON tw.tablename = pt.table_name
    WHERE pt.table_schema='public' AND pt.table_type='BASE TABLE' AND tw.tablename IS NULL
  ),
  policy_count AS (
    SELECT count(*)::int AS n FROM pg_policies WHERE schemaname='public'
  ),
  migs AS (
    SELECT count(*)::int AS n,
           max(version) AS latest_version,
           (SELECT name FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1) AS latest_name
    FROM supabase_migrations.schema_migrations
  ),
  recent_migs AS (
    SELECT jsonb_agg(jsonb_build_object('version', version, 'name', name) ORDER BY version DESC) AS rows
    FROM (SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 8) t
  ),
  big_tables AS (
    SELECT jsonb_agg(jsonb_build_object('table', tname, 'rows', erows, 'size', tsize)) AS rows
    FROM (
      SELECT n.nspname || '.' || c.relname AS tname,
             c.reltuples::bigint           AS erows,
             pg_size_pretty(pg_total_relation_size(c.oid)) AS tsize
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname='public' AND c.relkind IN ('r','p')
      ORDER BY pg_total_relation_size(c.oid) DESC
      LIMIT 8
    ) t
  )
  SELECT jsonb_build_object(
    'database', jsonb_build_object(
      'name',                  current_database(),
      'size',                  pg_size_pretty(pg_database_size(current_database())),
      'public_tables',         (SELECT n FROM table_count),
      'rls_protected_tables',  (SELECT n FROM rls_tables),
      'rls_policies',          (SELECT n FROM policy_count),
      'tables_without_rls',    coalesce((SELECT jsonb_agg(table_name) FROM no_rls), '[]'::jsonb)
    ),
    'migrations', jsonb_build_object(
      'count',          (SELECT n              FROM migs),
      'latest_version', (SELECT latest_version FROM migs),
      'latest_name',    (SELECT latest_name    FROM migs),
      'recent',         coalesce((SELECT rows  FROM recent_migs), '[]'::jsonb)
    ),
    'biggest_tables',  coalesce((SELECT rows FROM big_tables), '[]'::jsonb),
    'fetched_at',      now()
  )
  INTO result;

  RETURN result;
END
$$;

REVOKE ALL ON FUNCTION public.get_system_health() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_system_health() TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMENT ON FUNCTION public.get_system_health() IS
  'Admin-only snapshot of DB health for /admin/system-health. Returns jsonb. Mig 0037.';
