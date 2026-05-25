type StatStripItem = {
  label: string;
  value: string;
};

type StatStripProps = {
  items: StatStripItem[];
  variant?: "dark" | "light";
};

/**
 * Horizontal stat strip — used inside hero or context sections for "proof
 * numbers" (verified agencies, contacts indexed, etc.). Theme-aware so it
 * can sit on dark hero or light Section.
 */
export function StatStrip({ items, variant = "light" }: StatStripProps) {
  const isDark = variant === "dark";
  const wrapperClass = isDark
    ? "grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-700/70 md:grid-cols-4"
    : "grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-4";
  const cellClass = isDark ? "bg-slate-900 p-5" : "bg-white p-5";
  const labelClass = isDark
    ? "text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
    : "text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500";
  const valueClass = isDark
    ? "mt-2 text-2xl font-black tracking-[-0.02em] text-white"
    : "mt-2 text-2xl font-black tracking-[-0.02em] text-slate-950";

  return (
    <div className={wrapperClass}>
      {items.map((item) => (
        <div key={item.label} className={cellClass}>
          <div className={labelClass}>{item.label}</div>
          <div className={valueClass}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
