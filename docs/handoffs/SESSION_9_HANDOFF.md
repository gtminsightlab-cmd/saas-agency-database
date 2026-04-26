# Session 9 handoff — multi-seat invitations, CMO Phase 1+2 shipped, vertical card redesign

**Session date:** 2026-04-25 → 2026-04-26
**HEAD:** `f3cbdff` on `main`
**Branch state:** clean; nothing uncommitted in OneDrive
**Vercel deployment:** auto-deploys on push to `main`; latest deploy off `f3cbdff` should be live by the time the next session opens

---

## TOOLS THE NEXT SESSION ALREADY HAS — DO NOT RE-ESTABLISH

Master O has these MCP servers connected. **Do not waste time asking him to enable them.** They are live and authenticated.

| What | MCP prefix | What it does for this project |
|------|-----------|-------------------------------|
| **Supabase** | `mcp__a7551cce-72a4-4510-a756-75884c17b895__*` | `apply_migration`, `execute_sql`, `get_advisors`, `list_tables`, etc. Project ID `sdlsdovuljuymgymarou` (name: seven16group). NOT `vbhlacdrcqdqnvftqtin` — that's `dotintel`, a separate project. |
| **Stripe** | `mcp__88ed113e-60e5-42f6-b10f-2ff70d3fd669__*` | Sandbox mode. `list_products`, `list_prices`, `create_payment_link`, `create_invoice`, etc. Three products live: Free, Growth Member ($99/mo), One-Time Snapshot ($125). |
| **Vercel** | `mcp__da129817-b0da-40ff-af93-9c5eb6e8b376__*` | `list_deployments`, `get_deployment_build_logs`, `get_runtime_logs`, `deploy_to_vercel`. Auto-deploy on push to `main` is already wired — no manual deploys needed. |
| **GitHub** | (via `mcp__workspace__bash` git CLI) | Existing clone at `/tmp/repo-push` has push access. Repo: `gtminsightlab-cmd/saas-agency-database`. Commit + push from that clone, never from OneDrive (the OneDrive `.git` was corrupted at session 5). |
| **Gmail** | `mcp__26ef426b-8be6-48d4-b39a-fe98f48cd16e__*` | `search_threads`, `create_draft`, etc. Available for email outreach work (testimonial requests, customer onboarding). |
| **GDrive** | `mcp__2cff04fb-73e4-4c7c-af89-e7f811eb1c4f__*` | `search_files`, `read_file_content`, `create_file`. Available for Drive-stored AdList xlsx loads. |
| **GCal** | `mcp__791bda76-0a9e-419f-8a61-024a8fb9e133__*` | Calendar work — meeting scheduling, prep. |
| **Workspace bash** | `mcp__workspace__bash` | Linux sandbox with Python, Node, git, ripgrep. **Use for all file operations >5KB on OneDrive** — see "OneDrive truncation" below. |

**Cloudflare:** No MCP tool. Cloudflare is the DNS layer for the production domain but Master O has to make any Cloudflare changes manually through the dashboard. Don't try to script Cloudflare work; surface a step-by-step manual instruction list instead.

**Master O's explicit preference:** *"You have access via plugins to push, remember I prefer you do the work in github, vercel, stripe, cloudflare, supabase etc."* Use the MCP tools directly — don't ask him to run commands he could just have you run.

---

## OPENING MOVE FOR THE NEXT SESSION

When the next session starts, do this in order:

1. Read this file first.
2. Read `MEMORY.md` for the full memory index.
3. Confirm `HEAD` is `f3cbdff` on `main` via `cd /tmp/repo-push && git log -1 --oneline`. If `/tmp/repo-push` doesn't exist (sandbox reset between sessions), re-clone:
   ```bash
   git clone https://github.com/gtminsightlab-cmd/saas-agency-database.git /tmp/repo-push
   ```
4. Verify Supabase HEAD migration is `0055_team_seats_and_invitations` via `mcp__a7551cce-72a4-4510-a756-75884c17b895__list_migrations`.
5. Ask Master O what's next. The most likely directions are listed in the "Open backlog" section at the bottom of this doc.

