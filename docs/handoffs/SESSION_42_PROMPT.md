# SESSION_42 opener — paste-ready

**Goal:** Ship Group Hub Phase 1 Sub-wedge 1 in `seven16-group-site` — the `/api/internal/events` HMAC endpoint + foundation tables that 7+ satellites are waiting on. **~1 focused session.**

---

## Read in this order (~10 min)

1. [`docs/handoffs/SESSION_41_FAMILY_FOUNDATION_HANDOFF.md`](SESSION_41_FAMILY_FOUNDATION_HANDOFF.md) — the 72-hour doctrine arc that landed before this session
2. [`docs/BACKLOG.md`](../BACKLOG.md) — top entry is `[FAMILY] D-045 Command Center visual refresh — LIVE`
3. Family memory hub: `C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database\memory\MEMORY.md`
4. Specifically these family memory files:
   - `project_seven16_group_master_command_center.md` (D-042 spec — THE primary source for this session)
   - `project_seven16_family_intelligence_artifact_architecture.md` (D-044 — extends Group Hub responsibilities)
   - `reference_family_platform_architecture.md` (D-040 — multi-tenant + RLS pattern)
   - `reference_family_supabase_security_baseline.md` (4-tier RLS + audit recipe + anon-revoke gotcha)
   - `reference_family_api_integration_mesh.md` (D-027 Practice 8 — HMAC signing)
5. [`saas-agency-database/docs/cross-repo/family-master-command-center-prep.md`](../cross-repo/family-master-command-center-prep.md) — what each satellite is waiting for

---

## State at SESSION_42 open

### What's locked + LIVE (don't re-derive)

- **9 family-wide standards** authoritative (D-037 / D-038 / D-039 / D-040 / D-041 / D-042 / D-043 / D-044 / D-045) — see `docs/context/DECISION_LOG.md`
- **D-045 visual lock LIVE** at seven16group.com — Manrope sans display + 14 `--color-s16-*` tokens + brighter Seven16 gold serving in production
- **Family memory hub** = single source of truth; auto-loads for saas-agency-database; read-on-open elsewhere
- **Charter Member program** = KILLED (D-034) + ROLLED BACK in code (D-039); don't re-introduce
- **Group Hub role-split** locked per D-042: Group Hub (seven16group.com) = INTERNAL ops; Seven16 Command (seven16command.com) = EXTERNAL customer CRM + customer-state SoR per D-027; saas-agency-database = interim billing host per D-040 phased path

### What's NOT yet built (the work this session opens)

- Group Hub Phase 1 — none of the foundation tables exist yet
- `/api/internal/events` HMAC endpoint — not yet built
- Seven16 family product registry seed — exists only as a list in family memory; not yet a database row

---

## Scope — SESSION_42 = Group Hub Phase 1 Sub-wedge 1

Single focused session. Ship the foundation that unblocks 7+ satellites.

### Tasks (in execution order)

**Sub-wedge A — Foundation tables** (~30 min)

Create Supabase migration in `seven16-group-site/supabase/migrations/` for:

1. **`seven16_products`** — family product registry
   - Schema per D-042 §10 (id / product_key / name / domain / status / environment / data_sensitivity / owner_user_id / stripe_product_ids[] / vercel_project_id / supabase_project_id / cloudflare_zone_id / sentry_project_id / github_repo / created_at / updated_at)
   - Seed all 10 family products (DOT Intel · Agency Signal · Bind Lab · Seven16 Command · Seven16 Email · Seven16 Survey · Seven16 Academy · DotCarriers · DotAgencies · Seven16 Group Support)
   - RLS per security baseline 4-tier model (Tier 4 service-role-only for writes; Tier 2 authenticated-read for parent admins)

2. **`seven16_events`** — cross-product event bus
   - Schema per D-044 §7 (id / event_key / source_product_id / parent_organization_id (nullable) / product_tenant_id / product_user_id / event_type / entity_type / entity_id / payload jsonb / normalized_summary / sensitivity / processing_status / occurred_at / received_at / processed_at)
   - Indexes: `(source_product_id, event_type, occurred_at desc)` + `(parent_organization_id, occurred_at desc)` per index-on-RLS standard
   - RLS Tier 4 (service-role-only); authenticated-parent-admin SELECT

3. **`provider_accounts`** — connected provider registry
   - Schema per D-042 §10 (provider / account_name / account_id / status / environment / secret_ref / metadata jsonb)
   - Seed at least: Stripe (the parent LLC account `acct_1TLUF6HmqSDkUoqw`) + Vercel + Supabase + Sentry + Anthropic
   - Secrets via `secret_ref` pointer to Supabase Vault (NOT plaintext)

Apply via Supabase MCP `apply_migration` (atomic transaction). Run `get_advisors` after to verify 0 ERROR.

**Sub-wedge B — `/api/internal/events` HMAC endpoint** (~45 min)

Build the canonical HMAC-signed event ingestion endpoint that every satellite will POST to.

