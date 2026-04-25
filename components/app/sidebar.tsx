"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  LayoutList,
  BookmarkCheck,
  Download,
  Search,
  BarChart3,
  Sparkles,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import clsx from "clsx";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const agencyDirectoryLinks: NavItem[] = [
  { href: "/build-list", label: "Build a List", icon: LayoutList },
  { href: "/saved-lists", label: "Saved Lists", icon: BookmarkCheck },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/quick-search", label: "Quick Search", icon: Search }
];

export function Sidebar({
  email,
  fullName,
  isSuperAdmin
}: {
  email: string;
  fullName?: string | null;
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <Link href="/build-list" className="block">
          <div className="text-lg font-bold tracking-tight text-gray-900">
            Seven16
          </div>
          <div className="text-xs text-gray-500 tracking-widest uppercase">
            Agency Directory
          </div>
        </Link>
      </div>

      {/* User chip */}
      <div className="px-4 py-4 border-b border-gray-100">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-gray-50"
          aria-label="User menu"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
            {(fullName || email).charAt(0).toUpperCase()}
          </span>
          <span className="flex-1 text-left truncate">
            <span className="block text-sm font-medium text-gray-900">
              Hi, {(fullName || email.split("@")[0]).split(" ")[0]}!
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 thin-scrollbar">
        {isSuperAdmin && (
          <div>
            <div className="px-2 mb-1.5 text-sm font-semibold text-brand-600 inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </div>
            <ul className="space-y-0.5">
              <NavLinkItem
                href="/admin"
                label="Control Room"
                icon={ShieldCheck}
                active={isActive("/admin")}
              />
              <NavLinkItem
                href="/admin/customers"
                label="Users & tenants"
                icon={Users}
                active={isActive("/admin/customers")}
              />
            </ul>
          </div>
        )}

        <div>
          <div className="px-2 mb-1.5 text-sm font-semibold text-brand-600">
            Agency Directory
          </div>
          <ul className="space-y-0.5">
            {agencyDirectoryLinks.map((l) => (
              <NavLinkItem
                key={l.href}
                href={l.href}
                label={l.label}
                icon={l.icon}
                active={isActive(l.href)}
              />
            ))}
          </ul>
        </div>

        <div>
          <ul className="space-y-0.5">
            <NavLinkItem
              href="/data-stats"
              label="Data and Stats"
              icon={BarChart3}
              active={isActive("/data-stats")}
            />
            <NavLinkItem
              href="/ai-support"
              label="AI Support"
              icon={Sparkles}
              active={isActive("/ai-support")}
            />
          </ul>
        </div>
      </nav>

      <form action="/auth/sign-out" method="post" className="p-3 border-t border-gray-100">
        <button
          type="submit"
          className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}

function NavLinkItem({
  href,
  label,
  icon: Icon,
  active
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
          active
            ? "bg-brand-50 text-brand-700 font-medium"
            : "text-gray-700 hover:bg-gray-50"
        )}
      >
        <Icon className="h-4 w-4 flex-none" />
        <span>{label}</span>
      </Link>
    </li>
  );
}
