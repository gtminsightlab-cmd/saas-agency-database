-- 0007_agency_signal_domain_cutover.sql
-- Domain cutover: agencysignal.co → agencysignal.io (2026-05-27)
--
-- Migration 0003 seeded the products row with domain='agencysignal.co' on
-- initial install. Updating the seed value in 0003 covers fresh installs
-- only — Supabase tracks 0003 as already applied to production, so 0003 is
-- not re-run. This migration applies the cutover to the existing row.
--
-- Idempotent: only updates if the current value is still on the legacy
-- domain. Safe to re-run.
--
-- See: DECISION_LOG D-NNN (domain cutover 2026-05-27), next.config.mjs 301
-- redirect chain (directory.seven16group.com + agencysignal.co → .io).
update public.products
   set domain     = 'agencysignal.io',
       updated_at = now()
 where id = 'agency_signal'
   and domain in ('agencysignal.co', 'directory.seven16group.com');
