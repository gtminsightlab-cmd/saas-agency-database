# Agency Signal — Dedicated Session 2 Handoff

**Date:** 2026-05-09
**Theme:** First substantive sync of the dedicated session track. Track A diagnostic clean. Pivoted off "load contacts from xlsx" goal when source data revealed no person-level fields. Built multi-signal cascade dedup, then synced 17,638 net-new agencies + 13,914 carrier appointments + 53 UIIA affiliations from DOT Intel into Agency Signal.

**Predecessor:** [`AGENCY_SIGNAL_SESSION_1_HANDOFF.md`](AGENCY_SIGNAL_SESSION_1_HANDOFF.md) — inception bootstrap of dedicated track.

---

## TL;DR

| Action | Volume | Where |
|---|---:|---|
| Net-new agencies inserted | **17,638** | `public.agencies` (20,739 → 38,377) |
| Carrier appointments added | **13,914** | `public.agency_carriers` (191,201 → 205,115) |
| UIIA affiliation tags added | **53** | `public.agency_affiliations` (7,748 → 7,801) |
| New carriers in `public.carriers` | 3 | Berkley Southwest / Southeast / Mid-Atlantic |
| New affiliations in `public.affiliations` | 2 | UIIA + TRS (Transportation Risk Specialist) |
| Migrations applied | 4 | 0084 (canary), 0085 (Berkley OpCos), 0086 (UIIA), 0087 (TRS) |
| Code changed in this repo | 1 file | `scripts/inspect-adlist.ts` (parse-only inspector for AdList xlsx) |
| Code changed outside this repo | 1 file | `scrapers/seven16-scraper/seven16-scraper/scripts/sync_to_agency_signal.py` (refactored — see §6) |

**Confidence at apply time:** ~92%. Spot-checks across 5 match signals all clean after the gating + filler-strip passes.

---

## 1. How the session started — and the pivot

The session opened with three tracks queued in the inception handoff:
1. **Track A** — production-readiness sweep (advisors, Vercel logs, Stripe webhook, auth)
2. **Track V** — `/verticals` page inspection
3. **Contact-load** — Master O's stated priority: "add a few databases of contacts"

Track A passed clean (see §3). Track V confirmed `/verticals` is healthy and all 12 verticals are populated (the older "8 empty verticals" memory note is stale).

The contact-load track is where things got interesting. Master O dropped 7 xlsx files (`AdList_01_of_7.xlsx` … `AdList_07_of_7.xlsx`) into the canonical `data/` folder, expecting the existing `scripts/load-adlist.ts` workflow.

Two structural mismatches surfaced:
- **AccountId is empty in every row** of all 7 files. The existing loader requires non-empty AccountId for dedup; would have inserted 0 rows.
- **Contact-person fields are 0% populated** across 29,053 rows in 7 files. FirstName / LastName / CEmail / Mobile / Title — all empty.

I dug upstream into DOT Intel's source DB (`vbhlacdrcqdqnvftqtin`) and confirmed the issue is at the source: DOT Intel's `agencies` table has the contact-person columns but they're 0% filled. The `contacts` table is empty (0 rows). The scraper hasn't been extended to extract person-level data from find-an-agent pages.

**Pivot:** loading contacts is impossible from this pipeline today. But the agency + carrier-appointment data IS valuable, and there's an existing `sync_to_agency_signal.py` script for direct DB-to-DB sync. Master O agreed to pivot to agency + carrier sync.

---

## 2. The multi-signal cascade dedup story

The original `sync_to_agency_signal.py` used a single dedup key: `lower(name) + state + zip5`. Dry-run showed:
- 27,096 net-new agencies
- 1,957 already-existing matches

That looked too low on the matches — 7% of DOT Intel rows matching against 20K existing AS agencies seemed implausibly low for an overlapping dataset. Master O proposed `city + state + zip` instead, which prompted a sanity check: 12% of zips have 2-15 unrelated agencies sharing them. Pure city+state+zip would silently merge unrelated agencies on every dense zip. So city+state+zip alone was rejected as too loose.

