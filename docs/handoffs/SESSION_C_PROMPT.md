# SESSION_C — paste-ready prompt for next family-hub session

**Date queued:** 2026-05-19 (end of Session B)
**Predecessor handoff:** [`SESSION_B_HANDOFF.md`](SESSION_B_HANDOFF.md)
**Working directory required:** `C:\Users\GTMin\Projects\saas-agency-database\` (NOT OneDrive)
**Live site:** https://directory.seven16group.com

---

## Master O — before launching this session

Two 5-minute dashboard tasks. Both are required before Session C can do anything productive.

### TASK A — Refresh SUPABASE_SERVICE_ROLE_KEY in `.env.local`

The cached key returns HTTP 401 (rotated again post-Session-A).

1. Open Edge or Chrome → https://supabase.com/dashboard/project/sdlsdovuljuymgymarou/settings/api
2. Scroll to "Project API keys" section
3. Find the row labeled **service_role** (the value starts with `sb_secret_`)
4. Click the eye icon to reveal, then click "Copy"
5. Open `C:\Users\GTMin\Projects\saas-agency-database\.env.local` in Notepad
6. Find the line that starts with `SUPABASE_SERVICE_ROLE_KEY=`
7. Replace EVERYTHING after the `=` with what you just copied (no quotes)
8. Save the file (Ctrl+S), close Notepad

### TASK B — Sanity-check the new key works

In Windows Terminal / PowerShell:

```powershell
cd C:\Users\GTMin\Projects\saas-agency-database
python scripts/load-tx-appointments.py --dry-run
```

You should see "service-role key OK" near the top. If you see "FATAL: SUPABASE_SERVICE_ROLE_KEY in .env.local is stale or invalid" — repeat TASK A; the paste didn't take or you grabbed a different key.

Dry-run prints what WOULD be loaded without posting anything. Should end with "Finished 74 pages, 367,484 rows in <few seconds>" and "[DRY RUN] no rows posted."

If dry-run works → you're ready to launch Session C below.

---

Paste the block below verbatim into the first message of the next Claude Code session.

```
This is the SESSION_OPENER for Seven16 family-hub Session C —
Texas 2026 appointment load FINISH (loader + Slices 4-6 + verify).

═══════════════════════════════════════════════════════════════
STEP 0 — VERIFY WORKING DIRECTORY BEFORE ANYTHING ELSE
═══════════════════════════════════════════════════════════════

Run `pwd` (PowerShell: `Get-Location`) and confirm output is:

  C:\Users\GTMin\Projects\saas-agency-database

If you see ANY of these paths instead, STOP and alert Master O:
  - Anything under \OneDrive\ (.git permanently broken per family memory)
  - Anything under \.claude\projects\ (session-state, not a working dir)

DO NOT proceed past Step 0 if working directory is wrong.

═══════════════════════════════════════════════════════════════
STEP 1 — CONFIRM MASTER-O TASK A + B COMPLETED
═══════════════════════════════════════════════════════════════

Before reading anything, confirm with Master O:

  • Did you refresh SUPABASE_SERVICE_ROLE_KEY in .env.local?
  • Did `python scripts/load-tx-appointments.py --dry-run` print
    "service-role key OK" + "Finished 74 pages, 367,484 rows" + "[DRY RUN]"?

If either is "no" or "I'm not sure", point Master O at
docs/handoffs/SESSION_C_PROMPT.md (the prefix BEFORE this block) for
TASK A + B steps. Do NOT start Session C until both are confirmed.

═══════════════════════════════════════════════════════════════
STEP 2 — CONTEXT (only after Step 1 confirmed)
═══════════════════════════════════════════════════════════════

You are continuing the Seven16 family-hub track — Session C, the
finish of the Texas 2026 DOI appointment load arc.

Working directory: C:\Users\GTMin\Projects\saas-agency-database\
Live site: https://directory.seven16group.com
Supabase satellite (Agency Signal): sdlsdovuljuymgymarou
Default tenant: ce52fe1e-aac7-4eee-8712-77e71e2837ce
Active load_id (opened Session B Slice 2):
  1b83ad57-e3dc-4e50-b673-4722ac612d1c

