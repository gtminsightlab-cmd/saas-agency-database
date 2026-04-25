/**
 * Server-side Stripe fetchers for /admin/billing.
 *
 * All functions wrap the Stripe SDK call in try/catch so a missing
 * STRIPE_SECRET_KEY (or any API error) degrades gracefully — the page renders
 * with "not configured" notices instead of crashing.
 */
import { getStripe } from "@/lib/stripe/server";

export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; configured: boolean };

function configured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function err<T>(e: unknown): FetchResult<T> {
  const msg = e instanceof Error ? e.message : String(e);
  return { ok: false, error: msg, configured: configured() };
}

export type SubSummary = {
  id: string;
  status: string;
  customer_id: string;
  current_period_end: number | null;
  created: number;
  unit_amount_cents: number;
  interval: "month" | "year" | "week" | "day" | string;
  price_id: string;
  product_id: string | null;
  cancel_at_period_end: boolean;
};

export async function listActiveSubscriptions(): Promise<FetchResult<SubSummary[]>> {
  if (!configured()) return { ok: false, error: "STRIPE_SECRET_KEY not set", configured: false };
  try {
    const stripe = getStripe();
    const list = await stripe.subscriptions.list({ status: "all", limit: 100 });
    const out: SubSummary[] = list.data.map((s: any) => {
      const item = s.items?.data?.[0];
      const price = item?.price;
      return {
        id: s.id,
        status: s.status,
        customer_id: typeof s.customer === "string" ? s.customer : s.customer?.id,
        current_period_end: s.current_period_end ?? item?.current_period_end ?? null,
        created: s.created,
        unit_amount_cents: price?.unit_amount ?? 0,
        interval: price?.recurring?.interval ?? "month",
        price_id: price?.id ?? "",
        product_id: typeof price?.product === "string" ? price.product : price?.product?.id ?? null,
        cancel_at_period_end: Boolean(s.cancel_at_period_end),
      };
    });
    return { ok: true, data: out };
  } catch (e) {
    return err(e);
  }
}

export type InvoiceSummary = {
  id: string;
  status: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  customer_id: string;
  customer_email: string | null;
  billing_reason: string;
  created: number;
};

export async function listRecentInvoices(limit = 10): Promise<FetchResult<InvoiceSummary[]>> {
  if (!configured()) return { ok: false, error: "STRIPE_SECRET_KEY not set", configured: false };
  try {
    const stripe = getStripe();
    const list = await stripe.invoices.list({ limit });
    const out: InvoiceSummary[] = list.data.map((i: any) => ({
      id: i.id,
      status: i.status,
      amount_due_cents: i.amount_due,
      amount_paid_cents: i.amount_paid,
      customer_id: typeof i.customer === "string" ? i.customer : i.customer?.id,
      customer_email: i.customer_email ?? null,
      billing_reason: i.billing_reason,
      created: i.created,
    }));
    return { ok: true, data: out };
  } catch (e) {
    return err(e);
  }
}

export type EventSummary = {
  id: string;
  type: string;
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  /** First non-trivial id from `data.object` if present (helps link to a subscription/invoice/etc.) */
  object_id: string | null;
};

export async function listRecentEvents(limit = 50): Promise<FetchResult<EventSummary[]>> {
  if (!configured()) return { ok: false, error: "STRIPE_SECRET_KEY not set", configured: false };
  try {
    const stripe = getStripe();
    const list = await stripe.events.list({ limit });
    const out: EventSummary[] = list.data.map((e: any) => ({
      id: e.id,
      type: e.type,
      created: e.created,
      livemode: Boolean(e.livemode),
      pending_webhooks: e.pending_webhooks ?? 0,
      object_id: e.data?.object?.id ?? null,
    }));
    return { ok: true, data: out };
  } catch (e) {
    return err(e);
  }
}

export type BalanceSummary = {
  available_cents: number;
  pending_cents: number;
  livemode: boolean;
};

export async function getBalance(): Promise<FetchResult<BalanceSummary>> {
  if (!configured()) return { ok: false, error: "STRIPE_SECRET_KEY not set", configured: false };
  try {
    const stripe = getStripe();
    const b = await stripe.balance.retrieve();
    const sum = (arr: any[]) =>
      (arr ?? []).reduce((s, x) => s + (x.currency === "usd" ? x.amount : 0), 0);
    return {
      ok: true,
      data: {
        available_cents: sum(b.available),
        pending_cents: sum(b.pending),
        livemode: Boolean(b.livemode),
      },
    };
  } catch (e) {
    return err(e);
  }
}
