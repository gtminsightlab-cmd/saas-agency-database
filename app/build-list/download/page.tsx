import Link from "next/link";
import { FileSpreadsheet, FileText, Printer, Lock } from "lucide-react";
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

function intersect<T>(sets: Array<Set<T>>): Set<T> {
  if (sets.length === 0) return new Set();
  const [first, ...rest] = sets;
  const out = new Set<T>(first);
  for (const s of rest) for (const v of out) if (!s.has(v)) out.delete(v);
  return out;
}

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: { id?: string; name?: string };
}) {
  const supabase = createClient();
  const listId = searchParams.id ?? null;
  const listName = searchParams.name ?? "Untitled list";

  const { data: ent } = await supabase
    .from("v_my_entitlement")
    .select("*")
    .maybeSingle();
  const canDownload =
    ent?.plan_code === "pro" &&
    ent?.status === "active" &&
    (ent?.downloads_remaining == null || ent.downloads_remaining > 0);
  const isFree = !ent || ent.plan_code === "free";

  // Resolve filters from saved_lists.filter_json
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

  // ---- Parse filters (same shape as /build-list/review) ------------------
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

  // ---- Resolve carrier/affiliation/SIC -> agency_id sets via join tables --
  const idSets: Array<Set<string>> = [];
  if (carrierIds.length) {
    const { data } = await supabase
      .from("agency_carriers")
      .select("agency_id")
      .in("carrier_id", carrierIds);
    idSets.push(new Set((data ?? []).map((r: any) => r.agency_id)));
  }
  if (affiliationIds.length) {
    const { data } = await supabase
      .from("agency_affiliations")
      .select("agency_id")
      .in("affiliation_id", affiliationIds);
    idSets.push(new Set((data ?? []).map((r: any) => r.agency_id)));
  }
  if (sicIds.length) {
    const { data } = await supabase
      .from("agency_sic_codes")
      .select("agency_id")
      .in("sic_code_id", sicIds);
    idSets.push(new Set((data ?? []).map((r: any) => r.agency_id)));
  }

  // Resolve state IDs to ISO codes
  let stateCodes: string[] = [];
  if (stateIds.length) {
    const { data: states } = await supabase
      .from("states")
      .select("code")
      .in("id", stateIds);
    stateCodes = (states ?? []).map((s: any) => s.code).filter(Boolean);
  }

  const allowedAgencyIds = idSets.length > 0 ? Array.from(intersect(idSets)) : null;

  // ---- Build agencies query (same column names review uses) ---------------
  let q = supabase
    .from("agencies")
    .select(
      "id, name, city, state, revenue, employees, account_type_id, account_types(label)",
      { count: "exact" }
    )
    .order("name")
    .limit(25);

  if (accountTypeIds.length) q = q.in("account_type_id", accountTypeIds);
  if (locationTypeIds.length) q = q.in("location_type_id", locationTypeIds);
  if (amsIds.length) q = q.in("agency_mgmt_system_id", amsIds);
  if (country) q = q.eq("country", COUNTRY_MAP[country] ?? country);
  if (stateCodes.length) q = q.in("state", stateCodes);
  if (accountName) q = q.ilike("name", `%${accountName}%`);
  if (minority === "yes") q = q.eq("minority_owned", true);
  if (minority === "no") q = q.eq("minority_owned", false);
  if (premiumMin != null) q = q.gte("premium_volume", premiumMin);
  if (premiumMax != null) q = q.lte("premium_volume", premiumMax);
  if (revenueMin != null) q = q.gte("revenue", revenueMin);
  if (revenueMax != null) q = q.lte("revenue", revenueMax);
  if (empMin != null) q = q.gte("employees", empMin);
  if (empMax != null) q = q.lte("employees", empMax);
  if (allowedAgencyIds) {
    if (allowedAgencyIds.length === 0) {
      q = q.eq("id", "00000000-0000-0000-0000-000000000000"); // no match shortcut
    } else {
      q = q.in("id", allowedAgencyIds);
    }
  }

  const { data: previewRows, count: accountsCount, error: previewErr } = await q;

  // Contacts count limited to the filtered agency set
  let contactsCount = 0;
  if (accountsCount && accountsCount > 0) {
    // Pull all matching agency IDs (full set, not just preview) for the contacts count
    let idQuery = supabase.from("agencies").select("id").limit(50_000);
    if (accountTypeIds.length) idQuery = idQuery.in("account_type_id", accountTypeIds);
    if (locationTypeIds.length) idQuery = idQuery.in("location_type_id", locationTypeIds);
    if (amsIds.length) idQuery = idQuery.in("agency_mgmt_system_id", amsIds);
    if (country) idQuery = idQuery.eq("country", COUNTRY_MAP[country] ?? country);
    if (stateCodes.length) idQuery = idQuery.in("state", stateCodes);
    if (accountName) idQuery = idQuery.ilike("name", `%${accountName}%`);
    if (minority === "yes") idQuery = idQuery.eq("minority_owned", true);
    if (minority === "no") idQuery = idQuery.eq("minority_owned", false);
    if (premiumMin != null) idQuery = idQuery.gte("premium_volume", premiumMin);
    if (premiumMax != null) idQuery = idQuery.lte("premium_volume", premiumMax);
    if (revenueMin != null) idQuery = idQuery.gte("revenue", revenueMin);
    if (revenueMax != null) idQuery = idQuery.lte("revenue", revenueMax);
    if (empMin != null) idQuery = idQuery.gte("employees", empMin);
    if (empMax != null) idQuery = idQuery.lte("employees", empMax);
    if (allowedAgencyIds) idQuery = idQuery.in("id", allowedAgencyIds.length ? allowedAgencyIds : ["00000000-0000-0000-0000-000000000000"]);
    const { data: idRows } = await idQuery;
    const ids = (idRows ?? []).map((r: any) => r.id);
    if (ids.length) {
      const { count } = await supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .in("agency_id", ids);
      contactsCount = count ?? 0;
    }
  }

  const exportHref = listId ? `/api/export?list=${encodeURIComponent(listId)}` : null;

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
            <TabBadge label="Accounts" count={accountsCount ?? 0} active />
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
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Account Type</th>
                <th className="px-4 py-3">Site Location</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3">Employees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(previewRows ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No agencies match this list&rsquo;s filters.
                  </td>
                </tr>
              ) : (
                (previewRows ?? []).map((r: any) => {
                  const at = Array.isArray(r.account_types)
                    ? r.account_types[0]?.label
                    : r.account_types?.label;
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium text-brand-700">{r.name}</td>
                      <td className="px-4 py-3 text-gray-700">{at ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.city ? `${r.city}, ${r.state ?? ""}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {r.revenue
                          ? "$" + (Number(r.revenue) / 1_000_000).toFixed(2) + "M"
                          : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">
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
          Showing {(previewRows ?? []).length} of {accountsCount ?? 0} matching agencies. Download
          to export the full list.
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
