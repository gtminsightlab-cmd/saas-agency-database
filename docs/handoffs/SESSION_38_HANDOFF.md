# Family-Hub Session 38 — Domain cutover SHIPPED end-to-end (`directory.seven16group.com` → `agencysignal.co`) (2026-05-26)

**Date:** 2026-05-26
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `main`
**Predecessor:** [`SESSION_37_HANDOFF.md`](SESSION_37_HANDOFF.md) + [`SESSION_37_ADDENDUM_widget_fixes.md`](SESSION_37_ADDENDUM_widget_fixes.md)
**HEAD at session open:** `d6543fc` (SESSION_38 prompt docs from parallel session)
**Code commit this session:** `70b6c2d` — `feat(domain): pre-stage cutover — 301 redirects + canonical agencysignal.co copy`
**HEAD at session close (docs commit):** TBD after this commit pushes
**Live URL:** **https://agencysignal.co** — production READY on deploy `dpl_45vXKmS6fPMzHjGPqpJNU9fFatLV` (45s build, cert issued via manual `vercel certs issue` nudge after slow auto-trigger)

---

## Theme — execute the domain cutover end-to-end

Active arc per BACKLOG. SESSION_38_PROMPT's 8-step choreography executed across Phase A → Phase F in ~75 min wall. Master O granted full browser-control permission mid-session, enabling claude-in-chrome MCP automation for the Cloudflare DNS step. Stripe webhook step retained as guided dashboard walkthrough (financial-platform safety rules block browser automation on Stripe).

---

## Phase-by-phase execution

### Phase A — pre-stage code (~10 min)

Commit `70b6c2d` — 6 files / +22/-7:

- **`next.config.mjs`** — added `redirects()` async function returning a host-matched 308 (Next.js emits 308 for `permanent: true` — same SEO effect as 301):
  ```ts
  return [{
    source: "/:path*",
    has: [{ type: "host", value: "directory.seven16group.com" }],
    destination: "https://agencysignal.co/:path*",
    permanent: true
  }];
  ```
- **`app/charter/page.tsx:34`** — Charter line item "Agency listing on directory.seven16group.com" → "agencysignal.co"
- **`app/privacy/page.tsx:50`** — Privacy section 1 reframed: was "...at directory.seven16group.com (and the future agencysignal.co after domain cutover)" → "...at agencysignal.co (legacy traffic on directory.seven16group.com 301-redirects here)". Also caught + fixed inline brand: "BindLab" → "Bind Lab" per D-032.
- **`app/admin/integrations/page.tsx:20`** — `PUBLIC_INTEGRATIONS_URL` flipped to new canonical
- **`scripts/reliability/smoke-test.ts`** — default `SMOKE_TARGET` flipped (env-var override preserved for testing legacy host)
- **`lib/stripe/server.ts:13-14`** — `APP_URL` fallback flipped (env var `NEXT_PUBLIC_APP_URL` is canonical; server-side reads at runtime)

Pushed `70b6c2d` → Vercel auto-deployed `dpl_45vXKmS6fPMzHjGPqpJNU9fFatLV` READY in 45s. Verified BEFORE any DNS change so the redirect logic was live the moment DNS resolved.

### Phase B — DNS + Vercel domain add (~15 min including cert wait)

