import Link from "next/link";
import {
  ArrowRight,
  Crosshair,
  Target,
  BarChart3,
  Layers,
  ShieldCheck,
  Search,
  Compass,
  Filter,
  MapPin,
  Award,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";
import { Sidebar } from "@/components/app/sidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "How we score agencies — Methodology | Seven16 Agency Directory",
  description:
    "Three independent signals — Volume, Specialization Tier, and Carrier Diversity — turn a 36,000-name agency list into a defensible recruit list. Read the full methodology.",
};

export default async function MethodologyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasActivePlan = false;
  if (user) {
    const { data: ent } = await supabase
      .from("v_my_entitlement")
      .select("plan_code,status")
      .maybeSingle();
    hasActivePlan = !!ent && ent.status === "active";
  }

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
    <div className="bg-white">
      {!user && <MarketingNav isAuthed={false} />}

      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Compass className="h-3.5 w-3.5" />
              Methodology
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
              How to identify target agencies{" "}
              <span className="text-brand-600">by vertical.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              If you&rsquo;ve ever tried to recruit an independent agency from a list of 36,000
              names, you know the problem. Volume doesn&rsquo;t equal fit. The agency with the most
              policies in your appetite isn&rsquo;t the one most likely to write more &mdash; and the
              agency that looks like a specialist is often a carrier captive in disguise.
            </p>
            <p className="mt-4 text-base leading-7 text-gray-700">
              Every agency in the Seven16 directory is scored on three independent signals &mdash;{" "}
              <strong className="text-navy-800">Volume</strong>,{" "}
              <strong className="text-navy-800">Specialization Tier</strong>, and{" "}
              <strong className="text-navy-800">Carrier Diversity</strong> &mdash; so you can stop
              guessing which agencies will actually move when you call.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#three-signals"
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Read the framework
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/verticals"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                See it applied to 12 verticals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============== TL;DR strip ============== */}
      <section className="border-b border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-4 md:grid-cols-3">
            <SignalChip
              icon={BarChart3}
              label="Signal 1"
              title="Volume"
              note="Table stakes — does the agency exist at scale?"
            />
            <SignalChip
              icon={Award}
              label="Signal 2"
              title="Specialization Tier"
              note="How many specialty carriers in this vertical do they hold?"
            />
            <SignalChip
              icon={Layers}
              label="Signal 3"
              title="Carrier Diversity"
              note="Real broker, or a captive program in disguise?"
            />
          </div>
          <p className="mt-6 text-sm leading-6 text-gray-600 max-w-3xl">
            Each signal is useful on its own. Combined, they collapse a 36,000-row directory into
            a recruit list of a few hundred names &mdash; the agencies that already write your
            vertical AND have room for a new appointment.
          </p>
        </div>
      </section>

      {/* ============== THREE SIGNALS ============== */}
      <section id="three-signals" className="relative border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
              <Target className="h-3.5 w-3.5" />
              The three signals &mdash; and why no single one is enough
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
              Each signal answers a different question.
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Volume tells you whether they exist. Specialization Tier tells you what they
              actually write. Carrier Diversity tells you whether they&rsquo;re free to write
              yours. Stop reading after one signal and you end up with the same recruit list every
              other carrier&rsquo;s distribution team is calling.
            </p>
          </div>

          {/* SIGNAL 1 — VOLUME */}
          <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  Signal 1
                </div>
                <h3 className="text-xl font-semibold text-navy-800">Volume &mdash; table stakes, not a thesis</h3>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-gray-700 max-w-3xl">
              <p>
                Every other agency directory ranks by raw policy count. That gets you the seven
                names you already know &mdash; the Acrisures, the USIs, the HUBs, the Marsh
                McLennan Agencies. They write 1,000+ workers&rsquo; comp policies across 40+
                states. Everyone is recruiting them. They have entire teams whose job is to
                evaluate (and slow-walk) carrier appointments.
              </p>
              <p>
                Volume tells you whether the agency exists at scale &mdash; a useful filter,
                nothing more. If you stop here, you&rsquo;re competing for the same 30 names
                every other carrier distribution team is calling this quarter.
              </p>
            </div>
          </div>

          {/* SIGNAL 2 — SPECIALIZATION TIER */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  Signal 2
                </div>
                <h3 className="text-xl font-semibold text-navy-800">Specialization Tier &mdash; what they actually write</h3>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-gray-700 max-w-3xl">
              <p>
                The Specialization Tier is the answer to a sharper question:{" "}
                <em>which carriers does this agency hold appointments with, and how many of them
                are specialists in this vertical?</em>
              </p>
              <p>
                We start by identifying &mdash; for each of our 12 verticals &mdash; which carrier
                parent groups are real specialists in that vertical. A carrier qualifies as
                &ldquo;specialty&rdquo; when its share of policies in that vertical is at least
                <strong> 2x its share of overall workers&rsquo; comp policies</strong>. In other
                words, the carrier over-indexes there.
              </p>
              <p>A few examples of what that produces:</p>
              <ul className="ml-5 list-disc space-y-1.5">
                <li>
                  <strong className="text-navy-800">Construction specialty carriers:</strong>{" "}
                  Builders Mutual, AmeriSafe, ACIG, FRSA Self Insurers Fund, Frank Winston Crum,
                  Builders Insurance Captive, Lion, FCBI.
                </li>
                <li>
                  <strong className="text-navy-800">Transportation specialty carriers:</strong>{" "}
                  Old Republic, Arch, Berkshire Hathaway, AmeriSafe, ICW, Acuity, Argo,
                  Protective Insurance, Safety National, SiriusPoint, Starr, Great American &mdash;
                  19 in total.
                </li>
                <li>
                  <strong className="text-navy-800">Healthcare specialty carriers:</strong>{" "}
                  MAG Mutual, Church Mutual, Selective, The Hanover, The Hartford, Dakota Truck,
                  AIM Mutual, SFM Mutual, United Wisconsin, Ascendant.
                </li>
              </ul>
              <p>
                For each agency, in each vertical, we count how many of those specialty carriers
                they have on their book. The thresholds:
              </p>
            </div>

            {/* TIER TABLE */}
            <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
              <TierTableRow
                tier="Specialist"
                dot="bg-brand-700"
                count="5+"
                meaning="Built a real specialty book in this vertical. Already done the hard work of getting appointed."
                bg="bg-brand-50/60"
                isHeader
              />
              <TierTableRow
                tier="Growing"
                dot="bg-brand-500"
                count="3 – 4"
                meaning="Has a foothold and is investing. Adding a 4th or 5th carrier is on the table."
              />
              <TierTableRow
                tier="Exposure"
                dot="bg-brand-200"
                count="2"
                meaning="Has dipped a toe in. One more strong carrier might convert them."
              />
              <TierTableRow
                tier="—"
                dot="bg-gray-200"
                count="0 – 1"
                meaning="No specialization signal in this vertical."
              />
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-700">
              Specialization Tier is the single most useful filter in the directory. If you write
              a specialty product in Construction, the Specialist agencies in Construction are
              your call list. <strong className="text-navy-800">Not the Top 20 by volume &mdash;
              the Top 20 by Specialist tier.</strong>
            </p>
          </div>

          {/* SIGNAL 3 — CARRIER DIVERSITY */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  Signal 3
                </div>
                <h3 className="text-xl font-semibold text-navy-800">Carrier Diversity &mdash; the captive filter</h3>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-gray-700 max-w-3xl">
              <p>
                Specialization Tier tells you what an agency writes. Carrier Diversity tells you
                whether they&rsquo;re free to write yours.
              </p>
              <p>
                This is where most recruit lists fall apart. An agency can show up with 5+
                specialty carriers in a vertical and look like a Specialist &mdash; but if 91% of
                their book sits with a single carrier, they aren&rsquo;t a broker. They&rsquo;re a
                program agency, a captive arm, or a single-channel MGA. Adding a sixth carrier
                appointment isn&rsquo;t a conversation they&rsquo;re going to have.
              </p>
              <p>
                The Diversity Index is a <strong className="text-navy-800">Shannon-entropy
                measure</strong> &mdash; technical version: normalized entropy across the
                agency&rsquo;s carrier-parent appointments &mdash; that scores how evenly a book
                is distributed.
              </p>
            </div>

            {/* DIVERSITY TABLE */}
            <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
              <DiversityRow
                label="Diversified"
                dot="bg-success-500"
                index="≥ 0.75"
                meaning="Real broker of record. Spreads risk across many carriers."
                implication="Open to new appointments. Recruit target."
                isHeader
              />
              <DiversityRow
                label="Balanced"
                dot="bg-brand-400"
                index="0.45 – 0.75"
                meaning="Multi-carrier shop with 1 – 2 anchors."
                implication="Possible target — depends on appetite gap."
              />
              <DiversityRow
                label="Concentrated"
                dot="bg-gold-500"
                index="< 0.45 with 3+ carriers"
                meaning="Heavy lean on one or two carriers."
                implication="Often a captive program. Verify before calling."
              />
              <DiversityRow
                label="Single-Carrier"
                dot="bg-gray-300"
                index="0 (one carrier only)"
                meaning="Either tiny or a true captive."
                implication="Rarely a recruit target."
              />
            </div>

            {/* Validation cases */}
            <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50/50 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gold-800">
                Patterns the directory reveals you&rsquo;d never spot by name alone
              </div>
              <ul className="mt-3 space-y-2.5 text-sm leading-6 text-gray-700">
                <li className="flex items-baseline gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-gold-700 shrink-0 self-center" />
                  <span>
                    <strong className="text-navy-800">MAG Mutual Insurance Company</strong>{" "}
                    appears as a &ldquo;Medium&rdquo; agency by volume &mdash; until Diversity
                    Class shows{" "}
                    <strong className="text-navy-800">98.6% of its book on MAG Mutual carrier
                    itself</strong>. It&rsquo;s a captive.
                  </span>
                </li>
                <li className="flex items-baseline gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-gold-700 shrink-0 self-center" />
                  <span>
                    <strong className="text-navy-800">RSG Specialty LLC</strong> has 13 carrier
                    appointments and looks diversified &mdash; until you see{" "}
                    <strong className="text-navy-800">91% sits with Everest Re</strong>. It&rsquo;s an MGA
                    program, not a BOR.
                  </span>
                </li>
                <li className="flex items-baseline gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-gold-700 shrink-0 self-center" />
                  <span>
                    <strong className="text-navy-800">Trident Insurance Services LLC</strong> is
                    &ldquo;Large&rdquo; by volume (403 policies, 24 carriers) &mdash; but{" "}
                    <strong className="text-navy-800">73% lives on Argo Group</strong>. It&rsquo;s an
                    Argo program agency.
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                Filter these out, and what&rsquo;s left is the real recruit universe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FIVE RECRUIT PLAYS ============== */}
      <section className="relative border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Crosshair className="h-3.5 w-3.5" />
              How distribution leaders combine the signals
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
              Five recruit plays.
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              The power of the directory isn&rsquo;t any single column &mdash; it&rsquo;s the
              combination. Here&rsquo;s how teams in production use the filters today.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <PlayCard
              num="01"
              icon={Award}
              title="The Specialist BOR — gold tier"
              filter={`Specialization_Tier = "Specialist" AND Diversity_Class IN ("Diversified", "Balanced")`}
              returns="Agencies that have built a specialty book in your vertical AND are real brokers with room for one more carrier."
              when="Launching a new specialty product. Highest-conversion recruit list possible."
            />
            <PlayCard
              num="02"
              icon={Search}
              title="The hidden-gem mid-market sweep"
              filter={`Size_Tier = "Medium" AND Specialization_Tier = "Specialist" AND Vertical_Strength_Index ≥ 3`}
              returns="Regional agencies (50 – 250 policies, 2+ states) that disproportionately write your vertical — the agencies National recruiters miss."
              when="Your competitor has the Top 10 sewn up and you need to find the Top 11 – 100."
            />
            <PlayCard
              num="03"
              icon={MapPin}
              title="The state-by-state expansion list"
              filter={`State = <target> AND Vertical = <target>, sort by Composite_Score desc`}
              returns="Top recruit targets in a specific state for a specific vertical, ordered by a 0 – 100 score that combines volume, concentration, and local market share."
              when="Filing in a new state and need to seed appointments before launch."
            />
            <PlayCard
              num="04"
              icon={Compass}
              title="The local champion finder"
              filter={`Size_Tier = "Small" AND Grade_in_Tier = "A" AND Diversity_Class = "Diversified"`}
              returns="Local agencies (single-state, fewer than 50 policies) that grade A within their tier and run a real BOR book."
              when="Building rural or secondary-market distribution that the Nationals can't service efficiently."
            />
            <PlayCard
              num="05"
              icon={XCircle}
              title="The captive-arm cleanout"
              filter={`Diversity_Class IN ("Concentrated", "Single-Carrier") AND Carrier_Appointments < 5`}
              returns="Agencies you should EXCLUDE from any recruit list, with the carrier they're locked into."
              when="Cleaning a recruit list of noise before sending it to your producer team."
              tone="exclusion"
            />
            <PlayCard
              num="06"
              icon={Filter}
              title="Roll your own"
              filter="Mix-and-match in /build-list — 30+ filterable columns."
              returns="Anything the five named plays don't cover. Composite Score lives on every cell, so you can sort by it after any filter."
              when="You have a niche play the named ones don't capture (e.g., a state-and-vertical-and-tier-and-diversity combo)."
            />
          </div>
        </div>
      </section>

      {/* ============== TRANSPARENCY: 3 BLOCKS ============== */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              How the math is made legible
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
              No black box.
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Three questions that come up every demo &mdash; answered in advance.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <TransparencyBlock
              title="Why we don't rank by premium"
              body={
                <>
                  <p>
                    Two reasons. First, fewer than 20% of accounts in any agency-intelligence
                    database have reliable estimated premium &mdash; ours, AM Best&rsquo;s,
                    S&amp;P&rsquo;s, every wholesaler&rsquo;s internal book. Premium is the most
                    under-reported field in commercial lines. Ranking by premium would mean
                    ranking on a 20% sample dressed up as a 100% measure.
                  </p>
                  <p className="mt-3">
                    Second, premium correlates with vertical, not with recruiting fit. A trucking
                    agency with 50 accounts will outweigh a janitorial agency with 500 on premium
                    &mdash; but the janitorial agency might be the better recruit if your appetite
                    is in services. Policy count, weighted by specialty fit and diversity, is the
                    cleaner signal. Estimated premium is surfaced wherever populated, so
                    dollar-weighted views are layerable.
                  </p>
                </>
              }
            />
            <TransparencyBlock
              title='Why "Acadia" and "Continental Western" are both Berkley'
              body={
                <>
                  <p>
                    A persistent problem in agency intelligence: the same parent group writes
                    business under 8 different brand names.
                  </p>
                  <p className="mt-3">
                    W. R. Berkley alone writes under Acadia, Berkley Insurance Co., Continental
                    Western, Nautilus, Carolina Casualty, Union Standard, Midwest Employers,
                    Preferred Employers, Admiral Insurance &mdash; and that&rsquo;s only the WC/E&amp;S
                    half of their portfolio. If you rank carriers by writing-company name alone,
                    Berkley appears nine times in your Top 100 and never once in your Top 10.
                  </p>
                  <p className="mt-3">
                    Seven16 maps every writing company to its parent group. 400+ writing
                    companies, 60 parent groups. The full mapping is published.
                  </p>
                </>
              }
            />
            <TransparencyBlock
              title="Refresh cadence and methodology"
              body={
                <>
                  <p>
                    The directory refreshes every 30 days from state DOI filings, carrier-published
                    agency lists, and current commercial lines BOR data. When a carrier launches a
                    new program agency, a wholesaler picks up a new appointment, or a Berkley
                    sub-brand is reorganized &mdash; the changes flow through the next refresh.
                  </p>
                  <p className="mt-3">
                    Methodology, scoring weights, exclusion lists, and the carrier-parent rollup
                    are documented in our public docs. Not a black box &mdash; a transparent
                    inventory of what&rsquo;s actually being written, with the math made legible.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-brand-700">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Changelog published every 30 days
                  </div>
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* ============== WHERE TO START ============== */}
      <section className="border-b border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
              Where to start.
            </h2>
            <p className="mt-3 text-base leading-7 text-gray-600">
              Three on-ramps if you&rsquo;ve never used the directory before.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StepCard
              num="01"
              title="Pick your vertical."
              body="Open the verticals page. Click into the one closest to your appetite."
              href="/verticals"
              cta="Go to verticals"
            />
            <StepCard
              num="02"
              title="Filter to Specialist + Diversified."
              body="Your first call list — agencies who already write in your vertical AND have room for new appointments."
              href={hasActivePlan ? "/build-list" : "/sign-up"}
              cta={hasActivePlan ? "Open Build a List" : "Get instant access"}
            />
            <StepCard
              num="03"
              title="Sort by Composite Score."
              body="The top 25 names are the highest-fit recruit targets in the country for that vertical. State filter for regional plays; pivot to Mediums + Vertical Strength Index ≥ 3 for the hidden-gem sweep."
              href={hasActivePlan ? "/build-list" : "/sign-up"}
              cta={hasActivePlan ? "Build your list" : "Sign up free"}
            />
          </div>

          <p className="mt-10 max-w-3xl text-sm italic leading-7 text-gray-600">
            The point of the directory isn&rsquo;t to find more agents. It&rsquo;s to find{" "}
            <strong className="not-italic text-navy-800">the right agents</strong> &mdash; the ones
            whose book, carrier mix, and growth posture predict that they&rsquo;ll actually answer
            when you call. That&rsquo;s the work.
          </p>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-brand-700">
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stop ranking by name. Start ranking by appointment behavior.
          </h2>
          <p className="mt-4 text-lg text-brand-100 max-w-2xl mx-auto">
            Three signals, twelve verticals, monthly refresh, public methodology. Pull a verified
            list in under a minute.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {hasActivePlan ? (
              <>
                <Link
                  href="/build-list"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
                >
                  Build a list
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/verticals"
                  className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 inline-flex items-center gap-2"
                >
                  Browse verticals
                </Link>
              </>
            ) : user ? (
              <>
                <Link
                  href="/#pricing"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
                >
                  See pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:hello@seven16group.com?subject=Methodology%20demo%20%E2%80%94%20Seven16"
                  className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 inline-flex items-center gap-2"
                >
                  Talk to sales
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
                >
                  Get instant access
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/verticals"
                  className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 inline-flex items-center gap-2"
                >
                  Browse verticals
                </Link>
              </>
            )}
          </div>
          <p className="mt-8 text-xs text-brand-200">
            Methodology, scoring weights, and exclusion lists published. Refreshed every 30 days.
          </p>
        </div>
      </section>
    </div>
  );

  if (sidebarProps) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar {...sidebarProps} />
        <div className="flex-1 min-w-0 overflow-x-hidden">{body}</div>
      </div>
    );
  }

  return body;
}

