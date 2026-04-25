# scripts/

## load-adlist.ts

One-off + repeatable loader for AdList-style xlsx workbooks (Account / Contact /
Carriers / Affiliations / Industries sheets). Idempotent: safe to re-run on the
same file. Uses the vendor's `AccountId` as the dedup key on agencies.

### Setup (one time)

```bash
# 1. install the new deps (xlsx + tsx)
npm install

# 2. set env. Use the SERVICE-ROLE key (NOT the anon/publishable key).
#    Find it under Supabase dashboard → Project Settings → API → service_role.
#    DO NOT commit this — keep it in .env.local or your shell.
export SUPABASE_URL="https://sdlsdovuljuymgymarou.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<paste-the-service-role-jwt>"
# Optional override; defaults to the Echelon tenant.
# export TENANT_ID="ce52fe1e-aac7-4eee-8712-77e71e2837ce"
```

### Run on one file

```bash
npm run load-adlist -- "data/AdList-17019 IN.xlsx"
```

Output is per-sheet stats. Example:

```
=== AdList-17019 IN.xlsx ===
[parse] agencies=831 contacts=3561 carriers=4525 affiliations=301 sics=2639
[agencies] inserted=607 updated=224 total=831
[contacts] inserted=2811 skipped_dup=750 total=3561
[carriers] linked=4309 unmatched_ref=216 unmatched_agency=0 total=4525
[affiliations] linked=295 unmatched_ref=6 unmatched_agency=0 total=301
[sic_codes] linked=2598 unmatched_ref=41 unmatched_agency=0 total=2639
[done] AdList-17019 IN.xlsx in 14.2s
```

`unmatched_ref` = carrier/affiliation/SIC name in the file that doesn't match
any row in the corresponding reference table. We skip these silently — they're
usually new carriers we haven't loaded into the catalog yet. Add them via
`/admin/catalog` and re-run if you want them linked.

### Run on all 13 new files

```bash
npm run load-adlist -- data/AdList-17019\ *.xlsx
```

Shell expansion does the rest. Each file is independent — if one fails, the
others still run. Total expected runtime: ~3 minutes for all 13.

### What gets dedup'd, what gets updated

| Table | Dedup key | On overlap |
|---|---|---|
| `agencies` | `(tenant_id, account_id)` UNIQUE constraint | UPSERT with COALESCE — non-null fields preserved when new file has gaps |
| `contacts` | `(agency_id, lower(first_name), lower(last_name), lower(email_primary))` | INSERT new only — never overwrites |
| `agency_carriers` | `(agency_id, carrier_id)` | INSERT only, ON CONFLICT DO NOTHING |
| `agency_affiliations` | `(agency_id, affiliation_id)` | same |
| `agency_sic_codes` | `(agency_id, sic_code_id)` | same |

### After running

Open `/admin/data-quality` to verify:
- Canary leaks: should still be 0
- Agency dup clusters: may grow if the same agency appears in multiple
  regional files (legit branches), but `dup_count` for an EXISTING cluster
  should rarely jump
- Carriers/affiliations: should be unchanged (those tables are reference data)
