# Family-wide Master Command Center integration — cross-repo prep

**Created 2026-05-28 by D-042 (Seven16 Group Master Command Center spec locked).**

**Family memory ref:** `~/.claude/.../memory/project_seven16_group_master_command_center.md` (the full spec)
**DECISION_LOG:** D-042 in `saas-agency-database/docs/context/DECISION_LOG.md`

This is the **paste-ready prep artifact** that each satellite product's next session reads to start their Master Command Center integration. Per Master O 2026-05-28 directive: "push this down to the other products so that they build their own command centers... ping them so they start to work on it as soon as possible."

---

## The two responsibilities every satellite product has

1. **Wire telemetry POSTer to Group Hub** — every product's session ships a thin HMAC-signed POST to `${SEVEN16_COMMAND_CENTER_URL}/api/internal/events` for AI usage, cost events, security events, product health, billing events.
2. **Build a per-product control room** — the product's own `/admin/products/<product_key>` surface with the §20 tabs (Overview / Revenue / Costs / AI usage / Security / Infrastructure / Deployments / Alerts / Tenants / Settings).

Full spec + the architectural role-split (Group Hub vs Command vs saas-agency-database) is in the family memory file. Read it before scoping the work.

---

## Per-satellite paste-ready BACKLOG entries

Each satellite's next session: copy the matching block below into that repo's `docs/BACKLOG.md` (or equivalent) so the work is tracked.

### DOT Intel (dotintel2 repo)

```markdown
**[FAMILY] Master Command Center integration (D-042)**
*Source:* `saas-agency-database/docs/cross-repo/family-master-command-center-prep.md` + family memory `project_seven16_group_master_command_center.md`.

Two scoped sub-arcs:

A. **Telemetry wire** (~1 session)
- Create `lib/family-integrations/command-center.ts` — HMAC-signed POST helper to `${SEVEN16_COMMAND_CENTER_URL}/api/internal/events`. Null-renders if env vars unset per D-027 Practice 1.
- Wrap every Claude/OpenAI call (risk modules, AI agents, etc.) → emit `ai.usage` event with input/output/cached tokens + cost + latency + model + agent_key + conversation_id + tenant + user.
- Wrap entitlement denials + cross-tenant attempts → emit `security.event`.
- Add cost-event emission on Anthropic/OpenAI + Resend + any other billed provider calls.
- Add `product.health` ping from deploy hook.

B. **Control room buildout** (~1-2 sessions)
- Take existing dashboards (Phase 4 risk-module work, territory intelligence) and re-shape into `/admin/products/dotintel` with §20 tabs.
- Connect to Group Hub's read-API for cross-product context (cost dashboards, alert inbox slice for this product).

Sequencing: A before B. Wait for Group Hub Phase 1 `/api/internal/events` endpoint to ship before A goes live (verify via `curl` health check); until then, leave the wire code in null-render state.
```

### Agency Signal (saas-agency-database — this repo)

```markdown
**[FAMILY] Master Command Center integration (D-042)**
*Source:* `docs/cross-repo/family-master-command-center-prep.md` + family memory `project_seven16_group_master_command_center.md`.

Two scoped sub-arcs:

A. **Telemetry wire** (~1 session)
- Extend `lib/family-integrations/` (which already has email.ts + command.ts) with `command-center.ts` — HMAC-signed POST to `/api/internal/events`. Same null-render pattern as the existing siblings.
- Wrap any Claude/AI calls (currently minimal for AS, but coming with risk insights) → `ai.usage`.
- Wrap stripe webhook events → emit `billing.event` mirror (so Group Hub sees what AS's webhook processed without scraping Stripe twice).
- Wrap support widget LLM calls when seven16groupsupport.com lights up → `ai.usage`.

B. **Control room expansion** (~1 session)
- Existing `/admin/integrations` becomes `/admin/products/agencysignal` with §20 tabs.
- Reuse the partner-management UI patterns from seven16-group-site.

Sequencing: A before B. Wait for Group Hub Phase 1 endpoint.
```

### Seven16 Email (seven16-email repo)

```markdown
**[FAMILY] Master Command Center integration (D-042)**
*Source:* family memory `project_seven16_group_master_command_center.md`.

Two scoped sub-arcs:

A. **Telemetry wire** (~1 session)
- `lib/integrations/command-center.ts` HMAC POSTer.
- Every Resend API call → emit `cost.usage` event with send count + per-send cost (Resend pricing × multiplier). This is the family's largest non-AI variable-cost vector — Group Hub's cost dashboard depends on it.
- Every AI campaign assistance call (the AI agent at Pro+ tiers) → `ai.usage` with token + cost + agent_key.
- Suppression-list hits + bounce-rate spikes + warmup-stage transitions → `product.health` event.
- Stripe webhook (when billing lights up) → `billing.event`.

B. **Control room buildout** (~1-2 sessions)
- `/admin/products/seven16email` with §20 tabs — especially deliverability + warmup-stage + per-tenant send volume dashboards.
- Per-tier overage detection surface (the D-E029 +$10/1k contacts + $5/10k sends overage logic) → emit alerts to Group Hub.

Sequencing: A before B. Phase 1 endpoint required.
```

