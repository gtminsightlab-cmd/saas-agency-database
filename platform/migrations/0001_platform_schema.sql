-- 0001_platform_schema.sql
-- seven16-platform — base schema for D-008 three-project topology
-- Tables: tenants, profiles, tenant_memberships, products, plans, entitlements, audit_log
-- RLS policies live in 0002. Seed data lives in 0003.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────
-- 1. tenants — top-level account (org/team a customer represents)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.tenants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_by  uuid references auth.users(id) on delete set null,
  is_active   boolean not null default true,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tenants_slug_idx on public.tenants(slug);
create index if not exists tenants_active_idx on public.tenants(is_active) where is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. profiles — extends auth.users with platform-level user data
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  email              text not null,
  display_name       text,
  avatar_url         text,
  default_tenant_id  uuid references public.tenants(id) on delete set null,
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles(lower(email));
create index if not exists profiles_default_tenant_idx on public.profiles(default_tenant_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. tenant_memberships — which users belong to which tenants, with role
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.tenant_memberships (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner','admin','member')),
  invited_at  timestamptz,
  joined_at   timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create index if not exists tenant_memberships_tenant_idx on public.tenant_memberships(tenant_id);
create index if not exists tenant_memberships_user_idx on public.tenant_memberships(user_id);
create index if not exists tenant_memberships_active_idx
  on public.tenant_memberships(tenant_id, user_id) where is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. products — registry of Seven16 products
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.products (
  id          text primary key,            -- e.g. 'agency_signal', 'dot_intel'
  name        text not null,
  domain      text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. plans — pricing tier registry (per product, plus cross-product bundles)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.plans (
  id                   text primary key,   -- e.g. 'agency_signal_producer', 'seven16_intelligence_bundle'
  product_id           text references public.products(id) on delete restrict,  -- null = cross-product bundle
  display_name         text not null,
  monthly_price_cents  integer,            -- null for free tier
  stripe_price_id      text,               -- null until Stripe is wired
  is_active            boolean not null default true,
  metadata             jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists plans_product_idx on public.plans(product_id);
create index if not exists plans_stripe_price_idx on public.plans(stripe_price_id) where stripe_price_id is not null;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. entitlements — what each tenant currently owns. THE source of truth
--    for "does tenant X have access to product Y?"
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.entitlements (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references public.tenants(id) on delete cascade,
  product_id              text not null references public.products(id) on delete restrict,
  plan_id                 text not null references public.plans(id) on delete restrict,
  status                  text not null check (status in ('trialing','active','past_due','cancelled','expired')),
  started_at              timestamptz not null default now(),
  current_period_end      timestamptz,
  cancel_at               timestamptz,
  stripe_subscription_id  text,
  stripe_customer_id      text,
  metadata                jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (tenant_id, product_id)  -- one active entitlement per product per tenant
);

create index if not exists entitlements_tenant_idx on public.entitlements(tenant_id);
create index if not exists entitlements_product_status_idx on public.entitlements(product_id, status);
create index if not exists entitlements_stripe_sub_idx
  on public.entitlements(stripe_subscription_id) where stripe_subscription_id is not null;
create index if not exists entitlements_stripe_customer_idx
  on public.entitlements(stripe_customer_id) where stripe_customer_id is not null;

-- ─────────────────────────────────────────────────────────────────────────
-- 7. audit_log — platform-level events (tenant.created, entitlement.activated, etc.)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.audit_log (
  id                uuid primary key default gen_random_uuid(),
  actor_user_id     uuid references auth.users(id) on delete set null,
  actor_tenant_id   uuid references public.tenants(id) on delete set null,
  action            text not null,                -- e.g. 'tenant.created', 'entitlement.activated', 'membership.removed'
  subject_type      text,                          -- e.g. 'tenant', 'entitlement', 'membership'
  subject_id        text,                          -- free-form id reference
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists audit_log_actor_user_idx on public.audit_log(actor_user_id, created_at desc);
create index if not exists audit_log_actor_tenant_idx on public.audit_log(actor_tenant_id, created_at desc);
create index if not exists audit_log_action_idx on public.audit_log(action, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at trigger helper + bindings on every table that has updated_at
-- ─────────────────────────────────────────────────────────────────────────

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

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_tenant_memberships_updated_at on public.tenant_memberships;
create trigger trg_tenant_memberships_updated_at
before update on public.tenant_memberships
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_plans_updated_at on public.plans;
create trigger trg_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

drop trigger if exists trg_entitlements_updated_at on public.entitlements;
create trigger trg_entitlements_updated_at
before update on public.entitlements
for each row execute function public.set_updated_at();
