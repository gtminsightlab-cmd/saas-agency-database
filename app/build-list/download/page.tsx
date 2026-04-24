import Link from "next/link";
import { FileSpreadsheet, FileText, Printer, Lock } from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { ProgressStepper } from "@/components/build-list/progress-stepper";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DownloadPage({
  searchParams
}: {
  searchParams: { id?: string; name?: string };
}) {
  const supabase = createClient();
  const listName = searchParams.name ?? "Untitled list";

  // Get current user's entitlement
  const { data: ent } = await supabase.from("v_my_entitlement").select("*").maybeSingle();
  const canDownload =
    ent?.plan_code === "pro" &&
    ent?.status === "active" &&
    (ent?.downloads_remaining == null || ent.downloads_remaining > 0);
  const isFree = !ent || ent.plan_code === "free";

  // Use the same preview as Review page
  const { data: previewRows, count: accountsCount } = await supabase
    .from("top_agency_members")
    .select("agency_name, office_city, office_state, pc_revenue, rank", { count: "exact" })
    .not("rank", "is", null)
    .order("rank", { ascending: true })
    .limit(25);

  const { count: contactsCount } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true });

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <ProgressStepper current="download" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{listName}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review your list below. Download and Export if satisfied, or Edit if more refinement is needed.
        </p>
        <p className="mt-1 text-xs text-gray-500 italic">
          If your AD List contains more than 10,000 Account or Contact records, it will be saved in the Downloads section of the application.
        </p>

        {/* Counter bar */}
        <div className="mt-6 rounded-lg bg-brand-600 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <TabBadge label="Accounts" count={accountsCount ?? 0} active />
            <TabBadge label="Contacts" count={contactsCount ?? 0} />
            <TabBadge label="Map" count={null} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/80">Search Summary:</span>
            <button className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-md bg-white/20 hover:bg-white/30 inline-flex items-center justify-center">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-b-lg border border-gray-200 border-t-0 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Account Type</th>
                <th className="px-4 py-3">Site Location</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3">Additional Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(previewRows ?? []).map((r: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium text-brand-700">{r.agency_name}</td>
                  <td className="px-4 py-3 text-gray-700">—</td>
                  <td className="px-4 py-3 text-gray-700">—</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                    {r.pc_revenue ? "$" + (Number(r.pc_revenue) / 1_000_000).toFixed(2) + "M" : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.office_city ? `${r.office_city}, ${r.office_state ?? ""}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
            <Link href="/saved-lists" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2">
              Edit List
            </Link>
            {canDownload ? (
              <button
                type="button"
                className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                disabled
                title="Wire to CSV export in the next pass"
              >
                Download &amp; Export
              </button>
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
