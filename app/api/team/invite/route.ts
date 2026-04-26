import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let payload: { email?: string; full_name?: string | null } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Body must be JSON" }, { status: 400 });
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  const fullName = (payload.full_name ?? "").toString().trim() || null;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ message: "Please provide a valid email." }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("invite_team_member", {
    p_email: email,
    p_full_name: fullName,
  });

  if (error) {
    // Map common RPC errors to friendly statuses.
    const msg = error.message ?? "Could not send invite";
    let status = 400;
    if (/active subscription/i.test(msg)) status = 402;
    else if (/Seat limit/i.test(msg)) status = 409;
    else if (/already exists/i.test(msg)) status = 409;
    else if (/Not authenticated/i.test(msg)) status = 401;
    return NextResponse.json({ message: msg }, { status });
  }

  return NextResponse.json({ ok: true, invited: data });
}
