import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { AppointmentSearchMockup } from "@/components/marketing/AppointmentSearchMockup";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { ComparisonSection } from "@/components/marketing/ComparisonSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { VerticalCardsSection, type VerticalCard } from "@/components/marketing/VerticalCardsSection";
import { RecruitPlaysSection } from "@/components/marketing/RecruitPlaysSection";
import { MethodologySection } from "@/components/marketing/MethodologySection";
import { ManifestoSection } from "@/components/marketing/ManifestoSection";
import { DataTrustSection } from "@/components/marketing/DataTrustSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { StatStrip } from "@/components/marketing/StatStrip";
import { PricingCard } from "@/components/marketing/PricingCard";

export const dynamic = "force-dynamic";

// D-024 defensive UI: if any live count fetch fails or returns null, fall back
// to a rounded floor sourced from the 2026-05-18 audit so the trust strip
// never renders empty values.
const STAT_FALLBACK = {
  agencies: 41700,
  contacts: 135000,
  carriers: 1300,
  appointments: 260000,
  states: 52,
};

function formatBucket(n: number): string {
  if (n >= 100000) return `${Math.floor(n / 1000).toLocaleString()}K+`;
  if (n >= 10000)  return `${(Math.floor(n / 1000) * 1000).toLocaleString()}+`;
  if (n >= 1000)   return `${(Math.floor(n / 100) * 100).toLocaleString()}+`;
  return `${n}+`;
}

export default async function MarketingHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [agenciesRes, contactsRes, carriersRes, appointmentsRes, verticalsRes] = await Promise.all([
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("carriers").select("id", { count: "exact", head: true }),
    supabase.from("agency_carriers").select("id", { count: "exact", head: true }),
    supabase
      .from("mv_vertical_summary")
      .select("slug,name,description,icon_key,agency_count,location_count,contact_count,mapped_carrier_count,sort_order")
      .order("sort_order"),
  ]);

  const agenciesCount     = agenciesRes.count     ?? STAT_FALLBACK.agencies;
  const contactsCount     = contactsRes.count     ?? STAT_FALLBACK.contacts;
  const carriersCount     = carriersRes.count     ?? STAT_FALLBACK.carriers;
  const appointmentsCount = appointmentsRes.count ?? STAT_FALLBACK.appointments;

  const statItems = [
    { value: formatBucket(agenciesCount),     label: "Verified agencies" },
    { value: formatBucket(contactsCount),     label: "Contacts indexed" },
    { value: formatBucket(carriersCount),     label: "Writing companies" },
    { value: formatBucket(appointmentsCount), label: "Verified appointments" },
  ];

  const verticals = (verticalsRes.data ?? []) as VerticalCard[];

  return (
    <div>
      <MarketingHeader isAuthed={!!user} theme="dark" />
      <main>
        <PageHero
          variant="dark"
          eyebrow="Commercial insurance distribution intelligence"
          title="Stop buying agency lists."
          highlight="Start reading the paper trail."
          description="Most prospecting starts with a name, a title, and a guess. That's not how commercial-insurance distribution works. Agency Signal maps the writing-company paper trail behind every U.S. commercial-insurance agency — refreshed monthly against state filings — so carriers, MGAs, wholesalers, and program teams can find the agencies already appointed with the markets they compete with."
          primaryCta={{ label: user ? "Open your dashboard" : "Browse verified agencies free", href: user ? "/build-list" : "/sign-up" }}
          secondaryCta={{ label: "View transportation list", href: "/verticals/transportation" }}
          rightRail={<AppointmentSearchMockup />}
        />

        <Section variant="muted" eyebrow="The directory at a glance" title="What's in the data today." description="Live counts pulled from production. All 50 states + DC + 3 territorial add-ons. Refreshed monthly against state DOI filings.">
          <StatStrip variant="light" items={statItems} />
        </Section>

        <ProblemSection />
        <ComparisonSection />
        <HowItWorksSection />
        <VerticalCardsSection verticals={verticals} />
        <RecruitPlaysSection />
        <MethodologySection />
        <ManifestoSection />
        <DataTrustSection />

        <Section
          variant="light"
          eyebrow="Pricing"
          title="Sample, monthly, custom, or national."
          description="Four transparent ways to buy commercial-insurance data. Start with a $75 sample, sign up for monthly access, build a custom file by state, or buy a full U.S. license."
        >
          <div id="pricing" className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <PricingCard
              name="Starter Sample"
              audience="Test quality before committing."
              price="$75 one-time"
              features={[
                "50 filtered contacts",
                "Full record export",
                "Choose your states + filters",
                "One CSV download",
              ]}
              cta="Try the sample"
              href="/sign-up"
            />
            <PricingCard
              name="Monthly Access"
              audience="Ongoing prospecting teams."
              price="from $299/mo"
              features={[
                "250 to 3,000 exports / month",
                "1 to 5 seats by tier",
                "Saved lists + filters",
                "Annual prepay discount",
              ]}
              cta="Start monthly"
              href="/pricing"
              highlighted
            />
            <PricingCard
              name="Build Your File"
              audience="Custom slice of the market."
              price="from $500"
              features={[
                "$1.20 → $0.40 per record",
                "Volume discount slides up",
                "Choose states + roles + filters",
                "One-time CSV delivery",
              ]}
              cta="Build a file"
              href="/pricing"
            />
            <PricingCard
              name="National License"
              audience="Full U.S. database."
              price="$12,500/yr"
              features={[
                "Full U.S. access",
                "Annual license",
                "Founder-rate positioning",
                "Best effective value",
              ]}
              cta="Talk to us"
              href="mailto:hello@seven16group.com?subject=National%20Founder%20License"
            />
          </div>
          <p className="mt-8 text-sm text-slate-600 max-w-3xl">
            See the <a href="/pricing" className="font-bold text-teal-700 hover:text-teal-800">full pricing page</a> for tier details, custom-file volume math, and the National Founder License.
          </p>
        </Section>

        <CTASection
          eyebrow="Distribution is not a spreadsheet problem"
          title="It's a judgment problem."
          description="Agency Signal gives your team a defensible recruit list — scored by observable appointment behavior, refreshed monthly, and built for the play you're running this quarter. Browse free, pay only when you export."
          primaryCta={{ label: user ? "Open your dashboard" : "Browse verified agencies free", href: user ? "/build-list" : "/sign-up" }}
          secondaryCta={{ label: "Talk to sales", href: "mailto:hello@seven16group.com?subject=Agency%20Signal%20demo" }}
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
