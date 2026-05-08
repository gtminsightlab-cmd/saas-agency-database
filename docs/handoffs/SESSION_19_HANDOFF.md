# Session 19 Handoff — 2026-05-07

**Theme:** DOT Intel mid-May demo prep — walkthrough patch, Cloudflare Email Routing live, coverage amounts ETL complete.

**Predecessor:** [`SESSION_18_HANDOFF.md`](SESSION_18_HANDOFF.md) — all three demo blockers (a/b/c) closed.

---

## Where things stand at end of session

### Live URLs

| URL | What | State |
|---|---|---|
| https://www.dotintel.io | DOT Intel marketing + demo dashboard | ✅ HTTP 200, coverage amounts now on carrier profiles |
| https://staging.thresholdiq.io | Threshold IQ staging (other session) | ✅ HTTP 200 (untouched) |
| https://directory.seven16group.com | Agency Signal | ✅ HTTP 200 (untouched) |

### Key repos and HEADs

| Repo | HEAD at end of session | Working clone |
|---|---|---|
| `gtminsightlab-cmd/dotintel2` | `a713077` — feat(data): backfill coverage amounts from inshist_raw JSONB | `C:\Users\GTMin\Projects\dotintel2\` |
| `gtminsightlab-cmd/saas-agency-database` | `194493a` — docs(walkthrough): revert softened coverage line — amounts now populated | `C:\Users\GTMin\Projects\saas-agency-database\` |
| `gtminsightlab-cmd/seven16-distribution` | `fe2381d` (Threshold IQ — untouched) | `C:\Users\GTMin\Projects\seven16-distribution\` |
| `gtminsightlab-cmd/dotintel-intelligence` | `d302a3a` (parked) | `C:\Users\GTMin\Projects\dotintel-intelligence\` |

---

## Chronological log (today)

### 1. Walkthrough patch — quick-fill flag instructions

Demo walkthrough at `saas-agency-database/docs/playbooks/dotintel_demo_walkthrough.md` updated:
- New "Before you run this checklist" block explaining the `SHOW_DEMO_QUICK_FILL` flag flip (true before demo, false after).
- Step 2 updated to reflect that buttons are hidden until the flag is on.
- Known Limitations `/contact` item corrected — form is live as of session 18 (c), only email notification is missing.
- Demo accounts note updated to reference the flag.

Commit `f7c6f21` (`saas-agency-database`).

### 2. Cloudflare MCP setup attempt

Attempted to install the Cloudflare MCP via `claude mcp add --transport http cloudflare https://mcp.cloudflare.com/mcp`. Command not recognized in standalone cmd.exe (not the Claude Code integrated terminal). Wrote config directly to `C:\Users\GTMin\.claude\settings.json` instead:

```json
{
  "mcpServers": {
    "cloudflare": {
      "type": "http",
      "url": "https://mcp.cloudflare.com/mcp"
    }
  }
}
```

User restarted Claude Code. OAuth flow opened in browser but hit "error fetching accounts" — resolved by logging into dash.cloudflare.com first, then retrying authorization. MCP config is now in place. **Note:** Cloudflare tools did not surface as available tools in this session — may need a fresh conversation to activate. Will be useful for future sessions (DNS management across dotintel.io, agencysignal.co, thresholdiq.io).

### 3. (e1) Cloudflare Email Routing — info@dotintel.io live

Walked Master O through Cloudflare dashboard:
1. dotintel.io zone → Email → Email Routing
2. "Get started" screen showed 3 MX + 2 TXT records missing — clicked "Add records and enable". Cloudflare added all automatically.
3. Routing rules → Create address: `info` @ `dotintel.io` → `gtminsightlab@gmail.com` (note: gmail, not outlook — user confirmed correct).
4. Rule showed Active immediately (gmail was already a verified destination address in the account).
5. Test email sent → confirmed delivered to gtminsightlab@gmail.com.

**Result:** `info@dotintel.io` is live. Any email sent to that address forwards to `gtminsightlab@gmail.com`. The /contact form on dotintel.io still only INSERTs into `leads` — no email notification on form submit. That's (e2), still post-demo.

Docs updated: SESSION_18_HANDOFF.md + dotintel2/docs/STATE.md corrected from `outlook.com` → `gmail.com`. Commit `2591edb` (`dotintel2`).

### 4. (f) Coverage amounts ETL — 18,090 rows populated

**Problem:** `carrier_insurance_current.min_cov_amount` / `max_cov_amount` were 0/19,767 populated. The underwriter walkthrough's "$1M/$2M coverage limits" talking point had been softened to avoid the gap.

**Investigation:**
- Confirmed data exists in `inshist_raw.raw_row` JSONB — e.g., DOT 1073091's most-recent filing: `min_cov_amount: "750"`, `max_cov_amount: "750"` = $750k.
- Values stored in thousands — multiply by 1000 for dollars.
- 2 rows have empty-string values — filtered out.

**Dry run result:**
- 19,767 total rows in carrier_insurance_current
- 18,090 rows with matching inshist_raw data (91.5% hit rate)
- 1,677 rows no match (no history data — stay at 0, acceptable)
- Average min coverage: $914k | Range: $50k–$5M

**Migration applied** (`20260507_backfill_coverage_amounts`) to `vbhlacdrcqdqnvftqtin`:

