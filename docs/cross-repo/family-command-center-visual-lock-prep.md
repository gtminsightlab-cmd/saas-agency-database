# Family-wide Command Center Visual Lock — cross-repo prep

**Created 2026-05-30 by D-045 (Seven16 family Command Center visual lock — AUTHORITATIVE DOCTRINE).**

**Family memory ref:** `~/.claude/.../memory/project_seven16_family_command_center_visual_lock.md`
**DECISION_LOG:** D-045 in `saas-agency-database/docs/context/DECISION_LOG.md`
**Status:** ✅ AUTHORITATIVE DOCTRINE — satellites build against this without further gates.

This is the paste-ready prep artifact each satellite reads to implement the locked visual specifications. **D-045 fills in the TBDs from D-043** and supersedes the D-043 typography lock (Fraunces → Geist/Inter).

---

## The 60-second summary every satellite reads first

1. **Style direction:** Command Center SaaS — feel closer to Linear / HubSpot / Mailchimp / Coursera Business / Stripe / Webflow.
2. **Typography supersession:** Drop Fraunces (D-043 was Sanity-editorial era). Use **Inter** for product UI + **Manrope** for marketing headlines + **JetBrains Mono** for code (unchanged).
3. **Parent palette:** deep navy `#07111F` / soft white `#F8FAFC` / Seven16 gold `#F5B841` / signal blue `#2563EB` + success/warning/error.
4. **Per-product accent assigned per category** — see family memory doc for your product's specific palette.
5. **Homepage uses the locked 14-section sequence** + dashboards use the locked 4-zone pattern.
6. **Hero shows real product UI**, not generic illustrations. Layered command center over dark navy.
7. **Avoid list extended:** no purple gradients · no robots · no cartoon mascots · no fake hologram dashboards · no stock business people.

---

## Per-satellite paste-ready BACKLOG entries

Each satellite's next session: copy the matching block into `docs/BACKLOG.md`.

### seven16-group-site (canonical reference home)

```markdown
**[FAMILY-REF] Command Center visual refresh — supersedes S6.5 typography (D-045)**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

seven16-group-site is the canonical reference implementation. With D-045 locking the Command Center direction, the S6.5 Sanity-editorial typography (Fraunces) is superseded. Three sub-arcs:

A. **Token refresh** (~0.5 session)
- Replace Fraunces with Manrope (marketing headlines) + Inter (UI). Keep JetBrains Mono.
- Update design tokens file to publish the D-045 parent palette (12 named colors).
- Document the per-product-accent token convention (`--<product>-accent-primary` / `--<product>-accent-secondary`).

B. **Homepage migration to 14-section sequence** (~1-2 sessions)
- Restructure the existing S6.5 homepage into the locked 14-section sequence (Nav / Hero / Trust strip / Problem / Platform pillars / Product walkthrough / Use cases / Dashboard proof / How it works / Security + support / Integrations / Pricing preview / FAQ / Final CTA).
- Hero becomes layered product UI graphic (NOT abstract illustration).

C. **Admin shell adopts the Command Center dashboard pattern** (~1 session)
- Existing /admin partner/RBAC surfaces adopt the 4-zone layout (4 KPI cards top / chart + recommended actions middle / right rail / activity feed bottom).
- This becomes the LOGGED-IN reference for other products to copy.

Sequencing: A first (unblocks every other product's token import). B + C can run in parallel.
```

### Agency Signal (saas-agency-database)

```markdown
**[FAMILY] Command Center visual refresh (D-045) — supersedes D-043 typography portion**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

Agency Signal accent assignment per D-045: CRM category → **signal blue `#2563EB` + success green `#16A34A`**.

A. **Token import + Fraunces → Manrope/Inter migration** (~0.5 session)
- Wait for seven16-group-site token refresh to publish; then sync tokens via the `// SOURCE: seven16-group-site/...` copy-paste pattern.
- Replace Fraunces references in components with Manrope (marketing) / Inter (UI).

B. **Logged-in dashboard adopt 4-zone pattern** (~1 session)
- /build-list dashboard + /saved-lists + /admin surfaces adopt the 4-zone layout.
- KPI cards: Saved lists / Producer signals / Recruit-ready agencies / Conversion rate (per D-045 §"4 KPI cards example").
- Right rail: AI coach (when available) + alerts + tasks.

