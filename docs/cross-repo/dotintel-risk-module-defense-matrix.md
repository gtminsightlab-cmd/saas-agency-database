# DOT Intel — Risk Module Defense Matrix

**Source session:** Agency Signal S39 / cross-repo prep artifact for dotintel2
**Per Working Agreement Rule 2(b):** This file lives in saas-agency-database's tree as paste-ready prep. The next dotintel2 session moves it to `dotintel2/docs/specs/dotintel-risk-module-defense-matrix.md` and applies the implementation arcs.

**Authored:** 2026-05-26 (during AS S39)
**Theme:** Per-module value defense + UI visualization spec + gap-to-✅ checklist for the 8-module DOT Intel risk intelligence framework.

**Why this doc:** Master O directive 2026-05-26 — "I wish there was a way to assure each module was applying specific value and signal and detail and insights and that we could describe it and defend why it's important." The trust-layer architecture locked 2026-05-25 in `project_dotintel_trust_layer_architecture.md` shipped 6 of these 8 modules. This doc adds Chameleon + Litigation as modules 7 + 8 and codifies the per-module **defensibility framework** that goes into the UI + sales conversations.

**Authoritative source for module DETAIL:** `dotintel2/docs/specs/modules/<module-name>-card.md` (one card per module — 8 cards total). The cards are written in dedicated dotintel2 sessions, not here. This file is the INDEX + framework.

---

## The defensibility framework — what every module card carries

Every module must answer these 8 questions, in this order, on a single page:

| # | Question | Why it matters |
|---|---|---|
| 1 | **Module name + status** | Live / Partial / Missing — never hide the maturity |
| 2 | **Signal** — what data feeds it | Verifiability. Anyone can replay the source query. |
| 3 | **Math** — how the score is computed | Defensibility. We can walk an underwriter through the calc. |
| 4 | **Visualization** — what the user sees | Comprehension. The user doesn't get a number; they get a takeaway. |
| 5 | **User takeaway** — the insight statement | The one-sentence value claim that goes on the screen. |
| 6 | **Defense** — why this matters in insurance specifically | The "underwriter would buy this because…" pitch. |
| 7 | **Reason codes + bindingUse** — what it can recommend | Practice-7 actionability framework from trust-layer. |
| 8 | **Maturity + evidence requirements** — Preview / Calibrated / Validated | Honest about the credibility curve. |

For ❌ modules, add #9: **gap detail + path to ✅** with session estimates.

---

## The 8 modules at a glance

| # | Module | Status | One-line value claim | UI surface |
|---|---|---|---|---|
| 1 | FMCSA Safety Baseline | ✅ Live | "What the government data says about this carrier's compliance" | BASIC bar group on carrier detail page |
| 2 | Peer Risk Rank | ✅ Live | "Is this carrier bad versus similar peers?" | Per-BASIC peer-rank ribbon |
| 3 | Violation Intensity | ⚠️ Partial | "Is the problem administrative or dangerous?" | Severity-tier breakdown panel |
| 4 | Trend / Recovery Forecast | ⚠️ Partial | "Where will this risk be at next renewal?" | 6-month trajectory sparkline |
| 5 | Authority & Insurance Verification | ✅ Live | "Can they legally operate and are filings current?" | Hard-gate status pills |
| 6 | Chameleon Detection | ❌ Missing | "Is there hidden prior risk via entity reuse?" | Linked-DOT card with evidence |
| 7 | Litigation Exposure | ❌ Missing | "Could this become a severity claim?" | Venue + cargo heatmap |
| 8 | Underwriting Fit / Market Fit | ⚠️ Architecture locked | "Which markets should look at this carrier?" | Appetite-match list with confidence |

---

## Per-module summaries (full cards live in dotintel2/docs/specs/modules/)

### Module 1 — FMCSA Safety Baseline (✅ LIVE)

