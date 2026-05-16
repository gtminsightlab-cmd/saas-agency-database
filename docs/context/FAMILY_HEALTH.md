# Seven16 Family Health Snapshot

**Last refresh:** 2026-05-15 (SESSION_24 — first snapshot, v1)
**Mechanism source:** [`ANTI_DECAY_PROTOCOL.md`](ANTI_DECAY_PROTOCOL.md) Mechanism #1
**Update cadence:** at the close of any family-touching session per Working Agreement Rule 5 sub-bullet.

> One screen. All repos. Status colors so drift is visible before it bites. Cross-product dependencies tracked explicitly so an item in one repo doesn't quietly block another.

---

## Per-repo snapshot

| Repo | Last commit | Days since session | Active arc | Days in-flight | Queue depth | Health |
|---|---|---|---|---:|---:|:-:|
| **saas-agency-database** | 2026-05-15 `7918a30` | 0 (SESSION_23 close) | (hub) Family Health Snapshot → Stripe catalog (SESSION_25). (AS) AS Session 5 Option A — SWR client-cache on `/build-list` + `/saved-lists` | 0 (hub), 1 (AS) | 11 + 6 carry | 🟢 |
| **dotintel2** | 2026-05-15 `6722f2d` | 1 (SESSION_29 close 2026-05-14) | Sub-arc 3A close — SODA-based CSA ingest pipeline (`scripts/csa-ingest-soda.ts` + percentile recompute migration + `/methodology` disclosure) | 2 | 9 | 🟢 |
| **seven16-distribution** | 2026-05-15 `035c7ce` | 0 (SESSION_1 rebaseline close) | Charter-readiness Slice 2 — `/pricing` page on marketing v2 reflecting D-021 architecture | 0 (rebuilt for D-021 today) | 9 | 🟢 |
| **seven16-platform** | n/a — no code repo yet | n/a | Sprint 1C (shared JWT/Doppler/Sentry runbook across satellites) — not started | n/a | n/a | 🟡 |

**Health legend:** 🟢 Active (touched ≤7d) · 🟡 Slow (8–30d or skeleton-only) · 🟠 Stale (31–60d) · 🔴 At-Risk (>60d)

**Aging-bucket note (v1 caveat):** Queue counts shown as totals only. Per-item aging buckets (0–7d / 8–30d / 31–60d / 61–90d / >90d) will populate when ANTI_DECAY_PROTOCOL Mechanism #2 (Stale Detection Convention — `[YYYY-MM-DD]` timestamps on every Queued item) lands in each repo's next session. All current items effectively in the 0–7d bucket since the BACKLOG.md system bootstrapped 2026-05-15 across the family.

---

## Items requiring attention this week

- **`[ACTION] dotintel2 SESSION_30 ready to launch`** — prep artifact drafted SESSION_24 tail under new Rule 2(b): [`docs/cross-repo/dotintel2_SESSION_30_ARTIFACT.md`](../cross-repo/dotintel2_SESSION_30_ARTIFACT.md). Contains the paste-ready SESSION_30 prompt + full SODA ingest script draft + 2 migration drafts + testing protocol. Master O opens dotintel2 SESSION_30 and pastes §C as the first message.
- **`[ACTION] dotintel2 dangling state`** — uncommitted in `dotintel2/`: `.gitignore` modified, `docs/SESSION_28_PROMPT.md` modified, 3 untracked files (`docs/KILLING_COMMERCIAL_TRAINING_HUB.md`, `docs/TRAINING_HUB_SESSION_HANDOFF.md`, `scripts/_mcp-mirror-helper.ts`). The two `*TRAINING_HUB*` docs were dropped in by a parallel "Killing Commercial" project session on 2026-05-13 — planning docs for a future training-hub integration, zero code yet. **Cleanup steps documented in cross-repo artifact §A.** Resolve at dotintel2 SESSION_30 open before SODA ingest work.
- **`[ACTION] Charter Member outreach`** — fully blocked on Stripe catalog migration (SESSION_25 Path A). Deck content updated SESSION_23; Gamma render is Master O's pending action; revenue capture cannot begin until Stripe SKUs exist.
- **`[ACTION] dotintel2 D-number reconciliation`** — local D-012/D-013/D-014/D-015/D-016 in `dotintel2/docs/STATE.md` + SESSION_28's D-017a-g still need rename to family-ledger IDs (queued as dotintel2 BACKLOG #9). ~5 min when picked up; Rule 4 integrity depends on it.
- **`[ACTION] dotintel2 STATE.md catch-up`** — last-updated header reads 2026-05-12; 2 sessions of drift (28 + 29) since. Queued as dotintel2 BACKLOG #4.

---

## Cross-product dependency map

Format: `[STATUS] consumer → producer (notes)`

