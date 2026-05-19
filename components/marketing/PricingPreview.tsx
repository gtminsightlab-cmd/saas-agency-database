import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import clsx from "clsx";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  emphasized?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free Browse",
    price: "$0",
    cadence: "Unlimited",
    tagline: "Unlimited search. No exports.",
    features: ["Unlimited search across 41,700+ agencies", "Filter by carrier, vertical, state", "1 seat", "Best for market mapping"],
    ctaLabel: "Browse free",
    ctaHref: "/sign-up",
  },
  {
    name: "Growth Member",
    price: "$99",
    cadence: "/month",
    tagline: "Active distribution teams.",
    features: ["250 export credits / month", "3 seats", "Monthly saved-list refresh", "Email + onboarding call"],
    ctaLabel: "Start Growth Member",
    ctaHref: "/sign-up?plan=growth_member",
    emphasized: true,
  },
  {
    name: "Snapshot",
    price: "$125",
    cadence: "one-time",
    tagline: "Market entry & diligence.",
    features: ["250 export credits", "Single export window", "Best for M&A diligence", "Best for special projects"],
    ctaLabel: "Buy Snapshot",
    ctaHref: "/sign-up?plan=snapshot",
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="bg-slate-50 py-16 sm:py-20" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="pricing-heading" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Browse free. Pay when you need exports.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Three starting points. Top-up credits, volume bonuses, and Charter Member pricing live on the
            full pricing page.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <li
              key={tier.name}
              className={clsx(
                "flex flex-col rounded-2xl border bg-white p-6 shadow-sm",
                tier.emphasized
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-slate-200"
              )}
            >
              {tier.emphasized && (
                <span className="self-start rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <h3 className={clsx("mt-2 text-lg font-semibold", tier.emphasized ? "text-blue-700" : "text-navy-900")}>
                {tier.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{tier.tagline}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-navy-900">{tier.price}</span>
                <span className="text-sm font-medium text-slate-500">{tier.cadence}</span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-slate-700">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-600" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={clsx(
                  "mt-6 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  tier.emphasized
                    ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600"
                    : "border border-slate-300 text-navy-900 hover:bg-slate-100 focus-visible:ring-blue-600"
                )}
              >
                {tier.ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-slate-600">
          See the{" "}
          <Link href="/pricing" className="font-semibold text-blue-700 hover:text-blue-800 underline decoration-blue-300 underline-offset-2">
            full pricing page
          </Link>{" "}
          for credit top-up math, volume bonus bands, and Charter Member pricing.
        </p>
      </div>
    </section>
  );
}
