# Agency Signal — Dedicated Session 1 Handoff

**Date:** 2026-05-07
**Theme:** Inception of the dedicated Agency Signal Claude Code session, running in tandem with the DOT Intel session and the Threshold IQ session.

**Predecessor:** [`AGENCY_SIGNAL_REFRESH_2026_05_07.md`](AGENCY_SIGNAL_REFRESH_2026_05_07.md) — orientation refresh covering why Agency Signal had been getting overlooked.

**This is the new session's bootstrap doc.** When the dedicated Agency Signal Claude Code session opens, this is the file it should read after `docs/STATE.md` to understand its scope, boundaries, and coordination rules with the other two tandem sessions.

---

## Why this dedicated session exists

Agency Signal has been live in production at https://directory.seven16group.com since session 14 (2026-05-01) and **hasn't shipped app code in 11 days** (last commit `8829d38`, 2026-04-27). Reason: every Claude Code session 15-20 has been DOT Intel mid-May demo prep, and a parallel session has been driving Threshold IQ. Agency Signal had no dedicated owner.

Master O is now spinning up a **dedicated Agency Signal session** — same pattern Threshold IQ uses (`seven16-distribution`). Three tandem Claude Code sessions running in parallel:

| Tandem session | Working repo | Live URL | Owns |
|---|---|---|---|
| **DOT Intel** | `dotintel2` | dotintel.io | Demo prep, post-demo D2, FMCSA data |
| **Threshold IQ** | `seven16-distribution` | staging.thresholdiq.io | MGU/wholesaler CRM, Phase A/B/C/D/E roadmap |
| **Agency Signal** (this session) | `saas-agency-database` | directory.seven16group.com | Agency directory, deferred items, Stripe cutover |

Each has its own `docs/STATE.md` inside-view. Each writes its own handoffs. The family ledger lives in this repo's `docs/context/` and is shared.

---

## What this session OWNS

### Code + infrastructure
- **Repo:** `gtminsightlab-cmd/saas-agency-database` (public)
- **Live URL:** https://directory.seven16group.com (planned cutover to agencysignal.co)
- **Vercel project:** `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV` ("saas-agency-database") on team `team_RCXpUhGENcLjR2loNIRyEmT3`
- **Supabase satellite:** `sdlsdovuljuymgymarou` (project name `seven16group`, us-east-1, pg 17.6.1.105)
- **Stripe sandbox:** `acct_1TLUF6HmqSDkUoqw` ("DOT Intel sandbox" — name is stale, account is shared)

### Data
- 20,739 agencies / 87,434 contacts / 191,201 carrier appointments
- 1 tenant (Seven16, default `ce52fe1e-aac7-4eee-8712-77e71e2837ce`)
- 1,366 insurance carriers (NOT motor carriers)
- 13 admin modules (admin shell + Catalog editor live; 9 partial/backlog)
- Migrations 0001–0083 (repo + DB synced)

### Documentation surfaces this session writes to
- `docs/STATE.md` — Agency Signal inside-view
- `docs/handoffs/AGENCY_SIGNAL_SESSION_N_HANDOFF.md` — its own handoff series (this file = N=1)
- `docs/context/SESSION_STATE.md` **Part 1 only** — Agency Signal section of the family ledger
- `docs/playbooks/` — when Agency Signal-specific playbooks need to land
- `app/` `components/` `supabase/migrations/` — code

---

## What this session does NOT touch

These are owned by sibling sessions or the family hub session. **Coordinate, don't cross.**

| Surface | Owner |
|---|---|
| `dotintel2/*` (code, docs, migrations) | DOT Intel session |
| `seven16-distribution/*` (code, docs, migrations) | Threshold IQ session |
| `dotintel-intelligence/*` | Parked — do not touch |
| Supabase project `vbhlacdrcqdqnvftqtin` (DOT Intel) | DOT Intel session |
| Supabase project `yyuchyzmzzwbfoovsskz` (Threshold IQ) | Threshold IQ session |
| Supabase project `soqqmkfasufusoxxoqzx` (seven16-platform) | Family hub session (Sprint 1C work) |
| `docs/context/SESSION_STATE.md` Parts 0, 0.5, 2 | Family hub / DOT Intel / Threshold IQ session |
| `docs/context/MASTER_CONTEXT.md` | Family hub session (architectural changes) |
| `docs/context/DECISION_LOG.md` | Family hub session — but **read-write OK if a new D-NNN entry is needed** for an Agency Signal architectural decision |
| `docs/playbooks/dotintel_*.md` | DOT Intel session |
| `docs/handoffs/SESSION_NN_HANDOFF.md` (numeric, family-wide) | Family hub session |

