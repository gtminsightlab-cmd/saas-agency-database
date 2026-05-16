# Family-Hub SESSION_24 — Paste-Ready Opening Prompt

**Date queued:** 2026-05-15 (end of SESSION_23)
**Predecessor handoff:** [`SESSION_23_PRICING_REFINEMENT_HANDOFF.md`](SESSION_23_PRICING_REFINEMENT_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT the OneDrive path)
**Live site:** https://directory.seven16group.com

Paste the block below verbatim into the first message of the next Claude Code session.

---

```
This is the SESSION_OPENER for Seven16 family-hub SESSION_24.

═══════════════════════════════════════════════════════════════
STEP 0 — VERIFY WORKING DIRECTORY BEFORE ANYTHING ELSE
═══════════════════════════════════════════════════════════════

Run `pwd` (or `Get-Location` in PowerShell) and confirm output is:

  C:\Users\GTMin\Projects\saas-agency-database

If you see ANY of these paths instead, STOP and alert Master O:
  - C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database
  - Any path under \OneDrive\
  - Any path other than the canonical native-git clone above

Why this matters: per family memory `reference_git_repo_state.md`, the
OneDrive `.git` is PERMANENTLY BROKEN (OneDrive sync corrupts git
internals). Any git operation from the OneDrive path will fail.

If wrong directory, tell Master O exactly this:
  "Wrong working directory. Please close this Claude Code session and
   relaunch from the canonical path: open PowerShell, run
   `cd C:\Users\GTMin\Projects\saas-agency-database`, then run
   `claude` from that directory. Then paste this prompt again."

DO NOT proceed past Step 0 if the working directory is wrong.

═══════════════════════════════════════════════════════════════
STEP 1 — CONTEXT (only after Step 0 passes)
═══════════════════════════════════════════════════════════════

You are continuing the Seven16 family-hub track — SESSION_24.

Working directory: C:\Users\GTMin\Projects\saas-agency-database\
Live site: https://directory.seven16group.com
Vercel project: prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV
Supabase satellite: sdlsdovuljuymgymarou (Agency Signal)
Default tenant: ce52fe1e-aac7-4eee-8712-77e71e2837ce

Before doing anything substantive, read in this order (Working
Agreement Rule 6):

  1. docs/BACKLOG.md  ← STRATEGIC continuity (last updated end of AS
     Session 4; may need a refresh sweep this session)
  2. docs/handoffs/SESSION_23_PRICING_REFINEMENT_HANDOFF.md  ← TACTICAL
     state. Yesterday's pricing refinement marathon close (Learning
     Center locked, Directory refined, Anti-Decay Protocol created).
  3. docs/handoffs/SESSION_22_PRICING_HANDOFF.md  ← prior handoff
     (D-018 + D-019 [superseded] + D-020 + D-021 locks, Charter
     integrations).
  4. docs/context/DECISION_LOG.md  ← D-001 through D-021 + §6 standing
     rules. Read D-021 carefully + the amendment notes on D-018 +
     supersession on D-019.
  5. docs/context/ANTI_DECAY_PROTOCOL.md  ← new from SESSION_23; 6-
     mechanism cross-product anti-decay system.
  6. docs/context/MASTER_CONTEXT.md  ← family hub
  7. docs/STATE.md  ← Agency Signal inside-view

═══════════════════════════════════════════════════════════════
STEP 2 — STATE AT SESSION OPEN
═══════════════════════════════════════════════════════════════

  • HEAD: see git log -1 (latest = SESSION_23 close commit 7918a30)
  • Pricing architecture FULLY locked across 7 surfaces:
      - Universal credits ($0.15/credit, bonus bands)
      - TIQ ($500/$1,500/$4,000 tiers + onboarding model)
      - DOT Alerts (flat tier bands $25 to $500+)
      - Directory listings (carriers FREE, agents $120/yr,
        wholesalers $1,000/mo)
      - Lead downloads (1 credit = $0.15, lookup+PDF 3 credits)
      - Learning Center ($29.95/seat + 1-25 toggle)
      - Charter Member integrations across all 5 paid surfaces
  • Charter Member compound savings model: $5,000+/year baseline
    for 15-truck-fleet + TIQ Growth + Agency Signal + alerts.
  • Charter Member deck on Desktop: pricing content fully updated,
    ready for Gamma render (Master O's action, not Claude's).
  • Anti-Decay Protocol created (NEW) — 6 mechanisms documented,
    none implemented yet.

═══════════════════════════════════════════════════════════════
STEP 3 — ACTIVE ARC FOR SESSION_24
═══════════════════════════════════════════════════════════════

CTO recommendation = Path B then Path A.

**Path B FIRST (~30 min): Implement Anti-Decay Protocol mechanism #1
— Family Health Snapshot doc.** Create
`docs/context/FAMILY_HEALTH.md` with first snapshot of all 4 repos
(saas-agency-database, dotintel2, seven16-distribution,
seven16-platform). Pulls per-repo:
  - last commit date (git log -1 --format=%cs)
  - Active arc + days in-flight
  - days-since-last-session
  - Queued-item-aging counts (0-7d, 8-30d, 31-60d, 61-90d, >90d)
  - cross-product dependency status

This is foundational for the rest of the Anti-Decay Protocol — gives
Master O the cross-product visibility he asked for in SESSION_23.

**Path A NEXT (~1 full session in its own slot): Stripe catalog
migration around D-021 architecture.** Every locked pricing surface
now has real SKUs to render. Build:
  - Stripe products + prices for all 7 pricing surfaces
  - Entitlements schema migration in seven16-platform satellite
  - Cart/checkout wiring for à la carte + cross-sell discount math
  - Charter Member SKU flagging in entitlements
    (best-tier-on-everything)

This unblocks Charter Member outreach revenue capture — highest
single-session ROI from here. Use Stripe MCP; webhooks via dashboard
only (per memory `feedback_stripe_mcp_webhook_dashboard_only.md`).

═══════════════════════════════════════════════════════════════
STEP 4 — SCOPE THIS SESSION (Path B, ~30 min, ~2 files)
═══════════════════════════════════════════════════════════════

1. Create `docs/context/FAMILY_HEALTH.md` with snapshot per repo +
   cross-product dependency map.
2. Amend `docs/WORKING_AGREEMENT.md` Rule 5 (or add Rule 8) in the
   saas-agency-database repo to note "Update FAMILY_HEALTH.md at
   session close if material change to repo state."
3. Per Working Agreement Rule 5: write SESSION_24_HANDOFF.md + push +
   SESSION_25_PROMPT.md.

DO NOT in this session:
  • Build the Stripe catalog (that's Path A, separate session)
  • Touch D-021 or its amendments (locked per Working Agreement Rule 4)
  • Update WORKING_AGREEMENT.md across all 3 repos in this session
    (Rule 2 — one session per repo; do the saas-agency-database
    amendment only; the other repos' WORKING_AGREEMENT updates
    happen in their next sessions)

═══════════════════════════════════════════════════════════════
STEP 5 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

Anti-slop discipline (family standing rule per
`feedback_no_slop_in_copy.md`):
  • Any copy you write — handoff prose, slide copy, marketing — must
    avoid generic AI-flavored cadence. Specific numbers, real voice,
    evidence-backed claims.

Family doctrine reminders:
  • ~5 files typical per slice, ask above ~7
  • Plan-before-execute: 5-10 bullets, thumbs-up, then implement
  • Always recommend next path as CTO/PM
  • Native git from C:\Users\GTMin\Projects\saas-agency-database\
    (NOT the OneDrive path — see Step 0)
  • Secrets never in chat

Open implementation queue (surface as relevant during planning):
  • Stripe catalog migration (Path A, next session)
  • Growtheon SKU pricing spec (DECISION_LOG §9 open question #2)
  • PRICING_CREDITS_AND_TOPUPS.md amendment banner (trivial)
  • Quote-routing fees operational spec ($100-300/lead per
    `project_dotagencies_dotcarriers_monetization_model.md`)
  • Agency dashboard for Learning Center team-pack admin
    (build-side, defer to dotintel2 session when team packs ship)

═══════════════════════════════════════════════════════════════

Confirm Step 0 passed, then start reading the files in Step 1 order.
After reading, propose a 5-10 bullet plan for Path B (Family Health
Snapshot). Wait for thumbs-up before executing.
```

---

— end SESSION_24 prompt (REVISED with directory-check guard) —