**Built a 5-signal cascade instead:**

| # | Signal | Match logic | Gate |
|---|---|---|---|
| 1 | `email` | exact (lowercased) | none — proven reliable |
| 2 | `web_address` | host normalized (strip protocol, www, slash) | state match + name-sim ≥ 0.5 with filler-stripped names |
| 3 | `phone+state` | digits-only phone + 2-letter state | none |
| 4 | `name+state+zip5` | norm(name) + state + zip5 | none |
| 5 | `address_1+state+zip5` | norm(address) + state + zip5 | name-sim ≥ 0.5 |

**Cascade dry-run results (final):**
- 17,638 net-new
- 11,415 already-existing matches
- Match signal breakdown: phone_state 8,949 / web 1,060 / addr_state_zip 527 / email 475 / name_state_zip 404

That's **6.8x more matches caught** than the original key (11,415 vs 1,957), preventing ~9,500 soft duplicates from landing.

**Three iterations were needed to land the gates:**

1. **First iteration (no gates):** got 14,002 matches but spot-check revealed national brokers (HUB, RT Specialty, Risk Placement Services, INSURICA) over-merging via shared web domains. About 30-40% of web matches were merging different physical offices in different states.

2. **Second iteration (state match + name-sim ≥ 0.4 on web/addr):** caught the national-broker case via state match. Name-sim 0.4 still let through "Frates & Irwin Risk Management Solutions" → "Insurance Solutions" because both have "solutions" in name (and "Insurance Solutions" matched via "insurance" suffix on common-suffix words).

3. **Final iteration (filler-stripped name-sim ≥ 0.5):** strip common insurance-domain words (`insurance, agency, group, llc, inc, services, brokerage, partners, solutions, risk, management, ...`) before computing similarity, threshold 0.5. All over-merge cases from the first two iterations now correctly rejected. 50/50 spot-check samples (10 per signal) clean.

---

## 3. Track A — diagnostic clean (2026-05-09)

| Check | Result |
|---|---|
| Supabase project | `sdlsdovuljuymgymarou` ACTIVE_HEALTHY, pg 17.6.1.105 |
| Performance advisors | 31 findings, all INFO (cold-table FKs, unused indexes, auth conn-strategy) |
| Security advisors | 88 findings, **100% pre-existing** baseline. 1 ERROR (`_trucking_load_log` RLS), 84 WARN (SECURITY DEFINER funcs), 3 WARN env (pg_trgm-in-public, mv_vertical_summary-API-readable, leaked-password-protection). All known/deferred |
| Vercel deploys | Last 20 READY, latest `dpl_BNc5bWWj…` matches commit `4c38859` |
| Vercel runtime logs (7d, error+warning+fatal) | 0 entries |
| Stripe webhook | Code clean — signature-verified, force-dynamic, nodejs runtime, properly excluded from middleware, all 4 documented events handled |
| Auth middleware | Standard `@supabase/ssr` pattern, no drift |

No blockers found. Steady state since 2026-04-27.

---

## 4. The 7 scraped xlsx files — what they actually are

`AdList_01_of_7.xlsx` through `AdList_07_of_7.xlsx`. Dropped 2026-05-08 by Master O. ~1.7-1.9MB each.

**Sheets:** Account, Contact, Carriers, Industries, Affiliations (matching AdList template).

**Per-sheet fill rates across all 7 files (29,053 total Account rows):**

| Sheet & Field | Populated | % |
|---|---:|---:|
| Account.Account (agency name) | 29,053 | 100% |
| Account.City + State | 29,053 | 100% |
| Account.MainPhone | 28,984 | 99.8% |
| Account.WebAddress | 6,201 | 21.3% |
| Account.Email | 4,897 | 16.9% |
| Account.AccountId | **0** | **0%** ← AccountId empty across ALL files |
| Contact.Account (agency name, repeated) | 29,053 | 100% |
| Contact.WorkPhone (agency main phone, copied) | 28,973 | 99.7% |
| Contact.FirstName / LastName / CEmail / Mobile / Title | **0** | **0%** ← person fields all empty |

