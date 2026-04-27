"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import type { CarrierRow } from "./page";

const PAGE_SIZE = 50;

type Props = {
  carriers: CarrierRow[];
  isAnon: boolean;
  hasActivePlan: boolean;
  authed: boolean;
  minThreshold: number;
};

export function CarriersGrid({
  carriers,
  isAnon,
  hasActivePlan,
  authed,
  minThreshold,
}: Props) {
  // Display state — how many tiles to show
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Multi-select state — set of carrier_ids
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Search input
  const [query, setQuery] = useState("");

  // When search is empty -> default grid filtered to >= minThreshold (212).
  // When search is active -> match across ALL carriers, including the long tail
  // like Canal Insurance (108 agencies) that are below the default threshold.
  const filtered = useMemo(() => {
    if (!query.trim()) {
      return carriers.filter((c) => c.agency_count >= minThreshold);
    }
    const q = query.trim().toLowerCase();
    return carriers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.group_name ?? "").toLowerCase().includes(q)
    );
  }, [carriers, query, minThreshold]);

  const visible = filtered.slice(0, visibleCount);
  const maxCount = carriers[0]?.agency_count ?? 1;
  const canLoadMore = filtered.length > visible.length;
  const filteredCount = filtered.length;

  function toggle(id: string) {
    if (isAnon) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  const buildHref =
    selected.size > 0
      ? `/build-list/review?cr=${Array.from(selected).join(
          ","
        )}&cr_c=or&c=US`
      : null;

  // Reset visible count when search changes
  function handleSearch(v: string) {
    setQuery(v);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      {/* Header row + search */}
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex-1 min-w-[260px]">
          <h2 className="text-xl font-semibold text-navy-800">
            {query.trim()
              ? `Search results for "${query.trim()}"`
              : `Carriers with ${minThreshold}+ appointed agencies`}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {isAnon
              ? "Preview only — sign in to multi-select and build lists."
              : query.trim()
                ? `Searching all ${carriers.length.toLocaleString()} active carriers. Click tiles to multi-select.`
                : "Click tiles to multi-select. Build a list of agencies across all selected carriers."}
          </p>
        </div>
        <div className="text-xs text-gray-500 inline-flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3" />
          {query.trim()
            ? `${filteredCount.toLocaleString()} of ${carriers.length.toLocaleString()}`
            : `${filteredCount.toLocaleString()} above threshold`}
        </div>
      </div>

      {!isAnon && (
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search carriers (e.g. Berkley, Travelers, Sentry)…"
              className="w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {query && (
            <span className="text-xs text-gray-500">
              {filteredCount} of {totalCarriers.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((c, i) => {
            if (isAnon && i >= 10) return null;
            const isSelected = selected.has(c.id);
            return (
              <CarrierTile
                key={c.id}
                rank={
                  query.trim()
                    ? carriers.findIndex((x) => x.id === c.id) + 1
                    : i + 1
                }
                carrier={c}
                maxCount={maxCount}
                selected={isSelected}
                isAnon={isAnon}
                authed={authed}
                hasPlan={hasActivePlan}
                onToggle={toggle}
              />
            );
          })}
        </div>

        {/* Anon: locked overlay over the grid */}
        {isAnon && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent via-white/85 to-white"
            />
            <div className="absolute inset-x-0 top-1/2 flex justify-center -translate-y-1/2 px-4">
              <div className="max-w-md w-full rounded-2xl border border-brand-200 bg-white shadow-md p-6 text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy-800">
                  Sign in to search {carriers.length.toLocaleString()} carriers
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Multi-select carriers, build agency lists across them in one click,
                  and find any of the {carriers.length.toLocaleString()} active carriers (default
                  view shows the {minThreshold}+ tier).
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Link
                    href="/sign-up"
                    className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 inline-flex items-center gap-2"
                  >
                    Get instant access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Load more */}
      {!isAnon && canLoadMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Show {Math.min(PAGE_SIZE, filteredCount - visibleCount)} more
            &middot; {filteredCount - visibleCount} remaining
          </button>
        </div>
      )}

      {/* No results in search */}
      {!isAnon && filteredCount === 0 && (
        <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
          No carriers match &ldquo;{query}&rdquo;. Try a partial name, e.g. &ldquo;Berkley&rdquo;
          or &ldquo;Mutual&rdquo;.
        </div>
      )}

      {/* Floating multi-select bar */}
      {!isAnon && selected.size > 0 && buildHref && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[calc(100%-2rem)]">
          <div className="rounded-full bg-navy-800 text-white px-4 py-2 sm:px-5 sm:py-3 shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-xs font-semibold w-6 h-6">
                {selected.size}
              </span>
              <span className="text-sm truncate">
                {selected.size === 1 ? "carrier" : "carriers"} selected
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-white/70 hover:text-white inline-flex items-center gap-1"
                aria-label="Clear selection"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            </div>
            <Link
              href={hasActivePlan ? buildHref : "/#pricing"}
              className="shrink-0 rounded-full bg-white text-navy-800 px-4 py-1.5 text-sm font-semibold hover:bg-brand-50 inline-flex items-center gap-1.5"
            >
              {hasActivePlan ? "Build list" : "Upgrade"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CarrierTile({
  rank,
  carrier,
  maxCount,
  selected,
  isAnon,
  authed,
  hasPlan,
  onToggle,
}: {
  rank: number;
  carrier: CarrierRow;
  maxCount: number;
  selected: boolean;
  isAnon: boolean;
  authed: boolean;
  hasPlan: boolean;
  onToggle: (id: string) => void;
}) {
  const pct = Math.max(1, Math.round((carrier.agency_count / maxCount) * 100));
  const showGroup =
    carrier.group_name && carrier.group_name !== carrier.name
      ? carrier.group_name
      : null;

  const tileClasses = [
    "group flex h-full flex-col rounded-md border bg-white p-3 transition cursor-pointer text-left",
    selected
      ? "border-brand-500 ring-1 ring-brand-500 bg-brand-50/40"
      : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/30",
  ].join(" ");

  return (
    <button
      type="button"
      disabled={isAnon}
      onClick={() => onToggle(carrier.id)}
      className={tileClasses}
    >
      <div className="flex items-baseline justify-between text-[10px] text-gray-500">
        <span className="font-mono tabular-nums">
          {String(rank).padStart(2, "0")}
        </span>
        {selected ? (
          <span className="text-brand-700 font-semibold">selected</span>
        ) : (
          authed && !hasPlan && <span className="text-gray-400">upgrade</span>
        )}
      </div>
      <p className="mt-1 line-clamp-2 min-h-[2.4rem] text-sm font-medium leading-tight text-navy-800 group-hover:text-brand-800">
        {carrier.name}
      </p>
      {showGroup && (
        <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500">{showGroup}</p>
      )}
      <div className="mt-2 h-[3px] overflow-hidden rounded-sm bg-gray-100">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{
            width: `${pct}%`,
            filter: isAnon ? "blur(2px)" : undefined,
          }}
        />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between">
        <span
          className="text-base font-semibold tabular-nums text-navy-800"
          style={
            isAnon
              ? { filter: "blur(4px)", userSelect: "none" }
              : undefined
          }
          aria-hidden={isAnon}
        >
          {carrier.agency_count.toLocaleString()}
        </span>
        <span className="text-[10px] text-gray-500">agencies</span>
      </div>
    </button>
  );
}
