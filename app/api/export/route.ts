import { NextResponse } from "next/server";
export const runtime = "nodejs";

/**
 * Stub. Real implementation lands next session — will:
 *  1. Validate the per-user export token from `api_tokens` table (TODO: create)
 *  2. Look up the saved list by id, enforce RLS via the user's tenant
 *  3. Deduct credits per row exported (matches Growth Member quota)
 *  4. Stream CSV with field-mapping for HubSpot/SFDC/Mailchimp/Pipedrive
 */
export async function GET() {
  return NextResponse.json(
    { error: "not_implemented", message: "The export endpoint is scaffolded. Real implementation lands next session." },
    { status: 501 }
  );
}
