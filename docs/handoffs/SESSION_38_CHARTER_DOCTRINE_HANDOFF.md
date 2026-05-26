# SESSION_38 — Charter Member doctrine end-to-end wiring (2026-05-25)

**Date:** 2026-05-25
**Branch:** `main`
**Commit landed:** `1099317` (see "Attribution quirk" below — Charter files are in a commit titled `docs(session-37-final): ...` because a parallel session swept the staged files into its own commit before this session's `git commit` ran)
**Predecessor:** [`SESSION_37_HANDOFF.md`](SESSION_37_HANDOFF.md) + [`SESSION_38_PROMPT.md`](SESSION_38_PROMPT.md)
**Doctrine refs:** D-026 (Stripe billing architecture) · D-027 (family API integration mesh) · D-028 (Stripe bundling flow + Charter Coupon mechanics)
**Outcome:** Sub-wedges 1–3 of the Charter Member build live in `main`. Sub-wedges 4–6 deferred.

---

## What landed

Sub-wedges 1–3 of the locked D-026 + D-027 + D-028 Charter Member doctrine — the first end-to-end wiring of cross-product family services from the Agency Signal satellite.

### Files in commit `1099317`

| File | Lines | Sub-wedge | Purpose |
|---|---:|---|---|
| `app/api/stripe/checkout/route.ts` | +83 | 1 | Charter intent parsing + Stripe customer metadata tag + Coupon attach |
| `app/api/stripe/webhook/route.ts` | +295 | 1+2+3 | Coupon re-assertion + welcome email + Command CRM pushes |
| `lib/family-integrations/email.ts` | +110 | 2 | Seven16 Email API client (NEW) |
| `lib/family-integrations/command.ts` | +132 | 3 | Seven16 Command CRM push client (NEW) |

Validation: `npx tsc --noEmit` clean (exit 0). `npm run lint` returns the same 2 pre-existing errors in `components/support/Seven16SupportWidget.tsx` — neither was introduced by this work.

### Sub-wedge 1 — Charter Checkout flow foundation (D-028)

`app/api/stripe/checkout/route.ts`:

- Accepts `?charter=1` query param. Preserves Charter intent through the `/sign-up` bounce for anonymous users (`/sign-up?plan=...&charter=1`).
- Tags Stripe customer metadata: `charter_member: "true"` + `charter_enrolled_at: <iso>` via `stripe.customers.update`. Idempotent on retrofit (skips update if metadata already set). Per D-028: "customer metadata `charter_member=true` is never overwritten."
- Auto-attaches Charter Coupon to the Checkout Session via `discounts: [{ coupon: STRIPE_CHARTER_COUPON_ID }]` when the env var is set AND Charter intent is present.
- Flips `allow_promotion_codes: false` on Charter Sessions so the promo-code box doesn't appear alongside the auto-attached discount (prevents double-discount confusion).
- `baseMetadata.charter_member` flag propagates into both `subscription_data.metadata` and `payment_intent_data.metadata` so the webhook sees the same flag on `checkout.session.completed`.

`app/api/stripe/webhook/route.ts` — `ensureCharterCouponAttached`:

- Runs on every `customer.subscription.updated` AND on `checkout.session.completed` (subscription branch, after `applySubscription`).
- Reads customer metadata; bails early if not Charter Member.
- Inspects both legacy `sub.discount.coupon.id` AND newer `sub.discounts[]` array; bails if Coupon already attached.
- Re-attaches via `stripe.subscriptions.update(sub.id, { coupon: couponId })` when missing.
- Skipped automatically on `customer.subscription.deleted` (sub is ending; no point re-attaching).
- Errors caught + logged but never rethrown — Stripe webhook ack stays independent of Charter bookkeeping.

### Sub-wedge 2 — Welcome email via Seven16 Email API (D-026 + D-027 Practice 1)

`lib/family-integrations/email.ts` (NEW):

- `EmailTemplateKey` union: `charter_member_welcome` · `growth_member_welcome` · `snapshot_purchase_welcome`.
- `sendEmail(payload)` POSTs to `${SEVEN16EMAIL_API_URL}/api/send` with Bearer auth + `Idempotency-Key` header.
- Null-renders when env vars unset — returns `{ok: false, error: "email_not_configured"}` and logs without throwing. Callers log + continue; missing welcome must not block a paid signup.
- Includes `redactEmail` helper so log lines never write the full address to stdout.

`app/api/stripe/webhook/route.ts` — `sendWelcomeForSession`:

- Pulls recipient from `session.customer_details.email` with fallback to expanded `session.customer.email`.
- Template selection:
  - `!isSubscription` → `snapshot_purchase_welcome`
  - subscription + Charter → `charter_member_welcome`
  - subscription, no Charter → `growth_member_welcome`
- Idempotency key: `agencysignal:welcome:${session.id}` (Stripe session IDs are unique + immutable, so retries dedupe server-side per D-027 Practice 7).
- Fires from BOTH branches of `checkout.session.completed` (subscription + payment).

### Sub-wedge 3 — Command CRM push events (D-027 Practice 2)

`lib/family-integrations/command.ts` (NEW):

- `CommandEventType` union: `customer_signup` · `charter_member_enrolled` · `subscription_started` · `subscription_changed` · `subscription_cancelled` · `snapshot_purchased`.
- `pushCommandEvent(payload)` POSTs to `${SEVEN16COMMAND_API_URL}/api/ingest` with Bearer auth (`SEVEN16COMMAND_INGEST_API_KEY`) + `Idempotency-Key` header.
- Same null-render contract as `email.ts` — returns `{ok: false, error: "command_not_configured"}` and logs without throwing.
- Returns Command-assigned `seven16_customer_id` on success (Practice 3 — stable UUID generated by Command at first cross-product touch).

`app/api/stripe/webhook/route.ts` — `pushCommandFromSession` + `pushCommandFromSubscription`:

- Webhook orchestration order (entitlements first, side-effects after):
  1. `applySubscription` — local entitlement truth
  2. `ensureCharterCouponAttached` — Charter promise re-asserted
  3. `sendWelcomeForSession` — welcome email
  4. `pushCommandFromSession` — `customer_signup` (keyed on `app_user_id`) + `subscription_started` OR `snapshot_purchased` (keyed on sub/session ID) + `charter_member_enrolled` (conditional on Charter intent, keyed on customer ID)
- `customer.subscription.updated` → pushes `subscription_changed` after `ensureCharterCouponAttached`
- `customer.subscription.deleted` → pushes `subscription_cancelled`
- Idempotency keys follow Practice 7 format: `agencysignal:<event_type>:<stable-id>`

---

## How to activate (Master O dashboard ops)

The wiring is forward-compatible. All four files null-render gracefully today. To turn the flow on, do these in order:

1. **Stripe Dashboard → Products → Coupons → Create**
   - ID: `CHARTER_FOREVER_15` (or your preferred name)
   - Duration: `forever`
   - Percent off: `15` (or whatever the locked Charter discount is)
2. **Vercel → agencysignal project → Production env vars (clipboard → dashboard; never in chat):**
   - `STRIPE_CHARTER_COUPON_ID` = the Coupon ID from step 1
   - `SEVEN16EMAIL_API_URL` = `https://api.seven16email.com` (once the Email platform's Next.js routes are deployed there)
   - `SEVEN16EMAIL_API_KEY` = issued from the Email platform admin
   - `SEVEN16COMMAND_API_URL` = `https://seven16command.com`
   - `SEVEN16COMMAND_INGEST_API_KEY` = issued from Command's `/sa/agencysignal/settings/api-keys` UI
3. Redeploy or rely on Vercel's env-change auto-redeploy.

Activation is incremental — you can enable just the Charter Coupon today (steps 1 + the Coupon env var) and leave the Email + Command env vars unset until those platforms ship; the welcome email + Command pushes simply log and continue until then.

---

## Attribution quirk — why `git log` looks wrong

A parallel Claude session in `saas-agency-database` was running its own close-out commit at the same time this session was wiring Charter doctrine. Between this session's `git add` and `git commit -F`, that parallel session ran its own `git commit`, which scooped the staged Charter files into ITS commit (`1099317`).

The commit title therefore reads `docs(session-37-final): append final close-out + clean SESSION_38_PROMPT` even though it contains the four Charter feature files. `git blame` and `git log -p` show the correct line-level attribution. Future code review starting from this handoff doc → commit `1099317` will read correctly; only the commit subject is misleading.

No action needed — the code is intact, on `origin/main`, and the line counts match exactly what this session produced (83 + 295 + 132 + 110 = 620 Charter-attributable insertions out of the commit's 715 total).

---

## What's deferred to a follow-up session

### Sub-wedge 4 — Bundle SKU patterns (D-028)

Wire Pattern A (Container Product + multiple Prices) for the eventual Bundle / Family Pack tiers. Stripe doctrine in `reference_stripe_bundling_flow.md` is the source of truth; checkout route needs to learn the bundle code → Prices mapping; `billing_plans` table may need a `bundle_member_of` column.

### Sub-wedge 5 — `/charter` page + 6 surface routes that originate `?charter=1`

Charter CTA needs a landing page (`/charter`) that explains the offer + funnels into Checkout with the Charter intent set. The 6 surfaces that should also carry the Charter CTA (per the family doctrine consolidation pass): TBD list — confirm with Master O which routes (homepage, pricing, /snapshot, /growth-plan, blog footer, post-cancel survey?).

### Sub-wedge 6 — Verification + tests

- Stripe-sig replay test (idempotency-key dedupe on the webhook)
- End-to-end Checkout → Webhook → Email + Command happy path
- Charter Coupon re-assertion test (manually detach Coupon via Stripe dashboard, trigger `customer.subscription.updated`, verify re-attach)
- Welcome-email template render test (against `api.seven16email.com` sandbox once available)

---

## Cross-refs

- [[reference_stripe_billing_architecture]] — D-026 source-of-truth
- [[reference_family_api_integration_mesh]] — D-027 source-of-truth (8 design rules + 8 locked practices)
- [[reference_stripe_bundling_flow]] — D-028 source-of-truth (4-layer architecture + 3 bundle SKU patterns + Charter multiplicative discount mechanics)
- [[reference_seven16_email_platform]] — Email platform scoping (the API this session's `email.ts` calls)
- [[project_seven16_command_center_scope]] — Command platform scoping (the API this session's `command.ts` calls)
- `docs/context/DECISION_LOG.md` D-026 / D-027 / D-028 entries
