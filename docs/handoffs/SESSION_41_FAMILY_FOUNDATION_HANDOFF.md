# SESSION_41 — Family Foundation 72-Hour Doctrine Arc (2026-05-27 → 2026-05-30)

**Arc closed:** 2026-05-30 (current session, ~72% context window remaining when arc completed)
**Branch state:** all 5 active repos on `main`, synced to origin, working trees clean (untracked items belong to parallel sessions)
**Predecessor:** [`SESSION_40_DOMAIN_CUTOVER_D037_HANDOFF.md`](SESSION_40_DOMAIN_CUTOVER_D037_HANDOFF.md)
**Successor:** [`SESSION_42_PROMPT.md`](SESSION_42_PROMPT.md) — Group Hub Phase 1 Sub-wedge 1

---

## What this arc was

A 72-hour stretch that locked the foundational operating-system framework for the Seven16 family of products. **9 family-wide decisions** (D-037 through D-045) + **D-045 token refresh shipped live** to seven16group.com + **family-notified across 4 satellite repos**. Foundation now complete; everything from here is execution.

The business goal driving this: **intuitive AI support + intuitive sales + intuitive onboarding → reduced refunds + reduced non-renewals.** Architecture is the mechanism; retention is the goal.

---

## Decisions locked (9 family-wide)

| # | Decision | Status | Source |
|---|---|---|---|
| **D-037** | Family URL + brand updates (agencysignal.co → .io; api.seven16email.com → seven16email.com; Bind Lab Academy → Seven16 Academy) | ✅ AUTHORITATIVE | DECISION_LOG + cross-repo prep |
| **D-038** | Seven16 Email pricing v1 (7-tier ladder; later refined to $59/$499 via D-E029) | ✅ AUTHORITATIVE | DECISION_LOG + family memory `project_seven16_email_pricing_v1.md` |
| **D-039** | Charter Member code rollback (executes D-034 family-wide kill) | ✅ AUTHORITATIVE | DECISION_LOG + code stripped from `app/api/stripe/{checkout,webhook}/route.ts` |
| **D-040** | Family platform architecture (multi-tenant + entitlements + RLS + 3-level access + tenant_id everywhere + index-on-RLS + Edge Function workers + central-truth phased path) | ✅ AUTHORITATIVE | family memory `reference_family_platform_architecture.md` |
| **D-041** | Seven16 Survey / Activator pricing (Solo/Agency/MGA + $297 packs; founder tier removed) | ✅ AUTHORITATIVE | family memory `project_seven16_survey_pricing_v1.md` |
| **D-042** | Seven16 Group Master Command Center (parent-company operating system; product registry + provider connectors + cost ledger + AI usage ledger + security events + alert engine + audit log + kill switches) | ✅ AUTHORITATIVE | family memory `project_seven16_group_master_command_center.md` |
| **D-043** | Family design coordination framework (skeleton vs skin + 80/20 logged-in flex + 70/30 marketing flex + 5 family rules + 20-item launch DoD; typography portion later superseded by D-045) | ✅ AUTHORITATIVE | family memory `project_seven16_family_design_coordination_standard.md` |
| **D-044** | Family Intelligence + Self-Generating Artifact Architecture (federated product apps + cross-product event bus + shared artifact factory + shared knowledge registry; 4 conflicts resolved 2026-05-30) | ✅ AUTHORITATIVE | family memory `project_seven16_family_intelligence_artifact_architecture.md` |
| **D-045** | Family Command Center visual lock (12-token parent palette + per-product accents by category + Manrope/Inter/JetBrains typography + 14-section homepage sequence + 4-zone dashboard pattern + extended avoid list); supersedes D-043 typography | ✅ AUTHORITATIVE + LIVE | family memory `project_seven16_family_command_center_visual_lock.md` + canonical reference at `seven16-group-site/docs/design-system.md` |

---

## Code shipped (live in production)

