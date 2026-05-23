import Link from "next/link";
import { redirect } from "next/navigation";
import { Workflow } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/integrations");

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-800">Integrations</h1>
            <p className="mt-1 text-sm text-gray-600">
              Push your saved lists straight into the tools your sales and marketing team already uses.
            </p>
          </div>
          <Link href="/build-list" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            ← Back to dashboard
          </Link>
        </div>

        {/* Universal Zapier path — ships now */}
        <section className="mt-8 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-6">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Workflow className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-navy-800">
                Connect via Zapier or Make <span className="ml-2 inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-xs font-semibold text-success-700">Available now</span>
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Use our CSV export endpoint as a Zapier or Make trigger to fan out into the major
                CRM, marketing automation, sales pipeline, and spreadsheet platforms — 1,000+ apps
                in total. No OAuth juggling — your personal export key handles auth.
              </p>
              <ol className="mt-4 list-decimal pl-5 text-sm text-gray-700 space-y-2">
                <li>Copy a saved list&rsquo;s export URL from <Link href="/saved-lists" className="font-semibold text-brand-700 hover:underline">Saved Lists</Link>.</li>
                <li>In Zapier or Make, add a &ldquo;Webhook → CSV&rdquo; or &ldquo;Google Sheets → New row&rdquo; step pointing to the URL.</li>
                <li>Map columns to your CRM&rsquo;s fields. Done.</li>
              </ol>
              <p className="mt-4 text-xs text-gray-500">
                Export endpoint scaffolding: <code className="rounded bg-gray-100 px-1.5 py-0.5">GET /api/export.csv?list=&lt;saved_list_id&gt;&amp;token=&lt;your_export_key&gt;</code>
                <br /> The <code>/api/export.csv</code> route returns a 501 stub for now — token issuance, RLS, and credit deduction land next session.
              </p>
            </div>
          </div>
        </section>

        {/* Native OAuth connectors — placeholder; rolling out post-launch */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-navy-800">Native connectors</h2>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            One-click OAuth connectors for the major CRM, marketing automation, and sales
            pipeline platforms are on the post-launch roadmap. Until they ship, the Zapier /
            Make path above is the supported route.
          </p>
        </section>
      </div>
    </div>
  );
}
