# Family-wide Design Coordination — cross-repo prep

**Created 2026-05-28 by D-043 (Seven16 family design coordination standard locked).**

**Family memory ref:** `~/.claude/.../memory/project_seven16_family_design_coordination_standard.md`
**DECISION_LOG:** D-043 in `saas-agency-database/docs/context/DECISION_LOG.md`

This is the **paste-ready prep artifact** that each satellite product's next session reads to align with the family design coordination standard. Per Master O 2026-05-28 directive (same arc as D-042 Master Command Center): "push this down to the family products so we can all be on the same page."

---

## The four responsibilities every satellite has

1. **Audit current design against the standard** — does the product follow the 80/20 logged-in / 70/30 marketing flex? Where does it drift?
2. **Adopt the canonical reference implementation** (Phase 1 = copy-paste from `seven16-group-site` S6.5 design system; mark copies with `// SOURCE: seven16-group-site/src/components/<X>` comment).
3. **Confirm or reject the GPT-suggested accent color direction** — Master O has final say; surface for confirmation before any code commits.
4. **Use the section §"Claude implementation instruction"** in every product session prompt that touches UI.

---

## Per-satellite paste-ready BACKLOG entries

Each satellite's next session: copy the matching block into that repo's `docs/BACKLOG.md`.

### seven16-group-site (the reference implementation home)

```markdown
**[FAMILY-REF] Design system extraction prep (D-043)**
*Source:* `saas-agency-database/docs/cross-repo/family-design-coordination-prep.md` + family memory `project_seven16_family_design_coordination_standard.md`.

seven16-group-site holds the canonical reference implementation (S6.5 Sanity-editorial: Fraunces/Inter/JetBrains Mono tokens + 6 layout primitives + 6 UI components + the parent Seven16 Group palette). Three responsibilities here:

A. **Document the design tokens** (~0.5 session)
- Ship a tokens.md / design-system.md page documenting the 6 primitives + 6 components + token names, so other repos can copy-paste accurately. The S6.5 work is in code; this artifact makes it discoverable for cross-product reuse.

B. **Lock the parent-brand palette** (~0.25 session)
- Master O confirms the Seven16 Group master accent + secondary + neutral palette (currently driven by S6.5 implicit defaults).
- Document the palette + show how product-accent-color tokens override it without breaking components.

C. **Ship a "logged-in app shell" pattern reference** (~1 session, optional but high-leverage)
- seven16-group-site is currently marketing-editorial. A polished logged-in admin shell example (using the same tokens) would unblock every other product's logged-in shell standardization.
- Alternative: let Agency Signal be the first logged-in reference (it has the most existing logged-in surface).

Phase 2 (extract to `@seven16/design-system` npm package) is triggered when the SECOND consumer needs it — not now.
```

### Agency Signal (saas-agency-database — this repo)

