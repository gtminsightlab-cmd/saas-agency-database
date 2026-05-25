import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Sidebar } from "@/components/app/sidebar";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { DataPanel } from "@/components/marketing/DataPanel";
import { EditorialCard } from "@/components/marketing/EditorialCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resources — Methodology, recruit plays, and the case for targeted data | Agency Signal",
  description:
    "Field-tested methodology and recruit plays for using carrier-appointment intelligence to build a defensible recruit list. Updated as new pieces ship.",
};

const ARTICLES = [
  {
    category: "Methodology",
    title: "How to identify target agencies by vertical",
    description: "The three signals — Volume, Specialization Tier, and Carrier Diversity — that turn a 36,000-row directory into a recruit list of a few hundred names. Plus five named recruit plays distribution leaders run in production.",
    meta: "9 min read",
    href: "/methodology",
  },
  {
    category: "Recruit play",
    title: "Five plays for distribution teams",
    description: "Displace competitor paper, launch new programs, map white space, identify specialists, reduce wasted outreach. Each play with anatomy: who it's for, which signal it uses, when to run it, the action, and the result.",
    meta: "7 min read",
    href: "/use-cases",
  },
  {
    category: "Comparison",
    title: "Why generic data tools fall short for distribution recruiting",
    description: "Three categories of data tools live in this space — B2B contact data, carrier financial data, and building it in-house. None of them answer the question that actually drives appointment wins. A side-by-side of what each category is good for and what each gets wrong.",
    meta: "6 min read",
    comingSoon: true,
  },
  {
    category: "Glossary",
    title: "Specialization Tier, Diversity Index, Composite Score",
    description: "Plain-English definitions for every scoring column in the directory. Use this when handing off a list to a producer team or briefing a new hire on the methodology.",
    meta: "3 min read",
    comingSoon: true,
  },
];

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let sidebarProps:
    | { email: string; fullName: string | null; isSuperAdmin: boolean }
    | null = null;
  if (user) {
    const { data: appUser } = await supabase
      .from("app_users")
      .select("email, full_name, role")
      .eq("user_id", user.id)
      .maybeSingle();
    sidebarProps = {
      email: appUser?.email ?? user.email ?? "",
      fullName: appUser?.full_name ?? null,
      isSuperAdmin: appUser?.role === "super_admin",
    };
  }

  const body = (
    <div>
      {!user && <MarketingHeader isAuthed={false} theme="dark" />}

      <PageHero
        variant="dark"
        eyebrow="Resources"
        title="The case for targeted data"
        highlight="over wide data."
        description="Field-tested methodology, recruit plays, and side-by-side comparisons for teams who are tired of paying for general-purpose contact databases that don't answer the question that actually drives appointment wins: which agencies hold which carriers, and which of those agencies have room for one more."
        primaryCta={{ label: "Read the methodology", href: "/methodology" }}
        secondaryCta={{ label: "See it applied to 12 verticals", href: "/verticals" }}
        rightRail={
          <DataPanel
            eyebrow="Resource index"
            title="What's published, what's queued"
            rows={[
              { label: "Methodology", value: "Live · 9 min" },
              { label: "Recruit plays", value: "Live · 7 min" },
              { label: "Comparisons", value: "Coming soon" },
              { label: "Glossary", value: "Coming soon" },
              { label: "Changelog", value: "Coming soon" },
            ]}
            badges={["Updated monthly", "Operator-direct", "No black box"]}
            footer="New pieces ship as the team writes them. Subscribe to the changelog at the bottom of the page to get the next one in your inbox."
          />
        }
      />

      <Section
        variant="light"
        eyebrow="Editorial library"
        title="Read the doctrine. Then run the playbook."
        description="Every piece below is operator-direct — written for distribution teams running an actual play this quarter, not for marketing-funnel SEO."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {ARTICLES.map((article) => (
            <EditorialCard
              key={article.title}
              category={article.category}
              title={article.title}
              description={article.description}
              meta={article.meta}
              href={article.href}
              comingSoon={article.comingSoon}
            />
          ))}
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="The argument in two paragraphs"
        title="Why targeted carrier-appointment data beats wide contact data."
      >
        <div className="max-w-3xl space-y-5 text-base leading-7 text-slate-700">
          <p>
            A general contact database tells you where 36,000 agencies are and how to reach them. That sounds
            useful until you ask the question your producer team will ask next: <em>which of these 36,000
            actually writes my line of business with the carriers I compete with?</em> The answer is buried —
            not in the contact database, but in the carrier-appointment data the database doesn't carry.
          </p>
          <p>
            Targeted data is what gets you from 36,000 to the 200 who can pick up the phone and bind your
            program tomorrow. That's where the dollars are. A recruit list of 200 high-fit names beats a list
            of 6,000 lookalikes — less wasted dialing, fewer producer hours burned on captives, and a
            measurably higher AOR conversion rate against the agencies who can actually bind.
          </p>
          <p className="text-sm italic text-slate-500">
            The methodology piece above is the long version of this argument. Read it before your next
            list-buying decision.
          </p>
        </div>
      </Section>

      <CTASection
        eyebrow="From doctrine to product"
        title="Want the data behind the methodology?"
        description="Each vertical card is the framework above — in production. Specialty carrier list, agency counts by tier, refreshed every 30 days. Browse the directory free; pay only when you export."
        primaryCta={{ label: user ? "Open the app" : "Browse the directory free", href: user ? "/build-list" : "/sign-up" }}
        secondaryCta={{ label: "Open the 12 verticals", href: "/verticals" }}
      />
    </div>
  );

  if (sidebarProps) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar {...sidebarProps} />
        <div className="flex-1 min-w-0 overflow-x-hidden">{body}</div>
      </div>
    );
  }

  return body;
}
