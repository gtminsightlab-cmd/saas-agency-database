# Cross-repo prep artifact — dotintel2 BACKLOG addendum for the 8-module risk framework arc

**Source session:** Agency Signal S39 (saas-agency-database, 2026-05-26)
**Target file:** `dotintel2/docs/BACKLOG.md`
**Apply via:** next dotintel2 session per Working Agreement Rule 2(b) cross-repo prep artifact pattern.

---

## What to add to dotintel2/docs/BACKLOG.md

Insert as the new top item in the Queued section (above current BACKLOG #14 / family-mesh wire-site closure if still pending):

---

```
0-corpus. **[CRITICAL PRE-WORK] Sprint 0 — Carrier corpus backfill from FMCSA SODA universe.** **NEW 2026-05-26 (Master O caught the gap during AS S39).** Current `public.carriers` count = 50,298 (~2-3% of full FMCSA universe). `source_last_refreshed` = 2026-04-13 — the corpus is frozen at the initial seed. The S50 daily cron only processes deltas post-watermark; has never run a historical-universe pull. `authority_granted_date` is **0 of 50,298** populated. **Until Sprint 0 ships, every dashboard + module + score operates on a sample.** Full plan at family memory [`project_dotintel_corpus_backfill_plan.md`](C:/Users/GTMin/.claude/projects/C--Users-GTMin-Projects-saas-agency-database/memory/project_dotintel_corpus_backfill_plan.md). Two sessions:
  - **Sprint 0a** (~1 session): Path B filtered universe pull from SODA `6eyk-hxee` (filter motor-carrier + active common authority + US-based → ~250-300k rows). Unschedule daily cron during pull; re-schedule with reset watermark after.
  - **Sprint 0b** (~1 session): MCS-150 detail backfill from SODA `kjg3-diqy` — fills `authority_granted_date`, officer/principal names (unblocks Module 6 Chameleon Detection), operating radius + cargo class detail (unblocks Module 7 Litigation Exposure).

  **Master O pre-decisions:**
  - Path A unfiltered (1.86M) vs Path B filtered (250-300k motor-carrier-active). Recommended: Path B.
  - Confirm Supabase Pro disk allocation for ~250k new rows + ~1M new `carriers_history` audit rows.

  *Why this is #0:* without it, the Territory Intelligence dashboard is a sample-data demo. Pricing page (S40 default) ships on a 2% sample. Every customer demo hits credibility wall.
  *Source:* AS S39 SQL verification 2026-05-26 + family memory `project_dotintel_corpus_backfill_plan.md`.

0-modules. **[NEW ARC] 8-module risk intelligence framework — Sprint A → D.** **NEW 2026-05-26 (Master O + ChatGPT CTO review during AS S39).** Extends the locked 6-score trust-layer architecture with Chameleon Detection (Module 6) + Litigation Exposure (Module 7). The full framework + defense matrix + per-module gap detail is at family memory [`project_dotintel_8_module_risk_spec.md`](C:/Users/GTMin/.claude/projects/C--Users-GTMin-Projects-saas-agency-database/memory/project_dotintel_8_module_risk_spec.md) + cross-repo prep artifact [`saas-agency-database/docs/cross-repo/dotintel-risk-module-defense-matrix.md`] (to be moved to `dotintel2/docs/specs/dotintel-risk-module-defense-matrix.md` in the first dotintel2 session that picks up this arc). Per-module cards live at `dotintel2/docs/specs/modules/<module>-card.md` — authored in dedicated sessions, NOT in this BACKLOG entry.

  **Sprint sequence (Rule 3 — one arc per session):**
  - **Sprint A** (~3 sessions): Violation Intensity refactor (Module 3 ⚠️ → ✅) + Trend / Recovery Forecast layer (Module 4 ⚠️ → ✅). Refactor `csa_safety` scorer to emit per-severity-tier × OOS × recency × repeat-pattern signals; new `trend_forecast` scorer for 6-month projection.
  - **Sprint B** (~2-3 sessions): Chameleon Detection (Module 6 ❌ → ✅). Net-new module — entity-linkage matcher + reason codes + UI card. **Biggest competitive differentiator** (no competitor has both Chameleon + Litigation).
  - **Sprint C** (~2-3 sessions): Litigation Exposure (Module 7 ❌ → ✅). Gated on Master O state-litigation-data-source decision (recommended: ATRI Tort Cost Index). Net-new severity overlay.
  - **Sprint D** (~1-2 sessions): Market Fit Sprint 4 ship (Module 8 ⚠️ → ✅). Already on the original trust-layer roadmap; this just confirms it as part of the 8-module sequence.

  **Total:** ~9-13 dotintel2 sessions to ship all 8 at ✅ Preview maturity. Sprint 0 (corpus backfill) MUST land first so the modules have a real corpus to score against.

  **Master O pre-decisions before Sprint C opens:**
  - State litigation risk source — ATRI Tort Cost Index (recommended) / ATA / US Chamber / public-verdict compile

  *Why active:* Modules 6 + 7 are the moat. Modules 3 + 4 + 8 are calibration polish on existing architecture. Together = "Explainable, insurance-specific DOT intelligence with confidence scoring, evidence trails, market movement signals, hidden-entity detection, and litigation overlay" — beats all 4 known competitors (CHIP / eCarrierCheck / DOT Analysis / Insurance Apps).
  *Source:* Master O directive 2026-05-26 + family memory `project_dotintel_8_module_risk_spec.md`.

0-uicap. **[BUG] Territory Intelligence top-states query capped at 1,000/state.** **NEW 2026-05-26 (Master O caught during AS S39).** The "Top States by Addressable Market" table on `/dashboard/territory-intelligence` shows EXACTLY 1,000 carriers in every row (HI 1000 / AK 1000 / CO 1000 / MN 1000 / NM 1000 / GA 1000 / OK 1000 / NY 1000 / FL 1000 / KY 1000) — that's a SQL or RPC `LIMIT 1000` per state, not real data. Means the "addressable" + "penetration %" math underneath this table is wrong: a state with real 4,500 carriers and 200 insured shows "1000 carriers / 200 insured / 800 addressable / 20% penetration" instead of "4500 / 200 / 4300 / 4.4%." **Compounds with the corpus issue from 0-corpus** — even within the 50k sample, the dashboard is showing a capped slice. Fix locations to grep:
  - `app/dashboard/territory-intelligence/page.tsx` — server-side query / loader
  - Supabase RPCs that feed it — likely `get_top_carriers_by_agency_count` OR a state-aggregation RPC; grep for `LIMIT 1000` or `p_limit integer DEFAULT 1000`
  - Possibly a materialized view definition that pre-aggregates with the cap

  **Fix scope:** ~0.5 session. EITHER (a) remove the LIMIT and let the table show all carriers per state (with reasonable UI pagination), OR (b) keep a display cap but compute addressable + penetration math against the FULL count via a separate aggregation query (preserves UI snappiness while keeping math honest). Default proposal: (b) — separate aggregation function returns the totals row; UI displays top-N detail with "showing top 10 of 4,500" footer.

  **Order this within the arc:** fold into Sprint 0 alongside the corpus backfill — both are data-integrity fixes that need to land before charter outreach demos the dashboard. Master O sees real numbers per state for the first time as Sprint 0a + 0b + 0-uicap all ship together.
  *Source:* Master O screenshot during AS S39, 2026-05-26.

0-defense. **[POLISH] Risk Module Defense Matrix doc + per-module cards.** **NEW 2026-05-26 (Master O directive during AS S39).** Each of the 8 modules needs a 1-page card at `dotintel2/docs/specs/modules/<module-name>-card.md` answering: signal / math / visualization / user takeaway / defense / reason codes + bindingUse / maturity + evidence requirements. Plus the matrix index at `dotintel2/docs/specs/dotintel-risk-module-defense-matrix.md` (cross-repo prep artifact exists at `saas-agency-database/docs/cross-repo/dotintel-risk-module-defense-matrix.md` — move it in first relevant dotintel2 session).

  These artifacts are **sales-conversation defense documents** — Master O hands them to skeptical underwriters / producers / analysts to walk through "why each module matters." They also gate maturity progression — Calibrated maturity requires the card to articulate evidence requirements upfront.

  *Apply pattern:* author the 8 cards opportunistically as Sprint A-D ships each module. Module 1 + 2 + 5 cards can be written immediately (modules are live); 3 + 4 + 8 cards expand when Sprint A + D land; 6 + 7 cards expand when Sprint B + C land.
  *Source:* Master O — "I want to make sure each module applies specific value and signal and detail and insights and that we could describe it and defend why its important."
```

---

## Why this entry structure

Three Queued items separating cleanly:
- **0-corpus** — blocking pre-work. Must land first.
- **0-modules** — the main arc. 4 sub-sprints (A through D) with clear ordering.
- **0-defense** — the documentation discipline that wraps around the arc.

Master O can run Sprint 0 in 2 sessions, then start Sprint A. Cards get written alongside their corresponding sprint as the modules ship.

## How to paste-apply

1. Open `dotintel2/docs/BACKLOG.md`.
2. Locate the Queued section (currently led by BACKLOG #14 family-mesh wire-site if still in flight, or BACKLOG `0b`-equivalent for the next arc).
3. Insert the 3 entries above as the new top items, **before** the family-mesh + other lower-priority items.
4. Update the "Last reviewed" line at the top of BACKLOG.md with a note about the corpus discovery + 8-module framework.
5. Commit + push.

## Companion artifacts to move

When the first dotintel2 session picks up this arc, also move/copy:
- `saas-agency-database/docs/cross-repo/dotintel-risk-module-defense-matrix.md` → `dotintel2/docs/specs/dotintel-risk-module-defense-matrix.md`
- (this file is not moved — it lives in saas-agency-database/docs/cross-repo/ as the historical prep-artifact trail; safe to delete after BACKLOG.md is updated)

Family memory entries stay where they are (the hub is shared):
- `project_dotintel_8_module_risk_spec.md` (canonical)
- `project_dotintel_corpus_backfill_plan.md` (Sprint 0)
- `project_dotintel_trust_layer_architecture.md` (the original 6-score doctrine — kept; this extends it, doesn't supersede)

---

**Author:** Agency Signal S39, 2026-05-26
**Status:** Prep artifact awaiting next dotintel2 session to apply.
