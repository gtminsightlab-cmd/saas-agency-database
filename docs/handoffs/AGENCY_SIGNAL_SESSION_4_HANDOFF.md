# Agency Signal — Dedicated Session 4 Handoff

**Date:** 2026-05-14
**Predecessor:** [`AGENCY_SIGNAL_SESSION_3_HANDOFF.md`](AGENCY_SIGNAL_SESSION_3_HANDOFF.md) (2026-05-12 — UX parity + Next 14→16 + first caching layer)
**Theme:** Family-level reconciliation + new Enterprise+ tier page for D-015 Distribution Expander ICP + small Next 16 hygiene greens. Three commits shipped by this session, two more landed on `main` from a parallel `feat/sentry-install` session running in the same canonical clone.

This session was less code-heavy than Session 3 (which had 12 commits + a Next.js major-version upgrade) and more strategic-alignment-heavy. The shape:

1. **Catch-up scan** — read DOT Intel STATE.md, Threshold IQ STATE.md, family SESSION_STATE.md to understand what's changed across the family since AS Session 3
2. **Family decision-log reconciliation** — resolved a numbering collision between `dotintel2/docs/SESSION_26_HANDOFF.md` (local D-012 → D-016) and the family ledger (D-013 / D-014 / D-015 already taken). Added D-016 + D-017 + two §6 standing rules.
3. **/enterprise tier page** — translated the locked D-015 Enterprise+ pricing brief into buyer-facing copy at `directory.seven16group.com/enterprise`. The "highest-leverage next move" per `SESSION_21_PRICING_HANDOFF.md`.
4. **Next 16 hygiene greens** — stripped `force-dynamic` from three static auth pages (CDN-cacheable now), renamed root `middleware.ts` → `proxy.ts` per Next 16 convention.

Each of the three commits was build-verified locally + Vercel deploy reached READY. The parallel Sentry session added two more commits to `main` (`7a829e7` + merge `899b47d`); those are documented separately below since I didn't author them but they're part of the end-of-session state.

---

## TL;DR

