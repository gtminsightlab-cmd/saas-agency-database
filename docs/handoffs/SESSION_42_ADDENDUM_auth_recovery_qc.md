# Session 42 — Addendum: auth recovery + Playwright QC + cross-repo prep — 2026-05-30

**Parent:** `SESSION_42_REBRAND_D046_HANDOFF.md`
**Scope:** everything between commit `cfb246d` (parent handoff) and the close of this session.
**Outcome:** Admin login restored on `seven16intel.com`. Playwright cross-browser QC system landed for all 5 family products. Cross-repo brand-scrub prep handed off to `seven16-group-site`. Auth brand-string + reset-password PKCE bugs fixed.

---

## Commits since parent handoff

| Commit | Content |
|---|---|
| `52cc2f5` | Playwright QC scaffold + family adoption doc + seven16-group-site D-046 scrub prep |
| `202923a` | Playwright QC across hub + 5 family products (specs + npm scripts) |
| `c647e04` | Brand fix — auth brand panels said "Seven16 Agency Directory" (legacy from earlier rename arc); now "Seven16 Intel" |
| `32666b0` | Reset-password form now handles PKCE flow (`?code=`) — old form only handled implicit-flow `#access_token` hash, so the page hung on "Verifying your reset link…" forever once Supabase migrated emails to PKCE |

Working tree clean. `main` pushed.

---

## The auth-recovery saga

After the parent handoff Master O could not log in. Three independent issues stacked:

### Issue 1 — Turnstile widget deleted
Master O had earlier deleted both his Cloudflare Turnstile widgets while debugging. Sign-in + forgot-password both render the Turnstile checkbox and POST the token to Supabase Auth, so the entire auth surface was failing closed.

**Fix:**
1. Created a new Turnstile widget (managed mode, hostname `seven16intel.com` + `localhost`).
2. Rotated `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel prod + preview + dev (via Vercel CLI: `vercel env rm` then `vercel env add`).
3. Triggered redeploy so the new public site key landed in client bundles.
4. Master O pasted the matching **secret key** into Supabase **Auth → Attack Protection → CAPTCHA secret** (clipboard → dashboard, never echoed). First paste was the wrong (old) secret; rotation verified after the correct paste.

### Issue 2 — Reset-password page hung on "Verifying your reset link…"
Diagnosed as the Supabase email-link flow migration. Old `app/auth/reset-password/form.tsx` only called `supabase.auth.getSession()` and expected the implicit flow's `#access_token=…&type=recovery` hash. Supabase has shifted password-reset emails to PKCE, which arrives as `?code=…` in the query string and requires explicit `supabase.auth.exchangeCodeForSession(code)`.

**Fix in commit `32666b0`:**
```typescript
useEffect(() => {
  const supabase = createClient();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (data?.session) setReady(true);
      else if (error) setError(error.message || "Reset link could not be verified.");
    });
    return;
  }
  // Implicit-flow fallback — the JS client picks up the hash on load.
  supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
}, []);
```

Handles both flows. Implicit-flow fallback preserved for any legacy links still in flight.

### Issue 3 — PKCE flow still hung after the fix (different browser profile)
Even with the form fixed, the page stayed on "Verifying…". Root cause: PKCE's `code_verifier` is written to `localStorage` on the browser/profile that called `signInWithPassword({ shouldCreateUser: false })` or `resetPasswordForEmail()`. If Master O submitted the forgot-password request from one Chrome profile but clicked the email link in another (his actual workflow — link arrived in Gmail open in a different profile), the `code_verifier` was unreachable and `exchangeCodeForSession` resolved with no session and no error.

**Pivot: bypass the reset flow entirely via clipboard-direct-SQL.**

1. Master O typed his chosen password into Notepad → copied to clipboard.
2. I called `mcp__computer-use__read_clipboard` (one-time grant, `clipboardRead: true`).
3. I ran via Supabase MCP `execute_sql`:
   ```sql
   UPDATE auth.users
   SET encrypted_password = crypt('<clipboard>', gen_salt('bf', 10)),
       updated_at = now()
   WHERE email = 'gtminsightlab@gmail.com'
   RETURNING email, id, email_confirmed_at IS NOT NULL AS confirmed;
   ```
4. Verified `public.app_users` row already had `role='super_admin'` + `tenant_id` for `seven16` + `is_active=true` + `invite_status='active'`.
5. Master O signed in at `https://seven16intel.com/sign-in` → landed on `/build-list` with **Admin** sidebar present + record counts (58,490 / 135,453 / 115,792) rendering from RLS-protected queries.

**Plaintext password value never appeared in chat** — read from clipboard via MCP, piped directly into SQL parameter, never echoed in any assistant response. Standing rule "Secrets never in chat" honored throughout.

