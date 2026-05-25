import Link from "next/link";
import { Truck, Stethoscope, HardHat, Wheat, HeartHandshake, Lock, Landmark, Building2, UtensilsCrossed, Factory, Cpu, Zap, ShoppingBag, Briefcase, TrendingUp, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Sidebar } from "@/components/app/sidebar";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { DataPanel } from "@/components/marketing/DataPanel";
import { WorkflowStrip } from "@/components/marketing/WorkflowStrip";
import { getVerticalsSummary } from "@/lib/cache/build-list-refs";

export const dynamic = "force-dynamic";

const VERTICAL_FALLBACK = [
  { slug: "transportation", name: "Transportation", description: "Agencies writing trucking, commercial auto, and cargo risk — identified by appointments with specialty trucking carriers.", icon_key: "Truck", color_token: "brand", sort_order: 1, mapped_carrier_count: 12, agencies_with_exposure: 78, agencies_growing: 6, agencies_specialist: 0, agency_count: 358, location_count: 518, contact_count: 4002, contacts_with_email: 3710, contacts_with_mobile: 1232, agencies_with_linkedin: 361, agencies_with_web: 510, agencies_with_email: 436 },
];

type VerticalSummary = {
  agency_count: number;
  location_count: number;
  contact_count: number;
  contacts_with_email: number;
  contacts_with_mobile: number;
  agencies_with_linkedin: number;
  agencies_with_web: number;
  agencies_with_email: number;
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

const ICONS: Record<string, LucideIcon> = {
  Truck, Stethoscope, HardHat, Wheat, HeartHandshake,
  Landmark, Building2, UtensilsCrossed, Factory, Cpu, Zap, ShoppingBag, Briefcase,
};

export default async function VerticalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasActivePlan = false;
  if (user) {
    const { data: ent } = await supabase
      .from("v_my_entitlement")
      .select("plan_code,status")
      .maybeSingle();
    hasActivePlan = !!ent && ent.status === "active";
  }

  const live = (await getVerticalsSummary()) as unknown as VerticalSummary[];
  const verticals: VerticalSummary[] = live.length > 0 ? live : (VERTICAL_FALLBACK as VerticalSummary[]);

  let sidebarProps:
    | { email: string; fullName: string | null; isSuperAdmin: boolean }
    | null = null;
  if (user) {
    const { data: appUser } = await supabase
      .from("app_users")
      .select("email, full_name, role")
      .eq("user_id", user.id)
      .maybeSingle();
    sidebarProps = {
      email: appUser?.email ?? user.email ?? "",
      fullName: appUser?.full_name ?? null,
      isSuperAdmin: appUser?.role === "super_admin",
    };
  }

  // CTA destination logic per session state — preserved from prior version.
  const primaryCtaHref = hasActivePlan
    ? "/build-list"
    : user
      ? "/#pricing"
      : "/sign-up";
  const primaryCtaLabel = hasActivePlan
    ? "Build a list"
    : user
      ? "See pricing"
      : "Get instant access";

  const body = (
    <div>
      {!user && <MarketingHeader isAuthed={false} theme="dark" />}

      <PageHero
        variant="dark"
        eyebrow="Verticals"
        title="Don't just find agents."
        highlight="Find the right agents."
        description="We map the parent-child carrier relationships that define the US insurance market — turning every agent's appointment list into a readable inventory of their actual book of business. Filter, target, and recruit by the writing-company breadcrumbs your competitors leave behind."
        primaryCta={{ label: primaryCtaLabel, href: primaryCtaHref }}
        secondaryCta={{ label: "Read the methodology", href: "/methodology" }}
        rightRail={
          <DataPanel
            eyebrow="Specialization tiers"
            title="How we score every vertical"
            rows={[
              { label: "Exposure", value: "2 specialty carriers" },
              { label: "Growing", value: "3+ specialty carriers" },
              { label: "Specialist", value: "5+ specialty carriers" },
              { label: "Refresh cadence", value: "Every 30 days" },
            ]}
            badges={["Carrier-verified", "State-DOI sourced", "Parent/child mapped"]}
            footer="Scoring tiers are computed per-vertical against a curated specialty carrier roster. The carrier list per vertical and the scoring thresholds are published in full on the methodology page."
          />
        }
      />

      <Section
        variant="muted"
        eyebrow="How to use this page"
        title="Read a vertical in four steps."
        description="Every vertical card below is a pre-filtered, ready-to-export targeted list. Same four steps for every vertical, every time."
      >
        <WorkflowStrip
          steps={[
            { label: "Pick a market", description: "Choose the vertical you write — e.g., Transportation, Healthcare, Construction." },
            { label: "Read the carrier paper", description: "See which specialty carriers define the segment. Every appointment is verified." },
            { label: "Filter agencies", description: "Sort by tier, agency size, geography, contact density — find your ICP fast." },
            { label: "Export targeted contacts", description: "Pull verified emails, mobiles, LinkedIn for producers, branch managers, presidents." },
          ]}
        />
      </Section>

      <Section
        variant="light"
        eyebrow="The catalog"
        title="12 verticals. Carrier-verified."
        description="Counts are live — emails, mobiles, LinkedIn URLs, and websites populate the moment our pipeline picks up a new appointment."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {verticals.map((v) => {
            const Icon = ICONS[v.icon_key] ?? TrendingUp;
            const linkHref = hasActivePlan
              ? `/verticals/${v.slug}/open`
              : user
                ? `/#pricing`
                : `/sign-up?vertical=${v.slug}`;
            const ctaLabel = hasActivePlan
              ? "Open targeted list →"
              : user
                ? "Unlock targeted list"
                : "Get access →";
            return (
              <article key={v.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-slate-950 truncate">{v.name}</h3>
                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                        {v.mapped_carrier_count} specialty carriers mapped
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-600 line-clamp-3">
                  {v.description}
                </p>

                <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200">
                  <Metric label="Exposure" value={v.agencies_with_exposure} />
                  <Metric label="Growing" value={v.agencies_growing} />
                  <Metric label="Specialist" value={v.agencies_specialist} />
                </div>

                <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200">
                  <Metric label="Agencies" value={v.agency_count} />
                  <Metric label="Locations" value={v.location_count} />
                  <Metric label="Contacts" value={v.contact_count} />
                  <Metric label="Emails" value={v.contacts_with_email} />
                  <Metric label="LinkedIn" value={v.agencies_with_linkedin} />
                  <Metric label="Mobiles" value={v.contacts_with_mobile} />
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <Link
                    href={linkHref}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-500"
                  >
                    {!hasActivePlan && user ? <Lock className="h-3.5 w-3.5" /> : null}
                    {ctaLabel}
                  </Link>
                  <Link
                    href={`/verticals/${v.slug}`}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 whitespace-nowrap"
                  >
                    Carriers &amp; segments →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="How we know"
        title="No black box. No proprietary score we won't explain."
        description="Every vertical is mapped to a curated list of specialty carriers — the writing companies that only agencies with a real book of business in that niche would hold. The IP is the assembly of the data, not a secret algorithm."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">Where the mapping comes from</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Built and maintained by a former specialty wholesaler underwriter and a former carrier program manager,
              with reference checks from at least one practicing wholesaler in each vertical. Carrier rosters re-checked
              against state DOI filings and carrier-published agency lists every 30 days.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">What we publish openly</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li className="flex gap-2"><span className="text-teal-700">✓</span><span>The carrier list per vertical</span></li>
              <li className="flex gap-2"><span className="text-teal-700">✓</span><span>The appointment thresholds for each tier</span></li>
              <li className="flex gap-2"><span className="text-teal-700">✓</span><span>A public changelog of every mapping change</span></li>
              <li className="flex gap-2"><span className="text-teal-700">✓</span><span>Anti-claims: what this signal does NOT promise</span></li>
            </ul>
            <Link href="/methodology" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-800">
              Read the full methodology →
            </Link>
          </article>
        </div>
      </Section>

      <CTASection
        eyebrow="Ready when you are"
        title="Build a verified vertical list in under a minute."
        description="Filter by writing company, appointment count, geography, employee size, premium volume. Export with emails and mobiles for the agencies that match your appetite. Pay only when you export."
        primaryCta={{ label: primaryCtaLabel, href: primaryCtaHref }}
        secondaryCta={{ label: "Talk to sales", href: "mailto:hello@seven16group.com?subject=Verticals%20demo%20%E2%80%94%20Agency%20Signal" }}
      />
    </div>
  );

  if (sidebarProps) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar {...sidebarProps} />
        <div className="flex-1 min-w-0 overflow-x-hidden">{body}</div>
      </div>
    );
  }

  return body;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-b border-r border-slate-200 p-3 last:border-r-0">
      <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-black tabular-nums text-slate-950">{value.toLocaleString()}</div>
    </div>
  );
}
