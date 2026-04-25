-- Tighten the 8 new verticals: drop the broad auto-mappings from 0052 and
-- replace with a curated set of true vertical specialists per Master O's
-- grid. Drops mapped_carrier_count from 70-86 → 6-9 per vertical, and the
-- 6k-8k exposure counts collapse to a real-feeling 1-38.
--
-- Step 1: delete the 0052 auto-mappings (note column tag identifies them)
-- Step 2: insert curated specialists with exact-name match. Each row tagged
-- 'curated v2 — specialty-only 2026-04-25' so a future cleanup can target
-- just these too if needed.

DELETE FROM public.carrier_verticals
WHERE note = 'auto-mapped from Master O grid 2026-04-25';

WITH spec(slug, carrier_name, weight) AS (VALUES
  ('public-entity', 'munich re america', 5),
  ('public-entity', 'crum & forster', 5),
  ('public-entity', 'crum & forster group', 5),
  ('public-entity', 'crum & forster insurance group', 5),
  ('public-entity', 'markel insurance group', 4),
  ('public-entity', 'tokio marine america insurance company', 4),
  ('public-entity', 'philadelphia indemnity insurance company', 5),
  ('public-entity', 'arch insurance group', 4),
  ('public-entity', 'amtrust group', 3),
  ('real-estate', 'assurant group', 5),
  ('real-estate', 'assurant p&c group', 5),
  ('real-estate', 'american bankers insurance company of florida', 4),
  ('real-estate', 'american security insurance company', 4),
  ('real-estate', 'markel american insurance company', 4),
  ('real-estate', 'berkley luxury group', 5),
  ('real-estate', 'allianz us p&c insurance companies', 4),
  ('real-estate', 'fireman''s fund insurance company', 4),
  ('hospitality', 'society insurance', 5),
  ('hospitality', 'markel american insurance company', 5),
  ('hospitality', 'markel insurance group', 4),
  ('hospitality', 'hanover insurance group', 4),
  ('hospitality', 'guard insurance group', 4),
  ('hospitality', 'philadelphia indemnity insurance company', 4),
  ('hospitality', 'tokio marine america insurance company', 3),
  ('manufacturing', 'fm global', 5),
  ('manufacturing', 'navigators insurance company', 5),
  ('manufacturing', 'hartford steam boiler inspection and insurance company', 5),
  ('manufacturing', 'munich reinsurance america, inc.', 4),
  ('manufacturing', 'allianz global risks us insurance company', 4),
  ('manufacturing', 'tokio marine america insurance company', 3),
  ('technology-cyber', 'beazley', 5),
  ('technology-cyber', 'coalition', 5),
  ('technology-cyber', 'hiscox ltd', 5),
  ('technology-cyber', 'axis us insurance operations', 5),
  ('technology-cyber', 'axis insurance company', 4),
  ('technology-cyber', 'axis surplus insurance company', 4),
  ('technology-cyber', 'corvus by travelers', 5),
  ('technology-cyber', 'munich re america', 4),
  ('energy-oil-gas', 'sompo north america group', 5),
  ('energy-oil-gas', 'sompo specialty insurance company', 5),
  ('energy-oil-gas', 'sompo america insurance company', 4),
  ('energy-oil-gas', 'axa xl', 5),
  ('energy-oil-gas', 'allianz global risks us insurance company', 4),
  ('energy-oil-gas', 'ironshore insurance companies', 4),
  ('energy-oil-gas', 'navigators insurance company', 4),
  ('retail-wholesale', 'hanover insurance group', 5),
  ('retail-wholesale', 'markel american insurance company', 4),
  ('retail-wholesale', 'markel insurance group', 4),
  ('retail-wholesale', 'amtrust group', 4),
  ('retail-wholesale', 'amtrust north america', 4),
  ('retail-wholesale', 'wesco insurance company', 3),
  ('professional-services', 'axis us insurance operations', 5),
  ('professional-services', 'axis insurance company', 4),
  ('professional-services', 'markel insurance group', 5),
  ('professional-services', 'markel american insurance company', 4),
  ('professional-services', 'hiscox ltd', 5),
  ('professional-services', 'medical protective', 5),
  ('professional-services', 'beazley', 4),
  ('professional-services', 'berkley insurance company', 4)
)
INSERT INTO public.carrier_verticals (vertical_id, carrier_id, weight, note)
SELECT vm.id, c.id, s.weight, 'curated v2 — specialty-only 2026-04-25'
FROM spec s
JOIN public.vertical_markets vm ON vm.slug = s.slug
JOIN public.carriers c ON c.active AND lower(c.name) = s.carrier_name
ON CONFLICT (vertical_id, carrier_id) DO NOTHING;

REFRESH MATERIALIZED VIEW public.mv_vertical_summary;
NOTIFY pgrst;
