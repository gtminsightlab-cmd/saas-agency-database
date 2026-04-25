import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /verticals/<slug>/open
 *
 * Server-side redirect that turns a vertical click into a populated
 * /build-list/review preview without an empty-form intermediate. Flow:
 *
 *   1. Auth gate — anonymous users go to /sign-up?vertical=<slug>.
 *   2. Plan gate — authed users without an active plan go to /#pricing.
 *   3. Look up the vertical by slug; resolve its carrier IDs from
 *      carrier_verticals; build a querystring matching the
 *      BuildListForm encoding (cr=<csv> + c=US).
 *   4. 303 redirect to /build-list/review?<qs> so the user lands
 *      directly on the populated preview with row counts, contact
 *      reveal logic, and the "Save list" button all primed.
 *
 * Why a route handler vs a client-side fetch: keeps the secret-key
 * lookups server-side, lets us short-circuit before any /build-list
 * render cost, and gives us one URL the marketing CTAs can deep-link to.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient();
  const slug = params.slug;

  // 1. Auth gate
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL(`/sign-up?vertical=${encodeURIComponent(slug)}`, _request.url),
      { status: 303 }
    );
  }

  // 2. Plan gate — same v_my_entitlement check the marketing card uses
  const { data: ent } = await supabase
    .from("v_my_entitlement")
    .select("plan_code,status")
    .maybeSingle();
  const hasActivePlan = !!ent && ent.status === "active";
  if (!hasActivePlan) {
    return NextResponse.redirect(new URL(`/#pricing`, _request.url), {
      status: 303,
    });
  }

  // 3a. Resolve vertical by slug
  const { data: vertical } = await supabase
    .from("vertical_markets")
    .select("id,slug,name")
    .eq("slug", slug)
    .maybeSingle();

  if (!vertical) {
    // Bad slug — bounce to the index
    return NextResponse.redirect(new URL(`/verticals`, _request.url), {
      status: 303,
    });
  }

  // 3b. Pull carrier IDs for this vertical
  const { data: links } = await supabase
    .from("carrier_verticals")
    .select("carrier_id")
    .eq("vertical_id", vertical.id);

  const carrierIds = (links ?? []).map((r: any) => r.carrier_id);

  if (carrierIds.length === 0) {
    // Empty mapping — land on /build-list with a "vertical has no
    // carriers mapped yet" hint. Better than rendering a 0-result
    // review page with no explanation.
    const url = new URL(`/build-list`, _request.url);
    url.searchParams.set("notice", "vertical-empty");
    url.searchParams.set("vertical", slug);
    return NextResponse.redirect(url, { status: 303 });
  }

  // 4. Build the review querystring (matches BuildListForm encoding)
  const qs = new URLSearchParams();
  qs.set("cr", carrierIds.join(","));
  qs.set("cr_c", "or"); // any-of, not all-of
  qs.set("c", "US");

  return NextResponse.redirect(
    new URL(`/build-list/review?${qs.toString()}`, _request.url),
    { status: 303 }
  );
}
