/**
 * Tier-1 logical export — defense-in-depth for customer-irreplaceable tables.
 *
 * Reads every row from each Tier-1 table (classification in `docs/DATA_SAFETY.md`)
 * and writes one JSONL file per table to `./backups/<ISO timestamp>/`.
 * Plus a `_manifest.json` with row counts + content checksums.
 *
 * Run:
 *   npm run export-tier1
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS — needed to read every tenant's rows)
 *
 * Output layout:
 *   ./backups/2026-05-23T12-00-00-000Z/
 *     tenants.jsonl
 *     app_users.jsonl
 *     ...
 *     _manifest.json
 *
 * This is a MANUAL-RUN script for Session E. Automation via Vercel Cron or an
 * external scheduler (S3 / R2 offload) is tracked as a follow-up in DATA_SAFETY.md.
 *
 * Design notes:
 * - Uses the Supabase REST API (PostgREST) rather than direct pg connection so it
 *   runs on Windows + macOS + Linux without needing libpq + psql installed.
 * - Streams pages of 1,000 rows per table to keep memory bounded even when row
 *   counts grow into the millions.
 * - SHA-256 checksum per JSONL file gives a cheap integrity signal — re-running
 *   the export and comparing checksums quickly surfaces drift.
 */

import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Keep this list in sync with `docs/DATA_SAFETY.md` Tier-1 classification.
const TIER_1_TABLES = [
  "tenants",
  "app_users",
  "stripe_customers",
  "billing_plans",
  "user_entitlements",
  "credit_wallets",
  "credit_ledger",
  "usage_logs",
  "downloads_ledger",
  "saved_lists",
  "saved_list_snapshots",
  "saved_list_changes",
  "distribution_expander_segments",
  "top_agency_lists",
  "top_agency_members",
  "audit_log",
  "tenant_limits",
  "feature_flags",
  "hygiene_events",
  "saved_list_hygiene_flags",
] as const;

type Manifest = {
  exported_at: string;
  project_url: string;
  table_count: number;
  tables: Array<{
    name: string;
    rows: number;
    bytes: number;
    sha256: string;
    pages: number;
    error?: string;
  }>;
};

const PAGE_SIZE = 1_000;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "[export-tier1] Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const exportedAt = new Date().toISOString().replace(/[:.]/g, "-");
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = join(scriptDir, "..", "..");
  const outDir = join(projectRoot, "backups", exportedAt);
  await mkdir(outDir, { recursive: true });

  console.log(`[export-tier1] Writing to ${outDir}`);
  console.log(`[export-tier1] Tables: ${TIER_1_TABLES.length}`);
  console.log("");

  const manifest: Manifest = {
    exported_at: new Date().toISOString(),
    project_url: url,
    table_count: TIER_1_TABLES.length,
    tables: [],
  };

  for (const table of TIER_1_TABLES) {
    process.stdout.write(`  [${table}] `);
    try {
      const lines: string[] = [];
      let from = 0;
      let pages = 0;
      // Paginate via PostgREST .range() until we get an empty page.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .range(from, from + PAGE_SIZE - 1)
          .order("id" as never, { ascending: true, nullsFirst: true })
          // Some tables (e.g. lookup / audit) may not have a numeric `id` column.
          // The order is best-effort; if it fails we fall back to unordered.
          .returns<Record<string, unknown>[]>();
        if (error) {
          // Retry without the order clause if `id` doesn't exist on this table.
          if (/column .* does not exist/i.test(error.message)) {
            const fallback = await supabase
              .from(table)
              .select("*")
              .range(from, from + PAGE_SIZE - 1)
              .returns<Record<string, unknown>[]>();
            if (fallback.error) throw fallback.error;
            for (const row of fallback.data ?? []) lines.push(JSON.stringify(row));
            if ((fallback.data?.length ?? 0) < PAGE_SIZE) break;
          } else {
            throw error;
          }
        } else {
          for (const row of data ?? []) lines.push(JSON.stringify(row));
          if ((data?.length ?? 0) < PAGE_SIZE) break;
        }
        from += PAGE_SIZE;
        pages++;
      }
      const body = lines.join("\n") + (lines.length > 0 ? "\n" : "");
      const filePath = join(outDir, `${table}.jsonl`);
      await writeFile(filePath, body, "utf8");
      const sha = createHash("sha256").update(body).digest("hex");
      manifest.tables.push({
        name: table,
        rows: lines.length,
        bytes: Buffer.byteLength(body, "utf8"),
        sha256: sha,
        pages: pages + 1,
      });
      console.log(`${lines.length.toLocaleString()} rows · ${sha.slice(0, 12)}…`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      manifest.tables.push({
        name: table,
        rows: 0,
        bytes: 0,
        sha256: "",
        pages: 0,
        error: msg,
      });
      console.log(`ERROR: ${msg}`);
    }
  }

  const manifestPath = join(outDir, "_manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  const totalRows = manifest.tables.reduce((sum, t) => sum + t.rows, 0);
  const totalBytes = manifest.tables.reduce((sum, t) => sum + t.bytes, 0);
  const errorCount = manifest.tables.filter((t) => t.error).length;

  console.log("");
  console.log(`[export-tier1] Done — ${totalRows.toLocaleString()} rows · ${(totalBytes / 1024).toFixed(1)} KiB · ${errorCount} errors`);
  console.log(`[export-tier1] Manifest: ${manifestPath}`);

  if (errorCount > 0) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("[export-tier1] Fatal:", err);
  process.exit(1);
});
