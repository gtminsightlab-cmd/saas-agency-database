# Agency Signal — Session 4 kickoff prompt

Cut-and-paste the block below into a fresh Claude Code session opened against
the canonical clone `C:\Users\GTMin\Projects\saas-agency-database\`. It loads
the relevant Session 3 context, names the open carry-forwards, and proposes a
default starting move.

---

```
Resuming the dedicated Agency Signal track — Session 4 (2026-05-12+).
Canonical clone: C:\Users\GTMin\Projects\saas-agency-database\.
Vercel project prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV (team team_RCXpUhGENcLjR2loNIRyEmT3),
auto-deploys main, aliased to directory.seven16group.com.
Supabase satellite sdlsdovuljuymgymarou ACTIVE_HEALTHY, pg 17.6.1.105.
Default tenant: ce52fe1e-aac7-4eee-8712-77e71e2837ce (slug 'seven16').

Before doing anything substantive, read in this order:
  1. docs/handoffs/AGENCY_SIGNAL_SESSION_3_HANDOFF.md  ← 12 commits, full
     context for Next 14→16 upgrade + caching foundation
  2. docs/STATE.md (Agency Signal inside-view, updated end-of-session-3)
  3. docs/handoffs/AGENCY_SIGNAL_SESSION_2_HANDOFF.md (data-load history;
     Sessions 2 + 3 are heavily intertwined)
  4. CLAUDE.md (family doctrine, 3f45718)

Where we left off (end of Session 3, commit e16508f):
  • Stack: Next 16.2.6 + React 19.2.6 + ESLint 10.3 + TypeScript 5.6.
    All 24 Next.js 14.x CVEs closed including the critical auth-bypass
    GHSA-f82v-jwr5-mffw. npm audit: 0 critical / 1 high (xlsx, no
    upstream fix) / 2 moderate (postcss transitive, fix would
    downgrade Next to 9.3.3 — declined).
  • Caching: lib/cache/build-list-refs.ts exports 3 unstable_cache-wrapped
    loaders (getBuildListFilterData, getVerticalMarkets,
    getVerticalsSummary), all 1-hour TTL, tagged 'build-list-refs' /
    'verticals-refs'. Uses singleton anon Supabase client at module
    scope — no per-user cookie variance. /build-list went from 12
    queries/render → 3 queries/render. /verticals mv read cached too.
  • Invalidation: app/admin/catalog/actions.ts exports
    revalidateBuildListRefs() + revalidateVerticalsRefs(). The
    CatalogEditor calls revalidateBuildListRefs() after every save /
    create / toggle / delete, so admin catalog edits show up on
    /build-list immediately on the next request — no waiting on TTL.
    (Verticals invalidation not yet wired to an admin action.)
  • Data corpus (unchanged from session 2): 41,705 agencies / 135,453
    contacts / 263,657 agency_carriers / 19,521 agency_affiliations /
    106 active affiliations / 1,369 carriers / 11,841 Trusted Choice
    agency links. Migrations 0001–0090. Active canaries: 16.
  • UX parity with competitor Neilson done on /build-list (two-column
    carrier + affiliate dropdowns, all sections collapsed by default)
    and /saved-lists (rows tinted brand-light when has_updates=true).
  • DOT Intel cross-reference live on /verticals/transportation
    (commit 0e3ee73) — sister-product callout linking to
    dotintel.io/solutions. Mirrors DOT Intel's cross-ref back.

OPEN CARRY-FORWARD (full list in handoff §7):
  🟡 Saved-lists update-detection backend — UI ready, recompute
     mechanism not built. ~half day.
  🟡 Per-user cache via @vercel/kv (app_users + v_my_entitlement) —
     saves ~200ms/request. ~half day, requires KV setup.
  🟡 Client-side SWR / TanStack Query on /build-list + /saved-lists —
     stale-while-revalidate for "only new data loads on refresh" UX.
     ~2 hours.
  🟢 Truly-static pages still force-dynamic (/sign-in,
     /auth/forgot-password, /auth/reset-password don't use createClient
     — could be CDN-cached). ~30 min.
  🟢 Carrier-table dedupe (mirror of migration 0090 for affiliations).
     Low priority.
  🟢 Long-tail ~150 novel regional carriers in
     data/_unmatched_carriers.tsv — manual /admin/catalog adds.
  🟢 .env.local in canonical clone has revoked default AS key — 5-min
     Notepad fix. Local scripts will fail until updated.
  🟢 middleware.ts → proxy.ts rename (Next 16 deprecation warning).
  🟢 Wire revalidateVerticalsRefs() into an admin "Refresh verticals"
     button that REFRESH MATERIALIZED VIEW + invalidates the tag.
  🟢 xlsx (SheetJS) high CVE no upstream fix. Used only in scripts/.
     Consider exceljs migration eventually.

DEFAULT STARTING MOVE (per handoff §8 recommendation):
  Option A — install swr (~5KB), wrap /build-list + /saved-lists data
  loaders. UI shows cached data instantly on refresh; revalidation
  fires in background; DOM only re-renders when new data arrives.
  Closest user-facing match to "only new data loads on refresh."
  ~2 hours focused work. Easiest meaningful win after the server-side
  cache shipped in session 3.

  Option B — saved-lists update-detection backend. The has_updates
  column + row-tint UI are ready (since e1bfc89). Build the recompute:
  new snapshot table, scheduled re-eval, flip flag on delta,
  "Download Updates" delta-only export. ~half day, more impactful for
  retention but bigger lift than Option A.

  Option C — per-user data cache via @vercel/kv. Cache app_users +
  v_my_entitlement with short TTL. Saves 1-2 round-trips per authed
  page render. ~half day including infra setup.

Family doctrine (per docs/doctrine, commit 3f45718):
  • ~5 files typical per slice, ask above ~7. Strict 2-file cap reserved
    for high-risk DB / RLS / billing / auth changes.
  • Plan before execute. No paid third-party data services until DOT
    Intel is generating revenue.
  • Native git from C:\Users\GTMin\Projects\saas-agency-database
    (outside OneDrive, GCM auth caches creds).

Sister-product cross-references in scope here:
  - DOT Intel (dotintel.io) — sister product, distinct Supabase
    satellite vbhlacdrcqdqnvftqtin. Cross-reference already live on
    /verticals/transportation.
  - Threshold IQ (staging.thresholdiq.io) — separate satellite
    yyuchyzmzzwbfoovsskz. No cross-reference yet.

Where would you like to start?
```

---

Use the same prompt verbatim as the kickoff message for any new Agency Signal
Claude Code session for the foreseeable future. Update the opening date + the
"end of Session N" pointer when the next handoff is filed.
