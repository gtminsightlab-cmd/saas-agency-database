"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import type { SuggestedCategory } from "@/lib/ai-search/suggested-queries";

/**
 * Client island for the AI search input. The page itself is a server component
 * that re-renders when the URL ?q= changes — this form just GETs the same
 * route with the new query in the URL bar so refresh / share / browser-back
 * all work for free.
 */
export function SearchForm({
  initialQuery,
  initialCat,
}: {
  initialQuery: string;
  initialCat: SuggestedCategory;
}) {
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      action="/ai-support"
      method="GET"
      className="rounded-xl border-2 border-brand-200 bg-white p-1.5 shadow-sm focus-within:border-brand-400 focus-within:shadow-md transition"
    >
      <div className="flex items-start gap-2 px-3 py-2">
        <Sparkles className="h-4 w-4 text-brand-500 mt-2 shrink-0" />
        <textarea
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask in plain language: e.g. PE-backed wholesalers in Texas with over $10M premium and email"
          rows={2}
          className="flex-1 resize-none border-0 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 py-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
            }
          }}
        />
        {/* Preserve the active category tab on submit so the user lands on the
            same suggestion list they were browsing. */}
        <input type="hidden" name="cat" value={initialCat} />
        <button
          type="submit"
          className="self-end rounded-md bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 inline-flex items-center gap-1.5 shrink-0"
          aria-label="Run AI search"
        >
          Search
          <Send className="h-3 w-3" />
        </button>
      </div>
      <div className="px-3 pb-2 text-[10px] text-gray-400">
        Press <kbd className="rounded border border-gray-200 bg-gray-50 px-1 font-mono">Enter</kbd> to search,
        <kbd className="ml-1 rounded border border-gray-200 bg-gray-50 px-1 font-mono">Shift+Enter</kbd> for newline.
      </div>
    </form>
  );
}
