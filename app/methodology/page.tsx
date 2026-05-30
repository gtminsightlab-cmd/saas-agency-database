import { BarChart3, Layers, Award, ShieldCheck, AlertTriangle, XCircle, RefreshCw, Database, Network, CheckCircle2, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Sidebar } from "@/components/app/sidebar";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { ThreeSignalsMockup } from "@/components/marketing/ThreeSignalsMockup";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "How we score agencies — Methodology | Seven16 Intel",
  description:
    "Three independent signals — Volume, Specialization Tier, and Carrier Diversity — turn a 36,000-name agency list into a defensible recruit list. Read the full methodology, ingredients, scoring definitions, and anti-claims.",
};

const PIPELINE_STEPS = [
  { icon: Database,    label: "Source",                description: "State DOI filings + carrier-published agency lists + verified web/LinkedIn enrichment. No bot scrape; no purchased lookalike data." },
  { icon: RefreshCw,   label: "Normalize",             description: "De-dupe agency entities across state filings, reconcile location-vs-parent records, standardize carrier names against a canonical roster." },
  { icon: Network,     label: "Map parent/child",      description: "400+ child writing companies mapped back to ~60 parent groups so the appointment list reads as a book-of-business inventory, not a wall of brand names." },
  { icon: BarChart3,   label: "Score specialization",  description: "Per-agency Specialization Tier computed against the curated specialty-carrier roster for each vertical. Tiers: Exposure (2 carriers), Growing (3+), Specialist (5+)." },
  { icon: CheckCircle2, label: "Verify contacts",      description: "Producers + branch managers + presidents validated via dual-agent verification pipeline. 85.6% verified email rate across 135K+ contacts." },
  { icon: Download,    label: "Export",                description: "Filtered list exported on demand with verified emails, mobiles, LinkedIn URLs, agency websites. Refreshed monthly against state filings." },
];

const SCORING = [
  {
    title: "Specialization Tier",
    definition: "Per-agency, per-vertical tier reflecting how many specialty carriers in that vertical the agency holds appointments with.",
    levels: [
      { label: "Exposure", value: "2 specialty carriers in the vertical" },
      { label: "Growing", value: "3+ specialty carriers" },
      { label: "Specialist", value: "5+ specialty carriers — proven vertical book" },
    ],
  },
  {
    title: "Diversity Index",
    definition: "Carrier breadth across the agency's full appointment list. Distinguishes captive shops (1-2 carriers) from independent agencies (10+ carriers).",
    levels: [
      { label: "Concentrated", value: "1–3 carriers (often captive or program-shop)" },
      { label: "Standard", value: "4–9 carriers" },
      { label: "Broad", value: "10+ carriers (independent multi-line)" },
    ],
  },
  {
    title: "Composite Score",
    definition: "Combination of Volume (raw appointment count), Specialization Tier (vertical depth), and Diversity Index (carrier breadth). Used to rank-sort recruit lists.",
    levels: [
      { label: "Volume signal", value: "Raw count of carriers + total policy-binding capacity" },
      { label: "Specialization signal", value: "Vertical-specific tier weight" },
      { label: "Diversity signal", value: "Independence multiplier (captive penalty)" },
    ],
  },
  {
    title: "Verified Appointment",
    definition: "Carrier appointment confirmed via at least two independent sources: state DOI filing + carrier-published roster, OR state DOI filing + agency's own public attestation.",
    levels: [
      { label: "Sources required", value: "≥2 independent confirmations" },
      { label: "Refresh cadence", value: "Monthly re-verification" },
      { label: "Stale flag", value: "Surfaced when >60 days since last confirmation" },
    ],
  },
];

