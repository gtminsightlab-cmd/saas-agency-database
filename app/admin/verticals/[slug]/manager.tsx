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
  const [toast, setToast] = useState<string | null>(null);
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

  function showToast(msg: string) {
    setToast(msg);
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
      showToast(`Add failed: ${error.message}`);
      return;
    }
    setMapped((m) => [
      ...m,
      { carrier_id: c.id, note: "Added via admin", weight: 2, carriers: { id: c.id, name: c.name, group_name: c.group_name } },
    ]);
    setResults((r) => r.filter((x) => x.id !== c.id));
    showToast(`Added ${c.name}`);
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
      showToast(`Remove failed: ${error.message}`);
      return;
    }
    setMapped((m) => m.filter((x) => x.carrier_id !== carrierId));
    showToast(`Removed ${carrierName}`);
  }

  async function refreshSummary() {
    setRefreshing(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("refresh_vertical_summary");
    setRefreshing(false);
    showToast(error ? `Refresh failed: ${error.message}` : "Vertical summary refreshed");
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 rounded-md bg-navy-800 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Add new carrier */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-800">Add carrier</h2>
          <button
            onClick={refreshSummary}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh public stats
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Type to search the carriers table. Click a result to add it to {verticalName}.
        </p>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search carriers — name or group"
            className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {search.length >= 2 && (
          <div className="mt-3 max-h-64 overflow-auto rounded-md border border-gray-100">
            {searching ? (
              <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No matches (or all matches already mapped).</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {results.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                    <div>
                      <div className="text-sm font-medium text-navy-800">{c.name}</div>
                      {c.group_name && <div className="text-xs text-gray-500">{c.group_name}</div>}
                    </div>
                    <button
                      onClick={() => addCarrier(c)}
                      disabled={busyId === c.id}
                      className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
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
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-navy-800">
          Mapped carriers <span className="text-xs font-normal text-gray-500">({mapped.length})</span>
        </h2>
        {mapped.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No carriers mapped to this vertical yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {mapped
              .slice()
              .sort((a, b) => (a.carriers?.name ?? "").localeCompare(b.carriers?.name ?? ""))
              .map((row) => (
                <li key={row.carrier_id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-navy-800">{row.carriers?.name ?? "—"}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {row.carriers?.group_name ? `${row.carriers.group_name} · ` : ""}
                      {row.note ?? ""}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCarrier(row.carrier_id, row.carriers?.name ?? "this carrier")}
                    disabled={busyId === row.carrier_id}
                    className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-gray-500">
        After adding/removing carriers, click <strong>Refresh public stats</strong> above so the
        marketing home and /verticals page reflect the new tier counts.
      </p>
    </div>
  );
}
