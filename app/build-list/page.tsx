import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import { ProgressStepper } from "@/components/build-list/progress-stepper";
import { RecordsCounter } from "@/components/build-list/records-counter";
import { BuildListForm, type FilterData, type InitialFilters } from "@/components/build-list/form";

export const dynamic = "force-dynamic";

function csv(v: string | undefined | null): string[] {
  return v ? v.split(",").filter(Boolean) : [];
}

function parseInitialFromSearchParams(qs: Record<string, string | string[] | undefined>): InitialFilters {
  const get = (k: string): string => {
    const v = qs[k];
    return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  };
  const initial: InitialFilters = {};
  if (get("at"))    initial.accountType = csv(get("at"));
  if (get("at_m") === "contains" || get("at_m") === "starts_with") initial.accountTypeMode = get("at_m") as any;
  if (get("lt"))    initial.locationType = csv(get("lt"));
  if (get("ams"))   initial.ams = csv(get("ams"));
  if (get("ams_m") === "exclude") initial.amsMode = "exclude";
  { const v = get("pmin"); if (v && Number(v) > 0) initial.premiumMin = v; }
  { const v = get("pmax"); if (v && Number(v) > 0) initial.premiumMax = v; }
  { const v = get("rmin"); if (v && Number(v) > 0) initial.revenueMin = v; }
  { const v = get("rmax"); if (v && Number(v) > 0) initial.revenueMax = v; }
  { const v = get("emin"); if (v && Number(v) > 0) initial.empMin = v; }
  { const v = get("emax"); if (v && Number(v) > 0) initial.empMax = v; }
  const minority = get("min");
  if (minority === "yes" || minority === "no") initial.minority = minority;
  // The form historically encodes account name as `an` + `an_m`, but earlier
  // iterations may have used `name`. Read both for backwards compat.
  const an = get("an") || get("name");
  if (an) initial.accountName = an;
  if (get("an_m") === "contains") initial.accountNameMode = "contains";
  if (get("mg"))    initial.mgmtLevels = csv(get("mg"));
  if (get("mg_m") === "exclude") initial.mgmtMode = "exclude";
  if (get("ct"))    initial.contactTitles = csv(get("ct"));
  if (get("ct_m") === "exclude") initial.contactTitleMode = "exclude";
  if (get("dp"))    initial.departments = csv(get("dp"));
  if (get("dp_m") === "exclude") initial.departmentsMode = "exclude";
  const country = get("c").toUpperCase();
  if (country === "CA") initial.country = "CA";
  else if (country === "US") initial.country = "US";
  if (get("st"))    initial.states = csv(get("st"));
  if (get("st_m") === "exclude") initial.statesMode = "exclude";
  if (get("mt"))    initial.metros = csv(get("mt"));
  if (get("mt_m") === "exclude") initial.metrosMode = "exclude";
  if (get("cr"))    initial.carriers = csv(get("cr"));
  if (get("cr_m") === "exclude") initial.carriersMode = "exclude";
  if (get("cr_c") === "and") initial.carriersCombo = "and";
  if (get("af"))    initial.affiliations = csv(get("af"));
  if (get("af_m") === "exclude") initial.affiliationsMode = "exclude";
  if (get("in"))    initial.industries = csv(get("in"));
  if (get("in_m") === "exclude") initial.industriesMode = "exclude";
  return initial;
}

export default async function BuildListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial = parseInitialFromSearchParams(sp);
  const supabase = await createClient();

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
    supabase.rpc("list_carriers_with_appointments"),
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
    carriers: (carriers.data ?? []).map((x: { id: string; name: string; group_name: string | null }) => ({ value: x.id, label: x.name, sublabel: x.group_name ?? undefined })),
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

        <BuildListForm data={data} initial={initial} />
      </div>
    </AppShell>
  );
}
