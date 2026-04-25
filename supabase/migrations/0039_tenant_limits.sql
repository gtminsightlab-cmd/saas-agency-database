-- tenant_limits — per-tenant overrides on search/export/download/api_call caps,
-- with hard-vs-soft enforcement per metric. NULL tenant_id = global default row.
CREATE TYPE public.usage_metric AS ENUM ('search', 'export', 'download', 'api_call');

CREATE TABLE public.tenant_limits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric        public.usage_metric NOT NULL,
  monthly_cap   integer NOT NULL CHECK (monthly_cap >= 0),
  is_hard_cap   boolean NOT NULL DEFAULT true,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tenant_limits_unique_idx
  ON public.tenant_limits (tenant_id, metric)
  NULLS NOT DISTINCT;

CREATE OR REPLACE FUNCTION public.fn_tenant_limits_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER tenant_limits_touch_updated_at
  BEFORE UPDATE ON public.tenant_limits
  FOR EACH ROW EXECUTE FUNCTION public.fn_tenant_limits_touch_updated_at();

INSERT INTO public.tenant_limits (tenant_id, metric, monthly_cap, is_hard_cap, note) VALUES
  (NULL, 'search'::usage_metric,    1000, true, 'Default monthly search cap'),
  (NULL, 'export'::usage_metric,      50, true, 'Default monthly export cap (csv/xlsx)'),
  (NULL, 'download'::usage_metric,    25, true, 'Default monthly list-download cap'),
  (NULL, 'api_call'::usage_metric,  5000, true, 'Default monthly API call cap');

ALTER TABLE public.tenant_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY tl_super_admin_select ON public.tenant_limits
  FOR SELECT TO authenticated
  USING ((SELECT public.is_super_admin()) OR tenant_id IS NULL OR tenant_id = (SELECT public.current_tenant_id()));

CREATE POLICY tl_super_admin_insert ON public.tenant_limits
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_super_admin()));

CREATE POLICY tl_super_admin_update ON public.tenant_limits
  FOR UPDATE TO authenticated
  USING       ((SELECT public.is_super_admin()))
  WITH CHECK  ((SELECT public.is_super_admin()));

CREATE POLICY tl_super_admin_delete ON public.tenant_limits
  FOR DELETE TO authenticated
  USING       ((SELECT public.is_super_admin()));

NOTIFY pgrst, 'reload schema';
