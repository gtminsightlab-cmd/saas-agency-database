import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import { Download } from "lucide-react";
import clsx from "clsx";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("downloads")
    .select("id,type,status,records_count,file_url,created_at,completed_at,saved_list_id")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900">Downloads</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your CSV export history. Large exports complete asynchronously and appear here when ready.
        </p>

        <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Records</th>
                <th className="px-4 py-3">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    No exports yet. Build a list and download it from the list&apos;s detail page.
                  </td>
                </tr>
              ) : (
                data!.map((d: any) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 text-gray-700">{new Date(d.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{(d.type ?? "").replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        d.status === "completed" && "bg-green-100 text-green-800",
                        d.status === "pending" && "bg-yellow-100 text-yellow-800",
                        d.status === "failed" && "bg-red-100 text-red-800",
                        !d.status && "bg-gray-100 text-gray-700"
                      )}>{d.status ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{d.records_count?.toLocaleString?.() ?? "—"}</td>
                    <td className="px-4 py-3">
                      {d.file_url ? (
                        <a href={d.file_url} className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium">
                          <Download className="h-4 w-4" /> Download
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
