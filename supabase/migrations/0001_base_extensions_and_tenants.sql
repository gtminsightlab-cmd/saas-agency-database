-- 0001_base_extensions_and_tenants.sql
-- Foundational: extensions, tenants, app_users, usage_logs

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Tenants (white-label clients)
create table if not exists public.tenants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique,
  logo_url      text,
  primary_color text,
  plan          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- App users (linked to auth.users via user_id)
create table if not exists public.app_users (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  email       text not null unique,
  full_name   text,
  role        text not null check (role in ('super_admin','tenant_admin','user')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists app_users_tenant_idx on public.app_users(tenant_id);
create index if not exists app_users_user_id_idx on public.app_users(user_id);

-- Usage logs for billing / analytics
create table if not exists public.usage_logs (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  user_id     uuid references public.app_users(id) on delete set null,
  action_type text not null,
  quantity    integer not null default 1,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists usage_logs_tenant_created_idx
  on public.usage_logs (tenant_id, created_at);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tenants_updated_at on public.tenants;
create trigger trg_tenants_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();
