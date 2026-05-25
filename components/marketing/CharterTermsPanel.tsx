type CharterTermsPanelProps = {
  cap: string;
  enrollmentWindow: string;
  discount: string;
  appliesTo: string;
  contact: string;
};

/**
 * Charter terms — DataPanel sibling for the Charter page hero rightRail. Same
 * dark chrome as DataPanel; the ONLY gold element is the eyebrow ("Charter
 * terms"). The brief reserves gold for founder economics / locked pricing /
 * scarcity — using it here is intentional and once-per-component.
 */
export function CharterTermsPanel({
  cap,
  enrollmentWindow,
  discount,
  appliesTo,
  contact,
}: CharterTermsPanelProps) {
  const rows = [
    { label: "Cap", value: cap },
    { label: "Window", value: enrollmentWindow },
    { label: "Discount", value: discount },
    { label: "Applies to", value: appliesTo },
    { label: "Direct contact", value: contact },
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-2xl ring-1 ring-white/5">
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gold-300">
        Charter terms
      </div>
      <h3 className="text-lg font-black text-white">Founder economics, locked for life</h3>

      <dl className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {row.label}
            </dt>
            <dd className="mt-1 text-sm font-bold text-white">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