**Cross-product migrations:** never cross between the three Supabase projects. If a question arises about, e.g., joining Agency Signal contacts to DOT Intel carriers, do it in code at the application layer, not via Supabase foreign data wrappers or shared schemas. (Per D-008.)

**If you need a sibling session's data:** ask Master O. He'll either tell the sibling session to do it, or copy-paste the data over.

---

## Coordination rules with the tandem sessions

1. **Read before writing.** Before modifying anything, read:
   - `CLAUDE.md` (auto-loaded)
   - `docs/STATE.md` (Agency Signal inside-view)
   - `docs/context/SESSION_STATE.md` (family ledger — Part 1 is yours; Parts 0/0.5/2 are read-only)
   - `docs/context/DECISION_LOG.md` (D-001 → D-011)
   - `docs/handoffs/AGENCY_SIGNAL_SESSION_<N-1>_HANDOFF.md` (most recent dedicated handoff)
   - `~/.claude/projects/.../memory/MEMORY.md` (auto-loaded)

2. **Don't relitigate.** D-001 through D-011 are locked. Carolina Casualty 75+ PU, Berkley Prime extension, and ISC↔Berkley wiring are CANCELLED — closed scope.

3. **Update STATE.md every state-changing session.** Bump the date at the top, update the "Latest commit" pointer, document any new known issues. Mirror DOT Intel's discipline.

4. **Family ledger updates:** when you change DB counts, deployment state, or Agency Signal deferred items, update `docs/context/SESSION_STATE.md` **Part 1 only**. Other parts are read-only from this session.

5. **Cross-session needs:** if the user asks for something that touches a sibling session's domain (e.g., "show me how DOT Intel carriers join to Agency Signal agencies"), DO the join via SQL in your own session, but **don't push code changes into the sibling repo**. If sibling-repo changes are needed, surface that to Master O and let him route to the right session.

6. **Naming convention:** numeric SESSION_NN_HANDOFF files are family-wide chronological handoffs (currently up to SESSION_20). Your handoffs are `AGENCY_SIGNAL_SESSION_N_HANDOFF.md` — increment N each session. This keeps your chain separate.

7. **Migrations:** apply via Supabase MCP **with explicit `project_id="sdlsdovuljuymgymarou"`** — never assume. Sync each migration into `supabase/migrations/` so the repo and DB stay aligned.

---

## Pick a direction — options menu for the first dedicated session

Agency Signal has 14 deferred items in SESSION_STATE.md §1.5. They cluster into five tracks. Pick the track that matches your time budget + the user's intent.

