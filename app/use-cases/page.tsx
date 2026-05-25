import Link from "next/link";
import { ArrowRight, Crosshair, Rocket, Map, Award, Filter } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Use cases — Agency Signal",
  description:
    "Five distribution plays for commercial-insurance carriers, MGAs, wholesalers, and program teams. Displace competitor paper, launch new programs, map white space, identify specialists, and reduce wasted outreach.",
};

type Play = {
  num: string;
  icon: ComponentType<LucideProps>;
  title: string;
  who: string;
  signal: string;
  body: string;
};

const PLAYS: Play[] = [
  {
    num: "01",
    icon: Crosshair,
    title: "Displace competitor paper",
    who: "Carrier distribution teams, MGAs with overlapping appetite",
    signal: "Carrier-appointment intelligence (Pillar 3)",
    body:
      "Find agencies already appointed with the carriers your program competes against. Start the conversation with context, not a cold pitch: “I see your book has paper that restricts your appetite on [risk class] — our program writes that risk with broader coverage and better commission.” Win appointments by walking into the conversation already knowing the problem you’re solving.",
  },
  {
    num: "02",
    icon: Rocket,
    title: "Launch a new program",
    who: "MGA / MGU launch teams, program administrators, carriers spinning up new product lines",
    signal: "Vertical specialization (Pillar 4) + state/carrier filtering (Pillar 5)",
    body:
      "Build a vertical-specific agency list by state, carrier appointment, and specialization pattern before the first campaign goes out. Identify the agencies that already understand your target risk class, already hold relevant paper, and already have a reason to care when your team calls.",
  },
  {
    num: "03",
    icon: Map,
    title: "Map white space",
    who: "VP of Distribution, carrier strategy teams, MGAs building territory plans",
    signal: "Carrier-appointment intelligence + state/vertical filters",
    body:
      "See where competitor appointments are concentrated and where your own distribution footprint is thin. The full agency universe filtered by appointment status, vertical, and state reveals the territory geography before you assign goals to BDMs.",
  },
  {
    num: "04",
    icon: Award,
    title: "Identify specialist agencies",
    who: "Specialty wholesalers, vertical-focused MGAs, program teams launching vertical-specific products",
    signal: "Specialization Tier scoring (Pillar 8) + vertical intelligence (Pillar 4)",
    body:
      "Prioritize agencies with repeated appointment behavior inside a target vertical instead of treating every commercial agency the same. Specialization Tier separates the agencies that have actually built a vertical book from the generalists who only write the line occasionally.",
  },
  {
    num: "05",
    icon: Filter,
    title: "Reduce wasted outreach",
    who: "Any distribution team running outbound campaigns",
    signal: "Verified Freshness + Carrier Diversity scoring",
    body:
      "Filter out poor-fit agencies before your BDMs, marketers, or campaign teams spend time on them. Captive agencies, single-carrier program shops, and stale records get flagged so the recruit list shrinks to the agencies actually worth the conversation. Fewer names, higher fit.",
  },
];

export default async function UseCasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="bg-white">
      <MarketingHeader isAuthed={!!user} theme="dark" />
      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.18),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-blue-200">
              Five plays for distribution teams
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3rem] lg:leading-[1.1]">
              Use the same signal five different ways.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              A good distribution team doesn&rsquo;t prospect the same way every quarter.
              Sometimes you&rsquo;re launching a program. Sometimes defending shelf space.
              Sometimes trying to displace a competitor. Sometimes mapping where the market is
              already built before territory goals are assigned. Agency Signal gives your team a
              cleaner map for each play.
            </p>
          </div>
        </section>

        {/* ===== THE FIVE PLAYS ===== */}
        <section className="border-b border-slate-200 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <ol className="space-y-10">
              {PLAYS.map(({ num, icon: Icon, title, who, signal, body }) => (
                <li key={num} className="grid gap-6 sm:grid-cols-12">
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                        {num}
                      </span>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                  <div className="sm:col-span-10">
                    <h2 className="text-xl font-semibold text-navy-900 sm:text-2xl">{title}</h2>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold uppercase tracking-wider text-slate-600">Who:</span>{" "}
                        {who}
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold uppercase tracking-wider text-slate-600">Signal:</span>{" "}
                        {signal}
                      </p>
                    </div>
                    <p className="mt-4 text-base leading-7 text-slate-700">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Bring your play. We&rsquo;ll show the signal.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Browse the directory free, filter by carrier appointment, and build a recruit list
              for the play you&rsquo;re running this quarter. If your play is an Enterprise+
              motion &mdash; program launch, territory rebuild, multi-state distribution
              expansion &mdash; talk to the distribution team directly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={user ? "/build-list" : "/sign-up"}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                {user ? "Open your dashboard" : "Browse agencies free"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/enterprise"
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                Enterprise+ distribution
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