- **Signal:** `csa.basic_scores_history` (7 BASICs × measure + percentile + alert + refresh) kept fresh via daily CSA cron (S42-43)
- **Math:** FMCSA SMS Methodology — we mirror it, we don't invent it. Reproduce per-BASIC `measure` from `csa.inspections_raw` × FMCSA severity weights × time decay.
- **Viz:** 7-bar BASIC group on the carrier detail page. Each bar shows: BASIC name + measure + percentile + alert-flag-if-any + last-refresh date.
- **User takeaway:** "Government baseline — what FMCSA's enforcement system thinks of this carrier."
- **Defense:** It's the table-stakes signal underwriters expect. We differentiate by **showing the refresh date prominently** (Carrier Software doesn't).
- **Maturity:** Preview today. Calibrated requires actuarial loss-ratio analysis vs. score-bands (gated on customer policy outcome data).

### Module 2 — Peer Risk Rank (SEG-aware percentile) (✅ LIVE)

- **Signal:** per-BASIC `percent_rank()` within carrier's Safety Event Group (similar inspection volume × PU × mileage exposure per FMCSA SMS Methodology)
- **Math:** Reconstructed openly per the `/methodology` page (S41 Path B). Cross-validated against FMCSA's `_ac` alert flag — >95% match = correct implementation.
- **Viz:** Each BASIC bar gets a **peer-rank ribbon** below it: "65th percentile of peers (out of 142 in your SEG)." Color-coded: green <50, amber 50-80, red 80+.
- **User takeaway:** "ISS 96 in 52nd percentile is NOT the same risk as ISS 96 in 85th percentile."
- **Defense:** Relative position is what underwriters actually care about. **This is the differentiator vs. Carrier Software's black-box scoring.** We publish methodology openly.
- **Maturity:** Preview. Promotion gated on customer feedback validating SEG-bound recall (we measure SEG-bound recall publicly at the moment).

### Module 3 — Violation Intensity (⚠️ PARTIAL)

- **Signal needed:** per-violation FMCSA severity weight (1-10) + OOS flag + recency tier (90d/12mo/24mo) + BASIC category + repeat-pattern detection
- **Signal we have:** `csa.inspections_raw` rows ingested; `csa_safety` scorer aggregates them but doesn't decompose by these 5 layers
- **Math gap:** Need 5-layer decomposition with rule: `intensity_score = sum(severity_weight × oos_multiplier × recency_decay × repeat_pattern_multiplier) / inspection_count`
- **Viz target:** Severity-tier breakdown panel — bars showing: % of violations OOS / % critical-severity / % within last 90 days / repeat-pattern count. Hover reveals which specific violations.
- **User takeaway:** "Score driven by repeat brake OOS in last 90 days, not paperwork."
- **Defense:** Underwriters depress premium on paperwork; KILL deals on brake/OOS repeats. Conflating them is the "magic score" anti-pattern.
- **Gap to ✅:** ~1 dotintel2 session. Refactor `csa_safety` scorer to emit per-layer scoring + add VIOLATION_HIGH_SEVERITY_REPEAT / VIOLATION_OOS_RECENT / VIOLATION_ADMINISTRATIVE_ONLY reason codes.

### Module 4 — Trend / Recovery Forecast (⚠️ PARTIAL)

- **Signal we have:** `public.carriers_history` audit table (S51) captures every authority/insurance/contact change; `csa.basic_scores_history` captures monthly BASIC deltas
- **Signal needed:** forward-projection from aging violations + recent clean inspections + new bad inspections + OOS trend + BASIC concentration
- **Math gap:** Rules-based pattern detector first (ML later). Example rule: "if 2+ critical violations age out in next 90 days AND no new OOS in last 60 days → 'Improving — 6-month BASIC forecast: 47th percentile' (was 78th)."
- **Viz target:** Sparkline on the carrier detail page — 6 months actual + 6 months projected. Below: text "Vehicle Maintenance trending toward 47th percentile by Sep 2026 (down from 78th now)."
- **User takeaway:** "Where the risk will be at renewal, not just where it is now."
- **Defense:** Underwriters bind 6-12 month policies. They need a forward signal. **This is the actuarial wedge.**
- **Gap to ✅:** ~1-2 dotintel2 sessions. New `trend_forecast` scorer that runs nightly on `carriers_history` + `csa.basic_scores_history` deltas. Reason codes: TREND_IMPROVING_AGING_OUT / TREND_DETERIORATING_RECENT_OOS / TREND_STABLE_LOW_VOLUME.

