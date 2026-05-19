import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

/**
 * Intelligence-workspace shell. Server component — fetches the current user
 * + app_user row, gates on auth, renders the sidebar + content landmark.
 *
 * Pages compose their own PageHeader / Breadcrumbs / TopBar inside the
 * children slot (per-page composition pattern). The shell stays one-job:
 * auth + sidebar + the <main> landmark.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("email, full_name, role")
    .eq("user_id", user.id)
    .maybeSingle();

  const email = appUser?.email ?? user.email ?? "";
  const fullName = appUser?.full_name;
  const isSuperAdmin = appUser?.role === "super_admin";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <Sidebar email={email} fullName={fullName} isSuperAdmin={isSuperAdmin} />
      <div className="flex-1 min-w-0 overflow-x-hidden">
        {/* Mobile-only sign-out strip — mobile sidebar drawer is a future session. */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-2 bg-white border-b border-gray-200 px-4 py-2 text-xs">
          <span className="text-gray-600 truncate">
            Signed in as <span className="font-medium text-gray-900">{email}</span>
          </span>
          <a
            href="/sign-out"
            className="rounded-md border border-gray-300 px-2.5 py-1 font-semibold text-gray-700 hover:bg-gray-50 shrink-0"
          >
            Sign out
          </a>
        </div>
        {/* Desktop top bar — global search + plan/credits + user identity. Sign-out lives in sidebar. */}
        <TopBar email={email} fullName={fullName} />
        <main id="content" className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
