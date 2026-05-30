/**
 * Agency Signal — product positioning content
 * ============================================
 *
 * Single source of truth for the /admin/product-positioning page.
 *
 * Edit content here. The page layout at app/admin/product-positioning/page.tsx
 * reads from this export and never hard-codes copy. Cross-team users (sales,
 * support, onboarding, AI-agent trainers, marketing) read the rendered page;
 * they should NOT need to touch the page component to update wording.
 *
 * Doctrine anchors (do not relitigate without superseding decision):
 *   - D-004  Agency Signal is the customer-facing brand (two words).
 *   - D-023  "Distribution intelligence for commercial insurance" positioning.
 *   - D-034  4-tier transparent buying model; family pricing + Charter killed.
 *
 * To add a section: extend the matching shape below + render it in the page.
 * To edit narrative: update the strings here only.
 */

export type FabRow = {
  feature: string;
  advantage: string;
  benefit: string;
  pain: string;
};

export type IcpBlock = {
  primary: string;
  secondary: string;
  buyerType: string;
  userType: string;
  budgetReality: string;
  triggerEvents: string[];
  commonObjections: string[];
  successOutcomes: string[];
};

export type FamilyProduct = {
  name: string;
  url: string;
  role: string;
  status: "live" | "in-build" | "scaffolded";
};

export type SalesNarrative = {
  positioningStatement: string;
  elevator30: string;
  elevator90: string;
  heroHeadline: string;
  heroSubheadline: string;
  internalTalkingPoints: string[];
  customerFacingExplanation: string;
};

export type AdminUsefulnessBlock = {
  audience: string;
  whatThisGivesThem: string;
  howToUse: string;
};

// ---------------------------------------------------------------------------
// 1. Product Overview
// ---------------------------------------------------------------------------
// Edit the elevator below when product scope changes. The "believes it is"
// language is intentional — it captures the working definition the product
// holds today, not aspirational marketing.
export const PRODUCT_OVERVIEW = {
  productName: "Agency Signal",
  oneLiner: "Distribution intelligence for commercial insurance.",
  domain: "agencysignal.co",
  elevator: [
    "Agency Signal is the commercial-insurance distribution intelligence layer for operators who don't have a six-figure data budget.",
    "We map carrier appointments, producer networks, and agency identity across the full U.S. so a producer, a recruiter, an MGA, or a wholesaler can see where the right agencies already do business — and where they don't.",
    "Built for the operator who needs to find, target, and recruit the right agencies this week, not next quarter.",
  ],
  whatItBelievesItIs:
    "A practical, operator-grade map of the U.S. commercial-insurance distribution landscape — not a list broker, not a CRM, not a generic data warehouse.",
  whatItIsNot: [
    "Not a CRM (Agency Signal feeds CRMs; it doesn't replace one).",
    "Not an AMS (no policy admin, no submissions, no quote-bind).",
    "Not a generic B2B contact database (we are insurance-specific).",
    "Not a Neilson-replacement at consumer tier (only the National Founder License competes on national scope).",
  ],
};