### Module 5 — Authority & Insurance Verification (✅ LIVE)

- **Signal:** SODA `6eyk-hxee` daily refresh — `common_stat` / `contract_stat` / `*_app_pend` / `*_rev_pend` / `bipd_file` / `cargo_file` / `bond_file` / `min_cov_amount` / `undeliverable_mail`
- **Math:** Boolean checks + recency. Hard-stop on any: authority revoked, insurance canceled, BOC-3 process agent missing, mail undeliverable.
- **Viz:** Status pill row on top of carrier detail — green/red pills for each gate. Red pill = `bindingUse=do_not_use_for_binding` enforced.
- **User takeaway:** "Hard gate — if any of these fail, the carrier is uninsurable / unmarketable."
- **Defense:** **This module saves underwriters from binding policies that will be canceled in 30 days.** Highest immediate ROI module in the lineup.
- **Maturity:** Preview, but the signals themselves are direct FMCSA pulls — high confidence by definition.

### Module 6 — Chameleon Detection (❌ MISSING)

- **What it would be:** Entity-linkage model identifying carriers operating under new DOT numbers to escape prior enforcement / debt / insurance / compliance issues
- **Signal:** shared address × phone × officer × equipment VIN × insurance/agent × authority timing × name similarity
- **Math:** Probabilistic match function. ≥0.92 confidence = "linked"; 0.75-0.92 = "create flag, do not auto-merge" per family `feedback_conservative_fallback_fuzzy_match_loads.md` doctrine.
- **Viz target:** Linked-DOT card on carrier detail page showing: linked DOT number + match evidence ("same address, phone, principal surname; new DOT registered 47 days after prior revocation") + confidence pill + bindingUse=`do_not_use_for_binding` on high-confidence chameleon detect
- **User takeaway:** "Hidden risk: this DOT looks like a reincarnation of [linked DOT, revoked X days ago]."
- **Defense:** **Catches what FMCSA's own vetting misses** per the 2012 GAO report. No competitor (CHIP / eCarrierCheck / DOT Analysis) has both Chameleon + Litigation — this is the moat.
- **Status:** Not built. Gap detail in card.

**Why ❌ today:**
1. Entity-resolution is architecturally hard — probabilistic matching with false-positive risk
2. Officer/principal name fields uncertain in our schema (need to verify or add MCS-150 detail ingest from FMCSA SODA `kjg3-diqy`)
3. We've prioritized other scorers first — Sprint 1 trust-layer was about getting the 6-score split shipped

**Path to ✅** (~2-3 dotintel2 sessions, Sprint B):
1. **Data audit** (~0.5 session): grep `public.carriers` for officer/principal name fields. If missing, add MCS-150 detail ingest from `kjg3-diqy` SODA endpoint.
2. **Linkage matcher** (~1 session): `match_chameleon_candidates(dot_number)` SQL function returns `[{linked_dot, confidence, signals_matched[]}]`. Probabilistic per family doctrine (over-flag, never auto-merge).
3. **`chameleon_risk` scorer** (~0.5 session): writes to `signals.signal_outputs` + new reason codes (CHAMELEON_SHARED_ADDRESS, CHAMELEON_OFFICER_REUSE, CHAMELEON_REVOCATION_TIMING_45D, CHAMELEON_NAME_PATTERN, CHAMELEON_PHONE_REUSE).
4. **UI surface** (~0.5 session): new "Hidden Risk" card on `/dashboard/carrier-intelligence/[dot]` showing linked DOT + evidence + confidence + bindingUse override.
5. **Smoke + maturity** (~0.25 session): test on 3-5 known reincarnated carriers if Master O can point at examples. Ship at Preview maturity.

### Module 7 — Litigation Exposure (❌ MISSING)

