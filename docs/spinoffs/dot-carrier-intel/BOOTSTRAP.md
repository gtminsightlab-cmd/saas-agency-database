# DOT Carrier Intelligence — Project Bootstrap

**Origin:** Seven16 Agency Directory (`saas-agency-database` repo, Supabase `sdlsdovuljuymgymarou`)
**Created:** 2026-04-27 by Master O + Claude during session 12 closeout
**Working name:** TBD — Master O to decide. Suggestions: `dotcarrier-intel`, `truckiq`, `fleet-signal`, `usdot-leads`. Avoid `dotintel` (already taken — see §1.5).

---

## 1. What this project is

A FMCSA-data-backed B2B SaaS with **three distinct products on one platform**:

### Product A — Insurance professional lookup ($20-35/mo + download tiers)
Underwriters / agents / brokers research USDOT motor carriers for submission packets.
- **Job-to-be-done:** "I need to underwrite this trucker — pull their last 24 months of SMS scores, authority status, insurance filings, MCS-150 update, crash/inspection counts, and print a clean submission packet."
- **Pricing:** $20-35/mo entry tier (lookups + ~100 printable DOT files/month). $99/mo Pro (500 files/month). 1x-pull and overage pricing alongside.

### Product B — DOT carrier self-service ($10-20/mo)
Trucking fleet operators / owner-ops check their own DOT status and get alerted to changes.
- **Job-to-be-done:** "I'm a trucker — is my MC# still active, is my insurance current, do I have any recent CSA score changes I should know about, when does my MCS-150 expire?"
- **Pricing:** $10-20/mo. Likely free tier with one USDOT lookup; paid tier adds alerts + history + score forecasting.
- **Onboarding twist:** tenant maps to a single USDOT — needs claim/verify ownership flow (e.g., MCS-150 PIN, FMCSA email-on-file, or manual review).

### Product C — Lead-gen for small trucking & non-fleet ($TBD, probably mirrors Seven16's freshness tiers)
Sales/marketing teams target owner-ops, small fleets, and specific commodity hauliers.
- **Job-to-be-done:** "Build me a list of 1-5 power-unit hazmat carriers in the southeast that updated MCS-150 in the last 90 days."
- **Pricing:** Defer to first-round modeling. Seven16's $99 Growth Member / $125 Snapshot pattern likely transfers.

### 1.5. Scope question to settle on day 1
**Is this a NEW repo/Supabase project, or a NEW product surface inside the existing DOTINTEL platform?**

DOTINTEL (`vbhlacdrcqdqnvftqtin`) already does trucking-insurance attribution (which insurance company writes which trucking fleet) using the four-zone raw/staging/master/activation architecture and the FMCSA feeds. The new ask overlaps on **the same FMCSA core data** but adds three new product surfaces with different ICPs and pricing.

