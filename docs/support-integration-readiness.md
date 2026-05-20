# Agency Signal — Seven16 Group Support integration readiness

**Status:** Stage-1 readiness shipped 2026-05-19 (Session C). Widget mount + signed-token signing + event posting + ticket linking all DEFERRED until `seven16groupsupport.com` actually ships.

**Source brief:** [`docs/Customer Support and Sales AI Agent.txt`](Customer%20Support%20and%20Sales%20AI%20Agent.txt) — Master O's paste-into-every-product directive (2026-05-19).

---

## 1. Architecture rule (LOCKED)

> Agency Signal is **support-integratable**, not **support-dependent**.

Concretely:

- Agency Signal continues to function if `seven16groupsupport.com` is offline.
- Agency Signal owns its product data (`public.agencies`, `public.contacts`, `public.agency_carriers`, `public.saved_lists`, etc.). The support platform NEVER gets write access to these.
- The support platform owns conversations, support tickets, sales conversations, partner-vetting applications, and AI-agent orchestration. Those tables live in the support platform's own database, not in `sdlsdovuljuymgymarou`.
- Agency Signal exposes the **minimum safe context** needed for the support platform to do its job. No raw DB records, no API keys, no payment data.
- All cross-platform writes are explicitly authorized (signed JWT or server-to-server API key + Bearer header).

---

## 2. Product identity

| Field | Value |
|---|---|
| Product slug | `agencysignal` |
| Live URL | `https://directory.seven16group.com` (planned cutover to `agencysignal.co`) |
| Repo | `saas-agency-database` |
| Supabase satellite | `sdlsdovuljuymgymarou` |
| Stripe account | `acct_1TLUF6HmqSDkUoqw` (sandbox) |

---

## 3. Widget placement plan (future, NOT mounted yet)

The `Seven16SupportWidget` component placeholder lives at [`components/support/Seven16SupportWidget.tsx`](../components/support/Seven16SupportWidget.tsx).

**Two mount points planned** (NOT mounted this session):

1. **Public marketing pages** — mount inside `app/layout.tsx` after the global `<Toaster />`. Mode: `public_presales`. Anonymous payload only (no signed user token).
2. **Authenticated app shell** — mount inside `components/app/shell.tsx` near the global error boundary, after page content. Mode: `customer_support` (default) or one of `onboarding | technical_sales | account_management` depending on route. Authed payload includes signed user-context token.

**DO NOT mount globally** until:
- `seven16groupsupport.com` is live and reachable.
- `SUPPORT_PLATFORM_API_KEY` + `SUPPORT_CONTEXT_SIGNING_SECRET` are populated in Vercel env vars.
- A fallback contact form has been wired (in case the widget script fails to load).

---

## 4. Supported modes

Per brief Section 6 + Agency-Signal-specific sub-section:

| Mode | Where it runs | Payload |
|---|---|---|
| `public_presales` | Marketing pages, anonymous visitor | `{ product_slug, source_domain, source_url }` |
| `customer_support` | Authed app, default mode | `{ product_slug, user_context: signed_token }` |
| `onboarding` | First-run flows (post-signup, first-list-creation) | `{ product_slug, user_context, onboarding_step? }` |
| `technical_sales` | Pricing page + `/enterprise` page | `{ product_slug, mode_intent: 'technical', user_context? }` |
| `account_management` | Settings, team, billing pages | `{ product_slug, user_context, account_section? }` |

---

## 5. Safe context payload spec

The full type lives in [`lib/support/context.ts`](../lib/support/context.ts). Summary:

```ts
type SafeSupportContext = {
  product_slug: "agencysignal";
  mode: SupportMode;
  user_id?: string;          // Supabase auth.users.id
  organization_id?: string;  // public.tenants.id
  email?: string;
  role?: string;             // app_users.role: owner | admin | member
  plan?: string;             // active subscription tier name
  account_status?: string;   // active | trialing | past_due | canceled
  current_path?: string;     // URL pathname when widget opened
  issued_at: string;         // ISO-8601
  expires_at: string;        // ISO-8601, +5 min from issued_at
};
```

**NEVER include in the payload** (allowlist enforced by type — TS will reject):

- Supabase service-role key, anon key, or any JWT
- Stripe API keys, webhook secrets, customer payment methods, full invoice data
- Full agency/contact/carrier records
- User passwords or 2FA seeds
- Confidential internal notes, admin-only flags
- Third-party API tokens (Cloudflare, GitHub, etc.)

The signed-token form (`signSupportContext(ctx)`) returns `"TODO_SIGN"` until `SUPPORT_CONTEXT_SIGNING_SECRET` is configured; then it returns an HMAC-SHA256-signed JWT.

---

## 6. Event plan (Agency Signal–specific catalog)

Helper at [`lib/support/events.ts`](../lib/support/events.ts). Universal events from brief Section 8 + AS-specific events from the Agency-Signal sub-section:

**Universal (all Seven16 products):**
- `support_widget_opened`
- `support_message_started`
- `demo_requested`
- `sales_question_asked`
- `onboarding_started`
- `onboarding_step_completed`
- `onboarding_blocked`
- `onboarding_completed`
- `ticket_requested`
- `download_failed`
- `export_failed`
- `api_error`
- `billing_question_started`
- `partner_program_clicked`
- `usage_limit_reached`

