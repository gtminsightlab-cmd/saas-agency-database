import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Gauge } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LimitsEditor, type EffectiveRow } from "./limits-editor";
import { METRICS } from "../_lib/metrics";

export const dynamic = "force-dynamic";

type Tenant = { id: string; name: string; slug: string | null; created_at: string };

export default async function TenantUsageDetail({
  params: _params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const params = await _params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id,name,slug,created_at")
    .eq("id", params.tenantId)
    .maybeSingle();

  if (!tenant) notFound();
  const t = tenant as Tenant;

  // Effective limits via RPC
  const { data: effective, error: effErr } = await supabase.rpc("get_effective_limits", {
    p_tenant_id: t.id,
  });

  // Current month usage by metric
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const { data: usage } = await supabase
    .from("usage_logs")
    .select("action_type,quantity")
    .eq("tenant_id", t.id)
    .gte("created_at", monthStart);

  const usageByMetric: Record<string, number> = {};
  for (const u of (usage ?? []) as { action_type: string; quantity: number }[]) {
    usageByMetric[u.action_type] = (usageByMetric[u.action_type] ?? 0) + (u.quantity ?? 0);
  }

  // Pull existing tenant_limits override rows for direct edit (we need their IDs to update/delete)
  const { data: overrideRows } = await supabase
    .from("tenant_limits")
    .select("id,metric,monthly_cap,is_hard_cap,note")
    .eq("tenant_id", t.id);

  const overrideById: Record<string, { id: string; note: string | null }> = {};
  for (const o of (overrideRows ?? []) as any[]) overrideById[o.metric] = { id: o.id, note: o.note };

  const rows: EffectiveRow[] = ((effective ?? []) as any[]).map((e) => ({
    metric: e.metric,
    monthly_cap: e.monthly_cap,
    is_hard_cap: e.is_hard_cap,
    is_override: e.is_override,
    default_cap: e.default_cap,
    default_hard: e.default_hard,
    note: e.note,
    override_id: overrideById[e.metric]?.id ?? null,
    used_this_month: usageByMetric[e.metric] ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/usage"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> All tenants
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Tenant caps</div>
        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold text-admin-text">{t.name}</h1>
          {t.slug && <code className="text-xs text-admin-text-mute">{t.slug}</code>}
        </div>
        <p className="mt-1 text-xs text-admin-text-mute">
          Tenant ID <code className="text-admin-text-dim">{t.id}</code>
        </p>
      </div>

      {effErr && (
        <div className="rounded-md border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger">
          Failed to load effective limits: {effErr.message}
        </div>
      )}

      <LimitsEditor tenantId={t.id} initialRows={rows} />

      <div className="rounded-lg border border-admin-border-2 bg-admin-surface px-5 py-4 text-xs text-admin-text-mute">
        <span className="text-admin-text font-semibold">How overrides work:</span> a tenant override
        replaces the corresponding default for that single metric. &ldquo;Reset to default&rdquo;
        removes the override row entirely (the tenant falls back to the global default).
      </div>
    </div>
  );
}

// Avoid unused-import lint
const _kept = { Building2, Gauge, METRICS };
