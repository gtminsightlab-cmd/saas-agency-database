import Link from "next/link";
import { ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminVerticalsPage() {
  const supabase = createClient();
  const { data: verticals } = await supabase
    .from("mv_vertical_summary")
    .select(
      "slug,name,description,icon_key,color_token,mapped_carrier_count,agencies_with_exposure,agencies_growing,agencies_specialist"
    )
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Verticals</div>
        <h1 className="mt-1 text-2xl font-semibold text-admin-text">Industry verticals</h1>
        <p className="mt-1 text-sm text-admin-text-mute max-w-2xl">
          Pick a vertical to add or remove specialty carriers from its filter. Score weights and
          carrier mappings drive the public /verticals pages and the marketing home.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(verticals ?? []).map((v: any) => (
          <Link
            key={v.slug}
            href={`/admin/verticals/${v.slug}`}
            className="group rounded-xl border border-admin-border-2 bg-admin-surface p-5 hover:border-admin-accent/60 transition"
          >
            <div className="flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
                <Layers className="h-4 w-4" />
              </span>
              <ArrowRight className="h-4 w-4 text-admin-text-dim group-hover:text-admin-accent group-hover:translate-x-0.5 transition" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-admin-text">{v.name}</h3>
            <p className="mt-1 text-xs text-admin-text-mute line-clamp-2">{v.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="text-admin-text-mute">
                <span className="text-admin-text font-semibold tabular-nums">{v.mapped_carrier_count}</span>{" "}
                carriers mapped
              </span>
              <span className="text-admin-text-mute">
                <span className="text-admin-text font-semibold tabular-nums">
                  {v.agencies_with_exposure?.toLocaleString() ?? 0}
                </span>{" "}
                agencies w/ exposure
              </span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-admin-accent">
              Manage carriers
              <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
