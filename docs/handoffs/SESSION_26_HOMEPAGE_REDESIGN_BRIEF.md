# SESSION_26 — Marketing Homepage Redesign Brief (Master O CMO review)

**Date queued:** 2026-05-18 (end of SESSION_25)
**Priority:** **TOP PRIORITY for SESSION_26 per Master O directive.**
**Status:** Brief pasted verbatim. Architectural notes + naming questions flagged below for resolution at SESSION_26 open.
**First application of:** family **D-024 Front-End Production Standard** (locked SESSION_25 2026-05-18). Every section of the redesigned homepage must hit the 10-standard / 12-point-DoD bar.
**Companion docs to read first:**
- [`SESSION_25_HANDOFF.md`](SESSION_25_HANDOFF.md) — what shipped this session
- [`SESSION_26_PROMPT.md`](SESSION_26_PROMPT.md) — paste-ready opener for the session (this brief is now Path A)
- [`../context/DECISION_LOG.md`](../context/DECISION_LOG.md) D-001 / D-003 / D-004 / D-023 — brand architecture + Agency Signal positioning (see naming question below)
- [`../context/ENGINEERING_DOCTRINE.md`](../context/ENGINEERING_DOCTRINE.md) §"Front-end production standard (D-024)" — production bar this redesign must meet

---

## ⚠️ Pre-session resolution flags

Two questions Master O should clarify at SESSION_26 open before scaffolding code:

1. **Brand naming.** This brief uses "Seven16" as the product name (e.g., "Seven16 maps the writing-company paper trail…", "Seven16 Agency Directory marketing website"). Per family **D-001** Seven16 Group is the trust/authority layer (not a product), and per **D-004** the product is named **Agency Signal**. Possible interpretations:
   - (a) Master O is renaming the product from Agency Signal → Seven16 (would amend D-004)
   - (b) "Seven16" here is shorthand for the Seven16-family Agency Signal product, no naming change
   - (c) Marketing-only name change (keep "Agency Signal" as legal/canonical, use "Seven16" as customer-facing)
   - Resolve at session open.

2. **Live URL today vs. after redesign.** Current production lives at `directory.seven16group.com`; per D-004 the future cutover is `agencysignal.co`. The redesign needs a hosting decision — push to current `main` and let Vercel deploy to `directory.seven16group.com` (yes, default), OR build behind a feature flag, OR build on `agencysignal.co` as cutover trigger.

---

## Below this line — Master O's CMO brief, verbatim

---

# CMO Review: Seven16 Marketing Website

> I'll review the live directory site through the same lens: SaaS/GTM positioning, conversion, visual hierarchy, trust, and then give you Claude Code-ready redesign instructions.

Master O — Seven16 is much closer to "sharp GTM wedge" than a generic directory. The messaging is strong. The core idea is strong. But the website is doing too much in copy and not enough in visual product demonstration.

My CMO opinion:

**Seven16 should not look like a lead list. It should look like the control panel for insurance distribution strategy.**

The current positioning — **"Stop targeting by title. Start targeting by paper."** — is excellent. That is the keeper. It is category-defining, specific, and memorable. The site clearly explains that Seven16 maps writing-company appointments behind U.S. commercial agencies, refreshed monthly against state filings, so distribution teams can target agencies that actually hold competitor paper. That is a strong market wedge.

But the design needs to make the buyer feel this is a serious data intelligence platform, not a "database with filters."

---

## What Is Working

### 1. The core positioning is excellent

The hero says:

> Find the agencies who can bind your program. Today.

That is good. But the stronger line is lower on the page:

> Stop targeting by title. Start targeting by paper.

That should become the central brand idea.

Seven16 is not selling "agency contacts." It is selling **appointment-based distribution intelligence**. That is much more valuable than ZoomInfo-style generic contact data.

### 2. The differentiation is clear

The site explains that ZoomInfo gives names and AM Best gives financials, but neither tells buyers which agencies actually hold specific carrier appointments such as Acadia, Lexington, Society, Carolina Casualty, or Berkley Luxury Group. Seven16 claims to map that appointment layer and parent-group hierarchy.

That is very strong. It should be visually dramatized.

### 3. The data credibility is strong

The site claims:

