import { AppShell } from "@/components/app/shell";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { DataTable } from "@/components/app/data-table";
import { createClient } from "@/lib/supabase/server";
import { Download } from "lucide-react";
import clsx from "clsx";

export const dynamic = "force-dynamic";

type DownloadRow = {
  id: string;
  type: string | null;
  status: string | null;
  records_count: number | null;
  file_url: string | null;
  created_at: string;
  completed_at: string | null;
  saved_list_id: string | null;
};

export default async function DownloadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("downloads")
    .select("id,type,status,records_count,file_url,created_at,completed_at,saved_list_id")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as DownloadRow[];

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { href: "/home", label: "Home" },
          { label: "Exports" },
        ]}
      />
      <PageHeader
        title="Exports"
        subtitle="Your CSV export history. Large exports (over 10,000 rows) complete asynchronously and appear here when ready."
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {rows.length === 0 ? (
          <DataTable
            state="empty"
            emptyHeading="No exports yet"
            emptyBody="Build a list and download it from the list's detail page to start an export."
          >
            <></>
          </DataTable>
        ) : (
          <DataTable>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Type</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Records</th>
                  <th scope="col" className="px-4 py-3">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">
                      {(d.type ?? "").replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          d.status === "completed" && "bg-green-100 text-green-800",
                          d.status === "pending" && "bg-yellow-100 text-yellow-800",
                          d.status === "failed" && "bg-red-100 text-red-800",
                          !d.status && "bg-gray-100 text-gray-700"
                        )}
                      >
                        {d.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {d.records_count?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {d.file_url ? (
                        <a
                          href={d.file_url}
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" /> Download
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </div>
    </AppShell>
  );
}
