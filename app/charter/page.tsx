import Link from "next/link";
import { Coins, Layers, ShieldCheck, BadgeCheck, Network, Clock, Lock, Truck, Building2, Megaphone, Mail } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { CharterTermsPanel } from "@/components/marketing/CharterTermsPanel";

export const dynamic = "force-dynamic";

const SAVINGS = [
  {
    line: "DOT Alerts Growing Fleet tier (6–15 trucks)",
    standard: 90 * 12,
    charter:  68 * 12,
    note: "Standard $90/mo. Charter $67.50/mo (25% off).",
  },
  {
    line: "Agency Signal credits — 1,000/mo top-up at standard rate",
    standard: 150 * 12,
    charter:  150 * 12,
    note: "Same $150/mo outlay. Charter gets +40% bonus credits permanently → 1,400 credits delivered for the same $150. Effective per-credit price drops to ~$0.107 vs. $0.15 list. The 400 bonus credits/mo = $720/yr in free fuel.",
    bonusFuelValue: 720,
  },
  {
    line: "DOT Intel — 200 lookups/mo with PDF exports (~3 credits each)",
    standard: 90 * 12,
    charter:  90 * 12,
    note: "Same $90/mo outlay (600 credits/mo at $0.15 list). Charter +40% bonus = 840 credits delivered for the same $90 — that's 80 extra DOT lookups/mo at zero marginal cost. ~$432/yr fuel value.",
    bonusFuelValue: 432,
  },
  {
    line: "Agency listing on agencysignal.co (1 location)",
    standard: 120,
    charter:  90,
    note: "Standard $120/yr. Charter $90/yr (25% off).",
  },
  {
    line: "Learning Center — 10 producer seats (single course v1)",
    standard: 240,
    charter:  180,
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

const SURFACES = [
  { icon: Coins,       title: "Universal credits — permanent +40% bonus",          rate: "Effective ~$0.107/credit forever (vs. $0.15 list)",                 body: "Every top-up converts at the top bonus band. The $5–$1,000+ slider doesn't change. The bonus multiplier just stays on, permanently." },
  { icon: ShieldCheck, title: "DOT Alerts — 25% off any fleet-size tier",          rate: "$19 / $38 / $68 / $131 / $263 / $375+ depending on fleet size",     body: "Owner-Operator through Enterprise (101+). Per-band, not per-unit — invoice you can predict. Charter Members hold the discount whether they grow from 5 trucks to 50." },
  { icon: Building2,   title: "Directory listings — 25% off retail / agency / wholesaler", rate: "Retail agent $90/yr · Agency $90 + $45/loc · Wholesaler $750/mo", body: "DOT carrier directory listings are free for everyone. The agency-side and wholesaler-side paid tiers get Charter's 25% off, and Charter Members also get the visible badge on their public listing." },
  { icon: Layers,      title: "Lead downloads — universal credit bonus applies",   rate: "1 lead = 1 credit (~$0.107 with Charter bonus)",                    body: "No separate discount — the +40% credit bonus is already the best per-lead rate Seven16 sells. Charter Members buying leads in bulk get database-deal economics on the slider." },
  { icon: Megaphone,   title: "Learning Center — 25% off + team-pack stack",       rate: "$22.46/seat single · stacking volume tiers",                        body: "Single course at $29.95 standard. Team packs apply first (5+ seats = 12% off, scaling up to 35% off at 20–25 seats), then Charter 25% off the result. Designed to stack; nothing buried." },
  { icon: BadgeCheck,  title: "Charter Member recognition",                        rate: "Visible badge on directory listing",                                body: "Public signal on your agency profile that you were one of the first 50–75 to invest in Seven16. Direct line to Master O for roadmap input. Beta channel access on every product." },
];

const EXCHANGE = [
  { title: "1+ case study or testimonial within 12 months", body: "Documented account of how you're using Seven16 — pulled together with our help, not solo homework. Anonymizable if needed." },
  { title: "Quarterly feedback sessions",                    body: "30 minutes a quarter. Direct product calls — what's working, what's broken, what should be built next. Founder reads every note." },
  { title: "Anonymized usage data",                          body: "We use it to size features against real Charter Member behavior. Never sold, never re-identified." },
  { title: "Multi-product use",                              body: "Pick more than one Seven16 product to integrate into your operation. The Charter Member pricing scales with everything you buy — the offer was designed for operators who'd use the whole stack." },
];

const RULES = [
  { icon: Network,     title: "50–75 accounts total",          body: "Hard cap across the whole Seven16 family — not 50 per product. When the cap fills, the offer closes for new members." },
  { icon: Clock,       title: "60–90 day enrollment window",   body: "From the day the program officially opens. After that, even if seats remain, the window is closed and the pricing is gone." },
  { icon: ShieldCheck, title: "30 days free, no credit card",  body: "Try the products you're interested in for the first 30 days. Charter pricing kicks in month 2 if you stay." },
  { icon: Lock,        title: "M&A-only transferable",         body: "Charter pricing stays with the agency or operating entity. If you're acquired, the Charter rate goes with the entity. No secondary-market resale." },
  { icon: Truck,       title: "Stay-active rule",              body: "If you fully cancel and leave for 6+ months, Seven16 reserves the right not to re-issue Charter pricing on reactivation. Prevents pause-and-restart gaming. Real lapses get grace." },
  { icon: Mail,        title: "Direct enrollment",             body: "No procurement form, no sales call sequence. Email Master O, talk for 20 minutes, sign the simple enrollment letter, and the price tier is yours." },
];

const NOT_PROMISES = [
  { title: "Not a fixed bundle discount",   body: "Charter doesn't lock you into one bundle of products. It locks you into the best published tier on whichever Seven16 products you adopt — today and as new products ship." },
  { title: "Not retroactive",               body: "Charter pricing applies from the date your enrollment letter is signed forward. It doesn't refund prior outlay on any Seven16 product." },
  { title: "Not transferable to third parties", body: "Charter pricing stays with the entity. You can't resell, sub-license, or hand the rate to a sister company that wasn't on the enrollment letter." },
  { title: "Not stackable with future promos", body: "You already hold the best published rate. Future promotional discounts apply to non-Charter customers — Charter Members can't double-stack." },
];

export default async function CharterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <MarketingHeader isAuthed={!!user} theme="dark" />

      <PageHero
        variant="dark"
        eyebrow="Seven16 Charter Member · 50–75 seats"
        title="The best price you'll see from Seven16."
        highlight="Locked for life."
        description="Charter Members occupy the best pricing tier on every Seven16 product they buy — permanently. Not 50% off a fixed bundle, not a 12-month introductory rate. The discount tier itself is yours, forever, across DOT Intel, Agency Signal, DOTCarriers, DOTAgencies, the Learning Center, and anything Seven16 ships under this family architecture."
        primaryCta={{ label: "Request a Charter conversation", href: "mailto:hello@seven16group.com?subject=Charter%20Member%20interest" }}
        secondaryCta={{ label: "See the compound math", href: "#savings" }}
        rightRail={
          <CharterTermsPanel
            cap="50–75 accounts total (whole Seven16 family)"
            enrollmentWindow="60–90 days from program open"
            discount="Best published tier on every product, permanently"
            appliesTo="DOT Intel · Agency Signal · DOTCarriers · DOTAgencies · Learning Center"
            contact="Direct to Master O"
          />
        }
      />

      <Section
        variant="light"
        eyebrow="Who this is for"
        title="The operators who'd be on Seven16 anyway."
        description="Agency principals, MGU owners, fleet directors, and program-builders who saw what we're building early and want to lock the founder-rate before the cap closes. This is not a flash sale — it's a structured exchange."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">You're the buyer if…</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li className="flex gap-2"><span className="text-teal-700">✓</span><span>You run one or more agencies, fleets, MGUs, or program shops</span></li>
              <li className="flex gap-2"><span className="text-teal-700">✓</span><span>You'd use more than one Seven16 product if the pricing made sense</span></li>
              <li className="flex gap-2"><span className="text-teal-700">✓</span><span>You can sign an enrollment letter without a buying committee</span></li>
              <li className="flex gap-2"><span className="text-teal-700">✓</span><span>You'll share usage data, feedback, and one case study in 12 months</span></li>
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">You're NOT the buyer if…</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li className="flex gap-2"><span className="text-slate-400">✗</span><span>You need to forward this to a procurement team for approval</span></li>
              <li className="flex gap-2"><span className="text-slate-400">✗</span><span>You're optimizing for the lowest possible monthly invoice on one product</span></li>
              <li className="flex gap-2"><span className="text-slate-400">✗</span><span>You don't want to be on quarterly product calls</span></li>
              <li className="flex gap-2"><span className="text-slate-400">✗</span><span>Multi-state Enterprise+ is the right fit — see <Link href="/enterprise" className="text-teal-700 hover:text-teal-800 underline">/enterprise</Link></span></li>
            </ul>
          </article>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="Year-one math"
        title="A 15-truck operator running the full DOT Intel + Agency Signal stack."
        description="The Charter price isn't a single SKU discount — it compounds across every product you adopt. Standard vs. Charter, year one:"
      >
        <div id="savings" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-500">Line item</th>
                <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-[0.14em] text-slate-500">Standard / yr</th>
                <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-[0.14em] text-gold-700">Charter / yr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SAVINGS.map((row) => (
                <tr key={row.line} className="align-top">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-950">{row.line}</div>
                    <div className="mt-1 text-xs text-slate-500 leading-5">{row.note}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-700">{USD(row.standard)}</td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-bold text-gold-700">{USD(row.charter)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td className="px-6 py-4 font-black text-slate-950">Total outlay, year 1</td>
                <td className="px-6 py-4 text-right font-mono font-black text-slate-950">{USD(STANDARD_TOTAL)}</td>
                <td className="px-6 py-4 text-right font-mono font-black text-gold-700">{USD(CHARTER_TOTAL)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Straight discount savings</div>
            <div className="mt-2 text-2xl font-black tracking-[-0.02em] text-slate-950">{USD(STRAIGHT_SAVINGS)}/yr</div>
            <div className="mt-1 text-xs text-slate-500">Lower invoiced price across paid tiers.</div>
          </div>
          <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-gold-700">Bonus credit fuel value</div>
            <div className="mt-2 text-2xl font-black tracking-[-0.02em] text-gold-900">{USD(BONUS_FUEL)}/yr</div>
            <div className="mt-1 text-xs text-gold-700">+40% bonus credits delivered free at every top-up.</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Baseline Charter value</div>
            <div className="mt-2 text-2xl font-black tracking-[-0.02em] text-slate-950">{USD(TOTAL_BASELINE_VALUE)}+/yr</div>
            <div className="mt-1 text-xs text-slate-500">Year one, before heavier usage-driven savings.</div>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-600 leading-7 max-w-3xl">
          Scale this up. A 50-truck operator running 500+ DOT lookups/month + heavier Agency Signal credit spend +
          multi-location directory + 25 Learning Center seats is closer to{" "}
          <span className="font-bold text-slate-950">$4,000–$7,000/year in compound Charter value</span> —
          locked for as long as the account stays active.
        </p>
      </Section>

      <Section
        variant="light"
        eyebrow="The six surfaces"
        title="One Charter tier across all of them."
        description="Charter Members occupy the best published rate on every product they touch, permanently. New products that ship under the Seven16 family architecture join the same Charter framework — the offer scales with the family."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SURFACES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-gold-300 hover:shadow-md">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
                <div className="mt-4 font-black text-slate-950 leading-snug">{s.title}</div>
                <div className="mt-1 text-xs font-mono text-gold-700">{s.rate}</div>
                <p className="mt-3 text-sm text-slate-600 leading-6">{s.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="The exchange"
        title="What we're asking in exchange."
        description="Charter pricing is a structured exchange, not a free pass. None of it is heavy — but it's in writing, signed at enrollment, so both sides know what the deal is."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {EXCHANGE.map((e) => (
            <div key={e.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="font-black text-slate-950">{e.title}</div>
              <div className="mt-2 text-sm text-slate-600 leading-6">{e.body}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="What 'locked for life' actually means"
        title="The fine print, written like a founder — not a lawyer."
        description="Charter is a real lifetime-locked offer with real boundaries. We're honest about the boundaries up front so nobody gets surprised."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RULES.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <Icon className="h-5 w-5 text-slate-700" />
                <div className="mt-3 font-black text-slate-950">{r.title}</div>
                <p className="mt-2 text-sm text-slate-600 leading-6">{r.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="What it does NOT mean"
        title="Things Charter is explicitly not."
        description="Four boundaries on the offer. None of these are hidden — we'd rather lead with the limits than have a surprise conversation in year two."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {NOT_PROMISES.map((n) => (
            <div key={n.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="font-black text-slate-950">{n.title}</div>
              <div className="mt-2 text-sm text-slate-600 leading-6">{n.body}</div>
            </div>
          ))}
        </div>
      </Section>

      <CTASection
        eyebrow="Before the cap closes"
        title="Lock the founder-rate."
        description="Seven16 ships one Charter cohort. After 50–75 accounts and the 60–90 day window, the offer is permanently closed. Every product we ship from that point on goes to market at published rates — Charter Members hold the founder-rate on every one of them, forever."
        primaryCta={{ label: "Email Master O directly", href: "mailto:hello@seven16group.com?subject=Charter%20Member%20interest&body=Hi%20Master%20O%2C%0A%0AI%27d%20like%20to%20talk%20about%20a%20Charter%20Member%20seat.%20Here%27s%20what%20I%27m%20building%20and%20why%20Seven16%20fits%3A%0A%0A" }}
        secondaryCta={{ label: "Or see Enterprise+ for state-by-state Distribution", href: "/enterprise" }}
        primaryVariant="gold"
      />
    </div>
  );
}
