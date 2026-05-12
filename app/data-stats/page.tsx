import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DataStatsPage() {
  const supabase = await createClient();
  const [agencies, contacts, carriers, affiliations, topLists, topMembers, states, metros, depts, titles] = await Promise.all([
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("carriers").select("id", { count: "exact", head: true }),
    supabase.from("affiliations").select("id", { count: "exact", head: true }),
    supabase.from("top_agency_lists").select("id", { count: "exact", head: true }),
    supabase.from("top_agency_members").select("id", { count: "exact", head: true }),
    supabase.from("states").select("id", { count: "exact", head: true }),
    supabase.from("metro_areas").select("id", { count: "exact", head: true }),
    supabase.from("departments").select("id", { count: "exact", head: true }),
    supabase.from("contact_title_roles").select("id", { count: "exact", head: true })
  ]);

  const stats = [
    { label: "Agencies", value: agencies.count ?? 0 },
    { label: "Contacts", value: contacts.count ?? 0 },
    { label: "Carriers", value: carriers.count ?? 0 },
    { label: "Affiliations", value: affiliations.count ?? 0 },
    { label: "Top Lists", value: topLists.count ?? 0 },
    { label: "Top-list members", value: topMembers.count ?? 0 },
    { label: "States + provinces", value: states.count ?? 0 },
    { label: "Metro areas", value: metros.count ?? 0 },
    { label: "Departments", value: depts.count ?? 0 },
    { label: "Contact title roles", value: titles.count ?? 0 }
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Data and Stats</h1>
        <p className="mt-2 text-sm text-gray-600">Row counts across every catalog and data table.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-gray-500">{s.label}</div>
              <div className="mt-2 text-3xl font-bold text-brand-600 tabular-nums">
                {s.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
