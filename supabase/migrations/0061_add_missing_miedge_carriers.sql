-- Migration 0061: add 5 carriers that exist in MiEdge data but not in
-- public.carriers. WCF Mutual is already represented as "WCF Insurance" so
-- it gets aliased at the loader level, no insert needed.
INSERT INTO public.carriers (name, group_name, active) VALUES
  ('Alaska National Insurance Company', 'Alaska National Insurance Company', true),
  ('Bridgefield Casualty Insurance Company', 'Employers Holdings', true),
  ('Pharmacists Mutual Insurance Company', 'Pharmacists Mutual Insurance Company', true),
  ('Star Insurance Company', 'AmeriTrust Group', true),
  ('StarStone Specialty Insurance Company', 'Core Specialty Insurance', true)
ON CONFLICT DO NOTHING;
