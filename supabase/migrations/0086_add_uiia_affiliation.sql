-- Add UIIA (Uniform Intermodal Interchange Agreement) to affiliations so the
-- DOT Intel sync can route 53 uiia_approved_insurance_agents source rows to
-- agency_affiliations rather than dropping them on the floor.
--
-- Type: 'cluster' to match the user's mental model — UIIA shows up alongside
-- other agency clusters/networks (SIAA, ISU Steadfast, etc.) in filters.
-- Idempotent.

insert into public.affiliations (canonical_name, type, active) values
  ('UIIA (Uniform Intermodal Interchange Agreement) Approved Agents', 'cluster', true)
on conflict do nothing;
