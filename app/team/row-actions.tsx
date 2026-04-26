"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function TeamRowActions({ id, email }: { id: string; email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function handleRevoke() {
    const ok = window.confirm(`Revoke the pending invite for ${email}?`);
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch("/api/team/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body?.message || `Could not revoke (${res.status})`);
        setBusy(false);
        return;
      }
      startTransition(() => router.refresh());
    } catch (err: any) {
      alert(err?.message || "Network error revoking invite");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRevoke}
      disabled={busy || pending}
      title="Revoke invite"
      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50"
    >
      <Trash2 className="h-3 w-3" />
      Revoke
    </button>
  );
}
