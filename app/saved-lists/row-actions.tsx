"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Pencil, Trash2 } from "lucide-react";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";

type Props = {
  id: string;
  name: string;
  filterQs: string | null;
};

export default function SavedListRowActions({ id, name, filterQs }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const editHref = filterQs ? `/build-list?${filterQs}` : "/build-list";
  const downloadHref = `/api/export?list=${encodeURIComponent(id)}`;

  async function handleDelete() {
    const ok = window.confirm(`Delete saved list "${name}"? This cannot be undone.`);
    if (!ok) return;
    setBusy(true);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.from("saved_lists").delete().eq("id", id);
      if (error) {
        alert(`Could not delete: ${error.message}`);
        setBusy(false);
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (e: any) {
      alert(`Could not delete: ${e?.message ?? "unknown error"}`);
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={editHref}
        title="Edit filters"
        className="h-8 w-8 rounded-md hover:bg-gray-100 inline-flex items-center justify-center text-gray-600"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <a
        href={downloadHref}
        title="Download CSV"
        className="h-8 w-8 rounded-md hover:bg-gray-100 inline-flex items-center justify-center text-gray-600"
      >
        <Download className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy || pending}
        title="Delete list"
        className="h-8 w-8 rounded-md hover:bg-red-50 inline-flex items-center justify-center text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
