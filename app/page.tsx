import Image from "next/image";
import Link from "next/link";
import { Check, Filter, Download, Search, Zap, X, Truck, Stethoscope, HardHat, Wheat, HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";

export const dynamic = "force-dynamic";

// Snapshot fallback — used only while PostgREST hosted schema cache is still picking up
// the mv_vertical_summary view. Values captured from MCP at migration time; they update
// automatically once the cache refreshes and the live query starts returning rows.
const VERTICAL_FALLBACK = [
  { slug: "transportation",            name: "Transportation",              description: "Agencies writing trucking, commercial auto, and cargo risk — identified by appointments with specialty trucking carriers.",                                                                                                                   icon_key: "Truck",       color_token: "brand",   sort_order: 1, mapped_carrier_count: 12, agencies_with_exposure: 54,  agencies_growing: 3, agencies_specialist: 0, agency_count: 204,   location_count: 294,   contact_count: 2148  },
  { slug: "healthcare-human-services", name: "Healthcare & Human Services",  description: "Agencies writing medical professional liability, allied health, aging services, and nonprofit/social-services risk — identified by appointments with the specialty carriers that dominate each segment.",                                    icon_key: "Stethoscope", color_token: "success", sort_order: 2, mapped_carrier_count: 21, agencies_with_exposure: 21,  agencies_growing: 0, agencies_specialist: 0, agency_count: 158,   location_count: 181,   contact_count: 1466  },
  { slug: "construction",              name: "Construction",                 description: "Agencies writing contractors, builders risk, and surety — identified by deep appointments with construction-focused commercial carriers.",                                                                                                     icon_key: "HardHat",     color_token: "gold",    sort_order: 3, mapped_carrier_count: 20, agencies_with_exposure: 51,  agencies_growing: 2, agencies_specialist: 0, agency_count: 318,   location_count: 471,   contact_count: 3890  },
  { slug: "agriculture",               name: "Agriculture",                  description: "Agencies writing farms, ranches, agribusiness, and crop — identified by appointments with agricultural and farm mutual carriers.",                                                                                                             icon_key: "Wheat",       color_token: "success", sort_order: 4, mapped_carrier_count: 18, agencies_with_exposure: 281, agencies_growing: 1, agencies_specialist: 0, agency_count: 1777,  location_count: 2600,  contact_count: 15724 },
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
                Built for MGUs, wholesalers, carriers, and industry partners
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Unlock Agency Connections. Drive Growth. <span className="text-brand-600">Target with Precision.</span>
              </h1>
              <p className="mt-6 text-lg font-normal leading-8 text-gray-600">
                Data for MGU&rsquo;s, Wholesalers, Carriers, and Industry Partners.
              </p>
              <p className="mt-4 text-base leading-7 text-gray-500">
                Distribution Intelligence decays by 3% every month. Membership keeps your pipeline alive with monthly
                Hygiene updates — so you never call a ghost agent again.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href={user ? "/build-list" : "/sign-up"}
                  className="rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  {user ? "Go to your dashboard" : "Start with 0 credits, free"}
                </Link>
                <a href="#pricing" className="text-sm font-semibold text-gray-900 hover:text-gray-700">
                  Compare plans →
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-500">Company-email sign-up required · No credit card to browse</p>
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
            <Stat label="Carriers" value={carrierCount.toLocaleString()} />
            <Stat label="Affiliations" value={affiliationCount.toString()} />
            <Stat label="Agencies in Network" value="8,000+" />
            <Stat label="Contacts" value="31,000+" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">From Intelligence to Distribution. Three clicks.</h2>
            <p className="mt-4 text-gray-600">
              Replace bloated lead platforms with Distribution Infrastructure built for Precision targeting. Pay for what you download, when you download it.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <Step n={1} title="Build" desc="Stack filters — carriers, affiliations, state, AMS, revenue band, contact role. Record counts update live." icon={Filter} />
            <Step n={2} title="Review" desc="Preview matching accounts + contacts before committing. Edit filters until the list is exactly what you want." icon={Search} />
            <Step n={3} title="Download" desc="Export to CSV or Excel. Subscribe for monthly credits + free Hygiene updates, or buy a one-time snapshot." icon={Download} />
          </div>
        </div>
      </section>

      {/* ======== VERTICAL SPECIALTIES ======== */}
      <section id="verticals" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-navy-800">Find agencies by vertical practice.</h2>
            <p className="mt-4 text-gray-600">
              We infer specialization from carrier appointments. The more specialty carriers an agency
              holds for a vertical, the higher the probability they have a real book of business in it.
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
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Choose Your Distribution Strategy</h2>
            <p className="mt-4 text-gray-600">
              Distribution Intelligence decays at 3% per month. Keep your pipeline alive with real-time Hygiene updates and Precision targeting.
            </p>
          </div>

          {/* Two headline cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {memberPlan && (
              <PricingCard
                highlight
                name={memberPlan.name}
                tagline={memberPlan.tagline}
                priceCents={memberPlan.price_cents}
                interval={memberPlan.interval}
                quota={memberPlan.download_quota}
                features={(memberPlan.features as unknown as string[]) ?? []}
                ctaHref={user ? "/build-list" : "/sign-up?plan=growth_member"}
                ctaLabel={user ? "Upgrade to Growth" : "Start Growth Member"}
                subhead="Never call a dead lead."
                subbody="Distribution decays daily — agencies merge and agents move. Members receive free monthly Hygiene updates to all saved contacts so your CRM stays Precision-accurate."
              />
            )}
            {snapshotPlan && (
              <PricingCard
                name={snapshotPlan.name}
                tagline={snapshotPlan.tagline}
                priceCents={snapshotPlan.price_cents}
                interval={snapshotPlan.interval}
                quota={snapshotPlan.download_quota}
                features={(snapshotPlan.features as unknown as string[]) ?? []}
                ctaHref={user ? "/build-list" : "/sign-up?plan=snapshot"}
                ctaLabel={user ? "Buy a Snapshot" : "Buy a Snapshot"}
                subhead="Perfect for individual sprints."
                subbody="Need to fill a recruiting class or launch a one-off Distribution sprint? The Snapshot gives you 500 enriched contacts and a 90-day Precision window — no commitment required."
              />
            )}
          </div>

          {/* Comparison table */}
          <div className="mt-16 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm border border-gray-200 rounded-lg bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600">Feature</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-brand-700">Growth Member</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-600">One-Time Guest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <CompRow label="Price" member="$99 / month" guest="$125 (once)" />
                <CompRow label="Initial Credits" member="500 / month" guest="500 (one-time)" />
                <CompRow label="Data Hygiene" memberIcon guest={<X className="h-4 w-4 text-gray-300" />} memberLabel="Included — free updates" guestLabel="Static — no updates" />
                <CompRow label="Search Access" member="Unlimited lookups" guest="10/mo for 90 days" />
                <CompRow label="Visibility" member="Always unlocked" guest="Email + phone blurred after 90 days" />
                <CompRow label="Bulk Discount" member="Up to 50% off" guest="Up to 38% off" />
                <CompRow label="Credit Rollover" member="Up to 90 days" guest="N/A" />
              </tbody>
            </table>
          </div>

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

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Keep your pipeline alive.</h2>
          <p className="mt-4 text-gray-600">
            Sign up with your company email. Browse unlimited. Upgrade only when you need the data.
          </p>
          <div className="mt-8">
            <Link href={user ? "/build-list" : "/sign-up"} className="inline-flex rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
              {user ? "Open the app" : "Create your company account"}
            </Link>
          </div>
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
