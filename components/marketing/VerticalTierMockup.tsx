import { Layers } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";

type VerticalRow = {
  name: string;
  agencies: number;
  status: "shipped" | "empty";
};

const ROWS: VerticalRow[] = [
  { name: "Agriculture",     agencies: 11149, status: "shipped" },
  { name: "Transportation",  agencies:  1603, status: "shipped" },
  { name: "Real Estate",     agencies:  2521, status: "shipped" },
  { name: "Construction",    agencies:  1894, status: "shipped" },
  { name: "Manufacturing",   agencies:  1462, status: "shipped" },
  { name: "Hospitality",     agencies:   978, status: "shipped" },
  { name: "Energy",          agencies:     0, status: "empty"   },
  { name: "Healthcare",      agencies:     0, status: "empty"   },
];

const USNUM = (n: number) => n.toLocaleString("en-US");

export function VerticalTierMockup() {
  return (
    <figure
      role="img"
      aria-label="Example vertical intelligence summary: 6 verticals shipped with agency counts, 2 verticals still empty pending data ingest."
      className="relative w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1 shadow-2xl shadow-blue-900/20 backdrop-blur"
    >
      <div className="rounded-[14px] bg-slate-900 ring-1 ring-inset ring-slate-700/50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Vertical Intelligence
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-[11px] font-medium text-slate-300">Live</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <caption className="sr-only">Vertical-level agency counts across the platform.</caption>
            <thead className="bg-slate-900/40 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-2.5">Vertical</th>
                <th scope="col" className="px-2 py-2.5 text-right">Agencies</th>
                <th scope="col" className="px-2 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ROWS.map((row) => (
                <tr key={row.name} className="hover:bg-slate-800/40">
                  <th scope="row" className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-100">
                    {row.name}
                  </th>
                  <td className="whitespace-nowrap px-2 py-2.5 text-right font-mono text-sm font-semibold text-cyan-200">
                    {row.status === "shipped" ? USNUM(row.agencies) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5">
                    {row.status === "shipped" ? (
                      <StatusPill tone="success" label="Shipped" />
                    ) : (
                      <StatusPill tone="neutral" label="Queued" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-700/60 px-4 py-3 text-[11px] text-slate-400">
          <span>12 verticals on the roadmap. 6 shipped today, 6 queued.</span>
          <span className="font-mono text-slate-500">mv_vertical_summary</span>
        </div>
      </div>
    </figure>
  );
}
