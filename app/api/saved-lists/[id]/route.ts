import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/saved-lists/<id>
 *
 * Auth: existing session cookie. RLS on saved_lists scopes the delete to
 * the caller's tenant (super_admin can delete any).
 *
 * Returns:
 *   200 { ok: true, deleted_count }
 *   401 if no session
 *   404 if the row doesn't exist (or RLS blocked the read)
 *   500 on unexpected errors
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json(
      { error: "unauthenticated", message: "Sign in required." },
      { status: 401 }
    );
  }

  // First verify the row is visible to the caller (so we can surface a real 404
  // rather than a silent RLS no-op).
  const { data: existing, error: selectErr } = await supabase
    .from("saved_lists")
    .select("id,name")
    .eq("id", id)
    .maybeSingle();

  if (selectErr) {
    return NextResponse.json(
      { error: "select_failed", message: selectErr.message },
      { status: 500 }
    );
  }
  if (!existing) {
    return NextResponse.json(
      { error: "not_found", message: "Saved list not found or you don't have access." },
      { status: 404 }
    );
  }

  const { data: deleted, error: deleteErr } = await supabase
    .from("saved_lists")
    .delete()
    .eq("id", id)
    .select("id");

  if (deleteErr) {
    return NextResponse.json(
      { error: "delete_failed", message: deleteErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, deleted_count: deleted?.length ?? 0 });
}
