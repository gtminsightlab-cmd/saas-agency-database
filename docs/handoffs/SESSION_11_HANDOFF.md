# Session 11 Handoff — Trucking deep-load + Berkley operating-units mapping

**Date:** 2026-04-27
**Project:** Seven16 Agency Directory (Supabase `sdlsdovuljuymgymarou` + Next.js/Vercel + Cloudflare)
**Repo:** github.com/<MasterO>/saas-agency-database  (last verified main HEAD = `0484afd` at start of session 10; session 11 made Supabase-only changes — no app code commits)
**Dev URL:** https://saas-agency-database.vercel.app
**Predecessor:** `docs/handoffs/SESSION_10_HANDOFF.md`

---

## 1. The asks Master O handed me at the start of session 11

These are the requests as they came in, in order, so the next session does not have to spend 15 minutes reverse-engineering them from chat:

1. **Continue from session 10.** Pick up where session 10's compaction left off — analytics page shipped, MiEdge fuzzy matcher deferred, /verticals/[slug] detail pages built, Berkley operating-units mapping in flight.
2. **Berkley distribution mapping.** "Berkley National Insurance Company is the insurance company WR Berkley parent company uses to write non-fleet and fleet accounts from 1-100+. Berkley Small Business writes 1-14 power units, Berkley Prime writes 15-75, Carolina Casualty writes 75+. For 1-75 power units it's distributed by strategic wholesalers such as CRC, RPS, Burns and Wilcox, ISC MGA, Amwins, First Light, Great Lakes, Maximum, Truckers Insurance, RT Specialty, XPT, Blueridge, Arlington Roe, JM Wilson." — verbatim Master O 2026-04-27.
3. **Add Integrated Specialty Coverages (ISC) to agencies.** No need to wire it to Berkley carriers (skip that step).
4. **Drop the Berkley-Prime extension and Carolina-Casualty distribution-channel tasks from the to-do list.** Master O explicitly cancelled them.
5. **Process the new data files in `/data/`.** Filter out duplicates. Remove canaries (vendor-planted decoys).
6. **Wrap up the session with a deep handoff brief.** Commit vitals to memory so the next session does not need 15 minutes of retraining.

---

## 2. What got done in session 11 (chronological)

### 2.1 Berkley operating-units carriers + Transportation vertical mapping
**Migrations applied:** 0080, 0081

Inserted two new Berkley distribution carriers under W.R. Berkley Insurance Group parent:
- **Berkley Small Business** (`f52ffb2a-867a-4313-8bd6-1c2159a5f35f`) — 1-14 PU non-fleet
- **Berkley Prime Transportation** (`dee3db30-cee4-4f61-aed6-47a636384fb8`) — 15-75 PU mid-fleet

Wired 4 Berkley/Carolina entries into the **Transportation vertical** via `carrier_verticals ON CONFLICT DO NOTHING`:
- Berkley Small Business → `non_fleet_specialist`
- Berkley Prime Transportation → `mid_fleet_specialist`
- Berkley National Insurance Company (`8447be61-6b74-4542-9f6c-6445e93a72ed`) → `mid_market_mixed`
- Carolina Casualty Insurance Company (`d0aa27c1-d355-46dd-a48c-5ea8405b6b91`) → `large_fleet_specialist`

`mv_vertical_summary` refreshed concurrently after.

### 2.2 13 strategic wholesalers wired to 3 Berkley carriers
**Migration applied:** 0082_berkley_wholesaler_appointments

39 `agency_carriers` rows inserted (13 wholesalers × 3 carriers). Each row has notes
`distributes [carrier name] (per Master O 2026-04-27, strategic wholesaler channel)`.

The 13 wholesalers + their agency_ids:

| # | Wholesaler | agency_id | account_type |
|---|---|---|---|
| 1 | CRC Group (CRC Insurance Services) | `08a20a8d-8deb-495c-9504-67df23a1ad75` | agency_wholesaler |
| 2 | Risk Placement Services (RPS) | `aa7400d1-c16d-4485-aee7-ca52b5c15266` | agency_wholesaler |
| 3 | Burns & Wilcox LTD | `9f26aa0d-8994-4085-b622-7b5e1f3149ae` | agency_wholesaler |
| 4 | Amwins (Amwins Group, Inc.) | `347e4165-6b06-4819-8172-892acf3a69df` | agency_wholesaler |
| 5 | Specialty Insurance Managers (First Light Programs) | `1af39e21-53d9-4ee1-9a21-7ebbe87b2f4a` | agency |
| 6 | Great Lakes General Agency | `a8f7f03c-5956-4ac2-8378-306540cea6a7` | agency_wholesaler |
| 7 | Maximum Independent Brokerage | `6d2a3a95-d3de-4a9c-9053-9c79ffeec3bd` | agency |
| 8 | Truckers Insurance Associates | `af90549a-a98e-4aeb-b348-037af7d751da` | agency_wholesaler |
| 9 | RT Specialty (Ryan Specialty) | `77ef0f2a-c601-4613-a9c7-8a758cde0c43` | agency_wholesaler |
| 10 | XPT Specialty (XPT Group) | `73ae01c9-93ff-4306-9e93-d14890573823` | agency_wholesaler |
| 11 | Blue Ridge Specialty, LLC | `1a4f634d-6a05-4216-99d5-9f6624f9c531` | agency_wholesaler |
| 12 | Arlington/Roe & Co | `a724e136-e69e-4515-add4-4ffa3b5383ca` | agency_wholesaler |
| 13 | J.M. Wilson Corporation (now Ryan Specialty) | `2f28af3c-b710-46fd-be75-eb06c9efd810` | agency_wholesaler |

