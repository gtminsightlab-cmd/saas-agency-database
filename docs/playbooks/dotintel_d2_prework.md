# DOT Intel — D2 prework planning doc

**Status:** prework only. NO code. Built to be revised after the mid-May working group demo gives us real signal.
**Author:** CTO build session 2026-05-02
**Companion to:** [dotintel_demo_walkthrough.md](dotintel_demo_walkthrough.md)

---

## What D2 means

**D2 = converting Distribution Intelligence + Competitive Benchmarking from preview pages into fully interactive modules**, matching the depth of Carrier Intelligence (D1).

Today's state (post-Sprint A polish):
- Both modules exist as preview pages with real corpus data displayed
- Neither has filters, drill-in detail, or persistent saved state
- Working group can see WHAT they'll be, not USE them

D2 fills that gap — but only after we know what the working group actually wants.

---

## Why prework, not work

The two preview pages cost ~25 minutes to build. Full D2 costs ~6-8 hours. The cost ratio is 14-20×.

If the working group says:
- "Distribution Intelligence is great, but we never need the territory builder — we need agency-carrier crosswalk" → 60% of planned D2 work was wasted
- "Competitive Benchmarking should compare two specific carriers, not show market share" → 80% of planned D2 work was wasted
- "We don't care about either of these — we just want more depth in Carrier Intelligence" → 100% of D2 was the wrong investment

So the smart sequence is:
1. **Demo runs with previews** (mid-May)
2. **Capture signal** (per `dotintel_demo_walkthrough.md` § "After the demo")
3. **Build D2 informed by that signal** — keeps + cuts + reshapes the scope below

This doc captures what we'd build absent feedback. Treat it as a **starting hypothesis**, not a spec.

---

## Open questions to answer at / after the demo

These are the questions whose answers most reshape D2. Slot them into the "ask the audience" portion of the demo or post-demo follow-up.

### For Distribution Intelligence

1. **What's the unit of "territory"?** State, county, ZIP, radius around home office, named market (e.g., "Pacific Northwest"), or something else? *Determines the territory builder UX entirely.*
2. **Is "agency-carrier crosswalk" — i.e., showing which agencies write which carriers — more valuable than territory analysis?** *We don't have agency data wired into vbhlacdrcqdqnvftqtin yet. If this is the killer feature, we need a separate ingestion sprint before D2.*
3. **Saved prospect lists vs. ad-hoc filtering — which matters more?** *Saved lists requires a `saved_lists` schema (one exists in the DB but is empty). Ad-hoc filtering is what Carrier Intelligence already does.*
4. **Should "market opportunity score" be a thing?** *Composite signal (PU growth + insurance penetration + competitor weakness) per region. High effort to build right; might be vapor.*

### For Competitive Benchmarking

1. **Time-series share trends — how granular?** Quarter-over-quarter for top 10 parents? Daily for one carrier's insurer history? *Different schema implications. The 7.4M-row inshist_raw can support either, but indexes/MVs differ.*
2. **Switch analysis — what's the use case?** "Which carriers switched FROM Progressive TO Liberty last quarter" (competitive intel) vs. "Why did Carrier X switch?" (single-account intel). *Different UX.*
3. **Win/loss alerts — is this a notification feature or a dashboard view?** *Notifications need a delivery channel (email? in-app? Slack integration?). Dashboard view is simpler.*
4. **Segment carve-outs — which segments?** Fleet size, state, cargo, authority age, hazmat, refrigerated, owner-op vs. corporate? *Each one is a filter UI element.*

### Cross-cutting

1. **CSV/PDF export** — agents and underwriters mentioned this informally. Where do they need it most? *Likely the carrier browse list, but worth confirming.*
2. **Saving and sharing views** — "I want to send this filtered list to my BDM" workflow. *Implies sharable URLs and/or email integration.*
3. **Mobile usability** — are demo audience members ever on tablets/phones? *Today's build is desktop-first.*

---

## Hypothesis: scope of full D2 (revise after feedback)

