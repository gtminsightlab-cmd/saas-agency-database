"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export type QuickSearchTab = "agencies" | "contacts" | "carriers" | "verticals";

const TABS: { id: QuickSearchTab; label: string }[] = [
  { id: "agencies", label: "Agencies" },
  { id: "contacts", label: "Contacts" },
  { id: "carriers", label: "Carriers" },
  { id: "verticals", label: "Verticals" }
];

const DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function isValidTab(value: string | null): value is QuickSearchTab {
  return value === "agencies" || value === "contacts" || value === "carriers" || value === "verticals";
}

type Props = {
  children: (ctx: { tab: QuickSearchTab; debouncedQuery: string; rawQuery: string }) => ReactNode;
  beforeTabs?: ReactNode;
};

/**
 * SearchShell — owns URL state (?q + ?tab) and the sticky search input.
 * The render-prop child receives the active tab + debounced query so each
 * tab fetcher reacts only after the user stops typing.
 *
 * Per-tab sort/page state lives in URL params namespaced by tab letter
 * (aSort/aDir/aPage for agencies, cSort/cDir/cPage for contacts, etc.) —
 * those are owned by each tab component, not the shell.
 */
export function SearchShell({ children, beforeTabs }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const urlTab = params.get("tab");
  const tab: QuickSearchTab = isValidTab(urlTab) ? urlTab : "agencies";
  const urlQuery = params.get("q") ?? "";

  const [rawQuery, setRawQuery] = useState(urlQuery);
  const debouncedQuery = useDebouncedValue(rawQuery, DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync URL ?q= when debounced value changes (writes only — never reads back).
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (debouncedQuery === current) return;
    const next = new URLSearchParams(params.toString());
    if (debouncedQuery) next.set("q", debouncedQuery);
    else next.delete("q");
    router.replace(`?${next.toString()}`, { scroll: false });
  }, [debouncedQuery, params, router]);

  // ⌘K / Ctrl+K focuses the search input from anywhere on the page.
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const setTab = useCallback(
    (next: QuickSearchTab) => {
      if (next === tab) return;
      const params2 = new URLSearchParams(params.toString());
      params2.set("tab", next);
      router.replace(`?${params2.toString()}`, { scroll: false });
    },
    [params, router, tab]
  );

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (index + dir + TABS.length) % TABS.length;
        setTab(TABS[nextIndex].id);
        const buttons = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons?.item(nextIndex)?.focus();
      }
      if (e.key === "Home") {
        e.preventDefault();
        setTab(TABS[0].id);
      }
      if (e.key === "End") {
        e.preventDefault();
        setTab(TABS[TABS.length - 1].id);
      }
    },
    [setTab]
  );

  const clearQuery = useCallback(() => {
    setRawQuery("");
    inputRef.current?.focus();
  }, []);

  const ctx = useMemo(() => ({ tab, debouncedQuery, rawQuery }), [tab, debouncedQuery, rawQuery]);

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 border-b border-gray-200 bg-white/95 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <label htmlFor="quick-search-input" className="sr-only">
          Search agencies, contacts, carriers, and verticals
        </label>
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" aria-hidden="true" />
          <input
            ref={inputRef}
            id="quick-search-input"
            type="search"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder={`Search ${TABS.find((t) => t.id === tab)?.label.toLowerCase() ?? "agencies"}…  (⌘K / Ctrl+K to focus)`}
            className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-20 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            autoComplete="off"
            spellCheck={false}
          />
          {rawQuery ? (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {beforeTabs}

      <nav aria-label="Search categories">
        <div role="tablist" aria-label="Search categories" className="flex gap-1 border-b border-gray-200">
          {TABS.map((t, index) => {
            const selected = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`tabpanel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
                  selected
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <section
        role="tabpanel"
        id={`tabpanel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
      >
        {children(ctx)}
      </section>
    </div>
  );
}
