-- IAT Insurance Group is referenced in the trucking master upload but has
-- no top-level row in public.carriers. Sub-brands Harco and Occidental Fire
-- & Casualty Company are present and now get IAT as their group_name.
INSERT INTO public.carriers (name, group_name, active)
VALUES ('IAT Insurance Group', 'IAT Insurance Group', true)
ON CONFLICT DO NOTHING;

UPDATE public.carriers
SET group_name = 'IAT Insurance Group'
WHERE name IN ('Harco', 'Occidental Fire & Casualty Company');
