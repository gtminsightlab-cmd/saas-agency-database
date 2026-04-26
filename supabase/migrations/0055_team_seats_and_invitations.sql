-- ============================================================================
-- Migration 0055 — Team seats + invitations
-- ----------------------------------------------------------------------------
-- Adds invitation lifecycle to app_users, seat_cap to billing_plans, and a
-- pair of SECURITY DEFINER RPCs (invite_team_member, revoke_invite,
-- get_my_seat_info, list_my_team) that gate on the caller's active
-- subscription and tenant seat usage. Auto-binds the existing
-- link_app_user_on_auth trigger so that a pending invite flips to 'active'
-- the moment the invitee signs up.
-- ============================================================================

-- 1) Schema changes ----------------------------------------------------------

ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS invite_status text NOT NULL DEFAULT 'active'
    CHECK (invite_status IN ('active','invited','revoked')),
  ADD COLUMN IF NOT EXISTS invited_by   uuid REFERENCES public.app_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at   timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at  timestamptz;

CREATE INDEX IF NOT EXISTS app_users_invite_status_idx ON public.app_users(invite_status);
CREATE INDEX IF NOT EXISTS app_users_tenant_invite_idx
  ON public.app_users(tenant_id, invite_status);

ALTER TABLE public.billing_plans
  ADD COLUMN IF NOT EXISTS seat_cap int NOT NULL DEFAULT 1;

-- Free plans = 1 seat; any paid plan (price > 0) = 3 seats (owner + 2 invitees).
UPDATE public.billing_plans
   SET seat_cap = CASE WHEN price_cents > 0 THEN 3 ELSE 1 END
 WHERE seat_cap IS DISTINCT FROM (CASE WHEN price_cents > 0 THEN 3 ELSE 1 END);

-- 2) Refresh link_app_user_on_auth so it auto-accepts a pending invite -------

CREATE OR REPLACE FUNCTION public.link_app_user_on_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public.app_users
     SET user_id      = NEW.id,
         invite_status = CASE WHEN invite_status = 'invited' THEN 'active' ELSE invite_status END,
         accepted_at  = CASE WHEN invite_status = 'invited' THEN NOW() ELSE accepted_at END
   WHERE email = NEW.email
     AND user_id IS NULL
     AND invite_status <> 'revoked';
  RETURN NEW;
END;
$$;

-- 3) get_my_seat_info — drives the /team page header ------------------------

CREATE OR REPLACE FUNCTION public.get_my_seat_info()
RETURNS TABLE (
  used        int,
  cap         int,
  plan_name   text,
  has_active_plan boolean,
  can_invite  boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app_user_id uuid;
  v_tenant_id   uuid;
  v_plan_name   text;
  v_seat_cap    int := 1;
  v_has_plan    boolean := false;
  v_used        int := 0;
BEGIN
  SELECT au.id, au.tenant_id INTO v_app_user_id, v_tenant_id
  FROM public.app_users au
  WHERE au.user_id = auth.uid()
  LIMIT 1;

  IF v_app_user_id IS NULL OR v_tenant_id IS NULL THEN
    RETURN QUERY SELECT 0, 1, NULL::text, false, false;
    RETURN;
  END IF;

  SELECT bp.name, bp.seat_cap, true
    INTO v_plan_name, v_seat_cap, v_has_plan
  FROM public.user_entitlements ue
  JOIN public.billing_plans bp ON bp.id = ue.plan_id
  WHERE ue.app_user_id = v_app_user_id
    AND ue.status = 'active'
  ORDER BY bp.seat_cap DESC NULLS LAST
  LIMIT 1;

  IF v_seat_cap IS NULL THEN v_seat_cap := 1; END IF;

  SELECT count(*) INTO v_used
  FROM public.app_users au
  WHERE au.tenant_id = v_tenant_id
    AND au.invite_status IN ('active','invited');

  RETURN QUERY
  SELECT v_used,
         v_seat_cap,
         v_plan_name,
         v_has_plan,
         (v_has_plan AND v_used < v_seat_cap);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_seat_info() TO authenticated;

-- 4) invite_team_member ------------------------------------------------------

CREATE OR REPLACE FUNCTION public.invite_team_member(
  p_email     text,
  p_full_name text DEFAULT NULL
)
RETURNS public.app_users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id   uuid;
  v_tenant_id   uuid;
  v_seat_cap    int := 1;
  v_has_plan    boolean := false;
  v_used        int := 0;
  v_email_norm  text;
  v_existing    public.app_users%ROWTYPE;
  v_new         public.app_users%ROWTYPE;
