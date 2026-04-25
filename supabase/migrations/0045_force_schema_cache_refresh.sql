-- 0045: Force PostgREST schema cache refresh
-- (Hosted Supabase NOTIFY can be flaky — pair with PATCH /v1/projects/{ref}/postgrest)
SELECT pg_notify('pgrst', 'reload schema');
