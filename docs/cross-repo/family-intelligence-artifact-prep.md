# Family Intelligence + Self-Generating Artifact Architecture — cross-repo prep

**Created 2026-05-30 by D-044 (Seven16 family intelligence + artifact architecture as STRATEGIC INTENT).**

**Family memory ref:** `~/.claude/.../memory/project_seven16_family_intelligence_artifact_architecture.md`
**DECISION_LOG:** D-044 in `saas-agency-database/docs/context/DECISION_LOG.md`
**Primary consumer:** Seven16 Academy (the cert/training platform — formerly Bind Lab Academy, renamed per D-037).

This is the paste-ready prep artifact each satellite reads to understand its role in the family intelligence + artifact factory architecture. **Status:** ✅ AUTHORITATIVE DOCTRINE 2026-05-30 (Master O resolved all 4 conflicts; satellites may build against this without further gates).

---

## The business goal (frame everything against)

> **Intuitive AI support + intuitive sales + intuitive onboarding → customer success → retention → reduced refunds + reduced non-renewals.**

Architecture is the mechanism; retention is the goal. If a build decision doesn't connect, it doesn't belong.

---

## The Seven16 loop (mental model)

```
Detect Signal  →  Generate Strategy  →  Create Artifact  →  Train Person  →  Execute Outreach  →  Track Outcome  →  Improve Playbook
```

Each product contributes a stage. The artifact factory is the connective tissue.

---

## ✅ 4 conflicts RESOLVED 2026-05-30 (Master O confirmed all Recommended resolutions)

1. **Credits model:** ✅ **Per-product credits only.** Each product defines its own credit model (Academy Coach Credits internal; DOT Intel per D-036; etc.). NO cross-product currency. Group Hub mirrors balances for ops dashboards. D-034 reinforced.
2. **"Parent command layer" naming:** ✅ **= Group Hub per D-042.** Shared artifact factory + knowledge registry + AI gateway live at Group Hub (seven16group.com). Seven16 Command (the CRM at seven16command.com) is a satellite consuming Group Hub.
3. **`cross_product_tenants` + `cross_product_users` home:** ✅ **Authoritative in Seven16 Command per D-027 SoR.** Group Hub mirrors read-only. Stripe webhook stays in saas-agency-database short-term per D-040 phased path, then migrates to Command.
4. **Worker runtime:** ✅ **Both Edge Functions + pg_cron (in-product) + Inngest (outbound webhook fanout).** D-040 + D-027 Practice 4 both preserved. No new paid infra.

Satellites may now build against D-044 without gate.

---

## Per-satellite role + paste-ready BACKLOG entries

### Seven16 Academy — PRIMARY CONSUMER (drives the build)

```markdown
**[FAMILY-PRIMARY] Intelligence + Artifact Architecture — Academy as Phase 1-4 driver (D-044)**
*Source:* `saas-agency-database/docs/cross-repo/family-intelligence-artifact-prep.md` + family memory `project_seven16_family_intelligence_artifact_architecture.md`.

Academy is the primary consumer of the family intelligence + artifact factory architecture. The Seven16 loop centers on Academy as the training/practice surface for what other products' signals + strategies generate. Three multi-session sub-arcs:

A. **Mission pack template — the canonical artifact** (~2-3 Academy sessions)
- Define the `academy_mission_pack` template schema: lesson + quiz + roleplay + rubric + video storyboard + script card + field assignment.
- This becomes the model OTHER artifact types in the family build against.
- Schema validation, source-grounding, anti-slop list per D-044.
- Initial coach + mission seed data for the DOT Intel Certified Trucking Producer cert (the live v1 cert per D-029).

B. **Voice + Remotion video** (~2-3 Academy sessions)
- Voice capture + Whisper transcription + voice roleplay scoring.
- Remotion video render template (programmatic video for training explainers).
- Interactive video pause-questions + H5P-style native interactions.

C. **Subscribe to cross-product trigger events** (~1 Academy session, post Group Hub Phase 1)
- Wire Academy as event consumer for: `dotintel.risk_profile.updated`, `command.renewal.upcoming`, `agencysignal.target_list.created`, `email.engagement.low`.
- When triggered, auto-generate a draft Academy mission pack with the real-prospect context as source.
- This is the closed-loop magic — training that responds to actual business situations, not generic curriculum.

Sequencing: A is greenfield bake-in at v1; B can run in parallel; C requires Group Hub Phase 1 endpoint live first. Read D-044 BEFORE design decisions — but DON'T commit code against the 4 conflicts until Master O resolves them.
```

