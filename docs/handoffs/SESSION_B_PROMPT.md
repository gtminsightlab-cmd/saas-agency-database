# SESSION_B — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-19 (end of Session A)
**Predecessor handoff:** [`SESSION_A_HANDOFF.md`](SESSION_A_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com
**Latest deploy:** *<TBD — see SESSION_A_HANDOFF.md "HEAD at session close" after Session A commits>*

Paste the block below verbatim into the first message of the next Claude Code session.

---

```
This is the SESSION_OPENER for Seven16 family-hub Session B —
Texas 2026 appointment data load.

═══════════════════════════════════════════════════════════════
STEP 0 — VERIFY WORKING DIRECTORY BEFORE ANYTHING ELSE
═══════════════════════════════════════════════════════════════

Run `pwd` (PowerShell: `Get-Location`) and confirm output is:

  C:\Users\GTMin\Projects\saas-agency-database

If you see ANY of these paths instead, STOP and alert Master O:
  - Anything under \OneDrive\ (.git permanently broken per family memory)
  - Anything under \.claude\projects\ (session-state, not a working dir)
  - Any path other than the canonical native-git clone above

DO NOT proceed past Step 0 if working directory is wrong.

═══════════════════════════════════════════════════════════════
STEP 1 — CONTEXT (only after Step 0 passes)
═══════════════════════════════════════════════════════════════

You are continuing the Seven16 family-hub track — Session B,
the actual Texas 2026 appointment data load. Session A shipped
the schema (migrations 0093 + 0094) + NAIC mapping CSV prep.

Working directory: C:\Users\GTMin\Projects\saas-agency-database\
Live site: https://directory.seven16group.com
Vercel project: prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV (team_RCXpUhGENcLjR2loNIRyEmT3)
Supabase satellite (Agency Signal): sdlsdovuljuymgymarou
Default tenant: ce52fe1e-aac7-4eee-8712-77e71e2837ce

Before doing anything substantive, read in this order
(Working Agreement Rule 6):

  1. docs/BACKLOG.md  ← Anti-decay layer; read first per Rule 6.
     Active arc is "State DOI appointment data load — Sessions A/B".
  2. docs/handoffs/SESSION_A_HANDOFF.md  ← What shipped 2026-05-19
     (migrations 0093 + 0094 + NAIC mapping CSV).
  3. docs/context/DECISION_LOG.md  ← D-025 (NPN+EIN agency identity;
     state DOI feeds authoritative for appointment data).
  4. docs/context/SOURCE_TYPE_TAXONOMY.md  ← state_doi_<state>
     lowercase convention.
  5. tmp/texas_naic_mapping.csv  ← Master O's spot-check should be
     done before this session opens. If not done, that's Step 2.
  6. supabase/migrations/0093_extend_for_state_doi_appointments.sql
     supabase/migrations/0094_ax_staging_schema.sql  ← Schema you're
     loading into. Read both.
  7. scripts/texas-naic-mapping.py  ← Reference for Session A's
     fuzzy-match logic; Session B's resolver will reuse the same
     normalization function.

═══════════════════════════════════════════════════════════════
STEP 2 — NAIC mapping decision (LOCKED at Session A close 2026-05-19)
═══════════════════════════════════════════════════════════════

Master O locked the CONSERVATIVE FALLBACK at Session A close:

  • Accept all 300 "map" rows (score ≥0.92) as carrier_id matches
    → UPDATE public.carriers SET naic_code = <naic_id> WHERE id = <matched_carrier_id>
  • Treat all 301 "review" rows (score 0.75–0.92) as net-new carriers
    → INSERT a fresh public.carriers row with the CSV's NAIC + name
  • All 336 "create" rows (score <0.75) stay create
    → INSERT a fresh public.carriers row each

  Net effect: 300 NAIC backfills on existing carriers + 637 new
  carrier rows (301 + 336). Existing carriers row count goes from
  1,369 → 2,006. Zero false-match-merger risk; some duplicate
  carriers possible (e.g. "Chubb National" inserted while "Chubb
  INA Group" stays) — accepted as cleanup work for a future dedup
  migration, NOT this session.

  Why conservative fallback over per-row spot-check: false-match
  carrier mergers (Chubb National → Columbia National, etc.) would
  permanently corrupt the directory. Over-creating is recoverable
  via dedup. Master O confirmed this trade-off explicitly.

DO NOT re-ask Master O about NAIC mapping — the decision is locked.
Use tmp/texas_naic_mapping.csv as the source of truth for action
buckets. If the CSV is missing, re-run scripts/texas-naic-mapping.py
first (Slice 0).

═══════════════════════════════════════════════════════════════
STEP 3 — PROPOSED 8-SLICE PLAN (~4 hrs)
═══════════════════════════════════════════════════════════════

  1. **Carrier-side prep** (~30 min, conservative-fallback decision LOCKED per Step 2).
     - Read tmp/texas_naic_mapping.csv (re-generate via
       scripts/texas-naic-mapping.py if missing).
     - SQL preview (read-only): print expected counts before writing —
       300 carriers update + 637 new rows + final naic_code populated count.
     - UPDATE public.carriers SET naic_code = $1 WHERE id = $2 for
       all 300 "map" band rows (action=='map').
     - INSERT INTO public.carriers (name, naic_code, active) VALUES (...)
       for all 637 "review" + "create" band rows (action IN ('review','create')).
       Use the CSV's csv_carrier_name as the new carrier name.
     - Verify: count(carriers) goes 1,369 → 2,006; count(carriers WHERE
       naic_code IS NOT NULL) goes 0 → 937.
     - get_advisors after; clean = no new findings.

  2. **Open ingest run** (~10 min).
     INSERT INTO ax_staging.appointment_loads (
       source_type, source_state, source_year, source_file_name,
       source_file_sha256
     ) VALUES (
       'state_doi_tx', 'TX', 2026, 'Texas 2026.csv',
       <sha256 of the file>
     ) RETURNING id;
     Save the load_id for use throughout Session B.

  3. **Bulk-load into ax_staging.appointments_raw** (~45 min).
     Page through Texas 2026.csv at e.g. 5,000 rows/page.
     For each page:
       - INSERT into ax_staging.appointment_load_pages with status='running'
       - INSERT 5k rows into ax_staging.appointments_raw with row_no offset
       - UPDATE pages row status='completed'
     End: 367,484 rows in appointments_raw. ALL text-typed; raw_json
     preserves the full row payload. Validation happens NEXT slice.
     If anything crashes mid-flight, resume from the last 'completed'
     page (the whole point of the checkpoint table).

  4. **Validation gates** (~30 min, parks failures to rejected bucket).
     Run as a series of SQL passes against appointments_raw → if a
     row fails any gate, INSERT into appointment_rows_rejected with
     reason_code + raw_json, do NOT promote.
     Gates:
       - npn_or_ein_required: agency_npn_raw IS NULL AND agency_ein_raw IS NULL → reject
       - npn_format: agency_npn_raw must be all digits, length 5–10 (if present) → reject
       - ein_format: agency_ein_raw must be 9 digits or 9 digits with one hyphen (if present) → reject
       - naic_format: naic_id_raw must be all digits, length 4–5 → reject
       - date_parse: appointment_active_date_raw must parse as M/D/YYYY → reject if fails
       - line_canonical: appointment_type_raw must map to a known canonical line value (P&C, Life, Health, Surplus Lines, etc.) → reject if unknown
     Count rejections per reason_code; if any reason exceeds 1% of
     367k = 3,670 rows, STOP and surface to Master O before promoting.

  5. **Resolve agencies + carriers** (~45 min).
     Build a working table or CTE that joins appointments_raw with
     public.carriers ON naic_id_raw = naic_code AND public.agencies
     ON (npn=agency_npn_raw AND ein=agency_ein_raw) with fallbacks:
       a. Both NPN + EIN exact match (state=TX scoped) → existing agency_id
       b. NPN exact match, EIN null/different (state=TX scoped) → existing agency_id
       c. EIN exact match, NPN different (state=TX scoped) → existing agency_id
       d. Fuzzy name match within TX agencies (≥0.85 normalized) → existing agency_id
       e. None of the above → INSERT new agency row with npn + ein + name + state='TX' + tenant_id=<default>
     Log resolution method per row (npn_exact / ein_exact / fuzzy_name_tx / created_new).
     If "created_new" exceeds 30k agencies, STOP and surface to Master O
     before promoting — that's a much bigger schema expansion than scoped.

  6. **Promote staging → public.agency_carriers** (~30 min).
     For each resolved raw row:
       INSERT INTO public.agency_carriers (
         tenant_id, agency_id, carrier_id, appointment_status,
         appointment_active_date, state_filed, source_year, source_type,
         lines_of_business, first_observed_at, verified
       ) VALUES (
         <default tenant>, <resolved agency_id>, <resolved carrier_id>,
         'active', <parsed date>, 'TX', 2026, 'state_doi_tx',
         ARRAY[<canonicalized line>], <parsed date>, true
       );
     Verify counts: appointments_raw row count - rejected count = inserted count.
     UPDATE ax_staging.appointment_loads SET status='completed',
       completed_at=now(), row_count_raw, row_count_loaded, row_count_rejected.

  7. **Verification queries** (~20 min).
     - SELECT count(*) FROM public.agency_carriers WHERE state_filed='TX'; expected ~363k+
     - SELECT count(distinct agency_id) FROM public.agency_carriers WHERE state_filed='TX'; expected tens of thousands
     - SELECT count(distinct carrier_id) FROM public.agency_carriers WHERE state_filed='TX'; expected ~937 carriers
     - SELECT count(*) FROM public.agencies WHERE 'TX' = (SELECT state FROM public.agencies WHERE id = ...); confirm TX agency growth
     - Spot-check 3 specific agencies from the file — confirm they resolved correctly + carry expected carriers
     - Run get_advisors after all DDL/inserts; clean = no new findings tied to this load

  8. **Commit, push, verify deploy, write SESSION_C_PROMPT** (~30 min).
     Squash commit: feat(d-025): texas 2026 appointment load (Session B).
     Update BACKLOG (mark Session B done, surface what's next),
     update SESSION_STATE, refresh FAMILY_HEALTH if cross-product
     impact (probably not — Agency Signal internal).
     SESSION_C topic options:
       (a) Resume SESSION_28 UI redesign (now even more valuable with
           Texas data live in agency_carriers — /verticals can show
           real state-resolved appointment density)
       (b) Address the 263k pre-existing source_type-NULL agency_carriers
           rows (decision deferred from Session A)
       (c) Start next state DOI ingest (FL? CA?) if Master O has files
       Recommend (a).

═══════════════════════════════════════════════════════════════
STEP 4 — RISKS + KILL-SWITCH RULES
═══════════════════════════════════════════════════════════════

KILL the session immediately and ask Master O if ANY of these:

  • Slice 4: any rejection reason exceeds 1% (3,670 rows). The CSV
    is probably not the shape we think it is; do not promote.
  • Slice 5: "created_new" agency count exceeds 30,000. We're
    creating an agency-table expansion far beyond Session A's scope.
  • Slice 6: row count mismatch (rejected + inserted ≠ raw). Indicates
    a resolver bug; do not declare success.
  • Slice 7: distinct carrier_id count well under 937. Indicates NAIC
    mapping has gaps the spot-check missed.
  • Any advisor finding tagged "security_high" on a new table or RLS
    policy — fix before commit.

═══════════════════════════════════════════════════════════════
STEP 5 — DO NOT in this session
═══════════════════════════════════════════════════════════════

  • Touch the 263,657 pre-existing source_type-NULL agency_carriers
    rows (separate decision; queued for post-Session-B)
  • Promote NPN to UNIQUE constraint (wait for collision data after load)
  • Build /verticals UI redesign (that's SESSION_28 — paused until B done)
  • Touch app/marketing pages
  • Address the 3 pending Master-O dashboard tasks (CRON_SECRET,
    Stripe webhook, Sentry token — still pending from SESSION_25)
  • Start a second state DOI load (FL, CA) without explicit greenlight —
    Session B is Texas only

═══════════════════════════════════════════════════════════════
STEP 6 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

  • Plan-before-execute: announce the 8 slices, get thumbs-up
    before writes (Master O may compress or expand)
  • Run advisors after EVERY DDL+DML batch
  • RLS forced on every new table touched (D-006 / Principle #1)
  • Secrets never in chat — clipboard → dashboard only
  • Source-type taxonomy lockdown: ONLY `state_doi_tx` for these rows
  • D-017 reminder: no source attribution in `directory.*` mirrors

═══════════════════════════════════════════════════════════════

Confirm Step 0 passed, then read files in Step 1 order. After
reading, propose the 8-slice plan (or whatever slice count fits
Master O's bandwidth today) and wait for thumbs-up before any DB
writes outside ax_staging.
```

---

— end Session B prompt —
