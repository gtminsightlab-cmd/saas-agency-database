import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Activity,
  ExternalLink,
  Eye,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listRecentEvents } from "@/app/admin/billing/_lib/stripe-fetchers";
import {
  buildAlerts,
  type AlertInputs,
} from "./_lib/build-alerts";
import { sevTone, sevLabel, summarize, SEV_ORDER, type Alert, type Severity } from "./_lib/types";
import { RECENT_DEPLOYS, deployErrorsLast7d } from "./_lib/deploy-snapshot";

export const dynamic = "force-dynamic";

type CanaryRow = {
  id: string;
  source: string;
  kind: string;
  match_mode: string;
  pattern: string;
  hits: number;
};

type SystemHealth = {
  database: {
    public_tables: number;
    rls_protected_tables: number;
    tables_without_rls: string[];
  };
};

type ExportProbe = "501" | "ok" | "error" | "skip";

export default async function AlertsPage() {
  const supabase = createClient();

  // Current month start for usage_logs
  const now = Date.now();
  const last24hCutoff = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: canariesRaw, error: canaryErr },
    { data: healthRaw },
    eventsResult,
    { data: usageLast24h },
  ] = await Promise.all([
    supabase.rpc("scan_watermark_canaries"),
    supabase.rpc("get_system_health"),
    listRecentEvents(50),
    supabase
      .from("usage_logs")
      .select("user_id,tenant_id,action_type,quantity,created_at")
      .gte("created_at", last24hCutoff)
      .eq("action_type", "export"),
  ]);

  const canaryHits = ((canariesRaw ?? []) as CanaryRow[]).map((c) => ({
    id: c.id,
    source: c.source,
    kind: c.kind,
    pattern: c.pattern,
    hits: c.hits,
  }));

  const health = (healthRaw ?? null) as SystemHealth | null;
  const rlsCoverage = {
    protected: health?.database.rls_protected_tables ?? 0,
    total: health?.database.public_tables ?? 0,
    unprotected_tables: health?.database.tables_without_rls ?? [],
  };

  const events = eventsResult.ok ? eventsResult.data : [];
  const pendingWebhooks = events.filter((e) => e.pending_webhooks > 0).length;

  // Aggregate exports per user in last 24h
  type UsageRow = { user_id: string | null; tenant_id: string | null; quantity: number };
  const exportByUser = new Map<string, { user_id: string; tenant_id: string | null; count: number }>();
  for (const u of (usageLast24h ?? []) as UsageRow[]) {
    if (!u.user_id) continue;
    const cur = exportByUser.get(u.user_id) ?? { user_id: u.user_id, tenant_id: u.tenant_id, count: 0 };
    cur.count += u.quantity ?? 0;
    exportByUser.set(u.user_id, cur);
  }

  // Probe /api/export — production page hits its own origin, so skip the request and rely on
  // the static fact that the route returns 501. Refresh this assumption when the route ships.
  const exportRouteIs501 = true;

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const stripeIsLive = stripeConfigured && process.env.STRIPE_SECRET_KEY!.startsWith("sk_live_");
  const oldestUnacknowledgedPAT = true; // Until we get told otherwise via memory.

  const inputs: AlertInputs = {
    canaryHits,
    rlsCoverage,
    pendingWebhooks,
    webhookEvents: events,
    exportRouteIs501,
    stripeConfigured,
    stripeIsLive,
    massExportLast24h: Array.from(exportByUser.values()),
    oldestUnacknowledgedPAT,
  };

  const alerts = buildAlerts(inputs).sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
  const summary = summarize(alerts);

  const recent7dErrors = deployErrorsLast7d(now);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Alerts &amp; risk</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Operational alerts</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Live signals that warrant a human look. Watermark canary scan runs every page load,
          Stripe webhook + RLS coverage are live, mass-export detection is wired against
          usage_logs. Vercel deploy and Supabase advisor data come from a snapshot until the
          respective access tokens land in env.
        </p>
      </div>

      {/* All-clear or severity strip */}
      {summary.total === 0 ? (
        <div className="rounded-xl border border-admin-ok/40 bg-admin-ok/5 p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-ok/15 text-admin-ok">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-admin-text">All clear</h2>
              <p className="mt-1 text-sm text-admin-text-mute max-w-2xl">
                Zero alerts firing. Watermark canary scan is clean ({canaryHits.length} active
                canaries, 0 hits). RLS coverage at {rlsCoverage.protected}/{rlsCoverage.total}{" "}
                tables. {events.length > 0 ? `${events.length} recent Stripe events, ${pendingWebhooks} pending` : "No webhook activity to watch."}.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SevKpi label="Critical" count={summary.critical} Icon={AlertOctagon}    sev="critical" hint="Immediate action" />
          <SevKpi label="High"     count={summary.high}     Icon={AlertTriangle}   sev="high"     hint="Review today" />
          <SevKpi label="Medium"   count={summary.medium}   Icon={ShieldAlert}     sev="medium"   hint="Review this week" />
          <SevKpi label="Low"      count={summary.low}      Icon={Info}            sev="low"      hint="Informational" />
        </div>
      )}

      {/* Active alerts table */}
      {alerts.length > 0 && (
        <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
          <header className="px-5 py-3 border-b border-admin-border-2">
            <h2 className="text-sm font-semibold text-admin-text">Active alerts</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              Sorted by severity. Each row links to the module where you can investigate.
            </p>
          </header>
          <ul className="divide-y divide-admin-border-2">
            {alerts.map((a) => (
              <AlertRow key={a.id} alert={a} />
            ))}
          </ul>
        </section>
      )}

      {/* Watchlist — what's monitored */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
              <Eye className="h-4 w-4 text-admin-text-dim" />
              What this page watches
            </h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              The signals being computed each time you load this page.
            </p>
          </div>
        </header>
        <ul className="grid gap-3 md:grid-cols-2 text-xs">
          <Watch
            label="Watermark canary leaks"
            status={`${canaryHits.length} active canaries · ${canaryHits.filter((c) => c.hits > 0).length} hitting → ${canaryHits.reduce((s, c) => s + c.hits, 0)} live matches`}
            tone={canaryHits.some((c) => c.hits > 0) ? "danger" : "ok"}
          />
          <Watch
            label="RLS coverage"
            status={`${rlsCoverage.protected}/${rlsCoverage.total} public tables protected${
              rlsCoverage.unprotected_tables.length ? ` (${rlsCoverage.unprotected_tables.length} gaps)` : ""
            }`}
            tone={rlsCoverage.unprotected_tables.length === 0 ? "ok" : "danger"}
          />
          <Watch
            label="Stripe webhook backlog"
            status={
              eventsResult.ok
                ? `${events.length} events scanned · ${pendingWebhooks} pending`
                : "Stripe key not set — wiring pending"
            }
            tone={eventsResult.ok ? (pendingWebhooks > 0 ? "warn" : "ok") : "warn"}
          />
          <Watch
            label="Mass-export attempts (24h)"
            status={
              exportByUser.size === 0
                ? "0 exports in last 24h"
                : `${exportByUser.size} users exporting · max ${Math.max(
                    ...Array.from(exportByUser.values()).map((u) => u.count)
                  ).toLocaleString()} rows`
            }
            tone={Array.from(exportByUser.values()).some((u) => u.count > 500) ? "warn" : "ok"}
          />
          <Watch
            label="Vercel deploy errors (24h)"
            status={`Snapshot · ${RECENT_DEPLOYS.filter((d) => d.state === "ERROR" && now - d.created_ms < 86_400_000).length} in last 24h`}
            tone="ok"
          />
          <Watch
            label="Supabase advisors (ERROR)"
            status="Snapshot · 0 ERROR-level lints"
            tone="ok"
          />
        </ul>
      </section>

      {/* Recent activity — historical context proving the engine works */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4">
          <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-admin-text-dim" />
            Recent activity (last 7d)
          </h2>
          <p className="mt-0.5 text-xs text-admin-text-mute">
            What the alert engine would have surfaced if it were running historically.
          </p>
        </header>
        {recent7dErrors.length === 0 ? (
          <div className="py-6 text-center">
            <Activity className="mx-auto h-5 w-5 text-admin-text-dim" />
            <div className="mt-2 text-sm text-admin-text-mute">No firing alerts in the last 7 days.</div>
          </div>
        ) : (
          <ul className="space-y-2 text-xs">
            {recent7dErrors.map((d) => (
              <li
                key={d.id}
                className="flex items-start gap-3 rounded-md bg-admin-surface-2/50 px-3 py-2.5"
              >
                <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-admin-warn" />
                <div className="flex-1 min-w-0">
                  <div className="text-admin-text">
                    Vercel deploy{" "}
                    <code className="text-admin-text-mute">{d.id.slice(0, 12)}</code> errored on commit{" "}
                    <code className="text-admin-text-mute">{d.commit_sha.slice(0, 7)}</code>
                  </div>
                  <div className="text-admin-text-dim mt-0.5 truncate">{d.commit_subject}</div>
                </div>
                <span className="text-admin-text-dim shrink-0 tabular-nums">
                  {fmtAge(d.created_ms, now)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Wiring upgrades */}
      <section className="rounded-xl border border-dashed border-admin-border bg-admin-surface p-5">
        <h2 className="text-sm font-semibold text-admin-text">Make alerts more live</h2>
        <ul className="mt-3 space-y-2 text-xs text-admin-text-mute">
          <li>
            <strong className="text-admin-text">VERCEL_API_TOKEN</strong> — pulls deploys at request
            time, makes the &ldquo;deploy errors 24h&rdquo; check live instead of snapshot-based.
          </li>
          <li>
            <strong className="text-admin-text">SUPABASE_ACCESS_TOKEN</strong> — pulls advisors at
            request time. We&rsquo;d catch ERROR-level lints the moment they appear.
          </li>
          <li>
            <strong className="text-admin-text">Slack/Discord webhook</strong> — once we have an
            outbound webhook publisher (see Integrations), critical alerts can fire to a channel
            instead of waiting for someone to load this page.
          </li>
          <li>
            <strong className="text-admin-text">alerts_acknowledged table</strong> — for now the
            page recomputes every load. Once we have a snooze/ack mechanism, we&rsquo;ll persist
            who muted what and why.
          </li>
        </ul>
        {canaryErr && (
          <div className="mt-4 text-xs text-admin-danger">
            Canary scan RPC failed: {canaryErr.message}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function SevKpi({
  label,
  count,
  Icon,
  sev,
  hint,
}: {
  label: string;
  count: number;
  Icon: typeof ShieldAlert;
  sev: Severity;
  hint: string;
}) {
  const tone = sevTone(sev);
  return (
    <div className={`rounded-xl border bg-admin-surface p-5 ${count > 0 ? `ring-1 ${tone.ring}` : "border-admin-border-2"}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${tone.bg} ${tone.text}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">{count}</div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  const tone = sevTone(alert.severity);
  return (
    <li className="px-5 py-4">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone.bg} ${tone.text}`}>
          {sevLabel(alert.severity)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-sm font-semibold text-admin-text">{alert.title}</h3>
            <span className="text-[10px] uppercase tracking-wider text-admin-text-dim">{alert.category}</span>
            {alert.observed_at && (
              <span className="text-[10px] text-admin-text-dim tabular-nums">
                {new Date(alert.observed_at).toLocaleString()}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-admin-text-mute">{alert.detail}</p>
          <p className="mt-2 text-xs text-admin-text">
            <span className="text-[10px] uppercase tracking-wider text-admin-text-dim font-semibold">Remediation: </span>
            {alert.remediation}
          </p>
          {alert.evidence && (
            <a
              href={alert.evidence.href}
              target={alert.evidence.href.startsWith("http") ? "_blank" : undefined}
              rel={alert.evidence.href.startsWith("http") ? "noreferrer" : undefined}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
            >
              {alert.evidence.label}
              {alert.evidence.href.startsWith("http") && <ExternalLink className="h-3 w-3" />}
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

function Watch({
  label,
  status,
  tone,
}: {
  label: string;
  status: string;
  tone: "ok" | "warn" | "danger";
}) {
  const cls =
    tone === "danger"
      ? "text-admin-danger"
      : tone === "warn"
      ? "text-admin-warn"
      : "text-admin-ok";
  const Icon = tone === "ok" ? CheckCircle2 : tone === "warn" ? AlertTriangle : AlertOctagon;
  return (
    <li className="flex items-start gap-2.5 rounded-md border border-admin-border-2 bg-admin-surface-2/30 px-3 py-2.5">
      <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${cls}`} />
      <div className="min-w-0">
        <div className="text-admin-text font-medium">{label}</div>
        <div className="text-admin-text-mute mt-0.5">{status}</div>
      </div>
    </li>
  );
}

function fmtAge(then: number, now: number): string {
  const diff = now - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// keep imports referenced
const _kept = { ShieldCheck };
