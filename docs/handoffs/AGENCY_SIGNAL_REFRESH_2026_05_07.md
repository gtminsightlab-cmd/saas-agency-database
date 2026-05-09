# Agency Signal Refresh Handoff — 2026-05-07

**Why this doc exists:** Agency Signal (the live production product at https://directory.seven16group.com) has been getting overlooked. Every session since 2026-04-27 has been DOT Intel demo prep (sessions 15→20) or Threshold IQ work (parallel sessions). Master O flagged today: *"https://directory.seven16group.com/ has been forgotten in future sessions, are you able to update a current claude about this project? A full handoff?"*

This is not a "things changed" handoff — it's an **orientation refresh** for any future Claude session that needs to understand Agency Signal's current state. Read this when you open this repo and the most recent SESSION_N_HANDOFF is DOT-Intel-only.

**Audience:** any future Claude session. Read this in addition to (not instead of) `docs/STATE.md` and `docs/context/SESSION_STATE.md` Part 1.

---

## TL;DR — three sentences

1. Agency Signal is **live and healthy** at https://directory.seven16group.com (HTTP 200, ACTIVE_HEALTHY Supabase, READY Vercel deploy at commit `ae73d78`).
2. **No app code has shipped since 2026-04-27** (commit `8829d38`, 11 days silent) — every commit since then is migration sync or family-ledger docs churn from DOT Intel demo prep.
3. Database holds **20,739 agencies, 191,201 carrier appointments, 87,434 contacts** across one tenant (Seven16). No active work in flight. No paying customer yet (Stripe still sandbox).

---

## What's NOT happening (so future sessions don't worry)

- **No bugs reported.** Live site has been up the whole time.
- **No regressions.** Migrations 0001–0083 are repo+DB synced as of session 13.
- **No security incidents.** Service-role key was rotated session 13 (Tier 0a) after a leak; advisor warns are pre-existing backlog, not active.
- **No customer-facing changes pending.** Trust copy + Hygiene Credit are locked but **held for rollout** — they wait for data inventory to support the claims.

---

## What IS true today (full state)

### Live URLs

| What | URL | Status |
|---|---|---|
| Production app | https://directory.seven16group.com | ✅ HTTP 200 |
| Future cutover | agencysignal.co | 🟡 reserved, not wired |
| GitHub | https://github.com/gtminsightlab-cmd/saas-agency-database (public) | — |

### Infrastructure

| Item | Value |
|---|---|
| Vercel project | `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV` ("saas-agency-database") on team `team_RCXpUhGENcLjR2loNIRyEmT3` |
| Latest deploy | `dpl_BbyPFC6TYovvoQFzqrGzGiZLV7GL` (commit `ae73d78`) READY |
| Supabase satellite | `sdlsdovuljuymgymarou` (project name `seven16group`, us-east-1, pg 17.6.1.105) ACTIVE_HEALTHY |
| Supabase organization | `ommujdigmtnmqkxahfgc` |
| Default tenant | `ce52fe1e-aac7-4eee-8712-77e71e2837ce` (slug `seven16`) |
| Canonical clone | `C:\Users\GTMin\Projects\saas-agency-database\` (native git, GCM auth, outside OneDrive) |
| Stack | Next.js 14 App Router · React 18 · TypeScript · Tailwind · `@supabase/ssr` · Stripe v17 · Vercel · Cloudflare DNS |
| Last app code commit | `8829d38` (2026-04-27) — 11 days silent |
| Migrations live | 0001–0083 (repo + DB in sync) |
| Stripe | Sandbox `acct_1TLUF6HmqSDkUoqw`. Two products live (Growth Member $99/mo + One-Time Snapshot $125). Webhook signature-verified. Live cutover gated on first paying customer. |

### Data corpus

| Table | Rows | Coverage |
|---|---:|---|
| `public.agencies` | **20,739** | 79% email · 85% web · 99% phone · 41% LinkedIn · 83% revenue · 92% employees |
| `public.contacts` | **87,434** | 84% email_primary · 23% mobile · 85% title |
| `public.agency_carriers` | 191,201 | Appointments per agency |
| `public.agency_sic_codes` | 92,957 | Industry codes |
| `public.agency_affiliations` | 7,748 | UIIA / IIABA / etc. |
| `public.carriers` | 1,366 | Insurance carriers (NOT motor carriers) |

Most-recent agency added: **2026-04-27** (consistent with "no recent loads" since DOT Intel focus shift).

---

## Family context (so this doesn't get re-orphaned)

Agency Signal is **one of three live or staging Seven16 products**. If a session opens this repo and only sees DOT Intel handoffs, here's the rest:

| Product | URL | Repo | Supabase | State |
|---|---|---|---|---|
| **Agency Signal** (this repo) | directory.seven16group.com | saas-agency-database | sdlsdovuljuymgymarou | ✅ Live in production |
| **DOT Intel** | dotintel.io | dotintel2 | vbhlacdrcqdqnvftqtin | ✅ Live; mid-May working group demo prep |
| **Threshold IQ** | staging.thresholdiq.io | seven16-distribution | yyuchyzmzzwbfoovsskz | 🟡 Live staging; production cutover pending |
| **seven16-platform** (control plane) | n/a (DB only) | (no app yet) | soqqmkfasufusoxxoqzx | ✅ Sprint 1B closed (Tenants/entitlements/plans seeded) |
| **Seven16Recruit** | n/a (stealth) | not created | not created | ⏸️ Attorney-gated |

**Growtheon** is a third-party SaaS reseller — does NOT get a Seven16 satellite per D-010. Tracked in `seven16-platform.entitlements` only.

---

## Why Agency Signal has been quiet (the honest reason)

Three reasons stacked:
1. **DOT Intel mid-May demo (~5-6 days out as of today).** Working group demo for insurance agents and underwriters. Every session 15-20 has been demo polish, blocker fixes, or feature work (Premium Estimator shipped session 20).
2. **Threshold IQ Phase A+B in parallel.** Live staging spun up 2026-05-02. AI extraction primitive shipped Phase B item 2.
3. **No customer-driven pressure on Agency Signal.** Pre-revenue, pre-rollout-of-trust-copy, no bugs in flight. Steady-state production doesn't generate sessions.

**This is fine** — Agency Signal is the family's "production reference" while the newer products race to ship. But it means future sessions need an explicit pointer to keep it in mind, which is what this doc is.

---

## Active deferred items (carrying forward)

From SESSION_STATE.md Part 1 §1.5 — none have unblocked since session 14:

| # | Item | Trigger to unpause |
|---|---|---|
| 1 | Contacts load for the 8 session-12 vendor files | Ready any time — agencies + carriers loaded but contacts deferred |
| 2 | `account_type_id` backfill for the 634 new agencies | Source has AccountType field; needs mapping table |
| 3 | WRB.xlsx vs AdList-17028.xlsx duplicate confirmation | Verify content not filename |
| 4 | MiEdge confidence-tiered fuzzy matcher | Required for V5 parent-grain integration |
| 5 | V5 parent grain remediation | Cluster Supabase branches into synthetic parent rows |
| 6 | Retail trucking load (1,328 agents + appointments + contacts) | Python script from Master O's terminal |
| 7 | Phase 3 CMO rewrite (testimonials/customer logos) | Trigger: 2-3 paying customers |
| 8 | A/B test sweep (3 tests) | Trigger: 500+ visitors/week |
| 9 | **Stripe sandbox → production cutover** | Trigger: first paying customer |
| 10 | Hygiene Credit billing wiring | With trust-copy refresh |
| 11 | Trust copy refresh on live site | When data inventory matches scale claims |
| 12 | 8 empty verticals (added migration 0051) | Need data + carrier mapping per vertical |
| 13 | First Light + Maximum account_type reclassification | Cosmetic |
| 14 | Pre-existing advisor cleanup | Backlog |

---

## Likely next-active scenarios for Agency Signal

When this product comes back into active focus, expect one of these triggers:

1. **First paying customer surfaces.** → Stripe sandbox → production cutover (item #9). 1-2 sessions, mostly Master O at Stripe + Vercel dashboards.
2. **Sprint 1C ships across the family.** → This satellite joins the shared JWT runbook alongside DOT Intel + Threshold IQ. Auth migration runs alongside (not against) the existing Agency Signal auth, then cuts over.
3. **Family pricing collaborative session.** → Producer tier ($19) confirmation, Growth ($99) confirmation, possibly Hygiene Credit refresh.
4. **DOT Intel demo lands and signal returns** → Could trigger Agency Signal feature work informed by what working group asked for that's actually agency-side (e.g., "show me which agencies write Berkley") rather than carrier-side.
5. **Domain cutover** → directory.seven16group.com → agencysignal.co. Cloudflare-driven; ~30 min if the new zone is set up.

---

## How to check this is still current (next session opens here)

If this doc is more than 7 days old, run this preflight to verify nothing has drifted:

```bash
# 1. HTTP check
curl -sI https://directory.seven16group.com/ -o /dev/null -w "%{http_code}\n"
# Expect: 200

# 2. Git state
cd C:\Users\GTMin\Projects\saas-agency-database
git pull --ff-only
git log --oneline -1 main -- 'app/' 'components/'
# If commit is still 8829d38 → still silent. If newer → read that commit before assuming.

# 3. DB count check (via Supabase MCP)
# SELECT count(*) FROM agencies, contacts, agency_carriers
# Expect: 20,739 / 87,434 / 191,201 (or higher if a load happened)
```

If any of those drift, update `docs/STATE.md` and write a successor handoff.

---

## Standing rules (carry-forward, no changes)

All standing rules in `docs/context/DECISION_LOG.md` §6 still apply:
- Plugins-first, escalate to Master O last
- Explain like 5 for any clicks/typing
- Native git from canonical clones outside OneDrive
- Secrets never in chat
- Cancelled = closed scope (Carolina Casualty 75+ PU, Berkley Prime extension, ISC↔Berkley wiring — DO NOT REOPEN)
- Carrier search uses fuzzy/strong match (pg_trgm), not exact
- Pricing copy is placeholder until data inventory catches up
- Canary + dedupe + dry-run on every external data load
- Exhaustive handoffs

Family-wide rules added in sessions 16-18:
- Inside-view STATE.md per repo (this is Agency Signal's; was queued in session 16, finally shipped 2026-05-07)
- Pre-launch security gate before any outsider sees a Seven16 product (working-group demos count as launches)
- For any anon-submission form: scope INSERT policies to `{anon, authenticated}`, not `{anon}` alone
- Never commit demo credentials in plaintext

---

— end AGENCY_SIGNAL_REFRESH_2026_05_07 —
