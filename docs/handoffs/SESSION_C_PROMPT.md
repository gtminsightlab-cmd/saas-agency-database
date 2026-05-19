# SESSION_C — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-19 (end of Session B + post-load Master O directive on `seven16groupsupport.com` integration)
**Predecessor handoff:** [`SESSION_B_HANDOFF.md`](SESSION_B_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com
**Source brief:** [`docs/Customer Support and Sales AI Agent.txt`](../Customer Support and Sales AI Agent.txt) — Master O's paste-into-every-product readiness directive

---

## What changed since Session B close

Master O dropped a new family-architectural directive: a centralized AI sales/support/onboarding/account-management/affiliate-vetting SaaS at **`seven16groupsupport.com`** is being built as a standalone family product. Every other Seven16 product (DotIntel, DotCarriers, DotAgencies, Agency Signal, BindLab) needs to prepare for the eventual widget mount + signed-context-token + event-posting + ticket-linking integration — but **lightweight readiness only** ("support-integratable, not support-dependent"). No widget mount yet, no deep coupling, no AI prompts in this session.

Session C is the Agency Signal slice of that readiness work. **SESSION_28 (Intelligence Home + Vertical Intelligence) is pushed to Session D.**

Why this sequencing: support widget placeholder needs to exist (with safe context patterns documented) BEFORE the UI redesign touches screens that might mount it. Foundation-first. Also the readiness work is small enough that bundling it into SESSION_28 would dilute the UI focus.

---

Paste the block below verbatim into the first message of the next Claude Code session.

```
This is the SESSION_OPENER for Seven16 family-hub Session C —
Seven16 Group Support integration readiness (Agency Signal slice).

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

Master O is building seven16groupsupport.com — a standalone AI
sales/support/onboarding/account-management/affiliate-vetting SaaS
that will plug into ALL Seven16 family products. Each product
(this one = Agency Signal, product_slug=`agencysignal`) needs
LIGHTWEIGHT integration readiness — env vars, doc, helper stubs,
widget placeholder component, internal-API route stubs.

Architecture rule (locked, do NOT violate):
"This product should be support-integratable, not support-dependent."

Concretely that means:
  • Agency Signal continues to work if seven16groupsupport.com is down
  • No deep coupling to support-platform internals
  • No support conversations stored in agencysignal DB
  • No support-platform write access to agency_carriers / agencies /
    contacts / saved_lists
  • Widget placeholder is NOT mounted globally this session — just
    written as a non-breaking component file

Working directory: C:\Users\GTMin\Projects\saas-agency-database\
Live site: https://directory.seven16group.com
Supabase satellite: sdlsdovuljuymgymarou
Product slug: agencysignal
Support platform domain (does NOT exist yet — placeholder for env):
  https://seven16groupsupport.com

Read in this order (Working Agreement Rule 6):

  1. docs/BACKLOG.md — active arc is now Support Integration Readiness
  2. docs/Customer Support and Sales AI Agent.txt — the source brief
     (Master O's paste-into-every-product directive). Read FULLY.
  3. docs/handoffs/SESSION_B_HANDOFF.md — Texas load shipped end-state
  4. docs/context/DECISION_LOG.md — D-024 (front-end production
     standard still applies to any new component this session)
  5. Existing app surfaces to be aware of (do NOT touch this session
     unless safe to wrap):
     - app/layout.tsx (where the widget would eventually mount —
       NOT this session)
     - app/api/* (existing API route patterns to mirror)
     - .env.local + .env.local.example (where new env vars land)
     - components/ui/* + components/app/* (existing primitive patterns)
     - lib/* (helper patterns)

═══════════════════════════════════════════════════════════════
STEP 2 — PROPOSED 9-SLICE PLAN (~2.5-3 hrs total, ~10-12 files)
═══════════════════════════════════════════════════════════════

  1. **Repo assessment** (~15 min, 0 writes). Confirm: existing auth
     pattern (Supabase Auth), existing API route shape, existing
     env-var conventions, any existing "support/help/contact" surfaces
     (probably none). Surface what would need to be touched at
     future widget-mount time (NOT this session).

  2. **Add env vars to .env.local.example** (~10 min, 1 file). Add:
       NEXT_PUBLIC_PRODUCT_SLUG=agencysignal
       NEXT_PUBLIC_SUPPORT_URL=https://seven16groupsupport.com
       SUPPORT_PLATFORM_API_URL=https://seven16groupsupport.com/api/v1
       SUPPORT_PLATFORM_API_KEY=
       SUPPORT_CONTEXT_SIGNING_SECRET=
       SUPPORT_WEBHOOK_SECRET=
     Do NOT add to .env.local itself (that's secrets territory;
     Master O sets values when seven16groupsupport.com goes live).

  3. **NEW docs/support-integration-readiness.md** (~30 min, 1 file,
     ~150-200 lines). Agency-Signal-specific version of the source
     brief Section 14. Contents:
     - Product slug: agencysignal
     - Support integration strategy (integratable not dependent)
     - Widget placement plan (sticky bottom-right, NOT mounted yet)
     - Safe context payload spec for agencysignal users
     - API endpoint plan (4 stub routes)
     - Event plan (Agency-Signal-specific events from source brief
       Section 8 + custom: lead_list_created, email_verification_*,
       credits_exhausted, upgrade_clicked, api_key_question_started)
     - Security notes (signed JWT, origin allowlist, no service-role
       key exposure, RLS-compatible context)
     - Open questions
     - Implementation status: "Readiness shipped Session C; widget
       mount + signed token + event posting all deferred until
       seven16groupsupport.com is live"

  4. **NEW components/support/Seven16SupportWidget.tsx** (~30 min,
     1 file, ~80 lines). Non-mounting placeholder component. Props
     type matches source brief Section 1. Currently returns null
     (or a hidden DOM marker for debugging). Includes JSDoc explaining
     "DO NOT mount yet" + future mount-point recommendations.
     D-024 placeholder semantics: server component, no client JS at
     this stage.

  5. **NEW lib/support/context.ts** (~30 min, 1 file, ~120 lines).
     Builds safe support context payload per source brief Section 3.
     Includes:
     - SafeSupportContext type
     - buildSafeSupportContext(args) function returning the payload
       shape (product_slug=agencysignal, user_id, organization_id,
       email, role, plan, account_status, current_path, mode,
       issued_at, expires_at)
     - Explicit allowlist enforcement (NEVER includes API keys,
       secrets, payment, full DB records, passwords)
     - Stub for signed-token generation (`signSupportContext`) —
       returns "TODO_SIGN" placeholder until SUPPORT_CONTEXT_SIGNING_SECRET
       is set
     - JSDoc with security warnings

  6. **NEW lib/support/events.ts** (~20 min, 1 file, ~100 lines).
     Event-emit helper per source brief Section 8 + Agency-Signal-specific
     event names (Sub-section "Agency Signal"). Stub `emitSupportEvent(name, payload)`:
     - In dev/no-config: console.debug only
     - With SUPPORT_PLATFORM_API_URL configured: POST to /events
       endpoint (TODO when seven16groupsupport.com exists)
     - Type-safe event name enum
     - JSDoc with usage examples

  7. **NEW 4 API route stubs** (~30 min, 4 files in
     app/api/internal/support/{context,events,ticket-link,health}/route.ts).
     Each returns 501 Not Implemented with a clear message + auth
     gate scaffolding (server-to-server API key check via header).
     Health route can return 200 OK with payload showing readiness state.
     Mirror existing API route patterns from this codebase.

  8. **CLAUDE.md awareness note + memory file** (~15 min, 1-2 files).
     Add a short paragraph to CLAUDE.md (project-level) noting
     `seven16groupsupport.com` is the family support layer + this
     repo has Stage-1 readiness shipped. Optionally add a small
     project memory at `~/.claude/projects/.../memory/project_seven16group_support_integration.md`
     so future sessions in OTHER family repos know Agency Signal
     is ready (cross-repo coordination).

  9. **D-024 verify + commit + push + Vercel verify + Session D
     prompt** (~30 min). Per D-024: any NEW component + UI surface
     must pass the 12-point DoD. The widget placeholder is null-rendering
     so DoD is trivially satisfied; lib/* helpers don't render UI.
     `npm run build` smoke test. Single squash commit:
       feat(seven16-support): Agency Signal integration readiness (Session C)
     Push + verify Vercel READY. Write SESSION_D_PROMPT.md =
     resume SESSION_28 (Intelligence Home + Vertical Intelligence)
     per the original SESSION_28_PROMPT.md plan.

═══════════════════════════════════════════════════════════════
STEP 3 — DO NOT in this session
═══════════════════════════════════════════════════════════════

  • Mount the Seven16SupportWidget anywhere globally
  • Add support-platform secrets to .env.local (those land when
    seven16groupsupport.com goes live; placeholders only in
    .env.local.example)
  • Build actual API calls to seven16groupsupport.com (it doesn't
    exist yet; route stubs return 501)
  • Wire any support-platform write access to public.* tables
  • Hardcode AI prompts (the support-platform owns prompts)
  • Store conversation/message tables in agencysignal DB (the
    support-platform owns those)
  • Touch the 367k Texas appointment rows from Session B
  • Touch Sessions 27-32 UI work (SESSION_28 → Session D)
  • Re-litigate Texas load decisions (locked Session B)
  • Build the support platform itself (separate repo, separate
    Vercel project, separate session)

═══════════════════════════════════════════════════════════════
STEP 4 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

  • Plan-before-execute: announce the 9 slices, thumbs-up before
    files
  • D-024 12-point DoD on every UI surface touched (just the widget
    placeholder this session; helpers are non-rendering)
  • Apply-on-touch D-024 cleanup on any file edited
  • Always recommend next path as CTO/PM
  • Native git from C:\Users\GTMin\Projects\saas-agency-database\
  • Secrets never in chat — clipboard → dashboard
  • RLS forced on any new multi-tenant table (none planned)
  • Architecture rule: support-INTEGRATABLE, not support-DEPENDENT
    — if you write code that breaks Agency Signal when
    seven16groupsupport.com is offline, you've broken the rule

═══════════════════════════════════════════════════════════════

Confirm Step 0, then read the files in Step 1 order (especially
docs/Customer Support and Sales AI Agent.txt in full). After
reading, propose the 9-slice plan for thumbs-up before writes.
```

---

## Session D queued (after Session C closes)

**SESSION_28 — Intelligence Home + Vertical Intelligence redesign.** Original brief at [`SESSION_28_PROMPT.md`](SESSION_28_PROMPT.md) still valid. Vertical Intelligence redesign now backed by real Texas appointment density from Session B.

---

— end Session C prompt —
