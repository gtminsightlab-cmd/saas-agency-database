# SESSION_39 opener — paste-ready

Read in this order:
1. [`docs/BACKLOG.md`](../BACKLOG.md)
2. [`docs/handoffs/SESSION_38_HANDOFF.md`](SESSION_38_HANDOFF.md)
3. [`docs/WORKING_AGREEMENT.md`](../WORKING_AGREEMENT.md)

---

## State at SESSION_39 open

- **Domain cutover SHIPPED end-to-end SESSION_38 (2026-05-26).** Canonical is now `https://agencysignal.co`. Legacy `directory.seven16group.com` 308-redirects via `next.config.mjs`.
- Production main HEAD: `70b6c2d` (code) + SESSION_38 close-out docs commit (most recent). Vercel deploy READY at `agencysignal.co`.
- Stripe webhook destination URL atomically rotated to `agencysignal.co/api/stripe/webhook`; signing secret preserved (verified via Resend → 200 OK end-to-end).
- LAUNCH_CHECKLIST 9/9 GREEN unchanged. Charter outreach unblocked from every code-side gate.

---

## Active arc — BACKLOG `0b`: Design system v1.1 rightRail product-mockup harmonization

**~60-90 min focused (Path A).** Closes the homepage-vs-other-pages density gap surfaced in SESSION_37 PR #8 review.

### Sanity check before starting

```powershell
git fetch origin main; git log origin/main --oneline -5
```

Expected: SESSION_38 close-out docs commit at HEAD, `70b6c2d` (code) shortly behind. Working tree should be clean (only pre-existing `.claude/` + `AGENTS.md` untracked).

### Cutover health check (passing-pass while at the CLI)

```bash
curl -sSI https://agencysignal.co/ | head -1                                    # expect: HTTP/2 200
curl -sSL -o /dev/null -w "%{num_redirects} → %{url_effective}\n" https://directory.seven16group.com/charter   # expect: 1 → https://agencysignal.co/charter
```

If either fails, STOP — cutover regression. Diagnose before touching design system work.

### The problem to solve

Audit during SESSION_37 PR #8 review found that the marketing surface reads as "homepage + 6 secondary landing pages" rather than one product:

- **Homepage `/`**: PageHero rightRail contains rich `AppointmentSearchMockup` component with live-looking data — high density, signals enterprise-data-platform.
- **6 other marketing pages** (`/verticals`, `/use-cases`, `/charter`, `/resources`, `/enterprise`, `/methodology`, `/pricing`): PageHero rightRail uses flat `DataPanel` (cyan eyebrow + title + 2-col label/value grid). Lower density. Reads as a different product.

### Path A — what to ship

Extend the rich-mockup pattern across the other 6 pages so the entire marketing surface reads as one product. Each page gets a page-appropriate mockup component in the PageHero rightRail (NOT replacing the existing in-body `DataPanel` content — that stays, just the hero rightRail changes).

Suggested per-page mockup concepts (refine before building):

- `/verticals`: Vertical-tier-mockup — list of 12 verticals with status pills + agency counts
- `/use-cases`: Workflow-step-mockup — 4-step horizontal numbered playbook
- `/charter`: Charter-terms-mockup — existing `CharterTermsPanel` is already richer than `DataPanel`; possibly skip or upgrade
- `/resources`: Editorial-row-mockup — title + meta + read-arrow stack
- `/enterprise`: Enterprise-capabilities-mockup — 6-tile grid with terms
- `/methodology`: Three-signals-mockup — 3-signal flow diagram with scoring badges
- `/pricing`: Credit-slider-mockup — usage model preview

### Scope discipline

- **Don't touch the in-body Section content** — the page redesigns in SESSION_36 Phase B are tuned + Master O said "wow the preview looks amazing."
- **Don't refactor `PageHero` or `DataPanel`** — those shipped in SESSION_36 Phase A; treat as frozen primitives.
- **Each new mockup component is a small client component** in `components/marketing/` analogous to `AppointmentSearchMockup`. Static rendering — no API calls, no client state beyond hover/focus.
- **D-024 12-point DoD** — keep loading/empty/error/retry semantically valid where applicable; preserve focus rings + aria labels.

Estimated: 6 mockup components × ~10 min each + 6 page edits × ~3 min each + design QA on each page = ~75-90 min.

---

## Low-priority follow-ups from SESSION_38 (knock out if cutover health-check surfaces anything OR opportunistically)

1. **Master O — flip `NEXT_PUBLIC_APP_URL` in Vercel Preview env** to `https://agencysignal.co`. Dashboard only (CLI agent-mode rejects preview adds per `feedback_vercel_cli_agent_mode_preview_env`). ~30 sec.
2. **Verify first real Stripe event hits 200 in Vercel logs.** No action — just check Vercel function logs if any charter signup / subscription flow ran overnight.
3. **(Optional) Add `www.agencysignal.co` apex redirect.** Currently `www.` doesn't resolve. Low priority unless inbound links use `www.` form.

---

## Next-in-queue (only if `0b` finishes early)

- **BACKLOG `0c`** — Google SSO on `/sign-in` + `/sign-up` via cross-repo playbook (`seven16-survey/docs/cross-repo/google-sso-and-sentry-setup-playbook.md` commit `b8a2bf4`, Part 1 only — Sentry already wired on AS). ~1h + 2 Master O dashboard steps.

Do NOT start `0c` mid-`0b`. One arc per session per Rule 3.

---

## Standing rules to honor

- Plugins-first, escalate-last (Supabase MCP / Vercel MCP / Cloudflare MCP loadable via ToolSearch; claude-in-chrome MCP unlocked SESSION_38)
- Secrets never in chat (no secrets expected in `0b` — pure UI work)
- Audit-first (cutover health-check before `0b`; per-page screenshot review after each component lands)
- One arc per session — `0b` only; don't fold in `0c` unless `0b` finishes well under budget
- Always recommend next path as CTO/PM (no flat menus)

After reading the docs, propose your 5-10 bullet plan and wait for thumbs-up before any code changes. Close the session with: BACKLOG refresh (`0b` → Done, active arc flips to `0c` or next-pick) → FAMILY_HEALTH refresh → SESSION_39_HANDOFF.md → push → SESSION_40_PROMPT.md.
