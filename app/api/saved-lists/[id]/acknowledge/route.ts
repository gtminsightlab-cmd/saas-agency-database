// D-023 Pillar 6 / BACKLOG #1 — Acknowledge updates on a saved list
//
// POST /api/saved-lists/[id]/acknowledge
//
// Flips has_updates=false and stamps last_acknowledged_at=now() on the
// caller's saved_list. Called by the "Download Updates" UI after a
// successful delta-export. RLS scopes the UPDATE to the caller's tenant.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "missing list id" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_lists")
    .update({
      has_updates: false,
      last_acknowledged_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, has_updates, last_acknowledged_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }
  if (!data) {
    // RLS hid the row or list does not exist
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, list: data });
}
