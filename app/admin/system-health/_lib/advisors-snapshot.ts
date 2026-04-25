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
  fetched_at: "2026-04-25T16:35:00Z",
  source: "Supabase advisors via MCP at session 8 (post-cleanup mig 0038)",
  security: [
    {
      name: "materialized_view_in_api",
      title: "Materialized View in API (intentional)",
      level: "WARN",
      category: "security",
      detail:
        "Materialized view `public.mv_vertical_summary` is selectable by anon or authenticated roles — INTENTIONAL. The public marketing site reads it for the verticals home cards. Data is non-sensitive aggregates.",
      remediation:
        "https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api",
    },
    {
      name: "auth_leaked_password_protection",
      title: "Leaked Password Protection Disabled",
      level: "WARN",
      category: "security",
      detail:
        "Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org. Enable in Auth > Settings to clear this WARN.",
      remediation:
        "https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection",
    },
  ] as AdvisorLint[],
  performance: [
    {
      name: "unindexed_foreign_keys",
      title: "Unindexed foreign keys",
      level: "INFO",
      category: "performance",
      detail:
        "5 tables have FK constraints without covering indexes (agencies.location_type_id, credit_ledger.saved_list_id, downloads_ledger.saved_list_id, saved_list_hygiene_flags.hygiene_event_id, user_entitlements.plan_id). Add indexes if these become hot paths.",
      remediation:
        "https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys",
    },
    {
      name: "unused_index",
      title: "Unused indexes",
      level: "INFO",
      category: "performance",
      detail:
        "20 indexes have never been used since creation. Candidates for removal in a future cleanup migration once we observe a steady-state query mix.",
      remediation:
        "https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index",
    },
    {
      name: "auth_db_connections_absolute",
      title: "Auth DB Connections Absolute",
      level: "INFO",
      category: "performance",
      detail:
        "Auth server is configured with at most 10 connections (absolute). Switching to percentage strategy lets it scale with instance size — set in dashboard > Project Settings.",
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
