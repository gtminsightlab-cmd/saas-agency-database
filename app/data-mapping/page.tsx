import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DataMappingPage() {
  const supabase = createClient();

  const { data: dict, error } = await supabase
    .from("data_dictionary_fields")
    .select("table_name, column_name, data_type, is_nullable, description")
    .order("table_name")
    .order("column_name");

  // group by table_name for display
  const grouped = (dict ?? []).reduce<Record<string, typeof dict>>((acc, f) => {
    acc[f.table_name] ??= [];
    acc[f.table_name]!.push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Data Mapping</h1>
      <p className="text-sm text-gray-600">
        Every column across the 22 public tables, auto-populated from
        <code className="mx-1">information_schema</code>. Use this as the
        source of truth when matching uploaded files to database fields.
      </p>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      {Object.keys(grouped)
        .sort()
        .map((tbl) => (
          <details
            key={tbl}
            className="rounded-lg border border-gray-200 bg-white open:shadow-sm"
          >
            <summary className="cursor-pointer px-4 py-3 font-semibold text-gray-900">
              {tbl}{" "}
              <span className="text-xs font-normal text-gray-500">
                ({grouped[tbl]!.length} columns)
              </span>
            </summary>
            <div className="overflow-x-auto border-t border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Column</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Nullable</th>
                    <th className="px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {grouped[tbl]!.map((f) => (
                    <tr key={`${f.table_name}-${f.column_name}`}>
                      <td className="px-4 py-2 font-mono text-xs text-gray-900">
                        {f.column_name}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{f.data_type}</td>
                      <td className="px-4 py-2 text-gray-500">
                        {f.is_nullable ? "yes" : "no"}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {f.description ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
    </div>
  );
}
