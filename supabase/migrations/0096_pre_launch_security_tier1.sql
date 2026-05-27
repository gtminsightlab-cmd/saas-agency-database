-- =============================================================================
-- Pre-launch security Tier 1 — Agency Signal (PART 1 of 2)
-- =============================================================================
-- Companion to:
--   * docs/security/agency-signal-tier1-audit.md (Phase 1 punch list)
--   * supabase/migrations/0097_pre_launch_security_tier1_followup.sql (PART 2)
-- Reference: dotintel2/supabase/migrations/20260603_pre_launch_security_tier1.sql
-- Doctrine:  reference_family_supabase_security_baseline.md (4-tier RLS recipe)
--            feedback_supabase_anon_security_definer_default_revoke.md (PUBLIC + direct-grant patterns)
--
-- Scope: address pre-launch advisor findings before charter outreach scales.
-- Audit baseline (run 2026-05-26 in SESSION_39):
--   * 0 ERROR / 90 WARN / 1 INFO
--   * 43 SECURITY DEFINER functions with anon EXECUTE
--   * 2 ax_staging tables without RLS
--   * 0 function_search_path_mutable findings — all DEFINER fns already set
--
-- ⚠️ This migration is INCOMPLETE on its own. It applies the family-memory
-- "PUBLIC inheritance" recipe (REVOKE FROM PUBLIC + GRANT TO authenticated).
-- On Agency Signal that turned out to be a no-op — the functions have DIRECT
-- `anon=X/postgres` + `authenticated=X/postgres` ACLs in pg_proc.proacl,
-- not inherited from PUBLIC. The followup migration 0097 does the actual
-- lockdown (REVOKE FROM anon + REVOKE FROM authenticated for Tier A/B).
--
-- Why keep this file: matches the chronological migration journey applied
-- to sdlsdovuljuymgymarou in S39. Both files are idempotent — replaying
-- against a fresh DB lands the correct end state.
--
-- Sections:
--   1. ENABLE + FORCE RLS on 2 ax_staging tables (effective)
--   2. Tier A — 8 trigger fns: REVOKE EXECUTE FROM PUBLIC (no-op; see 0097)
--   3. Tier B — 7 admin/cron fns: REVOKE EXECUTE FROM PUBLIC (no-op; see 0097)
--   4. Tier C — 28 auth-only fns: REVOKE EXECUTE FROM PUBLIC + GRANT TO authenticated
--      (REVOKE is no-op; GRANT is no-op since auth was already granted directly)
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. ax_staging RLS — defense-in-depth
-- ---------------------------------------------------------------------------
-- Currently anon + auth lack SELECT grants on ax_staging schema (it's not in
-- PostgREST's db_schemas allowlist). But if anyone ever adds ax_staging to
-- db_schemas, these 2 tables become publicly readable with zero RLS guard.
-- Force RLS now to close that latent vector. No policies needed — default-deny
-- is correct for staging tables (only service_role reads/writes).

alter table ax_staging.agency_assignments     enable row level security;
alter table ax_staging.agency_assignments     force  row level security;
alter table ax_staging.agency_assignments_idx enable row level security;
alter table ax_staging.agency_assignments_idx force  row level security;

-- ---------------------------------------------------------------------------
-- 2. Tier A — 8 trigger functions
-- ---------------------------------------------------------------------------
-- These fire from table-level triggers, not from RPC. Revoke PUBLIC + don't
-- re-grant; service_role retains EXECUTE via owner.

revoke execute on function public.fn_audit_trigger()                  from public;
revoke execute on function public.fn_audit_trigger_text_pk()          from public;
revoke execute on function public.fn_auto_provision_app_user()        from public;
revoke execute on function public.fn_block_inactive_account_type()    from public;
revoke execute on function public.fn_feature_flags_touch_updated_at() from public;
revoke execute on function public.fn_guard_company_email_signup()     from public;
revoke execute on function public.fn_tenant_limits_touch_updated_at() from public;
revoke execute on function public.link_app_user_on_auth()             from public;

-- ---------------------------------------------------------------------------
-- 3. Tier B — 7 admin/cron functions
-- ---------------------------------------------------------------------------
-- Admin-only utilities. Called from service_role contexts (cron jobs, admin
-- panel server actions). Revoke PUBLIC + don't re-grant — admin server actions
-- use the service-role client which bypasses the EXECUTE grant.

revoke execute on function public.find_duplicate_affiliations(integer)                              from public;
revoke execute on function public.find_duplicate_agencies(integer)                                  from public;
revoke execute on function public.find_duplicate_carriers(integer)                                  from public;
revoke execute on function public.get_system_health()                                               from public;
revoke execute on function public.log_admin_action(text, text, uuid, jsonb, jsonb, jsonb)           from public;
revoke execute on function public.refresh_vertical_summary()                                        from public;
revoke execute on function public.scan_watermark_canaries()                                         from public;

-- ---------------------------------------------------------------------------
-- 4. Tier C — 28 authenticated-only functions
-- ---------------------------------------------------------------------------
-- REVOKE PUBLIC, then re-GRANT to authenticated. Used by app code with the
-- SSR Supabase client when the user has a session.

revoke execute on function public.count_contacts_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text) from public;
revoke execute on function public.current_app_user()                                                                                                                                                from public;
revoke execute on function public.current_tenant_id()                                                                                                                                               from public;
revoke execute on function public.current_user_role()                                                                                                                                               from public;
revoke execute on function public.enforce_usage(usage_metric, integer, jsonb)                                                                                                                       from public;
revoke execute on function public.get_all_active_carriers_with_counts()                                                                                                                             from public;
revoke execute on function public.get_carrier_analytics_kpis()                                                                                                                                      from public;
revoke execute on function public.get_carriers_by_min_agency_count(integer)                                                                                                                         from public;
revoke execute on function public.get_effective_limits(uuid)                                                                                                                                        from public;
revoke execute on function public.get_my_recent_searches(integer)                                                                                                                                   from public;
revoke execute on function public.get_my_seat_info()                                                                                                                                                from public;
revoke execute on function public.get_my_usage_summary()                                                                                                                                            from public;
revoke execute on function public.get_save_summary_counts(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text)  from public;
revoke execute on function public.get_saved_list_entity_ids(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text) from public;
revoke execute on function public.get_top_carriers_by_agency_count(integer)                                                                                                                         from public;
revoke execute on function public.get_vertical_carriers_with_segments(text)                                                                                                                         from public;
revoke execute on function public.get_vertical_summary()                                                                                                                                            from public;
revoke execute on function public.import_trucking_accounts(jsonb)                                                                                                                                   from public;
revoke execute on function public.import_trucking_appointments(jsonb)                                                                                                                               from public;
revoke execute on function public.import_trucking_contacts(jsonb)                                                                                                                                   from public;
revoke execute on function public.invite_team_member(text, text)                                                                                                                                    from public;
revoke execute on function public.is_feature_enabled(text)                                                                                                                                          from public;
revoke execute on function public.is_super_admin()                                                                                                                                                  from public;
revoke execute on function public.list_carriers_with_appointments()                                                                                                                                 from public;
revoke execute on function public.list_my_team()                                                                                                                                                    from public;
revoke execute on function public.revoke_invite(uuid)                                                                                                                                               from public;
revoke execute on function public.search_agencies_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text, text, text, integer, integer) from public;
revoke execute on function public.search_contacts_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text, text, text, integer, integer) from public;

