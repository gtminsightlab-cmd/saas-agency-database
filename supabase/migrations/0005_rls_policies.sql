-- 0005_rls_policies.sql
-- Row Level Security: tenant isolation + role checks

-- Helper: resolve the current app_user row from auth.uid()
create or replace function public.current_app_user()
returns public.app_users
language sql stable security definer
set search_path = public
as $$
  select au.*
  from public.app_users au
  where au.user_id = auth.uid()
    and au.is_active = true
  limit 1;
$$;

create or replace function public.current_tenant_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select tenant_id from public.current_app_user();
$$;

create or replace function public.current_user_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.current_app_user();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select role = 'super_admin' from public.current_app_user()), false);
$$;

-- Enable RLS on all tables
alter table public.tenants                    enable row level security;
alter table public.app_users                  enable row level security;
alter table public.usage_logs                 enable row level security;
alter table public.account_types              enable row level security;
alter table public.agency_management_systems  enable row level security;
alter table public.lines_of_business          enable row level security;
alter table public.sic_codes                  enable row level security;
alter table public.carriers                   enable row level security;
alter table public.affiliations               enable row level security;
alter table public.affiliation_aliases        enable row level security;
alter table public.agencies                   enable row level security;
alter table public.contacts                   enable row level security;
alter table public.agency_lines               enable row level security;
alter table public.company_lines_raw          enable row level security;
alter table public.agency_sic_codes           enable row level security;
alter table public.agency_affiliations        enable row level security;
alter table public.agency_carriers            enable row level security;
alter table public.saved_lists                enable row level security;
alter table public.downloads                  enable row level security;
alter table public.data_dictionary_fields     enable row level security;
alter table public.top_agency_lists           enable row level security;
alter table public.top_agency_members         enable row level security;

-- Tenants: user sees their own tenant; super_admin sees all
drop policy if exists tenants_select on public.tenants;
create policy tenants_select on public.tenants for select to authenticated
  using (public.is_super_admin() or id = public.current_tenant_id());

drop policy if exists tenants_modify on public.tenants;
create policy tenants_modify on public.tenants for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- App users: user sees members of their tenant; super_admin sees all
drop policy if exists app_users_select on public.app_users;
create policy app_users_select on public.app_users for select to authenticated
  using (public.is_super_admin() or tenant_id = public.current_tenant_id());

drop policy if exists app_users_modify on public.app_users;
create policy app_users_modify on public.app_users for all to authenticated
  using (
    public.is_super_admin()
    or (public.current_user_role() = 'tenant_admin' and tenant_id = public.current_tenant_id())
  )
  with check (
    public.is_super_admin()
    or (public.current_user_role() = 'tenant_admin' and tenant_id = public.current_tenant_id())
  );

-- Usage logs: readable within tenant; super_admin sees all. Inserts auto-scoped.
drop policy if exists usage_logs_select on public.usage_logs;
create policy usage_logs_select on public.usage_logs for select to authenticated
  using (public.is_super_admin() or tenant_id = public.current_tenant_id());

drop policy if exists usage_logs_insert on public.usage_logs;
create policy usage_logs_insert on public.usage_logs for insert to authenticated
  with check (public.is_super_admin() or tenant_id = public.current_tenant_id());

-- Shared lookups: readable by any authenticated user; write only by super_admin
do $$
declare t text;
begin
  for t in select unnest(array[
    'account_types','agency_management_systems','lines_of_business','sic_codes',
    'carriers','affiliations','affiliation_aliases','data_dictionary_fields',
    'top_agency_lists','top_agency_members'
  ])
  loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format('create policy %I_select on public.%I for select to authenticated using (true)', t, t);
    execute format('drop policy if exists %I_modify on public.%I', t, t);
    execute format('create policy %I_modify on public.%I for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin())', t, t);
  end loop;
end
$$;

-- Tenant-scoped rows: agencies, contacts, all N:M joins, saved_lists, downloads
do $$
declare t text;
begin
  for t in select unnest(array[
    'agencies','contacts','agency_lines','company_lines_raw','agency_sic_codes',
    'agency_affiliations','agency_carriers','saved_lists','downloads'
  ])
  loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format(
      'create policy %I_select on public.%I for select to authenticated using (public.is_super_admin() or tenant_id = public.current_tenant_id())',
      t, t
    );
    execute format('drop policy if exists %I_modify on public.%I', t, t);
    execute format(
      'create policy %I_modify on public.%I for all to authenticated using (public.is_super_admin() or tenant_id = public.current_tenant_id()) with check (public.is_super_admin() or tenant_id = public.current_tenant_id())',
      t, t
    );
  end loop;
end
$$;

-- Service role (used by server-side scripts / Edge Functions) bypasses RLS by default,
-- but we revoke broad anon access explicitly
revoke all on all tables in schema public from anon;
