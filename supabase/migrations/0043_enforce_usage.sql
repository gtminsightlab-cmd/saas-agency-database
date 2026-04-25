-- enforce_usage(action, quantity, metadata) — atomic check + log.
-- Returns jsonb: {allowed, status (under|soft_over|hard_over|no_user|no_app_user|no_default),
-- metric, current_usage, effective_cap, is_hard, requested}.
-- get_my_usage_summary() — read-only snapshot for /limit-reached page.
-- Both SECURITY DEFINER with locked search_path.

CREATE OR REPLACE FUNCTION public.enforce_usage(
  p_action   public.usage_metric,
  p_quantity integer DEFAULT 1,
  p_metadata jsonb   DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id     uuid;
  v_app_user_id uuid;
  v_tenant_id   uuid;
  v_current     integer := 0;
  v_cap         integer;
  v_is_hard     boolean;
  v_def_cap     integer;
  v_def_hard    boolean;
  v_status      text;
  v_month_start timestamptz;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'status', 'no_user', 'metric', p_action::text);
  END IF;

  SELECT id, tenant_id INTO v_app_user_id, v_tenant_id
  FROM public.app_users WHERE user_id = v_user_id LIMIT 1;

  IF v_app_user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'status', 'no_app_user', 'metric', p_action::text);
  END IF;

  SELECT monthly_cap, is_hard_cap INTO v_cap, v_is_hard
  FROM public.tenant_limits WHERE tenant_id = v_tenant_id AND metric = p_action;

  IF v_cap IS NULL THEN
    SELECT monthly_cap, is_hard_cap INTO v_def_cap, v_def_hard
    FROM public.tenant_limits WHERE tenant_id IS NULL AND metric = p_action;
    v_cap := v_def_cap; v_is_hard := v_def_hard;
  END IF;

  IF v_cap IS NULL THEN
    INSERT INTO public.usage_logs (tenant_id, user_id, action_type, quantity, metadata)
    VALUES (v_tenant_id, v_app_user_id, p_action::text, p_quantity, p_metadata);
    RETURN jsonb_build_object('allowed', true, 'status', 'no_default', 'metric', p_action::text,
                              'current_usage', NULL, 'effective_cap', NULL, 'is_hard', NULL);
  END IF;

  v_month_start := date_trunc('month', now());
  SELECT coalesce(sum(quantity), 0)::int INTO v_current
  FROM public.usage_logs
  WHERE tenant_id = v_tenant_id AND action_type = p_action::text AND created_at >= v_month_start;

  IF (v_current + p_quantity) > v_cap THEN
    IF v_is_hard THEN
      RETURN jsonb_build_object('allowed', false, 'status', 'hard_over', 'metric', p_action::text,
                                'current_usage', v_current, 'effective_cap', v_cap,
                                'is_hard', v_is_hard, 'requested', p_quantity);
    ELSE
      v_status := 'soft_over';
    END IF;
  ELSE
    v_status := 'under';
  END IF;

  INSERT INTO public.usage_logs (tenant_id, user_id, action_type, quantity, metadata)
  VALUES (v_tenant_id, v_app_user_id, p_action::text, p_quantity, p_metadata);

  RETURN jsonb_build_object('allowed', true, 'status', v_status, 'metric', p_action::text,
                            'current_usage', v_current + p_quantity, 'effective_cap', v_cap,
                            'is_hard', v_is_hard, 'requested', p_quantity);
END $$;

REVOKE ALL ON FUNCTION public.enforce_usage(public.usage_metric, integer, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.enforce_usage(public.usage_metric, integer, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_usage_summary()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id uuid; v_app_user_id uuid; v_tenant_id uuid;
  v_month_start timestamptz; result jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN jsonb_build_object('error', 'no_user'); END IF;

  SELECT id, tenant_id INTO v_app_user_id, v_tenant_id
  FROM public.app_users WHERE user_id = v_user_id LIMIT 1;
  IF v_app_user_id IS NULL THEN RETURN jsonb_build_object('error', 'no_app_user'); END IF;

  v_month_start := date_trunc('month', now());

  SELECT jsonb_build_object(
    'tenant_id', v_tenant_id,
    'month_start', v_month_start,
    'metrics', jsonb_agg(jsonb_build_object(
      'metric', m.metric,
      'used', coalesce((SELECT sum(quantity)::int FROM public.usage_logs
                        WHERE tenant_id = v_tenant_id AND action_type = m.metric::text AND created_at >= v_month_start), 0),
      'cap', coalesce(o.monthly_cap, d.monthly_cap),
      'is_hard', coalesce(o.is_hard_cap, d.is_hard_cap),
      'is_override', (o.monthly_cap IS NOT NULL OR o.is_hard_cap IS NOT NULL)
    ))
  )
  INTO result
  FROM (SELECT unnest(enum_range(NULL::public.usage_metric)) AS metric) m
  LEFT JOIN public.tenant_limits d ON d.tenant_id IS NULL AND d.metric = m.metric
  LEFT JOIN public.tenant_limits o ON o.tenant_id = v_tenant_id AND o.metric = m.metric;

  RETURN result;
END $$;

REVOKE ALL ON FUNCTION public.get_my_usage_summary() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_my_usage_summary() TO authenticated;

NOTIFY pgrst, 'reload schema';
