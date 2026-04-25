export type Severity = "critical" | "high" | "medium" | "low";

export type Alert = {
  id: string;
  severity: Severity;
  title: string;
  category: "Security" | "Performance" | "Billing" | "Reliability" | "Compliance" | "Hygiene";
  detail: string;
  /** When the alert was first observed (ISO string) — null if "ongoing / no recent change" */
  observed_at: string | null;
  /** External evidence link */
  evidence?: { label: string; href: string };
  /** Recommended remediation, free-text */
  remediation: string;
};

export type AlertSummary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
};

export function summarize(alerts: Alert[]): AlertSummary {
  return {
    critical: alerts.filter((a) => a.severity === "critical").length,
    high:     alerts.filter((a) => a.severity === "high").length,
    medium:   alerts.filter((a) => a.severity === "medium").length,
    low:      alerts.filter((a) => a.severity === "low").length,
    total:    alerts.length,
  };
}

/** Severity → tailwind classes for badges */
export function sevTone(s: Severity): { bg: string; text: string; ring: string } {
  if (s === "critical") return { bg: "bg-admin-danger/15", text: "text-admin-danger", ring: "ring-admin-danger/30" };
  if (s === "high")     return { bg: "bg-admin-warn/15",   text: "text-admin-warn",   ring: "ring-admin-warn/30"   };
  if (s === "medium")   return { bg: "bg-admin-accent/15", text: "text-admin-accent", ring: "ring-admin-accent/30" };
  return                       { bg: "bg-admin-text-dim/15", text: "text-admin-text-dim", ring: "ring-admin-text-dim/30" };
}

export function sevLabel(s: Severity): string {
  return s === "critical" ? "Critical" : s === "high" ? "High" : s === "medium" ? "Medium" : "Low";
}

/** Sort: critical → high → medium → low */
export const SEV_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
