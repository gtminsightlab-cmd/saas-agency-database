import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { PricingCard } from "@/components/marketing/PricingCard";
import { DataPanel } from "@/components/marketing/DataPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing — Agency Signal",
  description:
    "Browse free. Pay only when you need exports. Three starting points: Free Browse, Growth Member, Snapshot. Full credit math, volume bonus bands, and Charter Member pricing.",
};

/**
 * /pricing — placeholder per Master O directive at design system v1 ship.
 *
 * Full pricing detail (credit top-up math, volume bonus bands, Charter Member
 * permanent-tier mechanics per D-014/D-021, Enterprise+ per-state pricing per
 * D-015) is the scope of a dedicated pricing session. This page is the
 * skeleton with the right chrome so the new system is consistent across all
 * marketing routes; Master O reactivates with full content in the pricing
 * session.
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
        title="Browse free."
        highlight="Pay only when you need exports."
        description="Three starting points. Current rates surface at sign-up so you always see what you'll actually be charged. Charter Member pricing locks in permanently per D-014 — see the Charter page for early-customer terms."
        primaryCta={{ label: user ? "Open your dashboard" : "Browse the directory free", href: user ? "/build-list" : "/sign-up" }}
        secondaryCta={{ label: "Charter Member pricing", href: "/charter" }}
        rightRail={
          <DataPanel
            eyebrow="Usage model"
            title="What the credit system rewards"
            rows={[
              { label: "Browse", value: "Always free, unlimited" },
              { label: "Filter", value: "Free, unlimited refinement" },
              { label: "Save lists", value: "Included in Growth Member" },
              { label: "Export contacts", value: "1 credit per record" },
              { label: "Top-up", value: "$5–$1,000 slider, bonus bands" },
              { label: "Charter override", value: "+40% bonus permanent" },
            ]}
            badges={["No long-term contract", "No surprise overages", "P-card friendly"]}
            footer="Detailed credit math, volume bonus thresholds, and the Charter Member permanent-tier mechanics are walked through during sign-up. Enterprise+ per-state pricing is its own conversation — see /enterprise."
          />
        }
      />

      <Section
        variant="light"
        eyebrow="Three starting points"
        title="Pick the shape that matches how you operate."
        description="All three include unlimited browsing. The difference is how exports work — recurring credit pool, one-time pack, or pay-per-export."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <PricingCard
            name="Free Browse"
            audience="Market mapping. Unlimited search. No exports."
            price="Free"
            features={[
              "Unlimited search across 41,700+ agencies",
              "Filter by carrier, vertical, state",
              "1 seat",
              "Best for market mapping and prospect research",
            ]}
            cta="Browse free"
            href={user ? "/build-list" : "/sign-up"}
          />
          <PricingCard
            name="Growth Member"
            audience="Active distribution teams pulling lists every week."
            price="see at sign-up"
            features={[
              "Monthly export credits",
              "Multi-seat access",
              "Saved-list refresh",
              "Email + onboarding call",
              "Top-up slider for heavier months",
            ]}
            cta="Start Growth Member"
            href="/sign-up"
            highlighted
          />
          <PricingCard
            name="Snapshot"
            audience="Market entry, M&A diligence, special projects."
            price="see at sign-up"
            features={[
              "One-time export credit pack",
              "Single export window",
              "Best for M&A diligence",
              "Best for special-project list pulls",
            ]}
            cta="Buy Snapshot"
            href="/sign-up"
          />
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="Coming to this page"
        title="Full pricing detail lands in a dedicated session."
        description="This page is the entry point. The full credit top-up math, volume bonus bands, Charter Member permanent-tier mechanics, and the comparison vs. generic list purchases all land in the next pricing-specific session per Master O's plan. In the meantime, current rates surface at sign-up — no published list to memorize, no surprise overages."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">Credit top-up math</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Top-ups happen on a $5–$1,000+ slider with bonus bands that increase the effective credit-per-dollar
              rate as the top-up size grows. Charter Members hold the top bonus band permanently. Full bonus
              thresholds + per-credit pricing arrive in the dedicated pricing session.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">Generic list purchase vs. Agency Signal export</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Buying a 6,000-record list from a generic data tool costs more than pulling a 200-record verified
              recruit list from Agency Signal — and the 200 records have proven appointment behavior. Comparison
              table with the per-record math lands in the dedicated pricing session.
            </p>
          </article>
        </div>
      </Section>

      <CTASection
        eyebrow="Three paths into the directory"
        title="Browse free. Lock the Charter rate. Or talk Enterprise+."
        description="Self-serve sign-up unlocks Free Browse instantly. Charter Member pricing is open during the 60–90 day enrollment window — direct to Master O. Enterprise+ is demo-led with per-state pricing."
        primaryCta={{ label: user ? "Open your dashboard" : "Browse the directory free", href: user ? "/build-list" : "/sign-up" }}
        secondaryCta={{ label: "Request a Charter conversation", href: "/charter" }}
      />

      <MarketingFooter />
    </div>
  );
}
