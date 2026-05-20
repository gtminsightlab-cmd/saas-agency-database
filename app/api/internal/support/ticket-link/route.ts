// Seven16 Group Support — ticket-link endpoint (STUB).
//
// Stage 1: returns 501. Stage 2 will accept
//   { ticket_id, support_platform_url, summary, user_id?, organization_id? }
// from seven16groupsupport.com and link the ticket back to a user/org record
// in AS so the customer can see "active support tickets" in their account
// settings without AS owning the ticket data.
//
// Auth gate is wired. See `docs/support-integration-readiness.md` §7.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiKey = process.env.SUPPORT_PLATFORM_API_KEY;
  if (apiKey) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json(
    {
      error: "not_implemented",
      detail:
        "Stage-1 readiness only. /ticket-link will link inbound support tickets to AS user records once seven16groupsupport.com is live.",
      stage: "1-readiness",
    },
    { status: 501 },
  );
}