Read in this order (Working Agreement Rule 6):

  1. docs/BACKLOG.md
  2. docs/handoffs/SESSION_B_HANDOFF.md  ← what shipped + what's blocked
  3. docs/context/DECISION_LOG.md  ← D-025 reminder (NPN+EIN agency identity,
                                      state DOI authoritative)
  4. supabase/migrations/0095_staging_load_rpc.sql  ← PostgREST bridge RPC
                                                       you'll be calling
  5. scripts/load-tx-appointments.py  ← Python loader (already exists,
                                          ready to run)
  6. scripts/session-c-slices-4-5-6.sql  ← Validation + resolver + promotion
                                            SQL (already exists, paste into
                                            MCP execute_sql per section)

═══════════════════════════════════════════════════════════════
STEP 3 — PROPOSED 5-SLICE PLAN (~1.5-2 hrs)
═══════════════════════════════════════════════════════════════

  1. **Slice 3-run — Bulk load via Python loader** (~10 min,
     mostly unattended). Have Master O execute:

       cd C:\Users\GTMin\Projects\saas-agency-database
       python scripts/load-tx-appointments.py

     Watch the per-chunk progress (~74 chunks at ~7-10s each).
     End-state: 367,484 rows in ax_staging.appointments_raw,
     ingest run finalized.

     If a chunk fails with HTTP 401 mid-run, key rotated; refresh
     and use --start-page <N> to resume.

  2. **Slice 4 — Validation gates** (~15 min). Execute the SLICE 4
     section of scripts/session-c-slices-4-5-6.sql via MCP execute_sql,
     one INSERT-into-rejected statement at a time (6 gates).
     End with the rejection-counts SELECT.
     KILL-SWITCH: if any reason_code > 3,670 (1% of 367k), STOP and
     surface to Master O.

  3. **Slice 5 — Resolver** (~30 min). Execute the SLICE 5 section
     (DROP+CREATE working table, then INSERT survivors, then 5 UPDATE
     passes for agency tiers a-e). End with resolution-method
     distribution SELECT and created_new sanity check.
     KILL-SWITCH: if created_new > 30,000, STOP.

  4. **Slice 6 — Promote staging → public.agency_carriers** (~10 min).
     Execute the SLICE 6 INSERT. Then UPDATE the ingest-run ledger to
     completed.
     Verify: count(*) WHERE state_filed='TX' should match
     surviving raw count.

  5. **Slice 7+8 — Verify + commit + handoff + Session D prompt**
     (~30 min). Run Slice 7 verification queries. Update docs (BACKLOG,
     SESSION_STATE, FAMILY_HEALTH if material). Single squash commit
     `feat(d-025): texas 2026 appointment load complete (Session C)`.
     Push + verify Vercel READY. Write SESSION_D_PROMPT (likely
     resumes the SESSION_28 UI redesign epic with Vertical Intelligence
     now backed by real state-resolved data).

═══════════════════════════════════════════════════════════════
STEP 4 — DO NOT in this session
═══════════════════════════════════════════════════════════════

  • Skip the validation gates kill-switch (>1% rejection → STOP)
  • Skip the resolver kill-switch (>30k created_new agencies → STOP)
  • Touch any of the 263,657 pre-existing source_type-NULL agency_carriers
    rows (separate decision; queued for a future session)
  • Start a second state DOI ingest (FL, CA, etc.) without explicit
    greenlight — Session C is Texas finish only
  • Build any UI work (that's SESSION_28, queued for Session D+)
  • Re-litigate the conservative-fallback NAIC decision (locked Session B)

═══════════════════════════════════════════════════════════════
STEP 5 — STANDING DISCIPLINE
═══════════════════════════════════════════════════════════════

  • Plan-before-execute: announce the 5 slices, get thumbs-up before
    Slice 1 (bulk load) and before Slice 6 (promotion to prod table).
    The other slices are mechanical SQL pastes.
  • Run advisors after Slice 6 (DDL-free but DML on prod table).
  • RLS forced on every table touched (D-006 / Principle #1)
  • Secrets never in chat — clipboard → dashboard only
  • Source-type tagging discipline: only `state_doi_tx` for these rows
  • D-017 reminder: no source attribution in `directory.*` mirrors

═══════════════════════════════════════════════════════════════

Confirm Step 0 + Step 1, then read files in Step 2 order. After reading,
propose the 5-slice plan and wait for thumbs-up before Slice 1.
```

---

— end Session C prompt —