// ============================================================================
// Components
// ============================================================================

function SignalChip({
  icon: Icon,
  label,
  title,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
            {label}
          </div>
          <div className="text-sm font-semibold text-navy-800">{title}</div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-gray-600">{note}</p>
    </div>
  );
}

function TierTableRow({
  tier,
  dot,
  count,
  meaning,
  bg,
  isHeader,
}: {
  tier: string;
  dot: string;
  count: string;
  meaning: string;
  bg?: string;
  isHeader?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-12 gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 ${
        bg ?? "bg-white"
      }`}
    >
      <div className="col-span-4 flex items-center gap-2 sm:col-span-3">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
        <span
          className={`text-sm ${
            isHeader ? "font-semibold text-navy-800" : "font-medium text-gray-800"
          }`}
        >
          {tier}
        </span>
      </div>
      <div className="col-span-3 text-sm tabular-nums text-gray-700 sm:col-span-2">{count}</div>
      <div className="col-span-5 text-xs leading-5 text-gray-600 sm:col-span-7">{meaning}</div>
    </div>
  );
}

function DiversityRow({
  label,
  dot,
  index,
  meaning,
  implication,
  isHeader,
}: {
  label: string;
  dot: string;
  index: string;
  meaning: string;
  implication: string;
  isHeader?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-12 gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 ${
        isHeader ? "bg-success-50/40" : "bg-white"
      }`}
    >
      <div className="col-span-4 flex items-center gap-2 sm:col-span-3">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
        <span
          className={`text-sm ${
            isHeader ? "font-semibold text-navy-800" : "font-medium text-gray-800"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="col-span-3 text-xs font-mono tabular-nums text-gray-600 sm:col-span-2">
        {index}
      </div>
      <div className="col-span-5 text-xs leading-5 text-gray-600 sm:col-span-4">{meaning}</div>
      <div className="col-span-12 text-xs leading-5 text-brand-700 sm:col-span-3">{implication}</div>
    </div>
  );
}

function PlayCard({
  num,
  icon: Icon,
  title,
  filter,
  returns,
  when,
  tone,
}: {
  num: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  filter: string;
  returns: string;
  when: string;
  tone?: "exclusion";
}) {
  const accent =
    tone === "exclusion"
      ? "bg-gold-50 text-gold-800 border-gold-100"
      : "bg-brand-50 text-brand-700 border-brand-100";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent.split(" ").slice(0, 2).join(" ")}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-mono text-xs font-semibold text-gray-300">{num}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy-800">{title}</h3>
      <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-[11px] leading-5 text-gray-700">
        {filter}
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Returns
          </div>
          <p className="mt-0.5">{returns}</p>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Use when
          </div>
          <p className="mt-0.5">{when}</p>
        </div>
      </div>
    </div>
  );
}

function TransparencyBlock({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-navy-800">{title}</h3>
      <div className="mt-3 space-y-2 text-sm leading-6 text-gray-600">{body}</div>
    </div>
  );
}

function StepCard({
  num,
  title,
  body,
  href,
  cta,
}: {
  num: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="font-mono text-xs font-semibold text-brand-700">{num}</div>
      <h3 className="mt-2 text-base font-semibold text-navy-800">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