| Item | Value |
|---|---|
| Commits authored this session | **3** (0fdb47b → f52b38b) |
| Commits added by parallel `feat/sentry-install` session | 2 (`7a829e7` + merge `899b47d`) |
| HEAD on `main` at session end | `899b47d` (parallel session's Sentry merge) |
| Last commit I authored | `f52b38b` (Next 16 hygiene greens) |
| Live URL | https://directory.seven16group.com — HTTP 200 |
| New routes added | `/enterprise` (D-015 tier page) — HTTP 200 |
| Vercel deploys | All my commits + Sentry merge READY in production |
| Family ledger changes | D-016 (brand split) + D-017 (no source attribution) + 2 standing rules |
| Stack | Next 16.2.6 · React 19.2.6 · ESLint 10.3 · TypeScript 5.6 · Turbopack (unchanged) |
| New observability surface (parallel session) | Sentry pilot live via `@sentry/nextjs` SDK on `directory-admin` Sentry project, tunneled via `/monitoring` route |
| New perf surface (parallel session, earlier today) | Vercel Speed Insights + Analytics + security headers (HSTS, X-CTO, X-Frame, Referrer, Permissions, DNS prefetch) |
| DB corpus (unchanged from Session 3) | 41,705 agencies · 135,453 contacts · 263,657 agency_carriers · 19,521 agency_affiliations · 106 active affiliations · 1,369 carriers · 11,841 Trusted Choice links · 16 active canaries |
| Migrations applied | None this session (no DDL) |

---

## 1. Commits in order

### A. Family decision-log reconciliation (commit 1) — 2026-05-14

| SHA | Subject | Files | Net effect |
|---|---|---|---|
| `0fdb47b` | docs(decision-log): reconcile dotintel2 session 26-27 decisions into family ledger | `docs/context/DECISION_LOG.md` + `docs/context/SESSION_STATE.md` | Two genuinely new architectural decisions logged with proper family-ledger D-numbers; two §6 standing rules added; numbering collision with `dotintel2/docs/SESSION_26_HANDOFF.md` documented and resolved. |

**Background.** During session start, I caught up on the other family products (DOT Intel sessions 25-28, Threshold IQ Phase E shipped through E-10) and noticed that `dotintel2/docs/SESSION_26_HANDOFF.md` (2026-05-12 evening) had minted its own D-012 / D-013 / D-014 / D-015 / D-016 in parallel with family-hub Session 21 (same day, AM) logging D-013 / D-014 / D-015. Two of the five collided with already-assigned family ledger numbers; three were genuinely new but had wrong IDs.

**Resolution mapping** (now documented in the family DECISION_LOG.md header):

| dotintel2 SESSION_26 local # | Subject | Family ledger says |
|---|---|---|
| D-012 (brand split) | dotcarriers.io / dotagencies.io / dotintel.io, one Vercel project, host-header middleware | **new D-016** |
| D-013 (Option B host) | Directory build on dotintel2 + `vbhlacdrcqdqnvftqtin` | already D-012 ✓ |
| D-014 (no paid services) | Re-confirmation of pre-existing rule | family §6 standing rule (not numbered) |
| D-015 (recommend next path) | Lead with opinionated SaaS-best-practice recommendation | family §6 standing rule (not numbered) |
| D-016 (no source attribution) | `directory.*` schemas can't expose Agency Signal as the source | **new D-017** |

**D-016 (Three-domain brand split)** — DOT Intel territory now spans three Cloudflare-DNSed brands routed through a single Vercel project (`prj_4tnPATJjP4Bahg2RFw4DwlTuNa8S`, repo `dotintel2`): `dotcarriers.io` (carrier directory, ~50,298 unclaimed shells, claim CTAs, paginated/filterable), `dotagencies.io` (agent + wholesaler directory, empty-state shell with chrome), `dotintel.io` (intelligence dashboard + 2027 bundle hub). Host-header path rewriting in `dotintel2/middleware.ts`; runbook at `dotintel2/docs/runbooks/domain-split-dns.md`. Reverted an earlier "let's use subdomains" path after one round-trip.

**D-017 (No agency-data-source attribution in `directory.*`)** — Hard rule §6.8 from the directory build spec. `agency_signal_id` columns renamed to `upstream_id` (so the directory row knows its origin internally without leaking the source brand). All upstream account-type, management-system, and social-URL columns DROPPED from `directory.agencies` + `directory.contacts`. The Edge Function mirror (`mirror-agency-signal` per D-013) strips these on every nightly UPSERT, not just the initial backfill.

**Two new §6 standing rules** —
- **"Always recommend next path as CTO/PM."** At every decision point, lead with an opinionated SaaS-best-practice recommendation framed via dependency order / longest-lead-time / revenue-adjacency / reversibility / foundation-first. Don't hand back a flat menu of options.
- **"No paid third-party data services until DOT Intel revenue."** Re-confirmation of the pre-existing rule from `feedback_no_paid_services_until_revenue.md`. Free FMCSA + USPS Web Tools only. Defer Twilio Lookup, paid VIN history, commercial address validators to a post-revenue backlog.

**Also fixed in SESSION_STATE.md:** the stale "three pricing commits not yet pushed" note from Session 21. Verified all three (`915e4fe` / `f11287b` / `769400d`) are on origin/main as of 2026-05-14.

**Build/deploy detail.** This commit needed a careful git dance because the canonical clone was on `feat/sentry-install` (parallel session's WIP) and had a dirty working tree I shouldn't touch. Solution: `git stash push -- docs/context/*.md` to isolate just my edits, `git worktree add ../tmp-docs main` to do the commit on `main` without disturbing the WIP, push, then `git worktree remove`. The pattern is worth saving — when a parallel session has un-committed work on a feature branch in the same clone, a temporary worktree lets you commit to `main` without interference.

Vercel deploy `dpl_7NJjZYFQRd5sgeaZCisBzMZ1ubAr` READY in production.

### B. Enterprise+ tier page (commit 2) — 2026-05-14

| SHA | Subject | Files | Net effect |
|---|---|---|---|
| `e77c29d` | feat(enterprise): tier page for D-015 Distribution Expander ICP | `app/enterprise/page.tsx` (new, 832 lines) + `components/marketing/nav.tsx` (+3 lines, one new Link) | New marketing surface at `/enterprise` translating the locked D-015 pricing brief into buyer-facing copy. Highest-leverage next move per `SESSION_21_PRICING_HANDOFF.md` recommendation list. |

**Why this page exists.** D-015 (locked 2026-05-12) defines Enterprise+ pricing for the second ICP — VPs of Distribution at MGAs, wholesalers, carriers, aggregators, insurtechs (the Neilson-replacement buyer). The `$399+` Enterprise floor in the family pricing grid had no published packaging until now; this page is that packaging. Tasked as "draft Enterprise tier page copy" in `PRICING_ENTERPRISE_LAYER.md` §11 task 2.

**Page sections** (all rendering D-015 locked numbers, no live DB queries beyond the auth check):

1. **Hero** — second-ICP positioning, $12,500/yr all-50 ceiling anchor, mailto CTA to `hello@seven16group.com`. Navy-900-to-brand-900 gradient background with gold accents to differentiate visually from the white-background consumer-tier pages.

2. **Producer/Growth vs Enterprise+ contrast** — two-column "this is a different buyer, not a different product" callout. Frames Enterprise+ as annual contract / procurement-routed / demo-led, explicitly NOT P-card.

3. **State pricing tier cards** — three cards rendering Tier 1 ($2,000 × 5 states: CA, MI, NY, OH, PA), Tier 2 ($1,500 × 15 states), Tier 3 ($1,000 × 28 states) with all jurisdictions visible as small pills inside each card. Tier 1 has gold border + gold-50 fill; Tier 2 brand; Tier 3 gray.

4. **Territorial add-ons callout** — emerald banner explaining AK/DC/HI come free with any purchase (<50 verified emails each — "we don't charge for data depth we don't have"). 51 jurisdictions total.

5. **"A few things will surprise a buyer who's done their homework"** — defensible-against-challenge section: MI Tier 1 by contact density (7.2 contacts/agency), TX/FL Tier 2 not Tier 1, NH high-quality-low-volume. Aimed at the homework-doer buyer.

6. **Bundle ladder table** — 1-4 / 5-9 / 10-24 / 25-49 / all-50 + 3 add-ons. Last row brand-50 emphasized at $12,500/yr flat with $250 effective per-state.

7. **Overflow protection callout** — gold-50 banner with the worked example: 5 Tier 1 + 4 Tier 2 = $13,600 at ladder rate → "take all 50 for $12,500 instead." Mandatory rule: `final_price = min(computed_bundle, $12,500)`.

8. **Neilson comparison** — navy-900 dark section with three stat cards: $64,500 à-la-carte / $12,500 bundle / $25,000 Neilson. Closing line: "81% effective discount off our own à la carte rack, and a 50% undercut of the legacy ceiling."

9. **Included credits at Enterprise+** — 200/state up to 5,000 all-50. Overage starts at +30% bonus rate (vs consumer +0% baseline).

10. **DOT Intel Enterprise+ volume packs** — Starter $499/mo / Pro $1,499/mo / Custom quote. Aligns with the published `$499+` Enterprise floor.

11. **Distribution+ outcome SKU** — $300-$500 per qualified appointment, "available as a layer on top of either Enterprise+ contract." Side card explaining why the legacy competitor's cost model precludes following this pricing motion.

12. **Distribution Suite cross-product bundle** — $22,500/yr Standard + $22,500/yr + $300-500/appt Outcome variant. Footnote clarifying coexistence with the $179/mo 2027 Seven16 Intelligence bundle (D-005) — different ICPs.

13. **"What to expect from the demo"** — three-step (demo → pilot → contract) to set expectations that this is procurement-routed, not self-serve.

14. **Final CTA** — navy-900 section, gold mailto button to `hello@seven16group.com`.

**Numbers used are validated against live data** per D-015 §8 — 41,705 agencies / 135,453 contacts / 115,892 verified emails (85.6%). NOT the stale "36,212 agencies / 87,000 contacts / 400+ writing companies" still on the marketing homepage. Per DECISION_LOG §2 standing rule ("pricing copy is placeholder until data inventory catches up"), the consumer-tier marketing copy is intentionally not touched in this slice — that's a separate refresh someday.

**Design decisions** —
- Per D-015 open question §10.1 ("map UI vs multi-select"), the page ships with static tier-grouped cards rather than an interactive state-picker. The actual cart UI lands with the Stripe product catalog work (D-015 §11 task 4).
- "Enterprise+" branding appears on the page itself; URL is `/enterprise` (cleaner, no plus-sign URL escaping).
- Page is server-rendered, `force-dynamic`, no client JS. Auth check via `createClient()` is the only DB hit.
- Visual style: white background for main sections, navy-900 dark sections for hero + Neilson comparison + final CTA (cinematic anchor points), gold-500 for premium emphasis, brand-600 teal for primary actions.

Vercel deploy `dpl_A1DZiHsoux67iry1RYrGrQTVDTrP` READY in 38s with Turbopack. Confirmed HTTP 200 on `directory.seven16group.com/enterprise`.

### C. Next 16 hygiene greens (commit 3) — 2026-05-14

| SHA | Subject | Files | Net effect |
|---|---|---|---|
| `f52b38b` | chore(next16): strip force-dynamic from auth pages + middleware->proxy rename | `app/sign-in/page.tsx` · `app/auth/forgot-password/page.tsx` · `app/auth/reset-password/page.tsx` · `middleware.ts` renamed to `proxy.ts` (90% similarity) | Two small carry-forwards from Session 3 §7. |

**Force-dynamic strip on auth pages.** Three auth pages had `export const dynamic = "force-dynamic"` but none called `createClient()` or any other dynamic API:
- `app/sign-in/page.tsx` — reads `searchParams`, which is already a dynamic API in Next 16; explicit force-dynamic was redundant.
- `app/auth/forgot-password/page.tsx` — pure static layout.
- `app/auth/reset-password/page.tsx` — Supabase recovery token arrives via URL hash (client-only); server-side page is static.

Removing the directives lets these pages render statically / CDN-cache. Should drop unauthed visits from ~150-380ms lambda cold-start to sub-100ms once CDN warms. Won't show up immediately on a single request — needs the Vercel edge cache to populate per region.

**`middleware.ts` → `proxy.ts`.** Next 16 renamed the root convention; old name still works but emits a deprecation warning. Cleaned via `git mv` + function rename (`middleware()` → `proxy()`). `config.matcher` syntax unchanged. The Supabase helper at `lib/supabase/middleware.ts` (the `updateSession` function) keeps its name — that's not a Next convention, just an internal module.

Verified no other code imports the root middleware module (grep for `from "@/middleware"` and `import middleware from` returned no matches outside `node_modules`). Type-check clean.

Vercel deploy `dpl_DGuQhxsM2bCVvtHYGD5vUKtG2H7Z` READY. All three auth routes return HTTP 200.

### D. Parallel `feat/sentry-install` session (commits NOT authored by me)

Two commits landed on `main` during this session from a separate Claude Code session running on the same canonical clone:

| SHA | Subject | Author | Notes |
|---|---|---|---|
| `7a829e7` | feat(observability): add Sentry error tracking | parallel session | `@sentry/nextjs` SDK wired via `instrumentation.ts` (server + edge) + `instrumentation-client.ts`. `app/global-error.tsx` routes uncaught client errors to `Sentry.captureException`. `next.config.mjs` wrapped with `withSentryConfig`. `tunnelRoute /monitoring` bypasses ad blockers. tracesSampleRate 0.1, replays disabled (PostHog owns session replay). |
| `899b47d` | Merge feat/sentry-install: Sentry error tracking live on directory-admin | parallel session | Merge to `main` happened during this session's wrap-up. |

**Operational note for next session:** the Sentry SDK is live now. Errors thrown in production will surface in the `directory-admin` Sentry project. Tunnel route `/monitoring` is the Sentry intake — don't block it in `proxy.ts` matcher (currently fine, `/monitoring` doesn't match any excluded path).

**Working-tree leftover:** `.gitignore` shows `M` with a single-line `.vercel` addition. Not committed by either the Sentry session OR this one. Probably a transient from a `vercel link` / `vercel pull` run. Carry-forward: someone should decide whether to commit it (it's a sensible gitignore addition) or revert it.

---

## 2. What's actually different on the live site

| Where | Change visible to users |
|---|---|
| `/enterprise` | **NEW route.** Full D-015 Enterprise+ tier page with state pricing tiers, bundle ladder, Neilson comparison, DOT Intel volume packs, Distribution+ outcome SKU, Distribution Suite bundle. |
| MarketingNav | New "Enterprise" link between "Pricing" and "Sign in" at md: breakpoint and up. |
| `/sign-in`, `/auth/forgot-password`, `/auth/reset-password` | Eligible for CDN caching now. Should feel snappier once edge cache warms. No visual change. |
| Sentry error tracking | Uncaught errors now go to the `directory-admin` Sentry project (this session, via parallel `feat/sentry-install`). |
| Speed Insights + Analytics | Now collecting Real User Monitoring data + page views (earlier today, via `feat/foundations-sprint` merged before this session began). |
| Security headers | HSTS, X-CTO nosniff, X-Frame SAMEORIGIN, Referrer strict-origin-when-cross-origin, Permissions (camera/mic/geo/FLoC off), DNS prefetch on (also from `feat/foundations-sprint`). |

---

## 3. Family-level alignment captured this session

Quick reference of where each sibling product stands, as understood at start of Session 4 (read end-of-session-4 + their own STATE.md docs for current state):

| Product | Repo | Status | Inside-view doc |
|---|---|---|---|
| **Agency Signal** (this) | `saas-agency-database` | Live at directory.seven16group.com. HEAD `899b47d`. | `docs/STATE.md` (Session 3 was last update; this handoff supersedes for the deltas listed here) |
| **DOT Intel** | `dotintel2` | Past session 28 — Sentry pilot + Vercel Speed Insights + Carrier Software parity launch decisions (D-017a-g local) + content engine Phase 2 + brand-aware nav + training schema | `dotintel2/docs/STATE.md` (stale — references local D-012/D-013/D-015/D-016 numbering from SESSION_26_HANDOFF, needs reconciliation pass in its next session) |
| **Threshold IQ** | `seven16-distribution` | Far past `fe2381d`. Phase E strategic core fully shipped end-to-end (E-1 through E-10 + Phase G producer network + kanban). Only unblocked work remaining: E-6-S3 polish + E-9 backfill. | `seven16-distribution/docs/STATE.md` (last updated 2026-05-10) |
| **seven16-platform** | (no app yet) | Sprint 1B closed. Sprint 1C (shared JWT + Doppler + Sentry runbook) still pending. Now potentially partially advanced by Sentry being live on AS + dotintel2. | family ledger §0 |

**Pricing-strategy-locked artifacts now usable downstream:**
- `docs/context/PRICING_CREDITS_AND_TOPUPS.md` — D-014 consumption engine spec
- `docs/context/PRICING_ENTERPRISE_LAYER.md` — D-015 Enterprise+ spec
- This session's `/enterprise` page is the first surface translating either spec into customer-facing UI

---

## 4. Live state at end of session

| Check | Value |
|---|---|
| Agency Signal site | https://directory.seven16group.com — HTTP 200 |
| New route | https://directory.seven16group.com/enterprise — HTTP 200 |
| Vercel latest deploy | Multiple READY in production; latest is the Sentry merge (`899b47d`) |
| HEAD on `main` | `899b47d` |
| Last commit authored this session | `f52b38b` (Next 16 hygiene greens) |
| Branch `feat/sentry-install` | Merged into main as `899b47d`; remote branch still exists, can be deleted at parallel session's discretion |
| Branch `feat/foundations-sprint` | Already merged earlier today as `fea5b34` |
| Supabase satellite | `sdlsdovuljuymgymarou` ACTIVE_HEALTHY, pg 17.6.1.105 (unchanged) |
| Next.js | 16.2.6 (unchanged from Session 3) |
| React | 19.2.6 (unchanged) |
| TypeScript | 5.6.3 |
| Tailwind | v4 (with `@theme {}` not `@theme inline {}`) |
| `public.agencies` | 41,705 |
| `public.contacts` | 135,453 (85.6% verified email = ~115,892) |
| `public.agency_carriers` | 263,657 |
| `public.agency_affiliations` | 19,521 |
| `public.affiliations` (active) | 106 |
| `public.carriers` (active) | 1,369 |
| Trusted Choice links | 11,841 |
| Active canaries | 16 |
| Migrations | 0001–0090 (no new DDL this session) |
| Caching infrastructure | unchanged from Session 3: 3 cached loaders in `lib/cache/build-list-refs.ts`, 2 invalidation tags, 1 admin-side invocation wired (CatalogEditor) |
| Observability | NEW this session: Sentry pilot on `directory-admin` project. Vercel Speed Insights + Analytics. Security headers. |
| Family DECISION_LOG | Now spans D-001 through D-017 + 2 new §6 standing rules added this session |

---

## 5. Known issues + carry-forward MUST-DOs

### Carry-forward — Agency Signal-side, unblocked

1. **SWR client-cache on /build-list + /saved-lists** (~2-2.5 hrs). Install `swr` (~5KB), wrap data loaders, verify revalidation on focus + manual refresh, DOM only re-renders on diff. Pairs naturally with the server-side `unstable_cache` shipped in Session 3 — closest user-facing match to "only new data loads on refresh." Highest impact-per-hour technical slice remaining.

2. **Saved-lists update-detection backend** (~4-5 hrs). The `has_updates` column exists, UI shows "Yes/No" + brand-50 row tint (since Session 3 commit `e1bfc89`), but nothing in the codebase flips the flag. Build needs:
   - Migration: `saved_list_snapshots` table storing `(list_id, agency_id)` at save-time
   - Background recompute via Vercel Cron → Edge Function (per D-013 family template) — compares current matches to snapshot, sets `has_updates=true` if delta
   - Server action: `markSavedListAcknowledged(list_id)` flips back to false after download
   - UI: "Download Updates" button on each `has_updates=true` row → exports delta only

3. **Per-user data cache via `@vercel/kv` or Upstash Redis** (~half day). Every authed page hits `app_users` + `v_my_entitlement` round-trips. Caching these per-user via KV would save ~200ms/request. Free tier covers our current scale. Needs invalidation strategy on user settings changes.

4. **`.gitignore` working-tree leftover.** Single-line `.vercel` addition is in the working tree, uncommitted. Decide whether to keep (it's a sensible gitignore addition) or revert.

5. **`.env.local` revoked AS service-role key.** Per Session 3 §7 #10 — the old `default` key (deleted in Session 2) is still in the canonical clone's `.env.local`. Local scripts will fail until updated. 5-min Notepad fix; needs human hands on keyboard (don't pass secrets through chat).

### Carry-forward — cross-product

6. **dotintel2 STATE.md still uses superseded local D-numbers.** Specifically the "Decision lock" line near the bottom of the directory-build section references local D-012 (brand split) → should be **D-016** per family ledger; local D-013 (Option B host) → already **D-012**; local D-015 (recommend next path) → §6 standing rule, not numbered; local D-016 (no source attribution) → **D-017**. Carry-forward for dotintel2's next session — I didn't touch it this session because the dotintel2 working tree has uncommitted CSA-schema and training-hub work I shouldn't intermix with.

7. **dotintel2 SESSION_28 minted D-017a through D-017g** for Carrier Software parity launch decisions. These are product-tactical scope decisions (DOT Intel feature priority), not family-architectural. They don't collide with the new family-ledger D-017 (different content), but if dotintel2's next session wants clean separation, renaming D-017a-g → `DI-CSP-a` through `g` (or similar product-scoped prefix) would prevent future confusion.

### Carry-forward — Agency Signal-side, low priority

8. **Carrier-table dedupe migration** (mirror of migration 0090 for affiliations). Catalog has 4× Cincinnati variants, 3× Selective, 3× Nationwide all collapsing to same `normCarrier` key. First-match-wins via `Map.set` is deterministic but a future migration would tidy. Links resolve correctly today.

9. **Long-tail novel carriers** (~150 small regional mutuals from `data/_unmatched_carriers.tsv`) still need `/admin/catalog` entries.

10. **Contacts dedup edge case** (+16,273 contacts on AdList re-run in Session 2). Suggests NULL handling in `keyOf()` lets some duplicates through. Not blocking.

11. **xlsx (SheetJS) prototype-pollution + ReDoS.** No upstream patch. Used only in scripts/. Consider exceljs migration someday.

12. **Wire `revalidateVerticalsRefs()` into admin "Refresh verticals" button.** Server action exists but no admin UI calls it. Needs a button that runs `REFRESH MATERIALIZED VIEW mv_vertical_summary` + invokes the revalidation.

13. **Pre-existing advisor warnings** (84 SECURITY DEFINER, extension-in-public, pg_trgm-in-public, mv_vertical_summary-API-readable). Unchanged from Session 3 baseline.

### Standing rules in effect (added this session to family DECISION_LOG §6)

- **"Always recommend next path as CTO/PM."** Lead with opinionated recommendation framed by dependency order / longest-lead-time / revenue-adjacency / reversibility / foundation-first. Don't hand back flat menus.
- **"No paid third-party data services until DOT Intel revenue."** Free FMCSA + USPS Web Tools only. Defer Twilio Lookup, paid VIN history, commercial address validators to post-revenue backlog.

---

## 6. Opening move for Session 5

Three good candidates ranked by impact-per-hour:

### Option A — SWR client-cache on /build-list + /saved-lists (~2-2.5 hrs) **← recommended**

Originally Session 3's recommended next move; deferred through Session 4 because of higher-priority strategic alignment work (D-015 page). Install `swr`, wrap the two pages' data hooks, verify revalidation. Pairs naturally with the server-side cache from Session 3. Easiest meaningful win.

Files in scope (~3-4):
- `package.json` / `package-lock.json` (swr install)
- `app/build-list/page.tsx` (wrap data loaders in useSWR)
- `app/saved-lists/page.tsx` (same)
- Possibly a small client wrapper component if hooks need extraction

### Option B — Saved-lists update-detection backend (~4-5 hrs)

UI ready since Session 3 (`e1bfc89` row tint). Build the recompute mechanism. More retention value (users see which lists grew) but a migration + cron + new export action. Use D-013's Vercel-Cron → Edge-Function template for the recompute job — that pattern is now the family standard.

Files in scope (~5-6):
- New migration: `0091_saved_list_snapshots.sql`
- `app/saved-lists/page.tsx` (delta download button + acknowledgement action)
- `app/api/cron/saved-lists-recompute/route.ts` (new Vercel Cron route)
- `supabase/functions/recompute-saved-lists/index.ts` (new Edge Function)
- Server actions in `app/saved-lists/actions.ts`
- `vercel.json` cron registration

### Option C — Per-user data cache via @vercel/kv (~half day)

Cache `app_users` + `v_my_entitlement` per-user with short TTL. Saves ~200ms/authed-page render. Needs KV setup + invalidation strategy. Lower urgency than A/B; consider when scaling pressure becomes real.

### Recommended ordering

**A first, then B.** SWR is the cheap win that completes the Session 3 perf story; once that's in, the saved-lists backend is a focused half-day session that unlocks real retention value. C waits until usage pressure justifies the infra setup.

---

## 7. Paste-ready opening prompt for Session 5

See [`AGENCY_SIGNAL_SESSION_5_KICKOFF.md`](AGENCY_SIGNAL_SESSION_5_KICKOFF.md) in this folder. Also reproduced in the chat thread that closed Session 4.

---

— end AGENCY_SIGNAL_SESSION_4_HANDOFF —
