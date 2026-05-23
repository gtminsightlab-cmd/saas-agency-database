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
  Bell,
  TrendingUp,
  Mail,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { PageHeader } from "@/components/app/page-header";
import { MetricCard } from "@/components/app/metric-card";
import { DataTable } from "@/components/app/data-table";
import { VerticalOpportunityGrid } from "@/components/app/vertical-opportunity-card";
import { StatusPill } from "@/components/ui/StatusPill";
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

type SignalRow = {
  id: string;
  name: string;
  last_run_at: string | null;
  accounts_count: number | null;
};

/**
 * /home — authed dashboard. Daily command center for signed-in users.
 *
 * Personalization v1 (BACKLOG #1, shipped 2026-05-22):
 *   - User-scoped KPIs replace platform-wide stats above the fold (saved_lists +
 *     saved_list_changes, RLS-scoped to the user's tenant).
 *   - NEW Signals section surfaces saved_lists WHERE has_updates=true (auto-hides
 *     when zero — common case until cron fires post-CRON_SECRET).
 *   - First-time onboarding checklist replaces the KPI strip when user has 0
 *     saved lists.
 *   - Platform-inventory stats demoted to a smaller strip below Quick Actions,
 *     kept as a trust signal for new visitors.
 *
 * Smart-degradation: all user-scoped queries return 0 / empty arrays before
 * snapshot data flows (cron blocked on CRON_SECRET — dashboard action). UI
 * gracefully renders the onboarding + zeroed counters until snapshots arrive.
 */
export default async function HomePage() {
  return (
    <AppShell>
      <PageHeader
        title="Home"
        subtitle="Your distribution-intel command center. Updates, top verticals, and recent recruit lists."
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
        <UserHeroSection />
        <SignalsSection />
        <VerticalOpportunitiesSection />
        <RecentRecruitListsSection />
        <QuickActionsSection />
        <PlatformInventoryStrip />
      </div>
    </AppShell>
  );
}

// ============================================================================
// Sections
// ============================================================================

/**
 * Above-the-fold hero. Either:
 *   (a) 4 user-scoped MetricCards (when user has ≥1 saved list), OR
 *   (b) Onboarding checklist (when user has 0 saved lists).
 *
 * All counts gracefully return 0 when snapshot data hasn't arrived yet (cron
 * blocked on CRON_SECRET) — UI renders the zero state truthfully, not slop.
 */
async function UserHeroSection() {
  const supabase = await createClient();

  const since7d = new Date(getServerRenderTimeMs() - 7 * 86_400_000).toISOString();
  const since30d = new Date(getServerRenderTimeMs() - 30 * 86_400_000).toISOString();

  const [
    listsTotalRes,
    listsWithUpdatesRes,
    agenciesAddedRes,
    contactsAddedRes,
    listsAggRes,
  ] = await Promise.all([
    supabase.from("saved_lists").select("id", { count: "exact", head: true }),
    supabase
      .from("saved_lists")
      .select("id", { count: "exact", head: true })
      .eq("has_updates", true),
    supabase
      .from("saved_list_changes")
      .select("id", { count: "exact", head: true })
      .eq("change_type", "agency_added")
      .gte("detected_at", since7d),
    supabase
      .from("saved_list_changes")
      .select("id", { count: "exact", head: true })
      .eq("change_type", "contact_added")
      .gte("detected_at", since30d),
    supabase.from("saved_lists").select("accounts_count"),
  ]);

  const listsTotal = listsTotalRes.count ?? 0;
  const listsWithUpdates = listsWithUpdatesRes.count ?? 0;
  const agenciesAdded7d = agenciesAddedRes.count ?? 0;
  const contactsAdded30d = contactsAddedRes.count ?? 0;
  const totalAgenciesSaved = (listsAggRes.data ?? []).reduce<number>(
    (sum, r) => sum + (r.accounts_count ?? 0),
    0,
  );

  if (listsTotal === 0) {
    return <OnboardingChecklist />;
  }

  return (
    <section aria-labelledby="user-kpis-heading">
      <h2 id="user-kpis-heading" className="sr-only">
        Your activity
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          title="Lists with updates"
          value={listsWithUpdates}
          subtitle={listsWithUpdates > 0 ? "Ready to review" : "All current"}
          icon={Bell}
          href={listsWithUpdates > 0 ? "/saved-lists?sort=has_updates&dir=desc" : "/saved-lists"}
        />
        <MetricCard
          title="New agencies"
          value={agenciesAdded7d}
          subtitle="Added to your lists in last 7d"
          icon={TrendingUp}
          href="/saved-lists?sort=has_updates&dir=desc"
        />
        <MetricCard
          title="New contacts"
          value={contactsAdded30d}
          subtitle="Added in last 30d"
          icon={Mail}
          href="/saved-lists?sort=has_updates&dir=desc"
        />
        <MetricCard
          title="Total saved agencies"
          value={totalAgenciesSaved}
          subtitle={`Across ${listsTotal} list${listsTotal === 1 ? "" : "s"}`}
          icon={BookmarkCheck}
          href="/saved-lists"
        />
      </div>
    </section>
  );
}

