import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Sign-out shortcut for users who can't reach the sidebar Sign-out button
 * (narrow viewport, headless browser, etc.). GET *and* POST both work — the
 * GET version is intentionally CSRF-soft because the only consequence is the
 * caller's own session being cleared.
 *
 * Behavior: clears the Supabase session cookie and 303-redirects to /sign-in.
 */
async function handle(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/sign-in`, { status: 303 });
}

export const GET  = handle;
export const POST = handle;
