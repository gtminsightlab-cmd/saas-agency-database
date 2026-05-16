# Seven16 Anti-Decay Protocol

**Locked:** 2026-05-15 (SESSION_23)
**Purpose:** Cross-product operational system to prevent project drift, context loss, and forgotten work as the Seven16 family scales beyond what any single repo's WORKING_AGREEMENT.md can protect.
**Parent rules:** Working Agreement Rule 5 (handoff + push + queue) and Rule 6 (backlog read first/written last) — necessary but not sufficient for cross-repo coordination.

> Master O direct directive 2026-05-15:
>
> *"We need to make sure we are working and progressing all projects forward so they do not get left behind, lost context and forgotten. Make sure to build a prevention plan so that does not happen."*

---

## Why this protocol exists

The Working Agreement rules work WITHIN a single repo: Rule 6 ensures BACKLOG.md is read first and written last; Rule 5 ensures handoffs are written + pushed + the next session is queued. **But they don't address cross-repo coordination.**

At the current scale, the family has:
- **4 active code repos:** `saas-agency-database` (family hub + Agency Signal), `dotintel2` (DOT Intel + DOTCarriers + DOTAgencies + Learning Center), `seven16-distribution` (Threshold IQ), `seven16-platform` (control plane, no app yet)
- **5+ parked/spinoff repos:** `dotintel-intelligence` (parked), legacy spinoffs (most retired)
- **Cross-product data flows:** Agency Signal → DOT Intel directory mirror (via Edge Function); cross-product credit wallet (D-021); Charter Member program touching all surfaces
- **5+ distinct ICPs** with different sales motions

Without explicit cross-product coordination, the predictable failure modes are:
- A repo goes 30+ days without a session → context decays → next session takes 60 min just to re-orient
- A cross-product dependency stalls because the dependent repo team forgot to surface it
- A Deferred item in one repo's BACKLOG triggers an event but nobody notices
- Master O loses track of "what's where" across the family
- Important strategic items get lost in tactical backlog noise

**The Anti-Decay Protocol's 6 mechanisms are designed to defeat each of these failure modes specifically.**

---

## Mechanism 1 — Family Health Snapshot

**A single doc that shows all repos' states at a glance.** Auto-maintained at `saas-agency-database/docs/context/FAMILY_HEALTH.md`.

**What it shows (per repo):**
- Last commit date
- Days since last session
- Active arc + days in-flight
- Queued-item count + aging buckets (0–7d, 8–30d, 31–60d, 61–90d, >90d)
- Deferred-item count + triggered/untriggered counts
- Stale-marker count (items >30d in Queued without progress)
- Health status: 🟢 Active (touched within 7d), 🟡 Slow (8–30d), 🟠 Stale (31–60d), 🔴 At-Risk (>60d)

**What it shows (cross-product):**
- Cross-product dependency map (e.g., "TIQ /pricing page depends on family PRICING_*.md specs — status: ✅ locked")
- Charter Member program status (cap progress, enrollment window remaining)
- Pricing architecture lock status per D-021 surface
- External dependencies (third-party API stability, vendor relationship status)

**Maintenance:** updated at the close of any family-touching session per Working Agreement Rule 5 addendum. A single Bash script can generate the per-repo metrics (`git log -1 --format=%cs` for last commit date, etc.) — to be built as part of mechanism #1 implementation.

**First snapshot:** implementation of this doc is the recommended FIRST move of SESSION_24.

---

## Mechanism 2 — Stale Detection Convention

**Every Queued item in any BACKLOG.md gets a `[YYYY-MM-DD]` added-on timestamp.**

Convention:
```
## Queued (priority order)

1. [2026-05-15] Charter Member outreach via Gamma deck rendering
2. [2026-05-10] Stripe catalog migration
3. [2026-04-22] Hygiene Credit billing wiring
```

Sessions opening with Rule 6 (read BACKLOG first) scan the dates:
- **0–30 days old:** normal, no action
- **31–60 days old:** session-open prompt asks "Still on the table? Promote / Defer / Kill?"
- **61–90 days old:** automatically appended with `[STALE?]` marker; surfaces at next session open
- **>90 days old:** auto-moved to a `## At-Risk` section (between Queued and Deferred); requires explicit Master O decision to keep, deprecate, or move to Deferred with a triggered-by clause