C. **Marketing site refresh** (~1-2 sessions)
- Apply the 14-section homepage sequence at agencysignal.io.
- Hero shows layered product UI (build-list + saved-list intelligence panel + carrier appointment data) — NOT abstract illustration.
- Adopt the avoid list extensions.

Sequencing: A first, then B + C in parallel.
```

### DOT Intel (dotintel2 repo)

```markdown
**[FAMILY] Command Center visual refresh (D-045)**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

DOT Intel accent assignment per D-045: Analytics/Intelligence category → **dark navy `#0F172A` + signal green `#16A34A`** (matches signal-based / risk-aware personality from D-043).

A. **Token import + typography migration** (~0.5 session — after seven16-group-site token refresh)

B. **Risk-module dashboard adopts 4-zone pattern** (~1 session)
- 4 KPI cards: Active prospects / Risk alerts triggered / Carrier appointments / Pipeline value influenced.
- Right rail: AI risk coach + alerts + tasks (the risk-module work already in flight per D-035 maps cleanly into this).

C. **Marketing site refresh** (~1-2 sessions)
- 14-section homepage at dotintel.io.
- Hero shows layered intelligence panel (carrier search + risk signal cards + AI coach + analytics).
- Use signal green sparingly for "risk-aware" accent moments; avoid the overused-amber-risk-warning pattern.
```

### Seven16 Email (seven16-email repo)

```markdown
**[FAMILY] Command Center visual refresh (D-045)**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

Seven16 Email accent: Email marketing category → **coral `#FB7185` + signal blue `#2563EB`**.

A. **Token import + typography migration** (~0.5 session)

B. **Campaign builder + sequence editor + reporting** (~1-2 sessions)
- 4 KPI cards: Active campaigns / Email reply rate / Delivery rate / AI assistance usage.
- Right rail: AI campaign coach + deliverability alerts + tasks.
- Use coral as the conversion-energy accent (matches "AI-powered campaigns" positioning per D-038).

C. **Pricing page refresh** (~1 session — fold into the D-E029 pricing page build)
- Adopt 14-section homepage sequence; pricing cards use the D-045 typography + tokens.
```

### Seven16 Survey (seven16survey repo)

```markdown
**[FAMILY] Command Center visual refresh (D-045)**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

Seven16 Survey accent: Email marketing / Conversion → **coral `#FB7185` + signal blue `#2563EB`** (matches conversion-focused / easy-to-launch personality from D-043).

A. **Token import + typography migration** (~0.5 session)

B. **Lane B kanban + survey builder + share-kit** (~1 session)
- Logged-in dashboards adopt 4-zone pattern.
- KPI cards: Active surveys / Completion rate / Lane B kanban velocity / Vertical packs purchased.

C. **Marketing refresh** (~1 session)
- 14-section homepage at seven16survey.com.
- Hero shows survey-completion deliverable preview (Carrier Risk Checklist) + activation kanban.
```

### Seven16 Academy (seven16-academy repo per D-037 rename pending)

```markdown
**[FAMILY] Command Center visual refresh (D-045) — BAKE INTO v1**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

