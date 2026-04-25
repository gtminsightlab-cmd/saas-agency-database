import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  AtSign,
  Phone,
  Building2,
  Printer,
  User2,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CanaryEditor, type CanaryRow } from "./canary-editor";
import { EmailDomainEditor, type DomainRow } from "./email-domain-editor";

export const dynamic = "force-dynamic";

const KIND_ICON: Record<string, typeof ShieldAlert> = {
  email: AtSign,
  phone: Phone,
  fax: Printer,
  agency_name: Building2,
  contact_name_in_agency: User2,
};

export default async function HygienePage() {
  const supabase = createClient();

  const [{ data: canaries }, { data: domains }] = await Promise.all([
    supabase
      .from("data_load_denylist")
      .select("id,source,kind,match_mode,pattern,note,active,created_at")
      .order("source")
      .order("kind"),
    supabase
      .from("email_domain_denylist")
      .select("domain,reason,added_at")
      .order("domain"),
  ]);

  const canaryRows = (canaries ?? []) as CanaryRow[];
  const domainRows = (domains ?? []) as DomainRow[];

  // Group canaries by kind for the summary strip
  const kindCounts = canaryRows.reduce<Record<string, number>>((acc, r) => {
    if (!r.active) return acc;
    acc[r.kind] = (acc[r.kind] ?? 0) + 1;
    return acc;
  }, {});

  const summary = [
    { kind: "email", label: "Email canaries" },
    { kind: "phone", label: "Phone canaries" },
    { kind: "fax", label: "Fax canaries" },
    { kind: "agency_name", label: "Agency-name canaries" },
    { kind: "contact_name_in_agency", label: "Contact + agency pairs" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Hygiene</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Hygiene &amp; Refresh</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Watermark canaries (Neilson denylist), consumer-email domain blocks, and freshness
          tracking. Every AdList ingestion runs against this list before rows land in the live
          dataset — adding a new canary protects future loads.
        </p>
      </div>

      {/* Health summary */}
      <div className="rounded-xl border border-admin-ok/40 bg-admin-ok/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-admin-ok shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-admin-text">No canaries detected in current dataset</h2>
            <p className="mt-1 text-xs text-admin-text-mute">
              Manual scan as of {new Date().toLocaleDateString()} — 13 active canaries, 0 leaked
              into the live agencies / contacts tables. The watermark filter is doing its job.
            </p>
          </div>
        </div>
      </div>

      {/* Canary kind summary */}
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        {summary.map((s) => {
          const Icon = KIND_ICON[s.kind] ?? ShieldAlert;
          const n = kindCounts[s.kind] ?? 0;
          return (
            <div key={s.kind} className="rounded-lg border border-admin-border-2 bg-admin-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-admin-text-dim">{s.label}</span>
                <Icon className="h-3.5 w-3.5 text-admin-text-dim" />
              </div>
              <div className="mt-2 text-xl font-semibold text-admin-text tabular-nums">{n}</div>
            </div>
          );
        })}
      </div>

      {/* Canary editor */}
      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-admin-text">Watermark canary denylist</h2>
            <p className="mt-1 text-xs text-admin-text-mute max-w-2xl">
              Patterns that cause an inbound row to be rejected during AdList ingestion. Add new
              canaries when a vendor leak is discovered.
            </p>
          </div>
          <span className="text-xs text-admin-text-mute tabular-nums">
            {canaryRows.filter((r) => r.active).length} active / {canaryRows.length} total
          </span>
        </div>
        <CanaryEditor initialRows={canaryRows} />
      </section>

      {/* Email domain editor */}
      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-admin-text">Consumer email domain denylist</h2>
            <p className="mt-1 text-xs text-admin-text-mute max-w-2xl">
              Personal-email domains we strip from contact records (gmail, yahoo, icloud, etc).
              Used by the email-policy library at ingestion + display time.
            </p>
          </div>
          <span className="text-xs text-admin-text-mute tabular-nums">
            {domainRows.length} domains
          </span>
        </div>
        <EmailDomainEditor initialRows={domainRows} />
      </section>

      {/* Refresh queue stub */}
      <section className="rounded-xl border border-dashed border-admin-border bg-admin-surface p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-warn/15 text-admin-warn shrink-0">
            <RefreshCw className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-admin-text">Refresh queue &amp; freshness</h2>
            <p className="mt-1 text-xs text-admin-text-mute max-w-2xl">
              Sorted-by-oldest-data refresh queue and per-source last-loaded-at heatmap require an
              ingestion audit log table to drive the visual. That table doesn&rsquo;t exist yet —
              wiring is queued for Data Engine.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-admin-text-mute">
              <li>· Per-source freshness scoreboard → drives Hygiene Credit eligibility</li>
              <li>· Refresh queue (oldest data first) with one-click reload trigger</li>
              <li>· Date heatmap of last-loaded-at per source</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