**seven16-group-site** (`9b16cef`) — D-045 token refresh:
- `src/app/globals.css` — added 14 `--color-s16-*` tokens (12 parent palette + 2 category accents); Seven16 gold brightened `#C8A75D` → `#F5B841`; updated typography utility classes (.text-display / .text-headline / .text-section) to use sans display (Manrope, weight 700/700/600)
- `src/app/layout.tsx` — Fraunces import swapped for Manrope; variable renamed `--font-serif-loaded` → `--font-display-loaded`; `--font-serif` preserved as backward-compat alias pointing at Manrope
- `docs/design-system.md` NEW — canonical reference doc for other family repos to copy-paste from

**Verified live** at seven16group.com:
- 14 `--color-s16-*` tokens compiled into production CSS
- Manrope sans display serving (Fraunces dropped)
- Vercel deployment READY: `dpl_7Fn6UQuEgPSW4kFRSLyFYqQwz8en`

**saas-agency-database** — Charter rollback (`732d0a9`) + URL cutover (`967aea3`) + all DECISION_LOG entries + cross-repo prep artifacts.

---

## Family memory created (5 new canonical docs)

All under `~/.claude/projects/C--Users-GTMin-Projects-saas-agency-database/memory/`:

1. **`reference_family_platform_architecture.md`** — D-040 standard (multi-tenant + entitlements + RLS + 3-level access + Edge Function workers + central-truth phased path)
2. **`reference_family_pricing_catalog.md`** — canonical at-a-glance pricing index for the family (5 of 9 products locked: AS / DOT Intel / Email / Survey + Academy partial)
3. **`project_seven16_group_master_command_center.md`** — D-042 spec (Group Hub responsibility + per-satellite responsibilities)
4. **`project_seven16_family_design_coordination_standard.md`** — D-043 framework
5. **`project_seven16_family_command_center_visual_lock.md`** — D-045 visual implementation
6. **`project_seven16_family_intelligence_artifact_architecture.md`** — D-044 intelligence + artifact factory
7. **`project_seven16_email_pricing_v1.md`** — D-038 (refined to D-E029 numbers)
8. **`project_seven16_survey_pricing_v1.md`** — D-041

`MEMORY.md` index updated with all entries.

---

## Cross-repo prep artifacts (in `saas-agency-database/docs/cross-repo/`)

Paste-ready per-satellite BACKLOG entries for each family-wide doctrine:

