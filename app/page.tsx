import Image from "next/image";
import Link from "next/link";
import { Check, Filter, Download, Search, Zap, X, Truck, Stethoscope, HardHat, Wheat, HeartHandshake, Lock, ArrowRight, Network, Layers, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";

export const dynamic = "force-dynamic";

// Snapshot fallback — used only while PostgREST hosted schema cache is still picking up
// the mv_vertical_summary view. Values captured from MCP at migration time; they update
// automatically once the cache refreshes and the live query starts returning rows.
const VERTICAL_FALLBACK = [
  { slug: "transportation",            name: "Transportation",              description: "Agencies writing trucking, commercial auto, and cargo risk — identified by appointments with specialty trucking carriers.",                                                                                                                   icon_key: "Truck",       color_token: "brand",   sort_order: 1, mapped_carrier_count: 12, agencies_with_exposure: 78,  agencies_growing: 6, agencies_specialist: 0, agency_count: 361,   location_count: 521,   contact_count: 4011  },
  { slug: "healthcare-human-services", name: "Healthcare & Human Services",  description: "Agencies writing medical professional liability, allied health, aging services, and nonprofit/social-services risk — identified by appointments with the specialty carriers that dominate each segment.",                                    icon_key: "Stethoscope", color_token: "success", sort_order: 2, mapped_carrier_count: 21, agencies_with_exposure: 31,  agencies_growing: 0, agencies_specialist: 0, agency_count: 263,   location_count: 312,   contact_count: 2236  },
  { slug: "construction",              name: "Construction",                 description: "Agencies writing contractors, builders risk, and surety — identified by deep appointments with construction-focused commercial carriers.",                                                                                                     icon_key: "HardHat",     color_token: "gold",    sort_order: 3, mapped_carrier_count: 20, agencies_with_exposure: 83,  agencies_growing: 2, agencies_specialist: 0, agency_count: 679,   location_count: 968,   contact_count: 6633  },
  { slug: "agriculture",               name: "Agriculture",                  description: "Agencies writing farms, ranches, agribusiness, and crop — identified by appointments with agricultural and farm mutual carriers.",                                                                                                             icon_key: "Wheat",       color_token: "success", sort_order: 4, mapped_carrier_count: 18, agencies_with_exposure: 603, agencies_growing: 1, agencies_specialist: 0, agency_count: 5189,  location_count: 7023,  contact_count: 34606 },
];


export default async function MarketingHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [carriers, affiliations, plans, tiers, verticalsRes] = await Promise.all([
    supabase.from("carriers").select("id", { count: "exact", head: true }),
    supabase.from("affiliations").select("id", { count: "exact", head: true }),
    supabase.from("billing_plans")
      .select("id,code,name,tagline,price_cents,interval,download_quota,features,sort_order")
      .eq("active", true).order("sort_order"),
    supabase.from("plan_bulk_tiers")
      .select("plan_id,min_credits,max_credits,unit_cents,discount_pct,sort_order")
      .order("sort_order"),
    supabase.from("mv_vertical_summary").select("slug,name,description,icon_key,color_token,sort_order,mapped_carrier_count,agencies_with_exposure,agencies_growing,agencies_specialist,agency_count,location_count,contact_count").order("sort_order")
  ]);

  const carrierCount = carriers.count ?? 0;
  const affiliationCount = affiliations.count ?? 0;
  const planList = plans.data ?? [];
  const tierList = tiers.data ?? [];
  const memberPlan = planList.find((p) => p.code === "growth_member");
  const snapshotPlan = planList.find((p) => p.code === "snapshot");
  const memberTiers = tierList.filter((t) => t.plan_id === memberPlan?.id);
  const snapshotTiers = tierList.filter((t) => t.plan_id === snapshotPlan?.id);
  const verticalsData = (verticalsRes.data ?? []) as Array<{ slug: string; name: string; description: string; icon_key: string; color_token: string; agencies_with_exposure: number; agencies_growing: number; agencies_specialist: number; mapped_carrier_count: number; agency_count: number; location_count: number; contact_count: number }>;
  const verticals = verticalsData.length > 0 ? verticalsData : VERTICAL_FALLBACK;

  return (
    <div className="bg-white">
      <MarketingNav isAuthed={!!user} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                <Zap className="h-3.5 w-3.5" />
                Distribution intelligence for U.S. commercial insurance
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Find the agencies who can <span className="text-brand-600">bind your program.</span> Today.
              </h1>
              <p className="mt-6 text-lg font-normal leading-8 text-gray-600">
                Seven16 maps the writing-company paper trail behind every U.S. commercial agency &mdash; refreshed
                monthly against state filings &mdash; so you target the agents who already hold the carriers
                your program competes with, not the ones who say they do.
              </p>
              <p className="mt-4 text-sm leading-6 text-gray-500">
                ZoomInfo gives you names. AM Best gives you financials. Neither tells you which of the 36,000
                agencies in our database actually hold Acadia, Lexington, Society, Carolina Casualty, or
                Berkley Luxury Group paper this quarter. We do &mdash; and we publish the parent-group
                hierarchy behind every appointment so you know exactly what each agency can bind.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href={user ? "/build-list" : "/sign-up"}
                  className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  {user ? "Go to your dashboard" : "See verified agencies in your vertical"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#pricing" className="text-sm font-semibold text-gray-900 hover:text-gray-700">
                  Compare our pricing model &rarr;
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                No credit card required &middot; 0 free credits to browse &middot; 36,212 agencies, 87,000+ contacts, 400+ writing companies mapped
              </p>
            </div>

            {/* Right: hero visual */}
            <div className="relative lg:order-last">
              <div className="relative aspect-[16/12] w-full overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-xl shadow-brand-900/5 ring-1 ring-black/5">
                <Image
                  src="/images/hero/hero.webp"
                  alt="Insurance agency directory dashboard"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="pointer-events-none absolute -inset-x-8 -inset-y-4 -z-10 rounded-3xl bg-gradient-to-tr from-brand-100/40 via-transparent to-transparent blur-2xl" aria-hidden />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-4xl mx-auto">
            <Stat label="Writing companies mapped" value="400+" />
            <Stat label="Parent insurance groups" value="60" />
            <Stat label="Verified U.S. agencies" value="36,212" />
            <Stat label="Refresh cycle" value="30 days" />
          </div>
        </div>
      </section>

      {/* ======== WHY THIS EXISTS ======== */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900">
              ZoomInfo doesn&rsquo;t know which agents bind your business. Neither does AM Best.
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-7">
              <p>
                Most distribution teams are running the same playbook in 2026 they ran in 2018:
                a generic agency list, a CRM full of role titles, and an SDR team cold-calling P&amp;C
                &ldquo;decision-makers&rdquo; who haven&rsquo;t seen a submission for your specialty in five years.
              </p>
              <p>
                The data exists to do better. Every U.S. commercial agency files which carriers it
                represents. Every carrier publishes its writing companies. The mapping between them
                is public &mdash; but it&rsquo;s never been assembled, normalized, and refreshed against
                state DOI filings into one queryable dataset.
              </p>
              <p className="text-gray-900 font-medium">
                That&rsquo;s what Seven16 is. We assembled it. We refresh it monthly. We publish it as a
                filterable directory tied to the carriers your program actually competes with. Then we
                let you target by who holds the paper &mdash; not by who claims the title.
              </p>
            </div>
          </div>

          {/* 3-column proof grid */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <Proof
              icon={Network}
              title="The knowledge graph"
              headline="400+ writing companies &rarr; 60 parent groups."
              body="Every writing company normalized to its corporate parent. Filter on &lsquo;Berkshire Hathaway&rsquo; and you find the agencies holding National Indemnity, Medical Protective, GUARD, GEICO, biBERK, and Princeton paper &mdash; in one query."
            />
            <Proof
              icon={Layers}
              title="Vertical inference"
              headline="Specialization scored by behavior, not self-report."
              body="We score every agency on observed appointment behavior across 12 verticals. Hold 2 specialty trucking carriers? Tagged Exposure. Hold 5+? Specialist. No keyword games. No SIC codes from 2018."
            />
            <Proof
              icon={ShieldCheck}
              title="Verified hygiene"
              headline="30-day refresh, dual-agent verification."
              body="Every record cross-checked against state DOI public filings. Two independent agents review every change before it goes live. Every row in our UI carries the verified-as-of date."
            />
          </div>

          {/* Methodology callout */}
          <div className="mt-14 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                  Methodology
                </div>
                <h3 className="mt-1 text-lg font-semibold text-navy-800">
                  Three signals turn 36,000 agencies into your real recruit list.
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Volume tells you whether they exist. Specialization Tier tells you what they
                  write. Carrier Diversity tells you whether they&rsquo;re free to write yours. The
                  full framework, plus five named recruit plays, is published.
                </p>
              </div>
              <div className="shrink-0">
                <a
                  href="/methodology"
                  className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Read the methodology
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== WHY COMPANIES SWITCH ======== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Three reasons distribution leaders move budget from ZoomInfo and AM Best to Seven16.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <SwitchCard
              n="01"
              title="Precision over volume"
              body="ZoomInfo will sell you 50,000 P&amp;C &lsquo;leads.&rsquo; 90% have never written your line of business. Seven16 returns the 600 agencies that hold the carriers you compete with &mdash; verified this month. Lower volume, higher conversion. Your SDR team stops cold-calling ghosts."
            />
            <SwitchCard
              n="02"
              title="Competitive intelligence built in"
              body="When you see Carolina Casualty on an agent&rsquo;s appointment list, you know they have W.R. Berkley access &mdash; and a relationship with the underwriter your program is trying to displace. The pitch becomes: &lsquo;I see you write on Carolina Casualty paper. Our program writes the same risk with broader coverage and better commission.&rsquo; Win the appointment, not the lookup."
            />
            <SwitchCard
              n="03"
              title="Auditable freshness"
              body="Every record carries a verified-as-of date. Every change is reviewed by two independent agents before publishing. Your CRM stops decaying the moment the data lands. Pay Seven16 for one that&rsquo;s 97% accurate every 30 days &mdash; instead of paying ZoomInfo for a list that&rsquo;s 25% wrong by month six."
            />
          </div>
        </div>
      </section>

      {/* ======== VERTICAL SPECIALTIES ======== */}
      <section id="verticals" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-navy-800">12 verticals. Carrier-verified. Click to see the targeted list.</h2>
            <p className="mt-4 text-gray-600">
              Each vertical below is a pre-filtered, ready-to-export targeted list of agencies with proven
              specialty appointments. Counts are live. Tier scores update the moment we pick up a new
              appointment in our monthly refresh.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {verticals.map((v) => {
              const Icon = (
                { Truck, Stethoscope, HardHat, Wheat, HeartHandshake } as Record<string, typeof Truck>
              )[v.icon_key] ?? HardHat;
              const accent = ({
                brand:   { bg: "bg-brand-50",   text: "text-brand-700",   border: "border-brand-100" },
                success: { bg: "bg-success-50", text: "text-success-700", border: "border-success-100" },
                gold:    { bg: "bg-gold-50",    text: "text-gold-800",    border: "border-gold-100" },
                navy:    { bg: "bg-navy-50",    text: "text-navy-800",    border: "border-navy-100" },
              } as Record<string, { bg: string; text: string; border: string }>)[v.color_token] ?? { bg: "bg-brand-50", text: "text-brand-700", border: "border-brand-100" };
              return (
                <Link
                  key={v.slug}
                  href={`/verticals#${v.slug}`}
                  className={`group rounded-xl border ${accent.border} bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${accent.bg}`}>
                    <Icon className={`h-5 w-5 ${accent.text}`} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-navy-800">{v.name}</h3>
                  <dl className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-baseline justify-between"><dt className="text-gray-500">Agencies</dt><dd className="font-semibold tabular-nums text-navy-800">{(v.agency_count ?? 0).toLocaleString()}</dd></div>
                    <div className="flex items-baseline justify-between"><dt className="text-gray-500">Locations</dt><dd className="font-semibold tabular-nums text-navy-800">{(v.location_count ?? 0).toLocaleString()}</dd></div>
                    <div className="flex items-baseline justify-between"><dt className="text-gray-500">Contacts</dt><dd className="font-semibold tabular-nums text-navy-800">{(v.contact_count ?? 0).toLocaleString()}</dd></div>
                  </dl>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/verticals" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              See the full vertical breakdown →
            </Link>
          </div>
        </div>
      </section>

      {/* ======== COMPARISON + PRICING ======== */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Pricing scales with how fresh you need the data.</h2>
            <p className="mt-4 text-gray-600">
              Distribution intelligence decays at roughly 3% per month &mdash; agents move firms, agencies merge,
              carrier rosters change. Pick the cadence your distribution organization can tolerate.
            </p>
          </div>

          {/* Three-column comparison strip — Free / Growth Member / Snapshot */}
          <div className="mt-12 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm border border-gray-200 rounded-lg bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600">&nbsp;</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600">Free</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-brand-700 bg-brand-50">Growth Member</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600">One-Time Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <PriceRow label="Price"           free="$0"                    member="$99 / month" snapshot="$125 (one-time)" />
                <PriceRow label="Best for"        free="Analysts mapping the market" member="Distribution teams running an active pipeline" snapshot="Project teams (M&amp;A diligence, market entry)" />
                <PriceRow label="Database access" free="Full filter access, unlimited search" member="Full filter access, unlimited search" snapshot="Full filter access, unlimited search" />
                <PriceRow label="Downloads"       free="0 credits"             member="250 credits / month included" snapshot="250 credits one-time" />
                <PriceRow label="Hygiene refresh" free="View latest only"      member="Free monthly refresh on all saved lists" snapshot="Snapshot only &mdash; no refresh" highlight />
                <PriceRow label="Team seats"      free="1"                     member="3 (owner + 2 invitees)" snapshot="1" highlight />
                <PriceRow label="Verticals"       free="All 12 visible"        member="All 12 + targeted-list export" snapshot="All 12 + targeted-list export" />
                <PriceRow label="Support"         free="Self-serve docs"       member="Email + onboarding call" snapshot="Email" />
                <tr>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4">
                    <Link href={user ? "/build-list" : "/sign-up"} className="block text-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50">
                      {user ? "You\u2019re on Free" : "Start free"}
                    </Link>
                  </td>
                  <td className="px-4 py-4 bg-brand-50">
                    <Link href={user ? "/api/stripe/checkout?plan=growth_member" : "/sign-up?plan=growth_member"} className="block text-center rounded-md bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
                      {user ? "Upgrade \u2014 $99/mo" : "Start Growth Member"}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={user ? "/api/stripe/checkout?plan=snapshot" : "/sign-up?plan=snapshot"} className="block text-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50">
                      {user ? "Buy Snapshot \u2014 $125" : "Buy a Snapshot"}
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Two value paragraphs */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-6">
              <h3 className="text-base font-semibold text-gray-900">Why Growth Member is the right call for most teams.</h3>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                At $99/month, the question isn&rsquo;t whether the data is worth it &mdash; it&rsquo;s whether your team
                will land <em>one</em> additional agent-of-record win per quarter from a Seven16-sourced list.
                One incremental AOR with a $250K premium book at a 15% commission pays for the subscription
                for ~50 years. Most teams see lift in the first 60 days.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-6">
              <h3 className="text-base font-semibold text-gray-900">When to buy a Snapshot instead.</h3>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                If you&rsquo;re running a one-time market mapping &mdash; pre-acquisition diligence, new-program
                launch, geographic expansion &mdash; Snapshot gives you a verified state-of-the-market export
                the day you need it. No subscription, no commitment, no ongoing hygiene. The export captures
                every appointment relationship as of the export date and is yours to keep.
              </p>
            </div>
          </div>

          {/* Risk reversal microcopy */}
          <p className="mt-8 text-center text-xs text-gray-500">
            Cancel any time &middot; Cancel before month 2 and we refund the first month, no questions asked &middot; Your saved lists and downloads are yours forever even if you cancel
          </p>

          {/* Bulk credit tiers */}
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <BulkTable title="Member Loyalty Pricing" tiers={memberTiers} note="Available to active Growth Members." />
            <BulkTable title="One-Time Guest Pricing" tiers={snapshotTiers} note="Available after initial 500-credit snapshot." />
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Prices illustrative — Stripe checkout launches with live sandbox products.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Every filter an insurance buyer actually uses.</h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Feature title="Carrier appointments" desc="Filter agencies by who they write with — 394 carriers across 100 parent groups." />
            <Feature title="Cluster networks" desc="123 affiliations indexed: SIAA, Keystone, ISU, Assurex, Iroquois, ANE, APPEX, and more." />
            <Feature title="Agency Management System" desc="Include or exclude agencies by AMS — Applied, EZLynx, HawkSoft, AMS360, EPIC, and 55+ more." />
            <Feature title="Geography" desc="By state, county, metro area, 3- or 5-digit ZIP. Import your own ZIPs from xlsx." />
            <Feature title="Role + department" desc="Contact filters: levels of management (entry to C-suite), department (underwriting, sales, ops, M&A, risk)." />
            <Feature title="Account size" desc="Premium volume, revenue, employee count ranges. Combine with AND / OR across metrics." />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-gray-100 bg-gradient-to-br from-navy-800 via-navy-700 to-brand-700">
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Stop targeting by title. Start targeting by paper.
          </h2>
          <p className="mt-4 text-lg text-brand-100 max-w-2xl mx-auto">
            See the agencies in your vertical, refreshed this month, scored by appointment-based
            specialization. Free to browse. Pay only when you download.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={user ? "/build-list" : "/sign-up"}
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-800 shadow-sm hover:bg-brand-50"
            >
              {user ? "Open the app" : "Browse the directory free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:hello@seven16group.com?subject=Seven16%20%E2%80%94%20Distribution%20intelligence%20demo"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              Talk to our distribution team
            </a>
          </div>
          <p className="mt-8 text-xs text-brand-200">
            No long-term contract. Built for in-house distribution and growth teams.
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-10">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>© {new Date().getFullYear()} Seven16 Group. Built on Supabase + Vercel.</div>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:text-gray-700">Sign in</Link>
            <Link href="/sign-up" className="hover:text-gray-700">Sign up</Link>
            <a href="#pricing" className="hover:text-gray-700">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-brand-600">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}

function Step({ n, title, desc, icon: Icon }: { n: number; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white text-sm font-bold">{n}</div>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function PricingCard({
  name, tagline, priceCents, interval, quota, features, ctaHref, ctaLabel, highlight, subhead, subbody
}: {
  name: string; tagline: string | null; priceCents: number; interval: string; quota: number | null;
  features: string[]; ctaHref: string; ctaLabel: string; highlight?: boolean; subhead?: string; subbody?: string;
}) {
  const dollars = Math.round(priceCents / 100);
  return (
    <div className={"rounded-xl border p-6 bg-white " + (highlight ? "border-brand-500 ring-2 ring-brand-500 shadow-md" : "border-gray-200")}>
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        {highlight && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Most popular</span>}
      </div>
      <div className="mt-2 text-sm text-gray-600">{tagline}</div>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-900">${dollars}</span>
        {interval === "month" && <span className="text-gray-500">/ month</span>}
        {interval === "one_time" && <span className="text-gray-500">once</span>}
      </div>
      {quota != null && <div className="mt-1 text-sm text-gray-500">{quota} credits {interval === "month" ? "each month" : "total"}</div>}

      {subhead && (
        <div className="mt-5 rounded-md bg-gray-50 p-3">
          <div className="text-sm font-semibold text-gray-900">{subhead}</div>
          {subbody && <p className="mt-1 text-xs text-gray-600">{subbody}</p>}
        </div>
      )}

      <ul className="mt-6 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-brand-600 flex-none mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={ctaHref} className={"mt-8 block rounded-md px-4 py-2.5 text-center text-sm font-semibold " + (highlight ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200")}>
        {ctaLabel}
      </Link>
    </div>
  );
}

function CompRow({
  label, member, guest, memberIcon, memberLabel, guestLabel
}: {
  label: string;
  member?: string;
  guest?: string | React.ReactNode;
  memberIcon?: boolean;
  memberLabel?: string;
  guestLabel?: string;
}) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium text-gray-900">{label}</td>
      <td className="px-4 py-3 text-brand-700">
        {memberIcon ? (
          <div className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-brand-600" />{memberLabel ?? ""}</div>
        ) : member}
      </td>
      <td className="px-4 py-3 text-gray-700">
        {typeof guest === "string" ? guest : (<div className="inline-flex items-center gap-2">{guest}{guestLabel ?? ""}</div>)}
      </td>
    </tr>
  );
}

function Proof({
  icon: Icon, title, headline, body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  headline: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{title}</div>
      <h3 className="mt-1 text-base font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: headline }} />
      <p className="mt-2 text-sm leading-6 text-gray-600" dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}

function SwitchCard({
  n, title, body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-xs font-mono font-semibold text-gray-300">{n}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600" dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}

function PriceRow({
  label, free, member, snapshot, highlight = false,
}: {
  label: string;
  free: string;
  member: string;
  snapshot: string;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-brand-50/30" : ""}>
      <td className="px-4 py-3 font-medium text-gray-900">{label}</td>
      <td className="px-4 py-3 text-gray-700" dangerouslySetInnerHTML={{ __html: free }} />
      <td className="px-4 py-3 text-brand-900 bg-brand-50/40 font-medium" dangerouslySetInnerHTML={{ __html: member }} />
      <td className="px-4 py-3 text-gray-700" dangerouslySetInnerHTML={{ __html: snapshot }} />
    </tr>
  );
}

function BulkTable({ title, tiers, note }: { title: string; tiers: any[]; note?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="py-2">Additional Credits</th>
            <th className="py-2 text-right">Cost / Contact</th>
            <th className="py-2 text-right">Discount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tiers.map((t) => (
            <tr key={`${t.min_credits}-${t.max_credits ?? 'max'}`}>
              <td className="py-2 text-gray-700">
                {t.min_credits.toLocaleString()} – {t.max_credits ? t.max_credits.toLocaleString() : "∞"}
              </td>
              <td className="py-2 text-right tabular-nums text-gray-900">${(t.unit_cents / 100).toFixed(2)}</td>
              <td className="py-2 text-right text-gray-500">{t.discount_pct}% off</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
