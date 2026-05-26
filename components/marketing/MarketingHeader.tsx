"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

type MarketingHeaderProps = {
  isAuthed: boolean;
  /**
   * Visual theme of the header. Default "light" — opaque-white blurred backdrop
   * suitable for white/cream page bodies. Use "dark" on pages that open with a
   * dark hero (homepage, /use-cases, /enterprise) so the header reads as
   * intentional rather than a white stripe over a dark image.
   */
  theme?: "light" | "dark";
};

const NAV_LINKS = [
  { href: "/verticals", label: "Verticals" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/methodology", label: "Methodology" },
  { href: "/resources", label: "Resources" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/enterprise", label: "Enterprise" },
];

export function MarketingHeader({ isAuthed, theme = "light" }: MarketingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === "dark";

  const headerClass = clsx(
    "sticky top-0 z-40 border-b backdrop-blur",
    isDark
      ? "border-slate-800/60 bg-slate-950/80 supports-[backdrop-filter]:bg-slate-950/60"
      : "border-slate-200 bg-white/90 supports-[backdrop-filter]:bg-white/75"
  );

  const brandPrimaryClass = isDark ? "text-white" : "text-navy-900";
  const brandSecondaryClass = isDark ? "text-slate-400" : "text-slate-500";

  const navLinkBase = "rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const navLinkClass = clsx(
    navLinkBase,
    isDark
      ? "text-slate-300 hover:bg-slate-800/70 hover:text-white focus-visible:ring-blue-400 focus-visible:ring-offset-slate-950"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-blue-600"
  );

  const charterChipClass = clsx(
    "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    isDark
      ? "text-gold-300 hover:bg-gold-950/40 focus-visible:ring-gold-400 focus-visible:ring-offset-slate-950"
      : "text-gold-700 hover:bg-gold-50 focus-visible:ring-gold-600"
  );
  const charterChipPillClass = clsx(
    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
    isDark ? "bg-gold-900/60 text-gold-200" : "bg-gold-100 text-gold-800"
  );

  // Sign-in (anon) link styling
  const signInLinkClass = clsx(
    "rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    isDark
      ? "text-slate-300 hover:text-white focus-visible:ring-blue-400 focus-visible:ring-offset-slate-950"
      : "text-slate-700 hover:text-slate-900 focus-visible:ring-blue-600"
  );

  // Primary CTA — same blue on both themes (legibly white-on-blue regardless
  // of surrounding background). Slight ring-offset adaptation for focus visibility.
  const primaryCtaClass = clsx(
    "inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    isDark ? "focus-visible:ring-offset-slate-950" : "focus-visible:ring-offset-2"
  );

  // Mobile menu button — adapts foreground color
  const mobileButtonClass = clsx(
    "md:hidden inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus-visible:ring-2",
    isDark
      ? "text-slate-300 hover:bg-slate-800/70 focus-visible:ring-blue-400"
      : "text-slate-700 hover:bg-slate-100 focus-visible:ring-blue-600"
  );

  // Mobile drawer — solid background matching theme (no transparency in the
  // drawer to keep menu items legible against page content scrolled behind)
  const mobileDrawerClass = clsx(
    "md:hidden border-t",
    isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white",
    mobileOpen ? "block" : "hidden"
  );
  const mobileNavLinkClass = clsx(
    "block rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2",
    isDark
      ? "text-slate-300 hover:bg-slate-800/70 hover:text-white focus-visible:ring-blue-400"
      : "text-slate-700 hover:bg-slate-100 focus-visible:ring-blue-600"
  );
  const mobileCharterLinkClass = clsx(
    "block rounded-md px-3 py-2 text-sm font-semibold",
    isDark ? "text-gold-300 hover:bg-gold-950/40" : "text-gold-700 hover:bg-gold-50"
  );
  const mobileSignInLinkClass = clsx(
    "block rounded-md px-3 py-2 text-center text-sm font-medium",
    isDark ? "text-slate-300 hover:bg-slate-800/70" : "text-slate-700 hover:bg-slate-100"
  );

  return (
    <header className={headerClass}>
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-baseline gap-2">
          <span className={clsx("text-lg font-bold tracking-tight", brandPrimaryClass)}>Agency Signal</span>
          <span className={clsx("hidden text-[11px] font-medium uppercase tracking-wider sm:inline", brandSecondaryClass)}>
            by Seven16 Group
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Link href="/build-list" className={primaryCtaClass}>
              Go to app
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className={signInLinkClass}>
                Sign in
              </Link>
              <Link href="/sign-up" className={primaryCtaClass}>
                Browse free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={mobileButtonClass}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      <div id="mobile-nav" className={mobileDrawerClass}>
        <ul className="space-y-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={mobileNavLinkClass}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            {isAuthed ? (
              <Link
                href="/build-list"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white"
              >
                Go to app
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className={mobileSignInLinkClass}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Browse free
                </Link>
              </div>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}