1. **`family-master-command-center-prep.md`** — D-042 satellite responsibilities (telemetry POSTer + per-product control room) for 10 satellites
2. **`family-design-coordination-prep.md`** — D-043 alignment sub-arcs (token import + design migration) for 10 satellites
3. **`family-intelligence-artifact-prep.md`** — D-044 event emission + artifact templates + cross-product subscriptions for 10 satellites
4. **`family-command-center-visual-lock-prep.md`** — D-045 token import + homepage 14-section refresh + dashboard 4-zone adoption for 10 satellites
5. **`family-master-command-center-prep.md`** — (overlaps with #1 above; consolidated above)

---

## Repos touched (5 repos, 13 commits)

| Repo | Commits this arc | Latest commit | Purpose |
|---|---|---|---|
| **saas-agency-database** | 6 | `577260c` | All D-### entries + cross-repo prep + Charter rollback + URL cutover + BACKLOG family notification |
| **seven16-group-site** | 1 | `9b16cef` | D-045 token refresh LIVE on seven16group.com |
| **dotintel2** | 1 | `7976d73` | BACKLOG family notification |
| **seven16-email** | 1 | `07d74fc` | BACKLOG family notification |
| **bindlab** | 1 | `668a0ac` | BACKLOG family notification |

All on `main`, synced to origin.

**Untracked items not committed** (belong to parallel sessions, not this arc):
- `saas-agency-database/AGENTS.md` (Master O artifact)
- `dotintel2/app/methodology/page.tsx` modified (parallel S60 work)
- `seven16-email/supabase/migrations/0044_cta_performance.sql` (parallel session)

---

## What's NOT done yet (deferred)

### Highest priority (Master O's "in order" sequence)

1. **Group Hub Phase 1** in seven16-group-site (~3 sessions) — ships the `/api/internal/events` HMAC endpoint + product registry + foundation tables that 7+ satellites are waiting on per D-042/D-044. **SESSION_42 = Sub-wedge 1.**
2. **seven16-group-site homepage refresh to 14-section sequence** (~1-2 sessions) — flips the marketing site to the locked structure + becomes logged-in shell reference for the family.
3. **Remaining pricing dumps** — DotCarriers · DotAgencies · Bind Lab · Seven16 Academy multi-program · Seven16 Command scope.

### Per-satellite D-045 visual adoption sub-arcs (parallel, ~0.5 session each)

Now that seven16-group-site is the canonical reference + the design-system.md doc is published:
- Agency Signal (saas-agency-database) — token import + accent assignment
- DOT Intel (dotintel2) — token import + accent + risk-module dashboard 4-zone
- Seven16 Email — token import + accent + campaign-builder refresh
- Bind Lab — token import + accent + Phase B bake-in
- Greenfield (Academy, Command, DotCarriers, DotAgencies, Group Support) — bake into v1/Phase B/decouple/scope sessions

### Per-satellite D-042 telemetry POSTer wires (parallel, ~1 session each)

Wait for Group Hub Phase 1 `/api/internal/events` endpoint to ship, then every satellite wires HMAC-signed POST for `ai.usage` / `cost.usage` / `security.event` / `product.health` / `billing.event` events.

### Master O dashboard ops still pending

- Stripe webhook URL rotation `.co → .io` (signing-secret preserved per SESSION_38 pattern)
- Vercel: confirm `agencysignal.io` is set as Primary domain
- Supabase: apply migration `0007_agency_signal_domain_cutover.sql` to flip production `products.domain` row
- Stripe Dashboard: deactivate Charter coupon `L1Ngigfc`; archive any test Charter SKUs
- Dependabot review (2 vulnerabilities — 1 high, 1 moderate — flagged earlier; deferred to Agency Signal session)

---

## Open questions still parked

1. **Seven16 Survey vs Seven16 Activator dual-naming** — copy uses "Activator"; domain is `seven16survey.com`; catalog says "Survey / Activator"
2. **Seven16 Command scope** — sold as standalone customer-facing product OR internal-only family infrastructure?
3. **Per-product accent confirmations beyond D-045 category mapping** — current mapping is category-based; if Master O wants individual product accents (e.g. "Bind Lab is distinct from Agency Signal even though both = CRM"), that's a future refinement
4. **Cross-product bundles post-D-034** — D-034 killed Family Pack; ad-hoc 2-product bundles still TBD
5. **B2B2C reseller tenancy** — does Bind Lab pay for its appointed producers' Agency Signal seats? Affects D-040 membership schema
6. **Cross-product entitlement unlocks from Seven16 Academy certs** — paid (tier credit) or comp'd (cert perk)?

---

## Next session entry point

**SESSION_42 = Group Hub Phase 1 Sub-wedge 1** — Ship the foundation tables + `/api/internal/events` HMAC endpoint in seven16-group-site.

Paste-ready opener: [`SESSION_42_PROMPT.md`](SESSION_42_PROMPT.md).

---

## Doctrine cross-refs

Family memory hub: `C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\MEMORY.md`

Read at any family-repo session open:
- `MEMORY.md` (auto-loaded for saas-agency-database; read-on-open for other family repos per global CLAUDE.md)
- `reference_family_product_catalog.md` (what each product is)
- `reference_family_pricing_catalog.md` (what each product costs)
- `reference_family_platform_architecture.md` (D-040)
- `reference_family_supabase_security_baseline.md` (4-tier RLS + audit recipe)
- `reference_family_api_integration_mesh.md` (D-027)
- `project_seven16_group_master_command_center.md` (D-042)
- `project_seven16_family_design_coordination_standard.md` (D-043)
- `project_seven16_family_intelligence_artifact_architecture.md` (D-044)
- `project_seven16_family_command_center_visual_lock.md` (D-045)

Repo doctrine: `saas-agency-database/docs/context/DECISION_LOG.md` — full D-001 through D-045 history.
