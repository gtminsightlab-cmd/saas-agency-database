# Seven16 Product → Repo → Project Index

**Last updated:** 2026-05-15 (created SESSION_24)
**Purpose:** Canonical lookup for "which repo, Vercel project, Supabase satellite, and live URL does each Seven16 product live at?" Read this on session open if you're unsure which product you're working on, or paste the per-product session-opener snippets into a new Claude session to orient it instantly.

> **Why this exists:** with 4 active code repos (3 product + 1 control plane) plus multiple brand domains routed through host-header middleware, "which path do I open?" is a frequent friction point. This index resolves it in one screen.

---

## Main lookup

| Product (market name) | Local repo path | GitHub | Vercel project | Supabase project | Live URL(s) |
|---|---|---|---|---|---|
| **Agency Signal** + family hub | `C:\Users\GTMin\Projects\saas-agency-database\` | [`gtminsightlab-cmd/saas-agency-database`](https://github.com/gtminsightlab-cmd/saas-agency-database) | `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV` | `sdlsdovuljuymgymarou` (project name `seven16group`, us-east-1, Pro plan) | [directory.seven16group.com](https://directory.seven16group.com) · [/charter](https://directory.seven16group.com/charter) · [/enterprise](https://directory.seven16group.com/enterprise) |
| **DOT Intel + DOTCarriers + DOTAgencies + Learning Center** (one codebase, 3 brand domains routed via host-header middleware per D-016) | `C:\Users\GTMin\Projects\dotintel2\` | [`gtminsightlab-cmd/dotintel2`](https://github.com/gtminsightlab-cmd/dotintel2) | `prj_4tnPATJjP4Bahg2RFw4DwlTuNa8S` | `vbhlacdrcqdqnvftqtin` (DOT Intel satellite, Pro plan, same org) | [dotcarriers.io](https://dotcarriers.io) (operator directory) · [dotagencies.io](https://dotagencies.io) (agent + wholesaler directory + cert) · [www.dotintel.io](https://www.dotintel.io) (intelligence dashboard + bundle hub) |
| **Threshold IQ** (MGU operating CRM) | `C:\Users\GTMin\Projects\seven16-distribution\` | [`gtminsightlab-cmd/seven16-distribution`](https://github.com/gtminsightlab-cmd/seven16-distribution) | `prj_c6kzFEhpw6Uwb12TECUidKlBxOwr` | `yyuchyzmzzwbfoovsskz` | [staging.thresholdiq.io](https://staging.thresholdiq.io) (production cutover deferred) |
| **seven16-platform** (shared control plane — auth + tenants + entitlements + master control center, per D-008) | _no code repo yet_ | _no GitHub repo yet_ | _no Vercel project yet_ | `soqqmkfasufusoxxoqzx` (Supabase only) | n/a |

**Org-level note:** all 4 Supabase satellites live in the `dotintel` Supabase org. Pro plan ($25/mo) covers them all + daily backups. PITR ($100/mo per project) is the only per-project paid add-on and is not yet enabled — flagged as a pre-launch security gate per `project_pre_launch_security_gates.md`.

---

## Desktop launchers — recommended pattern

Three pre-configured `.bat` shortcuts on the Desktop. Double-click each → `cd` into the canonical native-git path + run Claude. Avoids the OneDrive `.git`-is-broken trap.

| File | Lands you in |
|---|---|
| `Open Claude — Agency Signal.bat` | `C:\Users\GTMin\Projects\saas-agency-database\` |
| `Open Claude — DOT Intel.bat` | `C:\Users\GTMin\Projects\dotintel2\` |
| `Open Claude — Threshold IQ.bat` | `C:\Users\GTMin\Projects\seven16-distribution\` |

---

## Wrong-directory check (paste into any new session)

Always make the first message to a new Claude session start with this, regardless of product:

```
Run pwd. Confirm output is one of these canonical paths:
  - C:\Users\GTMin\Projects\saas-agency-database    (Agency Signal + family hub)
  - C:\Users\GTMin\Projects\dotintel2                (DOT Intel cluster: dotintel.io + dotcarriers.io + dotagencies.io + Learning Center)
  - C:\Users\GTMin\Projects\seven16-distribution     (Threshold IQ)

