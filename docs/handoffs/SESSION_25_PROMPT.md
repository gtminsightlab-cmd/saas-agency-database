# SESSION_25 — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-15 (end of SESSION_24)
**Predecessor handoff:** [`SESSION_24_HANDOFF.md`](SESSION_24_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT the OneDrive path)
**Live site:** https://directory.seven16group.com

Paste the block below verbatim into the first message of the next Claude Code session.

---

```
This is the SESSION_OPENER for Seven16 family-hub SESSION_25.

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

You are continuing the Seven16 family-hub track — SESSION_25.

Working directory: C:\Users\GTMin\Projects\saas-agency-database\
Live site: https://directory.seven16group.com
Vercel project: prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV
Supabase satellite (Agency Signal): sdlsdovuljuymgymarou
Supabase satellite (seven16-platform control plane): soqqmkfasufusoxxoqzx
Default tenant: ce52fe1e-aac7-4eee-8712-77e71e2837ce
Stripe sandbox: acct_1TLUF6HmqSDkUoqw (DOT Intel sandbox / shared)

Before doing anything substantive, read in this order (Working
Agreement Rule 6):

  1. docs/BACKLOG.md  ← Anti-decay layer; read first per Rule 6.
  2. docs/context/FAMILY_HEALTH.md  ← Cross-product snapshot (NEW
     from SESSION_24). Glance at per-repo table + dependency map.
  3. docs/handoffs/SESSION_24_HANDOFF.md  ← Most recent family-hub
     handoff.
  4. docs/context/DECISION_LOG.md  ← D-001 through D-021 + §6
     standing rules. Read D-021 carefully — the Stripe catalog
     renders D-021's 7 pricing surfaces.
  5. docs/context/PRICING_*.md  ← All 7 operational pricing specs.
     Each surface's SKUs come straight from these.
  6. docs/context/ANTI_DECAY_PROTOCOL.md  ← The protocol. SESSION_25
     close should refresh FAMILY_HEALTH.md per Rule 5 step 1.

═══════════════════════════════════════════════════════════════
STEP 2 — STATE AT SESSION OPEN
═══════════════════════════════════════════════════════════════

  • HEAD: see `git log -1` (latest = SESSION_24 close commit)
  • Pricing architecture FULLY locked across 7 surfaces — see
    FAMILY_HEALTH.md "D-021 pricing architecture lock status" table.
  • FAMILY_HEALTH.md v1 shipped SESSION_24 — first cross-product
    visibility doc; Charter Member outreach is `[PENDING]` until
    Stripe catalog ships.
  • Stripe still sandbox-only. No live cutover yet.
  • Charter Member deck content updated SESSION_23; Gamma render
    pending Master O action.

═══════════════════════════════════════════════════════════════
STEP 3 — ACTIVE ARC FOR SESSION_25
═══════════════════════════════════════════════════════════════

**Path A — Stripe catalog migration around D-021 architecture
(~1 full session, ~5-8 files).**

Build the Stripe products + prices + entitlements that render the
locked D-021 pricing architecture into actual checkout. Unblocks
Charter Member outreach revenue capture — the highest single-session
ROI move from here per FAMILY_HEALTH.md dependency map.

Scope:

  (a) **Stripe products + prices for all 7 D-021 surfaces:**
      1. Universal credits (top-up bands with bonus multipliers)
      2. TIQ tiers (Launch $500 / Growth $1,500 / Scale $4,000 +
         overages + storage)
      3. DOT Alerts flat bands ($25 / $50 / $90 / $175 / $350 /
         $500+ Enterprise)
      4. Directory listings (DOT carriers FREE, retail agents
         $120/yr, agency $120 + $60/loc, wholesalers $1,000/mo)
      5. Lead downloads (1 credit = $0.15, full-DB SKU ~$12,500)
      6. Learning Center ($29.95/seat + 1-25 team-pack toggle)
      7. Charter Member SKU flagging (best-tier-on-everything via
         entitlements metadata)

  (b) **Entitlements schema migration** in `seven16-platform`
      satellite (`soqqmkfasufusoxxoqzx`):
      - `customer_entitlements` per D-015 §7 (state-level RLS +
        outcome SKU attribution)
      - `credit_wallets`, `credit_ledger`, `credit_consumption_rates`
        per D-014 (verify first — scaffolding may exist in
        `sdlsdovuljuymgymarou` per BACKLOG #5)
      - Charter Member flag column on customer/account table

  (c) **Cart / checkout wiring** for à la carte + cross-sell
      discount math (volume bonus bands on credits, tier-locking on
      directory/alerts/TIQ submissions). Overflow protection on
      Enterprise+ bundle ladder per D-015 §3.4 (`final_price = min(
      computed_bundle, $12,500)`).

  (d) **Webhook endpoints via Stripe dashboard ONLY** per memory
      `feedback_stripe_mcp_webhook_dashboard_only.md` (Stripe MCP
      exposes products/prices but NOT webhook endpoint ops).
      Required events: `checkout.session.completed`,
      `customer.subscription.updated`, `customer.subscription.deleted`,
      `invoice.paid`. Use the URL-prefilled-events trick from the
      memory to skip the broken event-search UI.

Tools: Stripe MCP for product/price creation; Supabase MCP for the
seven16-platform migration; Bash for native git commits.

═══════════════════════════════════════════════════════════════
STEP 4 — SCOPE THIS SESSION (~1 full session, ~5-8 files)
═══════════════════════════════════════════════════════════════

  1. Plan a session-opening 7-10 bullet sub-plan covering:
     - Which surface to build Stripe products for first (CTO
       recommendation: start with TIQ tiers because they're 3-SKU,
       clean per-org subscriptions; then Directory listings; then
       Credits/top-ups; then DOT Alerts; defer Enterprise+ state-
       slider to its own session per D-015 complexity).
     - Entitlements migration shape (one big migration vs.
       per-surface).
     - Charter Member flag mechanism.
     - Webhook events to register.
  2. Wait for thumbs-up before executing.
  3. Per Working Agreement Rule 5 close: refresh `FAMILY_HEALTH.md`
     (dependency map: Stripe catalog should flip from `[PENDING]` to
     `[LIVE]`; Charter Member revenue capture should flip from
     `🟡 Blocked` to `🟢 Live`), write SESSION_25_HANDOFF.md, push,
     write SESSION_26_PROMPT.md.

═══════════════════════════════════════════════════════════════
STEP 5 — DO NOT in this session
═══════════════════════════════════════════════════════════════

  • Touch D-021 or any locked pricing decision (locked per Rule 4)
  • Build the `/checkout` UI — Stripe SKUs + entitlements first;
    UI is its own session
  • Update WORKING_AGREEMENT.md across dotintel2 or
    seven16-distribution (Rule 2 — those cascades happen in those
    repos' own next sessions per BACKLOG #3; cascade now covers
    BOTH Rule 2(b) cross-repo prep artifact pattern + Rule 5
    FAMILY_HEALTH update)
  • Build Enterprise+ state-slider SKUs (D-015 complexity — its own
    session)
  • Skip webhook signature verification (security gate per
    `project_pre_launch_security_gates.md`)

═══════════════════════════════════════════════════════════════
STEP 6 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

Anti-slop discipline (family standing rule per
`feedback_no_slop_in_copy.md`): any product names, SKU display
names, or marketing copy in Stripe metadata must be specific,
voice-distinct, evidence-backed. NO generic AI-flavored cadence.

Family doctrine reminders:
  • ~5 files typical per slice, ask above ~7 — Stripe catalog may
    legitimately need 5-8 due to the breadth of D-021 surfaces
  • Plan-before-execute: 7-10 bullets, thumbs-up, then implement
  • Always recommend next path as CTO/PM
  • Native git from C:\Users\GTMin\Projects\saas-agency-database\
    (NOT the OneDrive path — see Step 0)
  • Secrets never in chat — Stripe keys via Vercel env vars or
    dashboard; never paste keys in conversation

Open implementation queue (surface as relevant during planning):
  • Cascade Rule 2(b) + Rule 5 amendments to dotintel2 +
    seven16-distribution (BACKLOG #3 — 5 min each in their
    respective next sessions, NOT this session). Rule 2(b) =
    cross-repo prep artifact exception; Rule 5 = FAMILY_HEALTH.md
    update at close.
  • PRICING_CREDITS_AND_TOPUPS.md amendment banner (trivial)
  • Quote-routing fees operational spec ($100-300/lead per
    `project_dotagencies_dotcarriers_monetization_model.md`)
  • Growtheon SKU pricing spec (DECISION_LOG §9 open question #2)

═══════════════════════════════════════════════════════════════

Confirm Step 0 passed, then start reading the files in Step 1 order.
After reading, propose a 7-10 bullet plan for Path A (Stripe catalog
migration). Wait for thumbs-up before executing.
```

---

— end SESSION_25 prompt —
