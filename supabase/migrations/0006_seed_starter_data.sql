-- 0006_seed_starter_data.sql
-- Idempotent seed: default tenant, super_admin user shell, starter lookup values

-- Default tenant
insert into public.tenants (name, slug, plan)
values ('Seven16 Group', 'seven16', 'white_label')
on conflict (slug) do nothing;

-- Super admin shell (user_id null until the email signs up via Supabase Auth;
-- a trigger below will link it automatically when they do)
insert into public.app_users (tenant_id, email, full_name, role, is_active)
select t.id, 'gtminsightlab@gmail.com', 'Master O', 'super_admin', true
from public.tenants t where t.slug = 'seven16'
on conflict (email) do nothing;

-- Auto-link auth.users -> app_users on signup / signin
create or replace function public.link_app_user_on_auth()
returns trigger language plpgsql security definer
set search_path = public, auth
as $$
begin
  update public.app_users
     set user_id = new.id
   where email = new.email
     and user_id is null;
  return new;
end;
$$;

drop trigger if exists trg_link_app_user_on_auth on auth.users;
create trigger trg_link_app_user_on_auth
after insert on auth.users
for each row execute function public.link_app_user_on_auth();

-- ACCOUNT TYPES
insert into public.account_types (code, label, sort_order) values
  ('AGENCY',       'Agency',                 10),
  ('AGENCY_MGA',   'Agency / MGA',           20),
  ('WHOLESALER',   'Wholesaler',             30),
  ('MGA',          'MGA',                    40),
  ('CARRIER',      'Carrier',                50),
  ('BROKER',       'Broker',                 60),
  ('REINSURER',    'Reinsurer',              70),
  ('TPA',          'TPA / Third Party Admin',80),
  ('CONSULTANT',   'Consultant',             90),
  ('OTHER',        'Other',                 999)
on conflict (code) do nothing;

-- AGENCY MANAGEMENT SYSTEMS
insert into public.agency_management_systems (code, label, vendor, sort_order) values
  ('APPLIED',      'Applied Epic',      'Applied Systems', 10),
  ('TAM',          'Applied TAM',       'Applied Systems', 20),
  ('AMS360',       'AMS360',            'Vertafore',       30),
  ('VERTAFORE',    'Vertafore (other)', 'Vertafore',       40),
  ('SAGITTA',      'Sagitta',           'Vertafore',       50),
  ('EZLYNX',       'EZLynx',            'Applied Systems', 60),
  ('HAWKSOFT',     'HawkSoft',          'HawkSoft',        70),
  ('QQCATALYST',   'QQCatalyst',        'Vertafore',       80),
  ('NEXSURE',      'Nexsure',           'XDimensional',    90),
  ('NOWCERTS',     'NowCerts',          'NowCerts',       100),
  ('PARTNERXE',    'PartnerXE',         'SIS',            110),
  ('NEWTON',       'Newton',            'Agency Matrix',  120),
  ('OTHER',        'Other',             null,             999)
on conflict (code) do nothing;

-- LINES OF BUSINESS (industry standard)
insert into public.lines_of_business (code, name, description) values
  ('WC',     'Workers Compensation',      null),
  ('BOP',    'Business Owners Policy',    null),
  ('GL',     'General Liability',         null),
  ('PROP',   'Commercial Property',       null),
  ('AUTO_C', 'Commercial Auto',           null),
  ('AUTO_P', 'Personal Auto',             null),
  ('HOME',   'Homeowners',                null),
  ('UMB',    'Umbrella',                  null),
  ('CYBER',  'Cyber Liability',           null),
  ('EPL',    'Employment Practices',      null),
  ('DO',     'Directors & Officers',      null),
  ('EO',     'Errors & Omissions',        null),
  ('PROF',   'Professional Liability',    null),
  ('HEALTH', 'Health / Benefits',         null),
  ('LIFE',   'Life Insurance',            null),
  ('DIS',    'Disability',                null),
  ('INLAND', 'Inland Marine',             null),
  ('OCEAN',  'Ocean Marine',              null),
  ('AVIA',   'Aviation',                  null),
  ('ENV',    'Environmental / Pollution', null),
  ('BOND',   'Surety / Bonds',            null),
  ('CROP',   'Crop Insurance',            null),
  ('FARM',   'Farm & Ranch',              null),
  ('FLOOD',  'Flood',                     null),
  ('EB',     'Employee Benefits',         null)
on conflict (code) do nothing;
