"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Database,
  BookOpen,
  Search,
  Users,
  CreditCard,
  Gauge,
  Layers,
  ShieldAlert,
  Plug,
  BellRing,
  Activity,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  status?: "live" | "partial" | "soon";
};

const NAV: NavItem[] = [
  { href: "/admin",                  label: "Overview",         Icon: LayoutDashboard, status: "live" },
  { href: "/admin/data-engine",      label: "Data Engine",      Icon: Database,        status: "soon" },
  { href: "/admin/catalog",          label: "Catalog",          Icon: BookOpen,        status: "live" },
  { href: "/admin/search-analytics", label: "Search & Index",   Icon: Search,          status: "soon" },
  { href: "/admin/customers",        label: "Customers",        Icon: Users,           status: "soon" },
  { href: "/admin/billing",          label: "Billing",          Icon: CreditCard,      status: "soon" },
  { href: "/admin/usage",            label: "Usage & Limits",   Icon: Gauge,           status: "soon" },
  { href: "/admin/verticals",        label: "Verticals",        Icon: Layers,          status: "partial" },
  { href: "/admin/hygiene",          label: "Hygiene & Refresh",Icon: ShieldAlert,     status: "live" },
  { href: "/admin/integrations",     label: "Integrations",     Icon: Plug,            status: "soon" },
  { href: "/admin/alerts",           label: "Alerts & Risk",    Icon: BellRing,        status: "soon" },
  { href: "/admin/system-health",    label: "System Health",    Icon: Activity,        status: "live" },
];

const FOOTER_NAV: NavItem[] = [
  { href: "/admin/settings",         label: "Admin Settings",   Icon: Settings,        status: "soon" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={[
        "shrink-0 border-r border-admin-border-2 bg-admin-surface flex flex-col",
        "transition-[width] duration-150 ease-out",
        collapsed ? "w-[68px]" : "w-[240px]",
      ].join(" ")}
    >
      {/* Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-admin-border-2">
        <Link href="/admin" className="inline-flex items-center gap-2 text-admin-text">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
            <ShieldCheck className="h-4 w-4" />
          </span>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">Control Room</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="text-admin-text-dim hover:text-admin-text rounded p-1"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer (Settings) */}
      <div className="border-t border-admin-border-2 py-3 space-y-0.5">
        {FOOTER_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} collapsed={collapsed} />
        ))}
      </div>
    </aside>
  );
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const { Icon } = item;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={[
        "mx-2 px-3 py-2 rounded-md flex items-center gap-3 text-sm transition-colors",
        active
          ? "bg-admin-accent/15 text-admin-accent"
          : "text-admin-text-mute hover:bg-admin-surface-2 hover:text-admin-text",
      ].join(" ")}
    >
      <Icon className={["h-4 w-4 shrink-0", active ? "" : "opacity-80"].join(" ")} />
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
      {!collapsed && item.status && item.status !== "live" && (
        <span
          className={[
            "text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5",
            item.status === "partial"
              ? "bg-admin-warn/15 text-admin-warn"
              : "bg-admin-surface-2 text-admin-text-dim",
          ].join(" ")}
        >
          {item.status === "partial" ? "Beta" : "Soon"}
        </span>
      )}
    </Link>
  );
}