### Group Hub (seven16-group-site) — owns the artifact factory + knowledge registry

```markdown
**[FAMILY-HUB] Artifact factory + knowledge registry build (D-044, extends D-042)**
*Source:* family memory `project_seven16_family_intelligence_artifact_architecture.md` + `project_seven16_group_master_command_center.md`.

Group Hub's responsibility expands per D-044 to own the family artifact factory + shared knowledge registry. This extends the D-042 Phase 2 work; no new repo needed.

A. **Artifact factory tables + API** (~2 sessions)
- `artifact_templates`, `artifacts`, `artifact_reviews` tables in Group Hub Supabase.
- `/api/artifacts/generate` + `/api/artifacts/auto` endpoints (HMAC-signed per D-027 Practice 8).
- RLS per security baseline + D-040 tenant isolation.

B. **Renderers** (~1-2 sessions)
- PDF (Playwright HTML→PDF or React PDF), PPTX (PptxGenJS), DOCX (docx npm). All OSS free-tier per `feedback_no_paid_services_until_revenue`.
- Schema validation per artifact template.

C. **Shared knowledge registry** (~2 sessions)
- `shared_knowledge_sources` + `shared_knowledge_chunks` (pgvector embeddings).
- Approved knowledge per product/coach/artifact-type with `can_cite_user_facing` + `can_train_outputs` + `expires_at` flags.
- Anti-slop source-grounding gate.

D. **Draft/review UI** (~1 session)
- Human review queue surface in Group Hub admin.
- Review checklist per D-044 §19.3 (accurate / source_grounded / no_unapproved_claims / tone_correct / tenant_safe / external_safe / ready_to_publish).

E. **Cross-product automation recipes** (~1-2 sessions, after A-D)
- Seed 4 recipes from D-044 §15: DOT Intel risk alert → Academy + Email; Survey close → Insights + Email; AgencySignal list → Recruiting + Coach roleplay; Command renewal → DOT Intel + Academy + Email.

Sequencing: A-B-C-D in order; E after all four. All HMAC-signed. AI calls route through D-042 AI Gateway. Workers = Edge Functions + Inngest per the proposed conflict resolution. Read D-044 + D-042; don't commit against the 4 conflicts pre-resolution.
```

### DOT Intel — Signal source

```markdown
**[FAMILY] Intelligence + artifact participation (D-044)**
*Source:* family memory `project_seven16_family_intelligence_artifact_architecture.md`.

DOT Intel is the signal-detection layer for the family. Two sub-arcs:

A. **Event emission** (~1 session, after Group Hub `/api/events/ingest` ships)
- Emit `dotintel.risk_profile.updated` when carrier risk crosses a threshold.
- Emit `dotintel.alert.created` for FMCSA changes / authority shifts / insurance filing changes.
- Use the existing HMAC POSTer pattern from D-042.

B. **Artifact templates** (~1 session, post Group Hub Phase 2)
- Register `dotintel_risk_brief_pdf` template (producer-facing risk profile summary).
- Wire `/api/artifacts/generate` calls from DOT Intel UI when user clicks "Generate Risk Brief."
- The brief becomes Academy mission context + Email outreach context + Command renewal-defense context.

DOT Intel doesn't build the artifact factory; it CONSUMES it as a producer of source context + a generator of risk-brief artifacts.
```

### Seven16 Command — CRM execution layer

