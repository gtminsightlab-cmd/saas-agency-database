-- Bulk-map carriers to the 8 new verticals using Master O's reference grid.
-- Each parent-company keyword is matched (case-insensitive) against the
-- carriers table on name OR group_name. Default weight = 5; existing
-- transportation/healthcare/construction/agriculture mappings unchanged.
-- ON CONFLICT DO NOTHING guards against re-running.
--
-- KNOWN LIMITATION: this auto-map is intentionally generous — it pulls
-- every subsidiary of named parent groups (e.g., Berkshire's 14 rows
-- including GEICO/MedPro). Result: new verticals show 6k–8k agencies
-- with exposure vs the curated 31–603 on the original four. Treat as
-- v1 baseline; refine via /admin/verticals/<slug>/manager to remove
-- universal P&C carriers and keep only true vertical specialists.

WITH map(slug, kw) AS (VALUES
  ('public-entity', 'tokio marine'), ('public-entity', 'munich re'), ('public-entity', 'crum'),
  ('public-entity', 'berkley'), ('public-entity', 'amtrust'), ('public-entity', 'markel'),
  ('public-entity', 'liberty mutual'), ('public-entity', 'travelers'), ('public-entity', 'hartford'),
  ('public-entity', 'zurich'), ('public-entity', 'arch insurance'),
  ('real-estate', 'aig'), ('real-estate', 'american international'),
  ('real-estate', 'chubb'), ('real-estate', 'travelers'),
  ('real-estate', 'liberty mutual'), ('real-estate', 'hartford'),
  ('real-estate', 'cna '), ('real-estate', 'arch insurance'),
  ('real-estate', 'zurich'), ('real-estate', 'assurant'), ('real-estate', 'berkley'),
  ('hospitality', 'tokio marine'), ('hospitality', 'berkshire'),
  ('hospitality', 'chubb'), ('hospitality', 'travelers'),
  ('hospitality', 'liberty mutual'), ('hospitality', 'markel'),
  ('hospitality', 'zurich'), ('hospitality', 'allianz'),
  ('hospitality', 'hanover'), ('hospitality', 'society insurance'), ('hospitality', 'cna '),
  ('manufacturing', 'chubb'), ('manufacturing', 'travelers'),
  ('manufacturing', 'liberty mutual'), ('manufacturing', 'cna '),
  ('manufacturing', 'zurich'), ('manufacturing', 'hartford'),
  ('manufacturing', 'navigators'), ('manufacturing', 'berkley'),
  ('manufacturing', 'fm global'), ('manufacturing', 'aig'), ('manufacturing', 'american international'),
  ('technology-cyber', 'beazley'), ('technology-cyber', 'hiscox'),
  ('technology-cyber', 'axis '), ('technology-cyber', 'coalition'),
  ('technology-cyber', 'chubb'), ('technology-cyber', 'aig'),
  ('technology-cyber', 'american international'), ('technology-cyber', 'zurich'),
  ('technology-cyber', 'travelers'), ('technology-cyber', 'tokio marine'),
  ('technology-cyber', 'cna '), ('technology-cyber', 'munich re'),
  ('energy-oil-gas', 'aig'), ('energy-oil-gas', 'american international'),
  ('energy-oil-gas', 'chubb'), ('energy-oil-gas', 'zurich'),
  ('energy-oil-gas', 'liberty mutual'), ('energy-oil-gas', 'axa '),
  ('energy-oil-gas', 'axa xl'), ('energy-oil-gas', 'allianz'),
  ('energy-oil-gas', 'travelers'), ('energy-oil-gas', 'cna '),
  ('energy-oil-gas', 'tokio marine'), ('energy-oil-gas', 'berkley'), ('energy-oil-gas', 'sompo'),
  ('retail-wholesale', 'travelers'), ('retail-wholesale', 'hartford'),
  ('retail-wholesale', 'liberty mutual'), ('retail-wholesale', 'chubb'),
  ('retail-wholesale', 'zurich'), ('retail-wholesale', 'cna '),
  ('retail-wholesale', 'hanover'), ('retail-wholesale', 'markel'), ('retail-wholesale', 'amtrust'),
  ('professional-services', 'zurich'), ('professional-services', 'axis '),
  ('professional-services', 'markel'), ('professional-services', 'berkley'),
  ('professional-services', 'hiscox'), ('professional-services', 'chubb'),
  ('professional-services', 'aig'), ('professional-services', 'american international'),
  ('professional-services', 'cna '), ('professional-services', 'travelers'),
  ('professional-services', 'tokio marine'), ('professional-services', 'medical protective')
)
INSERT INTO public.carrier_verticals (vertical_id, carrier_id, weight, note)
SELECT vm.id, c.id, 5, 'auto-mapped from Master O grid 2026-04-25'
FROM map m
JOIN public.vertical_markets vm ON vm.slug = m.slug
JOIN public.carriers c
  ON c.active
  AND (lower(c.name) ILIKE '%' || m.kw || '%' OR lower(c.group_name) ILIKE '%' || m.kw || '%')
ON CONFLICT (vertical_id, carrier_id) DO NOTHING;

REFRESH MATERIALIZED VIEW public.mv_vertical_summary;
NOTIFY pgrst;