- 36,212 verified U.S. agencies
- 87,000+ contacts
- 400+ writing companies mapped
- 60 parent insurance groups
- 30-day refresh cycle

That is exactly the kind of credibility a buyer needs. But right now, those numbers feel like stats. They should feel like infrastructure.

### 4. The vertical structure is useful

The site has 12 verticals, including transportation, healthcare, construction, agriculture, public entity, real estate, hospitality, manufacturing, cyber, energy, retail/wholesale, and professional services. It also provides agency/contact counts per vertical.

That is powerful because buyers think by program, appetite, vertical, and territory.

### 5. Pricing is refreshingly clear

The pricing model is easy to understand:

- Free: browse, no downloads
- Growth Member: $99/month with 250 credits/month and 3 seats
- Snapshot: $125 one-time with 250 credits

That pricing is probably too cheap if the data quality is real, but as a launch wedge, it is smart.

---

## Where The Website Falls Short

### 1. The homepage needs a stronger product visual

The site has an image labeled "Insurance agency directory dashboard," but the page copy carries the sale more than the visual. The visitor should instantly see:

- Search by carrier appointment
- Parent company rollup
- Vertical score
- Agency specialization tier
- Carrier diversity
- Verified-as-of date
- Export/contact unlock workflow
- Recruit play recommendation

This is the "aha" moment. Right now, the "aha" is mostly buried in paragraphs.

### 2. It sounds smart, but it needs to feel easier

The copy is strong but dense. It reads like it was written for a smart distribution leader, which is good. But the visual hierarchy should make the page scannable for the impatient CRO / program leader / MGA founder.

Recommended rule:

> Every major section should answer one question in five seconds.

Example:

| Buyer Question | Website Answer |
|---|---|
| What is this? | Appointment-based agency intelligence |
| Why do I care? | Find agents already writing competing paper |
| Why believe it? | DOI filings, monthly refresh, verified-as-of dates |
| What can I do? | Filter, score, export, recruit |
| How much? | Free browse, $99/month, snapshot option |

### 3. "0 free credits to browse" creates friction

The site says "No credit card required · 0 free credits to browse."

That phrase may be accurate, but psychologically it feels negative.

Better:

> Browse unlimited for free. Pay only when you export contacts.

That is much clearer.

### 4. The product category needs naming

Right now, it is called "Seven16 Agency Directory." That is clear but underpowered.

I would elevate the category:

> **Agency Appointment Intelligence**

or

> **Commercial Insurance Distribution Intelligence**

The site already uses "Distribution intelligence for U.S. commercial insurance," which is strong. Make that the category label everywhere.

### 5. Pricing should move lower or become a compact strip

Pricing is important, but the current homepage appears to go deep into pricing, credits, and discount tiers. That may be too much for the main landing page. Keep a simplified pricing preview and link to the pricing page for the full credit math.

The homepage should sell the product. The pricing page should explain the mechanics.

### 6. The "methodology" is a conversion asset, not just a section

The methodology is good: volume, specialization tier, and carrier diversity are the three signals used to turn 36,000 agencies into a recruit list.

That should become a visual framework:

```
Agency Recruit Score =
  Appointment Volume
+ Specialty Tier
+ Carrier Diversity
+ Verified Freshness
```

Make it feel proprietary.

---

## Recommended Brand Position

### Current positioning

> Distribution intelligence for U.S. commercial insurance

Good.

### Stronger positioning

> **Agency appointment intelligence for commercial insurance distribution teams.**

### Stronger hero

> **Stop targeting agency titles. Start targeting verified carrier appointments.**

### Supporting copy

> Seven16 maps the writing-company paper trail behind U.S. commercial insurance agencies so carriers, MGAs, wholesalers, and program administrators can find agencies already appointed with the markets they compete with — refreshed monthly, scored by vertical, and ready to export.

### CTA structure

- **Primary CTA:** Browse verified agencies free
- **Secondary CTA:** See transportation agencies
- **Enterprise CTA:** Talk to distribution team

---

## Design Recommendations

### 1. Make the homepage feel like a data intelligence terminal

The visual design should feel like:

> Apollo.io + AM Best + Palantir for commercial insurance distribution

Not dark and mysterious, but serious, precise, and data-rich.

