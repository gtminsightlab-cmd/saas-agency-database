// D-023 Pillar 6 / BACKLOG #1 — Vercel Cron endpoint
//
// Triggered daily 04:00 UTC by vercel.json cron entry. Validates the
// CRON_SECRET, then invokes the recompute-saved-lists Edge Function
// in the AS Supabase satellite with service-role auth.
//
// Family pattern (D-013): cron route is a thin proxy; all logic lives
// in the Edge Function (direct postgres.js connection, bypasses PostgREST
// schema cache issues per `feedback_postgrest_schema_cache_stuck.md`).

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  return handle(req);
}

// Vercel Cron pings via GET on cron-triggered requests. Support both.
export async function GET(req: Request) {
  return handle(req);
}

async function handle(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      },
      { status: 500 },
    );
  }

  const functionUrl = `${supabaseUrl}/functions/v1/recompute-saved-lists`;

  let edgeResponse: Response;
  try {
    edgeResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ triggered_by: "vercel-cron" }),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Failed to invoke Edge Function",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 502 },
    );
  }

  const text = await edgeResponse.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }

  return NextResponse.json(
    {
      edge_status: edgeResponse.status,
      edge_response: body,
    },
    { status: edgeResponse.ok ? 200 : 502 },
  );
}
