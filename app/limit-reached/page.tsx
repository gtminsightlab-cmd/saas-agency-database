import Link from "next/link";
import {
  AlertOctagon,
  Calendar,
  ArrowLeft,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const METRIC_LABEL: Record<string, { label: string; verb: string }> = {
  search:   { label: "Searches",       verb: "searches"     },
  export:   { label: "Exports",        verb: "exports"      },
  download: { label: "List downloads", verb: "downloads"    },
  api_call: { label: "API calls",      verb: "API calls"    },
};

type UsageSummary = {
  tenant_id: string;
  month_start: string;
  metrics: {
    metric: string;
    used: number;
    cap: number | null;
    is_hard: boolean | null;
    is_override: boolean;
  }[];
};

export default async function LimitReachedPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ metric?: string; cap?: string; used?: string }>;
}) {
  const searchParams = await _searchParams;
  const blockedMetric = searchParams.metric ?? "search";
  const blockedLabel  = METRIC_LABEL[blockedMetric] ?? METRIC_LABEL.search;

  const supabase = await createClient();
  const [{ data: { user } }, { data: summaryRaw }, { data: appUserRow }] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase.rpc("get_my_usage_summary"),
      supabase
        .from("app_users")
        .select("role")
        .maybeSingle(),
    ]);

  const summary = (summaryRaw ?? null) as UsageSummary | null;
  const isSuperAdmin = appUserRow?.role === "super_admin";

  // Reset = first of next month UTC
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/build-list"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Build List
        </Link>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shrink-0">
              <AlertOctagon className="h-6 w-6" />
            </span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-navy-800">Monthly {blockedLabel.verb} cap reached</h1>
              <p className="mt-2 text-sm text-gray-700">
                Your tenant has used all of its allotted {blockedLabel.verb} for the current month.
                The cap resets on the 1st of next month
                {daysUntilReset > 0 && <> — that&rsquo;s in <strong>{daysUntilReset} day{daysUntilReset === 1 ? "" : "s"}</strong></>}.
              </p>
            </div>
          </div>

          {summary && (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {summary.metrics.map((m) => {
                const meta = METRIC_LABEL[m.metric] ?? { label: m.metric, verb: m.metric };
                const pct = m.cap && m.cap > 0 ? Math.min(100, Math.round((m.used / m.cap) * 100)) : 0;
                const isThis = m.metric === blockedMetric;
                return (
                  <div
                    key={m.metric}
                    className={[
                      "rounded-lg border p-4",
                      isThis ? "border-red-300 bg-white" : "border-gray-200 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-sm font-semibold text-navy-800">{meta.label}</div>
                      {isThis && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700">
                          You&rsquo;re here
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1 text-sm">
                      <span className="font-semibold text-navy-800 tabular-nums">{m.used.toLocaleString()}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-700 tabular-nums">{m.cap?.toLocaleString() ?? "—"}</span>
                      <span className="text-gray-500 text-xs ml-1">{meta.verb} this month</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={[
                          "h-full transition-[width] duration-200",
                          pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-brand-600",
                        ].join(" ")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action panel */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {isSuperAdmin ? (
            <Link
              href="/admin/usage"
              className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-300 transition"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Sliders className="h-4 w-4" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-navy-800">Raise the cap</h2>
              <p className="mt-1 text-xs text-gray-600">
                You&rsquo;re a super_admin — open Usage &amp; Limits to bump the cap or switch to a soft cap.
              </p>
            </Link>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                <HelpCircle className="h-4 w-4" />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-navy-800">Need a higher limit?</h2>
              <p className="mt-1 text-xs text-gray-600">
                Reach out to your tenant admin or contact support
                {user?.email && <> ({user.email})</>} — we can raise the cap or move you to an
                Enterprise tier.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-700">
              <Calendar className="h-4 w-4" />
            </span>
            <h2 className="mt-3 text-sm font-semibold text-navy-800">When does it reset?</h2>
            <p className="mt-1 text-xs text-gray-600">
              {nextMonth.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              {" "}at 00:00 UTC. All metrics roll over together — searches, exports, downloads, and API calls.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          You hit a <strong className="text-navy-800">hard cap</strong>, which means requests are blocked at
          the threshold. Soft caps would have let you through with a warning instead.
        </p>
      </div>
    </AppShell>
  );
}
