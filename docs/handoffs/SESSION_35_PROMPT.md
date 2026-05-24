# SESSION_35 — Paste-ready opener (BACKLOG #2: Quick Search 4-tab feature build)

**For:** the next Claude Code session in `C:\Users\GTMin\Projects\saas-agency-database\`
**Drafted:** 2026-05-23 at SESSION_34 close
**Estimated scope:** ~4–5.5 hrs (audit-first likely 4 hrs); ~10 new files + 1 delete

---

## Paste this verbatim as the first message of SESSION_35

```
Start BACKLOG #2 (Quick Search 4-tab feature build). Full plan at
docs/roadmaps/BACKLOG_2_QUICK_SEARCH_4TAB_PLAN.md — audit completed
2026-05-22 parallel to BACKLOG #1 ship. RPC dependencies all exist
(search_agencies_for_filters, search_contacts_for_filters,
list_carriers_with_appointments, mv_vertical_summary cache). No new
migrations needed for v1.

Q1-Q5 decisions (defaulted per author recommendations in the plan):
(A1) Agency-name semantics for Contacts tab v1 — reuse existing RPC
unchanged; person-name search deferred to v1.5.
(A2) Single shared search input at the top, applies to active tab.
(A3) Default tab = Agencies.
(A4) Empty-query state shows existing RecordsCounter + brief explainer
per tab.
(A5) Install SWR now — closes deferred AS Session 5 Option A.

Estimated ~4-5 hrs via audit-first; ceiling per plan is ~5.5 hrs.
Proceed with Slice 1 — tab shell + URL state model — and propose plan
adjustments after reading the current code if anything has drifted
since the 2026-05-22 audit.

Session boot order before any writes: docs/BACKLOG.md (header should
read 2026-05-23) → docs/handoffs/SESSION_34_HANDOFF.md (latest) →
docs/WORKING_AGREEMENT.md → docs/roadmaps/BACKLOG_2_QUICK_SEARCH_4TAB_PLAN.md.
Propose 5-10 bullet plan and wait for thumbs-up before writes.
```

---

## Why this is the next session

- **SESSION_34 close cleared the runway.** Dashboard actions arc fully closed (CRON_SECRET + Stripe webhook + Sentry source-map upload all verified Done). No carry-over admin debt.
- **BACKLOG #2 is the next-largest user-facing slop surface** — `/quick-search` is currently a placeholder form with a disabled Search button. CMO brief 2 calls for a real 4-tab cross-entity search; competitive table-stakes for ZoomInfo/Apollo/Cognism.
- **All backend dependencies exist** — every RPC needed is already shipped in production migrations. Zero schema risk. Pure UI build.
- **Natural insertion point for SWR client-cache fold-in** — closes the deferred AS Session 5 Option A. `/quick-search` is the most interactive page in the authed app (typing → debounced → live results); SWR delivers obvious UX wins (instant tab switch, no refetch on focus).
- **6 consecutive sessions delivered 30–85% under their prompt estimates** via audit-first. Pattern is load-bearing. Don't pad — read the actual code first, then size the writes.

---

## Slice plan summary (from the audit doc)

| Slice | Time | Files | Output |
|---|---:|---:|---|
| 1 — Tab shell + URL state model | 45m | 2 | `app/quick-search/search-shell.tsx` (client wrapper, URL state machine) |
| 2 — Debounced search input + cleanup | 30m | 1 + delete 1 | Replace `<QuickSearchForm>` import, delete `app/quick-search/form.tsx` |
| 3 — Agencies tab | 60m | 2 | `_tabs/agencies-tab.tsx` + server pagination via `search_agencies_for_filters` |
| 4 — Contacts tab | 60m | 2 | `_tabs/contacts-tab.tsx` + agency-name search semantics (Q1=A) |
| 5 — Carriers tab | 45m | 2 | `_tabs/carriers-tab.tsx` + client-side filter on ~2k carriers (SWR cached once/session) |
| 6 — Verticals tab | 30m | 1 | `_tabs/verticals-tab.tsx` + reuses `<VerticalOpportunityCard>` from Session D |
| 7 — Empty/loading/error states per tab | 30m | (inline) | Per-tab DataTable state branches |
| 8 — Apply-on-touch D-024 cleanup | 15m | varies | Sweep any pre-existing lint errors in touched files |
| 9 — DoD + lint + build + commit + push + PR | 30m | — | All 4 tab routes verify; deep-link state preserved across navigation |

**Total estimated:** ~5.5 hrs ceiling, ~4 hrs audit-first floor.

---

## Pre-flight before opening SESSION_35

- [ ] **Branch cleanup landed** — `git ls-remote --heads origin` shows only `refs/heads/main` (verify Master O completed the 3-branch delete; if not, surface as a session-open quick task — `git push origin --delete feat/foundations-sprint feat/sentry-install claude/session-30-recovery-D4xSt`).
- [ ] **Confirm `search_agencies_for_filters` + `search_contacts_for_filters` exist in production Supabase** (audit confirmed they do — quick `mcp__supabase__list_tables` smoke check at session open if uncertain).
- [ ] **Lint is at 0** (confirmed at SESSION_33 close after the 13c9e5d final sweep; preserve through this session).
- [ ] **Vercel preview pipeline healthy** (latest production deploy READY; preview deploys auto-on-push).

---

## Standing rules in scope for SESSION_35

- **D-024 12-point DoD on every screen** — empty / loading / error / retry / success / mobile / keyboard / screen reader / partial data / slow connection / user-leaving-mid-request / malformed-response. The 4 tabs are 4 new user-facing surfaces.
- **No SLOP in copy or UI** — placeholder text on empty states must be specific and useful, not generic AI-flavored filler.
- **Anti-slop on buttons** — no decorative buttons without onClick. If a feature is gated, gate it honestly with a tooltip explaining why.
- **Audit-first** — read the actual code in `app/quick-search/` + the 3 existing RPCs in `supabase/migrations/` before locking the writes. Sizes may shrink further.
- **Plugins-first** — Supabase MCP for any schema/RPC verification; Vercel MCP for build-log smoke after push.

---

*This prompt is paste-ready. Open the next session, drop it in as the first message, propose the 5–10 bullet plan, wait for thumbs-up, then ship Slice 1.*
