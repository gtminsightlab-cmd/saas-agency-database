import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AgencyDirectoryPage() {
  const supabase = createClient();

  // Until the full agency dataset is loaded, preview the Top 100 P/C list as
  // a placeholder directory so the page has real content.
  const { data: members, error } = await supabase
    .from("top_agency_members")
    .select(
      "rank, agency_name, pc_revenue, office_city, office_state, top_agency_lists ( name )"
    )
    .not("rank", "is", null)
    .order("rank", { ascending: true })
    .limit(25);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agency Directory</h1>
      <p className="text-sm text-gray-600">
        Full directory will appear here once the agencies dataset is loaded.
        For now, here are the top 25 agencies from the Insurance Journal Top
        100 P/C list we already loaded.
      </p>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <Th>#</Th>
              <Th>Agency</Th>
              <Th>City</Th>
              <Th>State</Th>
              <Th className="text-right">P/C revenue</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {(members ?? []).map((m) => (
              <tr key={`${m.rank}-${m.agency_name}`}>
                <Td>{m.rank}</Td>
                <Td className="font-medium">{m.agency_name}</Td>
                <Td>{m.office_city}</Td>
                <Td>{m.office_state}</Td>
                <Td className="text-right tabular-nums">
                  {m.pc_revenue != null ? money(m.pc_revenue) : "—"}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 font-medium text-gray-700 ${className}`}>{children}</th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 text-gray-800 ${className}`}>{children}</td>;
}
function money(n: number | string) {
  const num = typeof n === "string" ? Number(n) : n;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
