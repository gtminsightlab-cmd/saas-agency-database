"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import clsx from "clsx";

export type Option = { value: string; label: string; sublabel?: string };

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select one or multiple",
  columns = 2,
  maxVisible = 300
}: {
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  columns?: 1 | 2;
  maxVisible?: number;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const needle = q.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(needle));
  }, [options, q]);

  const visible = filtered.slice(0, maxVisible);
  const truncated = filtered.length > maxVisible;

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allVisibleSelected = visible.length > 0 && visible.every((o) => selectedSet.has(o.value));

  function toggle(value: string) {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      onChange(selected.filter((v) => !visible.some((o) => o.value === v)));
    } else {
      const next = new Set(selected);
      visible.forEach((o) => next.add(o.value));
      onChange(Array.from(next));
    }
  }

  const selectedLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? placeholder
      : `${selected.length} selected`;

  return (
    <div className="relative" ref={rootRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm",
          open
            ? "border-brand-500 ring-1 ring-brand-500"
            : "border-gray-300 hover:border-gray-400"
        )}
      >
        <span className={clsx("truncate", selected.length === 0 && "text-gray-400")}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={clsx("h-4 w-4 text-gray-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Selected chips */}
      {selected.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.slice(0, 8).map((v) => {
            const label = options.find((o) => o.value === v)?.label ?? v;
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700"
              >
                {label}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  className="hover:text-brand-900"
                  aria-label={`Remove ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {selected.length > 8 && (
            <span className="text-xs text-gray-500">+{selected.length - 8} more</span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-2 w-full rounded-md border border-brand-500 bg-white shadow-lg">
          <div className="p-3 border-b border-gray-100">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium">Select All</span>
            </label>
            <div className="mt-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto thin-scrollbar p-2">
            {visible.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-500">No results</div>
            ) : (
              <ul
                className={clsx(
                  "grid gap-0.5",
                  columns === 2 ? "sm:grid-cols-2" : "grid-cols-1"
                )}
              >
                {visible.map((o) => {
                  const checked = selectedSet.has(o.value);
                  return (
                    <li key={o.value}>
                      <label className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(o.value)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-800 truncate">{o.label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            {truncated && (
              <div className="px-3 py-2 text-xs text-gray-500">
                Showing first {maxVisible} of {filtered.length}. Type to refine.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
