import type { Alert } from "./types";
import { ADVISORS_SNAPSHOT } from "@/app/admin/system-health/_lib/advisors-snapshot";
import { deployErrorsLast24h, deployErrorsLast7d, SNAPSHOT_FETCHED_AT } from "./deploy-snapshot";
import type { EventSummary } from "@/app/admin/billing/_lib/stripe-fetchers";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export type AlertInputs = {
  canaryHits:     { id: string; source: string; kind: string; pattern: string; hits: number }[];
  rlsCoverage:    { protected: number; total: number; unprotected_tables: string[] };
  pendingWebhooks: number;
  webhookEvents:  EventSummary[];
  exportRouteIs501: boolean;
  /** Whether STRIPE_SECRET_KEY is set */
  stripeConfigured: boolean;
  /** Stripe sandbox vs live */
  stripeIsLive: boolean;
  massExportLast24h: { user_id: string; count: number; tenant_id: string | null }[];
  oldestUnacknowledgedPAT: boolean;
};

const SUPABASE_PROJECT_REF = "sdlsdovuljuymgymarou";

export function buildAlerts(inputs: AlertInputs, now: number = Date.now()): Alert[] {
  const alerts: Alert[] = [];

  // ───────────── CRITICAL ─────────────

  // 1) Watermark canary detected in live data
  const liveCanaries = inputs.canaryHits.filter((c) => c.hits > 0);
  if (liveCanaries.length > 0) {
    alerts.push({
      id: "canary-leak",
      severity: "critical",
      category: "Security",
      title: `${liveCanaries.length} watermark canary leak${liveCanaries.length === 1 ? "" : "s"} detected`,
      detail: liveCanaries
        .slice(0, 5)
        .map((c) => `${c.source}: ${c.pattern} → ${c.hits} match${c.hits === 1 ? "" : "es"}`)
        .join(" · "),
      observed_at: new Date(now).toISOString(),
      evidence: {
        label: "Hygiene & Refresh",
        href: "/admin/hygiene",
      },
      remediation:
        "Pull the matching rows out of agencies/contacts immediately, then audit the AdList batch they came in on. The watermark filter should have caught these — review the canary's match_mode setting on the Hygiene page.",
    });
  }

  // 2) RLS coverage drop
  if (inputs.rlsCoverage.unprotected_tables.length > 0) {
    alerts.push({
      id: "rls-coverage-drop",
      severity: "critical",
      category: "Security",
      title: `${inputs.rlsCoverage.unprotected_tables.length} public tables without RLS policies`,
      detail: inputs.rlsCoverage.unprotected_tables.slice(0, 8).join(", "),
      observed_at: new Date(now).toISOString(),
      evidence: { label: "System Health", href: "/admin/system-health" },
      remediation:
        "Every public.* table must enable RLS and have at least a deny-all baseline policy. Add ENABLE ROW LEVEL SECURITY + a CREATE POLICY block in the next migration.",
    });
  }

  // 3) ERROR-level Supabase advisor
  const errorAdvisors = ADVISORS_SNAPSHOT.security.filter((l) => l.level === "ERROR");
  for (const a of errorAdvisors) {
    alerts.push({
      id: `advisor-${a.name}`,
      severity: "critical",
      category: "Security",
      title: a.title,
      detail: a.detail,
      observed_at: ADVISORS_SNAPSHOT.fetched_at,
      evidence: {
        label: "Supabase advisors",
        href: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/advisors`,
      },
      remediation: a.remediation,
    });
  }

  // ───────────── HIGH ─────────────

  // 4) Vercel deploy ERRORs in last 24h (snapshot)
  const recentDeployErrors = deployErrorsLast24h(now);
  if (recentDeployErrors.length > 0) {
    alerts.push({
      id: "deploy-errors-24h",
      severity: "high",
      category: "Reliability",
      title: `${recentDeployErrors.length} Vercel deploy${recentDeployErrors.length === 1 ? "" : "s"} failed in last 24h`,
      detail: recentDeployErrors
        .slice(0, 3)
        .map((d) => `${d.commit_sha.slice(0, 7)} · ${d.commit_subject.slice(0, 60)}`)
        .join(" · "),
      observed_at: new Date(recentDeployErrors[0].created_ms).toISOString(),
      evidence: {
        label: "Vercel deployments",
        href: "https://vercel.com/gtminsightlab-7170s-projects/saas-agency-database/deployments",
      },
      remediation:
        "Open the deploy in Vercel, read the build log, identify root cause. Most ERRORs in this codebase come from Stripe SDK type drift or Supabase env-var misalignment.",
    });
  }

  // 5) Mass-export attempts in last 24h (>500 rows in 5 minutes by single user)
  const massExporters = inputs.massExportLast24h.filter((m) => m.count > 500);
  if (massExporters.length > 0) {
    alerts.push({
      id: "mass-export",
      severity: "high",
      category: "Security",
      title: `${massExporters.length} mass-export event${massExporters.length === 1 ? "" : "s"} in last 24h`,
      detail: massExporters
        .slice(0, 5)
        .map((m) => `user ${m.user_id.slice(0, 8)}: ${m.count.toLocaleString()} rows`)
        .join(" · "),
      observed_at: new Date(now).toISOString(),
      evidence: { label: "Customers", href: "/admin/customers" },
      remediation:
        "Review the user's intent. If legitimate, raise their export cap on the Usage & Limits page. If suspicious, suspend the user from /admin/customers and rotate any API tokens they hold.",
    });
  }

  // 6) Stripe webhook failures (events with pending_webhooks > 0)
  if (inputs.pendingWebhooks >= 3) {
    alerts.push({
      id: "stripe-webhook-pending",
      severity: "high",
      category: "Billing",
      title: `${inputs.pendingWebhooks} Stripe events have pending webhook deliveries`,
      detail:
        "Multiple events haven't been acknowledged by all webhook endpoints. Subscriptions may not have activated correctly.",
      observed_at: new Date(now).toISOString(),
      evidence: { label: "Billing", href: "/admin/billing" },
      remediation:
        "Check Stripe dashboard → Developers → Webhooks for failing endpoints. If our /api/stripe/webhook is the failing one, check Vercel runtime logs for the most recent invocation error.",
    });
  }

  // ───────────── MEDIUM ─────────────

  // 7) Marketing-promise gap: /api/export is 501 but public /integrations says "Available now"
  if (inputs.exportRouteIs501) {
    alerts.push({
      id: "export-stub-vs-promise",
      severity: "medium",
      category: "Compliance",
      title: "Public /integrations page promises Zapier export but route returns 501",
      detail:
        "Customers visiting the marketing page see 'Available now' for Zapier/Make CSV export. /api/export currently returns HTTP 501 not_implemented. Either ship the route or soften the public copy.",
      observed_at: null,
      evidence: { label: "Integrations module", href: "/admin/integrations" },
      remediation:
        "Either: (a) implement /api/export.csv (token issuance + RLS + credit deduction + CSV streaming), or (b) edit the public /integrations page to drop the 'Available now' badge until it's real.",
    });
  }

  // 8) Stripe sandbox in production
  if (inputs.stripeConfigured && !inputs.stripeIsLive) {
    alerts.push({
      id: "stripe-sandbox-mode",
      severity: "medium",
      category: "Billing",
      title: "Stripe is in sandbox mode",
      detail:
        "STRIPE_SECRET_KEY does not start with sk_live_ — the platform cannot collect real revenue today. Active sandbox subscriptions show as $198 MRR but it's test money.",
      observed_at: null,
      evidence: { label: "Billing", href: "/admin/billing" },
      remediation:
        "Promote Stripe sandbox to live: create a live mode account, recreate the Growth Member + Snapshot products + prices, swap STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in Vercel env, then redeploy.",
    });
  }

  // 9) Supabase advisor WARN-level lints (not intentional ones)
  const warnAdvisors = ADVISORS_SNAPSHOT.security.filter(
    (l) => l.level === "WARN" && !l.title.toLowerCase().includes("intentional")
  );
  if (warnAdvisors.length > 0) {
    alerts.push({
      id: "advisor-warns",
      severity: "medium",
      category: "Security",
      title: `${warnAdvisors.length} Supabase advisor WARN${warnAdvisors.length === 1 ? "" : "s"} pending review`,
      detail: warnAdvisors.map((a) => a.title).join(" · "),
      observed_at: ADVISORS_SNAPSHOT.fetched_at,
      evidence: {
        label: "Supabase advisors",
        href: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/advisors`,
      },
      remediation:
        "Open System Health → Supabase advisors panel for full detail and remediation links per lint.",
    });
  }

  // ───────────── LOW ─────────────

  // 10) Carryover hygiene: revoke session-5 GitHub PAT
  if (inputs.oldestUnacknowledgedPAT) {
    alerts.push({
      id: "github-pat-revoke",
      severity: "low",
      category: "Security",
      title: "Session-5 GitHub PAT may still be active",
      detail:
        "A short-lived PAT was used for sandbox pushes during this conversation. It auto-expires in 7 days but should be revoked manually now that all pushes have landed.",
      observed_at: null,
      evidence: { label: "GitHub PATs", href: "https://github.com/settings/personal-access-tokens" },
      remediation:
        "Open https://github.com/settings/personal-access-tokens, find any token starting with github_pat_11B7QVWO* and click Revoke.",
    });
  }

  // 11) Snapshot staleness — flag if the deploy snapshot is older than 24h
  const snapshotAgeMs = now - new Date(SNAPSHOT_FETCHED_AT).getTime();
  if (snapshotAgeMs > TWENTY_FOUR_HOURS) {
    alerts.push({
      id: "deploy-snapshot-stale",
      severity: "low",
      category: "Reliability",
      title: "Vercel deploy snapshot is stale",
      detail: `Last refreshed ${Math.round(snapshotAgeMs / 1000 / 60 / 60)}h ago. Live wiring needs VERCEL_API_TOKEN.`,
      observed_at: SNAPSHOT_FETCHED_AT,
      evidence: { label: "System Health → Wiring", href: "/admin/system-health" },
      remediation:
        "Add VERCEL_API_TOKEN to Vercel project env vars (vercel.com/account/tokens). Then we can fetch deploys at request time and the snapshot becomes redundant.",
    });
  }

  return alerts;
}
