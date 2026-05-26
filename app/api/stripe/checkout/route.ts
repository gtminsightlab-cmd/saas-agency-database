import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { getStripe, APP_URL } from "@/lib/stripe/server";
import { createServerClient } from "@supabase/ssr";

// Service-role client for trusted server writes (bypasses RLS).
// Used for stripe_customers since the user-auth client can't INSERT through RLS.
function svcSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => undefined, set: () => {}, remove: () => {} } },
  );
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/checkout?plan=growth_member|snapshot[&charter=1]
 *
 * Creates a Stripe Checkout Session and 303-redirects the user to Stripe.
 * Anonymous users get bounced to /sign-up?plan=... (charter intent preserved).
 *
 * Charter Member overlay (per D-018 + D-028):
 *   If `charter=1` query param is present, the customer is tagged as a
 *   Charter Member (`stripe_customers.metadata.charter_member="true"` +
 *   `charter_enrolled_at`) and the Charter Coupon (env var
 *   `STRIPE_CHARTER_COUPON_ID`) is auto-attached to the Subscription.
 *   The Coupon should be created in Stripe with `duration: forever` so
 *   the "best pricing tier permanently" promise survives bundle
 *   conversion + plan changes per D-028.
 *
 *   When `STRIPE_CHARTER_COUPON_ID` is unset (e.g. local dev or before
 *   the Coupon has been created in Stripe), the customer still gets
 *   the Charter metadata tag — the Coupon attachment becomes a no-op
 *   and the webhook will re-attempt re-attachment on next Subscription
 *   update once the env var lands. This null-render pattern matches
 *   the family-integration doctrine (per D-027 § Practice 1).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  const charterIntent = url.searchParams.get("charter") === "1";

  if (!plan || !["growth_member", "snapshot"].includes(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const supabase = await createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Preserve charter intent through the sign-up bounce
    const signUpUrl = charterIntent
      ? `${APP_URL}/sign-up?plan=${plan}&charter=1`
      : `${APP_URL}/sign-up?plan=${plan}`;
    return NextResponse.redirect(signUpUrl);
  }

  // Look up the plan + the app_user record for this auth user
  const [{ data: planRow }, { data: appUser }] = await Promise.all([
    supabase
      .from("billing_plans")
      .select("id, code, stripe_price_id, interval, name")
      .eq("code", plan)
      .eq("active", true)
      .single(),
    supabase
      .from("app_users")
      .select("id, email")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!planRow?.stripe_price_id) {
    return NextResponse.json({ error: "plan_not_configured" }, { status: 500 });
  }
  if (!appUser) {
    return NextResponse.json({ error: "app_user_missing" }, { status: 500 });
  }

  // Reuse or create the Stripe customer for this app_user
  const svc = svcSupabase();
  const { data: existingCust } = await svc
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("app_user_id", appUser.id)
    .maybeSingle();

  const stripe = getStripe();
  let customerId = existingCust?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: appUser.email ?? user.email ?? undefined,
      metadata: { app_user_id: appUser.id, supabase_user_id: user.id },
    });
    customerId = customer.id;
    await svc.from("stripe_customers").upsert(
      { app_user_id: appUser.id, stripe_customer_id: customerId },
      { onConflict: "app_user_id" }
    );
  }

  // Charter Member overlay — tag customer metadata at checkout intent
  // time so the tag persists even if the Subscription is later modified
  // (D-028: "customer metadata `charter_member=true` is never overwritten").
  // Uses customers.update so this works both for first-time signup AND
  // for retrofitting an existing customer who clicks the Charter CTA later.
  if (charterIntent) {
    const existing = await stripe.customers.retrieve(customerId);
    if (!existing.deleted) {
      const existingMeta = (existing as { metadata?: Record<string, string> }).metadata ?? {};
      if (existingMeta.charter_member !== "true") {
        await stripe.customers.update(customerId, {
          metadata: {
            ...existingMeta,
            charter_member: "true",
            charter_enrolled_at: new Date().toISOString(),
          },
        });
      }
    }
  }

  const isSubscription = planRow.interval === "month" || planRow.interval === "year";

  // Build discounts array for the Checkout Session if Charter intent +
  // Coupon ID is configured. Null-render gracefully when the env var
  // isn't set (local dev / pre-Coupon-creation) — the metadata tag
  // still lands and the webhook re-asserts the Coupon on the next
  // Subscription update once the env var becomes available.
  const charterCouponId = process.env.STRIPE_CHARTER_COUPON_ID;
  const shouldAttachCharterCoupon = charterIntent && !!charterCouponId;

  const baseMetadata = {
    app_user_id: appUser.id,
    plan_code: planRow.code,
    plan_id: planRow.id,
    charter_member: charterIntent ? "true" : "false",
  };

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer: customerId,
    line_items: [{ price: planRow.stripe_price_id, quantity: 1 }],
    success_url: `${APP_URL}/build-list?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/#pricing?checkout=cancelled`,
    // When Charter Coupon auto-applies, hide the promo-code box to prevent
    // double-discount confusion. Otherwise leave promo codes available.
    allow_promotion_codes: !shouldAttachCharterCoupon,
    metadata: baseMetadata,
    ...(shouldAttachCharterCoupon
      ? { discounts: [{ coupon: charterCouponId! }] }
      : {}),
    ...(isSubscription
      ? { subscription_data: { metadata: baseMetadata } }
      : { payment_intent_data: { metadata: baseMetadata } }),
  });

  if (!session.url) {
    return NextResponse.json({ error: "no_session_url" }, { status: 500 });
  }
  return NextResponse.redirect(session.url, { status: 303 });
}
