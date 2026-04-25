import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminVerticalsPage() {
  const supabase = createClient();
  const { data: verticals } = await supabase
    .from("mv_vertical_summary")
    .select("slug,name,description,icon_key,color_token,mapped_carrier_count,agencies_with_exposure,agencies_growing,agencies_specialist")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Industry Verticals</h1>
        <p className="mt-1 text-sm text-gray-600">
          Pick a vertical to add or remove specialty carriers from its filter.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(verticals ?? []).map((v) => (
          <Link
            key={v.slug}
            href={`/admin/verticals/${v.slug}`}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-navy-800">{v.name}</h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{v.description}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span><strong className="text-navy-800 tabular-nums">{v.mapped_carrier_count}</strong> carriers mapped</span>
              <span><strong className="text-navy-800 tabular-nums">{v.agencies_with_exposure?.toLocaleString() ?? 0}</strong> agencies w/ exposure</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600">
              Manage carriers <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
