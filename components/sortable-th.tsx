import Link from "next/link";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

/**
 * Shared sortable-table-header components.
 *
 * Two variants — same visual + interaction behavior, different transports:
 *   <SortableThLink>   — server components. URL-driven sort via Next.js Link.
 *   <SortableThButton> — client components. Local-state sort via onClick.
 *
 * Theme: "customer" (brand-blue active, gray hover) for app-shell pages,
 *        "admin" (admin-accent active, admin-dim hover) for admin pages.
 *
 * Both components are generic over the sort-key string union, so each caller
 * keeps its own SortKey type without unsafe casts.
 */

export type SortDir = "asc" | "desc";
type Theme = "customer" | "admin";

const THEME_CLS = {
  customer: {
    active: "text-brand-700 font-semibold",
    inactive: "text-gray-600 hover:text-gray-900",
  },
  admin: {
    active: "text-admin-accent font-semibold",
    inactive: "text-admin-text-dim hover:text-admin-text",
  },
};

const TH_PADDING = {
  customer: "px-4 py-3",
  admin: "px-5 py-2.5 font-medium",
};

function indicator(isActive: boolean, dir: SortDir) {
  if (!isActive) return <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-60" />;
  return dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
}

function titleFor(label: string, isActive: boolean, dir: SortDir) {
  return isActive ? `Sort ${dir === "asc" ? "descending" : "ascending"}` : `Sort by ${label}`;
}

// ---------------------------------------------------------------------------
// Server / Link variant
// ---------------------------------------------------------------------------
export function SortableThLink<K extends string>({
  label,
  sortKey,
  activeSort,
  dir,
  hrefFor,
  theme = "customer",
  align,
}: {
  label: string;
  sortKey: K;
  activeSort: K;
  dir: SortDir;
  hrefFor: (key: K) => string;
  theme?: Theme;
  align?: "right";
}) {
  const isActive = activeSort === sortKey;
  const cls = isActive ? THEME_CLS[theme].active : THEME_CLS[theme].inactive;
  return (
    <th className={TH_PADDING[theme] + (align === "right" ? " text-right" : "")}>
      <Link
        href={hrefFor(sortKey)}
        className={"inline-flex items-center gap-1 group " + cls}
        title={titleFor(label, isActive, dir)}
      >
        {label}
        {indicator(isActive, dir)}
      </Link>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Client / Button variant
// ---------------------------------------------------------------------------
export function SortableThButton<K extends string>({
  label,
  sortKey,
  activeSort,
  dir,
  onSort,
  theme = "customer",
  align,
}: {
  label: string;
  sortKey: K;
  activeSort: K;
  dir: SortDir;
  onSort: (key: K) => void;
  theme?: Theme;
  align?: "right";
}) {
  const isActive = activeSort === sortKey;
  const cls = isActive ? THEME_CLS[theme].active : THEME_CLS[theme].inactive;
  return (
    <th className={TH_PADDING[theme] + (align === "right" ? " text-right" : "")}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={"inline-flex items-center gap-1 group " + cls}
        title={titleFor(label, isActive, dir)}
      >
        {label}
        {indicator(isActive, dir)}
      </button>
    </th>
  );
}