1. **Vercel CLI:** `vercel domains add agencysignal.co --scope=gtminsightlab-7170s-projects` → "Success! Domain agencysignal.co added to project saas-agency-database". Vercel returned required DNS: `A agencysignal.co 76.76.21.21`.
2. **Cloudflare DNS via claude-in-chrome MCP:** Master O granted browser control. Pre-flight confirmed `agencysignal.co` already on Cloudflare nameservers (`alec.ns.cloudflare.com`, `aryanna.ns.cloudflare.com`). Navigated to zone DNS records page. Dismissed OneTrust cookie banner via JS-DOM verification (find tool was returning stale state — used `javascript_tool` to confirm `bannerVisible:false` after Confirm My Choices click). Found "Add record" button via JS DOM query (`find` couldn't locate it inline). Filled form: Type=A, Name=@, IPv4=76.76.21.21, Proxy status=DNS only (unchecked / gray cloud), TTL=Auto. Verified via screenshot ("agencysignal.co points to 76.76.21.21" confirmation banner). Clicked Save.
3. **Cert provisioning:** DNS resolution confirmed within 30s (`nslookup agencysignal.co 1.1.1.1` → 76.76.21.21). HTTP/80 returned 200 immediately. HTTPS/443 stalled — `openssl s_client` showed "no peer certificate available" for 7+ minutes after DNS save. Manual nudge: `vercel certs issue agencysignal.co --scope=...` → "Success! Certificate entry for agencysignal.co created [7s]" → cert appeared in `vercel certs ls` immediately (`cert_dkrssftUwe02rPXy5753RdbP`, valid 90d). HTTPS 200 within 10s thereafter.

**Lesson:** Vercel's auto cert-issuance can be slow when the domain was added long enough ago that the provisioning queue dropped the retry. The CLI `vercel certs issue` command is a safe manual nudge — idempotent and fast. New family memory entry queued: `feedback_vercel_cert_auto_provisioning_slow.md`.

### Phase C — verification (~3 min)

Full check suite:

| Check | Expected | Actual | Status |
|---|---|---|---|
| HTTPS apex | 200 | 200 | ✓ |
| Legacy 308 redirect chain (`directory.../charter` → `agencysignal.co/charter`) | 1 redirect → 200 | redirects=1, status=200 | ✓ |
| Webhook URL serves 400 on unsigned POST | 400 | 400 | ✓ |
| Page title | "Agency Signal — distribution intelligence for commercial insurance" | exact match | ✓ |

### Phase D — Stripe webhook rotation (~25 min including UI navigation)

**Plan A (dual-endpoint)** was the SESSION_38_PROMPT recommendation, but discovered mid-execution that **single-secret architecture means only one secret can be live at a time** — dual-endpoint with overlap wouldn't actually buy safety because the old endpoint would just produce signature-verification failures. Pivoted to **Plan B (atomic URL edit)** — Stripe preserves `signing_secret` when only the endpoint URL is edited (documented behavior + verified by us).

Steps executed:

1. Master O opened Stripe dashboard `acct_1TLUF6HmqSDkUoqw` (test mode / Sandbox). Stripe's modern Workbench UI uses "Event destinations" terminology — same concept. Located target destination: `Seven16-Agency-Directory` at `directory.seven16group.com/api/stripe/webhook` with 18 events subscribed. (Other destination `brilliant-dream` → `dotintel.io/api/stripe/webhook` is unrelated, 1 event.)
2. Captured the 18 subscribed events via the Edit Destination form's "Selected events" panel: entitlements.active_entitlement_summary.updated + 7 invoice.* (created, finalization_failed, finalized, paid, payment_action_required, payment_failed, upcoming, updated) + 2 payment_intent.* (created, succeeded) + 7 subscription_schedule.* (aborted, canceled, completed, created, expiring, released, updated). Matches family memory.
3. **Edited Endpoint URL in place** in the existing destination's Edit form: `https://directory.seven16group.com/api/stripe/webhook` → `https://agencysignal.co/api/stripe/webhook`. Left events list + signing secret untouched. Clicked Save. Overview refreshed showing new URL.
4. **Test event verification:** Stripe's modern Workbench dropped the one-click dashboard test-event flow in favor of requiring the Stripe CLI for arbitrary test payloads. Pivoted to **Resend a past delivery** path. Master O navigated to Event deliveries tab → clicked latest `invoice.paid` event from yesterday → clicked Resend button → Stripe re-fired the same signed payload at the new URL → **HTTP 200 OK** with body `{"received": true}` at 8:59:29 PM UTC. Delivery status: "Delivered (Recovered)" + "Resent manually" annotation. **End-to-end PROOF — Stripe-signed payload, our handler validated signature using unchanged `STRIPE_WEBHOOK_SECRET`, returned clean 200.**

**Lesson:** When a Stripe webhook destination URL needs to migrate to a new hostname with the same handler + same secret, **editing the URL in place is dramatically simpler than the dual-endpoint dance.** Stripe preserves the signing secret. Zero exposure window. Zero env-var rotation. Will codify as new family memory: `feedback_stripe_webhook_url_edit_preserves_secret.md`.

### Phase E — docs + memory scrub (~10 min)

- **`.support/*.md` 4 files** — sales-playbook.md (4 refs) + product-identity.md (1 ref, reframed) + problem-library.md (1 ref) + capability-library.md (2 refs). All `directory.seven16group.com` → `agencysignal.co`. product-identity.md's "Live at directory.seven16group.com (canonical URL per D-016 three-domain split). Future brand redirect at agencysignal.co." reframed to "Live at agencysignal.co (canonical URL post-cutover SESSION_38, 2026-05-26; D-016 three-domain split). Legacy hostname directory.seven16group.com 301-redirects here."
- **Family memory `reference_directory_admin_project_paths.md`** — renamed in frontmatter (file path unchanged): "Directory admin (directory.seven16group.com) project paths" → "Agency Signal (agencysignal.co) project paths". Body reframed to canonical agencysignal.co. Updated "Local clone NOT vercel-linked" gotcha to "Local clone IS vercel-linked" (verified `.vercel/project.json` present).
- **`MEMORY.md` index** — pointer line updated to reflect new title + post-cutover note.
- **`docs/context/FAMILY_HEALTH.md`** — Last refresh line prepended with full SESSION_38 narrative; AS row updated (last commit `70b6c2d`, active arc flipped to BACKLOG `0b`, queue depth refreshed); Items requiring attention — domain cutover line struck-through with "DONE SESSION_38" + 3 new low-priority follow-up items added; Charter section `/charter` URL flipped to `agencysignal.co/charter` with post-cutover note.
- **`docs/BACKLOG.md`** — rolling Last reviewed summary prepended with SESSION_38 narrative; Active arc section: `[ACTIVE]` flipped from domain cutover to BACKLOG `0b` (rightRail polish) + `[CLOSED — SESSION_38]` entry for the cutover with full audit trail.

### Phase F — close (~10 min)

- This handoff written
- Stage + commit Phase E docs (~5 files in repo + 1 family memory + 1 MEMORY.md index)
- `git push origin main`
- SESSION_39_PROMPT.md written
- BACKLOG + FAMILY_HEALTH refresh already done above

---

## NEXT_PUBLIC_APP_URL env var (Task #7)

Rotated in Vercel Production via CLI:
- `vercel env rm NEXT_PUBLIC_APP_URL production --yes` → removed
- `echo "https://agencysignal.co" | vercel env add NEXT_PUBLIC_APP_URL production` → added (non-Sensitive since `NEXT_PUBLIC_*` is public by convention)
- Verified via `vercel env ls production` → shows new entry "1m ago" in Production scope

**Preview env scope NOT rotated** — `vercel env add ... preview` rejected with `git_branch_required` in agent-mode (per family memory `feedback_vercel_cli_agent_mode_preview_env`). Master O dashboard task — flagged in Items Requiring Attention.

**No rebuild needed.** Only 2 files in the repo read `NEXT_PUBLIC_APP_URL`: `lib/stripe/server.ts` (server-side, runtime read) + `app/admin/integrations/page.tsx` (admin server component, dynamic, runtime read). Zero client-side bundle references. The new value is live for every server request from the moment the env var was rotated.

---

## Tooling notes

- **claude-in-chrome MCP unlocked the Cloudflare step.** Master O explicitly granted full browser-control permission mid-session. Drove the OneTrust banner dismissal + DNS form fill + save click via `find` + `javascript_tool` + `browser_batch`. Total Cloudflare-side wall time ~5 min including the cookie-banner snag.
- **Stripe dashboard remained dashboard-only.** Browser navigation to `https://dashboard.stripe.com/*` is blocked by claude-in-chrome's financial-platform safety rules (`This site is not allowed due to safety restrictions`). That's by design and correct. Master O drove every Stripe click; Claude provided direct deep-link URLs (`/acct_*/test/workbench/webhooks/we_*/edit` etc.) and exact field names/values to paste.
- **Vercel CLI did the heavy lifting** for `domains add` + `certs issue` + `env add/rm`. No MCP shortcut existed for these. Vercel MCP scope is read-only deployment introspection.

---

## State changes — what's where

| Asset | Before SESSION_38 | After SESSION_38 |
|---|---|---|
| Production main HEAD | `d6543fc` (docs only from parallel session) | `70b6c2d` (code) + close-out docs TBD |
| Production canonical hostname | `directory.seven16group.com` | **`agencysignal.co`** |
| Legacy hostname | served full app | 308-redirects to canonical |
| Vercel domain on `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV` | `directory.seven16group.com` | + `agencysignal.co` (both attached) |
| Vercel SSL cert | `directory.seven16group.com` only | + `cert_dkrssftUwe02rPXy5753RdbP` for `agencysignal.co` |
| Cloudflare `agencysignal.co` zone DNS | NS records only | + A record `@` → 76.76.21.21 (DNS only) |
| Stripe destination `we_1TPyAuHmqSDkUoqwUUHTZITv` URL | `directory.seven16group.com/api/stripe/webhook` | `agencysignal.co/api/stripe/webhook` |
| Stripe `signing_secret` | unchanged | unchanged (preserved on URL-only edit) |
| Vercel `STRIPE_WEBHOOK_SECRET` Production | unchanged | unchanged (matches preserved Stripe secret) |
| Vercel `NEXT_PUBLIC_APP_URL` Production | `directory.seven16group.com` | `https://agencysignal.co` |
| Vercel `NEXT_PUBLIC_APP_URL` Preview | `directory.seven16group.com` | unchanged — Master O dashboard task |

---

## Pickup tasks for SESSION_39

### 🟠 Active arc for SESSION_39

**BACKLOG `0b` — Design system v1.1 rightRail product-mockup harmonization (Path A, ~60-90 min).** Closes the homepage-vs-other-pages density gap before charter outreach scales. See SESSION_37 addendum + PR #8 review notes.

### 🟡 Low-priority follow-ups (Master O dashboard / verification)

1. **Flip `NEXT_PUBLIC_APP_URL` in Vercel Preview env** to `https://agencysignal.co`. Dashboard only (CLI agent-mode rejects preview adds). ~30 sec.
2. **Verify first real Stripe event hits 200 in Vercel logs.** Resend proved the path; next charter signup / subscription renewal / real invoice is the in-the-wild proof. Watch Vercel function logs at first charter outreach response.
3. **(Optional) Add `www.agencysignal.co` redirect.** Currently `www.` doesn't resolve. If desired, add a Cloudflare CNAME `www → cname.vercel-dns.com` (or A → 76.76.21.21) + add domain to Vercel project + redirect www → apex via either Vercel or Next.js redirects. Low priority — direct apex is the canonical.

---

## Commits this session

| Branch | Commits | Total |
|---|---|---:|
| `main` | `70b6c2d` (Phase A code) + this close-out docs commit (TBD) | 2 |

---

## Cold-open guide for whoever picks this up next

If you're a fresh Claude session opening this repo:

1. Read [`docs/BACKLOG.md`](../BACKLOG.md) — active arc is now **BACKLOG `0b`** (design system v1.1 rightRail harmonization).
2. Read this doc (you're here) — captures the SESSION_38 cutover end-to-end.
3. Read [`docs/WORKING_AGREEMENT.md`](../WORKING_AGREEMENT.md) for the 7 standing rules.
4. **Verify the cutover stuck:** `curl -sSI https://agencysignal.co/` → 200; `curl -sSI https://directory.seven16group.com/` → 308 → agencysignal.co. If both work as expected, the cutover is live + healthy.
5. **Check Vercel logs for any 4xx/5xx since last night** — if a real Stripe event has flowed through, you'll see the proof. If none yet, no action needed.

---

## Standing rule callouts for this session

- **Plugins-first held throughout.** Used Supabase MCP (state checks) + Vercel MCP (deployment introspection) + Vercel CLI (domains add / certs issue / env add) + claude-in-chrome MCP (Cloudflare DNS automation) + computer-use clipboard nothing (no secrets transited this session — Stripe URL edit preserved the secret). Master O dashboard reserved for Stripe (financial-platform safety rules + intentionally guided).
- **Secrets never in chat:** held. Zero secret values displayed. The Stripe signing-secret rotation that I'd planned wasn't needed at all because of the URL-only edit pattern.
- **Audit-first:** held throughout. Pre-flight sanity check (`git log` + `git status` + cron snapshot count + EF log spot-check) before any Phase A code change. Phase C verification suite (4 checks) before Phase D. Stripe event count + event-list match verified BEFORE editing destination URL.
- **One arc per session (Rule 3):** held. Cutover only. BACKLOG `0b` (design system v1.1) and `0c` (Google SSO) were NOT started — explicitly per SESSION_38_PROMPT's recommendation.
- **Always recommend next path as CTO/PM:** held. Lead with the path each time (Phase B's "Vercel-first then DNS" vs "DNS-first then Vercel" sequencing; Phase D's pivot from dual-endpoint to atomic URL edit; cert-stuck workaround via `vercel certs issue` nudge). Master O drove final picks where judgment was required.

---

*Cutover shipped clean. Charter outreach unblocked from every code-side gate. BACKLOG `0b` is the polish-before-scale arc; SESSION_39 is naturally short and visual — should be a fun one.*
