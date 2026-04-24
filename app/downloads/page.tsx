import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("downloads_ledger")
    .select("id,source,account_rows,contact_rows,charged_cents,created_at,saved_list_id")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900">Downloads</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your export history. Each row is a CSV export you triggered.
        </p>

        <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Accounts</th>
                <th className="px-4 py-3 text-right">Contacts</th>
                <th className="px-4 py-3 text-right">Charged</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    No exports yet. Build a list and download it from the list&apos;s detail page.
                  </td>
                </tr>
              ) : (
                data!.map((d: any) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{d.source.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {d.account_rows?.toLocaleString?.() ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
     