/**
 * Usage cap enforcement helpers.
 *
 * Wraps the public.enforce_usage() RPC (mig 0043) which atomically checks the
 * caller's current-month usage against their effective cap and writes a
 * usage_logs row when allowed.
 *
 * Page routes call enforceUsageOrRedirect() — that redirects to /limit-reached
 * when blocked. API routes call enforceUsageOrRespond() which returns a 429.
 */
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type UsageMetric = "search" | "export" | "download" | "api_call";

export type EnforceStatus =
  | "under"
  | "soft_over"
  | "hard_over"
  | "no_user"
  | "no_app_user"
  | "no_default";

export type EnforceResult = {
  allowed: boolean;
  status: EnforceStatus;
  metric: UsageMetric;
  current_usage: number | null;
  effective_cap: number | null;
  is_hard: boolean | null;
  requested?: number;
};

/**
 * Calls the enforce_usage RPC. Always logs (when allowed); never silently fails.
 * Returns null if the RPC itself errored — caller decides whether to fail open or closed.
 */
export async function enforceUsage(
  metric: UsageMetric,
  quantity: number = 1,
  metadata?: Record<string, unknown>
): Promise<EnforceResult | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("enforce_usage", {
      p_action: metric,
      p_quantity: quantity,
      p_metadata: metadata ?? null,
    });
    if (error || !data) return null;
    return data as EnforceResult;
  } catch {
    return null;
  }
}

/**
 * For page routes: redirect to /limit-reached when blocked. Otherwise no-op.
 * Returns the result so the page can branch on soft_over (e.g. show a banner).
 */
export async function enforceUsageOrRedirect(
  metric: UsageMetric,
  quantity: number = 1,
  metadata?: Record<string, unknown>
): Promise<EnforceResult | null> {
  const result = await enforceUsage(metric, quantity, metadata);
  if (result && !result.allowed && result.status === "hard_over") {
    const params = new URLSearchParams({
      metric: result.metric,
      cap: String(result.effective_cap ?? ""),
      used: String(result.current_usage ?? ""),
    });
    redirect(`/limit-reached?${params.toString()}`);
  }
  return result;
}

/**
 * For API routes: returns a NextResponse 429 if blocked, or null if allowed.
 * Caller does its work after a null return.
 */
export async function enforceUsageOrRespond(
  metric: UsageMetric,
  quantity: number = 1,
  metadata?: Record<string, unknown>
): Promise<NextResponse | null> {
  const result = await enforceUsage(metric, quantity, metadata);
  if (result && !result.allowed && result.status === "hard_over") {
    // First of next month at 00:00 UTC
    const now = new Date();
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return NextResponse.json(
      {
        error: "monthly_cap_reached",
        metric: result.metric,
        current_usage: result.current_usage,
        effective_cap: result.effective_cap,
        message: `Monthly ${result.metric} cap reached. Resets ${nextMonth.toISOString().slice(0, 10)}.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((nextMonth.getTime() - now.getTime()) / 1000)),
        },
      }
    );
  }
  return null;
}
