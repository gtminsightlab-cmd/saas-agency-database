# SESSION_40 — Domain cutover D-037 (2026-05-27)

**Date:** 2026-05-27
**Branch:** `main`
**Predecessor:** [`SESSION_39_HANDOFF.md`](SESSION_39_HANDOFF.md) + [`SESSION_40_PROMPT.md`](SESSION_40_PROMPT.md) (the queued prompt)
**Doctrine ref:** D-037 (URL + brand updates 2026-05-27) — see [`docs/context/DECISION_LOG.md`](../context/DECISION_LOG.md)
**Outcome:** Three coordinated URL/brand changes landed in code + docs + family memory. Master O dashboard actions pending to fully activate.

---

## Why this session ran

Master O directive 2026-05-27 — needed the `agencysignal.co` → `agencysignal.io` cutover done NOW because Stripe enablement work for the family products is blocked on the canonical URL being stable. Stripe Checkout success_url + webhook + receipts emit the canonical URL; shipping SKUs against `.co` would mean re-shipping later. Cutover spans code + .support/ + operator docs + Stripe webhook URL + Vercel primary-domain config in lockstep (mirror of the SESSION_38 cutover pattern).

While the cutover was being scoped, two other URL/brand changes surfaced and were folded in:
- **Seven16 Email URL normalization** — `api.seven16email.com` → `seven16email.com` (root domain, matches family pattern of seven16command.com / seven16survey.com / agencysignal.io)
- **Bind Lab Academy → Seven16 Academy rebrand** at `seven16academy.com` (was `bindlab.app`); supersedes D-029's academy-domain portion

---

## Files touched

### Active code surfaces (Sub-wedge 1)

| File | Change |
|---|---|
| `next.config.mjs` | 301 redirect chain updated: legacy `directory.seven16group.com` AND `agencysignal.co` both now redirect directly to `agencysignal.io` (no `.co` middle hop). Comment block expanded with full rotation history. |
| `lib/stripe/server.ts` | `APP_URL` fallback flipped to `"https://agencysignal.io"` |
| `.env.local.example` | `NEXT_PUBLIC_APP_URL` template + rotation-history comment + Stripe-webhook-URL comment all updated |
| `app/privacy/page.tsx` | Legal-policy text updated: canonical = `.io`; legacy = `.co` AND `directory.seven16group.com`, both 301-redirect here |
| `app/admin/integrations/page.tsx` | `PUBLIC_INTEGRATIONS_URL` constant flipped to `.io` |
| `scripts/reliability/smoke-test.ts` | `SMOKE_TARGET` default + comment + constant all flipped to `.io` |
| `platform/migrations/0003_platform_seed.sql` | Seed value for `agency_signal` row flipped to `agencysignal.io` (fresh installs only) |
| `platform/migrations/0007_agency_signal_domain_cutover.sql` | NEW migration — idempotent `UPDATE products SET domain='agencysignal.io' WHERE id='agency_signal' AND domain IN ('agencysignal.co','directory.seven16group.com')` for production row |
| `lib/family-integrations/email.ts` | Doc comments flipped to `seven16email.com` root domain with rotation history annotation |

### Support widget knowledge (Sub-wedge 2)

| File | Change |
|---|---|
| `.support/product-identity.md` | Live-at URL flipped to `.io`; legacy chain (`.co` + `directory.seven16group.com`) called out |
| `.support/sales-playbook.md` | 4 instances of `agencysignal.co` → `.io` |
| `.support/capability-library.md` | 2 instances flipped |
| `.support/problem-library.md` | 1 instance flipped |

### Operator-facing docs (Sub-wedge 3)

15 docs swept via PowerShell controlled-list replace_all (53 total instance updates):
AGENTS.md · CLAUDE.md · docs/STATE.md · docs/LAUNCH_CHECKLIST.md · docs/BACKLOG.md (15 inst.) · docs/support-integration-readiness.md · docs/agency-signal-status.html (4 inst.) · docs/context/FAMILY_HEALTH.md (17 inst.) · docs/context/SESSION_STATE.md · docs/context/MASTER_CONTEXT.md · docs/context/PRODUCT_REPO_INDEX.md · docs/context/PRICING_LEAD_DOWNLOADS.md · docs/context/ENGINEERING_DOCTRINE.md · docs/playbooks/dotintel_demo_walkthrough.md · docs/handoffs/SESSION_40_PROMPT.md (the one forward-looking handoff)

Additional contextual edits:
- `docs/context/DECISION_LOG.md` — new **D-037** entry at top of recent decisions; complete description of all three changes + rationale + Master O dashboard actions pending
- `docs/context/FAMILY_HEALTH.md` — `bindlab-academy` row updated with Seven16 Academy rebrand + rename-cascade detail
- `docs/context/FAMILY_HEALTH.md` — `seven16-email` row updated with root-domain URL plan correction
- `docs/BACKLOG.md` — item #6 (Bind Lab Academy → Seven16 Academy)
- `docs/BACKLOG.md` — item #7 (Seven16 Email URL plan note)

### Family memory (outside repo)

- `~/.claude/projects/.../memory/reference_family_product_catalog.md`:
  - Header dated with 2026-05-27 update + bullet list of all three changes
  - Section 4 (Agency Signal): URL flipped + primary-buyer framing locked
  - Section 6 (renamed): Bind Lab Academy → Seven16 Academy with full rename-cascade-pending note
  - Seven16 Email shared-service section: URL flipped with wire-impact callout
  - Quick reference table: Seven16 Academy slug-rename-pending annotation
  - New "Primary buyer per product" anchor section (retailer / wholesaler-recruiter / wholesale-operating / cross-audience credentialing)
  - New "Cascade work pending" footer table