**If feedback is "more or less what's there, just more interactive":**

### Distribution Intelligence — full module
- Same Market Overview but with click-into-filter
- New `/dashboard/distribution-intelligence/territory` builder
  - Multi-select states + county or radius
  - Save as named territory (DB: new `territories` table)
- New `/dashboard/distribution-intelligence/state/[state]` deep-dive
  - All carriers in state
  - Insurance penetration by PU band
  - Top insurers in the state
  - Underserved opportunities highlight
- Reuses Carrier Intelligence's `search_carriers` RPC under the hood

**Estimated:** 4-6 hours

### Competitive Benchmarking — full module
- Top insurer parents stays as the landing snapshot
- New `/dashboard/competitive-benchmarking/insurer/[id]` deep-dive
  - All carriers covered by this parent
  - Share by PU band
  - Share by state
  - Avg coverage limits
  - Recent switches (requires inshist_raw query)
- New `/dashboard/competitive-benchmarking/compare?ids=...` carrier-vs-carrier compare
  - Useful for underwriters
- New RPCs needed:
  - `get_insurer_parent_detail(p_id)` — slice carriers by parent with all the cuts
  - `compare_carriers(p_dots[])` — side-by-side carrier compare

**Estimated:** 4-6 hours

**Total full D2:** 8-12 hours, two work sessions.

**If feedback strongly favors agency-carrier crosswalk:**
- Add a one-time data ingest sprint (2-3 hours) to load Agency Signal carrier-mapping data into vbhlacdrcqdqnvftqtin OR create a federated query layer
- Distribution Intelligence becomes "find which agencies write which carriers in your territory" — different UX, different schema reads
- Total 12-18 hours including the ingest

---

## Schema additions D2 will likely need

These are read-side additions only — no destructive changes. Ready to ship as a single migration when D2 starts.

### Probable new RPCs
- `get_state_market_metrics(p_state text)` — returns one state's full breakdown (carriers, PU bands, insurer share, expiring soon, etc.)
- `get_insurer_parent_detail(p_id uuid)` — returns one insurer parent's carrier mix
- `compare_carriers(p_dots bigint[])` — returns side-by-side rows for 2-5 carriers
- `search_carriers_by_insurer_parent(p_parent_id uuid, ...)` — variant of search_carriers scoped to one insurer

### Probable new tables (only if "save and share" is a yes)
- `saved_views` — user-saved filter combinations with optional sharing token
- `territories` — named, multi-state/multi-region selections with metadata

### Probable performance work
- Materialized view `mv_state_market_summary` — refreshed nightly, powers the state grid + state deep-dive without scanning carriers each time
- Materialized view `mv_insurer_parent_summary` — same idea for the competitive view

---

## Light Mode → D2 rendering implications

Sprint built today: light mode toggle. Anything D2 builds needs to render correctly in both modes.

Things to remember:
- Use semantic tokens (`bg-charcoal`, `text-text-primary`) — they auto-flip
- Avoid hardcoded hex values
- Brand colors (`teal`, `gold`, scaled palettes) stay fixed in both modes — this is intentional
- Avoid `bg-charcoal/90` style alpha on full-bleed sections in light mode — alpha-over-white can look washed out. Test before shipping.

---

## What to bring back from the demo

Send the build session a short note (5-10 bullets is plenty):

1. Did Agent persona find what they expected in Carrier Intelligence?
2. Did Underwriter persona drill into a carrier and use the profile usefully?
3. What did they click in Distribution Intelligence preview? (clicks tell us interest)
4. Same question for Competitive Benchmarking preview.
5. Top 1-2 features they asked about that aren't built.
6. Any data points they pushed back on as wrong/odd.
7. Did anyone ask about export, save, share?
8. Any visual / UX irritants worth fixing first?
9. Any pricing or "how do I buy" questions? (signals readiness)
10. One sentence: what would you tell your boss DOT Intel does, after the demo?

That's the input for the real D2 spec. We rewrite this doc with the actual scope, then build.

---

— end DOT Intel D2 prework —