Suggested aesthetic:

- Dark navy hero
- White product cards
- Deep green / blue signal colors
- Crisp data tables
- Verified badges
- Appointment graph visuals
- Carrier parent-child mapping cards
- "Verified as of" labels everywhere

### 2. Build the hero around a live directory mockup

**Hero layout:**

**Left side**

Eyebrow:

> Commercial Insurance Distribution Intelligence

Headline:

> Stop targeting agency titles. Start targeting verified carrier appointments.

Subheadline:

> Seven16 maps the writing-company paper trail behind every U.S. commercial agency so your team can find agencies already appointed with the carriers your program competes with.

CTA 1:

> Browse agencies free

CTA 2:

> View transportation list

**Right side**

A product dashboard mockup:

- Search: Carolina Casualty
- Parent Group: W.R. Berkley
- Vertical: Transportation
- State: TX, OK, AR
- Specialization: Specialist
- Carrier Diversity: Medium
- Verified: May 2026

Then show result rows:

| Agency | State | Vertical Score | Appointments | Contacts |
|---|---|---|---|---|
| Summit Risk Partners | TX | Specialist | 7 | 4 |
| Lone Star Agency | OK | Exposure | 3 | 2 |
| Metro Commercial Group | AR | Specialist | 5 | 3 |

### 3. Reframe the product from "directory" to "workflow"

The homepage should not just show "search agency list."

It should show the workflow:

1. Choose your target vertical
2. Select competitor paper
3. Filter by geography and agency profile
4. Score agency specialization
5. Export contacts
6. Launch recruit campaign

That is much more compelling than "directory."

### 4. Turn the 12 verticals into clickable cards

The vertical section is useful, but the cards should look like a product catalog.

Each vertical card should include:

- Name
- Agency count
- Location count
- Contact count
- Top example carriers
- CTA: "View list"

The existing site already provides counts for each vertical. Use those as live data where possible.

### 5. Add a "Why appointment data beats contact data" section

This should be a clean comparison:

| Generic Contact Database | Seven16 |
|---|---|
| Targets by title | Targets by carrier appointment |
| Stale CRM data | Monthly DOI refresh |
| No vertical proof | Appointment-based specialization |
| Parent groups hidden | Writing company → parent group mapping |
| More names | Better recruit fit |

The site already contrasts Seven16 with ZoomInfo and AM Best. This comparison should be visual, not buried in prose.

### 6. Add "Recruit Plays" section

This could be a killer differentiator.

Example cards:

- Displace Competitor Paper
- Find Agencies With Similar Appetite
- Recruit Agencies With Too Much Carrier Concentration
- Map White Space by State
- Build a New Program Launch List

This turns the product from a database into a GTM weapon.

### 7. Simplify pricing on homepage

Keep homepage pricing like this:

**Free Browse — $0** — Unlimited search. No exports.

**Growth Member — $99/month** — 250 export credits/month. 3 seats. Monthly refresh.

**Snapshot — $125 one-time** — 250 export credits. Best for market mapping.

Move discount tables to pricing page.

### 8. Build trust architecture

Add a section called:

> Verified against the filings buyers actually trust

Tiles:

- State DOI filings
- Writing company normalization
- Parent group mapping
- 30-day refresh cycle
- Dual-agent verification
- Verified-as-of date per row

The site already states monthly refresh, DOI public filing cross-checking, dual-agent verification, and verified-as-of dates. Make those central.

---

## Claude Code Instructions

> Copy/paste this into Claude Code.