### Seven16 Survey / Activator (seven16survey repo)

```markdown
**[FAMILY] Master Command Center integration (D-042)**
*Source:* family memory `project_seven16_group_master_command_center.md`.

Two scoped sub-arcs:

A. **Telemetry wire** (~1 session)
- HMAC POSTer for `/api/internal/events`.
- Survey completion events + per-vertical-pack purchase → `billing.event` mirror.
- Lane B kanban + stuck-detection cron → `product.health` event.
- Any AI scoring on survey responses → `ai.usage`.

B. **Control room buildout** (~1 session)
- `/admin/products/seven16survey` with §20 tabs — especially the multi-producer kanban tenant-360 view for Agency + MGA tiers (which is genuinely team-multi-tenant per D-040).

Sequencing: A before B. Phase 1 endpoint required.
```

### Seven16 Command (seven16-command-center repo) — SPECIAL ROLE

```markdown
**[FAMILY] Master Command Center integration (D-042) — SPECIAL: bidirectional**
*Source:* family memory `project_seven16_group_master_command_center.md` (read the role-split section carefully).

Command is BOTH a satellite product (emits its own telemetry to Group Hub) AND the customer-state SoR (Group Hub MIRRORS FROM Command). Design the bidirectional wire from day one.

A. **Outbound telemetry to Group Hub** (~1 session)
- HMAC POSTer for `/api/internal/events`.
- Every CRM action (push event, pull enrichment, customer mutation) → appropriate event type.
- AI agent calls (Command is likely to grow AI features) → `ai.usage`.

B. **Inbound mirror to Group Hub** (~1 session — designed alongside Command's Phase 1 entitlement schema)
- Expose `tenants` / `user_tenant_memberships` / `tenant_product_entitlements` read-API for Group Hub to mirror.
- Webhook fire to Group Hub on every entitlement change → Group Hub mirror stays fresh.
- HMAC-signed both directions (D-027 Practice 8).

C. **Per-product control room** (~1 session)
- `/admin/products/seven16command` with §20 tabs — Command-specific surfaces: pull-API throughput, push-event ingest rate, per-satellite token usage.

Critical: Command's tenant + entitlement schema must match the canonical shapes in D-040's `reference_family_platform_architecture.md`. That's the schema Group Hub mirrors. Get this right at Phase 1 — every other satellite reads from here eventually.
```

### Bind Lab (bindlab repo) — BAKE INTO Phase B

```markdown
**[FAMILY] Master Command Center integration (D-042) — BAKE INTO Phase B build**
*Source:* family memory `project_seven16_group_master_command_center.md`.

Bind Lab Phase B platform build hasn't started — the right time to bake the Master Command Center integration in is from day one of Phase B, not as a retrofit.

When Phase B starts:
- Include HMAC POSTer + telemetry wire in the initial scaffolding.
- Include `/admin/products/bindlab` with §20 tabs in the initial admin scaffolding (NOT a v2 retrofit).
- Bind Lab is a full multi-tenant product (wholesaler with multiple seats per D-040) — telemetry must include tenant_id from day one.
- Submission/binder operations are billable cost events at the wholesale tier — emit `cost.usage` per regulated workflow step.
```

### Seven16 Academy (was Bind Lab Academy) (seven16-academy repo per D-037) — BAKE INTO v1

```markdown
**[FAMILY] Master Command Center integration (D-042) — BAKE INTO v1 build**
*Source:* family memory `project_seven16_group_master_command_center.md`.

Same pattern as Bind Lab — Academy is greenfield, bake the integration in from day one.

When v1 starts:
- HMAC POSTer + telemetry wire in initial scaffolding.
- `/admin/products/seven16academy` with §20 tabs in initial admin scaffolding.
- Cert-completion + cross-product-entitlement-grant events → `billing.event` (the cert is the SKU) + push to Command per D-027 (separate from Group Hub telemetry).
- Mobile-first PWA constraint stays — admin surface is internal-only, so desktop-first is fine for the control room.
```

### DotCarriers / DotAgencies (dotcarriers / dotagencies repos) — BAKE INTO decouple

