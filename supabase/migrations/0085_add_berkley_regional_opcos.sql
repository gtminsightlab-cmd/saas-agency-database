-- Add 3 Berkley regional operating units to public.carriers so the
-- DOT Intel sync can attach 950 carrier appointments (391+327+232) that
-- would otherwise be dropped on the floor.
--
-- Group name follows the existing pattern for Berkley OpCos (see Berkley
-- National Insurance Company / Berkley Regional Insurance Company etc.):
-- group_name = 'W. R. Berkley Insurance Group'.
--
-- Idempotent: ON CONFLICT DO NOTHING in case anyone added them in parallel.

insert into public.carriers (name, group_name, active) values
  ('Berkley Southwest',     'W. R. Berkley Insurance Group', true),
  ('Berkley Southeast',     'W. R. Berkley Insurance Group', true),
  ('Berkley Mid-Atlantic',  'W. R. Berkley Insurance Group', true)
on conflict do nothing;
