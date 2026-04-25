"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Search, Loader2, AtSign, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type DomainRow = {
  domain: string;
  reason: string | null;
  added_at: string;
};

const REASONS = [
  { value: "consumer",     label: "Consumer (personal)" },
  { value: "role",         label: "Role / shared mailbox" },
  { value: "disposable",   label: "Disposable / temp" },
  { value: "test",         label: "Test / placeholder" },
  { value: "other",        label: "Other" },
];

export function EmailDomainEditor({ initialRows }: { initialRows: DomainRow[] }) {
  const [rows, setRows] = useState<DomainRow[]>(initialRows);
  const [filter, setFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newReason, setNewReason] = useState("consumer");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  function showToast(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 3500);
  }

  const visible = useMemo(() => {
    if (!filter.trim()) return rows;
    const q = filter.trim().toLowerCase();
    return rows.filter((r) => r.domain.toLowerCase().includes(q) || (r.reason ?? "").includes(q));
  }, [rows, filter]);

  // Group by reason for the chip count
  const reasonCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of rows) {
      const key = r.reason ?? "other";
      m[key] = (m[key] ?? 0) + 1;
    }
    return m;
  }, [rows]);

  async function addDomain() {
    const d = newDomain.trim().toLowerCase();
    if (!d) {
      showToast("err", "Domain is required");
      return;
    }
    if (!/^[a-z0-9.\-]+\.[a-z]{2,}$/.test(d)) {
      showToast("err", "That doesn't look like a valid domain");
      return;
    }
    if (rows.some((r) => r.domain === d)) {
      showToast("err", "Domain already in the list");
      return;
    }
    setBusy("__new__");
    const { data, error } = await supabase
      .from("email_domain_denylist")
      .insert({ domain: d, reason: newReason })
      .select("domain,reason,added_at")
      .maybeSingle();
    setBusy(null);
    if (error || !data) {
      showToast("err", `Add failed: ${error?.message ?? "no row returned"}`);
      return;
    }
    setRows((rs) => [...rs, data as DomainRow].sort((a, b) => a.domain.localeCompare(b.domain)));
    setNewDomain("");
    setCreating(false);
    showToast("ok", `Added ${d}`);
  }

  async function removeDomain(d: string) {
    if (!window.confirm(`Remove "${d}" from the consumer-email denylist?`)) return;
    setBusy(d);
    const { error } = await supabase.from("email_domain_denylist").delete().eq("domain", d);
    setBusy(null);
    if (error) {
      showToast("err", `Remove failed: ${error.message}`);
      return;
    }
    setRows((rs) => rs.filter((r) => r.domain !== d));
    showToast("ok", `Removed ${d}`);
  }

  return (
    <div className="space-y-3">
      {toast && (
        <div
          className={[
            "fixed top-20 right-6 z-50 rounded-md px-4 py-2 text-sm font-medium shadow-lg",
            toast.kind === "ok" ? "bg-admin-ok text-white" : "bg-admin-danger text-white",
          ].join(" ")}
        >
          {toast.msg}
        </div>
      )}

      {/* Reason summary */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-admin-text-mute">
        {Object.entries(reasonCounts).map(([reason, n]) => (
          <span
            key={reason}
            className="inline-flex items-center gap-1 rounded-full border border-admin-border-2 bg-admin-surface px-2.5 py-0.5"
          >
            <span className="text-admin-text font-semibold tabular-nums">{n}</span>
            <span>{reason}</span>
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-admin-border-2 bg-admin-surface p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-text-dim" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter domains…"
            className="w-full rounded-md border border-admin-border bg-admin-surface-2 pl-9 pr-3 py-2 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          disabled={creating}
          className="inline-flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-2 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" /> Add domain
        </button>
      </div>

      {/* Add form */}
      {creating && (
        <div className="rounded-lg border border-admin-accent/40 bg-admin-accent/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-admin-text">New blocked domain</h3>
            <button
              onClick={() => setCreating(false)}
              className="text-admin-text-dim hover:text-admin-text"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wide text-admin-text-dim">
                Domain <span className="text-admin-danger">*</span>
              </label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. fastmail.fm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") addDomain();
                }}
                className="w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-sm font-mono text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wide text-admin-text-dim">Reason</label>
              <select
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-sm text-admin-text outline-none focus:border-admin-accent"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md border border-admin-border px-3 py-1.5 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={addDomain}
              disabled={busy === "__new__"}
              className="inline-flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-60"
            >
              {busy === "__new__" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add
            </button>
          </div>
        </div>
      )}

      {/* Domain grid */}
      <div className="rounded-lg border border-admin-border-2 bg-admin-surface p-4">
        {visible.length === 0 ? (
          <div className="py-6 text-center">
            <AtSign className="mx-auto h-5 w-5 text-admin-text-dim" />
            <div className="mt-2 text-sm text-admin-text-mute">No domains match.</div>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((r) => (
              <li
                key={r.domain}
                className="flex items-center justify-between rounded-md border border-admin-border-2 bg-admin-surface-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-mono text-admin-text truncate">{r.domain}</div>
                  <div className="text-[10px] uppercase tracking-wider text-admin-text-dim">
                    {r.reason ?? "other"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDomain(r.domain)}
                  disabled={busy === r.domain}
                  className="rounded p-1 text-admin-text-dim hover:text-admin-danger disabled:opacity-50"
                  title={`Remove ${r.domain}`}
                  aria-label={`Remove ${r.domain}`}
                >
                  {busy === r.domain ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