```markdown
**[FAMILY] Master Command Center integration (D-042) — BAKE INTO decouple build**
*Source:* family memory `project_seven16_group_master_command_center.md`.

Both products are pre-decouple (still sharing dotintel2's Supabase + admin until the decouple sessions land). When each decouples:

- Inherit the DOT Intel HMAC POSTer pattern but emit with the correct `product_key` (`dotcarriers` / `dotagencies` per D-026 slug list).
- Add `/admin/products/dotcarriers` and `/admin/products/dotagencies` with §20 tabs as part of the decouple scaffolding (NOT a v2 retrofit).
- Multi-tenant model per D-040 from day one (these are recruit-side products targeting wholesalers + MGUs).
```

### Seven16 Group Support (seven16-group-support repo, when scoped)

```markdown
**[FAMILY] Master Command Center integration (D-042)**
*Source:* family memory `project_seven16_group_master_command_center.md`.

Support is the AI-heaviest product in the family (LLM-powered support agent). Critical telemetry:
- Every support-agent LLM call → `ai.usage` (with safety flags + abuse detection signals — GPT plan §5).
- Prompt-injection attempts → `security.event` severity=high or critical.
- Per-tenant support-conversation volume → `cost.usage` (AI tokens charged per support session).
- Tickets escalated to human → `product.health` event.

Bake in from day one when Support project scopes.
```

---

## Order of operations across the family

1. **Now:** Group Hub Phase 1 build (seven16-group-site repo) — `/api/internal/events` endpoint + the foundation tables. ~3 sessions.
2. **As soon as Phase 1 endpoint is live:** EVERY satellite product wires its telemetry POSTer (sub-arc A above). Each is ~1 satellite session.
3. **In parallel with #2:** each satellite plans their control-room expansion (sub-arc B).
4. **As control rooms ship:** Group Hub Phase 2 (full Stripe sync + cost dashboards + tenant 360) becomes more useful because more telemetry is flowing.

**Avoid:** any satellite trying to build its control room BEFORE the Group Hub Phase 1 endpoint exists — the cost/AI/security dashboards would have nothing to display.

---

## Common shared helper (each repo can copy + adapt)

To keep the wire consistent across repos, this is the canonical shape of the helper every satellite ships:

```ts
// lib/family-integrations/command-center.ts (or equivalent path per repo)

import crypto from "node:crypto";

type CommandCenterEvent = {
  event_type:
    | "ai.usage" | "cost.usage" | "security.event"
    | "product.health" | "billing.event" | "rate_limit.event"
    | "cache.event" | "webhook.event" | "deployment.event";
  product_key: string; // canonical slug per D-026 (e.g. "agencysignal")
  tenant_id?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  // ... event-specific fields per D-042 schema
};

export async function sendCommandCenterEvent(event: CommandCenterEvent): Promise<void> {
  const url = process.env.SEVEN16_COMMAND_CENTER_URL;
  const key = process.env.SEVEN16_COMMAND_CENTER_KEY;
  if (!url || !key) {
    console.warn(`[command-center] env not configured, skipping (event=${event.event_type})`);
    return;
  }
  const body = JSON.stringify(event);
  const signature = crypto.createHmac("sha256", key).update(body).digest("hex");
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/api/internal/events`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-seven16-product-key": event.product_key,
        "x-seven16-signature": `sha256=${signature}`,
      },
      body,
    });
    if (!res.ok) {
      console.warn(`[command-center] non-OK (event=${event.event_type}): ${res.status}`);
    }
  } catch (e) {
    console.warn(`[command-center] threw (event=${event.event_type}):`, e instanceof Error ? e.message : String(e));
  }
}
```

Every satellite copies this pattern. Centralizing as an npm package (`@seven16/command-center-client`) is a Phase 4 polish — for now, copy-paste is fine.

---

## Tracking — who's done what

Update this table as each satellite's sub-arc A telemetry wire lands:

| Product | Sub-arc A (telemetry wire) | Sub-arc B (control room) |
|---|---|---|
| DOT Intel | ⏳ pending | ⏳ pending |
| Agency Signal | ⏳ pending | ⏳ pending |
| Seven16 Email | ⏳ pending | ⏳ pending |
| Seven16 Survey | ⏳ pending | ⏳ pending |
| Seven16 Command | ⏳ pending (bidirectional) | ⏳ pending |
| Bind Lab | ⏳ bake into Phase B | ⏳ bake into Phase B |
| Seven16 Academy | ⏳ bake into v1 | ⏳ bake into v1 |
| DotCarriers | ⏳ bake into decouple | ⏳ bake into decouple |
| DotAgencies | ⏳ bake into decouple | ⏳ bake into decouple |
| Seven16 Group Support | ⏳ bake when scoped | ⏳ bake when scoped |
| **Group Hub itself (the consumer)** | n/a (it's the endpoint) | 🚧 Phase 1 build queued |

When a satellite ships sub-arc A: update its row + the family-pricing-catalog implementation-status column (if applicable) + close the BACKLOG item in that repo.
