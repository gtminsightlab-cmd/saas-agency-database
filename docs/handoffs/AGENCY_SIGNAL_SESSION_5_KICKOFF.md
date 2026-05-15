# Agency Signal — Session 5 Kickoff Prompt

**Date queued:** 2026-05-14 (end of Session 4)
**Predecessor handoff:** [`AGENCY_SIGNAL_SESSION_4_HANDOFF.md`](AGENCY_SIGNAL_SESSION_4_HANDOFF.md)
**Working directory:** `C:\Users\GTMin\Projects\saas-agency-database\` (native git, GCM auth)
**Live site:** https://directory.seven16group.com (auto-deploys `main`)

Paste the block below verbatim into the first message of the next Claude Code session.

---

```
You are continuing the dedicated Agency Signal track — Session 5.

Working directory: C:\Users\GTMin\Projects\saas-agency-database\
Live site: https://directory.seven16group.com (auto-deploys main)
Vercel project: prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV (team team_RCXpUhGENcLjR2loNIRyEmT3)
Supabase satellite: sdlsdovuljuymgymarou ACTIVE_HEALTHY, pg 17.6.1.105
Default tenant: ce52fe1e-aac7-4eee-8712-77e71e2837ce (slug 'seven16')

Before doing anything substantive, read in this order:
  1. docs/handoffs/AGENCY_SIGNAL_SESSION_4_HANDOFF.md  ← THE handoff. Family
     reconciliation + /enterprise tier page + Next 16 hygiene greens. Lists
     full carry-forward + recommended Session 5 starting move.
  2. docs/handoffs/AGENCY_SIGNAL_SESSION_3_HANDOFF.md  ← prior session.
     Next 14→16 upgrade, first caching layer, UX-parity-with-Neilson polish.
  3. docs/STATE.md  ← Agency Signal inside-view (last fully updated end of
     Session 3 — Session 4 deltas are in §5 of the Session 4 handoff)
  4. CLAUDE.md  ← family doctrine pointer
  5. docs/context/DECISION_LOG.md  ← D-001 through D-017 + §6 standing rules.
     NOTE: D-016 (three-domain brand split) and D-017 (no source-attribution
     in directory.*) were added in Session 4. Two new §6 standing rules also
     added — "always recommend next path as CTO/PM" + "no paid services
     until DOT Intel revenue".

State at end of Session 4 (commit 899b47d on main):
  • Stack: Next 16.2.6 + React 19.2.6 + ESLint 10.3 + Tailwind v4
    (unchanged from Session 3)
  • New surfaces this session:
      - /enterprise tier page LIVE (D-015 Distribution Expander ICP).
        832 lines, all D-015 locked numbers, no DB queries beyond auth.
      - "Enterprise" link in MarketingNav between Pricing and Sign in.
      - Sentry pilot via @sentry/nextjs (parallel feat/sentry-install
        session, merged as 899b47d). Errors → directory-admin Sentry
        project. Tunnel route /monitoring.
      - Vercel Speed Insights + Analytics + security headers (HSTS,
        X-CTO, X-Frame, Referrer, Permissions, DNS prefetch) — merged
        earlier today as fea5b34.
  • Hygiene cleanups this session:
      - force-dynamic stripped from /sign-in, /auth/forgot-password,
        /auth/reset-password (none called createClient; now eligible
        for CDN cache).
      - middleware.ts renamed to proxy.ts per Next 16 convention;
        exported function middleware() → proxy(). config.matcher
        unchanged.
  • Family-level: dotintel2 STATE.md still uses superseded local
    D-numbers from its SESSION_26_HANDOFF — carry-forward for the
    dotintel2 next session, NOT this one.

Carry-forward open items (full list in handoff §5):
  🟡 SWR client-cache on /build-list + /saved-lists (~2-2.5 hrs).
     RECOMMENDED as Session 5 starting move. Completes Session 3's
     perf story.
  🟡 Saved-lists update-detection backend (~4-5 hrs). Migration +
     Vercel Cron → Edge Function (per D-013 family template) + delta
     export. Bigger lift, bigger retention impact.
  🟡 Per-user data cache via @vercel/kv (~half day). Caches
     app_users + v_my_entitlement.
  🟢 .gitignore has uncommitted .vercel line in working tree —
     decide commit-or-revert.
  🟢 .env.local has revoked default AS service-role key — 5-min
     Notepad fix from the user (don't pass secrets through chat).
  🟢 Carrier-table dedupe migration (low priority).
  🟢 ~150 long-tail novel carriers in data/_unmatched_carriers.tsv
     still need /admin/catalog rows.
  🟢 Wire revalidateVerticalsRefs() into admin "Refresh verticals"
     button.

Recommended starting move (per handoff §6):
  Option A — SWR client-cache on /build-list + /saved-lists. Install
  swr (~5KB), wrap data loaders in useSWR, verify revalidation on
  focus + manual refresh. Closest user-facing match to "only new
  data loads on refresh." 2-2.5 hours.

  Option B — Saved-lists update-detection backend. Use D-013's
  Vercel-Cron → Edge-Function template for the recompute job.
  4-5 hours, more impactful for retention.

  Option C — Per-user @vercel/kv cache. Half day including infra.

Family doctrine reminders (per docs/context/ENGINEERING_DOCTRINE.md):
  • ~5 files typical per slice, ask above ~7. Strict 2-file cap
    reserved for high-risk DB / RLS / billing / auth changes.
  • Plan-before-execute on substantive work: 5–10 bullets, thumbs-up,
    then implement.
  • Always recommend next path as CTO/PM — don't hand back flat menus.
  • No paid third-party data services until DOT Intel revenue.
  • Native git from this canonical clone outside OneDrive. GCM caches
    creds.
  • Secrets never in chat — clipboard → dashboard or local-file-then-
    script only.

Sister-product cross-references in scope:
  • DOT Intel (dotintel.io, dotcarriers.io, dotagencies.io per D-016)
    — sister product, distinct Supabase satellite vbhlacdrcqdqnvftqtin.
    Cross-reference already live on /verticals/transportation.
  • Threshold IQ (staging.thresholdiq.io) — separate satellite
    yyuchyzmzzwbfoovsskz. No cross-reference yet.

Where would you like to start?
```

---

— end AGENCY_SIGNAL_SESSION_5_KICKOFF —
