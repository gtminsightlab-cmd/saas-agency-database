import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import { RecordsCounter } from "@/components/build-list/records-counter";
import { QuickSearchForm } from "./form";

export const dynamic = "force-dynamic";

export default async function QuickSearchPage() {
  const supabase = createClient();
  const [depts, titles, counts] = await Promise.all([
    supabase.from("departments").select("id,name").order("sort_order"),
    supabase.from("contact_title_roles").select("id,name").order("sort_order"),
    supabase.rpc("get_dataset_counts").maybeSingle()
  ]);

  const counts_data = (counts.data ?? null) as { agencies: number | string; contacts: number | string; contacts_with_email: number | string } | null;
  const accountsCount = Number(counts_data?.agencies ?? 0);
  const contactsCount = Number(counts_data?.contacts ?? 0);
  const contactsEmailCount = Number(counts_data?.contacts_with_email ?? 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick Search</h1>
        <RecordsCounter
          accounts={accountsCount}
          contacts={contactsCount}
          contactsWithEmail={contactsEmailCount}
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
