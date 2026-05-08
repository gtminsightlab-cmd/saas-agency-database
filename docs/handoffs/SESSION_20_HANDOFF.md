# Session 20 Handoff — DOT Intel Premium Estimator Shipped

**Date:** 2026-05-08
**Product:** DOT Intel (`dotintel2`, www.dotintel.io)
**Session type:** Continuation of session 19 (context cutoff mid-build)

---

## What shipped this session

### Premium Estimator module — live at `/dashboard/premium-estimator`

Commit `6431c8d` on `dotintel2` `main`. Vercel deploy READY in ~35s. 5 files changed:

| File | What it does |
|---|---|
| `app/dashboard/premium-estimator/layout.tsx` | Auth guard (server) + sticky header with ArrowLeft ← Dashboard, Shield icon, ThemeToggle, user email |
| `app/dashboard/premium-estimator/page.tsx` | Server page wrapper, metadata set, renders `<PremiumEstimatorForm />` |
| `components/dashboard/premium-estimator-form.tsx` | Full ~400-line client component — all estimate logic client-side |
| `supabase/migrations/20260508_premium_estimator_comparables_rpc.sql` | Sync of the RPC already applied to prod via MCP in session 19 |
| `components/dashboard/dashboard-content.tsx` | `status: "coming_soon"` → `status: "active"`, `href: "/dashboard/premium-estimator"` added |

### Form component details

- **Inputs:** Power units (number field), US state (51-entry select), haul type (button group: local/regional/otr/hazmat), authority age (select: <1yr/1-3yr/3-5yr/5+yr), safety rating (button group: satisfactory/conditional/none/unrated), coverage target (card grid: $750k/1M/2M/5M)
- **localStorage key:** `dotintel_premium_estimator_inputs` — form inputs persist across browser sessions
- **Estimate engine:** `computeEstimate()` pure client-side function. Base rate per-unit by PU band → apply state multiplier (HIGH_COST +25%, LOW_COST -15%) → coverage multiplier → safety multiplier → haul type multiplier → authority age multiplier → multiply by unit count = total annual range
- **PU bands:** 1-3 ($7k-$9.5k/unit), 4-9 ($5.5k-$7.5k), 10-25 ($4.8k-$6.5k), 26-99 ($3.8k-$5.5k), 100+ ($3.2k-$4.5k)
- **Similar Carriers panel:** calls `get_premium_estimate_comparables(p_state, p_pu_band, p_limit=6)` RPC — returns real corpus carriers with actual insurer + coverage data. Each row links to the carrier profile page.
- **Disclaimer:** "Illustrative only — not a rate quote. Actual premiums vary by driver history, equipment, loss runs, and market conditions."

### RPC applied to `vbhlacdrcqdqnvftqtin` (session 19, synced to repo this session)

```sql
CREATE OR REPLACE FUNCTION public.get_premium_estimate_comparables(
  p_state text DEFAULT NULL, p_pu_band text DEFAULT NULL, p_limit integer DEFAULT 6
)
RETURNS TABLE(dot_number bigint, legal_name text, phy_city text, phy_state text,
  power_units integer, insurer_parent text, insurer_child text,
  min_cov_amount numeric, max_cov_amount numeric, effective_date date)
```

---

## Session 19 carry-ins (already done before this session started)

- **Cloudflare Email Routing:** `info@dotintel.io` → `gtminsightlab@gmail.com` live and tested
- **Coverage amounts ETL:** 18,090 / 19,767 rows backfilled — avg ~$914k. Migration `20260507_backfill_coverage_amounts`
- **Demo walkthrough patched:** `SHOW_DEMO_QUICK_FILL` flag instructions added, coverage line corrected
- **Cloudflare MCP:** `~/.claude/settings.json` configured

---

## Post-demo carry-forwards (unchanged from session 19)

### 🔴 Pre-demo MUST-DO
- **Flip `SHOW_DEMO_QUICK_FILL = true`** in `dotintel2/components/marketing/login-form.tsx` (line 9), push, verify buttons appear at `/login`

### 🟠 Post-demo MUST-DO
- **Rotate all four demo passwords** in `vbhlacdrcqdqnvftqtin` auth.users (Agent / Underwriter / Risk Mgr / Analyst)
- **(e2) Email notification on /contact form** — Supabase DB webhook on `leads` INSERT → Resend or Sendgrid. Currently: row lands in DB, no email fires, no one knows.

### 🟡 Post-demo roadmap
- **FMCSA auto-update scheduling** — dedicated session. Options: Supabase `pg_cron` + FMCSA SAFER API poll, or Vercel cron job. Target: 4×/day refresh matching the "4x/day" stat on the dashboard landing.
- **SWR caching for carrier intelligence** — `npm install swr` + wrap data fetches. Faster repeat searches, less Supabase compute.
- **Saved views (explicit saved searches)** — `saved_views` DB table + UI. Post-demo D2 scope. localStorage already covers form persistence; this is for named saves users can share/revisit.
- **Full D2** — Distribution Intelligence + Competitive Benchmarking fully interactive. Deferred until working group feedback informs what these modules actually need to do.

---

## Repo state at handoff

| Repo | Latest `origin/main` | Notes |
|---|---|---|
| `dotintel2` | `6431c8d` | Premium Estimator live, Vercel READY |
| `saas-agency-database` | `194493a` | Session state + handoff updated this session |

---

## DOT Intel module status at handoff

| Module | Status | Route |
|---|---|---|
| Carrier Intelligence | ✅ active | `/dashboard/carrier-intelligence` |
| Distribution Intelligence | 👁 preview | `/dashboard/distribution-intelligence` |
| Competitive Benchmarking | 👁 preview | `/dashboard/competitive-benchmarking` |
| **Premium Estimator** | ✅ **active** | `/dashboard/premium-estimator` |
| Underwriter Intelligence | 🔒 coming_soon | — |
| Appetite Monitoring | 🔒 coming_soon | — |