---

## WHAT SHIPPED THIS SESSION (chronological)

| Commit | What | Files |
|--------|------|-------|
| `4286edf` | Sign-out moved to top of sidebar (inline next to user chip; ChevronDown removed) | `components/app/sidebar.tsx` |
| `4890de6` | Industry Verticals tab added to logged-in app sidebar; /verticals page now renders inside AppShell when authed, marketing nav when anon | `components/app/sidebar.tsx`, `app/verticals/page.tsx` |
| `179869d` | **Multi-seat invitations system.** Migration 0055 + /team page + /api/team/invite + /api/team/revoke + sign-up email-prefill | 8 files (see migration table below) |
| `5326cb6` | CMO copy review delivered as `docs/cmo-review/CMO_COPY_REVIEW_2026-04-25.md` | 1 file (33KB markdown) |
| `3b1cb5f` | **Phase 1 CMO copy rewrite.** Homepage hero + pricing reframe + banned-words scrub | `app/page.tsx` |
| `f0253ff` | **Phase 2 CMO copy rewrite.** /verticals competitive frame + sign-up intent segmentation + error microcopy library | `app/verticals/page.tsx`, `app/sign-up/page.tsx`, `app/sign-up/form.tsx` |
| `f3cbdff` | **Vertical card redesign.** Tightened geometry, uniform 2-line descriptions, 3x2 stats grid with Excel-style cell borders, full-width CTA at card bottom | `app/verticals/page.tsx` |

---

## MIGRATION 0055 — full reference

**Filename:** `supabase/migrations/0055_team_seats_and_invitations.sql`
**Applied to:** project `sdlsdovuljuymgymarou` on 2026-04-25
**Advisors:** clean (no new warnings introduced; the 3 pre-existing warnings — `pg_trgm` in public, `mv_vertical_summary` in API, leaked-password-protection disabled — are unchanged from session 8).

### Schema additions

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `app_users` | `invite_status` | text CHECK ('active','invited','revoked') DEFAULT 'active' | Lifecycle state for the seat |
| `app_users` | `invited_by` | uuid REFERENCES app_users(id) | Audit trail |
| `app_users` | `invited_at` | timestamptz | When invite sent |
| `app_users` | `accepted_at` | timestamptz | When invitee signed up (auto-stamped by trigger) |
| `billing_plans` | `seat_cap` | int NOT NULL DEFAULT 1 | Per-plan seat cap. Free=1, Growth Member=3, Snapshot=3 |

### Indexes
- `app_users_invite_status_idx ON app_users(invite_status)`
- `app_users_tenant_invite_idx ON app_users(tenant_id, invite_status)`

### RPCs (all SECURITY DEFINER, GRANT EXECUTE TO authenticated)

| RPC | Signature | What it does |
|-----|-----------|--------------|
| `get_my_seat_info()` | RETURNS (used int, cap int, plan_name text, has_active_plan bool, can_invite bool) | Drives /team page header. Resolves caller's app_user → entitlement → plan → seat_cap; counts active+invited seats in caller's tenant. |
| `invite_team_member(p_email, p_full_name)` | RETURNS app_users | Validates email format, active subscription, seat cap (used < cap), no duplicate email. Inserts app_users row with invite_status='invited'. |
| `revoke_invite(p_app_user_id)` | RETURNS void | Validates same-tenant + status='invited'. Sets invite_status='revoked' and is_active=false. Audit row preserved (NOT deleted). |
| `list_my_team()` | RETURNS TABLE | Returns active+invited seats for caller's tenant with `is_self` flag. Excludes revoked. |

### Trigger update
`link_app_user_on_auth()` (originally from migration 0006) was modified to **auto-flip pending invites to active** when the invitee signs up:
```sql
UPDATE public.app_users
   SET user_id = NEW.id,
       invite_status = CASE WHEN invite_status = 'invited' THEN 'active' ELSE invite_status END,
       accepted_at  = CASE WHEN invite_status = 'invited' THEN NOW() ELSE accepted_at END
 WHERE email = NEW.email
   AND user_id IS NULL
   AND invite_status <> 'revoked';
```
This means the invitation acceptance flow is fully automatic — no separate "accept invite" page needed.

