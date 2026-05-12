"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Save,
  Trash2,
  Search,
  CircleCheck,
  CircleSlash,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CatalogTableConfig, ColumnDef } from "../_lib/config";
import { revalidateBuildListRefs } from "../actions";

type Row = Record<string, any> & { id: string };

export function CatalogEditor({
  config,
  initialRows,
  usedBy,
}: {
  config: CatalogTableConfig;
  initialRows: Row[];
  usedBy: Record<string, number>;
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [filter, setFilter] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Row | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  function showToast(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 3500);
  }

  // Visible rows (filter + active toggle)
  const visible = useMemo(() => {
    let v = rows;
    if (!showInactive && config.hasActive) {
      v = v.filter((r) => r.active !== false);
    }
    if (filter.trim()) {
      const q = filter.trim().toLowerCase();
      v = v.filter((r) =>
        config.columns.some((c) => {
          const val = r[c.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }
    return v;
  }, [rows, filter, showInactive, config]);

  function startEdit(r: Row) {
    setEditingId(r.id);
    setDraft({ ...r });
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit() {
    if (!draft || !editingId) return;
    // Validate required columns
    for (const col of config.columns) {
      if (col.required && (draft[col.key] == null || String(draft[col.key]).trim() === "")) {
        showToast("err", `${col.label} is required`);
        return;
      }
    }
    const patch: Record<string, any> = {};
    for (const col of config.columns) patch[col.key] = normalize(draft[col.key], col.type);
    if (config.hasActive) patch.active = draft.active ?? true;
    if (config.hasSortOrder) patch.sort_order = Number(draft.sort_order ?? 0) || 0;

    setBusyId(editingId);
    const { error } = await supabase.from(config.table).update(patch).eq("id", editingId);
    setBusyId(null);
    if (error) {
      showToast("err", `Save failed: ${error.message}`);
      return;
    }
    setRows((rs) => rs.map((r) => (r.id === editingId ? { ...r, ...patch } : r)));
    cancelEdit();
    showToast("ok", "Saved");
    void revalidateBuildListRefs();
  }

  function startCreate() {
    const initial: Row = { id: "__new__" };
    for (const col of config.columns) {
      initial[col.key] = col.default ?? (col.type === "boolean" ? false : "");
    }
    if (config.hasActive) initial.active = true;
    if (config.hasSortOrder) {
      const max = rows.reduce((m, r) => Math.max(m, Number(r.sort_order ?? 0)), 0);
      initial.sort_order = max + 10;
    }
    setCreateDraft(initial);
    setCreating(true);
  }
  function cancelCreate() {
    setCreating(false);
    setCreateDraft(null);
  }
  async function saveCreate() {
    if (!createDraft) return;
    for (const col of config.columns) {
      if (col.required && (createDraft[col.key] == null || String(createDraft[col.key]).trim() === "")) {
        showToast("err", `${col.label} is required`);
        return;
      }
    }
    const insert: Record<string, any> = {};
    for (const col of config.columns) insert[col.key] = normalize(createDraft[col.key], col.type);
    if (config.hasActive) insert.active = createDraft.active ?? true;
    if (config.hasSortOrder) insert.sort_order = Number(createDraft.sort_order ?? 0) || 0;

    setBusyId("__new__");
    const { data, error } = await supabase.from(config.table).insert(insert).select("*").maybeSingle();
    setBusyId(null);
    if (error || !data) {
      showToast("err", `Create failed: ${error?.message ?? "no row returned"}`);
      return;
    }
    setRows((rs) => [...rs, data as Row]);
    cancelCreate();
    showToast("ok", "Row added");
    void revalidateBuildListRefs();
    startTransition(() => router.refresh());
  }

  async function toggleActive(r: Row) {
    if (!config.hasActive) return;
    const next = !(r.active ?? true);
    const refs = usedBy[r.id] ?? 0;
    if (!next && refs >= 50) {
      const ok = window.confirm(
        `${r[config.primaryColumn]} is used by ${refs.toLocaleString()} agencies/contacts.\n\n` +
          `Inactivating will hide it from filters but keep existing references intact. ` +
          `Continue?`
      );
      if (!ok) return;
    }
    setBusyId(r.id);
    const { error } = await supabase.from(config.table).update({ active: next }).eq("id", r.id);
    setBusyId(null);
    if (error) {
      showToast("err", `Toggle failed: ${error.message}`);
      return;
    }
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, active: next } : x)));
    showToast("ok", next ? "Activated" : "Deactivated");
    void revalidateBuildListRefs();
  }

  async function deleteRow(r: Row) {
    const refs = usedBy[r.id] ?? 0;
    if (refs > 0) {
      showToast(
        "err",
        `Cannot delete — ${refs.toLocaleString()} reference(s) exist. Mark it inactive instead.`
      );
      return;
    }
    if (!window.confirm(`Delete "${r[config.primaryColumn]}"? This is permanent.`)) return;
    setBusyId(r.id);
    const { error } = await supabase.from(config.table).delete().eq("id", r.id);
    setBusyId(null);
    if (error) {
      showToast("err", `Delete failed: ${error.message}`);
      return;
    }
    setRows((rs) => rs.filter((x) => x.id !== r.id));
    showToast("ok", "Deleted");
    void revalidateBuildListRefs();
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={[
            "fixed top-20 right-6 z-50 rounded-md px-4 py-2 text-sm font-medium shadow-lg",
            toast.kind === "ok"
              ? "bg-admin-ok text-white"
              : "bg-admin-danger text-white",
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
            placeholder={`Filter ${config.name.toLowerCase()}…`}
            className="w-full rounded-md border border-admin-border bg-admin-surface-2 pl-9 pr-3 py-2 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
          />
        </div>
        {config.hasActive && (
          <label className="inline-flex items-center gap-2 text-xs text-admin-text-mute select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-admin-border bg-admin-surface-2"
            />
            Show inactive
          </label>
        )}
        <button
          type="button"
          onClick={startCreate}
          disabled={creating}
          className="inline-flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-2 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
      </div>

      {/* Create form */}
      {creating && createDraft && (
        <div className="rounded-lg border border-admin-accent/40 bg-admin-accent/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-admin-text">New {config.name.toLowerCase()} row</h3>
            <button
              type="button"
              onClick={cancelCreate}
              className="text-admin-text-dim hover:text-admin-text"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {config.columns.map((col) => (
              <FieldInput
                key={col.key}
                col={col}
                value={createDraft[col.key]}
                onChange={(v) => setCreateDraft((d) => (d ? { ...d, [col.key]: v } : d))}
              />
            ))}
            {config.hasSortOrder && (
              <FieldInput
                col={{ key: "sort_order", label: "Sort order", type: "integer" }}
                value={createDraft.sort_order}
                onChange={(v) => setCreateDraft((d) => (d ? { ...d, sort_order: v } : d))}
              />
            )}
            {config.hasActive && (
              <FieldInput
                col={{ key: "active", label: "Active", type: "boolean" }}
                value={createDraft.active}
                onChange={(v) => setCreateDraft((d) => (d ? { ...d, active: v } : d))}
              />
            )}
          </div>
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

      {/* Rows */}
      <div className="rounded-lg border border-admin-border-2 bg-admin-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2">
            <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
              {config.columns.map((c) => (
                <th key={c.key} className="px-4 py-2.5 font-medium">
                  {c.label}
                </th>
              ))}
              {config.hasSortOrder && (
                <th className="px-4 py-2.5 font-medium w-20">Sort</th>
              )}
              {config.hasActive && <th className="px-4 py-2.5 font-medium w-24">Status</th>}
              {config.usedBy && <th className="px-4 py-2.5 font-medium w-28">Used by</th>}
              <th className="px-4 py-2.5 font-medium w-44 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-2">
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    config.columns.length +
                    (config.hasSortOrder ? 1 : 0) +
                    (config.hasActive ? 1 : 0) +
                    (config.usedBy ? 1 : 0) +
                    1
                  }
                  className="px-4 py-10 text-center text-sm text-admin-text-mute"
                >
                  No rows match.
                </td>
              </tr>
            ) : (
              visible.map((r) => {
                const isEditing = editingId === r.id;
                const refs = usedBy[r.id] ?? 0;
                return (
                  <tr key={r.id} className={isEditing ? "bg-admin-accent/5" : ""}>
                    {config.columns.map((c) => (
                      <td key={c.key} className="px-4 py-2 align-top">
                        {isEditing ? (
                          <FieldInput
                            col={c}
                            value={draft?.[c.key]}
                            onChange={(v) => setDraft((d) => (d ? { ...d, [c.key]: v } : d))}
                          />
                        ) : (
                          <CellValue value={r[c.key]} type={c.type} />
                        )}
                      </td>
                    ))}
                    {config.hasSortOrder && (
                      <td className="px-4 py-2 align-top tabular-nums text-admin-text-mute">
                        {isEditing ? (
                          <FieldInput
                            col={{ key: "sort_order", label: "Sort", type: "integer" }}
                            value={draft?.sort_order}
                            onChange={(v) => setDraft((d) => (d ? { ...d, sort_order: v } : d))}
                          />
                        ) : (
                          r.sort_order ?? 0
                        )}
                      </td>
                    )}
                    {config.hasActive && (
                      <td className="px-4 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => toggleActive(r)}
                          disabled={busyId === r.id}
                          className={[
                            "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold disabled:opacity-50",
                            r.active === false
                              ? "bg-admin-text-dim/15 text-admin-text-dim hover:bg-admin-text-dim/25"
                              : "bg-admin-ok/15 text-admin-ok hover:bg-admin-ok/25",
                          ].join(" ")}
                          title="Toggle active"
                        >
                          {r.active === false ? (
                            <>
                              <CircleSlash className="h-3 w-3" /> Inactive
                            </>
                          ) : (
                            <>
                              <CircleCheck className="h-3 w-3" /> Active
                            </>
                          )}
                        </button>
                      </td>
                    )}
                    {config.usedBy && (
                      <td className="px-4 py-2 align-top tabular-nums text-xs">
                        {refs > 0 ? (
                          <span className="text-admin-text">{refs.toLocaleString()}</span>
                        ) : (
                          <span className="text-admin-text-dim">0</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-2 align-top text-right">
                      {isEditing ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-admin-border px-2 py-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={busyId === r.id}
                            className="inline-flex items-center gap-1 rounded-md bg-admin-accent px-2 py-1 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-60"
                          >
                            {busyId === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex gap-1.5">
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
                            disabled={busyId === r.id || refs > 0}
                            title={refs > 0 ? `Has ${refs} references — inactivate instead` : "Delete"}
                            className="rounded-md border border-admin-danger/30 px-2 py-1 text-xs font-semibold text-admin-danger hover:bg-admin-danger/10 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!config.usedBy && (
        <p className="text-xs text-admin-text-mute inline-flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-admin-warn" />
          This reference table has no FK references in the schema yet. The &ldquo;used by&rdquo;
          counter will populate when its column is added to the contacts table.
        </p>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function normalize(v: any, type: ColumnDef["type"]) {
  if (v == null) return null;
  if (type === "integer") {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  if (type === "boolean") return Boolean(v);
  const s = String(v).trim();
  return s === "" ? null : s;
}

function CellValue({ value, type }: { value: any; type: ColumnDef["type"] }) {
  if (value == null || value === "") return <span className="text-admin-text-dim">—</span>;
  if (type === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1 text-admin-ok text-xs">
        <CircleCheck className="h-3 w-3" /> Yes
      </span>
    ) : (
      <span className="text-admin-text-dim text-xs">No</span>
    );
  }
  if (type === "longtext") {
    return <span className="text-admin-text-mute text-xs line-clamp-2">{String(value)}</span>;
  }
  return <span className="text-admin-text">{String(value)}</span>;
}

function FieldInput({
  col,
  value,
  onChange,
}: {
  col: ColumnDef;
  value: any;
  onChange: (v: any) => void;
}) {
  const base =
    "w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent";
  if (col.type === "boolean") {
    return (
      <label className="inline-flex items-center gap-2 text-xs text-admin-text-mute">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-admin-border bg-admin-surface-2"
        />
        {col.label}
      </label>
    );
  }
  if (col.type === "integer") {
    return (
      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wide text-admin-text-dim">{col.label}</label>
        <input
          type="number"
          step={1}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className={base}
        />
      </div>
    );
  }
  if (col.type === "longtext") {
    return (
      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wide text-admin-text-dim">{col.label}</label>
        <textarea
          rows={2}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <label className="block text-[10px] uppercase tracking-wide text-admin-text-dim">
        {col.label}
        {col.required && <span className="text-admin-danger ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    </div>
  );
}
