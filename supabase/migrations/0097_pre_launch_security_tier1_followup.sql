-- =============================================================================
-- Pre-launch security Tier 1 — Agency Signal (PART 2 of 2)
-- =============================================================================
-- Companion to 0096_pre_launch_security_tier1.sql.
--
-- The 0096 migration applied the dotintel2-pattern "REVOKE FROM PUBLIC" recipe
-- per family memory feedback_supabase_anon_security_definer_default_revoke.md.
-- That works when SECURITY DEFINER functions get their anon EXECUTE via the
-- Postgres default PUBLIC inheritance (DOT Intel's pattern).
--
-- Agency Signal exposed a DIFFERENT pattern: the 43 SECURITY DEFINER fns
-- have DIRECT `anon=X/postgres` + `authenticated=X/postgres` entries in
-- pg_proc.proacl. REVOKE FROM PUBLIC is a no-op against direct grants. The
-- correct lockdown for direct grants is explicit per-role REVOKE.
--
-- This migration does the actual lockdown:
--   - REVOKE EXECUTE FROM anon on all 43 fns (drops the direct anon grant)
--   - REVOKE EXECUTE FROM authenticated on the 15 Tier A + Tier B fns
--     (triggers + admin/cron — service_role retains via owner; Tier C
--     functions keep authenticated EXECUTE for app code)
--
-- Family memory update queued: extend feedback_supabase_anon_security_definer_default_revoke.md
-- to cover both patterns. New title: "SECURITY DEFINER anon lockdown — TWO
-- patterns (PUBLIC inheritance + direct grant); both need explicit REVOKE."
--
-- Verify pattern with: `select proacl::text from pg_proc where proname='<fn>'`
-- - `{postgres=X/postgres}` = inherited from PUBLIC (DOT Intel case; use 0096 recipe)
-- - `{postgres=X/postgres,anon=X/postgres,...}` = direct grants (this case; use 0097 recipe)
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. All 43 fns — REVOKE EXECUTE FROM anon (drops direct anon grant)
-- ---------------------------------------------------------------------------

revoke execute on function public.count_contacts_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text) from anon;
revoke execute on function public.current_app_user()                                          from anon;
revoke execute on function public.current_tenant_id()                                         from anon;
revoke execute on function public.current_user_role()                                         from anon;
revoke execute on function public.enforce_usage(usage_metric, integer, jsonb)                 from anon;
revoke execute on function public.find_duplicate_affiliations(integer)                        from anon;
revoke execute on function public.find_duplicate_agencies(integer)                            from anon;
revoke execute on function public.find_duplicate_carriers(integer)                            from anon;
revoke execute on function public.fn_audit_trigger()                                          from anon;
revoke execute on function public.fn_audit_trigger_text_pk()                                  from anon;
revoke execute on function public.fn_auto_provision_app_user()                                from anon;
revoke execute on function public.fn_block_inactive_account_type()                            from anon;
revoke execute on function public.fn_feature_flags_touch_updated_at()                         from anon;
revoke execute on function public.fn_guard_company_email_signup()                             from anon;
revoke execute on function public.fn_tenant_limits_touch_updated_at()                         from anon;
revoke execute on function public.get_all_active_carriers_with_counts()                       from anon;
revoke execute on function public.get_carrier_analytics_kpis()                                from anon;
revoke execute on function public.get_carriers_by_min_agency_count(integer)                   from anon;
revoke execute on function public.get_effective_limits(uuid)                                  from anon;
revoke execute on function public.get_my_recent_searches(integer)                             from anon;
revoke execute on function public.get_my_seat_info()                                          from anon;
revoke execute on function public.get_my_usage_summary()                                      from anon;
revoke execute on function public.get_save_summary_counts(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text) from anon;
revoke execute on function public.get_saved_list_entity_ids(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text) from anon;
revoke execute on function public.get_system_health()                                         from anon;
revoke execute on function public.get_top_carriers_by_agency_count(integer)                   from anon;
revoke execute on function public.get_vertical_carriers_with_segments(text)                   from anon;
revoke execute on function public.get_vertical_summary()                                      from anon;
revoke execute on function public.import_trucking_accounts(jsonb)                             from anon;
revoke execute on function public.import_trucking_appointments(jsonb)                         from anon;
revoke execute on function public.import_trucking_contacts(jsonb)                             from anon;
revoke execute on function public.invite_team_member(text, text)                              from anon;
revoke execute on function public.is_feature_enabled(text)                                    from anon;
revoke execute on function public.is_super_admin()                                            from anon;
revoke execute on function public.link_app_user_on_auth()                                     from anon;
revoke execute on function public.list_carriers_with_appointments()                           from anon;
revoke execute on function public.list_my_team()                                              from anon;
revoke execute on function public.log_admin_action(text, text, uuid, jsonb, jsonb, jsonb)     from anon;
revoke execute on function public.refresh_vertical_summary()                                  from anon;
revoke execute on function public.revoke_invite(uuid)                                         from anon;
revoke execute on function public.scan_watermark_canaries()                                   from anon;
revoke execute on function public.search_agencies_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text, text, text, integer, integer) from anon;
revoke execute on function public.search_contacts_for_filters(uuid[], uuid[], uuid[], uuid[], uuid[], uuid[], text[], text, numeric, numeric, numeric, numeric, integer, integer, boolean, text, text, text, text, integer, integer) from anon;

-- ---------------------------------------------------------------------------
-- 2. Tier A (8 trigger fns) + Tier B (7 admin/cron fns) — REVOKE FROM authenticated
-- ---------------------------------------------------------------------------
-- Triggers fire from table-level events (no role context needed). Admin/cron
-- fns are called from service_role contexts. Neither should be callable by
-- authenticated. service_role retains via owner.

-- Tier A: 8 trigger functions
revoke execute on function public.fn_audit_trigger()                                          from authenticated;
revoke execute on function public.fn_audit_trigger_text_pk()                                  from authenticated;
revoke execute on function public.fn_auto_provision_app_user()                                from authenticated;
revoke execute on function public.fn_block_inactive_account_type()                            from authenticated;
revoke execute on function public.fn_feature_flags_touch_updated_at()                         from authenticated;
revoke execute on function public.fn_guard_company_email_signup()                             from authenticated;
revoke execute on function public.fn_tenant_limits_touch_updated_at()                         from authenticated;
revoke execute on function public.link_app_user_on_auth()                                     from authenticated;

-- Tier B: 7 admin/cron functions
revoke execute on function public.find_duplicate_affiliations(integer)                        from authenticated;
revoke execute on function public.find_duplicate_agencies(integer)                            from authenticated;
revoke execute on function public.find_duplicate_carriers(integer)                            from authenticated;
revoke execute on function public.get_system_health()                                         from authenticated;
revoke execute on function public.log_admin_action(text, text, uuid, jsonb, jsonb, jsonb)     from authenticated;
revoke execute on function public.refresh_vertical_summary()                                  from authenticated;
revoke execute on function public.scan_watermark_canaries()                                   from authenticated;

commit;
