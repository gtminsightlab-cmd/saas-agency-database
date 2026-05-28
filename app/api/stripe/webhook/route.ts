import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe/server";
import { sendEmail, type EmailTemplateKey } from "@/lib/family-integrations/email";
import { pushCommandEvent, type CommandEventType } from "@/lib/family-integrations/command";
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

/**
 * Push customer-state event to Seven16 Command (D-027 Practice 2).
 *
 * Fire-and-forget wrapper around `pushCommandEvent` for the webhook
 * context. Pulls recipient identity off the Checkout Session, then pushes
 * the event with a stable idempotency key. Per D-027 Practice 1:
 * `pushCommandEvent` itself null-renders when env vars are unset, so the
 * webhook stays green even before Command is deployed.
 *
 * Idempotency-key format (per Practice 7):
 *   `agencysignal:<event_type>:<stable-id>`
 * Choosing the stable-id depends on event:
 *   - `customer_signup`            → app_user_id (from session metadata)
 *   - `charter_member_enrolled`    → stripe_customer_id
 *   - `subscription_started`       → stripe_subscription_id
 *   - `snapshot_purchased`         → stripe_session_id
 *
 * Errors are caught + logged but never rethrown — Stripe webhook ack is
 * decoupled from cross-product CRM bookkeeping. Command-side will re-sync
 * via its own reconciliation jobs if a push is lost (the rare case).
 */
async function pushCommandFromSession(
  session: Stripe.Checkout.Session,
  eventType: CommandEventType,
  stableId: string,
  extraEventData?: Record<string, unknown>,
): Promise<void> {
  const email = session.customer_details?.email
    ?? (typeof session.customer === "object" && session.customer && "email" in session.customer
      ? (session.customer as Stripe.Customer).email
      : null);
  if (!email) {
    console.warn(`[command] push ${eventType} skipped — no recipient email on session ${session.id}`);
    return;
  }

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id;

  try {
    await pushCommandEvent({
      source_product: "agencysignal",
      event_type: eventType,
      contact: {
        email,
        first_name: session.customer_details?.name?.split(" ")[0],
        last_name: session.customer_details?.name?.split(" ").slice(1).join(" ") || undefined,
        satellite_user_id: session.metadata?.app_user_id ?? undefined,
      },
      event_data: {
        plan_code: session.metadata?.plan_code ?? "unknown",
        plan_id: session.metadata?.plan_id ?? undefined,
        stripe_session_id: session.id,
        stripe_customer_id: customerId ?? undefined,
        ...(extraEventData ?? {}),
      },
      idempotency_key: `agencysignal:${eventType}:${stableId}`,
    });
  } catch (e) {
    console.warn(`[command] push ${eventType} threw for session ${session.id}:`, e instanceof Error ? e.message : String(e));
  }
}

/**
 * Push a subscription-lifecycle event to Seven16 Command from a
 * subscription object (used by customer.subscription.updated /
 * .deleted handlers where we don't have a Checkout Session).
 *
 * Recipient email is resolved by retrieving the Stripe customer.
 */
async function pushCommandFromSubscription(
  stripe: ReturnType<typeof getStripe>,
  sub: Stripe.Subscription,
  eventType: CommandEventType,
): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) {
    console.warn(`[command] push ${eventType} skipped — no customer id on sub ${sub.id}`);
    return;
  }

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return;
    const c = customer as Stripe.Customer;
    if (!c.email) {
      console.warn(`[command] push ${eventType} skipped — no email on customer ${customerId}`);
      return;
    }

    const priceId = sub.items?.data?.[0]?.price?.id;

    await pushCommandEvent({
      source_product: "agencysignal",
      event_type: eventType,
      contact: {
        email: c.email,
        first_name: c.name?.split(" ")[0],
        last_name: c.name?.split(" ").slice(1).join(" ") || undefined,
        satellite_user_id: c.metadata?.app_user_id ?? sub.metadata?.app_user_id ?? undefined,
      },
      event_data: {
        plan_code: sub.metadata?.plan_code ?? undefined,
        plan_id: sub.metadata?.plan_id ?? undefined,
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId,
        stripe_price_id: priceId,
        subscription_status: sub.status,
      },
      idempotency_key: `agencysignal:${eventType}:${sub.id}:${sub.status}`,
    });
  } catch (e) {
    console.warn(`[command] push ${eventType} threw for sub ${sub.id}:`, e instanceof Error ? e.message : String(e));
  }
}