- **What it would be:** Insurance overlay layer estimating severity-claim potential (not frequency — frequency is in Safety Baseline)
- **Signal:** domicile state/county + operating radius + crash venue distribution + cargo class + fleet size + prior crash severity + insurance limits
- **Math:** Weighted composite. Example: `litigation_score = 0.4 × state_verdict_index(domicile) + 0.3 × weighted_venue_exposure + 0.2 × cargo_class_tier + 0.1 × insurance_limit_adequacy_for_exposure`
- **Viz target:** Venue heatmap (US state map with carrier's crash + operating distribution highlighted) + cargo-class severity badge + insurance-limit adequacy gauge
- **User takeaway:** "Long-haul through TX/FL/GA/CA = high nuclear verdict exposure even with moderate violations."
- **Defense:** **Two carriers with similar safety profiles can have wildly different loss-severity potential.** This is what separates "OK to write" from "OK to write at $1M limits" from "needs $5M+ umbrella."
- **Status:** Not built. Gap detail in card.

**Why ❌ today:**
1. Not FMCSA-derived — needs data outside our current ingest (state verdict ranking, operating radius, cargo→litigation mapping)
2. Two missing data dimensions: (a) operating-lane/venue exposure, (b) state-by-state nuclear-verdict risk scoring
3. Subjective scoring choices needed — Master O must pick the state-verdict ranking source

**Path to ✅** (~2-3 dotintel2 sessions, Sprint C):
1. **Data sourcing decision** (Master O ~10 min): pick state-litigation-risk ranking source. Default proposal: **ATRI Tort Cost Index** (publicly published, defensible). Alternatives: ATA litigation environment ranking, US Chamber lawsuit climate ranking, or compile from public verdict data.
2. **Reference data load** (~0.5 session): create `public.state_litigation_risk` table seeded from chosen source (50 states × 1-10 risk score × refresh date).
3. **Operating-venue signal** (~0.5 session): aggregate `csa.crashes_history.state` per DOT — % of crashes in top-10 litigation states.
4. **Cargo-class mapping** (~0.5 session): `public.cargo_class_litigation_tier` table — auto hauler / passenger / hazmat / dump / reefer / dry van → litigation-severity tier.
5. **`litigation_exposure` scorer** (~1 session): writes to `signals.signal_outputs` + reason codes (LITIGATION_HIGH_VENUE_OPERATING_FOOTPRINT, CARGO_HIGH_SEVERITY_CLASS, INSUFFICIENT_INSURANCE_LIMIT_FOR_EXPOSURE, DOMICILE_HIGH_VERDICT_VENUE).
6. **UI surface** (~0.5 session): venue heatmap + cargo-class badge + limit-adequacy gauge on carrier detail page.

### Module 8 — Underwriting Fit / Market Fit (⚠️ ARCHITECTURE LOCKED)

- **Signal:** declared appetite (carriers' published markets — hand-curated, medium confidence) + observed appetite (actual filings × cargo × PU class — higher confidence if refreshed)
- **Math:** Two-layer architecture per ChatGPT Refinement 2 (2026-05-25): hand-curated tables map carrier appetite + observed filings derive appetite from actual placements
- **Viz target:** "Market matches" list on carrier detail — ranked appetite matches with declared/observed source pills + match-confidence score
- **User takeaway:** "This carrier matches Berkley BSB + Carolina Casualty appetite — refer to NWI; not a Progressive risk."
- **Defense:** Closes the loop from risk identification to placement. **This is what producers buy.**
- **Status:** Architecture locked, scorer is `not_ready` maturity (Sprint 4 dotintel2 work). Will write to `signal_outputs` once shipped.

---

## Corpus reality — the unspoken module-zero gap

**Confirmed via SQL query 2026-05-26 in saas-agency-database S39:**

| Check | Result |
|---|---|
| `count(*)` on `public.carriers` | 50,298 |
| `max(source_last_refreshed)` | 2026-04-13 (6 weeks stale) |
| `count(*) WHERE authority_granted_date IS NOT NULL` | **0 of 50,298** |
| `count(*) WHERE mc_number IS NOT NULL` | 49,298 |

**Implication:** Every module above operates on a ~2-3% slice of the full FMCSA universe. The Territory Intelligence dashboard, Carrier Intelligence searches, and all 8 modules show signals over `50,298 carriers` when the real population is `~2,000,000+ registered entities` (FMCSA Census) or `~1.86M` (SODA `6eyk-hxee` queryable).

**Critical gap:** `authority_granted_date` is 0/50,298 — the original seed didn't include MCS-150 detail. Authority & Insurance Verification module (✅ above) is partially compromised because we can't show "30-day-old new venture authority" signals.

**This is a credibility issue, not just a coverage issue.** Producer asks "show me TX carriers with 1-3 PU" → result is ~7,800 (extrapolating from current TX 577 / total 50,298 → if scaled to full 2M = ~23k+). Underwriter asks "show me carriers with new authority granted in last 90 days" → today returns ZERO because that column is empty everywhere.

**Backfill plan: see `project_dotintel_corpus_backfill_plan.md` in family memory and `dotintel2-backlog-addendum-trust-layer-sprint-abcd.md` cross-repo prep artifact.**

---

## Sprint sequencing — the path forward

| Sprint | Sessions | What ships | Why |
|---|---|---|---|
| **Sprint 0 — Corpus Backfill** | 1-2 | Full SODA `6eyk-hxee` one-time pull + MCS-150 detail backfill (authority_granted_date + officer fields). Corpus 50k → ~1.5M (filtered to motor carrier + active authority). | **Foundational.** Every module gains an order-of-magnitude credibility boost. Authority Verification gets its missing date. Chameleon Detection becomes viable (need officer names). Territory Intelligence stops looking like a sample. |
| **Sprint A — Existing-score Calibration** | ~3 | Violation Intensity refactor (Module 3 ⚠️ → ✅) + Trend Forecast layer (Module 4 ⚠️ → ✅) | Turn the 2 partial modules into full modules with full reason-code coverage. |
| **Sprint B — Chameleon Detection** | ~2-3 | Module 6 ❌ → ✅. Net-new module + UI surface. | **Biggest competitive differentiator.** No competitor has both Chameleon + Litigation. |
| **Sprint C — Litigation Exposure** | ~2-3 | Module 7 ❌ → ✅. Gated on Master O's state-litigation-data-source decision. | **Severity wedge.** Separates "OK to write" from "OK to write at $1M / $5M / never." |
| **Sprint D — Market Fit ship** | ~1-2 | Module 8 ⚠️ → ✅. Sprint 4 work that was already on the roadmap. | Closes the loop from risk identification to placement. Producer-facing module. |

**Total to ship all 8 at ✅ Preview:** ~9-13 dotintel2 sessions. Run sequentially per Working Agreement Rule 3 (one arc per session).

---

## Master O decision points

Before Sprint 0 opens:
1. **Corpus backfill filter** — full 1.86M unfiltered (Path A from earlier discussion) OR filtered to ~250-300k motor carrier × active common authority (Path B — recommended)?
2. **MCS-150 detail SODA endpoint** — confirm `kjg3-diqy` is the right one or pick alternative

Before Sprint C opens:
3. **State litigation risk source** — ATRI Tort Cost Index (recommended) / ATA / US Chamber / public-verdict compile?

---

## Cross-refs

- Family memory: `project_dotintel_trust_layer_architecture.md` (the 6-score split this extends)
- Family memory: `project_dotintel_8_module_risk_spec.md` (NEW — the canonical 8-module spec)
- Family memory: `project_dotintel_corpus_backfill_plan.md` (NEW — Sprint 0 detail)
- Family memory: `reference_fmcsa_soda_resource_ids.md` (SODA endpoints)
- Family memory: `feedback_fmcsa_data_refresh_architecture.md` (refresh patterns)
- Family memory: `feedback_conservative_fallback_fuzzy_match_loads.md` (Chameleon matching doctrine)
- Family memory: `feedback_fmcsa_no_public_percentile.md` (Peer Rank methodology)