```markdown
**[FAMILY] Design coordination alignment (D-043)**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

Agency Signal recently shipped S6.5 design work in seven16-group-site (homepage redesign + components). Two sub-arcs to align Agency Signal's own surfaces:

A. **Logged-in app shell audit + alignment** (~1-2 sessions)
- Audit `/build-list`, `/admin/*`, `/saved-lists`, all existing logged-in routes vs the family standard skeleton (nav logic, breadcrumbs, top header, user menu).
- Token-import from seven16-group-site (Fraunces/Inter/JetBrains Mono); replace any hardcoded font / spacing values with tokens.
- App-shell skeleton: left-side nav OR consistent primary nav (pick + document), top header w/ org switcher (D-040 tenant model when shipped) + product switcher (placeholder until D-042 Group Hub is live).
- Adopt the shared component set (Badge, Banner, EmptyState, Field, FilterSelect, Card — already in seven16-group-site S6.5).

B. **Dashboard design uplift** (~1 session)
- Audit Agency Signal dashboards against the 4-question test (What is happening / What matters / What needs attention / What action next).
- KPI row → primary work queue → trend → alerts → recommended actions → recent activity → filters.
- Marketing pages stay at the 70/30 flex they already have post-S6.5.

C. **Accent color confirm** (~0.25 session)
- GPT-suggested: growth green / data blue / performance tones. Master O confirms or rejects.
- Once locked, codify as Tailwind palette extension + design token.

Sequencing: B can run in parallel with A. C is a quick conversation before A's color implementation.
```

### DOT Intel (dotintel2 repo)

```markdown
**[FAMILY] Design coordination alignment (D-043)**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

DOT Intel has the most-developed logged-in surface (Phase 4 dashboards, risk modules, territory intelligence). Sub-arcs:

A. **Logged-in shell audit** (~1-2 sessions)
- Audit existing /dashboard, /carrier-intelligence, /territory-intelligence routes against the family skeleton.
- Token-import (Fraunces/Inter); replace hardcoded fonts.
- Shared component adoption per the standard.

B. **Risk-module visual standard** (~1 session)
- Risk-module cards are unique to DOT Intel but should use the shared card + alert primitives.
- The per-module defensibility framework (D-035) already locked card structure (signal / math / viz / takeaway / defense / reason codes) — codify visual treatment to match.

C. **Accent color confirm** (~0.25 session)
- GPT-suggested: dark navy / signal green / risk amber. Master O confirms.

D. **AI assistant pattern alignment** (~0.25 session)
- DOT Intel's risk-intelligence agent surface adopts the standard AI assistant pattern (name + role + confidence + suggested prompts + escalation + source citation + usage meter + disclosure).

Sequencing: A before B/D. C in parallel.
```

### Bind Lab (bindlab repo) — BAKE INTO Phase B

```markdown
**[FAMILY] Design coordination alignment (D-043) — BAKE INTO Phase B**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

Bind Lab Phase B platform build hasn't started. Bake the design standard in from day one (NOT retrofit):

- Initial scaffolding imports Fraunces/Inter tokens from seven16-group-site.
- App shell uses the family skeleton (left-side nav, top header, user menu, org switcher).
- Per-product personality LOCKED: Confident · Operational · Structured · Serious · Workflow-driven · Enterprise-grade. NOT lightweight CRM template.
- Accent color: GPT-suggested deep blue / slate / professional insurance-tech tones — Master O confirms at Phase B kickoff.
- Bind Lab is workflow-heavy; the table + form + modal primitives are critical here.
- AI assistant pattern alignment from day one.
```

### Seven16 Academy (was Bind Lab Academy) — BAKE INTO v1

```markdown
**[FAMILY] Design coordination alignment (D-043) — BAKE INTO v1**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

Greenfield product — bake the design standard in from v1.

- Mobile-first PWA constraint (per D-029 + S6.5 mobile rule) — the family standard works mobile-first.
- Imports Fraunces/Inter tokens; app shell adapted for mobile-first context (likely bottom nav instead of side nav, but consistent visual language).
- Cert-program cards + lesson UI + flashcard primitives are Academy-specific but use shared card + form primitives.
- Per-product personality: TBD — needs Master O lock (currently was "Bind Lab Academy" personality; Seven16 Academy brand needs its own).
- Accent color: TBD per Master O.
```

### Seven16 Email (seven16-email repo)

```markdown
**[FAMILY] Design coordination alignment (D-043)**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

Two sub-arcs:

A. **Logged-in shell + campaign-builder alignment** (~1-2 sessions)
- Audit existing logged-in routes vs family skeleton.
- Campaign builder + sequence editor + template registry use shared form + table primitives.
- Per-tier overage / usage meters use shared usage-meter component (the AI/SaaS component set in D-043).

B. **Pricing page alignment** (~0.5 session, when pricing page builds per D-038/D-E029)
- Marketing-flex (70/30) — Seven16 Email can be more energetic; still uses Fraunces/Inter.
- 7-tier comparison table uses shared table primitives.

C. **Per-product personality + accent color** — Master O dump pending.

Sequencing: A independent. B when pricing-page session opens.
```

### Seven16 Survey / Activator (seven16survey repo)

```markdown
**[FAMILY] Design coordination alignment (D-043)**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

Two sub-arcs:

A. **Logged-in shell + kanban alignment** (~1 session)
- Lane B kanban (shipped 2026-05-26) + contact profile + admin pipeline align to family standard.
- Multi-producer view at Agency tier uses the tenant-360 dashboard pattern from D-042.

B. **Survey-completion + share-kit visual treatment** (~0.5 session)
- Per-vertical activation packs (Trucking / Restaurant / HVAC) use shared deliverable card pattern.
- Share-kit templates use shared form + content card primitives.

C. **Per-product personality LOCKED: Clear · Simple · Helpful · Conversion-focused · Insightful · Easy to launch.** Accent color: GPT-suggested energetic conversion/feedback tones — Master O confirms.
```

### Seven16 Command (seven16-command-center repo)

```markdown
**[FAMILY] Design coordination alignment (D-043) — BAKE INTO Phase 1**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

Command is Phase 1 in progress. Bake design from Phase 1 not later:

- App shell uses family skeleton from the very first dashboard PR.
- Multi-tenant CRM workflows (kanban / pipeline / contact 360 / cross-product entitlement views) use shared card + table + tab primitives.
- Bidirectional integration with Group Hub (D-042) — Command's admin surfaces need to feel like part of the same family even though Command IS the customer-state SoR.
- Per-product personality: TBD — needs Master O lock.
- Accent color: TBD per Master O.

Critical: as the customer-state SoR (D-027) + the eventual destination for billing/entitlement truth (D-040), Command's tenant management UX becomes the reference for tenant management across the family. Get this right at Phase 1.
```

### DotCarriers / DotAgencies (dotcarriers / dotagencies repos) — BAKE INTO decouple

```markdown
**[FAMILY] Design coordination alignment (D-043) — BAKE INTO decouple**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

Both products are pre-decouple. When each decouple session opens, bake the family design standard in from day one of the new repo:

- DotCarriers personality LOCKED: Practical · Searchable · Trustworthy · Logistics-aware · Verification-oriented. Accent: GPT-suggested logistics / highway / fleet / directory tones.
- DotAgencies personality LOCKED: Professional · Searchable · Local-market aware · Trustworthy · Referral-friendly. Accent: GPT-suggested professional insurance directory tones.
- Both inherit the family shell + tokens + components.
- Directory + search + claim-flow + review primitives use shared table + form + card components.
- Marketing pages flex (70/30); logged-in surface tight (80/20).
```

### Seven16 Group Support (when scoped)

```markdown
**[FAMILY] Design coordination alignment (D-043)**
*Source:* family memory `project_seven16_family_design_coordination_standard.md`.

Support is the parent-brand-trust surface that EVERY other product routes to. "Very High" required consistency:

- Personality LOCKED: Calm · Helpful · Organized · Reliable · Clear · Human-centered.
- Accent: GPT-suggested calm / service-oriented tones — Master O confirms.
- Help center + ticket UI + onboarding + AI support agent surface — all family-standard.
- This is where users land when something goes wrong in any product. Drift here erodes trust across the whole family.
- Bake in from day one of the build (when Support project scopes).
```

---

## Order of operations across the family

1. **Phase 1A (now):** seven16-group-site documents the S6.5 design tokens + ships the design-system.md reference. ~0.5 session. This unblocks every other product's copy-paste.
2. **Phase 1B (now):** Master O confirms parent-brand palette + per-product accent colors that are ready to lock. ~0.25 session each (just a conversation).
3. **Phase 2 (after Phase 1A):** each shipped product runs its alignment sub-arcs. ~1-2 sessions per product. These can run in parallel.
4. **Phase 3 (when 2 products consume cross-repo):** extract to `@seven16/design-system` npm package. Triggered by need, not preemptively.

**Avoid:** any product trying to lock its accent color or extract a shared package BEFORE seven16-group-site documents the design tokens — every other consumer needs that artifact to copy from accurately.

---

## Common shared helper (token import pattern)

Until the npm package exists, the canonical copy-paste pattern is:

```ts
// at the top of any component using the shared design system:
// SOURCE: seven16-group-site/src/design/tokens.ts (version: <commit-sha-or-date>)
//
// when seven16-group-site updates the canonical tokens, re-sync this file
// by copying the source verbatim.

export const tokens = {
  fontFamily: {
    serif: '"Fraunces", Georgia, serif',
    sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  // ... per S6.5 token spec
};
```

Every product imports from its local copy; the `// SOURCE` comment makes drift visible during code review.

---

## Tracking — who's done what

Update this table as each satellite's alignment lands:

| Product | Token import | Logged-in shell align | Dashboard align | Accent color confirmed |
|---|---|---|---|---|
| seven16-group-site | n/a (it IS the source) | ✅ S6.5 admin pages | ✅ S6.5 homepage | ⏳ parent palette lock |
| Agency Signal | ⏳ pending | ⏳ pending | ⏳ pending | ⏳ pending |
| DOT Intel | ⏳ pending | ⏳ pending | ⏳ pending | ⏳ pending |
| Seven16 Email | ⏳ pending | ⏳ pending | n/a (pricing-page) | ⏳ pending |
| Seven16 Survey | ⏳ pending | ⏳ pending | ⏳ pending | ⏳ pending |
| Seven16 Command | ⏳ bake into Phase 1 | ⏳ bake into Phase 1 | ⏳ bake into Phase 1 | ⏳ pending |
| Bind Lab | ⏳ bake into Phase B | ⏳ bake into Phase B | ⏳ bake into Phase B | ⏳ pending |
| Seven16 Academy | ⏳ bake into v1 | ⏳ bake into v1 | ⏳ bake into v1 | ⏳ pending |
| DotCarriers | ⏳ bake into decouple | ⏳ bake into decouple | ⏳ bake into decouple | ⏳ pending |
| DotAgencies | ⏳ bake into decouple | ⏳ bake into decouple | ⏳ bake into decouple | ⏳ pending |
| Seven16 Group Support | ⏳ bake when scoped | ⏳ bake when scoped | ⏳ bake when scoped | ⏳ pending |
