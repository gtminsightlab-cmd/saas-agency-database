-- Add 8 new industry verticals chosen by Master O. Empty shells — no carrier
-- mappings yet. Admin populates carriers via /admin/verticals/<slug>/manager.
-- icon_key values must match the ICONS map in app/verticals/page.tsx.

INSERT INTO public.vertical_markets (slug, name, description, icon_key, color_token, sort_order) VALUES
  ('public-entity',         'Public Entity, Government & Schools', 'Agencies writing cities, counties, school districts, transit authorities, and special public-entity pools — identified by appointments with public-entity-focused carriers.', 'Landmark',         'navy',    5),
  ('real-estate',           'Real Estate & Habitational',          'Agencies writing apartments, condos, HOAs, commercial property managers, and REITs — identified by appointments with habitational-specialty carriers.',                            'Building2',        'gold',    6),
  ('hospitality',           'Hospitality, Restaurants & Hotels',   'Agencies writing F&B liability, liquor liability, and hotel/lodging programs — identified by appointments with hospitality-specialty carriers.',                                  'UtensilsCrossed',  'brand',   7),
  ('manufacturing',         'Manufacturing',                       'Agencies writing manufacturers, industrial product liability, and supply-chain risk — identified by appointments with manufacturing-specialty carriers.',                          'Factory',          'navy',    8),
  ('technology-cyber',      'Technology & Cyber',                  'Agencies writing SaaS E&O, cyber liability, MSPs, and tech startup programs — identified by appointments with cyber/tech-specialty carriers.',                                    'Cpu',              'brand',   9),
  ('energy-oil-gas',        'Energy, Oil & Gas',                   'Agencies writing upstream/downstream oil & gas, oilfield services, pipeline, and renewables — identified by appointments with energy-specialty carriers.',                         'Zap',              'gold',   10),
  ('retail-wholesale',      'Retail & Wholesale Trade',            'Agencies writing storefront retail, e-commerce, distribution, and wholesale trade — identified by appointments with retail-program carriers.',                                     'ShoppingBag',      'success',11),
  ('professional-services', 'Professional Services',               'Agencies writing law / accounting / consulting / architects-and-engineers E&O — identified by appointments with professional-liability specialty carriers.',                       'Briefcase',        'navy',   12);

REFRESH MATERIALIZED VIEW public.mv_vertical_summary;
NOTIFY pgrst;
