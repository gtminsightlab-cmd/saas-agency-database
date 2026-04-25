"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Best-effort logger for AI Support queries. Writes one row to usage_logs with
 * action_type='ai_search'. Never throws — analytics shouldn't ever break the
 * page render.
 *
 * Why no enforce_usage call: the caller hasn't actually run a search yet (we
 * just parsed text). The /build-list/review redirect is what burns a quota
 * unit via enforce_usage('search'). Keeping this purely informational lets us
 * track adoption + zero-result patterns without double-charging.
 */
type LogAiSearchInput = {
  query_text: string;
  filter_keys: string[];
  // Sanitized (string-only) snapshot for the recent-searches panel.
  summary: Record<string, unknown>;
};

export async function logAiSearch(input: LogAiSearchInput): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: appUser } = await supabase
      .from("app_users")
      .select("id, tenant_id")
      .eq("user_id", user.id)
      .maybeSingle();

    await supabase.from("usage_logs").insert({
      tenant_id: appUser?.tenant_id ?? null,
      user_id: user.id,
      action_type: "ai_search",
      quantity: 1,
      metadata: {
        query_text: input.query_text,
        filter_keys: input.filter_keys,
        parsed_summary: input.summary,
        route: "/ai-support",
      },
    });
  } catch {
    // swallow — never block the page render
  }
}