// ---------------------------------------------------------------------------
// 2. Features, Advantages, Benefits (FAB matrix)
// ---------------------------------------------------------------------------
// Add rows as features ship. Keep "pain" specific — vague pain is a slop tell.
export const FAB_MATRIX: FabRow[] = [
  {
    feature: "Carrier-appointment intelligence (264K+ verified appointments)",
    advantage: "Agency × carrier × LOB × state × vertical relationships, refreshed against state-DOI filings.",
    benefit: "Know which agencies write the carriers you compete with — before you call.",
    pain: "I'm calling cold lists where half the agencies are already locked into competitors I'd be displacing.",
  },
  {
    feature: "Producer network + verified contacts (135K+)",
    advantage: "Producer roster joined to agency, geography, vertical, and decision-maker role.",
    benefit: "Reach the producer who actually places the business, not the front desk.",
    pain: "I waste outreach budget hitting generic 'info@' inboxes that go nowhere.",
  },
  {
    feature: "Vertical intelligence (12 verticals mapped, 264K agencies scored)",
    advantage: "Per-vertical agency depth + specialization tiers (Exposure / Growing / Specialist).",
    benefit: "Find the agencies that already write your niche — without rebuilding the list from scratch.",
    pain: "I'm trying to enter a niche but I don't know which agencies have real exposure to it.",
  },
  {
    feature: "Saved lists + change detection",
    advantage: "Lists you build refresh automatically and surface what changed since you last looked.",
    benefit: "Spend the week's prospecting hour on the rows that moved, not the rows that didn't.",
    pain: "Every week I rebuild the same list and re-read the same rows just to find what's new.",
  },
  {
    feature: "Self-serve export (CSV, recruit lists)",
    advantage: "Export-ready files that drop straight into your CRM or outreach tool.",
    benefit: "Skip the 'request a quote, wait three weeks, sign an NDA' dance.",
    pain: "I can't get a sample without a sales call. By the time it lands, the campaign window closed.",
  },
  {
    feature: "Transparent 4-tier pricing (D-034)",
    advantage: "Sample $75 / Monthly $299–$999 / Bulk per-record sliding / National $12,500/yr — published on the page.",
    benefit: "Buy the smallest thing that proves it works. Scale up when it does.",
    pain: "Every quote-driven vendor wants a five-figure commitment before I've even seen the data.",
  },
  {
    feature: "State-DOI sourcing + regulator-grade provenance",
    advantage: "Appointment data comes from state DOI filings, not vendor lookalikes or web scrape.",
    benefit: "Defensible data your underwriting and compliance team can actually trust.",
    pain: "My boss won't let me act on a vendor list because we can't trace where the data came from.",
  },
];

// ---------------------------------------------------------------------------
// 3. Problems This Product Solves
// ---------------------------------------------------------------------------
export const PROBLEMS_SOLVED: Array<{ persona: string; problem: string; agencySignalAnswer: string }> = [
  {
    persona: "New commercial insurance agent",
    problem: "No book, no list, no senior producer to share leads, no agency-paid data subscription.",
    agencySignalAnswer:
      "Browse the directory free. Buy a $75 sample to validate the data. Build a 100-record file when you find your niche. Sample fits a P-card with no manager approval.",
  },
  {
    persona: "Producer entering a new niche",
    problem: "Doesn't know which agencies have real exposure to the target vertical, or which carriers they already write.",
    agencySignalAnswer:
      "Vertical intelligence + carrier-appointment intelligence answer both in one filtered view. Specialist / Growing / Exposure tier per vertical narrows the conversation list.",
  },
  {
    persona: "Producer without agency infrastructure",
    problem: "No agency-paid AMS, no in-house data team, no analyst building target lists every Monday.",
    agencySignalAnswer:
      "Self-serve filters + saved lists + change-detection do the analyst job for a $299/mo subscription instead of a $50k AMS module.",
  },
  {
    persona: "Agent who lacks training, tools, or support",
    problem: "Can't afford the enterprise stack. Doesn't know what to ask for or how to evaluate competing vendors.",
    agencySignalAnswer:
      "Transparent pricing on the page, paid sample to test before commit, plain-language methodology. The Seven16 family will add training (Bind Lab Academy) + always-on support (Seven16 Group Support) as those products ship.",
  },
  {
    persona: "Small distribution team competing against better-funded MGAs/carriers",
    problem: "Competitors have Neilson, ZoomInfo, internal data analysts. They get to the right agencies first.",
    agencySignalAnswer:
      "Same defensible data shape at a fraction of the cost. National Founder License at $12,500/yr is a fraction of what the legacy enterprise vendors charge for similar coverage.",
  },
  {
    persona: "MGA / wholesaler with a real distribution gap",
    problem: "Their territory plan is built on BDM intuition, not observable distribution geography.",
    agencySignalAnswer:
      "White-space mapping by state, vertical, and carrier appointment. National Founder License gives the territory analyst the full picture without a six-month procurement cycle.",
  },
];

