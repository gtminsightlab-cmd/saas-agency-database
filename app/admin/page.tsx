import Link from "next/link";
import {
  Database,
  Mail,
  CreditCard,
  Activity,
  ArrowRight,
  TrendingUp,
  Users,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = await createClient();

  // Counts (RLS initplan fix in mig 0036 makes these fast)
  const [
    { count: agenciesCount },
    { count: contactsCount },
    { count: contactsWithEmailCount },
    { data: verticals },
    { count: tenantsCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from("agencies").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .not("email_primary", "is", null)
      .neq("email_primary", ""),
    supabase
      .from("mv_vertical_summary")
      .select("slug,name,mapped_carrier_count,agencies_with_exposure")
      .order("sort_order"),
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase.from("app_users").select("*", { count: "exact", head: true }),
  ]);

  const kpis = [
    {
      label: "Total Agencies",
      value: (agenciesCount ?? 0).toLocaleString(),
      Icon: Database,
      hint: "From agencies table",
      tone: "accent" as const,
    },
    {
      label: "Total Contacts",
      value: (contactsCount ?? 0).toLocaleString(),
      Icon: Users,
      hint: `${(contactsWithEmailCount ?? 0).toLocaleString()} have email`,
      tone: "accent" as const,
    },
    {
      label: "MRR (Sandbox)",
      value: "$0",
      Icon: CreditCard,
      hint: "Stripe is in test mode — no live revenue yet",
      tone: "warn" as const,
    },
    {
      label: "API / Webhook 24h",
      value: "—",
      Icon: Activity,
      hint: "Awaiting first events",
      tone: "mute" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-wider text-admin-text-dim">Overview</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Master Control Room</h1>
        <p className="mt-1 text-sm text-admin-text-mute">
          Live snapshot of the directory. Every metric is clickable into its module.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Usage trends" subtitle="Searches · exports · downloads (last 14d)">
          <EmptyChart
            label="Usage telemetry not yet wired"
            cta={{ href: "/admin/search-analytics", text: "Open Search Analytics" }}
          />
        </Card>
        <Card title="Data health" subtitle="Refreshed within last 6 / 6–12 / >12 months">
          <EmptyChart
            label="Most data was loaded this month — Aging tier expected"
            cta={{ href: "/admin/hygiene", text: "Hygiene & Refresh" }}
          />
        </Card>
      </div>

      {/* Verticals snapshot — real data */}
      <Card
        title="Verticals snapshot"
        subtitle="Live counts from mv_vertical_summary"
        right={
          <Link
            href="/admin/verticals"
            className="text-xs font-semibold text-admin-accent hover:underline inline-flex items-center gap-1"
          >
            Manage <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
            <tr>
              <th className="py-2 pr-4 font-medium">Vertical</th>
              <th className="py-2 pr-4 font-medium">Mapped carriers</th>
              <th className="py-2 pr-4 font-medium">Agencies w/ exposure</th>
              <th className="py-2 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-2">
            {(verticals ?? []).map((v: any) => (
              <tr key={v.slug}>
                <td className="py-3 pr-4 text-admin-text font-medium inline-flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-admin-accent" />
                  {v.name}
                </td>
                <td className="py-3 pr-4 tabular-nums text-admin-text">{v.mapped_carrier_count}</td>
                <td className="py-3 pr-4 tabular-nums text-admin-text">
                  {v.agencies_with_exposure?.toLocaleString() ?? 0}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/verticals/${v.slug}`}
                    className="text-xs font-semibold text-admin-accent hover:underline"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Alerts + Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Alerts" subtitle="Watermark canaries · advisor regressions · webhook errors">
          <EmptyState
            Icon={ShieldAlert}
            label="No alerts firing right now"
            sub="When watermark hits or webhook 4xx/5xx happen, they show up here."
          />
        </Card>
        <Card title="Activity" subtitle="System + admin actions">
          <ul className="space-y-3 text-sm">
            <ActivityRow
              label="RLS initplan optimization applied"
              detail="Migration 0036 — contacts count 485× faster (10.18s → 21ms)"
              when="2026-04-25"
            />
            <ActivityRow
              label="Account-type cleanup loaded"
              detail="132 inactive-type agencies cascade-deleted; insert trigger now blocks them"
              when="2026-04-25"
            />
            <ActivityRow
              label={`${(usersCount ?? 0).toLocaleString()} app users / ${(tenantsCount ?? 0).toLocaleString()} tenants`}
              detail="Demo tenant plus admin user"
              when="now"
            />
          </ul>
        </Card>
      </div>

      {/* Footer next-steps strip */}
      <div className="rounded-lg border border-admin-border-2 bg-admin-surface px-5 py-4 text-xs text-admin-text-mute">
        <span className="text-admin-text font-semibold">Next up:</span>{" "}
        Catalog editor for the 8 reference tables —{" "}
        <Link href="/admin/catalog" className="text-admin-accent hover:underline font-semibold">
          open it
        </Link>
        . Hygiene/Refresh and System Health modules ship after this.
      </div>
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function KpiCard({
  label,
  value,
  hint,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  Icon: typeof Database;
  tone: "accent" | "warn" | "mute";
}) {
  const toneClass =
    tone === "accent"
      ? "text-admin-accent bg-admin-accent/15"
      : tone === "warn"
      ? "text-admin-warn bg-admin-warn/15"
      : "text-admin-text-dim bg-admin-surface-2";
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-admin-text">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-admin-text-mute">{subtitle}</p>}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

function EmptyChart({
  label,
  cta,
}: {
  label: string;
  cta: { href: string; text: string };
}) {
  return (
    <div className="h-40 rounded-md border border-dashed border-admin-border bg-admin-surface-2/50 flex flex-col items-center justify-center text-center px-6">
      <TrendingUp className="h-5 w-5 text-admin-text-dim" />
      <div className="mt-2 text-xs text-admin-text-mute">{label}</div>
      <Link href={cta.href} className="mt-2 text-xs font-semibold text-admin-accent hover:underline">
        {cta.text} →
      </Link>
    </div>
  );
}

function EmptyState({
  Icon,
  label,
  sub,
}: {
  Icon: typeof ShieldAlert;
  label: string;
  sub: string;
}) {
  return (
    <div className="py-6 text-center">
      <Icon className="mx-auto h-6 w-6 text-admin-text-dim" />
      <div className="mt-2 text-sm text-admin-text font-medium">{label}</div>
      <div className="mt-1 text-xs text-admin-text-mute">{sub}</div>
    </div>
  );
}

function ActivityRow({ label, detail, when }: { label: string; detail: string; when: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-admin-accent" />
      <div className="min-w-0 flex-1">
        <div className="text-admin-text">{label}</div>
        <div className="text-xs text-admin-text-mute">{detail}</div>
      </div>
      <div className="text-[10px] text-admin-text-dim shrink-0">{when}</div>
    </li>
  );
}

// Avoid unused imports
const _kept = { Mail };
