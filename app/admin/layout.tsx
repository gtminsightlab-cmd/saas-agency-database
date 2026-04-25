import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "./_shell/sidebar";
import { AdminTopbar } from "./_shell/topbar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin");

  // Use the is_super_admin() RPC defined in earlier migrations
  const { data: isAdmin } = await supabase.rpc("is_super_admin");
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-gray-400" />
          <h1 className="mt-4 text-xl font-semibold text-navy-800">Admin access only</h1>
          <p className="mt-2 text-sm text-gray-600">
            This page is restricted to super-admin users on the seven16 tenant.
          </p>
          <Link
            href="/build-list"
            className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Back to your dashboard →
          </Link>
        </div>
      </div>
    );
  }

  // Stripe sandbox detection. STRIPE_SECRET_KEY may not be set yet (carryover env-var).
  // Treat anything that's not explicitly an `sk_live_` key as sandbox.
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  const sandboxMode = !stripeKey.startsWith("sk_live_");

  return (
    <div className="min-h-screen flex bg-admin-bg text-admin-text">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar email={user.email ?? "admin"} sandboxMode={sandboxMode} />
        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 max-w-[1440px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