### Intentionally NOT swept

- Historical session handoffs: SESSION_<NN>_HANDOFF.md / SESSION_<NN>_PROMPT.md / AGENCY_SIGNAL_SESSION_<N>_*.md files older than this session
- The Charter doctrine handoff [`SESSION_38_CHARTER_DOCTRINE_HANDOFF.md`](SESSION_38_CHARTER_DOCTRINE_HANDOFF.md) — historical record of yesterday's Charter wiring; URL refs stay as `.co` because that's what was live at write time
- Reason for the no-sweep rule: revising historical handoffs would falsify the historical claim that SESSION_38 cut over to `.co`. The 301 redirect chain in `next.config.mjs` handles inbound link rot from those surfaces.

---

## Validation

```
npx tsc --noEmit  → exit 0 (clean)
npm run lint      → exit 1 (2 pre-existing errors in Seven16SupportWidget.tsx;
                            zero new errors from this session)
```

---

## Master O dashboard actions to fully activate the cutover

These are operational ops the code is forward-compatible with. Do these to finalize:

1. **Stripe Dashboard → Developers → Webhooks**
   - Edit the existing webhook endpoint URL: `https://agencysignal.co/api/stripe/webhook` → `https://agencysignal.io/api/stripe/webhook`
   - Stripe preserves the signing secret on URL-only edits (proven in SESSION_38), so `STRIPE_WEBHOOK_SECRET` in Vercel stays unchanged. No re-rotation needed.
2. **Vercel → agencysignal project → Domains**
   - Confirm `agencysignal.io` is set as the **Primary** domain (not just an added domain). The Primary flag controls which URL Next.js emits in canonical-link tags + auth redirects + OG metadata.
3. **Vercel → agencysignal project → Production env vars**
   - Verify `NEXT_PUBLIC_APP_URL = https://agencysignal.io` (the code fallback now defaults to `.io` even without the env var, but the env var is the source of truth).
4. **Apply migration 0007 to production Supabase**
   - The new migration `0007_agency_signal_domain_cutover.sql` flips the existing `products.domain` row from `.co` → `.io`. Apply via Supabase Dashboard SQL editor OR `supabase db push` if migration tooling is wired.
5. **(Later, for Seven16 Email URL change):** When the Email platform deploys, point its `seven16email.com` apex at the Next.js API routes (path `/api/send` unchanged); then update every consumer satellite's `SEVEN16EMAIL_API_URL` env var to `https://seven16email.com`.

---

## What this doesn't cover (deferred)

### Seven16 Academy rename cascade

Brand + domain are LOCKED in family memory + catalog + this handoff. The technical-identifier cascade is queued for the dedicated greenfield-build session for Seven16 Academy v1:

- Folder rename `C:\Users\GTMin\Projects\bindlab-academy\` → `C:\Users\GTMin\Projects\seven16-academy\`
- GitHub repo rename `gtminsightlab-cmd/bindlab-academy` → `gtminsightlab-cmd/seven16-academy`
- Stripe slug `bindlabacademy` → `seven16academy`
- source_product slug `bindlabacademy` → `seven16academy`
- Env-var prefix `BINDLABACADEMY_*` → `SEVEN16ACADEMY_*`
- User-global `CLAUDE.md` canonical-paths entry update
- `~/.claude/.../memory/project_seven16_learning_center.md` brand-rename appendix
- DNS + Vercel + SSL provisioning for `seven16academy.com`

Doing these in lockstep with v1 code build prevents half-renamed state on `main`.

### Charter Member program collision with D-034

While reading DECISION_LOG to find the next D-number, surfaced **D-034 (locked 2026-05-26)** which KILLED the Charter Member program family-wide. That supersedes the work done in [`SESSION_38_CHARTER_DOCTRINE_HANDOFF.md`](SESSION_38_CHARTER_DOCTRINE_HANDOFF.md) — the Charter checkout flow + Coupon re-assertion + welcome email + Command push wired in commit `1099317` (D-026/D-027/D-028 Sub-wedges 1-3) is now operating against killed doctrine. Code-cleanup actions implied by D-034:
- Stripe Charter coupon `L1Ngigfc` needs deactivation in dashboard
- `agencysignal.io/charter` page retired to "program ended" notice (was at the time of D-034 lock, may already be done)
- Charter-handling branches in `app/api/stripe/checkout/route.ts` + `app/api/stripe/webhook/route.ts` need to be either pruned OR marked SUPERSEDED with a comment pointing at D-034
- `lib/family-integrations/email.ts` template key `charter_member_welcome` can be removed (or left dormant)

**Not in scope for this cutover session.** Surfacing for the next session's planning.

---

## Cross-refs

- [`docs/context/DECISION_LOG.md`](../context/DECISION_LOG.md) — D-037 (this session's authoritative entry)
- [`docs/context/FAMILY_HEALTH.md`](../context/FAMILY_HEALTH.md) — repo rows for seven16-email + bindlab-academy updated
- [`docs/handoffs/SESSION_38_CHARTER_DOCTRINE_HANDOFF.md`](SESSION_38_CHARTER_DOCTRINE_HANDOFF.md) — predecessor charter-flow handoff (now superseded by D-034; left intact as historical record)
- `~/.claude/projects/.../memory/reference_family_product_catalog.md` — canonical product catalog, fully updated 2026-05-27
- `~/.claude/projects/.../memory/reference_family_api_integration_mesh.md` — family integration doctrine (unaffected by this cutover but cross-referenced)
