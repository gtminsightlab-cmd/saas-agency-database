# Master O — Pending Dashboard Actions (2026-05-22) — SUPERSEDED 2026-05-23

> ## ⚠️ SUPERSEDED — see [`SESSION_33_HANDOFF.md`](SESSION_33_HANDOFF.md)
>
> This checklist was executed on **2026-05-23** in Session 33. Status:
>
> - **Action 1 (CRON_SECRET)** — ✅ DONE. PowerShell command in this doc **failed on Windows PowerShell 5.1** (`[RandomNumberGenerator]::Fill()` is .NET 6+; the legacy `System.Security.Cryptography` namespace in .NET Framework 4.x doesn't expose it). Browser DevTools console fallback was used instead — see Session 33 handoff for the clean cross-platform one-liner.
> - **Action 2 (Stripe webhook)** — ✅ NO ACTION NEEDED. Was already wired (BACKLOG/this-doc was stale). Pre-flight discovery in Session 33 caught this before duplicate creation.
> - **Action 3 (Sentry token rotation)** — ⚠️ DEFERRED. Token minted + Vercel env var set 3× but production build still shows "No auth token provided" warning. Non-blocking. ~5-min fresh-eyes pickup task documented at SESSION_33_HANDOFF.md "Pickup task for next session" section.
>
> **DO NOT execute this doc literally** — the PowerShell command will fail on your machine, and Actions 1+2 are no longer needed. Read this only as historical context. The Session 33 handoff is the authoritative pickup point.

---

**Status (as of 2026-05-22):** Code side is DONE. 3 dashboard actions remain (~10 min total at laptop).

This doc survives across sessions. Open it whenever you're back at laptop. Cross each item off as you complete it; ping Claude to verify after the last one.

---

## Why these 3 can't be automated

| Why blocked | Detail |
|---|---|
| **Secrets never in chat** | Standing rule (CLAUDE.md, codified after 3 leaks in Session 13). Any secret value displayed in chat or logged is a leak — even if I generated it locally and only meant to set it in Vercel. The rule shuts that vector. |
| **No env-var MCP for Vercel** | The Vercel MCP I have access to is read-only (deployments + projects). No `set env var` tool. |
| **Stripe MCP webhook gate** | Family memory `feedback_stripe_mcp_webhook_dashboard_only.md` explicitly says webhook setup goes through Stripe dashboard, NOT the MCP. |
| **No Sentry MCP** | Sentry tooling not exposed in this environment. |

These guardrails are working as intended — they're what kept prior secret leaks contained.

---

## ✅ Already done today (no action needed)

- **PR #4** merged — `/home` v1 + redirect flip + lint=0 + all parallel cleanup
- **PR #1** merged — `ws@8.20.1` (1 vuln resolved; 3 → 2)
- **PR #5** merged — `qs@6.15.2` (transitive dep patch bump; bonus win)
- Production HEAD: `f7618aa` — Vercel deploy READY ✓ at https://directory.seven16group.com
- Lint: 0 errors (epic-level 42 → 0, -100%)
- Sessions 27-32 epic CLOSED, audit-first pattern locked in

---

## 🔴 Remaining 3 dashboard actions

Order matters slightly: collect all 3 secret values into a temporary local notepad FIRST, then paste them all into Vercel in one sitting + redeploy once. Saves ~2 min vs setting+redeploying three times.

### Action 1 — Generate CRON_SECRET (30 sec, PowerShell)

Open PowerShell on Windows. Run:
```
$b = [byte[]]::new(32); [System.Security.Cryptography.RandomNumberGenerator]::Fill($b); [Convert]::ToBase64String($b) | Set-Clipboard
```

The 32-byte base64 secret is now in your clipboard. **Paste it into Windows Notepad** under a heading "CRON_SECRET = ". Don't paste it into chat, Slack, email, or anywhere else.

**Why this unblocks:** the daily 04:00 UTC saved-list refresh cron returns 500 without this. Setting it lights up the user-scoped counters on `/home` (Lists with updates / New agencies 7d / New contacts 30d), and verifies BACKLOG #3 (Pillar 6 backend) is fully live.

---

### Action 2 — Stripe webhook endpoint + signing secret (3 min)

1. Open: https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"** (top right)
3. **Endpoint URL:** `https://directory.seven16group.com/api/stripe/webhook`
4. **Description:** `Agency Signal production webhook`
5. **Events to send:** click **"Select events"** → search + tick these 6 (one by one):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
6. Click **"Add events"** → **"Add endpoint"**
7. On the next screen, find the **"Signing secret"** section → click **"Reveal"** → **Copy** the value (starts with `whsec_`)
8. **Paste into Notepad** as "STRIPE_WEBHOOK_SECRET = whsec_..."

**Why this unblocks:** Charter Member outreach can't capture revenue until the webhook is live + verified. Stripe sandbox catalog is already set up (D-021); this is the last wiring step.

---

### Action 3 — Sentry org token rotation (2 min)

1. Open: https://sentry.io/settings/account/api/auth-tokens/
2. Click **"Create New Token"**
3. **Scopes** — tick these 2:
   - `project:releases`
   - `org:read`
4. Click **"Create Token"**
5. **Copy the value immediately** (Sentry shows it ONCE — if you close the dialog without copying, you have to regenerate)
6. **Paste into Notepad** as "SENTRY_AUTH_TOKEN = sntrys_..."
7. *(Optional cleanup, ~30 sec):* Settings → existing auth tokens → find the old token currently in Vercel → click "Revoke." Stops the old token from being a credential.

**Why this unblocks:** every Vercel deploy currently logs "Invalid org token (401)" on the `@sentry/nextjs` After Production Compile step. Non-fatal but spam. Once the new token is set, deploys go silent on that line.

---

### Action 4 (the actual Vercel work) — Set all 3 env vars + single redeploy (3 min)

You should now have 3 values in your local Notepad:
- `CRON_SECRET = ...`
- `STRIPE_WEBHOOK_SECRET = whsec_...`
- `SENTRY_AUTH_TOKEN = sntrys_...`

1. Open: https://vercel.com/gtminsightlab-7170s-projects/saas-agency-database/settings/environment-variables
2. **Add CRON_SECRET:**
   - Click **"Add new"**
   - **Key:** `CRON_SECRET`
   - **Value:** paste from your Notepad
   - **Sensitive:** ✓ tick (hides the value after save)
   - **Environment:** ✓ Production only (uncheck Preview + Development)
   - Click **"Save"**
3. **Add STRIPE_WEBHOOK_SECRET:** repeat with key `STRIPE_WEBHOOK_SECRET` + value + Sensitive ✓ + Production ✓ only
4. **Add SENTRY_AUTH_TOKEN:** repeat with key `SENTRY_AUTH_TOKEN` + value + Sensitive ✓ + **ALSO tick Preview + Development** (so source maps upload from preview builds too — that's where Sentry adds value pre-merge)
5. **Trigger redeploy** (picks up all 3 new env vars in one build):
   - Vercel → **Deployments** tab
   - Find the most recent READY production deploy (currently `f7618aa`)
   - Click the **⋯** menu on its row → **"Redeploy"**
   - **"Use existing Build Cache"** ✓ tick
   - Click **"Redeploy"**
   - Wait ~40s for new deploy to go READY

5. **After redeploy is READY, securely delete the 3 values from your Notepad** (overwrite with random characters, then close without saving, OR shred the file via Windows tool of choice).

---

## ✅ How to verify each action worked (after redeploy)

Ping Claude with "redeploy is READY" and I'll do these checks:

| Check | What I verify |
|---|---|
| `CRON_SECRET` works | Wait for next 04:00 UTC (or have Claude hit `/api/cron/saved-lists-refresh` if you want to share the secret value through a non-chat channel — usually we just wait). Then check `saved_list_snapshots` + `saved_list_changes` tables go from 0 → populated rows. Once populated, `/home` counters auto-light-up from 0 → live numbers. |
| `STRIPE_WEBHOOK_SECRET` works | Stripe dashboard → your new webhook endpoint → "Recent deliveries" tab. After a test webhook send from Stripe's UI, deliveries should show 200 responses. Failed deliveries = misconfigured. |
| `SENTRY_AUTH_TOKEN` works | Trigger any new deploy. Build logs should no longer show "Invalid org token (401)" line on the Sentry After Production Compile step. |

---

## Optional follow-ups (when you have a quiet hour)

- **TIQ wind-down session** (~30 min) — delete Vercel project `prj_c6kzFEhpw6Uwb12TECUidKlBxOwr`, archive GitHub `gtminsightlab-cmd/seven16-distribution`, pause Supabase `yyuchyzmzzwbfoovsskz`, decide Cloudflare DNS, clean TIQ-tagged Stripe sandbox products. Not blocking; nice cleanup.
- **2 remaining Dependabot vulnerabilities** — both documented as ACCEPT in `docs/security/dependabot-triage-2026-05-22.md`. No action needed unless either escalates.
  - `xlsx` high (used only in scripts/, controlled inputs)
  - `next/postcss` moderate (build-time only, the "fix" is catastrophic regression)

---

*This doc was generated 2026-05-22 after PR #4 + PR #1 + PR #5 merges. Delete after all 3 dashboard actions are complete + verified.*
