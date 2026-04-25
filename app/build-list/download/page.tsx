import Link from "next/link";
import { FileSpreadsheet, FileText, Printer, Lock } from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { ProgressStepper } from "@/components/build-list/progress-stepper";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const COUNTRY_MAP: Record<string, string> = { US: "USA", CA: "CAN" };

function csv(v: string | undefined) {
  return v ? v.split(",").filter(Boolean) : [];
}
function asNum(v: string | undefined) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: { id?: string; name?: string };
}) {
  const supabase = createClient();
  const listId = searchParams.id ?? null;
  const listName = searchParams.name ?? "Untitled list";

  // Get current user's entitlement
  const { data: ent } = await supabase
    .from("v_my_entitlement")
    .select("*")
    .maybeSingle();
  const canDownload =
    ent?.plan_code === "pro" &&
    ent?.status === "active" &&
    (ent?.downloads_remaining == null || ent.downloads_remaining > 0);
  const isFree = !ent || ent.plan_code === "free";

  // Resolve filters: if a saved_list_id was passed, read its filter_json.querystring;
  // otherwise leave qs empty (we'll show "no filters applied").
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
      const filterJson = (saved.filter_json ?? {}) as { querystring?: string };
      qs = new URLSearchParams(filterJson.querystring ?? "");
    }
  }

  // Build the filtered agencies query — mirrors /build-list/review/page.tsx
  const accountTypeIds = csv(qs.get("at") ?? undefined);
  const locationTypeIds = csv(qs.get("lt") ?? undefined);
  const amsIds = csv(qs.get("ams") ?? undefined);
  const country = qs.get("c");
  const stateIds = csv(qs.get("st") ?? undefined);
  const accountName = qs.get("name");
  const minority = qs.get("min");
  const premiumMin = asNum(qs.get("pmin") ?? undefined);
  const premiumMax = asNum(qs.get("pmax") ?? undefined);
  const revenueMin = asNum(qs.get("rmin") ?? undefined);
  const revenueMax = asNum(qs.get("rmax") ?? undefined);
  const empMin = asNum(qs.get("emin") ?? undefined);
  const empMax = asNum(qs.get("emax") ?? undefined);

  let q = supabase
    .from("agencies")
    .select(
      "id,name,city,state,revenue_total,employees_total,account_type_id,account_types(label)",
      { count: "exact" }
    )
    .order("name")
    .limit(25);

  if (accountTypeIds.length) q = q.in("account_type_id", accountTypeIds);
  if (locationTypeIds.length) q = q.in("location_type_id", locationTypeIds);
  if (amsIds.length) q = q.in("agency_mgmt_system_id", amsIds);
  if (country) q = q.eq("country", COUNTRY_MAP[country] ?? country);
  if (accountName) q = q.ilike("name", `%${accountName}%`);
  if (minority === "yes") q = q.eq("minority_owned", true);
  if (minority === "no") q = q.eq("minority_owned", false);
  if (premiumMin != null) q = q.gte("premium_pc", premiumMin);
  if (premiumMax != null) q = q.lte("premium_pc", premiumMax);
  if (revenueMin != null) q = q.gte("revenue_total", revenueMin);
  if (revenueMax != null) q = q.lte("revenue_total", revenueMax);
  if (empMin != null) q = q.gte("employees_total", empMin);
  if (empMax != null) q = q.lte("employees_total", empMax);

  // State filter via state_id lookup
  if (stateIds.length) {
    const { data: states } = await supabase
      .from("states")
      .select("code")
      .in("id", stateIds);
    const codes = (states ?? []).map((s: any) => s.code).filter(Boolean);
    if (codes.length) q = q.in("state", codes);
  }

  const { data: previewRows, count: accountsCount, error: previewErr } = await q;

  // Contacts count: limited to the filtered agency set when filters narrow things
  // down enough to bother. Otherwise fall back to total.
  let contactsCount = 0;
  if (accountsCount != null && accountsCount > 0 && accountsCount <= 50_000) {
    const { data: idsRows } = await supabase
      .from("agencies")
      .select("id")
      .limit(accountsCount > 0 ? accountsCount : 0)
      .order("name");
    const ids = (idsRows ?? []).map((r: any) => r.id);
    if (ids.length) {
      const { count } = await supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .in("agency_id", ids);
      contactsCount = count ?? 0;
    }
  } else {
    const { count } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true });
    contactsCount = count ?? 0;
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

        {/* Counter bar */}
        <div className="mt-6 rounded-lg bg-brand-600 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <TabBadge label="Accounts" count={accountsCount ?? 0} active />
            <TabBadge label="Contacts" count={contactsCount} />
            <TabBadge label="Map" count={null} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/80">Search Summary:</span>
            <button
              type="button"
              className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center"
              aria-label="Excel"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center"
              aria-label="PDF"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center"
              aria-label="Print"
            >
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
                        {r.revenue_total
                          ? "$" + (Number(r.revenue_total) / 1_000_000).toFixed(2) + "M"
                          : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">
                        {r.employees_total ?? "—"}
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

        {/* Entitlement gate */}
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
            <Link
              href="/saved-lists"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2"
            >
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

function TabBadge({
  label,
  count,
  active,
}: {
  label: string;
  count: number | null;
  active?: boolean;
}) {
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
