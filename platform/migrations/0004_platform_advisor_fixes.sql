-- 0004_platform_advisor_fixes.sql
-- seven16-platform — clear all 8 advisor WARNs introduced by 0001/0002:
--   1. Add search_path to is_service_role + set_updated_at
--   2. Move 3 SECURITY DEFINER helpers out of public into private schema
--      (PostgREST won't expose private.* as RPC, but RLS policies can still call them)

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Fix search_path on the two public functions that lacked it
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.is_service_role()
returns boolean language sql stable
set search_path = public, pg_catalog
as $$
  select coalesce(auth.role() = 'service_role', false);
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Create private schema for security-definer helpers
-- ─────────────────────────────────────────────────────────────────────────

create schema if not exists private;

-- Grant usage so RLS policies (running as authenticated/anon) can resolve
-- the schema; functions still need explicit EXECUTE grants.
grant usage on schema private to authenticated, anon, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Drop policies that reference the public.* helpers (so we can drop them)
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists tenants_member_read on public.tenants;
drop policy if exists tenants_admin_update on public.tenants;
drop policy if exists tenants_owner_delete on public.tenants;
drop policy if exists tm_member_read on public.tenant_memberships;
drop policy if exists tm_admin_insert on public.tenant_memberships;
drop policy if exists tm_admin_update on public.tenant_memberships;
drop policy if exists tm_admin_delete on public.tenant_memberships;
drop policy if exists entitlements_member_read on public.entitlements;
drop policy if exists audit_log_admin_read on public.audit_log;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Drop public.* helpers and recreate in private schema
-- ─────────────────────────────────────────────────────────────────────────

drop function if exists public.current_user_tenant_ids();
drop function if exists public.current_user_is_tenant_admin(uuid);
drop function if exists public.current_user_is_tenant_owner(uuid);

create or replace function private.current_user_tenant_ids()
returns uuid[] language sql stable security definer
set search_path = public, pg_catalog
as $$
  select coalesce(array_agg(tenant_id), array[]::uuid[])
  from public.tenant_memberships
  where user_id = (select auth.uid()) and is_active = true;
$$;

create or replace function private.current_user_is_tenant_admin(p_tenant_id uuid)
returns boolean language sql stable security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.tenant_memberships
    where tenant_id = p_tenant_id
      and user_id = (select auth.uid())
      and is_active = true
      and role in ('owner','admin')
  );
$$;

create or replace function private.current_user_is_tenant_owner(p_tenant_id uuid)
returns boolean language sql stable security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.tenant_memberships
    where tenant_id = p_tenant_id
      and user_id = (select auth.uid())
      and is_active = true
      and role = 'owner'
  );
$$;

-- Grant EXECUTE so RLS policies running as authenticated/anon can call them.
-- Note: PostgREST exposes only public schema by default, so these are NOT
-- callable as RPC endpoints — only via internal SQL paths.
grant execute on function private.current_user_tenant_ids()                  to authenticated, service_role;
grant execute on function private.current_user_is_tenant_admin(uuid)         to authenticated, service_role;
grant execute on function private.current_user_is_tenant_owner(uuid)         to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Recreate policies pointing at private.* helpers
-- ─────────────────────────────────────────────────────────────────────────

create policy tenants_member_read on public.tenants
  for select to authenticated
  using (id = any(private.current_user_tenant_ids()));

create policy tenants_admin_update on public.tenants
  for update to authenticated
  using (private.current_user_is_tenant_admin(id))
  with check (private.current_user_is_tenant_admin(id));

create policy tenants_owner_delete on public.tenants
  for delete to authenticated
  using (private.current_user_is_tenant_owner(id));

create policy tm_member_read on public.tenant_memberships
  for select to authenticated
  using (tenant_id = any(private.current_user_tenant_ids()));

create policy tm_admin_insert on public.tenant_memberships
  for insert to authenticated
  with check (private.current_user_is_tenant_admin(tenant_id));

create policy tm_admin_update on public.tenant_memberships
  for update to authenticated
  using (private.current_user_is_tenant_admin(tenant_id))
  with check (private.current_user_is_tenant_admin(tenant_id));

create policy tm_admin_delete on public.tenant_memberships
  for delete to authenticated
  using (private.current_user_is_tenant_admin(tenant_id));

create policy entitlements_member_read on public.entitlements
  for select to authenticated
  using (tenant_id = any(private.current_user_tenant_ids()));

create policy audit_log_admin_read on public.audit_log
  for select to authenticated
  using (
    actor_tenant_id is not null
    and private.current_user_is_tenant_admin(actor_tenant_id)
  );
