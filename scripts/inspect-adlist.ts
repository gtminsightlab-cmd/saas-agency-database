/**
 * Parse-only inspector for AdList xlsx workbooks. No DB writes, no env needed.
 * Reports per-file row counts + distinct carrier/affiliation names so we can
 * pre-flight new reference rows before running the real loader.
 *
 * Usage: npx tsx scripts/inspect-adlist.ts data/AdList_*_of_7.xlsx
 */
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

function s(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}
function norm(v: string | null): string {
  return (v ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function inspect(filePath: string) {
  const buf = fs.readFileSync(filePath);
  const wb = XLSX.read(buf, { cellDates: true });
  const get = (n: string) => {
    const ws = wb.Sheets[n];
    if (!ws) return [] as Record<string, unknown>[];
    return XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
  };

  const sheets = wb.SheetNames;
  const account = get("Account");
  const contact = get("Contact");
  const carriers = get("Carriers");
  const affil = get("Affiliations");
  const ind = get("Industries");

  const colsOf = (rows: Record<string, unknown>[]) =>
    rows.length === 0 ? [] : Object.keys(rows[0]);

  // Count populated values across ALL rows (not just first), to gauge fill rate.
  const fillCount = (rows: Record<string, unknown>[], col: string) =>
    rows.reduce((n, r) => (s(r[col] as string) ? n + 1 : n), 0);

  const accountFill = {
    Account: fillCount(account, "Account"),
    City: fillCount(account, "City"),
    State: fillCount(account, "State"),
    Email: fillCount(account, "Email"),
    WebAddress: fillCount(account, "WebAddress"),
    MainPhone: fillCount(account, "MainPhone"),
    AccountId: fillCount(account, "AccountId"),
  };
  const contactFill = {
    FirstName: fillCount(contact, "FirstName"),
    LastName: fillCount(contact, "LastName"),
    Title: fillCount(contact, "Title"),
    CEmail: fillCount(contact, "CEmail"),
    Mobile: fillCount(contact, "Mobile"),
    WorkPhone: fillCount(contact, "WorkPhone"),
    AccountId: fillCount(contact, "AccountId"),
    Account: fillCount(contact, "Account"),
  };
  // First row that has a populated FirstName/LastName/CEmail (so we have a real sample)
  const firstPopContact = contact.find((r) =>
    s(r["FirstName"] as string) || s(r["LastName"] as string) || s(r["CEmail"] as string),
  );

  return {
    file: path.basename(filePath),
    sheets,
    counts: {
      Account: account.length,
      Contact: contact.length,
      Carriers: carriers.length,
      Affiliations: affil.length,
      Industries: ind.length,
    },
    cols: {
      Account: colsOf(account),
      Contact: colsOf(contact),
      Carriers: colsOf(carriers),
    },
    accountFill,
    contactFill,
    sampleAccount: account[0] ?? null,
    sampleContact: contact[0] ?? null,
    firstPopContact: firstPopContact ?? null,
    sampleCarrier: carriers[0] ?? null,
    sampleAffiliation: affil[0] ?? null,
    distinctCarrierNames: new Set(
      carriers.map((r) => s(r["CompanyLine"])).filter((x): x is string => x !== null),
    ),
    distinctAffiliationNames: new Set(
      affil.map((r) => s(r["SpecialAffiliation"])).filter((x): x is string => x !== null),
    ),
  };
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: tsx scripts/inspect-adlist.ts <file1.xlsx> [file2.xlsx...]");
  process.exit(1);
}

let totalAcct = 0, totalCon = 0, totalCar = 0, totalAff = 0, totalSic = 0;
const allCarriers = new Set<string>();
const allAffiliations = new Set<string>();
const carrierNorm = new Map<string, string>(); // norm -> first-seen original
const affilNorm = new Map<string, string>();

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.error(`File not found: ${f}`);
    continue;
  }
  const r = inspect(f);
  console.log(`\n=== ${r.file} ===`);
  console.log(`  sheets: ${r.sheets.join(", ")}`);
  console.log(
    `  Account=${r.counts.Account} Contact=${r.counts.Contact} ` +
    `Carriers=${r.counts.Carriers} Affiliations=${r.counts.Affiliations} ` +
    `Industries=${r.counts.Industries}`,
  );
  console.log(`  Account fill:  ` + Object.entries(r.accountFill).map(([k,v]) => `${k}=${v}`).join("  "));
  console.log(`  Contact fill:  ` + Object.entries(r.contactFill).map(([k,v]) => `${k}=${v}`).join("  "));
  if (r.firstPopContact) {
    const c = r.firstPopContact as any;
    console.log(`  first POPULATED contact: ${c.FirstName ?? ""} ${c.LastName ?? ""} | ${c.Title ?? ""} | <${c.CEmail ?? ""}> | mobile=${c.Mobile ?? ""} | acct="${c.AccountId ?? ""}" | acct_name="${c.Account ?? ""}"`);
  } else {
    console.log(`  first POPULATED contact: NONE FOUND in this file`);
  }
  totalAcct += r.counts.Account;
  totalCon += r.counts.Contact;
  totalCar += r.counts.Carriers;
  totalAff += r.counts.Affiliations;
  totalSic += r.counts.Industries;
  for (const n of r.distinctCarrierNames) {
    allCarriers.add(n);
    if (!carrierNorm.has(norm(n))) carrierNorm.set(norm(n), n);
  }
  for (const a of r.distinctAffiliationNames) {
    allAffiliations.add(a);
    if (!affilNorm.has(norm(a))) affilNorm.set(norm(a), a);
  }
}

console.log("\n=== TOTALS ===");
console.log(`  files inspected: ${files.length}`);
console.log(`  Account rows: ${totalAcct}`);
console.log(`  Contact rows: ${totalCon}`);
console.log(`  Carrier link rows: ${totalCar}`);
console.log(`  Affiliation link rows: ${totalAff}`);
console.log(`  Industry/SIC link rows: ${totalSic}`);
console.log(`  distinct CompanyLine names (raw): ${allCarriers.size}`);
console.log(`  distinct CompanyLine names (normalized): ${carrierNorm.size}`);
console.log(`  distinct SpecialAffiliation names (raw): ${allAffiliations.size}`);
console.log(`  distinct SpecialAffiliation names (normalized): ${affilNorm.size}`);

// Emit normalized lists for cross-check against the DB.
fs.writeFileSync(
  "data/_inspect_distinct_carriers.txt",
  Array.from(carrierNorm.entries()).map(([n, orig]) => `${n}\t${orig}`).join("\n"),
);
fs.writeFileSync(
  "data/_inspect_distinct_affiliations.txt",
  Array.from(affilNorm.entries()).map(([n, orig]) => `${n}\t${orig}`).join("\n"),
);
console.log("\nWrote data/_inspect_distinct_carriers.txt and data/_inspect_distinct_affiliations.txt");
