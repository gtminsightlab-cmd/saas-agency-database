import { AppShell } from "@/components/app/shell";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/server";
import { RecordsCounter } from "@/components/build-list/records-counter";
import { SearchShell } from "./search-shell";

export const dynamic = "force-dynamic";

const TAB_EXPLAINERS: Record<string, string> = {
  agencies: "Search the directory of agencies by name. Filter and sort the results once you have a query.",
  contacts: "Search contacts by the agency they belong to. Person-name search is on the roadmap.",
  carriers: "Browse every carrier with appointment relationships in the directory.",
  verticals: "Pick a vertical to see exposure depth across agencies, contacts, and carriers."
};

export default async function QuickSearchPage() {
  const supabase = await createClient();
  const [accountsRes, contactsRes, contactsEmailRes] = await Promise.all([
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }).not("email_primary", "is", null)
  ]);

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { href: "/home", label: "Home" },
          { label: "Agency Search" }
        ]}
      />
      <PageHeader
        title="Agency Search"
        subtitle="Search across agencies, contacts, carriers, and verticals from one place. Type to filter; switch tabs to change what you're searching."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <SearchShell
          beforeTabs={
            <RecordsCounter
              accounts={accountsRes.count ?? 0}
              contacts={contactsRes.count ?? 0}
              contactsWithEmail={contactsEmailRes.count ?? 0}
            />
          }
        >
          {({ tab, debouncedQuery }) => (
            <div className="rounded-lg border border-gray-200 bg-white p-8">
              <p className="text-sm text-gray-600">{TAB_EXPLAINERS[tab]}</p>
              <p className="mt-4 text-xs uppercase tracking-wider text-gray-400">
                {debouncedQuery ? `Query: "${debouncedQuery}"` : "Type to search"}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Tab implementation lands in the next slice — search shell is live and URL state is wired.
              </p>
            </div>
          )}
        </SearchShell>
      </div>
    </AppShell>
  );
}
