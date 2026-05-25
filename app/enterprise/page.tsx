import { Check, Map, Layers, ShieldCheck, Users, Building2, Mail, Settings, FileSpreadsheet, Lock } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/layout/CTASection";
import { DataPanel } from "@/components/marketing/DataPanel";

export const dynamic = "force-dynamic";

const CAPABILITIES = [
  {
    icon: Users,
    title: "Team workflows",
    body: "Shared recruit lists, saved search collaboration across BDMs, organization-level snapshots of distribution activity. Producers, branch managers, and VPs see the same data without sending CSVs to each other.",
  },
  {
    icon: Lock,
    title: "Seat governance",
    body: "Add and revoke seats from your Team page without billing friction. Per-user audit log on every export. Annual contract terms include team-seat growth without renegotiation.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export controls",
    body: "Per-tenant export limits, watermarked CSVs, optional approval flows on large extracts. Distribution leadership controls what leaves the org and who can pull it.",
  },
  {
    icon: Layers,
    title: "Custom data views",
    body: "Filter combinations saved per-team, per-territory, per-program. Map your appetite definitions into reusable views so new BDMs inherit institutional knowledge.",
  },
  {
    icon: Settings,
    title: "Onboarding + support",
    body: "Named account manager, 30–90 day pilot window with real data scoped to your states, structured onboarding inside two business weeks, SSO via SAML/OIDC.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance posture",
    body: "SOC 2 readiness, audit log on every action, data residency in us-east-1 (Supabase Pro + PITR enabled), per-tenant data isolation enforced at the row-level via RLS.",
  },
];

const EXPECT = [
  { icon: Users, n: "01", title: "30-minute scoped demo", body: "We walk your team through Agency Signal with real data scoped to the states you're evaluating. No script — bring the carrier names you care about; we'll show you who holds the paper." },
  { icon: Building2, n: "02", title: "Pilot evaluation", body: "Two- to four-week sandboxed pilot with a short list of seats. You operate against real data; we instrument what you actually use. Determines the right state mix and seat count." },
  { icon: Mail, n: "03", title: "Contract + onboarding", body: "Annual contract with state mix locked for the term, mid-term changes available at a $500 admin fee, renewal mechanics built around your appointment cadence. Onboarding inside two business weeks." },
];

