# Folder & Memory Map — Seven16 Group

**Last updated:** 2026-05-01
**Companion to:** [MASTER_CONTEXT.md](MASTER_CONTEXT.md)

> Where everything lives. When a future session says "I don't know where to find X", the answer is in here.

---

## 1. Workspace — Agency Signal repo on disk

**Root:** `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database\`
*(Linux sandbox path: `/sessions/<id>/mnt/Saas Agency Database/`)*

```
.
├── README.md                       (1.3KB — repo intro)
├── HANDOFF.md                      (legacy — session 1/2 era; superseded by docs/handoffs/*)
├── package.json                    (Next 14.2.15, React 18.3.1, @supabase/ssr, stripe ^17.4.0)
├── tsconfig.json
├── tailwind.config.ts              (admin dark palette extension lives here)
├── postcss.config.mjs
├── next.config.mjs
├── middleware.ts                   (Supabase SSR auth middleware)
├── .env.local.example              (do NOT commit a real .env.local)
├── .gitignore
├── .git/                           (BROKEN — OneDrive sync corrupts internals; do not push from here)
├── .git.broken_1777077102/         (sibling of the prior break — leave alone)
│
├── app/                            (Next.js 14 App Router)
│   ├── layout.tsx                  (root layout)
│   ├── page.tsx                    (marketing homepage — Phase 1+2 CMO copy)
│   ├── globals.css
│   ├── admin/                      (13-module admin control center, dark theme)
│   │   ├── _shell/                 (admin layout primitives)
│   │   ├── alerts/   billing/   catalog/   customers/   data-engine/
│   │   ├── data-quality/   hygiene/   integrations/   search-analytics/
│   │   ├── settings/   system-health/   usage/   verticals/
│   │   ├── layout.tsx
│   │   └── page.tsx                (admin overview)
│   ├── agency-directory/           (public agency lookup)
│   ├── ai-support/                 (session 8 deliverable)
│   ├── analytics/
│   │   └── carriers/               (session 10 — page.tsx + grid.tsx)
│   ├── api/                        (route handlers — Stripe checkout/webhook lives here)
│   ├── auth/                       (sign-in / sign-up / sign-out flows)
│   ├── build-list/                 (filter UI + /review preview + RPCs)
│   ├── data-mapping/   data-stats/   downloads/
│   ├── integrations/   limit-reached/   methodology/   quick-search/
│   ├── resources/   saved-lists/
│   ├── sign-in/   sign-up/   sign-out/
│   ├── team/                       (session 9 — multi-seat invitations)
│   └── verticals/                  (4 + 8 verticals, /verticals/<slug> with trucking_segment badges)
│
├── components/
│   ├── nav.tsx                     (deprecation note: public vs authed nav split)
│   ├── sortable-th.tsx
│   ├── app/                        (authed app primitives — Sidebar etc.)
│   ├── build-list/                 (filter + review components)
│   └── marketing/                  (homepage / pricing / CTA components)
│
├── lib/
│   ├── supabase/                   (server + browser SSR client factories)
│   ├── stripe/                     (sdk + price-id constants)
│   ├── ai-search/                  (session 8 parse.ts + RPC wrappers)
│   └── usage/                      (limit enforcement)
│
├── scripts/
│   ├── README.md
│   └── load-adlist.ts              (tsx-driven AdList loader)
│
├── public/                         (static assets, hero image, favicon)
│
├── supabase/
│   └── migrations/                 (28 files: 0001-0055 — REPO IS BEHIND DB; 0057-0083 live in Supabase only)
│
├── data/                           (56 vendor xlsx files + session-12 dry-run artifacts)
│   ├── AdList-*.xlsx               (35+ AdList feeds — geographic/state slices)
│   ├── Cincin Ins Co Part 1.xlsx
│   ├── GUARD.xlsx   WRB.xlsx   UTICA.xlsx   AdList-17028(*).xlsx
│   ├── load_session12.py           (urllib stdlib only — no extra installs)
│   ├── dry_run_session12.py
│   ├── spot_check.py   split_ids_for_sql.py
│   ├── _dryrun_*.csv / .txt / .sql (post-canary clean rows + chunked SQL)
│   └── _patch_sql_*.sql            (multi-carrier patch fragments)
│
└── docs/
    ├── cmo-review/
    │   └── CMO_COPY_REVIEW_2026-04-25.md   (consultancy-grade copy review — Lafley/Martin/Porter/Bain frame)
    ├── roadmaps/
    │   └── V5_DATA_INTEGRATION.md          (revised after grain-mismatch finding; 3 strategies documented)
    ├── spinoffs/
    │   └── dot-carrier-intel/
    │       └── BOOTSTRAP.md                (374 lines — DOT Intel rebuild starter; lives here until DOT Intel gets its own repo)
    ├── handoffs/
    │   ├── SESSION_9_HANDOFF.md            (multi-seat + CMO Phase 1+2)
    │   ├── SESSION_10_HANDOFF.md           (analytics/carriers + V5 grain finding)
    │   ├── SESSION_11_HANDOFF.md           (Berkley operating-units mapping; Supabase-only)
    │   ├── SESSION_12_HANDOFF.md           (8-file vendor load + multi-carrier patch + epilogue + operating context)
    │   └── SESSION_13_OPENING_PROMPT.md    (paste-ready for next session start)
    └── context/                            ⭐ NEW — this folder
        ├── MASTER_CONTEXT.md
        ├── DECISION_LOG.md
        ├── SESSION_STATE.md
        └── FOLDER_AND_MEMORY_MAP.md        (you are here)
```

---

## 2. Memory directory — Claude's persistent state

**Path on disk:**
`C:\Users\GTMin\AppData\Roaming\Claude\local-agent-mode-sessions\b55ac276-2352-4d2f-bf89-d8cd6f51a131\15db088f-8d52-4142-bbf2-3876e55d9f85\spaces\004d2269-1a61-4f92-af84-6fc69cc0c78b\memory\`

**How it loads:** `MEMORY.md` is auto-injected into every Claude session as a system reminder. Each line in MEMORY.md points at a file that Claude reads on demand.

### 2.1 Index file
- **`MEMORY.md`** — the top-level index. Auto-loaded every session. Should be ≤200 lines. Contains pointers, not memory content. **Add a top-of-file pointer to `docs/context/MASTER_CONTEXT.md` so every new session reads the hub first.**

### 2.2 Standing rules / feedback memory (always-applicable)

| File | What it says |
|---|---|
| `feedback_operating_context.md` | ⚠️ **CRITICAL.** Plugins available, escalation rule, comms style. |
| `feedback_explain_like_5.md` | Master O is a 5-year-old when it comes to manual steps. Number every click. |
| `feedback_handoff_quality.md` | Handoffs must be exhaustive — chronological log + migrations + identifiers + lessons + opening move. |
| `feedback_canaries_and_dedupe.md` | Vendor files have decoys. Filter + dedupe + dry-run before loading. |
| `feedback_cancelled_means_closed.md` | "Skip that" = delete from list, document under "Do not reopen". |
| `feedback_carrier_search_strong_match.md` | User-facing carrier lookups use fuzzy/strong match (pg_trgm), not exact. |
| `feedback_pricing_and_data_strategy.md` | Pricing copy is placeholder until data inventory catches up. |
| `feedback_onedrive_atomic_writes.md` | Files >5KB → build in `/tmp`, `cp` atomic, verify with `wc -c` + `md5sum`. |
| `feedback_sandbox_no_github_creds.md` | Sandbox doesn't retain creds — fresh PAT each session. |

### 2.3 Reference memory (look-up tables)

| File | Contents |
|---|---|
| `reference_git_repo_state.md` | OneDrive `.git` is permanently broken. No alt clone. Stop hunting. |
| `reference_supabase_seven16group.md` | Supabase project IDs: `sdlsdovuljuymgymarou` (Agency Signal) vs `vbhlacdrcqdqnvftqtin` (DOT Intel old). |
| `reference_github_vercel_accounts.md` | GitHub username `gtminsightlab-cmd`, Vercel team + project IDs. |
| `reference_stripe_sandbox.md` | Stripe sandbox account / product / price IDs + env-var checklist. |
| `reference_berkley_carrier_ids.md` | Berkley operating-unit carrier_ids + 13 wholesalers + power-unit bands. |
| `reference_mcp_tools_quick_check.md` | At-a-glance MCP inventory — what's connected today. |
| `reference_mcp_plugins_seven16.md` | Same with full UUIDs + per-MCP usage notes. |

### 2.4 Project-state memory (point-in-time snapshots)

| File | Contents |
|---|---|
| `project_seven16_master_plan.md` | ⚠️ **AUTHORITATIVE 2026-04-30.** Wins over older handoff decisions. |
| `project_open_questions_to_surface.md` | Parked questions to raise contextually, not all at once. |
| `project_bindlab_agencyvantage_revival.md` | Retired now, reprise later (BindLab = sales dev + coaching). |
| `project_saas_agency_db.md` | Older name for Agency Signal — still useful for Phase 0 / 1 context. |
| `project_dot_carrier_intel_bootstrap.md` | DOT Intel old-project bootstrap; superseded by master plan rebuild decision (D-007). |
| `project_trust_copy_and_hygiene_credit.md` | Locked copy + Hygiene Credit mechanics; held for rollout. |
| `project_admin_control_center_spec.md` | 13-module admin sidebar spec — adapted from generic wireframe research. |
| `project_v5_parent_vs_branch_finding.md` | V5 grain mismatch — three remediation strategies. |
| `project_team_seats_invitations.md` | Migration 0055, multi-seat schema + RPCs. |
| `project_analytics_carriers_page_and_miedge.md` | Session 10 analytics work + 5 MiEdge carriers. |
| `project_saas_agency_db_handoff_session4.md` ... `_session12.md` | Per-session exhaustive handoffs (sessions 4–12). Session 12 is the most-recent and has the operating-context block. |

### 2.5 Memory hygiene rules

- **Don't duplicate.** Update an existing memory before writing a new one.
- **Don't dump ephemeral state into memory** (in-progress task details, transient debugging context). Use the conversation or a TODO list.
- **Don't write code patterns / file paths / git history.** They can be re-derived from the repo.
- **Sensitive data:** never save secret keys, passwords, tokens, government IDs, financial account numbers, health info, home addresses. (Office addresses, work emails are fine.)
- **Stale memory:** when a memory turns out to be wrong, update or delete it — don't leave a quiet contradiction.
- **Dates in relative form ("Thursday") get converted to absolute ("2026-03-05") when saving** so the memory stays interpretable later.

---

## 3. Infrastructure quick-reference

### 3.1 GitHub

| Field | Value |
|---|---|
| Username | `gtminsightlab-cmd` |
| Agency Signal repo | `https://github.com/gtminsightlab-cmd/saas-agency-database` (public, created 2026-04-24) |
| Repo ID | `1220314444` |
| DOT Intel repo | not yet created (deferred to rebuild kickoff) |
| Auth pattern | fine-grained PAT with `Contents: write` scope, custom expiration set to next-day, revoked after use. **Never persisted in memory.** |

### 3.2 Vercel

| Field | Value |
|---|---|
| Team name | `gtminsightlab-7170's projects` |
| Team slug | `gtminsightlab-7170s-projects` |
| Team ID | `team_RCXpUhGENcLjR2loNIRyEmT3` |
| Agency Signal project ID | `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV` |
| Production URL | https://directory.seven16group.com |
| Branch alias | `saas-agency-database-git-main-gtminsightlab-7170s-projects.vercel.app` |
| Auto-deploy | on push to `main` |
| Other projects on team | `dotintel-intelligence`, `dotintel-preview`, `dotintel`, `uem-website` (NOT used by this build) |

### 3.3 Supabase

| Field | Value |
|---|---|
| **Agency Signal project ID** | `sdlsdovuljuymgymarou` |
| Agency Signal name | `seven16group` |
| Region | us-east-1 |
| Postgres version | 17.6.1 |
| DB host | `db.sdlsdovuljuymgymarou.supabase.co` |
| Default tenant_id | `ce52fe1e-aac7-4eee-8712-77e71e2837ce` (slug=`seven16`) |
| Migrations on disk | 0001–0055 (28 files in `supabase/migrations/`) |
| Migrations live on DB | 0001–0055 + 0057–0083 (drift — see SESSION_STATE §1.3) |
| **DOT Intel old project ID** | `vbhlacdrcqdqnvftqtin` |
| DOT Intel old name | `dotintel` |
| DOT Intel old region | us-east-2 |

### 3.4 Stripe (sandbox)

| Field | Value |
|---|---|
| Account | `acct_1TLUF6HmqSDkUoqw` |
| Mode | sandbox / test |
| Dashboard | https://dashboard.stripe.com/acct_1TLUF6HmqSDkUoqw |
| Growth Member product / price | `prod_UOlPzNmSokIq9s` / `price_1TPxtFHmqSDkUoqwRvnHOqhx` ($99/mo) |
| Snapshot product / price | `prod_UOlPFKVe2LI741` / `price_1TPxtHHmqSDkUoqwXa3zfPOV` ($125 one-time) |
| Webhook URL (to register) | `https://directory.seven16group.com/api/stripe/webhook` |
| Webhook events | `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` |
| Stripe API version | `2025-02-24.acacia` |

### 3.5 Vercel env vars (Master O sets in Project Settings → Environment Variables)

| Var | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set |
| `STRIPE_SECRET_KEY` | ❓ Pending — `sk_test_...` from sandbox dashboard |
| `STRIPE_WEBHOOK_SECRET` | ❓ Pending — `whsec_...` after webhook endpoint registered |
| `SUPABASE_SERVICE_ROLE_KEY` | ❓ Needs **rotation** (leaked in chat session 12) then re-set |
| `NEXT_PUBLIC_APP_URL` | ❓ Pending — `https://directory.seven16group.com` |

### 3.6 Cloudflare

- Zone: `seven16group.com`
- DNS record: `directory` CNAME → `6bfc3986371ac660.vercel-dns-017.com`, **DNS-only (grey cloud)** — don't enable proxy or it breaks Vercel certs.
- No MCP — DNS changes go through dashboard. Walk Master O through clicks when needed.

### 3.7 MCP plugins (UUIDs)

| Server | UUID | Used for |
|---|---|---|
| Supabase | `a7551cce-72a4-4510-a756-75884c17b895` | All DB ops |
| Stripe | `88ed113e-60e5-42f6-b10f-2ff70d3fd669` | All Stripe ops |
| Vercel | `da129817-b0da-40ff-af93-9c5eb6e8b376` | Deployments, build logs |
| Gmail | `26ef426b-8be6-48d4-b39a-fe98f48cd16e` | Inbox / drafts |
| Google Drive | `2cff04fb-73e4-4c7c-af89-e7f811eb1c4f` | Files |
| Google Calendar | `791bda76-0a9e-419f-8a61-024a8fb9e133` | Events |
| Workspace bash | `mcp__workspace__bash` (built-in) | Linux sandbox |

(Cowork core, MCP registry, Plugins, Scheduled tasks, Claude in Chrome are also available as built-ins. Cowork plugin marketplaces installed: 15-cowork-skills, cowork-essentials, cowork-plugin-management, design, marketing, productivity. See `reference_mcp_plugins_seven16.md` for full skill inventory.)

### 3.8 NOT installed yet (worth considering)

- **Cloudflare MCP** — would replace dashboard walk-throughs.
- **GitHub MCP** — would remove the per-session PAT requirement.
- **Linear or Jira MCP** — for tracking the rebuild roadmap if Master O wants formal tickets.
- **PostHog MCP** — for the search-analytics admin module.

---

## 4. File-handling rules (operational)

(Repeated here from operating context because they're load-bearing for any file work.)

**Working directory (Linux sandbox):** `/sessions/<id>/mnt/outputs/` — temporary, cleared between sessions, not visible to Master O.

**Workspace folder (Master O sees these):** `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database\` — synced to OneDrive, accessible to Master O outside the chat.

**Linux sandbox path mapping:**
- OneDrive workspace → `/sessions/<id>/mnt/Saas Agency Database/`
- Outputs → `/sessions/<id>/mnt/outputs/`
- Skills → `/sessions/<id>/mnt/.claude/skills/` (read-only)
- Uploads → `/sessions/<id>/mnt/uploads/` (read-only)

**Atomic-write workflow for files >5KB:**
1. Build via `cat > /tmp/<file> <<'EOF' ... EOF` in bash.
2. `cp /tmp/<file> "/sessions/<id>/mnt/Saas Agency Database/<dest>"`.
3. `sleep 2` and verify with `wc -l` + `md5sum`.

**Push workflow (since OneDrive `.git` is broken):**
1. Get a fresh fine-grained PAT from Master O.
2. Clone fresh from origin into `/tmp/repo-push` using `https://USER:PAT@github.com/...`.
3. Diff against the OneDrive working copy, copy in the changed files.
4. Commit + push from `/tmp/repo-push`. Verify Vercel deploy goes READY (not ERROR) before declaring done.
5. Sandbox clone is throwaway — won't survive next session.

— end of FOLDER_AND_MEMORY_MAP —