---

## /team PAGE — architecture

**Files:**
- `app/team/page.tsx` — server component (AppShell-wrapped)
- `app/team/invite-form.tsx` — client form, posts to /api/team/invite
- `app/team/row-actions.tsx` — client revoke button, posts to /api/team/revoke
- `app/api/team/invite/route.ts` — POST handler wrapping `invite_team_member` RPC, with friendly error mapping (402 no-plan, 409 cap/duplicate)
- `app/api/team/revoke/route.ts` — POST handler wrapping `revoke_invite` RPC

**State machine for an invite:**
```
[Owner clicks "Send invite"] → app_users row created with invite_status='invited'
                              → Owner gets a copy-able sign-up link to share
                              → Invitee navigates to /sign-up?email=invitee@co.com&invited=1
                              → Sign-up form prefills email, shows "You've been invited" banner
                              → Invitee creates account → trigger auto-binds user_id and flips invite_status='active'
                              → Invitee lands in /build-list with full plan benefits
```

**Sidebar nav:** "Account" group at the bottom of the sidebar, with a Team link using the `Users` icon. Visible to all authenticated users; the page itself shows an upgrade prompt for free-plan tenants.

---

## CONFIRMED STRATEGIC DIRECTION (do not re-litigate without explicit user request)

These decisions were made and validated this session. The next session should treat them as fixed unless Master O explicitly raises them again.

### Brand positioning (CMO frame)
- **Category language:** "Distribution intelligence for U.S. commercial insurance" — used in homepage eyebrow, /verticals positioning, and elsewhere.
- **Anchor sentence:** "*Seven16 maps the writing-company paper trail behind every U.S. commercial agency, refreshed monthly against state filings — turning the appointment list into a verified inventory of which agents can bind your program today.*"
- **Buyer segmentation (rank-ordered):** Tier A = VP/Director of Distribution at wholesaler or MGU ($25–100K budget, 30-day decision). Tier B = Head of Marketing/Demand at carrier program team. Tier C = Founder/BD lead at startup wholesaler/MGA. Every word on the marketing site is written for Tier A first.
- **Competitive frame:** ZoomInfo / Apollo / D&B sell company contacts (not appointments). AM Best / S&P sell carrier financials (not behavior). Building it in-house = 6-person full-time job. Seven16 is the missing layer between the two.
- **Voice:** authoritative without arrogance, operator's language not vendor's language, quantified everywhere, no marketing hype words. Banned: *unleash, supercharge, revolutionary, game-changing, AI-powered, next-gen, drive growth, distribution strategy* (capitalized like a proper noun), *distribution infrastructure*, *cutting-edge, synergy, disrupt*. The one allowed proper noun is "Dual-Agent Verification Pipeline" (a specific feature name, not a marketing word).

### Numerology / spiritual angle: REJECTED
Master O floated using "Seven16 = double-7 numerology" as part of the brand story (via a ChatGPT session he pasted into the conversation). The CMO recommendation was an explicit **NO** — buyer mismatch, category dilution, regulated-industry risk, competitor opening. Master O accepted this with "nope all good. phase 2 go." **Do not surface numerology framing in any future copy work.** If brand-name origin ever needs to appear on the site, it goes in the founder bio as one-sentence trivia, not as positioning.

### Customers & testimonials: NONE YET
Master O does not have paying customers yet. Phase 3 of the CMO doc (trust section + customer logos + 3 testimonial cards + post-signup welcome) is **deferred until customer evidence exists.** Do not ship placeholder testimonials, do not ship a "Trusted by" logo strip with fake logos. When Master O reports having 2-3 paying customers, that's the trigger to ship Phase 3 — pair with `cowork-essentials:testimonial-outreach` to draft the request emails.

