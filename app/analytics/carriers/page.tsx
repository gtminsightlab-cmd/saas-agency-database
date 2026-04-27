import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";
import { Sidebar } from "@/components/app/sidebar";
import { CarriersGrid } from "./grid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carrier appointments analytics | Seven16 Agency Directory",
  description:
    "Find agencies appointed with any of 1,300+ carriers. All carriers with 150+ appointed agencies, multi-select for batch list-building.",
};

export type CarrierRow = {
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

const MIN_AGENCY_THRESHOLD = 150;

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

  // Fetch ALL active carriers (1,363) so the search input can find anything;
  // the default grid view filters down to >= MIN_AGENCY_THRESHOLD client-side.
  const [topRes, kpiRes] = await Promise.all([
    supabase.rpc("get_all_active_carriers_with_counts"),
    supabase.rpc("get_carrier_analytics_kpis"),
  ]);

  const allCarriers: CarrierRow[] = (Array.isArray(topRes.data) ? topRes.data : []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => ({
      id: r.id,
      name: r.name,
      group_name: r.group_name,
      agency_count: Number(r.agency_count ?? 0),
    })
  );

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

  const isAnon = !user;
  const totalCarriers = allCarriers.length;

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
              Click one or more carriers to build a list of agencies appointed with them.
              Default view: every carrier with at least {MIN_AGENCY_THRESHOLD} appointed agencies (212). Search to find any of the {kpis.active_carriers.toLocaleString()} active carriers. The full directory has{" "}
              {kpis.active_carriers.toLocaleString()} active carriers; the long tail is searchable
              in the build-list filter.
            </p>
            {isAnon && (
              <p className="mt-3 text-sm text-brand-700 font-medium">
                Sign in to build a list, multi-select carriers, and click through to the directory.
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

      {/* GRID — handed to client component for selection state + Load more */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <CarriersGrid
          carriers={allCarriers}
          isAnon={isAnon}
          hasActivePlan={hasActivePlan}
          minThreshold={MIN_AGENCY_THRESHOLD}
          authed={!!user}
        />
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-brand-700">
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Stop guessing which carriers your prospects hold.
          </h2>
          <p className="mt-3 text-base text-brand-100 max-w-2xl mx-auto">
            Every appointment is verified against state DOI filings and refreshed every 30 days.
            Pick a few carriers &mdash; get the agencies that already write on their paper.
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
