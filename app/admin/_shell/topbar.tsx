"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Search, Bell, AlertTriangle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { infoToast } from "@/components/ui/SuccessToast";

const COMMAND_PALETTE_TOAST =
  "Command palette coming soon — navigate from the sidebar for now.";

export function AdminTopbar({
  email,
  sandboxMode,
}: {
  email: string;
  sandboxMode: boolean;
}) {
  // ⌘K placeholder — fires a toast hint until the v2 command palette ships.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        infoToast(COMMAND_PALETTE_TOAST);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  return (
    <header className="h-16 shrink-0 border-b border-admin-border-2 bg-admin-surface px-6 flex items-center gap-4">
      {/* Search / command palette */}
      <button
        type="button"
        onClick={() => infoToast(COMMAND_PALETTE_TOAST)}
        className="flex-1 max-w-xl inline-flex items-center gap-2 rounded-md border border-admin-border bg-admin-surface-2 px-3 py-2 text-sm text-admin-text-mute hover:text-admin-text hover:border-admin-accent/60 transition"
      >
        <Search className="h-4 w-4" />
        <span>Search records, jump to a module…</span>
        <span className="ml-auto text-[10px] font-mono rounded border border-admin-border px-1.5 py-0.5 text-admin-text-dim">⌘K</span>
      </button>

      {/* Sandbox badge */}
      {sandboxMode && (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-admin-danger/15 px-2.5 py-1 text-xs font-semibold text-admin-danger uppercase tracking-wide">
          <AlertTriangle className="h-3.5 w-3.5" />
          Sandbox mode
        </span>
      )}

      {/* Alerts bell */}
      <button
        type="button"
        className="relative rounded-md p-2 text-admin-text-mute hover:bg-admin-surface-2 hover:text-admin-text"
        aria-label="Alerts"
        title="Alerts (coming soon)"
      >
        <Bell className="h-4 w-4" />
      </button>

      {/* User */}
      <div className="flex items-center gap-3 pl-3 border-l border-admin-border-2">
        <div className="hidden sm:block text-right">
          <div className="text-xs font-semibold text-admin-text leading-tight">{email}</div>
          <div className="text-[10px] uppercase tracking-wide text-admin-text-dim">super_admin</div>
        </div>
        <div className="h-8 w-8 rounded-full bg-admin-accent/20 text-admin-accent flex items-center justify-center text-xs font-bold">
          {email.slice(0, 1).toUpperCase()}
        </div>
        <Link
          href="/build-list"
          className="text-xs font-semibold text-admin-text-mute hover:text-admin-text"
          title="Exit admin"
        >
          Exit →
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="text-admin-text-dim hover:text-admin-danger rounded p-1.5"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