Seven16 Academy accent: Learning platform category → **indigo `#4F46E5` + Seven16 gold `#F5B841`** (achievement framing; gold = cert/credential — fits Academy's cert-program-as-product).

Greenfield — bake into v1 build from day one:
- Tokens + Manrope/Inter from initial scaffolding.
- 14-section homepage at seven16academy.com.
- Logged-in dashboards adopt 4-zone pattern: KPI cards (Learning completion / Active learners / Skill scores / Certifications earned) + right rail AI coach + alerts.
- Hero shows layered learning UI (mission pack preview + lesson + quiz + roleplay scoring + AI coach recommendation).
- Mobile-first PWA constraint per D-029 — apply Command Center direction at 320px-wide.
```

### Seven16 Command (seven16-command-center repo) — BAKE INTO Phase 1

```markdown
**[FAMILY] Command Center visual refresh (D-045) — BAKE INTO Phase 1**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

Seven16 Command accent: CRM category → **signal blue `#2563EB` + success green `#16A34A`**.

Phase 1 greenfield — bake in:
- Tokens + Manrope/Inter from first dashboard PR.
- 4-zone CRM dashboard pattern as the canonical reference for other CRM-flavored products (Bind Lab, Agency Signal logged-in).
- KPI cards (Pipeline influenced / Active deals / Follow-up tasks due / Activity per rep).
- Right rail AI sales coach + alerts + tasks.
- This becomes the reference for tenant-management UX across the family (since Command IS the customer-state SoR per D-027 + D-042 mirror source).
```

### Bind Lab (bindlab repo) — BAKE INTO Phase B

```markdown
**[FAMILY] Command Center visual refresh (D-045) — BAKE INTO Phase B**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

Bind Lab accent: CRM / Workflow category → **signal blue `#2563EB` + success green `#16A34A`** (matches operational/workflow-driven personality from D-043).

Phase B build hasn't started. Bake D-045 in from day one:
- Submission/binder workflow surface uses the 4-zone dashboard pattern.
- Form/table/modal primitives heavy (Bind Lab is workflow-dense).
- Tokens + Manrope/Inter from scaffolding.
- Personality LOCKED per D-043: confident · operational · structured · serious · workflow-driven · enterprise-grade. NOT lightweight CRM template.
```

### DotCarriers / DotAgencies (decouple repos) — BAKE INTO decouple

```markdown
**[FAMILY] Command Center visual refresh (D-045) — BAKE INTO decouple build**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

Both products pre-decouple. When each decouple session opens, bake D-045 in:
- DotCarriers accent: Analytics/Directory → dark navy + signal green.
- DotAgencies accent: CRM/Directory → signal blue + success green.
- 14-section homepage sequence + 4-zone dashboard pattern from day one.
- Tokens + Manrope/Inter from initial scaffolding.
```

### Seven16 Group Support (when scoped)

```markdown
**[FAMILY] Command Center visual refresh (D-045)**
*Source:* family memory `project_seven16_family_command_center_visual_lock.md`.

Seven16 Group Support accent: Calm service category → **deep navy `#07111F` + warning amber `#F5B841`** (calm + parent-brand-trust, NOT alarming).

Bake in when Support project scopes. Support is the parent-brand trust surface — Very High consistency per D-043 matrix. Adopt parent palette + Seven16 gold accent verbatim.
```

---

## Order of operations across the family

1. **NOW (high-leverage 0.5 session):** seven16-group-site refreshes design tokens (D-045 palette + Manrope/Inter typography). Publishes the design-system.md reference. This unblocks every other product's copy-paste.
2. **Phase A (parallel after #1):** every shipped product runs its token import + typography migration. ~0.5 session each.
3. **Phase B (parallel, takes longer):** each shipped product refreshes its homepage to the 14-section sequence + its logged-in dashboard to the 4-zone pattern. ~1-2 sessions each.
4. **Greenfield products** (Bind Lab Phase B, Seven16 Academy v1, DotCarriers/Agencies decouple, Seven16 Command Phase 1, Group Support when scoped): bake D-045 in from day one. No retrofit cost.

Total estimated cost: ~10-15 sessions across the family to reach full D-045 adoption. Most sessions are 0.5-1.5 hours each.

---

## Tracking — who's adopted what

Update as each satellite's adoption sub-arc lands:

| Product | Token import + typography | Homepage 14-section | Dashboard 4-zone |
|---|---|---|---|
| seven16-group-site | n/a (canonical source) | ⏳ refresh from S6.5 → Command Center | ⏳ admin shell |
| Agency Signal | ⏳ pending | ⏳ pending | ⏳ pending |
| DOT Intel | ⏳ pending | ⏳ pending | ⏳ pending |
| Seven16 Email | ⏳ pending | ⏳ fold into pricing-page build | ⏳ pending |
| Seven16 Survey | ⏳ pending | ⏳ pending | ⏳ pending |
| Seven16 Academy | ⏳ bake into v1 | ⏳ bake into v1 | ⏳ bake into v1 |
| Seven16 Command | ⏳ bake into Phase 1 | ⏳ bake into Phase 1 | ⏳ bake into Phase 1 |
| Bind Lab | ⏳ bake into Phase B | ⏳ bake into Phase B | ⏳ bake into Phase B |
| DotCarriers | ⏳ bake into decouple | ⏳ bake into decouple | ⏳ bake into decouple |
| DotAgencies | ⏳ bake into decouple | ⏳ bake into decouple | ⏳ bake into decouple |
| Seven16 Group Support | ⏳ bake when scoped | ⏳ bake when scoped | ⏳ bake when scoped |

---

## Final standard (unchanged from D-043 + D-045 ratification)

> **Users should know they are inside a Seven16 Group product without every product looking the same.**

D-043 locked the rule. D-045 locks the concrete visual implementation. Together: every product feels related at the skeleton level + earns its own audience at the skin level.
