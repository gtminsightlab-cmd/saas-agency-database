import Link from "next/link";
import { Download, Trash2, Search } from "lucide-react";
import { AppShell } from "@/components/app/shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SavedListsPage() {
  const supabase = createClient();
  const { data: lists, count } = await supabase
    .from("saved_lists")
    .select("id,name,description,created_at,row_count_snapshot", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Saved Lists</h1>
            <p className="mt-2 text-sm text-gray-600">
              Click on a list below to load and review, or click the action icons for quick access to download and delete lists.
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
          <table className="min-w-full divide-y divide-gra