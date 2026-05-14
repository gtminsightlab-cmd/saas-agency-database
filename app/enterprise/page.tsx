import Link from "next/link";
import { ArrowRight, Check, Map, Layers, Zap, ShieldCheck, TrendingUp, Building2, Users, Mail } from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Tier = { price: number; states: string[] };

const TIER_1: Tier = {
  price: 2000,
  states: ["CA", "MI", "NY", "OH", "PA"],
};

const TIER_2: Tier = {
  price: 1500,
  states: ["CO", "FL", "GA", "IA", "IL", "IN", "KY", "LA", "MA", "MN", "MO", "NC", "NJ", "TX", "WI"],
};

const TIER_3: Tier = {
  price: 1000,
  states: [
    "AL", "AR", "AZ", "CT", "DE", "ID", "KS", "MD", "ME", "MS", "MT", "ND", "NE",
    "NH", "NM", "NV", "OK", "OR", "RI", "SC", "SD", "TN", "UT", "VA", "VT", "WA", "WV", "WY",
  ],
};

const TERRITORIAL_ADDONS = ["AK", "DC", "HI"];

const ALA_CARTE_TOTAL =
  TIER_1.states.length * TIER_1.price +
  TIER_2.states.length * TIER_2.price +
  TIER_3.states.length * TIER_3.price;

const ALL_50_CEILING = 12500;
const BUNDLE_25_FLAT = 9500;

