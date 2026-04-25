"use client";

import { useMemo, useState } from "react";
import {
  CircleCheck,
  CircleSlash,
  Globe,
  Lock,
  Crown,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type FlagRow = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  scope: "public_marketing" | "authenticated" | "admin_only";
  category: string | null;
  updated_at: string;
};

const SCOPE_META: Record<
  FlagRow["scope"],
  { label: string; Icon: typeof Globe; tone: string }
> = {
  public_marketing: { label: "Public",   Icon: Globe, tone: "bg-admin-accent/15 text-admin-accent" },
  authenticated:    { label: "Authed",   Icon: Lock,  tone: "bg-admin-warn/15 text-admin-warn"     },
  admin_only:       { label: "Admin",    Icon: Crown, tone: "bg-admin-danger/15 text-admin-danger" },
};

export function FlagsEditor({ initialRows }: { initialRows: FlagRow[] }) {
  const [rows, setRows] = useState<FlagRow[]>(initialRows);
  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | FlagRow["scope"]>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  function showToast(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 3500);
  }

  const visible = useMemo(() => {
    let v = rows;
    if (scopeFilter !== "all") v = v.filter((r) => r.scope === scopeFilter);
    if (filter.trim()) {
      const q = filter.trim().toLowerCase();
      v = v.filter(
        (r) =>
          r.key.toLowerCase().includes(q) ||
          r.label.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          (r.category ?? "").toLowerCase().includes(q)
      );
    }
    return v;
  }, [rows, filter, scopeFilter]);

  // Group by category
  const byCategory = useMemo(() => {
    const m = new Map<string, FlagRow[]>();
    for (const r of visible) {
      const cat = r.category ?? "Other";
      if (!m.has(cat)) m.set(cat, []);
      m.get(cat)!.push(r);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [visible]);

  async function toggle(r: FlagRow) {
    const next = !r.enabled;
    if (next && r.scope === "public_marketing") {
      const ok = window.confirm(
        `Enabling "${r.label}" makes it visible to all anon visitors immediately. The marketing site will pick it up on next render. Continue?`
      );
      if (!ok) return;
    }

    setBusyId(r.id);
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled: next })
      .eq("id", r.id);
    setBusyId(null);
    if (error) {
      showToast("err", `Toggle failed: ${error.message}`);
      return;
    }
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: next, updated_at: new Date().toISOString() } : x)));
    showToast("ok", `${r.label} → ${next ? "ON" : "OFF"}`);
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-admin-border-2 bg-admin-surface p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-text-dim" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by key / label / description…"
            className="w-full rounded-md border border-admin-border bg-admin-surface-2 pl-9 pr-3 py-2 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
          />
        </div>
        <div className="inline-flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-admin-text-dim" />
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="rounded-md border border-admin-border bg-admin-surface-2 px-2 py-1.5 text-xs text-admin-text outline-none focus:border-admin-accent"
          >
            <option value="all">All scopes ({rows.length})</option>
            <option value="public_marketing">
              Public ({rows.filter((r) => r.scope === "public_marketing").length})
            </option>
            <option value="authenticated">
              Authenticated ({rows.filter((r) => r.scope === "authenticated").length})
            </option>
            <option value="admin_only">
              Admin only ({rows.filter((r) => r.scope === "admin_only").length})
            </option>
          </select>
        </div>
        <span className="ml-auto text-xs text-admin-text-mute tabular-nums">
          {visible.length} of {rows.length}
        </span>
      </div>

      {/* Flags grouped by category */}
      {byCategory.length === 0 ? (
        <div className="rounded-md border border-dashed border-admin-border bg-admin-surface-2/40 p-10 text-center text-sm text-admin-text-mute">
          No flags match.
        </div>
      ) : (
        byCategory.map(([cat, flags]) => (
          <div
            key={cat}
            className="rounded-lg border border-admin-border-2 bg-admin-surface overflow-hidden"
          >
            <header className="px-4 py-2 border-b border-admin-border-2 bg-admin-surface-2 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-semibold">
                {cat}
              </div>
              <div className="text-[10px] text-admin-text-dim tabular-nums">
                {flags.length} flag{flags.length === 1 ? "" : "s"}
              </div>
            </header>
            <ul className="divide-y divide-admin-border-2">
              {flags.map((r) => {
                const meta = SCOPE_META[r.scope];
                return (
                  <li key={r.id} className="px-4 py-3 flex items-start gap-3">
                    {/* Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={r.enabled}
                      onClick={() => toggle(r)}
                      disabled={busyId === r.id}
                      className={[
                        "relative h-6 w-11 rounded-full transition-colors shrink-0 mt-0.5 disabled:opacity-50",
                        r.enabled ? "bg-admin-ok" : "bg-admin-text-dim/40",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white transition-transform",
                          r.enabled ? "translate-x-5" : "translate-x-0.5",
                        ].join(" ")}
                      />
                      {busyId === r.id && (
                        <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
                      )}
                    </button>

                    {/* Body */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <h4 className="text-sm font-semibold text-admin-text">{r.label}</h4>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.tone}`}
                        >
                          <meta.Icon className="h-2.5 w-2.5" />
                          {meta.label}
                        </span>
                        {r.enabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-admin-ok font-semibold uppercase tracking-wider">
                            <CircleCheck className="h-2.5 w-2.5" /> On
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-admin-text-dim font-semibold uppercase tracking-wider">
                            <CircleSlash className="h-2.5 w-2.5" /> Off
                          </span>
                        )}
                      </div>
                      <code className="mt-1 block text-[11px] text-admin-text-mute">{r.key}</code>
                      {r.description && (
                        <p className="mt-1 text-xs text-admin-text-mute">{r.description}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
