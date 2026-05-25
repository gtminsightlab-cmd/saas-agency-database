# SESSION_38 opener — paste-ready

Read in this order:
1. [`docs/BACKLOG.md`](../BACKLOG.md)
2. [`docs/handoffs/SESSION_37_HANDOFF.md`](SESSION_37_HANDOFF.md) + [`SESSION_37_ADDENDUM_widget_fixes.md`](SESSION_37_ADDENDUM_widget_fixes.md) (most recent)
3. [`docs/handoffs/SESSION_36_HANDOFF.md`](SESSION_36_HANDOFF.md) (domain cutover choreography lives here)
4. [`docs/WORKING_AGREEMENT.md`](../WORKING_AGREEMENT.md)

## State at SESSION_38 open

- **PR #8 MERGED 2026-05-25** as `df4e835`. Production main is now serving design system v1 + widget Stage 2 (with the SESSION_37 addendum fixes) + compliance pages.
- Vercel production deploy `dpl_8EPG8sdSkmrkEsZSRMUrE6aPFUiz` READY at `directory.seven16group.com`.
- Branch `feat/design-system-v1` deleted from origin.

## Active arc

**Domain cutover: `directory.seven16group.com` → `agencysignal.co`** — unblocked now that PR #8 is merged. Estimated ~30-60 min focused.

**Sanity check before starting** (paste into PowerShell from repo root):

```powershell
git fetch origin main; git log origin/main --oneline -3
```

Expected: `df4e835` (PR #8 merge) at HEAD or shortly behind. If anything looks off, stop and ask Master O before touching DNS.

## Side arc to verify in passing

Confirm last night's 04:00 UTC cron fired under the SESSION_37 new EF auth architecture:

## SESSION_37 cron-verification carry-forward

Confirm last night's 04:00 UTC cron fired successfully under the new EF auth architecture:

```sql
SELECT COUNT(*) AS snapshot_count, MAX(created_at) AS latest_snapshot
FROM public.saved_list_snapshots;
```

Expected post-04:00 UTC 2026-05-26: `snapshot_count >= 6` (3 lists × ≥2 runs) and `latest_snapshot` within last 24h. Also check Supabase EF logs (`get_logs(service: edge-function)`) — expect at least one 200 entry near 04:00 UTC.

If cron failed → diagnose. Code is at [`app/api/cron/saved-lists-refresh/route.ts`](../../app/api/cron/saved-lists-refresh/route.ts) (Vercel) + [`supabase/functions/recompute-saved-lists/index.ts`](../../supabase/functions/recompute-saved-lists/index.ts) (Supabase EF v3). The two env vars are `CRON_SECRET` (Vercel) and `EDGE_FN_AUTH_SECRET` (both Vercel + Supabase EF).

## Domain cutover choreography (recap from SESSION_36)

1. **Cloudflare DNS** — add A/CNAME records `agencysignal.co` → Vercel via Cloudflare MCP. Show records before apply.
2. **Vercel** — add `agencysignal.co` as production domain on `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV`. Wait for cert provisioning.
3. **Stripe webhook re-register** — new endpoint URL `agencysignal.co/api/stripe/webhook`. Sign new secret. Rotate `STRIPE_WEBHOOK_SECRET` in Vercel via clipboard-grab (Sensitive). Keep old endpoint live for 24h overlap.
4. **Cloudflare Turnstile** — already has `agencysignal.co` as hostname per Session D. No change.
5. **301 redirects** — `directory.seven16group.com/*` → `agencysignal.co/*` via [`next.config.mjs`](../../next.config.mjs) `redirects()` (reviewable in git, vs Vercel project-level).
6. **Marketing copy scrub** — grep + edit `directory.seven16group.com` inline mentions. `/charter` page notably; check others.
7. **Memory + docs scrub** — update [`reference_directory_admin_project_paths.md`](C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\reference_directory_admin_project_paths.md) + `.support/` knowledge base.
8. **`docs/context/FAMILY_HEALTH.md`** — refresh AS row.

**Risk to weigh upfront:** Stripe webhook rotation has a ~1-minute exposure window. Mitigation: register new endpoint first, verify with test event, decommission old after 24h.

## Master O dashboard cleanups (~5 min, can do during cutover wait states)

- Add `EDGE_FN_AUTH_SECRET` to Vercel Preview env (CLI rejects preview adds per memory; dashboard only). Same 64-char value as Production.
- (Optional) Rotate Vercel Preview `SUPABASE_SERVICE_ROLE_KEY` from sb_secret_* → legacy JWT to match Production.
- (Optional) Delete Vercel `SENTRY_AUTH_TOKEM` typo env var.

## Standing recommendation

Lead with cutover. PR #8 merge unlocks it. Domain cutover before charter outreach scales beyond hand-picked cohort. Memory + docs scrub in same session — don't leave URL drift behind.
