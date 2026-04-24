-- 0002_lookups.sql
-- Shared lookup tables (dropdowns, filter values)

create table if not exists public.account_types (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  label       text not null,
  description text,
  active      boolean not null default true,
  sort_order  integer default 0
);

create table if not exists public.agency_management_systems (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  label       text not null,
  vendor      text,
  active      boolean not null default true,
  sort_order  integer default 0
);

create table if not exists public.lines_of_business (
  id          uuid primary key default gen_random_uuid(),
  code        text unique,
  name        text not null,
  description text
);

create table if not exists public.sic_codes (
  id          uuid primary key default gen_random_uuid(),
  sic_code    text not null unique,
  description text
);

create table if not exists public.carriers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  group_name  text,
  naic_code   text,
  active      boolean not null default true
);

create unique index if not exists carriers_name_lower_idx
  on public.carriers (lower(name));

create table if not exists public.affiliations (
  id             uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  type           text not null,
  active         boolean not null default true,
  sort_order     integer default 0
);

create unique index if not exists affiliations_name_type_idx
  on public.affiliations (lower(canonical_name), type);

create table if not exists public.affiliation_aliases (
  id             uuid primary key default gen_random_uuid(),
  affiliation_id uuid references public.affiliations(id) on delete cascade,
  alias_name     text not null
);

create index if not exists affiliation_aliases_affiliation_idx
  on public.affiliation_aliases(affiliation_id);
