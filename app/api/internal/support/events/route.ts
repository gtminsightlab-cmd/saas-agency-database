// Seven16 Group Support — events endpoint (STUB).
//
// Stage 1: returns 501. Stage 2 will accept events FROM the support platform
// (e.g. ticket_resolved → flag account in AS, or escalation_triggered →
// surface in AS admin). Outbound events from AS go via
// `lib/support/events.ts#emitSupportEvent` instead.
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
        "Stage-1 readiness only. /events will accept inbound events from seven16groupsupport.com once the platform is live.",
      stage: "1-readiness",
    },
    { status: 501 },
  );
}
