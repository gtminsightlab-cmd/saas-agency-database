"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Save,
  Trash2,
  Search,
  CircleCheck,
  CircleSlash,
  Loader2,
  X,
  AtSign,
  Phone,
  Building2,
  Printer,
  User2,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type CanaryRow = {
  id: string;
  source: string;
  kind: string;
  match_mode: string;
  pattern: string;
  note: string | null;
  active: boolean;
  created_at: string;
};

const KINDS = [
  { value: "email",                  label: "Email",          Icon: AtSign },
  { value: "phone",                  label: "Phone",          Icon: Phone },
  { value: "fax",                    label: "Fax",            Icon: Printer },
  { value: "agency_name",            label: "Agency name",    Icon: Building2 },
  { value: "contact_name_in_agency", label: "Contact + agency", Icon: User2 },
];

const MATCH_MODES = [
  { value: "exact",       label: "Exact",       hint: "Match the pattern verbatim" },
  { value: "contains",    label: "Contains",    hint: "Substring match — use % for ILIKE wildcards" },
  { value: "digits_only", label: "Digits only", hint: "Strip non-digits before comparing (phone/fax)" },
];

const ICON_BY_KIND: Record<string, typeof AtSign> = Object.fromEntries(
  KINDS.map((k) => [k.value, k.Icon])
);

type Draft = Omit<CanaryRow, "id" | "created_at"> & { id?: string };

