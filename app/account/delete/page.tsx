import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/shell";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { Sidebar } from "@/components/app/sidebar";
import { DeleteAccountForm } from "./form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Delete my account — Agency Signal",
  description: "Permanently delete your Agency Signal account and associated data.",
};

export default async function DeleteAccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/delete");

  const { data: appUser } = await supabase
    .from("app_users")
    .select("email, full_name, role")
    .eq("user_id", user.id)
    .maybeSingle();

  const sidebarProps = {
    email: appUser?.email ?? user.email ?? "",
    fullName: appUser?.full_name ?? null,
    isSuperAdmin: appUser?.role === "super_admin",
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar {...sidebarProps} />
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <AppShell>
          <Breadcrumbs
            items={[
              { href: "/home", label: "Home" },
              { href: "/team", label: "Account" },
              { label: "Delete account" },
            ]}
          />
          <PageHeader
            title="Delete my account"
            subtitle="Permanently remove your Agency Signal account and associated personal data. This action cannot be undone."
          />

          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-700 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="text-sm leading-6 text-red-900">
                  <strong className="font-black">This is irreversible.</strong> After deletion, you&rsquo;ll lose access to your account immediately. Your saved lists, search history, and uploaded data will be permanently removed within 30 days per our Privacy Policy.
                </div>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">What gets deleted</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><span className="text-red-600">✗</span><span>Your account profile (email, full name, role)</span></li>
                <li className="flex gap-2"><span className="text-red-600">✗</span><span>Your saved lists and search history</span></li>
                <li className="flex gap-2"><span className="text-red-600">✗</span><span>Your export history (file references; the underlying export files themselves auto-expire per their retention)</span></li>
                <li className="flex gap-2"><span className="text-red-600">✗</span><span>Any team invitations you&rsquo;ve sent that are still pending</span></li>
                <li className="flex gap-2"><span className="text-red-600">✗</span><span>Your Stripe customer record (Master O processes within 30 days)</span></li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">What gets kept (and why)</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li className="flex gap-2"><span className="text-slate-400">·</span><span><strong className="font-black text-slate-950">Audit log entries</strong> — significant actions (sign-ins, exports, billing changes, this deletion request). Retained for security and dispute-resolution purposes. Not exposed to other users.</span></li>
                <li className="flex gap-2"><span className="text-slate-400">·</span><span><strong className="font-black text-slate-950">Financial records</strong> — invoice records, payment receipts. Required by US tax law (typically 7 years). Not exposed to other users.</span></li>
                <li className="flex gap-2"><span className="text-slate-400">·</span><span><strong className="font-black text-slate-950">Aggregated anonymized usage</strong> — we may retain aggregate counts (e.g., &ldquo;how many exports were run last month across all users&rdquo;) that cannot be re-identified to you.</span></li>
                <li className="flex gap-2"><span className="text-slate-400">·</span><span><strong className="font-black text-slate-950">Team-shared data</strong> — if you&rsquo;re part of a team, lists or settings you contributed to the team workspace stay with the team. Only your personal data is deleted.</span></li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Process</h2>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li><strong className="font-black text-slate-950">1. Now:</strong> account is soft-deleted (deactivated) and you&rsquo;re signed out immediately.</li>
                <li><strong className="font-black text-slate-950">2. Within 30 days:</strong> personal data is hard-deleted from our active systems. Stripe customer record removed.</li>
                <li><strong className="font-black text-slate-950">3. Confirmation:</strong> we send a deletion-complete email to your address on file once the 30-day process is done.</li>
              </ol>
              <p className="mt-4 text-xs text-slate-500">
                Have questions before you delete? Email <a href="mailto:hello@seven16group.com" className="font-bold text-teal-700 hover:text-teal-800">hello@seven16group.com</a> — we&rsquo;d rather you ask than delete by mistake.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">Confirm deletion</h2>
              <p className="mt-2 text-sm text-slate-600">
                Signed in as <strong className="font-black text-slate-950">{appUser?.email ?? user.email ?? "(unknown)"}</strong>.
              </p>
              <div className="mt-5">
                <DeleteAccountForm />
              </div>
            </section>

            <p className="text-center text-sm text-slate-500">
              <Link href="/team" className="font-bold text-teal-700 hover:text-teal-800">Back to Account</Link>
            </p>
          </div>
        </AppShell>
      </div>
    </div>
  );
}
