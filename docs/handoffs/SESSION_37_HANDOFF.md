# Family-Hub Session 37 — Saved-lists backend verification → 401 root-cause → Path R (legacy JWT) + Path F (EF auth modernization) (2026-05-25)

**Date:** 2026-05-25
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `main`
**Predecessor:** [`SESSION_36_HANDOFF.md`](SESSION_36_HANDOFF.md)
**HEAD at session open:** `db67396` (SESSION_36 state-split correction)
**HEAD at session close (this docs commit):** TBD (after close-out push)
**Code commit this session:** `4f659d8` — `fix(cron,edge-fn): decouple saved-lists cron auth from service-role JWT`
**Open PR (unchanged):** [PR #8](https://github.com/gtminsightlab-cmd/saas-agency-database/pull/8) on `feat/design-system-v1` — still awaiting Master O Vercel-preview review + merge (was the active arc; descoped at session open to a smaller item).
**Live URL:** https://directory.seven16group.com — production READY on deploy `dpl_58V38KotUBydwQXeTt2XLN85GYR3` (53s build, ~04:00 EDT 2026-05-25)

---

## Theme — descoped to a small verification item that surfaced a real bug

Session opened with PR #8 + domain cutover blocked on Master O review bandwidth. Active arc per BACKLOG = domain cutover, but Master O elected to descope. Picked **Queued #3 — verify saved-lists update-detection backend** per audit-first principle. Verification confirmed the system at every layer EXCEPT the actual cron path — which was returning 401 every morning silently. Root-caused, then closed with two complementary fixes: Path R (immediate restoration) + Path F (architectural modernization that survives the 2026 sb_secret_* key rotation).

---

## Arc 1 — Verification of BACKLOG #3 (the original descoped item)

**Result:** ✅ Backend is shipped + functional. ❌ Cron path was returning 401 every morning (silent failure).

Layer-by-layer audit:

| Layer | Status | Evidence |
|---|---|---|
| Edge Function `recompute-saved-lists` ACTIVE | ✅ | `mcp__list_edge_functions` returned v1 ACTIVE on `sdlsdovuljuymgymarou` |
| EF code (snapshot diff + change-row writer + RPC bridge) | ✅ | Read via `mcp__get_edge_function` — sophisticated implementation, uses postgres.js direct conn (D-013 pattern) |
| Vercel cron in `vercel.json` | ✅ | `0 4 * * *` UTC → `/api/cron/saved-lists-refresh` |
| Cron route validates CRON_SECRET | ✅ | `app/api/cron/saved-lists-refresh/route.ts` checks `Bearer ${CRON_SECRET}`, returns 401 on mismatch |
| Schema (`saved_list_snapshots`, `saved_list_changes`, `saved_lists.has_updates`) | ✅ | All present with expected columns |
| API routes (`acknowledge`, `delta-export`) | ✅ | RLS-scoped; delta-export inlines the ack flip |
| UI surfaces (`/saved-lists` table tint + sortable Updates column; `/home` MetricCards + Signals section) | ✅ | Grep found 6 files referencing has_updates/saved_list_*/delta-export |
| **Cron actually firing successfully** | ❌ | `mcp__get_logs(service: edge-function)` showed POST 401, execution_time_ms=1576, at ~04:00 UTC this morning |
| Snapshot data populated | ❌ → ✅ later | Started 0 rows; bootstrapped to 3 via test side-effect (see Arc 2) |

---

## Arc 2 — Root-cause diagnosis

**Question:** why is the cron route returning 401 from the Edge Function every morning?

**Hypothesis chain:**

1. **First guess:** Vercel `SUPABASE_SERVICE_ROLE_KEY` env var is a stale legacy JWT, invalidated by the 2026 project rotation. Per memory [`feedback_supabase_api_key_format_rotation.md`](C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\feedback_supabase_api_key_format_rotation.md). **Rotated Vercel `SUPABASE_SERVICE_ROLE_KEY` to fresh `sb_secret_*` from dashboard. Re-tested directly → still 401.**

2. **Second guess:** something deeper. Tested EF with legacy anon JWT (still in `get_publishable_keys` output) → **200 success + first_run_initialized=3** (bootstrapped the snapshot tables as side-effect).

3. **Confirmed via Supabase docs subagent:** From `/docs/guides/getting-started/api-keys` — _"Edge Functions only support JWT verification via the anon and service_role JWT-based API keys. You will need to use the `--no-verify-jwt` option when using publishable and secret keys."_ And from `/docs/guides/functions/auth` — _"this method [verify_jwt] is incompatible with the new JWT Signing Keys."_

**Root cause locked:** `sb_secret_*` is an opaque API key, NOT a JWT. The EF gateway with `verify_jwt: true` only accepts JWTs (anon or service_role). When the project rotated to the 2026 key format, the Vercel env var update path broke for EFs even though it still works for PostgREST/REST calls (those accept the new format via apikey + Authorization header match).

**Documented as new memory:** [`feedback_edge_function_verify_jwt_vs_sb_secret.md`](C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\feedback_edge_function_verify_jwt_vs_sb_secret.md) — to be written at close.

---

## Arc 3 — Path R: restore legacy service-role JWT (immediate fix, ~5 min)

**Why both R and F:** Master O elected to ship both — Path R restores nightly cron immediately, Path F makes it survive the eventual legacy-JWT invalidation.

**Steps executed:**

1. Master O at Supabase dashboard → API Keys → Legacy section → copied service_role JWT (long-lived `eyJ…`, exp=year 2036).
2. Claude clipboard-grabbed via `mcp__computer-use__read_clipboard` (clipboardRead grant).
3. Decoded JWT payload locally to verify role=service_role + ref=sdlsdovuljuymgymarou (no key value displayed in chat).
4. `vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes`
5. `Get-Clipboard | vercel env add SUPABASE_SERVICE_ROLE_KEY production` (Sensitive by default; "Removed trailing newline from stdin input" per Vercel CLI).
6. Direct curl to `https://sdlsdovuljuymgymarou.supabase.co/functions/v1/recompute-saved-lists` with legacy JWT Bearer → **200** with `processed=3 first_run_initialized=0 errors=0` (steady-state behavior: snapshots already exist from anon-JWT test, no diffs to record).

**Caveat (documented in BACKLOG queue):** Path R uses a key Supabase will eventually invalidate. Path F (next arc) removes this dependency entirely.

---

## Arc 4 — Path F: modernize EF auth (architectural fix, ~30 min)

**Goal:** decouple cron→EF auth from Supabase service-role JWT. Survive legacy-JWT invalidation. Future-proof.

**Design:** EF deployed `verify_jwt: false`. Auth validated in-function against a shared secret (`EDGE_FN_AUTH_SECRET`) set in BOTH Vercel and Supabase EF Secrets. Cron route sends `Bearer ${EDGE_FN_AUTH_SECRET}` instead of `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`.

**Steps executed:**

1. Generated 64-char hex secret via PowerShell `[guid]::NewGuid()` ×2 → placed directly on Master O's clipboard via `Set-Clipboard` (preview only displayed in chat — full value never echoed).
2. Master O at Supabase dashboard → Settings → Edge Functions → Secrets → added `EDGE_FN_AUTH_SECRET` with the pasted value. Confirmed appearance in Custom secrets table with SHA256 digest.
3. Claude clipboard-grabbed same value → added to Vercel Production as `EDGE_FN_AUTH_SECRET` (Sensitive) via `vercel env add ... production`.
4. Edited [`supabase/functions/recompute-saved-lists/index.ts`](../../supabase/functions/recompute-saved-lists/index.ts):
   - Expanded comment header documenting the SESSION_37 Path F auth model + why
   - Inserted auth check block after the method check: validates `Deno.env.get("EDGE_FN_AUTH_SECRET")` exists + `Authorization` header matches `Bearer ${authSecret}` → 401 on mismatch
5. Deployed EF v3 via `mcp__deploy_edge_function` with `verify_jwt: false`. Confirmed slug=`recompute-saved-lists` version=3 status=ACTIVE verify_jwt=false.
6. Edited [`app/api/cron/saved-lists-refresh/route.ts`](../../app/api/cron/saved-lists-refresh/route.ts):
   - Expanded comment header
   - Swapped `process.env.SUPABASE_SERVICE_ROLE_KEY` → `process.env.EDGE_FN_AUTH_SECRET`
   - Updated error message + outbound Authorization header accordingly
7. Verification at EF layer (direct curl, before code push):
   - With `Bearer ${EDGE_FN_AUTH_SECRET}` → **200** `processed=3 first_run_initialized=0 errors=0`
   - With no auth header → **401** "unauthorized"
8. `git commit` + `git push origin main` → Vercel auto-deployed `dpl_58V38KotUBydwQXeTt2XLN85GYR3` READY in 53s
9. Cron route smoke test on production:
   - GET with no auth → 401 (not 500, proves CRON_SECRET env var loads correctly)
   - GET with wrong Bearer → 401 (proves auth gate works)

**Not directly verified:** the full Vercel-Cron → cron route → EF green path with a valid CRON_SECRET. Reasons:
- CRON_SECRET in Vercel is Sensitive (write-only via CLI per memory `feedback_vercel_sensitive_env_write_only.md`)
- All sub-components verified individually
- Vercel-Cron natural fire at 04:00 UTC tonight (2026-05-26) will be the first end-to-end production proof
- Alternative: Master O can click "Run Now" on Vercel Crons dashboard if available on Pro plan

---

## State changes — what's where

| Asset | Before SESSION_37 | After SESSION_37 |
|---|---|---|
| Vercel `SUPABASE_SERVICE_ROLE_KEY` Production | Legacy JWT (31-day-old; pre-session state) | Legacy JWT (Path R restored) |
| Vercel `SUPABASE_SERVICE_ROLE_KEY` Preview | sb_secret_* (during mid-session rotation; ended up there) | sb_secret_* (still — cleanup deferred; works for Stripe routes either way) |
| Vercel `EDGE_FN_AUTH_SECRET` Production | did not exist | 64-char hex (Sensitive; Path F) |
| Vercel `EDGE_FN_AUTH_SECRET` Preview | did not exist | not set (deferred — Master O dashboard) |
| Supabase EF `EDGE_FN_AUTH_SECRET` | did not exist | set via dashboard (Path F) |
| Supabase EF `recompute-saved-lists` | v1 verify_jwt:true | **v3 verify_jwt:false** (Path F) |
| `app/api/cron/saved-lists-refresh/route.ts` | sent service-role JWT | sends `EDGE_FN_AUTH_SECRET` |
| `saved_list_snapshots` rows | 0 | 3 (bootstrap from Arc 2 anon-JWT test) |
| `saved_list_changes` rows | 0 | 0 (no diffs yet — saved_lists haven't changed) |
| `saved_lists.last_run_at` | 2026-04-26 (stale) | 2026-05-25 (refreshed via test invocations) |

---

## Pickup tasks for next session

### 🔴 Master O dashboard / human action

1. **PR #8 review + merge** — unchanged from SESSION_36 close. Single merge brings design system v1 + support widget Stage 2 + compliance pages to production main.
2. **Add `EDGE_FN_AUTH_SECRET` to Vercel Preview env** — same 64-char value as Production. Per memory `feedback_vercel_cli_agent_mode_preview_env.md`, CLI agent-mode rejects preview adds with `git_branch_required`; dashboard only. Without this, preview deploys' cron route returns 500. Cron only fires in Production normally — low impact, but tidy.
3. **(Optional) Rotate Vercel Preview `SUPABASE_SERVICE_ROLE_KEY` to legacy JWT** — to match Production. Mid-session I set Preview to sb_secret_*; both formats work for Stripe routes via @supabase/ssr (apikey + Authorization headers match). Pure hygiene.
4. **(Optional) Delete Vercel `SENTRY_AUTH_TOKEM` typo env var** — exists alongside the correct `SENTRY_AUTH_TOKEN`. Created 3 days ago during SESSION_33 keyboard slip.
5. **(Optional) Tonight 04:00 UTC verification** — first natural cron fire under new architecture. Check Vercel function logs OR Supabase EF logs OR `SELECT COUNT(*), MAX(created_at) FROM saved_list_snapshots` next morning. Expected: snapshot count goes 3 → 6 (3 lists × 2 runs); EF logs show one 200 entry.

### 🟠 Active arc for SESSION_38

**Domain cutover: `directory.seven16group.com` → `agencysignal.co`** — unchanged from SESSION_36/37 carry-forward. Blocked on PR #8 merge first. Choreography in [`SESSION_36_HANDOFF.md`](SESSION_36_HANDOFF.md) §Pickup tasks. Estimated ~30-60 min focused.

### 🟡 Queued (per current BACKLOG)

- **Lawyer review of Privacy + Terms** — Master O engagement, separate
- **Support widget Stage 3** — signed-token user context, dedicated session
- **BACKLOG #2 (Quick Search 4-tab Slices 3-9)** — reactivate after charter outreach + revenue surfaces
- **Dedicated pricing session** — fill /pricing placeholder

---

## Commits this session

| Branch | Commits | Total |
|---|---|---:|
| `main` | `4f659d8` (code fix — cron route + EF index.ts) + this docs commit (TBD after close) | 2 |
| `feat/design-system-v1` (PR #8) | unchanged | 0 |
| `feat/quick-search-4tab` | unchanged | 0 |

Plus Edge Function: v1 → **v3** (versions 2 + 3 minted during deploy_edge_function call; v3 is ACTIVE).

---

## Cold-open guide for whoever picks this up next

If you're a fresh Claude session opening this repo:

1. Read [`docs/BACKLOG.md`](../BACKLOG.md) — active arc remains **domain cutover** (blocked on PR #8 merge).
2. Read this doc (you're here) — captures the verification → diagnosis → Path R + Path F arcs from 2026-05-25.
3. Read [`docs/WORKING_AGREEMENT.md`](../WORKING_AGREEMENT.md) for the 7 standing rules.
4. **Verify PR #8 merge status FIRST.** `gh pr view 8` — if merged, production has design system v1 + support widget + compliance pages. If still open, Master O is still reviewing.
5. **Verify last night's cron fire (if 04:00 UTC has passed):** Query `SELECT COUNT(*), MAX(created_at) FROM saved_list_snapshots ORDER BY created_at DESC LIMIT 5;` on `sdlsdovuljuymgymarou`. Expected: snapshot count >3 + a created_at timestamp from ~04:00 UTC overnight.
6. **If PR #8 merged + Master O greenlights domain cutover:** SESSION_38 = domain cutover work per the choreography in [`SESSION_36_HANDOFF.md`](SESSION_36_HANDOFF.md). Estimated ~30-60 min focused.
7. **If PR #8 still open:** Master O reviewing Vercel preview. Don't start new arcs; iterate on widget/page polish per his feedback OR pick another deferred item if he redirects.

---

## Standing rule callouts for this session

- **Audit-first (default discipline):** Held throughout. Verification arc surfaced the 401 bug before any forward work — exactly what audit-first is for. Layer-by-layer evidence table above.
- **Plugins-first, escalate-last:** Used Supabase MCP (list_edge_functions / get_edge_function / execute_sql / get_logs / deploy_edge_function / search_docs / get_publishable_keys) + Vercel MCP (list_deployments / get_deployment) + computer-use clipboard-grab pattern (3 handoffs: sb_secret_* + legacy JWT + EDGE_FN_AUTH_SECRET). Master O dashboard reserved for what genuinely can't be automated (Supabase Auth secrets section + EF Secrets dashboard).
- **Secrets never in chat (Rule 6):** Held throughout. 3 secrets transited via clipboard pattern (sb_secret_*, legacy JWT, EDGE_FN_AUTH_SECRET) — JWT payload metadata verified via decode but actual key values never displayed in command lines. PowerShell `Get-Clipboard | command` pattern keeps stdin pipe out of visible command text.
- **Cancelled = closed scope:** Held. Original verification scope was ~15-20 min; surfaced bug; Master O explicitly redirected to "Path R then Path F" — both shipped, no scope drift beyond what he sanctioned.
- **One arc per session (Rule 3):** Bent on purpose. The arc was "verify BACKLOG #3 backend." Diagnosis is part of verification. Fix is the natural conclusion. Path R + Path F are facets of the same fix, not separate arcs.
- **Always recommend next path as CTO/PM:** Surfaced Path R / Path F / Path S options + recommendation each time a decision point came up. Master O drove the final pick.

---

*Session opened on what looked like a small audit. Closed with two production deploys, an EF version bump, and an architectural fix that survives the next round of Supabase key rotation. BACKLOG #3 moves from "Queued — verify before picking up" to "Done — verified + modernized." Tonight's 04:00 UTC fire is the production proof.*

---

## FINAL CLOSE-OUT — PR #8 merged + cleanup pass complete (2026-05-25, post-main-handoff)

This section appended after the main handoff was committed. The session continued past the BACKLOG #3 close-out into a widget-fix arc + PR #8 merge + family-API connectivity verification + Google SSO playbook capture. Full audit trail:

### What landed after commit `29bdfd2` (main SESSION_37 close-out)

| Commit | Branch | Content |
|---|---|---|
| `11f3ce4` | `feat/design-system-v1` | Widget defensive fix v1 — useEffect force closed-on-mount + sync hasBeenOpened + always-render pill. Did NOT solve the panel-auto-visible behavior. |
| `8f8c977` | `feat/design-system-v1` | **Widget root-cause fix v2** — `<div hidden={!open} className="... flex ...">` had CSS specificity conflict (Tailwind `.flex` in author CSS beats user-agent `[hidden]{display:none}`). Swapped HTML hidden attribute for conditional `${open ? "flex" : "hidden"}` Tailwind class. Captured as new family memory `feedback_hidden_attr_vs_display_class_conflict.md`. |
| `0aeb0d9` | `main` | Addendum doc + BACKLOG `0b` (design system v1.1 rightRail product-mockup harmonization — Path A ~60-90 min queued for pre-charter-outreach polish). |
| `2e9d44e` | `main` | FAMILY_HEALTH addendum catch-up. |
| `df4e835` | `main` (MERGE COMMIT) | **PR #8 merged.** All 9 commits from `feat/design-system-v1` flow onto main. Production picks up design system v1 + widget Stage 2 (with v2 CSS fix) + compliance pages + theme-aware header. |
| `aab900a` | `main` | Final close-out: BACKLOG PR #8 entry flipped to CLOSED, active arc rewritten as domain-cutover-unblocked, FAMILY_HEALTH refreshed, SESSION_38_PROMPT.md state-at-open updated. |
| `e83e816` | `main` | BACKLOG `0c` — Google SSO on `/sign-in` + `/sign-up` queued, references the cross-repo playbook published by seven16-survey session at their `b8a2bf4`. |

### Vercel auto-deploy verification

Production deploy `dpl_8EPG8sdSkmrkEsZSRMUrE6aPFUiz` READY in 47s after merge. Confirmed via `mcp__da129817-...__get_deployment` on `directory.seven16group.com`:

- State: READY
- Commit: `df4e835` (verified GitHub signature)
- Aliases include `directory.seven16group.com` ✓
- Error rate (last 6h): 0%
- Edge requests + function invocations flowing normally

### Seven16Survey API connectivity verified

Per Master O directive "make sure your able to connect with Seven16Survey.com", confirmed Claude can reach `seven16survey.com/api/*` from this session:

- `GET https://seven16survey.com/api/health` → 200 with `{"ok": true, "service": "seven16-survey", "env": "production", "commit": "347fcde…"}`
- DNS resolves to Vercel (76.76.21.21)
- No `api.seven16survey.com` subdomain yet (Practice 5 of `reference_family_api_integration_mesh.md` calls for `api.*` separation when ready)
- Sibling-bolt-on endpoints (`/api/v1/leads` etc.) NOT yet built per their session's accounting. AS will NEVER consume them directly anyway per the locked hub-and-spoke doctrine (AS reads from Seven16Command CRM, not Survey directly).

Cross-session reply sent via Working Agreement Rule 2(b) chat-text artifact (no file writes to other repo).

### New family memory captured this session

| File | What it documents |
|---|---|
| `feedback_edge_function_verify_jwt_vs_sb_secret.md` | Supabase EF gateway with `verify_jwt:true` only accepts JWT-based tokens (legacy anon/service_role `eyJ…`). Opaque `sb_secret_*` keys → 401 at gateway. Required pattern when project rotates to 2026 key format. Codified during Path F. |
| `feedback_hidden_attr_vs_display_class_conflict.md` | HTML `hidden` attribute (user-agent CSS `[hidden]{display:none}`) is overridden by author-stylesheet display classes like Tailwind's `.flex`. Use conditional className instead. Codified during widget fix v2. |

### Standing-rule callouts (extension to original section above)

- **Honest-pivot principle held** — Widget fix v1 didn't solve the bug. Rather than ship a "defensive layered fix" claim, surfaced "v1 didn't work, here's the real root cause" pivot to Master O. Diagnosis-then-fix discipline beats burying a partial fix under a misleading commit message.
- **Rule 2(b) cross-repo prep artifact used correctly** — Sent reply to seven16-survey session as chat-text only. Zero file writes to other repo, zero commits, zero migrations on their satellite. The artifact lived in chat output exactly as Rule 2(b) permits.
- **Audit-first generalizes** — Hero "disarray" complaint led to reading 8 page.tsx files + 3 panel components on PR #8 branch. Diagnosed it as a SPEC-level density gap (homepage rich `AppointmentSearchMockup` vs other 6 pages flat `DataPanel`) rather than implementation drift. Queued as v1.1 polish (BACKLOG `0b`) instead of blocking merge.

### Session arc closing state

**Code shipped today:** 7 commits on main + 2 commits on PR #8 branch (squashed into main via merge). Production live with everything from PR #8 plus the SESSION_37 addendum fixes.

**Architecture decisions reflected:**
- Path F (EF auth decoupled from Supabase service-role JWT) — survives the 2026 key rotation
- CSS specificity fix on widget — survives any future Tailwind / next.js / React version bumps that might change `hidden` attribute behavior
- BACKLOG entries `0b` (rightRail polish) and `0c` (Google SSO) added with full pickup-cold context

**Charter outreach launch-readiness:** All gates from this side cleared. The remaining gates (LLC formation + FEIN + bank account + Stripe live-mode cutover) are Master O paperwork, not Claude work.

**Next session:** SESSION_38 = domain cutover. Paste-ready opener at [`SESSION_38_PROMPT.md`](SESSION_38_PROMPT.md).
