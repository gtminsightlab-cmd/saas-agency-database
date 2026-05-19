"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, DownloadCloud, Pencil, Trash2, Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { successToast, errorToast } from "@/components/ui/SuccessToast";

type Props = {
  id: string;
  name: string;
  filterQs: string | null;
  hasUpdates: boolean;
};

function SavedListRowActionsInner({ id, name, filterQs, hasUpdates }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [deltaBusy, setDeltaBusy] = useState(false);

  const editHref = filterQs ? `/build-list?${filterQs}` : "/build-list";
  const downloadHref = `/api/export?list=${encodeURIComponent(id)}`;
  const deltaHref = `/api/saved-lists/${encodeURIComponent(id)}/delta-export`;

  async function handleDelete() {
    const ok = window.confirm(`Delete recruit list "${name}"? This cannot be undone.`);
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
        errorToast("Could not delete list", { description: body?.message ?? res.statusText });
        setBusy(false);
        return;
      }

      const body = await res.json();
      if (!body?.deleted_count) {
        errorToast("Delete returned 0 rows", { description: "Refresh the page and try again." });
        setBusy(false);
        return;
      }

      successToast(`Deleted "${name}"`);
      startTransition(() => {
        router.refresh();
      });
    } catch (e: any) {
      errorToast("Could not delete list", { description: e?.message ?? "Unknown error" });
      setBusy(false);
    }
  }

  async function handleDeltaDownload() {
    // Stream the CSV, force-download via Blob URL, then refresh router so the
    // server flips has_updates back to false in the row tint + Updates? pill.
    setDeltaBusy(true);
    try {
      const res = await fetch(deltaHref, {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "text/csv" },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        errorToast("Could not download updates", { description: text || res.statusText });
        setDeltaBusy(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filenameFromDisposition(res.headers.get("content-disposition"))
        ?? `recruit-list-delta.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      successToast(`Updates downloaded for "${name}"`);
      startTransition(() => router.refresh());
    } catch (e: any) {
      errorToast("Could not download updates", { description: e?.message ?? "Unknown error" });
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
          aria-label={deltaBusy ? `Downloading updates for ${name}` : `Download updates for ${name}`}
          title="Download Updates (delta CSV)"
          className="h-8 w-8 rounded-md hover:bg-brand-100 inline-flex items-center justify-center text-brand-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
        >
          {deltaBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <DownloadCloud className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
      <Link
        href={editHref}
        aria-label={`Edit filters for ${name}`}
        title="Edit filters"
        className="h-8 w-8 rounded-md hover:bg-gray-100 inline-flex items-center justify-center text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </Link>
      <a
        href={downloadHref}
        aria-label={`Download full CSV for ${name}`}
        title="Download full CSV"
        className="h-8 w-8 rounded-md hover:bg-gray-100 inline-flex items-center justify-center text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy || pending}
        aria-label={busy ? `Deleting ${name}` : `Delete list ${name}`}
        title="Delete list"
        className="h-8 w-8 rounded-md hover:bg-rose-50 inline-flex items-center justify-center text-rose-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export default function SavedListRowActions(props: Props) {
  return (
    <ErrorBoundary
      fallback={<span className="text-xs text-rose-700">Actions unavailable</span>}
    >
      <SavedListRowActionsInner {...props} />
    </ErrorBoundary>
  );
}

function filenameFromDisposition(d: string | null): string | null {
  if (!d) return null;
  const m = d.match(/filename="?([^"]+)"?/i);
  return m?.[1] ?? null;
}