**Agency Signal–specific:**
- `email_verification_started`
- `email_verification_failed`
- `lead_list_created`
- `credits_exhausted`
- `upgrade_clicked`
- `api_key_question_started`

Emit pattern (non-blocking, fire-and-forget):

```ts
import { emitSupportEvent } from "@/lib/support/events";
// inside an action / handler
await emitSupportEvent("lead_list_created", { list_id, agency_count });
```

Behavior:
- **No `SUPPORT_PLATFORM_API_URL` configured** → `console.debug` only (dev safety).
- **Configured** → POST to `${SUPPORT_PLATFORM_API_URL}/events` with `Authorization: Bearer ${SUPPORT_PLATFORM_API_KEY}`. Swallows errors silently — events are best-effort.

---

## 7. API endpoint plan

All internal support routes live under `app/api/internal/support/`. Every route gates on a Bearer-token check against `SUPPORT_PLATFORM_API_KEY` (server-to-server only, never exposed to browsers).

| Route | Method | Status | Returns |
|---|---|---|---|
| `/api/internal/support/health` | `GET` | **200** (live) | Readiness payload — `{ product_slug, support_url, signing_configured, api_key_configured, version }` |
| `/api/internal/support/context` | `POST` | **501** (stub) | Will return safe context for a given `{ user_id, organization_id, mode }` |
| `/api/internal/support/events` | `POST` | **501** (stub) | Will accept events from the support platform (e.g. ticket-resolved → flag account in AS) |
| `/api/internal/support/ticket-link` | `POST` | **501** (stub) | Will accept `{ ticket_id, support_platform_url, summary }` and link back to a user record |

Why `/health` returns 200 even at Stage 1: the support platform needs to probe AS during its own bootstrap to confirm reachability. The payload's `signing_configured: false` + `api_key_configured: false` flags tell the platform "AS is reachable but not yet wired."

---

## 8. Security checklist

- [x] All env vars matching `SUPPORT_*` (except `NEXT_PUBLIC_*`) are server-only.
- [x] API key check uses constant-time-ish header compare via Bearer-equality (matches existing cron route pattern).
- [x] No support-platform code path can read `SUPABASE_SERVICE_ROLE_KEY`.
- [x] Safe-context payload type is allowlist-only (TS prevents accidental field leakage).
- [x] Signed token TTL = 5 minutes from `issued_at`.
- [ ] **Deferred:** HMAC-SHA256 signing of context tokens (waits on `SUPPORT_CONTEXT_SIGNING_SECRET`).
- [ ] **Deferred:** Origin allowlist for widget iframe (CSP `frame-ancestors` config).
- [ ] **Deferred:** Webhook-signature verification on inbound events from the support platform.
- [ ] **Deferred:** RLS-compatible context — when surfacing org_id in context, confirm it matches the user's authed tenant.

---

## 9. Fallback behavior

If `seven16groupsupport.com` is unavailable:

- The widget placeholder renders `null` (no DOM, no script, no network call) — silent failure by design.
- Event emitters swallow fetch errors silently.
- API stubs return 501/200 with no external dependencies.
- No Agency Signal feature breaks. Critical contact paths (`mailto:support@seven16group.com`, if added) remain available.

---

## 10. Open questions

1. **Widget mount sequencing** — mount on marketing pages first (lower risk, anonymous traffic) or authed app first (higher signal, but real users)?
2. **Onboarding-mode trigger** — fire-on-route (`/build-list` first time) or fire-on-event (first list saved)?
3. **Account-management context** — does the support platform need read-API access to current subscription/credits balance, or do we pass it in the signed token? (Recommendation: pass in token to avoid a cross-product fetch on every widget open.)
4. **PII boundary on email** — pass authed user's email in the signed token, or use the support platform's own user lookup? (Recommendation: pass in token; saves a round-trip.)

---

## 11. Implementation status

| Step | Status |
|---|---|
| `.env.local.example` updated with 6 SUPPORT_* vars | ✅ shipped Session C |
| `docs/support-integration-readiness.md` (this doc) | ✅ shipped Session C |
| `components/support/Seven16SupportWidget.tsx` (null-render placeholder) | ✅ shipped Session C |
| `lib/support/context.ts` (safe payload builder + sign stub) | ✅ shipped Session C |
| `lib/support/events.ts` (event helper) | ✅ shipped Session C |
| 4× `app/api/internal/support/*/route.ts` (stubs) | ✅ shipped Session C |
| CLAUDE.md awareness paragraph + cross-repo memory note | ✅ shipped Session C |
| Widget global mount | 🟦 deferred (waits on seven16groupsupport.com) |
| Real HMAC signing of context tokens | 🟦 deferred |
| Real event POSTing (vs `console.debug`) | 🟦 deferred |
| Real `/context` + `/events` + `/ticket-link` implementations | 🟦 deferred |
| Fallback contact form | 🟦 deferred |

---

## 12. Reference

- Architecture rule + 9-slice plan: [`docs/handoffs/SESSION_C_PROMPT.md`](handoffs/SESSION_C_PROMPT.md)
- Master O directive (source brief): [`docs/Customer Support and Sales AI Agent.txt`](Customer%20Support%20and%20Sales%20AI%20Agent.txt)
- Front-end production standard (D-024): [`docs/context/ENGINEERING_DOCTRINE.md`](context/ENGINEERING_DOCTRINE.md)
- Family backlog: [`docs/BACKLOG.md`](BACKLOG.md)
