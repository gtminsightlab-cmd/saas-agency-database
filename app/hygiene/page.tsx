import Link from "next/link";
import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HygienePage() {
  const supabase = createClient();

  const [summary, recentEvents, ent] = await Promise.all([
    supabase.from("v_my_hygiene_summary").select("*").maybeSingle(),
    supabase.from("hygiene_events")
      .select("id,change_type,old_value,new_value,detected_at,agency_id")
      .order("detected_at", { ascending: false }).limit(50),
    supabase.from("v_my_entitlement").select("plan_code,plan_name").maybeSingle()
  ]);

  const s = summary.data ?? { updates_this_month: 0, updates_last_30d: 0, updates_last_90d: 0, lists_needing_redownload: 0 };
  const isMember = ent.data?.plan_code === "growth_member";

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-3">
          <Sparkles className="h-8 w-8 text-brand-600 mt-1" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Hygiene</h1>
            <p className="mt-1 text-sm text-gray-600">
              Every month we scan the directory for agency merges, phone changes, and new appointments.
              When a contact in your saved lists moves, we flag it automatically.
            </p>
          </div>
        </div>

        {!isMember && (
          <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm">
            <div className="font-semibold text-brand-900">Hygiene updates are a Growth Member benefit.</div>
            <p className="mt-1 text-brand-800">
              One-time Snapshot buyers see the counts below, but re-downloads require an active membership.
            </p>
            <Link href="/#pricing" className="mt-3 inline-block rounded-md bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700">
              Upgrade to Growth Member
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Updates this month" value={s.updates_this_month ?? 0} />
          <StatCard label="Last 30 days" value={s.updates_last_30d ?? 0} />
          <StatCard label="Last 90 days" value={s.updates_last_90d ?? 0} />
          <StatCard label="Lists needing re-download" value={s.lists_needing_redownload ?? 0} accent />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Recent change events</h2>
          <p className="mt-1 text-sm text-gray-500">The most recent changes detected across the directory.</p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Detected</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">Before</th>
                  <th className="px-4 py-3">After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(recentEvents.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                      No hygiene events yet. They&apos;ll appear here once the change-detection cron runs.
                    </td>
                  </tr>
                ) : (
                  recentEvents.data!.map((e: any) => (
                    <tr key={e.id}>
                      <td className="px-4 py-3 text-gray-700">{new Date(e.detected_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{e.change_type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-gray-500">{e.old_value ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-900">{e.new_value ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={"rounded-lg border p-5 " + (accent ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white")}>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={"mt-2 text-3xl font-bold tabular-nums " + (accent ? "text-brand-700" : "text-brand-600")}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
