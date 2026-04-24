-- 0008_advisor_fixes.sql
-- Fix advisor findings:
--   1. set_updated_at had mutable search_path (security WARN)
--   2. FOR ALL policies duplicate the SELECT policy -> split into INSERT/UPDATE/DELETE
--   3. Add indexes on unindexed foreign keys

-- 1. Pin search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Replace FOR ALL modify policies with INSERT/UPDATE/DELETE so they don't double-up with SELECT
do $$
declare t text;
begin
  -- Tenants (super_admin only for writes)
  execute 'drop policy if exists tenants_modify on public.tenants';
  execute 'create policy tenants_insert on public.tenants for insert to authenticated with check (public.is_super_admin())';
  execute 'create policy tenants_update on public.tenants for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin())';
  execute 'create policy tenants_delete on public.tenants for delete to authenticated using (public.is_super_admin())';

  -- App users (super_admin or tenant_admin within own tenant)
  execute 'drop policy if exists app_users_modify on public.app_users';
  execute 'create policy app_users_insert on public.app_users for insert to authenticated
    with check (public.is_super_admin() or (public.current_user_role() = ''tenant_admin'' and tenant_id = public.current_tenant_id()))';
  execute 'create policy app_users_update on public.app_users for update to authenticated
    using (public.is_super_admin() or (public.current_user_role() = ''tenant_admin'' and tenant_id = public.current_tenant_id()))
    with check (public.is_super_admin() or (public.current_user_role() = ''tenant_admin'' and tenant_id = public.current_tenant_id()))';
  execute 'create policy app_users_delete on public.app_users for delete to authenticated
    using (public.is_super_admin() or (public.current_user_role() = ''tenant_admin'' and tenant_id = public.current_tenant_id()))';

  -- Global lookups (super_admin only for writes)
  for t in select unnest(array[
    'account_types','agency_management_systems','lines_of_business','sic_codes',
    'carriers','affiliations','affiliation_aliases','data_dictionary_fields',
    'top_agency_lists','top_agency_members'
  ])
  loop
    execute format('drop policy if exists %I_modify on public.%I', t, t);
    execute format('create policy %I_insert on public.%I for insert to authenticated with check (public.is_super_admin())', t, t);
    execute format('create policy %I_update on public.%I for update to authenticated using (public.is_super_admin()) with check (public.is_super_admin())', t, t);
    execute format('create policy %I_delete on public.%I for delete to authenticated using (public.is_super_admin())', t, t);
  end loop;

  -- Tenant-scoped tables
  for t in select unnest(array[
    'agencies','contacts','agency_lines','company_lines_raw','agency_sic_codes',
    'agency_affiliations','agency_carriers','saved_lists','downloads'
  ])
  loop
    execute format('drop policy if exists %I_modify on public.%I', t, t);
    execute format(
      'create policy %I_insert on public.%I for insert to authenticated with check (public.is_super_admin() or tenant_id = public.current_tenant_id())',
      t, t
    );
    execute format(
      'create policy %I_update on public.%I for update to authenticated using (public.is_super_admin() or tenant_id = public.current_tenant_id()) with check (public.is_super_admin() or tenant_id = public.current_tenant_id())',
      t, t
    );
    execute format(
      'create policy %I_delete on public.%I for delete to authenticated using (public.is_super_admin() or tenant_id = public.current_tenant_id())',
      t, t
    );
  end loop;
end
$$;

-- 3. Add indexes for unindexed foreign keys
create index if not exists agencies_account_type_id_idx       on public.agencies(account_type_id);
create index if not exists agencies_agency_mgmt_system_id_idx on public.agencies(agency_mgmt_system_id);
create index if not exists agencies_parent_agency_id_idx      on public.agencies(parent_agency_id);
create index if not exists agency_affiliations_tenant_idx     on public.agency_affiliations(tenant_id);
create index if not exists agency_carriers_tenant_idx         on public.agency_carriers(tenant_id);
create index if not exists agency_sic_codes_tenant_idx        on public.agency_sic_codes(tenant_id);
create index if not exists company_lines_raw_tenant_idx       on public.company_lines_raw(tenant_id);
create index if not exists downloads_saved_list_idx           on public.downloads(saved_list_id);
create index if not exists downloads_user_idx                 on public.downloads(user_id);
create index if not exists saved_lists_user_idx               on public.saved_lists(user_id);
create index if not exists top_agency_members_agency_idx      on public.top_agency_members(agency_id);
create index if not exists usage_logs_user_idx                on public.usage_logs(user_id);
