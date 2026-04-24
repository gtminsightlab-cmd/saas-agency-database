import Link from "next/link";
import { Check, Filter, Download, Search, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";

export const dynamic = "force-dynamic";

export default async function MarketingHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [carriers, affiliations, plans] = await Promise.all([
    supabase.from("carriers").select("id", { count: "exact", head: true }),
    supabase.from("affiliations").select("id", { count: "exact", head: true }),
    supabase
      .from("billing_plans")
      .select("code, name, tagline, price_cents, interval, download_quota, features, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
  ]);

  const carrierCount = carriers.count ?? 0;
  const affiliationCount = affiliations.count ?? 0;

  return (
    <div className="bg-white">
      <MarketingNav isAuthed={!!user} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Zap className="h-3.5 w-3.5" />
              Built for insurance carriers, MGAs, and wholesalers
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find the right commercial agency <span className="text-brand-600">in seconds</span>.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Search {carrierCount.toLocaleString()}+ carriers and {affiliationCount}+ affiliations
              across tens of thousands of independent agencies. Filter by appointments,
              geography, AMS, and agency size. Export contact rosters on demand.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href={user ? "/build-list" : "/sign-up"}
                className="rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                {user ? "Go to your dashboard" : "Get started — free"}
              </Link>
              <a href="#how-it-works" className="text-sm font-semibold text-gray-900 hover:text-gray-700">
                See how it works →
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-500">No credit card required · Free forever plan</p>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-3xl mx-auto">
            <Stat label="Carriers" value={carrierCount.toLocaleString()} />
            <Stat label="Affiliations" value={affiliationCount.toString()} />
            <Stat label="Agencies indexed" value="36,000+" />
            <Stat label="Contacts" value="168,000+" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Three clicks from a filter to a CSV.</h2>
            <p className="mt-4 text-gray-600">
              Stop paying for bloated lead platforms. Pay for what you download, when you download it.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <Step n={1} title="Build" desc="Stack filters — carriers, affiliations, state, AMS, revenue band, contact role. Record counts update live." icon={Filter} />
            <Step n={2} title="Review" desc="Preview matching accounts + contacts before committing. Edit filters until the list is exactly what you want." icon={Search} />
            <Step n={3} title="Download" desc="Export to CSV or Excel. Subscribe to $99/mo for 500 leads, or pay per download by quantity." icon={Download} />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Every filter an insurance buyer actually uses.</h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Feature title="Carrier appointments" desc="Filter agencies by who they write with — 394 carriers across 100 parent groups, from State Farm to Kinsale." />
            <Feature title="Cluster networks" desc="123 affiliations indexed: SIAA, Keystone, ISU, Assurex, Iroquois, and more. Include or exclude networks independently." />
            <Feature title="Agency Management System" desc="Include or exclude agencies by AMS — Applied, EZLynx, HawkSoft, AMS360, EPIC, and 55+ more." />
            <Feature title="Geography" desc="By state, county, metro area, 3- or 5-digit ZIP. Import your own ZIPs from xlsx." />
            <Feature title="Role + department" desc="Contact filters: levels of management (entry to C-suite), department (underwriting, sales, ops, M&A, risk)." />
            <Feature title="Account size" desc="Premium volume, revenue, employee count ranges. Combine with AND / OR across metrics." />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Simple pricing. Pay for what you download.</h2>
            <p className="mt-4 text-gray-600">Browse free forever. Buy credits, or subscribe for the best per-lead rate.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {(plans.data ?? []).map((p) => (
              <PricingCard
                key={p.code}
                highlight={p.code === "pro"}
                name={p.name}
                tagline={p.tagline}
                priceCents={p.price_cents}
                interval={p.interval}
                quota={p.download_quota}
                features={(p.features as unknown as string[]) ?? []}
                ctaHref={user ? "/build-list" : "/sign-up"}
                ctaLabel={p.code === "free" ? "Start free" : p.code === "pro" ? "Start Pro" : "Browse and pay later"}
              />
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-gray-500">
            Prices are illustrative. Subscription includes cancel-anytime billing; per-download purchases are charged by quantity at checkout.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to stop guessing at distribution?</h2>
          <p className="mt-4 text-gray-600">Sign up in 30 seconds. Build your first list free. Upgrade only if you need the data.</p>
          <div className="mt-8">
            <Link href={user ? "/build-list" : "/sign-up"} className="inline-flex rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
              {user ? "Open the app" : "Create your free account"}
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

function PricingCard({ name, tagline, priceCents, interval, quota, features, ctaHref, ctaLabel, highlight }: { name: string; tagline: string | null; priceCents: number; interval: string; quota: number | null; features: string[]; ctaHref: string; ctaLabel: string; highlight?: boolean }) {
  const dollars = Math.round(priceCents / 100);
  return (
    <div className={"rounded-xl border p-6 bg-white " + (highlight ? "border-brand-500 ring-2 ring-brand-500 shadow-md" : "border-gray-200")}>
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        {highlight && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Most popular</span>}
      </div>
      <div className="mt-2 text-sm text-gray-600">{tagline}</div>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-900">{priceCents === 0 && interval !== "one_time" ? "$0" : `$${dollars}`}</span>
        {interval === "month" && <span className="text-gray-500">/ month</span>}
        {interval === "year" && <span className="text-gray-500">/ year</span>}
        {interval === "one_time" && <span className="text-gray-500">+ per batch</span>}
      </div>
      {quota != null && <div className="mt-1 text-sm text-gray-500">{quota} downloads included</div>}
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
