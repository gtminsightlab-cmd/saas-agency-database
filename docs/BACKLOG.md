# Agency Signal + Seven16 Family Hub — Backlog

Last reviewed: 2026-05-18 (D-023 Agency Signal positioning lock — architect strategy review. 9-pillar product taxonomy locked at [`docs/decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md`](decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md); 5 strategy docs at [`docs/strategy/`](strategy/); 8 domain docs at [`docs/domains/`](domains/); 6-table proposed migration at [`supabase/migrations/0091_agency_signal_d023_tables_proposed.sql`](../supabase/migrations/0091_agency_signal_d023_tables_proposed.sql). Pillar 9 Market Discovery parked. Verified/claimed profile + producer segmentation + confidence-badges-in-UI added to Tier 1.x. Prior 2026-05-15: SESSION_24 tail — D-022 TIQ family departure recorded.)

> **How to use:** Read this file first on every session open (Rule 6). End every session with a Backlog edit — promote, defer, kill, or done. Each entry has enough context to act cold: what / why / file paths / next step.
>
> **Two handoff streams in this repo:**
> - `docs/handoffs/SESSION_<N>_HANDOFF.md` = **family-hub** work (pricing decisions, doctrine, cross-product migrations). Latest: `SESSION_21_PRICING_HANDOFF.md` (D-014 + D-015 locked, 2026-05-12).
> - `docs/handoffs/AGENCY_SIGNAL_SESSION_<N>_HANDOFF.md` = **Agency Signal** product work. Latest: `AGENCY_SIGNAL_SESSION_4_HANDOFF.md` (family reconciliation + `/enterprise` tier page + Next 16 hygiene, 2026-05-14). Session 5 kickoff queued at `AGENCY_SIGNAL_SESSION_5_KICKOFF.md`.
>
> Items below are tagged **[AS]** or **[HUB]** where the stream isn't obvious. Per Rule 1 the highest-numbered of *whichever stream is relevant* is current truth.

---

## Active arc
[in-progress] **[AS Session 5] Option A — SWR client-cache on `/build-list` + `/saved-lists` (~2–2.5 hrs).**
Install `swr` (~5KB), wrap data loaders in `useSWR`, verify revalidation on focus + manual refresh, DOM only re-renders on diff. Pairs with the server-side `unstable_cache` shipped in AS Session 3 — closest user-facing match to "only new data loads on refresh." Files in scope: `package.json` / `package-lock.json`, `app/build-list/page.tsx`, `app/saved-lists/page.tsx`, possibly a small client wrapper if hooks need extraction.
*Why active:* Recommended starting move per `AGENCY_SIGNAL_SESSION_4_HANDOFF.md` §6 + `AGENCY_SIGNAL_SESSION_5_KICKOFF.md`. Completes Session 3's perf story. Master O can re-target to Option B (saved-lists backend) or C (per-user KV cache) on session open.

---

## Queued (priority order — pick the top one when active arc closes)

1. **[AS] Saved-lists update-detection backend (~4–5 hrs).** UI ready since AS Session 3 commit `e1bfc89` (row tint on `has_updates=true`), but nothing flips the flag. Build: (a) migration `0091_saved_list_snapshots.sql` storing `(list_id, agency_id)` at save-time; (b) Vercel Cron → Edge Function recompute job (use D-013 family template — `vercel.json` cron + `supabase/functions/recompute-saved-lists/index.ts`); (c) server action `markSavedListAcknowledged(list_id)` flips back to false after download; (d) "Download Updates" button on each `has_updates=true` row → exports delta only. Higher retention impact than Option A but bigger lift.
   *Source:* `AGENCY_SIGNAL_SESSION_4_HANDOFF.md` §5 #2 + §6 Option B.

2. **[AS] Per-user data cache via `@vercel/kv` or Upstash Redis (~half day).** Cache `app_users` + `v_my_entitlement` per-user with short TTL — saves ~200ms/authed-page render. Free tier covers current scale. Needs invalidation strategy on user settings changes. Lower urgency than items 0–1 above; consider when scaling pressure becomes real.