| Status | Dependency | Notes |
|---|---|---|
| **[LIVE]** | Agency Signal `directory.*` schemas → `mirror-agency-signal` Edge Function (nightly cron) | D-013; last verified healthy 2026-05-15. Mirror filter = agencies with ≥1 transportation-vertical carrier appointment. ~1,887 location-level rows + ~23,546 contacts mirrored. |
| **[LIVE]** | All 7 D-021 pricing surfaces locked | Architecture is the producer; consumer surfaces (TIQ /pricing, dotintel2 marketing, Charter deck) can render. Implementation gated on Stripe catalog (next dependency). |
| **[PENDING]** | Charter Member outreach revenue capture → Stripe catalog migration | SESSION_25 Path A target. Builds Stripe products + prices + entitlements for all 7 surfaces. Highest single-session ROI from here. |
| **[PENDING]** | TIQ `/pricing` page (seven16-distribution Slice 2 active arc) → all `saas-agency-database/docs/context/PRICING_*.md` specs | Status: ✅ all 7 specs locked. Build unblocked — `~120 min, ~5–6 files` per seven16-distribution BACKLOG. |
| **[PENDING]** | `seven16-platform` shared JWT/auth runbook → Sprint 1C (Doppler + Sentry runbook across satellites) | All 3 product satellites partially observability-shipped (Speed Insights + Analytics + security headers via `403863b` / `fea5b34` / `d4245a9`); Sprint 1C ties them into shared auth runbook. Not started. |
| **[PENDING]** | dotintel2 Killing Commercial Training Hub integration → planning docs only, zero code | Untracked planning docs in `dotintel2/docs/`. Dependent on agency dashboard for Learning Center team-pack admin (per SESSION_23 cascade). |
| **[PREPPED]** | dotintel2 Sub-arc 3A SODA ingest → `data.transportation.gov` SODA API + `csa.recompute_percentiles()` + `csa.refresh_carrier_safety_summary()` migrations | Prep artifact drafted SESSION_24 under Rule 2(b): [`docs/cross-repo/dotintel2_SESSION_30_ARTIFACT.md`](../cross-repo/dotintel2_SESSION_30_ARTIFACT.md). Contains paste-ready SESSION_30 prompt + full `csa-ingest-soda.ts` v1 draft (~280 lines TypeScript) + percentile-recompute migration SQL (~80 lines) + summary-rebuild migration SQL (~50 lines) + testing protocol + 10 known gotchas. SODA API stable as of 2026-05-15. Three resource IDs: `4y6x-dmck` BASIC, `rbkj-cgst` Inspection, `4wxs-vbns` Crash (memory `reference_fmcsa_soda_resource_ids.md`). Status flips to `[LIVE]` after dotintel2 SESSION_30 runs first real ingest. |
| **[BLOCKED-internal]** | dotintel2 BACKLOG #9 (D-number reconciliation) → next dotintel2 session bandwidth | ~5 min fix; blocks family-ledger Rule 4 integrity until shipped. |

---

## Charter Member program status

| Metric | Value |
|---|---|
| Cap target | 50–75 accounts |
| Currently enrolled | 0 (outreach not yet started) |
| Enrollment window | 60–90 days from program launch (start date TBD) |
| Offer shape | Best pricing tier permanently across everything purchased (per D-018 amended by D-021) |
| Deck content | ✅ Updated SESSION_23 (slides 9, 10, 17, 18); compound $5,000+/yr savings example for 15-truck fleet |
| Deck render (Gamma) | 🟡 Pending Master O action |
| Stripe revenue capture | 🟡 Blocked — pending SESSION_25 Path A Stripe catalog migration |
| 25%-off SKU integrations | ✅ TIQ (always Scale-tier overage) · ✅ DOT Alerts (any tier) · ✅ Directory listings · ✅ Learning Center · ✅ +40% credit bonus (effective ~$0.107/credit) |

---

## D-021 pricing architecture lock status (7 surfaces)

| Surface | Lock status | Spec file |
|---|---|---|
| Universal credits ($0.15/credit + bonus bands) | ✅ Locked SESSION_22 (amends D-014 from $0.29 → $0.15) | `PRICING_CREDITS_AND_TOPUPS.md` (needs amendment banner) |
| TIQ tiers (Launch $500 / Growth $1,500 / Scale $4,000) | ✅ Locked SESSION_22 | `PRICING_THRESHOLD_IQ.md` |
| DOT Alerts flat tier bands ($25 → $500+) | ✅ Locked SESSION_22 | `PRICING_DOT_ALERTS.md` |
| Directory listings (carriers FREE / agents $120/yr / wholesalers $1k/mo) | ✅ Refined SESSION_23 | `PRICING_DIRECTORY_LISTINGS.md` |
| Lead downloads (universal credit consumption) | ✅ Locked SESSION_22 | `PRICING_LEAD_DOWNLOADS.md` |
| Learning Center ($29.95/seat + 1–25 team-pack toggle) | ✅ Locked SESSION_23 | `PRICING_LEARNING_CENTER.md` |
| Charter Member integrations (25% off + best-tier-on-everything) | ✅ Locked SESSION_22 + extended SESSION_23 | Each PRICING_*.md §"Charter integration" section |

