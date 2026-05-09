/**
 * Walk every AdList xlsx in data/, collect distinct values from the
 * "Carriers" sheet's CompanyLine column, normalize the same way load-adlist.ts
 * does (lowercase + strip non-alphanumerics), then cross-check against
 * public.carriers.name. Emit data/_unmatched_carriers.tsv with the names not
 * found in the catalog, sorted by frequency descending.
 *
 * The session-2 AdList load reported "unmatched_ref for carriers was
 * substantial across files (3,000–10,000 per file)." Those are agencies×carrier
 * link rows that got skipped because the carrier name isn't in the catalog.
 * This script surfaces the catalog gap so the user can review + add via
 * /admin/catalog before re-running the loader.
 *
 * Usage:
 *   set AGENCYSIGNAL_URL=https://sdlsdovuljuymgymarou.supabase.co
 *   set AGENCYSIGNAL_PUBLISHABLE_KEY=...   (any read-capable key works for
 *                                            public.carriers — RLS allows it)
 *   npx tsx scripts/harvest-unmatched-carriers.ts
 *
 * Or with service-role:
 *   set AGENCYSIGNAL_SERVICE_KEY=...
 *   npx tsx scripts/harvest-unmatched-carriers.ts
 */
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.AGENCYSIGNAL_URL || "https://sdlsdovuljuymgymarou.supabase.co";
const KEY = process.env.AGENCYSIGNAL_SERVICE_KEY || process.env.AGENCYSIGNAL_PUBLISHABLE_KEY;
if (!KEY) {
  console.error("Set AGENCYSIGNAL_SERVICE_KEY or AGENCYSIGNAL_PUBLISHABLE_KEY in env.");
  process.exit(1);
}

const norm = (v: string | null | undefined): string =>
  (v ?? "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "");

const DATA_DIR = path.resolve(__dirname, "..", "data");

async function main() {
  // Aggregate CompanyLine values across all AdList xlsx files
  const counter = new Map<string, { original: string; count: number; files: Set<string> }>();
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => /^AdList[^\\/]*\.xlsx$/i.test(f))
    .map((f) => path.join(DATA_DIR, f));

  console.log(`Scanning ${files.length} AdList xlsx files ...`);

  for (const fp of files) {
    const wb = XLSX.read(fs.readFileSync(fp), { cellDates: true });
    const ws = wb.Sheets["Carriers"];
    if (!ws) {
      console.warn(`  ${path.basename(fp)} — no Carriers sheet, skipping`);
      continue;
    }
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
    let n = 0;
    for (const r of rows) {
      const raw = (r["CompanyLine"] ?? "").toString().trim();
      if (!raw) continue;
      const key = norm(raw);
      if (!key) continue;
      const entry = counter.get(key);
      if (entry) {
        entry.count++;
        entry.files.add(path.basename(fp));
      } else {
        counter.set(key, { original: raw, count: 1, files: new Set([path.basename(fp)]) });
      }
      n++;
    }
    console.log(`  ${path.basename(fp)}: ${rows.length} rows, ${n} CompanyLine values`);
  }

  console.log(`Total distinct normalized CompanyLine values: ${counter.size}`);

  // Load existing public.carriers names from Supabase
  console.log(`Loading public.carriers from ${URL} ...`);
  const supabase = createClient(URL, KEY!);
  const existing = new Set<string>();
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("carriers")
      .select("name")
      .eq("active", true)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    for (const r of (data as { name: string }[]) ?? []) existing.add(norm(r.name));
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`  loaded ${existing.size} normalized carrier names`);

  // Diff
  const unmatched = [...counter.entries()]
    .filter(([k]) => !existing.has(k))
    .map(([k, v]) => ({ norm_key: k, original: v.original, count: v.count, files: v.files.size }))
    .sort((a, b) => b.count - a.count || a.original.localeCompare(b.original));

  console.log(`Unmatched: ${unmatched.length} distinct carrier names`);
  console.log(`Top 20:`);
  for (const u of unmatched.slice(0, 20)) {
    console.log(`  ${u.count.toString().padStart(6)}  ${u.files}f  ${u.original}`);
  }

  // Write TSV
  const outPath = path.join(DATA_DIR, "_unmatched_carriers.tsv");
  const lines = ["frequency\tfiles\tcarrier_name\tnormalized_key"];
  for (const u of unmatched) {
    lines.push(`${u.count}\t${u.files}\t${u.original}\t${u.norm_key}`);
  }
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
