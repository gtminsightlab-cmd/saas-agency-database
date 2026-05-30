import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { SliderCalculator } from "@/components/marketing/SliderCalculator";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { PricingFAQ } from "@/components/marketing/PricingFAQ";
import { SampleOfferBanner } from "@/components/marketing/SampleOfferBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing — Seven16 Intel",
  description:
    "Commercial-insurance agent data, without the legacy pricing. Sample, monthly, custom, or national license — transparent pricing, no quote-driven gating.",
};

/**
 * /pricing — Seven16 Intel four-tier transparent buying model per D-034
 * (locked 2026-05-26 — supersedes D-014/D-015/D-018/D-021 family pricing).
 *
 * Full polished implementation per BACKLOG `0e` (SESSION_38.5): hero +
 * 4-tier grid + slider calculator + "Why Seven16 Intel" + comparison
 * table + FAQ + sample-offer banner.
 */
export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <MarketingHeader isAuthed={!!user} theme="dark" />

      <PageHero
        variant="dark"
        eyebrow="Pricing"
        title="Commercial-insurance agent data,"
        highlight="without the legacy pricing."
        description="Search and buy commercial-insurance agency and producer data your way — monthly access, bulk exports, or a full U.S. license. Built for MGAs, wholesalers, carriers, recruiters, and insurance vendors who want quality data without a five-figure commitment upfront."
        primaryCta={{ label: user ? "Open your dashboard" : "Browse the directory free", href: user ? "/build-list" : "/sign-up" }}
        secondaryCta={{ label: "Try 50 contacts for $75", href: "/sign-up" }}
      />

      <Section
        variant="light"
        eyebrow="Choose how to buy"
        title="Four ways to start. The more you buy, the better your effective price."
        description="Start small, scale up, or buy everything. Sample, monthly subscription, custom file, or full U.S. license — pick the shape that fits your budget."
      >
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Starter Sample</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">$75 one-time</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Test the data quality before committing. 50 filtered commercial-insurance contacts, full
              records, one CSV export.
            </p>
            <ul className="mt-4 space-y-1 text-sm leading-6 text-slate-700">
              <li>· 50 filtered contacts</li>
              <li>· Full record export</li>
              <li>· Choose your states and filters</li>
              <li>· One-time CSV download</li>
            </ul>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Monthly Access</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">From $299/mo</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Ongoing access for teams that want monthly prospecting and the flexibility to search, save,
              and export over time.
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              <li><strong className="text-slate-950">Starter — $299/mo</strong>: 250 exports, 1 seat, core filters</li>
              <li><strong className="text-slate-950">Growth — $599/mo</strong>: 1,000 exports, 3 seats, saved lists</li>
              <li><strong className="text-slate-950">Pro — $999/mo</strong>: 3,000 exports, 5 seats, priority support</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">Annual prepay: $249 / $499 / $849 effective.</p>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Build Your File</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">Starts at $500</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Custom slice of the market by state, role, and filter. Per-record pricing slides automatically
              as the order grows.
            </p>
            <ul className="mt-4 space-y-1 text-sm leading-6 text-slate-700">
              <li>· 100–499 records: $1.20 each</li>
              <li>· 500–1,999: $0.90 each</li>
              <li>· 2,000–4,999: $0.70 each</li>
              <li>· 5,000–14,999: $0.50 each</li>
              <li>· 15,000+: $0.40 each or talk to sales</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">Most single-state orders land between $500 and $1,500.</p>
          </article>

          <article className="rounded-lg border-2 border-teal-700 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">National Founder License</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">$12,500/year</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Full U.S. commercial-insurance database at founder pricing. Built for carriers, MGAs,
              wholesalers, and vendors with nationwide distribution programs.
            </p>
            <ul className="mt-4 space-y-1 text-sm leading-6 text-slate-700">
              <li>· Full U.S. access</li>
              <li>· Best effective value</li>
              <li>· Annual license</li>
              <li>· Founder-rate positioning</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">Designed as a lower-friction alternative to legacy quote-driven vendors.</p>
          </article>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="Custom-file calculator"
        title="See your price as you build your list."
        description="Slide right to estimate any custom-file order. As your record count grows, your effective per-record price drops automatically."
      >
        <SliderCalculator />
      </Section>

      <Section
        variant="light"
        eyebrow="Why Seven16 Intel"
        title="A simpler way to buy commercial-insurance data."
      >
        <div className="max-w-3xl space-y-4 text-base leading-7 text-slate-700">
          <p>
            Most insurance data providers require a sales call before you can even estimate cost. Agency
            Signal gives you a lower-friction way to evaluate and buy — whether you need one state, five
            states, 500 records across regions, or the full U.S. database.
          </p>
          <p>
            Our database is built for insurance-specific targeting, with records filtered around the people
            and firms that matter most to distribution, recruiting, and marketing teams. Use it to find
            agencies, producers, and decision-makers by geography, niche, and business profile.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Buy a small sample before making a bigger commitment.</li>
            <li>Start on a monthly plan if you need ongoing prospecting.</li>
            <li>Build a custom file by state, region, role, or record count.</li>
            <li>Upgrade to a national license when you&apos;re ready to scale.</li>
          </ul>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="Why buyers choose Seven16 Intel"
        title="Transparent buying vs. legacy quote-driven vendors."
        description="The market is used to opaque pricing, sales-led trials, and enterprise-first packaging. We built the opposite."
      >
        <ComparisonTable />
      </Section>

      <Section
        variant="light"
        eyebrow="FAQ"
        title="Common questions."
      >
        <PricingFAQ />
      </Section>

      <Section variant="muted">
        <SampleOfferBanner />
      </Section>

      <CTASection
        eyebrow="Start small or go national"
        title="Try a $75 sample or talk to us about the founder license."
        description="Self-serve sign-up unlocks Free Browse instantly. Sample purchases let you validate data quality before scaling. National Founder License is annual — a quick email starts the conversation."
        primaryCta={{ label: user ? "Open your dashboard" : "Browse free", href: user ? "/build-list" : "/sign-up" }}
        secondaryCta={{ label: "Email about National License", href: "mailto:hello@seven16group.com?subject=National%20Founder%20License" }}
      />

      <MarketingFooter />
    </div>
  );
}
