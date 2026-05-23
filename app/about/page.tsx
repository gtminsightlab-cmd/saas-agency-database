import Link from "next/link";
import { ArrowRight, ShieldCheck, GitMerge, Lock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About — Agency Signal",
  description:
    "Agency Signal is built from the distribution desk. Operator-led, category-positioned, open-methodology. Why appointment intelligence is the right starting point for commercial-insurance distribution.",
};

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="bg-white">
      <MarketingHeader isAuthed={!!user} />
      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.18),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-blue-200">
              About Agency Signal
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3rem] lg:leading-[1.1]">
              Built from the distribution desk.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Agency Signal was not built in a conference room by people guessing how
              commercial-insurance distribution works. It was built downstream of two decades of
              operator work &mdash; recruiting agencies, launching programs, managing carrier
              relationships, rebuilding territories, standing up producer scorecards, and
              carrying the pressure that comes with a premium plan.
            </p>
          </div>
        </section>

        {/* ===== THE WORK IS FAMILIAR ===== */}
        <section className="border-b border-slate-200 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              The work is familiar
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              You need new agency partners, but not every agency is worth appointing.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              <p>
                You need submission flow, but not bad flow. You need access to specialists, but
                their websites do not tell the full story. You need to know who writes your kind
                of business before your team spends another quarter chasing names.
              </p>
              <p>
                That is why Agency Signal starts with the appointment. Because in commercial
                insurance, the carrier paper an agency holds tells you more than a job title
                ever will.
              </p>
            </div>
          </div>
        </section>

        {/* ===== WHY OPERATOR-BUILT ===== */}
        <section className="border-b border-slate-200 bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Operator-built, plainspoken
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                Most insurance technology is built for the cleanest workflows.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                But commercial insurance is not clean. It is branch offices, clusters, producer
                relationships, market access, appetite shifts, acquisition noise, stale
                spreadsheets, and the constant pressure to grow without feeding underwriting bad
                flow.
              </p>
              <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                Agency Signal was built for that world. Not the slide-deck version of
                distribution. The real one.
              </p>
            </div>
          </div>
        </section>

        {/* ===== WHAT'S LOCKED (anti-promises) ===== */}
        <section className="border-b border-slate-200 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                What we won&rsquo;t do
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
                The architectural commitments.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Operator-built means the constraints are stated up front, not buried in a
                pricing page or an SLA.
              </p>
            </div>

            <ul className="mt-12 grid gap-5 sm:grid-cols-2">
              <Anti
                icon={ShieldCheck}
                title="No underwriting decisions."
                body="Agency Signal surfaces the data &mdash; appointments, vertical signal, carrier diversity, freshness. Whether to bind a risk, what terms, what coverage stays with the carrier and the licensed agent. The line is hard."
              />
              <Anti
                icon={GitMerge}
                title="No competitor name-calling."
                body="We compete on substance, not on naming the categories adjacent to us. The list-broker / contact-data / marketplace / submission-marketplace categories exist; we&rsquo;re a different category. Category-level framing only."
              />
              <Anti
                icon={Lock}
                title="No invented metrics."
                body="Pre-revenue. We don&rsquo;t publish customer counts, premium-scaled-through-platform claims, retention numbers, or testimonial-style social proof until they&rsquo;re real and verifiable."
              />
              <Anti
                icon={AlertTriangle}
                title="No black-box scoring."
                body="The Agency Recruit Score formula, the writing-company-to-parent-group rollup, the refresh cadence, and the verified-as-of date model are all documented openly at /methodology."
              />
            </ul>
          </div>
        </section>

        {/* ===== FAMILY CONTEXT ===== */}
        <section className="border-b border-slate-200 bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Agency Signal in context
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              One expression of an operator-led system.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              <p>
                Agency Signal is part of the Seven16 Group operating system. The family also
                covers <span className="font-semibold text-navy-900">DOT Intel</span> (commercial
                trucking carrier intelligence, FMCSA / CSA risk data),{" "}
                <span className="font-semibold text-navy-900">DotCarriers</span> and{" "}
                <span className="font-semibold text-navy-900">DotAgencies</span> (trucking-side
                directory + alerts), and{" "}
                <span className="font-semibold text-navy-900">Bindlab</span> (wholesale and MGA
                operating software).
              </p>
              <p>
                If your need spans agency intelligence + trucking-carrier intelligence, or
                distribution data + submission-management software, the family covers both.{" "}
                <Link
                  href="https://partners.seven16group.com/apply"
                  className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
                >
                  One partner application
                </Link>{" "}
                covers every product.
              </p>
            </div>
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
              Read the methodology before you buy.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
              That&rsquo;s how operator-built products work. Look at how the data is collected,
              normalized, scored, and refreshed &mdash; then decide whether the signal is useful
              before committing to a campaign.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Read the methodology
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={user ? "/build-list" : "/sign-up"}
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                {user ? "Open your dashboard" : "Browse agencies free"}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function Anti({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-6">
      <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
        <p
          className="mt-1.5 text-sm leading-6 text-slate-700"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </li>
  );
}
