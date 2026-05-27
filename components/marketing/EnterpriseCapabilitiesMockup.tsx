import {
  Building2,
  ShieldCheck,
  Network,
  Database,
  Sparkles,
  Briefcase,
  Crown,
} from "lucide-react";

type Capability = {
  label: string;
  detail: string;
  icon: typeof Building2;
};

const CAPABILITIES: Capability[] = [
  { label: "Full U.S. coverage",          detail: "All 50 states",          icon: Network },
  { label: "Appointment intelligence",    detail: "Carrier × LOB × state",  icon: ShieldCheck },
  { label: "Verified contacts",           detail: "Producer + decision-maker", icon: Building2 },
  { label: "Database license",            detail: "Annual founder rate",    icon: Database },
  { label: "Bulk export windows",         detail: "Quarterly refresh",      icon: Briefcase },
  { label: "Distribution intelligence",   detail: "Custom segments",        icon: Sparkles },
];

export function EnterpriseCapabilitiesMockup() {
  return (
    <figure
      role="img"
      aria-label="Example enterprise capabilities matrix: 6 capabilities including full U.S. coverage, appointment intelligence, verified contacts, database license, bulk export windows, and distribution intelligence."
      className="relative w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1 shadow-2xl shadow-blue-900/20 backdrop-blur"
    >
      <div className="rounded-[14px] bg-slate-900 ring-1 ring-inset ring-slate-700/50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Crown className="h-3.5 w-3.5" aria-hidden="true" />
            National Founder License
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-[11px] font-medium text-slate-300">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-2">
          {CAPABILITIES.map(({ label, detail, icon: Icon }) => (
            <div
              key={label}
              className="flex items-start gap-2 rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2.5"
            >
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-100">{label}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">{detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-700/60 px-4 py-3 text-[11px] text-slate-400">
          <span>Founder rate: $12,500/yr · Annual license · Full U.S.</span>
          <span className="font-mono text-slate-500">/api/license</span>
        </div>
      </div>
    </figure>
  );
}
