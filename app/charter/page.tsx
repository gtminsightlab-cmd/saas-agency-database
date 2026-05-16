import Link from "next/link";
import {
  ArrowRight, Check, Coins, Layers, ShieldCheck, BadgeCheck,
  Mail, Network, Clock, Lock, BookOpen, Truck, Building2, Megaphone,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// ─── Compound savings worked example (per SESSION_23 deck slide 18) ─────
// 15-truck fleet running TIQ Growth + Agency Signal credits + DOT Alerts +
// claimed agency listing + 10 Learning Center seats. Charter Member rate
// vs. standard list, conservative — credit bonus is FUEL value, not
// straight discount, so it's understated here.
const SAVINGS = [
  {
    line: "Threshold IQ Growth subscription",
    standard: 1500 * 12,
    charter:  1125 * 12, // 25% off
    note: "Standard $1,500/mo. Charter $1,125/mo (25% off) + always Scale-tier overage at $1/sub instead of $2.",
  },
  {
    line: "DOT Alerts Growing Fleet tier (6–15 trucks)",
    standard: 90 * 12,
    charter:  68 * 12, // 25% off, rounded
    note: "Standard $90/mo. Charter $67.50/mo (25% off).",
  },
  {
    line: "Agency Signal credits — 1,000/mo top-up at standard rate",
    standard: 150 * 12,
    charter:  150 * 12, // same outlay, but +40% bonus = 1,400 effective credits
    note: "Same $150/mo outlay. Charter gets +40% bonus credits permanently → 1,400 credits delivered for the same $150. Effective per-credit price drops to ~$0.107 vs. $0.15 list. The 400 bonus credits/mo = $720/yr in free fuel.",
    bonusFuelValue: 720,
  },
  {
    line: "Agency listing on directory.seven16group.com (1 location)",
    standard: 120,
    charter:  90, // 25% off annual
    note: "Standard $120/yr. Charter $90/yr (25% off).",
  },
  {
    line: "Learning Center — 10 producer seats (single course v1)",
    standard: 240,  // 10 × $29.95 × 80% (team-pack 6-14 = 20% off) = $239.60 ≈ $240
    charter:  180,  // 10 × $29.95 × 80% × 75% = $179.70 ≈ $180
    note: "Standard $239.60 (10 × $29.95 × team-pack 20% off). Charter 25% off the post-team-pack price = $179.70. Stacking is intentional.",
  },
];

const STANDARD_TOTAL = SAVINGS.reduce((s, x) => s + x.standard, 0);
const CHARTER_TOTAL  = SAVINGS.reduce((s, x) => s + x.charter,  0);
const BONUS_FUEL     = SAVINGS.reduce((s, x) => s + (x.bonusFuelValue ?? 0), 0);
const STRAIGHT_SAVINGS = STANDARD_TOTAL - CHARTER_TOTAL;
const TOTAL_BASELINE_VALUE = STRAIGHT_SAVINGS + BONUS_FUEL;

const USD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ─── The seven Charter surfaces ─────────────────────────────────────────
const SURFACES = [
  {
    icon: Coins,
    title: "Universal credits — permanent +40% bonus",
    rate: "Effective ~$0.107/credit forever (vs. $0.15 list)",
    body: "Every top-up converts at the top bonus band. The $5–$1,000+ slider doesn't change. The bonus multiplier just stays on, permanently.",
  },
  {
    icon: BookOpen,
    title: "Threshold IQ — 25% off + Scale-tier overage rate",
    rate: "Launch $375/mo · Growth $1,125/mo · Scale $3,000/mo",
    body: "Whatever subscription tier you sit on, 25% off the published price. Plus: overage on submissions is always charged at the Scale-tier rate ($1/sub) even if you're paying Launch or Growth pricing.",
  },
  {
    icon: ShieldCheck,
    title: "DOT Alerts — 25% off any fleet-size tier",
    rate: "$19 / $38 / $68 / $131 / $263 / $375+ depending on fleet size",
    body: "Owner-Operator through Enterprise (101+). Per-band, not per-unit — invoice you can predict. Charter Members hold the discount whether they grow from 5 trucks to 50.",
  },
  {
    icon: Building2,
    title: "Directory listings — 25% off retail / agency / wholesaler",
    rate: "Retail agent $90/yr · Agency $90 + $45/loc · Wholesaler $750/mo",
    body: "DOT carrier directory listings are free for everyone. The agency-side and wholesaler-side paid tiers get Charter's 25% off, and Charter Members also get the visible badge on their public listing.",
  },
  {
    icon: Layers,
    title: "Lead downloads — universal credit bonus applies",
    rate: "1 lead = 1 credit (~$0.107 with Charter bonus)",
    body: "No separate discount — the +40% credit bonus is already the best per-lead rate Seven16 sells. Charter Members buying leads in bulk get database-deal economics on the slider.",
  },
  {
    icon: Megaphone,
    title: "Learning Center — 25% off + team-pack stack",
    rate: "$22.46/seat single · stacking volume tiers",
    body: "Single course at $29.95 standard. Team packs apply first (5+ seats = 12% off, scaling up to 35% off at 20–25 seats), then Charter 25% off the result. Designed to stack; nothing buried.",
  },
  {
    icon: BadgeCheck,
    title: "Charter Member recognition",
    rate: "Visible badge on directory listing",
    body: "Public signal on your agency profile that you were one of the first 50–75 to invest in Seven16. Direct line to Master O for roadmap input. Beta channel access on every product.",
  },
];

// ─── The exchange ───────────────────────────────────────────────────────
const EXCHANGE = [
  {
    title: "1+ case study or testimonial within 12 months",
    body: "Documented account of how you're using Seven16 — pulled together with our help, not solo homework. Anonymizable if needed.",
  },
  {
    title: "Quarterly feedback sessions",
    body: "30 minutes a quarter. Direct product calls — what's working, what's broken, what should be built next. Founder reads every note.",
  },
  {
    title: "Anonymized usage data",
    body: "We use it to size features against real Charter Member behavior. Never sold, never re-identified.",
  },
  {
    title: "Multi-product use",
    body: "Pick more than one Seven16 product to integrate into your operation. The Charter Member pricing scales with everything you buy — the offer was designed for operators who'd use the whole stack.",
  },
];

export default async function CharterPage() {
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
              <Network className="h-3.5 w-3.5" />
              Seven16 Charter Member &middot; 50–75 seats total
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              The best price you&rsquo;ll see from Seven16.
              <span className="block text-gold-300">Locked for life.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              Charter Members occupy the best pricing tier on every Seven16 product they buy &mdash; permanently.
              Not 50% off a fixed bundle, not a 12-month introductory rate. The discount tier itself is yours,
              forever, across DOT Intel, Agency Signal, Threshold IQ, DOTCarriers, DOTAgencies,
              the Learning Center, and anything Seven16 ships under this family architecture.
            </p>
            <p className="mt-4 text-base leading-7 text-gray-300">
              Cap: <span className="font-semibold text-white">50&ndash;75 accounts total</span>. Enrollment window:{" "}
              <span className="font-semibold text-white">60&ndash;90 days from program open</span>.
              After that, this offer is closed and the price is gone.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="mailto:hello@seven16group.com?subject=Charter%20Member%20interest"
                className="inline-flex items-center gap-2 rounded-md bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-900 shadow-sm hover:bg-gold-400"
              >
                Request a Charter conversation
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#savings" className="text-sm font-semibold text-gray-100 hover:text-white">
                See the compound math &rarr;
              </a>
            </div>
            <p className="mt-6 text-xs text-gray-400">
              Direct to Master O. If you&rsquo;re already in the network, text or DM is faster.
            </p>
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Who this is for.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Charter Members are the operators who&rsquo;d be on Seven16 anyway &mdash; the agency principals,
              MGU owners, fleet directors, and program-builders who saw what we&rsquo;re building early and
              want to lock the founder-rate before the cap closes.
            </p>
            <p className="mt-4 text-gray-600 leading-7">
              This is not a flash sale. It&rsquo;s a structured exchange. You get the best pricing tier across
              everything we ship. We get the operators whose actual usage shapes the product, the
              testimonials that make outreach credible, and the multi-product evidence that proves the
              ecosystem thesis. Network conversation, not procurement cycle.
            </p>
            <p className="mt-4 text-gray-600 leading-7">
              If you have to forward this to someone&rsquo;s buying committee to get approved, you&rsquo;re
              probably not the buyer this offer was designed for. The published consumer tiers ($19 Producer,
              $99 Growth) and the <Link href="/enterprise" className="text-brand-700 underline">Enterprise+
              annual contract</Link> are still here. Charter is the third path.
            </p>
          </div>
        </div>
      </section>

      {/* COMPOUND SAVINGS */}
      <section id="savings" className="py-16 sm:py-20 bg-gray-50 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Year-one math for a 15-truck operator running the full stack.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              The Charter price isn&rsquo;t a single SKU discount &mdash; it compounds across every product
              you adopt. A small agency principal running Threshold IQ Growth + Agency Signal credits +
              DOT Alerts on the fleet + an agency directory listing + 10 Learning Center seats sees the
              following at standard vs. Charter, year one:
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Line item</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Standard / yr</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gold-700">Charter / yr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {SAVINGS.map((row) => (
                  <tr key={row.line} className="align-top">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{row.line}</div>
                      <div className="mt-1 text-xs text-gray-500 leading-5">{row.note}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-gray-700">{USD(row.standard)}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-gold-700">{USD(row.charter)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900">Total outlay, year 1</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-gray-900">{USD(STANDARD_TOTAL)}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-gold-700">{USD(CHARTER_TOTAL)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Straight discount savings</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">{USD(STRAIGHT_SAVINGS)}/yr</div>
              <div className="mt-1 text-xs text-gray-500">Lower invoiced price across paid tiers.</div>
            </div>
            <div className="rounded-lg border border-gold-200 bg-gold-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gold-700">Bonus credit fuel value</div>
              <div className="mt-2 text-2xl font-bold text-gold-900">{USD(BONUS_FUEL)}/yr</div>
              <div className="mt-1 text-xs text-gold-700">+40% bonus credits delivered free at every top-up.</div>
            </div>
            <div className="rounded-lg border border-navy-200 bg-navy-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-navy-700">Baseline Charter value</div>
              <div className="mt-2 text-2xl font-bold text-navy-900">{USD(TOTAL_BASELINE_VALUE)}+/yr</div>
              <div className="mt-1 text-xs text-navy-700">Year one, before any usage-driven savings on heavier credit spend.</div>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-600 leading-7 max-w-3xl">
            Scale this up. A 50-truck operator running Threshold IQ Scale + higher credit spend + multi-location
            directory + 25 Learning Center seats is closer to <span className="font-semibold text-gray-900">$15,000–$25,000/year
            in compound Charter value</span> &mdash; locked for as long as the account stays active.
          </p>
        </div>
      </section>

      {/* SEVEN SURFACES */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Seven surfaces. One Charter tier across all of them.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Charter Members occupy the best published rate on every product they touch, permanently. New
              products that ship under the Seven16 family architecture join the same Charter framework
              &mdash; the offer scales with the family, it doesn&rsquo;t freeze on day one.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SURFACES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gold-300 hover:shadow-sm transition">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-gold-100 p-2">
                      <Icon className="h-5 w-5 text-gold-700" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 leading-snug">{s.title}</div>
                      <div className="mt-1 text-xs font-mono text-gold-700">{s.rate}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 leading-6">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* THE EXCHANGE */}
      <section className="py-16 sm:py-20 bg-gray-50 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              What we&rsquo;re asking in exchange.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Charter pricing is a structured exchange, not a free pass. The price you lock in is real, and
              what we ask back is real. None of it is heavy &mdash; but it&rsquo;s in writing, signed at
              enrollment, so both sides know what the deal is.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {EXCHANGE.map((e) => (
              <div key={e.title} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-6">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-brand-600" />
                <div>
                  <div className="font-semibold text-gray-900">{e.title}</div>
                  <div className="mt-1 text-sm text-gray-600 leading-6">{e.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RULES OF THE OFFER */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              The fine print, written like a founder, not a lawyer.
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Charter is a real lifetime-locked offer with real boundaries. We&rsquo;re honest about the
              boundaries up front so nobody gets surprised.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <Network className="h-5 w-5 text-gray-700" />
              <div className="mt-3 font-semibold text-gray-900">50–75 accounts total</div>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                Hard cap across the whole Seven16 family &mdash; not 50 per product. When the cap fills,
                the offer closes for new members.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <Clock className="h-5 w-5 text-gray-700" />
              <div className="mt-3 font-semibold text-gray-900">60–90 day enrollment window</div>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                From the day the program officially opens. After that, even if seats remain, the window
                is closed and the pricing is gone.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <ShieldCheck className="h-5 w-5 text-gray-700" />
              <div className="mt-3 font-semibold text-gray-900">30 days free, no credit card</div>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                Try the products you&rsquo;re interested in for the first 30 days. Charter pricing kicks
                in month 2 if you stay.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <Lock className="h-5 w-5 text-gray-700" />
              <div className="mt-3 font-semibold text-gray-900">M&amp;A-only transferable</div>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                Charter pricing stays with the agency or operating entity. If you&rsquo;re acquired, the
                Charter rate goes with the entity. No secondary-market resale.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <Truck className="h-5 w-5 text-gray-700" />
              <div className="mt-3 font-semibold text-gray-900">Stay-active rule</div>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                If you fully cancel and leave for 6+ months, Seven16 reserves the right not to re-issue
                Charter pricing on reactivation. Prevents pause-and-restart gaming. Real lapses get
                grace.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <Mail className="h-5 w-5 text-gray-700" />
              <div className="mt-3 font-semibold text-gray-900">Direct enrollment</div>
              <p className="mt-2 text-sm text-gray-600 leading-6">
                No procurement form, no sales call sequence. Email Master O, talk for 20 minutes, sign
                the simple enrollment letter, and the price tier is yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Lock the founder-rate before the cap closes.
          </h2>
          <p className="mt-4 text-gray-200 leading-7">
            Seven16 ships one Charter cohort. After 50&ndash;75 accounts and the 60&ndash;90 day window,
            the offer is permanently closed. Every product we ship from that point on goes to market at
            published rates &mdash; Charter Members hold the founder-rate on every one of them, forever.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@seven16group.com?subject=Charter%20Member%20interest&body=Hi%20Master%20O%2C%0A%0AI%27d%20like%20to%20talk%20about%20a%20Charter%20Member%20seat.%20Here%27s%20what%20I%27m%20building%20and%20why%20Seven16%20fits%3A%0A%0A"
              className="inline-flex items-center gap-2 rounded-md bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-900 shadow-sm hover:bg-gold-400"
            >
              Email Master O directly
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/enterprise" className="text-sm font-semibold text-gray-100 hover:text-white">
              Or see Enterprise+ for state-by-state Distribution &rarr;
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Already in the Seven16 network? Text or DM is faster than email.
          </p>
        </div>
      </section>
    </div>
  );
}