const ANTI_CLAIMS = [
  {
    icon: XCircle,
    title: "Not a carrier appointment guarantee",
    body: "A 'Verified Appointment' means we've confirmed the relationship existed within the verification window. It is not a promise the agency will accept your producer agreement, bind your appetite, or maintain appointment status with the carrier going forward.",
  },
  {
    icon: XCircle,
    title: "Not underwriting advice",
    body: "Specialization Tier reflects observable appointment behavior — not risk-quality assessment, underwriting approval, or carrier appetite alignment with your specific program. Your underwriters still make the appetite call.",
  },
  {
    icon: XCircle,
    title: "Not a scraped spam list",
    body: "Contacts are validated via dual-agent verification (web + LinkedIn + carrier-published) and refreshed monthly. We do not bulk-scrape, do not purchase third-party contact lists, and explicitly exclude consumer-data sources from the directory.",
  },
  {
    icon: XCircle,
    title: "Not a substitute for producer judgment",
    body: "The methodology produces a recruit list, not a close. Your producers still need to read the agency, run the conversation, and earn the appointment. Seven16 Intel is a better starting list — not an autopilot.",
  },
];

export default async function MethodologyPage() {
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
        eyebrow="Methodology"
        title="How the signal is built."
        highlight="Open scoring. No black box."
        description="Every agency in the directory is scored on three independent signals — Volume, Specialization Tier, and Carrier Diversity — so you can stop guessing which agencies will actually move when you call. The carrier list per vertical, the scoring thresholds, and the verification cadence are all published here. The IP is the assembly of the data, not a secret algorithm."
        primaryCta={{ label: "See it applied to 12 verticals", href: "/verticals" }}
        secondaryCta={{ label: user ? "Open the app" : "Browse the directory free", href: user ? "/build-list" : "/sign-up" }}
        rightRail={<ThreeSignalsMockup />}
      />

      <Section
        variant="light"
        eyebrow="The data pipeline"
        title="From state filings to a verified recruit list."
        description="Six steps. Source → Normalize → Map parent/child → Score → Verify → Export. Each step is observable, auditable, and re-runnable. We rebuild the pipeline against the latest state filings every month."
      >
        <ol className="space-y-4">
          {PIPELINE_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.label} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[80px_56px_1fr]">
                <div className="text-sm font-black text-teal-700">Step {String(index + 1).padStart(2, "0")}</div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal-50">
                  <Icon className="h-5 w-5 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">{step.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section
        variant="muted"
        eyebrow="Scoring definitions"
        title="Four columns the recruit list ranks on."
        description="Every score below has a published formula. Use these definitions when briefing a new BDM, handing off a list to a producer team, or evaluating whether the methodology fits your appetite."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {SCORING.map((s) => (
            <article key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-950">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{s.definition}</p>
              <div className="mt-4 space-y-2">
                {s.levels.map((l) => (
                  <div key={l.label} className="grid grid-cols-[120px_1fr] gap-3 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="text-[11px] font-black uppercase tracking-[0.14em] text-teal-700 self-center">{l.label}</div>
                    <div className="text-xs leading-5 text-slate-700">{l.value}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="Anti-claims"
        title="What this methodology does not promise."
        description="The discipline of a defensible methodology is being honest about what it does NOT do. Four anti-claims, written up front so nobody has a surprise conversation downstream."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {ANTI_CLAIMS.map((c) => {
            const Icon = c.icon;
            return (
              <article key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-base font-black text-slate-950">{c.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{c.body}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm leading-6 text-amber-900">
            <span className="font-black">If the methodology produces a number you disagree with on a specific agency,</span>{" "}
            email us. The carrier mapping per vertical is a living document maintained by working underwriters. Real-world feedback from buyers running the recruit list against their producer team is how the mapping improves.
          </div>
        </div>
      </Section>

      <CTASection
        eyebrow="From doctrine to product"
        title="See the methodology applied to 12 verticals."
        description="Every vertical card on /verticals is this framework in production. Specialty carrier list, agency counts by tier, refresh cadence — all visible per vertical."
        primaryCta={{ label: "Open the 12 verticals", href: "/verticals" }}
        secondaryCta={{ label: user ? "Open the app" : "Browse the directory free", href: user ? "/build-list" : "/sign-up" }}
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
