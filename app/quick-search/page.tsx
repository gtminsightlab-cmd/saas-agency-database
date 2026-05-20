import { AppShell } from "@/components/app/shell";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { PageHeader } from "@/components/app/page-header";
import { createClient } from "@/lib/supabase/server";
import { RecordsCounter } from "@/components/build-list/records-counter";
import { QuickSearchForm } from "./form";

export const dynamic = "force-dynamic";

export default async function QuickSearchPage() {
  const supabase = await createClient();
  const [depts, titles, accountsRes, contactsRes, contactsEmailRes] = await Promise.all([
    supabase.from("departments").select("id,name").order("sort_order"),
    supabase.from("contact_title_roles").select("id,name").order("sort_order"),
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }).not("email_primary", "is", null)
  ]);

  return (
    <AppShell>
      <Breadcrumbs
        items={[
          { href: "/home", label: "Home" },
          { label: "Agency Search" },
        ]}
      />
      <PageHeader
        title="Agency Search"
        subtitle="Look up specific agencies by contact email, phone, name, domain, department, or title. Contact-record search will activate once the contact data set is fully loaded."
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <RecordsCounter
          accounts={accountsRes.count ?? 0}
          contacts={contactsRes.count ?? 0}
          contactsWithEmail={contactsEmailRes.count ?? 0}
        />
        <div className="mt-6 rounded-lg border border-gray-200 bg-white">
          <QuickSearchForm
            departments={(depts.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
            titles={(titles.data ?? []).map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>
      </div>
    </AppShell>
  );
}
