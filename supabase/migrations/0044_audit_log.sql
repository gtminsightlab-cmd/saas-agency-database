-- audit_log + log_admin_action() + per-table triggers.
-- Every super_admin mutation on the high-value admin tables writes a row here.
-- Read access: super_admin only. Inserts: only via the trigger/function path.
CREATE TABLE public.audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES public.app_users(id),
  actor_email   text,
  actor_role    text,
  action        text NOT NULL,
  resource_type text NOT NULL,
  resource_id   uuid,
  before_json   jsonb,
  after_json    jsonb,
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_created_idx        ON public.audit_log (created_at DESC);
CREATE INDEX audit_log_actor_idx          ON public.audit_log (actor_user_id, created_at DESC);
CREATE INDEX audit_log_resource_type_idx  ON public.audit_log (resource_type, created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY al_super_admin_select ON public.audit_log
  FOR SELECT TO authenticated USING ((SELECT public.is_super_admin()));
CREATE POLICY al_block_writes ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text, p_resource_type text, p_resource_id uuid,
  p_before jsonb DEFAULT NULL, p_after jsonb DEFAULT NULL, p_metadata jsonb DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE v_user_id uuid; v_app_user_id uuid; v_email text; v_role text; v_log_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    SELECT id, email, role INTO v_app_user_id, v_email, v_role
    FROM public.app_users WHERE user_id = v_user_id LIMIT 1;
  END IF;
  INSERT INTO public.audit_log (actor_user_id, actor_email, actor_role, action, resource_type, resource_id, before_json, after_json, metadata)
  VALUES (v_app_user_id, v_email, v_role, p_action, p_resource_type, p_resource_id, p_before, p_after, p_metadata)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END $$;

REVOKE ALL ON FUNCTION public.log_admin_action(text, text, uuid, jsonb, jsonb, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.log_admin_action(text, text, uuid, jsonb, jsonb, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.fn_audit_trigger() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE v_action text; v_id uuid;
BEGIN
  v_action := lower(TG_OP);
  IF v_action = 'delete' THEN
    v_id := (row_to_json(OLD)::jsonb->>'id')::uuid;
    PERFORM public.log_admin_action(v_action, TG_TABLE_NAME, v_id, row_to_json(OLD)::jsonb, NULL, NULL);
    RETURN OLD;
  ELSIF v_action = 'update' THEN
    v_id := (row_to_json(NEW)::jsonb->>'id')::uuid;
    PERFORM public.log_admin_action(v_action, TG_TABLE_NAME, v_id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, NULL);
    RETURN NEW;
  ELSE
    v_id := (row_to_json(NEW)::jsonb->>'id')::uuid;
    PERFORM public.log_admin_action(v_action, TG_TABLE_NAME, v_id, NULL, row_to_json(NEW)::jsonb, NULL);
    RETURN NEW;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fn_audit_trigger_text_pk() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE v_action text; v_meta jsonb;
BEGIN
  v_action := lower(TG_OP);
  IF v_action = 'delete' THEN
    v_meta := jsonb_build_object('text_pk', row_to_json(OLD)->'domain');
    PERFORM public.log_admin_action(v_action, TG_TABLE_NAME, NULL, row_to_json(OLD)::jsonb, NULL, v_meta);
    RETURN OLD;
  ELSIF v_action = 'update' THEN
    v_meta := jsonb_build_object('text_pk', row_to_json(NEW)->'domain');
    PERFORM public.log_admin_action(v_action, TG_TABLE_NAME, NULL, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, v_meta);
    RETURN NEW;
  ELSE
    v_meta := jsonb_build_object('text_pk', row_to_json(NEW)->'domain');
    PERFORM public.log_admin_action(v_action, TG_TABLE_NAME, NULL, NULL, row_to_json(NEW)::jsonb, v_meta);
    RETURN NEW;
  END IF;
END $$;

CREATE TRIGGER audit_feature_flags         AFTER INSERT OR UPDATE OR DELETE ON public.feature_flags         FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_tenant_limits         AFTER INSERT OR UPDATE OR DELETE ON public.tenant_limits         FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_app_users             AFTER INSERT OR UPDATE OR DELETE ON public.app_users             FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_data_load_denylist    AFTER INSERT OR UPDATE OR DELETE ON public.data_load_denylist    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_billing_plans         AFTER INSERT OR UPDATE OR DELETE ON public.billing_plans         FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_carrier_verticals     AFTER INSERT OR UPDATE OR DELETE ON public.carrier_verticals     FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_vertical_markets      AFTER INSERT OR UPDATE OR DELETE ON public.vertical_markets      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_account_types         AFTER INSERT OR UPDATE OR DELETE ON public.account_types         FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_agency_management_sys AFTER INSERT OR UPDATE OR DELETE ON public.agency_management_systems FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger();
CREATE TRIGGER audit_email_domain_denylist AFTER INSERT OR UPDATE OR DELETE ON public.email_domain_denylist FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger_text_pk();

NOTIFY pgrst, 'reload schema';
