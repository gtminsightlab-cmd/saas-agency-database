import { Signal, ShieldCheck, Network, Building2 } from "lucide-react";

type SignalCard = {
  name: string;
  score: number;
  source: string;
  detail: string;
  icon: typeof Signal;
};

const SIGNALS: SignalCard[] = [
  {
    name: "Carrier Appointment",
    score: 87,
    source: "State DOI filings",
    detail: "Active appointments verified against state DOI records.",
    icon: ShieldCheck,
  },
  {
    name: "Producer Network",
    score: 72,
    source: "Public producer registry",
    detail: "Producers + license states + agency affiliations.",
    icon: Network,
  },
  {
    name: "Agency Identity",
    score: 94,
    source: "NPN + EIN keys",
    detail: "Federal identity keys join across 50 state feeds.",
    icon: Building2,
  },
];

function scoreTone(score: number): string {
  if (score >= 85) return "text-emerald-300";
  if (score >= 70) return "text-cyan-200";
  return "text-amber-200";
}

export function ThreeSignalsMockup() {
  return (
    <figure
      role="img"
      aria-label="Example methodology breakdown: three signals (Carrier Appointment, Producer Network, Agency Identity) with confidence scores and authoritative sources."
      className="relative w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1 shadow-2xl shadow-blue-900/20 backdrop-blur"
    >
      <div className="rounded-[14px] bg-slate-900 ring-1 ring-inset ring-slate-700/50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Signal className="h-3.5 w-3.5" aria-hidden="true" />
            Three Signals
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-[11px] font-medium text-slate-300">Live</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {SIGNALS.map(({ name, score, source, detail, icon: Icon }) => (
            <div key={name} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/40">
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-100">{name}</span>
                  <span
                    aria-label={`Confidence score ${score} out of 100`}
                    className={`font-mono text-sm font-bold tabular-nums ${scoreTone(score)}`}
                  >
                    {score}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">
                  Source: {source}
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-700/60 px-4 py-3 text-[11px] text-slate-400">
          <span>Confidence scores 0–100, refreshed at every ingest.</span>
          <span className="font-mono text-slate-500">/methodology</span>
        </div>
      </div>
    </figure>
  );
}
