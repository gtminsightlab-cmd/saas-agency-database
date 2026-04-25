import Link from "next/link";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import SavedListRowActions from "./row-actions";

export const dynamic = "force-dynamic";

export default async function SavedListsPage() {
  const supabase = createClient();
  const { data: lists, count } = await supabase
    .from("saved_lists")
    .select(
      "id,name,created_at,accounts_count,contacts_count,contacts_with_email_count,has_updates,filter_json",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(200);

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

        <div className="mb-2 text-right text-sm text-gray-500">
          Total Records: <span className="font-semibold text-gray-900">{count ?? 0}</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">List Name</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Accounts</th>
                <th className="px-4 py-3 text-right">Contacts</th>
                <th className="px-4 py-3 text-right">Contacts with Emails</th>
                <th className="px-4 py-3">Updates?</th>
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
