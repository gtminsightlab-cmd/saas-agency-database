import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe/server";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function svcClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => undefined, set: () => {}, remove: () => {} } },
  );
}

// Stripe API 2025-04-30+ moved sub.current_period_end into items[0]; read both.
function periodEnd(sub: Stripe.Subscription): string | null {
  const top = (sub as any).current_period_end as number | undefined;
  const fromItem = (sub.items?.data?.[0] as any)?.current_period_end as number | undefined;
  const v = top ?? fromItem;
  return v ? new Date(v * 1000).toISOString() : null;
}

// Resolve the app_user_id from metadata first, fall back to stripe_customers lookup.
async function resolveAppUser(
  sb: ReturnType<typeof svcClient>,
  sub: Stripe.Subscription,
): Promise<string | null> {
  const meta = sub.metadata?.app_user_id;
  if (meta) return meta;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;
  const { data } = await sb
    .from("stripe_customers")
    .select("app_user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return (data as any)?.app_user_id ?? null;
}

// Resolve plan_id from the price on the subscription.
async function resolvePlanId(
  sb: ReturnType<typeof svcClient>,
  sub: Stripe.Subscription,
): Promise<string | null> {
  const meta = sub.metadata?.plan_id;
  if (meta) return meta;
  const priceId = sub.items?.data?.[0]?.price?.id;
  if (!priceId) return null;
  const { data } = await sb
    .from("billing_plans")
    .select("id")
    .eq("stripe_price_id", priceId)
    .maybeSingle();
  return (data as any)?.id ?? null;
}

async function applySubscription(
  sb: ReturnType<typeof svcClient>,
  sub: Stripe.Subscription,
  status: string,
) {
  const appUserId = await resolveAppUser(sb, sub);
  if (!appUserId) return;
  const planId = await resolvePlanId(sb, sub);
  if (!planId) return;
  await sb.from("user_entitlements").upsert({
    app_user_id: appUserId,
    plan_id: planId,
    status,
    current_period_end: periodEnd(sub),
    downloads_remaining: 500,
    stripe_subscription_id: sub.id,
  }, { onConflict: "app_user_id" });
  await sb.from("credit_wallets").upsert(
    { app_user_id: appUserId, balance: 500, last_refresh_at: new Date().toISOString() },
    { onConflict: "app_user_id" },
  );
}

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing_signature_or_secret" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `bad_signature: ${(e as Error).message}` }, { status: 400 });
  }

  const sb = svcClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await applySubscription(sb, sub, "active");
        } else {
          // Snapshot one-time: 500 credits, no recurring entitlement
          const m = session.metadata ?? {};
          const appUserId = m.app_user_id as string | undefined;
          if (appUserId) {
            await sb.from("credit_wallets").upsert(
              { app_user_id: appUserId, balance: 500, last_refresh_at: new Date().toISOString() },
              { onConflict: "app_user_id" },
            );
            await sb.from("credit_ledger").insert({
              app_user_id: appUserId,
              kind: "purchase",
              delta: 500,
              note: `Snapshot purchase — Stripe session ${session.id}`,
            });
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const status = event.type === "customer.subscription.deleted" ? "cancelled" : sub.status;
        await applySubscription(sb, sub, status);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        await applySubscription(sb, sub, sub.status);
        break;
      }
    }
  } catch (e) {
    return NextResponse.json({ error: `handler_failure: ${(e as Error).message}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
