# Agency Signal — Tier 1 security audit (Phase 1 read-only inventory)

**Audit date:** 2026-05-26
**Auditor:** Claude session in dotintel2 working dir (cross-product MCP audit per [`reference_family_supabase_security_baseline.md`](C:/Users/GTMin/.claude/projects/C--Users-GTMin-Projects-saas-agency-database/memory/reference_family_supabase_security_baseline.md))
**Supabase project:** `sdlsdovuljuymgymarou` (us-east-2, Pro)
**Reference implementation:** [`dotintel2/supabase/migrations/20260603_pre_launch_security_tier1.sql`](../../../dotintel2/supabase/migrations/20260603_pre_launch_security_tier1.sql) + `_tier2.sql`

> This file is a **session-prep punch list** — apply the migration in a dedicated `saas-agency-database` session. Do NOT execute from any other working dir.

---

## Headline findings

| Finding | Count | Severity | Status |
|---|---|---|---|
| Tables with RLS **disabled entirely** | **2** in `ax_staging` | 🔴 Doctrine violation (defense-in-depth) | Not currently exposed via PostgREST (anon+auth lack SELECT grants), but RLS must still be on |
| `SECURITY DEFINER` functions anon-callable | **43** (+ 2 auth-only) | 🟠 Likely most are unintentional via the PUBLIC-inheritance gotcha | Lock down per family pattern |
| Tables with RLS on but 0 policies | 1 (`public._trucking_load_log`) | 🟢 Default-deny — fine | Confirm intent, document |

