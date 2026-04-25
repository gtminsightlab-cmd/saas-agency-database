"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2, Plus, RefreshCw, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type MappedRow = {
  carrier_id: string;
  note: string | null;
  weight: number;
  carriers: { id: string; name: string; group_name: string | null } | null;
};

type CarrierOpt = { id: string; name: string; group_name: string | null };

export function CarrierManager({
  verticalId,
  verticalName,
  initialMapped,
}: {
  verticalId: string;
  verticalName: string;
  initialMapped: MappedRow[];
}) {
  const [mapped, setMapped] = useState<MappedRow[]>(initialMapped);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CarrierOpt[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const debounceRef = useRef<number | null>(null);

  const mappedIds = useMemo(() => new Set(mapped.map((m) => m.carrier_id)), [mapped]);

  // Debounced search against carriers
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("carriers")
        .select("id,name,group_name")
        .ilike("name", `%${search}%`)
        .order("name")
        .limit(25);
      setResults(((data ?? []) as CarrierOpt[]).filter((c) => !mappedIds.has(c.id)));
      setSearching(false);
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [search, mappedIds]);

  function showToast(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 3000);
  }

  async function addCarrier(c: CarrierOpt) {
    setBusyId(c.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("carrier_verticals")
      .insert({ vertical_id: verticalId, carrier_id: c.id, weight: 2, note: "Added via admin" });
    setBusyId(null);
    if (error) {
      showToast("err", `Add failed: ${error.message}`);
      return;
    }
    setMapped((m) => [
      ...m,
      {
        carrier_id: c.id,
        note: "Added via admin",
        weight: 2,
        carriers: { id: c.id, name: c.name, group_name: c.group_name },
      },
    ]);
    setResults((r) => r.filter((x) => x.id !== c.id));
    showToast("ok", `Added ${c.name}`);
  }

  async function removeCarrier(carrierId: string, carrierName: string) {
    if (!window.confirm(`Remove ${carrierName} from ${verticalName}?`)) return;
    setBusyId(carrierId);
    const supabase = createClient();
    const { error } = await supabase
      .from("carrier_verticals")
      .delete()
      .eq("vertical_id", verticalId)
      .eq("carrier_id", carrierId);
    setBusyId(null);
    if (error) {
      showToast("err", `Remove failed: ${error.message}`);
      return;
    }
    setMapped((m) => m.filter((x) => x.carrier_id !== carrierId));
    showToast("ok", `Removed ${carrierName}`);
  }

  async function refreshSummary() {
    setRefreshing(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("refresh_vertical_summary");
    setRefreshing(false);
    showToast(error ? "err" : "ok", error ? `Refresh failed: ${error.message}` : "Vertical summary refreshed");
  }

  return (
    <div className="space-y-6">
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

      {/* Add new carrier */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-admin-text">Add carrier</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              Type to search the carriers table. Click a result to add it to {verticalName}.
            </p>
          </div>
          <button
            onClick={refreshSummary}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface-2 px-3 py-1.5 text-xs font-semibold text-admin-text-mute hover:text-admin-text disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh public stats
          </button>
        </div>

        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-text-dim" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search carriers — name or group"
            className="w-full rounded-md border border-admin-border bg-admin-surface-2 pl-9 pr-3 py-2 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
          />
        </div>

        {search.length >= 2 && (
          <div className="mt-3 max-h-64 overflow-auto rounded-md border border-admin-border-2">
            {searching ? (
              <div className="px-4 py-3 text-sm text-admin-text-mute">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-admin-text-mute">
                No matches (or all matches already mapped).
              </div>
            ) : (
              <ul className="divide-y divide-admin-border-2">
                {results.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-admin-surface-2/60">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-admin-text truncate">{c.name}</div>
                      {c.group_name && (
                        <div className="text-xs text-admin-text-mute truncate">{c.group_name}</div>
                      )}
                    </div>
                    <button
                      onClick={() => addCarrier(c)}
                      disabled={busyId === c.id}
                      className="inline-flex items-center gap-1 rounded-md bg-admin-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-admin-accent/90 disabled:opacity-60"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Mapped carriers list */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <h2 className="text-sm font-semibold text-admin-text">
          Mapped carriers{" "}
          <span className="ml-1 text-xs font-normal text-admin-text-mute">({mapped.length})</span>
        </h2>
        {mapped.length === 0 ? (
          <p className="mt-3 text-sm text-admin-text-mute">No carriers mapped to this vertical yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-admin-border-2">
            {mapped
              .slice()
              .sort((a, b) => (a.carriers?.name ?? "").localeCompare(b.carriers?.name ?? ""))
              .map((row) => (
                <li key={row.carrier_id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-admin-text truncate">
                      {row.carriers?.name ?? "—"}
                    </div>
                    <div className="text-xs text-admin-text-mute truncate">
                      {row.carriers?.group_name ? `${row.carriers.group_name} · ` : ""}
                      {row.note ?? ""}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCarrier(row.carrier_id, row.carriers?.name ?? "this carrier")}
                    disabled={busyId === row.carrier_id}
                    className="inline-flex items-center gap-1 rounded-md border border-admin-danger/30 px-2.5 py-1 text-xs font-semibold text-admin-danger hover:bg-admin-danger/10 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-admin-text-mute">
        After adding/removing carriers, click{" "}
        <strong className="text-admin-text">Refresh public stats</strong> above so the marketing home
        and /verticals page reflect the new tier counts.
      </p>
    </div>
  );
}