/**
 * Welcome email send via Seven16 Email API (D-026 + D-027 Practice 1).
 *
 * **Charter branch REMOVED 2026-05-27 per D-039** (executes D-034's Charter
 * Member family-wide kill). Template choice simplified to:
 *   - `!isSubscription`  → `snapshot_purchase_welcome`
 *   - subscription       → `growth_member_welcome`
 *
 * Idempotency: `agencysignal:welcome:<session_id>`. Stripe session IDs
 * are unique + immutable, so even if Stripe redelivers
 * `checkout.session.completed` the Email platform will dedupe the send
 * server-side per D-027 Practice 7.
 *
 * Null-render: `sendEmail()` itself logs + returns `{ok:false}` when env
 * vars are unset. This wrapper therefore never throws on missing
 * configuration — paid signup still completes; the welcome is a
 * nice-to-have, not a webhook-blocker.
 */
async function sendWelcomeForSession(
  session: Stripe.Checkout.Session,
  isSubscription: boolean,
): Promise<void> {
  const to = session.customer_details?.email
    ?? (typeof session.customer === "object" && session.customer && "email" in session.customer
      ? (session.customer as Stripe.Customer).email
      : null);
  if (!to) {
    console.warn(`[welcome] email skipped — no recipient email on session ${session.id}`);
    return;
  }

  const templateKey: EmailTemplateKey = isSubscription
    ? "growth_member_welcome"
    : "snapshot_purchase_welcome";

  try {
    await sendEmail({
      to,
      template_key: templateKey,
      template_data: {
        plan_code: session.metadata?.plan_code ?? "unknown",
        stripe_session_id: session.id,
      },
      source_product: "agencysignal",
      idempotency_key: `agencysignal:welcome:${session.id}`,
    });
  } catch (e) {
    // sendEmail() already logs internally + returns an error tuple, but
    // belt-and-suspenders: never let a welcome-email blip NACK the webhook.
    console.warn(`[welcome] email threw for session ${session.id}:`, e instanceof Error ? e.message : String(e));
  }
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
          // Welcome email — null-renders if Seven16 Email env vars unset.
          await sendWelcomeForSession(session, /* isSubscription */ true);
          // Command CRM push events (D-027 Practice 2 — Command is system-of-record):
          //   - `customer_signup` fires on every first paid touch (idempotency
          //     key uses app_user_id so the second checkout doesn't re-push).
          //   - `subscription_started` is the canonical "Growth subscription
          //     began" event; fan-out target for cross-product personalization.
          // Charter Member event removed per D-039 (executes D-034 family-wide kill).
          const appUserId = session.metadata?.app_user_id;
          if (appUserId) {
            await pushCommandFromSession(session, "customer_signup", appUserId);
          }
          await pushCommandFromSession(session, "subscription_started", sub.id, {
            stripe_subscription_id: sub.id,
          });
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
          // Welcome email for Snapshot purchase — same null-render guarantees.
          await sendWelcomeForSession(session, /* isSubscription */ false);
          // Command CRM push — Snapshot is also a "customer_signup" (first
          // paid touch for the user) AND a `snapshot_purchased` event.
          if (appUserId) {
            await pushCommandFromSession(session, "customer_signup", appUserId);
          }
          await pushCommandFromSession(session, "snapshot_purchased", session.id);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const status = event.type === "customer.subscription.deleted" ? "cancelled" : sub.status;
        await applySubscription(sb, sub, status);
        // Charter Coupon re-assertion REMOVED per D-039 (executes D-034
        // family-wide Charter Member kill).
        if (event.type === "customer.subscription.updated") {
          await pushCommandFromSubscription(stripe, sub, "subscription_changed");
        } else {
          await pushCommandFromSubscription(stripe, sub, "subscription_cancelled");
        }
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