```sql
WITH latest_raw AS (
  SELECT DISTINCT ON (dot_number)
    dot_number,
    (raw_row->>'min_cov_amount')::numeric * 1000 AS min_cov_amount,
    (raw_row->>'max_cov_amount')::numeric * 1000 AS max_cov_amount
  FROM inshist_raw
  WHERE raw_row->>'min_cov_amount' != ''
    AND raw_row->>'max_cov_amount' != ''
    AND (raw_row->>'min_cov_amount')::numeric > 0
  ORDER BY dot_number, row_ingested_at DESC
)
UPDATE carrier_insurance_current cic
SET min_cov_amount = lr.min_cov_amount,
    max_cov_amount = lr.max_cov_amount,
    updated_at     = now()
FROM latest_raw lr
WHERE cic.dot_number = lr.dot_number;
```

**Verification:** DOT 1073091 → $750,000 / $750,000. Corpus avg $914k. Matches dry run exactly.

**Walkthrough updated:** "Honest things to acknowledge" table — softened coverage line replaced with "Coverage limits now populated — $750k/$750k for canonical demo carrier. Average ~$914k." Commit `194493a` (`saas-agency-database`).

Migration file synced to `dotintel2/supabase/migrations/20260507_backfill_coverage_amounts.sql`. Commit `a713077` (`dotintel2`).

---

## Commits this session

### `gtminsightlab-cmd/dotintel2` (2 commits)

| Commit | Theme |
|---|---|
| `2591edb` | docs(state): mark e1 email routing complete — info@dotintel.io live |
| `a713077` | feat(data): backfill coverage amounts from inshist_raw JSONB |

### `gtminsightlab-cmd/saas-agency-database` (2 commits)

| Commit | Theme |
|---|---|
| `f7c6f21` | docs(walkthrough): add SHOW_DEMO_QUICK_FILL flip instructions + fix /contact status |
| `194493a` | docs(walkthrough): revert softened coverage line — amounts now populated |

---

## Migrations applied

**One migration this session.** Applied to `vbhlacdrcqdqnvftqtin`.

| Migration | Name | What |
|---|---|---|
| `20260507_backfill_coverage_amounts.sql` | `backfill_coverage_amounts` | UPDATE carrier_insurance_current SET min/max_cov_amount from inshist_raw JSONB. 18,090 rows populated. |

---

## Infrastructure changes

| What | Detail |
|---|---|
| Cloudflare Email Routing — dotintel.io | MX + TXT records added. `info@dotintel.io` → `gtminsightlab@gmail.com` active. |
| `~/.claude/settings.json` created | Cloudflare MCP config added (`https://mcp.cloudflare.com/mcp`, HTTP transport). Auth completed via OAuth. Available in future sessions. |

---

## Mid-May demo readiness (updated)

| Item | Status |
|---|---|
| Sprint D0-D1 + Sprint A polish | ✅ Session 15 |
| Light Mode + chrome split | ✅ Session 16 |
| A1: "No insurance on file" KPI | ✅ Session 17 |
| Option Z: marketing reconciliation | ✅ Session 17 |
| (a) Browse Carriers force-dynamic fix | ✅ Session 18 |
| (b) Canonical demo carrier DOT 1073091 locked | ✅ Session 18 |
| (c) /contact form end-to-end verified | ✅ Session 18 |
| Quick-fill gated off public login | ✅ Session 18 (`2946e3f`) |
| Walkthrough — quick-fill flag instructions | ✅ **Session 19** |
| (e1) info@dotintel.io email routing live | ✅ **Session 19** |
| (f) Coverage amounts ETL — 18,090 rows | ✅ **Session 19** |

---

## Known issues / carry-forwards at end of session 19

| Item | Status |
|---|---|
| **(e2) Email notification on /contact form submit** | 🟡 Post-demo — Supabase DB webhook on `leads` INSERT → Resend/Sendgrid. Leads currently land silently in DB only. |
| **(d) Marketing copy "expiring coverage" framing** | 🟡 Post-demo cosmetic — `app/page.tsx` line 35 + `app/platform/page.tsx` line 66 |
| **(rotate) Demo passwords in plaintext** | 🟠 Post-demo MUST-DO — rotate all four in `vbhlacdrcqdqnvftqtin` auth.users after working group demo. DO NOT rotate before demo day. |
| **Cloudflare MCP** | 🟡 Configured in settings.json + OAuth authorized. Tools didn't surface in this session — start a fresh conversation to activate. |
| **14 Supabase security advisor findings** | 🟡 Post-demo (g) — top 3: materialized view exposure, leaked-password protection, is_tenant_member search_path |
| **Scrapers not git-tracked** | 🟡 Post-demo — `scrapers/seven16-scraper/` has no git repo |
| **(h) Pricing collaborative session** | 🟡 Threshold IQ + Growtheon + Seven16Recruit — needs Master O at keyboard |

---

## Pre-demo day checklist (flip the quick-fill flag)

**Before the working group arrives:**
1. Open `dotintel2/components/marketing/login-form.tsx`
2. Line 1: `const SHOW_DEMO_QUICK_FILL = false` → `true`
3. Commit + push. Vercel deploys in ~35s.
4. Verify buttons appear on https://www.dotintel.io/login.

**After the demo:**
- Flip back to `false`, push.
- Rotate the four demo passwords in `vbhlacdrcqdqnvftqtin` auth.users.

---

## Open questions parked (no changes from session 18)

1. Directory domain strategy (subdomains vs new TLDs) — Phase 3
2. Growtheon margin model — when building offer pages
3. Seven16Recruit attorney engagement status — before any public Recruit work
4. BDM pre-call brief in DOT Intel feature spec — when DOT Intel scoping resumes
5. MGAProducer relationship — when Seven16Recruit scoping resumes

---

— end SESSION_19_HANDOFF —
