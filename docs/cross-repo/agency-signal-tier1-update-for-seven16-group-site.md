# Cross-repo prep artifact — Agency Signal Tier 1 status update for `family-security-dashboard.md`

**Source session:** Agency Signal `saas-agency-database` S39 (2026-05-26)
**Target file:** `seven16-group-site/docs/security/family-security-dashboard.md`
**Apply via:** Next `seven16-group-site` session (per Working Agreement Rule 2(b) cross-repo prep artifact pattern — Repo A writes a prep artifact in its own tree; the next Repo B-owned session paste-applies).

---

## What to update in the dashboard

Agency Signal Tier 1 security migration **APPLIED + VERIFIED** in S39. The dashboard's per-product row for Agency Signal should flip from "punch list ready" → "Tier 1 LIVE".

### Row to update — Agency Signal

**Before (expected current state):**
```
| Agency Signal | sdlsdovuljuymgymarou | 📋 Punch list ready | docs/security/agency-signal-tier1-audit.md | — |
```

**After:**
```
| Agency Signal | sdlsdovuljuymgymarou | ✅ Tier 1 LIVE 2026-05-26 (S39) | docs/security/agency-signal-tier1-audit.md + supabase/migrations/0096+0097 | 0 ERROR / 32 WARN / 3 INFO |
```

### Numbers + delta to record

| Level | Before S39 | After S39 | Delta |
|---|---|---|---|
| ERROR | 0 | 0 | — |
| WARN | 90 | **32** | **−58 (−64%)** |
| INFO | 1 | 3 | +2 (intentional — RLS-on-no-policy on 2 ax_staging tables newly forced) |

### Specific lockdowns applied

- **2 ax_staging tables** (`agency_assignments` + `agency_assignments_idx`) — RLS forced + default-deny (defense-in-depth; not currently PostgREST-exposed but closes latent vector).
- **43 SECURITY DEFINER functions** locked down across 3 tiers:
  - Tier A (8 trigger fns): revoked from anon + authenticated; service_role retains via owner
  - Tier B (7 admin/cron fns): same
  - Tier C (28 authenticated-only fns): revoked from anon; authenticated retains

### NEW family-wide pattern surfaced

Agency Signal exposed a **Pattern B** for SECURITY DEFINER lockdown that DOT Intel didn't have. New family-memory entry:
[`feedback_supabase_definer_direct_anon_grant_pattern.md`](https://github.com/.../memory/feedback_supabase_definer_direct_anon_grant_pattern.md) (in family memory hub)

**Implication for the dashboard's "Lessons" section (if present):** add a one-liner about the dual-pattern recipe.

Pattern A (DOT Intel) — REVOKE FROM PUBLIC works because anon EXECUTE comes via PUBLIC inheritance:
```sql
revoke execute on function public.<fn>(<args>) from public;
grant  execute on function public.<fn>(<args>) to authenticated; -- Tier C only
```

Pattern B (Agency Signal) — direct `anon=X/postgres` grants in `pg_proc.proacl`; REVOKE FROM PUBLIC is a no-op:
```sql
revoke execute on function public.<fn>(<args>) from anon;
revoke execute on function public.<fn>(<args>) from authenticated;  -- Tier A + B only
grant  execute on function public.<fn>(<args>) to authenticated;     -- Tier C only
```

**Belt-and-suspenders recipe** (handles both patterns idempotently):
```sql
revoke execute on function public.<fn>(<args>) from public;
revoke execute on function public.<fn>(<args>) from anon;
revoke execute on function public.<fn>(<args>) from authenticated;  -- Tier A + B
grant  execute on function public.<fn>(<args>) to authenticated;    -- Tier C
```

### Family roster — what's next

Per the family `reference_family_supabase_security_baseline.md` priority order, after Agency Signal:

1. ✅ DOT Intel (Tier 1+2 LIVE — 2026-05-26)
2. ✅ Agency Signal (Tier 1 LIVE — 2026-05-26, S39)
3. ⏳ seven16-group-site (Hub + Partners) — punch list ready in own repo
4. ⏳ Bind Lab — punch list ready in own repo
5. ⏳ Seven16 Email — punch list ready in own repo
6. ⏳ Seven16 Survey / Activator — Tier 2c MANDATORY for anon-INSERT lead capture
7. ⏳ Seven16 Group Support — punch list ready in own repo
8. 🌱 Seven16 Command Center (greenfield doctrine)
9. 🌱 Bind Lab Academy (greenfield doctrine)

### Tier 2 status for Agency Signal

Tier 2 (search_path pinning + bucket review + Tier 2c env vars) **N/A on the DB side**:
- 0 `function_search_path_mutable` advisor findings — all SECURITY DEFINER fns already have search_path set
- 0 storage buckets exist
- 0 anon-INSERT RLS policies in `public` schema (signup CAPTCHA is at Supabase Auth level, SESSION_36)

Tier 2 reduces to documentation: env-var entries added to `.env.local.example` (Turnstile + Upstash + Sentry + CRON_SECRET + EDGE_FN_AUTH_SECRET + Stripe + NEXT_PUBLIC_APP_URL) so a fresh local dev clone has the full env-var roster documented.

### Carry-forward for Master O

None new from Agency Signal side. The 4 Tier 2c env vars (Turnstile + Upstash) were already provisioned in production per SESSION_36 LAUNCH_CHECKLIST.

---

## How to paste-apply this update

In the next `seven16-group-site` session:

1. Read `seven16-group-site/docs/security/family-security-dashboard.md` first.
2. Update the Agency Signal row per the "Row to update" section above.
3. Update the headline counts (e.g., "2 of 7 retrofit products applied" → reflect Agency Signal as #2).
4. Add the Pattern B lesson to the dashboard's Lessons section if present.
5. Commit + push directly to that repo's `main`.

If the dashboard format differs from what's implied above, adapt — the substantive content above (numbers, delta, Pattern B doctrine) is what matters.
