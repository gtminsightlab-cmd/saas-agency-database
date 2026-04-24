import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function QuickSearchPage({
  searchParams
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? "").trim();
  const supabase = createClient();

  // Search Top 100 members as placeholder until the agencies table is populated.
  let results: { rank: number | null; agency_name: string; office_city: string | null; office_state: string | null }[] = [];
  let error: string | null = null;
  if (q) {
    const { data, error: e } = await supabase
      .from("top_agency_members")
      .select("rank, agency_name, office_city, office_state")
      .ilike("agency_name", `%${q}%`)
      .limit(20);
    results = data ?? [];
    if (e) error = e.message;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Quick Search</h1>
      <p className="text-sm text-gray-600">
        Jump to an agency by name. Once the full agencies table is populated,
        this will also match on DUNS and address.
      </p>

      <form className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Agency name…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-900"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      {q && results.length === 0 && !error && (
        <p className="text-sm text-gray-500">
          No matches for &ldquo;{q}&rdquo;. (Only the Top 100 list is searchable
          right now.)
        </p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {results.map((r) => (
            <li key={`${r.rank}-${r.agency_name}`} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium text-gray-900">{r.agency_name}</div>
                {(r.office_city || r.office_state) && (
                  <div className="text-xs text-gray-500">
                    {[r.office_city, r.office_state].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
              {r.rank != null && (
                <span className="rounded bg-brand-50 px-2 py-1 text-xs text-brand-600">
                  rank #{r.rank}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
