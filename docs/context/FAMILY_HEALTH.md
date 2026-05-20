# Seven16 Family Health Snapshot

**Last refresh:** 2026-05-20 (saas-agency-database Session 30 close — Sessions 27-32 epic at **4 of 6 slices SHIPPED.** Tonight's outing across one conversation: Session B-close (Texas DOI 367k row load), Session C (Seven16 Group Support readiness for Agency Signal), Session D (`/home` dashboard + `/verticals/[slug]` polish per Path A audit divergence), Flag 2 (admin/verticals manager React 19 refactor), Session 29 (Build Recruit List chrome + lint sweep), Session 30 (Exports + Agency Search + AI Research Assistant chrome). 5 production deploys all verified READY. Lint progression 42 → 11 (-31, 74% reduction). Audit-first pattern now load-bearing — Session 28: 30% under estimate; Session 29: 30% under; Session 30: 65% under. Major scope flag captured: "4-tab Agency Search" from CMO brief 2 is a feature build (not chrome polish) — `/quick-search` currently a placeholder form; queued as separate ~6-8 hr session at BACKLOG #2. Latest commit `b5519a4`; deploy `dpl_tybMUW98RXKK7YLkiFyeUSasvkH1` READY at directory.seven16group.com (38s build). Next: SESSION_31 — Data Coverage + Methodology + Resources + Team. Paste-ready opener at `SESSION_G_PROMPT.md`.<br>Prior 2026-05-19 seven16-group-site Session 3 close — Support-platform integration readiness SHIPPED at `partners.seven16group.com` (commits `64e3cf0` + `e591b8d`). Architectural rule LOCKED: support-INTEGRATABLE not support-DEPENDENT.)
**Mechanism source:** [`ANTI_DECAY_PROTOCOL.md`](ANTI_DECAY_PROTOCOL.md) Mechanism #1
**Update cadence:** at the close of any family-touching session per Working Agreement Rule 5 sub-bullet.

> One screen. All repos. Status colors so drift is visible before it bites. Cross-product dependencies tracked explicitly so an item in one repo doesn't quietly block another.

---

## Per-repo snapshot

| Repo | Last commit | Days since session | Active arc | Days in-flight | Queue depth | Health |
|---|---|---|---|---:|---:|:-:|
| **saas-agency-database** | 2026-05-20 `b5519a4` (5 commits one conversation: `444eeb3` C, `802e516` D, `6dae093` Flag 2, `7ad68cf` 29, `b5519a4` 30 — all deploys READY) | 0 (Session 30 close) | (AS) **Sessions 27-32 epic 4 of 6 SHIPPED.** Tonight added: Session C support readiness + Session D `/home` dashboard + `/verticals/[slug]` polish (Path A) + Flag 2 manager.tsx refactor + Session 29 Build Recruit List chrome + Session 30 Exports/Agency Search/AI Research polish. Audit-first now load-bearing (28: -30%, 29: -30%, 30: -65% vs prompts). Lint 42 → 11 (-31). Plus: Session B Texas DOI load (367k appointment rows + 16,785 new TX agencies + 638 new carriers). `mv_vertical_summary` refreshed mid-Session D — Agriculture 11,149 / Transportation +37% / Real Estate 2,521. Next: SESSION_31 (Data Coverage + Methodology + Resources + Team) per `SESSION_G_PROMPT.md`. | 0 (AS) | 15 queue items (NEW: Session 29.5 home v1 personalization + Quick Search 4-tab feature build) + 2 epic-sessions remaining | 🟢 |
| **seven16-group-site** | 2026-05-19 `e591b8d` (2 commits Session 3, Vercel READY) | 0 (Session 3 close) | Holding-company site + parent-owned partner program hub. Sessions 1+2 shipped: `seven16group.com` + `partners.seven16group.com` live, public `/apply` end-to-end verified, admin RBAC + magic-link sign-in + approve/reject UI live, 4 per-product landing pages, short URL `/r/[code]`. **Session 3 shipped support-integration readiness** (6 env vars + lib + 4 API stubs + widget placeholder; commits `64e3cf0` + `e591b8d`). 26 routes total. 14 DB migrations on shared `seven16-platform` Supabase. | 0 | Next options: admin user-management UI / branded Supabase auth emails / cross-repo readiness pass | 🟢 |
| **dotintel2** | 2026-05-15 `6722f2d` | 1 (SESSION_29 close 2026-05-14) | Sub-arc 3A close — SODA-based CSA ingest pipeline (`scripts/csa-ingest-soda.ts` + percentile recompute migration + `/methodology` disclosure). Prep artifact ready at `saas-agency-database/docs/cross-repo/dotintel2_SESSION_30_ARTIFACT.md` | 2 | 9 | 🟢 |
| **seven16-platform** | n/a — no code repo yet (Supabase project `soqqmkfasufusoxxoqzx` now serves as the parent control plane backing seven16-group-site) | n/a | Sprint 1C (shared JWT/Doppler/Sentry runbook across satellites) — not started | n/a | n/a | 🟡 |
| ~~seven16-distribution~~ | ~~2026-05-15 `035c7ce`~~ | n/a — **SPUN OUT per D-022** | **Repo scheduled for wind-down** (Vercel project delete + GitHub archive + Supabase pause + Cloudflare DNS decision in a "TIQ wind-down" follow-up session). Not on the family-active roster. | n/a | n/a | ⚫ Spun out |

**Health legend:** 🟢 Active (touched ≤7d) · 🟡 Slow (8–30d or skeleton-only) · 🟠 Stale (31–60d) · 🔴 At-Risk (>60d) · ⚫ Spun out (no longer family-active, scheduled for wind-down)

**Aging-bucket note (v1 caveat):** Queue counts shown as totals only. Per-item aging buckets (0–7d / 8–30d / 31–60d / 61–90d / >90d) will populate when ANTI_DECAY_PROTOCOL Mechanism #2 (Stale Detection Convention — `[YYYY-MM-DD]` timestamps on every Queued item) lands in each repo's next session. All current items effectively in the 0–7d bucket since the BACKLOG.md system bootstrapped 2026-05-15 across the family.

---

## Items requiring attention this week

- **`[ACTION] TIQ wind-down session`** — separate ~30-min follow-up session to delete Vercel project `prj_c6kzFEhpw6Uwb12TECUidKlBxOwr`, archive GitHub repo `gtminsightlab-cmd/seven16-distribution` (recommend archive, not delete — preserves git history if Master O wants to reference TIQ code patterns for the separate CRM/AMS he's building outside the family), pause or delete Supabase project `yyuchyzmzzwbfoovsskz`, decide Cloudflare `thresholdiq.io` DNS fate, clean any TIQ-tagged Stripe sandbox products, delete Desktop launcher `Open Claude — Threshold IQ.bat`. Not blocking; do when bandwidth allows.
- **`[ACTION] dotintel2 SESSION_30 ready to launch`** — prep artifact drafted SESSION_24 tail under Rule 2(b): [`docs/cross-repo/dotintel2_SESSION_30_ARTIFACT.md`](../cross-repo/dotintel2_SESSION_30_ARTIFACT.md). Contains the paste-ready SESSION_30 prompt + full SODA ingest script draft + 2 migration drafts + testing protocol. Master O opens dotintel2 SESSION_30 and pastes §C as the first message.
- **`[ACTION] dotintel2 dangling state`** — uncommitted in `dotintel2/`: `.gitignore` modified, `docs/SESSION_28_PROMPT.md` modified, 3 untracked files (`docs/KILLING_COMMERCIAL_TRAINING_HUB.md`, `docs/TRAINING_HUB_SESSION_HANDOFF.md`, `scripts/_mcp-mirror-helper.ts`). The two `*TRAINING_HUB*` docs were dropped in by a parallel "Killing Commercial" project session on 2026-05-13. **Cleanup steps documented in cross-repo artifact §A.** Resolve at dotintel2 SESSION_30 open.
- **`[ACTION] Charter Member outreach`** — Stripe SKUs now LIVE in sandbox (D-021 catalog shipped SESSION_25 2026-05-18). Remaining blockers: (a) **Master O dashboard action — register Stripe webhook endpoint** at `https://directory.seven16group.com/api/stripe/webhook` for `checkout.session.completed` / `customer.subscription.*` / `invoice.paid` / `invoice.payment_failed` (Stripe MCP can't manage webhooks per `feedback_stripe_mcp_webhook_dashboard_only.md`); (b) deck content rebuild slide-9/10 (TIQ removed from surfaces grid) + slide-18 recalc with new $1,500/yr baseline.
- **`[ACTION] Master O — set CRON_SECRET in Vercel`** — STILL PENDING from SESSION_25. Daily 04:00 UTC cron for saved-list refresh (Pillar 6 BACKLOG #1) requires `CRON_SECRET` env var. Generate `openssl rand -base64 32`, Vercel dashboard → Settings → Env Variables → Add new (Sensitive, Production). Without this the cron returns 500 daily and no snapshots get written.
- **`[ACTION] Master O — fix Sentry release-upload token`** — STILL PENDING from SESSION_25. Every deploy logs `Invalid org token (401)` on the @sentry/nextjs After Production Compile step. Non-fatal (deploy succeeds) but spam in build logs. Sentry dashboard → rotate org token → set `SENTRY_AUTH_TOKEN` in Vercel.
- ~~**`[ACTION] D-024 apply-on-touch backlog`**~~ → **SHIPPED Sessions D + 29** (`app/sign-up/form.tsx` 2× anchor-is-valid swapped to span; `app/global-error.tsx` html-has-lang fixed Session D; `eslint-plugin-react-hooks` installed Session D — surfaced additional pre-existing violations subsequently swept Session 29 + Flag 2 cleanup). Lint 42 → 11 across all 5 commits tonight; remaining 11 errors all in untouched files, queued for apply-on-touch when those files next change.
- **`[ACTION] DECISION_LOG §4 BindLab amendment`** — Master O clarified at SESSION_26 close 2026-05-18 that Seven16 Group holding company owns Agency Signal + BindLab + DotIntel. DECISION_LOG §4 currently lists BindLab as retired/spun-out, which is now incorrect. ~5-10 min doc edit at next family-hub session: reframe BindLab as family-active under Seven16 Group, separate from AS functionally per SESSION_25 prior directive.
- **`[FAMILY DOCTRINE - LOCKED]` Seven16 Group Partner Program integration** — locked 2026-05-18 by Master O at SESSION_26 close. Parent hub at `partners.seven16group.com` **shipped Session 1 (2026-05-19)** in `seven16-group-site` repo. Public `/apply` + admin review surface live. **DO NOT build standalone referral/affiliate/partner/commission systems inside any product.** Per-product PRODUCT_KEY: `agency_signal` / `dotintel` / `dotagencies` / `bindlab`. Full doctrine at family memory [`project_seven16_partner_program.md`](C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\project_seven16_partner_program.md). Surface in every session opening that touches referrals / affiliates / partners / commissions / coupon-as-reward / sign-up attribution.
- **`[FAMILY DOCTRINE - LOCKED]` Seven16 Group Support integration readiness** — locked 2026-05-19. Centralized support platform at `seven16groupsupport.com` not yet built. Each product satellite ships a Stage-1 readiness pass (6 env vars + null-render widget + safe-context lib + events lib + 4 API stubs + readiness doc). **Architecture rule: support-INTEGRATABLE, not support-DEPENDENT.** **Shipped:** Agency Signal (Session C, 2026-05-19) + seven16-group-site (Session 3, 2026-05-19, commits `64e3cf0`+`e591b8d`). **Still pending readiness pass:** dotintel2 (3 product slugs: dotintel, dotcarriers, dotagencies) + bindlab (no-underwriting-via-support guardrail per source brief lines 810–814). Full doctrine at family memory [`project_seven16group_support_integration.md`](C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\project_seven16group_support_integration.md).
- **`[ACTION] dotintel2 D-number reconciliation`** — local D-012/D-013/D-014/D-015/D-016 in `dotintel2/docs/STATE.md` + SESSION_28's D-017a-g still need rename to family-ledger IDs (queued as dotintel2 BACKLOG #9). ~5 min when picked up; Rule 4 integrity depends on it.
- **`[ACTION] dotintel2 STATE.md catch-up`** — last-updated header reads 2026-05-12; 2 sessions of drift (28 + 29) since. Queued as dotintel2 BACKLOG #4.

---

## Cross-product dependency map

Format: `[STATUS] consumer → producer (notes)`

| Status | Dependency | Notes |
|---|---|---|
| **[LIVE]** | Agency Signal `directory.*` schemas → `mirror-agency-signal` Edge Function (nightly cron) | D-013; last verified healthy 2026-05-15. Mirror filter = agencies with ≥1 transportation-vertical carrier appointment. ~1,887 location-level rows + ~23,546 contacts mirrored. |
| **[LIVE]** | All 7 D-021 pricing surfaces locked | Architecture is the producer; consumer surfaces (TIQ /pricing, dotintel2 marketing, Charter deck) can render. Implementation gated on Stripe catalog (next dependency). |
| **[LIVE-SANDBOX]** | Charter Member outreach revenue capture → Stripe catalog migration | SHIPPED SESSION_25 2026-05-18 to sandbox `acct_1TLUF6HmqSDkUoqw`. 6 D-021 surfaces (Universal Credits + DOT Alerts 6 tiers + Directory Listings 4 + Full DB + Learning Center 6 packs + Charter coupon `L1Ngigfc`). Canonical SKU map at `PRICING_STRIPE_CATALOG.md`. Still pending: webhook event registration (Master O dashboard action) + Pillar 7 entitlements schema in seven16-platform (BACKLOG #5) + Enterprise+ state SKUs (D-015 own session). |
| **[LIVE]** | All product satellites → seven16-group-site partner hub `partners.seven16group.com` | Hub serves the family-wide partner program (intake + admin adjudication + per-product landing pages). Public `/apply` + magic-link admin sign-in + RBAC approve/reject all verified end-to-end Session 2 (2026-05-19). Backed by shared Supabase `seven16-platform` ref `soqqmkfasufusoxxoqzx` (parent control plane). 14 migrations applied 0001–0014. |
| **[PENDING - READINESS SHIPPED]** | All product satellites → seven16groupsupport.com (centralized AI sales/support/onboarding/account-mgmt/affiliate-vetting/1099-vetting SaaS) | Platform itself NOT YET BUILT (separate greenfield repo, future Session 1). Stage-1 readiness shipped on Agency Signal (Session C) + seven16-group-site (Session 3) — `partners.seven16group.com/api/internal/support/health` is live now and bearer-gated (smoke verified Session 3 close). Still pending readiness: dotintel2 + bindlab. When platform repo ships, Master O pastes real values into the 3 sensitive Vercel slots (`SUPPORT_PLATFORM_API_KEY` + `SUPPORT_CONTEXT_SIGNING_SECRET` + `SUPPORT_WEBHOOK_SECRET`) currently holding `PLACEHOLDER_REPLACE_ME` per-product. |
| **[CANCELLED]** | ~~TIQ `/pricing` page → PRICING_*.md specs~~ | TIQ spun out per D-022. Build no longer needed; spec `PRICING_THRESHOLD_IQ.md` archived. |
| **[PENDING]** | `seven16-platform` shared JWT/auth runbook → Sprint 1C (Doppler + Sentry runbook across satellites) | All 3 product satellites partially observability-shipped (Speed Insights + Analytics + security headers via `403863b` / `fea5b34` / `d4245a9`); Sprint 1C ties them into shared auth runbook. Not started. |
| **[PENDING]** | dotintel2 Killing Commercial Training Hub integration → planning docs only, zero code | Untracked planning docs in `dotintel2/docs/`. Dependent on agency dashboard for Learning Center team-pack admin (per SESSION_23 cascade). |
| **[PREPPED]** | dotintel2 Sub-arc 3A SODA ingest → `data.transportation.gov` SODA API + `csa.recompute_percentiles()` + `csa.refresh_carrier_safety_summary()` migrations | Prep artifact drafted SESSION_24 under Rule 2(b): [`docs/cross-repo/dotintel2_SESSION_30_ARTIFACT.md`](../cross-repo/dotintel2_SESSION_30_ARTIFACT.md). Contains paste-ready SESSION_30 prompt + full `csa-ingest-soda.ts` v1 draft (~280 lines TypeScript) + percentile-recompute migration SQL (~80 lines) + summary-rebuild migration SQL (~50 lines) + testing protocol + 10 known gotchas. SODA API stable as of 2026-05-15. Three resource IDs: `4y6x-dmck` BASIC, `rbkj-cgst` Inspection, `4wxs-vbns` Crash (memory `reference_fmcsa_soda_resource_ids.md`). Status flips to `[LIVE]` after dotintel2 SESSION_30 runs first real ingest. |
| **[BLOCKED-internal]** | dotintel2 BACKLOG #9 (D-number reconciliation) → next dotintel2 session bandwidth | ~5 min fix; blocks family-ledger Rule 4 integrity until shipped. |

---

## Charter Member program status

| Metric | Value |
|---|---|
| Cap target | 50–75 accounts |
| Currently enrolled | 0 (outreach not yet started) |
| Enrollment window | 60–90 days from program launch (start date TBD) |
| Offer shape | Best pricing tier permanently across everything purchased (per D-018 amended by D-021); **6 surfaces** (was 7 — TIQ removed per D-022 2026-05-15) |
| Deck content | 🟡 Slides 9/10 need rebuild — TIQ removed from surfaces grid. Slide 18 compound savings example needs recalc (baseline drops from $5,580/yr → ~$1,512/yr with TIQ removed; heavier-usage scaling to $4,000–$7,000/yr). |
| Live `/charter` page | ✅ Rebuilt 2026-05-15 commit `fe57bce` with TIQ-free savings example. Live at [directory.seven16group.com/charter](https://directory.seven16group.com/charter). |
| Deck render (Gamma) | 🟡 Pending — wait for deck rebuild |
| Stripe revenue capture | 🟡 Sandbox-ready — catalog shipped 2026-05-18 (PRICING_STRIPE_CATALOG.md). Webhook event registration (Master O dashboard) + Charter Member customer enrollment pending. Live cutover trigger remains first paying customer. |
| 25%-off SKU integrations | ✅ DOT Alerts (any tier) · ✅ Directory listings · ✅ Learning Center · ✅ +40% credit bonus (effective ~$0.107/credit) · ✅ Charter badge recognition · ~~TIQ Scale-tier overage~~ (removed per D-022) |

---

## D-021 pricing architecture lock status (7 surfaces)

| Surface | Lock status | Spec file |
|---|---|---|
| Universal credits ($0.15/credit + bonus bands) | ✅ Locked SESSION_22 (amends D-014 from $0.29 → $0.15) | `PRICING_CREDITS_AND_TOPUPS.md` (needs amendment banner) |
| ~~TIQ tiers~~ | ⚫ ARCHIVED — TIQ spun out per D-022 (2026-05-15) | `PRICING_THRESHOLD_IQ.md` (banner-archived, file kept per Rule 4) |
| DOT Alerts flat tier bands ($25 → $500+) | ✅ Locked SESSION_22 | `PRICING_DOT_ALERTS.md` |
| Directory listings (carriers FREE / agents $120/yr / wholesalers $1k/mo) | ✅ Refined SESSION_23 | `PRICING_DIRECTORY_LISTINGS.md` |
| Lead downloads (universal credit consumption) | ✅ Locked SESSION_22 | `PRICING_LEAD_DOWNLOADS.md` |
| Learning Center ($29.95/seat + 1–25 team-pack toggle) | ✅ Locked SESSION_23 | `PRICING_LEARNING_CENTER.md` |
| Charter Member integrations (25% off + best-tier-on-everything) | ✅ Locked SESSION_22 + extended SESSION_23 | Each PRICING_*.md §"Charter integration" section |

**Enterprise+ layer (second-ICP)** sits adjacent: `PRICING_ENTERPRISE_LAYER.md` per D-015 (state-based slider + Distribution+ outcome SKU). Outside D-011 small-firm design target — different ICP, different sales motion.

---

## External dependencies

| Status | Vendor / API | Used by | Notes |
|---|---|---|---|
| ✅ Stable | FMCSA SODA (`data.transportation.gov`) | dotintel2 CSA ingest | Free public API. 50k/page pagination, no auth. Resource IDs: `4y6x-dmck` / `rbkj-cgst` / `4wxs-vbns`. |
| ✅ Stable | Vercel (`prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV`, `prj_4tnPATJjP4Bahg2RFw4DwlTuNa8S`) | 2 family-active product surfaces (TIQ project `prj_c6kzFEhpw6Uwb12TECUidKlBxOwr` scheduled for deletion in TIQ wind-down session per D-022) | Auto-deploys on `main` push. Speed Insights + Analytics live across family. |
| ✅ Stable | Supabase org `dotintel` (Pro tier, $25/mo covers all projects) | 3 family-active satellites (TIQ `yyuchyzmzzwbfoovsskz` scheduled for pause/delete per D-022) | `sdlsdovuljuymgymarou` (AS) + `vbhlacdrcqdqnvftqtin` (DOT Intel) + `soqqmkfasufusoxxoqzx` (platform). Daily backups included. PITR ($100/mo per project) NOT yet enabled — `project_pre_launch_security_gates.md` flags as launch gate. |
| ✅ Stable | Cloudflare DNS | 4 family-active domains (3 DOT brands + AS); `thresholdiq.io` decision pending TIQ wind-down session | Token zone-scoped per domain (per memory `feedback_cloudflare_token_zone_scoping.md`). |
| 🟡 Sandbox-only | Stripe (`acct_1TLUF6HmqSDkUoqw` DOT Intel sandbox + AS sandbox same account) | Both, sandbox | Live cutover trigger = first paying customer. Catalog buildout = SESSION_25 Path A. |
| 🟡 Pilot-only | Sentry (`seven16` org, `dotintel-web` project) | dotintel2 only so far | Rollout planned: dotintel2 ✅ → directory admin → Threshold IQ. AS Session 4 shipped pilot on `directory-admin` Sentry project. |
| ⏸️ Not wired | PostHog, Better Stack uptime | None yet | Accounts ready (memory `reference_observability_stack_sentry.md`); rollout deferred. |
| ⏸️ Not wired | Upstash (rate limiting) | None yet | Pre-launch security gate per `project_pre_launch_security_gates.md`. Free tier sufficient pre-revenue. |
| ⏸️ Not wired | GitHub Advanced Security | N/A (repos public) | Memory flags for private-repo conversion if/when. |

---

## Parked/spinoff repos (no active drift surface)

These exist but are not on the active drift-risk surface. Listed here so they don't get forgotten if/when triggered:

- **`dotintel-intelligence`** — legacy "Agency Intelligence" Next 14 build. Subdomain `intelligence.dotintel.io` resolves to dead build. Decommission queued as dotintel2 BACKLOG #8 (redirect to `directory.seven16group.com/verticals`). Own-session work when picked up.
- **Killing Commercial** — separate Claude project folder at `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Killing Commercial\`. Scraping + synthesis project that dropped planning docs into dotintel2 on 2026-05-13 (see "Items requiring attention" above).
- **Other Seven16 Group products** — **BindLab is family-active** under the Seven16 Group holding company (clarified by Master O at SESSION_26 close 2026-05-18). Agency Signal does not functionally intersect with BindLab (per SESSION_25 directive — BindLab handles different workflow scope), but it is NOT spun-out. DECISION_LOG §4 "retired brands" entry for BindLab needs a clarifying amendment in a future family-hub session. **DotIntel** is also Seven16 Group-owned (lives in `dotintel2` repo). Retired brands per DECISION_LOG §4: Agency Vantage. No code repos beyond `bindlab` (separate repo, outside this family hub's scope) to surface here for BindLab.

---

## How to use this snapshot

**At session open:**
- Glance at the Per-repo table. Any 🟠 or 🔴 health status drives the week's priority focus per ANTI_DECAY_PROTOCOL Mechanism #3 (Weekly Cross-Product Review).
- Scan Items Requiring Attention for action items in scope for the repo you're about to open.
- Check the Cross-Product Dependency Map for any `[PENDING]` items that intersect this session's arc.

**At session close** (per Working Agreement Rule 5 sub-bullet):
- Update the relevant repo's row in the Per-repo table (last commit, days-in-flight, queue depth).
- Move any new dependencies into the Cross-Product Dependency Map.
- Promote/demote any Items Requiring Attention.
- Stamp this file's "Last refresh" date.

**At first Monday of each month** (ANTI_DECAY_PROTOCOL Mechanism #4 Monthly Sweep):
- Full regenerate. Audit every dependency. Triage every stale item. Reconcile every memory file.

---

*v1 snapshot — refines as ANTI_DECAY_PROTOCOL mechanisms #2 (timestamps) and #6 (full dependency map) populate over subsequent sessions.*