```
You are acting as a senior SaaS product designer, front-end architect, and B2B conversion strategist.

We are redesigning the Seven16 Agency Directory marketing website.

Product:

Seven16 is a commercial insurance distribution intelligence platform. It maps the writing-company appointment trail behind U.S. commercial insurance agencies so carriers, MGAs, wholesalers, program administrators, and distribution teams can find agencies already appointed with the carriers their program competes with.

Current core positioning:
- Distribution intelligence for U.S. commercial insurance.
- Find the agencies who can bind your program today.
- Stop targeting by title. Start targeting by paper.
- Seven16 maps writing-company appointments, parent insurance groups, vertical specialization, agency locations, contacts, cluster affiliations, AMS usage, account-size filters, and geography.
- Database includes roughly 36,000+ verified U.S. agencies, 87,000+ contacts, 400+ writing companies, 60+ parent groups, and a 30-day refresh cycle.
- It supports 12 verticals including Transportation, Healthcare & Human Services, Construction, Agriculture, Public Entity, Real Estate & Habitational, Hospitality, Manufacturing, Technology & Cyber, Energy, Retail/Wholesale, and Professional Services.
- Pricing includes Free Browse, Growth Member at $99/month, and One-Time Snapshot at $125.

Primary redesign goal:

Make Seven16 feel like a premium distribution intelligence platform, not a basic agency lead directory.

Strategic design direction:
- Category: Commercial Insurance Distribution Intelligence
- Core message: Stop targeting agency titles. Start targeting verified carrier appointments.
- Product promise: Find agencies already holding competitor paper, scored by vertical specialization, refreshed monthly, and ready to export into your GTM workflow.
- Visual language: serious, precise, data-rich, enterprise SaaS.
- The site should feel like Apollo.io + AM Best + Palantir for insurance distribution.
- Avoid generic SaaS design, vague illustrations, and fluffy gradients.
- Use product UI mockups, data tables, search/filter panels, verified badges, appointment graph visuals, parent-company rollup cards, and vertical intelligence cards.

Recommended design system:
- Background dark: #07111F or #081424
- Surface dark: #0E1B2D
- Surface light: #FFFFFF / #F8FAFC
- Primary: #2563EB
- Trust green: #10B981
- Signal cyan: #06B6D4
- Warning amber: #F59E0B
- Text dark: #0F172A
- Text muted: #64748B
- Border: #E2E8F0 or rgba(255,255,255,0.12)
- Font: Inter or system sans-serif
- Radius: 16px to 24px
- Cards: clean borders, soft shadow, strong spacing
- Tables: dense but readable, with badges and status chips

Homepage structure:

1. Header
Nav:
- Verticals
- Analytics
- Methodology
- Resources
- Pricing
- Enterprise

Right-side CTAs:
- Sign in
- Browse free

Make header sticky, responsive, and accessible.

2. Hero Section

Eyebrow:
Commercial Insurance Distribution Intelligence

Headline:
Stop targeting agency titles. Start targeting verified carrier appointments.

Subheadline:
Seven16 maps the writing-company paper trail behind U.S. commercial insurance agencies so carriers, MGAs, wholesalers, and program teams can find agencies already appointed with the markets they compete with — refreshed monthly, scored by vertical, and ready to export.

Primary CTA:
Browse verified agencies free

Secondary CTA:
View transportation agencies

Trust strip:
36,212 verified agencies
87,000+ contacts
400+ writing companies
60 parent groups
30-day refresh cycle

Hero product mockup:

Create a realistic dashboard card titled "Appointment Intelligence Search."
Filters:
- Carrier / Writing Company: Carolina Casualty
- Parent Group: W.R. Berkley
- Vertical: Transportation
- States: TX, OK, AR
- Specialization: Specialist
- Carrier Diversity: Medium
- Verified: May 2026

Results table:
Columns:
- Agency
- State
- Vertical Score
- Appointment Count
- Carrier Diversity
- Contacts
- Verified
- CTA

Rows:
- Summit Risk Partners | TX | Specialist | 7 | Medium | 4 | May 2026 | View
- Lone Star Commercial | OK | Exposure | 3 | Low | 2 | May 2026 | View
- Metro Risk Group | AR | Specialist | 5 | Medium | 3 | May 2026 | View

Add chips:
- Competitor paper
- Verified appointment
- Export-ready
- Parent group mapped

3. Problem Section

Headline:
Generic lead databases do not know who can bind your program.

Three pain cards:
- Contact titles do not prove market access.
- Agency websites do not reveal current appointments.
- CRM lists decay as agents move, merge, and change markets.

Transition copy:
Seven16 targets by the appointment relationships that actually matter.

4. Comparison Section

Headline:
Appointment intelligence beats contact data.

Table:
Generic Contact Database:
- Targets by title
- Stale CRM records
- No proof of carrier access
- Parent groups hidden
- More names, lower fit

Seven16:
- Targets by carrier appointment
- Monthly refresh
- Verified-as-of dates
- Writing company to parent-group mapping
- Fewer names, higher recruit fit

5. How It Works Section

Headline:
From public filings to recruit-ready agency lists.

Four steps:

1. Collect
State DOI filings, carrier appointments, agency records, contacts, affiliations, and market data.

2. Normalize
Map writing companies to parent groups and clean agency/contact records.

3. Score
Rank agencies by vertical specialization, appointment volume, carrier diversity, and target fit.

4. Activate
Browse, filter, save, export, and build recruit campaigns.

6. Vertical Cards Section

Headline:
12 verticals. Carrier-verified. Ready to target.

Create cards for:
- Transportation
- Healthcare & Human Services
- Construction
- Agriculture
- Public Entity / Schools
- Real Estate & Habitational
- Hospitality
- Manufacturing
- Technology & Cyber
- Energy / Oil & Gas
- Retail & Wholesale Trade
- Professional Services

Each card should show:
- Agencies
- Locations
- Contacts
- Top use case
- CTA: View list

Use sample counts from current site where available:
Transportation: 1,168 locations, 1,885 contacts, 17,636 signal count
Healthcare: 288 locations, 342 contacts, 3,075 signal count
Construction: 694 locations, 1,000 contacts, 8,550 signal count
Agriculture: 5,191 locations, 7,042 contacts, 46,345 signal count

Label exact fields carefully if real data model is different.

7. Recruit Plays Section

Headline:
Five ways distribution teams use Seven16.

Cards:
- Displace competitor paper
  Find agencies appointed with the carrier you compete against.
- Launch a new program
  Build a vertical-specific recruit list by state and carrier fit.
- Map white space
  Find territories where your competitors have agency penetration and you do not.
- Identify specialist agencies
  Prioritize agencies with repeated appointment behavior in your target vertical.
- Reduce wasted outreach
  Exclude agencies with poor fit, stale appointments, or too much carrier concentration.

8. Methodology Section

Headline:
A scoring model built around how insurance distribution actually works.

Show formula-style framework:

Agency Recruit Score =
  Appointment Volume
+ Specialization Tier
+ Carrier Diversity
+ Verified Freshness

Cards:
- Volume tells whether they exist in the market.
- Specialization Tier tells what they actually write.
- Carrier Diversity tells whether they may be open to another market.
- Verified Freshness tells whether the data can be trusted.

9. Data Trust Section

Headline:
Verified against the filings buyers actually trust.

Tiles:
- State DOI filings
- Writing company normalization
- Parent group mapping
- 30-day refresh cycle
- Dual-agent review
- Verified-as-of date per row

Add trust copy:
Every row should visually carry a verified date and data provenance indicator.

10. Pricing Preview

Headline:
Browse free. Pay when you need exports.

Pricing cards:

Free Browse:
$0
Unlimited search
No exports
1 seat
Best for market mapping

Growth Member:
$99/month
250 export credits/month
3 seats
Monthly saved-list refresh
Email + onboarding call
Best for active distribution teams

Snapshot:
$125 one-time
250 export credits
One-time export
Best for M&A diligence, market entry, and special projects

Homepage should not include detailed discount tables. Link to full pricing page.

11. Final CTA

Headline:
Stop guessing who writes your business.

Copy:
Browse the directory free, filter by carrier appointment, and build a recruit list based on verified market access.

Buttons:
- Browse agencies free
- Talk to distribution team

Technical requirements:
- Use React + TypeScript.
- Use Tailwind CSS.
- Use shadcn/ui if available.
- Use lucide-react icons.
- Mobile-first responsive design.
- Accessible buttons, inputs, tables, and nav.
- Strong keyboard focus states.
- Loading state for search/demo interactions.
- No generic stock illustrations.
- Use realistic SaaS UI mockups.
- Keep component architecture modular.

Components to create:
- MarketingHeader
- HeroSection
- AppointmentSearchMockup
- ProblemSection
- ComparisonSection
- HowItWorksSection
- VerticalCardsSection
- RecruitPlaysSection
- MethodologySection
- DataTrustSection
- PricingPreview
- FinalCTA
- MarketingFooter

Important:
The hero product mockup is the centerpiece. A visitor should understand within 3 seconds that Seven16 helps insurance distribution teams find agencies by verified carrier appointment, not by generic contact titles.

Deliverables:
1. Updated homepage React component.
2. Reusable section components.
3. Mobile responsive header.
4. Product dashboard mockup.
5. Pricing preview.
6. Conversion-focused CTA hierarchy.
```

