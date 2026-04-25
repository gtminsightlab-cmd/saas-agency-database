import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Workflow,
  FileSearch2,
  Calendar,
  Database,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TABS = [
  {
    href: "/admin/data-engine/sources",
    title: "Sources",
    Icon: Upload,
    description:
      "AdList xlsx uploads, FMCSA feeds, CSV drops, future API imports. Drag/drop a workbook to start an ingestion run.",
    state: "live" as const,
  },
  {
    href: "/admin/data-engine/pipelines",
    title: "Pipelines",
    Icon: Workflow,
    description:
      "Visual flow: Source → Normalize → Watermark Filter → Deduplicate → Enrich → Score → Index. Each node clickable for logs and retry.",
    state: "soon" as const,
  },
  {
    href: "/admin/data-engine/records",
    title: "Records inspector",
    Icon: FileSearch2,
    description:
      "Raw row vs enriched row side-by-side, confidence score, field-level source attribution, last-updated timestamp.",
    state: "soon" as const,
  },
  {
    href: "/admin/data-engine/freshness",
    title: "Freshness",
    Icon: Calendar,
    description:
      "Per-table freshness scoreboard. Drives Hygiene Credit eligibility (10% off month 6 + 12).",
    state: "soon" as const,
  },
];

export default function DataEngineHub() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Data engine</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Ingestion control center</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          Where AdList xlsx files become live agencies + contacts. Sources is the first tab that
          lands; Pipelines, Records inspector, and Freshness are queued for follow-up sessions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.state === "live" ? t.href : "#"}
            className={[
              "group rounded-xl border bg-admin-surface p-5 transition",
              t.state === "live"
                ? "border-admin-border-2 hover:border-admin-accent/60"
                : "border-admin-border-2 opacity-60 cursor-not-allowed",
            ].join(" ")}
            aria-disabled={t.state !== "live"}
          >
            <div className="flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
                <t.Icon className="h-4 w-4" />
              </span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  t.state === "live"
                    ? "bg-admin-ok/15 text-admin-ok"
                    : "bg-admin-text-dim/15 text-admin-text-dim",
                ].join(" ")}
              >
                {t.state === "live" ? "Live" : "Soon"}
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-admin-text">{t.title}</h3>
            <p className="mt-1 text-xs text-admin-text-mute">{t.description}</p>
            {t.state === "live" && (
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-admin-accent">
                Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-admin-border-2 bg-admin-surface px-5 py-4 text-xs text-admin-text-mute">
        <span className="text-admin-text font-semibold">Current dataset:</span> 20,034 agencies · 87,214
        contacts (72,882 with email) · loaded April 2026 from the AdList Q1 batch via the Python
        pipeline in /tmp. The Sources tab below is the first step toward replacing that manual
        flow with an admin-driven UI.
      </div>
    </div>
  );
}
