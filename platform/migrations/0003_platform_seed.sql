-- 0003_platform_seed.sql
-- seven16-platform — seed products + plans (locked pricing per DECISION_LOG.md §2)
-- Idempotent via ON CONFLICT.

-- Products
insert into public.products (id, name, domain, is_active) values
  ('agency_signal', 'Agency Signal', 'agencysignal.co', true),
  ('dot_intel',     'DOT Intel',     'dotintel.io',     true)
on conflict (id) do update set
  name      = excluded.name,
  domain    = excluded.domain,
  is_active = excluded.is_active,
  updated_at = now();

-- Plans
-- monthly_price_cents = null for free tiers and "$N+" enterprise tiers (custom sales)
-- stripe_price_id = null until Stripe is wired
insert into public.plans (id, product_id, display_name, monthly_price_cents, is_active, metadata) values
  -- Agency Signal tiers
  ('agency_signal_free',       'agency_signal', 'Free',                null,  true, '{"tier_rank": 0}'::jsonb),
  ('agency_signal_producer',   'agency_signal', 'Producer ($19/mo)',   1900,  true, '{"tier_rank": 1, "is_mission_tier": true}'::jsonb),
  ('agency_signal_growth',     'agency_signal', 'Growth ($99/mo)',     9900,  true, '{"tier_rank": 2}'::jsonb),
  ('agency_signal_enterprise', 'agency_signal', 'Enterprise ($399+/mo)', null, true, '{"tier_rank": 3, "custom_pricing": true, "floor_cents": 39900}'::jsonb),

  -- DOT Intel tiers
  ('dot_intel_free',       'dot_intel', 'Free',                null,   true, '{"tier_rank": 0}'::jsonb),
  ('dot_intel_pro',        'dot_intel', 'Pro ($29/mo)',        2900,   true, '{"tier_rank": 1}'::jsonb),
  ('dot_intel_business',   'dot_intel', 'Business ($149/mo)',  14900,  true, '{"tier_rank": 2}'::jsonb),
  ('dot_intel_enterprise', 'dot_intel', 'Enterprise ($499+/mo)', null, true, '{"tier_rank": 3, "custom_pricing": true, "floor_cents": 49900}'::jsonb),

  -- Cross-product 2027 bundle (D-005)
  ('seven16_intelligence_bundle', null, 'Seven16 Intelligence Bundle ($179/mo)', 17900, true,
   '{"is_bundle": true, "includes": ["dot_intel_business","agency_signal_growth"], "available_from": "2027-01-01"}'::jsonb)
on conflict (id) do update set
  product_id          = excluded.product_id,
  display_name        = excluded.display_name,
  monthly_price_cents = excluded.monthly_price_cents,
  is_active           = excluded.is_active,
  metadata            = excluded.metadata,
  updated_at          = now();
