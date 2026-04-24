import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";

/**
 * Server component that fetches the current user + app_user row and renders
 * the Neilson-style left sidebar layout. Any page can wrap itself in
 * <AppShell>{children}</AppShell> to get auth gating + sidebar nav.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
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
      <div className="flex-1 min-w-0 overflow-x-hidden">{children}</div>
    </div>
  );
}
