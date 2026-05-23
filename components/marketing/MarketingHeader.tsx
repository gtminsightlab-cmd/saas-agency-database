"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

type MarketingHeaderProps = {
  isAuthed: boolean;
};

const NAV_LINKS = [
  { href: "/verticals", label: "Verticals" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/methodology", label: "Methodology" },
  { href: "/resources", label: "Resources" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/enterprise", label: "Enterprise" },
];

export function MarketingHeader({ isAuthed }: MarketingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-navy-900">Agency Signal</span>
          <span className="hidden text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:inline">
            by Seven16 Group
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/charter"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gold-700 hover:bg-gold-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-600 focus-visible:ring-offset-2"
            >
              Charter
              <span className="rounded-full bg-gold-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-800">
                50–75 seats
              </span>
            </Link>
          </li>
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Link
              href="/build-list"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Go to app
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Browse free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={clsx(
          "md:hidden border-t border-slate-200 bg-white",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <ul className="space-y-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/charter"
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-semibold text-gold-700 hover:bg-gold-50"
            >
              Charter (50–75 seats)
            </Link>
          </li>
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
                  className="block rounded-md px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100"
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
