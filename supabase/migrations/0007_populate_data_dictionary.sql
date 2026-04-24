-- 0007_populate_data_dictionary.sql
-- Auto-populate data_dictionary_fields from information_schema for the /data-mapping page.
-- Idempotent: deletes existing rows for the target tables, then reinserts.

with target_tables as (
  select unnest(array[
    'tenants','app_users','usage_logs',
    'account_types','agency_management_systems','lines_of_business',
    'sic_codes','carriers','affiliations','affiliation_aliases',
    'agencies','contacts','agency_lines','company_lines_raw',
    'agency_sic_codes','agency_affiliations','agency_carriers',
    'saved_lists','downloads','data_dictionary_fields',
    'top_agency_lists','top_agency_members'
  ])::text as tname
)
delete from public.data_dictionary_fields
where table_name in (select tname from target_tables);

insert into public.data_dictionary_fields
  (table_name, column_name, data_type, max_length, is_nullable, description, example)
select
  c.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  (c.is_nullable = 'YES'),
  null,
  null
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name in (
    'tenants','app_users','usage_logs',
    'account_types','agency_management_systems','lines_of_business',
    'sic_codes','carriers','affiliations','affiliation_aliases',
    'agencies','contacts','agency_lines','company_lines_raw',
    'agency_sic_codes','agency_affiliations','agency_carriers',
    'saved_lists','downloads','data_dictionary_fields',
    'top_agency_lists','top_agency_members'
  )
order by c.table_name, c.ordinal_position;
