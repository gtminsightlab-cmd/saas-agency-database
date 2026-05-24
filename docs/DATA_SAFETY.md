# Data safety + recovery — Agency Signal

**Status:** Session E 2026-05-23 — table classification, PITR posture, recovery runbook, and defense-in-depth scripted exports landed. Two Master-O dashboard actions remain before charter outreach.

This doc is the operating reference for: what we'd lose if Supabase went down, how we'd recover, who pulls the trigger, and how to verify backups are actually restoreable.

---

## Table classification (47 tables in `public`)

Every table is classified by recovery cost. Customer-irreplaceable rows define our RPO floor.

### Tier 1 — CUSTOMER-IRREPLACEABLE (must be in PITR window + logical backups)

These tables hold rows that cannot be re-computed from any external source. Losing them = a billing-disputable, customer-facing data-loss incident.

| Table | Why irreplaceable | Approx rows |
|---|---|---|
| `tenants` | Tenant org records — FK target across the schema | 1 (today) |
| `app_users` | User accounts linked to `auth.users` via email trigger | 3 |
| `stripe_customers` | Stripe customer ID linkage — losing this orphans every paying subscription | 2 |
| `billing_plans` | Plan definitions (Stripe price IDs, features) | 3 |
| `user_entitlements` | Per-user paid entitlement state | 2 |
| `credit_wallets` | Current credit balances — direct money | 2 |
| `credit_ledger` | Credit transactions (deposits, spends) — SOX-grade audit trail | 0 (pre-revenue) |
| `usage_logs` | Usage history feeding billing | 33 |
| `downloads_ledger` | Download history feeding billing + audit | 0 |
| `saved_lists` | User-created lists — customer IP | 3 |
| `saved_list_snapshots` | Point-in-time snapshots for change detection (Pillar 6) | 0 |
| `saved_list_changes` | Change-detection diff records | 0 |
| `distribution_expander_segments` | Enterprise+ saved segments | 0 |
| `top_agency_lists` + `top_agency_members` | Featured curation work | 2 + 201 |
| `audit_log` | SOC 2 audit trail (trigger-populated) | 1,317 |
| `tenant_limits` | Per-tenant cap overrides — billing/usage input | 4 |
| `feature_flags` | Product flags — operational state | 8 |
| `hygiene_events` | Data quality decisions (operator audit trail) | 0 |
| `saved_list_hygiene_flags` | Per-list hygiene state | 0 |

**Total Tier-1 row count today:** ~1,400 rows. Will grow with charter outreach as customer accounts + saved-list + credit-ledger + audit-log volume scales.

### Tier 2 — DERIVED / RE-COMPUTABLE (PITR window only; logical backup nice-to-have)

These tables can be re-ingested from external source data (state DOI filings, FMCSA, etc.) if lost. Recovery is slow (hours to days for full re-ingest) but possible.

`agencies` (58,490), `contacts` (135,453), `carriers` (2,007), `agency_carriers` (631,114), `agency_sic_codes` (99,764), `agency_affiliations` (20,266), `affiliations` (106), `affiliation_aliases` (0), `carrier_verticals` (136), `agency_lines` (0), `company_lines_raw` (0).

**Note:** While these are re-computable, the practical RTO is poor — re-ingest scripts take hours and any data-quality decisions encoded in `hygiene_events` would still be needed to clean the re-ingested rows. PITR coverage is meaningfully cheaper than re-ingest.

### Tier 3 — CONFIG / LOOKUP (PITR window only; logical backup low value)

Static / slow-changing reference data. Many of these are seed data from migrations and could be re-applied via `supabase db push`.

`account_types`, `agency_management_systems`, `lines_of_business`, `sic_codes`, `vertical_markets`, `states`, `metro_areas`, `departments`, `contact_title_roles`, `management_levels`, `location_types`, `plan_bulk_tiers`, `data_dictionary_fields`, `email_domain_denylist`, `data_load_denylist`, `_trucking_load_log`.

---

## RTO / RPO targets (charter-outreach baseline)

| Tier | RPO target | RTO target | Mechanism |
|---|---|---|---|
| Tier 1 (irreplaceable) | **≤ 1 hour** | **≤ 4 hours** | Supabase PITR + nightly logical export |
| Tier 2 (derived) | ≤ 24 hours | ≤ 48 hours | Supabase PITR + re-ingest as fallback |
| Tier 3 (config/lookup) | ≤ 24 hours | ≤ 24 hours | PITR + migration replay |

**RPO** = maximum acceptable data loss measured in time
**RTO** = maximum acceptable recovery time

Charter Member SLA shouldn't promise tighter than RPO ≤ 1h / RTO ≤ 4h until we've drilled the procedure end-to-end and confirmed the numbers hold.

---

## Master-O dashboard actions (BEFORE charter outreach)

### Action 1 — Confirm Supabase plan tier
The `seven16group` project (ID: `sdlsdovuljuymgymarou`, region: `us-east-1`, Postgres 17.6.1.105) must be on the **Pro plan or higher** for PITR to be available.

1. Supabase dashboard → Project → Settings → Billing
2. Confirm plan = Pro (or higher). If on Free: upgrade.
3. **Why this matters:** Free tier offers only daily backups with 7-day retention. Restore is full-project rollback, lossy, no point-in-time precision. Pro tier offers true PITR with sub-minute precision.