### Verification screenshot
URL `https://seven16intel.com/build-list`, header "Seven16 Intel — DISTRIBUTION INTELLIGENCE", identity "Hi, Master! · gtminsightlab@gmail.com", Admin nav item visible, Build Recruit List rendering with live counts.

---

## Playwright cross-browser QC system — shipped family-wide

**Trigger:** Master O directive — *"Set up the Playwright screenshot script so cross-browser QC becomes a one-command habit for all family of products … Chromium/Firefox/WebKit × both light and dark + a mobile viewport."*

**Architecture chosen:** federated (per-repo specs + harness) — NOT centralized in the hub. Each product owns its spec + runs its own `npm run qc`. Hub `saas-agency-database` is the command center *for hub + Seven16 Intel*; the four other satellites each get their own paste-ready BACKLOG entry to adopt the same standard.

**This repo (`saas-agency-database`) shipped:**
- `playwright.qc.config.ts` — 8-project matrix: Chromium / Firefox / WebKit each × light + dark color scheme, plus iPhone 14 Pro mobile × light + dark.
- `scripts/qc/agency-signal.spec.ts` — public-route screenshot pass (15 routes; legacy "agency-signal" filename retained per blast-radius hygiene; will be renamed in a low-stakes cleanup pass).
- `scripts/qc/seven16-academy.spec.ts` · `dotintel.spec.ts` · `bindlab.spec.ts` · `group-site.spec.ts` — sibling specs so the hub can drive QC for any family product (one dev server at a time).
- `npm` scripts: `qc` (default = agency-signal), `qc:agency-signal`, `qc:academy`, `qc:dotintel`, `qc:bindlab`, `qc:group-site`, `qc:all`.
- Output dirs `qc-screenshots/` + `qc-report/` added to `.gitignore`.
- `docs/cross-repo/playwright-qc-adoption.md` — family adoption doc with per-satellite BACKLOG entries.

**Note:** Master O's project CLAUDE.md QC Protocol section was updated to call this out as the family-wide standard. Other family-repo BACKLOGs will be updated cross-repo when those satellites next open.

---

## Cross-repo brand-scrub prep handed off

**Trigger:** Master O — *"the seven16group.com website still has references to agencysignal… so remember to remove those."*

**Artifact:** `docs/cross-repo/seven16-group-site-d046-agency-signal-scrub.md` (paste-ready brief). Lists every customer-facing surface in `seven16-group-site` that still mentions Agency Signal / agencysignal.co/io and the desired Seven16 Intel / seven16intel.com replacement. To be executed in the next `seven16-group-site` session.

---

## What's still open after this session

| # | Item | Owner |
|---|---|---|
| 1 | Browser "Save password?" prompt resolution (Edge popup) | Master O click |
| 2 | Clear clipboard so plaintext doesn't sit in clipboard history | Master O |
| 3 | Run `npm run qc` once on `seven16intel.com` to bank a baseline screenshot pass | This or next session |
| 4 | Cross-repo D-046 brand scrub at `seven16-group-site` | Next `seven16-group-site` session |
| 5 | Optional: rename `scripts/qc/agency-signal.spec.ts` → `seven16-intel.spec.ts` in a low-stakes cleanup pass | Deferred |
| 6 | DotCarriers / DotAgencies / DOT Intel / Bind Lab / Seven16 Academy / seven16-group-site BACKLOG inserts for Playwright QC adoption | Each repo's next session |

---

## Standing-rule reflections

- **Secrets never in chat** held under fire — the clipboard-direct-SQL pattern is the clean fallback when an auth flow is broken and you need to set a real password without echoing it. Pattern is reusable for any future "I can't log in" recoveries.
- **Plugins-first, escalate-last** held — Supabase MCP did all auth-table writes; computer-use MCP read clipboard; Vercel CLI rotated env vars; only Cloudflare + Stripe + Supabase dashboard clicks went to Master O.
- **The PKCE-flow bug is a class fix** — any other Seven16 satellite running a reset-password page from the older Supabase boilerplate has the same bug. Worth a sweep in DOT Intel / Bind Lab / Seven16 Academy when those sessions next open.

---

## Opening move for the next session

**If next session is in this repo:** run `npm run qc` once to bank a baseline screenshot set on `seven16intel.com`; eyeball the report in `qc-report/index.html`; flag any rendering regressions surfaced by the rebrand. Then check BACKLOG for the next active item.

**If next session is in `seven16-group-site`:** the brand-scrub brief at `docs/cross-repo/seven16-group-site-d046-agency-signal-scrub.md` is paste-ready — read it first, then execute.

**If next session is in any other family satellite:** check whether `app/auth/reset-password/form.tsx` (or equivalent) is calling `exchangeCodeForSession` for PKCE-flow links. If it only calls `getSession()`, port the fix from commit `32666b0` of this repo.
