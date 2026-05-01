-- Document the empirically-derived trucking segment for each carrier in the
-- Transportation vertical. Segmentation is based on observed appointment
-- reach in the 1,419-row Master Trucking DB upload (uploaded 2026-04-27).
--
-- Methodology: number of distinct agencies appointed with the carrier in the
-- trucking universe, expressed as % of total trucking-appointed agencies.
-- Wide reach = non-fleet specialist (writes to small operators). Narrow reach
-- = fleet specialist (selective, large accounts).
--
-- Carriers not in the trucking master upload are tagged 'unknown' — their
-- existing Supabase counts come from generalist P&C data, not trucking-
-- specific evidence, so those don't yet support a defensible segment claim.

UPDATE public.carrier_verticals SET note =
  CASE
    -- Trucking-master file carriers (1,419 appointments, 5 carriers)
    WHEN carrier_id = '42a0c0ef-ab70-4027-870a-e0622b5c2011' THEN
      'trucking_segment: non_fleet_specialist | source: master_trucking_db_2026-04-27 | reach: 1062 (74.8% of trucking universe) | rationale: broad retail distribution typical of mass-market non-fleet/owner-operator writers'
    WHEN carrier_id = '4ade1327-7920-47ab-80fa-1e6edf5ca5dc' THEN
      'trucking_segment: mid_market_mixed | source: master_trucking_db_2026-04-27 | reach: 234 (16.5%) | rationale: regional-broker distribution writes a mix of small/mid trucking risks'
    WHEN carrier_id = 'f0882eac-e67d-4158-8620-f7c019234268' THEN
      'trucking_segment: large_fleet_specialist | source: master_trucking_db_2026-04-27 | reach: 55 (3.9%) | rationale: highly selective specialist distribution typical of large interstate fleet writers'
    WHEN carrier_id = '8a5a15c5-969d-4f0e-be8c-c97085b7dde3' THEN
      'trucking_segment: specialty_es_niche | source: master_trucking_db_2026-04-27 | reach: 42 (3.0%) | rationale: narrow E&S specialty distribution; sub-brands Harco and Occidental focus on specialty trucking lines'
    WHEN carrier_id = '3c87d242-e474-41a1-af60-99728f19b86d' THEN
      'trucking_segment: mid_fleet_specialist | source: master_trucking_db_2026-04-27 | reach: 26 (1.8%) | rationale: selective long-haul focused distribution'
    -- Carriers not in the upload — segment unknown until trucking-specific data lands
    ELSE
      'trucking_segment: unknown | source: needs_trucking_specific_data | rationale: existing Supabase counts reflect generalist P&C data, not trucking-specific evidence'
  END
WHERE vertical_id = 'f890aa2b-5c9b-4dc7-b26a-3387e3b6fa1a';
