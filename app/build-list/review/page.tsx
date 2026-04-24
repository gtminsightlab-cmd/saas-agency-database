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

export default async function ReviewPage({
  searchParams
}: {
  searchParams: Record<string, string>;
}) {
  const supabase = createClient();

  const accountTypeIds = csv(searchParams.at);
  const carrierIds = csv(searchParams.cr);
  const affiliationIds = csv(searchParams.af);
  const stateIds = csv(searchParams.st);

  // Resolve selected IDs into human labels for the filter chips
  const [atRows, crRows, afRows, stRows] = await Promise.all([
    accountTypeIds.length
      ? supabase.from("account_types").select("id,label").in("id", accountTypeIds)
      : Promise.resolve({ data: [] }),
    carrierIds.length
      ? supabase.from("carriers").select("id,name").in("id", carrierIds).limit(10)
      : Promise.resolve({ data: [] }),
    affiliationIds.length
      ? supabase.from("affiliations").select("id,canonical_name").in("id", affiliationIds).limit(10)
      : Promise.resolve({ data: [] }),
    stateIds.length
      ? supabase.from("states").select("id,code,name").in("id", stateIds)
      : Promise.resolve({ data: [] })
  ]);

  const chips: { label: string; value: string }[] = [];
  if (stRows.data?.length) chips.push({ label: "States", value: stRows.data.map((r: any) => r.code).join(", ") });
  if (atRows.data?.length) chips.push({ label: "Agency Type", value: atRows.data.map((r: any) => r.label).join(", ") });
  if (crRows.data?.length) chips.push({ label: "Carriers", value: crRows.data.map((r: any) => r.name).slice(0, 3).join(", ") + (carrierIds.length > 3 ? ` +${carrierIds.length - 3}` : "") });
  if (afRows.data?.length) chips.push({ label: "Affiliations", value: afRows.data.map((r: any) => r.canonical_name).slice(0, 3).join(", ") + (affiliationIds.length > 3 ? ` +${affiliationIds.length - 3}` : "") });
  if (searchParams.an) chips.push({ label: "Account Name", value: searchParams.an });
  if (searchParams.min && searchParams.min !== "any") chips.push({ label: "Minority Owned", value: searchParams.min === "yes" ? "Yes" : "No" });

  // For now, the preview table comes from top_agency_members since actual
  // agencies data is not loaded yet. This gives the user something to review.
  const { data: previewRows, count: accountsCount } = await supabase
    .from("top_agency_members")
    .select("agency_name, office_city, office_state, pc_revenue, other_revenue, rank", { count: "exact" })
    .not("rank", "is", null)
    .order("rank", { ascending: true })
    .limit(25);

  const { count: contactsCount } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true });

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

        {/* Accounts / Contacts / Map tabs + counter */}
        <div className="mt-6 rounded-lg bg-brand-600 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <TabBadge label="Accounts" count={accountsCount ?? 0} active />
            <TabBadge label="Contacts" count={contactsCount ?? 0} />
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

        {/* Results table */}
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
              {(previewRows ?? []).map((r: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-700">{r.agency_name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">—</td>
                  <td className="px-4 py-3 text-gray-700">—</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                    {r.pc_revenue ? "$" + (Number(r.pc_revenue) / 1_000_000).toFixed(2) + "M" : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700">—</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.office_city ? `${r.office_city}, ${r.office_state ?? ""}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Preview rows come from the Top 100 list until the full agencies dataset is loaded. Accounts & contacts counts will reflect real filter matches once agency records are imported.
        </p>

        {/* Bottom action bar */}
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