### Pricing reframe accepted
- Three-column comparison (Free / Growth Member / Snapshot) on the homepage replaces the old two-card layout.
- Pricing scales with **freshness** (decay tolerance), not download volume.
- Growth Member ROI math anchored to "one additional AOR win pays the subscription for ~50 years."
- Risk-reversal: cancel anytime, refund first month before month 2, lists are yours forever.

### Multi-seat: paid plans = 3 seats
Owner + 2 invitees. Pending invites count toward the cap (so spam is impossible). Free plan = 1 seat. This was the explicitly-recommended option Master O accepted in AskUserQuestion.

---

## OPEN BACKLOG (in rough priority order)

These are real next-step items, not vague aspirations. Most have clear definitions of done.

### 1. Phase 3 of CMO rewrite — paused on customer evidence
**Trigger:** Master O reports having 2-3 paying customers.
**Scope:** Trust section on homepage with founder bio + customer logos, 3 testimonial cards (sourced via `cowork-essentials:testimonial-outreach`), post-signup welcome flow at `/welcome` showing the 3-step "fastest path to value" guide.
**Files to touch:** `app/page.tsx` (insert new section between "Why companies switch" and verticals carousel), new `app/welcome/page.tsx`, new `components/app/welcome-banner.tsx`.

### 2. Three A/B tests
Once the site has enough traffic for statistical power (probably 500+ visitors/week), run the tests documented in CMO doc Section 6:
- Hero headline (3 variants)
- Primary CTA copy (3 variants)
- Pricing frame (3 variants)
Each test = one variable, two-week run, 95% confidence threshold. Will need a feature flag or analytics hook — current site uses no A/B testing infrastructure yet.

### 3. Eight new verticals are empty
Public Entity, Real Estate, Hospitality, Manufacturing, Tech/Cyber, Energy, Retail, Professional Services — these vertical_markets rows exist (sort_order 5-12) and have specialty carriers mapped (migration 0053), but the AdList xlsx files for these verticals haven't been loaded. The cards on /verticals show 0/0/0 stats because there are no verified agencies yet. **As soon as Master O loads AdList files tagged to those carriers, the cards populate automatically — no code change needed.** The redesign in commit `f3cbdff` keeps the empty cards looking clean (uniform geometry hides the 0s).

### 4. Stripe sandbox → production
Stripe is currently in sandbox mode. Three products live (Free, Growth Member, Snapshot). `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` env vars need to be set in Vercel before Master O takes payments. See `reference_stripe_sandbox.md` in memory for the exact list.

### 5. Cloudflare DNS — manual work
The production domain is on Cloudflare. No MCP. If DNS records or workers need touching, surface a step-by-step manual instruction list for Master O.

### 6. Things deliberately not built
- **Email-sending on invite.** Current flow gives the owner a copy-able sign-up link to share manually. We could add server-side email-sending via Supabase auth.admin.inviteUserByEmail (needs service role key), but Master O hasn't asked for it.
- **Tenant_admin promotion.** All paid users currently have role='user'. If we ever want sub-roles (e.g., billing-admin, member, observer), we'd need a UI for it. Out of scope until requested.
- **Audit log UI.** `audit_log` table exists (migration 0044) but no admin UI surfaces it. Useful for "who invited whom" forensics later.

---

## LESSONS / FEEDBACK (do not re-learn the hard way)

### OneDrive truncation is real
The Edit and Write tools truncate files >5KB on OneDrive folders mid-flush. **Always work via /tmp.** Build the file with bash heredoc/Python, `cp` atomically to the OneDrive path AND to `/tmp/repo-push`, verify md5sum across all three locations, then commit + push from `/tmp/repo-push`. This was bitten in session 8 and again early this session — do not skip the `/tmp` step.

### Don't push from OneDrive `.git`
The OneDrive `.git` directory was corrupted at session 5. Always commit and push from the `/tmp/repo-push` clone. The clone has its own working `.git` that works correctly.

