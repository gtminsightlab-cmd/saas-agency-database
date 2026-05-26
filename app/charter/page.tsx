import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Charter Member program ended | Agency Signal",
  description:
    "The Charter Member program has ended. Agency Signal now offers transparent, modular buying — sample, monthly, custom, or national license.",
  robots: { index: false, follow: true },
};

export default function CharterPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      <PageHero
        eyebrow="Program ended"
        title="The Charter Member program has ended."
        description="Thanks to everyone who watched the early phase of Agency Signal. The Charter Member offer was retired on 2026-05-26 in favor of a simpler, more transparent way to buy commercial-insurance data."
        primaryCta={{ label: "See current pricing", href: "/pricing" }}
        secondaryCta={{ label: "Talk to us", href: "mailto:hello@seven16group.com" }}
      />

      <Section variant="light" eyebrow="What changed" title="Transparent buying replaced the founding-member offer.">
        <div className="max-w-3xl space-y-5 text-base leading-7 text-slate-700">
          <p>
            Agency Signal is moving to a buying model that doesn&apos;t require a sales call to see prices.
            You can start with a paid sample, sign up for monthly access, build a custom file by state or
            filter, or buy a full U.S. license at founder pricing. The page is short on purpose.
          </p>
          <p>
            If you were enrolled or in conversation about the Charter Member program, your contact at Seven16
            Group will be in touch directly. Existing access stays active through your current period —
            nothing breaks today.
          </p>
        </div>
      </Section>

      <Section variant="muted" eyebrow="The four ways to buy" title="Sample · Monthly · Custom · National.">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-base font-black text-slate-950">Starter Sample — $75 one-time</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              50 filtered commercial-insurance contacts. Full records. One CSV export. Designed for quality
              testing before a bigger commitment.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-base font-black text-slate-950">Monthly Access — from $299/mo</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Ongoing access with export credits, filters, and saved lists. Three tiers (Starter / Growth /
              Pro). Annual prepay discount available.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-base font-black text-slate-950">Build Your File — from $500</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Custom slice of the market by state, role, and filter. Per-record pricing slides from $1.20
              down to $0.40 as the order grows.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-base font-black text-slate-950">National Founder License — $12,500/yr</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Full U.S. commercial-insurance database at founder pricing. Annual license. Designed as a
              lower-friction alternative to legacy quote-driven vendors.
            </p>
          </article>
        </div>
        <div className="mt-8 max-w-3xl">
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            See current pricing &rarr;
          </Link>
        </div>
      </Section>

      <Section variant="light" eyebrow="Questions?" title="We&apos;re here.">
        <div className="max-w-2xl space-y-4 text-base leading-7 text-slate-700">
          <p>
            If you were watching the Charter Member program and have questions about the change, or if you
            want to discuss the National Founder License, email{" "}
            <a href="mailto:hello@seven16group.com" className="font-bold text-teal-700 hover:text-teal-800">
              hello@seven16group.com
            </a>{" "}
            and we&apos;ll route it to the right person at Seven16 Group.
          </p>
        </div>
      </Section>
    </main>
  );
}
