import type { AiSearchDictionary } from "./dictionary";

/**
 * Deterministic NL → filter parser for the AI Support page.
 *
 * v1 design — no LLM. Tokens are matched against a dictionary loaded from the
 * DB plus a fixed set of regex recognizers (dollar amounts, employee counts,
 * boolean phrases). The output is a querystring drop-in for /build-list/review
 * that uses the SAME shape as the BuildListForm (parseInitialFromSearchParams
 * in app/build-list/page.tsx is the canonical reader).
 *
 * Limits — clearly documented so future LLM upgrades know what to target:
 *   - No multi-clause boolean reasoning ("X but not Y" — no negation).
 *   - No date filters (last-updated etc) — agencies isn't time-series shaped.
 *   - No relationship paths beyond carrier/affiliation/SIC.
 *   - Carrier matching is substring-on-name; can produce duplicates if the
 *     user types a group_name that happens to be a substring of multiple
 *     carrier rows. We dedupe by id.
 *
 * Add a new pattern: append a recognizer to PARSERS in the order it should
 * fire (more-specific patterns earlier — e.g. "$5M-$20M" before "$5M").
 */
export type ParsedSummary = {
  account_types: { id: string; label: string }[];
  states: { id: string; code: string; name: string }[];
  country?: "US" | "CA";
  carriers: { id: string; name: string }[];
  affiliations: { id: string; canonical_name: string }[];
  location_types: { id: string; name: string }[];
  premium_min?: number;
  premium_max?: number;
  revenue_min?: number;
  revenue_max?: number;
  employees_min?: number;
  employees_max?: number;
  minority?: "yes";
  has_email?: true;
  account_name?: string;
  flags: string[];
};

export type ParseResult = {
  qs: string;             // ready to append to /build-list/review or /build-list
  filterKeys: string[];   // for usage_logs.metadata
  summary: ParsedSummary;
  hits: { kind: string; matched: string; resolved: string }[];
  residual: string;
  errors: string[];
};

// --- helpers -----------------------------------------------------------------

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Parse a money token like "10M", "$10M", "100k", "1.5B", "10000000". */
function parseMoney(raw: string): number | null {
  const m = raw.replace(/[\s,$]/g, "").match(/^([\d.]+)\s*([kmbKMB])?$/);
  if (!m) return null;
  const v = parseFloat(m[1]);
  if (!isFinite(v)) return null;
  const unit = (m[2] || "").toLowerCase();
  if (unit === "k") return Math.round(v * 1_000);
  if (unit === "m") return Math.round(v * 1_000_000);
  if (unit === "b") return Math.round(v * 1_000_000_000);
  return Math.round(v);
}

function parseInt0(raw: string): number | null {
  const v = parseInt(raw.replace(/[\s,]/g, ""), 10);
  return isFinite(v) ? v : null;
}

/**
 * Strip a matched substring from the residual without nuking adjacent words.
 * Replaces the first case-insensitive occurrence with a single space.
 */
function strip(residual: string, span: string): string {
  const ix = residual.toLowerCase().indexOf(span.toLowerCase());
  if (ix === -1) return residual;
  return (residual.slice(0, ix) + " " + residual.slice(ix + span.length)).replace(/\s+/g, " ").trim();
}

// --- account-type keyword map -----------------------------------------------
//
// Matches user vocabulary to the 11 account_types codes. Multiple codes can
// match a single phrase (e.g. "MGA" hits agency_mga + agency_pe_mga).
const AT_KEYWORDS: Array<{ phrase: RegExp; codes: string[] }> = [
  { phrase: /\bnational\s+broker(age)?s?\b/i,         codes: ["national_brokerage"] },
  { phrase: /\bprivate\s+equity[\s-]+(backed|owned)?\b/i, codes: ["agency_pe", "agency_pe_mga", "agency_pe_wholesaler"] },
  { phrase: /\bpe[\s-]?(backed|owned|firm|agency|agencies)?\b/i,    codes: ["agency_pe", "agency_pe_mga", "agency_pe_wholesaler"] },
  { phrase: /\bmga(s)?\b/i,                            codes: ["agency_mga", "agency_pe_mga"] },
  { phrase: /\bmanaging\s+general\s+agen(t|cy|cies)\b/i, codes: ["agency_mga", "agency_pe_mga"] },
  { phrase: /\bwholesaler(s)?\b/i,                     codes: ["agency_wholesaler", "agency_wholesaler_bank", "agency_pe_wholesaler"] },
  { phrase: /\bbank[\s-]?(owned|affiliated)?\s+agenc(y|ies)\b/i, codes: ["agency_bank", "agency_wholesaler_bank"] },
  { phrase: /\bbank\s+agenc(y|ies)\b/i,                codes: ["agency_bank", "agency_wholesaler_bank"] },
  { phrase: /\bagency\s+network(s)?\b/i,               codes: ["agency_network", "agency_network_hq"] },
  { phrase: /\bnetwork\s+headquarters?\b/i,            codes: ["agency_network_hq"] },
  // "Agency" alone is too generic to match — only fires when next to "regular" or "independent"
  { phrase: /\bindependent\s+agenc(y|ies)\b/i,         codes: ["agency"] },
];

