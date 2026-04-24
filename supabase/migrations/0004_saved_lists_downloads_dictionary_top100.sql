-- 0004_saved_lists_downloads_dictionary_top100.sql

create table if not exists public.saved_lists (
  id                         uuid primary key default gen_random_uuid(),
  tenant_id                  uuid references public.tenants(id) on delete cascade,
  user_id                    uuid references public.app_users(id) on delete set null,
  name                       text not null,
  filter_json                jsonb not null,
  accounts_count             integer,
  contacts_count             integer,
  contacts_with_email_count  integer,
  has_updates                boolean default false,
  created_at                 timestamptz not null default now(),
  last_run_at                timestamptz
);

create index if not exists saved_lists_tenant_idx
  on public.saved_lists (tenant_id, created_at);

create table if not exists public.downloads (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references public.tenants(id) on delete cascade,
  user_id         uuid references public.app_users(id) on delete set null,
  saved_list_id   uuid references public.saved_lists(id) on delete set null,
  type            text not null,
  status          text not null check (status in ('pending','processing','complete','failed')),
  records_count   integer,
  file_url        text,
  error_message   text,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists downloads_tenant_idx
  on public.downloads (tenant_id, created_at);

create table if not exists public.data_dictionary_fields (
  id           uuid primary key default gen_random_uuid(),
  table_name   text not null,
  column_name  text not null,
  data_type    text not null,
  max_length   integer,
  is_nullable  boolean not null,
  description  text,
  example      text
);

create index if not exists data_dict_table_col_idx
  on public.data_dictionary_fields (table_name, column_name);

create table if not exists public.top_agency_lists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  year        integer,
  source_url  text,
  description text,
  created_at  timestamptz default now()
);

create table if not exists public.top_agency_members (
  id                 uuid primary key default gen_random_uuid(),
  top_agency_list_id uuid references public.top_agency_lists(id) on delete cascade,
  rank               integer,
  agency_name        text not null,
  pc_revenue         numeric(18,2),
  other_revenue      numeric(18,2),
  office_city        text,
  office_state       text,
  agency_id          uuid references public.agencies(id)
);

create index if not exists top_agency_members_list_idx
  on public.top_agency_members (top_agency_list_id);
