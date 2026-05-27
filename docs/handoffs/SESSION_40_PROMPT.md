# SESSION_40 opener — paste-ready

Read in this order:
1. [`docs/BACKLOG.md`](../BACKLOG.md)
2. [`docs/handoffs/SESSION_39_HANDOFF.md`](SESSION_39_HANDOFF.md)
3. [`docs/WORKING_AGREEMENT.md`](../WORKING_AGREEMENT.md)
4. Family doctrine block in `saas-agency-database/CLAUDE.md`
5. Family memory hub: `C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\MEMORY.md`

---

## State at SESSION_40 open

- **Agency Signal Tier 1 security LIVE** (SESSION_39 close 2026-05-26). Migrations `0096_pre_launch_security_tier1.sql` + `0097_pre_launch_security_tier1_followup.sql` applied. Advisor: 0 ERROR / 32 WARN / 3 INFO (down from 0/90/1).
- **New family-memory doctrine**: [[feedback_supabase_definer_direct_anon_grant_pattern]] — SECURITY DEFINER anon-lockdown has TWO patterns; use combined belt-and-suspenders REVOKE for all remaining family satellite audits.
- Domain cutover stable (SESSION_38). Production at `agencysignal.co`.
- D-034 pricing pivot doctrine intact from SESSION_38.5; BACKLOG `0e` (polished `/pricing` page) is the previously-Active arc returning to top.
- WIP branches on origin: `feat/quick-search-4tab` (BACKLOG #2 Slices 0-2, parked).

---

## Default theme: BACKLOG `0e` — polished `/pricing` page build (~90 min)

The pivot to the 4-tier transparent buying model (Sample $75 + Monthly Subscription $299/$599/$999 + Bulk Build-Your-File $1.20→$0.40/record + National Founder License $12,500/yr) was locked in SESSION_38.5. SESSION_39 routed around it to apply Tier 1 security. The `/pricing` page is the largest remaining customer-facing surface waiting on the new pricing model.

### Scope per D-034

Build the full polished page:
- **Hero** — pricing-focused subhead reinforcing 4-tier transparent buying
- **Slider calculator** — Bulk Build-Your-File volume → per-record price ($1.20 at low volume / $0.40 at high) + total estimate
- **4-tier comparison table** — Sample / Monthly / Bulk / National License with per-feature checkmarks
- **FAQ** — credit usage, monthly vs bulk choice, annual prepay vs monthly, upgrade/downgrade
- **Sample-offer banner** — $75 sample CTA with what's-included summary
- **CTA strip** — book demo / contact sales / buy sample

### Sanity check before starting

```powershell
git fetch origin main; git log origin/main --oneline -5
```

Expected: SESSION_39 close-out docs commit at HEAD, with the 2 migration files + `.env.local.example` updates + cross-repo prep artifact + family memory entries (in `.claude/projects/...`) all present.

```bash
curl -sSI https://agencysignal.co/ | head -1                                    # expect: HTTP/2 200
curl -sSI https://agencysignal.co/pricing | head -1                             # expect: HTTP/2 200 (current skeleton)
```

If anything fails, STOP — diagnose before touching pricing code.

---

## Alt themes (Master O may override)

- **Alt A — Apply seven16-group-site Tier 1 security.** Cross-product family-security-dashboard refresh prep artifact at `docs/cross-repo/agency-signal-tier1-update-for-seven16-group-site.md` is paste-ready. Different repo — needs its own session (Rule 2). Apply the combined belt-and-suspenders REVOKE recipe from `feedback_supabase_definer_direct_anon_grant_pattern.md`.
- **Alt B — Apply Seven16 Survey / Activator Tier 1.** Tier 2c MANDATORY (anon-INSERT lead capture is core surface).
- **Alt C — Apply Bind Lab / Email / Group Support Tier 1.** Smaller lifts; pick whichever has highest user-contact density.
- **Alt D — Stripe sandbox catalog cleanup** (D-034 follow-ups from SESSION_38.5): archive 6 D-021 surfaces + deactivate Charter coupon `L1Ngigfc` + add SUPERSEDED banners to family memory pricing files. ~30 min.
- **Alt E — Bind Lab Academy decouple execution** (BACKLOG #13 in dotintel2). Different repo; gated on `bindlab.app` domain registration first.
- **Alt F — TIQ teardown.**
- **Alt G — dotintel2 `/pricing` page build** with the v1 pricing strategy Master O delivered in SESSION_39 (saved at family memory `project_dotintel_pricing_strategy_v1.md`). Different repo — needs its own session.

---

## Recommended sequencing (CTO/PM call)

Tackle in priority order:

1. **BACKLOG `0e` `/pricing` build** — completes the post-D-034 customer-facing rollout. Charter outreach + sample offers go live on this page.
2. **Stripe sandbox catalog cleanup** (Alt D) — same arc, naturally pairs.
3. **Remaining family security audits** (Alt A/B/C) — each in its own session in its own repo. Run when next opening those repos.
4. **dotintel2 `/pricing` build** (Alt G) — open in a new dotintel2 session; the strategy doc is already saved to family memory.

After `0e` ships, charter outreach is fully unblocked on the customer-facing side.

---

## Carry-forward Master O actions (unchanged from S38/S39)

- 🟡 Flip `NEXT_PUBLIC_APP_URL` in Vercel Preview env to `https://agencysignal.co` (~30 sec dashboard; CLI agent-mode rejects)
- 🟡 Verify first real Stripe event hits 200 in Vercel logs (passive observation)
- 🟡 Family Tier 2c env-var roster across remaining satellites (Turnstile + Upstash for any anon-INSERT surface)
