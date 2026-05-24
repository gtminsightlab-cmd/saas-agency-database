-- Tier-1 critical-tables smoke check
--
-- Run this against any restored / branched Supabase project to verify the
-- recovery captured the customer-irreplaceable rows.
--
-- Usage (Supabase SQL Editor or psql):
--   \i scripts/data-safety/verify-critical-tables.sql
--
-- Compare the row-count + recent-row output against the same query run on
-- production. Drift = something is wrong with the recovery.
--
-- This is a READ-ONLY script. No DDL / DML. Safe to run on production.

-- 1) Row counts across all Tier-1 tables
SELECT 'tenants' AS table_name, COUNT(*) AS row_count FROM public.tenants
UNION ALL SELECT 'app_users', COUNT(*) FROM public.app_users
UNION ALL SELECT 'stripe_customers', COUNT(*) FROM public.stripe_customers
UNION ALL SELECT 'billing_plans', COUNT(*) FROM public.billing_plans
UNION ALL SELECT 'user_entitlements', COUNT(*) FROM public.user_entitlements
UNION ALL SELECT 'credit_wallets', COUNT(*) FROM public.credit_wallets
UNION ALL SELECT 'credit_ledger', COUNT(*) FROM public.credit_ledger
UNION ALL SELECT 'usage_logs', COUNT(*) FROM public.usage_logs
UNION ALL SELECT 'downloads_ledger', COUNT(*) FROM public.downloads_ledger
UNION ALL SELECT 'saved_lists', COUNT(*) FROM public.saved_lists
UNION ALL SELECT 'saved_list_snapshots', COUNT(*) FROM public.saved_list_snapshots
UNION ALL SELECT 'saved_list_changes', COUNT(*) FROM public.saved_list_changes
UNION ALL SELECT 'distribution_expander_segments', COUNT(*) FROM public.distribution_expander_segments
UNION ALL SELECT 'top_agency_lists', COUNT(*) FROM public.top_agency_lists
UNION ALL SELECT 'top_agency_members', COUNT(*) FROM public.top_agency_members
UNION ALL SELECT 'audit_log', COUNT(*) FROM public.audit_log
UNION ALL SELECT 'tenant_limits', COUNT(*) FROM public.tenant_limits
UNION ALL SELECT 'feature_flags', COUNT(*) FROM public.feature_flags
UNION ALL SELECT 'hygiene_events', COUNT(*) FROM public.hygiene_events
UNION ALL SELECT 'saved_list_hygiene_flags', COUNT(*) FROM public.saved_list_hygiene_flags
ORDER BY table_name;

-- 2) Latest audit-log entry (the audit-trail is trigger-populated for every
--    mutation on high-value tables, so the most-recent row tells you exactly
--    how fresh the data is)
SELECT
  created_at,
  actor_user_id,
  table_name,
  action,
  record_id
FROM public.audit_log
ORDER BY created_at DESC
LIMIT 5;

-- 3) Tenant + user counts side-by-side (sanity check: no orphan users without
--    a tenant; no tenant without at least one user)
SELECT
  t.id AS tenant_id,
  t.name AS tenant_name,
  t.plan,
  (SELECT COUNT(*) FROM public.app_users u WHERE u.tenant_id = t.id) AS user_count
FROM public.tenants t
ORDER BY t.id;

-- 4) Billing surface — entitlements + wallets + Stripe linkage
SELECT
  u.id AS user_id,
  u.email,
  e.plan_id,
  e.status AS entitlement_status,
  w.balance AS credit_balance,
  sc.stripe_customer_id
FROM public.app_users u
LEFT JOIN public.user_entitlements e ON e.user_id = u.id
LEFT JOIN public.credit_wallets w ON w.user_id = u.id
LEFT JOIN public.stripe_customers sc ON sc.user_id = u.id
ORDER BY u.id;
