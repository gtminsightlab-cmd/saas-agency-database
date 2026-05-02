-- 0006_platform_seed_more_products.sql
-- seven16-platform — register the three additional products in the family per
-- 2026-05-02 master plan update (D-009, D-010):
--   threshold_iq      — third platform product (MGU/wholesaler operating CRM)
--   growtheon         — standalone-capable white-label CRM add-on
--   seven16recruit    — standalone-capable AI recruiting + lead-gen add-on
--
-- No plans seeded yet — pricing for these three is pending family-strategy
-- integration sessions (per master plan §2 "Pricing pending").

insert into public.products (id, name, domain, is_active) values
  ('threshold_iq',   'Threshold IQ',     'thresholdiq.io', true),
  ('growtheon',      'Growtheon',        null,             true),
  ('seven16recruit', 'Seven16Recruit',   null,             false)  -- stealth, attorney-gated
on conflict (id) do update set
  name       = excluded.name,
  domain     = excluded.domain,
  is_active  = excluded.is_active,
  updated_at = now();