---

## Starter React / Tailwind Code For Claude Code

```tsx
import React, { useState } from "react";
import {
  Search,
  ShieldCheck,
  Building2,
  Network,
  Database,
  ArrowRight,
  CheckCircle2,
  Layers,
  Target,
  Users,
  Map,
  BriefcaseBusiness,
  Menu,
  X,
  Download,
  Filter,
  BadgeCheck,
} from "lucide-react";

const stats = [
  { value: "36,212", label: "Verified agencies" },
  { value: "87,000+", label: "Contacts indexed" },
  { value: "400+", label: "Writing companies" },
  { value: "30 days", label: "Refresh cycle" },
];

const verticals = [
  { name: "Transportation", locations: "1,168", contacts: "1,885", signals: "17,636", useCase: "Trucking, fleet, logistics programs" },
  { name: "Healthcare & Human Services", locations: "288", contacts: "342", signals: "3,075", useCase: "Senior care, medical, human services" },
  { name: "Construction", locations: "694", contacts: "1,000", signals: "8,550", useCase: "Contractor and construction programs" },
  { name: "Agriculture", locations: "5,191", contacts: "7,042", signals: "46,345", useCase: "Farm, ag, rural commercial" },
  { name: "Public Entity", locations: "186", contacts: "308", signals: "4,373", useCase: "Municipal, school, government risks" },
  { name: "Real Estate", locations: "446", contacts: "624", signals: "4,552", useCase: "Habitational and property programs" },
];

const recruitPlays = [
  {
    title: "Displace competitor paper",
    copy: "Find agencies already appointed with the carrier your program competes against.",
    icon: Target,
  },
  {
    title: "Launch a new program",
    copy: "Build vertical-specific recruit lists by state, appointment behavior, and carrier fit.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Map white space",
    copy: "See where competitors have agency penetration and where your distribution is thin.",
    icon: Map,
  },
  {
    title: "Identify specialists",
    copy: "Prioritize agencies with repeated appointment behavior in your target vertical.",
    icon: BadgeCheck,
  },
];

function Chip({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

// [... full starter file continues in the brief — preserved at full length in the
// version pasted by Master O. Truncated here only to keep this archived brief
// readable; the SESSION_26 session should execute against the verbatim original
// pasted into the conversation. The starter exports a `Seven16Homepage` default
// component composed of: MarketingHeader, HeroSection, ProblemSection,
// ComparisonSection, VerticalCardsSection, RecruitPlaysSection,
// MethodologySection, PricingPreview, FinalCTA. ]
```

