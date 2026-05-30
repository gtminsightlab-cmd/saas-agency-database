import Link from "next/link";
import {
  BookOpen,
  Compass,
  Crown,
  Layers,
  Megaphone,
  Network,
  ScrollText,
  Sparkles,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import {
  PRODUCT_OVERVIEW,
  FAB_MATRIX,
  PROBLEMS_SOLVED,
  ICP,
  COMPETITIVE_ADVANTAGES,
  FAMILY_PRODUCTS,
  FAMILY_FIT_NARRATIVE,
  LEVELING_THE_FIELD,
  COMBINED_FAMILY_NARRATIVE,
  SALES_NARRATIVE,
  ADMIN_USEFULNESS,
} from "@/lib/admin/product-positioning";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Product Positioning — Control Room",
  robots: { index: false, follow: false },
};

/**
 * /admin/product-positioning — internal doctrine page for Agency Signal.
 *
 * All copy lives in `lib/admin/product-positioning.ts`. Edit content there.
 * The layout below renders the config — do NOT inline new strings here.
 *
 * RBAC: protected by app/admin/layout.tsx (is_super_admin() RPC). No
 * additional check required.
 */
export default function ProductPositioningPage() {
  return (
    <div className="space-y-10">
      {/* Page header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-admin-text-dim">Internal doctrine</div>
          <h1 className="mt-1 text-2xl font-semibold text-admin-text">Product Positioning</h1>
          <p className="mt-2 max-w-3xl text-sm text-admin-text-mute">
            Canonical narrative for {PRODUCT_OVERVIEW.productName} — what it is, who it serves, why it
            matters, and how it fits the Seven16 Group family. Single source of truth for sales, support,
            onboarding, product, AI-agent training, and marketing copy reuse. Edit{" "}
            <code className="rounded bg-admin-surface-2 px-1.5 py-0.5 text-[11px] text-admin-text">
              lib/admin/product-positioning.ts
            </code>{" "}
            to update.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1 text-right">
          <span className="inline-flex items-center gap-2 rounded-md border border-admin-border-2 bg-admin-surface px-2.5 py-1.5 text-xs text-admin-text-mute">
            <Compass className="h-3.5 w-3.5 text-admin-accent" />
            {PRODUCT_OVERVIEW.domain}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-admin-text-dim">
            Doctrine anchors: D-004 · D-023 · D-034
          </span>
        </div>
      </header>

      {/* Section 1 — Overview */}
      <Section
        index="01"
        title="Product Overview"
        subtitle="What the product believes it is. Read first."
        icon={Compass}
      >
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card title="Elevator" subtitle={PRODUCT_OVERVIEW.oneLiner}>
            <div className="space-y-3 text-sm leading-6 text-admin-text">
              {PRODUCT_OVERVIEW.elevator.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="mt-5 border-t border-admin-border-2 pt-4">
              <div className="text-[11px] uppercase tracking-wider text-admin-text-dim mb-1">
                Working definition
              </div>
              <p className="text-sm leading-6 text-admin-text">{PRODUCT_OVERVIEW.whatItBelievesItIs}</p>
            </div>
          </Card>
          <Card title="What it is NOT" subtitle="Use these as scope-discipline guardrails.">
            <ul className="space-y-2 text-sm leading-6 text-admin-text">
              {PRODUCT_OVERVIEW.whatItIsNot.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-admin-warn" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* Section 2 — FAB matrix */}
      <Section
        index="02"
        title="Features, Advantages, Benefits"
        subtitle="FAB matrix. Pain language stays specific — vague pain is a slop tell."
        icon={Layers}
      >
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-surface-2 text-[10px] uppercase tracking-wider text-admin-text-dim">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Feature</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Advantage</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Benefit</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">User pain solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border-2">
                {FAB_MATRIX.map((row) => (
                  <tr key={row.feature} className="align-top">
                    <th scope="row" className="px-4 py-3 font-semibold text-admin-text">
                      {row.feature}
                    </th>
                    <td className="px-4 py-3 text-admin-text-mute">{row.advantage}</td>
                    <td className="px-4 py-3 text-admin-text">{row.benefit}</td>
                    <td className="px-4 py-3 text-admin-text-mute italic">&ldquo;{row.pain}&rdquo;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      {/* Section 3 — Problems Solved */}
      <Section
        index="03"
        title="Problems This Product Solves"
        subtitle="By persona. Use these as the qualifying questions on a first call."
        icon={Target}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {PROBLEMS_SOLVED.map((p) => (
            <Card key={p.persona} title={p.persona}>
              <div className="text-[11px] uppercase tracking-wider text-admin-text-dim mb-1">Problem</div>
              <p className="text-sm leading-6 text-admin-text-mute">{p.problem}</p>
              <div className="mt-3 text-[11px] uppercase tracking-wider text-admin-accent mb-1">
                Agency Signal answer
              </div>
              <p className="text-sm leading-6 text-admin-text">{p.agencySignalAnswer}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Section 4 — ICP */}
      <Section
        index="04"
        title="Ideal Customer Profile"
        subtitle="Who this is for. Update primary/secondary when the buyer mix shifts."
        icon={Users}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Primary ICP">
            <p className="text-sm leading-6 text-admin-text">{ICP.primary}</p>
          </Card>
          <Card title="Secondary ICP">
            <p className="text-sm leading-6 text-admin-text">{ICP.secondary}</p>
          </Card>
          <KvCard label="Buyer type" value={ICP.buyerType} />
          <KvCard label="User type" value={ICP.userType} />
          <KvCard label="Budget reality" value={ICP.budgetReality} className="md:col-span-2" />
          <Card title="Trigger events">
            <List items={ICP.triggerEvents} tone="accent" />
          </Card>
          <Card title="Success outcomes">
            <List items={ICP.successOutcomes} tone="accent" />
          </Card>
          <Card title="Common objections" className="md:col-span-2">
            <List items={ICP.commonObjections} tone="warn" />
          </Card>
        </div>
      </Section>

      {/* Section 5 — Competitive Advantages */}
      <Section
        index="05"
        title="Competitive Advantages"
        subtitle="Honest claims. No 'revolutionary' / 'best-in-class' / 'AI-powered' language."
        icon={ShieldCheck}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {COMPETITIVE_ADVANTAGES.map((adv) => (
            <Card key={adv.heading} title={adv.heading}>
              <p className="text-sm leading-6 text-admin-text-mute">{adv.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Section 6 — Seven16 Group Family Fit */}
      <Section
        index="06"
        title="Seven16 Group Family Fit"
        subtitle="Where Agency Signal sits inside the broader family."
        icon={Network}
      >
        <div className="space-y-4">
          <Card>
            <div className="space-y-3 text-sm leading-6 text-admin-text">
              {FAMILY_FIT_NARRATIVE.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Card>
          <Card title="Family roster">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-admin-surface-2 text-[10px] uppercase tracking-wider text-admin-text-dim">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Product</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Domain</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Role</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border-2">
                  {FAMILY_PRODUCTS.map((p) => {
                    const isSelf = p.name === PRODUCT_OVERVIEW.productName;
                    return (
                      <tr key={p.name} className={isSelf ? "bg-admin-accent/5" : undefined}>
                        <th scope="row" className="px-4 py-2.5 font-semibold text-admin-text">
                          <span className="inline-flex items-center gap-2">
                            {p.name}
                            {isSelf && (
                              <span className="rounded bg-admin-accent/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-admin-accent">
                                This product
                              </span>
                            )}
                          </span>
                        </th>
                        <td className="px-4 py-2.5 font-mono text-xs text-admin-text-mute">{p.url}</td>
                        <td className="px-4 py-2.5 text-admin-text-mute">{p.role}</td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </Section>

      {/* Section 7 — Leveling the Playing Field */}
      <Section
        index="07"
        title="Leveling the Playing Field"
        subtitle="How Agency Signal serves newer agents, niche builders, and under-resourced producers."
        icon={Crown}
      >
        <div className="space-y-4">
          <Card>
            <p className="text-sm leading-6 text-admin-text">{LEVELING_THE_FIELD.thesis}</p>
          </Card>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {LEVELING_THE_FIELD.proofPoints.map((pt) => (
              <Card key={pt.title} title={pt.title}>
                <p className="text-sm leading-6 text-admin-text-mute">{pt.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Section 8 — Combined Family Narrative */}
      <Section
        index="08"
        title="Combined Family-of-Products Narrative"
        subtitle="What the operator gets when they run Agency Signal alongside the rest of the family."
        icon={Sparkles}
      >
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-surface-2 text-[10px] uppercase tracking-wider text-admin-text-dim">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold w-1/4">Outcome</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Family stack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border-2">
                {COMBINED_FAMILY_NARRATIVE.map((row) => (
                  <tr key={row.outcome} className="align-top">
                    <th scope="row" className="px-4 py-3 font-semibold text-admin-text">
                      {row.outcome}
                    </th>
                    <td className="px-4 py-3 text-admin-text-mute">{row.familyStack}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      {/* Section 9 — Sales Narrative */}
      <Section
        index="09"
        title="Sales Narrative"
        subtitle="Pre-cleared positioning, pitches, hero copy, and talking points."
        icon={Megaphone}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Positioning statement" subtitle="One sentence.">
            <p className="text-base font-semibold leading-7 text-admin-text">
              {SALES_NARRATIVE.positioningStatement}
            </p>
          </Card>
          <Card title="Hero headline + subhead">
            <p className="text-base font-semibold leading-7 text-admin-text">
              {SALES_NARRATIVE.heroHeadline}
            </p>
            <p className="mt-2 text-sm leading-6 text-admin-text-mute">{SALES_NARRATIVE.heroSubheadline}</p>
          </Card>
          <Card title="30-second elevator">
            <p className="text-sm leading-6 text-admin-text">{SALES_NARRATIVE.elevator30}</p>
          </Card>
          <Card title="90-second elevator">
            <p className="text-sm leading-6 text-admin-text">{SALES_NARRATIVE.elevator90}</p>
          </Card>
          <Card title="Internal talking points" subtitle="Use on first calls + follow-up emails." className="lg:col-span-2">
            <List items={SALES_NARRATIVE.internalTalkingPoints} tone="accent" />
          </Card>
          <Card title="Customer-facing explanation" subtitle="Use in support replies + onboarding emails." className="lg:col-span-2">
            <p className="text-sm leading-6 text-admin-text">{SALES_NARRATIVE.customerFacingExplanation}</p>
          </Card>
        </div>
      </Section>

      {/* Section 10 — Admin Usefulness */}
      <Section
        index="10"
        title="Admin Usefulness"
        subtitle="Per-team guidance. Makes this page actually useful internally."
        icon={ScrollText}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {ADMIN_USEFULNESS.map((row) => (
            <Card key={row.audience} title={row.audience}>
              <div className="text-[11px] uppercase tracking-wider text-admin-text-dim mb-1">
                What this gives them
              </div>
              <p className="text-sm leading-6 text-admin-text-mute">{row.whatThisGivesThem}</p>
              <div className="mt-3 text-[11px] uppercase tracking-wider text-admin-accent mb-1">
                How to use it
              </div>
              <p className="text-sm leading-6 text-admin-text">{row.howToUse}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Footer — editing pointer */}
      <div className="rounded-lg border border-admin-border-2 bg-admin-surface px-5 py-4 text-xs text-admin-text-mute">
        <span className="text-admin-text font-semibold">Edit this page:</span>{" "}
        all copy lives in{" "}
        <code className="rounded bg-admin-surface-2 px-1.5 py-0.5 text-[11px] text-admin-text">
          lib/admin/product-positioning.ts
        </code>
        . Layout stays in{" "}
        <code className="rounded bg-admin-surface-2 px-1.5 py-0.5 text-[11px] text-admin-text">
          app/admin/product-positioning/page.tsx
        </code>
        . Adding a new section? Add the shape to the config + a matching{" "}
        <Link href="/admin/integrations" className="font-semibold text-admin-accent hover:underline">
          &lt;Section /&gt;
        </Link>{" "}
        block here. <BookOpen className="inline h-3 w-3 mb-0.5" aria-hidden="true" /> Cross-ref
        family memory: <code className="rounded bg-admin-surface-2 px-1.5 py-0.5 text-[11px] text-admin-text">project_agencysignal_pricing_v2_neilson_alternative.md</code>{" "}
        + DECISION_LOG D-004 / D-023 / D-034.
      </div>
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function Section({
  index,
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  index: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-admin-text-dim">{index}</span>
            <h2 className="text-lg font-semibold text-admin-text">{title}</h2>
          </div>
          {subtitle && (
            <p className="mt-0.5 text-sm text-admin-text-mute">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Card({
  title,
  subtitle,
  className,
  children,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-admin-border-2 bg-admin-surface p-5 ${className ?? ""}`}>
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h3 className="text-sm font-semibold text-admin-text">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-admin-text-mute">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

function KvCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <section className={`rounded-xl border border-admin-border-2 bg-admin-surface p-5 ${className ?? ""}`}>
      <div className="text-[11px] uppercase tracking-wider text-admin-text-dim">{label}</div>
      <p className="mt-2 text-sm leading-6 text-admin-text">{value}</p>
    </section>
  );
}

function List({ items, tone }: { items: string[]; tone: "accent" | "warn" }) {
  const dot = tone === "warn" ? "bg-admin-warn" : "bg-admin-accent";
  return (
    <ul className="space-y-2 text-sm leading-6 text-admin-text">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span aria-hidden="true" className={`mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: "live" | "in-build" | "scaffolded" }) {
  const cfg =
    status === "live"
      ? { label: "Live",        cls: "bg-emerald-500/15 text-emerald-300" }
      : status === "in-build"
      ? { label: "In build",    cls: "bg-admin-warn/15 text-admin-warn" }
      : { label: "Scaffolded",  cls: "bg-admin-surface-2 text-admin-text-dim" };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
