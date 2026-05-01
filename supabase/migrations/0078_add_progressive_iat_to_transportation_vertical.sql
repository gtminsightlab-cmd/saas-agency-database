-- Add Progressive Specialty and IAT Insurance Group to the Transportation
-- vertical so the /verticals card click + clickable filter picks them up.
-- Both are major trucking specialty writers; including them grows the
-- Transportation signal materially.

INSERT INTO public.carrier_verticals (vertical_id, carrier_id, note)
VALUES
  ('f890aa2b-5c9b-4dc7-b26a-3387e3b6fa1a',
   '42a0c0ef-ab70-4027-870a-e0622b5c2011',
   'added 2026-04-27 — Progressive Specialty (commercial trucking arm)'),
  ('f890aa2b-5c9b-4dc7-b26a-3387e3b6fa1a',
   '8a5a15c5-969d-4f0e-be8c-c97085b7dde3',
   'added 2026-04-27 — IAT Insurance Group (parent of Harco / Occidental)')
ON CONFLICT (vertical_id, carrier_id) DO NOTHING;

-- Refresh the materialized view that powers the /verticals card counts
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_vertical_summary;
