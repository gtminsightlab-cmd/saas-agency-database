# SESSION_38.7 Addendum — BACKLOG `0b` SHIPPED: rightRail product-mockup harmonization (2026-05-26)

**Date:** 2026-05-26 (continuation after SESSION_38.6 close commit `4939026`)
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `main`
**Predecessor:** [`SESSION_38_6_ADDENDUM_0e_pricing_build.md`](SESSION_38_6_ADDENDUM_0e_pricing_build.md)
**Commits this addendum:** `e12608f` (5 new mockup components + 5 page wirings) + docs close-out TBD
**Outcome:** `agencysignal.co` marketing surface now reads as one product — homepage + 5 page heroes all share the same dark slate-900 mockup visual language. Doctrine-pivot arc (SESSION_38 → SESSION_38.7 inclusive) **closed end-to-end**.

---

## What shipped

### Five new mockup components

All under `components/marketing/`, all server components, each ~60-90 lines. Each follows the `AppointmentSearchMockup` visual language:

- Outer wrapper: `rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1 shadow-2xl shadow-blue-900/20 backdrop-blur`
- Inner: `rounded-[14px] bg-slate-900 ring-1 ring-inset ring-slate-700/50`
- Header strip: small-caps section name (Lucide icon + label) + Live indicator (green dot + "Live")
- Body: page-appropriate content (table / numbered list / disclosure list / grid)
- Footer strip: meta line + monospace endpoint tag

| Page | Component | Body content |
|---|---|---|
| `/verticals` | `VerticalTierMockup.tsx` | 8-row vertical table (Vertical / Agencies / Status). 6 shipped verticals with real-ish counts + 2 "Queued" stub rows. Footer: `mv_vertical_summary` endpoint label. |
| `/use-cases` | `WorkflowStepMockup.tsx` | 4-step numbered recruit playbook (Define / Filter / Review / Export). Each step has title + 1-line detail + meta tag (30 sec / Real-time / May 2026 / Export-ready). Footer: `/build-list` endpoint. |
| `/resources` | `EditorialRowMockup.tsx` | 5-row editorial library preview. Category eyebrow + title + meta + read-time + `ArrowUpRight` icon per row. Footer: `/resources` endpoint. |
| `/enterprise` | `EnterpriseCapabilitiesMockup.tsx` | 6-tile 2-col grid (Full U.S. coverage / Appointment intelligence / Verified contacts / Database license / Bulk export windows / Distribution intelligence). Re-anchored to D-034 National Founder License — NOT the killed D-015 state-slider. Footer: `$12,500/yr · Annual license · Full U.S.` + `/api/license`. |
| `/methodology` | `ThreeSignalsMockup.tsx` | 3-signal flow with confidence scores (Carrier Appointment 87 / Producer Network 72 / Agency Identity 94). Score colors tone-coded (emerald ≥85 / cyan ≥70 / amber otherwise). Source label + detail per signal. Footer: `/methodology` endpoint. |

### Page wirings

Each of the 5 pages: replaced `<DataPanel>` rightRail block with the corresponding `<MockupComponent />`. `DataPanel` import removed from each page (no other usage there). The `DataPanel` component itself kept — other surfaces still reference it (Charter retired page uses different chrome anyway).

**NOT touched this session:**
- Homepage `/` — `AppointmentSearchMockup` already richest
- `/charter` — retired in SESSION_38.5 to "program ended" notice; no rightRail
- `/pricing` — SliderCalculator-in-body shipped SESSION_38.6; rightRail is not the surface that needs density here

### D-024 a11y compliance notes

- All mockups: `<figure role="img" aria-label="...">` wrapper for screen-reader narration that describes the visual gestalt
- Decorative Lucide icons: `aria-hidden="true"`
- Data-table mockup (`VerticalTierMockup`): semantic `<table>` with `<caption className="sr-only">`, `<thead>/scope="col"`, `<th scope="row">` per row
- Ordered-list mockup (`WorkflowStepMockup`): native `<ol>` with numbered badges
- Disclosure-list mockup (`EditorialRowMockup`): native `<ul>`
- Score-aware mockup (`ThreeSignalsMockup`): `aria-label="Confidence score X out of 100"` on each numeric score; tabular-nums

---

## Local build before push

Held the discipline locked in SESSION_38.5/38.6. Ran `npm run build` before the single push for this session — verified ✓ green compile + ✓ TypeScript pass before the commit went to origin. No build-error round-trip this time.

---

## Verification post-deploy

```
verticals:    200  + "Vertical Intelligence"      ✓
use-cases:    200  + "Recruit Playbook"           ✓
resources:    200  + "Resource Library"           ✓
enterprise:   200  + "National Founder License"   ✓
methodology:  200  + "Three Signals"              ✓
```

