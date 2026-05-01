-- 0005_platform_perf_fixes.sql
-- seven16-platform — clear performance advisor WARNs:
--   1. Drop redundant *_service_role_all policies (service_role has BYPASSRLS — these
--      policies never gated anything; they just made authenticated queries evaluate
--      both policies for every row, doubling RLS cost.)
--   2. Add covering indexes for the two foreign keys that lacked them
--      (tenants.created_by, entitlements.plan_id)

-- 1. Drop service_role_all policies (redundant due to BYPASSRLS)
drop policy if exists tenants_service_role_all            on public.tenants;
drop policy if exists profiles_service_role_all           on public.profiles;
drop policy if exists tm_service_role_all                 on public.tenant_memberships;
drop policy if exists products_service_role_all           on public.products;
drop policy if exists plans_service_role_all              on public.plans;
drop policy if exists entitlements_service_role_all       on public.entitlements;
drop policy if exists audit_log_service_role_all          on public.audit_log;

-- 2. Cover the two unindexed foreign keys
create index if not exists tenants_created_by_idx
  on public.tenants(created_by) where created_by is not null;

create index if not exists entitlements_plan_id_idx
  on public.entitlements(plan_id);
