import { Database, Layers, BarChart3, Rocket } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type Step = {
  num: string;
  icon: ComponentType<LucideProps>;
  heading: string;
  body: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    icon: Database,
    heading: "Collect",
    body: "State DOI filings, carrier appointments, agency records, contacts, cluster affiliations, and market data — every month.",
  },
  {
    num: "02",
    icon: Layers,
    heading: "Normalize",
    body: "Map writing companies to parent insurance groups. Reconcile agency entities and contact records across sources.",
  },
  {
    num: "03",
    icon: BarChart3,
    heading: "Score",
    body: "Rank agencies by vertical specialization, appointment volume, carrier diversity, and target-program fit.",
  },
  {
    num: "04",
    icon: Rocket,
    heading: "Activate",
    body: "Browse, filter, save, export, and build recruit campaigns from a list of verified, market-accessible agencies.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="how-heading" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            From public filings to recruit-ready agency lists.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            The same four steps run every month against fresh state filings. No vendor magic, no opaque scoring —
            the methodology is published openly.
          </p>
        </div>

        <ol
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="The four-step Agency Signal pipeline"
        >
          {STEPS.map(({ num, icon: Icon, heading, body }) => (
            <li
              key={num}
              className="relative rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {num}
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-navy-900">{heading}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