BEGIN
  v_email_norm := lower(trim(p_email));
  IF v_email_norm IS NULL OR v_email_norm = '' OR v_email_norm !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid email address' USING ERRCODE = '22023';
  END IF;

  SELECT au.id, au.tenant_id INTO v_caller_id, v_tenant_id
  FROM public.app_users au
  WHERE au.user_id = auth.uid()
  LIMIT 1;

  IF v_caller_id IS NULL OR v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT bp.seat_cap, true INTO v_seat_cap, v_has_plan
  FROM public.user_entitlements ue
  JOIN public.billing_plans bp ON bp.id = ue.plan_id
  WHERE ue.app_user_id = v_caller_id
    AND ue.status = 'active'
  ORDER BY bp.seat_cap DESC NULLS LAST
  LIMIT 1;

  IF NOT v_has_plan THEN
    RAISE EXCEPTION 'Inviting team members requires an active subscription' USING ERRCODE = '42501';
  END IF;

  IF v_seat_cap IS NULL THEN v_seat_cap := 1; END IF;

  SELECT count(*) INTO v_used
  FROM public.app_users au
  WHERE au.tenant_id = v_tenant_id
    AND au.invite_status IN ('active','invited');

  IF v_used >= v_seat_cap THEN
    RAISE EXCEPTION 'Seat limit reached (% of %). Upgrade your plan or revoke an invite first.',
      v_used, v_seat_cap USING ERRCODE = '23514';
  END IF;

  SELECT * INTO v_existing FROM public.app_users WHERE lower(email) = v_email_norm LIMIT 1;
  IF v_existing.id IS NOT NULL THEN
    IF v_existing.tenant_id = v_tenant_id THEN
      RAISE EXCEPTION 'A user with that email already exists in your team' USING ERRCODE = '23505';
    ELSE
      RAISE EXCEPTION 'That email is already used by another tenant' USING ERRCODE = '23505';
    END IF;
  END IF;

  INSERT INTO public.app_users (
    tenant_id, email, full_name, role, is_active,
    invite_status, invited_by, invited_at
  ) VALUES (
    v_tenant_id, v_email_norm, NULLIF(trim(p_full_name), ''), 'user', true,
    'invited', v_caller_id, NOW()
  )
  RETURNING * INTO v_new;

  RETURN v_new;
END;
$$;

GRANT EXECUTE ON FUNCTION public.invite_team_member(text, text) TO authenticated;

-- 5) revoke_invite -----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.revoke_invite(p_app_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_tenant uuid;
  v_target_tenant uuid;
  v_target_status text;
BEGIN
  SELECT au.tenant_id INTO v_caller_tenant
  FROM public.app_users au
  WHERE au.user_id = auth.uid()
  LIMIT 1;

  IF v_caller_tenant IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT tenant_id, invite_status INTO v_target_tenant, v_target_status
  FROM public.app_users
  WHERE id = p_app_user_id;

  IF v_target_tenant IS NULL THEN
    RAISE EXCEPTION 'Invite not found' USING ERRCODE = '02000';
  END IF;
  IF v_target_tenant <> v_caller_tenant THEN
    RAISE EXCEPTION 'Cannot revoke an invite from another tenant' USING ERRCODE = '42501';
  END IF;
  IF v_target_status <> 'invited' THEN
    RAISE EXCEPTION 'Only pending invites can be revoked' USING ERRCODE = '22023';
  END IF;

  UPDATE public.app_users
     SET invite_status = 'revoked',
         is_active = false
   WHERE id = p_app_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_invite(uuid) TO authenticated;

-- 6) list_my_team — read view for the /team page ----------------------------

CREATE OR REPLACE FUNCTION public.list_my_team()
RETURNS TABLE (
  id            uuid,
  email         text,
  full_name     text,
  role          text,
  is_active     boolean,
  invite_status text,
  invited_at    timestamptz,
  accepted_at   timestamptz,
  invited_by_email text,
  is_self       boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id     uuid;
  v_caller_tenant uuid;
BEGIN
  SELECT au.id, au.tenant_id INTO v_caller_id, v_caller_tenant
  FROM public.app_users au
  WHERE au.user_id = auth.uid()
  LIMIT 1;

  IF v_caller_tenant IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    au.id,
    au.email,
    au.full_name,
    au.role,
    au.is_active,
    au.invite_status,
    au.invited_at,
    au.accepted_at,
    inv.email AS invited_by_email,
    (au.id = v_caller_id) AS is_self
  FROM public.app_users au
  LEFT JOIN public.app_users inv ON inv.id = au.invited_by
  WHERE au.tenant_id = v_caller_tenant
    AND au.invite_status <> 'revoked'
  ORDER BY au.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_my_team() TO authenticated;
