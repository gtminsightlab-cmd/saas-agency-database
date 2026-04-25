"use client";

import { useMemo, useState } from "react";
import {
  CircleCheck,
  CircleSlash,
  Crown,
  Shield,
  User,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SortableThButton, type SortDir } from "@/components/sortable-th";

export type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  plan_name: string | null;
  plan_status: string | null;
  current_period_end: string | null;
  credits: number | null;
};

type SortKey = "user" | "role" | "plan" | "credits" | "created" | "status";

const ROLE_ICON: Record<string, typeof User> = {
  super_admin: Crown,
  admin: Shield,
  user: User,
};

// Role rank for stable comparison (super_admin > admin > user > other)
const ROLE_RANK: Record<string, number> = { super_admin: 3, admin: 2, user: 1 };

export function UsersTable({ initialRows }: { initialRows: UserRow[] }) {
  const [rows, setRows] = useState<UserRow[]>(initialRows);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("user");
  const [dir, setDir] = useState<SortDir>("asc");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  function showToast(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 3500);
  }

  function clickHeader(key: SortKey) {
    if (sort === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      // Numeric/date columns → desc; text columns → asc.
      setDir(key === "credits" || key === "created" ? "desc" : "asc");
    }
  }

  const visible = useMemo(() => {
    let out = rows;
    if (filter.trim()) {
      const q = filter.trim().toLowerCase();
      out = out.filter(
        (r) =>
          r.email.toLowerCase().includes(q) ||
          (r.full_name ?? "").toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q)
      );
    }
    const sorted = [...out].sort((a, b) => {
      let diff = 0;
      switch (sort) {
        case "user":
          diff = (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email);
          break;
        case "role":
          diff = (ROLE_RANK[a.role] ?? 0) - (ROLE_RANK[b.role] ?? 0);
          if (diff === 0) diff = a.role.localeCompare(b.role);
          break;
        case "plan":
          diff = (a.plan_name ?? "").localeCompare(b.plan_name ?? "");
          break;
        case "credits":
          diff = (a.credits ?? 0) - (b.credits ?? 0);
          break;
        case "created":
          diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "status":
          // active=true beats false when desc
          diff = (a.is_active === b.is_active) ? 0 : a.is_active ? 1 : -1;
          break;
      }
      if (diff === 0) diff = a.email.localeCompare(b.email);
      return dir === "asc" ? diff : -diff;
    });
    return sorted;
  }, [rows, filter, sort, dir]);

  async function toggleActive(r: UserRow) {
    const next = !r.is_active;
    if (
      !next &&
      !window.confirm(
        `Suspend ${r.email}? They'll be locked out of the app on next request. You can reactivate at any time.`
      )
    ) {
      return;
    }
    setBusyId(r.id);
    const { error } = await supabase
      .from("app_users")
      .update({ is_active: next })
      .eq("id", r.id);
    setBusyId(null);
    if (error) {
      showToast("err", `Failed: ${error.message}`);
      return;
    }
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, is_active: next } : x)));
    showToast("ok", next ? `Reactivated ${r.email}` : `Suspended ${r.email}`);
  }

  return (
    <div className="space-y-3">
      {toast && (
        <div
          className={[
            "fixed top-20 right-6 z-50 rounded-md px-4 py-2 text-sm font-medium shadow-lg",
            toast.kind === "ok" ? "bg-admin-ok text-white" : "bg-admin-danger text-white",
          ].join(" ")}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-admin-border-2 bg-admin-surface p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-text-dim" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by email / name / role…"
            className="w-full rounded-md border border-admin-border bg-admin-surface-2 pl-9 pr-3 py-2 text-sm text-admin-text placeholder-admin-text-dim outline-none focus:border-admin-accent"
          />
        </div>
        <span className="text-xs text-admin-text-mute tabular-nums">
          {visible.length} of {rows.length}
        </span>
      </div>

      <div className="rounded-lg border border-admin-border-2 bg-admin-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-admin-surface-2">
            <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
              <SortableThButton theme="admin" label="User"    sortKey="user"    activeSort={sort} dir={dir} onSort={clickHeader} />
              <SortableThButton theme="admin" label="Role"    sortKey="role"    activeSort={sort} dir={dir} onSort={clickHeader} />
              <SortableThButton theme="admin" label="Plan"    sortKey="plan"    activeSort={sort} dir={dir} onSort={clickHeader} />
              <SortableThButton theme="admin" label="Credits" sortKey="credits" activeSort={sort} dir={dir} onSort={clickHeader} />
              <SortableThButton theme="admin" label="Created" sortKey="created" activeSort={sort} dir={dir} onSort={clickHeader} />
              <SortableThButton theme="admin" label="Status"  sortKey="status"  activeSort={sort} dir={dir} onSort={clickHeader} />
              <th className="px-4 py-2.5 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-2">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-admin-text-mute">
                  No users match.
                </td>
              </tr>
            ) : (
              visible.map((r) => {
                const RoleIcon = ROLE_ICON[r.role] ?? User;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-admin-text break-all">{r.email}</div>
                      {r.full_name && (
                        <div className="mt-0.5 text-xs text-admin-text-mute">{r.full_name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          r.role === "super_admin"
                            ? "bg-admin-warn/15 text-admin-warn"
                            : r.role === "admin"
                            ? "bg-admin-accent/15 text-admin-accent"
                            : "bg-admin-surface-2 text-admin-text-mute",
                        ].join(" ")}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {r.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {r.plan_name ? (
                        <div>
                          <div className="text-xs font-medium text-admin-text">{r.plan_name}</div>
                          {r.plan_status && (
                            <span
                              className={[
                                "mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-wider",
                                r.plan_status === "active"
                                  ? "text-admin-ok"
                                  : r.plan_status === "trialing"
                                  ? "text-admin-accent"
                                  : "text-admin-text-dim",
                              ].join(" ")}
                            >
                              {r.plan_status}
                            </span>
                          )}
                          {r.current_period_end && (
                            <div className="mt-0.5 text-[10px] text-admin-text-dim">
                              renews {new Date(r.current_period_end).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-admin-text-dim">No plan</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums text-admin-text">
                      {r.credits ?? <span className="text-admin-text-dim">—</span>}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-admin-text-mute">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold",
                          r.is_active
                            ? "bg-admin-ok/15 text-admin-ok"
                            : "bg-admin-danger/15 text-admin-danger",
                        ].join(" ")}
                      >
                        {r.is_active ? (
                          <>
                            <CircleCheck className="h-3 w-3" /> Active
                          </>
                        ) : (
                          <>
                            <CircleSlash className="h-3 w-3" /> Suspended
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleActive(r)}
                          disabled={busyId === r.id}
                          className={[
                            "rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1",
                            r.is_active
                              ? "border-admin-danger/30 text-admin-danger hover:bg-admin-danger/10"
                              : "border-admin-ok/30 text-admin-ok hover:bg-admin-ok/10",
                          ].join(" ")}
                        >
                          {busyId === r.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : r.is_active ? (
                            <CircleSlash className="h-3 w-3" />
                          ) : (
                            <CircleCheck className="h-3 w-3" />
                          )}
                          {r.is_active ? "Suspend" : "Reactivate"}
                        </button>
                        <button
                          type="button"
                          disabled
                          title="Impersonate (v2 — needs JWT minting + audit log)"
                          className="rounded-md border border-admin-border px-2 py-1 text-xs font-semibold text-admin-text-dim opacity-50 cursor-not-allowed inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Impersonate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

