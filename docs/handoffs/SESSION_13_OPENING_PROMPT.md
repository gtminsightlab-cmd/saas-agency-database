# Session 13 — Opening Prompt for Master O to paste at session start

> Copy-paste the block below to start session 13. It re-establishes operating
> context (plugins, comms style, escalation rules) and points the next Claude
> at the exhaustive session-12 handoff so it doesn't waste cycles re-deriving
> state.

---

I'm Master O. Project: **Seven16 Agency Directory** — multi-tenant B2B
agency directory on Supabase + Next.js/Vercel + Cloudflare. Repo:
`https://github.com/gtminsightlab-cmd/saas-agency-database`. Workspace:
`C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database\`.

**FIRST STEPS (do these silently before anything else):**

1. **Read** `docs/handoffs/SESSION_12_HANDOFF.md` end-to-end. It's exhaustive
   on purpose. Pay particular attention to **§11 Operating context** — those
   rules apply to this session.
2. **Read your memory** — especially:
   - `feedback_operating_context.md` (plugins, escalation, comms)
   - `reference_git_repo_state.md` (NO local clone, OneDrive .git is broken)
   - `feedback_explain_like_5.md` (comms style)
   - `feedback_handoff_quality.md` (write exhaustive handoffs at the end)
3. **Health check:**
   - `which python3; python3 -c "import pandas, openpyxl; print('ok')"` — if
     bash sandbox is dead, ask me to reboot my computer (it worked last time).
   - `git ls-remote https://github.com/gtminsightlab-cmd/saas-agency-database.git refs/heads/main`
     — should be at `8829d3889998dd19936ad0d1dd3b189257b795aa` or later.
   - Vercel: `list_deployments` for project `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV`,
     team `team_RCXpUhGENcLjR2loNIRyEmT3` — top deployment should be `READY`.
   - Supabase: count agencies (should be 20,739) and agency_carriers
     (should be 191,201) under tenant `ce52fe1e-aac7-4eee-8712-77e71e2837ce`.
4. **Apply the standing rules** — use plugins (Supabase / Vercel / Stripe /
   Cloudflare via WebFetch / Bash) BEFORE asking me anything. I'm the last
   resort. If you do need me, explain like I'm 5: numbered steps, exact
   click paths, paste-ready commands.

**Likely candidates for this session (pick or propose):**
- Contacts load for the 8 session-12 vendor files (FirstName/LastName/Title/CEmail
  not yet ingested)
- account_type_id backfill for the 634 new agencies (currently NULL)
- MiEdge confidence-tiered fuzzy matcher (carry from session 10)
- Rotate the leaked `sb_secret_` service role key in Supabase if I haven't
  done it yet
- Anything else I bring up

**Do not reopen** these closed scopes (per session 11):
- Carolina Casualty (75+ PU) distribution channels — cancelled
- Berkley-Prime extension — cancelled

End of opening prompt. Wait for my answer to "what's next?" before doing
substantive work.