// ---------------------------------------------------------------------------
// 4. Ideal Customer Profile
// ---------------------------------------------------------------------------
// Update primary/secondary when the buyer mix shifts. Trigger events are the
// timing signals sales should listen for.
export const ICP: IcpBlock = {
  primary:
    "Commercial-insurance producers and small/mid agencies (~1–25 producers) entering or expanding a niche — transportation, real estate, construction, agriculture, hospitality. Often without a paid data subscription or in-house analyst.",
  secondary:
    "Distribution teams at MGAs, wholesalers, and carriers running territory planning, white-space analysis, or competitive-displacement campaigns. Buys the National Founder License for full U.S. access.",
  buyerType:
    "Producer themselves (Sample $75 / Monthly $299) OR agency principal (Monthly $599–$999) OR VP of Distribution at MGA/wholesaler/carrier (National $12,500/yr).",
  userType:
    "Producer · BDM · agency principal · distribution analyst · recruiter · vendor partnership team.",
  budgetReality:
    "Below the $500 P-card threshold at consumer tier so a producer doesn't need manager sign-off. Annual contract only at National Founder License — designed to be a fraction of what Neilson and similar legacy data vendors charge for comparable national scope.",
  triggerEvents: [
    "Hired into a new commercial-insurance producer role and needs a target list this month.",
    "Carrier just opened a new appetite in a vertical the producer doesn't currently write.",
    "MGA launching a new program and needs to map specialty-agency depth nationally.",
    "Competitor carrier dropped a market — appointment-displacement opportunity.",
    "Quarterly territory planning cycle at a wholesaler.",
    "Renewal cycle approaching on an existing data subscription that wasn't earning its keep.",
  ],
  commonObjections: [
    "\"We already have a data vendor.\" → Try $75 sample, see the difference, then decide.",
    "\"We can't validate vendor data.\" → Methodology is published. Sources are state-DOI filings, not vendor lookalikes.",
    "\"We need to talk to legal before buying.\" → Sample is one-time export, no contract. Monthly is month-to-month. Annual license has standard SaaS terms.",
    "\"How is this different from Neilson?\" → Transparent pricing on the page. Paid sample available. Modular buying. National Founder License is a fraction of Neilson's national fee.",
    "\"Will it integrate with my CRM?\" → CSV export is the v1 integration. Direct push to Seven16 Command CRM coming as the family-mesh integrations ship.",
  ],
  successOutcomes: [
    "Producer books a new appointment conversation within the first 30 days of access.",
    "Agency moves from spreadsheet-built target lists to live, change-detected saved lists.",
    "MGA territory plan rebuilt from observable distribution geography rather than BDM intuition.",
    "Vendor cost dropped 50–90% versus the legacy enterprise data subscription it replaced.",
    "Customer renews the National Founder License at the end of year one.",
  ],
};

// ---------------------------------------------------------------------------
// 5. Competitive Advantages
// ---------------------------------------------------------------------------
// Honest claims only. No "revolutionary" / "best-in-class" / "AI-powered"
// language — it's a credibility tax for this audience.
export const COMPETITIVE_ADVANTAGES: Array<{ heading: string; detail: string }> = [
  {
    heading: "Transparent pricing on the page",
    detail:
      "Sample / monthly / custom / national — published, not gated by a sales call. Most legacy vendors won't quote until you've talked to a rep three times.",
  },
  {
    heading: "Paid sample for $75",
    detail:
      "Validate the data quality with 50 filtered contacts and one CSV before any larger commitment. Reduces buyer risk without cannibalizing real revenue.",
  },
  {
    heading: "Modular buying",
    detail:
      "Buy a state, a vertical, a niche, or the country. No forced bundle. Pricing slides automatically as you commit to more.",
  },
  {
    heading: "Commercial-insurance-specific, not generic B2B",
    detail:
      "Records are filtered around producers, agencies, carrier appointments, and verticals — the entities commercial-insurance distribution actually cares about.",
  },
  {
    heading: "State-DOI sourcing",
    detail:
      "Appointment data is regulator-published, not vendor-scraped. Provenance is defensible if your underwriting or compliance team asks.",
  },
  {
    heading: "Operator-built, not enterprise-IT-built",
    detail:
      "The product is shaped by people who do commercial-insurance distribution work — not a data-engineering team optimizing a generic schema. The pillars match the buyer's workflow.",
  },
  {
    heading: "Seven16 Group family",
    detail:
      "Sits inside a growing family of affordable commercial-insurance tools — data, CRM, email, training, support, survey, intelligence. Each product stays useful on its own, gets better when combined.",
  },
];

