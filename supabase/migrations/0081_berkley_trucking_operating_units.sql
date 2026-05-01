-- W. R. Berkley's trucking operating-unit structure (per Master O 2026-04-27).
-- Master O's classification:
--   Berkley Small Business      → 1-14 PU  (non-fleet)
--   Berkley Prime Transportation → 15-75 PU (mid-fleet)
--   Carolina Casualty            → 75+ PU   (large-fleet)
--   Berkley National Insurance   → 1-100+   (umbrella paper, full range)
-- FMCSA data identifies which unit wrote a policy by certificate-ID prefix.

-- 1. Insert the two operating units missing from carriers
INSERT INTO public.carriers (name, group_name, active) VALUES
  ('Berkley Small Business',        'W. R. Berkley Insurance Group', true),
  ('Berkley Prime Transportation',  'W. R. Berkley Insurance Group', true)
ON CONFLICT DO NOTHING;

-- 2. Add 4 Berkley/Carolina entries to the Transportation vertical
INSERT INTO public.carrier_verticals (vertical_id, carrier_id)
SELECT 'f890aa2b-5c9b-4dc7-b26a-3387e3b6fa1a'::uuid, c.id
FROM public.carriers c
WHERE c.name IN (
  'Berkley National Insurance Company',
  'Carolina Casualty Insurance Company',
  'Berkley Small Business',
  'Berkley Prime Transportation'
)
ON CONFLICT (vertical_id, carrier_id) DO NOTHING;

-- 3. Set structured trucking_segment notes for all 4 Berkley entries
UPDATE public.carrier_verticals cv
SET note = CASE c.name
  WHEN 'Berkley Small Business' THEN
    'trucking_segment: non_fleet_specialist | source: master_o_industry_knowledge_2026-04-27 | reach: 1-14 power units | rationale: W. R. Berkley operating unit for 1-14 PU non-fleet/owner-operator; distributed via specialty wholesalers (CRC, RPS, Burns & Wilcox, ISC MGA, Amwins, First Light, Great Lakes, Maximum, Truckers Insurance, RT Specialty, XPT, Blue Ridge, Arlington Roe, JM Wilson)'
  WHEN 'Berkley Prime Transportation' THEN
    'trucking_segment: mid_fleet_specialist | source: master_o_industry_knowledge_2026-04-27 | reach: 15-75 power units | rationale: W. R. Berkley operating unit for 15-75 PU mid-fleet; distributed via the same 14 specialty wholesalers as Berkley Small Business'
  WHEN 'Berkley National Insurance Company' THEN
    'trucking_segment: mid_market_mixed | source: master_o_industry_knowledge_2026-04-27 | reach: 1-100+ power units | rationale: W. R. Berkley umbrella paper covering both non-fleet and fleet trucking; full 1-100+ PU range; specific operating unit identifiable via FMCSA certificate-ID prefix'
  WHEN 'Carolina Casualty Insurance Company' THEN
    'trucking_segment: large_fleet_specialist | source: master_o_industry_knowledge_2026-04-27 | reach: 75+ power units | rationale: W. R. Berkley operating unit for fleets 75+ PU; large-fleet long-haul specialist'
END
FROM public.carriers c
WHERE cv.carrier_id = c.id
  AND cv.vertical_id = 'f890aa2b-5c9b-4dc7-b26a-3387e3b6fa1a'
  AND c.name IN (
    'Berkley Small Business',
    'Berkley Prime Transportation',
    'Berkley National Insurance Company',
    'Carolina Casualty Insurance Company'
  );

-- 4. Refresh the materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_vertical_summary;
