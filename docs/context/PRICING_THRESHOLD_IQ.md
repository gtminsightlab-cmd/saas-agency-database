# Threshold IQ — Pricing & Onboarding Spec

**Locked:** 2026-05-15
**Parent decision:** D-021 (Seven16 Credits & Usage Pricing Architecture) — this doc fills in the TIQ-specific numeric tiers + onboarding operational model that D-021 flagged as "pending cost modeling."
**Positioning anchor:** D-020 (TIQ positioning lock — "Run your MGU like a bigger shop")
**Charter Member integration:** amended D-018 (see §"Charter Member integration" below — final integration model PENDING Master O confirmation)

> **Note on labeling:** Master O's source draft (2026-05-15) used "DOT Intel" in several places as a copy-paste artifact. This spec is for **Threshold IQ (TIQ)** per the family product architecture — TIQ is the wholesaler / MGA / MGU operating system; DOT Intel is the trucking-insurance intelligence platform (separate product, separate satellite). All product references throughout this doc are to TIQ.

---

## 1. Positioning

Threshold IQ is priced as a low-friction, AI-enabled submission intelligence and agency workflow platform for wholesalers, MGAs, MGUs, and retail-focused commercial insurance teams. The pricing model is intentionally designed around **platform access + AI-processed submission volume + active storage** rather than traditional named-seat pricing — aligns with the broader SaaS movement from per-seat → hybrid and usage-based models, and matches D-021's architectural decision (per-org license, NOT per-seat).

The commercial logic: many insurance firms still rely on manual internal staff or offshore teams to key submission data into CRMs, AMS platforms, or document repositories — and those costs reach six figures annually for modest submission volume. TIQ replaces or reduces that labor burden with AI-assisted intake, document analysis, account intelligence, workflow support, and structured account preparation.

---

## 2. Subscription Philosophy

The subscription stays affordable at entry so smaller agencies and wholesalers are not forced into a $2,000–$3,000 monthly commitment before value is proven. The base fee starts at a lower monthly platform fee and scales based on actual usage and retained storage.

Core principles:
- Low monthly entry point.
- Usage-based pricing tied to AI-processed submissions.
- Storage-based scaling so clients who keep large historical document libraries pay for the footprint.
- DIY-first onboarding to minimize friction.
- Paid implementation, migration, and customization only when real labor is required.

---

## 3. TIQ subscription tiers — LOCKED 2026-05-15

| Tier | Monthly platform fee | Included AI-processed submissions | Overage fee per submission | Included active storage | Storage overage |
|------|----------------------|----------------------------------|----------------------------|-------------------------|-----------------|
| **Launch** | **$500/mo** | 100/mo | $3.00 each | 250 GB | $50/mo per add'l 250 GB |
| **Growth** | **$1,500/mo** | 500/mo | $2.00 each | 1 TB | $40/mo per add'l 250 GB |
| **Scale** | **$4,000/mo** | 2,000/mo | $1.00 each | 3 TB | $30/mo per add'l 250 GB |

### Tier intent

- **Launch** — new or smaller agencies / wholesalers / MGA teams that want affordable access to submission intelligence without enterprise commitment.
- **Growth** — teams with meaningful recurring submission flow that want better unit economics, more storage, and broader internal adoption.
- **Scale** — higher-volume operations, larger wholesaler teams, and organizations processing thousands of submissions monthly that need lower marginal submission costs and larger retained datasets.

### Relationship to D-021 architecture

D-021 specified "TIQ per-organization license + submission bands." These three named tiers ARE the submission bands — packaged into legible Launch / Growth / Scale labels rather than left as raw "Tier 1 / Tier 2 / Tier 3" numbers. Per-org license is preserved (any user under the licensed org has access); usage tracked at account level via overage-on-submission count above the included allotment. No per-seat billing. No per-transaction nickel-and-diming below the included submission count.

---

## 4. What every subscription includes

- Access to the TIQ platform.
- Standard workflow configuration.
- AI-assisted submission intake and analysis.
- Structured extraction of submission information into account-ready fields.
- Searchable account and document records.
- Standard dashboards and reporting.
- Standard user administration.
- Self-serve onboarding center.
- Knowledge base and setup documentation.
- Standard support channel.

---

## 5. Billable submission definition

A submission counts when TIQ:
- Receives uploaded submission documents
- Analyzes the submission package
- Extracts structured account data
- Prepares the account for internal review, marketing, or quote-positioning workflow
- Stores the resulting structured record and related files

**Excluded by policy:** duplicate uploads, test files, incomplete setup records.

Customer-facing definition must be unambiguous so prospects understand exactly what they're paying for before signing.

---

## 6. Storage policy

Storage is a visible commercial lever because retained files and AI-derived artifacts create real infrastructure cost over time. Modeled scenario: 10 clients × 10,000 submissions/year = 100,000 submissions/year platform-wide ≈ 500,000 over 5 years. At 15–20 MB per submission, raw retained file volume alone reaches ~1.5–2.0 TB annually and ~7.5–10.0 TB over 5 years before operational overhead.

