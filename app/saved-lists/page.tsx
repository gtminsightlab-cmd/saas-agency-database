import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SavedListsPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_lists")
    .select("id, name, description, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Saved Lists</h1>
      <p className="text-sm text-gray-600">
        Your saved search definitions. They live in the <code>saved_lists</code>{" "}
        table, scoped to your tenant via RLS.
      </p>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      {(data ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          You haven&apos;t saved any lists yet. Build one on the{" "}
          <a href="/build-list" className="text-brand-600 underline">
            Build a List
          </a>{" "}
          page and save it here.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {data!.map((l) => (
            <li key={l.id} className="p-4">
              <div className="font-medium text-gray-900">{l.name}</div>
              {l.description && (
                <div className="text-sm text-gray-600">{l.description}</div>
              )}
              <div className="mt-1 text-xs text-gray-400">
                saved {new Date(l.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
