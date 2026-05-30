# Session 42 — Product rebrand: Agency Signal → Seven16 Intel (D-046) — 2026-05-30

**Date:** 2026-05-30 (continuation after parallel SESSION_41 family-foundation arc commit `396397f`)
**Repo:** `saas-agency-database` (family hub + Seven16 Intel product)
**Branch:** `main`
**Outcome:** Full rebrand cutover SHIPPED end-to-end same session. Customer-facing product brand "Agency Signal" → **"Seven16 Intel"**; canonical hostname `agencysignal.co` → **`seven16intel.com`**. Brand-collision pivot.

---

## The trigger

Earlier this session uncovered that **`agencysignal.io` is owned by a third party** operating a separate "AgencySignal" marketing-agency directory product. The SESSION_41 doctrine had attempted to migrate the canonical hostname to `.io` — Master O's Cloudflare registrar then proved he doesn't own `.io`. The `.io` cutover was permanently dead (locked in commit `77f5239`).

To eliminate the brand-collision risk before charter outreach scales, Master O acquired `seven16intel.com` via Cloudflare Registrar and executed the rebrand in the same session.

---

## What shipped

### Commits

| Commit | Content |
|---|---|
| `a82633a` | Pre-rebrand: disable `.co` → `.io` redirect (mid-investigation safety) |
| `77f5239` | Lock `.co` permanent canonical; remove `.io` from Vercel project; brand-collision flag |
| `1571d7b` | Earlier — D-034 pricing doctrine (separate arc, surfaced in context) |
| **`d760b93`** | **Rebrand mega-commit (Phases 2 + 7 + 8) — 42 files / +255/-141** |
| **`b0cf817`** | **D-046 doctrine lock + current-state docs scrub — 6 files** |

### Phase-by-phase

| # | Phase | Status |
|---|---|---|
| 1 | Cloudflare A record `@→76.76.21.21` + Vercel domain add + cert | ✅ Master O at Cloudflare + me at CLI |
| 2 | Host-matched 308 redirects in `next.config.mjs` (legacy `.co` + `directory.seven16group.com` → `seven16intel.com`) | ✅ commit `d760b93` |
| 3 | Verify cutover end-to-end (HTTPS 200, redirects 308, admin RBAC 307, brand string check) | ✅ all green |
| 4 | Stripe webhook URL atomic rotation (signing_secret preserved) | ⏳ Master O dashboard click |
| 5 | Supabase Auth Site URL → `https://seven16intel.com` + redirect URLs | ⏳ Master O dashboard click |
| 6 | `NEXT_PUBLIC_APP_URL` env rotation to `https://seven16intel.com` | ✅ Vercel CLI |
| 7 | Customer-facing brand scrub — 39 files (`Agency Signal` → `Seven16 Intel`, `agencysignal.co/.io` → `seven16intel.com`) | ✅ in `d760b93` |
| 8 | `/admin/product-positioning` config rewrite (`lib/admin/product-positioning.ts`) | ✅ in `d760b93` |
| 9 | DECISION_LOG D-046 + D-004 amendment + family memory + project CLAUDE.md | ✅ commit `b0cf817` |
| 10 | This handoff doc + BACKLOG + FAMILY_HEALTH refresh + close | ✅ in progress |
| 11 | Master O sets real password via the now-working forgot-password flow | ⏳ Master O |

### Verification (Phase 3)

```
seven16intel.com/                                        → 200 OK
agencysignal.co/admin/product-positioning                → 308 → seven16intel.com/admin/product-positioning
directory.seven16group.com/                              → 308 → seven16intel.com/
seven16intel.com/admin/product-positioning               → 307 (sign-in gate, RBAC enforced)
homepage brand-string scrub check                        → only "Seven16 Intel" present, no "Agency Signal" leftovers
```

---

## What did NOT change (per D-046)

Preserved deliberately for blast-radius hygiene:

- **Repo name** `saas-agency-database` — renaming touches every git remote, Vercel project, CI ref, env-var prefix, family memory pointer
- **Stripe product slug** `agencysignal` — live billing identifier; renaming requires separate coordinated migration with active subscriptions
- **Supabase DB project ref** `sdlsdovuljuymgymarou` — DB-level identifier, no customer impact, renaming would break every env var
- **Family-mesh `product_slug`** per D-027 integration mesh — cross-product API identifier; rename coordinated via separate family-wide session
- **Positioning** "Distribution intelligence for commercial insurance" (D-023) — preserved verbatim
- **Pricing** D-034 4-tier model (Sample $75 / Monthly $299–$999 / Bulk per-record sliding / National $12,500/yr) — preserved unchanged
- **Brand-architecture Option C** (D-001) — preserved
- **Tagline + ICP + 7-pillar product taxonomy** — preserved

