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
 * GET /api/stripe/checkout?plan=growth_member|snapshot
 * Creates a Stripe Checkout Session and 303-redirects the user to Stripe.
 * Anonymous users get bounced to /sign-up?plan=...
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  if (!plan || !["growth_member", "snapshot"].includes(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }

  const supabase = createSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${APP_URL}/sign-up?plan=${plan}`);
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

  const isSubscription = planRow.interval === "month" || planRow.interval === "year";
  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer: customerId,
    line_items: [{ price: planRow.stripe_price_id, quantity: 1 }],
    success_url: `${APP_URL}/build-list?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/#pricing?checkout=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      app_user_id: appUser.id,
      plan_code: planRow.code,
      plan_id: planRow.id,
    },
    ...(isSubscription
      ? { subscription_data: { metadata: { app_user_id: appUser.id, plan_code: planRow.code, plan_id: planRow.id } } }
      : { payment_intent_data: { metadata: { app_user_id: appUser.id, plan_code: planRow.code, plan_id: planRow.id } } }),
  });

  if (!session.url) {
    return NextResponse.json({ error: "no_session_url" }, { status: 500 });
  }
  return NextResponse.redirect(session.url, { status: 303 });
}
