import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BuildListPage() {
  const supabase = createClient();

  const [statesRes, carriersRes, affiliationsRes, listsRes] = await Promise.all([
    supabase
      .from("top_agency_members")
      .select("office_state")
      .not("office_state", "is", null),
    supabase.from("carriers").select("group_name").order("group_name"),
    supabase
      .from("affiliations")
      .select("canonical_name, type")
      .order("canonical_name"),
    supabase.from("top_agency_lists").select("name, year").order("name")
  ]);

  // dedupe / count for each filter dimension so the page shows meaningful facets
  const stateCounts = countBy(
    (statesRes.data ?? []).map((r) => r.office_state as string)
  );
  const carrierGroups = Array.from(
    new Set((carriersRes.data ?? []).map((r) => r.group_name as string))
  );
  const affiliations = affiliationsRes.data ?? [];
  const lists = listsRes.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Build a List</h1>
      <p className="text-sm text-gray-600">
        Pick filters, preview matches, and save the list. Interactive filter
        engine is next up — this page currently shows the available filter
        universe pulled live from Supabase.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <FacetCard title="Carrier groups" count={carrierGroups.length}>
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {carrierGroups.slice(0, 40).map((g) => (
              <li key={g} className="text-gray-700">{g}</li>
            ))}
          </ul>
        </FacetCard>

        <FacetCard title="Affiliations" count={affiliations.length}>
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {affiliations.slice(0, 40).map((a) => (
              <li key={a.canonical_name} className="text-gray-700">
                {a.canonical_name}{" "}
                <span className="text-xs text-gray-400">({a.type})</span>
              </li>
            ))}
          </ul>
        </FacetCard>

        <FacetCard title="Top lists" count={lists.length}>
          <ul className="space-y-1 text-sm">
            {lists.map((l) => (
              <li key={l.name} className="text-gray-700">
                {l.name} {l.year && <span className="text-gray-400">({l.year})</span>}
              </li>
            ))}
          </ul>
        </FacetCard>

        <FacetCard
          title="States represented (from Top 100)"
          count={Object.keys(stateCounts).length}
        >
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {Object.entries(stateCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 30)
              .map(([state, n]) => (
                <li key={state} className="flex justify-between text-gray-700">
                  <span>{state}</span>
                  <span className="text-gray-400">{n}</span>
                </li>
              ))}
          </ul>
        </FacetCard>
      </div>
    </div>
  );
}

function FacetCard({
  title,
  count,
  children
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-500">{count} available</span>
      </div>
      {children}
    </div>
  );
}

function countBy<T extends string>(arr: T[]): Record<T, number> {
  return arr.reduce((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}
