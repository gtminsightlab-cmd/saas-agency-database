import Link from "next/link";
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import SavedListRowActions from "./row-actions";

export const dynamic = "force-dynamic";

type SortKey = "name" | "created_at" | "accounts" | "contacts" | "emails" | "has_updates";
type SortDir = "asc" | "desc";

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
  searchParams: { sort?: string; dir?: string };
}) {
  const sort: SortKey = pickSort(searchParams.sort);
  const dir: SortDir = pickDir(searchParams.dir);
  const ascending = dir === "asc";

  const supabase = createClient();

  let q = supabase
    .from("saved_lists")
    .select(
      "id,name,created_at,accounts_count,contacts_count,contacts_with_email_count,has_updates,filter_json",
      { count: "exact" }
    )
    .limit(200);

  // Apply primary sort + secondary by created_at desc to stabilize ties.
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
      // sort by boolean — true grouped first when desc
      q = q.order("has_updates", { ascending }).order("created_at", { ascending: false });
      break;
  }

  const { data: lists, count } = await q;

  function sortHref(key: SortKey): string {
    const params = new URLSearchParams();
    if (key === sort) {
      params.set("sort", key);
      params.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", key);
      // Numeric/date columns default to descending (most useful first); name + has_updates default ascending.
      params.set("dir", key === "name" || key === "has_updates" ? "asc" : "desc");
    }
    return `/saved-lists?${params.toString()}`;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Saved Lists</h1>
            <p className="mt-2 text-sm text-gray-600">
              Click a list name to review and download. Use the action icons to edit filters, download a CSV, or delete a list.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Type to Search lists"
              className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
          <div>
            Sorted by <span className="font-semibold text-gray-700">{LABEL[sort]}</span>{" "}
            <span className="font-semibold text-gray-700">{dir === "asc" ? "↑" : "↓"}</span>
          </div>
          <div>
            Total Records: <span className="font-semibold text-gray-900">{count ?? 0}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <SortableTh label="List Name"            sortKey="name"        activeSort={sort} dir={dir} hrefFor={sortHref} />
                <SortableTh label="Created"              sortKey="created_at"  activeSort={sort} dir={dir} hrefFor={sortHref} />
                <SortableTh label="Accounts"             sortKey="accounts"    activeSort={sort} dir={dir} hrefFor={sortHref} align="right" />
                <SortableTh label="Contacts"             sortKey="contacts"    activeSort={sort} dir={dir} hrefFor={sortHref} align="right" />
                <SortableTh label="Contacts with Emails" sortKey="emails"      activeSort={sort} dir={dir} hrefFor={sortHref} align="right" />
                <SortableTh label="Updates?"             sortKey="has_updates" activeSort={sort} dir={dir} hrefFor={sortHref} />
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(lists ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    You haven&apos;t saved any lists yet. Build one on the{" "}
                    <Link href="/build-list" className="text-brand-600 font-semibold">
                      Build a List
                    </Link>{" "}
                    page.
                  </td>
                </tr>
              ) : (
                lists!.map((l: any) => {
                  const qs: string | null =
                    typeof l.filter_json?.querystring === "string"
                      ? l.filter_json.querystring
                      : null;
                  return (
                    <tr key={l.id}>
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
                        <span className={l.has_updates ? "text-brand-600 font-medium" : "text-gray-500"}>
                          {l.has_updates ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <SavedListRowActions id={l.id} name={l.name} filterQs={qs} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href="/build-list"
            className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Build a New List
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function SortableTh({
  label, sortKey, activeSort, dir, hrefFor, align,
}: {
  label: string;
  sortKey: SortKey;
  activeSort: SortKey;
  dir: SortDir;
  hrefFor: (key: SortKey) => string;
  align?: "right";
}) {
  const isActive = activeSort === sortKey;
  return (
    <th className={"px-4 py-3 " + (align === "right" ? "text-right" : "")}>
      <Link
        href={hrefFor(sortKey)}
        className={
          "inline-flex items-center gap-1 group " +
          (isActive ? "text-brand-700 font-semibold" : "text-gray-600 hover:text-gray-900")
        }
        title={isActive ? `Sort ${dir === "asc" ? "descending" : "ascending"}` : `Sort by ${label}`}
      >
        {label}
        {isActive ? (
          dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-60" />
        )}
      </Link>
    </th>
  );
}
