import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";

/**
 * Server component that fetches the current user + app_user row and renders
 * the Neilson-style left sidebar layout. Any page can wrap itself in
 * <AppShell>{children}</AppShell> to get auth gating + sidebar nav.
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
      <Sidebar email={email} fullName={fullName} isSuperAdmin={isSuperAdmin} />
      <div className="flex-1 min-w-0 overflow-x-hidden">
        {/* Always-visible sign-out (visible on all viewports incl. mobile where the sidebar is hidden) */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-2 bg-white border-b border-gray-200 px-4 py-2 text-xs">
          <span className="text-gray-600 truncate">Signed in as <span className="font-medium text-gray-900">{email}</span></span>
          <a
            href="/sign-out"
            className="rounded-md border border-gray-300 px-2.5 py-1 font-semibold text-gray-700 hover:bg-gray-50 shrink-0"
          >
            Sign out
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
