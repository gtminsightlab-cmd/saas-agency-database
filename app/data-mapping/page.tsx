import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DataMappingPage() {
  const supabase = await createClient();
  const { data: dict } = await supabase
    .from("data_dictionary_fields")
    .select("table_name, column_name, data_type, is_nullable, description")
    .order("table_name")
    .order("column_name");

  const grouped = (dict ?? []).reduce<Record<string, any[]>>((acc, f) => {
    acc[f.table_name] ??= [];
    acc[f.table_name].push(f);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Mapping</h1>
          <p className="mt-2 text-sm text-gray-600">
            Every column across the public tables, auto-populated from <code>information_schema</code>.
          </p>
        </div>
        {Object.keys(grouped).sort().map((tbl) => (
          <details key={tbl} className="rounded-lg border border-gray-200 bg-white open:shadow-sm">
            <summary className="cursor-pointer px-4 py-3 font-semibold text-gray-900">
              {tbl}{" "}
              <span className="text-xs font-normal text-gray-500">
                ({grouped[tbl].length} columns)
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
                  {grouped[tbl].map((f: any) => (
                    <tr key={`${f.table_name}-${f.column_name}`}>
                      <td className="px-4 py-2 font-mono text-xs text-gray-900">{f.column_name}</td>
                      <td className="px-4 py-2 text-gray-700">{f.data_type}</td>
                      <td className="px-4 py-2 text-gray-500">{f.is_nullable ? "yes" : "no"}</td>
                      <td className="px-4 py-2 text-gray-600">{f.description ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </AppShell>
  );
}