export default async function EnterprisePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="bg-white">
      <MarketingNav isAuthed={!!user} />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300">
              <Zap className="h-3.5 w-3.5" />
              Enterprise+ &middot; Distribution Suite
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Built for the team that grows distribution.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              The $19 Producer tier and the $99 Growth tier are how individual agents bind more accounts.
              Enterprise+ is the other thing &mdash; the annual contract that gives a VP of Distribution,
              an MGA, a wholesaler, or a carrier the full agency footprint of every state they operate in,
              at half the price of the legacy competitor.
            </p>
            <p className="mt-4 text-base leading-7 text-gray-300">
              Demo-led. Annual contract. Per-state pricing, all-states ceiling, all 50 jurisdictions for{" "}
              <span className="font-semibold text-gold-300">$12,500/year</span>.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="mailto:hello@seven16group.com?subject=Enterprise%2B%20demo%20request"
                className="inline-flex items-center gap-2 rounded-md bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-900 shadow-sm hover:bg-gold-400"
              >
                Request a distribution demo
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#pricing" className="text-sm font-semibold text-gray-100 hover:text-white">
                See the per-state math &rarr;
              </a>
            </div>
            <p className="mt-6 text-xs text-gray-400">
              Distribution Expander pricing. Buyer = VP of Distribution / Director of Producer Development at MGAs,
              wholesalers, carriers, aggregators, and insurtechs.
            </p>
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              This page is for a different buyer than the rest of the site.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              The published Producer and Growth tiers are designed for the individual agent who can expense the
              cost on a P-card and start prospecting the same day. That&rsquo;s the small-firm wedge &mdash; the
              right product for the right customer, with the right price.
            </p>
            <p className="mt-4 text-gray-600 leading-7">
              Enterprise+ is for a different customer entirely. You&rsquo;re not trying to find your next account.
              You&rsquo;re trying to grow a producer footprint, recruit an appointment book, expand into a new
              state, or pressure-test the market for a new program. The KPI isn&rsquo;t accounts bound &mdash;
              it&rsquo;s agents appointed.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Self-serve tiers
              </div>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">Producer / Growth</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <span>Individual agent &middot; per-seat &middot; monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <span>$19/mo Producer, $99/mo Growth, $399+ self-serve Enterprise</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <span>P-card expense, sign up online, start same session</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <span>Credits + top-up slider for heavy users</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-300 bg-brand-50/40 p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Annual contract
              </div>
              <h3 className="mt-2 text-lg font-semibold text-navy-900">Enterprise+</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-800">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                  <span>Org-wide &middot; team seats included &middot; annual</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                  <span>Per-state pricing $1,000&ndash;$2,000 &middot; all-50 ceiling $12,500</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                  <span>Demo-led, procurement-routed, contract-anchored</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                  <span>Distribution+ outcome SKU available on contract</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AGENCY SIGNAL ENTERPRISE+ PRICING */}
      <section id="pricing" className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Agency Signal &middot; Enterprise+
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Pick the states you operate in. Or take the whole country at half the legacy price.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              State pricing anchors on the data inside it &mdash; specifically, the count of verified
              email contacts inside Agency Signal&rsquo;s 41,705-agency directory.
              Across all 50 states and DC we currently maintain <span className="font-semibold text-gray-900">115,892
              verified email contacts</span> (85.6% of 135,453 total contacts), refreshed against a
              dual-agent verification pipeline.
            </p>
            <p className="mt-4 text-gray-600 leading-7">
              States with denser reachable people cost more. States with less data cost less. Three small
              jurisdictions (AK, DC, HI) come free with any purchase &mdash; we don&rsquo;t charge you for
              data depth we don&rsquo;t have.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <TierCard
              label="Tier 1"
              price={TIER_1.price}
              subhead="High-density states"
              rule="&ge;5,000 verified email contacts"
              count={TIER_1.states.length}
              states={TIER_1.states}
              accent="border-gold-300 bg-gold-50/50"
              labelClass="text-gold-700"
            />
            <TierCard
              label="Tier 2"
              price={TIER_2.price}
              subhead="Mid-density states"
              rule="2,000&ndash;4,999 verified email contacts"
              count={TIER_2.states.length}
              states={TIER_2.states}
              accent="border-brand-200 bg-white"
              labelClass="text-brand-700"
            />
            <TierCard
              label="Tier 3"
              price={TIER_3.price}
              subhead="Lower-density states"
              rule="&lt;2,000 verified email contacts"
              count={TIER_3.states.length}
              states={TIER_3.states}
              accent="border-gray-200 bg-white"
              labelClass="text-gray-700"
            />
          </div>

          {/* Territorial add-ons */}
          <div className="mt-6 max-w-3xl mx-auto rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 flex items-start gap-4">
            <Map className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-900">
              <span className="font-semibold">Territorial add-ons (free with any purchase):</span>{" "}
              {TERRITORIAL_ADDONS.join(", ")}. These three jurisdictions have under 50 verified email contacts each
              &mdash; we won&rsquo;t charge for data depth we don&rsquo;t have, but you&rsquo;ll get every available
              record bundled with whatever you buy. 51 jurisdictions covered in total.
            </div>
          </div>

          {/* Surprises callout */}
          <div className="mt-8 max-w-3xl mx-auto">
            <h3 className="text-base font-semibold text-gray-900">A few things will surprise a buyer who&rsquo;s done their homework</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                <span><span className="font-semibold">MI is Tier 1</span> despite ranking 7th by agency count &mdash; it has the
                densest contact data we&rsquo;ve seen (7.2 contacts per agency).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                <span><span className="font-semibold">TX and FL are Tier 2</span>, not Tier 1 &mdash; lots of agencies, but
                fewer contacts per agency than the Tier 1 cluster.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                <span><span className="font-semibold">NH is Tier 3</span> but punches above its weight &mdash; 96% verified email
                rate and 10.3 contacts per agency. The buckets are about volume, not quality.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* BUNDLE LADDER */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Bundle discount ladder
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              The more states you take, the deeper the discount. The all-50 ceiling is the floor of the conversation.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              À la carte single-state buyers pay full freight. As soon as you cross five states, the bundle
              math kicks in. By 25 states the price is flat. By 50 states &mdash; full national coverage,
              including the three free territorial add-ons &mdash; the price is{" "}
              <span className="font-semibold text-gray-900">${ALL_50_CEILING.toLocaleString()}/year</span>, with
              overflow protection that mathematically cannot exceed the ceiling.
            </p>
          </div>

          <div className="mt-12 max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-6 py-3">Selection size</th>
                  <th className="px-6 py-3">Pricing rule</th>
                  <th className="px-6 py-3 text-right">Effective per state</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">1&ndash;4 states</td>
                  <td className="px-6 py-4 text-gray-700">Sum at full tier price</td>
                  <td className="px-6 py-4 text-right text-gray-700">$1,000&ndash;$2,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">5&ndash;9 states</td>
                  <td className="px-6 py-4 text-gray-700">Sum &times; 0.85 <span className="text-gray-500">(&minus;15%)</span></td>
                  <td className="px-6 py-4 text-right text-gray-700">~$850&ndash;$1,700</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">10&ndash;24 states</td>
                  <td className="px-6 py-4 text-gray-700">Sum &times; 0.70 <span className="text-gray-500">(&minus;30%)</span></td>
                  <td className="px-6 py-4 text-right text-gray-700">~$700&ndash;$1,400</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">25&ndash;49 states</td>
                  <td className="px-6 py-4 text-gray-700">Flat <span className="font-semibold text-gray-900">${BUNDLE_25_FLAT.toLocaleString()}/yr</span></td>
                  <td className="px-6 py-4 text-right text-gray-700">~$190&ndash;$380</td>
                </tr>
                <tr className="bg-brand-50/50">
                  <td className="px-6 py-4 font-semibold text-navy-900">All 50 + 3 territorial add-ons</td>
                  <td className="px-6 py-4 text-navy-900">Flat <span className="font-bold">${ALL_50_CEILING.toLocaleString()}/yr</span></td>
                  <td className="px-6 py-4 text-right font-semibold text-navy-900">$250</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 max-w-3xl mx-auto rounded-xl border border-gold-200 bg-gold-50/40 p-5 flex items-start gap-4">
            <ShieldCheck className="h-5 w-5 text-gold-700 mt-0.5 shrink-0" />
            <div className="text-sm text-gold-900">
              <span className="font-semibold">Overflow protection.</span> If your chosen state mix is more expensive
              than the all-50 ceiling, our checkout shows you the cheaper path. Example: 5 Tier 1 + 4 Tier 2 = $16,000
              &times; 0.85 = $13,600 at the ladder rate &mdash; we tell you to take all 50 for $12,500 and save $1,100.
              You never pay more than $12,500 for Agency Signal Enterprise+.
            </div>
          </div>
        </div>
      </section>

      {/* THE NEILSON COMPARISON */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-gold-300">
              The Neilson comparison
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              The legacy national directory costs ~$25,000/year. We deliver the same all-state footprint for $12,500.
            </h2>
            <p className="mt-4 text-gray-300 leading-7">
              Neilson trained the Distribution Expander market on per-state pricing: ~$10,000 entry for 5+2 states,
              $1,500/state add-on, and a ~$25,000 ceiling for the full country at renewal. We respect that math &mdash;
              and undercut the ceiling by 50%.
            </p>
          </div>

          <div className="mt-12 max-w-4xl mx-auto grid gap-4 md:grid-cols-3">
            <ComparisonStat
              label="À la carte all-50 (Agency Signal)"
              value={`$${ALA_CARTE_TOTAL.toLocaleString()}`}
              sub="5 &times; $2,000 + 15 &times; $1,500 + 28 &times; $1,000"
            />
            <ComparisonStat
              label="Agency Signal Enterprise+ bundle"
              value={`$${ALL_50_CEILING.toLocaleString()}`}
              sub="All 50 states + AK/DC/HI &middot; flat ceiling"
              emphasis
            />
            <ComparisonStat
              label="Legacy national directory"
              value="~$25,000"
              sub="Anchor price for full coverage at renewal"
              muted
            />
          </div>

          <div className="mt-10 max-w-3xl mx-auto text-center">
            <p className="text-sm text-gray-300">
              That&rsquo;s an <span className="font-semibold text-gold-300">81% effective discount</span> off our own à la carte rack,
              and a <span className="font-semibold text-gold-300">50% undercut</span> of the legacy ceiling &mdash; for a 41,705-agency
              directory refreshed monthly with state-DOI-cross-checked appointment data.
            </p>
          </div>
        </div>
      </section>

      {/* INCLUDED CREDITS */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Included credits
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Per-record actions are bundled. You shouldn&rsquo;t have to count clicks on an annual contract.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Every state purchase comes with a generous credit pool for exports, X-date pulls, append actions, and
              future AI-assisted features. Overage uses the standard top-up slider &mdash; but at Enterprise+, the
              slider starts at the +30% bonus rate instead of the consumer +0% baseline.
            </p>
          </div>

          <div className="mt-12 max-w-4xl mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-6 py-3">Purchase</th>
                  <th className="px-6 py-3 text-right">Included credits / year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 text-gray-900">1 state</td>
                  <td className="px-6 py-4 text-right text-gray-700">200</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-900">Bundle (5&ndash;24 states)</td>
                  <td className="px-6 py-4 text-right text-gray-700">100 &times; state count</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-900">25-state flat</td>
                  <td className="px-6 py-4 text-right text-gray-700">3,000</td>
                </tr>
                <tr className="bg-brand-50/50">
                  <td className="px-6 py-4 font-semibold text-navy-900">All-50 flat</td>
                  <td className="px-6 py-4 text-right font-semibold text-navy-900">5,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* DOT INTEL ENTERPRISE+ */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              DOT Intel &middot; Enterprise+
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Volume packs and API access for carriers, MGUs, and aggregators.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              The DOT Intel Distribution Expander isn&rsquo;t buying state-level access &mdash; they&rsquo;re running
              market analysis, prospecting carrier accounts at scale, or building distribution programs with
              filings-grade data. Pricing reflects that: volume credit packs, API access, custom feeds.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <VolumePackCard
              name="Enterprise Volume &mdash; Starter"
              price="$499/mo"
              annual="$5,988/yr"
              features={[
                "2,500 credits / month",
                "API access &middot; 5 calls/sec",
                "SSO via SAML / OIDC",
                "Email support, business hours",
              ]}
            />
            <VolumePackCard
              name="Enterprise Volume &mdash; Pro"
              price="$1,499/mo"
              annual="$17,988/yr"
              emphasis
              features={[
                "10,000 credits / month",
                "API access &middot; 20 calls/sec",
                "Priority support, named contact",
                "Custom BDM brief templates",
              ]}
            />
            <VolumePackCard
              name="Enterprise Volume &mdash; Custom"
              price="Quote"
              annual="Annual contract"
              features={[
                "Unlimited normal usage",
                "Dedicated data feeds",
                "White-label PDF exports",
                "Eligible for Distribution+ outcome SKU",
              ]}
            />
          </div>

          <p className="mt-8 max-w-3xl mx-auto text-sm text-gray-600">
            The $499/mo Starter is the published packaging of the &ldquo;$499+ Enterprise&rdquo; floor in the DOT Intel pricing
            grid &mdash; same tier, named SKU. Credit overage on any Enterprise plan uses the slider, starting at the
            +30% bonus rate.
          </p>
        </div>
      </section>

      {/* DISTRIBUTION+ OUTCOME SKU */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                Distribution+ &middot; Outcome SKU
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Pay for the appointments closed, not the data accessed.
              </h2>
              <p className="mt-4 text-gray-600 leading-7">
                Distribution+ is the success-fee layer available on top of either Enterprise+ contract.
                A single qualified agent appointment is worth $50,000+ in lifetime premium to an MGA.
                Pricing it at <span className="font-semibold text-gray-900">$300&ndash;$500 per qualified appointment</span> is
                a rounding error to the buyer and a margin step-change for us.
              </p>
              <p className="mt-4 text-gray-600 leading-7">
                We define &ldquo;qualified&rdquo; at contract time &mdash; typically: agent meets your appetite criteria,
                signs your producer agreement, and binds first policy within 90 days of introduction. No credit for
                names on a list.
              </p>
              <p className="mt-4 text-gray-600 leading-7">
                Reporting runs through a monthly attribution dashboard: introductions &rarr; submissions &rarr;
                bound &rarr; appointed. Auditable, defensible, and structured for the contract conversation.
              </p>
            </div>

            <div className="rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 to-white p-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-gold-700" />
                <h3 className="text-lg font-semibold text-navy-900">Why this works for you, not the legacy competitor</h3>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 mt-0.5 text-gold-700 shrink-0" />
                  <span>Their cost model relies on predictable annual revenue per customer &mdash; they can&rsquo;t
                  accept success-fee pricing without restructuring the business.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 mt-0.5 text-gold-700 shrink-0" />
                  <span>Our infrastructure is lean enough that 100 appointments/year at $400 ($40,000) is multiples
                  of the underlying data-maintenance cost. The unit economics work.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 mt-0.5 text-gold-700 shrink-0" />
                  <span>It aligns vendor incentive with your actual KPI. If we&rsquo;re not generating real
                  appointments, we&rsquo;re not getting paid &mdash; and we&rsquo;ll know first.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DISTRIBUTION SUITE BUNDLE */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Distribution Suite &middot; Cross-product bundle
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Both products. One contract. ~26% off the standalone sum.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              For an MGA, wholesaler, or carrier serious about distribution growth, Agency Signal&rsquo;s agency-side
              footprint and DOT Intel&rsquo;s filings-grade carrier data are two halves of the same problem. The
              Distribution Suite packages both at a meaningful discount to the standalone sum.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-brand-200 bg-white p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Distribution Suite &mdash; Standard
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-navy-900">$22,500</span>
                <span className="text-sm text-gray-500">/ year</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                vs. standalone sum of $30,488 &middot; ~26% bundle discount
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                  <span>Agency Signal Enterprise+ &mdash; all 50 states + 3 territorial add-ons</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                  <span>DOT Intel Enterprise Volume &mdash; Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                  <span>10,000 unified credits / year, usable across both products</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
                  <span>SSO, priority support, named account manager</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gold-300 bg-gradient-to-br from-gold-50 to-white p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                Distribution Suite &mdash; Outcome
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-navy-900">$22,500</span>
                <span className="text-sm text-gray-500">+ $300&ndash;500 / appointment</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Standard package + Distribution+ outcome SKU
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-gold-700 shrink-0" />
                  <span>Everything in Standard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-gold-700 shrink-0" />
                  <span>Distribution+ success fee on every qualified appointment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-gold-700 shrink-0" />
                  <span>Monthly attribution dashboard, contract-defined qualification standard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 text-gold-700 shrink-0" />
                  <span>Most aligned with MGA / carrier distribution KPIs</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-10 max-w-3xl mx-auto text-sm text-gray-600 text-center">
            Distribution Suite is for the Distribution Expander ICP. The separate{" "}
            <span className="font-semibold text-gray-900">$179/mo Seven16 Intelligence bundle</span> (DOT Intel Business +
            Agency Signal Growth) is for emerging-firm bundling &mdash; same family of products, different buyer.
          </p>
        </div>
      </section>

      {/* WHAT TO EXPECT FROM THE DEMO */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              What to expect when you book a demo.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Enterprise+ doesn&rsquo;t have a self-serve checkout. There&rsquo;s no path where you click a button on
              a page and end up with a $12,500 annual contract on the other side. We do this the way Distribution
              Expanders actually buy software: a live demo, a contract conversation, a procurement loop, and a
              30&ndash;90 day evaluation window.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <ExpectCard
              icon={Users}
              n="01"
              title="30-minute scoped demo"
              body="We walk your team through Agency Signal and (if relevant) DOT Intel with real data scoped to the states you&rsquo;re evaluating. No script &mdash; we let you drive the screen. Bring the carrier names you care about; we&rsquo;ll show you who holds the paper."
            />
            <ExpectCard
              icon={Building2}
              n="02"
              title="Pilot evaluation"
              body="Two- to four-week sandboxed pilot with a short list of seats. You operate against real data; we instrument what you actually use. The pilot determines the right state mix, credit allotment, and whether Distribution+ outcome pricing fits."
            />
            <ExpectCard
              icon={Mail}
              n="03"
              title="Contract + onboarding"
              body="Annual contract with the state mix locked for the term, mid-term changes available at a $500 admin fee, renewal mechanics built around your appointment cadence. Onboarding inside two business weeks; SSO, audit log, named manager, all included."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Layers className="h-10 w-10 text-gold-400 mx-auto" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to see the directory at distribution-leader scale?
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-300">
            Send us a note. Tell us which states you operate in, whether DOT Intel is part of the conversation, and
            when you&rsquo;d like to walk the data together. We&rsquo;ll come back inside one business day.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@seven16group.com?subject=Enterprise%2B%20demo%20request"
              className="inline-flex items-center gap-2 rounded-md bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-gold-400"
            >
              hello@seven16group.com
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/methodology"
              className="text-sm font-semibold text-gray-100 hover:text-white"
            >
              Read the methodology first &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function TierCard({
  label,
  price,
  subhead,
  rule,
  count,
  states,
  accent,
  labelClass,
}: {
  label: string;
  price: number;
  subhead: string;
  rule: string;
  count: number;
  states: string[];
  accent: string;
  labelClass: string;
}) {
  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${accent}`}>
      <div className={`text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-navy-900">${price.toLocaleString()}</span>
        <span className="text-sm text-gray-500">/ state / year</span>
      </div>
      <div className="mt-1 text-sm font-medium text-gray-900">{subhead}</div>
      <div className="mt-1 text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: rule }} />
      <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {count} state{count === 1 ? "" : "s"}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {states.map((s) => (
          <span
            key={s}
            className="inline-flex items-center justify-center rounded-md bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function ComparisonStat({
  label,
  value,
  sub,
  emphasis,
  muted,
}: {
  label: string;
  value: string;
  sub: string;
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 ${
        emphasis
          ? "border-2 border-gold-400 bg-gold-500/10"
          : muted
          ? "border border-gray-700 bg-gray-800/40"
          : "border border-gray-700 bg-gray-800/40"
      }`}
    >
      <div className={`text-xs font-semibold uppercase tracking-wider ${emphasis ? "text-gold-300" : "text-gray-400"}`}>
        {label}
      </div>
      <div className={`mt-2 text-3xl font-bold ${emphasis ? "text-gold-300" : "text-white"}`}>{value}</div>
      <div className="mt-1 text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: sub }} />
    </div>
  );
}

function VolumePackCard({
  name,
  price,
  annual,
  features,
  emphasis,
}: {
  name: string;
  price: string;
  annual: string;
  features: string[];
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 sm:p-8 ${
        emphasis ? "border-2 border-brand-400 bg-white shadow-md" : "border border-gray-200 bg-white"
      }`}
    >
      <div className="text-sm font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: name }} />
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-navy-900">{price}</span>
      </div>
      <div className="mt-1 text-xs text-gray-500">{annual}</div>
      <ul className="mt-6 space-y-3 text-sm text-gray-700">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: f }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExpectCard({
  icon: Icon,
  n,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-brand-600" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Step {n}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-6">{body}</p>
    </div>
  );
}
