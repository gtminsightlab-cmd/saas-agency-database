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

## 10. Charter Member integration — PENDING MASTER O DECISION

D-018 (amended by D-021) states "Charter Members get best TIQ submission band rate locked for life." With three named TIQ tiers now locked, the integration needs concrete mechanics. Three options:

| Option | What charter member gets | Effective discount example | CTO recommendation |
|---|---|---|---|
| **(a) Subscription discount + best overage rate** | 25% off subscription at whatever tier they're on + always Scale-tier overage rate ($1/sub) regardless of tier | Charter Launch = $375/mo + $1 overage. Charter Growth = $1,125 + $1 overage. Charter Scale = $3,000 + $1 (already Scale rate). | ✅ **Recommended.** Compounds with universal credit max-bonus (per D-018 amended). Scales naturally as charter member grows from Launch → Growth → Scale. Subscription discount earns immediate ROI; lowest-tier overage rate becomes more valuable as their submission volume grows. |
| **(b) Always Launch subscription + Scale overage** | Pay Launch fee ($500) at any tier + always Scale-tier overage rate | Charter member with 1,000 sub/mo = $500 + 500 × $1 = $1,000 total (vs. Growth standard at $1,500/mo including 500 + 500 × $2 = $2,500). Big benefit for small-firm wedge. | Most generous to small operators but creates weird tier semantics ("they're on Scale features but Launch pricing"). |
| **(c) Flat % off everything** | 30% off subscription + 30% off overage at any tier | Charter Launch = $350/mo + $2.10 overage. Charter Growth = $1,050 + $1.40. Charter Scale = $2,800 + $0.70. Simplest math. | Cleanest to explain; less compounding with credit-bonus logic from D-018. |

**My CTO recommendation: option (a).** Reasons:
1. Compounds with the D-018 credit max-bonus tier (Charter Members already get +40% credit bonus permanently)
2. Tier semantics stay clean (charter member on "Growth" really IS on Growth, just with charter rate)
3. Scales with growth — as charter member moves from Launch → Growth → Scale, their charter benefit ROI grows
4. 25% off subscription is psychologically meaningful without crushing TIQ unit economics
5. Always-Scale-overage protects them from overage explosion as volume grows (most valuable when they need it most)

**Master O decision needed before this doc is "complete."** Until decided, slide 17–18 of the Charter Member deck (and the SESSION_3 `/pricing` page build) hand-waves "Charter Member rate."

---

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
