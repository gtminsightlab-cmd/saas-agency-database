import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  ShieldCheck,
  CircleSlash,
  AlertTriangle,
  Database,
  Workflow,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "./upload-form";

export const dynamic = "force-dynamic";

export default async function DataEngineSourcesPage() {
  const supabase = await createClient();

  // What's the current canary count? (informs the user before they upload)
  const [
    { count: canaryCount },
    { count: domainCount },
    { count: agencyCount },
    { count: contactCount },
  ] = await Promise.all([
    supabase.from("data_load_denylist").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("email_domain_denylist").select("*", { count: "exact", head: true }),
    supabase.from("agencies").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/data-engine"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Data Engine
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Sources</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">AdList xlsx upload</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Drop an AdList workbook here. It runs through watermark canary detection +
          consumer-email scrubbing before any row touches agencies or contacts. Full pipeline
          (parse → dedupe → enrich → merge) is queued; this v1 acknowledges the file, runs the
          security checks, and returns a preview so you can see what would land.
        </p>
      </div>

      {/* Pre-upload state */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Active canaries"    value={canaryCount ?? 0}   Icon={ShieldCheck} />
        <Stat label="Blocked email domains" value={domainCount ?? 0} Icon={CircleSlash} />
        <Stat label="Agencies in DB"     value={agencyCount ?? 0}   Icon={Database} />
        <Stat label="Contacts in DB"     value={contactCount ?? 0}  Icon={Database} />
      </div>

      {/* Upload form */}
      <UploadForm />

      {/* What happens next */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4 inline-flex items-center gap-2">
          <Workflow className="h-4 w-4 text-admin-text-dim" />
          <h2 className="text-sm font-semibold text-admin-text">Pipeline (what would happen)</h2>
        </header>
        <ol className="space-y-3 text-xs">
          <PipelineStep
            n={1}
            title="Parse"
            done
            note="SheetJS reads the workbook, expects columns: agency_name, address_line1, city, state, zip, country, main_phone, fax, primary_url, account_type, premium_pc, revenue_total, employees_total. Plus a contacts sheet with agency_name, contact_name, title, email_primary, work_phone, mobile_phone."
          />
          <PipelineStep
            n={2}
            title="Watermark filter"
            done
            note={`Each row checked against the ${canaryCount ?? 0} active canary patterns. Hits land in the rejected-rows preview, never in agencies/contacts.`}
          />
          <PipelineStep
            n={3}
            title="Consumer-email scrub"
            done
            note={`Personal-email contacts (${domainCount ?? 0} blocked domains) get their email_primary nulled before insert. Other fields kept.`}
          />
          <PipelineStep
            n={4}
            title="Dedupe + merge"
            note="Match incoming agencies on name+address+state, contacts on email_primary or full_name+agency. Existing rows get UPDATEd; new rows INSERTed. Stretch goal: confidence-scored fuzzy match."
          />
          <PipelineStep
            n={5}
            title="Score + index"
            note="Recompute carrier vertical scores, refresh mv_vertical_summary, kick off pg_stat_statements ANALYZE."
          />
        </ol>
        <p className="mt-4 text-[11px] text-admin-text-mute">
          Steps 1–3 land first because they protect the data. Steps 4–5 require the dedupe key
          design + a background worker. Defer until first real customer onboarding.
        </p>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: typeof Upload;
}) {
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-xl font-semibold text-admin-text tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}

function PipelineStep({
  n,
  title,
  note,
  done,
}: {
  n: number;
  title: string;
  note: string;
  done?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={[
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
          done
            ? "bg-admin-accent/15 text-admin-accent"
            : "bg-admin-surface-2 text-admin-text-dim border border-admin-border",
        ].join(" ")}
      >
        {n}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-admin-text font-medium">{title}</span>
          {done ? (
            <span className="text-[10px] uppercase tracking-wider text-admin-accent font-semibold">
              v1 wired
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-admin-text-dim font-semibold inline-flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5" /> Deferred
            </span>
          )}
        </div>
        <p className="mt-0.5 text-admin-text-mute">{note}</p>
      </div>
    </li>
  );
}