// ---------------------------------------------------------------------------
// 6. Seven16 Group Family Fit
// ---------------------------------------------------------------------------
// Update when family roster changes (new product lands, retired product spun out).
// Statuses tracked in family memory `reference_family_product_catalog.md` per D-033.
export const FAMILY_PRODUCTS: FamilyProduct[] = [
  { name: "Agency Signal",     url: "agencysignal.co",         role: "Distribution intelligence — agencies, producers, carrier appointments, verticals.", status: "live" },
  { name: "DOT Intel",         url: "dotintel.io",             role: "Trucking carrier intelligence — DOT lookups, safety scoring, alerts, PDF exports.", status: "live" },
  { name: "DotCarriers",       url: "dotcarriers.io",          role: "Carrier-facing directory — public unclaimed listings, claim flow, profile detail.", status: "in-build" },
  { name: "DotAgencies",       url: "dotagencies.io",          role: "Agent + wholesaler directory — searchable surface for transportation distribution.", status: "in-build" },
  { name: "Bind Lab",          url: "bindlab.io",              role: "Wholesale + MGA operating system — submission intake, UW workflow, commission lifecycle.", status: "in-build" },
  { name: "Bind Lab Academy",  url: "bindlab.app",             role: "Commercial-insurance training + cert programs (mobile-first PWA).", status: "scaffolded" },
  { name: "Seven16 Command",   url: "seven16command.com",      role: "Family-wide CRM + customer-intelligence OS (system of record for cross-product state).", status: "in-build" },
  { name: "Seven16 Email",     url: "api.seven16email.com",    role: "Family-wide transactional + marketing email API (Resend underneath).", status: "in-build" },
  { name: "Seven16 Survey",    url: "seven16survey.com",       role: "Vertical assessments, prospect surveys, lead intelligence, consent + compliance.", status: "scaffolded" },
  { name: "Seven16 Group Support", url: "seven16groupsupport.com", role: "Centralized AI sales/support/onboarding/account-management.", status: "live" },
];

export const FAMILY_FIT_NARRATIVE = [
  "Seven16 Group is building a family of affordable commercial-insurance workflow tools — data, intelligence, CRM, email, survey, training, and support — for the operators who don't have access to the enterprise stack.",
  "Agency Signal is the distribution-intelligence layer of that family. It answers 'which agencies write what, where' for any producer, recruiter, MGA, wholesaler, or carrier that needs the answer this week.",
  "Each product in the family is independently useful. The compounding value shows up when an operator runs Agency Signal alongside DOT Intel for trucking carrier risk, Bind Lab Academy for niche training, Seven16 Command for cross-product CRM, and Seven16 Email for outreach automation. The same operator gets a coherent operating system instead of a stack of disconnected vendor logins.",
];

// ---------------------------------------------------------------------------
// 7. Leveling the Playing Field
// ---------------------------------------------------------------------------
export const LEVELING_THE_FIELD = {
  thesis:
    "Most commercial-insurance distribution tooling is priced for the enterprise buyer. The newer agent, the niche-builder, the under-resourced agency, and the small-team MGA can't get a quote without a sales call — let alone afford the contract.",
  proofPoints: [
    {
      title: "Below the P-card threshold at consumer tier",
      body: "Every Agency Signal consumer-tier price (Sample, Starter, Growth) sits below the $500 single-purchase threshold so a producer can expense without manager sign-off. Pricing locked there per D-002 family doctrine.",
    },
    {
      title: "Paid sample replaces gated free trials",
      body: "$75 buys 50 filtered contacts + one CSV. Reduces buyer risk to a coffee budget. No sales call required. Mirrors how lifestyle-software (Linear, Figma) brought enterprise tools to small teams.",
    },
    {
      title: "Modular buying instead of forced bundles",
      body: "Buy a state, a niche, a sample, or the country. The buyer who can't afford the whole thing can still buy the slice that helps THIS quarter.",
    },
    {
      title: "Plain-language methodology",
      body: "Sources, scoring tiers, and refresh cadence are published. The under-tooled buyer doesn't need a data team to validate the vendor — they can read the page.",
    },
    {
      title: "Family-wide affordability discipline",
      body: "Seven16 family pricing is per-product autonomous (D-034) but each product is sized to be accessible. The principle: better weapons for under-resourced operators, not 'enterprise-grade' marketing for enterprise budgets.",
    },
  ],
};

