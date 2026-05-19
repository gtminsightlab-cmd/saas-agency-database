"use client";

import { useState } from "react";
import { Search, ChevronDown, Sparkles } from "lucide-react";

type Props = {
  email: string;
  fullName?: string | null;
  planLabel?: string;
  creditsRemaining?: number | null;
};

/**
 * Desktop-only top bar. Sticky above page content. Houses global search,
 * plan + credits chip, and user identity. Sign-out lives in the sidebar
 * (never buried — Master O ergonomic rule).
 *
 * Global search wires up in a later session when /quick-search backend
 * is unified into a single command-palette surface. For Session 27 it's
 * a controlled-input stub.
 *
 * Mobile uses the existing sign-out strip in shell.tsx — mobile drawer
 * for the sidebar is a future session.
 */
export function TopBar({ email, fullName, planLabel = "Free", creditsRemaining = null }: Props) {
  const [query, setQuery] = useState("");
  const displayName = fullName || email.split("@")[0];
  const initial = (fullName || email).charAt(0).toUpperCase();

  return (
    <div className="hidden md:flex sticky top-0 z-30 items-center gap-4 border-b border-gray-200 bg-white px-6 py-3">
      {/* Global search stub */}
      <div className="relative flex-1 max-w-xl">
        <label htmlFor="topbar-search" className="sr-only">
          Search agencies, contacts, carriers
        </label>
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input
          id="topbar-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agencies, contacts, carriers…"
          className="w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Plan + credits chip */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {planLabel}
        </span>
        {creditsRemaining !== null && (
          <span className="hidden lg:inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {creditsRemaining.toLocaleString()} credits
          </span>
        )}
      </div>

      {/* User chip */}
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-medium"
        >
          {initial}
        </span>
        <span className="hidden lg:inline text-sm font-medium text-gray-900 truncate max-w-[12ch]">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  );
}
