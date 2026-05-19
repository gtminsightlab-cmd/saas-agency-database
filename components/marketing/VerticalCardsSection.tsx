import Link from "next/link";
import {
  Truck,
  Stethoscope,
  HardHat,
  Wheat,
  Building2,
  Home,
  UtensilsCrossed,
  Factory,
  Cpu,
  Flame,
  ShoppingCart,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export type VerticalCard = {
  slug: string;
  name: string;
  description?: string | null;
  icon_key?: string | null;
  agency_count: number;
  location_count: number;
  contact_count: number;
  mapped_carrier_count: number;
};

type VerticalCardsSectionProps = {
  verticals: VerticalCard[];
};

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Truck,
  Stethoscope,
  HardHat,
  Wheat,
  Building2,
  Home,
  UtensilsCrossed,
  Factory,
  Cpu,
  Flame,
  ShoppingCart,
  Briefcase,
};

const USE_CASE_BY_SLUG: Record<string, string> = {
  "transportation":             "Trucking, fleet, and cargo programs",
  "healthcare-human-services":  "Medical professional, allied health, senior care",
  "construction":               "Contractors, builders risk, surety",
  "agriculture":                "Farm, ag, agribusiness, crop",
  "public-entity":              "Municipal, school, government risks",
  "real-estate":                "Habitational, property, real estate",
  "hospitality":                "Restaurants, hotels, food service",
  "manufacturing":              "Product liability, mfg property",
  "technology-cyber":           "Tech E&O, cyber liability",
  "energy-oil-gas":             "Upstream, midstream, oilfield services",
  "retail-wholesale":           "Retail, wholesale distribution",
  "professional-services":      "Lawyers, accountants, consultants",
};

function formatCount(n: number) {
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

export function VerticalCardsSection({ verticals }: VerticalCardsSectionProps) {
  return (
    <section className="bg-slate-50 py-16 sm:py-20" aria-labelledby="verticals-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="verticals-heading" className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            12 verticals. Carrier-verified. Ready to target.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Each vertical is defined by the carriers that actually write it. We map appointments to the specialty
            programs your team competes against — not loose SIC codes or self-reported industry tags.
          </p>
        </div>

        {verticals.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              heading="Vertical data is loading"
              body="The materialized view is still warming up. Refresh in a moment to see live counts per vertical."
            />
          </div>
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {verticals.map((v) => {
              const Icon = (v.icon_key && ICON_MAP[v.icon_key]) || Briefcase;
              const useCase = USE_CASE_BY_SLUG[v.slug] ?? v.description ?? "";
              return (
                <li key={v.slug}>
                  <Link
                    href={`/verticals/${v.slug}`}
                    className="group block h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <ArrowRight
                        className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-navy-900">{v.name}</h3>
                    {useCase && <p className="mt-1 text-sm text-slate-600">{useCase}</p>}

                    <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                      <div>
                        <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Agencies</dt>
                        <dd className="mt-0.5 font-mono text-sm font-semibold text-navy-900">{formatCount(v.agency_count)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Contacts</dt>
                        <dd className="mt-0.5 font-mono text-sm font-semibold text-navy-900">{formatCount(v.contact_count)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Carriers</dt>
                        <dd className="mt-0.5 font-mono text-sm font-semibold text-navy-900">{formatCount(v.mapped_carrier_count)}</dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