### Track A — Production-readiness sweep (low risk, high value)
- (a1) Verify Stripe webhook still functional (signature-verified, `customer.subscription.updated` etc.)
- (a2) Run `get_advisors` on `sdlsdovuljuymgymarou` to baseline current security/performance findings (mirrors DOT Intel session 17's pre-launch security gate work)
- (a3) Verify all auth routes still redirect correctly post-`@supabase/ssr` updates
- (a4) Check live site for any 404s/500s in Vercel runtime logs over the last 7 days
- **Time:** ~1 session. Purely diagnostic — no schema changes, no deploys unless something is broken.

### Track B — Stripe sandbox → production cutover prep (gated on first paying customer)
- (b1) Document the exact production-Stripe wiring sequence (env vars, webhook endpoint registration, price ID swap)
- (b2) Build a feature flag or env-var toggle so the cutover can happen with one push
- (b3) Pre-flight checklist (TOS link, privacy policy, refund policy, contact email)
- **Time:** ~1 session. **Don't actually flip the switch** until a customer is ready — that's a Master-O-driven step.

### Track C — Contacts load for the 8 session-12 vendor files (data growth)
- 8 xlsx files were loaded for agencies + carriers in session 12 but contacts were deferred (option B at the time)
- Each row has FirstName / LastName / Title / CEmail — would feed the `contacts` table and could grow it from 87,434 → ~95K+
- **Time:** ~1 session. Largest single deferred-item win on the list.

### Track D — Trust copy + Hygiene Credit rollout
- Copy is locked (DECISION_LOG.md §3) — held since sessions 9-10
- Refresh language ("Two of the top 10 B2B intelligence platforms" / "Dual-Agent Verification Pipeline" / "2× per year refresh")
- Hygiene Credit: auto-discount month 6 + 12 of Growth Member by 10%
- Wire in Stripe Subscription Schedule (or programmatic coupon) — currently NOT WIRED
- **Time:** ~1-2 sessions (copy + Stripe wiring). **Trigger:** data inventory matches scale claims; check counts before pushing.

### Track E — Domain cutover (directory.seven16group.com → agencysignal.co)
- `agencysignal.co` is reserved on Cloudflare but not yet wired
- Need: Cloudflare DNS records (A/CNAME → Vercel), Vercel custom domain config, Supabase Auth allowlist update, redirect from old URL
- **Time:** ~30 min if Cloudflare zone + Vercel are ready. Mostly Master O at dashboards.

### Wildcard — Master O picks something else
If Master O has a specific Agency Signal task in mind that doesn't match any track above, do that. The deferred-items list (#1-#14 in §7 of `docs/STATE.md`) is a starting menu, not a constraint.

---

## Open questions parked (carry contextually, don't surface unless relevant)

These are tracked across the family — surface only when the relevant work starts:

1. **Directory domain strategy** — when building/naming the Agency Marketplace Directory specifically (Phase 3, Oct 2026)
2. **First Light + Maximum account_type reclassification** — cosmetic; carry from session 11
3. **8 empty verticals** (added migration 0051) — need data + carrier mapping per vertical
4. **WRB.xlsx vs AdList-17028.xlsx duplicate confirmation** — verify content not filename when loading
5. **Pre-existing advisor cleanup** (`_trucking_load_log` RLS, 84 SECURITY DEFINER warnings, extension-in-public) — backlog, not session-introduced

---

## Standing rules (carry-forward from family DECISION_LOG.md §6)

- Plugins-first, escalate to Master O last (Supabase / Vercel / Stripe MCPs available)
- Explain like 5 for any clicks/typing — non-developer founder
- Native git from this canonical clone outside OneDrive (`C:\Users\GTMin\Projects\saas-agency-database\`)
- Secrets never in chat — clipboard → dashboard or local-file-then-script only
- Cancelled = closed scope (do not reopen)
- Carrier search uses fuzzy/strong match (pg_trgm), not exact
- Pricing copy is placeholder until data inventory catches up — don't propose revisions to scale claims without checking counts
- Canary + dedupe + dry-run on every external data load
- Exhaustive handoffs (chronological log + migrations + commits + identifiers + lessons + opening move)
- Pre-launch security gate before any outsider sees a Seven16 product
- For any anon-submission form: scope INSERT policies to `{anon, authenticated}`, not `{anon}` alone
- Never commit demo credentials in plaintext

---

## Verification checklist when ending the first dedicated session

- [ ] STATE.md bumped — Last-updated date + Latest-commit pointer + any new known issues
- [ ] Family ledger SESSION_STATE.md Part 1 updated if DB counts / deployment state / deferred items changed
- [ ] `AGENCY_SIGNAL_SESSION_2_HANDOFF.md` written with chronological log + commits + migrations + lessons + paste-ready opening move for session 3
- [ ] Vercel auto-deploy verified READY (not ERROR) before declaring done
- [ ] No unintended file edits in OneDrive working dirs (use absolute paths to `C:\Users\GTMin\Projects\saas-agency-database\`)
- [ ] No secrets pasted in chat
- [ ] Sibling sessions (DOT Intel, Threshold IQ) untouched

---

## End of inception handoff

The dedicated session begins on the next paste-prompt. Welcome.

— end AGENCY_SIGNAL_SESSION_1_HANDOFF —
