import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let payload: { id?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Body must be JSON" }, { status: 400 });
  }

  const id = (payload.id ?? "").toString().trim();
  if (!id) {
    return NextResponse.json({ message: "Missing invite id" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase.rpc("revoke_invite", { p_app_user_id: id });
  if (error) {
    const msg = error.message ?? "Could not revoke invite";
    let status = 400;
    if (/another tenant/i.test(msg) || /Not authenticated/i.test(msg)) status = 403;
    else if (/not found/i.test(msg)) status = 404;
    return NextResponse.json({ message: msg }, { status });
  }

  return NextResponse.json({ ok: true });
}
