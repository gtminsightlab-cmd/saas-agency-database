"use client";

// Seven16 Group Support widget — Stage 2.
//
// LIVE as of 2026-05-24. Doctrine update: Master O confirmed the support
// platform (seven16groupsupport.com) is built + ready, and the family
// "support-INTEGRATABLE not support-DEPENDENT" rule is unlocked for active
// integration. This component now renders a real floating chat bubble that
// expands into an iframe loading the platform's Agency Signal support page.
//
// Stage 2 scope (this commit):
//   - Floating chat button (fixed bottom-right, z-50)
//   - Click → expands a fixed-position panel with an iframe
//   - Mode: "public_presales" only (anonymous, no signed token)
//   - Mounted globally in app/layout.tsx
//
// Stage 3 (deferred):
//   - Signed-token user context for customer_support mode (authed users)
//   - Per-route mode switching (technical_sales on /pricing, etc.)
//   - Server-side event POSTing (vs current console.debug)
//   - postMessage protocol for cross-frame communication
//
// Architecture rule (still in force):
//   Agency Signal must NEVER break if seven16groupsupport.com is offline.
//   The iframe loads lazily; failure is silent; floating button still renders
//   even if the platform is unreachable (the user just sees the iframe's own
//   error page when they click).
//
// See `docs/support-integration-readiness.md` for the full spec.

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import type { SupportMode } from "@/lib/support/context";

export type Seven16SupportWidgetProps = {
  /** Always `"agencysignal"` for this repo. Required so the support platform routes correctly. */
  productSlug?: "agencysignal";
  /** Which support flow the widget should open in. Stage 2 only supports "public_presales". */
  mode?: SupportMode;
  /** Short-lived signed JWT carrying safe user context. Required for authed modes in Stage 3. */
  userContextToken?: string;
  /** URL pathname when the widget was rendered. Reserved for Stage 3. */
  currentPath?: string;
  /** Visual theme. Reserved for Stage 3 — platform doesn't yet accept theme params. */
  theme?: "light" | "dark" | "system";
};

const PLATFORM_BASE_URL = "https://seven16groupsupport.com";
const PRODUCT_SLUG_DEFAULT = "agencysignal";

export function Seven16SupportWidget({
  productSlug = PRODUCT_SLUG_DEFAULT,
}: Seven16SupportWidgetProps = {}) {
  const [open, setOpen] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  // Lazy-load the iframe only after the first open — keeps the floating
  // button zero-cost on initial page load for prospects who never click it.
  // Setting hasBeenOpened in the toggle handler (vs. an effect) avoids the
  // react-hooks/set-state-in-effect lint flag.
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  // SESSION_37 defensive (2026-05-25): force panel closed on every fresh
  // mount. Reproduced on PR #8 preview: panel rendered open with "Loading…"
  // placeholder on first paint despite useState(false). Root cause not
  // pinned (App Router layout state across nav, or hydration drift) — but
  // an explicit setOpen(false) on mount guarantees the small-pill-only
  // landing state regardless. Pill renders unconditionally below.
  useEffect(() => {
    setOpen(false);
  }, []);

  // Defensive sync: if `open` ever becomes true while hasBeenOpened is
  // false (the "Loading… persists" symptom), promote hasBeenOpened so the
  // iframe mounts and the user never sees the placeholder.
  useEffect(() => {
    if (open && !hasBeenOpened) setHasBeenOpened(true);
  }, [open, hasBeenOpened]);

  // Escape key closes the panel from anywhere on the page.
  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = useCallback(() => {
    // Two independent setState calls — React batches them into one render.
    // setHasBeenOpened(true) is idempotent; safe to call on every toggle.
    // Previous pattern (calling setHasBeenOpened inside the setOpen updater
    // function) didn't reliably commit hasBeenOpened — symptom was the
    // "Loading…" placeholder persisting after the user clicked to open.
    setOpen((v) => !v);
    setHasBeenOpened(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  const iframeSrc = `${PLATFORM_BASE_URL}/support/${productSlug}`;

  return (
    <>
      {/* Floating chat button — SESSION_37 (2026-05-25): always rendered
          (previously hidden when panel open via `{!open ? ... : null}` to
          eliminate "double X" confusion, but deployed behavior was showing
          the pill alongside an auto-open panel anyway). Always-on pill is
          more robust to state drift and matches Master O's stated UX
          preference: "smaller chat with us should be the only thing on
          landing." Label flips to "Close chat" when panel open so the
          affordance is unambiguous. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
        aria-controls="seven16-support-panel"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        <span>{open ? "Close chat" : "Chat with us"}</span>
      </button>

      {/* Expanded panel. Display toggled via conditional className so the
          iframe stays mounted across opens (chat history preserved within
          session). SESSION_37 (2026-05-25): previously used the HTML `hidden`
          attribute + the Tailwind `flex` class — but `display:flex` from the
          author stylesheet wins over the user-agent `[hidden]{display:none}`
          rule, so the panel was always visible regardless of `open`. The
          conditional `flex`/`hidden` Tailwind class fixes it because both
          rules live in the same author stylesheet and the LATER one in the
          className wins; here Tailwind's `hidden` (display:none) is the
          single source of truth when open=false. */}
      <div
        id="seven16-support-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="seven16-support-title"
        aria-hidden={!open}
        className={`fixed bottom-24 right-6 z-50 h-[600px] max-h-[calc(100vh-7rem)] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${open ? "flex" : "hidden"}`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 id="seven16-support-title" className="text-sm font-bold text-slate-950">
              Agency Signal Support
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close support chat"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="relative flex-1 bg-white">
          {hasBeenOpened ? (
            iframeError ? (
              <SupportFallback />
            ) : (
              <iframe
                src={iframeSrc}
                title="Agency Signal support chat"
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                referrerPolicy="strict-origin-when-cross-origin"
                onError={() => setIframeError(true)}
              />
            )
          ) : (
            // Pre-load placeholder — never visible in practice because the
            // panel itself is `hidden` until the user clicks, which also
            // sets hasBeenOpened=true in the toggle handler.
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Loading…
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Graceful fallback shown if the iframe fails to load (platform offline,
 * DNS issue, or CSP rejection). Honors the doctrine — Agency Signal must
 * not break when the platform is unreachable; the user just sees a
 * mailto fallback instead of a broken iframe.
 */
function SupportFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-slate-600">
        Chat is temporarily unavailable. We&rsquo;ll come back to you fast on email.
      </p>
      <a
        href="mailto:hello@seven16group.com?subject=Agency%20Signal%20support%20question"
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-500"
      >
        Email hello@seven16group.com
      </a>
    </div>
  );
}
