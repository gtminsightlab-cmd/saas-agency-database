# Cross-repo prep — seven16-group-site Agency Signal scrub (D-046)

**For:** the next `seven16-group-site` Claude Code session
**From:** `saas-agency-database` SESSION_42 (D-046 rebrand, 2026-05-30)
**Rule:** 2(b) cross-repo prep artifact — paste-ready BACKLOG entry + scrub plan that the next seven16-group-site session executes cold

---

## TL;DR

Agency Signal was rebranded to **Seven16 Intel** at `seven16intel.com` on 2026-05-30 per D-046 (brand-collision pivot — `agencysignal.io` is owned by a third party). `saas-agency-database` is scrubbed clean. **`seven16-group-site` still references "Agency Signal" + `agencysignal.co` in customer-visible places (the parent hub `partners.seven16group.com` product roster, product landing pages, etc.).** Master O flagged this directly: *"the seven16group.com website still has references to agencysignal... so remember to remove those."*

The scrub is straightforward — same shape as the bulk sed we ran in `saas-agency-database` commit `d760b93`. Estimated 15-30 min including local build verification.

---

## Paste-ready BACKLOG entry

```markdown
**[QUEUED] D-046 Agency Signal → Seven16 Intel brand scrub** — cross-repo
follow-up from saas-agency-database SESSION_42 (commit `d760b93` + `b0cf817`
+ `cfb246d` 2026-05-30). Product rebrand locked as D-046; brand-collision
pivot because agencysignal.io is owned by a third party. This repo (the
parent hub at partners.seven16group.com) still references "Agency Signal"
+ agencysignal.co in customer-visible places and needs a coordinated scrub:

1. Bulk sed across customer-facing code:
   - Find: `Agency Signal` → Replace: `Seven16 Intel`
   - Find: `agencysignal.co` → Replace: `seven16intel.com`
   - Find: `agencysignal.io` → Replace: `seven16intel.com`
   - Scope: `app/`, `components/`, `lib/`, `content/`, `.support/*.md`
   - Exclude: docs/ historical handoffs (preserve audit-trail) and any
     migration/SUPERSEDED files that reference the old brand as history.

2. Targeted edits:
   - Parent-hub product roster + product landing pages (the
     `/products/agency-signal` page or its current equivalent — likely
     needs a path rename to `/products/seven16intel`)
   - Footer + header product cross-links
   - .support/product-identity.md cross-product routing references
   - DECISION_LOG references if this repo carries the family ledger
   - Family memory `reference_family_product_catalog.md` consistency
     check (the canonical lives in saas-agency-database family memory;
     mirror entries here)

3. Verification:
   - `npm run build` ✓ green
   - `grep -rn "Agency Signal\|agencysignal" app components lib content
     .support` returns nothing in customer-facing files
   - Spot-check the live product landing for "Seven16 Intel" branding

4. Optional but recommended:
   - Adopt the family-wide Playwright QC pattern (see
     `saas-agency-database/docs/cross-repo/playwright-qc-adoption.md` for
     the seven16-group-site adoption block) and run a full screenshot
     sweep before merging the scrub. Catches any miss across browsers
     and themes.

Estimated 15-30 min for the scrub + 5 min Playwright QC verification.
Doctrine anchor: D-046 in `saas-agency-database/docs/context/DECISION_LOG.md`.
```

---

## Doctrine context (for the next session reading this cold)

**What D-046 changed:**
- Customer-facing product brand: "Agency Signal" → **"Seven16 Intel"**
- Canonical hostname: `agencysignal.co` → **`seven16intel.com`**
- Both legacy hostnames (`agencysignal.co` + `directory.seven16group.com`) 308-redirect to seven16intel.com via `next.config.mjs` host-matched rules in saas-agency-database

**What did NOT change (per D-046, preserved for blast-radius hygiene):**
- Repo name `saas-agency-database`
- Stripe product slug `agencysignal`
- Supabase project ref `sdlsdovuljuymgymarou`
- Family-mesh `product_slug` per D-027 integration mesh
- Positioning (D-023): "Distribution intelligence for commercial insurance"
- Pricing (D-034): 4-tier transparent model

**Brand-collision background:**
A third party operates a separate "AgencySignal" marketing-agency directory at `agencysignal.io`. Different industry, different audience, but same brand spelling — visible-on-page customer-confusion risk caught Master O's eye + triggered the rebrand. Counsel review queued separately; no immediate legal action.

**Full doctrine entry:** `saas-agency-database/docs/context/DECISION_LOG.md` D-046 row (includes the full what-changed/what-didn't matrix + supersession map).

**Full session handoff:** `saas-agency-database/docs/handoffs/SESSION_42_REBRAND_D046_HANDOFF.md`.

---

## Search patterns to find Agency Signal references

Run these in `seven16-group-site` repo root to scope the work:

```bash
# Customer-facing references that need swap
grep -rln "Agency Signal\|agencysignal\.co\|agencysignal\.io" \
  app components lib content .support 2>/dev/null

# Historical refs to preserve (do NOT swap)
grep -rln "Agency Signal\|agencysignal\.co\|agencysignal\.io" \
  docs/handoffs docs/context 2>/dev/null

# Stripe + technical identifiers to LEAVE ALONE (blast-radius hygiene)
grep -rln "stripe.*agencysignal\|product_slug.*agencysignal" \
  app components lib 2>/dev/null
```

---

## Standing-rule callouts

- **Rule 2(b) compliance:** this artifact lives in `saas-agency-database/docs/cross-repo/`. Zero file writes to seven16-group-site, zero commits, zero migrations. Next seven16-group-site session executes it.
- **One arc per session:** the next seven16-group-site session shouldn't try to also do the Playwright QC adoption in the same arc unless scope is genuinely 30 min — they're independent and can ship separately.
- **Plugins-first:** Supabase MCP for any product-roster table updates (none expected — roster is static markdown). Vercel MCP for deployment verification.
- **Local build before push:** when touching prop interfaces across multiple files, run `npm run build` locally before push. Discipline codified in saas-agency-database SESSION_38.5/38.6.

---

*Master O directive 2026-05-30: "the seven16group.com website still has references to agencysignal... so remember to remove those." This artifact captures the doctrine, scope, and verification so the seven16-group-site session executes cleanly cold.*
