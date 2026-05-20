// Seven16 Group Support — safe context endpoint (STUB).
//
// Stage 1: returns 501. Stage 2 will return a SafeSupportContext JWT for
// the requested {user_id, organization_id, mode}.
//
// Auth gate is wired so the route is ready to flip live as soon as
// SUPPORT_PLATFORM_API_KEY is populated. See
// `docs/support-integration-readiness.md` §7.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
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
        "Stage-1 readiness only. /context will return signed SafeSupportContext once seven16groupsupport.com is live.",
      stage: "1-readiness",
    },
    { status: 501 },
  );
}