### Banned words on the marketing site
Master O signed off on the CMO doc's banned-words list. The full list is in `docs/cmo-review/CMO_COPY_REVIEW_2026-04-25.md` Section 7. Specifically: *Unlock, Drive Growth, Distribution Strategy* (capitalized), *Distribution Infrastructure, Hygiene* (capitalized), *Cutting-edge, Synergy, Disrupt, Revolutionary, Game-changing, AI-powered, Next-gen, Powerful, Seamless, Robust, Solution.* If new copy work is requested, search-and-destroy these before shipping.

### Master O's communication preference
Plain-language, step-by-step instructions when asked to do anything he can't have Claude do (GitHub/Vercel/dashboard clicks). He prefers Claude does work directly via MCPs rather than narrating instructions for him. Don't dump long status updates after every step — ship and report the result.

### Verify before recommending
Per memory feedback `feedback_handoff_quality.md`: "Master O was hurt by thin handoffs that caused re-discovery at next session start. Always write the long version." This handoff aims to be that long version. If the next session is tempted to skip reading parts of it — don't.

### Supabase project IDs
- `sdlsdovuljuymgymarou` = **seven16group** = THIS project (SaaS Agency Database)
- `vbhlacdrcqdqnvftqtin` = **dotintel** = a different trucking project handled by `supabase-steward` skill, NOT this codebase
- The original memory file pointed at the wrong ID. Fixed in `reference_supabase_seven16group.md`.

---

## STATE OF DEPLOYED PAGES (post-`f3cbdff`)

| URL | What's there | Last touched |
|-----|--------------|--------------|
| `/` | Phase 1 hero + "Why this exists" + "Why companies switch" + verticals carousel + 3-column pricing comparison + final CTA strip on navy gradient | `3b1cb5f` |
| `/verticals` | Hero + 12 vertical cards (redesigned uniform layout) + Tier-A callout + Edge four-pillar + parent-child tree + "What you can't get anywhere else" comparison + credibility-first prose box + final CTA | `f3cbdff` |
| `/verticals/<slug>/open` | Server-side redirect that builds the carrier filter and 303s to /build-list/review with carrier IDs pre-applied. Auth-gated; anon → /sign-up?vertical=<slug> | `51691ff` |
| `/team` | Seat KPIs + invite form (or upgrade prompt or no-seats-left) + members table with revoke buttons | `179869d` |
| `/sign-up` | Three intent paths (default / `?vertical=<slug>` / `?invited=1` or `?email=`). Email field locks when invited. | `f0253ff` |
| `/sign-up` form | Friendly error microcopy library mapping Supabase errors. Submit button "Get instant access" / loading "Reserving your seat…" | `f0253ff` |
| `/admin/customers` | Per-tenant drill-down with users + plans + entitlements (from session 7) — this still works but the seat_cap column is not surfaced yet, opportunity to add it | `1f975c9` |
| `/ai-support` | NL parser + 6-card KPIs + suggested-query category tabs + recent-search panel (from session 8) | `afb33aa` |

---

## DELIVERABLES IN THE WORKSPACE

| Path | What | When to read it |
|------|------|-----------------|
| `docs/cmo-review/CMO_COPY_REVIEW_2026-04-25.md` | 33KB consultancy-grade copy review with strategic positioning frame, voice/tone guide, page-by-page rewrites, banned-words list, three A/B test specs, three-phase implementation plan | Before any future copy work |
| `docs/handoffs/SESSION_9_HANDOFF.md` | This document | At the start of the next session |

---

## TASK LIST AT END OF SESSION

All 36 tasks from this session are marked completed. The task list has accumulated from session 7+ — if it gets unwieldy in the next session, prune the older completed tasks for clarity.

**Tasks deferred (not yet created as TaskCreate items, but tracked in this handoff):**
- Phase 3 CMO rewrite (testimonials/trust) — trigger: 2-3 paying customers
- Three A/B tests — trigger: 500+ visitors/week
- Stripe sandbox → production — trigger: Master O ready to charge
- Eight empty verticals — trigger: AdList files loaded for those carriers
