# Master Context — Seven16 Group

**Last updated:** 2026-05-01 (session 13)
**Purpose:** Single source of truth that any new Claude session (or human collaborator) reads first to get oriented. Everything else points back to this hub.

> **If you are a Claude session reading this for the first time:** read this hub end-to-end, then open the three spokes linked at the bottom (Decision Log, Session State, Folder & Memory Map). Then ask Master O what's next. Do not start substantive work without doing this pass first.

---

## 1. The big picture

**Seven16 Group** is the holding/trust/authority brand. It is **not a product itself** — it's the page a VP lands on after reading a LinkedIn post. The trust layer behind a family of products.

**Brand architecture = Option C:** separate brands for the market, shared infrastructure for the business, single login for the customer.

**Two products live under Seven16 today:**

| Product | Domain | State | One-liner |
|---|---|---|---|
| **DOT Intel** | dotintel.io | **Greenfield rebuild on Seven16 stack.** Old project = reference only. | Trucking / commercial-insurance intelligence platform, FMCSA-data-backed. |
| **Agency Signal** | agencysignal.co (alias of `directory.seven16group.com` until cutover) | **Live in production.** Build is good — keeps shipping. | Multi-tenant retail-agent directory: 20,739 agencies, 191,201 carrier appointments, 400+ writing companies, 60 parent groups. Was previously named "SaaS Agency Database" / "Agency Data Seven16" — older docs may use those names. |

**Adjacent pieces (parked or stealth):**
- **Seven16Recruit** — AI agent recruitment. Stealth, gated on attorney review of W-2 employment agreement.
- **Growtheon** — $97/mo flat white-label CRM (GHL competitor). Internal use first.
- **Coaching layer** — $47 PDF / $97 course / $199/mo cohort.
- **BindLab** + **Agency Vantage** — retired now, will reprise later (BindLab = sales dev + coaching brand). Don't reference in current build.

---

## 2. Pricing — locked

Strategy: little-guy first, every consumer tier under the $500 P-card threshold so a producer can expense it without manager sign-off.

| Product | Free | Mission tier | Mid | Enterprise |
|---|---|---|---|---|
| **DOT Intel** | Free | $29 Pro | $149 Business | $499+ Enterprise |
| **Agency Signal** | Free | **$19 Producer** *(THE mission tier)* | $99 Growth | $399+ Enterprise |
| **2027 Bundle** | — | — | $179/mo Seven16 Intelligence (DOT Intel Business + Agency Signal Growth) | — |

The Agency Signal $19 Producer tier is the lead-with-the-little-guy bet. Every other pricing decision follows from it.

---

## 3. Tech stack — locked

Everything below is shared across both products. Build for the 2027 bundle from day one.

- **Hosting:** Vercel + GitHub. Subdomain isolation per product.
- **DB / auth:** Supabase, **one org, shared auth, separate schemas, RLS day one**.
- **Payments:** Stripe, **one customer per user** (so the bundle can attach products to a single customer).
- **CDN / WAF:** Cloudflare.
- **Secrets:** Doppler.
- **Errors:** Sentry.
- **Passwords:** 1Password.
- **AI:** Claude API (`claude-sonnet-4-20250514`).
- **Outbound:** Instantly + Expandi.
- **Video / voice:** HeyGen + ElevenLabs.

Live infrastructure IDs and project mappings are in the [Folder & Memory Map](FOLDER_AND_MEMORY_MAP.md).

---

## 4. Phase plan and hard dates

| Phase | Window | What ships |
|---|---|---|
| **0 — Validate** | done | Prompts 6/7/8, brand + pricing locked. ✅ |
| **1 — Infrastructure** | in progress | Handles + content done. Open: Supabase master arch, Doppler/Sentry/1Password, **DOT Intel rebuild**, Stripe live cutover. |
| **2 — Build** | May–Jul 2026 | DOT Intel features, Agency Signal continued build, BDM pre-call brief (DOT Intel adoption driver). |
| **3 — Launch** | Sep–Oct 2026 | DOT Intel + Agency Signal public, Reuters Insurance Panel, niche directories live. |
| **4 — Scale** | Q1–Q2 2027 | W-2 ends April 2027, Seven16 consulting practice opens selectively. |

**Hard dates that drive everything else:**
- **2026-07-01** — content cadence live (12 posts drafted before this).
- **2026-09** — public launch + Reuters Insurance Panel.
- **2026-10-mid** — niche directories + Growtheon offer pages.
- **2027-04** — W-2 transition, Seven16 consulting practice opens.

---

## 5. Operating context — read this every session

These rules survive across sessions. Ignore at your peril.

