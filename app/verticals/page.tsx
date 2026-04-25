import Link from "next/link";
import {
  Truck,
  Stethoscope,
  HardHat,
  Wheat,
  HeartHandshake,
  TrendingUp,
  Mail,
  Smartphone,
  Linkedin,
  Globe,
  Lock,
  Landmark,
  Building2,
  UtensilsCrossed,
  Factory,
  Cpu,
  Zap,
  ShoppingBag,
  Briefcase,
  Target,
  Crosshair,
  Handshake,
  Banknote,
  CheckCircle2,
  ArrowRight,
  Search,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";

export const dynamic = "force-dynamic";

const VERTICAL_FALLBACK = [
  { slug: "transportation",            name: "Transportation",              description: "Agencies writing trucking, commercial auto, and cargo risk — identified by appointments with specialty trucking carriers.",                                                                                                                   icon_key: "Truck",       color_token: "brand",   sort_order: 1, mapped_carrier_count: 12, agencies_with_exposure: 78,  agencies_growing: 6, agencies_specialist: 0, agency_count: 358,   location_count: 518,   contact_count: 4002,  contacts_with_email: 3710,  contacts_with_mobile: 1232, agencies_with_linkedin: 361,  agencies_with_web: 510,   agencies_with_email: 436  },
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

  let hasActivePlan = false;
  if (user) {
    const { data: ent } = await supabase
      .from("v_my_entitlement")
      .select("plan_code,status")
      .maybeSingle();
    hasActivePlan = !!ent && ent.status === "active";
  }

  const { data } = await supabase
    .from("mv_vertical_summary")
    .select(
      "slug,name,description,icon_key,color_token,sort_order,mapped_carrier_count," +
      "agencies_with_exposure,agencies_growing,agencies_specialist," +
      "agency_count,location_count,contact_count," +
      "contacts_with_email,contacts_with_mobile," +
      "agencies_with_linkedin,agencies_with_web,agencies_with_email"
    )
    .order("sort_order");
  const live = (data ?? []) as unknown as VerticalSummary[];
  const verticals: VerticalSummary[] = live.length > 0 ? live : (VERTICAL_FALLBACK as VerticalSummary[]);

  return (
    <div className="bg-white">
      <MarketingNav isAuthed={!!user} />

      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Crosshair className="h-3.5 w-3.5" />
              Underwriting Breadcrumbs
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
              Don&rsquo;t just find agents.{" "}
              <span className="text-brand-600">Find the right agents.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We map the parent-child carrier relationships that define the US insurance market &mdash;
              turning every agent&rsquo;s appointment list into a readable inventory of their actual book of
              business. Filter, target, and recruit by the writing-company breadcrumbs your competitors
              leave behind.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              <strong className="text-navy-800">Specialization tiers:</strong>{" "}
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-200" /> Exposure (2 specialty carriers)
              </span>
              {" · "}
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-500" /> Growing (3+)
              </span>
              {" · "}
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-700" /> Specialist (5+)
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ============== VERTICAL CARDS ============== */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-800">12 verticals. Carrier-verified.</h2>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Each card below is a pre-filtered, ready-to-export targeted list. Counts are live &mdash;
            emails, mobiles, LinkedIn URLs, and websites populate the moment our pipeline picks up a
            new appointment.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
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
                  <TierStat label="Exposure"   count={v.agencies_with_exposure}  dot="bg-brand-200" />
                  <TierStat label="Growing"    count={v.agencies_growing}        dot="bg-brand-500" />
                  <TierStat label="Specialist" count={v.agencies_specialist}     dot="bg-brand-700" />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-xs">
                  <CountStat label="Agencies"  value={v.agency_count} />
                  <CountStat label="Locations" value={v.location_count} />
                  <CountStat label="Contacts"  value={v.contact_count} />
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
                  <PremiumStat Icon={Mail}       label="Emails"   value={v.contacts_with_email}    colors={colors} />
                  <PremiumStat Icon={Smartphone} label="Mobiles"  value={v.contacts_with_mobile}   colors={colors} />
                  <PremiumStat Icon={Linkedin}   label="LinkedIn" value={v.agencies_with_linkedin} colors={colors} />
                  <PremiumStat Icon={Globe}      label="Websites" value={v.agencies_with_web}      colors={colors} />
                </div>

                <div className="mt-5 flex items-center justify-end">
                  {hasActivePlan ? (
                    <Link
                      href={`/build-list?vertical=${v.slug}`}
                      className={`inline-flex items-center gap-1 rounded-md ${colors.bg} px-3 py-1.5 text-xs font-semibold ${colors.text} hover:opacity-90`}
                    >
                      Open targeted list <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : user ? (
                    <Link
                      href={`/#pricing`}
                      className="inline-flex items-center gap-1 rounded-md bg-navy-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-900"
                    >
                      <Lock className="h-3 w-3" />
                      Unlock targeted list
                    </Link>
                  ) : (
                    <Link
                      href={`/sign-up?vertical=${v.slug}`}
                      className={`inline-flex items-center gap-1 rounded-md ${colors.bg} px-3 py-1.5 text-xs font-semibold ${colors.text} hover:opacity-90`}
                    >
                      Get access <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ============== THE EDGE — FOUR PILLARS ============== */}
      <section className="relative border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
              <Target className="h-3.5 w-3.5" />
              The Edge
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
              The map to your competitor&rsquo;s gold mines.
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Four reasons MGUs, wholesalers, and carrier distribution teams use this data to win
              appointments.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Pillar
              num="01"
              icon={Search}
              title="The Smoking Gun"
              subtitle="Reverse-engineered intelligence from the writing-company paper trail."
              body="The Paper is the truth. When an agent writes on Admiral Insurance, Ironshore Specialty, or Lloyd&rsquo;s syndicate paper, you&rsquo;ve found a high-hazard E&S expert managing high-premium accounts. When they write on Society Insurance, they own a Midwest restaurant book. We map thousands of child writing companies back to their parent groups so the appointment list reads like a book-of-business inventory &mdash; not a guess."
              proof={[
                { label: "National Indemnity", group: "Berkshire Hathaway" },
                { label: "Carolina Casualty", group: "W. R. Berkley" },
                { label: "Continental Casualty", group: "CNA Insurance Group" },
                { label: "Fireman's Fund", group: "Allianz US P&C" },
              ]}
            />
            <Pillar
              num="02"
              icon={Crosshair}
              title="Precision Over Spray"
              subtitle="Target by appetite, not by industry."
              body="If you write specialized trucking, you don&rsquo;t want every commercial agent. You want the agents holding Progressive Smart Haul, Carolina Casualty, Great West, or Sentry. Filter by writing company &mdash; not a self-reported tag. Every appointment is verified against the underlying carrier roster, which means your outreach lands on agencies with proven authority to bind your line of business today."
            />
            <Pillar
              num="03"
              icon={Handshake}
              title="Strategic Reciprocity"
              subtitle="Know what they&rsquo;re stuck with before the first call."
              body="When an agent&rsquo;s current carrier restricts appetite or raises rates on a specific writing company, you have the opening: &ldquo;I see you&rsquo;re on [Child Carrier] paper &mdash; our program writes that risk with broader coverage and better commission.&rdquo; Win appointments by walking into the conversation already knowing the problem you&rsquo;re solving. The competitive intelligence is in the appointment list."
            />
            <Pillar
              num="04"
              icon={Banknote}
              title="Enterprise Intelligence, Continuous Verification"
              subtitle="Automated multi-layer verification, refreshed continuously."
              body="Our Dual-Agent Verification Pipeline maps parent-child relationships across 400+ writing companies, refreshed continuously against state filings and carrier roster changes. The kind of distribution intelligence that historically took a research team a year to assemble &mdash; now updated every month,."
            />
          </div>

          {/* Parent-child tree mini-diagram */}
          <div className="mt-16 rounded-2xl border border-navy-100 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-navy-800">
                What &ldquo;parent-child mapping&rdquo; looks like in practice.
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                One example. Real-time verification across 400+ writing companies, every month.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <ParentTree
                parent="W. R. Berkley Corporation"
                children={[
                  "Acadia Insurance Company",
                  "Berkley Insurance Company",
                  "Carolina Casualty Insurance",
                  "Continental Western Insurance",
                  "Nautilus Insurance Company",
                  "Berkley Luxury Group",
                ]}
                tag="15 writing companies"
              />
              <ParentTree
                parent="Berkshire Hathaway Insurance Group"
                children={[
                  "National Indemnity Company",
                  "Medical Protective",
                  "GUARD Insurance Group",
                  "biBERK Insurance Services",
                  "Princeton Insurance",
                  "GEICO (auto)",
                ]}
                tag="14 writing companies"
              />
              <ParentTree
                parent="AIG / American International Group"
                children={[
                  "Lexington Insurance Company",
                  "National Union Fire (Pittsburgh)",
                  "Illinois National Insurance",
                  "American Home Assurance",
                  "New Hampshire Insurance",
                  "Validus Specialty",
                ]}
                tag="9 writing companies"
              />
            </div>
            <p className="mt-6 text-xs text-gray-500 italic">
              When you see one of these child carriers on an agent&rsquo;s appointment list, you know
              the parent program they have access to &mdash; and the type of risk they&rsquo;re binding.
            </p>
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
            <h3 className="text-lg font-semibold text-navy-800">How the classification works</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600 max-w-3xl">
              Each vertical is mapped to a curated list of specialty carriers &mdash; the markets that only
              agencies with a genuine book of business in that niche would hold. We count matching
              appointments per agency: 2+ signals <strong>Exposure</strong>, 3+ signals a{" "}
              <strong>Growing</strong> practice, 5+ signals a true <strong>Specialist</strong>. Because
              we classify by appointments rather than self-reported tags, the signal is objective and
              updates automatically as carrier rosters change. No keyword matching, no industry codes
              that haven&rsquo;t been refreshed since 2018 &mdash; just verified writing-company paper.
            </p>
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative overflow-hidden border-t border-gray-100 bg-gradient-to-br from-navy-800 via-navy-700 to-brand-700">
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to map your competitive landscape?
          </h2>
          <p className="mt-4 text-lg text-brand-100 max-w-2xl mx-auto">
            Pull a verified list in under a minute. Filter by writing company, appointment count,
            geography, employee size, premium volume &mdash; export with emails and mobiles for the
            agencies that match your appetite.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {hasActivePlan ? (
              <>
                <Link
                  href="/build-list"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
                >
                  Build a list
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/ai-support"
                  className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 inline-flex items-center gap-2"
                >
                  Try AI search
                </Link>
              </>
            ) : user ? (
              <>
                <Link
                  href="/#pricing"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
                >
                  See pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:hello@seven16group.com?subject=Verticals%20demo%20%E2%80%94%20Seven16%20Agency%20Directory"
                  className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 inline-flex items-center gap-2"
                >
                  Talk to sales
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
                >
                  Get instant access
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:hello@seven16group.com?subject=Verticals%20demo%20%E2%80%94%20Seven16%20Agency%20Directory"
                  className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 inline-flex items-center gap-2"
                >
                  Talk to sales
                </a>
              </>
            )}
          </div>
          <p className="mt-8 text-xs text-brand-200">
            No long-term contract. Built for in-house distribution and growth teams.
          </p>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Card components
// ============================================================================

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

function CountStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums text-navy-800">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function PremiumStat({
  Icon, label, value, colors,
}: {
  Icon: LucideIcon;
  label: string;
  value: number;
  colors: { text: string };
}) {
  return (
    <div className="text-center">
      <Icon className={`h-3.5 w-3.5 mx-auto ${colors.text}`} />
      <div className="mt-1 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-navy-800 tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Pillar({
  num, icon: Icon, title, subtitle, body, proof,
}: {
  num: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  body: string;
  proof?: { label: string; group: string }[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-xs font-mono font-semibold text-gray-300">{num}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy-800">{title}</h3>
      <p className="mt-1 text-sm font-medium text-brand-700">{subtitle}</p>
      <p className="mt-3 text-sm leading-6 text-gray-600">{body}</p>
      {proof && (
        <div className="mt-5 rounded-lg border border-success-100 bg-success-50/50 p-4">
          <div className="text-[11px] uppercase tracking-wider text-success-700 font-semibold mb-2">
            Verified writing companies
          </div>
          <ul className="space-y-1.5">
            {proof.map((p) => (
              <li key={p.label} className="flex items-baseline gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-600 shrink-0 self-center" />
                <span className="text-navy-800 font-medium">{p.label}</span>
                <span className="text-gray-500">— {p.group}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ParentTree({
  parent, children, tag,
}: {
  parent: string;
  children: string[];
  tag: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="text-xs font-mono uppercase tracking-wider text-navy-700 font-semibold">
          Parent
        </div>
        <span className="text-[10px] text-gray-500 italic">{tag}</span>
      </div>
      <div className="text-sm font-semibold text-navy-800">{parent}</div>
      <div className="mt-4 border-l-2 border-success-300 pl-3 space-y-1.5">
        {children.map((c) => (
          <div key={c} className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3 w-3 text-success-600 shrink-0" />
            <span className="text-gray-700">{c}</span>
          </div>
        ))}
        <div className="text-[10px] text-gray-400 italic pt-1">+ several more children</div>
      </div>
    </div>
  );
}
