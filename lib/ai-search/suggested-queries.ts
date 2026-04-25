/**
 * Pre-canned queries surfaced under category tabs on /ai-support. Each query
 * is a string the parser can resolve fully — keep them in lockstep with the
 * parser's vocabulary (parse.ts AT_KEYWORDS, dictionary states/carriers).
 */
export type SuggestedCategory =
  | "agencies"
  | "contacts"
  | "carriers"
  | "affiliations"
  | "sectors"
  | "complex"
  | "all";

export type Suggested = {
  text: string;
  /** Optional human label if we want to truncate `text` in the chip. */
  label?: string;
};

export const SUGGESTED_QUERIES: Record<Exclude<SuggestedCategory, "all">, Suggested[]> = {
  agencies: [
    { text: "Texas agencies with over $10M premium" },
    { text: "California independent agencies with at least 50 employees" },
    { text: "Florida agencies with revenue over $5M" },
    { text: "New York headquarters agencies" },
    { text: "Pennsylvania agencies with between 25 and 100 employees" },
  ],
  contacts: [
    { text: "Texas agencies with email" },
    { text: "Illinois agencies with contact information" },
    { text: "California agencies with email and over $5M premium" },
  ],
  carriers: [
    { text: "Travelers appointed agencies in Texas" },
    { text: "Liberty Mutual agencies in Florida" },
    { text: "Nationwide agencies in Pennsylvania with over $1M premium" },
    { text: "Progressive agencies with at least 25 employees" },
    { text: "Chubb agencies in California" },
  ],
  affiliations: [
    { text: "Agency Network Exchange members in Texas" },
    { text: "Agents Alliance members in California" },
    { text: "ACORD members nationwide" },
  ],
  sectors: [
    { text: "MGAs with over $5M premium" },
    { text: "Wholesalers in California" },
    { text: "Bank-affiliated agencies in Texas" },
    { text: "PE-backed agencies with at least 100 employees" },
    { text: "National brokerages in New York" },
    { text: "Agency networks in Florida" },
  ],
  complex: [
    { text: "PE-backed MGAs in Texas with over $10M premium" },
    { text: "Travelers wholesalers in California with email" },
    { text: "Florida agency networks with between $5M and $20M premium" },
    { text: "Liberty Mutual independent agencies in NY with at least 50 employees" },
  ],
};

export const CATEGORY_LABELS: Record<SuggestedCategory, string> = {
  agencies: "Agencies",
  contacts: "Contacts",
  carriers: "Carriers",
  affiliations: "Affiliations",
  sectors: "Sectors",
  complex: "Complex Queries",
  all: "All Examples",
};

export const CATEGORY_ORDER: SuggestedCategory[] = [
  "agencies",
  "contacts",
  "carriers",
  "affiliations",
  "sectors",
  "complex",
  "all",
];

export function getSuggestedFor(cat: SuggestedCategory): Suggested[] {
  if (cat === "all") {
    return Object.values(SUGGESTED_QUERIES).flat();
  }
  return SUGGESTED_QUERIES[cat] ?? [];
}