**Comparison to DOT Intel reference run:**
- DOT Intel: 1 ERROR · 86 WARN → 0 ERROR · 47 WARN after migration
- Agency Signal: larger SECURITY DEFINER surface (45 vs DOT Intel's 30) but no `security_definer_view` ERROR caught at table-RLS audit; full advisor scan pending in session

---

## 1. ax_staging tables without RLS (HIGH PRIORITY — defense-in-depth)

| Table | Rows | anon SELECT | auth SELECT |
|---|---|---|---|
| `ax_staging.agency_assignments` | 16,785 | ❌ false | ❌ false |
| `ax_staging.agency_assignments_idx` | 16,785 | ❌ false | ❌ false |

**Why it matters even though not currently exposed:** the `ax_staging` schema is not in PostgREST's `db_schemas` per family doctrine ([`feedback_supabase_nonpublic_schema_exposure.md`](C:/Users/GTMin/.claude/projects/C--Users-GTMin-Projects-saas-agency-database/memory/feedback_supabase_nonpublic_schema_exposure.md)). But if anyone ever adds `ax_staging` to `db_schemas` (intentionally or by accident), these tables become publicly readable with zero RLS guard. Forcing RLS now closes that latent vector.

**Other `ax_staging.*` tables already have RLS on + forced** (`appointment_loads`, `appointment_load_pages`, `appointment_rows_rejected`, `appointments_raw`, `appointments_resolved`) — just these 2 missed the pattern.

**Fix:** `ALTER TABLE ... ENABLE ROW LEVEL SECURITY; ALTER TABLE ... FORCE ROW LEVEL SECURITY;` on both. No policies needed — default-deny is correct for staging tables (only `service_role` writes/reads).

---

## 2. SECURITY DEFINER function lockdown (43 anon-callable functions)

Apply the **Postgres PUBLIC-inheritance pattern** (see [`feedback_supabase_anon_security_definer_default_revoke.md`](C:/Users/GTMin/.claude/projects/C--Users-GTMin-Projects-saas-agency-database/memory/feedback_supabase_anon_security_definer_default_revoke.md)) — `REVOKE FROM PUBLIC` then re-`GRANT` to specific roles.

### Classification (all under `public` schema)

**Tier A — Triggers (revoke from PUBLIC; no re-grant; fired by table events, not user calls):**
- `fn_audit_trigger`
- `fn_audit_trigger_text_pk`
- `fn_auto_provision_app_user`
- `fn_block_inactive_account_type`
- `fn_feature_flags_touch_updated_at`
- `fn_guard_company_email_signup`
- `fn_tenant_limits_touch_updated_at`
- `link_app_user_on_auth`

**Tier B — Admin / cron only (revoke from PUBLIC; service_role retains via owner):**
- `find_duplicate_affiliations(integer)`
- `find_duplicate_agencies(integer)`
- `find_duplicate_carriers(integer)`
- `get_system_health()`
- `log_admin_action(text, text, uuid, jsonb, jsonb, jsonb)`
- `refresh_vertical_summary()`
- `scan_watermark_canaries()`

**Tier C — Authenticated users only (revoke from PUBLIC; re-grant to `authenticated`):**
- `count_contacts_for_filters(...)`
- `current_app_user()`
- `current_tenant_id()`
- `current_user_role()`
- `enforce_usage(usage_metric, integer, jsonb)`
- `get_all_active_carriers_with_counts()`
- `get_carrier_analytics_kpis()`
- `get_carriers_by_min_agency_count(integer)`
- `get_effective_limits(uuid)`
- `get_my_recent_searches(integer)`
- `get_my_seat_info()`
- `get_my_usage_summary()`
- `get_save_summary_counts(...)`
- `get_saved_list_entity_ids(...)`
- `get_top_carriers_by_agency_count(integer)`
- `get_vertical_carriers_with_segments(text)`
- `get_vertical_summary()`
- `import_trucking_accounts(jsonb)`
- `import_trucking_appointments(jsonb)`
- `import_trucking_contacts(jsonb)`
- `invite_team_member(text, text)`
- `is_feature_enabled(text)`
- `is_super_admin()`
- `list_carriers_with_appointments()`
- `list_my_team()`
- `revoke_invite(uuid)`
- `search_agencies_for_filters(...)`
- `search_contacts_for_filters(...)`

**Already auth-only (no anon, no change needed):**
- `staging_finalize_appointment_load(uuid, integer, text, text)`
- `staging_insert_appointment_rows(uuid, integer, integer, jsonb)`

### Genuinely anon-callable surfaces

Unlike DOT Intel (8 anon-public RPCs for the free DOT lookup teaser + public directory), Agency Signal is a paid product with **no anon-facing read RPCs**. Provisionally: **revoke anon EXECUTE on ALL 43 functions.**

**Before applying:** grep `saas-agency-database/src/app/api/` and any landing-page server actions for `.rpc(` calls — confirm no anon route relies on any of the 43. Expected outcome: zero matches (or only signup-flow auth-triggered functions like `fn_auto_provision_app_user`, which are Tier A triggers anyway).

---

## 3. Other audits to run in-session

- `get_advisors(type: 'security')` — capture full lint inventory. DOT Intel's run was 107KB output (chunked via Agent); Agency Signal likely similar scale.
- Storage bucket review — what's in `storage.buckets`? Any public-listing policies?
- `function_search_path_mutable` warnings — pin search_path on any flagged.
- `rls_policy_always_true` warnings — confirm intent on any anon-INSERT lead-form / signup policy.
- Verify the in-flight `app_users.lookup_quota_used` migration + downloads + entitlement work isn't bypassed by any anon-callable function.

---

## 4. Draft migration outline

When the dedicated session opens, create:
**`saas-agency-database/supabase/migrations/<YYYYMMDD>_pre_launch_security_tier1.sql`**

Structure (mirrors dotintel2 reference):

```sql
-- Section 1: Enable + force RLS on the 2 ax_staging tables
alter table ax_staging.agency_assignments enable row level security;
alter table ax_staging.agency_assignments     force row level security;
alter table ax_staging.agency_assignments_idx enable row level security;
alter table ax_staging.agency_assignments_idx force row level security;

-- Section 2: Tier A + Tier B + Tier C — revoke PUBLIC on all 43
-- (one REVOKE per function with exact signature; Tier C re-grants to authenticated)
revoke execute on function public.fn_audit_trigger() from public;
-- ... (repeat for all 43)

grant execute on function public.count_contacts_for_filters(...) to authenticated;
-- ... (repeat for Tier C only — 28 functions)
```

Verify after with the same `has_function_privilege` pattern dotintel2 used.

---

## 5. Tier 2 follow-ups (after Tier 1 applies)

- Function `search_path` pin (after advisor run reveals which functions need it)
- Storage bucket review (likely Agency Signal has agency-photo / agency-logo buckets — confirm listing policy)
- Cloudflare Turnstile + Upstash Redis env vars in Vercel for any anon-INSERT endpoints
- Re-run `get_advisors` to verify ERROR=0 + counts dropped

---

## Open questions for next session

1. **Is there a signup-flow function that NEEDS anon EXECUTE?** Most likely candidates that aren't triggers: `is_feature_enabled` (for feature-gating the marketing site?), `current_tenant_id` (for unauthenticated tenant resolution?) — verify against actual API routes before revoking anon on these.
2. **Are `import_trucking_*` functions called only from authenticated server-side admin flows?** They take large `jsonb` payloads — revoke anon definitely; verify auth-only flow.
3. **Are there RPC call sites in `src/app/api/` that use `getServerSupabase()` (anon context) vs `getServiceRoleSupabase()`?** If anon-context calls exist that hit these RPCs, the revoke will 401 them — those need to be either re-keyed to service-role or have the route changed to require auth.

---

**Companion artifacts:**
- DOT Intel reference migration: `dotintel2/supabase/migrations/20260603_pre_launch_security_tier1.sql`
- DOT Intel Tier 2: `dotintel2/supabase/migrations/20260603_pre_launch_security_tier2.sql`
- Family memory recipe: `reference_family_supabase_security_baseline.md` (Phase 1-5)
- Postgres gotcha: `feedback_supabase_anon_security_definer_default_revoke.md`
