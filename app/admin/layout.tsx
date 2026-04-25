import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Tag, Layers } from "lucide-react";

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
          <Link href="/build-list" className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
            Back to your dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-navy-800">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              Admin Control Room
            </Link>
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <Link href="/admin/verticals" className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> Verticals
              </Link>
              <Link href="/admin" className="px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100 inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> Other filters <span className="text-xs text-gray-400">(coming soon)</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>Signed in as <span className="font-medium text-gray-700">{user.email}</span></span>
            <Link href="/build-list" className="text-brand-600 font-semibold hover:text-brand-700">Exit admin →</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
