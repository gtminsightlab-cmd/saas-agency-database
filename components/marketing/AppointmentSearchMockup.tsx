import { Building2, Filter, Network, ShieldCheck, Search } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";

type ResultRow = {
  agency: string;
  state: string;
  specialization: "Specialist" | "Exposure" | "Volume";
  appointments: number;
  diversity: "Low" | "Medium" | "High";
  contacts: number;
  verified: string;
};

const FILTERS: Array<{ label: string; value: string; icon: typeof Building2 }> = [
  { label: "Writing company", value: "Carolina Casualty", icon: Building2 },
  { label: "Parent group", value: "W.R. Berkley", icon: Network },
  { label: "Vertical", value: "Transportation", icon: Filter },
  { label: "States", value: "TX · OK · AR", icon: Filter },
  { label: "Specialization", value: "Specialist", icon: ShieldCheck },
  { label: "Verified as of", value: "May 2026", icon: ShieldCheck },
];

const RESULTS: ResultRow[] = [
  { agency: "Summit Risk Partners", state: "TX", specialization: "Specialist", appointments: 7, diversity: "Medium", contacts: 4, verified: "May 2026" },
  { agency: "Lone Star Commercial",  state: "OK", specialization: "Exposure",   appointments: 3, diversity: "Low",    contacts: 2, verified: "May 2026" },
  { agency: "Metro Risk Group",      state: "AR", specialization: "Specialist", appointments: 5, diversity: "Medium", contacts: 3, verified: "May 2026" },
];

function specializationTone(s: ResultRow["specialization"]) {
  return s === "Specialist" ? "verified" : s === "Exposure" ? "warning" : "info";
}

function diversityTone(d: ResultRow["diversity"]) {
  return d === "High" ? "success" : d === "Medium" ? "info" : "neutral";
}

export function AppointmentSearchMockup() {
  return (
    <figure
      role="img"
      aria-label="Example Agency Signal search: 3 commercial agencies appointed with Carolina Casualty in TX, OK, AR — refreshed May 2026"
      className="relative rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1 shadow-2xl shadow-blue-900/20 backdrop-blur"
    >
      <div className="rounded-[14px] bg-slate-900 ring-1 ring-inset ring-slate-700/50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Appointment Intelligence Search
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-[11px] font-medium text-slate-300">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 border-b border-slate-700/60 px-4 py-4 sm:grid-cols-2">
          {FILTERS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2">
              <Icon className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
                <div className="truncate text-xs font-semibold text-slate-100">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-700/60 px-4 py-3">
          <StatusPill tone="info"     label="Competitor paper" />
          <StatusPill tone="verified" label="Verified appointment" />
          <StatusPill tone="success"  label="Export-ready" />
          <StatusPill tone="info"     label="Parent group mapped" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <caption className="sr-only">Example agencies appointed with Carolina Casualty.</caption>
            <thead className="bg-slate-900/40 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-2.5">Agency</th>
                <th scope="col" className="px-2 py-2.5">State</th>
                <th scope="col" className="px-2 py-2.5">Specialization</th>
                <th scope="col" className="px-2 py-2.5 text-right">Appts</th>
                <th scope="col" className="px-2 py-2.5">Diversity</th>
                <th scope="col" className="px-2 py-2.5 text-right">Contacts</th>
                <th scope="col" className="px-2 py-2.5 text-right">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {RESULTS.map((row) => (
                <tr key={row.agency} className="hover:bg-slate-800/40">
                  <th scope="row" className="whitespace-nowrap px-4 py-3 font-medium text-slate-100">
                    {row.agency}
                  </th>
                  <td className="whitespace-nowrap px-2 py-3 text-slate-300">{row.state}</td>
                  <td className="whitespace-nowrap px-2 py-3">
                    <StatusPill tone={specializationTone(row.specialization)} label={row.specialization} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right font-mono text-sm font-semibold text-cyan-200">
                    {row.appointments}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3">
                    <StatusPill tone={diversityTone(row.diversity)} label={row.diversity} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-right text-slate-300">{row.contacts}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-right text-xs text-slate-400">{row.verified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-700/60 px-4 py-3 text-[11px] text-slate-400">
          <span>Showing 3 of 247 agencies that match this carrier appointment.</span>
          <span className="font-mono text-slate-500">/api/build-list</span>
        </div>
      </div>
    </figure>
  );
}