Note: First Light Programs and Maximum are still tagged `account_type=agency` rather than `agency_wholesaler`. Cosmetic — agency_carriers rows wired regardless. Reclassify in next data-cleanup pass if Master O wants.

### 2.3 ISC (Integrated Specialty Coverages) — found + reclassified
**Migration applied:** 0083_isc_correct_account_type

ISC was already in agencies as id `55f1a303-53fd-4dbe-960b-8a10b84eed9f` (email `craig.moss@iscmga.com`, web `https://www.iscmga.com/`) but mis-tagged as `account_type=agency`. Reclassified to `agency_wholesaler`. Per Master O's explicit instruction, **NOT** wired to the Berkley carriers — that effort is dropped.

### 2.4 Task list cleanup
- #51 marked done (ISC fix shipped)
- #52 deleted (Carolina Casualty distribution channels — Master O cancelled the work)
- #45 (contacts import) marked done — verified still in flight from session 10 carry-over but production data is in
- #46 (advisors + drop staging) marked done as part of session 10 close
- #53 created — process new data files (deferred to session 12; bash sandbox down)

### 2.5 New data files Master O dropped — INVENTORIED, NOT YET PROCESSED
Bash sandbox failed to start in session 11 ("Workspace unavailable"), so I could not open xlsx files. The following files are queued for session 12 — Master O wants duplicates filtered and canaries removed.

| File | Likely content | Notes |
|---|---|---|
| `Cincin Ins Co Part 1.xlsx` | Cincinnati Insurance Company appointments | Pair with Part 2 |
| `Cincin Part 2.xlsx` | Cincinnati Insurance Company appointments | Pair with Part 1 |
| `GUARD.xlsx` | Berkshire Hathaway GUARD appointments | Workers' comp / commercial-package carrier |
| `WRB.xlsx` | W.R. Berkley appointments | Likely overlaps with the 13 wholesalers we just wired — DEDUPE CAREFULLY |
| `UTICA.xlsx` | Utica National Insurance appointments | |
| `AdList-17028.xlsx` | Generic AdList export | Triple-download — same data 3x |
| `AdList-17028 (2).xlsx` | Generic AdList export | (likely identical to .xlsx) |
| `AdList-17028 (3).xlsx` | Generic AdList export | (likely identical to .xlsx) |