// ---------------------------------------------------------------------------
// 8. Combined Family Narrative
// ---------------------------------------------------------------------------
// Each capability maps the family stack to a buyer outcome. Update when new
// products ship or when a capability moves from "future" to "live."
export const COMBINED_FAMILY_NARRATIVE: Array<{ outcome: string; familyStack: string }> = [
  {
    outcome: "Find opportunities",
    familyStack: "Agency Signal (carrier-appointment + vertical intelligence) + DOT Intel (trucking risk) + Seven16 Survey (vertical assessments) surface the agencies, carriers, and verticals worth pursuing this quarter.",
  },
  {
    outcome: "Understand prospects",
    familyStack: "Agency Signal (producer + agency identity) + DOT Intel (DOT-side risk) + Bind Lab Academy (niche curriculum) give the producer enough context to land in a real conversation, not a cold pitch.",
  },
  {
    outcome: "Communicate better",
    familyStack: "Seven16 Email (deliverability + sequences) + Seven16 Command (customer state) + Seven16 Group Support (always-on AI agent) cover transactional, marketing, and service touchpoints in one operating system.",
  },
  {
    outcome: "Run surveys",
    familyStack: "Seven16 Survey runs vertical-specific assessments + prospect surveys with TCPA-compliant outreach + scoring + routing into the rest of the family.",
  },
  {
    outcome: "Build lists",
    familyStack: "Agency Signal builds the universe; Seven16 Command stores the named relationships; Seven16 Email runs the cadences against them.",
  },
  {
    outcome: "Manage contacts",
    familyStack: "Seven16 Command is the family-wide system of record for tenants, users, and entitlements (per D-027 family API integration mesh).",
  },
  {
    outcome: "Automate workflows",
    familyStack: "Bind Lab (wholesale + MGA operating system) + Seven16 Command (cross-product orchestration) automate submission, recruiting, and account-management workflows.",
  },
  {
    outcome: "Learn commercial-insurance niches",
    familyStack: "Bind Lab Academy hosts cert programs (v1: DOT Intel Certified Trucking Producer) and grows into a multi-program curriculum library.",
  },
  {
    outcome: "Improve producer execution",
    familyStack: "Agency Signal (right targets) + Bind Lab Academy (right knowledge) + Seven16 Email (right cadence) + Seven16 Command (right context) close the producer-effectiveness loop.",
  },
  {
    outcome: "Track activity",
    familyStack: "Seven16 Command ingests events from every satellite (Agency Signal saved-list changes, DOT Intel lookups, Bind Lab submissions, Seven16 Email opens) into one customer-state view.",
  },
  {
    outcome: "Compete with larger agencies and platforms",
    familyStack: "The whole family stacks into an affordable operating system that puts a small-team operator on roughly even footing with a buyer who's licensing five separate enterprise vendors.",
  },
];

// ---------------------------------------------------------------------------
// 9. Sales Narrative
// ---------------------------------------------------------------------------
export const SALES_NARRATIVE: SalesNarrative = {
  positioningStatement:
    "Agency Signal is the commercial-insurance distribution intelligence layer for operators who don't have a six-figure data budget.",
  elevator30:
    "Agency Signal maps every commercial-insurance agency, producer, and carrier appointment in the U.S. so a producer or distribution team can see which agencies write what, where — without paying Neilson money for the answer. Sample is $75. Monthly access starts at $299. Full national license is $12,500 a year.",
  elevator90:
    "Most commercial-insurance distribution tooling is priced for the enterprise buyer — quote-driven, five-figure contracts, sales calls before you can even see the data. Agency Signal flips that. We publish prices on the page. We sell a $75 paid sample so a producer can validate quality before committing. We map carrier appointments, producer networks, vertical specialization, and agency identity across the full U.S. — sourced from state-DOI filings, not vendor lookalikes. The buyer can pick the slice that fits this week: one state, a custom file, monthly subscription access, or the National Founder License for the whole country at a fraction of what the legacy enterprise vendors charge. Agency Signal sits inside the Seven16 Group family — a growing set of affordable commercial-insurance tools (CRM, email, training, support, survey, trucking intel) that gives smaller operators a real operating system instead of a stack of disconnected vendor logins.",
  heroHeadline: "Commercial-insurance agent data, without the legacy pricing.",
  heroSubheadline:
    "Search and buy commercial-insurance agency and producer data your way — monthly access, bulk exports, or a full U.S. license. Built for MGAs, wholesalers, carriers, recruiters, and insurance vendors who want quality data without a five-figure commitment upfront.",
  internalTalkingPoints: [
    "Lead with the $75 sample. It's the wedge against opaque-quote vendors.",
    "Pricing is published on /pricing. Send the link. Don't gate it.",
    "Methodology is public. Send the /methodology link to anyone who challenges data provenance.",
    "Sources are state-DOI filings. NOT vendor-licensed list, NOT web scrape, NOT lookalike modeled.",
    "If the buyer mentions Neilson by name: do NOT name competitors back (P12 family prohibited claim). Pivot to transparent pricing + paid sample + modular buying as the contrast.",
    "Multi-product fit: Agency Signal often pairs with DOT Intel (trucking) and the Seven16 Email API (outreach). Mention only when the buyer surfaces a need — don't pitch the family upfront.",
    "Family pricing is dead (D-034). Each product prices independently. There is NO Charter Member program anymore.",
  ],
  customerFacingExplanation:
    "Agency Signal is a search-and-buy product for commercial-insurance distribution data. You can browse the directory free, pull a $75 sample to test quality, subscribe monthly for ongoing access, build a custom file by state or filter, or buy a full U.S. license. We map carrier appointments, producer networks, and agency identity from state-DOI filings — so the data is regulator-grade, not vendor-scraped. Built for producers, agencies, MGAs, wholesalers, and carriers who need to know which agencies write what, where, this quarter.",
};

