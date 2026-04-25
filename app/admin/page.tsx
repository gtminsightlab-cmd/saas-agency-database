import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createClient();
  const { data: verticals } = await supabase
    .from("mv_vertical_summary")
    .select("slug,name,mapped_carrier_count,agencies_with_exposure")
    .order("sort_order");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-800">Master Control Room</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage which carriers map to each vertical filter. Changes take effect after a one-click refresh.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/verticals"
          className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Tag className="h-5 w-5 text-brand-700" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-navy-800">Industry Verticals</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add or remove carriers from each vertical&rsquo;s specialty list. Refresh propagates the
            change to /verticals and the marketing home cards.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600">
            Manage <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </div>
        </Link>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
            <Tag className="h-5 w-5 text-gray-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-500">Account Types & AMS</h2>
          <p className="mt-1 text-sm text-gray-500">Coming soon.</p>
        </div>
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
            <Tag className="h-5 w-5 text-gray-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-500">Affiliations</h2>
          <p className="mt-1 text-sm text-gray-500">Coming soon.</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-navy-800">Vertical snapshot</h2>
        <p className="mt-1 text-xs text-gray-500">Live counts from <code>mv_vertical_summary</code>.</p>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="py-2 pr-4">Vertical</th>
              <th className="py-2 pr-4">Mapped carriers</th>
              <th className="py-2 pr-4">Agencies w/ exposure</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(verticals ?? []).map((v) => (
              <tr key={v.slug}>
                <td className="py-3 pr-4 font-medium text-navy-800">{v.name}</td>
                <td className="py-3 pr-4 tabular-nums text-gray-700">{v.mapped_carrier_count}</td>
                <td className="py-3 pr-4 tabular-nums text-gray-700">{v.agencies_with_exposure?.toLocaleString() ?? 0}</td>
                <td className="py-3 text-right">
                  <Link href={`/admin/verticals/${v.slug}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
