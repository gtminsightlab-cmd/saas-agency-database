# Family-Hub Session B — Texas 2026 DOI appointment load (PARTIAL) (2026-05-19)

**Date:** 2026-05-19
**Repo:** `saas-agency-database` (family hub + Agency Signal)
**Branch:** `main`
**Predecessor:** [`SESSION_A_HANDOFF.md`](SESSION_A_HANDOFF.md)
**HEAD at session open:** `f385d65` (Session A close — migrations 0093+0094 prep)
**HEAD at session close:** *TBD — set after commit at Slice 8*
**Live URL:** https://directory.seven16group.com
**Working directory:** `C:\Users\GTMin\Projects\saas-agency-database\` (canonical)

---

## Theme

Master O directed "lets roll" + "keep going" in the same conversation as Session A close (overriding the earlier "fresh session" lock). Threshold set at 70-80% context for a hard session-close. Session B kicked off immediately. The actual 367k-row bulk load of `ax_staging.appointments_raw` ran into a real engineering constraint that needs Master-O dashboard credentials to unblock; everything else that didn't depend on those credentials shipped.

---

## What shipped

### ✅ Slice 1 — Carrier-side prep (conservative-fallback NAIC backfill)

**Pre-Slice-1 state:** 1,369 carriers, 0 with `naic_code`. Tmp mapping CSV from Session A had 937 distinct Texas carriers bucketed 300 map / 301 review / 336 create.

**Executed:**
- **UPDATE 300 carriers** (map band, score ≥0.92) — `tmp/slice1_updates.sql` via Supabase MCP `execute_sql`. Result: 299 actually updated. Discrepancy: NAIC 10946 "Arch Property Casualty Insurance Company" was a false-positive (score 0.930) onto the same carrier_id that NAIC 20699 "Ace Property and Casualty Insurance Company" (score 1.000) correctly mapped to. Postgres UPDATE-FROM-VALUES with duplicate join keys kept the last write (NAIC 20699). Net: 1 false-positive carrier overwrite, 1 NAIC orphaned.
- **Manual fix:** INSERT Arch Property Casualty (NAIC 10946) as a new carrier row. State now: 300 carriers with NAIC.
- **INSERT 637 net-new carriers** (review + create bands) via 4 chunked SQL files: `tmp/slice1_inserts_part{1..4}.sql` (200 + 200 + 200 + 37 rows). All via Supabase MCP.
- **Final state:** 2,007 carriers (was 1,369; +638 new). 937 with naic_code (was 0). Math checks: 299 UPDATE + 1 Arch + 637 INSERT = 937. 1,369 + 638 = 2,007.

**Decision artifact:** All 938 (300 UPDATE + 638 INSERT) writes are now permanent. Future cleanup may dedup near-duplicate carriers (e.g. "Encompass Insurance Co of America" + "Encompass Property and Casualty" + "Encompass Indemnity Company" — all now in carriers table from this load). Not blocking; logged as future hygiene work.

**Files committed this slice:** `scripts/slice1-build-carrier-sql.py` (generated the SQL), `scripts/slice1-chunk-inserts.py` (chunked it for MCP throughput). Working artifacts in `tmp/` are gitignored.

### ✅ Slice 2 — Opened ingest run

`INSERT INTO ax_staging.appointment_loads ... RETURNING id` →

```
load_id:      1b83ad57-e3dc-4e50-b673-4722ac612d1c
source_type:  state_doi_tx
source_state: TX
source_year:  2026
source_file:  Texas 2026.csv
sha256:       0c4ec86148d0800ba1fafd3f2e3f6b469053ae24774aacf856ed8c25b229b129
status:       running
started_at:   2026-05-19 22:07:12 UTC
```

SHA-256 was computed against the OneDrive vendor drop. Loader (Slice 3) will verify against this before any rows post. If the file on disk has been re-saved or edited, SHA-256 will mismatch and loader aborts.

### ✅ Slice 3 INFRASTRUCTURE (the actual 367k row load is BLOCKED — see below)

**Migration 0095** — applied to `sdlsdovuljuymgymarou`. Two SECURITY DEFINER functions in `public` schema as PostgREST bridges to the locked `ax_staging` schema:

- `public.staging_insert_appointment_rows(p_load_id uuid, p_page_no int, p_row_offset int, p_rows jsonb)` — validates load_id is running, opens/closes page checkpoint, bulk-inserts raw rows with raw_json preserved.
- `public.staging_finalize_appointment_load(p_load_id uuid, p_row_count_raw int, p_status text, p_notes text)` — closes the ingest run, computes counts from raw + rejected tables.

Both REVOKE from anon/PUBLIC; GRANT EXECUTE to service_role only. Family pattern per `feedback_postgrest_schema_cache_stuck.md` — PostgREST is the cross-schema write path when direct DB connection isn't available.

**Python loader** — `scripts/load-tx-appointments.py`:
- Reads `.env.local` for SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
- Preflight: verifies key works against /rest/v1/tenants; aborts with explain-like-5 message if 401
- Verifies file SHA-256 matches the load row before any posts
- Streams Texas 2026.csv in 5,000-row chunks
- For each chunk: POSTs to /rest/v1/rpc/staging_insert_appointment_rows
- Progress per chunk printed; total elapsed
- On completion: calls staging_finalize_appointment_load
- Resumable via `--start-page N` flag
- `--dry-run` flag for offline validation

### ✅ Slices 4-6 SQL — pre-staged for Session C

`scripts/session-c-slices-4-5-6.sql` — comprehensive multi-section file ready to execute via MCP after the bulk-load completes:

- **Slice 4** — 6 validation gates (npn_or_ein_required, npn_format, ein_format, naic_format, date_parse, unknown_naic). Each gate INSERTs into `ax_staging.appointment_rows_rejected`. Kill-switch: any reason >3,670 rows (1% of 367k) STOPs the session.
- **Slice 5** — 5-tier agency resolver (npn_ein_exact, npn_exact, ein_exact, fuzzy_name_tx via pg_trgm @ 0.85, created_new). Carrier resolver = NAIC exact (Slice 1 ensured 937 carriers have NAIC). Working table `ax_staging.appointments_resolved` created on-the-fly with per-row resolution method logged. Kill-switch: created_new >30,000 STOPs.
- **Slice 6** — Promotes resolved rows to `public.agency_carriers` with `source_type='state_doi_tx'`, `state_filed='TX'`, `source_year=2026`. Closes the appointment_loads row with final counts.

Includes Slice 7 verification queries (count(*) WHERE state_filed='TX', distinct agency/carrier counts, source_type distribution, NPN 2331759 spot-check, final ingest-run state).

---

## What's BLOCKED (and why)

### Slice 3 — the actual 367k-row bulk load

The cached `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` returns **HTTP 401** when calling PostgREST. Per family memory note `feedback_supabase_api_key_format_rotation.md`, the legacy JWT service-role keys were rotated to the new `sb_secret_*` format; cached copies in sibling repos return "Unregistered API key." The key in `.env.local` is in the new format (length 41, starts with `sb_secret_`) but still returns 401 — meaning the key was rotated AGAIN after .env.local was last refreshed.

**MCP `execute_sql` cannot serve as the bulk-load path** because each chunk would need to be inlined into my tool-call parameter:
- 367k rows / 5k per chunk = 74 chunks × ~250KB per chunk SQL = ~18MB total SQL
- That's millions of tokens of MY context to construct the tool calls
- Even 200 rows/chunk (1,840 chunks × ~10KB) is 5M+ tokens

The Python loader via PostgREST RPC bypasses my context entirely — Python streams the CSV chunk-by-chunk, sends ~5MB POST per chunk to /rest/v1/rpc, my context never touches the row data.

### Master-O dashboard tasks to unblock Session C (5 min total)

1. **Refresh SUPABASE_SERVICE_ROLE_KEY** (5 min):
   - Supabase dashboard → `sdlsdovuljuymgymarou` (Agency Signal satellite) → Project Settings → API Keys
   - Copy the value labeled **service_role** (sb_secret_* format) — NOT the legacy section
   - Open `C:\Users\GTMin\Projects\saas-agency-database\.env.local` in a text editor
   - Replace the `SUPABASE_SERVICE_ROLE_KEY=...` line with the fresh value
   - Save

2. **Run loader from Session C** (~5-10 min unattended):
   ```powershell
   cd C:\Users\GTMin\Projects\saas-agency-database
   python scripts/load-tx-appointments.py
   ```
   (Add `--dry-run` first for sanity; remove for the real run.)

3. **Run Slices 4-6 SQL** via Supabase MCP in Session C (~30 min).

---

## DB state at session close

```
public.carriers              2,007 rows (was 1,369; +638 new this session)
public.carriers WHERE naic_code IS NOT NULL    937 rows (was 0)
public.agencies             32,951 rows (unchanged — agency creation deferred to Slice 5)
public.contacts            135,453 rows (unchanged)
public.agency_carriers     263,657 rows (unchanged — load deferred to Slice 6)

