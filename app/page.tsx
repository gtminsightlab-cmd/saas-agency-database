import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { HeroSection } from "@/components/marketing/HeroSection";
import { AppointmentSearchMockup } from "@/components/marketing/AppointmentSearchMockup";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { ComparisonSection } from "@/components/marketing/ComparisonSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { VerticalCardsSection, type VerticalCard } from "@/components/marketing/VerticalCardsSection";
import { RecruitPlaysSection } from "@/components/marketing/RecruitPlaysSection";
import { MethodologySection } from "@/components/marketing/MethodologySection";
import { DataTrustSection } from "@/components/marketing/DataTrustSection";
import { PricingPreview } from "@/components/marketing/PricingPreview";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

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

  const stats = [
    { value: formatBucket(agenciesCount),     label: "Verified agencies" },
    { value: formatBucket(contactsCount),     label: "Contacts indexed" },
    { value: formatBucket(carriersCount),     label: "Writing companies" },
    { value: formatBucket(appointmentsCount), label: "Verified appointments" },
    { value: "All 50 states + DC",            label: "Geographic coverage" },
  ];

  const verticals = (verticalsRes.data ?? []) as VerticalCard[];

  return (
    <div className="bg-white">
      <MarketingHeader isAuthed={!!user} />
      <main>
        <HeroSection
          isAuthed={!!user}
          stats={stats}
          mockupSlot={<AppointmentSearchMockup />}
        />
        <ProblemSection />
        <ComparisonSection />
        <HowItWorksSection />
        <VerticalCardsSection verticals={verticals} />
        <RecruitPlaysSection />
        <MethodologySection />
        <DataTrustSection />
        <PricingPreview />
        <FinalCTA isAuthed={!!user} />
      </main>
      <MarketingFooter />
    </div>
  );
}