```markdown
**[FAMILY] Intelligence + artifact participation (D-044)**
*Source:* family memory `project_seven16_family_intelligence_artifact_architecture.md`.

Command is the CRM execution layer + customer-state SoR (per D-027). The artifact factory's `command_renewal_defense_plan` template is one of the most important — it triggers the full closed loop.

A. **Event emission + consumption** (~1 session)
- Emit `command.prospect.created` / `command.submission.created` / `command.renewal.upcoming` (90-day) / `command.activity.logged` / `command.client.risk_review.due`.
- Subscribe to DOT Intel risk + Survey insights events for cross-product context.

B. **Renewal defense plan template** (~1 session, post Group Hub Phase 2)
- Register `command_renewal_defense_plan` template.
- When `command.renewal.upcoming` fires: pull DOT Intel risk + Academy training gaps + Email outreach capability + generate the full pack (PDF strategy + producer talk track + email sequence + Academy roleplay assignment + client survey invite).
- This is Phase 5 cross-product automation recipe #4 — the canonical demonstration of the Seven16 loop.

Command's bidirectional role (per D-042) applies: it's BOTH a satellite emitting events AND the customer-state SoR Group Hub mirrors from. Tables align with D-040 canonical shapes.
```

### Seven16 Email — Outreach delivery

```markdown
**[FAMILY] Intelligence + artifact participation (D-044)**
*Source:* family memory `project_seven16_family_intelligence_artifact_architecture.md`.

Email is the outreach delivery layer. Two sub-arcs:

A. **Event emission** (~1 session)
- Emit `email.campaign.created` / `email.campaign.sent` / `email.engagement.low`.
- Low-engagement events trigger Academy micro-lessons (per the Phase 5 recipe).

B. **Email sequence artifact template** (~1 session)
- Register `email_campaign_sequence` template.
- Other products call `/api/artifacts/generate` with this template + audience context → get a draft sequence back, then orchestrate sending via the Seven16 Email API.
- The artifact factory generates the COPY; Email's existing send infrastructure delivers it.
```

### Seven16 Survey — Insight capture

```markdown
**[FAMILY] Intelligence + artifact participation (D-044)**
*Source:* family memory `project_seven16_family_intelligence_artifact_architecture.md`.

Survey closes the feedback loop. Two sub-arcs:

A. **Event emission** (~1 session)
- Emit `survey.created` / `survey.response.received` / `survey.closed`.
- Buying-intent responses trigger Command CRM task + Email follow-up per Phase 5 recipe #2.

B. **Survey insights report template** (~1 session)
- Register `survey_insights_report` template.
- Auto-generates a PDF insights report + email follow-up sequence + sales call script when survey closes.
- The Lane B kanban (shipped 2026-05-26 per D-041) feeds tenant + producer context.
```

### Agency Signal — Distribution intelligence

```markdown
**[FAMILY] Intelligence + artifact participation (D-044)**
*Source:* family memory `project_seven16_family_intelligence_artifact_architecture.md`.

AgencySignal's territory plans + recruiting scripts are family artifact types. Two sub-arcs:

A. **Event emission** (~1 session)
- Emit `agencysignal.target_list.created` / `agencysignal.agency.scored`.
- New target lists trigger Email recruiting sequence + Academy Distribution Coach roleplay per Phase 5 recipe #3.

B. **Territory plan + recruiting script templates** (~1 session)
- Register `agencysignal_territory_plan` template (PDF).
- Recruiting script + email sequence + Academy roleplay all triggered from one event chain.
```

### Bind Lab — Wholesale execution (BAKE INTO Phase B)

```markdown
**[FAMILY] Intelligence + artifact participation (D-044) — BAKE INTO Phase B build**
*Source:* family memory `project_seven16_family_intelligence_artifact_architecture.md`.

Bind Lab Phase B hasn't started. When it does, bake the intelligence + artifact participation in from day one:

- Event emission for submission lifecycle (`bindlab.submission.created` / `bindlab.binder.bound` / `bindlab.appetite.matched`).
- Submission template artifact type (pre-filled per vertical, per Bind Lab MGA/wholesale pricing).
- Subscribe to AgencySignal target events + DOT Intel risk events for carrier-side context.
- Multi-tenant per D-040 from day one — wholesalers are genuine team tenants.
```