**Items in the `## Killed` section also get a `[YYYY-MM-DD killed]` date** — already convention but emphasized here.

**Items in `## Deferred` get an explicit `trigger: <X>` clause** — already convention, but the protocol formalizes: any Deferred item without a trigger gets a `[NEEDS TRIGGER]` marker.

---

## Mechanism 3 — Weekly Cross-Product Review (15 min, Master O ritual)

Master O's recurring sweep, once per week (recommended Monday morning):

**Step 1: Open FAMILY_HEALTH.md.** Scan health-status colors:
- Any 🔴 At-Risk repo → drives this week's priority focus
- Any 🟠 Stale repo → schedule a rebaseline session within 7 days

**Step 2: Skim each repo's BACKLOG.md Active arc.** Is each repo's active arc actually being advanced? Any active arc unchanged for >7 days = forgotten or blocked.

**Step 3: Skim each repo's stale-detection markers.** Any `[STALE?]` items need a decision.

**Step 4: Check cross-product dependency map in FAMILY_HEALTH.md.** Any dependencies firing or about to fire? Any blocked downstream items?

**Output:** Master O updates each repo's BACKLOG Active arc OR queues a session for whichever repo most needs attention. ~15 min total once the muscle memory is built.

**Suggested calendar setup:** recurring Monday 8:00 AM AI-prompted check-in. Could be a scheduled remote agent (per the `schedule` skill in `~/.claude/`).

---

## Mechanism 4 — Monthly Anti-Decay Sweep (45 min, first session of each month)

Once per month, the first family-hub session of the month does a sweep:

1. **Family Health Snapshot refresh** — full regenerate of FAMILY_HEALTH.md
2. **Stale-item triage** — go through every `[STALE?]` and `## At-Risk` item across all 3 BACKLOGs. Decide: promote, defer with trigger, or kill.
3. **Memory file audit** — read each `project_*.md` and `reference_*.md` family memory file; flag anything outdated against current state.
4. **Deferred-item trigger check** — go through each repo's `## Deferred` section. Has any trigger event happened? If yes, promote to Queued.
5. **Cross-product dependency reconciliation** — verify every dependency in the map is still accurate.
6. **Killed-item audit** — anything killed in the past 90 days that should be revisited? (Master O's lesson learned reflection.)

**Output:** every BACKLOG and every memory file is current. Health snapshot is fresh. Any blocking dependencies are surfaced.

---

## Mechanism 5 — Protected-Priority Flag

Some items must NEVER be lost to decay. Master O explicitly flags them.

**Convention:** Queued items prefix with `[PROTECTED]`:

```
## Queued (priority order)

1. [PROTECTED] [2026-05-15] Charter Member outreach via Gamma deck rendering — network commitment dependent
2. [2026-05-12] Stripe catalog migration
3. [PROTECTED] [2026-04-22] Hygiene Credit billing wiring — trust copy locked since April; ship before live cutover
```

**Protected items:**
- Never auto-decay regardless of age (no `[STALE?]` marker, no auto-move to At-Risk)
- Surface in EVERY session-open BACKLOG scan, not just at staleness thresholds
- Appear at the top of the FAMILY_HEALTH.md "items requiring attention" section
- Require explicit Master O confirmation to remove the `[PROTECTED]` flag

**Use sparingly** — if everything is protected, nothing is. Reserve for items that would cause genuine harm if forgotten (network commitments, customer promises, regulatory deadlines, capital commitments).

---

## Mechanism 6 — Cross-Product Dependency Tracking

A dedicated section in FAMILY_HEALTH.md showing explicit dependencies between repos:

**Format:**
```
## Cross-product dependencies

- [BLOCKED] dotintel2 Sub-arc 3A → FMCSA SODA API stability (3rd party; status: stable as of 2026-05-15)
- [LIVE] Agency Signal → DOT Intel directory mirror (via mirror-agency-signal Edge Function; nightly cron; last run: 2026-05-15 04:00 UTC, healthy)
- [PENDING] TIQ /pricing page (SESSION_3) → all PRICING_*.md specs (status: ✅ locked as of 2026-05-15; build session unblocked)
- [PENDING] Charter Member checkout → Stripe catalog migration (SESSION_24 Path A; not yet built; blocks Charter Member outreach revenue capture)
- [PENDING] Learning Center agency dashboard (BUILD TODO) → schema additions for per-producer-per-module progress tracking (deferred until team packs ship)
```

**Status labels:**
- `[LIVE]` — dependency is satisfied and running healthily
- `[PENDING]` — dependency exists, awaiting implementation
- `[BLOCKED]` — dependency is blocked by external factor (3rd party API, vendor relationship, etc.)
- `[STALE]` — dependency was satisfied but has degraded (e.g., Edge Function failing, vendor relationship changed)

**Maintenance:** updated whenever a session ships work that creates, satisfies, or affects a cross-product dependency.

---

## Implementation sequence

The protocol's mechanisms have an implementation order:

| Mechanism | Implementation effort | Dependency |
|---|---|---|
| **#1 Family Health Snapshot** | ~30 min create + Bash script for auto-generation | None — foundational |
| **#2 Stale Detection Convention** | ~10 min amend WORKING_AGREEMENT.md in each repo + add timestamps to existing BACKLOG items | Build into Rule 6 amendment |
| **#3 Weekly Review** | Master O calendar habit; no code needed | Mechanism #1 must exist |
| **#4 Monthly Sweep** | ~45 min recurring session slot; no code needed | Mechanisms #1 + #2 |
| **#5 Protected-Priority Flag** | ~5 min convention + amend each BACKLOG with PROTECTED items | None |
| **#6 Cross-Product Dependency Tracking** | ~15 min draft initial map + ongoing maintenance | Mechanism #1 |

**Recommended sequence:**
1. **NOW (SESSION_24):** Implement mechanism #1 (Family Health Snapshot doc + initial snapshot). Foundational. ~30 min.
2. **NEXT session in each repo:** Add timestamps to BACKLOG items per mechanism #2. ~10 min per repo.
3. **NEXT family-hub session after that:** Amend each repo's WORKING_AGREEMENT.md to reference the protocol + add Rule 5 addendum about updating FAMILY_HEALTH.md.
4. **Master O calendar:** schedule weekly review (Monday 8 AM) and monthly sweep (first Monday of each month).
5. **Within 30 days:** mechanism #6 (Cross-Product Dependency Tracking) populated with initial map.
6. **Ongoing:** mechanisms #5 (PROTECTED flag) used as needed.

---

## Why this works (vs. other approaches)

**Why not just "be more disciplined"?** — Discipline is not a system. Discipline degrades when context is heavy (and family-of-products context IS heavy). The protocol replaces willpower with a process that catches drift automatically.

**Why not a project management tool (Linear, Asana, etc.)?** — Those tools own the BACKLOG; this protocol assumes BACKLOG.md in each repo remains the source of truth. Project management tools become single-points-of-failure if abandoned; markdown files in git survive indefinitely. The protocol is intentionally low-tech.

**Why not just more frequent sessions?** — Frequency without process creates session churn (each session re-deriving state). The protocol REDUCES the cost of sessions by ensuring state is always current.

**Why include cross-product dependencies?** — Single-repo BACKLOGs miss the case where Repo A's queued item depends on Repo B's deferred item — neither repo sees the connection. The dependency map makes these explicit.

---

## When this protocol gets out of date

Update when: (a) a new active code repo is added to the family (e.g., seven16-platform spins up an app), (b) any mechanism is found to be ineffective and revised, (c) the family scales past a threshold that requires new mechanisms (e.g., 10+ repos, 100+ paying customers, dedicated CSM hired), (d) external tooling is brought in to automate any mechanism.

---

*End ANTI_DECAY_PROTOCOL — Locked 2026-05-15. Implementation begins SESSION_24 with mechanism #1.*
