"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, DownloadCloud, Pencil, Trash2 } from "lucide-react";

type Props = {
  id: string;
  name: string;
  filterQs: string | null;
  hasUpdates: boolean;
};

export default function SavedListRowActions({ id, name, filterQs, hasUpdates }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [deltaBusy, setDeltaBusy] = useState(false);

  const editHref = filterQs ? `/build-list?${filterQs}` : "/build-list";
  const downloadHref = `/api/export?list=${encodeURIComponent(id)}`;
  const deltaHref = `/api/saved-lists/${encodeURIComponent(id)}/delta-export`;

  async function handleDelete() {
    const ok = window.confirm(`Delete saved list "${name}"? This cannot be undone.`);
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/saved-lists/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Could not delete: ${body?.message ?? res.statusText}`);
        setBusy(false);
        return;
      }

      const body = await res.json();
      if (!body?.deleted_count) {
        alert("Delete returned 0 rows. Refresh the page and try again.");
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

  async function handleDeltaDownload() {
    // The route returns a CSV stream; use a hidden form-like fetch + Blob
    // download so we can refresh the router after the server has flipped
    // has_updates back to false.
    setDeltaBusy(true);
    try {
      const res = await fetch(deltaHref, {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "text/csv" },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        alert(`Could not download updates: ${res.statusText}\n${text}`);
        setDeltaBusy(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filenameFromDisposition(res.headers.get("content-disposition"))
        ?? `saved-list-delta.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      // Refresh the list so the Updates? cell flips Yes -> No.
      startTransition(() => router.refresh());
    } catch (e: any) {
      alert(`Could not download updates: ${e?.message ?? "unknown error"}`);
    } finally {
      setDeltaBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {hasUpdates && (
        <button
          type="button"
          onClick={handleDeltaDownload}
          disabled={deltaBusy || pending}
          title="Download Updates (delta CSV)"
          className="h-8 w-8 rounded-md hover:bg-brand-100 inline-flex items-center justify-center text-brand-700 disabled:opacity-50"
        >
          <DownloadCloud className="h-4 w-4" />
        </button>
      )}
      <Link
        href={editHref}
        title="Edit filters"
        className="h-8 w-8 rounded-md hover:bg-gray-100 inline-flex items-center justify-center text-gray-600"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <a
        href={downloadHref}
        title="Download full CSV"
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

function filenameFromDisposition(d: string | null): string | null {
  if (!d) return null;
  const m = d.match(/filename="?([^"]+)"?/i);
  return m?.[1] ?? null;
}
