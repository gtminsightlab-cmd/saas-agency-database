import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  TrendingUp,
  CircleDollarSign,
  Receipt,
  AlertTriangle,
  ExternalLink,
  Wallet,
  Crown,
  Calendar,
  CheckCircle,
  XCircle,
  Coins,
  Gift,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  listActiveSubscriptions,
  listRecentInvoices,
  listRecentEvents,
  getBalance,
  type SubSummary,
} from "./_lib/stripe-fetchers";
import { EventLog } from "./event-log";
import { classifyHygieneEligibility, fmtAge } from "./_lib/hygiene-credit";

export const dynamic = "force-dynamic";

const STRIPE_DASHBOARD = "https://dashboard.stripe.com/test";

type AppUser  = { id: string; email: string; tenant_id: string | null };
type Tenant   = { id: string; name: string };
type Wallet   = { app_user_id: string; balance: number };
type LedgerRow = {
  id: string;
  wallet_id: string;
  delta: number;
  reason: string | null;
  stripe_event_id: string | null;
  expires_at: string | null;
  created_at: string;
};
type StripeCustomer = { app_user_id: string; stripe_customer_id: string };
type Plan = {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  price_cents: number;
  interval: string;
  active: boolean;
  stripe_price_id: string | null;
};

export default async function BillingPage() {
  const supabase = await createClient();

  const [
    subsResult,
    invoicesResult,
    eventsResult,
    balanceResult,
    { data: plans },
    { data: appUsers },
    { data: tenants },
    { data: stripeCustomers },
    { data: wallets },
    { data: ledgerRows },
  ] = await Promise.all([
    listActiveSubscriptions(),
    listRecentInvoices(10),
    listRecentEvents(50),
    getBalance(),
    supabase.from("billing_plans").select("id,code,name,tagline,price_cents,interval,active,stripe_price_id").order("sort_order"),
    supabase.from("app_users").select("id,email,tenant_id"),
    supabase.from("tenants").select("id,name"),
    supabase.from("stripe_customers").select("app_user_id,stripe_customer_id"),
    supabase.from("credit_wallets").select("app_user_id,balance"),
    supabase
      .from("credit_ledger")
      .select("id,wallet_id,delta,reason,stripe_event_id,expires_at,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const stripeConfigured =
    subsResult.ok || (subsResult.ok === false && subsResult.configured);
  const stripeLive = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ?? false;

  const subs = subsResult.ok ? subsResult.data : [];
  const invoices = invoicesResult.ok ? invoicesResult.data : [];
  const events = eventsResult.ok ? eventsResult.data : [];
  const balance = balanceResult.ok ? balanceResult.data : null;

  // MRR: sum of monthly active subs. For yearly, divide by 12.
  const activeSubs = subs.filter((s) => s.status === "active" || s.status === "trialing");
  const mrrCents = activeSubs.reduce((sum, s) => {
    if (s.interval === "month") return sum + s.unit_amount_cents;
    if (s.interval === "year") return sum + Math.round(s.unit_amount_cents / 12);
    return sum;
  }, 0);
  const arrCents = mrrCents * 12;
  const cancelingCount = activeSubs.filter((s) => s.cancel_at_period_end).length;

  const usersById = new Map<string, AppUser>(((appUsers ?? []) as AppUser[]).map((u) => [u.id, u]));
  const tenantById = new Map<string, Tenant>(((tenants ?? []) as Tenant[]).map((t) => [t.id, t]));
  const userByStripeCustomer = new Map<string, AppUser | null>(
    ((stripeCustomers ?? []) as StripeCustomer[]).map((c) => {
      const u = usersById.get(c.app_user_id);
      return [c.stripe_customer_id, u ?? null];
    })
  );
  const walletsByUser = new Map<string, Wallet>(
    ((wallets ?? []) as Wallet[]).map((w) => [w.app_user_id, w])
  );

  // Hygiene credit eligibility — anchor at month 6 and month 12
  const elig6  = classifyHygieneEligibility(activeSubs, 6,  30);
  const elig12 = classifyHygieneEligibility(activeSubs, 12, 30);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-semibold text-admin-text-mute hover:text-admin-text"
        >
          <ArrowLeft className="h-3 w-3" /> Overview
        </Link>
        <div className="mt-2 text-xs uppercase tracking-wider text-admin-text-dim">Billing</div>
        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-semibold text-admin-text">Revenue &amp; subscriptions</h1>
          {stripeConfigured ? (
            <span
              className={[
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                stripeLive
                  ? "bg-admin-ok/15 text-admin-ok"
                  : "bg-admin-warn/15 text-admin-warn",
              ].join(" ")}
            >
              {stripeLive ? "Stripe live" : "Stripe sandbox"}
            </span>
          ) : (
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-admin-danger/15 text-admin-danger">
              Stripe not configured
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-admin-text-mute max-w-3xl">
          MRR + ARR projection from Stripe live data, the last 50 webhook events, plans pulled from
          billing_plans, and Hygiene Credit eligibility math (10% off at month 6 + 12 — wiring is
          pending Stripe Subscription Schedule).
        </p>
      </div>

      {/* Stripe-not-configured banner */}
      {!stripeConfigured && (
        <div className="rounded-xl border border-admin-danger/40 bg-admin-danger/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-admin-danger shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-admin-text">STRIPE_SECRET_KEY not set in Vercel env</h2>
              <p className="mt-1 text-xs text-admin-text-mute max-w-2xl">
                The Billing page requires <code className="text-admin-text">STRIPE_SECRET_KEY</code>{" "}
                to call the Stripe API. Add it from the Stripe sandbox dashboard → Developers →
                API keys, then redeploy. Until then, only DB-backed panels (Plans, Hygiene Credit
                eligibility from user_entitlements, Credit ledger) will render.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="MRR"
          value={subsResult.ok ? `$${(mrrCents / 100).toFixed(2)}` : "—"}
          Icon={TrendingUp}
          tone="accent"
          hint={subsResult.ok ? `${activeSubs.length} active subscriptions` : "Stripe unavailable"}
        />
        <Kpi
          label="ARR projection"
          value={subsResult.ok ? `$${(arrCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
          Icon={CircleDollarSign}
          tone="accent"
          hint="MRR × 12"
        />
        <Kpi
          label="Pending balance"
          value={balance ? `$${(balance.pending_cents / 100).toFixed(2)}` : "—"}
          Icon={Wallet}
          tone="ok"
          hint={
            balance
              ? `$${(balance.available_cents / 100).toFixed(2)} available`
              : "Stripe balance unavailable"
          }
        />
        <Kpi
          label="Canceling"
          value={subsResult.ok ? cancelingCount : "—"}
          Icon={AlertTriangle}
          tone={cancelingCount > 0 ? "warn" : "mute"}
          hint="cancel_at_period_end = true"
        />
      </div>

      {/* Plans */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-admin-text">Plans</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">From billing_plans (DB).</p>
          </div>
          <a
            href={`${STRIPE_DASHBOARD}/products`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
          >
            Open in Stripe
            <ExternalLink className="h-3 w-3" />
          </a>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          {((plans ?? []) as Plan[]).map((p) => {
            const subsOnPlan = activeSubs.filter((s) => s.price_id === p.stripe_price_id).length;
            return (
              <div
                key={p.id}
                className="rounded-md border border-admin-border-2 bg-admin-surface-2 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-admin-text-dim">{p.code}</div>
                  {p.active ? (
                    <span className="text-[10px] uppercase tracking-wider text-admin-ok font-semibold">Active</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider text-admin-text-dim font-semibold">Inactive</span>
                  )}
                </div>
                <div className="mt-1 text-sm font-semibold text-admin-text">{p.name}</div>
                {p.tagline && <p className="mt-0.5 text-xs text-admin-text-mute">{p.tagline}</p>}
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xl font-semibold text-admin-text">
                    ${(p.price_cents / 100).toFixed(0)}
                  </span>
                  <span className="text-xs text-admin-text-mute">/{p.interval}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-admin-text-mute">
                    <strong className="text-admin-text tabular-nums">{subsOnPlan}</strong>{" "}
                    {subsOnPlan === 1 ? "subscriber" : "subscribers"}
                  </span>
                  {p.stripe_price_id ? (
                    <code className="text-admin-text-dim truncate max-w-[140px]" title={p.stripe_price_id}>
                      {p.stripe_price_id}
                    </code>
                  ) : (
                    <span className="text-admin-text-dim">No Stripe price</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active subscriptions */}
      {subsResult.ok && (
        <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
          <header className="px-5 py-3 border-b border-admin-border-2">
            <h2 className="text-sm font-semibold text-admin-text">Active subscriptions</h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              {activeSubs.length} active · pulled from Stripe at request time
            </p>
          </header>
          {activeSubs.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-admin-text-mute">No active subscriptions.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-admin-surface-2">
                <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Plan</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Started</th>
                  <th className="px-5 py-2.5 font-medium">Renews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border-2">
                {activeSubs.map((s) => {
                  const u = userByStripeCustomer.get(s.customer_id) ?? null;
                  return (
                    <tr key={s.id}>
                      <td className="px-5 py-3 align-top">
                        {u ? (
                          <div>
                            <div className="text-xs font-medium text-admin-text break-all">{u.email}</div>
                            <code className="mt-0.5 block text-[10px] text-admin-text-dim truncate" title={s.customer_id}>
                              {s.customer_id}
                            </code>
                          </div>
                        ) : (
                          <code className="text-[10px] text-admin-text-dim">{s.customer_id}</code>
                        )}
                      </td>
                      <td className="px-5 py-3 align-top">
                        <div className="text-xs text-admin-text">
                          ${(s.unit_amount_cents / 100).toFixed(2)} / {s.interval}
                        </div>
                        <code className="text-[10px] text-admin-text-dim">{s.price_id}</code>
                      </td>
                      <td className="px-5 py-3 align-top">
                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            s.cancel_at_period_end
                              ? "bg-admin-warn/15 text-admin-warn"
                              : s.status === "active"
                              ? "bg-admin-ok/15 text-admin-ok"
                              : "bg-admin-text-dim/15 text-admin-text-dim",
                          ].join(" ")}
                        >
                          {s.cancel_at_period_end ? "canceling" : s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-top text-xs text-admin-text-mute">
                        <div>{new Date(s.created * 1000).toLocaleDateString()}</div>
                        <div className="text-[10px] text-admin-text-dim">{fmtAge(s.created)} ago</div>
                      </td>
                      <td className="px-5 py-3 align-top text-xs text-admin-text-mute">
                        {s.current_period_end ? new Date(s.current_period_end * 1000).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Hygiene Credit ledger */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
              <Gift className="h-4 w-4 text-admin-accent" />
              Hygiene Credit ledger
            </h2>
            <p className="mt-0.5 text-xs text-admin-text-mute max-w-2xl">
              10% off at month 6 and month 12 of an active monthly subscription, framed as a
              loyalty thank-you. <strong className="text-admin-warn">Not yet wired</strong> —
              needs Stripe Subscription Schedule with phased pricing or a programmatic coupon.
            </p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <HygieneAnchorPanel anchor={6}  result={elig6}  userByStripeCustomer={userByStripeCustomer} />
          <HygieneAnchorPanel anchor={12} result={elig12} userByStripeCustomer={userByStripeCustomer} />
        </div>

        <div className="mt-5">
          <h3 className="text-xs uppercase tracking-wider text-admin-text-dim font-semibold">
            Applied discount log
          </h3>
          <p className="mt-1 text-xs text-admin-text-mute">
            From <code className="text-admin-text">credit_ledger</code> rows where{" "}
            <code className="text-admin-text">reason</code> mentions hygiene/loyalty. Once wiring is
            live, every applied 10% credit will land here with the Stripe event ID.
          </p>
          <CreditLedgerTable rows={(ledgerRows ?? []) as LedgerRow[]} walletsByUser={walletsByUser} usersById={usersById} />
        </div>
      </section>

      {/* Recent invoices */}
      {invoicesResult.ok && invoices.length > 0 && (
        <section className="rounded-xl border border-admin-border-2 bg-admin-surface overflow-hidden">
          <header className="px-5 py-3 border-b border-admin-border-2 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-admin-text">Recent invoices</h2>
              <p className="mt-0.5 text-xs text-admin-text-mute">Last {invoices.length} from Stripe.</p>
            </div>
            <a
              href={`${STRIPE_DASHBOARD}/invoices`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
            >
              All invoices <ExternalLink className="h-3 w-3" />
            </a>
          </header>
          <table className="w-full text-sm">
            <thead className="bg-admin-surface-2">
              <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
                <th className="px-5 py-2.5 font-medium">Invoice</th>
                <th className="px-5 py-2.5 font-medium">Customer</th>
                <th className="px-5 py-2.5 font-medium">Amount</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Reason</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-2">
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className="px-5 py-3 align-top">
                    <code className="text-[10px] text-admin-text-dim">{i.id}</code>
                  </td>
                  <td className="px-5 py-3 align-top text-xs text-admin-text break-all">
                    {i.customer_email ?? i.customer_id}
                  </td>
                  <td className="px-5 py-3 align-top tabular-nums">
                    <div className="text-admin-text">${(i.amount_paid_cents / 100).toFixed(2)}</div>
                    {i.amount_paid_cents !== i.amount_due_cents && (
                      <div className="text-[10px] text-admin-text-dim">
                        of ${(i.amount_due_cents / 100).toFixed(2)} due
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 align-top">
                    <InvoiceStatus status={i.status} />
                  </td>
                  <td className="px-5 py-3 align-top text-xs text-admin-text-mute">{i.billing_reason}</td>
                  <td className="px-5 py-3 align-top text-xs text-admin-text-mute">
                    {new Date(i.created * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Webhook event log */}
      <section className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-admin-text inline-flex items-center gap-2">
              <Receipt className="h-4 w-4 text-admin-text-dim" />
              Webhook events
            </h2>
            <p className="mt-0.5 text-xs text-admin-text-mute">
              {eventsResult.ok
                ? `Last ${events.length} events from Stripe — filter by type below`
                : "Stripe events unavailable"}
            </p>
          </div>
          {eventsResult.ok && (
            <a
              href={`${STRIPE_DASHBOARD}/events`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-admin-accent hover:underline"
            >
              Open in Stripe <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </header>
        {eventsResult.ok ? (
          <EventLog events={events} dashboardBase={STRIPE_DASHBOARD} />
        ) : (
          <div className="rounded-md border border-dashed border-admin-border bg-admin-surface-2/40 p-6 text-center text-sm text-admin-text-mute">
            {eventsResult.configured ? `Failed to fetch: ${eventsResult.error}` : "Stripe key not configured."}
          </div>
        )}
      </section>

      {/* Footer next-steps */}
      <div className="rounded-lg border border-admin-border-2 bg-admin-surface px-5 py-4 text-xs text-admin-text-mute">
        <span className="text-admin-text font-semibold">Next iteration:</span> Hygiene Credit
        wiring (Stripe Subscription Schedule with phased pricing OR a programmatic 10% coupon
        applied at the renewal cycle), refund + dispute panels, and Apple-Swiss-style MRR
        sparkline once we have 30+ days of data.
      </div>
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function Kpi({
  label,
  value,
  Icon,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  Icon: typeof CreditCard;
  tone: "accent" | "ok" | "warn" | "mute";
  hint: string;
}) {
  const cls =
    tone === "accent"
      ? "text-admin-accent bg-admin-accent/15"
      : tone === "ok"
      ? "text-admin-ok bg-admin-ok/15"
      : tone === "warn"
      ? "text-admin-warn bg-admin-warn/15"
      : "text-admin-text-dim bg-admin-surface-2";
  return (
    <div className="rounded-xl border border-admin-border-2 bg-admin-surface p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-medium">{label}</div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${cls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-admin-text tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 text-xs text-admin-text-mute">{hint}</div>
    </div>
  );
}

function HygieneAnchorPanel({
  anchor,
  result,
  userByStripeCustomer,
}: {
  anchor: 6 | 12;
  result: { approaching: SubSummary[]; passed: SubSummary[] };
  userByStripeCustomer: Map<string, AppUser | null>;
}) {
  return (
    <div className="rounded-md border border-admin-border-2 bg-admin-surface-2/50 p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4 text-admin-text-dim" />
          <span className="text-sm font-semibold text-admin-text">Month {anchor} anchor</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-admin-text-dim">±30 day window</span>
      </header>

      <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-semibold mt-2">
        Approaching ({result.approaching.length})
      </div>
      {result.approaching.length === 0 ? (
        <p className="mt-1 text-xs text-admin-text-mute">No subscribers approaching this anchor.</p>
      ) : (
        <ul className="mt-1 space-y-1.5">
          {result.approaching.map((s) => (
            <SubLine key={s.id} sub={s} user={userByStripeCustomer.get(s.customer_id) ?? null} />
          ))}
        </ul>
      )}

      <div className="text-[11px] uppercase tracking-wider text-admin-text-dim font-semibold mt-4">
        Recently passed ({result.passed.length})
      </div>
      {result.passed.length === 0 ? (
        <p className="mt-1 text-xs text-admin-text-mute">None — credit would have applied here.</p>
      ) : (
        <ul className="mt-1 space-y-1.5">
          {result.passed.map((s) => (
            <SubLine key={s.id} sub={s} user={userByStripeCustomer.get(s.customer_id) ?? null} highlight />
          ))}
        </ul>
      )}
    </div>
  );
}

function SubLine({
  sub,
  user,
  highlight,
}: {
  sub: SubSummary;
  user: AppUser | null;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-xs">
      <div className="min-w-0">
        <div className="text-admin-text break-all">{user?.email ?? sub.customer_id}</div>
        <div className="text-admin-text-dim text-[10px]">
          ${(sub.unit_amount_cents / 100).toFixed(0)}/{sub.interval} · {fmtAge(sub.created)} old
        </div>
      </div>
      <span
        className={[
          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          highlight
            ? "bg-admin-warn/15 text-admin-warn"
            : "bg-admin-accent/15 text-admin-accent",
        ].join(" ")}
      >
        {highlight ? "Missed" : "Soon"}
      </span>
    </li>
  );
}

function CreditLedgerTable({
  rows,
  walletsByUser,
  usersById,
}: {
  rows: LedgerRow[];
  walletsByUser: Map<string, Wallet>;
  usersById: Map<string, AppUser>;
}) {
  if (rows.length === 0) {
    return (
      <div className="mt-3 rounded-md border border-dashed border-admin-border bg-admin-surface-2/40 px-4 py-6 text-center">
        <Coins className="mx-auto h-5 w-5 text-admin-text-dim" />
        <div className="mt-2 text-sm text-admin-text">No credit-ledger entries yet</div>
        <div className="mt-1 text-xs text-admin-text-mute">
          Hygiene Credits will appear here once Stripe phased pricing or a programmatic coupon is applied.
        </div>
      </div>
    );
  }
  // Map wallet_id back to app_user (best-effort) by walking walletsByUser values
  const userByWallet = new Map<string, AppUser>();
  for (const [appUserId, _w] of walletsByUser.entries()) {
    const user = usersById.get(appUserId);
    if (!user) continue;
    // wallet_id isn't in walletsByUser values — but ledger.wallet_id matches credit_wallets.id.
    // We don't fetch credit_wallets.id here; for v1 we display the wallet_id as-is.
  }
  return (
    <table className="mt-3 w-full text-sm">
      <thead className="bg-admin-surface-2">
        <tr className="text-left text-[11px] uppercase tracking-wider text-admin-text-dim">
          <th className="px-3 py-2 font-medium">When</th>
          <th className="px-3 py-2 font-medium">Wallet</th>
          <th className="px-3 py-2 font-medium">Δ</th>
          <th className="px-3 py-2 font-medium">Reason</th>
          <th className="px-3 py-2 font-medium">Stripe event</th>
          <th className="px-3 py-2 font-medium">Expires</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-admin-border-2">
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="px-3 py-2 align-top text-xs text-admin-text-mute">
              {new Date(r.created_at).toLocaleString()}
            </td>
            <td className="px-3 py-2 align-top">
              <code className="text-[10px] text-admin-text-dim">{r.wallet_id.slice(0, 8)}…</code>
            </td>
            <td className={`px-3 py-2 align-top tabular-nums ${r.delta >= 0 ? "text-admin-ok" : "text-admin-danger"}`}>
              {r.delta >= 0 ? "+" : ""}
              {r.delta}
            </td>
            <td className="px-3 py-2 align-top text-xs text-admin-text">{r.reason ?? "—"}</td>
            <td className="px-3 py-2 align-top text-xs">
              {r.stripe_event_id ? (
                <code className="text-[10px] text-admin-text-dim">{r.stripe_event_id}</code>
              ) : (
                <span className="text-admin-text-dim">—</span>
              )}
            </td>
            <td className="px-3 py-2 align-top text-xs text-admin-text-mute">
              {r.expires_at ? new Date(r.expires_at).toLocaleDateString() : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InvoiceStatus({ status }: { status: string }) {
  const map: Record<string, { Icon: typeof CheckCircle; cls: string }> = {
    paid: { Icon: CheckCircle, cls: "text-admin-ok" },
    open: { Icon: AlertTriangle, cls: "text-admin-warn" },
    void: { Icon: XCircle, cls: "text-admin-text-dim" },
    uncollectible: { Icon: XCircle, cls: "text-admin-danger" },
    draft: { Icon: AlertTriangle, cls: "text-admin-text-dim" },
  };
  const conf = map[status] ?? { Icon: AlertTriangle, cls: "text-admin-text-mute" };
  const { Icon, cls } = conf;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cls}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

// keep imports referenced
const _kept = { Crown };