**Plugins available — try these BEFORE asking Master O for anything:**
- **Supabase MCP** — full DB access (apply_migration, execute_sql, get_advisors, etc.). Two projects: `sdlsdovuljuymgymarou` (seven16group / Agency Signal) and `vbhlacdrcqdqnvftqtin` (dotintel — old project, reference only).
- **Vercel MCP** — deploy_to_vercel, list_deployments, get_deployment_build_logs, etc.
- **Stripe MCP** — sandbox today, full API access.
- **Cloudflare** — no MCP. Use WebFetch on `developers.cloudflare.com` + walk Master O through dashboard clicks.
- **GitHub** — no MCP. Push needs a one-time PAT from Master O each session (sandbox doesn't retain creds). Read-only browsing via WebFetch on `raw.githubusercontent.com`.
- **Bash sandbox** — Python + pandas + openpyxl preinstalled. Network access for pip / curl / git clone. Sandbox can fail to boot cold — ask Master O to reboot his computer if it does.
- **Gmail / GDrive / GCal** — connected, rarely needed.

**Escalation rule:**
1. **First:** can I do this myself with bash + the MCPs above? If yes, do it without narrating.
2. **Second:** can I work around a missing plugin (e.g., WebFetch instead of GitHub MCP)? If yes, do that.
3. **Last resort:** ask Master O. Never the first move. DO ask for: GitHub PATs, secret keys, scope decisions, approval before destructive ops, key rotations.

**Communication style — when Master O does have to act:**
- Explain like he's 5. He's a non-developer founder. Numbered steps, exact button names, paste-ready commands, predict the next prompt.
- He has explicitly said: *"I am a 5 year old so when you need me to do something because you can not, please explain to me like I am 5."*

**Working clone reality:**
- The OneDrive folder `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database\` is the **only** working copy on Master O's machine.
- Its `.git` is permanently broken (OneDrive sync mangles git internals — not fixable in place).
- For pushes: clone fresh into `/tmp` from origin via PAT, sync OneDrive working files in, commit, push. Sandbox clone is throwaway.
- **Long-term fix to schedule:** clone outside OneDrive (e.g., `C:\Users\GTMin\Projects\saas-agency-database\`) and `gh auth login` once. Do this BEFORE the DOT Intel rebuild starts so the new repo is born outside OneDrive.

**Standing rules from Master O (full list in [Decision Log](DECISION_LOG.md) §6):**
- Canary filter + dedupe on every external data load. Vendor files have decoys. Ask before guessing.
- Cancelled = closed scope. "Skip that" means delete, not defer.
- Carrier search uses fuzzy/strong match (pg_trgm), not exact.
- Pricing copy is placeholder until data inventory catches up.
- Handoffs must be exhaustive — chronological log + migrations + blocked items + identifiers + lessons + opening move.
- For OneDrive writes >5KB: build in `/tmp`, `cp` atomically, verify with `wc -c` + `md5sum`.

---

## 6. Where everything lives — quick map

(Full version in [Folder & Memory Map](FOLDER_AND_MEMORY_MAP.md).)

| What | Where |
|---|---|
| Agency Signal source code | `C:\Users\GTMin\OneDrive\Documents\Claude\Projects\Saas Agency Database\` |
| Agency Signal repo | `https://github.com/gtminsightlab-cmd/saas-agency-database` |
| Agency Signal Supabase | project `sdlsdovuljuymgymarou` (name: `seven16group`, region us-east-1) |
| Agency Signal Vercel | project `prj_w1SpwUzybi4hdbgHJNmMYjRLGHKV` on team `team_RCXpUhGENcLjR2loNIRyEmT3` |
| Agency Signal live URL | https://directory.seven16group.com (will move to agencysignal.co) |
| DOT Intel old project | Supabase `vbhlacdrcqdqnvftqtin` — reference only, NOT migrating code |
| DOT Intel rebuild bootstrap | `docs/spinoffs/dot-carrier-intel/BOOTSTRAP.md` in Agency Signal repo |
| Session handoffs | `docs/handoffs/SESSION_*.md` in Agency Signal repo |
| Standing memory | `<memory dir>/MEMORY.md` (auto-loaded into every Claude session) |

---

## 7. Open questions — surface contextually

These are unresolved decisions Master O wants raised when the relevant work starts, not all at once:

1. **Directory domains** — DOT Carrier Directory + Agency Marketplace Directory: subdomains under product domains, or new TLDs? *Surface when:* building/naming directory products (Phase 3, Oct 2026).
2. **Growtheon margin model** — reseller vs. white-label, pricing structure TBD. *Surface when:* building Growtheon offer pages.
3. **Seven16Recruit stealth** — gated on employment-attorney review of W-2 agreement. Has the attorney been engaged? *Surface when:* any public-facing Recruit work comes up.
4. **BDM pre-call brief** — Prompt 6 Objection #5 says it's the DOT Intel adoption driver, must be in September launch. *Surface when:* kicking off DOT Intel rebuild feature spec.

---

## 8. Spokes — read these next

This hub stays short on purpose. Detail lives in the spokes:

- **[DECISION_LOG.md](DECISION_LOG.md)** — every locked decision: brand arch, pricing, trust copy, Hygiene Credit, retired brands, cancelled scopes. Categorical + chronological.
- **[SESSION_STATE.md](SESSION_STATE.md)** — current "as of today" state: Agency Signal session 12 numbers, deferred items, DB vs repo migration drift, DOT Intel rebuild status, what each session 4-12 produced.
- **[FOLDER_AND_MEMORY_MAP.md](FOLDER_AND_MEMORY_MAP.md)** — workspace folder layout, every memory file with a one-line description, all infrastructure IDs (Supabase / Vercel / Stripe / GitHub), MCP plugin UUIDs, env vars.

---

## 9. How to keep this hub fresh

This doc goes stale fast if nobody updates it. Standing rule: **at the end of every session that changes scope, brand, pricing, or infrastructure, update the relevant spoke and bump §1's "Last updated" date here.** Also bump it whenever Master O says "remember this" about anything that lands in one of the four sections (Big picture, Pricing, Stack, Phase plan).

If the hub and a memory file disagree, the hub wins (because Master O can read the hub). When they disagree, fix the memory file too — don't leave a quiet contradiction.

— end of MASTER_CONTEXT —
