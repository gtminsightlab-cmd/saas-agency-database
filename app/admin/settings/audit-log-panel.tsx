import {
  ScrollText,
  ArrowRight,
  Crown,
  Shield,
  User,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type AuditRow = {
  id: string;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
};

const ACTION_ICON: Record<string, typeof PlusCircle> = {
  insert: PlusCircle,
  update: Pencil,
  delete: Trash2,
};

const ACTION_TONE: Record<string, string> = {
  insert: "bg-admin-ok/15 text-admin-ok",
  update: "bg-admin-accent/15 text-admin-accent",
  delete: "bg-admin-danger/15 text-admin-danger",
};

const ROLE_ICON: Record<string, typeof Crown> = {
  super_admin: Crown,
  admin: Shield,
  user: User,
};

export async function AuditLogPanel() {
  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from("audit_log")
    .select("id,actor_email,actor_role,action,resource_type,resource_id,created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-admin-text-dim" />
            Audit log
          </h2>
          <p className="mt-0.5 text-xs text-admin-text-mute">
            Last 30 mutations on high-value admin tables. Trigger-populated — no client code path
            can bypass it. SOC 2 retention queue: 90d hot, S3 archive thereafter (deferred).
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-admin-danger/40 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger">
          Failed to load audit log: {error.message}
        </div>
      )}

      {!error && (rows ?? []).length === 0 ? (
        <div className="py-6 text-center text-sm text-admin-text-mute">
          No audit-log rows yet. Mutations on feature_flags, tenant_limits, app_users, denylists, or
          billing_plans will appear here.
        </div>
      ) : (
        <ul className="divide-y divide-admin-border-2">
          {((rows ?? []) as AuditRow[]).map((r) => {
            const ActionIcon = ACTION_ICON[r.action] ?? Pencil;
            const RoleIcon = ROLE_ICON[r.actor_role ?? "user"] ?? User;
            return (
              <li key={r.id} className="flex items-start gap-3 py-2.5 text-xs">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-md shrink-0 ${
                    ACTION_TONE[r.action] ?? "bg-admin-surface-2 text-admin-text-mute"
                  }`}
                >
                  <ActionIcon className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-admin-text font-medium">
                      {r.action} on{" "}
                      <code className="text-admin-text-mute">{r.resource_type}</code>
                    </span>
                    {r.resource_id && (
                      <code className="text-[10px] text-admin-text-dim">
                        {r.resource_id.slice(0, 8)}…
                      </code>
                    )}
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-admin-text-mute">
                    <RoleIcon className="h-2.5 w-2.5 text-admin-text-dim" />
                    <span>{r.actor_email ?? "unknown actor"}</span>
                    <span className="text-admin-text-dim">·</span>
                    <span className="text-admin-text-dim">{r.actor_role ?? "—"}</span>
                  </div>
                </div>
                <span className="text-[10px] text-admin-text-dim shrink-0 tabular-nums">
                  {new Date(r.created_at).toLocaleString()}
                </span>
                {/* Future: <button>View diff</button> opens before/after JSON */}
                <ArrowRight className="h-3 w-3 text-admin-text-dim shrink-0 opacity-30" />
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-[11px] text-admin-text-mute">
        Tables under audit: feature_flags · tenant_limits · app_users · data_load_denylist ·
        email_domain_denylist · billing_plans · carrier_verticals · vertical_markets ·
        account_types · agency_management_systems.
      </p>
    </section>
  );
}
