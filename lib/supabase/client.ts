import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Use this inside Client Components.
 * Safe to call from any component that runs in the browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