export default async function EnterprisePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <MarketingHeader isAuthed={!!user} theme="dark" />

      <PageHero
        variant="dark"
        eyebrow="Enterprise+ · Distribution Suite"
        title="Distribution intelligence for teams with territory,"
        highlight="appetite, and recruiting complexity."
        description="The Producer and Growth tiers are how individual agents bind more accounts — sub-$500 P-card self-serve. Enterprise+ is a different category entirely — the annual contract that gives a VP of Distribution, an MGA, a wholesaler, or a carrier the full agency footprint of every state they operate in, with the team governance and controls to deploy it at scale."
        primaryCta={{ label: "Talk enterprise fit", href: "mailto:hello@seven16group.com?subject=Enterprise%2B%20demo%20request" }}
        secondaryCta={{ label: "Read the methodology", href: "/methodology" }}
        rightRail={
          <DataPanel
            eyebrow="Enterprise+ terms"
            title="What the annual contract looks like"
            rows={[
              { label: "Contract", value: "Annual, demo-led" },
              { label: "Per-state pricing", value: "$1,000–$2,000/state" },
              { label: "All-50 ceiling", value: "$12,500/year (D-015 anchor)" },
              { label: "Seat model", value: "Org-wide, included" },
              { label: "Outcome layer", value: "Distribution+ optional" },
              { label: "Eval window", value: "30–90 day pilot" },
            ]}
            badges={["SOC 2 path", "SSO included", "RLS-isolated"]}
            footer="Full per-state pricing detail, bundle ladder, and Distribution+ outcome SKU mechanics are walked through in the demo. Buyer = VP of Distribution / Director of Producer Development at MGAs, wholesalers, carriers, aggregators, and insurtechs."
          />
        }
      />

      <Section
        variant="light"
        eyebrow="Who this is for"
        title="A different buyer than the self-serve tiers."
        description="The published Producer and Growth tiers are designed for the individual agent who can expense the cost on a P-card and start prospecting the same day. Enterprise+ is for distribution teams growing producer footprint, recruiting an appointment book, expanding into new states, or pressure-testing the market for a new program. The KPI isn't accounts bound — it's agents appointed."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Self-serve tiers</div>
            <h3 className="mt-2 text-lg font-black text-slate-950">Producer / Growth</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" /><span>Individual agent · per-seat · monthly</span></li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" /><span>Current rates surfaced at sign-up</span></li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" /><span>P-card expense, sign up online, start same session</span></li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" /><span>Credits + top-up slider for heavy users</span></li>
            </ul>
          </article>
          <article className="rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-md">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Annual contract</div>
            <h3 className="mt-2 text-lg font-black text-slate-950">Enterprise+</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" /><span>Org-wide · team seats included · annual</span></li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" /><span>Per-state pricing $1,000–$2,000 · all-50 ceiling $12,500</span></li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" /><span>Demo-led, procurement-routed, contract-anchored</span></li>
              <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" /><span>Distribution+ outcome SKU available on contract</span></li>
            </ul>
          </article>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="Capabilities"
        title="Six things you get on the annual contract that you don't get on self-serve."
        description="Enterprise+ is not the same product with a bigger seat count. It's the product configured for distribution leadership — team-scale workflows, governance, controls, and support."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <article key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal-50">
                  <Icon className="h-5 w-5 text-teal-700" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-950">{c.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{c.body}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        variant="light"
        eyebrow="Pricing in summary"
        title="Pick the states you operate in. Or take the whole country at the ceiling."
        description="State pricing anchors on the verified-contact density inside the state — high-density states are Tier 1 ($2,000/yr), mid-density Tier 2 ($1,500/yr), lower-density Tier 3 ($1,000/yr). Three territorial add-ons (AK, DC, HI) are bundled free. The all-50 ceiling is $12,500/year — full national coverage, including overflow protection that mathematically cannot exceed the ceiling."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Tier 1 · High density</div>
            <div className="mt-3 text-2xl font-black tracking-[-0.02em] text-slate-950">$2,000<span className="text-base font-normal text-slate-500">/state/yr</span></div>
            <p className="mt-2 text-sm text-slate-600">≥5,000 verified email contacts per state.</p>
            <p className="mt-3 text-xs text-slate-500">5 states: CA · MI · NY · OH · PA</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Tier 2 · Mid density</div>
            <div className="mt-3 text-2xl font-black tracking-[-0.02em] text-slate-950">$1,500<span className="text-base font-normal text-slate-500">/state/yr</span></div>
            <p className="mt-2 text-sm text-slate-600">2,000–4,999 verified email contacts per state.</p>
            <p className="mt-3 text-xs text-slate-500">15 states including TX · FL · IL · NJ</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Tier 3 · Lower density</div>
            <div className="mt-3 text-2xl font-black tracking-[-0.02em] text-slate-950">$1,000<span className="text-base font-normal text-slate-500">/state/yr</span></div>
            <p className="mt-2 text-sm text-slate-600">&lt;2,000 verified email contacts per state.</p>
            <p className="mt-3 text-xs text-slate-500">28 states including AZ · KS · TN · WV</p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 flex items-start gap-4">
          <Map className="h-5 w-5 text-teal-700 mt-0.5 shrink-0" />
          <div className="text-sm text-teal-900">
            <span className="font-black">Bundle ladder:</span> 1–4 states at full tier price · 5–9 states at 15% off · 10–24 states at 30% off · 25–49 states flat at $9,500/yr · all-50 + territorial add-ons flat at $12,500/yr.
            <span className="block mt-1 text-xs text-teal-700">Full ladder + overflow-protection math walked through in the demo. You never pay more than $12,500 for Agency Signal Enterprise+.</span>
          </div>
        </div>
      </Section>

      <Section
        variant="dark"
        eyebrow="Distribution+ outcome SKU"
        title="Pay for the appointments closed, not the data accessed."
        description="Distribution+ is the success-fee layer available on top of any Enterprise+ contract. $300–$500 per qualified appointment, defined at contract time — typically: agent meets your appetite criteria, signs your producer agreement, binds first policy within 90 days of introduction. Monthly attribution dashboard, auditable, structured for the contract conversation."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
            <h3 className="text-lg font-black text-white">Why this works for you</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li className="flex gap-2"><span className="text-cyan-300">✓</span><span>Vendor incentive aligned with your actual KPI — agents appointed, not data accessed</span></li>
              <li className="flex gap-2"><span className="text-cyan-300">✓</span><span>If we're not generating real appointments, we're not getting paid — and we'll know first</span></li>
              <li className="flex gap-2"><span className="text-cyan-300">✓</span><span>A single qualified appointment is worth $50,000+ in lifetime premium to an MGA; $400 per appointment is a rounding error to the buyer</span></li>
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
            <h3 className="text-lg font-black text-white">Why legacy vendors can't offer this</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li className="flex gap-2"><span className="text-cyan-300">✓</span><span>Their cost model relies on predictable annual revenue per customer; success-fee pricing would force a business restructure</span></li>
              <li className="flex gap-2"><span className="text-cyan-300">✓</span><span>Our infrastructure is lean enough that the unit economics work at 100 appointments/year and up</span></li>
              <li className="flex gap-2"><span className="text-cyan-300">✓</span><span>The outcome SKU is contract-time configurable — qualification standard, attribution window, and rate all defined per buyer</span></li>
            </ul>
          </article>
        </div>
      </Section>

      <Section
        variant="muted"
        eyebrow="What to expect"
        title="From inquiry to onboarded inside ~30 days."
        description="Enterprise+ doesn't have a self-serve checkout. There's no path where you click a button and end up with a $12,500 annual contract on the other side. We do this the way Distribution Expanders actually buy software."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {EXPECT.map((e) => {
            const Icon = e.icon;
            return (
              <article key={e.n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-teal-700" />
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Step {e.n}</span>
                </div>
                <h3 className="mt-3 text-lg font-black text-slate-950">{e.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{e.body}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <CTASection
        eyebrow="Distribution intelligence at scale"
        title="Ready to see the directory at distribution-leader scale?"
        description="Send us a note. Tell us which states you operate in, whether Distribution+ outcome pricing is in scope, and when you'd like to walk the data together. We'll come back inside one business day."
        primaryCta={{ label: "Talk enterprise fit", href: "mailto:hello@seven16group.com?subject=Enterprise%2B%20demo%20request" }}
        secondaryCta={{ label: "Read the methodology first", href: "/methodology" }}
      />
    </div>
  );
}
