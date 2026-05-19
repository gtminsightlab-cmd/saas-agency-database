# SESSION_C — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-19 (end of Session B — Texas load COMPLETE)
**Predecessor handoff:** [`SESSION_B_HANDOFF.md`](SESSION_B_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com

---

**Session B finished in one go** — the 367,484-row Texas DOI appointment load completed end-to-end after Master O refreshed the service-role key mid-conversation. `public.agency_carriers` now has 367,457 Texas rows tagged `source_type='state_doi_tx'` (+16,785 new TX agencies, +638 new carriers). Pillar 3 is real for Texas.

**Session C = resume the paused Sessions 27-32 internal-app redesign epic with SESSION_28.** The pause was deliberate per the Session A pivot ("data work > UI re-skinning for product moat"); now that the data lands, the Vertical Intelligence redesign is meaningfully stronger because `/verticals` and `/verticals/[slug]` can show real state-resolved appointment density.

Paste the block below verbatim into the first message of the next Claude Code session.

---

```
This is the SESSION_OPENER for Seven16 family-hub Session C —
resume SESSION_28 (Intelligence Home + Vertical Intelligence redesign).

═══════════════════════════════════════════════════════════════
STEP 0 — VERIFY WORKING DIRECTORY
═══════════════════════════════════════════════════════════════

Run `pwd` (PowerShell: `Get-Location`) and confirm output is:

  C:\Users\GTMin\Projects\saas-agency-database

If you see anything under \OneDrive\ or \.claude\projects\, STOP
and alert Master O. Do NOT proceed past Step 0 if wrong.

═══════════════════════════════════════════════════════════════
STEP 1 — CONTEXT (only after Step 0 passes)
═══════════════════════════════════════════════════════════════

You are continuing the Seven16 family-hub track — Session C.
Sessions A + B (the state DOI appointment load arc) shipped in
the prior conversation. Texas DOI 2026 data is LIVE in
`public.agency_carriers` (367,457 rows tagged source_type='state_doi_tx').

Working directory: C:\Users\GTMin\Projects\saas-agency-database\
Live site: https://directory.seven16group.com
Supabase satellite: sdlsdovuljuymgymarou
Default tenant: ce52fe1e-aac7-4eee-8712-77e71e2837ce

Read in this order (Working Agreement Rule 6):

  1. docs/BACKLOG.md  ← Active arc is back to Sessions 27-32 epic.
                        SESSION_28 is next slice.
  2. docs/handoffs/SESSION_B_HANDOFF.md  ← Texas load shipped;
                                            final results at bottom.
  3. docs/handoffs/SESSION_28_PROMPT.md  ← Original SESSION_28 brief.
                                            STILL VALID. Read in full.
  4. docs/context/DECISION_LOG.md D-024  ← Front-end production
                                            standard (10-standard /
                                            12-point DoD).
  5. docs/context/ENGINEERING_DOCTRINE.md §"Front-end production
     standard (D-024)" — required.
  6. Existing app surfaces to touch this session:
     - app/verticals/page.tsx (current — needs redesign)
     - app/verticals/[slug]/page.tsx (detail — needs polish)
     - components/marketing/VerticalCardsSection.tsx (live-data wiring
       reference but does NOT use AppShell)
     - components/app/* (5 primitives shipped Session 27)
     - components/app/sidebar.tsx (add Home link when /home exists)

═══════════════════════════════════════════════════════════════
STEP 2 — KEY DELTA FROM ORIGINAL SESSION_28 PROMPT
═══════════════════════════════════════════════════════════════

The Vertical Intelligence redesign is now meaningfully stronger
because Texas appointment data is live. Specifically:

  • mv_vertical_summary should now show real Texas data when joined
    against the new 367k agency_carriers rows. Refresh the MV before
    SESSION_28 starts — `REFRESH MATERIALIZED VIEW mv_vertical_summary`
    via MCP execute_sql. If the MV def doesn't include state_filed
    in its query, that's a separate decision (whether to extend it
    to surface "Texas-specific specialist agencies" as a new pillar
    drill-down).

  • VerticalOpportunityCard cards (Session 28 Slice 3) can show TX-
    specific agency counts as a sub-metric where the data is dense.

  • Don't backfill SESSION_28 scope to chase the new data — just
    let the existing query patterns benefit from richer underlying
    rows. The 9-slice plan in SESSION_28_PROMPT.md stays.

═══════════════════════════════════════════════════════════════
STEP 3 — SESSION_28 PLAN (unchanged from original)
═══════════════════════════════════════════════════════════════

Follow the 9-slice plan in SESSION_28_PROMPT.md verbatim.
Highlights for memory:

  Slice 1 — Audit existing /verticals surfaces (~15 min, 0 writes)
  Slice 2 — NEW /home route scaffolding (~30 min, 2 files)
  Slice 3 — VerticalOpportunityCard primitive (~30 min, 1 file)
  Slice 4 — /home page body with 4 KPI cards + Recommended Plays +
            Recent Activity + Quick Actions (~60 min, 1 file)
  Slice 5 — /verticals page redesign with AppShell + PageHeader +
            VerticalOpportunityCard grid (~60 min, 1 file)
  Slice 6 — /verticals/[slug] detail polish (~45 min, 1 file)
  Slice 7 — Add Home link to sidebar (~10 min, 1 file)
  Slice 8 — Apply-on-touch D-024 cleanup on 3 pre-existing
            jsx-a11y errors flagged in SESSION_26 (~30 min, 2 files)
  Slice 9 — D-024 DoD verify + commit + push + Vercel verify (~30 min)

Total: ~6 hours, ~10-12 committed files.

═══════════════════════════════════════════════════════════════
STEP 4 — DO NOT in this session
═══════════════════════════════════════════════════════════════

  • Touch the 367,457 newly-loaded state_doi_tx agency_carriers rows
    (they're data; SESSION_28 is UI)
  • Dedup the 16,785 new TX agencies vs the 3,086 originals — that
    is a separate cleanup session, queued post-SESSION_28
  • Start loading another state's DOI file (FL/CA/NY etc.) — queued
    as own session, NOT this one
  • Touch the 3 pending Master-O dashboard tasks (CRON_SECRET, Stripe
    webhook, Sentry token from SESSION_25)
  • Re-litigate the conservative-fallback NAIC mapping decision
    (locked Session B; documented in
    [[feedback_conservative_fallback_fuzzy_match_loads]])
  • Re-litigate Tailwind palette swap / Sidebar relabel / per-page
    composition pattern (all locked SESSION_27)
  • Build a standalone referral / affiliate / partner system
    (parent partner hub owns this per
    [[project_seven16_partner_program]])

═══════════════════════════════════════════════════════════════
STEP 5 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

  • Plan-before-execute: announce the 9 slices, thumbs-up before
    files
  • D-024 12-point DoD on every screen touched
  • Apply-on-touch D-024 cleanup on pre-existing tech debt
  • Always recommend next path as CTO/PM, not flat menu
  • Native git from C:\Users\GTMin\Projects\saas-agency-database\
  • Secrets never in chat — clipboard → dashboard
  • Anti-slop on any copy
  • RLS forced on every new multi-tenant table (D-006)
  • Run advisors after any DDL (none expected this session)

═══════════════════════════════════════════════════════════════

Confirm Step 0, then read the files in Step 1 order. After reading,
propose the 9-slice Session 28 plan (or whatever slice count fits
Master O's bandwidth) for thumbs-up before executing.
```

---

— end Session C prompt —
