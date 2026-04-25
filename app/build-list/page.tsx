import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import { ProgressStepper } from "@/components/build-list/progress-stepper";
import { RecordsCounter } from "@/components/build-list/records-counter";
import { BuildListForm, type FilterData } from "@/components/build-list/form";

export const dynamic = "force-dynamic";

export default async function BuildListPage() {
  const supabase = createClient();

  const [
    accountTypes, locationTypes, ams, mgmt, titles, depts,
    statesUS, statesCA, metros, carriers, affiliations, sic,
    accountsRes, contactsRes, contactsEmailRes
  ] = await Promise.all([
    supabase.from("account_types").select("id,code,label,sort_order").eq("active", true).order("sort_order"),
    supabase.from("location_types").select("id,code,name,sort_order").order("sort_order"),
    supabase.from("agency_management_systems").select("id,code,label,sort_order").eq("active", true).order("label"),
    supabase.from("management_levels").select("id,name,sort_order").order("sort_order"),
    supabase.from("contact_title_roles").select("id,name,sort_order").order("sort_order"),
    supabase.from("departments").select("id,name,sort_order").order("sort_order"),
    supabase.from("states").select("id,code,name,country").eq("country", "US").order("sort_order"),
    supabase.from("states").select("id,code,name,country").eq("country", "CA").order("sort_order"),
    supabase.from("metro_areas").select("id,code,name").order("name"),
    supabase.from("carriers").select("id,name,group_name").eq("active", true).order("name"),
    supabase.from("affiliations").select("id,canonical_name,type").eq("active", true).order("canonical_name"),
    supabase.from("sic_codes").select("id,sic_code,description").order("sic_code").limit(1000),
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }).not("email_primary", "is", null)
  ]);

  const accountsCount = accountsRes.count ?? 0;
  const contactsCount = contactsRes.count ?? 0;
  const contactsEmailCount = contactsEmailRes.count ?? 0;

  const data: FilterData = {
    accountTypes: (accountTypes.data ?? []).map((x) => ({ value: x.id, label: x.label })),
    locationTypes: (locationTypes.data ?? []).map((x) => ({ value: x.id, label: x.name })),
    amsOptions: (ams.data ?? []).map((x) => ({ value: x.id, label: x.label })),
    managementLevels: (mgmt.data ?? []).map((x) => ({ value: x.id, label: x.name })),
    contactTitleRoles: (titles.data ?? []).map((x) => ({ value: x.id, label: x.name })),
    departments: (depts.data ?? []).map((x) => ({ value: x.id, label: x.name })),
    states: [
      ...(statesUS.data ?? []).map((x) => ({ value: x.id, label: x.name, sublabel: "US" })),
      ...(statesCA.data ?? []).map((x) => ({ value: x.id, label: x.name, sublabel: "CA" }))
    ],
    metroAreas: (metros.data ?? []).map((x) => ({ value: x.id, label: x.name })),
    carriers: (carriers.data ?? []).map((x) => ({ value: x.id, label: x.name, sublabel: x.group_name ?? undefined })),
    affiliations: (affiliations.data ?? []).map((x) => ({ value: x.id, label: x.canonical_name, sublabel: x.type })),
    industries: (sic.data ?? []).map((x) => ({ value: x.id, label: `${x.sic_code}${x.description ? " — " + x.description : ""}` }))
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <ProgressStepper current="build" />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Build a List</h1>
          <p className="mt-2 text-sm text-gray-600">
            Build your list by refining your search below. Real-time record counts will be displayed at the top as you search.
          </p>
        </div>

        <div className="sticky top-0 z-10 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2 bg-gray-50">
          <RecordsCounter
            accounts={accountsCount}
            contacts={contactsCount}
            contactsWithEmail={contactsEmailCount}
          />
        </div>

        <BuildListForm data={data} />
      </div>
    </AppShell>
  );
}