If pwd shows ANY path under \OneDrive\, STOP. The OneDrive .git is
permanently broken (OneDrive sync corrupts git internals). Tell me to
close + relaunch from the Desktop .bat shortcut for the correct product.
Do not proceed past this check if wrong directory.
```

---

## Per-product session-opener snippets

### Agency Signal / family-hub work
*(pricing decisions, FAMILY_HEALTH refresh, cross-product cascade coordination, Agency Signal product work)*

```
You are continuing the Seven16 family-hub track at saas-agency-database.

Read in order (per Working Agreement Rule 6):
  1. docs/BACKLOG.md
  2. docs/context/FAMILY_HEALTH.md (cross-product snapshot)
  3. docs/handoffs/SESSION_<latest>_HANDOFF.md
  4. docs/context/DECISION_LOG.md (D-001 through D-021 + §6 standing rules)
  5. docs/context/ANTI_DECAY_PROTOCOL.md

For Agency Signal product work specifically, also read:
  6. docs/STATE.md (Agency Signal inside view)
  7. docs/handoffs/AGENCY_SIGNAL_SESSION_<latest>_HANDOFF.md

Then propose plan (5–10 bullets), await thumbs-up.
```

### DOT Intel / DOTCarriers / DOTAgencies / Learning Center work
*(CSA ingest, intelligence dashboard, carrier/agent directories, training certifications)*

```
You are continuing the dotintel2 product track.

Read in order (per Working Agreement Rule 6):
  1. docs/BACKLOG.md
  2. docs/SESSION_<latest>_HANDOFF.md (current latest = SESSION_29)
  3. C:\Users\GTMin\Projects\saas-agency-database\docs\context\FAMILY_HEALTH.md
     (cross-product snapshot — read for cross-product context)
  4. C:\Users\GTMin\Projects\saas-agency-database\docs\context\DECISION_LOG.md
     (family decisions, esp. D-012/D-013/D-016/D-017 directory build,
     D-018/D-021 pricing affecting DOT-side surfaces)
  5. docs/STATE.md

For SODA / CSA ingest work specifically, also read:
  6. C:\Users\GTMin\Projects\saas-agency-database\docs\cross-repo\dotintel2_SESSION_30_ARTIFACT.md
     (prep artifact under Rule 2(b) — paste-ready SESSION_30 prompt +
     SODA ingest script draft + 2 migration drafts + testing protocol)

Then propose plan, await thumbs-up.
```

### Threshold IQ work
*(MGU CRM, marketing v2, /pricing page build, Charter integration mechanics)*

```
You are continuing the seven16-distribution / Threshold IQ track.

Read in order (per Working Agreement Rule 6):
  1. docs/BACKLOG.md
  2. docs/handoffs/SESSION_<latest>_HANDOFF.md
     (current latest = SESSION_1 rebaseline, 2026-05-15)
  3. C:\Users\GTMin\Projects\saas-agency-database\docs\context\FAMILY_HEALTH.md
     (cross-product snapshot)
  4. C:\Users\GTMin\Projects\saas-agency-database\docs\context\DECISION_LOG.md
     (family decisions, esp. D-019 superseded → D-020 positioning lock →
     D-021 pricing architecture)
  5. C:\Users\GTMin\Projects\saas-agency-database\docs\context\PRICING_THRESHOLD_IQ.md
     (TIQ operational pricing spec — Launch $500 / Growth $1,500 / Scale $4,000)
  6. docs/STATE.md