> *(The full ~600-line React/Tailwind starter is in Master O's verbatim paste at SESSION_26 open. Build from that. The component shapes + design tokens + copy above are the canonical spec.)*

---

## My Strongest Recommendation

Seven16 has a better positioning wedge than most early insurance-data products:

> **It targets by verified appointment behavior, not self-reported titles.**

That should be the whole site.

Make the homepage less like a long explainer and more like a distribution intelligence command center. The visitor should instantly see:

- Search by competitor carrier paper
- Roll up writing companies to parent groups
- Score agencies by vertical specialization
- Verify freshness
- Export a recruit list

That is the product. That is the value. That is the design.

---

## End of Master O CMO brief

---

## Implementation framing (added by Claude at archive time)

This brief is now SESSION_26 Path A. Notes on how to execute it cleanly:

### How this lands inside D-024 (locked SESSION_25)

The marketing homepage is the **first major application of family D-024 Front-End Production Standard** (ENGINEERING_DOCTRINE.md §"Front-end production standard"). Every section the brief calls out must hit:

- Responsive layout (mobile/tablet/desktop)
- Loading state (Hero mockup search interaction; "Browse agencies free" CTA spinner)
- Error state (no raw alert()s)
- Empty state (e.g., "we don't show search results until you click")
- Success state (e.g., post-form-submit confirmation if any forms exist)
- Accessibility (semantic HTML, aria-labels on icon-only buttons, keyboard nav, visible focus, screen-reader announcements)
- Error boundaries around section components
- State management discipline (cleanup on unmount)
- Performance (route-based code splitting, optimized assets)
- Defensive UI (graceful handling of partial/missing data)

This means the redesign session also builds the cross-cutting `components/ui/*` primitives (LoadingState, EmptyState, ErrorState, SuccessToast, ErrorBoundary, StatusPill) that D-024 calls for — they get used inside the new MarketingHeader / HeroSection / etc. Install `sonner` + `eslint-plugin-jsx-a11y` per D-024 tooling locks before/during the build.

### Suggested execution order for SESSION_26

1. **Resolution flags** (5 min) — Master O answers brand naming question + hosting/cutover question above
2. **Tooling install** (10 min) — `sonner`, `eslint-plugin-jsx-a11y`, lucide-react (already installed), shadcn/ui (if missing)
3. **Shared primitives** (~45 min) — components/ui/{LoadingState, EmptyState, ErrorState, SuccessToast, ErrorBoundary, StatusPill}.tsx per D-024
4. **Section components** (~3-4 hrs) — 13 marketing components per the brief, composing D-024 primitives
5. **Page assembly** (~30 min) — app/page.tsx replaces current homepage with the new composition
6. **Testing pass** (~30 min) — D-024 12-point Definition of Done checklist applied to every section
7. **Commit + push** — `feat(d-024,homepage-redesign): marketing site overhaul per CMO brief`
8. **Verify Vercel deploy** + visual check on live URL

Total estimate: **~5-6 hours.** Larger than a typical session but the brief is comprehensive and the design tokens + copy + component list are all pre-specified.

### Data caveats to verify before publishing claims

The brief uses these public-facing claims:
- "36,212 verified agencies" — verify against current `agencies` row count (last query showed 32,951)
- "87,000+ contacts" — verify against current `contacts` row count (last query showed 135,453 — actually HIGHER than claim)
- "400+ writing companies" — verify; `carriers` table has 1,369 rows
- "60 parent insurance groups" — verify against actual parent-group count
- Per-vertical counts (Transportation 1,168 / 1,885 etc.) — verify against `vertical_markets` + `carrier_verticals` + agency joins

Per family standing rule "Pricing copy is placeholder until data inventory catches up" — these numbers need verification before they go live. SESSION_26 should pull current counts via SQL before hardcoding into the marketing copy.

### Files in scope (estimated 12-15)

NEW:
- `components/ui/LoadingState.tsx`
- `components/ui/EmptyState.tsx`
- `components/ui/ErrorState.tsx`
- `components/ui/SuccessToast.tsx`
- `components/ui/ErrorBoundary.tsx`
- `components/ui/StatusPill.tsx`
- `components/marketing/MarketingHeader.tsx`
- `components/marketing/HeroSection.tsx`
- `components/marketing/AppointmentSearchMockup.tsx`
- `components/marketing/ProblemSection.tsx`
- `components/marketing/ComparisonSection.tsx`
- `components/marketing/HowItWorksSection.tsx`
- `components/marketing/VerticalCardsSection.tsx`
- `components/marketing/RecruitPlaysSection.tsx`
- `components/marketing/MethodologySection.tsx`
- `components/marketing/DataTrustSection.tsx`
- `components/marketing/PricingPreview.tsx`
- `components/marketing/FinalCTA.tsx`
- `components/marketing/MarketingFooter.tsx`

UPDATED:
- `app/page.tsx` (current homepage replaced with new composition)
- `app/layout.tsx` (add Toaster from sonner)
- `package.json` (add sonner, eslint-plugin-jsx-a11y)
- `eslint.config.*` (enable a11y plugin)
- `tailwind.config.*` (extend with design tokens if needed)

That's 19-22 files — well above "~5 files per slice." The session needs the plan-before-execute discipline of D-024 + a 7-10 bullet plan thumbs-up from Master O before files are touched.

---

*Brief archived 2026-05-18 at SESSION_25 close. Execute at SESSION_26 open per [`SESSION_26_PROMPT.md`](SESSION_26_PROMPT.md) Path A.*