**Recommendation:** New repo + new Supabase project. Reasons:
- Different ICPs need different auth, billing, RLS profiles
- DOTINTEL has hard rules (no embedded sample data, premium=illustrative, etc.) that may not all apply to the new product surfaces
- Cleaner brand separation for marketing
- BUT: pull FMCSA data via shared ingestion pipeline (don't duplicate the SAFER load)

**Counter-recommendation:** If DOTINTEL's data lake already has SAFER fully ingested + entity-resolved, just add product surfaces inside DOTINTEL. Faster to ship, harder to brand and price separately.

Decide before writing any code.

---

## 2. Infrastructure stack — inherit verbatim from Seven16

| Layer | Choice | Source |
|---|---|---|
| Frontend | Next.js 14 App Router | seven16 |
| Hosting | Vercel | same team `team_RCXpUhGENcLjR2loNIRyEmT3` |
| DB + Auth + Storage | Supabase | NEW project (don't reuse `sdlsdovuljuymgymarou`) |
| Billing | Stripe | NEW account or new product subset of existing |
| DNS | Cloudflare | new subdomain |
| Repo | GitHub `gtminsightlab-cmd/<name>` | NEW |
| CI/CD | Vercel auto-deploy on push to main | identical |

**Long-term clone fix from day 1 (don't repeat Seven16's mistake):** put the working clone at `C:\Users\GTMin\Projects\<repo-name>\`, NOT inside OneDrive. Run `gh auth login` once on Master O's Windows side. The Seven16 repo broke its `.git` because OneDrive sync mangles git internals — this is fixable by simply not putting the repo inside OneDrive.

---

## 3. Reusable code modules — port wholesale

These don't change between projects. Copy them as-is, swap entity names, ship.

| Module | Seven16 location | Notes |
|---|---|---|
| Auth + sign-up | `app/sign-up/*`, `lib/supabase/*` | Email-prefill flow worth keeping |
| Multi-seat invitations | migration `0055`, `app/team/*` | RPCs `invite_team_member`, `revoke_invite`, `list_my_team`, `get_my_seat_info` |
| Stripe billing | `app/api/billing/*`, webhook handler | Map plan IDs to new tiers |
| Admin control center | `app/admin/*` | 13-module sidebar — pick which modules apply (Catalog editor, Hygiene/Canary editor, Data engine upload, Data quality, Alerts all transfer) |
| Build-list / review / downloads | `app/build-list/*`, `app/downloads/*` | Server-side RPCs for filter overflow — see commit `2349604` (the Safeco fix) |
| Saved lists | `app/saved-lists/*` | `saved_lists` + `saved_list_items` tables |
| Recent searches | migration `0047` (pg_trgm), `get_my_recent_searches` RPC | UI in `app/ai-support/*` |
| Canary scrub | `data_load_denylist` table + `scripts/load-adlist.ts` scrubAgency/scrubContact | DOT vendor data has different canaries — start with empty denylist + add as discovered |
| Cross-tenant analytics | SECURITY DEFINER RPC pattern | Seven16's `get_top_carriers_by_agency_count` is the template — exposes only aggregates, never rows |
| Locked-preview for anon | commit `93548b8` | KPI strip + blurred top-10 + sign-up CTA overlay |
| Strong-match search | pg_trgm + normalized name lookups | DOT carrier names are typed many ways too — same fix |
| Materialized views + concurrent refresh | `mv_vertical_summary` pattern | Use for SMS aggregates / fleet-size bands / commodity counts |
| Multi-tenant + RLS pattern | every Seven16 migration | tenant_id NOT NULL on every row, RLS on every table including partition children |

---

## 4. Schema starter — DOT-specific entity layer

These tables are the **NEW** parts. They replace Seven16's `agencies`/`carriers`/`agency_carriers` triad with the FMCSA equivalent.

```sql
-- Core entity: USDOT-numbered motor carriers
CREATE TABLE motor_carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,                          -- multi-tenant pattern from seven16
  usdot_number bigint NOT NULL,                     -- the canonical FMCSA key
  mc_number text,                                   -- MC-XXXXXX (operating authority)
  mx_number text,                                   -- Mexico-domiciled
  ff_number text,                                   -- freight forwarder
  legal_name text NOT NULL,
  dba_name text,
  mailing_address_1 text,
  mailing_address_2 text,
  mailing_city text,
  mailing_state text,
  mailing_postal_code text,
  mailing_country text DEFAULT 'US',
  physical_address_1 text,
  physical_address_2 text,
  physical_city text,
  physical_state text,
  physical_postal_code text,
  physical_country text DEFAULT 'US',
  phone text,
  fax text,
  email text,
  power_units integer,                              -- truck count
  drivers integer,
  carrier_operation text,                           -- interstate / intrastate hazmat / intrastate non-hazmat
  hazmat_flag boolean DEFAULT false,
  passenger_carrier_flag boolean DEFAULT false,
  household_goods_flag boolean DEFAULT false,
  usdot_status text,                                -- ACTIVE / OUT_OF_SERVICE / INACTIVE
  out_of_service_date date,
  mcs150_last_update date,                          -- 2-year update cadence, drives staleness alerts
  duns_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, usdot_number)
);
ALTER TABLE motor_carriers ENABLE ROW LEVEL SECURITY;

-- Operating authority filings (M:N — common/contract/broker/forwarder)
CREATE TABLE carrier_authorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  motor_carrier_id uuid NOT NULL REFERENCES motor_carriers(id) ON DELETE CASCADE,
  authority_type text NOT NULL,                     -- COMMON / CONTRACT / BROKER / FREIGHT_FORWARDER
  authority_status text NOT NULL,                   -- ACTIVE / OUT_OF_SERVICE / REVOKED / PENDING
  effective_date date,
  out_of_service_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE carrier_authorities ENABLE ROW LEVEL SECURITY;

-- Insurance filings (BMC-91 = liability, MCS-90 = endorsement, BMC-32 = cargo, BOC-3 = process agent)
CREATE TABLE carrier_insurance_filings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  motor_carrier_id uuid NOT NULL REFERENCES motor_carriers(id) ON DELETE CASCADE,
  filing_type text NOT NULL,                        -- BMC-91 / MCS-90 / BMC-32 / BOC-3 / BMC-91X
  insurance_company_name text,
  policy_number text,
  coverage_from date,
  coverage_to date,
  filing_status text,                               -- ACTIVE / CANCELLED / REJECTED
  effective_date date,
  cancellation_date date,
  cancellation_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE carrier_insurance_filings ENABLE ROW LEVEL SECURITY;

-- SMS BASIC scores (point-in-time snapshots; preserve history for trend analysis)
CREATE TABLE safety_metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  motor_carrier_id uuid NOT NULL REFERENCES motor_carriers(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  unsafe_driving_pct numeric,                       -- BASIC percentile 0-100
  unsafe_driving_above_threshold boolean,
  hos_compliance_pct numeric,
  hos_compliance_above_threshold boolean,
  driver_fitness_pct numeric,
  driver_fitness_above_threshold boolean,
  controlled_substances_pct numeric,
  controlled_substances_above_threshold boolean,
  vehicle_maintenance_pct numeric,
  vehicle_maintenance_above_threshold boolean,
  hazmat_compliance_pct numeric,
  hazmat_compliance_above_threshold boolean,
  crash_indicator_pct numeric,
  crash_indicator_above_threshold boolean,
  inspection_count_24mo integer,
  crash_count_24mo integer,
  fatal_crash_count_24mo integer,
  injury_crash_count_24mo integer,
  towaway_crash_count_24mo integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, motor_carrier_id, snapshot_date)
);
ALTER TABLE safety_metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- Cargo classification reference (FMCSA standard list — household goods, general freight, hazmat, etc.)
CREATE TABLE cargo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  category text                                     -- bulk / household / freight / hazmat / specialty
);

-- M:N: which cargo types each carrier hauls
CREATE TABLE carrier_cargo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  motor_carrier_id uuid NOT NULL REFERENCES motor_carriers(id) ON DELETE CASCADE,
  cargo_code_id uuid NOT NULL REFERENCES cargo_codes(id),
  source text DEFAULT 'mcs150',                     -- mcs150 / inferred / manual
  UNIQUE (motor_carrier_id, cargo_code_id)
);
ALTER TABLE carrier_cargo ENABLE ROW LEVEL SECURITY;

-- Saved lists / downloads / quotas — port from seven16 with motor_carrier_id swap
-- ... (see seven16 migrations 0033-0046 for the templates)
```

**Indexes worth adding day 1** (lessons from Seven16):
- `(tenant_id, usdot_number)` UNIQUE — already in DDL
- pg_trgm GIN on `legal_name` and `dba_name` for strong-match search
- `(tenant_id, mailing_state)` for geo filters
- `(tenant_id, power_units)` partial on `WHERE power_units IS NOT NULL` for fleet-size bands

**Power-unit bands (for lead-gen segmentation)** — match DOTINTEL's existing convention if going hybrid, or define fresh:
- 1 PU (owner-op)
- 2-5 (micro-fleet)
- 6-14 (small)
- 15-50 (mid)
- 51+ (large; this is the credential gate in DOTINTEL)

---

## 5. Pricing tier table (translates Master O's verbal pricing into billing_plans)

```
plan_code             | label                          | monthly_price | downloads_per_month | features_json
----------------------+--------------------------------+---------------+---------------------+--------------
free_carrier_self     | Free DOT Self-Lookup           | 0             | 0                   | { "alerts": false, "history_days": 30 }
paid_carrier_self     | DOT Self-Service               | 15            | 0                   | { "alerts": true, "history_days": 365, "mcs150_reminder": true }
ins_pro_lookup        | Insurance Pro Lookup           | 30            | 100                 | { "submission_pdf": true, "search_unlimited": true }
ins_pro_pro           | Insurance Pro Pro              | 99            | 500                 | { "submission_pdf": true, "search_unlimited": true, "saved_lists": 50 }
leadgen_starter       | Lead-Gen Starter               | TBD           | TBD                 | { ... }
leadgen_growth        | Lead-Gen Growth                | TBD           | TBD                 | { ... }
overage_pull          | 1x DOT Pull                    | 2.00 each     | 1                   | { "overage": true }
```

Quotas tracked in a `download_quota_usage` table keyed on `(tenant_id, period_start)` with a monthly partition. Reset monthly via a cron / Supabase scheduled function.

---

## 6. Data sources — start lean, expand as customers ask

| Source | Cost | Provides | Refresh cadence |
|---|---|---|---|
| FMCSA SAFER (public) | Free | Carrier registration, authority status, insurance filings, MCS-150 dates, basic safety counts | Daily snapshot |
| FMCSA SMS (public) | Free | BASIC scores, inspection/crash time series | Monthly |
| FMCSA Census | Free | Bulk download of all carriers | Monthly bulk + daily delta |
| FMCSA L&I (Licensing & Insurance) | Free | Real-time insurance filing status | Daily |
| MCMIS (subscription) | Paid | More granular safety + audit data | Quarterly snapshot |
| 3rd-party enrichment | Paid | Email, decision-makers, fleet equipment VINs | Monthly |

Master O confirmed start with **FMCSA SAFER only**. Build the ingestion pipeline so adding SMS/Census/L&I later is a config change, not a rebuild.

---

## 7. Operating doctrine — INHERITED VERBATIM from Seven16

These are not Seven16-specific — they're Master O-specific. Copy these memory files into the new project's session context (or just leave them in Master O's persistent memory):

- `feedback_operating_context.md` — plugins (Supabase/Vercel/Stripe/Cloudflare/Bash) try first; Master O = last resort; comms = explain like 5
- `feedback_explain_like_5.md` — numbered steps, paste-ready commands, no jargon
- `feedback_handoff_quality.md` — exhaustive 12-section handoffs, never thin
- `reference_git_repo_state.md` — adapt for new repo (working clone OUTSIDE OneDrive from day 1)
- `feedback_canaries_and_dedupe.md` — applies; build the denylist as canaries are discovered
- `feedback_onedrive_atomic_writes.md` — applies if any OneDrive workflow
- `feedback_sandbox_no_github_creds.md` — applies; fresh PAT each session
- `feedback_cancelled_means_closed.md` — applies always
- `feedback_carrier_search_strong_match.md` — applies; DOT carrier names are typed inconsistently (e.g., "ABC Trucking" / "A.B.C. Trucking LLC" / "abc transport inc")
- `feedback_pricing_and_data_strategy.md` — placeholder strategy; don't push pricing/scale claims until data inventory catches up

**Plus one DAY-1 lesson learned from Seven16:**
- Working clone OUTSIDE OneDrive from minute zero. `C:\Users\GTMin\Projects\<repo-name>\`. Run `gh auth login` on Master O's Windows side. Don't repeat the broken-`.git`-in-OneDrive saga.

---

## 8. Day-1 / Week-1 / Month-1 checklist

### Day 1
- [ ] Decide §1.5 — new repo or DOTINTEL extension?
- [ ] Working name (renames `<name>` placeholders below)
- [ ] Create new GitHub repo `gtminsightlab-cmd/<name>` (or branch off DOTINTEL)
- [ ] Create new Supabase project (or skip if extending DOTINTEL)
- [ ] Clone fresh to `C:\Users\GTMin\Projects\<name>\` — NOT OneDrive
- [ ] `gh auth login` once
- [ ] Connect new Vercel project to repo — same team
- [ ] DNS: pick subdomain pattern (e.g., `truckiq.seven16group.com` or own domain)

### Week 1
- [ ] Port auth + multi-seat invitations from Seven16 (migration 0055 equivalent)
- [ ] Port Stripe billing + webhook handler; create the 5 plans in §5
- [ ] Create the schema in §4 as migration `0001_carriers_core.sql`
- [ ] Build the FMCSA SAFER ingestion edge function (Supabase) — pull weekly delta into `motor_carriers` and `safety_metrics_snapshots`
- [ ] Port admin control center skeleton (Catalog editor, Hygiene/Canary editor, Data engine, Data quality, Alerts) — drop modules that don't apply
- [ ] Port marketing nav + landing page; rewrite copy for the three ICPs

### Month 1
- [ ] Three product surfaces live (or feature-flagged):
  - `/lookup/<usdot>` — insurance pro tier
  - `/me/dot-status` — carrier self-service tier
  - `/build-list` — lead-gen tier (mostly ports from Seven16)
- [ ] Stripe checkout → tier provisioning → quota enforcement
- [ ] Submission PDF generator for insurance pros (template + downloadable per DOT)
- [ ] Materialized view `mv_carrier_summary` (counts, latest snapshot, recent crashes/inspections)
- [ ] Soft launch to 5 design-partner customers (1 per ICP × 1-2)

---

## 9. Opening prompt for session 1 of the new project

Paste this verbatim at the start of session 1:

```
I'm Master O. New project: <name>. It's a DOT motor carrier intelligence
platform with 3 products on one platform:
  1. Insurance pro lookup ($30-99/mo + downloads)
  2. DOT carrier self-service ($10-20/mo)
  3. Lead-gen for small trucking ($TBD)

Data spine: FMCSA SAFER for now.

FIRST STEPS (do silently before anything else):

1. Read C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency
   Database\docs\spinoffs\dot-carrier-intel\BOOTSTRAP.md end-to-end. It's
   the customization map from Seven16.
2. Read your memory: feedback_operating_context.md, reference_git_repo_state.md,
   feedback_explain_like_5.md, feedback_handoff_quality.md,
   feedback_carrier_search_strong_match.md, feedback_canaries_and_dedupe.md.
3. Health check:
   - bash sandbox: which python3; python3 -c "import pandas, openpyxl; print('ok')"
4. Apply the operating context: plugins-first (Supabase/Vercel/Stripe/Cloudflare/
   Bash), I'm last resort, explain like I'm 5 if I have to click anything.

DAY-1 DECISION I OWE YOU FIRST:
Is this a new repo + new Supabase, or an extension inside DOTINTEL?
Wait for my answer before scaffolding anything.
```

---

## 10. What lives back at Seven16 (cross-references)

When the new project's session 1 starts, these Seven16 artifacts are the template library to crib from. All on the public repo at `https://github.com/gtminsightlab-cmd/saas-agency-database`:

- Multi-seat: migration `0055`, `app/team/*`, RPCs `invite_team_member` / `revoke_invite` / `list_my_team` / `get_my_seat_info`
- Stripe: webhook handler in `app/api/stripe/webhook/route.ts`, plan provisioning at sign-up
- Locked preview for anon: commit `93548b8`
- Server-side filter overflow fix: commit `2349604` (Safeco fix)
- Multi-carrier cross-file dedup pattern: SESSION_12_HANDOFF.md §10 (lesson learned)
- Canary scrub + denylist: `data_load_denylist` table + `scripts/load-adlist.ts` scrubAgency()
- Strong-match search: pg_trgm migration `0047` + `get_my_recent_searches` RPC
- 4-zone data architecture: DOTINTEL skill `supabase-steward` (raw → staging → master → activation)
- Admin control center: `app/admin/*` (13 modules — most transfer)

---

## 11. Open questions / decisions Master O still owes

1. **Project name** (working: pick one, settle the GitHub/Vercel/Supabase naming)
2. **§1.5 — separate repo or DOTINTEL extension** (recommend separate)
3. **Carrier self-service ownership verification** — MCS-150 PIN? Email-on-file? Manual review?
4. **Lead-gen pricing ($TBD)** — model after Seven16's $99 Growth or different?
5. **Submission PDF spec** — what fields do insurance underwriters need on the printable? (probably: USDOT/MC#, status, last MCS-150, last 24mo crash/inspection counts, BASIC pcts, current insurance filings, OOS dates)
6. **DNS strategy** — subdomain of seven16group.com or own domain?
7. **Brand voice** — same "no-bullshit insurance-industry-aware" tone as Seven16, or different audience?

— end of bootstrap —
