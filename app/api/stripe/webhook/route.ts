import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe/server";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Service-role-style client for webhook writes (bypass RLS for trusted server events).
// Uses the SUPABASE_SERVICE_ROLE_KEY env var which Master O sets in Vercel.
function svcClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
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
        const m = session.metadata ?? {};
        const appUserId = m.app_user_id as string | undefined;
        const planCode = m.plan_code as string | undefined;
        const planId = m.plan_id as string | undefined;
        if (!appUserId || !planCode || !planId) break;

        if (session.mode === "subscription" && session.subscription) {
          // Pull the subscription to get current_period_end
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await sb.from("user_entitlements").upsert(
            {
              app_user_id: appUserId,
              plan_id: planId,
              status: "active",
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              downloads_remaining: 500,
              stripe_subscription_id: sub.id,
            },
            { onConflict: "app_user_id" }
          );
          // Reset / refill credit wallet to 500 for the new period
          await sb.from("credit_wallets").upsert(
            { app_user_id: appUserId, balance: 500, last_refresh_at: new Date().toISOString() },
            { onConflict: "app_user_id" }
          );
        } else {
          // One-time Snapshot: 500 credits, no recurring entitlement (90-day window enforced separately)
          await sb.from("credit_wallets").upsert(
            { app_user_id: appUserId, balance: 500, last_refresh_at: new Date().toISOString() },
            { onConflict: "app_user_id" }
          );
          await sb.from("credit_ledger").insert({
            app_user_id: appUserId,
            kind: "purchase",
            delta: 500,
            note: `Snapshot purchase — Stripe session ${session.id}`,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const status = event.type === "customer.subscription.deleted" ? "cancelled" : sub.status;
        await sb
          .from("user_entitlements")
          .update({
            status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "invoice.paid": {
        // Recurring renewal: refill credit wallet for the new period
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const appUserId = sub.metadata?.app_user_id;
          if (appUserId) {
            await sb.from("credit_wallets").upsert(
              { app_user_id: appUserId, balance: 500, last_refresh_at: new Date().toISOString() },
              { onConflict: "app_user_id" }
            );
            await sb
              .from("user_entitlements")
              .update({
                status: "active",
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                downloads_remaining: 500,
              })
              .eq("stripe_subscription_id", sub.id);
          }
        }
        break;
      }
    }
  } catch (e) {
    return NextResponse.json({ error: `handler_failure: ${(e as Error).message}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
