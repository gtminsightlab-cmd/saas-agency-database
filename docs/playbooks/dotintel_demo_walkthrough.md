# DOT Intel demo walkthrough — mid-May 2026 working group

**Audience:** insurance agents and underwriters in the working group.
**Demo URL:** [www.dotintel.io](https://www.dotintel.io)
**Marketing site:** lives at `dotintel.io` root. The demo dashboard is gated at `/login` → `/dashboard`.
**Time budget:** ~15-20 minutes per persona.

---

## Pre-demo checklist

Before the audience joins:

1. Visit https://www.dotintel.io in a fresh browser tab — confirm the marketing homepage loads.
2. Visit https://www.dotintel.io/login — confirm the login form has 4 persona quick-fill buttons (Agent, Underwriter, Risk Mgr, Analyst).
3. Click **Agent** → email + password auto-fill → click **Sign In** → confirm you land on `/dashboard`.
4. Click the **Carrier Intelligence** card (top-left) → confirm Market Overview loads with KPIs (50,298 carriers / 19,767 with insurance / etc.).
5. Sign out, repeat with **Underwriter** persona.
6. Have the Carrier Intelligence URL ready: https://www.dotintel.io/dashboard/carrier-intelligence

If anything fails, ping back to the build session — there's still pre-demo polish budget.

---

## Demo flow — Agent persona

**Goal:** show how an insurance agent uses DOT Intel to find prospects and qualify carriers.

1. **Open the marketing site.** Hero: "See the market clearly. Move before your competitors do." Set the positioning.
2. **Click Login.** Click the **Agent** persona button → Sign In.
3. **Land on the dashboard.** Six modules visible. Three are live/preview, three are honestly marked Coming Soon.
4. **Click Carrier Intelligence.**
5. **Walk the Market Overview.** Talking points:
   - 50K+ carriers loaded (demo dataset, full FMCSA universe at production launch — disclaimer banner says so explicitly)
   - 39% have current insurance on file → **61% are addressable prospects** (huge agent opportunity)
   - 1,500+ are expiring within 60 days → **active prospects right now**
   - Small fleets (1-25 PU) are 95.5% of the corpus — that's the agent sweet spot
   - Top insurer parents: Progressive, Great West, OOIDA dominate. Hartford, Chubb, Liberty, Travelers are smaller.
6. **Click a top state (e.g., TX or CA).** Notice URL filter changes; Browse table now shows only that state.
7. **Add a fleet-size filter** (e.g., 4-9 PU). The browse list narrows.
8. **Add an insurance status filter — "No insurance on file"** or **"Expiring within 60 days"**. Show the prospecting use case.
9. **Click any carrier row.** Carrier Profile drills in. Walk:
   - Operations + Fleet (the basics)
   - Address & Contact (cold call data)
   - Authority & Safety (qualification)
   - Current insurance with parent/child rollup (competitive intel)
10. **Back to dashboard.** Click **Distribution Intelligence** (Preview).
11. **Walk Distribution Intelligence.** Real corpus data shown: top 10 states clickable, fleet-size mix bars. The "What's Coming" section is honest about what ships Q3 2026.

**End the agent flow with:** "If you're an agent prospecting trucking accounts, this is the daily driver. Distribution Intelligence is what plugs your territory into it."

---

## Demo flow — Underwriter persona

**Goal:** show how an underwriter uses DOT Intel to assess a submission.

1. Sign out as Agent, sign in as **Underwriter** persona.
2. **Carrier Intelligence — same Market Overview.** Different framing: "Underwriting needs depth, not breadth. Here's the depth."
3. **Use the search box.** Type a carrier legal name OR DOT number directly.
4. **Click into the carrier profile.** Walk:
   - Authority + Safety section (rating, granted date, current safety status)
   - Current insurance with **coverage limits** ($1M / $2M etc.) and **policy expiration** (the "expiring soon" badge if applicable)
   - Insurer parent/child rollup — shows you exactly which arm of which group is on the policy
5. **Demo the "Expiring soon" badge.** Filter Browse by **Expiring within 60 days** → click any row → notice the gold "Expiring soon" badge on the policy expiration field.
6. **Click Competitive Benchmarking (Preview).** Shows:
   - Top insurer #1 (Progressive)
   - Their share of the insured corpus
   - Top 10 parents with share bars
7. **What's Coming section.** Switch analysis, win/loss alerts, segment carve-outs — exactly the underwriter's questions.

**End the underwriter flow with:** "When a submission lands on your desk, you can pull the carrier profile in 5 seconds. When you want to know the whole market, that's Competitive Benchmarking."

---

## Honest things to acknowledge upfront

Don't let the audience find these — flag them yourself first. Builds credibility:

| What they might notice | What to say |
|---|---|
| Top 10 states all show ~1,000 | "Demo dataset is sampled at ~1,000 per state. Production launch loads the full FMCSA universe." |
| Some carriers show "Unmapped" insurer parent | "Real-world data: insurer name strings don't always match our parent-child rollup. Production-grade name normalization is a Phase 2 build." |
| "Authorized for hire" reads near-100% | (No longer shown in KPI strip — replaced with "Avg fleet size" and "Expiring within 60d" which are real signals.) |
| Coming Soon tiles | Three modules — Premium Estimator, Underwriter Intelligence, Appetite Monitoring — are pre-build. Honest about the roadmap. |
| Distribution Intelligence + Competitive Benchmarking are "Preview" | "These show real data on what we have today. The full filter / drill flow ships in Q3." |

---

## Known limitations (for your awareness, don't volunteer)

- **No `/contact` form yet.** "Request access" link from login goes to `/contact` but the form may not be wired. If audience asks "how do I get access?", say "Email us, sales follow-up." Don't click the contact form unless you've tested it.
- **No password reset flow.** Demo accounts are static. If a persona's password gets changed accidentally, ping the build session and we'll reset.
- **Search is title-only and DOT#-only.** No fuzzy matching for similar carrier names (Phase 2).
- **No CSV export from the Browse table.** Phase 2 build. If audience asks, "Yes, export is on the roadmap — Q3."
- **No agency-side data wired here.** This is the trucking-carrier story. For agency intelligence, that's [agencysignal.co](https://agencysignal.co), the sister product (different demo).

---

## Demo accounts

All four exist in the auth system. Quick-fill buttons on the login page handle the credentials — never paste them in chat or share visually with the audience.

| Persona | Email | Quick-fill button |
|---|---|---|
| Agent | demo-agent@dotintel.io | "Agent" |
| Underwriter | demo-uw@dotintel.io | "Underwriter" |
| Risk Manager | demo-risk@dotintel.io | "Risk Mgr" |
| Analyst | demo-analyst@dotintel.io | "Analyst" |

For mid-May, only Agent and Underwriter are in the audience. Risk Mgr and Analyst flows are not built out for this demo — don't navigate as them.

---

## Competitor reference

[DotAnalysis.com](https://DotAnalysis.com) is a known competitor in the FMCSA-data-backed insurance intelligence space. Useful frame for positioning if anyone in the audience has used it. (CTO note 2026-05-02 — referenced for awareness, not yet a feature-by-feature comparison.)

---

## After the demo — what to capture

For each persona, ask the audience:

1. **What did you click first?** — tells us what their mental model expected
2. **What was missing?** — the gap between what they assumed and what's built
3. **What did you skip?** — what's there but doesn't feel valuable to them
4. **One feature you'd add tomorrow?** — lowest-hanging fruit for next sprint

Send a short note back to the build session with the highlights. That signal directly drives D2 / D3 priorities and the broader DOT Intel rebuild scope.

---

— end DOT Intel demo walkthrough —
