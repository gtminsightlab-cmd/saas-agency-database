-- Add Transportation Risk Specialist (TRS) — MCIEF transportation designation —
-- to public.affiliations as a 'cluster' type so it shows alongside UIIA, SIAA,
-- ISU Steadfast, etc. in the agency-cluster filter.
--
-- Taxonomy seeding only: no source slug currently produces TRS-tagged data,
-- so this load doesn't link any agencies. Available for future loads + UI filter.
-- Idempotent.

insert into public.affiliations (canonical_name, type, active) values
  ('Transportation Risk Specialist (TRS)', 'cluster', true)
on conflict do nothing;