**Canary detection plan for session 12** (vendor B2B-data lists almost always plant decoys):
1. Look for fake-sounding agency names (alliterative gibberish, geographic mismatches, or names that don't match a real D&B record).
2. Check email domains against the Supabase domains we already have — vendor-controlled domains (e.g., a domain that traces to the data vendor's parent, not to a legit agency) are canaries.
3. Look for addresses that don't resolve to a real building (PO boxes the vendor controls, or single-address clusters).
4. Master O may have a known canary-pattern rule he can share next session — ASK FIRST before writing the canary filter, otherwise it's guessing.

**Dedupe plan:**
- Within each file: dedupe by (agency_name_normalized, address_1, postal_code).
- Across files: dedupe carrier appointments by (agency_id, carrier_id) — already enforced by the existing `WHERE NOT EXISTS` pattern in our import functions.
- The 3 AdList-17028 files almost certainly are the same export — open all three, compare row counts and headers, keep one canonical.

---

## 3. Migrations applied this session

| Migration | Purpose | Status |
|---|---|---|
| 0080 | (placeholder — was a transportation vertical update from session 10 carry; verify no-op on session 11) | Applied |
| 0081 | Berkley operating-units carriers + Transportation vertical mapping | Applied |
| 0082 | 39 agency_carriers rows linking 13 wholesalers to Berkley Small Business + Prime Transportation + National | Applied |
| 0083 | ISC reclassified from agency → agency_wholesaler | Applied |

**Verify after pull:**
```sql
SELECT name, COUNT(DISTINCT ac.agency_id) AS appointed
FROM carriers c LEFT JOIN agency_carriers ac ON ac.carrier_id = c.id
WHERE c.name IN ('Berkley Small Business','Berkley Prime Transportation','Berkley National Insurance Company','Carolina Casualty Insurance Company')
GROUP BY name ORDER BY name;
```
Expected: Berkley National = 13, Berkley Prime Transportation = 13, Berkley Small Business = 13, Carolina Casualty = 0.

---

## 4. Repo / git state

**No app-code changes this session.** All work was Supabase migrations. The local working copy still has session 10's uncommitted state on `/tmp/repo-push` (origin still at `6dc86bb` per session 10 handoff). If session 10's push hasn't gone through, that's still pending — see SESSION_10_HANDOFF.md §4.

---

## 5. Deferred items — full list

| # | Item | Why deferred |
|---|---|---|
| 28 | Confidence-tiered MiEdge fuzzy matcher | ~1 session of build + 1-2 hrs human review (deferred since session 10) |
| 53 | Process Cincin/GUARD/WRB/UTICA/AdList-17028 files | Bash sandbox failed in session 11 — open in session 12 with Python/openpyxl |
| — | Retail trucking load (1,328 agents + appointments + contacts) | Needs Python script run from Master O's terminal — context cost too high in-session |
| — | Phase 3 CMO rewrite (testimonials/customer logos) | Trigger: 2-3 paying customers |
| — | A/B test sweep (3 tests) | Trigger: 500+ visitors/week |
| — | Stripe sandbox → production cutover | Trigger: first paying customer ready to convert |
| — | 8 empty verticals: Public Entity, Real Estate, Hospitality, Manufacturing, Tech/Cyber, Energy, Retail, Professional Services | Need data + carrier mapping per vertical |
| — | Carolina Casualty (75+ PU) distribution channels | Master O explicitly cancelled this work in session 11 — DO NOT REOPEN unless he asks |
| — | Berkley-Prime extension (additional channels) | Master O explicitly cancelled in session 11 — DO NOT REOPEN unless he asks |
| — | First Light + Maximum account_type reclassification | Cosmetic — both should probably be `agency_wholesaler` |

---

## 6. Lessons from this session

1. **Bash sandbox can fail.** When it does, xlsx parsing is impossible — Read tool only reads text/PDF/markdown. Don't promise data loads in-session if bash hasn't been verified up first. Run `which python3` early to confirm.
2. **ISC ambiguity.** "ISC MGA" in the wholesaler list (Master O's verbatim) → "Integrated Specialty Coverages" in the database. Both names are correct; ISC = the brand, ISC MGA = the descriptive abbreviation. They're the same entity.
3. **Master O's "cancel that task" pattern.** When he says skip something, drop it from the to-do list and don't quietly carry it forward. He expects the task list to reflect his current intent, not historical scope.
4. **Carolina Casualty distribution is a real gap, not just an oversight.** It writes 75+ PU — a different broker channel than the 1-75 PU products. Master O cancelled the work, but it's worth flagging in the handoff so the next person doesn't waste cycles speculating.
5. **OneDrive atomic-write workflow** (still relevant from session 9): for any file >5KB, build in `/tmp` via bash + heredoc, then `cp` to OneDrive AND `/tmp/repo-push`, then `md5sum` verify. Direct Edit truncates large files mid-flush.

---

## 7. Opening move for session 12

1. Confirm bash sandbox is healthy: `which python3; python3 -c "import pandas, openpyxl; print('ok')"`. If not — STOP and surface the issue to Master O before starting data work.
2. Run `git log -5 --oneline` in the repo to confirm origin/main HEAD. If session 10's push never landed, Master O may need to push from his clone.
3. Open each new data file (`Cincin Ins Co Part 1.xlsx`, `Cincin Part 2.xlsx`, `GUARD.xlsx`, `WRB.xlsx`, `UTICA.xlsx`, `AdList-17028.xlsx`, `(2).xlsx`, `(3).xlsx`) and report row counts + column schemas. Do NOT load anything yet.
4. **Ask Master O explicitly: "What's your canary pattern?"** before writing the filter. Guessing a canary rule could drop legitimate rows.
5. Once Master O confirms the canary filter, run a dry-run match against Supabase: how many rows match existing agencies, how many are new, how many are canaries.
6. Only then load — and refresh `mv_vertical_summary` after.

---

## 8. Quick-reference IDs (Supabase project `sdlsdovuljuymgymarou`)

```
tenant_id                  = ce52fe1e-aac7-4eee-8712-77e71e2837ce
account_type:agency        = 34d78637-e1a8-4fd7-a413-113e1b78f3eb
account_type:agency_wholesaler = 20d30161-3f91-4ab6-9c60-23cdd0e760d0
carrier:Berkley Small Business         = f52ffb2a-867a-4313-8bd6-1c2159a5f35f
carrier:Berkley Prime Transportation   = dee3db30-cee4-4f61-aed6-47a636384fb8
carrier:Berkley National Insurance Co  = 8447be61-6b74-4542-9f6c-6445e93a72ed
carrier:Carolina Casualty Ins Co       = d0aa27c1-d355-46dd-a48c-5ea8405b6b91
agency:Integrated Specialty Coverages  = 55f1a303-53fd-4dbe-960b-8a10b84eed9f
```

— end of session 11 —
