"""
Build Slice 1 SQL — 300 UPDATE carriers SET naic_code (map band) + 637 INSERT
new carrier rows (review + create bands per conservative-fallback decision).

Reads tmp/texas_naic_mapping.csv. Writes:
  tmp/slice1_updates.sql  — single UPDATE FROM (VALUES) statement
  tmp/slice1_inserts.sql  — single INSERT INTO ... VALUES statement
  tmp/slice1_summary.txt  — count summary for Master O sanity check

NOTE: SQL escaping is manual (Supabase MCP execute_sql takes raw strings, no
parameter binding). Single-quote-doubling is the only escape needed for our
inputs (no semicolons in carrier names; no nested quotes nested deeper).
"""

from __future__ import annotations
import csv
from pathlib import Path
from collections import Counter

REPO_ROOT = Path(__file__).resolve().parent.parent
MAPPING_CSV = REPO_ROOT / "tmp" / "texas_naic_mapping.csv"
OUT_UPDATES = REPO_ROOT / "tmp" / "slice1_updates.sql"
OUT_INSERTS = REPO_ROOT / "tmp" / "slice1_inserts.sql"
OUT_SUMMARY = REPO_ROOT / "tmp" / "slice1_summary.txt"


def sql_str(s: str) -> str:
    """SQL string literal — escape single quotes via doubling."""
    return "'" + s.replace("'", "''") + "'"


def main() -> None:
    rows = list(csv.DictReader(MAPPING_CSV.open("r", encoding="utf-8")))
    counts = Counter(r["action"] for r in rows)

    map_rows = [r for r in rows if r["action"] == "map"]
    new_rows = [r for r in rows if r["action"] in ("review", "create")]

    # --- UPDATEs (map band) ---
    # Use UPDATE c SET naic_code = v.naic FROM (VALUES (uuid::uuid, naic::text), ...) v(id, naic) WHERE c.id = v.id;
    values = ",\n  ".join(
        f"({sql_str(r['matched_carrier_id'])}::uuid, {sql_str(r['naic_id'])})"
        for r in map_rows
    )
    update_sql = (
        "-- Slice 1A: backfill NAIC code on 300 existing carriers (map band).\n"
        "UPDATE public.carriers AS c\n"
        "SET naic_code = v.naic\n"
        "FROM (VALUES\n  "
        + values
        + "\n) AS v(id, naic)\n"
        "WHERE c.id = v.id;\n"
    )
    OUT_UPDATES.write_text(update_sql, encoding="utf-8")

    # --- INSERTs (review + create bands) ---
    # INSERT into public.carriers (name, naic_code, active) VALUES (...), (...);
    insert_values = ",\n  ".join(
        f"({sql_str(r['csv_carrier_name'])}, {sql_str(r['naic_id'])}, true)"
        for r in new_rows
    )
    insert_sql = (
        f"-- Slice 1B: insert {len(new_rows)} new carrier rows (review + create bands).\n"
        "INSERT INTO public.carriers (name, naic_code, active) VALUES\n  "
        + insert_values
        + "\n;\n"
    )
    OUT_INSERTS.write_text(insert_sql, encoding="utf-8")

    # --- Summary ---
    summary = (
        f"Slice 1 SQL build — {MAPPING_CSV.name}\n"
        f"=====================================\n"
        f"Action distribution:\n"
        f"  map    (>=0.92):  {counts['map']}  → UPDATE existing carriers SET naic_code\n"
        f"  review (>=0.75):  {counts['review']}  → INSERT new (conservative fallback: avoid false-merger risk)\n"
        f"  create (<0.75):   {counts['create']}  → INSERT new (no good match)\n"
        f"\n"
        f"Will UPDATE: {len(map_rows)} rows in public.carriers\n"
        f"Will INSERT: {len(new_rows)} new rows in public.carriers\n"
        f"Expected post-state:\n"
        f"  carriers row count        1,369 → {1369 + len(new_rows)}\n"
        f"  carriers.naic_code NOT NULL   0 → {len(map_rows) + len(new_rows)}\n"
        f"\n"
        f"Files written:\n"
        f"  {OUT_UPDATES.relative_to(REPO_ROOT)}  ({OUT_UPDATES.stat().st_size:,} bytes)\n"
        f"  {OUT_INSERTS.relative_to(REPO_ROOT)}  ({OUT_INSERTS.stat().st_size:,} bytes)\n"
    )
    OUT_SUMMARY.write_text(summary, encoding="utf-8")
    print(summary)


if __name__ == "__main__":
    main()