Then propose plan, await thumbs-up.
```

---

## Paths that LOOK like products but aren't

| Name | Status | What it is |
|---|---|---|
| `dotintel-intelligence` | Parked | Legacy "Agency Intelligence" Next 14 build. Subdomain `intelligence.dotintel.io` resolves to a dead build. Decommission queued in dotintel2 BACKLOG #8 (redirect to `directory.seven16group.com/verticals`). Own-session work in the parked repo when picked up. |
| `Killing Commercial` | Separate project, not a Seven16 product | At `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Killing Commercial\`. Scraping + synthesis project. Dropped planning docs into dotintel2 on 2026-05-13 (`docs/KILLING_COMMERCIAL_TRAINING_HUB.md`, `docs/TRAINING_HUB_SESSION_HANDOFF.md`). Separate Claude track. |
| **`seven16group.com` apex** | Planned, not built | Holding-company + marketing-agency front door. Separate future repo. Brand-systems designer engagement is the trigger. See family memory `reference_seven16group_apex_plan.md`. |
| **`agencysignal.co`** | Domain reserved, not wired | Future Agency Signal home when cutover from `directory.seven16group.com` happens. Trigger: comfort with DNS choreography + a quiet week. |
| **BindLab** | Retired | Per DECISION_LOG §4. Will reprise later as sales-dev + coaching brand. No active repo. |
| **Agency Vantage** | Retired | Per DECISION_LOG §4. Will reprise later. No active repo. |
| **Seven16Recruit** | Stealth, attorney-gated | Per DECISION_LOG D-010. Own Supabase satellite planned per D-008, no code work yet. Any public-facing Recruit work requires checking on attorney engagement status (DECISION_LOG §9 open question #3). |

---

## Stripe accounts

- **DOT Intel + family Stripe sandbox:** `acct_1TLUF6HmqSDkUoqw` ("Seven16 / DOT Intel" in workspace switcher). Currently used by both DOT Intel and Agency Signal sandbox surfaces.
- **NOT FMCSADOT** (`acct_1TQDsRLtKFcJVUP2`) — different unrelated account; ignore unless explicitly told it's needed.
- Live cutover trigger: first paying customer ready to convert (per Agency Signal STATE.md §5).
- Stripe catalog migration around D-021 architecture is queued for next family-hub session (SESSION_25 Path A) — builds the actual Stripe products + prices + entitlements for all 7 D-021 pricing surfaces.

---

## When a session is confused about "which product is this"

If `pwd` is ambiguous or you're not sure which product you're in, run:

```
git config --get remote.origin.url
```

Returns one of:

| URL | Product |
|---|---|
| `https://github.com/gtminsightlab-cmd/saas-agency-database.git` | Agency Signal / family hub |
| `https://github.com/gtminsightlab-cmd/dotintel2.git` | DOT Intel cluster (3 brand domains, one codebase) |
| `https://github.com/gtminsightlab-cmd/seven16-distribution.git` | Threshold IQ |

Unambiguous. Works even if `pwd` somehow gives a confusing path.

---

## Cross-repo work pattern (per Working Agreement Rule 2 + 2(b))

You CAN work across products in a normal day — just sequentially, not in parallel.

**Pattern for cross-cutting decisions** (e.g., pricing locks, family-wide doctrine changes):

1. Open the **family hub** (`Open Claude — Agency Signal.bat`).
2. Make the decision in `docs/context/DECISION_LOG.md` + relevant `PRICING_*.md` spec.
3. Under Rule 2(b), draft paste-ready cascade artifacts for the affected spoke repos. Store them in `docs/cross-repo/<target-repo>_<purpose>.md`.
4. Close the family-hub session.
5. Open each affected spoke (`Open Claude — DOT Intel.bat` or `Open Claude — Threshold IQ.bat`), paste the cascade artifact, execute, commit, close.
6. Reopen family hub if you need to refresh `FAMILY_HEALTH.md` to reflect the cascade.

**Pattern for product-only work** (e.g., new feature on a single product):

1. Open just that product's launcher.
2. Work end-to-end in that one repo.
3. Close.

Rule 2 (one Claude session per repo at a time) is a technical constraint, not a strategic preference — two Claude processes in the same `.git` tree corrupt each other. Rule 2(b) (cross-repo prep artifact pattern) is the safe carve-out for cross-cutting work.

---

## When this index goes stale

Update when:
- A new active code repo is added to the family (e.g., seven16-platform spins up an app, seven16group.com apex repo is created, Seven16Recruit goes public)
- A repo is retired or merged
- A Supabase satellite or Vercel project ID changes (rare — usually means a manual migration)
- A brand domain is added or retired
- A live URL changes (e.g., agencysignal.co cutover from directory.seven16group.com)

The launcher `.bat` files at `C:\Users\GTMin\OneDrive\Desktop\` should also be updated when canonical paths change.

---

*Authoritative reference. Family memory `MEMORY.md` index points here for path/project lookups going forward.*