**The Contact sheet is structurally agency-level data dressed up as contact-level rows.** Each row has the agency name + agency phone, but no actual person-level data.

**Verdict:** these xlsx files are an EXPORT of DOT Intel's data, not new contact data. The `sync_to_agency_signal.py` script bypasses them entirely and reads directly from DOT Intel's Supabase — same data without the format mismatch.

The 7 files are now in `data/` (canonical clone) for archival but were not used for the load.

---

## 5. Migrations applied — 0084 through 0087

All 4 applied via Supabase MCP `apply_migration` AND synced to `supabase/migrations/` so repo + DB stay aligned.

### 0084 — `canary_programbusiness_jeff_neilson.sql`

Sealed two gaps in the watermark canary set:
- Domain-level catch-all for `@programbusiness.com` (was only catching `jeffneilson@programbusiness.com` exact)
- "Jeff Neilson" + "Jeff Nielson" (alt spelling) by name (was only catching his exact email)

Used `match_mode='contains'` since the `data_load_denylist_match_mode_check` constraint allows only `exact`/`contains`/`digits_only` (no `domain` mode despite the loader code supporting it).

**Active canaries: 13 → 16.** Baseline scan post-migration: 0 live hits across all 16 patterns.

### 0085 — `add_berkley_regional_opcos.sql`

3 Berkley regional operating units missing from `public.carriers`:
- Berkley Southwest, Berkley Southeast, Berkley Mid-Atlantic
- `group_name = 'W. R. Berkley Insurance Group'` (matches existing Berkley OpCo pattern: Berkley National Insurance Company, Berkley Regional Insurance Company, etc.)

Without these, 950 carrier appointments from `berkley_*_paste` source slugs would have been silently skipped. Post-migration the sync attached 374 + 320 + 216 = 910 appointments (some skipped during within-batch dedup).

### 0086 — `add_uiia_affiliation.sql`

UIIA (Uniform Intermodal Interchange Agreement) Approved Agents added to `public.affiliations` as `type='cluster'`. Routes 53 `uiia_approved_insurance_agents` source rows from DOT Intel to `agency_affiliations` (not `agency_carriers` — UIIA is an affiliation/certification, not a carrier).

### 0087 — `add_trs_designation.sql`

Transportation Risk Specialist (TRS) — MCIEF transportation designation — added to `public.affiliations` as `type='cluster'`. **Taxonomy seeding only:** no source slug currently produces TRS-tagged data. Available for future loads + UI filter.

---

## 6. Code changes — sync_to_agency_signal.py (lives in scraper repo, NOT git-tracked)

Path: `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\CRM for MGU and Recruiting\scrapers\seven16-scraper\seven16-scraper\scripts\sync_to_agency_signal.py`

This script lives in the seven16-scraper repo which is not git-tracked. Changes are local-only. Same goes for that repo's `.env` and `.env.example`.

**Changes made (all 2026-05-09):**

1. **Removed hardcoded service-role keys.** Both `DOTINTEL_KEY` and `AGENCYSIGNAL_KEY` now read from env vars via python-dotenv loading from the scraper repo's `.env`. Old keys are dead anyway — the hardcoded `AGENCYSIGNAL_KEY` had been rotated since the script was written, hence the 401 on first invocation.
   - Required env vars: `SUPABASE_SERVICE_KEY` (DOT Intel) + `AGENCYSIGNAL_SERVICE_KEY` (Agency Signal).
   - Clipboard-to-file flow used to inject the AS key without exposing it in chat.

2. **Replaced single dedup_key() with 5-signal cascade find_match()**. See §2 above for the cascade logic. Includes name-sim gate (with filler-word strip) and state match on `web` and `addr_state_zip` matches.

3. **Added matched_existing_ids tracking.** Before this change, the carrier-link pass only ran for INSERTED agencies. Now it also runs for already-matched-existing agencies, so the existing 11,415 curated rows gain new carrier appointments without their other fields being overwritten.