3. **[HUB] Cascade WORKING_AGREEMENT.md Rule 2 + Rule 5 amendments to `dotintel2`** (~5 min, dotintel2 only since seven16-distribution spun out per D-022). SESSION_24 amended two rules in saas-agency-database only:
   - **Rule 2(b)** — new cross-repo prep artifact exception. A session in Repo A may produce paste-ready prep artifacts (next-session prompts, draft scripts, design layouts) for Repo B's next session under 4 clauses (no file writes / commits / migrations in Repo B; no active Repo B session running).
   - **Rule 5 step 1** — new "if material, refresh `FAMILY_HEALTH.md` at session close" sub-bullet per ANTI_DECAY_PROTOCOL Mechanism #1.

   Drop into dotintel2's next session as a 5-min open-the-session edit. Until cascaded: saas-agency-database family-hub sessions handle FAMILY_HEALTH refresh on dotintel2's behalf.

   *Source:* `WORKING_AGREEMENT.md` §Rule-2 + §Rule-5 footer note + SESSION_24_HANDOFF.md.

4. **[HUB] TIQ wind-down session** (~30 min, do when bandwidth allows). Per D-022. Tasks: delete Vercel project `prj_c6kzFEhpw6Uwb12TECUidKlBxOwr`, archive (don't delete) GitHub `gtminsightlab-cmd/seven16-distribution` repo, pause or delete Supabase project `yyuchyzmzzwbfoovsskz`, decide Cloudflare DNS fate for `thresholdiq.io`, clean any TIQ-tagged Stripe sandbox products, delete Desktop launcher `Open Claude — Threshold IQ.bat`. Not blocking anything; not urgent. Recommend archive over delete on GitHub — preserves git history if Master O wants to reference TIQ patterns for the separate CRM/AMS he's building outside the family.

5. **[HUB] Schema migration: `customer_entitlements` + `appointment_attributions` in `seven16-platform` satellite (`soqqmkfasufusoxxoqzx`).** State-level RLS enforcement + outcome SKU attribution tracking per D-015 §7. Required before Stripe catalog setup can wire end-to-end. *Source:* [`docs/context/PRICING_ENTERPRISE_LAYER.md`](context/PRICING_ENTERPRISE_LAYER.md) §11.3.

6. **[HUB] Schema migration: `credit_wallets`, `credit_ledger`, `credit_consumption_rates` in `seven16group` satellite (`sdlsdovuljuymgymarou`).** Per D-014. **Verify first:** scaffolding may exist — `credit_wallets` + `credit_ledger` showed up in `list_tables` during session 21; state unconfirmed. Run advisors after DDL.

7. **[HUB] Stripe product catalog setup.** Per D-022, scope reduced from 7 D-021 surfaces to **6** (TIQ tiers removed). Build Stripe products + prices for: universal credits (top-up bands), DOT Alerts (6 flat-tier bands), Directory listings (retail $120/yr + agency $120/loc + wholesaler $1k/mo), Lead downloads (credit consumption), Learning Center ($29.95/seat + team-pack toggle), Charter Member flag (best-tier metadata). Plus Enterprise+ state SKUs (D-015 — ~50 state SKUs, Distribution Suite bundle, Distribution+ outcome SKU). Implement overflow-protection (D-015 §3.4) so all-50 total never exceeds $12,500. Use Stripe MCP for product creation; webhook endpoints dashboard-only per memory `feedback_stripe_mcp_webhook_dashboard_only.md`. **CTO-recommended next family-hub session per SESSION_24 close.**

8. **[HUB] 5–8 Distribution Expander demos.** Pressure-test the $12,500 ceiling and the MI-is-Tier-1 / TX-is-Tier-2 / NH-is-Tier-3 surprises against live reactions before publishing prices broadly. ICP = VPs of Distribution at MGAs/wholesalers/carriers (Neilson-replacement buyers). `/enterprise` page now exists to drive the demo conversation.

9. **[AS] Wire `revalidateVerticalsRefs()` into admin "Refresh verticals" button.** Server action exists but no admin UI calls it. Needs a button that runs `REFRESH MATERIALIZED VIEW mv_vertical_summary` + invokes the revalidation.

10. **[AS] RLS advisory cleanup — `public._trucking_load_log` in `sdlsdovuljuymgymarou`.** RLS disabled (flagged session 21). Decision: enable + add super-admin-only policy, OR rename to confirm internal-only. Quick win.

11. **[AS] Carrier-table dedupe migration.** Catalog has 4× Cincinnati variants, 3× Selective, 3× Nationwide collapsing to same `normCarrier` key. First-match-wins via `Map.set` is deterministic but a future migration would tidy. Links resolve correctly today.

12. **[AS] ~150 long-tail novel carriers** in `data/_unmatched_carriers.tsv` still need `/admin/catalog` entries. Low priority but a clean polish task.

13. **[AS] Carry-from-older-sessions list (verify still needed before picking up — STATE.md §7):** contacts load for 8 session-12 vendor files, `account_type_id` backfill for 634 new agencies, WRB.xlsx vs AdList-17028.xlsx duplicate-file confirmation, MiEdge confidence-tiered fuzzy matcher, V5 parent grain remediation, retail trucking load (1,328 agents). Some of these may have been overtaken by the May AdList + DOT Intel sync work — confirm row counts before re-running.

---

## Deferred (parked, will surface on a trigger)

- **[AS] Pillar 9 — Future Market Discovery (ProgramBusiness-adjacent)** — explicitly parked per D-023 / ADR-023. Documented at [`docs/domains/domain-market-discovery.md`](domains/domain-market-discovery.md). **Trigger:** all three of (1) saved-list intelligence (Pillar 6 / BACKLOG #1) shipped + proven; (2) data trust signals visible in UI (Pillar 8 — verified badges, confidence scores, stale alerts); (3) Enterprise+ Distribution Expander demos (5–8) validate market-side demand. Until then ProgramBusiness is a benchmark, not a build target.

- **[AS] Verified / claimed agency profile flow** — Pillar 1 + 8 cross-cut, NEW per D-023. Agencies claim and correct their own profile → inbound SEO + trust + future monetization. Tier 1.x, not active build. Schema preview in `0091_agency_signal_d023_tables_proposed.sql` (agency_profiles columns or extension table).

- **[AS] Verified / claimed producer profile flow** — Pillar 2 + 8 cross-cut, NEW per D-023. Tier 1.x. Schema preview in `0091_agency_signal_d023_tables_proposed.sql` (producer_profiles columns).

- **[AS] Producer-centric segmentation views** — Pillar 2, NEW per D-023. Existing UI is agency-first; need producer-first segmentation surfaces. Tier 1.x.

- **[AS] Confidence badges + stale alerts in UI** — Pillar 8, NEW per D-023. Surface confidence + freshness in `/agency-directory` + `/saved-lists` as product feature, not just backend plumbing. Tier 1.x.

- **[AS] Distribution Expander UX workflow build** — Pillar 7, the post-`/enterprise`-page workflow surfaces (state-targeting · vertical-segments · appointment-opportunities · export-jobs · data-quality dashboards). Trigger: schema migration for `customer_entitlements` + `appointment_attributions` lands in `seven16-platform` satellite (BACKLOG #5).

- **Stripe sandbox → production cutover** — trigger: first paying customer ready to convert. Account `acct_1TLUF6HmqSDkUoqw`, webhook endpoint `https://directory.seven16group.com/api/stripe/webhook`, events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`.

- **Hygiene Credit billing wiring** — trigger: Stripe production cutover above. Phased pricing: Growth Member auto-discounted 10% at month 6 + month 12 ($89.10 vs $99). Marketed as loyalty reward, NOT data-decay compensation. Mechanism: Stripe Subscription Schedule with phased pricing OR programmatic coupon at month 6+12.

- **Trust copy + Hygiene Credit rollout to live site** — trigger: data inventory catches up to copy claims (100k producers, 70% email density). Currently 41,705 agencies / 135,453 contacts (85.6% verified email). Locked language in STATE.md §8. Per DECISION_LOG §2 standing rule "pricing copy is placeholder until data inventory catches up" — consumer-tier marketing copy intentionally left stale (the `/enterprise` page uses fresh validated numbers; the homepage does not).

- **Phase 3 CMO rewrite (testimonials/customer logos)** — trigger: 2–3 paying customers.

- **A/B test sweep (3 tests)** — trigger: 500+ visitors/week.

- **Domain cutover `directory.seven16group.com` → `agencysignal.co`** — trigger: comfort with DNS choreography + a quiet week. Reserved but not wired.

- **Sprint 1C — shared JWT / Doppler / Sentry runbook across satellites** — trigger: `seven16-platform` shared-auth runbook lands. Partial credit already: Sentry is live on `directory-admin` Sentry project (AS Session 4 parallel `feat/sentry-install` merge) and Speed Insights/Analytics shipped on AS. Threshold IQ + dotintel2 join when the family runbook formalizes.

- **8 empty verticals (migration 0051)** — trigger: data + carrier mapping per vertical defined.

- **First Light + Maximum account_type reclassification** — trigger: bandwidth. Cosmetic, carry from session 11.

- **Pre-existing advisor cleanup (84 SECURITY DEFINER warnings, ext-in-public, pg_trgm-in-public, mv_vertical_summary-API-readable)** — trigger: bandwidth. Pre-existing, not session-introduced. Item 8 above (`_trucking_load_log`) is the only one worth fixing now.

- **xlsx (SheetJS) prototype-pollution + ReDoS** — no upstream patch. Used only in `scripts/`. Migrate to `exceljs` someday.

- **Contacts dedup edge case** (+16,273 contacts on AdList re-run in AS Session 2). Suggests NULL handling in `keyOf()` lets some duplicates through. Not blocking.

- **Pre-launch security gates (cross-product)** — trigger: any "launch," "tell my network," "we're going live with X." Memory `project_pre_launch_security_gates.md`. Mandatory pre-launch upgrades: GitHub Advanced Security ($49/u/mo for private-repo secret scanning — N/A here since this repo is public), Upstash rate limiting, PITR on satellites holding customer data ($100/mo), CSP headers, Better Stack uptime ($25/mo).

- **UI refresh by brand-systems designer (cross-repo, family-wide)** — trigger: designer engaged + brand system delivered. Sequenced AFTER seven16group.com apex build (which defines the brand). AI-generated UI smell across the family is a credibility tax; a polished, distinctive design system is a credibility multiplier worth ~$5–15k freelance investment. Deliverables expected: Figma design system + Tailwind tokens + component library + brand voice guidelines. Cascading rollout per product, not big-bang. See family memory `reference_seven16group_apex_plan.md` + `feedback_no_slop_in_copy.md`.

- **seven16group.com apex build (new repo + Vercel project)** — trigger: brand-systems designer delivered + services-arm scope locked (D-XXX) + bundle-location decision (D-XXX). Holding-company + marketing-agency front door. Architecturally separate from this repo. See family memory `reference_seven16group_apex_plan.md`.

---

## Killed (with reason + date)

*(empty — nothing killed yet under this system)*

---

## Done (audit trail, newest first)

- [2026-05-15] **Family-hub SESSION_24 (close)** — D-022 locked: Threshold IQ spun out of Seven16 family. Two final commits: `fe57bce` (`/charter` page rebuilt without TIQ — surfaces grid drops from 7 to 6, savings example rebuilt with DOT-heavy 15-truck scenario, baseline drops from $5,580/yr to ~$1,512/yr, anti-slop honest math) + the D-022 family-doc cleanup commit (DECISION_LOG D-022 entry, D-020 marked superseded, FAMILY_HEALTH TIQ row spun out, PRODUCT_REPO_INDEX TIQ row removed, MEMORY.md TIQ refs archived, BACKLOG TIQ cascade #3 reduced to dotintel2 only, NEW BACKLOG #4 TIQ wind-down queued, PRICING_THRESHOLD_IQ banner-archived per Rule 4).
- [2026-05-15] **Family-hub SESSION_24** — Anti-Decay Protocol Mechanism #1 shipped + Rule 2(b) cross-repo prep exception added + dotintel2 SESSION_30 prep artifact drafted under the new rule + `/charter` marketing page shipped on directory.seven16group.com + `PRODUCT_REPO_INDEX.md` canonical lookup created. Six commits: `29b3cfc` (SESSION_23 housekeeping — `.vercel` ignore + revised SESSION_24_PROMPT stricter Step 0 guard), `db9731e` (SESSION_24 body — FAMILY_HEALTH.md v1 + Rule 5 step 1 amendment + SESSION_25 prompt), `f5fc464` (tail amendment — Rule 2(b) cross-repo prep artifact exception), `822c192` (`docs/cross-repo/dotintel2_SESSION_30_ARTIFACT.md` — ~870 lines: paste-ready SESSION_30 prompt + full `csa-ingest-soda.ts` v1 draft + 2 migration drafts + testing protocol + 10 known gotchas, zero writes to dotintel2 tree), `9c0e000` (`feat(charter)` — `app/charter/page.tsx` + nav update, first live render of D-018/D-021 Charter Member offer on directory.seven16group.com, Vercel auto-deploy `READY` in 38 sec), and the post-charter index commit (`docs/context/PRODUCT_REPO_INDEX.md`).
- [2026-05-15] Backlog system bootstrapped — `docs/BACKLOG.md` + `docs/WORKING_AGREEMENT.md` seeded from AS Session 4 handoff + Session 5 kickoff + STATE.md + family memory.
- [2026-05-14] **AS Session 4** — Family DECISION_LOG reconciliation (added D-016 three-domain brand split, D-017 no source-attribution in `directory.*`, 2 new §6 standing rules — "always recommend next path as CTO/PM" + "no paid services until DOT Intel revenue"). **`/enterprise` tier page shipped** (D-015 Distribution Expander ICP, 832 lines, commit `e77c29d`). Next 16 hygiene greens (`force-dynamic` stripped from auth pages, `middleware.ts` → `proxy.ts`, commit `f52b38b`). Parallel `feat/sentry-install` session merged `899b47d` — Sentry pilot live via `@sentry/nextjs` on `directory-admin` Sentry project, tunnel route `/monitoring`.
- [2026-05-14] **Vercel Speed Insights + Analytics + security headers** merged via parallel `feat/foundations-sprint` session (`fea5b34`) — HSTS, X-CTO nosniff, X-Frame SAMEORIGIN, Referrer strict-origin-when-cross-origin, Permissions (camera/mic/geo/FLoC off), DNS prefetch on.
- [2026-05-12] **Family-hub Session 21** — D-014 (consumption engine: 50/400 + 100/600 monthly credits, $5-increment top-up slider with 0–45% bonus thresholds, hybrid expiry) + D-015 (Enterprise+ state-based slider on verified email contacts: Tier 1 $2k × 5 states, Tier 2 $1.5k × 15 states, Tier 3 $1k × 28 states, $12,500 all-50 ceiling, Distribution+ outcome SKU $300–500/qualified appointment) locked. MASTER_CONTEXT data snapshot refreshed (commits `915e4fe` / `f11287b` / `769400d`).
- [2026-05-12] **AS Session 3** — Next 14 → 16 + React 18 → 19 upgrade closing 24 CVEs, first real caching layer on `/build-list` + `/verticals` (`lib/cache/build-list-refs.ts`), Neilson UX-parity polish.
- [2026-05-09] **AS Session 2 (dedicated)** — DOT Intel → AS sync (17,638 agencies + 13,914 carrier appts + 53 UIIA affiliations) + AdList vendor load (31,746 contacts — the contact gap-fill, 3,328 agencies, 7,263 carrier appts, 1,065 affiliations, 6,807 SIC links). **100% canary scrub success across 16 patterns** — 0 live Neilson watermark hits post-load. Migrations 0084–0087.

---

## Cross-product carry-forwards (next time the relevant repo's session opens)

- **dotintel2 STATE.md still uses superseded local D-numbers** from its `SESSION_26_HANDOFF.md`. Reconciliation map locked in family `DECISION_LOG.md` header. Specifically: local D-012 brand split → family **D-016**; local D-013 Option B host → already family **D-012** ✓; local D-014 no paid services → §6 standing rule (not numbered); local D-015 recommend next path → §6 standing rule (not numbered); local D-016 no source attribution → family **D-017**. **Carry-forward for dotintel2's next session.** (Added to dotintel2 BACKLOG separately.)

- **dotintel2 minted D-017a through D-017g** in its `SESSION_28_HANDOFF.md` for Carrier Software parity launch decisions. These are product-tactical (DOT Intel feature priority), not family-architectural; they don't collide with the new family-ledger D-017 (different content), but renaming D-017a-g → `DI-CSP-a` through `g` would prevent future confusion if/when family logs another D-017.X.

---

## Source-of-truth pointers (read these on session open)

- This file (read first per Rule 6)
- **D-023 / ADR-023 — Agency Signal positioning lock (2026-05-18):** [`docs/decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md`](decisions/adr-023-neilson-programbusiness-agency-signal-boundary.md) + [`docs/strategy/agency-signal-positioning.md`](strategy/agency-signal-positioning.md) (core thesis) + [`docs/strategy/agency-signal-product-boundaries.md`](strategy/agency-signal-product-boundaries.md) (owns / does NOT own) + [`docs/strategy/neilson-competitive-boundary.md`](strategy/neilson-competitive-boundary.md) + [`docs/strategy/programbusiness-competitive-boundary.md`](strategy/programbusiness-competitive-boundary.md) + [`docs/strategy/distribution-expander-thesis.md`](strategy/distribution-expander-thesis.md). 8 domain docs at [`docs/domains/`](domains/). Status dashboard at [`docs/agency-signal-status.html`](agency-signal-status.html). Proposed schema at [`supabase/migrations/0091_agency_signal_d023_tables_proposed.sql`](../supabase/migrations/0091_agency_signal_d023_tables_proposed.sql) (NOT YET APPLIED).
- Latest family-hub handoff: [`docs/handoffs/SESSION_21_PRICING_HANDOFF.md`](handoffs/SESSION_21_PRICING_HANDOFF.md)
- Latest Agency Signal product handoff: [`docs/handoffs/AGENCY_SIGNAL_SESSION_4_HANDOFF.md`](handoffs/AGENCY_SIGNAL_SESSION_4_HANDOFF.md)
- Next Agency Signal kickoff: [`docs/handoffs/AGENCY_SIGNAL_SESSION_5_KICKOFF.md`](handoffs/AGENCY_SIGNAL_SESSION_5_KICKOFF.md)
- Working agreement: [`docs/WORKING_AGREEMENT.md`](WORKING_AGREEMENT.md)
- Family hub (this repo): [`docs/context/MASTER_CONTEXT.md`](context/MASTER_CONTEXT.md), [`DECISION_LOG.md`](context/DECISION_LOG.md) (D-001 through D-021 + §6 standing rules), [`SESSION_STATE.md`](context/SESSION_STATE.md), [`ENGINEERING_DOCTRINE.md`](context/ENGINEERING_DOCTRINE.md), [`ANTI_DECAY_PROTOCOL.md`](context/ANTI_DECAY_PROTOCOL.md), [`FAMILY_HEALTH.md`](context/FAMILY_HEALTH.md) (cross-product snapshot, updated at session close), [`PRODUCT_REPO_INDEX.md`](context/PRODUCT_REPO_INDEX.md) (canonical repo/project/URL lookup per product + per-product paste-ready session openers)
- Inside-view: [`docs/STATE.md`](STATE.md) *(last updated end of AS Session 3 — Session 4 deltas are in `AGENCY_SIGNAL_SESSION_4_HANDOFF.md` §5)*
- Pricing briefs locked 2026-05-12: [`docs/context/PRICING_CREDITS_AND_TOPUPS.md`](context/PRICING_CREDITS_AND_TOPUPS.md), [`docs/context/PRICING_ENTERPRISE_LAYER.md`](context/PRICING_ENTERPRISE_LAYER.md)
