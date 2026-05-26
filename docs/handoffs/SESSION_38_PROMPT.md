# SESSION_38 opener — paste-ready

Read in this order:
1. [`docs/BACKLOG.md`](../BACKLOG.md)
2. [`docs/handoffs/SESSION_37_HANDOFF.md`](SESSION_37_HANDOFF.md) + [`SESSION_37_ADDENDUM_widget_fixes.md`](SESSION_37_ADDENDUM_widget_fixes.md)
3. [`docs/handoffs/SESSION_36_HANDOFF.md`](SESSION_36_HANDOFF.md) (domain cutover choreography lives here)
4. [`docs/WORKING_AGREEMENT.md`](../WORKING_AGREEMENT.md)

---

## State at SESSION_38 open

- **PR #8 MERGED 2026-05-25** as `df4e835`. Production main serves design system v1 + widget Stage 2 (with the SESSION_37 addendum fixes — defensive `setOpen(false)` on mount + `display:flex/hidden` conditional className) + compliance pages.
- Vercel production deploy `dpl_8EPG8sdSkmrkEsZSRMUrE6aPFUiz` READY at `directory.seven16group.com`.
- Branch `feat/design-system-v1` deleted from origin.
- LAUNCH_CHECKLIST 9/9 GREEN (parallel session marked §A + §B done in commit `8c8d652`).
- Saved-lists cron architecture modernized (EF v3 `verify_jwt:false` + `EDGE_FN_AUTH_SECRET`). First natural production fire was 04:00 UTC 2026-05-26.

---

## Active arc — Domain cutover

**`directory.seven16group.com` → `agencysignal.co`** · ~30-60 min focused.

### Sanity check before starting

```powershell
git fetch origin main; git log origin/main --oneline -3
```

Expected: `df4e835` (PR #8 merge) at or shortly behind HEAD. If working tree has uncommitted changes (parallel sessions may have left WIP in `app/api/stripe/*` or `lib/family-integrations/`), surface to Master O before touching DNS — don't entangle.

### Cron verification (passing-check while at the CLI)

Confirm the 04:00 UTC fire under the SESSION_37 EF auth architecture:

```sql
SELECT COUNT(*) AS snapshot_count, MAX(created_at) AS latest_snapshot
FROM public.saved_list_snapshots;
```

Expected post-04:00 UTC 2026-05-26: `snapshot_count >= 6` (3 lists × ≥2 runs) and `latest_snapshot` within last 24h. Cross-check Supabase EF logs (`mcp__a7551cce-72a4-4510-a756-75884c17b895__get_logs` with `service: edge-function`) for one 200 entry near 04:00 UTC.

If cron failed → diagnose. Code refs: [`app/api/cron/saved-lists-refresh/route.ts`](../../app/api/cron/saved-lists-refresh/route.ts) (Vercel) + [`supabase/functions/recompute-saved-lists/index.ts`](../../supabase/functions/recompute-saved-lists/index.ts) (Supabase EF v3). The two env vars are `CRON_SECRET` (Vercel) and `EDGE_FN_AUTH_SECRET` (both Vercel + Supabase EF).

### Domain cutover choreography (recap from SESSION_36)

1. **Cloudflare DNS** — add A/CNAME records `agencysignal.co` → Vercel via Cloudflare MCP. Show records before apply.
2. **Vercel** — add `agencysignal.co` as production domain on `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV`. Wait for cert provisioning.
3. **Stripe webhook re-register** — new endpoint URL `agencysignal.co/api/stripe/webhook`. Sign new secret. Rotate `STRIPE_WEBHOOK_SECRET` in Vercel via clipboard-grab (Sensitive). Keep old endpoint live for 24h overlap.
4. **Cloudflare Turnstile** — already has `agencysignal.co` as hostname per Session D. No change.
5. **301 redirects** — `directory.seven16group.com/*` → `agencysignal.co/*` via [`next.config.mjs`](../../next.config.mjs) `redirects()` (reviewable in git, vs Vercel project-level).
6. **Marketing copy scrub** — grep + edit `directory.seven16group.com` inline mentions. `/charter` page notably; check others.
7. **Memory + docs scrub** — update [`reference_directory_admin_project_paths.md`](C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\reference_directory_admin_project_paths.md) + `.support/` knowledge base.
8. **`docs/context/FAMILY_HEALTH.md`** — refresh AS row.

**Risk to weigh upfront:** Stripe webhook rotation has a ~1-minute exposure window. Mitigation: register new endpoint first, verify with test event, decommission old after 24h.

---

## Next-in-queue (only if cutover finishes early)

- **BACKLOG `0b`** — Design system v1.1 rightRail product-mockup harmonization (Path A, ~60-90 min). Closes the homepage-vs-other-pages density gap.
- **BACKLOG `0c`** — Google SSO on `/sign-in` + `/sign-up` via cross-repo playbook (`seven16-survey/docs/cross-repo/google-sso-and-sentry-setup-playbook.md` commit `b8a2bf4`, Part 1 only — Sentry already wired on AS). ~1h + dashboard steps.

Do NOT start either of these mid-cutover. Cutover is the active arc.

---

## Working-tree hygiene at session open

Parallel sessions may have left uncommitted changes in this repo. If `git status --short` shows:

- `M app/api/stripe/*.ts` or `?? lib/family-integrations/` → leave alone. These are parallel-session WIP (likely Seven16Command CRM scaffolding per the family-mesh doctrine). Don't commit, don't revert.
- `M docs/BACKLOG.md` (unprompted) → parallel session may be drafting an entry. Read the diff before stashing — could be cross-product info you'd want to surface to Master O.
- `?? .claude/` and `?? AGENTS.md` → pre-existing untracked from earlier sessions. Ignore.

When committing your own work, use explicit `git add <file>` rather than `git add .` to avoid sweeping parallel session WIP into your commit.

---

## Standing recommendation

Lead with cutover. Stripe webhook rotation is the highest-risk step in the choreography — do it carefully (new endpoint first, verify with Stripe test event, then decommission old). Everything else in the choreography is reversible; the webhook gap is the only window where a real billing event could land in the dead zone.

Close the session with: BACKLOG refresh (cutover → Done, active arc flips to BACKLOG `0b`) → FAMILY_HEALTH refresh → SESSION_38_HANDOFF.md → push → SESSION_39_PROMPT.md.