// ---------------------------------------------------------------------------
// 10. Admin Usefulness
// ---------------------------------------------------------------------------
// This is the section that makes the page actually useful internally —
// not just a marketing handout. Update audience guidance when team
// composition or AI-agent prompts change.
export const ADMIN_USEFULNESS: AdminUsefulnessBlock[] = [
  {
    audience: "Sales team",
    whatThisGivesThem:
      "Single canonical positioning + ICP + objection-handling + elevator pitches. Stops sales-rep drift across calls.",
    howToUse:
      "Bookmark this page. Read the ICP + objection list before any first call. Use the 30-second pitch verbatim until you can riff. Pull internal talking points #1-#3 into your follow-up emails.",
  },
  {
    audience: "Support team",
    whatThisGivesThem:
      "Plain-language explanation of what the product is + what it ISN'T, so customer questions can be answered without misrepresentation.",
    howToUse:
      "When a customer asks 'is this a CRM?' / 'is this Neilson?' — point them at the customer-facing explanation in the Sales Narrative section. Mark anything outside that scope as 'I'll check with product' instead of guessing.",
  },
  {
    audience: "Onboarding team",
    whatThisGivesThem:
      "ICP + success outcomes map onto the onboarding milestones. Trigger events tell you what conversation the new customer is about to need.",
    howToUse:
      "Read the trigger events that apply to the customer's industry. Front-load the first onboarding call around the success outcome most likely to land for THEIR persona. Pull the family-fit narrative into the 'what else is coming' section of the welcome email only when the buyer asks.",
  },
  {
    audience: "Product team",
    whatThisGivesThem:
      "Pain language directly from the FAB matrix becomes problem-discovery anchors for the next feature. Competitive advantages are the must-preserve list.",
    howToUse:
      "Before scoping a new feature, re-read the 'Problems This Product Solves' section. If the proposed feature doesn't map to one of those personas' pain — it's probably the wrong feature. The competitive advantages section is the do-no-harm list.",
  },
  {
    audience: "AI-agent training",
    whatThisGivesThem:
      "Structured ground truth the Seven16 Group Support AI agent can be prompted against. Keeps the agent's voice + claims + ICP framing aligned with the product team's actual positioning.",
    howToUse:
      "Export the JSON shape of this page (PRODUCT_OVERVIEW + FAB_MATRIX + ICP + COMPETITIVE_ADVANTAGES) into the support-agent prompt as canonical context. Re-export whenever this file changes. AI-agent answers about Agency Signal should never contradict this file.",
  },
  {
    audience: "Website copy reuse",
    whatThisGivesThem:
      "Hero headline / subheadline / customer-facing explanation are pre-cleared for marketing surfaces. Sample-offer language matches /pricing copy.",
    howToUse:
      "When proposing a new marketing page or section, start by pulling the closest matching block from this file. If the marketing surface needs a NEW claim not on this page, surface it to product first — adding a claim to the marketing surface that contradicts the canonical positioning here is a brand-voice violation.",
  },
];