### Action 2 — Enable Point-in-Time Recovery
1. Supabase dashboard → Project → Settings → Database → Backups → **Point in Time Recovery**
2. Toggle on. Default retention = 7 days (charter-baseline acceptable).
3. **Why this matters:** Without PITR, the only recovery is to a daily backup snapshot — minimum 24h of data loss in any incident.

### Action 3 (optional but recommended) — Branching for safe recovery drill
Supabase Branching (database branch off current state) lets you do a real recovery drill without touching production data. Helps validate the RTO target.

1. Supabase dashboard → Project → Branches → Create branch
2. Run the verification SQL from `scripts/data-safety/verify-critical-tables.sql` against the branch
3. Tear down the branch when done

---

## Defense-in-depth: scheduled logical export of Tier-1 tables

Even with PITR, a logical export of Tier-1 tables to a separate location is the right defense against scenarios PITR can't solve:
- Supabase project-level catastrophic loss (extremely rare but possible)
- Operator-error that propagates into PITR window (e.g., a DROP TABLE within retention window before anyone notices)
- Compliance audit asks "show me the row state as of date X" — easier to grep an export than restore PITR

**Script:** `scripts/data-safety/export-tier1.ts` (Session E)

Runs `psql COPY ... TO STDOUT` for each Tier-1 table, writes JSONL files to `./backups/<date>/`. Designed to be invoked manually for now (Session E delivers the script + procedure); future automation via Vercel Cron or external scheduler.

**Manual run (operator):**
```bash
SUPABASE_SERVICE_ROLE_KEY=<key> npm run export-tier1
```

**Output layout:**
```
./backups/2026-05-23T12-00-00/
  tenants.jsonl
  app_users.jsonl
  stripe_customers.jsonl
  billing_plans.jsonl
  ...
  _manifest.json    # row counts + checksums per table
```

The manifest enables quick verification: compare to the live `SELECT count(*)` on each table to confirm the export captured what's there.

---

## Recovery procedures

### Scenario A — Single bad migration / accidental UPDATE without WHERE
**Symptom:** A migration or admin SQL modified more rows than intended. Damage detected within PITR window.

**Recovery (Master O at the keyboard):**
1. Identify the exact timestamp the bad change landed (check `audit_log` or `supabase db diff`)
2. Supabase dashboard → Project → Database → Backups → PITR → Restore to timestamp T-1 minute
3. Choose: in-place restore (live downtime) OR restore to a new project for spot-recovery of specific rows
4. For Tier-1 row recovery, prefer restore-to-new-project then `pg_dump` the affected tables and re-insert into prod

**RTO estimate:** 1-4 hours

### Scenario B — Catastrophic project loss
**Symptom:** Supabase project unreachable, region outage, or platform-wide incident.

**Recovery:**
1. Wait for Supabase platform recovery if it's a regional outage (their RTO SLA applies)
2. If recoverable but in unknown state: use Tier-1 logical exports to seed a new project
3. Re-deploy Vercel app pointing at new project (update `NEXT_PUBLIC_SUPABASE_URL`)
4. Re-apply migrations via `supabase db push` to rebuild schema
5. Re-import Tier-1 data from latest logical export
6. Re-ingest Tier-2 data from source feeds (slow — multiple hours)

**RTO estimate:** 8-24 hours (worst case for catastrophic loss).

### Scenario C — Single customer asks for data export (GDPR / contract termination)
**Symptom:** Charter Member asks for their data on departure.

**Recovery:**
1. Identify their `tenant_id` from `tenants`
2. Run a tenant-scoped export script (TODO: write this when first charter member onboards — out of Session E scope)
3. Deliver as a ZIP of JSONL files

---

## Verification (post-Action-1 + Action-2)

After Master O completes Actions 1 + 2, confirm PITR is actually working:

1. Supabase dashboard → Database → Backups → PITR should show "Available" with a retention window (e.g., "Earliest restore point: 2026-05-16 12:00 UTC")
2. Run the Tier-1 export script manually to confirm it works:
   ```bash
   npm run export-tier1
   ```
3. Confirm `./backups/<latest>/_manifest.json` shows non-zero row counts for `tenants`, `app_users`, `billing_plans`, `audit_log`

---

## Follow-up tightening (out of Session E scope)

- **Automate Tier-1 export via Vercel Cron** (nightly + offload to S3 or R2 for off-platform redundancy)
- **Add row-count drift alert** that fires when Tier-1 table row count changes by > 10% in 24h (catches accidental mass-delete)
- **Build tenant-scoped export script** for first GDPR / contract-termination request
- **Drill the recovery procedure quarterly** with Master O + document the actual measured RTO/RPO
- **Add a Supabase webhook** that listens for `DROP TABLE` / `DELETE FROM tier_1_table` events and pages immediately

---

## Env var reference

| Env var | Purpose | Where set |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Vercel Prod + Preview + Dev |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (RLS-bounded) | Vercel + local |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — Tier-1 export needs this | Vercel Prod ONLY + local for exports |
| (No new env vars for Session E) | | |
