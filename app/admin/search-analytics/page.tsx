import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Users,
  ShieldAlert,
  Zap,
  Clock,
  Filter,
  ListFilter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type UsageRow = {
  id: string;
  user_id: string | null;
  tenant_id: string | null;
  action_type: string;
  quantity: number;
  metadata: { filter_keys?: string[]; route?: string } | null;
  created_at: string;
};

type AppUser = { id: string; email: string };

const FILTER_KEY_LABELS: Record<string, string> = {
  at:    "Account Type",
  lt:    "Location Type",
  ams:   "AMS",
  c:     "Country",
  st:    "States",
  st_m:  "State mode",
  cr:    "Carriers",
  af:    "Affiliations",
  sic:   "SIC industries",
  pmin:  "Premium ≥",
  pmax:  "Premium ≤",
  rmin:  "Revenue ≥",
  rmax:  "Revenue ≤",
  emin:  "Employees ≥",
  emax:  "Employees ≤",
  name:  "Account name",
  min:   "Minority owned",
  mt:    "Metros",
};

export default async function SearchAnalyticsPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

  const [
    { data: monthRows, count: monthCount },
    { data: weekRows },
    { data: appUsers },
  ] = await Promise.all([
    supabase
      .from("usage_logs")
      .select("id,user_id,tenant_id,action_type,quantity,metadata,created_at", { count: "exact" })
      .eq("action_type", "search")
      .gte("created_at", monthStart)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("usage_logs")
      .select("id,user_id,tenant_id,action_type,quantity,metadata,created_at")
      .eq("action_type", "search")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("app_users").select("id,email"),
  ]);

  const month = (monthRows ?? []) as UsageRow[];
  const week = (weekRows ?? []) as UsageRow[];
  const usersById = new Map<string, AppUser>(((appUsers ?? []) as AppUser[]).map((u) => [u.id, u]));

  // Top filter-set combinations
  const comboCounts = new Map<string, number>();
  for (const r of month) {
    const keys = (r.metadata?.filter_keys ?? []).slice().sort();
    const sig = keys.join("+") || "(no filters)";
    comboCounts.set(sig, (comboCounts.get(sig) ?? 0) + (r.quantity ?? 1));
  }
  const topCombos = Array.from(comboCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Per-user counts
  const perUser = new Map<string, number>();
  for (const r of month) {
    if (!r.user_id) continue;
    perUser.set(r.user_id, (perUser.get(r.user_id) ?? 0) + (r.quantity ?? 1));
  }
  const distinctUsers = perUser.size;

  // Filter-key frequency (which individual filters get used most)
  const keyFreq = new Map<string, number>();
  for (const r of month) {
    for (const k of r.metadata?.filter_keys ?? []) {
      keyFreq.set(k, (keyFreq.get(k) ?? 0) + 1);
    }
  }
  const topKeys = Array.from(keyFreq.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Search</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Search analytics</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Pulled from <code className="text-admin-text">usage_logs</code> rows where{" "}
          <code className="text-admin-text">action_type = &lsquo;search&rsquo;</code>. Each
          /build-list/review render writes one row with the filter keys used. Volume builds up
          over time; expect the histograms to thin out today.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Searches this month" value={monthCount ?? 0}    Icon={Search}     hint="From usage_logs" />
        <Kpi label="Searches last 7d"    value={week.length}        Icon={Clock}      hint="Rolling window" />
        <Kpi label="Distinct searchers"  value={distinctUsers}      Icon={Users}      hint="Unique user_ids this month" />
        <Kpi label="Filter combinations" value={comboCounts.size}   Icon={ListFilter} hint="Distinct filter_keys signatures" />
      </div>

      {/* Empty-state if no data */}
      {month.length === 0 ? (
        <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-10 text-center">
          <Zap className="mx-auto h-6 w-6 text-admin-text-dim" />
          <h2 className="mt-3 text-base font-semibold text-admin-text">No search activity yet this month</h2>
          <p className="mt-1 text-xs text-admin-text-mute max-w-md mx-auto">
            Once users start running filters on /build-list/review, this page lights up. The
            usage_logs trigger captures filter_keys metadata which drives every panel below.
          </p>
        </section>
      ) : (
        <>
          {/* Top filter combinations */}
          <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
            <header className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4 text-admin-text-dim" />
                <h2 className="text-sm font-semibold text-admin-text">Top filter combinations</h2>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-admin-text-dim">
                this month
              </span>
            </header>
            {topCombos.length === 0 ? (
              <p className="text-sm text-admin-text-mute">No combinations recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {topCombos.map(([sig, n]) => {
                  const keys = sig === "(no filters)" ? [] : sig.split("+");
                  const max = topCombos[0][1];
                  const pct = max > 0 ? Math.round((n / max) * 100) : 0;
                  return (
                    <li key={sig}>
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          {keys.length === 0 ? (
                            <span className="text-admin-text-mute italic">no filters applied</span>
                          ) : (
                            keys.map((k) => (
                              <span
                                key={k}
                                className="rounded bg-admin-surface-2 px-1.5 py-0.5 text-admin-text-mute font-mono"
                                title={FILTER_KEY_LABELS[k] ?? k}
                              >
                                {FILTER_KEY_LABELS[k] ?? k}
                              </span>
                            ))
                          )}
                        </div>
                        <span className="text-xs text-admin-text font-semibold tabular-nums shrink-0">
                          {n.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full rounded-full bg-admin-surface-2 overflow-hidden">
                        <div
                          className="h-full bg-admin-accent transition-[width]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Filter-key frequency */}
          <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
            <header className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-admin-text-dim" />
                <h2 className="text-sm font-semibold text-admin-text">Most-used filter fields</h2>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-admin-text-dim">
                count of searches per field
              </span>
            </header>
            <div className="grid gap-2 md:grid-cols-2">
              {topKeys.map(([k, n]) => {
                const max = topKeys[0][1];
                const pct = max > 0 ? Math.round((n / max) * 100) : 0;
                return (
                  <div key={k} className="rounded-md border border-admin-border-2 bg-admin-surface-2 px-3 py-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-admin-text font-medium">
                        {FILTER_KEY_LABELS[k] ?? k}
                      </span>
                      <span className="text-xs text-admin-text-mute tabular-nums">
                        {n.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full rounded-full bg-admin-surface overflow-hidden">
                      <div
                        className="h-full bg-admin-accent/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent searches feed */}
          <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
            <header className="px-5 py-3 border-b border-admin-border-2">
              <h2 className="text-sm font-semibold text-admin-text">Recent searches</h2>
              <p className="mt-0.5 text-xs text-admin-text-mute">
                Last {Math.min(week.length, 30)} searches across the last 7 days.
              </p>
            </header>
            <ul className="divide-y divide-admin-border-2">
              {week.slice(0, 30).map((r) => {
                const u = r.user_id ? usersById.get(r.user_id) : null;
                const keys = r.metadata?.filter_keys ?? [];
                return (
                  <li key={r.id} className="px-5 py-2.5 flex items-start gap-3 text-xs">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-admin-accent" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-admin-text">
                          {u?.email ?? <span className="text-admin-text-dim font-mono">{r.user_id?.slice(0, 8) ?? "anon"}</span>}
                        </span>
                        <span className="text-admin-text-dim">searched with</span>
                        <span className="text-admin-text">
                          {keys.length === 0 ? (
                            <em className="text-admin-text-mute">no filters</em>
                          ) : (
                            <>
                              {keys.length} filter{keys.length === 1 ? "" : "s"}:{" "}
                              <span className="text-admin-text-mute">
                                {keys.slice(0, 4).map((k) => FILTER_KEY_LABELS[k] ?? k).join(", ")}
                                {keys.length > 4 && ` +${keys.length - 4}`}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-admin-text-dim shrink-0 tabular-nums">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}

      {/* Watchlist / future scope */}
      <section className="rounded-xl border border-dashed border-admin-border bg-admin-surface p-5">
        <header className="inline-flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-admin-text-dim" />
          <h2 className="text-sm font-semibold text-admin-text">Future scope</h2>
        </header>
        <ul className="mt-3 space-y-1.5 text-xs text-admin-text-mute">
          <li>
            · <strong className="text-admin-text">Zero-result detector</strong> — log filter sets that returned 0 matching agencies.
            Requires extending the /build-list/review enforce_usage call to include the result count in metadata.
          </li>
          <li>
            · <strong className="text-admin-text">Debug ranking</strong> — when AI ranking ships, surface which signals contributed
            (carrier overlap, geographic match, account-type weight) per result row.
          </li>
          <li>
            · <strong className="text-admin-text">Saved-list conversion funnel</strong> — what % of searches become saved lists →
            downloads → exports. Drives onboarding analytics.
          </li>
          <li>
            · <strong className="text-admin-text">Slow-query tracker</strong> — pull from pg_stat_statements for queries
            in the search code path, sort by total_time_ms.
          </li>
        </ul>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  Icon,
  hint,
}: {
  label: string;
  value: number;
  Icon: typeof Search;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}