1. Create `src/app/api/internal/events/route.ts`:
   - POST handler
   - HMAC-SHA256 signature verification (D-027 Practice 8)
   - Per-satellite shared secret lookup via `provider_accounts` table or env var `SEVEN16_INTERNAL_<PRODUCT_KEY>_HMAC_SECRET`
   - Replay protection (15-minute timestamp window)
   - Idempotency check (event_key uniqueness)
   - Persist to `seven16_events` table
   - Return `{ ok: true, event_id }` on success; structured errors on failure
2. Environment variables: `SEVEN16_INTERNAL_HMAC_SECRET_<PRODUCT_KEY>` per satellite (start with Agency Signal + DOT Intel + Seven16 Email + Bind Lab — the 4 active satellites)
3. Local test via curl: HMAC-signed POST → 200; unsigned POST → 400; wrong-signature POST → 401

**Sub-wedge C — Validation** (~15 min)

1. `npx tsc --noEmit` clean
2. `npm run lint` clean (or pre-existing warnings only)
3. `npx next build` clean
4. Local curl smoke: signed event from `agencysignal` slug → 200; persisted to `seven16_events`; visible via Supabase Studio
5. Supabase `get_advisors` (security + performance) → 0 ERROR

---

## Acceptance criteria

Session is done when:

- ✅ 3 tables exist + RLS enforced + indexes in place + seeded
- ✅ `/api/internal/events` POST returns 200 on valid HMAC-signed request + persists event
- ✅ Returns 400 on missing signature / 401 on invalid signature / 409 on duplicate event_key (idempotency)
- ✅ Supabase advisors: 0 ERROR (warnings acceptable)
- ✅ Typecheck + lint + build all clean
- ✅ Commit + push to `main` with detailed message referencing D-042 + D-044
- ✅ BACKLOG entries in 4 active satellite repos updated to flip from "waiting for endpoint" → "ready to wire telemetry POSTer"

---

## Doctrine refs (don't re-derive — these are LOCKED)

- **D-040** — multi-tenant + RLS + 3-level access + Edge Function workers (NOT Railway/Render/Fly)
- **D-042** — Group Hub spec §10 (table schemas) + §6 (Stripe webhook standard) + 15 non-negotiable rules
- **D-044** — event bus + 13 universal artifact types + anti-slop guardrails
- **D-027 Practice 8** — HMAC signing with per-satellite shared secret + 5-min replay window
- **Security baseline** — 4-tier RLS model + anon SECURITY DEFINER revoke gotcha + audit recipe

---

## What's NOT in scope for this session

Don't get sucked into adjacent work:

- ❌ Artifact factory tables (Phase 2 — separate session)
- ❌ Cost ledger / AI usage ledger tables (Phase 2)
- ❌ Provider connector implementations (Phase 2 — Stripe sync first)
- ❌ Cross-product automation recipes (Phase 5)
- ❌ Admin UI for product registry (Phase 1 Sub-wedge 2 — separate session)
- ❌ Portfolio dashboard (Phase 1 Sub-wedge 3 — separate session)
- ❌ D-045 visual adoption in other repos (parallel work; not this session's scope)

**Definition of "done" for THIS session:** the HMAC endpoint accepts a signed POST + persists. That's it. Stop there. Phase 1 Sub-wedges 2 + 3 are separate sessions.

---

## Honest scope flag

Group Hub Phase 1 in total is ~3 sessions. This session is **Sub-wedge 1 of 3**. After this lands:

- **SESSION_43** = Phase 1 Sub-wedge 2 — Stripe read-only sync (mirror products + prices + subscriptions + invoices) + provider sync job
- **SESSION_44** = Phase 1 Sub-wedge 3 — basic portfolio dashboard + admin UI for product registry
- Then satellites can wire telemetry POSTers (parallel ~1 session each) → real value starts flowing

Stick to scope. Ship the endpoint. Stop. Don't drift.

---

## Cross-repo prep ready for satellites (after this session lands)

Once `/api/internal/events` is LIVE:
- Each satellite's next session opens, reads their block in `family-master-command-center-prep.md`, implements the ~1-session telemetry POSTer sub-arc (Agency Signal / DOT Intel / Seven16 Email / Bind Lab can all run in parallel).
- The canonical TS helper shape is in `family-master-command-center-prep.md` §"Common shared helper" — copy verbatim per satellite.

---

## Honest CTO note

The temptation will be to build everything in one heroic session. **Don't.** Phase 1 Sub-wedge 1 is intentionally narrow because (a) HMAC + RLS + idempotency are easy to get subtly wrong if rushed, and (b) the rest of Phase 1 benefits from the endpoint being battle-tested with at least one real satellite POSTing before you build the dashboard on top.

Ship the endpoint. Get one satellite (recommend Agency Signal — closest familiarity) to POST a test event. Verify the row lands. Then close the session. The next session has a solid foundation to build on.