### DotCarriers / DotAgencies — BAKE INTO decouple

```markdown
**[FAMILY] Intelligence + artifact participation (D-044) — BAKE INTO decouple build**
*Source:* family memory `project_seven16_family_intelligence_artifact_architecture.md`.

Both products are pre-decouple. When each decouple session opens, bake event emission + artifact participation in from day one:

- DotCarriers emits carrier-directory events + consumes DOT Intel risk events.
- DotAgencies emits agency-directory events + consumes AgencySignal events.
- Both participate in cross-product artifact generation as source context.
```

---

## Order of operations across the family

1. **NOW:** Master O resolves the 4 conflicts (~15 min total). This unblocks everything downstream.
2. **Phase 1 (Group Hub):** registry + event bus + `/api/events/ingest` HMAC endpoint (~3 sessions). D-042 Phase 1 + D-044 §"Phase 1" together.
3. **Phase 2 (Group Hub):** artifact factory + renderers + knowledge registry + draft/review UI (~4-5 sessions).
4. **Phase 3 (per-satellite parallel):** each satellite registers its primary artifact template + emits its primary events. ~1-2 sessions per satellite, can run in parallel.
5. **Phase 4 (Academy primary):** mission pack template + voice + Remotion video (~3-4 Academy sessions). Can run partially in parallel with Phase 3.
6. **Phase 5 (Group Hub):** seed 4 cross-product automation recipes (~2-3 sessions).
7. **Phase 6 (Academy primary):** interactive voice training + manager review (~2-3 sessions).

**Total estimate:** ~15-20 sessions across Group Hub + Academy + per-satellite to reach Phase 5 production-ready. Each phase ships in-place.

---

## Anti-slop guardrails (read every session that touches AI-generated user surfaces)

Every artifact MUST include: Source list · Confidence level · Assumptions · User-editable draft state · Review status · Generated timestamp · Product context used.

External-facing artifacts NEVER auto-publish. Draft → review → approved → published. Only internal notes may bypass.

This is the mechanism that distinguishes self-generating artifacts that ACTUALLY HELP from AI slop that erodes trust + drives refunds. The architecture exists to enforce this. Lock it in every product session's UI prompts.

---

## Tracking — who's done what

Update this table as each sub-arc lands:

| Product | Event emission | Artifact templates | Cross-product subscription |
|---|---|---|---|
| Seven16 Academy (PRIMARY) | ⏳ | ⏳ mission pack — canonical | ⏳ Phase 4 closed-loop |
| Group Hub (artifact factory) | n/a (it's the endpoint) | n/a (owns the registry) | n/a |
| DOT Intel | ⏳ | ⏳ risk brief | n/a (signal source) |
| Seven16 Command | ⏳ bidirectional | ⏳ renewal defense plan | ⏳ DOT Intel + Survey |
| Seven16 Email | ⏳ | ⏳ email sequence | ⏳ low-engagement → Academy |
| Seven16 Survey | ⏳ | ⏳ insights report | ⏳ buying-intent → Command + Email |
| Agency Signal | ⏳ | ⏳ territory plan + recruiting script | ⏳ target list → Email + Academy |
| Bind Lab | ⏳ bake into Phase B | ⏳ submission templates | ⏳ AgencySignal + DOT Intel |
| DotCarriers | ⏳ bake into decouple | ⏳ carrier-directory | ⏳ DOT Intel signals |
| DotAgencies | ⏳ bake into decouple | ⏳ agency-directory | ⏳ AgencySignal signals |
| Seven16 Group Support | ⏳ bake when scoped | ⏳ support knowledge mining | ⏳ all products |

When each sub-arc ships: update the row + close the BACKLOG item.