**Policy:**
- Active storage included up to tier allowance.
- Active storage includes uploaded submission files and standard platform-retained artifacts needed for normal use.
- Additional active storage billed monthly per the overage bands above.
- Customers may reduce cost by purging older files subject to internal retention policy.
- Optional archive storage may be offered later for lower-cost long-term retention. (Not in v1; queue for Phase 2.)

---

## 7. Onboarding model

Product-led first; paid help available when a customer needs labor, customization, or historical migration. Charging separately for onboarding, migration, and professional services is standard SaaS practice when scope varies significantly by customer.

### 7.1 DIY Onboarding — Included

Included with every subscription:
- Step-by-step setup wizard
- Setup checklist
- Video walkthroughs
- Admin quick-start guide
- Field mapping templates
- Standard import templates
- Default workflows and dashboard templates
- Standard email support

### 7.2 Assisted Onboarding — Fixed Fee

**Price: $1,500–$3,500 one-time** (final number TBD per customer scope within the band)

For customers who want guided implementation without major custom work.

Includes:
- Kickoff and planning session
- Live admin setup assistance
- User role and permissions setup
- Standard workflow configuration
- Standard dashboard / report setup
- Launch review and Q&A

### 7.3 Custom Implementation and Migration — Scoped Professional Services

**Price: starting at $5,000 fixed-scope OR $150–$250/hour billed as consulting**

For:
- Historical data imports
- Cognos export mapping (or equivalent BI-tool migrations)
- Prior account history migration from structured exports
- Commission data migration
- Renewal data migration
- Agency reporting migration
- Custom dashboards
- Custom fields and logic
- Workflow customization
- Advanced admin training

---

## 8. Historical data migration policy

Migration support applies to **structured export data only** — not legacy PDF archives.

**Supported:**
- Account history exports
- Commission history exports
- Renewal and policy datasets
- Agency and producer report datasets
- Dashboard / report source exports

**NOT included in standard migration:**
- Legacy PDF cleanup
- OCR conversion of historical archives
- Manual reconstruction of incomplete records
- Open-ended data remediation

This bounded scope keeps the implementation process manageable and makes it easy to use outside consultants when needed.

---

## 9. Support and customization policy

TIQ is designed to be intuitive enough for a customer to self-configure under normal conditions. White-glove help, extensive troubleshooting, custom logic, or specialized reporting is billed separately as services rather than absorbed into base subscription pricing.

**Recommended support structure:**
- Standard support included with subscription
- Assisted onboarding as a one-time implementation service (§7.2)
- Custom migration and customization billed separately (§7.3)
- Optional premium support retainer for customers wanting recurring admin and configuration assistance (§9.1)

### 9.1 Optional premium support retainer

**Price: $500–$2,000/month** (depending on response expectations and workload)

For:
- Ongoing admin support
- Workflow tuning
- Recurring dashboard / report changes
- Troubleshooting
- Light customization
- Monthly platform reviews

---

## 10. Charter Member integration — LOCKED 2026-05-15 (option (a))

D-018 (amended by D-021) states "Charter Members get best TIQ submission band rate locked for life." Master O confirmed CTO recommendation of **option (a)** on 2026-05-15.

**The mechanic:**
- **25% off subscription** at whatever tier the charter member is on
- **PLUS always Scale-tier overage rate ($1/sub)** regardless of which tier they're subscribed to
- Both benefits locked for life per D-018 amended

**Charter Member TIQ pricing:**

| Standard tier | Standard fee | Standard overage | **Charter fee** | **Charter overage** | Charter total at tier's included submissions |
|---|---|---|---|---|---|
| **Launch** | $500/mo | $3/sub | **$375/mo** | **$1/sub** | $375/mo for 100 sub |
| **Growth** | $1,500/mo | $2/sub | **$1,125/mo** | **$1/sub** | $1,125/mo for 500 sub |
| **Scale** | $4,000/mo | $1/sub | **$3,000/mo** | **$1/sub** | $3,000/mo for 2,000 sub |

