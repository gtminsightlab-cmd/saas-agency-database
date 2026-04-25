import Link from "next/link";
import { Pencil, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { ProgressStepper } from "@/components/build-list/progress-stepper";
import { createClient } from "@/lib/supabase/server";
import { SaveListButton } from "./save-button";

export const dynamic = "force-dynamic";

function csv(v: string | undefined) {
  return v ? v.split(",").filter(Boolean) : [];
}

function asNum(v: string | undefined) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default async function ReviewPage({
  searchParams
}: {
  searchParams: Record<string, string>;
}) {
  const supabase = createClient();

  // ---- parse filters ---------------------------------------------------
  const accountTypeIds = csv(searchParams.at);
  const locationTypeIds = csv(searchParams.lt);
  const amsIds = csv(searchParams.ams);
  const carrierIds = csv(searchParams.cr);
  const affiliationIds = csv(searchParams.af);
  const sicIds = csv(searchParams.in);
  const stateIds = csv(searchParams.st);
  const metroIds = csv(searchParams.mt);
  const premiumMin = asNum(searchParams.pmin);
  const premiumMax = asNum(searchParams.pmax);
  const revenueMin = asNum(searchParams.rmin);
  const revenueMax = asNum(searchParams.rmax);
  const empMin = asNum(searchParams.emin);
  const empMax = asNum(searchParams.emax);
  const minority = searchParams.min;
  const accountName = (searchParams.an ?? "").trim();
  const accountNameMode = searchParams.an_m ?? "contains";
  // Form passes 2-letter ISO codes (US, CA), DB stores 3-letter (USA, CAN).
  const countryRaw = (searchParams.c ?? 'US').toUpperCase();
  const country = countryRaw === 'US' ? 'USA' : countryRaw === 'CA' ? 'CAN' : countryRaw;

  // ---- Resolve state IDs -> codes, metro IDs -> names ------------------
  const [stRows, mtRows, atRows, crRows, afRows] = await Promise.all([
    stateIds.length
      ? supabase.from("states").select("id,code,name").in("id", stateIds)
      : Promise.resolve({ data: [] as { id: string; code: string; name: string }[] }),
    metroIds.length
      ? supabase.from("metro_areas").select("id,code,name").in("id", metroIds)
      : Promise.resolve({ data: [] as { id: string; code: string; name: string }[] }),
    accountTypeIds.length
      ? supabase.from("account_types").select("id,label").in("id", accountTypeIds)
      : Promise.resolve({ data: [] as { id: string; label: string }[] }),
    carrierIds.length
      ? supabase.from("carriers").select("id,name").in("id", carrierIds).limit(50)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    affiliationIds.length
      ? supabase.from("affiliations").select("id,canonical_name").in("id", affiliationIds).limit(50)
      : Promise.resolve({ data: [] as { id: string; canonical_name: string }[] })
  ]);

  const stateCodes = (stRows.data ?? []).map((r) => r.code);

  // ---- Resolve carrier/affiliation/SIC IDs -> agency_id sets via join tables
  // (PostgREST doesn't support cross-table EXISTS in a simple chain, so
  // pre-resolve to a list of agency_id values, then .in() on agencies.)
  const subFilters: string[][] = [];
  if (carrierIds.length) {
    const { data } = await supabase
      .from("agency_carriers")
      .select("agency_id")
      .in("carrier_id", carrierIds);
    subFilters.push(Array.from(new Set((data ?? []).map((r: any) => r.agency_id))));
  }
  if (affiliationIds.length) {
    const { data } = await supabase
      .from("agency_affiliations")
      .select("agency_id")
      .in("affiliation_id", affiliationIds);
    subFilters.push(Array.from(new Set((data ?? []).map((r: any) => r.agency_id))));
  }
  if (sicIds.length) {
    const { data } = await supabase
      .from("agency_sic_codes")
      .select("agency_id")
      .in("sic_code_id", sicIds);
    subFilters.push(Array.from(new Set((data ?? []).map((r: any) => r.agency_id))));
  }

  // intersect all sub-filter agency-id arrays
  let allowedAgencyIds: string[] | null = null;
  if (subFilters.length) {
    allowedAgencyIds = subFilters.reduce<string[]>((acc, set, idx) => {
      if (idx === 0) return set;
      const s = new Set(set);
      return acc.filter((id) => s.has(id));
    }, []);
    // Empty intersection means no possible match — short-circuit.
    if (allowedAgencyIds.length === 0) allowedAgencyIds = ["00000000-0000-0000-0000-000000000000"];
  }

  // ---- Build the agencies query ---------------------------------------
  const buildAgenciesQuery = (sel: string, withCount: boolean) => {
    let q = supabase.from("agencies").select(sel, withCount ? { count: "exact" } : {});
    if (accountTypeIds.length) q = q.in("account_type_id", accountTypeIds);
    if (locationTypeIds.length) q = q.in("location_type_id", locationTypeIds);
    if (amsIds.length) q = q.in("agency_mgmt_system_id", amsIds);
    if (premiumMin != null) q = q.gte("premium_volume", premiumMin);
    if (premiumMax != null) q = q.lte("premium_volume", premiumMax);
    if (revenueMin != null) q = q.gte("revenue", revenueMin);
    if (revenueMax != null) q = q.lte("revenue", revenueMax);
    if (empMin != null) q = q.gte("employees", empMin);
    if (empMax != null) q = q.lte("employees", empMax);
    if (minority === "yes") q = q.eq("minority_owned", true);
    if (minority === "no") q = q.eq("minority_owned", false);
    if (country) q = q.eq("country", country);
    if (stateCodes.length) q = q.in("state", stateCodes);
    if (accountName) {
      if (accountNameMode === "exact") q = q.eq("name", accountName);
      else if (accountNameMode === "starts_with") q = q.ilike("name", `${accountName}%`);
      else q = q.ilike("name", `%${accountName}%`);
    }
    if (allowedAgencyIds) q = q.in("id", allowedAgencyIds);
    return q;
  };

  // count + preview rows
  const [countRes, previewRes] = await Promise.all([
    buildAgenciesQuery("id", true).limit(1) as any,
    buildAgenciesQuery(
      "id, name, city, state, revenue, employees, account_type_id, account_types(label)",
      false
    )
      .order("name", { ascending: true })
      .limit(25) as any
  ]);

  const accountsCount: number = countRes.count ?? 0;

  // contacts count: limited to the same filtered agencies. If a huge result
  // set, just count contacts whose agency_id is in the filter; for unlimited
  // open queries, fall back to the global contacts total.
  let contactsCount = 0;
  if (allowedAgencyIds || accountTypeIds.length || locationTypeIds.length || amsIds.length ||
      premiumMin != null || premiumMax != null || revenueMin != null || revenueMax != null ||
      empMin != null || empMax != null || minority === "yes" || minority === "no" ||
      stateCodes.length || accountName) {
    // get the filtered agency ids (cap at 50K for safety)
    const { data: agencyIdsRows } = await buildAgenciesQuery("id", false).limit(50000);
    const agencyIds = (agencyIdsRows ?? []).map((r: any) => r.id);
    if (agencyIds.length) {
      const { count } = await supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .in("agency_id", agencyIds);
      contactsCount = count ?? 0;
    }
  } else {
    const { count } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true });
    contactsCount = count ?? 0;
  }

  // ---- chips for filters-applied row -----------------------------------
  const chips: { label: string; value: string }[] = [];
  if (stRows.data?.length) chips.push({ label: "States", value: stRows.data.map((r) => r.code).join(", ") });
  if (mtRows.data?.length) chips.push({ label: "Metros", value: mtRows.data.map((r) => r.name).slice(0, 3).join(", ") + (metroIds.length > 3 ? ` +${metroIds.length - 3}` : "") });
  if (atRows.data?.length) chips.push({ label: "Account Type", value: atRows.data.map((r) => r.label).join(", ") });
  if (crRows.data?.length) chips.push({ label: "Carriers", value: crRows.data.map((r) => r.name).slice(0, 3).join(", ") + (carrierIds.length > 3 ? ` +${carrierIds.length - 3}` : "") });
  if (afRows.data?.length) chips.push({ label: "Affiliations", value: afRows.data.map((r) => r.canonical_name).slice(0, 3).join(", ") + (affiliationIds.length > 3 ? ` +${affiliationIds.length - 3}` : "") });
  if (premiumMin != null || premiumMax != null) chips.push({ label: "Premium", value: `${premiumMin ?? 0}–${premiumMax ?? "∞"}` });
  if (revenueMin != null || revenueMax != null) chips.push({ label: "Revenue", value: `${revenueMin ?? 0}–${revenueMax ?? "∞"}` });
  if (empMin != null || empMax != null) chips.push({ label: "Employees", value: `${empMin ?? 0}–${empMax ?? "∞"}` });
  if (accountName) chips.push({ label: "Account Name", value: accountName });
  if (minority === "yes" || minority === "no") chips.push({ label: "Minority Owned", value: minority === "yes" ? "Yes" : "No" });

  const previewRows = (previewRes.data ?? []) as Array<{
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    revenue: number | null;
    employees: number | null;
    account_types: { label: string } | { label: string }[] | null;
  }>;

  const qs = new URLSearchParams(searchParams as any).toString();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <ProgressStepper current="review" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Review</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review your list below. Download and Export if satisfied, or Edit if more refinement is needed.
        </p>

        {chips.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
              Filters applied:
            </span>
            {chips.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1"
              >
                <span className="font-semibold text-gray-700">{c.label}:</span>
                <span className="text-gray-600">{c.value}</span>
              </span>
            ))}
            <Link href={`/build-list?${qs}`} className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold">
              <Pencil className="h-3.5 w-3.5" /> Edit Filters
            </Link>
          </div>
        )}

        <div className="mt-6 rounded-lg bg-brand-600 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <TabBadge label="Accounts" count={accountsCount} active />
            <TabBadge label="Contacts" count={contactsCount} />
            <TabBadge label="Map" count={null} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/80">Search Summary:</span>
            <button className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center" title="Export to Excel">
              <FileSpreadsheet className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center" title="Export to PDF">
              <FileText className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center" title="Print">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-0 overflow-x-auto rounded-b-lg border border-gray-200 border-t-0 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Account Type</th>
                <th className="px-4 py-3">Site Location</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Employees</th>
                <th className="px-4 py-3">Additional Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {previewRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No agencies match these filters. Try widening your criteria.
                  </td>
                </tr>
              )}
              {previewRows.map((r) => {
                const at = Array.isArray(r.account_types) ? r.account_types[0]?.label : r.account_types?.label;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-700">{r.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{at ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.city ? `${r.city}${r.state ? ", " + r.state : ""}` : (r.state ?? "—")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {r.revenue ? "$" + (Number(r.revenue) / 1_000_000).toFixed(2) + "M" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {r.employees ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">—</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {previewRows.length > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            Showing {previewRows.length} of {accountsCount.toLocaleString()} matching agencies. Download to export the full list.
          </p>
        )}

        <div className="sticky bottom-0 mt-6 -mx-4 sm:-mx-6 lg:-mx-8 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-4">
          <Link
            href={`/build-list?${qs}`}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2"
          >
            Edit List
          </Link>
          <SaveListButton filterQs={qs} />
        </div>
      </div>
    </AppShell>
  );
}

function TabBadge({ label, count, active }: { label: string; count: number | null; active?: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm " +
        (active ? "bg-white text-brand-700" : "bg-white/10 text-white hover:bg-white/20")
      }
    >
      <span className="font-semibold">{label}</span>
      {count != null && (
        <span
          className={
            "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs min-w-[2.5rem] " +
            (active ? "bg-brand-600 text-white" : "bg-white/20 text-white")
          }
        >
          {count.toLocaleString()}
        </span>
      )}
    </span>
  );
}
