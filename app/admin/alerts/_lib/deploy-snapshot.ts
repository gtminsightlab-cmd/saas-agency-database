/**
 * Snapshot of recent Vercel deploys. Live wiring requires VERCEL_API_TOKEN
 * which isn't set in Vercel env yet. Until then, this is the most accurate
 * recent-state available. Refresh by calling list_deployments and pasting in
 * the relevant fields.
 *
 * Live source: https://vercel.com/gtminsightlab-7170s-projects/saas-agency-database/deployments
 */
export type DeploySnapshot = {
  id: string;
  state: "READY" | "ERROR" | "BUILDING" | "CANCELED";
  created_ms: number;
  commit_sha: string;
  commit_subject: string;
};

export const RECENT_DEPLOYS: DeploySnapshot[] = [
  // The 4 ERROR deploys from session 4 (epoch ~1777093xxx, ~2026-04-25 04:00 UTC).
  // All on the same problematic commit aa8e26a (webhook current_period_end null
  // dereference) — fixed in commit eb9e3f9. Kept here so the Alerts page can show
  // the alert engine isn't lying when it surfaces "no failures in last 24h".
  { id: "dpl_LzgPvMPFzBxJirDSrFKHHphtnCSc", state: "ERROR", created_ms: 1777093705172, commit_sha: "aa8e26a01508c331a2c42e7f7016d8eedc3bf3d1", commit_subject: "fix(stripe): webhook handler reads current_period_end from either top-level or items[0]" },
  { id: "dpl_7aaaxqbRp8Ugmo9KRgTox1m5CQBy", state: "ERROR", created_ms: 1777093517257, commit_sha: "aa8e26a01508c331a2c42e7f7016d8eedc3bf3d1", commit_subject: "fix(stripe): webhook handler reads current_period_end from either top-level or items[0]" },
  { id: "dpl_2FRg13c5vxShPik2GSzQbpmHrhbY", state: "ERROR", created_ms: 1777093480961, commit_sha: "aa8e26a01508c331a2c42e7f7016d8eedc3bf3d1", commit_subject: "fix(stripe): webhook handler reads current_period_end from either top-level or items[0]" },
  { id: "dpl_CrtbWVTrjumDK9WFrBZ4M4sWntnV", state: "ERROR", created_ms: 1777093362545, commit_sha: "aa8e26a01508c331a2c42e7f7016d8eedc3bf3d1", commit_subject: "fix(stripe): webhook handler reads current_period_end from either top-level or items[0]" },
];

export const SNAPSHOT_FETCHED_AT = "2026-04-25T17:00:00Z";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS        = 7 * TWENTY_FOUR_HOURS;

export function deployErrorsLast24h(now: number = Date.now()): DeploySnapshot[] {
  return RECENT_DEPLOYS.filter(
    (d) => d.state === "ERROR" && now - d.created_ms <= TWENTY_FOUR_HOURS
  );
}

export function deployErrorsLast7d(now: number = Date.now()): DeploySnapshot[] {
  return RECENT_DEPLOYS.filter(
    (d) => d.state === "ERROR" && now - d.created_ms <= SEVEN_DAYS
  );
}
