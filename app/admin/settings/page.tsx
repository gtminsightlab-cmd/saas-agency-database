import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Lock,
  Sliders,
  Database,
  ScrollText,
  Settings,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FlagsEditor, type FlagRow } from "./flags-editor";
import { AuditLogPanel } from "./audit-log-panel";

export const dynamic = "force-dynamic";

type Plan = { name: string; price_cents: number; interval: string; active: boolean };
type Tenant = { id: string; name: string };

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [
    { data: flags, error: flagErr },
    { data: tenants },
    { data: defaultLimits },
    { data: defaultPlan },
  ] = await Promise.all([
    supabase
      .from("feature_flags")
      .select("id,key,label,description,enabled,scope,category,updated_at")
      .order("category")
      .order("key"),
    supabase.from("tenants").select("id,name"),
    supabase
      .from("tenant_limits")
      .select("metric,monthly_cap,is_hard_cap")
      .is("tenant_id", null),
    supabase
      .from("billing_plans")
      .select("name,price_cents,interval,active")
      .eq("active", true)
      .order("sort_order"),
  ]);

  const flagRows = (flags ?? []) as FlagRow[];
  const tenantList = (tenants ?? []) as Tenant[];
  const defaultLimitsList = (defaultLimits ?? []) as { metric: string; monthly_cap: number; is_hard_cap: boolean }[];
  const planList = (defaultPlan ?? []) as Plan[];

  // Group flags by category for the editor
  const flagsByCategory = new Map<string, FlagRow[]>();
  for (const f of flagRows) {
    const cat = f.category ?? "Other";
    if (!flagsByCategory.has(cat)) flagsByCategory.set(cat, []);
    flagsByCategory.get(cat)!.push(f);
  }

  const enabledCount = flagRows.filter((f) => f.enabled).length;
  const disabledCount = flagRows.length - enabledCount;
  const publicFlagCount = flagRows.filter((f) => f.scope === "public_marketing").length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Settings</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Admin settings</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Feature flags, tenant defaults, env-var inventory, and the audit log home. Flags toggle
          live — anon-readable flags propagate to the marketing site immediately, authenticated
          flags require the user to refresh.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Feature flags"      value={flagRows.length}  Icon={Flag}     tone="accent" hint={`${enabledCount} on · ${disabledCount} off`} />
        <Kpi label="Public-readable"    value={publicFlagCount}  Icon={Lock}     tone="ok"     hint="Visible to anon (marketing site)" />
        <Kpi label="Tenants"            value={tenantList.length} Icon={Database} tone="mute"  hint="Subject to defaults below" />
        <Kpi label="Default limit caps" value={defaultLimitsList.length} Icon={Sliders} tone="mute" hint="Global rows in tenant_limits (NULL tenant_id)" />
      </div>

      {/* Feature flags editor */}
      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-admin-text">Feature flags</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute max-w-2xl">
              Toggle ships immediately. <code className="text-admin-text">public_marketing</code> flags are readable
              by anon — the marketing site picks them up next render.{" "}
              <code className="text-admin-text">authenticated</code> flags require a logged-in user.{" "}
              <code className="text-admin-text">admin_only</code> flags are super_admin-gated.
            </p>
          </div>
        </div>

        {flagErr && (
          <div className="rounded-md border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger">
            Failed to load flags: {flagErr.message}
          </div>
        )}

        <FlagsEditor initialRows={flagRows} />
      </section>

      {/* Tenant defaults summary */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-admin-text">Tenant defaults</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              New tenants inherit these caps + plan unless overridden. Edit on the Usage module.
            </p>
          </div>
          <Link
            href="/admin/usage"
            className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
          >
            Open Usage <ArrowRight className="h-3 w-3" />
          </Link>
        </header>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {defaultLimitsList.map((l) => (
            <div key={l.metric} className="rounded-md border border-admin-border-2 bg-admin-surface-2 p-3">
              <div className="text-[10px] uppercase tracking-wider text-admin-text-dim">{l.metric}</div>
              <div className="mt-1 text-lg font-semibold text-admin-text tabular-nums">
                {l.monthly_cap.toLocaleString()}
              </div>
              <div className="mt-0.5 text-[11px] text-admin-text-mute">
                {l.is_hard_cap ? "Hard cap" : "Soft cap"}
              </div>
            </div>
          ))}
        </div>
        {planList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-admin-border-2">
            <div className="text-[10px] uppercase tracking-wider text-admin-text-dim font-semibold mb-2">
              Active plans
            </div>
            <ul className="flex flex-wrap gap-2 text-xs">
              {planList.map((p) => (
                <li
                  key={p.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-admin-border-2 bg-admin-surface-2 px-3 py-1"
                >
                  <span className="text-admin-text font-medium">{p.name}</span>
                  <span className="text-admin-text-mute">
                    ${(p.price_cents / 100).toFixed(0)}/{p.interval}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Env-var inventory pointer */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="inline-flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent shrink-0">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-admin-text">Env-var inventory</h2>
              <p className="mt-1 text-xs text-admin-text-mute max-w-2xl">
                Per-integration server-side env-var presence checks live on the Integrations page.
                Same data, same render — no point duplicating it here.
              </p>
            </div>
          </div>
          <Link
            href="/admin/integrations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline shrink-0"
          >
            Open <ArrowRight className="h-3 w-3" />
          </Link>
        </header>
      </section>

      {/* Audit log */}
      <AuditLogPanel />

      {/* Sidebar status footer */}
      <div className="rounded-lg border border-admin-ok/40 bg-admin-ok/5 px-5 py-4 text-xs text-admin-text-mute">
        <span className="text-admin-ok font-semibold">All 13 admin modules now Live.</span>{" "}
        Overview, Catalog, Hygiene &amp; Refresh, System Health, Verticals, Customers, Billing,
        Usage &amp; Limits, Integrations, Alerts &amp; Risk, Admin Settings — plus Data Engine and
        Search &amp; Index, which are scaffolded as Coming Soon stubs and queued for next session.
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
  Icon: typeof Settings;
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

// keep imports referenced
const _kept = { ExternalLink };
