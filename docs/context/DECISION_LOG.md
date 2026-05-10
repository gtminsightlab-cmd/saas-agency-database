# Decision Log — Seven16 Group

**Last updated:** 2026-05-10 (D-012 added — directory build host)
**Companion to:** [MASTER_CONTEXT.md](MASTER_CONTEXT.md)

> This doc is the **frozen list of decisions Master O has already made**. If a future Claude session is about to relitigate something on this list, stop — the answer is here.
>
> When a new decision lands, add it under the right category with a date and a "Why" line so the reasoning travels with the verdict.

---

## 1. Brand architecture (D-001 through D-011)

| # | Decision | Date | Why |
|---|---|---|---|
| **D-001** | Brand architecture = **Option C**. Separate brands for the market, shared infrastructure for the business, single login for the customer. | 2026-04-30 | Lets each product earn its own audience without rebuilding plumbing. Required for the 2027 bundle. |
| **D-002** | Pricing locked, "little guy first" — every consumer tier under the $500 P-card threshold so a producer can expense without manager sign-off. | 2026-04-30 | $19 Producer is the wedge. Everything follows from giving the working producer a yes without bureaucracy. |
| **D-003** | **Seven16 Group is not a product.** It's the trust/authority layer. The page a VP lands on after reading a LinkedIn post. | 2026-04-30 | Avoids brand confusion — products carry the value prop, Seven16 carries the credibility. |
| **D-004** | **Agency Signal** is the new market name for the product previously called "SaaS Agency Database" / "Agency Data Seven16". The existing build stays in production. | 2026-04-30 | Foundation is good, no rebuild needed. Older docs that say "SaaS Agency Database" map to this. |
| **D-005** | **2027 bundle:** $179/mo Seven16 Intelligence = DOT Intel Business + Agency Signal Growth. | 2026-04-30 | Anchors the bundle math: more than either single tier, less than the sum. |
| **D-006** | Build shared auth + RLS day one. One Supabase org, separate schemas. One Stripe customer per user across products. | 2026-04-30 | The 2027 bundle requires it. Retrofitting is expensive — and will be more expensive then. |
| **D-007** | **DOT Intel = full rebuild on Seven16 stack.** Same URL (dotintel.io), new bones. Old DOT Intel project is reference-only for learnings; code is NOT migrated. | 2026-04-30 | Old project's architecture isn't compatible with the shared-auth bundle requirement. Rebuild is cheaper than migrating. |
| **D-008** | **Supabase multi-project topology** — `seven16-platform` (auth + tenants + entitlements + master control center) plus Seven16-built product satellites: Agency Signal, DOT Intel, Threshold IQ, Seven16Recruit. (Growtheon does NOT get a satellite — it's a reseller arrangement on third-party infrastructure per D-010.) Supersedes the "one project, separate schemas" reading of D-006. **Cost note (2026-05-02):** real per-satellite cost is $10/mo on Pro plan, not the $25/mo originally estimated. Full family at maturity = 4 satellites + 1 platform = +$20/mo over today, not the ~$50/mo originally noted. | 2026-05-01 | M&A optionality + cross-sell + master control center are all required. Multi-project is the only architecture that honors all three, in exchange for clean blast-radius separation and a viable carve-out path if any Seven16-built product is ever sold. |
| **D-009** | **Threshold IQ** is the locked market name for the third platform product (working name: `seven16-distribution`; descriptive: MGU/wholesaler operating CRM). Domain `thresholdiq.io` secured on Cloudflare 2026-05-02. Brand surface: single-word **Threshold** with `IQ` suffix on URL/wordmark. Triple meaning — doorway (founder crossing into the market), underwriting threshold (appetite/premium/loss-ratio thresholds are native MGU vocabulary), growth threshold ("crossing into scale"). Scope: producer lifecycle, contracting, licensing, E&O tracking, appointments, exception-based compliance. Tenant zero = Seven16 Group. | 2026-05-02 | Native vocabulary for the ICP — insurance pros recognize "threshold" as their daily language. Editorial/utilitarian positioning differentiates from generic SaaS. Pricing already set in the build session, family-integration pricing collaboration deferred to a future session. |
| **D-010** | **Standalone-capable add-on architecture (two delivery models).** Two products are sold as standalone OR attachable add-ons — neither is bundled inside a platform — but their delivery models differ: <br>**(a) Growtheon — third-party SaaS reseller.** Seven16 resells a GHL-like platform under the Growtheon white-label brand. No Seven16-owned Supabase satellite; the underlying CRM runs on the third-party vendor's infrastructure. Tracked in `seven16-platform.products` and `seven16-platform.entitlements` so we can bill via Stripe and show entitlements in the master control center; provisioning creates a sub-account on the upstream vendor and stores the reference in the entitlement metadata. Reseller margin model is open question #2 in §9. <br>**(b) Seven16Recruit — Seven16-built AI tool.** Own Supabase satellite per D-008. Two delivery surfaces: standalone (own UI for non-customers) and plug-in (API/integration into Threshold IQ or external customer CRM). Stealth, attorney-gated. <br>Both share the same entitlement pattern: a tenant can subscribe to either without any platform entitlement, and any platform tenant can attach either. The existing `unique(tenant_id, product_id)` constraint in `entitlements` allows multiple distinct products per tenant. | 2026-05-02 | Maximises addressable market — customers who want one capability shouldn't be forced into a platform commitment. Different delivery models reflect business reality: Growtheon's value is reseller economics on an existing platform; Seven16Recruit's value is Seven16-built AI capability. Same entitlement plumbing, different infrastructure shape. |
| **D-011** | **Target market = emerging / startup small firms.** The product family deliberately fills the gap where competitors (legacy carrier-grade systems, large-broker tools, GHL+enterprise CRMs) are too robust or too expensive. Our stack and capabilities aren't as deep — that's intentional. Pricing tiers and onboarding flows are designed for the firm that can't justify procurement, can't afford a $5k/mo seat license, and needs to start producing quickly. | 2026-05-02 | Codifies what's been implicit since D-002. Every future scope, pricing, and feature decision should pass the "would an emerging firm with one P-card actually buy this today?" test before adding cost or complexity. Larger customers welcome but never the design target. |
| **D-012** | **Directory build host = `dotintel2` repo + `vbhlacdrcqdqnvftqtin` Supabase satellite.** The five new schemas from the directory build spec (`directory.agent_*`, `wholesaler.*`, `carrier_market.*`, `content.*`, `marketplace.*`) live in dotintel2's Supabase satellite, not saas-agency-database's. Spec + kickoff + status tracker archived at `dotintel2/docs/specs/dotintel-directory-build-{spec,kickoff,status}.md`. Agency-side tables (`directory.agencies` / `contacts` / `appointments`) currently live in saas-agency-database's `sdlsdovuljuymgymarou` and will mirror over to `vbhlacdrcqdqnvftqtin` via a future Task 1.F when integration is needed. **Note:** the wrap-up from the dotintel2 session 25 referred to this as "D-009" — that number was already taken (Threshold IQ name lock); it's logged here as D-012. | 2026-05-10 | Spec §4 diagrammed all five schemas under one "seven16-app" Supabase project, but D-008 deliberately splits satellites per product. Putting the directory build in dotintel2 keeps it co-located with the heavier data spine (`carriers` 50K rows, `inshist_raw` 7.4M rows, `carrier_insurance_current` 19.7K rows). Mirroring the 30K-ish agency rows from saas-agency-database into dotintel2 is mechanically simpler than mirroring 7.4M+ rows the other direction. URL-strategy question for the new agent/wholesaler directories (sub-path of directory.seven16group.com vs. dotintel.io paths vs. new TLD) remains §9 open question #1 — this decision is host-only, not URL-strategy. |

---

## 2. Pricing (every consumer tier under $500 P-card threshold)

| Product | Free | Mission tier | Mid | Enterprise |
|---|---|---|---|---|
| **DOT Intel** | Free | $29 Pro | $149 Business | $499+ Enterprise |
| **Agency Signal** | Free | **$19 Producer** | $99 Growth | $399+ Enterprise |
| **Bundle 2027** | — | — | $179/mo Seven16 Intelligence (DOT Intel Business + Agency Signal Growth) | — |

**Adjacent product pricing:**
- **Growtheon:** $97/mo flat white-label CRM (GHL competitor). Internal use first; reseller / white-label margin model unresolved (open question).
- **Coaching layer:** $47 PDF / $97 course / $199/mo cohort.

**Decision: pricing copy on the live Agency Signal site is placeholder.** Don't push revisions to the Snapshot vs. Growth Member gap, "100,000 producers" claim, or Free Trial structure until data inventory catches up. Master O is loading data incrementally and will revise marketing claims to match.

---

## 3. Trust copy + Hygiene Credit (Agency Signal — held for rollout)

These were locked 2026-04-24/25 but are NOT yet shipped to the live site. Roll out when data inventory catches up to the claims.

**Enrichment-sourcing language (use generic framing, never name vendors):**
- "Two of the top 10 B2B intelligence platforms" — not "data brokers" (regulatory connotation).
- "LinkedIn data via licensed enrichment partners" — never "we sync with LinkedIn".
- Optional anchor: "the same $15k/year tools enterprise sales teams pay for".

**AI discovery language:**
- ❌ "Twin AI agents"
- ✅ **"Dual-Agent Verification Pipeline"** (one agent discovers, the other verifies)

**Refresh cadence:** 2× per year, paired with Hygiene Credit below to offset the gap vs. competitors' monthly/45-day cadences.

**Hygiene Credit mechanics (Option A):**
- Auto-discount month 6 and month 12 of Growth Member by 10% ($89.10 instead of $99).
- Stacks with any promotional discount — always applied, never suppressed.
- **Marketed as loyalty reward, not data-decay compensation.** "Our way of rewarding Members who stay through a full refresh cycle." Do NOT frame as "data might be stale, here's a refund."
- Stripe wiring: Subscription Schedule with phased pricing OR programmatic coupon at month 6 and 12. **NOT YET WIRED.**

---

## 4. Retired and parked brands (do not reference in current build)

| Brand | Status | Future plan |
|---|---|---|
| **BindLab** | Retired now | Will reprise as **sales development + coaching brand** later. Likely overlaps with the coaching layer ($47/$97/$199). Timing TBD. |
| **Agency Vantage** | Retired now | Will reprise later. Specific scope TBD. |

**What carried forward (already absorbed into current build, no need to reference originals):**
- BindLab multi-entity hierarchy → Supabase shared-org architecture.
- Agency Vantage agency development framework → Agency Signal + coaching layer.
- BSB pipeline recruitment automation → Seven16Recruit.

---

## 5. Cancelled work — do not reopen

When Master O says "skip that" / "take off the to-do list", it's closed scope, not deferred. The list:

- **Carolina Casualty (75+ PU) distribution channels** — cancelled session 11.
- **Berkley Prime extension work** — cancelled session 11.
- **Wiring ISC (Integrated Specialty Coverages) to Berkley carriers** — cancelled session 11. ISC is loaded as agency_wholesaler with NO Berkley appointments. Don't add them.

(See `feedback_cancelled_means_closed.md` in memory for the rule.)

---

## 6. Standing rules from Master O

These are working rules, not point-in-time decisions. Check before doing things they cover.

| Rule | Source memory | Applies when |
|---|---|---|
| **Plugins-first, escalate-last.** Use Supabase / Vercel / Stripe / Cloudflare-via-WebFetch / Bash MCPs before asking Master O. He's the last resort. | `feedback_operating_context.md` | Every session, every task |
| **Explain like he's 5.** Numbered steps, exact button names, paste-ready commands, predict the next prompt. | `feedback_explain_like_5.md` | Whenever Master O has to click / type something himself |
| **Exhaustive handoffs.** Chronological log + migrations + commits + blocked items + identifiers + lessons + opening move. Long memory cost is small; thin handoff cost is real human time. | `feedback_handoff_quality.md` | End of every session involving migrations / commits / debugging |
| **Canary filter + dedupe on every external data load.** Vendor files have decoys. Ask Master O for canary patterns before guessing. Dry-run + report stats before loading. | `feedback_canaries_and_dedupe.md` | Any new vendor xlsx / csv / external feed |
| **Cancelled = closed scope.** Delete from task list, document under "Do not reopen" in handoff. | `feedback_cancelled_means_closed.md` | When Master O says "skip that" |
| **Carrier name lookups use fuzzy/strong match,** not exact. pg_trgm normalized lowercase, tolerate Inc/Corp/Co suffix variants. Internal/programmatic linking by carrier_id is fine. | `feedback_carrier_search_strong_match.md` | Any user-facing carrier search / autocomplete / filter / picker |
| **Pricing copy is placeholder until data inventory catches up.** Don't propose revisions to scale claims (100k producers, $12.5k National Database, 70% email density) or pricing tiers based on data scale. | `feedback_pricing_and_data_strategy.md` | Any marketing copy revision touching scale numbers |
| **OneDrive atomic-write workflow.** Build files >5KB in `/tmp` via bash, `cp` atomically, verify with `wc -c` + `md5sum`. NEVER stream-Edit a >10KB file in OneDrive. | `feedback_onedrive_atomic_writes.md` | Any file write/edit larger than ~5KB into the OneDrive folder |
| **Sandbox doesn't retain GitHub credentials.** Each session needs a fresh PAT. Push from `/tmp/repo-push` clone, never from OneDrive. | `feedback_sandbox_no_github_creds.md` | Every push to GitHub |
| **OneDrive `.git` is permanently broken.** No alternate working clone exists. Don't go hunting for one. | `reference_git_repo_state.md` | Any task involving git in the OneDrive folder |

---

## 7. Architectural decisions (Agency Signal, in production)

| Decision | Date | Detail |
|---|---|---|
| Hosting on subdomain | 2026-04-23 | `directory.seven16group.com` until cutover to `agencysignal.co`. Apex reserved for marketing. Cloudflare CNAME `directory` → Vercel, DNS-only (grey cloud). |
| Multi-tenant from day one | 2026-04-23 | All tables RLS-enabled, scoped by `current_tenant_id()`, super-admin bypass. Default tenant `Seven16 Group` (id `ce52fe1e-aac7-4eee-8712-77e71e2837ce`). |
| Multi-seat invitations | 2026-04-26 (session 9, migration 0055) | Paid plans get 3 seats (owner + 2 invitees). Free = 1. Auto-flip on auth via trigger. |
| Stripe sandbox first, live cutover later | 2026-04-26 | Sandbox account `acct_1TLUF6HmqSDkUoqw`. Live cutover trigger: first paying customer ready to convert. |
| 13 admin modules dark-themed | 2026-04-25 (session 6+7) | Admin uses `#0F172A`/`#111827` dark palette; rest of app stays light. 13-module sidebar layout. |
| Vertical Manager — 4 + 8 verticals | 2026-04-25 | 4 original (Transportation, Healthcare & Human Services, Construction, Agriculture) + 8 added migration 0051. Per-vertical carrier mapping, score weights, materialized view. |
| Trucking-segment badges | 2026-04-26 (migration 0079) | Per-vertical detail page tags carriers as Non-fleet specialist / Mid-market / Mid-fleet / Large-fleet / Specialty E&S / Unsegmented. Empirically derived from 1,419-row Master Trucking DB. |
| Carrier search hits all 1,363 active carriers | 2026-04-26 (migration 0069) | Empty search → ≥150 agency_count default view. Active search → all carriers including the long tail. Fixes "Canal not findable" gap. |
| V5 grain mismatch — no v5_signals migration | 2026-04-26 (migrations 0057-0060) | V5 is parent grain; Supabase agencies are branch grain. Original V5_DATA_INTEGRATION roadmap superseded. Three options documented; recommended path = cluster Supabase branches into synthetic parent rows. |
| Berkley operating-units + 13 wholesalers | 2026-04-27 (migration 0082) | Power-unit bands: 1-14 PU non-fleet → Berkley Small Business; 15-75 PU mid-fleet → Berkley Prime; 1-100+ umbrella → Berkley National; 75+ PU large-fleet → Carolina Casualty (distribution NOT wired — cancelled). |

---

## 8. Architectural decisions (DOT Intel rebuild — pre-build)

Greenfield. Most decisions deferred until Phase 2 build kickoff. What's already locked:

| Decision | Detail |
|---|---|
| Same domain, new bones | dotintel.io stays. Old project (Supabase `vbhlacdrcqdqnvftqtin`) becomes reference-only. |
| Shared Seven16 stack | Vercel + GitHub + Supabase shared-org + Stripe + Cloudflare + Doppler + Sentry + 1Password. |
| Day-1 working-clone fix | Clone outside OneDrive from minute zero (`C:\Users\GTMin\Projects\dot-intel\`). `gh auth login` once. Don't repeat the OneDrive .git mistake. |
| BDM pre-call brief in scope | Prompt 6 Objection #5 says it's the DOT Intel adoption driver. Must be in September launch. (See open question #4 — surface when starting feature spec.) |
| Bootstrap doc location | `docs/spinoffs/dot-carrier-intel/BOOTSTRAP.md` in the Agency Signal repo until DOT Intel has its own repo. |

**Deferred until Phase 2 kickoff:**
- New repo + new Supabase project, or new product surface inside an existing project? (Recommendation in BOOTSTRAP.md §1.5: new repo + new Supabase, but pull FMCSA SAFER via shared ingestion if available.)
- Three-ICP scope: insurance pros ($30-99/mo) / DOT carriers self-service ($10-20/mo) / lead-gen for small trucking ($TBD).

---

## 9. Open questions — surface when contextually relevant

These are tracked but parked. Master O doesn't want them all raised at once.

1. **Directory domain strategy** — DOT Carrier Directory and Agency Marketplace Directory: subdomains under `dotintel.io` / `agencysignal.co`, or new TLDs? *Surface when:* building/naming the directory products (Phase 3, mid-Oct 2026).
2. **Growtheon margin model** — reseller/affiliate vs. white-label control? Pricing structure and margin TBD. *Surface when:* building Growtheon offer pages.
3. **Seven16Recruit stealth duration** — gated on attorney review of W-2 employment agreement. Has the attorney been engaged? *Surface when:* any public-facing Recruit work.
4. **BDM pre-call brief in DOT Intel Phase 2 spec** — this is the adoption driver per Prompt 6. *Surface when:* kicking off DOT Intel rebuild feature spec.

---

## 10. How to add to this log

When a new decision lands, append to the right section with:
- **What** the decision is (one line, written like a verdict).
- **When** it was made (date).
- **Why** Master O made it (one line — protects future-you from undoing it).
- If it supersedes a prior decision, **strike through** the old one and link to this entry.

Don't rewrite history. The log gets fuller, not cleaner.

— end of DECISION_LOG —
