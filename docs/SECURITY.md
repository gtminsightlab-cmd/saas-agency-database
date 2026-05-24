# Security posture — Agency Signal

**Status:** Session D 2026-05-23 — public-surface security gates landed in code. Three Master-O dashboard actions remain before the protection is functional.

This doc is the operating reference for what's in place, what's pending, and how to monitor / tune.

## Layers in place (code-side, Session D)

### 1. HTTP security headers
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — HSTS, eligible for browser preload list
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN` (also enforced as `frame-ancestors 'none'` via CSP)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `X-DNS-Prefetch-Control: on`

All set in `next.config.mjs` `headers()`.

### 2. Content Security Policy
Deployed in **Report-Only mode** in `next.config.mjs`. Reports POST to `/api/csp-report` which forwards to Sentry as `warning`-level events with directive + blocked-host tags.

Current directives:
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://js.stripe.com https://*.vercel-scripts.com https://*.vercel-insights.com
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https:
font-src 'self' data:
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://*.upstash.io https://api.stripe.com https://*.vercel-insights.com https://*.vercel-scripts.com
frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://hooks.stripe.com
worker-src 'self' blob:
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
upgrade-insecure-requests
report-uri /api/csp-report
```

**Rollout plan:**
1. Deploy in Report-Only (current state) → review Sentry CSP-violation stream for ~1 week
2. Tune any false-positive directives (likely candidates: Stripe variants, Vercel Analytics)
3. Flip `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in `next.config.mjs` to enforce
4. Follow-up upgrade: replace `'unsafe-inline'` script-src with nonce-injecting middleware (out of Session D scope; tracked here)

### 3. Rate limiting (Upstash Redis sliding-window)
Wrapper at `lib/security/rate-limit.ts`. Four limiter keys configured:
- `invite` — 10 / hour per user (applied to `POST /api/team/invite`)
- `adminWrite` — 30 / minute per user
- `publicWrite` — 20 / hour per IP (applied as fallback on `/api/team/invite`)
- `generic` — 60 / minute per identifier

Graceful no-op when Upstash env vars are unset (local dev path).

### 4. CAPTCHA on sign-up
Cloudflare Turnstile widget on `/sign-up` form. Token passed through to Supabase Auth via `signUp({ options: { captchaToken } })`. Supabase validates against the Turnstile secret stored in the Supabase dashboard.

When `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, the widget does not render and `captchaToken` is omitted from the signup payload.

---

## Master-O dashboard actions required for full activation

These are the bottleneck items. Each can be done in 5-15 minutes.

### Action 1 — Create Upstash Redis database
1. Go to https://upstash.com/ → sign up or sign in
2. Create a new Redis database (region: closest to Vercel deployment; eviction off)
3. Copy the REST URL + REST Token
4. In Vercel project settings → Environment Variables, add:
   - `UPSTASH_REDIS_REST_URL` (Production + Preview)
   - `UPSTASH_REDIS_REST_TOKEN` (Production + Preview, mark as sensitive)
5. Redeploy or trigger a new build to pick up env vars

**Verification:** Hit `POST /api/team/invite` 11 times within an hour from a single account; the 11th call should return 429 with `Retry-After` header.

### Action 2 — Create Cloudflare Turnstile site
1. Go to https://dash.cloudflare.com/ → Turnstile section
2. Add a site:
   - Domain: `directory.seven16group.com` (and any preview-domain patterns you want covered)
   - Widget Mode: Managed (recommended)
3. Copy the Site Key + Secret Key
4. In Vercel project settings → Environment Variables, add:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Production + Preview, NOT marked sensitive — it's a public key)
   - (Secret key NOT stored in Vercel; it goes into Supabase — Action 3)

### Action 3 — Enable CAPTCHA in Supabase Auth
1. Supabase dashboard → Authentication → Settings → Captcha
2. Provider: **Cloudflare Turnstile**
3. Paste the Turnstile **Secret Key** from Action 2
4. Save

**Verification:** Sign up at directory.seven16group.com/sign-up; the Turnstile widget should render below the password field, signup should fail if the widget is bypassed, succeed when completed.

### (Optional) Action 4 — Configure Sentry to receive CSP reports
The `/api/csp-report` endpoint already forwards to Sentry via the existing `@sentry/nextjs` integration. To get a dedicated CSP-violation alert rule:
1. Sentry → Alerts → Create Alert
2. Filter: `tags.source = "csp-report"`
3. Trigger: count >= 10 in 1 hour (tune as you see real volume)
4. Notify: same channel as other Agency Signal alerts

---

## Monitoring (post-activation)

Once Actions 1-3 are complete, the following should be in working order:

- **Sentry CSP-violation events** — review weekly until you've tuned the policy. Once 0 unexpected violations for 7 days, flip CSP from Report-Only to enforcing.
- **Sentry rate-limit-429 events** — none by default; the rate-limit wrapper does not log 429s to Sentry. If you want signal on this, add a `Sentry.captureMessage` line in the rate-limit error path in `lib/security/rate-limit.ts`.
- **Upstash analytics dashboard** — request volume + 429 rate per limiter key. Tune `LIMITER_CONFIG` in `lib/security/rate-limit.ts` if real traffic shows the caps are too tight or too loose.
- **Turnstile dashboard** — challenge solve rate + bot vs human ratio. Should expect ~0.5% challenge interaction rate (Managed mode is mostly invisible).

---

## Follow-up tightening (out of Session D scope)

- **Nonce-injecting middleware** to drop `'unsafe-inline'` from script-src
- **Per-endpoint rate limit coverage** — extend the wrapper to remaining `/api/admin/*` mutating endpoints + `/api/saved-lists/[id]` DELETE + `/api/export.csv` (currently uses RPC-side `enforce_usage`, could add upstream rate-limit for cheaper rejection)
- **CAPTCHA on partner-program apply** at `partners.seven16group.com/apply` (separate repo — `seven16-group-site`)
- **HSTS preload submission** at https://hstspreload.org once the apex + all subdomains are confirmed HTTPS-only for 1 year+
- **CSRF token verification** on POST endpoints (Supabase Auth cookies are SameSite=Lax which covers most cases; explicit CSRF tokens would be the belt-and-suspenders move)

---

## Env var reference

| Env var | Purpose | Where set | Sensitive? |
|---|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | Vercel Prod + Preview | No |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST auth token | Vercel Prod + Preview | Yes |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (rendered to client) | Vercel Prod + Preview | No |
| (Turnstile secret key) | Paired with site key for token validation | **Supabase dashboard** (Auth → Captcha) | Yes |
| `SENTRY_AUTH_TOKEN` | Sentry source-map upload + CSP-report routing | Vercel Prod | Yes (already set) |
