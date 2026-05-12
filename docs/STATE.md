# Agency Signal — STATE.md (inside view)

**Last updated:** 2026-05-12 (Session 3: Next 14 → 16 / React 18 → 19 upgrade closing 24 CVEs + first real caching layer on /build-list + /verticals. UX-parity-with-Neilson polish on /build-list + /saved-lists. See [`docs/handoffs/AGENCY_SIGNAL_SESSION_3_HANDOFF.md`](handoffs/AGENCY_SIGNAL_SESSION_3_HANDOFF.md).)
**Companion to:** [`docs/context/SESSION_STATE.md`](context/SESSION_STATE.md) Part 1.
**Pattern source:** Inside-view STATE.md adopted family-wide 2026-05-02 — see `dotintel2/docs/STATE.md` and `seven16-distribution/docs/STATE.md` for parallel examples. Each product repo carries one. This file was queued in session 16, finally shipped 2026-05-07.

> Snapshot of where **Agency Signal** stands **right now**, written from inside this repo. Mirrors the family ledger's Part 1 from the inside; the two should agree. Update this file at end of every session that ships changes here.

---

## 1. Product position in the Seven16 family

Agency Signal is one of three platform products under Seven16 Group (D-001 / D-004). The other two: **DOT Intel** (live demo build at dotintel.io, in `dotintel2` repo) and **Threshold IQ** (live staging at staging.thresholdiq.io, in `seven16-distribution` repo).

Family rules that bind this repo:
- **D-006 / D-008** — shared auth, separate Supabase satellites. Agency Signal's satellite is `sdlsdovuljuymgymarou` (project name `seven16group`, us-east-1). Sprint 1C will fold this satellite into the shared JWT runbook when timing is right.
- **D-005** — 2027 Bundle: $179/mo Seven16 Intelligence = **DOT Intel Business + Agency Signal Growth**. Both products feed the bundle; Agency Signal is the producer-tier wedge ($19 Producer = the lead-with-the-little-guy bet locked in D-002).
- **D-008** — Agency Signal is the canonical "production reference" for the family's multi-product Supabase satellite topology. When future products onboard (Seven16Recruit, niche directories), the Agency Signal pattern is the template.

For the broader family + decision history, read `docs/context/{MASTER_CONTEXT,DECISION_LOG,SESSION_STATE}.md` before substantive work. Decisions D-001 through D-011 are locked.

This repo is also the **family hub** — the docs/context/ folder is the single source of truth for Seven16 family-wide state. Cross-product handoffs land in `docs/handoffs/`.

---

## 2. Live state

