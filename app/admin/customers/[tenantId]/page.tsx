import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  CreditCard,
  Coins,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UsersTable, type UserRow } from "./users-table";

export const dynamic = "force-dynamic";

type Tenant = {
  id: string;
  name: string;
  slug: string | null;
  plan: string | null;
  primary_color: string | null;
  created_at: string;
};

type Plan = { id: string; name: string; code: string; price_cents: number; interval: string; stripe_price_id: string | null };
type Entitlement = {
  id: string;
  app_user_id: string;
  plan_id: string;
  status: string;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  downloads_remaining: number | null;
};
type Wallet = { app_user_id: string; balance: number; last_refresh_at: string | null };

export default async function TenantDetail({
  params,
}: {
  params: { tenantId: string };
}) {
  const supabase = createClient();

  const [
    { data: tenant },
    { data: users },
    { data: plans },
  ] = await Promise.all([
    supabase
      .from("tenants")
      .select("id,name,slug,plan,primary_color,created_at")
      .eq("id", params.tenantId)
      .maybeSingle(),
    supabase
      .from("app_users")
      .select("id,email,full_name,role,is_active,user_id,created_at,updated_at,tenant_id")
      .eq("tenant_id", params.tenantId)
      .order("created_at", { ascending: true }),
    supabase
      .from("billing_plans")
      .select("id,name,code,price_cents,interval,stripe_price_id"),
  ]);

  if (!tenant) notFound();
  const t = tenant as Tenant;
  const userIds = (users ?? []).map((u: any) => u.id);

  const [{ data: ents }, { data: wallets }] = await Promise.all([
    userIds.length
      ? supabase
          .from("user_entitlements")
          .select("id,app_user_id,plan_id,status,stripe_subscription_id,current_period_end,downloads_remaining")
          .in("app_user_id", userIds)
      : Promise.resolve({ data: [] as Entitlement[] }),
    userIds.length
      ? supabase
          .from("credit_wallets")
          .select("app_user_id,balance,last_refresh_at")
          .in("app_user_id", userIds)
      : Promise.resolve({ data: [] as Wallet[] }),
  ]);

  const planById = new Map<string, Plan>(((plans ?? []) as Plan[]).map((p) => [p.id, p]));
  const entByUser = new Map<string, Entitlement>(((ents ?? []) as Entitlement[]).map((e) => [e.app_user_id, e]));
  const walletByUser = new Map<string, Wallet>(((wallets ?? []) as Wallet[]).map((w) => [w.app_user_id, w]));

  const rows: UserRow[] = ((users ?? []) as any[]).map((u) => {
    const ent = entByUser.get(u.id);
    const wallet = walletByUser.get(u.id);
    const plan = ent ? planById.get(ent.plan_id) : null;
    return {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
      plan_name: plan?.name ?? null,
      plan_status: ent?.status ?? null,
      current_period_end: ent?.current_period_end ?? null,
      credits: wallet?.balance ?? null,
    };
  });

  const totals = {
    users: rows.length,
    active: rows.filter((r) => r.is_active).length,
    paying: rows.filter((r) => r.plan_status === "active").length,
    credits: rows.reduce((s, r) => s + (r.credits ?? 0), 0),
  };

  const activePlans = ((ents ?? []) as Entitlement[])
    .filter((e) => e.status === "active")
    .map((e) => planById.get(e.plan_id)?.name ?? "Unknown")
    .reduce<Record<string, number>>((acc, name) => {
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> All tenants
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Tenant</div>
        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold text-admin-text">{t.name}</h1>
          {t.slug && <code className="text-xs text-admin-text-mute">{t.slug}</code>}
          {t.plan && (
            <span className="rounded-full bg-admin-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-admin-accent uppercase tracking-wider">
              {t.plan}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-admin-text-mute">
          Tenant ID <code className="text-admin-text-dim">{t.id}</code> · created{" "}
          {new Date(t.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Users"     value={totals.users}    Icon={Building2}  hint={`${totals.active} active`} />
        <Kpi label="On a plan" value={totals.paying}   Icon={CreditCard} hint="status=active" />
        <Kpi label="Credits"   value={totals.credits}  Icon={Coins}      hint="Sum across all wallets" />
        <Kpi
          label="Active plans"
          value={Object.keys(activePlans).length}
          Icon={ShieldCheck}
          hint={
            Object.keys(activePlans).length > 0
              ? Object.entries(activePlans)
                  .map(([n, c]) => `${n} (${c})`)
                  .join(", ")
              : "No active subscriptions"
          }
        />
      </div>

      {/* Users table */}
      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-admin-text">Users</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              Click suspend to disable a user immediately. Reactivate at any time.
            </p>
          </div>
        </div>
        <UsersTable initialRows={rows} />
      </section>

      {/* Plans available */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-3">
          <h2 className="text-sm font-semibold text-admin-text">Plans available</h2>
          <p className="mt-0.5 text-xs text-admin-text-mute">From billing_plans — Stripe price IDs shown when wired.</p>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          {((plans ?? []) as Plan[]).map((p) => (
            <div key={p.id} className="rounded-md border border-admin-border-2 bg-admin-surface-2 p-3">
              <div className="text-xs uppercase tracking-wider text-admin-text-dim">{p.code}</div>
              <div className="mt-0.5 text-sm font-semibold text-admin-text">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-semibold text-admin-text">${(p.price_cents / 100).toFixed(0)}</span>
                <span className="text-xs text-admin-text-mute">/{p.interval}</span>
              </div>
              {p.stripe_price_id && (
                <code className="mt-2 block text-[10px] text-admin-text-dim truncate">{p.stripe_price_id}</code>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Coming-soon footer */}
      <div className="rounded-lg border border-dashed border-admin-border bg-admin-surface px-5 py-4 text-xs text-admin-text-mute">
        <span className="text-admin-text font-semibold">Next iteration:</span> impersonation
        (one-shot signed JWT, audit-logged), per-tenant search/export/download caps with hard/soft
        toggles, and credit reset.
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  Icon,
  hint,
}: {
  label: string;
  value: number;
  Icon: typeof Building2;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-admin-accent/15 text-admin-accent">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">{value.toLocaleString()}</div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}

// avoid unused-import lint
const _kept = { Mail, Calendar };
