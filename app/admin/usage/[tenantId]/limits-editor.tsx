"use client";

import { useMemo, useState } from "react";
import {
  Save,
  RefreshCcw,
  Loader2,
  AlertTriangle,
  CircleCheck,
  Sliders,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { METRICS, METRIC_BY_KEY, SLIDER_CONFIG, utilTone, type Metric } from "../_lib/metrics";

export type EffectiveRow = {
  metric: Metric;
  monthly_cap: number;
  is_hard_cap: boolean;
  is_override: boolean;
  default_cap: number;
  default_hard: boolean;
  note: string | null;
  override_id: string | null;
  used_this_month: number;
};

type Draft = {
  monthly_cap: number;
  is_hard_cap: boolean;
  note: string;
};

export function LimitsEditor({
  tenantId,
  initialRows,
}: {
  tenantId: string;
  initialRows: EffectiveRow[];
}) {
  const [rows, setRows] = useState<EffectiveRow[]>(initialRows);
  const [drafts, setDrafts] = useState<Record<Metric, Draft>>(
    () =>
      initialRows.reduce(
        (acc, r) => ({
          ...acc,
          [r.metric]: { monthly_cap: r.monthly_cap, is_hard_cap: r.is_hard_cap, note: r.note ?? "" },
        }),
        {} as Record<Metric, Draft>
      )
  );
  const [busyId, setBusyId] = useState<Metric | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  function showToast(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 3500);
  }

  function setDraft(metric: Metric, patch: Partial<Draft>) {
    setDrafts((d) => ({ ...d, [metric]: { ...d[metric], ...patch } }));
  }

  function isDirty(r: EffectiveRow): boolean {
    const d = drafts[r.metric];
    if (!d) return false;
    return (
      d.monthly_cap !== r.monthly_cap ||
      d.is_hard_cap !== r.is_hard_cap ||
      (d.note ?? "") !== (r.note ?? "")
    );
  }

  async function save(r: EffectiveRow) {
    const d = drafts[r.metric];
    if (!d) return;

    // If draft equals the default and no note, treat as "remove override"
    const matchesDefault =
      d.monthly_cap === r.default_cap && d.is_hard_cap === r.default_hard && !d.note.trim();

    if (matchesDefault && r.override_id) {
      return resetToDefault(r);
    }

    setBusyId(r.metric);
    try {
      if (r.override_id) {
        const { error } = await supabase
          .from("tenant_limits")
          .update({
            monthly_cap: d.monthly_cap,
            is_hard_cap: d.is_hard_cap,
            note: d.note.trim() || null,
          })
          .eq("id", r.override_id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("tenant_limits")
          .insert({
            tenant_id: tenantId,
            metric: r.metric,
            monthly_cap: d.monthly_cap,
            is_hard_cap: d.is_hard_cap,
            note: d.note.trim() || null,
          })
          .select("id")
          .maybeSingle();
        if (error || !data) throw error ?? new Error("no row returned");
        r.override_id = data.id;
      }
      setRows((rs) =>
        rs.map((x) =>
          x.metric === r.metric
            ? {
                ...x,
                monthly_cap: d.monthly_cap,
                is_hard_cap: d.is_hard_cap,
                note: d.note.trim() || null,
                is_override: true,
                override_id: r.override_id,
              }
            : x
        )
      );
      showToast("ok", `${METRIC_BY_KEY[r.metric].label} cap saved`);
    } catch (e: any) {
      showToast("err", `Save failed: ${e.message ?? e}`);
    } finally {
      setBusyId(null);
    }
  }

  async function resetToDefault(r: EffectiveRow) {
    if (!r.override_id) {
      // Already at default; just snap the draft back
      setDraft(r.metric, {
        monthly_cap: r.default_cap,
        is_hard_cap: r.default_hard,
        note: "",
      });
      showToast("ok", `${METRIC_BY_KEY[r.metric].label} already at default`);
      return;
    }
    if (
      !window.confirm(
        `Reset ${METRIC_BY_KEY[r.metric].label} to default (${r.default_cap.toLocaleString()}, ${
          r.default_hard ? "hard" : "soft"
        })?`
      )
    )
      return;

    setBusyId(r.metric);
    try {
      const { error } = await supabase.from("tenant_limits").delete().eq("id", r.override_id);
      if (error) throw error;
      setRows((rs) =>
        rs.map((x) =>
          x.metric === r.metric
            ? {
                ...x,
                monthly_cap: x.default_cap,
                is_hard_cap: x.default_hard,
                note: null,
                is_override: false,
                override_id: null,
              }
            : x
        )
      );
      setDraft(r.metric, { monthly_cap: r.default_cap, is_hard_cap: r.default_hard, note: "" });
      showToast("ok", `${METRIC_BY_KEY[r.metric].label} reset to default`);
    } catch (e: any) {
      showToast("err", `Reset failed: ${e.message ?? e}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
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

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r) => {
          const m = METRIC_BY_KEY[r.metric];
          const d = drafts[r.metric];
          const slider = SLIDER_CONFIG[r.metric];
          const tone = utilTone(r.used_this_month, r.monthly_cap, r.is_hard_cap);
          const dirty = isDirty(r);
          return (
            <div
              key={r.metric}
              className={[
                "rounded-xl border bg-admin-surface p-5",
                r.is_override ? "border-admin-accent/40" : "border-admin-border-2",
              ].join(" ")}
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
                      <m.Icon className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="text-sm font-semibold text-admin-text">{m.label}</h3>
                  </div>
                  <p className="mt-1 text-xs text-admin-text-mute max-w-[36ch]">{m.description}</p>
                </div>
                {r.is_override && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-admin-accent/15 px-2 py-0.5 text-[10px] font-semibold text-admin-accent uppercase tracking-wider">
                    <Sliders className="h-2.5 w-2.5" />
                    Override
                  </span>
                )}
              </header>

              {/* Current usage line */}
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="text-admin-text-mute">Used this month</span>
                <span className="font-semibold text-admin-text tabular-nums">
                  {r.used_this_month.toLocaleString()}
                </span>
                <span className="text-admin-text-dim">/</span>
                <span className="text-admin-text tabular-nums">{r.monthly_cap.toLocaleString()}</span>
                {tone === "danger" && (
                  <AlertTriangle className="h-3.5 w-3.5 text-admin-danger" />
                )}
                {tone === "warn" && (
                  <AlertTriangle className="h-3.5 w-3.5 text-admin-warn" />
                )}
                {tone === "ok" && r.used_this_month > 0 && (
                  <CircleCheck className="h-3.5 w-3.5 text-admin-ok" />
                )}
              </div>
              <div className="mt-2 h-1 w-full rounded-full bg-admin-surface-2 overflow-hidden">
                <div
                  className={[
                    "h-full transition-[width] duration-200",
                    tone === "danger"
                      ? "bg-admin-danger"
                      : tone === "warn"
                      ? "bg-admin-warn"
                      : "bg-admin-accent",
                  ].join(" ")}
                  style={{ width: `${r.monthly_cap > 0 ? Math.min(100, (r.used_this_month / r.monthly_cap) * 100) : 0}%` }}
                />
              </div>

              {/* Cap slider */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-admin-text-mute">
                    Monthly cap{" "}
                    <span className="ml-1 text-[10px] text-admin-text-dim">
                      default {r.default_cap.toLocaleString()} {m.unit}
                    </span>
                  </label>
                  <span className="text-admin-text font-semibold tabular-nums">
                    {d.monthly_cap.toLocaleString()} {m.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={d.monthly_cap}
                  onChange={(e) => setDraft(r.metric, { monthly_cap: Number(e.target.value) })}
                  className="w-full accent-[--admin-accent] [accent-color:#00A896]"
                />
                <div className="flex items-center justify-between text-[10px] text-admin-text-dim">
                  <span>{slider.min.toLocaleString()}</span>
                  <input
                    type="number"
                    min={slider.min}
                    value={d.monthly_cap}
                    onChange={(e) => setDraft(r.metric, { monthly_cap: Math.max(0, Number(e.target.value)) })}
                    className="w-24 rounded border border-admin-border bg-admin-surface-2 px-2 py-0.5 text-right text-xs text-admin-text outline-none focus:border-admin-accent"
                  />
                  <span>{slider.max.toLocaleString()}</span>
                </div>
              </div>

              {/* Hard/soft toggle */}
              <div className="mt-5 flex items-center justify-between rounded-md border border-admin-border bg-admin-surface-2 px-3 py-2">
                <div>
                  <div className="text-xs font-medium text-admin-text">
                    {d.is_hard_cap ? "Hard cap" : "Soft cap"}
                  </div>
                  <div className="text-[11px] text-admin-text-mute">
                    {d.is_hard_cap
                      ? "Block requests once usage reaches the cap"
                      : "Allow requests through but flag in alerts"}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={d.is_hard_cap}
                  onClick={() => setDraft(r.metric, { is_hard_cap: !d.is_hard_cap })}
                  className={[
                    "relative h-6 w-11 rounded-full transition-colors",
                    d.is_hard_cap ? "bg-admin-danger" : "bg-admin-warn",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white transition-transform",
                      d.is_hard_cap ? "translate-x-5" : "translate-x-0.5",
                    ].join(" ")}
                  />
                </button>
              </div>

              {/* Note */}
              <div className="mt-3">
                <label className="block text-[10px] uppercase tracking-wide text-admin-text-dim mb-1">
                  Override note (optional)
                </label>
                <input
                  type="text"
                  value={d.note}
                  onChange={(e) => setDraft(r.metric, { note: e.target.value })}
                  placeholder='e.g. "Enterprise pilot — temporary uplift"'
                  className="w-full rounded-md border border-admin-border bg-admin-surface-2 px-2.5 py-1.5 text-xs text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
                />
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-end gap-2">
                {r.is_override && (
                  <button
                    type="button"
                    onClick={() => resetToDefault(r)}
                    disabled={busyId === r.metric}
                    className="inline-flex items-center gap-1.5 rounded-md border border-admin-border px-3 py-1.5 text-xs font-semibold text-admin-text-mute hover:text-admin-text disabled:opacity-50"
                  >
                    <RefreshCcw className="h-3 w-3" /> Reset to default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => save(r)}
                  disabled={busyId === r.metric || !dirty}
                  className="inline-flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-40"
                >
                  {busyId === r.metric ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  {dirty ? (r.is_override ? "Save override" : "Apply override") : "Saved"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-admin-text-mute inline-flex items-center gap-1.5">
        <Info className="h-3 w-3 text-admin-text-dim" />
        Saving with values that match the default removes the override row automatically.
      </p>
    </div>
  );
}
