type DataPanelRow = {
  label: string;
  value: string;
};

type DataPanelProps = {
  eyebrow?: string;
  title: string;
  rows: DataPanelRow[];
  badges?: string[];
  footer?: string;
};

export function DataPanel({ eyebrow, title, rows, badges = [], footer }: DataPanelProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-2xl ring-1 ring-white/5">
      {eyebrow ? (
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
          {eyebrow}
        </div>
      ) : null}

      <h3 className="text-lg font-black text-white">{title}</h3>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {row.label}
            </div>
            <div className="mt-1 text-sm font-bold text-white">{row.value}</div>
          </div>
        ))}
      </div>

      {badges.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-xs font-semibold text-teal-200"
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}

      {footer ? (
        <p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-6 text-slate-400">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
