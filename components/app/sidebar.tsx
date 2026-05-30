"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  LayoutList,
  BookmarkCheck,
  Download,
  Search,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Layers,
  BookOpen,
  Compass,
  PieChart
} from "lucide-react";
import clsx from "clsx";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

// URLs untouched per resolution lock (Master O CMO brief 2, SESSION_26 close).
// Only labels and group structure change. DB tables stay `saved_lists`. Stripe
// webhook URLs untouched. Pillar 6 Edge Function URLs untouched.

const intelligenceLinks: NavItem[] = [
  { href: "/home",               label: "Home",                  icon: Home },
  { href: "/verticals",          label: "Vertical Intelligence", icon: Layers },
  { href: "/analytics/carriers", label: "Carrier Map",           icon: PieChart },
  { href: "/quick-search",       label: "Agency Search",         icon: Search },
  { href: "/ai-support",         label: "AI Research Assistant", icon: Sparkles }
];

const recruitLinks: NavItem[] = [
  { href: "/build-list",  label: "Build Recruit List", icon: LayoutList },
  { href: "/saved-lists", label: "Recruit Lists",      icon: BookmarkCheck },
  { href: "/downloads",   label: "Exports",            icon: Download }
];

const trustLinks: NavItem[] = [
  { href: "/data-stats",  label: "Data Coverage",       icon: BarChart3 },
  { href: "/methodology", label: "Scoring Methodology", icon: Compass },
  { href: "/resources",   label: "Resources",           icon: BookOpen }
];

const accountLinks: NavItem[] = [
  { href: "/team", label: "Team", icon: Users }
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
    <aside
      aria-label="Sidebar"
      className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r border-gray-200 bg-white"
    >
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <Link href="/home" className="block">
          <div className="text-lg font-bold tracking-tight text-gray-900">
            Seven16 Intel
          </div>
          <div className="text-xs text-gray-500 tracking-widest uppercase">
            Distribution Intelligence
          </div>
        </Link>
      </div>

      {/* User chip with inline sign-out */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-medium"
        >
          {(fullName || email).charAt(0).toUpperCase()}
        </span>
        <span className="flex-1 text-left min-w-0">
          <span className="block text-sm font-medium text-gray-900 truncate">
            Hi, {(fullName || email.split("@")[0]).split(" ")[0]}!
          </span>
          <span className="block text-[11px] text-gray-500 truncate">{email}</span>
        </span>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="rounded-md border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 whitespace-nowrap"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 thin-scrollbar" aria-label="Main navigation">
        {isSuperAdmin && (
          <NavSection title="Admin" titleIcon={ShieldCheck}>
            <NavLinkItem href="/admin"           label="Control Room"    icon={ShieldCheck} active={isActive("/admin")} />
            <NavLinkItem href="/admin/customers" label="Users & Tenants" icon={Users}       active={isActive("/admin/customers")} />
          </NavSection>
        )}

        <NavSection title="Intelligence">
          {intelligenceLinks.map((l) => (
            <NavLinkItem key={l.href} href={l.href} label={l.label} icon={l.icon} active={isActive(l.href)} />
          ))}
        </NavSection>

        <NavSection title="Recruit Workflow">
          {recruitLinks.map((l) => (
            <NavLinkItem key={l.href} href={l.href} label={l.label} icon={l.icon} active={isActive(l.href)} />
          ))}
        </NavSection>

        <NavSection title="Trust & Reference">
          {trustLinks.map((l) => (
            <NavLinkItem key={l.href} href={l.href} label={l.label} icon={l.icon} active={isActive(l.href)} />
          ))}
        </NavSection>

        <NavSection title="Account">
          {accountLinks.map((l) => (
            <NavLinkItem key={l.href} href={l.href} label={l.label} icon={l.icon} active={isActive(l.href)} />
          ))}
        </NavSection>
      </nav>
    </aside>
  );
}

function NavSection({
  title,
  titleIcon: TitleIcon,
  children
}: {
  title: string;
  titleIcon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="px-2 mb-1.5 text-sm font-semibold text-brand-700 inline-flex items-center gap-1.5">
        {TitleIcon && <TitleIcon className="h-3.5 w-3.5" aria-hidden="true" />}
        {title}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </div>
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
        aria-current={active ? "page" : undefined}
        className={clsx(
          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
          active
            ? "bg-brand-50 text-brand-800 font-medium"
            : "text-gray-700 hover:bg-gray-50"
        )}
      >
        <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
        <span>{label}</span>
      </Link>
    </li>
  );
}
