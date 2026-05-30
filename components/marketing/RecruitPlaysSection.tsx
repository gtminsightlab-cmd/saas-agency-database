import { Target, Rocket, Map, BadgeCheck, FilterX } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type Play = {
  title: string;
  body: string;
  icon: ComponentType<LucideProps>;
};

const PLAYS: Play[] = [
  {
    icon: Target,
    title: "Displace competitor paper",
    body: "Find agencies already appointed with the carrier your program competes against.",
  },
  {
    icon: Rocket,
    title: "Launch a new program",
    body: "Build vertical-specific recruit lists by state, appointment behavior, and carrier fit.",
  },
  {
    icon: Map,
    title: "Map white space",
    body: "See where competitors have agency penetration and your distribution is thin.",
  },
  {
    icon: BadgeCheck,
    title: "Identify specialist agencies",
    body: "Prioritize agencies with repeated appointment behavior in your target vertical.",
  },
  {
    icon: FilterX,
    title: "Reduce wasted outreach",
    body: "Exclude agencies with stale appointments or too much carrier concentration.",
  },
];

export function RecruitPlaysSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="plays-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="plays-heading" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Five ways distribution teams use Seven16 Intel.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            The same dataset, scored five different ways. Pick the play that matches your quarter.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLAYS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-100">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-navy-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
