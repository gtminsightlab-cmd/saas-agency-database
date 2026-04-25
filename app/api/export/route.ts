import { NextResponse } from "next/server";
import { enforceUsageOrRespond } from "@/lib/usage/enforce";

export const runtime = "nodejs";

/**
 * Stub for the per-user CSV export endpoint. Real implementation is queued:
 *   1. Validate the per-user export token from `api_tokens` (TODO: create table)
 *   2. Look up the saved list by id, enforce RLS via the user's tenant
 *   3. Stream CSV with field-mapping for HubSpot/SFDC/Mailchimp/Pipedrive
 *
 * What's wired NOW (mig 0043, session 13):
 *   - Cap enforcement: each call counts as one `export` action against the
 *     authenticated user's tenant. Hard cap → 429 with Retry-After. Logged
 *     to usage_logs whether allowed or blocked.
 *
 * Cap-blocked callers will get the 429 instead of the 501. Once the real
 * stream lands, the 501 fallthrough goes away.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const blocked = await enforceUsageOrRespond("export", 1, {
    route: "/api/export",
    list_id: url.searchParams.get("list") ?? null,
  });
  if (blocked) return blocked;

  return NextResponse.json(
    {
      error: "not_implemented",
      message:
        "The export endpoint is scaffolded but the CSV streamer isn't wired yet. Cap enforcement IS wired — your call would have been counted toward the export cap.",
    },
    { status: 501 }
  );
}