ax_staging.appointment_loads        1 row  (the running load 1b83ad57-...)
ax_staging.appointment_load_pages   0 rows (will populate during loader run)
ax_staging.appointments_raw         0 rows (will populate during loader run)
ax_staging.appointment_rows_rejected 0 rows (will populate during Slice 4)
ax_staging.appointments_resolved    [not yet created — Slice 5 builds it]
```

Migrations applied:
- 0093 (extend agencies + agency_carriers for state DOI) — Session A
- 0094 (ax_staging schema with 4 tables) — Session A
- **0095 (staging_load_rpc) — Session B**

---

## Files committed this session

| File | Type | Notes |
|---|---|---|
| `supabase/migrations/0095_staging_load_rpc.sql` | new | SECURITY DEFINER bridge to ax_staging |
| `scripts/slice1-build-carrier-sql.py` | new | Generated 300 UPDATE + 637 INSERT SQL |
| `scripts/slice1-chunk-inserts.py` | new | Chunked the INSERT into 4 files for MCP throughput |
| `scripts/load-tx-appointments.py` | new | Python loader for Session C — Texas CSV → ax_staging.appointments_raw via RPC |
| `scripts/session-c-slices-4-5-6.sql` | new | Validation + resolver + promotion SQL, run via MCP in Session C |
| `docs/handoffs/SESSION_B_HANDOFF.md` | new | this file |
| `docs/handoffs/SESSION_C_PROMPT.md` | new | paste-ready opener for Session C |
| `docs/BACKLOG.md` | edit | Active arc updated (Session B status) |
| `docs/context/SESSION_STATE.md` | edit | Date + DB delta |

Working artifacts NOT committed (gitignored under `tmp/`):
- `tmp/slice1_updates.sql` (18 KB, 300 UPDATE rows)
- `tmp/slice1_inserts_part1-4.sql` (38 KB total, 637 INSERT rows)
- `tmp/slice1_summary.txt`
- `tmp/texas_naic_mapping.csv` (from Session A)

---

## Open risks / known issues for Session C

1. **Service-role key rotation cadence.** This is the second rotation since Session A. If keys rotate again between Session B close and Session C open, the loader will 401 again. Per family memory, this is a known pattern post-2026 key migration. Master O may need to refresh again at Session C start.

2. **Arch Property Casualty NAIC 10946.** Inserted as net-new in Slice 1 fix. The matched_carrier (ACE P&C, NAIC 20699) is correctly tagged. Both rows are valid and independent in the carriers table. No further action needed.

3. **637 review-band INSERTs may have duplicate carriers.** The conservative-fallback decision accepted this risk. Examples: "Encompass Insurance Co of America" + "Encompass Property and Casualty Company" + "Encompass Indemnity Company" all now exist as 3 distinct carrier rows. Real Encompass family is fewer NAIC IDs but the file references each variant explicitly. Future cleanup migration could dedup by group_name / parent NAIC.

4. **Slice 5 resolver `created_new` tier may explode.** Texas DOI files reference tens of thousands of distinct agencies (especially small retail producers). Our DB has 3,086 TX agencies. Most rows will land in tier (a)-(d) — unless our NPNs are wildly mismatched. Worst case: Slice 5 creates ~10-15k new agency rows. Kill-switch at 30,000 stops the session if it's catastrophically off.

5. **No Vercel deploy verify this session.** No app code touched; deploy still on Session A's `dpl_HgP1oUYFqvG43GQqPfDReSC6srsv` READY. Session C commits will re-trigger deploy; verify READY there.

6. **3 still-pending Master-O dashboard tasks from SESSION_25** remain pending. Out of scope for Session C; flag at next family-track session.

---

## What's NEXT (Session C scope, see SESSION_C_PROMPT.md)

1. Master O refreshes service-role key (~5 min, dashboard)
2. Run `python scripts/load-tx-appointments.py` (~5-10 min unattended)
3. Run Slices 4-6 SQL via MCP (~30 min)
4. Verify counts; commit + push + handoff
5. If everything green, decide whether to start SESSION_28 (UI redesign) or queue the next state DOI ingest

— Session B close —