-- Re-grant to authenticated (28 of 28)

grant execute on function public.count_contacts_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text) to authenticated;
grant execute on function public.current_app_user()                                                                                                                                                to authenticated;
grant execute on function public.current_tenant_id()                                                                                                                                               to authenticated;
grant execute on function public.current_user_role()                                                                                                                                               to authenticated;
grant execute on function public.enforce_usage(usage_metric, integer, jsonb)                                                                                                                       to authenticated;
grant execute on function public.get_all_active_carriers_with_counts()                                                                                                                             to authenticated;
grant execute on function public.get_carrier_analytics_kpis()                                                                                                                                      to authenticated;
grant execute on function public.get_carriers_by_min_agency_count(integer)                                                                                                                         to authenticated;
grant execute on function public.get_effective_limits(uuid)                                                                                                                                        to authenticated;
grant execute on function public.get_my_recent_searches(integer)                                                                                                                                   to authenticated;
grant execute on function public.get_my_seat_info()                                                                                                                                                to authenticated;
grant execute on function public.get_my_usage_summary()                                                                                                                                            to authenticated;
grant execute on function public.get_save_summary_counts(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text)  to authenticated;
grant execute on function public.get_saved_list_entity_ids(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text) to authenticated;
grant execute on function public.get_top_carriers_by_agency_count(integer)                                                                                                                         to authenticated;
grant execute on function public.get_vertical_carriers_with_segments(text)                                                                                                                         to authenticated;
grant execute on function public.get_vertical_summary()                                                                                                                                            to authenticated;
grant execute on function public.import_trucking_accounts(jsonb)                                                                                                                                   to authenticated;
grant execute on function public.import_trucking_appointments(jsonb)                                                                                                                               to authenticated;
grant execute on function public.import_trucking_contacts(jsonb)                                                                                                                                   to authenticated;
grant execute on function public.invite_team_member(text, text)                                                                                                                                    to authenticated;
grant execute on function public.is_feature_enabled(text)                                                                                                                                          to authenticated;
grant execute on function public.is_super_admin()                                                                                                                                                  to authenticated;
grant execute on function public.list_carriers_with_appointments()                                                                                                                                 to authenticated;
grant execute on function public.list_my_team()                                                                                                                                                    to authenticated;
grant execute on function public.revoke_invite(uuid)                                                                                                                                               to authenticated;
grant execute on function public.search_agencies_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text, text, text, integer, integer) to authenticated;
grant execute on function public.search_contacts_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text, text, text, integer, integer) to authenticated;

commit;