Vercel deploy READY in <60s. Monitor pattern (poll-until-content-matches) replaced the prior sleep-and-curl pattern — faster + tighter feedback loop.

---

## Doctrine-pivot arc retrospective (SESSION_38 → SESSION_38.7)

| Session | Arc | Commit | Wall time |
|---|---|---|---|
| 38 | Domain cutover `directory.seven16group.com` → `agencysignal.co` | `70b6c2d` (code) + `2a8943c` (docs) | ~75 min |
| 38.5 | D-034 doctrine pivot — family pricing + Charter Member KILLED | `1571d7b` | ~45 min |
| 39 (parallel) | Agency Signal Tier 1 security baseline (advisor 90→32 WARN) | `75f0ace` | (separate session) |
| 38.6 | BACKLOG `0e` — full polished `/pricing` page | `5db738d` + `bf59017` (fix) + `4939026` (docs) | ~60 min |
| 38.7 | BACKLOG `0b` — rightRail product-mockup harmonization | `e12608f` + this docs commit | ~45 min |

**Combined arc impact:**
- New canonical hostname live
- Family pricing + Charter Member retired; AS 4-tier transparent model adopted (D-034)
- Stripe webhook URL atomically rotated (signing secret preserved)
- `/pricing` page rebuilt end-to-end with slider calculator + comparison + FAQ + sample banner
- Marketing surface visually unified — homepage + 5 page heroes share design language
- Tier 1 security baseline shipped (parallel session) — Pattern B finding for family

---

## What's NOT done in this addendum (queued)

Same carry-forward list as SESSION_38.6 plus one new low-priority item:

### Pricing-migration follow-up session (recommended next, ~45-60 min)

- Archive 6 D-021 surfaces in Stripe sandbox `acct_1TLUF6HmqSDkUoqw` via Stripe MCP (products + prices)
- Build 4 new Stripe Products for D-034 tiers (Sample $75 / Monthly Starter $299 / Growth $599 / Pro $999 / Bulk per-record / National License $12,500)
- Deactivate Charter coupon `L1Ngigfc`
- Add SUPERSEDED banners to 8 `PRICING_*.md` briefs
- Clean up dead Charter Member code paths in `app/api/stripe/{checkout,webhook}/route.ts`
- Audit + retire `/enterprise` page if still describing killed D-015 details after the rightRail swap (the EnterpriseCapabilitiesMockup is now anchored to D-034 National Founder License framing, but the page body sections may still reference per-state pricing — audit + scrub on this session)

### BACKLOG `0c` Google SSO

`/sign-in` + `/sign-up` Google SSO via cross-repo playbook (`seven16-survey/docs/cross-repo/google-sso-and-sentry-setup-playbook.md` commit `b8a2bf4`, Part 1 only — Sentry already wired on AS). ~1h + 2 Master O dashboard steps.

### Carry-forwards from SESSION_38

1. Master O — flip `NEXT_PUBLIC_APP_URL` in Vercel Preview env (dashboard, ~30 sec)
2. Verify first real Stripe event hits 200 in Vercel logs (passive)

---

## Standing-rule callouts

- **One arc per session held** — only `0b` rightRail harmonization shipped this addendum. Did NOT start the pricing-migration follow-up or `0c` Google SSO inline.
- **Local build before push** — held this time. Zero build-error round-trips. Discipline is now load-bearing.
- **No SLOP in copy** — mockup labels (Vertical Intelligence / Recruit Playbook / Resource Library / National Founder License / Three Signals) are direct + operator-grade. Footer endpoint tags are real route paths or schema names, not fabricated.
- **D-023 positioning preserved** — `EnterpriseCapabilitiesMockup` is anchored to the D-034 4-tier pricing model (National Founder License) but uses D-023 "distribution intelligence" framing in the body. Tension between hero-copy "agent data" + body-marketing "distribution intelligence" remains intentional + noted SESSION_38.5.
- **D-024 a11y** — every new mockup carries semantic structure + aria-labels + sr-only descriptions. The screen-reader user gets a useful gestalt of each page's hero visual.
- **Plugins-first** — Vercel MCP (`list_deployments`/`get_deployment`) for build state; Monitor tool for `until ... do sleep` content polling (faster than sleep-and-curl). No Vercel dashboard work this session.

---

*Doctrine-pivot arc closed clean across SESSION_38 → SESSION_38.7. Next session opens with active arc slot **available** — recommended pick: pricing-migration follow-up (Stripe catalog rebuild) to bring the billing infrastructure in line with the customer-facing D-034 model.*
