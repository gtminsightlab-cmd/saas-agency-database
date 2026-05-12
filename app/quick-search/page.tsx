import { AppShell } from "@/components/app/shell";
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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick Search</h1>
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
