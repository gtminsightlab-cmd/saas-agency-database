import Link from "next/link";
import { BookmarkCheck, Users, DownloadCloud, Clock, Mail } from "lucide-react";
import { SortableThLink, type SortDir } from "@/components/sortable-th";
import { AppShell } from "@/components/app/shell";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { MetricCard } from "@/components/app/metric-card";
import { DataTable } from "@/components/app/data-table";
import { StatusPill } from "@/components/ui/StatusPill";
import { createClient } from "@/lib/supabase/server";
import SavedListRowActions from "./row-actions";

export const dynamic = "force-dynamic";

type SortKey = "name" | "created_at" | "accounts" | "contacts" | "emails" | "has_updates";

const VALID_SORTS = new Set<SortKey>([
  "name", "created_at", "accounts", "contacts", "emails", "has_updates",
]);
function pickSort(v: string | undefined): SortKey {
  return v && VALID_SORTS.has(v as SortKey) ? (v as SortKey) : "created_at";
}
function pickDir(v: string | undefined): SortDir {
  return v === "asc" ? "asc" : "desc";
}

const LABEL: Record<SortKey, string> = {
  name: "List Name",
  created_at: "Created",
  accounts: "Accounts",
  contacts: "Contacts",
  emails: "Contacts with Emails",
  has_updates: "Updates",
};

export default async function SavedListsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const sp = await searchParams;
  const sort: SortKey = pickSort(sp.sort);
  const dir: SortDir = pickDir(sp.dir);
  const ascending = dir === "asc";

  const supabase = await createClient();

  let q = supabase
    .from("saved_lists")
    .select(
      "id,name,created_at,accounts_count,contacts_count,contacts_with_email_count,has_updates,filter_json,last_run_at,last_acknowledged_at",
      { count: "exact" }
    )
    .limit(200);

  switch (sort) {
    case "name":
      q = q.order("name", { ascending, nullsFirst: false }).order("created_at", { ascending: false });
      break;
    case "created_at":
      q = q.order("created_at", { ascending });
      break;
    case "accounts":
      q = q.order("accounts_count", { ascending, nullsFirst: false }).order("created_at", { ascending: false });
      break;
    case "contacts":
      q = q.order("contacts_count", { ascending, nullsFirst: false }).order("created_at", { ascending: false });
      break;
    case "emails":
      q = q.order("contacts_with_email_count", { ascending, nullsFirst: false }).order("created_at", { ascending: false });
      break;
    case "has_updates":
      q = q.order("has_updates", { ascending }).order("created_at", { ascending: false });
      break;
  }

  const { data: lists, count } = await q;
  const rows = lists ?? [];

  // KPI aggregates. Constrained to the 200-row page; users with >200 lists
  // will see approximate per-list sums. Total Lists uses the exact count.
  const totalLists = count ?? 0;
  const totalAgencies = rows.reduce((acc: number, l: any) => acc + (l.accounts_count ?? 0), 0);
  const totalContacts = rows.reduce((acc: number, l: any) => acc + (l.contacts_count ?? 0), 0);
  const readyToExportCount = rows.filter((l: any) => l.has_updates).length;
  const lastRefreshAt = rows
    .map((l: any) => l.last_run_at as string | null)
    .filter(Boolean)
    .sort()
    .reverse()[0] as string | undefined;
  const lastRefreshLabel = lastRefreshAt
    ? new Date(lastRefreshAt).toISOString().slice(0, 10)
    : "—";

  function sortHref(key: SortKey): string {
    const params = new URLSearchParams();
    if (key === sort) {
      params.set("sort", key);
      params.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", key);
      params.set("dir", key === "name" || key === "has_updates" ? "asc" : "desc");
    }
    return `/saved-lists?${params.toString()}`;
  }

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { href: "/home", label: "Home" },
          { label: "Recruit Lists" },
        ]}
      />
      <PageHeader
        title="Recruit Lists"
        subtitle="Saved targeting lists you can refresh, share, and export. Rows tinted teal have new data ready for delta export."
        actions={
          <Link
            href="/build-list"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Build a Recruit List
          </Link>
        }
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard title="Total Lists" value={totalLists} icon={BookmarkCheck} />
          <MetricCard title="Agencies Saved" value={totalAgencies} icon={Users} subtitle="Across all lists" />
          <MetricCard title="Contacts Saved" value={totalContacts} icon={Mail} subtitle="Across all lists" />
          <MetricCard
            title="Ready to Export"
            value={readyToExportCount}
            icon={DownloadCloud}
            subtitle="Lists with new data"
            href={readyToExportCount > 0 ? "/saved-lists?sort=has_updates&dir=desc" : undefined}
          />
          <MetricCard title="Last Refresh" value={lastRefreshLabel} icon={Clock} />
        </div>

        {/* Sort + total bar */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Sorted by <span className="font-semibold text-gray-700">{LABEL[sort]}</span>{" "}
            <span className="font-semibold text-gray-700">{dir === "asc" ? "↑" : "↓"}</span>
          </div>
          <div>
            Total Records: <span className="font-semibold text-gray-900">{count ?? 0}</span>
          </div>
        </div>

        {/* Table */}
        <DataTable
          state={rows.length === 0 ? "empty" : "ready"}
          emptyHeading="No recruit lists yet"
          emptyBody="Build your first targeting list on the Build Recruit List page. We'll save it here for refresh, sharing, and export."
          emptyAction={
            <Link
              href="/build-list"
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Build a Recruit List
            </Link>
          }
        >
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <SortableThLink label="List Name"            sortKey="name"        activeSort={sort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Created"              sortKey="created_at"  activeSort={sort} dir={dir} hrefFor={sortHref} />
                <SortableThLink label="Accounts"             sortKey="accounts"    activeSort={sort} dir={dir} hrefFor={sortHref} align="right" />
                <SortableThLink label="Contacts"             sortKey="contacts"    activeSort={sort} dir={dir} hrefFor={sortHref} align="right" />
                <SortableThLink label="Contacts with Emails" sortKey="emails"      activeSort={sort} dir={dir} hrefFor={sortHref} align="right" />
                <SortableThLink label="Updates?"             sortKey="has_updates" activeSort={sort} dir={dir} hrefFor={sortHref} />
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((l: any) => {
                const qs: string | null =
                  typeof l.filter_json?.querystring === "string"
                    ? l.filter_json.querystring
                    : null;
                const lastRunLabel = l.last_run_at
                  ? `Last checked ${new Date(l.last_run_at).toISOString().slice(0, 10)}`
                  : "Not yet checked";
                return (
                  <tr
                    key={l.id}
                    className={l.has_updates ? "bg-brand-50/60 hover:bg-brand-50" : "hover:bg-gray-50"}
                    title={lastRunLabel}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/build-list/download?id=${l.id}&name=${encodeURIComponent(l.name)}`}
                        className="font-semibold text-brand-700 hover:text-brand-800"
                      >
                        {l.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(l.created_at).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {l.accounts_count?.toLocaleString?.() ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {l.contacts_count?.toLocaleString?.() ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {l.contacts_with_email_count?.toLocaleString?.() ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        tone={l.has_updates ? "success" : "neutral"}
                        label={l.has_updates ? "Yes" : "No"}
                        srPrefix="Updates available"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <SavedListRowActions
                        id={l.id}
                        name={l.name}
                        filterQs={qs}
                        hasUpdates={!!l.has_updates}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTable>
      </div>
    </AppShell>
  );
}
