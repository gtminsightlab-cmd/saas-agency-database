import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Lock,
  Search,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";
import { Sidebar } from "@/components/app/sidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carrier appointments analytics | Seven16 Agency Directory",
  description:
    "Find agencies appointed with any of 1,300+ carriers. Top 50 carriers by appointed agency count, with one-click deep links to the directory.",
};

type CarrierRow = {
  id: string;
  name: string;
  group_name: string | null;
  agency_count: number;
};

type Kpis = {
  active_carriers: number;
  carriers_with_appointments: number;
  total_appointments: number;
  agencies_covered: number;
};

export default async function AnalyticsCarriersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasActivePlan = false;
  if (user) {
    const { data: ent } = await supabase
      .from("v_my_entitlement")
      .select("plan_code,status")
      .maybeSingle();
    hasActivePlan = !!ent && ent.status === "active";
  }

  // Top 50 + KPIs both come from RPC (SECURITY DEFINER, aggregate-only)
  const [topRes, kpiRes] = await Promise.all([
    supabase.rpc("get_top_carriers_by_agency_count", { p_limit: 50 }),
    supabase.rpc("get_carrier_analytics_kpis"),
  ]);

  const topCarriers: CarrierRow[] = Array.isArray(topRes.data)
    ? (topRes.data as CarrierRow[])
    : [];

  const kpiRow = Array.isArray(kpiRes.data) ? kpiRes.data[0] : null;
  const kpis: Kpis = {
    active_carriers: Number(kpiRow?.active_carriers ?? 0),
    carriers_with_appointments: Number(kpiRow?.carriers_with_appointments ?? 0),
    total_appointments: Number(kpiRow?.total_appointments ?? 0),
    agencies_covered: Number(kpiRow?.agencies_covered ?? 0),
  };

  let sidebarProps:
    | { email: string; fullName: string | null; isSuperAdmin: boolean }
    | null = null;
  if (user) {
    const { data: appUser } = await supabase
      .from("app_users")
      .select("email, full_name, role")
      .eq("user_id", user.id)
      .maybeSingle();
    sidebarProps = {
      email: appUser?.email ?? user.email ?? "",
      fullName: appUser?.full_name ?? null,
      isSuperAdmin: appUser?.role === "super_admin",
    };
  }

  const maxCount = topCarriers[0]?.agency_count ?? 1;
  const isAnon = !user;

  // For anonymous visitors, only render the top 10 with blurred metrics.
  const visibleCarriers = isAnon ? topCarriers.slice(0, 10) : topCarriers;

  // CTA href per tile depends on auth state
  const tileHref = (carrierId: string) => {
    if (hasActivePlan) {
      return `/build-list/review?cr=${carrierId}&cr_c=or&c=US`;
    }
    if (user) {
      return `/#pricing`;
    }
    return `/sign-up?carrier=${carrierId}`;
  };

  const body = (
    <div className="bg-white">
      {!user && <MarketingNav isAuthed={false} />}

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics &middot; carrier appointments
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
              Find agencies by{" "}
              <span className="text-brand-600">carrier appointment.</span>
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Click any carrier to open the directory pre-filtered to agencies appointed with them.
              Counts refresh every 30 days. The full carrier list ({kpis.active_carriers.toLocaleString()})
              is searchable in the build-list filter.
            </p>
            {isAnon && (
              <p className="mt-3 text-sm text-brand-700 font-medium">
                Sign in to see all 50 ranked carriers and click through to the directory.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section className="border-b border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCell label="Active carriers"        value={kpis.active_carriers} />
            <KpiCell label="With appointments"      value={kpis.carriers_with_appointments} />
            <KpiCell label="Total appointments"     value={kpis.total_appointments} />
            <KpiCell label="Agencies covered"       value={kpis.agencies_covered} />
          </div>
        </div>
      </section>

      {/* TOP 50 GRID */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-navy-800">
              Top 50 by appointed agencies
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {isAnon
                ? "Preview of the ranked carriers — sign in for the full list and clickable filters."
                : <>Click a tile &rarr; directory pre-filtered to that carrier&rsquo;s agencies.</>}
            </p>
          </div>
          <div className="text-xs text-gray-500 inline-flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            ranked by # of distinct agencies appointed
          </div>
        </div>

        {topCarriers.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
            Loading carrier appointment data&hellip;
          </div>
        ) : isAnon ? (
          <div className="relative">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visibleCarriers.map((c, i) => (
                <CarrierTilePreview
                  key={c.id}
                  rank={i + 1}
                  carrier={c}
                  maxCount={maxCount}
                />
              ))}
            </div>
            {/* Fade-out gradient over the lower portion */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent via-white/85 to-white"
            />
            {/* Centered sign-up CTA card overlaid on the locked grid */}
            <div className="absolute inset-x-0 top-1/2 flex justify-center -translate-y-1/2 px-4">
              <div className="max-w-md w-full rounded-2xl border border-brand-200 bg-white shadow-md p-6 text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy-800">
                  Sign in to see all 50 carriers
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The full Top 50 ranking, the long-tail of {kpis.active_carriers.toLocaleString()} carriers,
                  and one-click deep links to filtered agency lists are inside the app.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Link
                    href="/sign-up"
                    className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 inline-flex items-center gap-2"
                  >
                    Get instant access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {topCarriers.map((c, i) => (
              <CarrierTile
                key={c.id}
                rank={i + 1}
                carrier={c}
                maxCount={maxCount}
                href={tileHref(c.id)}
                authed={!!user}
                hasPlan={hasActivePlan}
              />
            ))}
          </div>
        )}

        {!isAnon && (
          <div className="mt-8 rounded-md border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Search className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-800">
                  Looking for a carrier outside the Top 50?
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  The full directory has {kpis.active_carriers.toLocaleString()} active carriers.
                  Open the build-list filter and search by carrier name &mdash; Berkley sub-brands,
                  regional mutuals, MGAs, and the long tail are all there.
                </p>
                <Link
                  href={hasActivePlan ? "/build-list" : "/#pricing"}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  {hasActivePlan ? "Open Build a List" : "See pricing"}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-brand-700">
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {isAnon
              ? "Stop guessing which carriers your prospects hold."
              : "Stop guessing which carriers your prospects hold."}
          </h2>
          <p className="mt-3 text-base text-brand-100 max-w-2xl mx-auto">
            Every appointment is verified against state DOI filings and refreshed every 30 days.
            Click a carrier &mdash; get the agencies that already write on their paper.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {hasActivePlan ? (
              <Link
                href="/build-list"
                className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
              >
                Build a list
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={user ? "/#pricing" : "/sign-up"}
                className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
              >
                {user ? "See pricing" : "Get instant access"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/methodology"
              className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 inline-flex items-center gap-2"
            >
              Read the methodology
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

  if (sidebarProps) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar {...sidebarProps} />
        <div className="flex-1 min-w-0 overflow-x-hidden">{body}</div>
      </div>
    );
  }

  return body;
}

function KpiCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-navy-800">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function CarrierTile({
  rank,
  carrier,
  maxCount,
  href,
  authed,
  hasPlan,
}: {
  rank: number;
  carrier: CarrierRow;
  maxCount: number;
  href: string;
  authed: boolean;
  hasPlan: boolean;
}) {
  const pct = Math.max(1, Math.round((carrier.agency_count / maxCount) * 100));
  const showGroup =
    carrier.group_name && carrier.group_name !== carrier.name
      ? carrier.group_name
      : null;
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-md border border-gray-200 bg-white p-3 transition hover:border-brand-300 hover:bg-brand-50/30"
    >
      <div className="flex items-baseline justify-between text-[10px] text-gray-500">
        <span className="font-mono tabular-nums">
          {String(rank).padStart(2, "0")}
        </span>
        {!hasPlan && authed && (
          <span className="text-gray-400">upgrade</span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 min-h-[2.4rem] text-sm font-medium leading-tight text-navy-800 group-hover:text-brand-800">
        {carrier.name}
      </p>
      {showGroup && (
        <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500">{showGroup}</p>
      )}
      <div className="mt-2 h-[3px] overflow-hidden rounded-sm bg-gray-100">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="text-base font-semibold tabular-nums text-navy-800">
          {carrier.agency_count.toLocaleString()}
        </span>
        <span className="text-[10px] text-gray-500">agencies</span>
      </div>
    </Link>
  );
}

// Read-only preview tile shown to anonymous visitors. Names visible (drives
// brand recognition + SEO), agency counts blurred so the data itself is gated.
function CarrierTilePreview({
  rank,
  carrier,
  maxCount,
}: {
  rank: number;
  carrier: CarrierRow;
  maxCount: number;
}) {
  const pct = Math.max(1, Math.round((carrier.agency_count / maxCount) * 100));
  const showGroup =
    carrier.group_name && carrier.group_name !== carrier.name
      ? carrier.group_name
      : null;
  return (
    <div className="flex h-full flex-col rounded-md border border-gray-200 bg-white p-3">
      <div className="text-[10px] text-gray-500 font-mono tabular-nums">
        {String(rank).padStart(2, "0")}
      </div>
      <p className="mt-1 line-clamp-2 min-h-[2.4rem] text-sm font-medium leading-tight text-navy-800">
        {carrier.name}
      </p>
      {showGroup && (
        <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500">{showGroup}</p>
      )}
      <div className="mt-2 h-[3px] overflow-hidden rounded-sm bg-gray-100">
        <div
          className="h-full bg-brand-500"
          style={{ width: `${pct}%`, filter: "blur(2px)" }}
        />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between">
        <span
          className="text-base font-semibold tabular-nums text-navy-800"
          style={{ filter: "blur(4px)", userSelect: "none" }}
          aria-hidden
        >
          {carrier.agency_count.toLocaleString()}
        </span>
        <span className="text-[10px] text-gray-500">agencies</span>
      </div>
    </div>
  );
}