// Location-type keyword map
const LT_KEYWORDS: Array<{ phrase: RegExp; codes: string[] }> = [
  { phrase: /\bheadquarters?\b/i,                      codes: ["headquarters"] },
  { phrase: /\bhq\b/i,                                 codes: ["headquarters"] },
  { phrase: /\bbranch(es)?\b/i,                        codes: ["branch"] },
  { phrase: /\bsingle[\s-]?location\b/i,               codes: ["single"] },
  { phrase: /\bstandalone\b/i,                         codes: ["single"] },
];

// --- main parse --------------------------------------------------------------

export function parseAiQuery(input: string, dict: AiSearchDictionary): ParseResult {
  const summary: ParsedSummary = {
    account_types: [],
    states: [],
    carriers: [],
    affiliations: [],
    location_types: [],
    flags: [],
  };
  const hits: ParseResult["hits"] = [];
  const errors: string[] = [];
  let residual = (input || "").trim();
  if (!residual) {
    return { qs: "", filterKeys: [], summary, hits, residual: "", errors: ["empty query"] };
  }

  const original = residual;

  // 1. Dollar ranges: "between $5M and $20M premium", "$5M-$20M revenue"
  const moneyRangeRe = /\b(?:between\s+)?\$?\s*([\d.,]+\s*[kmbKMB]?)\s*(?:to|-|–|and)\s*\$?\s*([\d.,]+\s*[kmbKMB]?)\s+(premium|revenue)\b/gi;
  residual = residual.replace(moneyRangeRe, (whole, lo, hi, kind) => {
    const min = parseMoney(lo);
    const max = parseMoney(hi);
    if (min !== null && max !== null && min < max) {
      if (kind.toLowerCase() === "premium") {
        summary.premium_min = min;
        summary.premium_max = max;
      } else {
        summary.revenue_min = min;
        summary.revenue_max = max;
      }
      hits.push({ kind: kind.toLowerCase() + "_range", matched: whole.trim(), resolved: `${min}–${max}` });
      return " ";
    }
    return whole;
  });

  // 2a. Single-bound dollar amounts, op-first: "over $10M premium", "at least $5M revenue", "under $1M premium"
  const moneyOpRe = /\b(over|above|more\s+than|at\s+least|≥|>=|>|under|below|less\s+than|at\s+most|≤|<=|<)\s+\$?\s*([\d.,]+\s*[kmbKMB]?)\s+(premium|revenue)\b/gi;
  residual = residual.replace(moneyOpRe, (whole, op, amt, kind) => {
    const v = parseMoney(amt);
    if (v === null) return whole;
    const isMin = /(over|above|more|at\s+least|≥|>=|>)/i.test(op);
    if (kind.toLowerCase() === "premium") {
      if (isMin) summary.premium_min = v; else summary.premium_max = v;
    } else {
      if (isMin) summary.revenue_min = v; else summary.revenue_max = v;
    }
    hits.push({ kind: kind.toLowerCase() + (isMin ? "_min" : "_max"), matched: whole.trim(), resolved: `${v}` });
    return " ";
  });

  // 2b. Single-bound dollar amounts, kind-first: "premium over $10M", "revenue above $5M"
  const moneyKindFirstRe = /\b(premium|revenue)\s+(over|above|more\s+than|at\s+least|≥|>=|>|under|below|less\s+than|at\s+most|≤|<=|<)\s+\$?\s*([\d.,]+\s*[kmbKMB]?)\b/gi;
  residual = residual.replace(moneyKindFirstRe, (whole, kind, op, amt) => {
    const v = parseMoney(amt);
    if (v === null) return whole;
    const isMin = /(over|above|more|at\s+least|≥|>=|>)/i.test(op);
    if (kind.toLowerCase() === "premium") {
      if (isMin) summary.premium_min = v; else summary.premium_max = v;
    } else {
      if (isMin) summary.revenue_min = v; else summary.revenue_max = v;
    }
    hits.push({ kind: kind.toLowerCase() + (isMin ? "_min" : "_max"), matched: whole.trim(), resolved: `${v}` });
    return " ";
  });

  // 3. Employee ranges: "between 50 and 200 employees", "50-200 staff"
  const empRangeRe = /\b(?:between\s+)?([\d,]+)\s*(?:to|-|–|and)\s*([\d,]+)\s+(employees|staff|people|emp)\b/gi;
  residual = residual.replace(empRangeRe, (whole, lo, hi) => {
    const min = parseInt0(lo);
    const max = parseInt0(hi);
    if (min !== null && max !== null && min < max) {
      summary.employees_min = min;
      summary.employees_max = max;
      hits.push({ kind: "employees_range", matched: whole.trim(), resolved: `${min}–${max}` });
      return " ";
    }
    return whole;
  });

  // 4. Single-bound employees: "over 50 employees", "at least 100 staff"
  const empOpRe = /\b(over|above|more\s+than|at\s+least|≥|>=|>|under|below|less\s+than|at\s+most|≤|<=|<)\s+([\d,]+)\s+(employees|staff|people|emp)\b/gi;
  residual = residual.replace(empOpRe, (whole, op, n) => {
    const v = parseInt0(n);
    if (v === null) return whole;
    const isMin = /(over|above|more|at\s+least|≥|>=|>)/i.test(op);
    if (isMin) summary.employees_min = v; else summary.employees_max = v;
    hits.push({ kind: isMin ? "employees_min" : "employees_max", matched: whole.trim(), resolved: `${v}` });
    return " ";
  });

  // 5. Boolean phrases
  const minorityRe = /\bminority[\s-]?(owned|led)\b/i;
  if (minorityRe.test(residual)) {
    summary.minority = "yes";
    residual = residual.replace(minorityRe, " ");
    hits.push({ kind: "minority", matched: "minority-owned", resolved: "yes" });
  }
  const hasEmailRe = /\b(with|has)\s+(email|contact\s+info(rmation)?|contacts)\b/i;
  if (hasEmailRe.test(residual)) {
    summary.has_email = true;
    summary.flags.push("has_email_requested");
    residual = residual.replace(hasEmailRe, " ");
    hits.push({ kind: "has_email", matched: "with email", resolved: "true" });
  }

  // 6. States — longest-match-first (so "New York" beats "York", "North Carolina" beats "Carolina")
  const stateCandidates: { token: string; entry: typeof dict.states[number]; len: number }[] = [];
  for (const s of dict.states) {
    stateCandidates.push({ token: s.name, entry: s, len: s.name.length });
    stateCandidates.push({ token: s.code, entry: s, len: s.code.length });
  }
  stateCandidates.sort((a, b) => b.len - a.len);
  const stateUsed = new Set<string>();
  for (const c of stateCandidates) {
    if (stateUsed.has(c.entry.id)) continue;
    // Match name as whole-word, code as upper-case standalone
    const pattern = c.token.length === 2
      ? new RegExp(`\\b${escapeRegex(c.token)}\\b`)              // case-sensitive intent for "TX"
      : new RegExp(`\\b${escapeRegex(c.token)}\\b`, "i");
    if (pattern.test(residual)) {
      summary.states.push({ id: c.entry.id, code: c.entry.code, name: c.entry.name });
      summary.country = c.entry.country;
      stateUsed.add(c.entry.id);
      residual = residual.replace(pattern, " ");
      hits.push({ kind: "state", matched: c.token, resolved: c.entry.name });
    }
  }

  // 7. Affiliations — substring-on-canonical_name. Run BEFORE account-type
  // keywords so multi-word affiliation names like "Agency Network Exchange"
  // don't get partially eaten by the "agency network" account-type keyword.
  const affsByLen = [...dict.affiliations].sort((a, b) => b.canonical_name.length - a.canonical_name.length);
  const afUsed = new Set<string>();
  for (const a of affsByLen) {
    if (a.canonical_name.length < 6) continue;
    const pattern = new RegExp(`\\b${escapeRegex(a.canonical_name)}\\b`, "i");
    if (pattern.test(residual)) {
      if (!afUsed.has(a.id)) {
        summary.affiliations.push({ id: a.id, canonical_name: a.canonical_name });
        afUsed.add(a.id);
        hits.push({ kind: "affiliation", matched: a.canonical_name, resolved: a.canonical_name });
      }
      residual = residual.replace(pattern, " ");
    }
  }

  // 8. Account-type keywords
  const atUsed = new Set<string>();
  for (const kw of AT_KEYWORDS) {
    if (kw.phrase.test(residual)) {
      const m = residual.match(kw.phrase);
      if (m) hits.push({ kind: "account_type_kw", matched: m[0], resolved: kw.codes.join(",") });
      residual = residual.replace(kw.phrase, " ");
      for (const code of kw.codes) {
        const at = dict.accountTypes.find((x) => x.code === code);
        if (at && !atUsed.has(at.id)) {
          summary.account_types.push({ id: at.id, label: at.label });
          atUsed.add(at.id);
        }
      }
    }
  }

  // 9. Location-type keywords
  const ltUsed = new Set<string>();
  for (const kw of LT_KEYWORDS) {
    if (kw.phrase.test(residual)) {
      const m = residual.match(kw.phrase);
      if (m) hits.push({ kind: "location_type_kw", matched: m[0], resolved: kw.codes.join(",") });
      residual = residual.replace(kw.phrase, " ");
      for (const code of kw.codes) {
        const lt = dict.locationTypes.find((x) => x.code === code);
        if (lt && !ltUsed.has(lt.id)) {
          summary.location_types.push({ id: lt.id, name: lt.name });
          ltUsed.add(lt.id);
        }
      }
    }
  }

  // 10. Carriers — try full name first, then leading 1-2 word prefix (so
  // "Travelers" → "Travelers Companies", "Hartford" → "The Hartford"). The
  // prefix path skips common stopword leads ("The", "Insurance") and checks
  // that the prefix has length >= 4 to avoid ambiguous tickers.
  const CARRIER_LEAD_STOPWORDS = new Set(["the", "insurance", "of", "and", "&", "a", "an"]);
  const carriersByLen = [...dict.carriers].sort((a, b) => b.name.length - a.name.length);
  const carUsed = new Set<string>();
  for (const c of carriersByLen) {
    if (c.name.length < 4) continue;
    const pattern = new RegExp(`\\b${escapeRegex(c.name)}\\b`, "i");
    if (pattern.test(residual)) {
      if (!carUsed.has(c.id)) {
        summary.carriers.push({ id: c.id, name: c.name });
        carUsed.add(c.id);
        hits.push({ kind: "carrier", matched: c.name, resolved: c.name });
      }
      residual = residual.replace(pattern, " ");
    }
  }
  // Leading-word prefix pass for carriers we haven't matched yet. We try
  // single-word AND two-word leads. Single-word match is what makes
  // "Travelers" → "Travelers Companies" and "Chubb" → "Chubb Group of
  // Insurance Companies" work. The reject-list keeps generic single words
  // (American, National, etc) from sweeping everything up.
  //
  // KNOWN AMBIGUITIES we accept for v1:
  //   - "Philadelphia" the city vs Philadelphia (the carrier)
  //   - "Auto" alone is rejected by the length+blocklist gate
  //   - Group names containing "Insurance Companies" never match alone
  // The page surfaces every match as a chip so the user can review before
  // running the search; that's the v1 disambiguation UX.
  const CARRIER_REJECT_LEADS = /^(american|national|state|farm|first|new|united|north|south|east|west|general|premier|standard|auto|home|life|safe|safety|select|preferred|alliance|federal|midwest|midland|continental|integrity|guard|guardian|liberty)$/i;
  for (const c of carriersByLen) {
    if (carUsed.has(c.id)) continue;
    const tokens = c.name.split(/\s+/).filter(Boolean);

    // Build candidate leads from non-stopword tokens. Try the longer match
    // first so "Liberty Mutual" beats "Liberty" alone when the user typed
    // both, then fall back to the single leading token.
    const meaningful = tokens.filter((t) => !CARRIER_LEAD_STOPWORDS.has(t.toLowerCase()));
    const candidates: string[] = [];
    if (meaningful.length >= 2) candidates.push(meaningful.slice(0, 2).join(" "));
    if (meaningful.length >= 1) candidates.push(meaningful[0]);

    for (const lead of candidates) {
      if (!lead || lead.length < 5) continue;
      if (CARRIER_REJECT_LEADS.test(lead)) continue;
      const pattern = new RegExp(`\\b${escapeRegex(lead)}\\b`, "i");
      if (pattern.test(residual)) {
        summary.carriers.push({ id: c.id, name: c.name });
        carUsed.add(c.id);
        hits.push({ kind: "carrier_prefix", matched: lead, resolved: c.name });
        residual = residual.replace(pattern, " ");
        break;
      }
    }
  }
  // Common short tickers — explicit list to avoid AIG matching "aigle" etc
  const SHORT_CARRIER_HINTS = ["AIG", "AON", "WTW", "USI", "CRC", "CNA"];
  for (const hint of SHORT_CARRIER_HINTS) {
    if (new RegExp(`\\b${hint}\\b`).test(residual)) {
      const c = dict.carriers.find((x) => new RegExp(`\\b${hint}\\b`, "i").test(x.name));
      if (c && !carUsed.has(c.id)) {
        summary.carriers.push({ id: c.id, name: c.name });
        carUsed.add(c.id);
        hits.push({ kind: "carrier_short", matched: hint, resolved: c.name });
        residual = residual.replace(new RegExp(`\\b${hint}\\b`), " ");
      }
    }
  }

  // 11. Strip filler tokens
  // NOTE: "nationwide" is intentionally NOT in FILLER — it's also a carrier
  // name and the carrier match runs before this. If the user means "across
  // the country", we'll over-match and include the Nationwide carrier; the
  // user can edit in Build List. Better to err on the side of preserving
  // proper-noun ambiguity than silently dropping a possible carrier filter.
  const FILLER = /\b(in|with|that|have|having|are|is|the|a|an|of|and|or|to|for|from|on|by|insurance|insurer|insurers|agencies|agency|firms|firm|brokers|broker|companies|company|over|under|about|all|any|find|show|me|search|please|results|list|operators|operator|appointed|carrying|carry|matched|members|member|info|information)\b/gi;
  residual = residual.replace(FILLER, " ").replace(/\s+/g, " ").trim();

  // 12. If we have meaningful residual text (3+ chars), treat as agency-name fragment.
  // Skip if it's just punctuation/numbers — agency names usually start with a letter.
  const trimmedResidual = residual.replace(/[^A-Za-z0-9 &'.-]/g, "").trim();
  if (trimmedResidual.length >= 3 && /[A-Za-z]/.test(trimmedResidual)) {
    summary.account_name = trimmedResidual;
    hits.push({ kind: "account_name", matched: trimmedResidual, resolved: trimmedResidual });
  }

  // Build querystring matching the BuildListForm encoding
  const qs = new URLSearchParams();
  const filterKeys: string[] = [];

  if (summary.account_types.length) {
    qs.set("at", summary.account_types.map((x) => x.id).join(","));
    filterKeys.push("at");
  }
  if (summary.country) {
    qs.set("c", summary.country);
    filterKeys.push("c");
  }
  if (summary.states.length) {
    qs.set("st", summary.states.map((x) => x.id).join(","));
    filterKeys.push("st");
  }
  if (summary.carriers.length) {
    qs.set("cr", summary.carriers.map((x) => x.id).join(","));
    filterKeys.push("cr");
  }
  if (summary.affiliations.length) {
    qs.set("af", summary.affiliations.map((x) => x.id).join(","));
    filterKeys.push("af");
  }
  if (summary.location_types.length) {
    qs.set("lt", summary.location_types.map((x) => x.id).join(","));
    filterKeys.push("lt");
  }
  if (summary.premium_min !== undefined) { qs.set("pmin", String(summary.premium_min)); filterKeys.push("pmin"); }
  if (summary.premium_max !== undefined) { qs.set("pmax", String(summary.premium_max)); filterKeys.push("pmax"); }
  if (summary.revenue_min !== undefined) { qs.set("rmin", String(summary.revenue_min)); filterKeys.push("rmin"); }
  if (summary.revenue_max !== undefined) { qs.set("rmax", String(summary.revenue_max)); filterKeys.push("rmax"); }
  if (summary.employees_min !== undefined) { qs.set("emin", String(summary.employees_min)); filterKeys.push("emin"); }
  if (summary.employees_max !== undefined) { qs.set("emax", String(summary.employees_max)); filterKeys.push("emax"); }
  if (summary.minority === "yes") { qs.set("min", "yes"); filterKeys.push("min"); }
  if (summary.account_name) {
    qs.set("an", summary.account_name);
    qs.set("an_m", "contains");
    filterKeys.push("an");
  }

  if (filterKeys.length === 0) {
    errors.push("No filters could be parsed. Try mentioning a state, account type, carrier, or premium range.");
  }

  void original; // keep for future debug logging
  return {
    qs: qs.toString(),
    filterKeys,
    summary,
    hits,
    residual,
    errors,
  };
}
