-- feature_flags — global on/off switches for product features.
-- Scope public_marketing rows are readable by anon; admin-only flags are
-- gated. Writes always require super_admin. is_feature_enabled(key) is the
-- convenience helper for route handlers.

CREATE TYPE public.feature_flag_scope AS ENUM ('public_marketing', 'authenticated', 'admin_only');

CREATE TABLE public.feature_flags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  label       text NOT NULL,
  description text,
  enabled     boolean NOT NULL DEFAULT false,
  scope       public.feature_flag_scope NOT NULL DEFAULT 'admin_only',
  category    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid REFERENCES public.app_users(id)
);

CREATE OR REPLACE FUNCTION public.fn_feature_flags_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER feature_flags_touch_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.fn_feature_flags_touch_updated_at();

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY ff_public_select ON public.feature_flags
  FOR SELECT TO anon
  USING (scope = 'public_marketing');

CREATE POLICY ff_authenticated_select ON public.feature_flags
  FOR SELECT TO authenticated
  USING (
    scope IN ('public_marketing', 'authenticated')
    OR (SELECT public.is_super_admin())
  );

CREATE POLICY ff_super_admin_insert ON public.feature_flags
  FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_super_admin()));
CREATE POLICY ff_super_admin_update ON public.feature_flags
  FOR UPDATE TO authenticated USING ((SELECT public.is_super_admin())) WITH CHECK ((SELECT public.is_super_admin()));
CREATE POLICY ff_super_admin_delete ON public.feature_flags
  FOR DELETE TO authenticated USING ((SELECT public.is_super_admin()));

INSERT INTO public.feature_flags (key, label, description, enabled, scope, category) VALUES
  ('vertical_filters_enabled',  'Industry vertical filters',          'Show the 4 industry vertical filter cards on Build List + the public /verticals home cards.',                              true,  'public_marketing', 'Filters'),
  ('dark_mode_app',             'Dark mode for app side',             'Enable dark theme on the app/marketing side. Admin always uses dark — this controls the rest.',                            false, 'authenticated',     'UI'),
  ('experimental_quick_search', 'Experimental Quick Search',          'Surface the experimental natural-language Quick Search bar on Build List. Behind a flag while we tune relevance.',         false, 'authenticated',     'Search'),
  ('pricing_v2_enabled',        'Pricing v2 page',                    'Show the new Pricing v2 layout (Snapshot $125 + Growth Member $99/mo). Held back until data inventory catches up.',         false, 'public_marketing', 'Pricing'),
  ('enable_export_csv',         'CSV export endpoint',                'Enable /api/export.csv. Currently a 501 stub — flip when token issuance + RLS + credit deduction is wired.',                false, 'authenticated',     'Integrations'),
  ('dual_agent_verification',   'Dual-Agent Verification Pipeline',   'Two-stage AI hygiene pipeline (replaces the Twin AI copy). Customer-facing trust marker — keep off until the pipeline ships.', false, 'public_marketing', 'Trust'),
  ('hygiene_credit_active',     'Hygiene Credit (10% off mo 6 + 12)', 'Apply the 10% loyalty discount at month 6 and 12 of Growth Member subs. Off until Stripe Subscription Schedule wiring lands.', false, 'authenticated',     'Billing'),
  ('show_sandbox_banner',       'Sandbox banner in admin',            'Show the red SANDBOX MODE banner in the admin top nav while STRIPE_SECRET_KEY is sk_test_*.',                                  true,  'admin_only',       'UI');

CREATE OR REPLACE FUNCTION public.is_feature_enabled(p_key text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE v_enabled boolean;
BEGIN
  SELECT enabled INTO v_enabled FROM public.feature_flags WHERE key = p_key;
  RETURN coalesce(v_enabled, false);
END $$;

REVOKE ALL ON FUNCTION public.is_feature_enabled(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_feature_enabled(text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
