-- 0003_core_domain_agencies_contacts_relationships.sql
-- Core domain: agencies, contacts, and N:M relationships

create table if not exists public.agencies (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid references public.tenants(id) on delete cascade,

  account_id             varchar(32),
  name                   text not null,
  parent_name            text,
  parent_agency_id       uuid references public.agencies(id),

  account_type_id        uuid references public.account_types(id),
  agency_mgmt_system_id  uuid references public.agency_management_systems(id),

  address_1              text,
  address_2              text,
  city                   text,
  state                  text,
  postal_code            text,
  county                 text,
  country                text,
  msa                    text,
  county_code            text,
  timezone               text,

  main_phone             text,
  work_phone             text,
  phone_extension        text,
  fax                    text,
  toll_free              text,

  web_address            text,
  email                  text,

  revenue                numeric(18,2),
  percent_commission     numeric(7,2),
  employees              integer,
  premium_volume         numeric(18,2),

  num_locations          integer,
  branch_indicator       text,
  special_lines          text,
  duns_number            text,

  twitter_url            text,
  facebook_url           text,
  gmb_url                text,
  youtube_url            text,
  linkedin_url           text,

  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create unique index if not exists agencies_tenant_account_id_idx
  on public.agencies (tenant_id, account_id);

create index if not exists agencies_name_tsv_idx
  on public.agencies using gin (to_tsvector('english', name));

create index if not exists agencies_geo_idx
  on public.agencies(state, county, postal_code);

create index if not exists agencies_tenant_idx on public.agencies(tenant_id);

drop trigger if exists trg_agencies_updated_at on public.agencies;
create trigger trg_agencies_updated_at
before update on public.agencies
for each row execute function public.set_updated_at();

-- Contacts
create table if not exists public.contacts (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid references public.tenants(id) on delete cascade,
  agency_id             uuid references public.agencies(id) on delete cascade,

  contact_id            varchar(32),
  is_primary            boolean,

  first_name            text,
  last_name             text,
  suffix                text,

  title                 text,
  title_search          text,
  department            text,
  line_search           text,
  level_of_management   text,

  email_primary         text,
  email_secondary       text,
  mobile_phone          text,
  work_phone            text,
  phone_extension       text,
  fax                   text,
  toll_free             text,

  address_1             text,
  address_2             text,
  city                  text,
  state                 text,
  postal_code           text,
  county                text,
  country               text,
  timezone              text,
  msa                   text,
  county_code           text,

  web_address           text,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists contacts_tenant_idx on public.contacts(tenant_id);
create index if not exists contacts_agency_id_idx on public.contacts (agency_id);
create index if not exists contacts_email_lower_idx on public.contacts (lower(email_primary));
create index if not exists contacts_name_tsv_idx
  on public.contacts using gin (to_tsvector('english', coalesce(first_name,'') || ' ' || coalesce(last_name,'')));

drop trigger if exists trg_contacts_updated_at on public.contacts;
create trigger trg_contacts_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

-- Lines of business assignments (normalized)
create table if not exists public.agency_lines (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid references public.tenants(id) on delete cascade,
  agency_id             uuid references public.agencies(id) on delete cascade,
  line_of_business_id   uuid references public.lines_of_business(id) on delete restrict
);

create index if not exists agency_lines_agency_idx on public.agency_lines(agency_id);
create index if not exists agency_lines_lob_idx on public.agency_lines(line_of_business_id);
create index if not exists agency_lines_tenant_idx on public.agency_lines(tenant_id);
create unique index if not exists agency_lines_unique_idx
  on public.agency_lines(agency_id, line_of_business_id);

-- Raw / unnormalized company lines
create table if not exists public.company_lines_raw (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  agency_id   uuid references public.agencies(id) on delete cascade,
  line_name   text not null
);

create index if not exists company_lines_raw_agency_idx on public.company_lines_raw(agency_id);

-- SIC mapping
create table if not exists public.agency_sic_codes (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references public.tenants(id) on delete cascade,
  agency_id   uuid references public.agencies(id) on delete cascade,
  sic_code_id uuid references public.sic_codes(id) on delete restrict
);

create index if not exists agency_sic_agency_idx on public.agency_sic_codes(agency_id);
create index if not exists agency_sic_code_idx on public.agency_sic_codes(sic_code_id);
create unique index if not exists agency_sic_unique_idx
  on public.agency_sic_codes(agency_id, sic_code_id);

-- Affiliations mapping
create table if not exists public.agency_affiliations (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references public.tenants(id) on delete cascade,
  agency_id       uuid references public.agencies(id) on delete cascade,
  affiliation_id  uuid references public.affiliations(id) on delete cascade
);

create index if not exists agency_affiliations_agency_idx
  on public.agency_affiliations(agency_id);
create index if not exists agency_affiliations_affiliation_idx
  on public.agency_affiliations(affiliation_id);
create unique index if not exists agency_affiliations_unique_idx
  on public.agency_affiliations(agency_id, affiliation_id);

-- Carriers mapping
create table if not exists public.agency_carriers (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid references public.tenants(id) on delete cascade,
  agency_id         uuid references public.agencies(id) on delete cascade,
  carrier_id        uuid references public.carriers(id) on delete restrict,
  relationship_type text,
  notes             text
);

create index if not exists agency_carriers_agency_idx on public.agency_carriers(agency_id);
create index if not exists agency_carriers_carrier_idx on public.agency_carriers(carrier_id);
