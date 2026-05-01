-- 0002_platform_rls.sql
-- seven16-platform — RLS helpers + policies on every table
-- Performance: every policy uses (select auth.uid()) initplan pattern
-- so the function is evaluated once per query, not per row (485x speedup
-- pattern from Agency Signal session 5).

-- ─────────────────────────────────────────────────────────────────────────
-- Helper functions (stable, security definer where needed)
-- ─────────────────────────────────────────────────────────────────────────

-- Returns true if the calling role is the service_role
create or replace function public.is_service_role()
returns boolean language sql stable as $$
  select coalesce(auth.role() = 'service_role', false);
$$;

-- Returns array of tenant_ids the current user is an active member of
create or replace function public.current_user_tenant_ids()
returns uuid[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(tenant_id), array[]::uuid[])
  from public.tenant_memberships
  where user_id = (select auth.uid())
    and is_active = true;
$$;

-- Returns true if the current user is owner or admin of the given tenant
create or replace function public.current_user_is_tenant_admin(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tenant_memberships
    where tenant_id = p_tenant_id
      and user_id = (select auth.uid())
      and is_active = true
      and role in ('owner','admin')
  );
$$;

-- Returns true if the current user is owner of the given tenant
create or replace function public.current_user_is_tenant_owner(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.tenant_memberships
    where tenant_id = p_tenant_id
      and user_id = (select auth.uid())
      and is_active = true
      and role = 'owner'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Enable RLS on every table
-- ─────────────────────────────────────────────────────────────────────────

alter table public.tenants            enable row level security;
alter table public.profiles           enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.products           enable row level security;
alter table public.plans              enable row level security;
alter table public.entitlements       enable row level security;
alter table public.audit_log          enable row level security;

-- ─────────────────────────────────────────────────────────────────────────
-- Policies: tenants
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists tenants_service_role_all on public.tenants;
create policy tenants_service_role_all on public.tenants
  for all to public using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists tenants_member_read on public.tenants;
create policy tenants_member_read on public.tenants
  for select to authenticated
  using (id = any(public.current_user_tenant_ids()));

drop policy if exists tenants_authed_insert on public.tenants;
create policy tenants_authed_insert on public.tenants
  for insert to authenticated
  with check (created_by = (select auth.uid()));

drop policy if exists tenants_admin_update on public.tenants;
create policy tenants_admin_update on public.tenants
  for update to authenticated
  using (public.current_user_is_tenant_admin(id))
  with check (public.current_user_is_tenant_admin(id));

drop policy if exists tenants_owner_delete on public.tenants;
create policy tenants_owner_delete on public.tenants
  for delete to authenticated
  using (public.current_user_is_tenant_owner(id));

-- ─────────────────────────────────────────────────────────────────────────
-- Policies: profiles
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists profiles_service_role_all on public.profiles;
create policy profiles_service_role_all on public.profiles
  for all to public using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- Policies: tenant_memberships
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists tm_service_role_all on public.tenant_memberships;
create policy tm_service_role_all on public.tenant_memberships
  for all to public using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists tm_member_read on public.tenant_memberships;
create policy tm_member_read on public.tenant_memberships
  for select to authenticated
  using (tenant_id = any(public.current_user_tenant_ids()));

drop policy if exists tm_admin_insert on public.tenant_memberships;
create policy tm_admin_insert on public.tenant_memberships
  for insert to authenticated
  with check (public.current_user_is_tenant_admin(tenant_id));

drop policy if exists tm_admin_update on public.tenant_memberships;
create policy tm_admin_update on public.tenant_memberships
  for update to authenticated
  using (public.current_user_is_tenant_admin(tenant_id))
  with check (public.current_user_is_tenant_admin(tenant_id));

drop policy if exists tm_admin_delete on public.tenant_memberships;
create policy tm_admin_delete on public.tenant_memberships
  for delete to authenticated
  using (public.current_user_is_tenant_admin(tenant_id));

-- ─────────────────────────────────────────────────────────────────────────
-- Policies: products (lookup table — read-all authed, write service_role)
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists products_service_role_all on public.products;
create policy products_service_role_all on public.products
  for all to public using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists products_authed_read on public.products;
create policy products_authed_read on public.products
  for select to authenticated using (true);

-- ─────────────────────────────────────────────────────────────────────────
-- Policies: plans (lookup table — read-all authed, write service_role)
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists plans_service_role_all on public.plans;
create policy plans_service_role_all on public.plans
  for all to public using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists plans_authed_read on public.plans;
create policy plans_authed_read on public.plans
  for select to authenticated using (true);

-- ─────────────────────────────────────────────────────────────────────────
-- Policies: entitlements (members read tenant's; service_role writes)
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists entitlements_service_role_all on public.entitlements;
create policy entitlements_service_role_all on public.entitlements
  for all to public using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists entitlements_member_read on public.entitlements;
create policy entitlements_member_read on public.entitlements
  for select to authenticated
  using (tenant_id = any(public.current_user_tenant_ids()));

-- ─────────────────────────────────────────────────────────────────────────
-- Policies: audit_log (admins read tenant's; service_role writes)
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists audit_log_service_role_all on public.audit_log;
create policy audit_log_service_role_all on public.audit_log
  for all to public using (public.is_service_role()) with check (public.is_service_role());

drop policy if exists audit_log_admin_read on public.audit_log;
create policy audit_log_admin_read on public.audit_log
  for select to authenticated
  using (
    actor_tenant_id is not null
    and public.current_user_is_tenant_admin(actor_tenant_id)
  );
