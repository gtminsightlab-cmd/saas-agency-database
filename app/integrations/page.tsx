import Link from "next/link";
import { redirect } from "next/navigation";
import { Workflow, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PROVIDERS = [
  { slug: "hubspot",    name: "HubSpot",    blurb: "Push contacts to a HubSpot list. Two-way sync coming soon.", color: "brand" },
  { slug: "salesforce", name: "Salesforce", blurb: "Create Leads or Contacts in your Salesforce org.",            color: "navy"  },
  { slug: "mailchimp",  name: "Mailchimp",  blurb: "Drop contacts into a Mailchimp audience as subscribed.",      color: "gold"  },
  { slug: "pipedrive",  name: "Pipedrive",  blurb: "Add contacts as People + Deals in your Pipedrive pipeline.",  color: "success" },
];

const COLOR: Record<string, { bg: string; text: string; border: string }> = {
  brand:   { bg: "bg-brand-50",   text: "text-brand-700",   border: "border-brand-100"   },
  navy:    { bg: "bg-navy-50",    text: "text-navy-800",    border: "border-navy-100"    },
  gold:    { bg: "bg-gold-50",    text: "text-gold-800",    border: "border-gold-100"    },
  success: { bg: "bg-success-50", text: "text-success-700", border: "border-success-100" },
};

export default async function IntegrationsPage() {
  const supabase = createClient();
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
                Use our CSV export endpoint as a Zapier or Make trigger to fan out into HubSpot,
                Salesforce, Mailchimp, Pipedrive, or 1,000+ other apps. No OAuth juggling — your
                personal export key handles auth.
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

        {/* Native OAuth providers — coming soon */}
        <section className="mt-8">
          <h2 className="text-base font-semibold text-navy-800">Native connectors</h2>
          <p className="mt-1 text-xs text-gray-500">One-click OAuth, no Zapier required. Rolling out one provider at a time.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {PROVIDERS.map((p) => {
              const c = COLOR[p.color] ?? COLOR.brand;
              return (
                <div key={p.slug} className={`rounded-xl border ${c.border} bg-white p-5`}>
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.bg}`}>
                      <span className={`text-sm font-bold ${c.text}`}>{p.name[0]}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      <Lock className="h-3 w-3" /> Coming soon
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-navy-800">{p.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{p.blurb}</p>
                  <button
                    type="button"
                    disabled
                    className="mt-4 inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 cursor-not-allowed"
                  >
                    Connect {p.name} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
