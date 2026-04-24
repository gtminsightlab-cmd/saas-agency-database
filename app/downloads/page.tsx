import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("downloads")
    .select("id, name, kind, row_count, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Downloads</h1>
      <p className="text-sm text-gray-600">
        Export history — CSVs, contact rosters, etc. Row-level security limits
        this list to your tenant.
      </p>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      {(data ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No exports yet. Build a list and download it from the list&apos;s detail
          page.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Name</th>
                <th className="px-3 py-2 font-medium text-gray-700">Type</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">
                  Rows
                </th>
                <th className="px-3 py-2 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data!.map((d) => (
                <tr key={d.id}>
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {d.name}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{d.kind}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                    {d.row_count?.toLocaleString?.() ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
