import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Building2,
  Network,
  Briefcase,
  ShieldAlert,
  Copy,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AgencyCluster = {
  cluster_key: string;
  sample_name: string;
  state: string | null;
  city: string | null;
  dup_count: number;
  agency_ids: string[];
};
type CarrierCluster = {
  cluster_key: string;
  sample_name: string;
  group_name: string | null;
  dup_count: number;
  active_count: number;
  total_appointments: number;
  carrier_ids: string[];
  per_id_appts: { id: string; name: string; appts: number }[];
};
type AffiliationCluster = {
  cluster_key: string;
  sample_name: string;
  affiliation_type: string | null;
  dup_count: number;
  active_count: number;
  total_appointments: number;
  affiliation_ids: string[];
  per_id_appts: { id: string; name: string; appts: number }[];
};
type CanaryRow = {
  id: string;
  source: string | null;
  kind: string;
  match_mode: string | null;
  pattern: string;
  note: string | null;
  agency_match_count: number;
  contact_match_count: number;
};

export default async function DataQualityPage() {
  const supabase = await createClient();

  const [
    agenciesRes,
    carriersRes,
    affiliationsRes,
    canaryRes,
    totalsRes,
  ] = await Promise.all([
    supabase.rpc("find_duplicate_agencies",     { p_limit: 50 }),
    supabase.rpc("find_duplicate_carriers",     { p_limit: 50 }),
    supabase.rpc("find_duplicate_affiliations", { p_limit: 50 }),
    supabase.rpc("scan_watermark_canaries"),
    Promise.all([
      supabase.from("agencies").select("id", { count: "exact", head: true }),
      supabase.from("carriers").select("id", { count: "exact", head: true }),
      supabase.from("affiliations").select("id", { count: "exact", head: true }),
    ]).then(([a, c, af]) => ({
      agencies: a.count ?? 0,
      carriers: c.count ?? 0,
      affiliations: af.count ?? 0,
    })),
  ]);

  const agencyClusters       = (agenciesRes.data     ?? []) as AgencyCluster[];
  const carrierClusters      = (carriersRes.data     ?? []) as CarrierCluster[];
  const affiliationClusters  = (affiliationsRes.data ?? []) as AffiliationCluster[];
  const canaries             = (canaryRes.data       ?? []) as CanaryRow[];
  const totals               = totalsRes;

  // Aggregate stats
  const agencyDupRows      = agencyClusters.reduce((s, c) => s + (c.dup_count - 1), 0);
  const carrierDupRows     = carrierClusters.reduce((s, c) => s + (c.dup_count - 1), 0);
  const affiliationDupRows = affiliationClusters.reduce((s, c) => s + (c.dup_count - 1), 0);
  const canaryHits         = canaries.reduce((s, c) => s + c.agency_match_count + c.contact_match_count, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text">
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Data Quality</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Duplicates &amp; canary leaks</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Pre/post-ingestion sanity check. Surfaces duplicate clusters by normalized name (so apostrophe / parenthesis / whitespace drift collapses), plus any agencies or contacts whose values match an active <Link href="/admin/hygiene" className="text-admin-accent hover:underline">canary watermark</Link>.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Agency dup clusters"
          value={agencyClusters.length}
          Icon={Building2}
          tone={agencyClusters.length > 0 ? "warn" : "ok"}
          hint={`${agencyDupRows} extra row${agencyDupRows === 1 ? "" : "s"} of ${totals.agencies.toLocaleString()} agencies`}
        />
        <Kpi
          label="Carrier dup clusters"
          value={carrierClusters.length}
          Icon={Network}
          tone={carrierClusters.length > 0 ? "warn" : "ok"}
          hint={`${carrierDupRows} extra row${carrierDupRows === 1 ? "" : "s"} of ${totals.carriers.toLocaleString()} carriers`}
        />
        <Kpi
          label="Affiliation dup clusters"
          value={affiliationClusters.length}
          Icon={Briefcase}
          tone={affiliationClusters.length > 0 ? "warn" : "ok"}
          hint={`${affiliationDupRows} extra row${affiliationDupRows === 1 ? "" : "s"} of ${totals.affiliations.toLocaleString()} affiliations`}
        />
        <Kpi
          label="Canary leaks"
          value={canaryHits}
          Icon={ShieldAlert}
          tone={canaryHits > 0 ? "danger" : "ok"}
          hint={canaryHits === 0 ? "No watermark patterns matched" : "Watermark match — needs scrub"}
        />
      </div>

      {/* Canary leaks */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
        <header className="px-5 py-3 border-b border-admin-border-2 flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-admin-warn" />
              Canary watermark scan
            </h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              Live count per active denylist entry. Any non-zero number means a Neilson-style canary has leaked into <code className="text-admin-text">agencies</code> or <code className="text-admin-text">contacts</code> and must be scrubbed before customer queries.
            </p>
          </div>
          <Link href="/admin/hygiene" className="text-xs font-semibold text-admin-accent hover:underline">
            Manage canary patterns &rarr;
          </Link>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2">
            <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
              <th className="px-5 py-2.5 font-medium">Source</th>
              <th className="px-5 py-2.5 font-medium">Kind</th>
              <th className="px-5 py-2.5 font-medium">Pattern</th>
              <th className="px-5 py-2.5 font-medium text-right">Agency hits</th>
              <th className="px-5 py-2.5 font-medium text-right">Contact hits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-2">
            {canaries.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-admin-text-mute">No active canary patterns. Add some at <Link href="/admin/hygiene" className="text-admin-accent hover:underline">Hygiene &amp; Refresh</Link>.</td></tr>
            ) : (
              canaries.map((c) => {
                const total = c.agency_match_count + c.contact_match_count;
                return (
                  <tr key={c.id} className={total > 0 ? "bg-admin-danger/5" : ""}>
                    <td className="px-5 py-3 text-xs text-admin-text-mute">{c.source ?? <span className="text-admin-text-dim">—</span>}</td>
                    <td className="px-5 py-3 text-xs text-admin-text">{c.kind}</td>
                    <td className="px-5 py-3"><code className="text-xs text-admin-text break-all">{c.pattern}</code></td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className={c.agency_match_count > 0 ? "text-admin-danger font-semibold" : "text-admin-text-dim"}>
                        {c.agency_match_count}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className={c.contact_match_count > 0 ? "text-admin-danger font-semibold" : "text-admin-text-dim"}>
                        {c.contact_match_count}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* Agencies dup */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
        <header className="px-5 py-3 border-b border-admin-border-2">
          <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-admin-text-dim" />
            Duplicate agencies — top {Math.min(agencyClusters.length, 50)}
          </h2>
          <p className="mt-0.5 text-xs text-admin-text-mute">
            Clusters share normalized name + state + city. Could be legitimate branches stored as separate rows, or loader-idempotency failures from a re-import. Spot-check before merging.
          </p>
        </header>
        {agencyClusters.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-admin-ok">No agency duplicates detected. <span className="text-admin-text-mute">(Loader idempotency looks clean.)</span></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-admin-surface-2">
              <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
                <th className="px-5 py-2.5 font-medium">Sample name</th>
                <th className="px-5 py-2.5 font-medium">State</th>
                <th className="px-5 py-2.5 font-medium">City</th>
                <th className="px-5 py-2.5 font-medium text-right">Copies</th>
                <th className="px-5 py-2.5 font-medium">Agency IDs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-2">
              {agencyClusters.map((c) => (
                <tr key={c.cluster_key}>
                  <td className="px-5 py-3 text-admin-text font-medium">{c.sample_name}</td>
                  <td className="px-5 py-3 text-xs text-admin-text-mute">{c.state ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-admin-text-mute">{c.city ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold " + (c.dup_count >= 4 ? "bg-admin-danger/15 text-admin-danger" : "bg-admin-warn/15 text-admin-warn")}>
                      <Copy className="h-3 w-3" />
                      {c.dup_count}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <details className="text-[11px]">
                      <summary className="cursor-pointer text-admin-text-mute hover:text-admin-text">{c.dup_count} ids</summary>
                      <div className="mt-1 space-y-0.5 font-mono text-admin-text-dim">
                        {c.agency_ids.slice(0, 10).map((id) => (
                          <div key={id} className="break-all">{id}</div>
                        ))}
                        {c.agency_ids.length > 10 && <div className="text-admin-text-mute">+{c.agency_ids.length - 10} more</div>}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Carriers dup */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
        <header className="px-5 py-3 border-b border-admin-border-2">
          <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
            <Network className="h-3.5 w-3.5 text-admin-text-dim" />
            Duplicate carriers — top {Math.min(carrierClusters.length, 50)}
          </h2>
          <p className="mt-0.5 text-xs text-admin-text-mute">
            Normalized on carrier name (group_name correctly groups subsidiaries, e.g. Berkshire owns 13 separate carriers and that&rsquo;s fine). Subtle name drift like apostrophes or hyphens flags as a cluster — pick the row with the most appointments as the merge target.
          </p>
        </header>
        {carrierClusters.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-admin-ok">No carrier name duplicates detected.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-admin-surface-2">
              <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
                <th className="px-5 py-2.5 font-medium">Variants</th>
                <th className="px-5 py-2.5 font-medium">Group</th>
                <th className="px-5 py-2.5 font-medium text-right">Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-2">
              {carrierClusters.map((c) => (
                <tr key={c.cluster_key}>
                  <td className="px-5 py-3">
                    <ul className="space-y-1">
                      {c.per_id_appts.map((p, i) => (
                        <li key={p.id} className="flex items-baseline gap-2 text-xs">
                          <span className={"inline-flex items-center justify-center rounded-full h-4 w-4 text-[10px] font-bold " + (i === 0 ? "bg-admin-ok text-white" : "bg-admin-warn/30 text-admin-warn")}>
                            {i === 0 ? "★" : i + 1}
                          </span>
                          <span className={i === 0 ? "text-admin-text font-medium" : "text-admin-text-mute"}>{p.name}</span>
                          <span className="text-admin-text-dim tabular-nums">({p.appts.toLocaleString()})</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-1 text-[10px] text-admin-text-dim">★ = suggested keep (most appointments)</div>
                  </td>
                  <td className="px-5 py-3 text-xs text-admin-text-mute">{c.group_name ?? "—"}</td>
                  <td className="px-5 py-3 text-right text-xs tabular-nums text-admin-text">{c.total_appointments.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Affiliations dup */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
        <header className="px-5 py-3 border-b border-admin-border-2">
          <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-admin-text-dim" />
            Duplicate affiliations — top {Math.min(affiliationClusters.length, 50)}
          </h2>
          <p className="mt-0.5 text-xs text-admin-text-mute">
            Catches the IIABA closing-paren case and similar near-duplicates. Total appointments is the join of agency_affiliations rows across all variants — merge target is the row with the most appointments to minimize relink work.
          </p>
        </header>
        {affiliationClusters.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-admin-ok">No affiliation duplicates detected.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-admin-surface-2">
              <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
                <th className="px-5 py-2.5 font-medium">Variants</th>
                <th className="px-5 py-2.5 font-medium">Type</th>
                <th className="px-5 py-2.5 font-medium text-right">Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-2">
              {affiliationClusters.map((c) => (
                <tr key={c.cluster_key}>
                  <td className="px-5 py-3">
                    <ul className="space-y-1">
                      {c.per_id_appts.map((p, i) => (
                        <li key={p.id} className="flex items-baseline gap-2 text-xs">
                          <span className={"inline-flex items-center justify-center rounded-full h-4 w-4 text-[10px] font-bold " + (i === 0 ? "bg-admin-ok text-white" : "bg-admin-warn/30 text-admin-warn")}>
                            {i === 0 ? "★" : i + 1}
                          </span>
                          <span className={i === 0 ? "text-admin-text font-medium" : "text-admin-text-mute"}>{p.name}</span>
                          <span className="text-admin-text-dim tabular-nums">({p.appts.toLocaleString()})</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-1 text-[10px] text-admin-text-dim">★ = suggested keep (most appointments)</div>
                  </td>
                  <td className="px-5 py-3 text-xs text-admin-text-mute">{c.affiliation_type ?? "—"}</td>
                  <td className="px-5 py-3 text-right text-xs tabular-nums text-admin-text">{c.total_appointments.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Future scope */}
      <section className="rounded-xl border border-dashed border-admin-border bg-admin-surface p-5">
        <header className="inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-admin-text-dim" />
          <h2 className="text-sm font-semibold text-admin-text">Next iterations</h2>
        </header>
        <ul className="mt-3 space-y-1.5 text-xs text-admin-text-mute">
          <li>&middot; <strong className="text-admin-text">One-click merge</strong> &mdash; pick the &#9733; row, redirect all <code className="text-admin-text">agency_*</code> link rows to it, soft-delete the others. Audit-logged.</li>
          <li>&middot; <strong className="text-admin-text">Pre-load gate</strong> &mdash; xlsx ingestion path runs find_duplicate_agencies on a temp staging table before merging into master. Reject the load if dup rate &gt; 5%.</li>
          <li>&middot; <strong className="text-admin-text">Canary auto-scrub</strong> &mdash; if an active denylist pattern matches during ingestion, the row gets quarantined to <code className="text-admin-text">data_load_quarantine</code> instead of master.</li>
          <li>&middot; <strong className="text-admin-text">Trigram similarity</strong> &mdash; current normalization catches case + punctuation drift. Trigram (already enabled via mig 0047) would catch typos and word-order swaps too.</li>
        </ul>
      </section>
      <ExternalLink className="hidden" />
    </div>
  );
}

function Kpi({
  label, value, Icon, tone, hint,
}: {
  label: string;
  value: number;
  Icon: typeof Building2;
  tone: "ok" | "warn" | "danger" | "mute";
  hint: string;
}) {
  const cls =
    tone === "ok"     ? "text-admin-ok bg-admin-ok/15"
    : tone === "warn"   ? "text-admin-warn bg-admin-warn/15"
    : tone === "danger" ? "text-admin-danger bg-admin-danger/15"
    : "text-admin-text-dim bg-admin-surface-2";
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${cls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}
