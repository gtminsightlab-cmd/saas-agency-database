import { BadgeAlert, Globe2, Database } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type Pain = {
  icon: ComponentType<LucideProps>;
  heading: string;
  body: string;
};

const PAINS: Pain[] = [
  {
    icon: BadgeAlert,
    heading: "Contact titles don't prove market access.",
    body: "A producer's LinkedIn says VP, Commercial Lines. That doesn't tell you which carriers they can bind today.",
  },
  {
    icon: Globe2,
    heading: "Agency websites don't reveal current appointments.",
    body: "Marketing pages list aspirational partners. State DOI filings show who's actually writing the paper.",
  },
  {
    icon: Database,
    heading: "CRM lists decay as agents move, merge, and change markets.",
    body: "Stale rolodexes burn outreach. A monthly refresh against public filings keeps the recruit list honest.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="problem-heading" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Generic lead databases don&apos;t know who can bind your program.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Distribution teams targeting by job title and revenue band waste outreach on agents who can&apos;t place
            the risk. The signal that actually predicts placement is the carrier appointment behind the agency.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {PAINS.map(({ icon: Icon, heading, body }) => (
            <li
              key={heading}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-navy-900">{heading}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm font-medium text-slate-700">
          Agency Signal targets by the appointment relationships that actually matter.
        </p>
      </div>
    </section>
  );
}
