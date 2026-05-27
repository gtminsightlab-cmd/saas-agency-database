import { BookOpen, ArrowUpRight } from "lucide-react";

type EditorialRow = {
  category: string;
  title: string;
  meta: string;
  readTime: string;
};

const ROWS: EditorialRow[] = [
  { category: "Methodology", title: "How appointment intelligence is built",       meta: "Field guide",       readTime: "12 min" },
  { category: "Playbook",    title: "Recruit lists that close in 30 days",         meta: "Operator brief",    readTime: "8 min"  },
  { category: "Data",        title: "Why state-DOI feeds beat vendor licensing",   meta: "Architecture note", readTime: "6 min"  },
  { category: "Verticals",   title: "Reading the transportation appointment map",  meta: "Vertical brief",    readTime: "9 min"  },
  { category: "Doctrine",    title: "Distribution intelligence vs. lead lists",    meta: "Manifesto",         readTime: "5 min"  },
];

export function EditorialRowMockup() {
  return (
    <figure
      role="img"
      aria-label="Example resource library: 5 editorial pieces across methodology, playbook, data, verticals, and doctrine."
      className="relative w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1 shadow-2xl shadow-blue-900/20 backdrop-blur"
    >
      <div className="rounded-[14px] bg-slate-900 ring-1 ring-inset ring-slate-700/50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Resource Library
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-[11px] font-medium text-slate-300">Live</span>
          </div>
        </div>

        <ul className="divide-y divide-slate-800">
          {ROWS.map((row) => (
            <li key={row.title} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium uppercase tracking-wider text-cyan-300">{row.category}</div>
                <div className="mt-0.5 truncate text-sm font-semibold text-slate-100">{row.title}</div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {row.meta} · {row.readTime} read
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-slate-700/60 px-4 py-3 text-[11px] text-slate-400">
          <span>Methodology, playbooks, and architecture notes from the operator side.</span>
          <span className="font-mono text-slate-500">/resources</span>
        </div>
      </div>
    </figure>
  );
}
