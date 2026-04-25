import Link from "next/link";
import { Pencil, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { SortableThLink, type SortDir } from "@/components/sortable-th";
import { AppShell } from "@/components/app/shell";
import { ProgressStepper } from "@/components/build-list/progress-stepper";
import { createClient } from "@/lib/supabase/server";
import { enforceUsageOrRedirect } from "@/lib/usage/enforce";
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

// ---- Sort definitions -------------------------------------------------------
type AccountSortKey = "name" | "account_type" | "location" | "location_type" | "revenue" | "employees";
type ContactSortKey = "last_name" | "email" | "mobile" | "agency" | "account_type" | "location";

const VALID_ACCOUNT_SORTS = new Set<AccountSortKey>([
  "name", "account_type", "location", "location_type", "revenue", "employees",
]);
const VALID_CONTACT_SORTS = new Set<ContactSortKey>([
  "last_name", "email", "mobile", "agency", "account_type", "location",
]);

function pickAccountSort(v: string | undefined): AccountSortKey {
  return v && VALID_ACCOUNT_SORTS.has(v as AccountSortKey) ? (v as AccountSortKey) : "name";
}
function pickContactSort(v: string | undefined): ContactSortKey {
  return v && VALID_CONTACT_SORTS.has(v as ContactSortKey) ? (v as ContactSortKey) : "last_name";
}
function pickDir(v: string | undefined): SortDir {
  return v === "desc" ? "desc" : "asc";
}

const ACCOUNT_LABEL: Record<AccountSortKey, string> = {
  name: "Account",
  account_type: "Account Type",
  location: "Site Location",
  location_type: "Location Type",
  revenue: "Revenue",
  employees: "Employees",
};

export default async function ReviewPage({
  searchParams
}: {
  searchParams: Record<string, string>;
}) {
  const supabase = createClient();

  const usageResult = await enforceUsageOrRedirect("search", 1, {
    route: "/build-list/review",
    filter_keys: Object.keys(searchParams).filter((k) => k !== "sort" && k !== "dir" && k !== "tab").sort(),
  });
  const softOver = usageResult?.status === "soft_over";

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
  const countryRaw = (searchParams.c ?? 'US').toUpperCase();
  const country = countryRaw === 'US' ? 'USA' : countryRaw === 'CA' ? 'CAN' : countryRaw;

  const tab = (searchParams.tab ?? "accounts") as "accounts" | "contacts" | "map";
  const dir: SortDir = pickDir(searchParams.dir);
  const accountSort: AccountSortKey = pickAccountSort(searchParams.sort);
  const contactSort: ContactSortKey = pickContactSort(searchParams.sort);

  const { data: { user: authUser } } = await supabase.auth.getUser();
  let canRevealContactPii = false;
  if (authUser) {
    const { data: appUser } = await supabase
      .from("app_users")
      .select("id,is_super_admin")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();
    if (appUser?.is_super_admin) {
      canRevealContactPii = true;
    } else if (appUser?.id) {
      const { data: ent } = await supabase
        .from("user_entitlements")
        .select("id,status")
        .eq("app_user_id", appUser.id)
        .in("status", ["active", "trialing"])
        .limit(1)
        .maybeSingle();
      if (ent) canRevealContactPii = true;
    }
  }

  // ---- Resolve state IDs -> codes, etc. -----------------------------
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

  let allowedAgencyIds: string[] | null = null;
  if (subFilters.length) {
    allowedAgencyIds = subFilters.reduce<string[]>((acc, set, idx) => {
      if (idx === 0) return set;
      const s = new Set(set);
      return acc.filter((id) => s.has(id));
    }, []);
    if (allowedAgencyIds.length === 0) allowedAgencyIds = ["00000000-0000-0000-0000-000000000000"];
  }

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

  // count + preview rows. The preview SELECT includes location_types so we
  // can render + sort by Location Type.
  const ascending = dir === "asc";
  const previewQueryBuilder = () => {
    let q = buildAgenciesQuery(
      "id, name, city, state, revenue, employees, account_type_id, account_types(label), location_type_id, location_types(name)",
      false
    );
    switch (accountSort) {
      case "name":
        q = q.order("name", { ascending });
        break;
      case "account_type":
        q = q.order("label", { foreignTable: "account_types", ascending, nullsFirst: false }).order("name", { ascending: true });
        break;
      case "location":
        q = q.order("state", { ascending, nullsFirst: false }).order("city", { ascending, nullsFirst: false }).order("name", { ascending: true });
        break;
      case "location_type":
        q = q.order("name", { foreignTable: "location_types", ascending, nullsFirst: false }).order("name", { ascending: true });
        break;
      case "revenue":
        q = q.order("revenue", { ascending, nullsFirst: false }).order("name", { ascending: true });
        break;
      case "employees":
        q = q.order("employees", { ascending, nullsFirst: false }).order("name", { ascending: true });
        break;
    }
    return q.limit(25);
  };

  const [countRes, previewRes] = await Promise.all([
    buildAgenciesQuery("id", true).limit(1) as any,
    previewQueryBuilder() as any,
  ]);

  const accountsCount: number = countRes.count ?? 0;

  let contactsCount = 0;
  if (allowedAgencyIds || accountTypeIds.length || locationTypeIds.length || amsIds.length ||
      premiumMin != null || premiumMax != null || revenueMin != null || revenueMax != null ||
      empMin != null || empMax != null || minority === "yes" || minority === "no" ||
      stateCodes.length || accountName) {
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
    location_types: { name: string } | { name: string }[] | null;
  }>;

  // Edit Filters URL strips sort/dir/tab so reopening Build List doesn't carry table state.
  const editFiltersQs = (() => {
    const sp = new URLSearchParams(searchParams as any);
    sp.delete("sort"); sp.delete("dir"); sp.delete("tab");
    return sp.toString();
  })();

  // Tab href preserves filters but resets sort to default (each tab has its own sort namespace).
  const tabHref = (next: "accounts" | "contacts" | "map") => {
    const sp = new URLSearchParams(searchParams as any);
    sp.delete("sort"); sp.delete("dir");
    if (next === "accounts") sp.delete("tab");
    else sp.set("tab", next);
    const q = sp.toString();
    return q ? `/build-list/review?${q}` : `/build-list/review`;
  };

  // Sort header href — preserves everything (filters + tab), toggles sort+dir.
  const sortHref = (key: string) => {
    const sp = new URLSearchParams(searchParams as any);
    if (sp.get("sort") === key) {
      sp.set("sort", key);
      sp.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      sp.set("sort", key);
      sp.set("dir", "asc");
    }
    return `/build-list/review?${sp.toString()}`;
  };

  type ContactRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    title: string | null;
    email_primary: string | null;
    mobile_phone: string | null;
    city: string | null;
    state: string | null;
    address_1: string | null;
    agency_id: string;
    agencies: { id: string; name: string; account_type_id: string | null; account_types: { label: string } | { label: string }[] | null } | null;
  };
  let contactRows: ContactRow[] = [];
  if (tab === "contacts") {
    let agencyIdsForContacts: string[] | null = null;
    if (allowedAgencyIds || accountTypeIds.length || locationTypeIds.length || amsIds.length ||
        premiumMin != null || premiumMax != null || revenueMin != null || revenueMax != null ||
        empMin != null || empMax != null || minority === "yes" || minority === "no" ||
        stateCodes.length || accountName) {
      const { data: agencyIdsRows } = await buildAgenciesQuery("id", false).limit(50000);
      agencyIdsForContacts = (agencyIdsRows ?? []).map((r: any) => r.id);
    }
    let q = supabase
      .from("contacts")
      .select(
        "id, first_name, last_name, title, email_primary, mobile_phone, city, state, address_1, agency_id, agencies!inner(id, name, account_type_id, account_types(label))"
      )
      .limit(50);

    switch (contactSort) {
      case "last_name":
        q = q.order("last_name", { ascending, nullsFirst: false }).order("first_name", { ascending: true });
        break;
      case "email":
        q = q.order("email_primary", { ascending, nullsFirst: false }).order("last_name", { ascending: true });
        break;
      case "mobile":
        q = q.order("mobile_phone", { ascending, nullsFirst: false }).order("last_name", { ascending: true });
        break;
      case "agency":
        q = q.order("name", { foreignTable: "agencies", ascending, nullsFirst: false }).order("last_name", { ascending: true });
        break;
      case "account_type":
        q = q.order("last_name", { ascending, nullsFirst: false }).order("first_name", { ascending: true });
        break;
      case "location":
        q = q.order("state", { ascending, nullsFirst: false }).order("city", { ascending, nullsFirst: false });
        break;
    }

    if (agencyIdsForContacts) {
      if (agencyIdsForContacts.length === 0) q = q.eq("agency_id", "00000000-0000-0000-0000-000000000000");
      else q = q.in("agency_id", agencyIdsForContacts);
    }
    const { data: cRows } = await q;
    contactRows = (cRows ?? []) as unknown as ContactRow[];
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <ProgressStepper current="review" />
        </div>

        {softOver && usageResult?.effective_cap != null && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong className="font-semibold">Heads up:</strong> you&rsquo;re past your soft monthly search limit
            ({usageResult.current_usage} of {usageResult.effective_cap}). Searches still work — no hard block — but
            an admin will see this on their alerts page.
          </div>
        )}

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
            <Link href={`/build-list?${editFiltersQs}`} className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold">
              <Pencil className="h-3.5 w-3.5" /> Edit Filters
            </Link>
          </div>
        )}

        <div className="mt-6 rounded-lg bg-brand-600 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <TabBadge label="Accounts" count={accountsCount} active={tab === "accounts"} href={tabHref("accounts")} />
            <TabBadge label="Contacts" count={contactsCount} active={tab === "contacts"} href={tabHref("contacts")} />
            <TabBadge label="Map" count={null} active={tab === "map"} href={tabHref("map")} />
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

        {tab === "accounts" && (
        <div className="mt-0 overflow-x-auto rounded-b-lg border border-gray-200 border-t-0 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <SortableThLink label="Account"        sortKey="name"          activeSort={accountSort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Account Type"   sortKey="account_type"  activeSort={accountSort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Site Location"  sortKey="location"      activeSort={accountSort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Location Type"  sortKey="location_type" activeSort={accountSort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Revenue"        sortKey="revenue"       activeSort={accountSort} dir={dir} hrefFor={sortHref} align="right" />
                <SortableThLink label="Employees"      sortKey="employees"     activeSort={accountSort} dir={dir} hrefFor={sortHref} align="right" />
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
                const lt = Array.isArray(r.location_types) ? r.location_types[0]?.name : r.location_types?.name;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-700">{r.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{at ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.city ? `${r.city}${r.state ? ", " + r.state : ""}` : (r.state ?? "—")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{lt ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {r.revenue ? "$" + (Number(r.revenue) / 1_000_000).toFixed(2) + "M" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {r.employees ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {previewRows.length > 0 && (
            <p className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
              Showing {previewRows.length} of {accountsCount} matching agencies, sorted by{" "}
              <span className="font-semibold">{ACCOUNT_LABEL[accountSort]}</span>{" "}
              <span className="font-semibold">{dir === "asc" ? "↑" : "↓"}</span>.
            </p>
          )}
        </div>
        )}

        {tab === "contacts" && (
          <div className="mt-0 overflow-x-auto rounded-b-lg border border-gray-200 border-t-0 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <SortableThLink label="Contact"        sortKey="last_name"   activeSort={contactSort} dir={dir} hrefFor={sortHref} />
                  <SortableThLink label="Email Address"  sortKey="email"       activeSort={contactSort} dir={dir} hrefFor={sortHref} />
                  <SortableThLink label="Mobile Number"  sortKey="mobile"      activeSort={contactSort} dir={dir} hrefFor={sortHref} />
                  <SortableThLink label="Account"        sortKey="agency"      activeSort={contactSort} dir={dir} hrefFor={sortHref} />
                  <th className="px-4 py-3">Account Type</th>
                  <SortableThLink label="Site Location"  sortKey="location"    activeSort={contactSort} dir={dir} hrefFor={sortHref} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contactRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">
                      No contacts match these filters.
                    </td>
                  </tr>
                )}
                {contactRows.map((c) => {
                  const agency = c.agencies;
                  const at = agency?.account_types
                    ? Array.isArray(agency.account_types) ? agency.account_types[0]?.label : agency.account_types.label
                    : null;
                  const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ") || "—";
                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-brand-700">{fullName}</div>
                        {c.title && <div className="text-xs text-gray-500">{c.title}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <ContactPiiCell value={c.email_primary} reveal={canRevealContactPii} kind="email" />
                      </td>
                      <td className="px-4 py-3">
                        <ContactPiiCell value={c.mobile_phone} reveal={canRevealContactPii} kind="mobile" />
                      </td>
                      <td className="px-4 py-3 text-gray-700">{agency?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{at ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.address_1 ? (
                          <div>
                            <div>{c.address_1}</div>
                            <div className="text-xs text-gray-500">
                              {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                            </div>
                          </div>
                        ) : (
                          [c.city, c.state].filter(Boolean).join(", ") || "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "map" && (
          <div className="mt-0 rounded-b-lg border border-gray-200 border-t-0 bg-white p-12 text-center text-sm text-gray-500">
            Map view coming soon.
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <SaveListButton filterQs={editFiltersQs} />
        </div>
      </div>
    </AppShell>
  );
}


function TabBadge({
  label, count, active, href,
}: {
  label: string;
  count: number | null;
  active?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={"inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors " + (active ? "bg-white text-brand-700" : "bg-white/10 text-white hover:bg-white/20")}
    >
      <span className="font-semibold">{label}</span>
      {count != null && (
        <span className={"inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs min-w-[2.5rem] " + (active ? "bg-brand-600 text-white" : "bg-white/20 text-white")}>
          {count.toLocaleString()}
        </span>
      )}
    </Link>
  );
}

function ContactPiiCell({ value, reveal, kind }: { value: string | null; reveal: boolean; kind: "email" | "mobile" }) {
  if (!value) return <span className="text-gray-400">—</span>;
  if (reveal) {
    if (kind === "email") {
      return <a href={`mailto:${value}`} className="text-brand-700 hover:text-brand-800 underline-offset-2 hover:underline">{value}</a>;
    }
    return <a href={`tel:${value}`} className="text-brand-700 hover:text-brand-800 underline-offset-2 hover:underline">{value}</a>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-xs">
      Available — hidden
    </span>
  );
}
