import Link from "next/link";
import {
  Truck,
  Stethoscope,
  HardHat,
  Wheat,
  HeartHandshake,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";

export const dynamic = "force-dynamic";

// Snapshot fallback — used only while PostgREST hosted schema cache is still picking up
// the mv_vertical_summary view. Values captured from MCP at migration time; they update
// automatically once the cache refreshes and the live query starts returning rows.
const VERTICAL_FALLBACK = [
  { slug: "transportation",            name: "Transportation",              description: "Agencies writing trucking, commercial auto, and cargo risk — identified by appointments with specialty trucking carriers.",                                                                                                                   icon_key: "Truck",       color_token: "brand",   sort_order: 1, mapped_carrier_count: 12, agencies_with_exposure: 41,  agencies_growing: 2, agencies_specialist: 0 },
  { slug: "healthcare-human-services", name: "Healthcare & Human Services",  description: "Agencies writing medical professional liability, allied health, aging services, and nonprofit/social-services risk — identified by appointments with the specialty carriers that dominate each segment.",                                    icon_key: "Stethoscope", color_token: "success", sort_order: 2, mapped_carrier_count: 21, agencies_with_exposure: 16,  agencies_growing: 0, agencies_specialist: 0 },
  { slug: "construction",              name: "Construction",                 description: "Agencies writing contractors, builders risk, and surety — identified by deep appointments with construction-focused commercial carriers.",                                                                                                     icon_key: "HardHat",     color_token: "gold",    sort_order: 3, mapped_carrier_count: 20, agencies_with_exposure: 38,  agencies_growing: 2, agencies_specialist: 0 },
  { slug: "agriculture",               name: "Agriculture",                  description: "Agencies writing farms, ranches, agribusiness, and crop — identified by appointments with agricultural and farm mutual carriers.",                                                                                                             icon_key: "Wheat",       color_token: "success", sort_order: 4, mapped_carrier_count: 18, agencies_with_exposure: 169, agencies_growing: 1, agencies_specialist: 0 },
];


type VerticalSummary = {
  slug: string;
  name: string;
  description: string;
  icon_key: string;
  color_token: string;
  sort_order: number;
  mapped_carrier_count: number;
  agencies_with_exposure: number;
  agencies_growing: number;
  agencies_specialist: number;
};

// Map icon_key strings from the DB to lucide components (avoids dynamic require, keeps tree-shaking)
const ICONS: Record<string, LucideIcon> = {
  Truck,
  Stethoscope,
  HardHat,
  Wheat,
  HeartHandshake,
};

// Map color_token strings to Tailwind classes for the card accent.
// Keeping this as a plain lookup lets Tailwind's JIT pick up the classes.
const COLOR_CLASSES: Record<string, { ring: string; bg: string; text: string; border: string; dot: string }> = {
  brand:   { ring: "ring-brand-200",   bg: "bg-brand-50",   text: "text-brand-700",   border: "border-brand-100",   dot: "bg-brand-500" },
  success: { ring: "ring-success-200", bg: "bg-success-50", text: "text-success-700", border: "border-success-100", dot: "bg-success-500" },
  gold:    { ring: "ring-gold-200",    bg: "bg-gold-50",    text: "text-gold-800",    border: "border-gold-100",    dot: "bg-gold-500" },
  navy:    { ring: "ring-navy-200",    bg: "bg-navy-50",    text: "text-navy-800",    border: "border-navy-100",    dot: "bg-navy-500" },
};

export default async function VerticalsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("mv_vertical_summary")
    .select("slug,name,description,icon_key,color_token,sort_order,mapped_carrier_count,agencies_with_exposure,agencies_growing,agencies_specialist")
    .order("sort_order");
  const live = (data ?? []) as VerticalSummary[];
  const verticals: VerticalSummary[] = live.length > 0 ? live : (VERTICAL_FALLBACK as VerticalSummary[]);

  return (
    <div className="bg-white">
      <MarketingNav isAuthed={!!user} />

      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <TrendingUp className="h-3.5 w-3.5" />
              Vertical Intelligence
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
              Find agencies by their{" "}
              <span className="text-brand-600">specialty practice</span>.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We infer vertical specialization from carrier appointments. The more specialty
              carriers an agency holds for a given vertical, the higher the probability they
              have a genuine book of business in that niche — not just a one-off account.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              <strong className="text-navy-800">Tiers:</strong>{" "}
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-200" /> Exposure (2+ carriers)
              </span>
              {" · "}
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-500" /> Growing (4+ carriers)
              </span>
              {" · "}
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-700" /> Specialist (7+ carriers)
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {verticals.map((v) => {
            const Icon = ICONS[v.icon_key] ?? TrendingUp;
            const colors = COLOR_CLASSES[v.color_token] ?? COLOR_CLASSES.brand;
            return (
              <article
                key={v.slug}
                className={`group relative rounded-2xl border ${colors.border} bg-white p-6 shadow-sm ring-1 ${colors.ring} transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {v.mapped_carrier_count} specialty carriers
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-navy-800">{v.name}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{v.description}</p>

                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                  <TierStat label="Exposure" count={v.agencies_with_exposure} dot="bg-brand-200" />
                  <TierStat label="Growing"  count={v.agencies_growing}        dot="bg-brand-500" />
                  <TierStat label="Specialist" count={v.agencies_specialist}   dot="bg-brand-700" />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    {(v.agencies_with_exposure + v.agencies_growing + v.agencies_specialist).toLocaleString()} agencies indexed
                  </div>
                  <Link
                    href={user ? `/build-list?vertical=${v.slug}` : `/sign-up?vertical=${v.slug}`}
                    className={`inline-flex items-center gap-1 rounded-md ${colors.bg} px-3 py-1.5 text-xs font-semibold ${colors.text} hover:opacity-90`}
                  >
                    {user ? "Build a list" : "Get access"} →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="text-sm font-semibold text-navy-800">How the classification works</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Each vertical is mapped to a curated list of specialty carriers — the markets that only
            agencies with a genuine book of business in that niche would hold. We count matching
            appointments per agency: 2+ signals <strong>Exposure</strong>, 4+ signals a{" "}
            <strong>Growing</strong> practice, 7+ signals a true <strong>Specialist</strong>. Because
            we classify by appointments rather than self-reported tags, the signal is objective and
            updates automatically as carrier rosters change.
          </p>
        </div>
      </section>
    </div>
  );
}

function TierStat({ label, count, dot }: { label: string; count: number; dot: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-navy-800">
        {count.toLocaleString()}
      </div>
    </div>
  );
}
