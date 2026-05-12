import Link from "next/link";
import {
  ArrowLeft,
  Database,
  ShieldAlert,
  ShieldCheck,
  Zap,
  GitBranch,
  ExternalLink,
  CreditCard,
  Server,
  Cloud,
  AlertTriangle,
  CircleCheck,
  Info,
  AlertOctagon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  ADVISORS_SNAPSHOT,
  summarizeAdvisors,
  type AdvisorLint,
} from "./_lib/advisors-snapshot";

export const dynamic = "force-dynamic";

const SUPABASE_PROJECT_REF = "sdlsdovuljuymgymarou";
const VERCEL_PROJECT = "saas-agency-database";
const VERCEL_TEAM = "gtminsightlab-7170s-projects";

type SystemHealth = {
  database: {
    name: string;
    size: string;
    public_tables: number;
    rls_protected_tables: number;
    rls_policies: number;
    tables_without_rls: string[];
  };
  migrations: {
    count: number;
    latest_version: string;
    latest_name: string;
    recent: { version: string; name: string }[];
  };
  biggest_tables: { table: string; rows: number; size: string }[];
  fetched_at: string;
};

export default async function SystemHealthPage() {
  const supabase = await createClient();
  const { data: healthRaw, error: healthErr } = await supabase.rpc("get_system_health");
  const health = (healthRaw ?? null) as SystemHealth | null;

  const sec = summarizeAdvisors(ADVISORS_SNAPSHOT.security);
  const perf = summarizeAdvisors(ADVISORS_SNAPSHOT.performance);

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const stripeLive = stripeConfigured && process.env.STRIPE_SECRET_KEY!.startsWith("sk_live_");
  const supabaseAccessToken = Boolean(process.env.SUPABASE_ACCESS_TOKEN);
  const vercelApiToken = Boolean(process.env.VERCEL_API_TOKEN);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">System</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">System health</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Live signals from the database. Advisor data is a build-time snapshot until{" "}
          <code className="text-admin-text">SUPABASE_ACCESS_TOKEN</code> is set in Vercel env;
          deploy data needs <code className="text-admin-text">VERCEL_API_TOKEN</code>.
        </p>
      </div>

      {/* Status row — 4 cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="API"
          Icon={Server}
          status={healthErr ? "danger" : "ok"}
          headline={healthErr ? "Degraded" : "Healthy"}
          detail={
            healthErr
              ? `RPC error: ${healthErr.message}`
              : `Last RPC at ${health?.fetched_at ? new Date(health.fetched_at).toLocaleTimeString() : "—"}`
          }
        />
        <StatusCard
          title="Database"
          Icon={Database}
          status={
            health
              ? health.database.tables_without_rls.length === 0
                ? "ok"
                : "warn"
              : "warn"
          }
          headline={health ? health.database.size : "—"}
          detail={
            health
              ? `${health.database.rls_protected_tables}/${health.database.public_tables} tables RLS-protected`
              : "Snapshot pending"
          }
        />
        <StatusCard
          title="Webhooks"
          Icon={CreditCard}
          status={stripeConfigured ? (stripeLive ? "ok" : "warn") : "warn"}
          headline={
            stripeConfigured ? (stripeLive ? "Live" : "Sandbox") : "Not configured"
          }
          detail={
            stripeConfigured
              ? "Stripe key in env. Recent events not yet wired (v2)."
              : "Set STRIPE_SECRET_KEY in Vercel env"
          }
        />
        <StatusCard
          title="Build"
          Icon={Cloud}
          status={vercelApiToken ? "ok" : "warn"}
          headline={vercelApiToken ? "Wired" : "Static"}
          detail={
            vercelApiToken
              ? "Vercel API token detected"
              : "Open Vercel dashboard to inspect deploys"
          }
          href={`https://vercel.com/${VERCEL_TEAM}/${VERCEL_PROJECT}/deployments`}
        />
      </div>

      {/* Advisor summary */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-admin-text">Supabase advisors</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              Snapshot from {new Date(ADVISORS_SNAPSHOT.fetched_at).toLocaleString()}.{" "}
              {supabaseAccessToken ? (
                <span className="text-admin-ok">Live wiring active.</span>
              ) : (
                <span>Live wiring pending an access token.</span>
              )}
            </p>
          </div>
          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/advisors`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
          >
            Open in Supabase
            <ExternalLink className="h-3 w-3" />
          </a>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          <AdvisorBucket
            title="Security"
            Icon={ShieldAlert}
            summary={sec}
            lints={ADVISORS_SNAPSHOT.security}
          />
          <AdvisorBucket
            title="Performance"
            Icon={Zap}
            summary={perf}
            lints={ADVISORS_SNAPSHOT.performance}
          />
        </div>
      </section>

      {/* RLS gap detector */}
      {health && (
        <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
          <div className="flex items-start gap-3">
            <span
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-md shrink-0",
                health.database.tables_without_rls.length === 0
                  ? "bg-admin-ok/15 text-admin-ok"
                  : "bg-admin-danger/15 text-admin-danger",
              ].join(" ")}
            >
              {health.database.tables_without_rls.length === 0 ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-admin-text">RLS coverage</h2>
              <p className="mt-1 text-xs text-admin-text-mute">
                {health.database.tables_without_rls.length === 0
                  ? `All ${health.database.public_tables} public tables protected by RLS, with ${health.database.rls_policies} policies in force.`
                  : `${health.database.tables_without_rls.length} public tables have no RLS policies — review immediately.`}
              </p>
              {health.database.tables_without_rls.length > 0 && (
                <ul className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {health.database.tables_without_rls.map((t) => (
                    <li
                      key={t}
                      className="rounded border border-admin-danger/30 bg-admin-danger/5 px-2 py-1 text-xs font-mono text-admin-danger"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Migrations + biggest tables */}
      {health && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
            <header className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-admin-text">Migrations</h2>
                <p className="mt-0.5 text-xs text-admin-text-mute">
                  {health.migrations.count} applied · latest{" "}
                  <code className="text-admin-text">{health.migrations.latest_name}</code>
                </p>
              </div>
              <GitBranch className="h-4 w-4 text-admin-text-dim" />
            </header>
            <ul className="space-y-1.5 text-xs">
              {health.migrations.recent.map((m) => (
                <li key={m.version} className="flex items-start gap-2">
                  <span className="font-mono text-admin-text-dim shrink-0">{m.version.slice(8, 14)}</span>
                  <span className="text-admin-text">{m.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
            <header className="mb-3">
              <h2 className="text-sm font-semibold text-admin-text">Biggest tables</h2>
              <p className="mt-0.5 text-xs text-admin-text-mute">
                Top {health.biggest_tables.length} by total relation size
              </p>
            </header>
            <ul className="space-y-1.5">
              {health.biggest_tables.map((t) => (
                <li key={t.table} className="flex items-center justify-between gap-3 text-xs">
                  <code className="text-admin-text truncate flex-1">{t.table}</code>
                  <span className="text-admin-text-mute tabular-nums">
                    {t.rows.toLocaleString()} rows
                  </span>
                  <span className="text-admin-text-dim tabular-nums w-16 text-right">{t.size}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* Live wiring TODOs */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <h2 className="text-sm font-semibold text-admin-text">Wiring upgrades</h2>
        <p className="mt-1 text-xs text-admin-text-mute max-w-2xl">
          Each row below makes the corresponding card move from snapshot to live data.
        </p>
        <ul className="mt-4 space-y-3 text-xs">
          <WiringTodo
            label="Live Supabase advisors"
            done={supabaseAccessToken}
            instruction="Set SUPABASE_ACCESS_TOKEN in Vercel project env vars (a personal access token from supabase.com/account/tokens). The page will then call the Management API at request time and show fresh advisor counts."
          />
          <WiringTodo
            label="Live Vercel deploy list"
            done={vercelApiToken}
            instruction="Set VERCEL_API_TOKEN in Vercel project env vars (vercel.com/account/tokens). The Build card will show the last 10 deploys + status."
          />
          <WiringTodo
            label="Stripe webhook event log"
            done={stripeConfigured}
            instruction="STRIPE_SECRET_KEY is already required for the checkout/webhook routes. Once it's in Vercel env we can add a recent-events feed (last 50 events with retry status)."
          />
          <WiringTodo
            label="Postgres slow-query top 10"
            done={false}
            instruction="Requires pg_stat_statements + a SECURITY DEFINER wrapper. Defer to next session — pair with the Data Engine audit log."
          />
        </ul>
      </section>
    </div>
  );
}

/* ------------- subcomponents ------------- */

function StatusCard({
  title,
  Icon,
  status,
  headline,
  detail,
  href,
}: {
  title: string;
  Icon: typeof Server;
  status: "ok" | "warn" | "danger";
  headline: string;
  detail: string;
  href?: string;
}) {
  const tone =
    status === "ok"
      ? "text-admin-ok bg-admin-ok/15"
      : status === "warn"
      ? "text-admin-warn bg-admin-warn/15"
      : "text-admin-danger bg-admin-danger/15";
  const inner = (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5 hover:border-admin-accent/40 transition">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{title}</div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-lg font-semibold text-admin-text">{headline}</div>
      <div className="mt-1 text-xs text-admin-text-mute">{detail}</div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}

function AdvisorBucket({
  title,
  Icon,
  summary,
  lints,
}: {
  title: string;
  Icon: typeof ShieldAlert;
  summary: { total: number; errors: number; warns: number; infos: number };
  lints: AdvisorLint[];
}) {
  return (
    <div className="rounded-lg border border-admin-border-2 bg-admin-surface-2/50 p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-admin-text">
          <Icon className="h-4 w-4 text-admin-text-dim" />
          {title}
        </div>
        <div className="flex items-center gap-3 text-xs">
          {summary.errors > 0 && (
            <span className="inline-flex items-center gap-1 text-admin-danger">
              <AlertOctagon className="h-3 w-3" />
              <span className="font-semibold tabular-nums">{summary.errors}</span>
            </span>
          )}
          {summary.warns > 0 && (
            <span className="inline-flex items-center gap-1 text-admin-warn">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-semibold tabular-nums">{summary.warns}</span>
            </span>
          )}
          {summary.infos > 0 && (
            <span className="inline-flex items-center gap-1 text-admin-text-dim">
              <Info className="h-3 w-3" />
              <span className="font-semibold tabular-nums">{summary.infos}</span>
            </span>
          )}
          {summary.total === 0 && (
            <span className="inline-flex items-center gap-1 text-admin-ok">
              <CircleCheck className="h-3 w-3" />
              clean
            </span>
          )}
        </div>
      </header>
      {lints.length === 0 ? (
        <p className="text-xs text-admin-text-mute">No findings.</p>
      ) : (
        <ul className="space-y-2.5">
          {lints.map((l, i) => (
            <li key={`${l.name}-${i}`} className="text-xs">
              <div className="flex items-start gap-2">
                <LevelDot level={l.level} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-admin-text">{l.title}</div>
                  <div className="mt-0.5 text-admin-text-mute">{l.detail}</div>
                  <a
                    href={l.remediation}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-admin-accent hover:underline text-[11px]"
                  >
                    Remediation
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LevelDot({ level }: { level: "ERROR" | "WARN" | "INFO" }) {
  const cls =
    level === "ERROR"
      ? "bg-admin-danger"
      : level === "WARN"
      ? "bg-admin-warn"
      : "bg-admin-text-dim";
  return (
    <span
      className={`mt-1 inline-block h-2 w-2 rounded-full shrink-0 ${cls}`}
      title={level}
      aria-label={level}
    />
  );
}

function WiringTodo({
  label,
  done,
  instruction,
}: {
  label: string;
  done: boolean;
  instruction: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={[
          "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded shrink-0",
          done ? "bg-admin-ok/20 text-admin-ok" : "bg-admin-text-dim/20 text-admin-text-dim",
        ].join(" ")}
      >
        {done ? <CircleCheck className="h-3 w-3" /> : <span className="h-2 w-2 rounded-full bg-current" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className={done ? "text-admin-text font-medium" : "text-admin-text"}>{label}</div>
        <div className="mt-0.5 text-admin-text-mute">{instruction}</div>
      </div>
    </li>
  );
}