4. **Added AFFILIATION_SLUG_MAP + parallel affiliation-link pass.** Routes `uiia_approved_insurance_agents` source slug to `public.agency_affiliations` instead of `public.agency_carriers`.

5. **Updated CARRIER_SLUG_MAP to canonical AS carrier names.** Original map had names like "Liberty Mutual Insurance" and "Cincinnati Insurance" that didn't match anything in `public.carriers`. Updated to use the variant with the most existing appointments (Liberty Mutual: 4,048 → "Liberty Mutual"; Cincinnati: 1,681 → "Cincinnati Insurance Company"; etc.). 12 originally-mappable carriers + 3 newly-added Berkley OpCos = 15 of 16 source slugs map cleanly. UIIA routes to affiliations instead.

6. **Within-batch dedup of (agency_id, carrier_id) pairs** before `agency_carriers.upsert()`. Postgres rejects upsert when the same conflict-tuple appears twice in a single INSERT; we hit this on first --apply because multiple DI rows can map to same AS agency for same source slug. Fixed by dedup'ing in Python before chunking. Same fix for `agency_affiliations`. 17,716 attempted → 16,239 unique pairs.

7. **Dry-run preview now reaches carrier + affiliation blocks.** Original early-return on `not args.apply` skipped past those blocks. Now the dry-run shows projected counts for all three tables.

---

## 7. New file in this repo — `scripts/inspect-adlist.ts`

Parse-only inspector for AdList xlsx workbooks. Doesn't need any creds — pure local file analysis. Reports per-file row counts, fill rates per important column, distinct carrier/affiliation names, and writes `data/_inspect_distinct_*.txt` for cross-check against AS reference tables.

Used to confirm the 7 scraped xlsx files were structurally agency-only with empty contact-person fields. Useful permanently for any future xlsx drop.

---

## 8. Live state at end of session

| Check | Value |
|---|---|
| Agency Signal site | https://directory.seven16group.com — HTTP 200 |
| Vercel latest deploy | `dpl_BNc5bWWjoznaVoq2A7fBauSrQuAg` (commit `4c38859`) READY. Next push triggers redeploy with migrations 0084-0087 |
| Supabase | `sdlsdovuljuymgymarou` ACTIVE_HEALTHY |
| `public.agencies` | **38,377** (was 20,739) |
| `public.agency_carriers` | **205,115** (was 191,201) |
| `public.agency_affiliations` | **7,801** (was 7,748) |
| `public.contacts` | 87,434 (unchanged — no source data) |
| `public.carriers` | 1,369 (was 1,366; +3 Berkley OpCos) |
| `public.affiliations` | 184 (+2: UIIA, TRS) |
| `public.data_load_denylist` (active canaries) | 16 (was 13) |
| `mv_vertical_summary` | refreshed 2026-05-09 |
| Migrations | 0001-0087 |

---

## 9. Known issues + carry-forward MUST-DOs

### Post-session MUST-DO (security)

- **Rotate Supabase service-role keys for both DOT Intel and Agency Signal.** The 3 `default`/`seven16group`/`vercel_prod_2026_05_01` Agency Signal secret keys were briefly visible in a screenshot Master O sent in chat (verifying which to copy). The DOT Intel hardcoded key was visible in the script file. Conservative move: rotate the AS `default` key (the one used today) AND the DOT Intel `SUPABASE_SERVICE_KEY` after this session ends.
  - Action: Supabase dashboard → both projects → API → New secret key → revoke old → update `scrapers/seven16-scraper/seven16-scraper/.env`.

### Carry-forward — Agency Signal-side

1. **Contacts gap.** DOT Intel has no person-level data (FirstName/LastName/Mobile/CEmail/Title 0% filled). The contact-extraction step needs to be added to the scraper before any meaningful contact-level enrichment can happen for these 17K+ new agencies.