export function CanaryEditor({ initialRows }: { initialRows: CanaryRow[] }) {
  const [rows, setRows] = useState<CanaryRow[]>(initialRows);
  const [filter, setFilter] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Draft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  function showToast(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 3500);
  }

  const visible = useMemo(() => {
    let v = rows;
    if (!showInactive) v = v.filter((r) => r.active);
    if (filter.trim()) {
      const q = filter.trim().toLowerCase();
      v = v.filter(
        (r) =>
          r.pattern.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          (r.note ?? "").toLowerCase().includes(q) ||
          r.kind.toLowerCase().includes(q)
      );
    }
    return v;
  }, [rows, filter, showInactive]);

  // Group by source
  const bySource = useMemo(() => {
    const map = new Map<string, CanaryRow[]>();
    for (const r of visible) {
      if (!map.has(r.source)) map.set(r.source, []);
      map.get(r.source)!.push(r);
    }
    return Array.from(map.entries());
  }, [visible]);

  function startEdit(r: CanaryRow) {
    setEditingId(r.id);
    setDraft({
      id: r.id,
      source: r.source,
      kind: r.kind,
      match_mode: r.match_mode,
      pattern: r.pattern,
      note: r.note,
      active: r.active,
    });
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit() {
    if (!draft || !editingId) return;
    if (!draft.source.trim() || !draft.pattern.trim()) {
      showToast("err", "Source and pattern are required");
      return;
    }
    setBusyId(editingId);
    const { error } = await supabase
      .from("data_load_denylist")
      .update({
        source: draft.source.trim(),
        kind: draft.kind,
        match_mode: draft.match_mode,
        pattern: draft.pattern.trim(),
        note: draft.note?.trim() || null,
        active: draft.active,
      })
      .eq("id", editingId);
    setBusyId(null);
    if (error) {
      showToast("err", `Save failed: ${error.message}`);
      return;
    }
    setRows((rs) =>
      rs.map((r) =>
        r.id === editingId
          ? { ...r, source: draft.source, kind: draft.kind, match_mode: draft.match_mode, pattern: draft.pattern, note: draft.note, active: draft.active }
          : r
      )
    );
    cancelEdit();
    showToast("ok", "Canary updated");
  }

  function startCreate() {
    setCreateDraft({
      source: "Manual entry",
      kind: "email",
      match_mode: "exact",
      pattern: "",
      note: null,
      active: true,
    });
    setCreating(true);
  }
  function cancelCreate() {
    setCreating(false);
    setCreateDraft(null);
  }

  async function saveCreate() {
    if (!createDraft) return;
    if (!createDraft.source.trim() || !createDraft.pattern.trim()) {
      showToast("err", "Source and pattern are required");
      return;
    }
    setBusyId("__new__");
    const { data, error } = await supabase
      .from("data_load_denylist")
      .insert({
        source: createDraft.source.trim(),
        kind: createDraft.kind,
        match_mode: createDraft.match_mode,
        pattern: createDraft.pattern.trim(),
        note: createDraft.note?.trim() || null,
        active: createDraft.active,
      })
      .select("*")
      .maybeSingle();
    setBusyId(null);
    if (error || !data) {
      showToast("err", `Create failed: ${error?.message ?? "no row returned"}`);
      return;
    }
    setRows((rs) => [...rs, data as CanaryRow]);
    cancelCreate();
    showToast("ok", "Canary added");
  }

  async function toggleActive(r: CanaryRow) {
    setBusyId(r.id);
    const { error } = await supabase
      .from("data_load_denylist")
      .update({ active: !r.active })
      .eq("id", r.id);
    setBusyId(null);
    if (error) {
      showToast("err", `Toggle failed: ${error.message}`);
      return;
    }
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, active: !r.active } : x)));
    showToast("ok", !r.active ? "Activated" : "Deactivated");
  }

  async function deleteRow(r: CanaryRow) {
    if (
      !window.confirm(
        `Delete canary "${r.pattern}" (${r.kind} / ${r.source})?\n\nThis is permanent. Inactive canaries don't run during ingestion but stay queryable for audit.`
      )
    )
      return;
    setBusyId(r.id);
    const { error } = await supabase.from("data_load_denylist").delete().eq("id", r.id);
    setBusyId(null);
    if (error) {
      showToast("err", `Delete failed: ${error.message}`);
      return;
    }
    setRows((rs) => rs.filter((x) => x.id !== r.id));
    showToast("ok", "Canary deleted");
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
            placeholder="Filter by pattern / source / kind / note…"
            className="w-full rounded-md border border-admin-border bg-admin-surface-2 pl-9 pr-3 py-2 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-admin-text-mute select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-admin-border bg-admin-surface-2"
          />
          Show inactive
        </label>
        <button
          type="button"
          onClick={startCreate}
          disabled={creating}
          className="inline-flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-2 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" /> Add canary
        </button>
      </div>

      {/* Create form */}
      {creating && createDraft && (
        <div className="rounded-lg border border-admin-accent/40 bg-admin-accent/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-admin-text">New canary</h3>
            <button onClick={cancelCreate} className="text-admin-text-dim hover:text-admin-text" aria-label="Cancel">
              <X className="h-4 w-4" />
            </button>
          </div>
          <CanaryFields
            value={createDraft}
            onChange={(patch) => setCreateDraft((d) => (d ? { ...d, ...patch } : d))}
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelCreate}
              className="rounded-md border border-admin-border px-3 py-1.5 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveCreate}
              disabled={busyId === "__new__"}
              className="inline-flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-60"
            >
              {busyId === "__new__" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save
            </button>
          </div>
        </div>
      )}

      {/* Grouped rows */}
      {bySource.length === 0 ? (
        <div className="rounded-lg border border-admin-border-2 bg-admin-surface p-10 text-center">
          <ShieldAlert className="mx-auto h-5 w-5 text-admin-text-dim" />
          <div className="mt-2 text-sm text-admin-text">No canaries match.</div>
        </div>
      ) : (
        bySource.map(([source, sourceRows]) => (
          <div key={source} className="rounded-lg border border-admin-border-2 bg-admin-surface overflow-hidden">
            <header className="px-4 py-2.5 border-b border-admin-border-2 bg-admin-surface-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-admin-text">{source}</div>
              <div className="text-[10px] uppercase tracking-wider text-admin-text-dim tabular-nums">
                {sourceRows.length} {sourceRows.length === 1 ? "canary" : "canaries"}
              </div>
            </header>
            <ul className="divide-y divide-admin-border-2">
              {sourceRows.map((r) => {
                const isEditing = editingId === r.id;
                const Icon = ICON_BY_KIND[r.kind] ?? ShieldAlert;
                return (
                  <li key={r.id} className={isEditing ? "bg-admin-accent/5 p-4" : "px-4 py-3"}>
                    {isEditing && draft ? (
                      <div>
                        <CanaryFields
                          value={draft}
                          onChange={(patch) => setDraft((d) => (d ? { ...d, ...patch } : d))}
                        />
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-admin-border px-3 py-1.5 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-60"
                          >
                            {busyId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-admin-surface-2 text-admin-text-mute">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="text-sm font-mono text-admin-text break-all">{r.pattern}</code>
                            <span className="text-[10px] uppercase tracking-wider rounded bg-admin-surface-2 px-1.5 py-0.5 text-admin-text-dim">
                              {r.match_mode}
                            </span>
                          </div>
                          {r.note && <div className="mt-1 text-xs text-admin-text-mute">{r.note}</div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleActive(r)}
                            disabled={busyId === r.id}
                            className={[
                              "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold disabled:opacity-50",
                              r.active
                                ? "bg-admin-ok/15 text-admin-ok hover:bg-admin-ok/25"
                                : "bg-admin-text-dim/15 text-admin-text-dim hover:bg-admin-text-dim/25",
                            ].join(" ")}
                          >
                            {r.active ? <CircleCheck className="h-3 w-3" /> : <CircleSlash className="h-3 w-3" />}
                            {r.active ? "Active" : "Inactive"}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            className="rounded-md border border-admin-border px-2 py-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRow(r)}
                            disabled={busyId === r.id}
                            className="rounded-md border border-admin-danger/30 px-2 py-1 text-xs font-semibold text-admin-danger hover:bg-admin-danger/10 disabled:opacity-50 inline-flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
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

function CanaryFields({ value, onChange }: { value: Draft; onChange: (patch: Partial<Draft>) => void }) {
  const matchHint = MATCH_MODES.find((m) => m.value === value.match_mode)?.hint ?? "";
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Source" required>
        <input
          type="text"
          value={value.source}
          onChange={(e) => onChange({ source: e.target.value })}
          placeholder='e.g. "Neilson seed #5"'
          className="w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
        />
      </Field>
      <Field label="Kind" required>
        <select
          value={value.kind}
          onChange={(e) => onChange({ kind: e.target.value })}
          className="w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Match mode" required hint={matchHint}>
        <select
          value={value.match_mode}
          onChange={(e) => onChange({ match_mode: e.target.value })}
          className="w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          {MATCH_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Active">
        <label className="inline-flex items-center gap-2 text-sm text-admin-text-mute pt-1.5">
          <input
            type="checkbox"
            checked={value.active}
            onChange={(e) => onChange({ active: e.target.checked })}
            className="rounded border-admin-border bg-admin-surface-2"
          />
          Run during ingestion
        </label>
      </Field>
      <Field label="Pattern" required wide>
        <input
          type="text"
          value={value.pattern}
          onChange={(e) => onChange({ pattern: e.target.value })}
          placeholder='e.g. "jeffneilson@programbusiness.com"'
          className="w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-sm font-mono text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
        />
      </Field>
      <Field label="Note" wide>
        <input
          type="text"
          value={value.note ?? ""}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="Optional context — e.g. 'CA toll-free watermark'"
          className="w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "md:col-span-2 space-y-1" : "space-y-1"}>
      <label className="block text-[10px] uppercase tracking-wide text-admin-text-dim">
        {label}
        {required && <span className="ml-1 text-admin-danger">*</span>}
      </label>
      {children}
      {hint && <div className="text-[10px] text-admin-text-dim">{hint}</div>}
    </div>
  );
}
