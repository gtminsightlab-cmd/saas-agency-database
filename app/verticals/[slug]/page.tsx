import Link from "next/link";
import { ArrowRight, ExternalLink, Truck, Crosshair } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/nav";
import { Sidebar } from "@/components/app/sidebar";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type CarrierSegmentRow = {
  carrier_id: string;
  carrier_name: string;
  group_name: string | null;
  segment: string;
  rationale: string | null;
  agency_count: number;
};

type Vertical = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

const SEGMENT_META: Record<string, { label: string; color: string; bg: string; border: string; order: number }> = {
  non_fleet_specialist:    { label: "Non-fleet specialist",  color: "text-brand-800",   bg: "bg-brand-50",   border: "border-brand-200",   order: 1 },
  mid_market_mixed:        { label: "Mid-market / mixed",    color: "text-navy-800",    bg: "bg-navy-50",    border: "border-navy-200",    order: 2 },
  mid_fleet_specialist:    { label: "Mid-fleet specialist",  color: "text-gold-800",    bg: "bg-gold-50",    border: "border-gold-200",    order: 3 },
  large_fleet_specialist:  { label: "Large-fleet specialist",color: "text-success-800", bg: "bg-success-50", border: "border-success-200", order: 4 },
  specialty_es_niche:      { label: "Specialty E&S / niche", color: "text-navy-800",    bg: "bg-gray-100",   border: "border-gray-300",    order: 5 },
  unknown:                 { label: "Unsegmented",           color: "text-gray-600",    bg: "bg-gray-50",    border: "border-gray-200",    order: 9 },
};

export default async function VerticalDetailPage({ params: _params }: { params: Promise<{ slug: string }> }) {
  const params = await _params;
  const supabase = await createClient();
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

  const { data: verticalRow } = await supabase
    .from("vertical_markets")
    .select("id, slug, name, description")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!verticalRow) notFound();
  const vertical = verticalRow as Vertical;

  const { data: rpcRows } = await supabase.rpc("get_vertical_carriers_with_segments", {
    p_slug: params.slug,
  });
  const carriers: CarrierSegmentRow[] = Array.isArray(rpcRows)
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rpcRows as any[]).map((r) => ({
        carrier_id:   r.carrier_id,
        carrier_name: r.carrier_name,
        group_name:   r.group_name,
        segment:      r.segment,
        rationale:    r.rationale,
        agency_count: Number(r.agency_count ?? 0),
      }))
    : [];

  // Group by segment for the segment summary at top
  const bySegment: Record<string, CarrierSegmentRow[]> = {};
  for (const c of carriers) {
    if (!bySegment[c.segment]) bySegment[c.segment] = [];
    bySegment[c.segment].push(c);
  }
  const segmentOrder = Object.keys(bySegment).sort(
    (a, b) => (SEGMENT_META[a]?.order ?? 99) - (SEGMENT_META[b]?.order ?? 99)
  );

  const isTrucking = params.slug === "transportation";
  const segmentedCount = carriers.filter((c) => c.segment !== "unknown").length;

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

  const allCarriersHref = hasActivePlan
    ? `/build-list/review?cr=${carriers.map((c) => c.carrier_id).join(",")}&cr_c=or&c=US`
    : user
    ? `/#pricing`
    : `/sign-up?vertical=${vertical.slug}`;

  const tileHref = (carrierId: string) => {
    if (hasActivePlan) return `/build-list/review?cr=${carrierId}&cr_c=or&c=US`;
    if (user) return `/#pricing`;
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
              <Crosshair className="h-3.5 w-3.5" />
              Vertical &middot; {vertical.name}
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
              {vertical.name} carriers &amp; segments
            </h1>
            {vertical.description && (
              <p className="mt-4 text-base leading-7 text-gray-600">
                {vertical.description}
              </p>
            )}
            <p className="mt-3 text-sm text-gray-600">
              <strong className="text-navy-800">{carriers.length}</strong> carriers mapped to this vertical
              {isTrucking && (
                <>
                  {" "}&mdash; <strong className="text-navy-800">{segmentedCount}</strong> classified by appointment behavior
                  ({carriers.length - segmentedCount} pending trucking-specific evidence)
                </>
              )}
              .
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/verticals/${vertical.slug}/open`}
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Open targeted list
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/verticals"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back to all verticals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SISTER-PRODUCT CROSS-REFERENCE — trucking only */}
      {isTrucking && (
        <section className="mx-auto max-w-7xl px-4 pt-8">
          <a
            href="https://www.dotintel.io/solutions"
            target="_blank"
            rel="noopener"
            className="group flex flex-col gap-4 rounded-lg border border-navy-200 bg-gradient-to-r from-navy-50 to-white px-6 py-5 transition hover:border-navy-300 hover:bg-navy-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <span className="mt-0.5 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-navy-100 text-navy-700">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-600">
                  <span>Sister product · Seven16 Group</span>
                </div>
                <p className="mt-1 text-base font-semibold text-navy-800">
                  Need fleet &amp; non-fleet carrier-side data?
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  DOT Intel covers the carrier side: FMCSA filings, power-units, operating authority, coverage limits, and active insurer per DOT — for fleet and non-fleet trucking. Agency Signal (here) covers the distribution side.
                </p>
              </div>
            </div>
            <span className="inline-flex flex-none items-center gap-2 rounded-md border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 group-hover:border-navy-300 group-hover:bg-navy-50">
              Open DOT Intel
              <ExternalLink className="h-4 w-4" />
            </span>
          </a>
        </section>
      )}

      {/* SEGMENT GROUPS */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        {carriers.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
            No carriers mapped yet.
          </div>
        ) : (
          <div className="space-y-10">
            {segmentOrder.map((segKey) => {
              const meta = SEGMENT_META[segKey] ?? SEGMENT_META.unknown;
              const items = bySegment[segKey];
              return (
                <div key={segKey}>
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border ${meta.border} ${meta.bg} ${meta.color} px-3 py-1 text-xs font-semibold`}>
                        {isTrucking && <Truck className="h-3 w-3" />}
                        {meta.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {items.length} carrier{items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {segKey === "unknown" && isTrucking && (
                      <span className="text-xs text-gray-500 italic">
                        needs trucking-specific evidence
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((c) => (
                      <Link
                        key={c.carrier_id}
                        href={tileHref(c.carrier_id)}
                        className="group flex h-full flex-col rounded-md border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-tight text-navy-800 group-hover:text-brand-800">
                              {c.carrier_name}
                            </p>
                            {c.group_name && c.group_name !== c.carrier_name && (
                              <p className="mt-0.5 text-[11px] text-gray-500">{c.group_name}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-base font-semibold tabular-nums text-navy-800">
                            {c.agency_count.toLocaleString()}
                          </span>
                        </div>
                        {c.rationale && (
                          <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-gray-500 italic">
                            {c.rationale}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                          <span>agencies appointed</span>
                          <span className="inline-flex items-center gap-1 text-brand-700 font-semibold group-hover:text-brand-800">
                            Build list
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-brand-700">
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Want every agency appointed with these {carriers.length} carriers?
          </h2>
          <p className="mt-3 text-base text-brand-100 max-w-2xl mx-auto">
            One click pre-filters /build-list to all of them with carrier-OR logic.
            Or click any single carrier above to drill in.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={allCarriersHref}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-brand-50 inline-flex items-center gap-2 shadow-sm"
            >
              {hasActivePlan ? "Build list — all carriers" : user ? "See pricing" : "Get instant access"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/methodology"
              className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
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
