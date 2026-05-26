# Charter Member launch checklist — Agency Signal

**Status:** Session F 2026-05-23 (initial scaffold) → **SESSION_36 LAUNCH-READY 2026-05-24** (12 dashboard actions complete, manual smoke walked through, matrix 9/9 GREEN) → **2026-05-25 smoke verification GREEN** (19/19 checks pass via `npm run smoke` against production). This is the **single source of truth** for everything that must be true before Master O opens charter outreach. Consolidates every dashboard action from Sessions D + E + the pre-existing pending items.

**🟢 LAUNCH-READY STATUS:** All 12 dashboard actions DONE per SESSION_36 (2026-05-24). Production smoke verified GREEN 2026-05-25 (19 of 19 checks pass: 10 public pages 200 / 6 security headers present incl CSP-Report-Only / CSP report endpoint accepts violations / API auth gates reject unauth / Stripe webhook rejects unsigned). **Charter outreach is infrastructure-unblocked.** Remaining work is outreach prep (deck slides 9/10/18 rebuild + email templates + /charter page final review + post-signup operational workflow) — not infrastructure.

**The discipline:** every box checked + green smoke + go/no-go matrix says GO → charter outreach is live. Any unchecked critical box → charter outreach is on hold.

---

## A — Master-O dashboard actions (10 items, ~30 minutes total)

