import Link from "next/link";
import { SignUpForm } from "./form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Vertical metadata for the segmented left rail. Mirrors the sort_order of
// vertical_markets so a fresh row appears here once we add it. We keep the
// data static (rather than a DB query) because this page renders for anon
// visitors and we want zero round-trips on the sign-up critical path.
const VERTICAL_LEFT_RAIL: Record<string, {
  name: string;
  agencyCount: number;
  carrierCount: number;
  topCarriers: string;
  contactCount: number;
}> = {
  transportation:                { name: "Transportation",                  agencyCount: 358,   carrierCount: 12, topCarriers: "Progressive Smart Haul, Carolina Casualty, Great West, Sentry",                contactCount: 4002  },
  "healthcare-human-services":   { name: "Healthcare & Human Services",     agencyCount: 263,   carrierCount: 21, topCarriers: "Medical Protective, Coverys, NORCAL, ProAssurance",                            contactCount: 2236  },
  construction:                  { name: "Construction",                    agencyCount: 679,   carrierCount: 20, topCarriers: "Acuity, Federated, Western National, Berkley One, Cincinnati Specialty",      contactCount: 6633  },
  agriculture:                   { name: "Agriculture",                     agencyCount: 5189,  carrierCount: 18, topCarriers: "Nationwide Agribusiness, Farm Bureau, Westfield, Acuity Ag",                   contactCount: 34606 },
  "public-entity":               { name: "Public Entity",                   agencyCount: 0,     carrierCount: 0,  topCarriers: "Travelers Public Sector, Munich Re, AGRIP carriers",                          contactCount: 0     },
  "real-estate":                 { name: "Real Estate",                     agencyCount: 0,     carrierCount: 0,  topCarriers: "Liberty Mutual, AmRisc, RPS, Burns & Wilcox",                                 contactCount: 0     },
  hospitality:                   { name: "Hospitality",                     agencyCount: 0,     carrierCount: 0,  topCarriers: "Society Insurance, Distinguished, RPS Hospitality",                          contactCount: 0     },
  manufacturing:                 { name: "Manufacturing",                   agencyCount: 0,     carrierCount: 0,  topCarriers: "Liberty Mutual Manufacturer, EMC, Federated, Cincinnati",                    contactCount: 0     },
  "tech-cyber":                  { name: "Technology & Cyber",              agencyCount: 0,     carrierCount: 0,  topCarriers: "Beazley, Coalition, At-Bay, Tokio Marine HCC",                               contactCount: 0     },
  energy:                        { name: "Energy",                          agencyCount: 0,     carrierCount: 0,  topCarriers: "AEGIS, Liberty Mutual Energy, Endurance, Liberty Specialty",               contactCount: 0     },
  retail:                        { name: "Retail",                          agencyCount: 0,     carrierCount: 0,  topCarriers: "Liberty Mutual Retail, Travelers, Hartford, Cincinnati",                     contactCount: 0     },
  "professional-services":       { name: "Professional Services",           agencyCount: 0,     carrierCount: 0,  topCarriers: "Beazley, CNA, Hiscox, Hartford E&O",                                          contactCount: 0     },
};

type LeftRailMode = "invite" | "vertical" | "default";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { vertical?: string; invited?: string; email?: string; plan?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Already signed in? Send them straight to the app.
  if (user) {
    // Next.js redirect must be from server component — caller's render still
    // works if they navigated here intentionally; otherwise the link below
    // covers the fallback.
  }

  const verticalSlug = (searchParams.vertical ?? "").trim().toLowerCase();
  const verticalMeta = verticalSlug ? VERTICAL_LEFT_RAIL[verticalSlug] : null;
  const isInvited = searchParams.invited === "1" || !!searchParams.email;
  const mode: LeftRailMode = isInvited ? "invite" : verticalMeta ? "vertical" : "default";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Seven16 <span className="font-light opacity-80">Agency Directory</span>
        </Link>

        <div className="space-y-6 max-w-lg">
          {mode === "invite" ? (
            <>
              <h1 className="text-4xl font-bold leading-tight">
                You&rsquo;ve been invited to your team&rsquo;s Seven16 account.
              </h1>
              <p className="text-lg text-brand-100">
                Your colleague has reserved a seat for you on their plan. Sign up with the email
                below &mdash; you&rsquo;ll automatically join their team and inherit the full plan benefits.
              </p>
              <div className="rounded-lg bg-white/10 p-4 text-sm">
                <div className="font-semibold text-white">What you get</div>
                <ul className="mt-2 space-y-1 text-brand-100">
                  <li>&middot; Same plan, same data, same downloads as your team&rsquo;s owner</li>
                  <li>&middot; Your saved lists, search history, and credits stay private to you</li>
                  <li>&middot; The owner can revoke your seat at any time from their Team page</li>
                </ul>
              </div>
            </>
          ) : mode === "vertical" && verticalMeta ? (
            <>
              <h1 className="text-4xl font-bold leading-tight">
                {verticalMeta.name} access in 60 seconds.
              </h1>
              <p className="text-lg text-brand-100">
                {verticalMeta.agencyCount > 0
                  ? `${verticalMeta.agencyCount.toLocaleString()} verified ${verticalMeta.name.toLowerCase()}-specialty agencies. ${verticalMeta.carrierCount} specialty carriers mapped. Refreshed every 30 days against state DOI filings.`
                  : `Specialty carriers mapped to ${verticalMeta.name.toLowerCase()} appointments. We score every agency on observable specialization. Refreshed every 30 days against state DOI filings.`}
              </p>
              <div className="rounded-lg bg-white/10 p-4 text-sm">
                <div className="font-semibold text-white">What you get free</div>
                <ul className="mt-2 space-y-1 text-brand-100">
                  {verticalMeta.agencyCount > 0 && (
                    <li>&middot; All {verticalMeta.agencyCount.toLocaleString()} {verticalMeta.name.toLowerCase()}-specialty agencies in one filterable view</li>
                  )}
                  <li>&middot; Tier-scored by carrier-appointment specialization (Exposure / Growing / Specialist)</li>
                  {verticalMeta.contactCount > 0 && (
                    <li>&middot; Contact-level export for the {verticalMeta.contactCount.toLocaleString()} producers, branch managers, and presidents in the segment</li>
                  )}
                  <li className="text-brand-200/80 italic mt-2">Carriers in this vertical: {verticalMeta.topCarriers}, and more.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold leading-tight">
                Find the agencies who can bind your program. Today.
              </h1>
              <p className="text-lg text-brand-100">
                36,212 verified U.S. commercial agencies, 400+ writing companies mapped to parent
                groups, refreshed every 30 days. Free to browse &mdash; pay only when you download.
              </p>
              <div className="rounded-lg bg-white/10 p-4 text-sm">
                <div className="font-semibold text-white">What you get free</div>
                <ul className="mt-2 space-y-1 text-brand-100">
                  <li>&middot; Full filter access &mdash; carrier, parent group, AMS, geography, employee size, specialty score</li>
                  <li>&middot; Pre-filtered targeted lists for all 12 verticals</li>
                  <li>&middot; Save unlimited filter combinations to revisit later</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <p className="text-sm text-brand-200">
          {mode === "invite"
            ? "Your team is waiting."
            : "No credit card required. We never share your email. Cancel anytime."}
          {" "}&copy; {new Date().getFullYear()} Seven16 Group
        </p>
      </aside>

      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === "invite" ? "Join your team" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {mode === "invite"
                ? "Your seat is reserved. Sign up with the email below to claim it."
                : "Free forever. Browse without paying. No credit card."}
            </p>
          </div>
          <SignUpForm />
          <p className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
