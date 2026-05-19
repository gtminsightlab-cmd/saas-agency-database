"""
Chunk Slice 1B carrier INSERTs into smaller files so each fits in a single
Supabase MCP execute_sql call without saturating context.

Input: tmp/texas_naic_mapping.csv
Output: tmp/slice1_inserts_part1.sql ... tmp/slice1_inserts_partN.sql
        Each file has at most CHUNK_SIZE INSERT VALUES rows.
"""
from __future__ import annotations
import csv
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MAPPING_CSV = REPO_ROOT / "tmp" / "texas_naic_mapping.csv"
OUT_DIR = REPO_ROOT / "tmp"
CHUNK_SIZE = 200  # 637 / 200 = 4 chunks


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main() -> None:
    rows = list(csv.DictReader(MAPPING_CSV.open("r", encoding="utf-8")))
    new_rows = [r for r in rows if r["action"] in ("review", "create")]

    n_chunks = (len(new_rows) + CHUNK_SIZE - 1) // CHUNK_SIZE
    for i in range(n_chunks):
        chunk = new_rows[i * CHUNK_SIZE:(i + 1) * CHUNK_SIZE]
        values = ",\n  ".join(
            f"({sql_str(r['csv_carrier_name'])}, {sql_str(r['naic_id'])}, true)"
            for r in chunk
        )
        sql = (
            f"-- Slice 1B part {i+1}/{n_chunks}: insert {len(chunk)} carriers\n"
            "INSERT INTO public.carriers (name, naic_code, active) VALUES\n  "
            + values + "\n;\n"
        )
        out = OUT_DIR / f"slice1_inserts_part{i+1}.sql"
        out.write_text(sql, encoding="utf-8")
        print(f"  wrote {out.name}: {len(chunk)} rows, {out.stat().st_size:,} bytes")

    print(f"Total: {len(new_rows)} rows across {n_chunks} files")


if __name__ == "__main__":
    main()