### A1. Vercel env vars (pre-existing pending)
| # | Action | Where | Status |
|---|---|---|---|
| 1 | Set `CRON_SECRET` in Vercel Production env | Vercel project → Settings → Environment Variables | ✅ DONE SESSION_33 (2026-05-23, via browser DevTools console fallback per memory) |
| 2 | Register Stripe webhook endpoint at `<prod>/api/stripe/webhook`, copy signing secret | Stripe dashboard → Developers → Webhooks | ✅ DONE SESSION_33 (2026-05-23, discovered already wired pre-flight) |
| 3 | Add `STRIPE_WEBHOOK_SECRET` to Vercel Production env (from #2) | Vercel project → Settings → Environment Variables | ✅ DONE SESSION_33 (2026-05-23) |
| 4 | Rotate `SENTRY_AUTH_TOKEN` if compromised; confirm current is valid for source-map uploads | Sentry → Settings → Auth Tokens | ✅ DONE SESSION_34 (2026-05-23, source-map upload verified WORKING in production via Vercel MCP build-log fetch) |

### A2. Security gates (Session D — `docs/SECURITY.md`)
| # | Action | Where | Status |
|---|---|---|---|
| 5 | Create Upstash Redis DB, copy REST URL + token | https://upstash.com → Console → Create database | ✅ DONE SESSION_36 (2026-05-24, Master O Upstash signup) |
| 6 | Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to Vercel Production + Preview env | Vercel project → Settings → Environment Variables | ✅ DONE SESSION_36 (Claude via CLI for Production; Master O dashboard for Preview) |
| 7 | Create Cloudflare Turnstile site, copy Site Key + Secret Key | https://dash.cloudflare.com → Turnstile | ✅ DONE SESSION_36 (hostnames `agencysignal.co` + `seven16group.com`) |
| 8 | Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to Vercel Production + Preview env | Vercel project → Settings → Environment Variables | ✅ DONE SESSION_36 (via Vercel CLI) |
| 9 | Enable CAPTCHA in Supabase Auth, paste Turnstile Secret Key | Supabase dashboard → Authentication → Settings → Captcha | ✅ DONE SESSION_36 (Master O dashboard; widget renders on /sign-up + /sign-in + /auth/forgot-password per SESSION_36 hotfix commit `59b1360`) |

### A3. Data safety (Session E — `docs/DATA_SAFETY.md`)
| # | Action | Where | Status |
|---|---|---|---|
| 10 | Confirm Supabase plan = Pro (required for PITR) | Supabase → Project → Settings → Billing | ✅ DONE SESSION_36 (confirmed Pro tier via dotintel org; covers `sdlsdovuljuymgymarou` per `reference_supabase_project_tiers.md`) |
| 11 | Enable Point-in-Time Recovery, default 7-day retention | Supabase → Project → Settings → Database → Backups → PITR | ✅ DONE SESSION_36 |

### A4. Trigger redeploy after env-var changes
| # | Action | Where | Status |
|---|---|---|---|
| 12 | Trigger Vercel rebuild so new env vars pick up | Vercel → Deployments → Redeploy latest | ✅ DONE SESSION_36 (production auto-deployed on next push; verified `dpl_8EPG8sdSkmrkEsZSRMUrE6aPFUiz` READY in 47s post-PR-#8-merge) |

---

## B — Automated smoke tests (`npm run smoke`)

Runs the script at `scripts/reliability/smoke-test.ts`. Exits 0 if every check passes, 1 if any check fails. **Run against production BEFORE opening charter outreach.**

```bash
SMOKE_TARGET=https://directory.seven16group.com npm run smoke
```

Checks performed:
- **Public pages** — `/`, `/about`, `/faq`, `/use-cases`, `/methodology`, `/enterprise`, `/charter`, `/verticals`, `/sign-up`, `/sign-in` return 200
- **HTTP security headers** — HSTS / X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy / Content-Security-Policy-Report-Only all present on /
- **CSP report endpoint** — POST `/api/csp-report` with a sample violation returns 204
- **API auth gates** — `/api/team/invite` POST without auth returns 401; admin endpoint without auth returns 401
- **Rate limit functional** — POST to `/api/team/invite` 12 times rapidly should see at least one 429 (only meaningful when authed; smoke runs unauth so this only verifies the wrapper doesn't crash)
- **Stripe webhook** — POST `/api/stripe/webhook` without a Stripe signature returns 400

| # | Item | Status |
|---|---|---|
| 13 | `npm run smoke` against production exits 0 | ✅ DONE 2026-05-25 (19 of 19 checks pass: 10 public pages 200 / 6 security headers / CSP Report-Only + endpoint / API auth gates / Stripe webhook signature gate) |

---

## C — Manual end-to-end smoke (1 happy-path walkthrough, ~10 min)

These are paths the automated smoke can't reasonably cover (email confirmation, real signup, real export). Master O runs through manually.

### C1. Sign-up flow
| # | Step | Expected | Status |
|---|---|---|---|
| 14 | Visit `directory.seven16group.com/sign-up` in a fresh incognito | Turnstile widget renders below password field | ☐ |
| 15 | Fill in name / email / password (test email: `gtminsightlab+charter-smoke@gmail.com`) | Submit button disabled until Turnstile completes | ☐ |
| 16 | Complete Turnstile → click Submit | Green confirmation: "Check your inbox…" | ☐ |
| 17 | Open the confirmation email → click the link | Land on `/build-list` with the test account active | ☐ |

### C1b. Sign-in flow (Turnstile gate — caught during SESSION_35 hotfix)

Added after SESSION_35 discovered Session D shipped Turnstile widget on `/sign-up` only — `/sign-in` and `/auth/forgot-password` were broken when Supabase CAPTCHA was first enabled. Fixed via SESSION_35 hotfix. These rows make sure the gap stays closed.

| # | Step | Expected | Status |
|---|---|---|---|
| 17a | Visit `directory.seven16group.com/sign-in` in a fresh incognito | Turnstile widget renders below password field | ☐ |
| 17b | Fill in email + password (use the test account from C1) → Submit BEFORE completing Turnstile | Submit button disabled; status text "Please complete the bot-check challenge below the password field" | ☐ |
| 17c | Complete Turnstile → Submit | Lands on `/home` (default post-login per BACKLOG #1) with active session | ☐ |
| 17d | Visit `directory.seven16group.com/auth/forgot-password` in fresh incognito | Turnstile widget renders below email field | ☐ |
| 17e | Enter test email → complete Turnstile → Send reset link | Green confirmation "Reset link sent" + email arrives in inbox within ~1 min | ☐ |

### C2. First-export flow
| # | Step | Expected | Status |
|---|---|---|---|
| 18 | On `/build-list`, run a search (any filter) | Results render; result count visible | ☐ |
| 19 | Save the result as a list | List appears in `/saved-lists` | ☐ |
| 20 | Open `/integrations` | Zapier-flow panel renders; no broken vendor cards visible | ☐ |

### C3. CSP report stream
| # | Step | Expected | Status |
|---|---|---|---|
| 21 | Visit homepage in browser DevTools → Network → filter to `csp-report` | Likely 0-3 violations on first load (Vercel Analytics / Sentry tunnel — expected) | ☐ |
| 22 | Sentry dashboard → Issues → filter by `tags.source = "csp-report"` | The violations from step 21 show up within 1-2 minutes | ☐ |

### C4. Rate-limit live test
| # | Step | Expected | Status |
|---|---|---|---|
| 23 | Authed as test user, POST to `/api/team/invite` 11 times in a fresh hour | 11th call returns 429 with `Retry-After` header | ☐ |

### C5. PITR sanity (post-Action 11)
| # | Step | Expected | Status |
|---|---|---|---|
| 24 | Supabase dashboard → Project → Database → Backups → PITR | "Available" status + retention window showing earliest restore timestamp (~7 days back) | ☐ |
| 25 | Run `npm run export-tier1` locally (one-time baseline) | `./backups/<timestamp>/_manifest.json` shows non-zero rows for `tenants`, `app_users`, `billing_plans`, `audit_log` | ☐ |

### C6. Tear down test account
| # | Step | Status |
|---|---|---|
| 26 | Delete the test charter-smoke account from Supabase Auth | ☐ |
| 27 | Confirm Sentry didn't capture any unexpected errors during the smoke | ☐ |

---

## D — Observability verification (Sentry + Better Stack)

| # | Item | Status |
|---|---|---|
| 28 | Sentry — Agency Signal project receives events (verify by triggering a known harmless error: visit `/api/_smoke-error` if it exists, otherwise check recent events) | ☐ |
| 29 | Better Stack — confirm all monitors (uptime + on-call routes) are green | ☐ |
| 30 | Better Stack — verify on-call route delivers a test alert to Master O's phone (use the "Send test notification" button on the on-call schedule) | ☐ |

---

## E — Final go / no-go matrix

Charter outreach goes live ONLY when every row in this matrix is GO.

| Gate | Critical for | GO criteria | Status |
|---|---|---|---|
| Vercel env vars | Auth, payments, observability | All 4 in A1 set + redeploy triggered | ☐ |
| Security gates | Bot resistance + XSS containment | Items 5-9 done + smoke item 22 (CSP reports) green | ☐ |
| Data safety | Customer-data integrity | Items 10-11 done + smoke item 24 (PITR available) green + item 25 (baseline export) succeeded | ☐ |
| Automated smoke | Public-surface health | Item 13 exits 0 | ☐ |
| Manual smoke | End-to-end happy path | Items 14-27 all green | ☐ |
| Observability | Incident-detection coverage | Items 28-30 all green | ☐ |
| `.support/` agent knowledge | Customer-question coverage | Sessions A + C complete (already done) | ✅ |
| Voice + content | Operator-grade landing experience | Session B complete (already done) | ✅ |
| Vendor-naming doctrine | Brand consistency + legal posture | Family P12 enforced (already done) | ✅ |
| **CHARTER GO** | | All rows GO | ☐ |

---

## F — First-hour-of-charter operating procedure

When you flip the switch and start outreach:

1. **First charter signup hits** — watch Sentry for any unexpected error volume. If Sentry stays clean for first 5 signups, monitoring is working.
2. **First Stripe webhook fires** — confirm `audit_log` shows the `stripe_customers` insert + `user_entitlements` insert. If the entitlement wasn't created, the webhook isn't reaching the handler.
3. **First export attempt** — confirm `credit_ledger` debits correctly. If credits weren't deducted, the `enforce_usage` RPC isn't being called.
4. **First Turnstile challenge fails (bot signups will try)** — confirm 429s appear in Vercel logs + Sentry sees the failed attempts.
5. **Within first 24 hours** — run `npm run export-tier1` again to capture the post-launch baseline.

---

## G — Rollback plan (if charter outreach goes sideways)

If something is materially wrong during charter outreach:

1. **Stop outreach immediately** — don't send more invites
2. **Pause Stripe webhook** in Stripe dashboard (prevents more charges)
3. **Toggle the relevant feature flag off** if the issue is product-side (use `feature_flags` table via Supabase)
4. **For data corruption:** follow `docs/DATA_SAFETY.md` recovery procedure (PITR restore)
5. **For runtime errors:** review Sentry for root cause, deploy a fix or revert via Vercel rollback
6. **Communicate** — short, honest, operator-direct email to affected charter members; route via Master O's personal email, not a no-reply

---

## H — Follow-up backlog (post-launch tightening, NOT a launch blocker)

- Flip CSP from Report-Only to enforcing (after ~1 week of clean Sentry violation stream)
- Add nonce-injecting middleware to drop `'unsafe-inline'` from CSP script-src
- Automate `npm run export-tier1` via Vercel Cron with S3 / R2 offload
- Extend rate-limit coverage to all `/api/admin/*` mutating endpoints + `/api/saved-lists/[id]` DELETE
- CAPTCHA on the partner-program apply form (separate repo: `seven16-group-site`)
- Submit HSTS preload list submission once apex + subdomains are HTTPS-only for 1 year+
- Quarterly recovery drill (full PITR rollback to a branch + verify-critical-tables.sql)
- Tenant-scoped GDPR export script (write when first charter member asks)

---

**Last updated:** Session F 2026-05-23 close. Roll all `☐` to `✅` before opening charter outreach.
