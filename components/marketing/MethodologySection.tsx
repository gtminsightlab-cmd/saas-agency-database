import Link from "next/link";
import { Activity, Layers, Network, Calendar, ArrowRight } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type Signal = {
  label: string;
  body: string;
  icon: ComponentType<LucideProps>;
};

const SIGNALS: Signal[] = [
  {
    label: "Appointment Volume",
    body: "Tells whether the agency exists in the market — how many writing-company relationships they hold.",
    icon: Activity,
  },
  {
    label: "Specialization Tier",
    body: "Tells what they actually write — concentration of appointments inside a vertical vs. spread thin.",
    icon: Layers,
  },
  {
    label: "Carrier Diversity",
    body: "Tells whether they may be open to another market — low diversity flags concentration risk.",
    icon: Network,
  },
  {
    label: "Verified Freshness",
    body: "Tells whether the data can be trusted — every row carries a verified-as-of date.",
    icon: Calendar,
  },
];

export function MethodologySection() {
  return (
    <section className="bg-navy-900 py-16 text-white sm:py-20" aria-labelledby="methodology-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="methodology-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            A scoring model built around how distribution actually works.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Open methodology. No black-box vendor magic. Each input is independently auditable against state filings.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-950/60 p-6 shadow-2xl shadow-blue-900/20">
          <div className="text-center font-mono text-xs uppercase tracking-widest text-slate-400">
            Agency Recruit Score
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
            <span className="rounded-md bg-blue-500/20 px-3 py-1.5 font-mono text-sm font-semibold text-blue-200 ring-1 ring-blue-400/40">
              Appointment Volume
            </span>
            <span className="font-mono text-slate-500" aria-hidden="true">+</span>
            <span className="rounded-md bg-cyan-500/20 px-3 py-1.5 font-mono text-sm font-semibold text-cyan-200 ring-1 ring-cyan-400/40">
              Specialization Tier
            </span>
            <span className="font-mono text-slate-500" aria-hidden="true">+</span>
            <span className="rounded-md bg-emerald-500/20 px-3 py-1.5 font-mono text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/40">
              Carrier Diversity
            </span>
            <span className="font-mono text-slate-500" aria-hidden="true">+</span>
            <span className="rounded-md bg-amber-500/20 px-3 py-1.5 font-mono text-sm font-semibold text-amber-200 ring-1 ring-amber-400/40">
              Verified Freshness
            </span>
          </div>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SIGNALS.map(({ icon: Icon, label, body }) => (
            <li
              key={label}
              className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/30">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-white">{label}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/methodology"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            Read the full methodology
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
