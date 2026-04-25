/**
 * Snapshot of Supabase advisor lints, captured during build of /admin/system-health.
 *
 * The live Supabase Management API requires a personal-access token (SUPABASE_ACCESS_TOKEN)
 * which isn't currently set in Vercel env. Until it is, this snapshot is the most
 * accurate non-live view available. Refresh by re-running `get_advisors` and updating
 * the timestamp + counts here, then commit.
 *
 * Live source of truth: https://supabase.com/dashboard/project/sdlsdovuljuymgymarou/advisors
 */

export type AdvisorLint = {
  name: string;
  title: string;
  level: "ERROR" | "WARN" | "INFO";
  category: "security" | "performance";
  detail: string;
  remediation: string;
};

export const ADVISORS_SNAPSHOT = {
  fetched_at: "2026-04-25T16:08:00Z",
  source: "Supabase advisors via MCP at session 8",
  security: [
    {
      name: "security_definer_view",
      title: "Security Definer View",
      level: "ERROR",
      category: "security",
      detail: "View `public.v_dataset_counts` is defined with the SECURITY DEFINER property",
      remediation: "https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view",
    },
    {
      name: "function_search_path_mutable",
      title: "Function Search Path Mutable",
      level: "WARN",
      category: "security",
      detail: "Function `public.fn_block_inactive_account_type` has a role mutable search_path",
      remediation: "https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable",
    },
    {
      name: "materialized_view_in_api",
      title: "Materialized View in API",
      level: "WARN",
      category: "security",
      detail: "Materialized view `public.mv_dataset_counts` is selectable by anon or authenticated roles",
      remediation: "https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api",
    },
    {
      name: "materialized_view_in_api",
      title: "Materialized View in API",
      level: "WARN",
      category: "security",
      detail: "Materialized view `public.mv_vertical_summary` is selectable by anon or authenticated roles",
      remediation: "https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api",
    },
    {
      name: "auth_leaked_password_protection",
      title: "Leaked Password Protection Disabled",
      level: "WARN",
      category: "security",
      detail: "Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org. Enable this feature to enhance security.",
      remediation: "https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection",
    },
  ] as AdvisorLint[],
  performance: [
    {
      name: "unindexed_foreign_keys",
      title: "Unindexed foreign keys",
      level: "INFO",
      category: "performance",
      detail: "5 tables have FK constraints without covering indexes (agencies.location_type_id, credit_ledger.saved_list_id, downloads_ledger.saved_list_id, saved_list_hygiene_flags.hygiene_event_id, user_entitlements.plan_id)",
      remediation: "https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys",
    },
    {
      name: "unused_index",
      title: "Unused indexes",
      level: "INFO",
      category: "performance",
      detail: "20 indexes have never been used and are candidates for removal (top_agency_members_list_idx, app_users_tenant_idx, usage_logs_*, agencies_name_tsv_idx, contacts_name_tsv_idx, etc).",
      remediation: "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    },
    {
      name: "multiple_permissive_policies",
      title: "Multiple Permissive Policies",
      level: "WARN",
      category: "performance",
      detail: "Tables `carrier_verticals` and `vertical_markets` each have multiple permissive SELECT policies for the authenticated role. Each policy runs on every query.",
      remediation: "https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies",
    },
    {
      name: "auth_db_connections_absolute",
      title: "Auth DB Connections Absolute",
      level: "INFO",
      category: "performance",
      detail: "Auth server is configured with at most 10 connections (absolute). Switching to percentage strategy lets it scale with instance size.",
      remediation: "https://supabase.com/docs/guides/deployment/going-into-prod",
    },
  ] as AdvisorLint[],
};

export type AdvisorSummary = {
  total: number;
  errors: number;
  warns: number;
  infos: number;
};

export function summarizeAdvisors(lints: AdvisorLint[]): AdvisorSummary {
  return {
    total:  lints.length,
    errors: lints.filter((l) => l.level === "ERROR").length,
    warns:  lints.filter((l) => l.level === "WARN").length,
    infos:  lints.filter((l) => l.level === "INFO").length,
  };
}
