import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { DataPanel } from "@/components/marketing/DataPanel";
import { UseCasePlay } from "@/components/marketing/UseCasePlay";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Use cases — Agency Signal",
  description:
    "Five distribution plays for commercial-insurance carriers, MGAs, wholesalers, and program teams. Displace competitor paper, launch new programs, map white space, identify specialists, reduce wasted outreach.",
};

type Play = {
  number: string;
  title: string;
  who: string;
  signal: string;
  when: string;
  action: string;
  result: string;
};

const PLAYS: Play[] = [
  {
    number: "01",
    title: "Displace competitor paper",
    who: "Carrier distribution teams, MGAs with overlapping appetite",
    signal: "Carrier-appointment intelligence (Pillar 3)",
    when: "You need to win appointments from agencies already appointed with competing carriers.",
    action: "Pull a list of agencies holding the carriers your program competes against. Open the conversation with context — not a cold pitch.",
    result: "Appointment conversations open with a documented problem (\"your current paper restricts X risk class\"), not a generic ask.",
  },
  {
    number: "02",
    title: "Launch a new program",
    who: "MGA / MGU launch teams, program administrators, carriers spinning up new product lines",
    signal: "Vertical specialization (Pillar 4) + state/carrier filtering (Pillar 5)",
    when: "Before your first campaign goes out on a new vertical or product line.",
    action: "Build a vertical-specific agency list filtered by state, carrier appointment, and specialization pattern.",
    result: "Outreach lands on agencies that already understand the target risk class and have a reason to care when your team calls.",
  },
  {
    number: "03",
    title: "Map white space",
    who: "VP of Distribution, carrier strategy teams, MGAs building territory plans",
    signal: "Carrier-appointment intelligence + state/vertical filters",
    when: "Before assigning territory goals to BDMs.",
    action: "See where competitor appointments are concentrated and where your own distribution footprint is thin. Pull the full agency universe filtered by appointment status, vertical, and state.",
    result: "Territory plans built on observable distribution geography, not BDM intuition.",
  },
  {
    number: "04",
    title: "Identify specialist agencies",
    who: "Specialty wholesalers, vertical-focused MGAs, program teams launching vertical-specific products",
    signal: "Specialization Tier scoring (Pillar 8) + vertical intelligence (Pillar 4)",
    when: "When you need a vertical-specific recruit list, not a generic commercial-agency dump.",
    action: "Sort by Specialization Tier within the vertical. Ignore generalists who only write the line occasionally; prioritize agencies with repeated appointment behavior inside the target vertical.",
    result: "Recruit lists shrink to agencies with proven vertical book — higher conversion per BDM hour.",
  },
  {
    number: "05",
    title: "Reduce wasted outreach",
    who: "Any distribution team running outbound campaigns",
    signal: "Verified Freshness + Carrier Diversity scoring",
    when: "Before every campaign send.",
    action: "Filter out captive agencies, single-carrier program shops, and stale records. Score remaining list by carrier diversity and verification recency.",
    result: "Fewer names on the list, higher fit per name, fewer wasted BDM hours.",
  },
];

export default async function UseCasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <MarketingHeader isAuthed={!!user} theme="dark" />

      <PageHero
        variant="dark"
        eyebrow="Five plays for distribution teams"
        title="Use the same signal"
        highlight="five different ways."
        description="A good distribution team doesn't prospect the same way every quarter. Sometimes you're launching a program, sometimes defending shelf space, sometimes trying to displace a competitor, sometimes mapping where the market is already built before territory goals are assigned. Agency Signal gives your team a cleaner map for each play."
        primaryCta={{ label: user ? "Open your dashboard" : "Browse agencies free", href: user ? "/build-list" : "/sign-up" }}
        secondaryCta={{ label: "Enterprise+ distribution", href: "/enterprise" }}
        rightRail={
          <DataPanel
            eyebrow="Signal ingredients"
            title="What every play is built from"
            rows={[
              { label: "Carrier appointments", value: "260K+ verified, monthly refresh" },
              { label: "Specialization tier", value: "Exposure / Growing / Specialist" },
              { label: "Diversity index", value: "Per-agency carrier breadth" },
              { label: "Verified contacts", value: "135K+ producers + leaders" },
              { label: "State filters", value: "All 50 + DC" },
              { label: "Vertical filters", value: "12 carrier-mapped verticals" },
            ]}
            badges={["Parent/child mapped", "State-DOI sourced", "No bot scrape"]}
            footer="Every play below pulls from this same signal layer. Different filters, different ranking — same trusted data underneath."
          />
        }
      />

      <Section
        variant="light"
        eyebrow="The playbook"
        title="Five plays. Same anatomy."
        description="Each play is one filter + one decision + one expected outcome. Read the play, run the filter in the app, send the list to whoever owns the outreach."
      >
        <div className="-mt-10">
          {PLAYS.map((play) => (
            <UseCasePlay key={play.number} {...play} />
          ))}
        </div>
      </Section>

      <CTASection
        eyebrow="Bring your play"
        title="We'll show you the signal."
        description="Browse the directory free, filter by carrier appointment, and build a recruit list for the play you're running this quarter. If your play is an Enterprise+ motion — program launch, territory rebuild, multi-state distribution expansion — talk to the distribution team directly."
        primaryCta={{ label: user ? "Open your dashboard" : "Browse agencies free", href: user ? "/build-list" : "/sign-up" }}
        secondaryCta={{ label: "Enterprise+ distribution", href: "/enterprise" }}
      />

      <MarketingFooter />
    </div>
  );
}