---

## Brand-collision documentation (for counsel review when convenient)

The third-party "AgencySignal" product at `agencysignal.io` is a marketing-agency directory (different industry, different audience, different brand spelling: one word "AgencySignal" vs our former two-word "Agency Signal"). Distinct enough to likely avoid trademark conflict but counsel review queued for separate engagement.

---

## Pickup tasks

### 🔴 Master O dashboard (your remaining 3 steps)

1. **Stripe** — [Edit destination URL](https://dashboard.stripe.com/acct_1TLUF6HmqSDkUoqw/test/workbench/webhooks/we_1TPyAuHmqSDkUoqwUUHTZITv/edit) → change to `https://seven16intel.com/api/stripe/webhook` → Save. Signing secret stays (atomic edit pattern, same as SESSION_38).
2. **Supabase Auth** — [URL Configuration](https://supabase.com/dashboard/project/sdlsdovuljuymgymarou/auth/url-configuration) → Site URL = `https://seven16intel.com`; add redirect URLs `https://seven16intel.com/**`, `https://seven16intel.com/auth/callback`, `https://seven16intel.com/auth/reset-password` → Save.
3. **Set real password** — [forgot-password](https://seven16intel.com/auth/forgot-password) → submit `gtminsightlab@gmail.com` → check Gmail → click reset link → set the password you want. Invalidates both temp UUIDs from earlier in this session that are still in the transcript.

### 🟡 Cross-repo prep artifacts (queued, not started)

Per D-033 family product catalog convention, each satellite needs to know about the rebrand so cross-product references stay consistent:
- seven16-group-site (parent hub product roster)
- dotintel2 (DOT Intel family-context refs)
- bindlab (Bind Lab `.support/` cross-product routing)
- seven16-survey (cross-product integration refs)
- seven16-command-center (CRM customer-state SoR refs)
- seven16-email (sender-domain + family API consumer refs)

Each satellite session reads its `.support/` for product names + updates the Seven16 Intel entry. Could be done as a single coordinated family-cascade in a follow-up session, or each next satellite session picks it up naturally.

### 🟡 Deferred (separate sessions)

- **Stripe product slug rename** `agencysignal` → `seven16intel` (touches live billing schema; needs migration window)
- **Family-mesh product_slug rename** per D-027 (touches cross-product API integrations)
- **Repo + GitHub remote rename** `saas-agency-database` → `seven16intel` (touches every git remote across family)
- **Supabase project rename** `sdlsdovuljuymgymarou` → `seven16intel` (high blast radius)
- **Counsel review** of brand-collision posture

---

## Doctrine state at session close

- **D-046 LOCKED** in DECISION_LOG (full rebrand entry with what-changed/what-didn't matrix)
- **D-004 AMENDED** with cross-reference to D-046 (product-name portion only)
- **All other decisions PRESERVED** unchanged (D-001, D-005, D-006, D-007, D-023, D-026, D-027, D-028, D-029, D-030, D-031, D-032, D-033, D-034)

Production main HEAD: `b0cf817`. Vercel deploy of `d760b93` rebrand built + READY (`seven16intel.com/` serves Seven16 Intel-branded app with all marketing surfaces).

---

## Standing-rule callouts

- **Plugins-first held throughout** — Vercel CLI for `domains add` + `certs issue` + `env` rotation; Cloudflare driven via claude-in-chrome MCP browser automation (Master O completed the A record himself when the in-browser dashboard hung); Supabase MCP for `is_super_admin()` verification + auth.users record creation (earlier bug-fix mid-session); Stripe + Supabase Auth Site URL = dashboard-only per financial-platform safety rules.
- **Audit-first held** — every Phase verified before next Phase started. The "is `.io` ours?" investigation (commits `a82633a` + `77f5239`) is exactly the audit-first pattern preventing what would have been a several-hour wrong-path debugging arc.
- **Local `npm run build` before push** — held for both mega-commits.
- **Secrets never in chat** — held for the rebrand commits (no service-role keys transited). Acknowledged exposure: two temp UUID passwords I generated earlier in this session for the broken-signup recovery flow are still in the transcript. Phase 11 invalidates them.
- **Cancelled = closed scope** — the `.io` cutover doctrine that SESSION_41 attempted is permanently closed via D-046 + `77f5239`. Not deferred.
- **One arc per session** — bent on purpose. This session spanned domain cutover → broken signup recovery → `.io` investigation → rebrand. Each was the natural conclusion of the previous discovery. Master O explicitly approved the rebrand scope ("A" = full rebrand tonight).

---

*Brand-collision pivot caught + resolved before customer-facing damage. The product is now called Seven16 Intel everywhere customer-visible. Master O's final 3 dashboard clicks close the loop on Stripe + Auth + his real password.*
