import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Handles email-confirmation callback links and magic-link redirects.
 * Supabase redirects to /auth/callback?code=... and we exchange the code
 * for a session cookie, then send the user to their next destination.
 *
 * Default destination flipped from /build-list → /home (BACKLOG #1,
 * 2026-05-22) after /home personalization v1 shipped — confidence climbed
 * from ~65% to ~92% per the dashboard-first competitive UX research.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