2. **trustedchoice agencies have no carrier appointments.** 11,284 trustedchoice_city_walk agencies inserted, but trustedchoice is a multi-carrier directory and isn't in `CARRIER_SLUG_MAP`. They'll show up in agency searches but won't surface in carrier-filtered queries until we figure out how to attribute them. May need a "Trusted Choice" affiliation tag instead.

3. **Berkley regional OpCos may need parent linkage.** Migration 0085 added them with `group_name = 'W. R. Berkley Insurance Group'` but no explicit parent_id (the `carriers` table doesn't have a parent_id column). Parent-child rollup happens elsewhere in the schema; verify the 3 new rows surface correctly in the W.R. Berkley parent rollup if/when that's exercised.

4. **TRS taxonomy seed only.** No source slug produces TRS-tagged data yet. Add MCIEF source to scraper if/when it's available.

5. **mv_vertical_summary numbers barely shifted** despite 17K new agencies. Reason: vertical counts are tied to specialty-carrier mappings, and the new appointments mostly go to GENERAL carriers (Liberty Mutual, Nationwide, Cincinnati, etc.) which aren't in the per-vertical specialty carrier lists. Transportation gained 24 agencies (+2%); other verticals unchanged. Not a bug — just calling out that adding agency volume doesn't auto-populate the verticals page.

6. **17,716 → 16,239 within-batch dedup ratio (~8%)** = many DI rows collapse to same AS row via cascade. Some agencies had multiple appointments to same carrier from same source. The dedup-in-Python fix is sufficient.

### Pre-existing carry-forward (not changed today)

- _trucking_load_log RLS disabled (deferred item #13)
- 84 SECURITY DEFINER warnings (deferred item #13)
- pg_trgm extension in public schema
- Auth leaked-password-protection not enabled
- Next.js 14.2.15 has a flagged security vulnerability (npm install warning during this session). Patched version available; defer to a separate Next.js upgrade session.

---

## 10. Files to commit

In `saas-agency-database` canonical clone (`C:\Users\GTMin\Projects\saas-agency-database\`):

| Path | Action |
|---|---|
| `supabase/migrations/0084_canary_programbusiness_jeff_neilson.sql` | New |
| `supabase/migrations/0085_add_berkley_regional_opcos.sql` | New |
| `supabase/migrations/0086_add_uiia_affiliation.sql` | New |
| `supabase/migrations/0087_add_trs_designation.sql` | New |
| `scripts/inspect-adlist.ts` | New |
| `data/AdList_01_of_7.xlsx` … `AdList_07_of_7.xlsx` | New (gitignored — won't actually commit) |
| `docs/STATE.md` | Modified |
| `docs/handoffs/AGENCY_SIGNAL_SESSION_2_HANDOFF.md` | New (this file) |
| `docs/context/SESSION_STATE.md` | Modified (Part 1 only) |

**NOT committed (in scraper repo, not git-tracked):**
- `scrapers/seven16-scraper/seven16-scraper/scripts/sync_to_agency_signal.py` modifications
- `scrapers/seven16-scraper/seven16-scraper/.env.example` modifications
- `scrapers/seven16-scraper/seven16-scraper/.env` (never tracked anyway)

---

## 11. Opening move for Session 3

Pick one when you next open the dedicated track:

1. **Production smoke test on the live site.** Browse `/verticals`, click a vertical, confirm new agencies surface in searches/filters. /admin pages render correctly with the larger row counts.
2. **trustedchoice tagging.** Add a "Trusted Choice" affiliation row, route `trustedchoice_city_walk` source rows there. Recovers the 11,284 currently-orphaned (no carrier link) agencies.
3. **Stripe sandbox → production cutover prep** (carry from Session 1 inception handoff Track B).
4. **Trust copy + Hygiene Credit rollout** (carry from Session 1 Track D).
5. **Domain cutover directory.seven16group.com → agencysignal.co** (carry from Session 1 Track E).
6. **Wildcard** — Master O specifies.

Recommend **(1) production smoke test** as the immediate next step. ~15 min. Confirms the load didn't break anything user-facing before moving on.

---

— end AGENCY_SIGNAL_SESSION_2_HANDOFF —
