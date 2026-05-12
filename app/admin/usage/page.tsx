import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Gauge,
  Building2,
  ShieldCheck,
  AlertTriangle,
  CircleSlash,
  Sliders,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { METRICS, METRIC_BY_KEY, type Metric, utilTone } from "./_lib/metrics";

export const dynamic = "force-dynamic";

type Tenant = { id: string; name: string; slug: string | null };
type LimitRow = {
  id: string;
  tenant_id: string | null;
  metric: Metric;
  monthly_cap: number;
  is_hard_cap: boolean;
};

export default async function UsageIndex() {
  const supabase = await createClient();

  // Current month start (UTC)
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const [
    { data: tenants },
    { data: limits },
    { data: usage },
  ] = await Promise.all([
    supabase.from("tenants").select("id,name,slug").order("created_at", { ascending: true }),
    supabase
      .from("tenant_limits")
      .select("id,tenant_id,metric,monthly_cap,is_hard_cap")
      .order("metric"),
    supabase
      .from("usage_logs")
      .select("tenant_id,action_type,quantity")
      .gte("created_at", monthStart),
  ]);

  const tenantList = (tenants ?? []) as Tenant[];
  const limitList = (limits ?? []) as LimitRow[];
  const usageList = (usage ?? []) as { tenant_id: string | null; action_type: string; quantity: number }[];

  // Defaults map: limits with NULL tenant_id
  const defaults: Record<Metric, LimitRow> = {} as any;
  for (const l of limitList.filter((x) => x.tenant_id === null)) defaults[l.metric] = l;

  // Per-tenant override map: { tenantId: { metric: LimitRow } }
  const overrides = new Map<string, Partial<Record<Metric, LimitRow>>>();
  for (const l of limitList.filter((x) => x.tenant_id !== null)) {
    const cur = overrides.get(l.tenant_id!) ?? {};
    cur[l.metric] = l;
    overrides.set(l.tenant_id!, cur);
  }

  // Per-tenant usage aggregate this month: { tenantId: { metric: total } }
  const usageByTenant = new Map<string, Partial<Record<Metric, number>>>();
  for (const u of usageList) {
    if (!u.tenant_id || !METRIC_BY_KEY[u.action_type as Metric]) continue;
    const cur = usageByTenant.get(u.tenant_id) ?? {};
    const k = u.action_type as Metric;
    cur[k] = (cur[k] ?? 0) + u.quantity;
    usageByTenant.set(u.tenant_id, cur);
  }

  // KPIs
  const totalOverrides = limitList.filter((l) => l.tenant_id !== null).length;
  const hardCount = METRICS.filter((m) => defaults[m.key]?.is_hard_cap).length;
  const softCount = METRICS.length - hardCount;
  const totalUsageThisMonth = usageList.reduce((s, u) => s + (u.quantity ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Usage</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Usage &amp; limits</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Per-tenant monthly caps for searches, exports, list downloads, and API calls. Hard caps
          block at the threshold; soft caps warn but allow through. NULL-tenant rows in
          tenant_limits are the global defaults and apply to every tenant unless overridden below.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Tenants"             value={tenantList.length} Icon={Building2}    tone="accent" hint="Each with its own effective caps" />
        <Kpi label="Tenant overrides"    value={totalOverrides}    Icon={Sliders}      tone={totalOverrides > 0 ? "accent" : "mute"} hint="tenant_limits rows where tenant_id is set" />
        <Kpi label="Hard / soft default" value={`${hardCount}H · ${softCount}S`} Icon={ShieldCheck} tone="ok"    hint={`${hardCount} hard, ${softCount} soft (across ${METRICS.length} metrics)`} />
        <Kpi label="Usage this month"    value={totalUsageThisMonth.toLocaleString()} Icon={Gauge}  tone="mute"  hint="Sum across all metrics + tenants" />
      </div>

      {/* Default limits */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4">
          <h2 className="text-sm font-semibold text-admin-text">Global defaults</h2>
          <p className="mt-0.5 text-xs text-admin-text-mute">
            These apply to every tenant that has no override. Edit them on a tenant page first if
            you want to test the override flow before changing the platform-wide defaults.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => {
            const lim = defaults[m.key];
            return (
              <div key={m.key} className="rounded-md border border-admin-border-2 bg-admin-surface-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
                    <m.Icon className="h-3.5 w-3.5" />
                  </span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      lim?.is_hard_cap
                        ? "bg-admin-danger/15 text-admin-danger"
                        : "bg-admin-warn/15 text-admin-warn",
                    ].join(" ")}
                  >
                    {lim?.is_hard_cap ? "Hard" : "Soft"}
                  </span>
                </div>
                <div className="mt-3 text-xs uppercase tracking-wider text-admin-text-dim">{m.label}</div>
                <div className="mt-1 text-2xl font-semibold text-admin-text tabular-nums">
                  {lim?.monthly_cap.toLocaleString() ?? "—"}
                </div>
                <div className="mt-0.5 text-[11px] text-admin-text-mute">{m.unit} / month</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-tenant table */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
        <header className="px-5 py-3 border-b border-admin-border-2">
          <h2 className="text-sm font-semibold text-admin-text">Tenant utilization (current month)</h2>
          <p className="mt-0.5 text-xs text-admin-text-mute">
            Click a tenant to edit per-metric caps + hard/soft toggle. Progress bars use the
            effective cap (override or default).
          </p>
        </header>
        {tenantList.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-admin-text-mute">No tenants.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-admin-surface-2">
              <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
                <th className="px-5 py-2.5 font-medium">Tenant</th>
                {METRICS.map((m) => (
                  <th key={m.key} className="px-5 py-2.5 font-medium">
                    {m.label}
                  </th>
                ))}
                <th className="px-5 py-2.5 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-2">
              {tenantList.map((t) => {
                const tenantOver = overrides.get(t.id) ?? {};
                const u = usageByTenant.get(t.id) ?? {};
                const overrideCount = Object.keys(tenantOver).length;
                return (
                  <tr key={t.id}>
                    <td className="px-5 py-3 align-top">
                      <Link
                        href={`/admin/usage/${t.id}`}
                        className="font-medium text-admin-text hover:text-admin-accent"
                      >
                        {t.name}
                      </Link>
                      {overrideCount > 0 && (
                        <div className="mt-0.5 inline-flex items-center gap-1 rounded bg-admin-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-admin-accent">
                          <Sliders className="h-2.5 w-2.5" />
                          {overrideCount} override{overrideCount === 1 ? "" : "s"}
                        </div>
                      )}
                    </td>
                    {METRICS.map((m) => {
                      const o = tenantOver[m.key];
                      const cap = o?.monthly_cap ?? defaults[m.key]?.monthly_cap ?? 0;
                      const hard = o?.is_hard_cap ?? defaults[m.key]?.is_hard_cap ?? true;
                      const used = u[m.key] ?? 0;
                      return (
                        <td key={m.key} className="px-5 py-3 align-top">
                          <UsageBar usage={used} cap={cap} hard={hard} override={Boolean(o)} />
                        </td>
                      );
                    })}
                    <td className="px-5 py-3 align-top text-right">
                      <Link
                        href={`/admin/usage/${t.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
                      >
                        Edit caps <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div className="rounded-lg border border-admin-border-2 bg-admin-surface px-5 py-4 text-xs text-admin-text-mute">
        <span className="text-admin-text font-semibold">Wiring note:</span> caps are visible
        immediately, but enforcement (rejecting requests at hard cap, surfacing warnings at soft
        cap) needs to be wired into the Build List + export endpoints. Track that as a follow-up.
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  Icon,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  Icon: typeof Gauge;
  tone: "accent" | "ok" | "warn" | "mute";
  hint: string;
}) {
  const cls =
    tone === "accent"
      ? "text-admin-accent bg-admin-accent/15"
      : tone === "ok"
      ? "text-admin-ok bg-admin-ok/15"
      : tone === "warn"
      ? "text-admin-warn bg-admin-warn/15"
      : "text-admin-text-dim bg-admin-surface-2";
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${cls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}

function UsageBar({
  usage,
  cap,
  hard,
  override,
}: {
  usage: number;
  cap: number;
  hard: boolean;
  override: boolean;
}) {
  const pct = cap > 0 ? Math.min(100, Math.round((usage / cap) * 100)) : 0;
  const tone = utilTone(usage, cap, hard);
  const fillCls =
    tone === "danger"
      ? "bg-admin-danger"
      : tone === "warn"
      ? "bg-admin-warn"
      : "bg-admin-accent";
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-admin-text tabular-nums">{usage.toLocaleString()}</span>
        <span className="text-admin-text-dim">/</span>
        <span className="text-admin-text-mute tabular-nums">{cap.toLocaleString()}</span>
        {override && (
          <span title="Tenant override" className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-admin-accent" />
        )}
        {tone === "danger" && (
          <AlertTriangle className="h-3 w-3 text-admin-danger" />
        )}
        {!hard && (
          <span className="ml-auto text-[10px] uppercase tracking-wider text-admin-warn font-semibold">soft</span>
        )}
      </div>
      <div className="mt-1.5 h-1 w-full rounded-full bg-admin-surface-2 overflow-hidden">
        <div
          className={`h-full ${fillCls} transition-[width] duration-200`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