**Enterprise+ layer (second-ICP)** sits adjacent: `PRICING_ENTERPRISE_LAYER.md` per D-015 (state-based slider + Distribution+ outcome SKU). Outside D-011 small-firm design target — different ICP, different sales motion.

---

## External dependencies

| Status | Vendor / API | Used by | Notes |
|---|---|---|---|
| ✅ Stable | FMCSA SODA (`data.transportation.gov`) | dotintel2 CSA ingest | Free public API. 50k/page pagination, no auth. Resource IDs: `4y6x-dmck` / `rbkj-cgst` / `4wxs-vbns`. |
| ✅ Stable | Vercel (`prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV`, `prj_4tnPATJjP4Bahg2RFw4DwlTuNa8S`, `prj_c6kzFEhpw6Uwb12TECUidKlBxOwr`) | All 3 product surfaces | Auto-deploys on `main` push. Speed Insights + Analytics live across family. |
| ✅ Stable | Supabase org `dotintel` (Pro tier, $25/mo covers all projects) | All 4 satellites | `sdlsdovuljuymgymarou` (AS) + `vbhlacdrcqdqnvftqtin` (DOT Intel) + `yyuchyzmzzwbfoovsskz` (TIQ) + `soqqmkfasufusoxxoqzx` (platform). Daily backups included. PITR ($100/mo per project) NOT yet enabled — `project_pre_launch_security_gates.md` flags as launch gate. |
| ✅ Stable | Cloudflare DNS | All domains (3 DOT brands + AS + TIQ) | Token zone-scoped per domain (per memory `feedback_cloudflare_token_zone_scoping.md`). |
| 🟡 Sandbox-only | Stripe (`acct_1TLUF6HmqSDkUoqw` DOT Intel sandbox + AS sandbox same account) | Both, sandbox | Live cutover trigger = first paying customer. Catalog buildout = SESSION_25 Path A. |
| 🟡 Pilot-only | Sentry (`seven16` org, `dotintel-web` project) | dotintel2 only so far | Rollout planned: dotintel2 ✅ → directory admin → Threshold IQ. AS Session 4 shipped pilot on `directory-admin` Sentry project. |
| ⏸️ Not wired | PostHog, Better Stack uptime | None yet | Accounts ready (memory `reference_observability_stack_sentry.md`); rollout deferred. |
| ⏸️ Not wired | Upstash (rate limiting) | None yet | Pre-launch security gate per `project_pre_launch_security_gates.md`. Free tier sufficient pre-revenue. |
| ⏸️ Not wired | GitHub Advanced Security | N/A (repos public) | Memory flags for private-repo conversion if/when. |

---

## Parked/spinoff repos (no active drift surface)

These exist but are not on the active drift-risk surface. Listed here so they don't get forgotten if/when triggered:

- **`dotintel-intelligence`** — legacy "Agency Intelligence" Next 14 build. Subdomain `intelligence.dotintel.io` resolves to dead build. Decommission queued as dotintel2 BACKLOG #8 (redirect to `directory.seven16group.com/verticals`). Own-session work when picked up.
- **Killing Commercial** — separate Claude project folder at `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Killing Commercial\`. Scraping + synthesis project that dropped planning docs into dotintel2 on 2026-05-13 (see "Items requiring attention" above).
- **Older spinoffs** — most retired (BindLab, Agency Vantage per DECISION_LOG §4). No code repos to surface here.

---

## How to use this snapshot

**At session open:**
- Glance at the Per-repo table. Any 🟠 or 🔴 health status drives the week's priority focus per ANTI_DECAY_PROTOCOL Mechanism #3 (Weekly Cross-Product Review).
- Scan Items Requiring Attention for action items in scope for the repo you're about to open.
- Check the Cross-Product Dependency Map for any `[PENDING]` items that intersect this session's arc.

**At session close** (per Working Agreement Rule 5 sub-bullet):
- Update the relevant repo's row in the Per-repo table (last commit, days-in-flight, queue depth).
- Move any new dependencies into the Cross-Product Dependency Map.
- Promote/demote any Items Requiring Attention.
- Stamp this file's "Last refresh" date.

**At first Monday of each month** (ANTI_DECAY_PROTOCOL Mechanism #4 Monthly Sweep):
- Full regenerate. Audit every dependency. Triage every stale item. Reconcile every memory file.

---

*v1 snapshot — refines as ANTI_DECAY_PROTOCOL mechanisms #2 (timestamps) and #6 (full dependency map) populate over subsequent sessions.*
