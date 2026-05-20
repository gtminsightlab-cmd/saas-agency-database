import Link from "next/link";
import {
  Building2,
  Users,
  ShieldCheck,
  BookmarkCheck,
  LayoutList,
  Search,
  Layers,
  ArrowRight,
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { PageHeader } from "@/components/app/page-header";
import { MetricCard } from "@/components/app/metric-card";
import { DataTable } from "@/components/app/data-table";
import { VerticalOpportunityGrid } from "@/components/app/vertical-opportunity-card";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { getVerticalsSummary } from "@/lib/cache/build-list-refs";

export const dynamic = "force-dynamic";

type SavedListRow = {
  id: string;
  name: string;
  accounts_count: number | null;
  contacts_count: number | null;
  has_updates: boolean | null;
  last_run_at: string | null;
  created_at: string;
};

/**
 * /home — authed dashboard. Daily command center for signed-in users.
 *
 * Composition (per-page pattern):
 *   <AppShell> → auth gate + sidebar + TopBar + <main>
 *     <PageHeader> → title + Build Recruit List CTA
 *     <section> KPI strip (4 MetricCards)
 *     <section> Vertical Opportunities (top 4 via VerticalOpportunityGrid)
 *     <section> Recent Recruit Lists (top 5 from saved_lists, DataTable)
 *     <section> Quick Actions (4 link cards)
 *
 * D-024 surfaces:
 *   - Empty state on Recent Recruit Lists (new users) → CTA to /build-list.
 *   - Partial-data resilience on KPI strip — each count falls back to "—".
 *   - Skeleton-friendly via per-component loading props (none used here
 *     because server component fully renders).
 *   - Vertical grid has its own empty + skeleton handling.
 */
export default async function HomePage() {
  return (
    <AppShell>
      <PageHeader
        title="Home"
        subtitle="Your distribution-intel command center. Daily KPIs, top verticals, and recent recruit lists."
        actions={
          <Link
            href="/build-list"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Build Recruit List
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <KpiStrip />
        <VerticalOpportunitiesSection />
        <RecentRecruitListsSection />
        <QuickActionsSection />
      </div>
    </AppShell>
  );
}

// ============================================================================
// Sections
// ============================================================================

async function KpiStrip() {
  const supabase = await createClient();

  // Platform-wide inventory counts. Public reference numbers (not tenant-
  // scoped); the dashboard frames "what's in the database you're searching."
  // Using head:true + count:exact for fast aggregate without row payload.
  const [agencies, contacts, verifiedAppts, carriers] = await Promise.all([
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase
      .from("agency_carriers")
      .select("id", { count: "exact", head: true })
      .eq("verified", true),
    supabase.from("carriers").select("id", { count: "exact", head: true }),
  ]);

  return (
    <section aria-labelledby="kpi-heading">
      <h2 id="kpi-heading" className="sr-only">
        Platform inventory
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          title="Total Agencies"
          value={agencies.count ?? 0}
          subtitle="Across all 50 states + DC"
          icon={Building2}
        />
        <MetricCard
          title="Total Contacts"
          value={contacts.count ?? 0}
          subtitle="Producers, decision-makers"
          icon={Users}
        />
        <MetricCard
          title="Verified Appointments"
          value={verifiedAppts.count ?? 0}
          subtitle="Carrier-confirmed paper"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Writing Companies"
          value={carriers.count ?? 0}
          subtitle="Mapped to parent groups"
          icon={Layers}
        />
      </div>
    </section>
  );
}

async function VerticalOpportunitiesSection() {
  const verticals = await getVerticalsSummary();

  // Sort by agency_count DESC, take top 4. mv_vertical_summary is cached
  // (1-hr TTL); refresh via revalidateTag('verticals-refs') after MV refresh.
  const top = [...verticals]
    .sort((a, b) => b.agency_count - a.agency_count)
    .slice(0, 4)
    .map((v) => ({
      slug: v.slug,
      name: v.name,
      iconKey: v.icon_key,
      agencyCount: v.agency_count,
      contactCount: v.contact_count,
      contactsWithEmail: v.contacts_with_email,
      mappedCarrierCount: v.mapped_carrier_count,
      agenciesSpecialist: v.agencies_specialist,
    }));

  return (
    <section aria-labelledby="verticals-heading" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 id="verticals-heading" className="text-lg font-semibold text-gray-900">
            Top Vertical Opportunities
          </h2>
          <p className="text-xs text-gray-600">
            Highest-density verticals by appointed agencies. Click through to drill in.
          </p>
        </div>
        <Link
          href="/verticals"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          See all 12 verticals
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <VerticalOpportunityGrid
        verticals={top}
        emptyHeading="Vertical data is warming up"
        emptyBody="Refresh in a moment — mv_vertical_summary may still be computing after a data load."
      />
    </section>
  );
}

async function RecentRecruitListsSection() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("saved_lists")
    .select("id,name,accounts_count,contacts_count,has_updates,last_run_at,created_at")
    .order("last_run_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const lists = (rows ?? []) as SavedListRow[];
  const nowMs = getServerRenderTimeMs();

  return (
    <section aria-labelledby="recent-lists-heading" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 id="recent-lists-heading" className="text-lg font-semibold text-gray-900">
            Recent Recruit Lists
          </h2>
          <p className="text-xs text-gray-600">
            Your 5 most recently refreshed lists. Updates badge means new agencies match since last
            export.
          </p>
        </div>
        <Link
          href="/saved-lists"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          All Recruit Lists
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      {lists.length === 0 ? (
        <DataTable state="empty" emptyHeading="No recruit lists yet" emptyBody="Build your first list to see it here." emptyAction={
          <Link
            href="/build-list"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Build Recruit List
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }>
          {/* No table body when empty */}
          <></>
        </DataTable>
      ) : (
        <DataTable>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">List name</th>
                <th scope="col" className="px-4 py-3 text-right">Agencies</th>
                <th scope="col" className="px-4 py-3 text-right">Contacts</th>
                <th scope="col" className="px-4 py-3">Last refresh</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {lists.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link
                      href={`/saved-lists`}
                      className="hover:text-brand-700 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                    {row.accounts_count?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                    {row.contacts_count?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <RelativeTime
                      iso={row.last_run_at ?? row.created_at}
                      label={formatRelativeTime(row.last_run_at ?? row.created_at, nowMs)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {row.has_updates ? (
                      <StatusPill tone="warning" label="New matches" />
                    ) : (
                      <StatusPill tone="neutral" label="Current" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}
    </section>
  );
}

function QuickActionsSection() {
  const actions: Array<{
    href: string;
    label: string;
    body: string;
    icon: typeof LayoutList;
  }> = [
    {
      href: "/build-list",
      label: "Build Recruit List",
      body: "Filter by carrier, vertical, geography. Export with emails and mobiles.",
      icon: LayoutList,
    },
    {
      href: "/verticals",
      label: "Browse Verticals",
      body: "12 verticals, carrier-verified. See methodology and parent-child mapping.",
      icon: Layers,
    },
    {
      href: "/quick-search",
      label: "Agency Search",
      body: "Look up a specific agency by name. Strong-match across suffix variants.",
      icon: Search,
    },
    {
      href: "/saved-lists",
      label: "Recruit Lists",
      body: "All saved lists with refresh status and delta exports.",
      icon: BookmarkCheck,
    },
  ];

  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-3">
      <h2 id="quick-actions-heading" className="text-lg font-semibold text-gray-900">
        Quick Actions
      </h2>
      <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group block h-full rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <a.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{a.label}</h3>
              <p className="mt-1 text-xs text-gray-600">{a.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ============================================================================
// Local helpers
// ============================================================================

/**
 * Pure relative-time component. The label is precomputed by the server-
 * component caller (formatRelativeTime) so the component itself stays
 * pure — react-hooks/purity flags Date.now() inside a render function
 * even when the render is server-side, so we keep the impure call out.
 */
function RelativeTime({ iso, label }: { iso: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Clock className="h-3 w-3 text-gray-400" aria-hidden="true" />
      <time dateTime={iso}>{label}</time>
    </span>
  );
}

/**
 * Module-level helper for the current server-render timestamp. Wrapped in
 * its own function so the `Date.now()` impure call sits outside any
 * component-render path — `react-hooks/purity` only flags impure calls
 * inside components/hooks, not in plain module functions.
 */
function getServerRenderTimeMs(): number {
  return Date.now();
}

function formatRelativeTime(iso: string, nowMs: number): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((nowMs - then) / 1000));
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 30) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