**Example math (compounding charter member ROI):**
- Charter Launch member at 250 submissions/mo (150 over Launch's 100 included): $375 + 150 × $1 = **$525 total** (vs. standard Launch at $500 + 150 × $3 = $950, OR standard Growth at $1,500). Charter Launch member running 2.5× their included submissions still pays less than standard Launch.
- Charter Growth member at 750 submissions/mo (250 over Growth's 500 included): $1,125 + 250 × $1 = **$1,375 total** (vs. standard Growth at $1,500 + 250 × $2 = $2,000).
- Charter Scale member at 3,500 submissions/mo (1,500 over Scale's 2,000 included): $3,000 + 1,500 × $1 = **$4,500 total** (vs. standard Scale at $4,000 + 1,500 × $1 = $5,500).

**Why this compounds with the rest of D-018:** Charter Members already get +40% credit bonus on top-ups (effective $0.107/credit on universal credits per amended D-018). The TIQ charter mechanic adds 25% off subscription + best overage rate. A charter member running TIQ + buying Agency Signal leads + buying DOT Intel lookups + monitoring with DOT Alerts is getting compound discount across all four surfaces. **A single charter member can save thousands per year vs. standard pricing** — that's the founding-member offer in concrete dollar terms.

**Why option (a) over (b) or (c):**
- Tier semantics stay clean: charter member on Growth really IS on Growth tier (just with charter rate). No "Scale features at Launch pricing" weirdness.
- Scales with charter member's business growth (each new tier they move into = new discount value compounds)
- 25% subscription discount is psychologically meaningful without crushing TIQ unit economics
- Always-Scale-overage protects charter members from overage explosion as their submission volume grows
- Compounds cleanly with the universal credit max-bonus from amended D-018

**Cascaded to:**
- `saas-agency-database/docs/context/DECISION_LOG.md` D-018 entry (amendment note)
- Charter Member deck on Desktop (slides 17-18 can now render real charter math)
- `seven16-distribution/docs/handoffs/SESSION_3_PROMPT.md` (TIQ subsection of /pricing page can render charter math)
- Family memory `project_charter_member_program.md` (specific charter rates per surface)

## 11. Recommended internal operating model

In the near term, custom implementations + migration work + advanced onboarding can be handled by a consultant or specialist contractor. Over time, an internal operations generalist can be hired to manage onboarding, support, troubleshooting, customization coordination, and systems administration.

**Suggested profile for future internal hire:**
- Systems-oriented generalist
- Comfortable with data imports and troubleshooting
- Able to support onboarding and customer success
- Able to coordinate consultants and custom projects
- Able to translate customer workflow needs into internal system requirements

---

## 12. Customer-facing commercial language (drop-in copy)

### Short version
Threshold IQ starts with a low monthly platform fee and scales based on AI-processed submission volume and active storage, giving agencies and wholesalers a more flexible alternative to large up-front enterprise software commitments.

### Onboarding language
DIY onboarding is included with every subscription. Guided onboarding, custom setup, structured historical data migration, and custom reporting are available as paid implementation services.

### Migration language
Historical data migration is supported for structured exports such as account history, commissions, renewals, and reporting datasets. Legacy PDF archive migration and document remediation are not included in standard onboarding.

### Storage language
Each plan includes active storage. Customers that retain larger historical document libraries pay based on storage usage, while customers that purge older files can reduce cost.

---

## 13. Recommended commercial guardrails

- Do not bundle unlimited onboarding into the base subscription.
- Do not include custom migration in standard pricing.
- Do not promise historical PDF conversion as part of implementation.
- Keep storage visible and measurable.
- Use lower entry pricing to reduce friction, then monetize submission volume and storage growth.
- Use services pricing to protect margin on bespoke customer requests.

---

## 14. Strategic rationale (cross-reference)

This pricing and onboarding structure aligns with:
- **D-021** — per-org license + submission bands; universal credit currency for ancillary consumption
- **D-020** — TIQ positioning ("Run your MGU like a bigger shop") — affordable entry tier matches the "before you ARE at scale" claim
- **D-011** — small-firm wedge; Launch tier at $500 is the gateway for emerging MGAs
- **D-002** — small-firm friendly entry (note: $500/mo exceeds the $500 P-card threshold from D-002, but TIQ buyer = MGU owner with budget authority, so D-002's P-card constraint relaxes — preserved as standing rule for producer-tier products like DOT Intel and Agency Signal consumer tiers)

The model gives smaller agencies an affordable entry point, gives larger customers better scaling economics, and ensures custom onboarding + migration + support are funded rather than hidden inside subscription pricing.

---

## 15. Open numeric refinements (track and refine as data informs)

- TIQ Launch baseline submissions: 100/mo locked, but verify against Tenant Zero observed average (~100/mo per MGU from 4,853 submissions / 4 years across the import).
- Assisted Onboarding band ($1,500–$3,500) — pick a default within band for v1 pricing page; tighten as 5+ paid onboardings inform real time-spent.
- Premium support retainer band ($500–$2,000/mo) — collapse to 2 named tiers (e.g., $500 Standard + $1,500 Premium) for clarity on the pricing page if needed.
- Charter Member integration mechanics — see §10, pending Master O decision.

---

## 16. When this doc gets out of date

Update when: (a) Master O decides Charter Member integration option (§10), (b) any tier number changes (subscription fee, included submissions, overage rate, storage allowance), (c) onboarding pricing bands tighten or expand, (d) optional archive storage product ships, (e) the operations generalist is hired (replace §11 with named owner).

---

*End PRICING_THRESHOLD_IQ.md*
