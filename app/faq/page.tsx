import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQ — Agency Signal",
  description:
    "Common questions about Agency Signal — distribution intelligence for commercial insurance. Methodology, data sources, who it's for, and what it does NOT do.",
};

type Group = {
  heading: string;
  items: Array<{ q: string; a: string }>;
};

const GROUPS: Group[] = [
  {
    heading: "What it is",
    items: [
      {
        q: "What is Agency Signal?",
        a: "Agency Signal is a commercial-insurance distribution-intelligence platform. We map agency appointments at the writing-company level, normalize those writing companies to parent insurance groups, and organize the results by vertical, geography, specialization, carrier diversity, and verified freshness — so carriers, MGAs, wholesalers, and program teams can find better-fit agency partners.",
      },
      {
        q: "How is this different from an agency list?",
        a: "A list tells you who exists. Agency Signal helps you understand who fits. The platform starts with verified carrier appointments and writing-company relationships, then organizes agencies by vertical signal, market access, specialization, geography, and freshness. We're a different category from the list-broker / contact-data category — intelligence layer with appointment-context built in, not row count.",
      },
      {
        q: "Is this a replacement for my CRM?",
        a: "No. Agency Signal is a targeting and distribution-intelligence layer that sits BEFORE your CRM. Your CRM manages relationships and activity. Agency Signal helps you decide which agencies belong in the plan in the first place. Export CSV / JSON for import into your CRM via Zapier / Make for now; native one-click connectors are on the roadmap.",
      },
    ],
  },
  {
    heading: "Data + methodology",
    items: [
      {
        q: "Where does the data come from?",
        a: "Public appointment and agency data sources, including state DOI filings. We collect, normalize writing companies, reconcile parent insurance groups, agency entities, contacts, and related market records into a distribution-focused view. Full methodology is published at /methodology.",
      },
      {
        q: "Why do writing companies matter?",
        a: "Carriers often operate through multiple writing companies — sometimes 9 or more under a single parent insurance group. If those entities aren't normalized, the market becomes hard to read: the same parent appears nine times in your Top 100 and never once in your Top 10. Agency Signal maps writing companies to parent groups so distribution teams can understand which agencies hold relevant paper.",
      },
      {
        q: "Does an appointment prove an agency writes that class of business?",
        a: "No. An appointment is not the same as bound premium. But appointment behavior is a strong distribution signal. When combined with vertical carrier patterns, geography, appointment volume, and carrier diversity, it gives teams a better way to prioritize outreach than job titles or self-reported industry tags.",
      },
      {
        q: 'What does "verified-as-of" mean?',
        a: "Each record carries a freshness date tied to the most recent verification cycle. Instead of hiding behind a generic \"database updated regularly\" banner, Agency Signal exposes freshness at the row level so your team knows whether it's working from current signal or aging data.",
      },
    ],
  },
  {
    heading: "Who it's for",
    items: [
      {
        q: "Who uses Agency Signal?",
        a: "Commercial-insurance carriers, MGAs, MGUs, wholesalers, program administrators, insurance vendors, and distribution teams that need to identify better-fit agency partners. Personal-lines-only agencies and DOT-only / trucking-only buyers are out of scope (for trucking, see DOT Intel).",
      },
      {
        q: "Is this only for large carriers?",
        a: "No. Agency Signal is especially useful for smaller carriers, MGAs, wholesalers, and program teams that cannot afford to waste quarters building the wrong agency list. The self-serve Producer and Growth tiers are sub-$500 P-card. Enterprise+ Distribution Expander covers the multi-state distribution-growth motion for VPs of Distribution.",
      },
    ],
  },
  {
    heading: "Use + access",
    items: [
      {
        q: "Can I browse before paying?",
        a: "Yes. Agency Signal is designed so users can browse, filter, and research before purchasing export credits or a paid plan. Free Browse covers unlimited search; export credits apply only when you're ready to act.",
      },
      {
        q: "Can Agency Signal help with program launches?",
        a: "Yes. Program teams can use Agency Signal to identify agencies already appointed with relevant competing or adjacent markets by vertical, state, carrier appointment behavior, and specialization. See /use-cases for the five distribution plays.",
      },
      {
        q: "Can Agency Signal help with competitor displacement?",
        a: "Yes. If your program competes with a known carrier or parent group, Agency Signal can help identify agencies appointed with that market so your team can build a focused displacement campaign — context-rich outreach instead of cold calls.",
      },
    ],
  },
  {
    heading: "What it doesn't do",
    items: [
      {
        q: "Does Agency Signal make underwriting decisions?",
        a: "No. Agency Signal surfaces the data — appointments, vertical signal, carrier diversity, freshness. Whether to bind a risk, what terms, what coverage stays with the carrier and the licensed agent. The line is hard and architectural — see /about for the locked commitments.",
      },
      {
        q: "Do you have customer logos / testimonials?",
        a: "Not yet — Agency Signal is pre-revenue. Per the family's anti-promise: no fake metrics or invented customer claims. For diligence-level verification, we'll connect you with operator-network references on a call. Email partners@seven16group.com.",
      },
      {
        q: "Do you compare yourselves to specific competing vendors?",
        a: "No. Per family doctrine, we don't name specific competing vendors in our content — even neutrally. The categories we sit adjacent to (list-broker / contact-data, marketplace / submission-marketplace, B2B contact data, carrier financial data) all exist; we're a different category. Category-level positioning is more durable as the vendor lineup shifts.",
      },
    ],
  },
];

export default async function FAQPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="bg-white">
      <MarketingHeader isAuthed={!!user} />
      <main>
        {/* ===== HERO ===== */}
        <section className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-blue-200">
              Frequently asked
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Straight answers about how Agency Signal works.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Methodology, data sources, who it&rsquo;s for, and what it explicitly does NOT do.
              Operator-honest framing &mdash; no marketing weasel-language.
            </p>
          </div>
        </section>

        {/* ===== FAQ GROUPS ===== */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {GROUPS.map((group, gi) => (
              <div key={group.heading} className={gi === 0 ? "" : "mt-16"}>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {String(gi + 1).padStart(2, "0")}
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                  {group.heading}
                </h2>
                <dl className="mt-8 space-y-8">
                  {group.items.map((item) => (
                    <div key={item.q} className="border-l-2 border-slate-200 pl-5">
                      <dt className="text-base font-semibold text-navy-900">{item.q}</dt>
                      <dd className="mt-2 text-base leading-7 text-slate-700">{item.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}

            <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-navy-900">
                Didn&rsquo;t see your question?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Operator-led means the conversation is direct. Email{" "}
                <a
                  href="mailto:partners@seven16group.com"
                  className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
                >
                  partners@seven16group.com
                </a>{" "}
                with the context and you&rsquo;ll get a response from the operator directly.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Read the methodology
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={user ? "/build-list" : "/sign-up"}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50"
                >
                  {user ? "Open your dashboard" : "Browse agencies free"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