| Check | Value | Status |
|---|---|---|
| Live URL | https://directory.seven16group.com | ✅ HTTP 200 (verified 2026-05-07) |
| Future URL (cutover planned) | agencysignal.co | 🟡 Not yet wired — cutover unscheduled |
| Vercel project | `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV` (project name `saas-agency-database`) on team `team_RCXpUhGENcLjR2loNIRyEmT3` | Auto-deploys on push to `main` |
| Repo | `gtminsightlab-cmd/saas-agency-database` (**public**) | — |
| Canonical clone | `C:\Users\GTMin\Projects\saas-agency-database\` | Native git, GCM auth, outside OneDrive (per Sprint 0, session 14) |
| Stack | Next.js 14 App Router · React 18 · TypeScript · Tailwind · `@supabase/ssr` · Stripe v17 · Vercel · Cloudflare DNS | — |
| Supabase satellite | `sdlsdovuljuymgymarou` (project name `seven16group`, us-east-1, pg 17.6.1.105) | ✅ ACTIVE_HEALTHY |
| Latest production deploy | `dpl_CMTzDwjpMZ35AjCxgWQkCnVMcnSR` (commit `e16508f`) | ✅ READY, 33s Turbopack build |
| Last app code commit | `e16508f` (2026-05-12) — `perf(verticals, admin): cache mv_vertical_summary + wire cache invalidation` | Active development; session 3 shipped 12 commits |
| Stack version | **Next 16.2.6** (was 14.2.15) · **React 19.2.6** (was 18.3.1) · ESLint 10.3 · TypeScript 5.6 · Turbopack | Family-aligned (Threshold IQ 16.2.4, dotintel2 16.2.3) |
| npm audit | **0 critical** · 1 high (xlsx, no upstream fix, scripts/ only) · 2 moderate (postcss transitive) | Was 1 critical + 3 high pre-upgrade |
| Caching layer | `lib/cache/build-list-refs.ts` — 3 cached loaders, 2 invalidation tags, 1 admin-side invocation wired (CatalogEditor) | First real caching infra shipped this session |
| Default tenant | `ce52fe1e-aac7-4eee-8712-77e71e2837ce` (slug `seven16`) | — |

---

## 3. Database state (`sdlsdovuljuymgymarou`, tenant `ce52fe1e-aac7-4eee-8712-77e71e2837ce`)

| Table | Rows | Notes |
|---|---:|---|
| `public.agencies` | **41,705** | +20,966 in 2026-05-09 session 2 (17,638 from DOT Intel sync + 3,328 from AdList). Pre-session: 20,739 |
| `public.contacts` | **119,180** | **+31,746 from AdList load — the contact gap-fill** (DOT Intel sync added 0; source has no person data). Pre-session: 87,434 |
| `public.agency_carriers` | **212,378** | +21,177 in session 2 (13,914 from DOT Intel sync + 7,263 from AdList). Pre-session: 191,201 |
| `public.agency_sic_codes` | **99,764** | +6,807 from AdList load |
| `public.agency_affiliations` | **8,866** | +1,118 in session 2 (53 UIIA from DOT Intel + 1,065 from AdList — IIABA, Trusted Choice, etc.) |
| `public.carriers` | **1,369** | +3 Berkley regional OpCos (Southwest, Southeast, Mid-Atlantic) added migration 0085 |
| `public.affiliations` | 184 | +2 (UIIA migration 0086, TRS migration 0087) |
| `auth.users` | 2 | Master O + one other test/admin user |
| `public.tenants` | 1 | Single tenant (Seven16) — multi-tenant infrastructure shipped, no second tenant onboarded yet |

**Most-recent agency added:** 2026-05-09 (AdList vendor load via patched `scripts/load-adlist.ts` — 17 genuine xlsx files extracted from 3 zip archives)

**Canary scrub results (2026-05-09 AdList load):** 16 active canaries fired across 17 files, blocking the planted Neilson watermarks (Rocky Zito @ ABC Insurance, Bozzutoins Insurance Group, INpower Global Insurance Services, L.G.S. Insurance Brokerage, jeffneilson@programbusiness.com, and a name-match on Scott Neilson in 17076). Post-load scan: 0 live hits across all 16 patterns — clean.

**Carrier coverage highlights** (post 2026-05-09 sync):
- Liberty Mutual: **8,255** appointments (+4,207 from sync)
- Nationwide: **4,273** (+1,031)
- Chubb Group of Insurance Companies: **4,070** (+121)
- Zurich Insurance Company: **3,919** (+1,134)
- Selective: **2,935** (+1,937)
- Cincinnati Insurance Company: **2,572** (+891)
- Utica National: **2,090** (+1,258)
- Accident Fund Insurance Company of America: **1,912** (+1,586)
- Berkley regional OpCos (Southwest 374 / Southeast 320 / Mid-Atlantic 216) — net-new entries via migration 0085

**Sync method:** `sync_to_agency_signal.py` (lives in `scrapers/seven16-scraper/seven16-scraper/scripts/` outside this repo). Multi-signal cascade dedup (email → web → phone+state → name+state+zip5 → addr+state+zip5) with verification gates on web (state match + name-sim ≥ 0.5 with filler-stripped names) and addr_state_zip (name-sim ≥ 0.5). Refactored 2026-05-09 to read creds from `.env` (formerly hardcoded).

---

## 4. What shipped historically (pre-silent-period)

Active feature work spanned sessions 4–14. Highlights:

| Session | Theme | Migration range |
|---|---|---|
| Session 5 | RLS initplan opt = 485× speedup | 0033–0036 |
| Session 6+7 | 13 admin modules dark-themed (admin shell + Catalog editor) | 0037–0046 |
| Session 8 | AI Support page at `/ai-support` (pg_trgm + RPC) | 0047 |
| Session 9 | Multi-seat invitations (3 seats on paid plans, auto-flip on auth) | 0055 |
| Session 10 | `/analytics/carriers` + V5 grain finding | 0057–0069 |
| Session 11 | Berkley operating-units mapping + 13 wholesalers + ISC fix | 0070–0082 |
| Session 12 | 8-file vendor xlsx load: 634 new agencies + 3,819 carrier appointments | 0083 |
| Session 13 | Tier 0 cleanup: rotated leaked service-role key, synced 27 migrations from live DB to repo, added D-008, saved 4 context docs | (sync) |
| Session 14 | Sprint 0: working clone moved out of OneDrive, native git with GCM auth, CLAUDE.md added | — |
| Dedicated 1 (2026-05-08) | Inception of Agency Signal dedicated session track | — |
| Dedicated 2 (2026-05-09) | DOT Intel → AS sync: 17,638 agencies + 13,914 carrier appts + 53 UIIA affiliations. Cascade dedup w/ name-sim gates. 4 migrations (canary, Berkley OpCos, UIIA, TRS) | 0084–0087 |
| Dedicated 2 cont. (2026-05-09) | AdList vendor load: 17 genuine xlsx files (3 zips) loaded via patched `scripts/load-adlist.ts`. **+31,746 contacts** (the contact gap-fill goal), +3,328 agencies, +7,263 carrier appts, +1,065 affiliations, +6,807 SIC links. 100% canary scrub success across 16 patterns. Loader bug fixed: drop server-managed columns + within-batch dedupe on (tenant_id, account_id) | — (no DDL) |

**Migrations live: 0001–0087**. Repo + DB in sync as of 2026-05-09.

---

## 5. Stripe (sandbox)

| Item | Value |
|---|---|
| Account | `acct_1TLUF6HmqSDkUoqw` ("DOT Intel sandbox") |
| Growth Member ($99/mo) | `price_1TPxtFHmqSDkUoqwRvnHOqhx` |
| One-Time Snapshot ($125) | `price_1TPxtHHmqSDkUoqwXa3zfPOV` |
| Routes shipped | `/api/stripe/checkout` (GET) · `/api/stripe/webhook` (POST, signature-verified) |
| Vercel env vars | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` — all set + verified session 13 (Tier 0e) |
| Webhook endpoint to register | `https://directory.seven16group.com/api/stripe/webhook` for events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` |
| Live cutover | 🟡 Pending — trigger is first paying customer ready to convert |

---

## 6. 13 admin modules (Catalog editor / Hygiene & Refresh / etc.)

Fully spec'd in memory `project_admin_control_center_spec.md`. All 13 modules have Live page routes per session 7. Build-out priority order:

| # | Module | Status |
|---|---|---|
| 1 | Layout shell | ✅ done |
| 2 | Overview KPI strip | ✅ done |
| 3 | Catalog editor | ✅ done |
| 4 | Hygiene & Refresh | 🟡 partial |
| 5 | System Health | 🟡 partial |
| 6 | Customers + Billing | 🟡 partial |
| 7 | Data Engine sources | ⏸️ backlog |
| 8 | Pipelines visual | ⏸️ design-heavy, deferred |
| 9 | Search Analytics + debug ranking | ⏸️ defer until usage data exists |

---

## 7. Deferred items (Agency Signal carry-forward)

Carried from session 12 §5 + standing backlog. Each waits on a trigger:

| # | Item | Trigger to unpause |
|---|---|---|
| 1 | Contacts load for the 8 session-12 vendor files | Ready any time — would feed `contacts` from FirstName/LastName/Title/CEmail per row |
| 2 | `account_type_id` backfill for the 634 new agencies | Source has `AccountType` field; needs mapping table joined and updated |
| 3 | WRB.xlsx vs AdList-17028.xlsx duplicate-file confirmation | Likely the same export saved twice — verify content not filename |
| 4 | MiEdge confidence-tiered fuzzy matcher | Carry from session 10 — required for V5 parent-grain integration |
| 5 | V5 parent grain remediation | Cluster Supabase branches into synthetic parent rows; populate `agencies.parent_agency_id` |
| 6 | Retail trucking load (1,328 agents + appointments + contacts) | Needs Python script run from Master O's terminal |
| 7 | Phase 3 CMO rewrite (testimonials/customer logos) | Trigger: 2-3 paying customers |
| 8 | A/B test sweep (3 tests) | Trigger: 500+ visitors/week |
| 9 | **Stripe sandbox → production cutover** | Trigger: first paying customer ready to convert |
| 10 | Hygiene Credit billing wiring | Stripe Subscription Schedule with phased pricing OR programmatic coupon at month 6 + 12 |
| 11 | 8 empty verticals (added migration 0051) | Need data + carrier mapping per vertical |
| 12 | First Light + Maximum account_type reclassification | Cosmetic; carry from session 11 |
| 13 | Pre-existing advisor cleanup (`_trucking_load_log` RLS, 84 SECURITY DEFINER warnings, extension-in-public) | Backlog — pre-existing, not session-introduced |

---

## 8. Trust copy + Hygiene Credit (held for rollout)

Copy locked sessions 9-10 but **not yet shipped to the live site**. Roll out when data inventory catches up to the claims. Full mechanics in `docs/context/DECISION_LOG.md` §3.

| Element | Locked language | Status |
|---|---|---|
| Enrichment sourcing | "Two of the top 10 B2B intelligence platforms" + "LinkedIn data via licensed enrichment partners" | 🔒 not shipped |
| AI discovery | "Dual-Agent Verification Pipeline" (NOT "Twin AI agents") | 🔒 not shipped |
| Refresh cadence | 2× per year, paired with Hygiene Credit | 🔒 not shipped |
| Hygiene Credit | Auto-discount month 6 and 12 of Growth Member by 10% ($89.10 instead of $99). Marketed as loyalty reward, NOT data-decay compensation. | 🔒 not shipped, not wired in Stripe |

---

## 9. Sister product cross-references

When Agency Signal work intersects with the family:

- **DOT Intel** (`dotintel2`, dotintel.io) — carrier intelligence platform with FMCSA data. Currently in mid-May working group demo prep. Sister product per D-005 (bundle target). Coverage amounts ETL just completed (session 19); Premium Estimator module shipped (session 20).
- **Threshold IQ** (`seven16-distribution`, staging.thresholdiq.io) — MGU/wholesaler operating CRM. Live staging. Phase A foundation + Phase B item 2 (AI extraction) shipped.
- **seven16-platform** (`soqqmkfasufusoxxoqzx`) — control plane for tenants/entitlements/auth federation. Sprint 1B closed session 14. Sprint 1C (shared JWT) is the next family-level move; would fold this satellite into shared auth.

For an enrichment workflow that joins Agency Signal contacts to DOT Intel carriers (e.g., "find agencies in TX with email + LinkedIn that write transportation"), use the trigram match strategy in memory `reference_agency_signal_database.md`. ~70% match rate on state + similarity > 0.5 in trigram space.

---

## 10. What's next

**No active feature work scheduled.** Agency Signal has been in steady-state production for 11 days while DOT Intel demo prep dominated focus. Next active sessions will likely be:

1. **Post-DOT-Intel-demo:** family-wide pricing collaborative session (carry from session 16) — Threshold IQ + Growtheon + Seven16Recruit pricing, may also revisit Agency Signal's Producer tier.
2. **Sprint 1C (JWT/Doppler/Sentry):** when ready, this satellite joins the shared-auth runbook alongside DOT Intel and Threshold IQ.
3. **Stripe production cutover:** first paying customer triggers the sandbox → live transition.
4. **Trust copy + Hygiene Credit rollout:** when data inventory supports the claims.
5. **Domain cutover:** `agencysignal.co` is reserved but not wired. Schedule when comfortable with DNS choreography.

---

## 11. Standing rules in effect (from family `DECISION_LOG.md` §6)

- Plugins-first, escalate to Master O last.
- Explain like 5 for any clicks/typing — non-developer founder.
- Native git from this canonical clone outside OneDrive. GCM caches creds — no per-session PAT dance.
- Secrets never in chat — clipboard → dashboard or local-file-then-script only.
- Cancelled = closed scope (Carolina Casualty 75+ PU, Berkley Prime extension, ISC↔Berkley wiring — all CLOSED, do not reopen).
- Carrier search is fuzzy/strong-match (pg_trgm), tolerant of Inc/Corp/Co suffix variants.
- Pricing copy is placeholder until data inventory catches up — don't propose revisions to scale claims (100k producers, 70% email density, etc.) without checking counts.
- Canary filter + dedupe + dry-run on every external data load.
- Handoffs must be exhaustive — chronological log + migrations + commits + identifiers + lessons + opening move.

---

— end Agency Signal STATE.md —