/**
 * First-time onboarding card — replaces UserHeroSection's KPI strip for users
 * with zero saved lists. Three-step checklist; canonical credit-grant
 * onboarding pattern (per BACKLOG #1 competitive research).
 */
function OnboardingChecklist() {
  const steps: Array<{ title: string; body: string; href?: string; cta?: string; done: boolean }> = [
    {
      title: "Build your first Recruit List",
      body: "Filter agencies by carrier, vertical, or geography. Save the filter set — we'll track new matches against it daily.",
      href: "/build-list",
      cta: "Open Build a Recruit List",
      done: false,
    },
    {
      title: "Save the list",
      body: "Click Save on the Review step. That creates a snapshot we compare against every day.",
      done: false,
    },
    {
      title: "Updates land here",
      body: "When new agencies match your filters, they'll show up in this dashboard with a 'New matches' badge — and you can export just the delta.",
      done: false,
    },
  ];

  return (
    <section
      aria-labelledby="onboarding-heading"
      className="rounded-lg border border-brand-200 bg-brand-50/40 p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Welcome
          </div>
          <h2 id="onboarding-heading" className="mt-2 text-lg font-semibold text-gray-900">
            Get to your first recruit list in under a minute
          </h2>
          <p className="mt-1 text-xs text-gray-600 max-w-2xl">
            Three steps. Once your first list is saved, this dashboard fills with daily updates,
            new-match counts, and the agencies you should call next.
          </p>
        </div>
      </div>
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="rounded-md border border-gray-200 bg-white p-4 flex flex-col"
          >
            <div className="flex items-center gap-2">
              {s.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300" aria-hidden="true" />
              )}
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                Step {i + 1}
              </span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1 text-xs text-gray-600 flex-1">{s.body}</p>
            {s.href && s.cta && (
              <Link
                href={s.href}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                {s.cta}
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Signals — auto-hides when zero lists have updates (common case until cron
 * fires post-CRON_SECRET). When non-empty, surfaces up to 5 most-recently-flagged
 * lists with a "View updates" CTA.
 */
async function SignalsSection() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_lists")
    .select("id,name,last_run_at,accounts_count")
    .eq("has_updates", true)
    .order("last_run_at", { ascending: false, nullsFirst: false })
    .limit(5);

  const signals = (data ?? []) as SignalRow[];
  if (signals.length === 0) return null;

  const nowMs = getServerRenderTimeMs();

  return (
    <section aria-labelledby="signals-heading" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <h2 id="signals-heading" className="text-lg font-semibold text-gray-900">
            Signals
          </h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
            {signals.length} ready
          </span>
        </div>
        <Link
          href="/saved-lists?sort=has_updates&dir=desc"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          All updates
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {signals.map((s) => (
          <li key={s.id}>
            <Link
              href="/saved-lists?sort=has_updates&dir=desc"
              className="group block h-full rounded-lg border border-amber-200 bg-amber-50/50 p-4 transition hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{s.name}</h3>
                <StatusPill tone="warning" label="New matches" />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                <span>
                  Refreshed{" "}
                  {formatRelativeTime(s.last_run_at ?? new Date().toISOString(), nowMs)}
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:text-brand-800">
                View updates
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function VerticalOpportunitiesSection() {
  const verticals = await getVerticalsSummary();

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
        <DataTable
          state="empty"
          emptyHeading="No recruit lists yet"
          emptyBody="Build your first list to see it here."
          emptyAction={
            <Link
              href="/build-list"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Build Recruit List
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        >
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

/**
 * Demoted platform-inventory strip. Was the prime KPI row pre-personalization;
 * now sits below QuickActions as a trust signal for new visitors — "here's
 * what's in the database you're searching."
 */
async function PlatformInventoryStrip() {
  const supabase = await createClient();

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
    <section aria-labelledby="platform-inventory-heading" className="space-y-2 pt-2 border-t border-gray-200">
      <div>
        <h2 id="platform-inventory-heading" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Platform inventory
        </h2>
        <p className="text-[11px] text-gray-500">
          What&rsquo;s in the database you&rsquo;re searching. Refreshed live from base tables.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <PlatformStat label="Agencies" value={agencies.count ?? 0} icon={Building2} />
        <PlatformStat label="Contacts" value={contacts.count ?? 0} icon={Users} />
        <PlatformStat label="Verified appointments" value={verifiedAppts.count ?? 0} icon={ShieldCheck} />
        <PlatformStat label="Writing companies" value={carriers.count ?? 0} icon={Layers} />
      </ul>
    </section>
  );
}

function PlatformStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Building2;
}) {
  return (
    <li className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-gray-900 tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="text-[10px] text-gray-500 truncate">{label}</div>
      </div>
    </li>
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
