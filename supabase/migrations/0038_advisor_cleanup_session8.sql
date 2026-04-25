-- Cleanup pass to clear stale advisor warnings:
--
-- 1) Drop the unused v_dataset_counts view + mv_dataset_counts materialized view
--    + supporting functions (get_dataset_counts, refresh_mv_dataset_counts)
--    that came out of the session-5 PostgREST schema-cache saga and were never
--    wired into the app. Removing them clears:
--       - ERROR security_definer_view (v_dataset_counts)
--       - WARN  materialized_view_in_api (mv_dataset_counts)
--
-- 2) Lock search_path on fn_block_inactive_account_type to satisfy the
--    function_search_path_mutable WARN (mig 0033 introduced it without SET search_path).
--
-- 3) Replace the FOR ALL super_admin policies on carrier_verticals + vertical_markets
--    with explicit INSERT/UPDATE/DELETE policies, so the SELECT command isn't
--    covered by two permissive policies (multiple_permissive_policies WARN).
--
-- mv_vertical_summary is intentionally LEFT in place — it's wired into /verticals
-- and the admin Overview page. Its materialized_view_in_api warning is accepted
-- because read-by-anon is the desired behavior; data is non-sensitive aggregates.

DROP VIEW             IF EXISTS public.v_dataset_counts;
DROP MATERIALIZED VIEW IF EXISTS public.mv_dataset_counts;
DROP FUNCTION         IF EXISTS public.refresh_mv_dataset_counts();
DROP FUNCTION         IF EXISTS public.get_dataset_counts();

CREATE OR REPLACE FUNCTION public.fn_block_inactive_account_type()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.account_type_id IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM public.account_types
       WHERE id = NEW.account_type_id AND active = false
     )
  THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END
$$;

DROP POLICY IF EXISTS cv_super_admin_write ON public.carrier_verticals;
CREATE POLICY cv_super_admin_insert ON public.carrier_verticals
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_super_admin()));
CREATE POLICY cv_super_admin_update ON public.carrier_verticals
  FOR UPDATE TO authenticated
  USING       ((SELECT public.is_super_admin()))
  WITH CHECK  ((SELECT public.is_super_admin()));
CREATE POLICY cv_super_admin_delete ON public.carrier_verticals
  FOR DELETE TO authenticated
  USING       ((SELECT public.is_super_admin()));

DROP POLICY IF EXISTS vm_super_admin_write ON public.vertical_markets;
CREATE POLICY vm_super_admin_insert ON public.vertical_markets
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_super_admin()));
CREATE POLICY vm_super_admin_update ON public.vertical_markets
  FOR UPDATE TO authenticated
  USING       ((SELECT public.is_super_admin()))
  WITH CHECK  ((SELECT public.is_super_admin()));
CREATE POLICY vm_super_admin_delete ON public.vertical_markets
  FOR DELETE TO authenticated
  USING       ((SELECT public.is_super_admin()));

NOTIFY pgrst, 'reload schema';
