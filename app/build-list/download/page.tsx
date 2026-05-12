import Link from "next/link";
import { FileSpreadsheet, FileText, Printer, Lock } from "lucide-react";
import { SortableThLink, type SortDir } from "@/components/sortable-th";
import { AppShell } from "@/components/app/shell";
import { ProgressStepper } from "@/components/build-list/progress-stepper";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COUNTRY_MAP: Record<string, string> = { US: "USA", CA: "CAN" };

function csv(v: string | undefined | null) {
  return v ? v.split(",").filter(Boolean) : [];
}
function asNum(v: string | undefined | null) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---- Sort definitions -------------------------------------------------------
type SortKey = "name" | "account_type" | "location" | "location_type" | "revenue" | "employees";

const VALID_SORTS = new Set<SortKey>([
  "name", "account_type", "location", "location_type", "revenue", "employees",
]);

function pickSort(v: string | undefined): SortKey {
  return v && VALID_SORTS.has(v as SortKey) ? (v as SortKey) : "name";
}
function pickDir(v: string | undefined): SortDir {
  return v === "desc" ? "desc" : "asc";
}

export default async function DownloadPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ id?: string; name?: string; sort?: string; dir?: string }>;
}) {
  const searchParams = await _searchParams;
  const supabase = await createClient();
  const listId = searchParams.id ?? null;
  const listName = searchParams.name ?? "Untitled list";
  const sort: SortKey = pickSort(searchParams.sort);
  const dir: SortDir = pickDir(searchParams.dir);

  const { data: ent } = await supabase
    .from("v_my_entitlement")
    .select("*")
    .maybeSingle();
  const canDownload =
    ent?.plan_code === "pro" &&
    ent?.status === "active" &&
    (ent?.downloads_remaining == null || ent.downloads_remaining > 0);
  const isFree = !ent || ent.plan_code === "free";

  let qs = new URLSearchParams();
  let savedList: { id: string; name: string } | null = null;
  if (listId) {
    const { data: saved } = await supabase
      .from("saved_lists")
      .select("id,name,filter_json")
      .eq("id", listId)
      .maybeSingle();
    if (saved) {
      savedList = { id: saved.id, name: saved.name };
      const fj = (saved.filter_json ?? {}) as { querystring?: string };
      qs = new URLSearchParams(fj.querystring ?? "");
    }
  }

  const accountTypeIds = csv(qs.get("at"));
  const locationTypeIds = csv(qs.get("lt"));
  const amsIds = csv(qs.get("ams"));
  const carrierIds = csv(qs.get("cr"));
  const affiliationIds = csv(qs.get("af"));
  const sicIds = csv(qs.get("in"));
  const country = qs.get("c");
  const stateIds = csv(qs.get("st"));
  const accountName = qs.get("name");
  const minority = qs.get("min");
  const premiumMin = asNum(qs.get("pmin"));
  const premiumMax = asNum(qs.get("pmax"));
  const revenueMin = asNum(qs.get("rmin"));
  const revenueMax = asNum(qs.get("rmax"));
  const empMin = asNum(qs.get("emin"));
  const empMax = asNum(qs.get("emax"));

  let stateCodes: string[] = [];
  if (stateIds.length) {
    const { data: states } = await supabase
      .from("states")
      .select("code")
      .in("id", stateIds);
    stateCodes = (states ?? []).map((s: any) => s.code).filter(Boolean);
  }

  // All filters resolved server-side via RPC. Replaces the broken JS pattern
  // that materialized agency_ids client-side and blew up the URL with .in()
  // when a high-count carrier (e.g. Safeco at 6,647) was filtered.
  const ascending = dir === "asc";
  const rpcFilters = {
    p_carrier_ids:        carrierIds.length        ? carrierIds        : null,
    p_affiliation_ids:    affiliationIds.length    ? affiliationIds    : null,
    p_sic_ids:            sicIds.length            ? sicIds            : null,
    p_account_type_ids:   accountTypeIds.length    ? accountTypeIds    : null,
    p_location_type_ids:  locationTypeIds.length   ? locationTypeIds   : null,
    p_ams_ids:            amsIds.length            ? amsIds            : null,
    p_state_codes:        stateCodes.length        ? stateCodes        : null,
    p_country:            country ? (COUNTRY_MAP[country] ?? country) : null,
    p_premium_min:        premiumMin,
    p_premium_max:        premiumMax,
    p_revenue_min:        revenueMin,
    p_revenue_max:        revenueMax,
    p_emp_min:            empMin,
    p_emp_max:            empMax,
    p_minority:           minority === "yes" ? true : minority === "no" ? false : null,
    p_account_name:       accountName || null,
    p_account_name_mode:  "contains",
  };

  const [previewRes, contactsCountRes] = await Promise.all([
    supabase.rpc("search_agencies_for_filters", {
      ...rpcFilters,
      p_sort:   sort,
      p_dir:    ascending ? "asc" : "desc",
      p_offset: 0,
      p_limit:  25,
    }),
    supabase.rpc("count_contacts_for_filters", rpcFilters),
  ]);

  const previewErr = previewRes.error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewRpcRows = (previewRes.data ?? []) as any[];
  const accountsCount: number = previewRpcRows.length > 0
    ? Number(previewRpcRows[0].total_count ?? 0)
    : 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewRows = previewRpcRows.map((r: any) => ({
    id: r.id,
    name: r.name,
    city: r.city,
    state: r.state,
    revenue: r.revenue,
    employees: r.employees,
    account_types: r.account_type_label ? { label: r.account_type_label } : null,
    location_types: r.location_type_name ? { name: r.location_type_name } : null,
  }));
  const contactsCount: number = Number(contactsCountRes.data ?? 0);

  const exportHref = listId ? `/api/export?list=${encodeURIComponent(listId)}` : null;

  // Build a sortable-header href that preserves existing searchParams + toggles sort/dir.
  function sortHref(key: SortKey): string {
    const params = new URLSearchParams();
    if (listId) params.set("id", listId);
    if (searchParams.name) params.set("name", searchParams.name);
    if (key === sort) {
      // Same column — toggle direction
      params.set("sort", key);
      params.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      // New column — start ascending
      params.set("sort", key);
      params.set("dir", "asc");
    }
    return `/build-list/download?${params.toString()}`;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <ProgressStepper current="download" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{savedList?.name ?? listName}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review your list below. Download and Export if satisfied, or Edit if more refinement is
          needed.
        </p>
        <p className="mt-1 text-xs text-gray-500 italic">
          If your AD List contains more than 10,000 Account or Contact records, it will be saved in
          the Downloads section of the application.
        </p>

        <div className="mt-6 rounded-lg bg-brand-600 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <TabBadge label="Accounts" count={accountsCount} active />
            <TabBadge label="Contacts" count={contactsCount} />
            <TabBadge label="Map" count={null} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/80">Search Summary:</span>
            <button type="button" className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center" aria-label="Excel">
              <FileSpreadsheet className="h-4 w-4" />
            </button>
            <button type="button" className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center" aria-label="PDF">
              <FileText className="h-4 w-4" />
            </button>
            <button type="button" className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {previewErr && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load preview: {previewErr.message}
          </div>
        )}

        <div className="overflow-x-auto rounded-b-lg border border-gray-200 border-t-0 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <SortableThLink label="Account"       sortKey="name"          activeSort={sort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Account Type"  sortKey="account_type"  activeSort={sort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Site Location" sortKey="location"      activeSort={sort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Location Type" sortKey="location_type" activeSort={sort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Revenue"       sortKey="revenue"       activeSort={sort} dir={dir} hrefFor={sortHref} align="right" />
                <SortableThLink label="Employees"     sortKey="employees"     activeSort={sort} dir={dir} hrefFor={sortHref} align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(previewRows ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No agencies match this list&rsquo;s filters.
                  </td>
                </tr>
              ) : (
                (previewRows ?? []).map((r: any) => {
                  const at = Array.isArray(r.account_types)
                    ? r.account_types[0]?.label
                    : r.account_types?.label;
                  const lt = Array.isArray(r.location_types)
                    ? r.location_types[0]?.name
                    : r.location_types?.name;
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium text-brand-700">{r.name}</td>
                      <td className="px-4 py-3 text-gray-700">{at ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.city ? `${r.city}, ${r.state ?? ""}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lt ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {r.revenue
                          ? "$" + (Number(r.revenue) / 1_000_000).toFixed(2) + "M"
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {r.employees ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Showing {(previewRows ?? []).length} of {accountsCount} matching agencies
          {(previewRows ?? []).length > 0 && (
            <>
              , sorted by <span className="font-semibold">{LABEL[sort]}</span>
              {" "}
              <span className="font-semibold">{dir === "asc" ? "↑" : "↓"}</span>
            </>
          )}
          . Download to export the full list.
        </p>

        <div className="sticky bottom-0 mt-6 -mx-4 sm:-mx-6 lg:-mx-8 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {canDownload ? (
              <>
                You have{" "}
                <span className="font-semibold text-gray-900">
                  {ent?.downloads_remaining ?? "unlimited"}
                </span>{" "}
                downloads remaining on your {ent?.plan_name ?? "plan"}.
              </>
            ) : isFree ? (
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-gray-400" />
                Download requires a paid plan or a one-time purchase.
              </span>
            ) : (
              "Your plan does not include more downloads this period."
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/saved-lists" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2">
              Edit List
            </Link>
            {canDownload && exportHref ? (
              <a
                href={exportHref}
                className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Download &amp; Export
              </a>
            ) : (
              <Link
                href="/#pricing"
                className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Upgrade to download
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const LABEL: Record<SortKey, string> = {
  name: "Account",
  account_type: "Account Type",
  location: "Site Location",
  location_type: "Location Type",
  revenue: "Revenue",
  employees: "Employees",
};


function TabBadge({ label, count, active }: { label: string; count: number | null; active?: boolean }) {
  return (
    <span className={"inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm " + (active ? "bg-white text-brand-700" : "bg-white/10 text-white hover:bg-white/20")}>
      <span className="font-semibold">{label}</span>
      {count != null && (
        <span className={"inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs min-w-[2.5rem] " + (active ? "bg-brand-600 text-white" : "bg-white/20 text-white")}>
          {count.toLocaleString()}
        </span>
      )}
    </span>
  );
}
