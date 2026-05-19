import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

type TrustStat = { value: string; label: string };

type HeroSectionProps = {
  isAuthed: boolean;
  stats: TrustStat[];
  mockupSlot: ReactNode;
};

export function HeroSection({ isAuthed, stats, mockupSlot }: HeroSectionProps) {
  const primaryHref = isAuthed ? "/build-list" : "/sign-up";
  const primaryLabel = isAuthed ? "Go to your dashboard" : "Browse verified agencies free";

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.18),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.12),transparent_55%)]"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Commercial Insurance Distribution Intelligence
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Stop targeting agency titles.{" "}
              <span className="text-cyan-300">Start targeting verified carrier appointments.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Agency Signal maps the writing-company paper trail behind every U.S. commercial insurance agency
              &mdash; refreshed monthly against state filings &mdash; so carriers, MGAs, wholesalers, and program
              teams can find agencies already appointed with the markets they compete with.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/verticals/transportation"
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                View transportation list
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Browse unlimited for free. Pay only when you export contacts.
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-800 pt-8 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{stat.label}</dt>
                  <dd className="mt-1 text-xl font-semibold text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6">{mockupSlot}</div>
        </div>
      </div>
    </section>
  );
}
