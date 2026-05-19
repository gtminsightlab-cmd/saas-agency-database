"""
Generate tmp/texas_naic_mapping.csv from Texas 2026.csv vs public.carriers.

Slice 4 of Session A (state DOI appointment ETL prep). NO DB writes — output
is a review artifact that Master O spot-checks before Session B starts the
actual carriers.naic_code backfill.

Inputs:
  TEXAS_CSV       — Texas 2026 DOI appointments file
  CARRIERS_SOURCE — Supabase MCP tool-result file containing the carriers
                    snapshot embedded in <untrusted-data-...> boundaries.

Output:
  tmp/texas_naic_mapping.csv with columns:
    naic_id, csv_carrier_name, csv_appearance_count,
    matched_carrier_id, matched_carrier_name, matched_group_name,
    match_score (0.0-1.0), action (map|create|review)

Action heuristic:
  score >= 0.92  -> map      (high-confidence; safe to apply at Session B start)
  score >= 0.75  -> review   (likely match but human eyeball required)
  score <  0.75  -> create   (no good match; new carrier row needed in DB)

Why difflib not rapidfuzz: stdlib only on Master O's Python 3.14 (no PyO3
forward-compat hassle). ~few hundred CSV carriers x 1369 carriers = trivial.
"""

from __future__ import annotations

import csv
import json
import re
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path

# ---------- paths ----------
REPO_ROOT = Path(__file__).resolve().parent.parent
TEXAS_CSV = Path(r"C:\Users\GTMin\OneDrive\Desktop\Agency Level Carrier Appointments\Texas 2026.csv")
CARRIERS_SOURCE = Path(
    r"C:\Users\GTMin\.claude\projects\C--Users-GTMin-Projects-saas-agency-database"
    r"\202f2f0b-f18c-43dd-b81e-174b8a109c3c\tool-results"
    r"\mcp-a7551cce-72a4-4510-a756-75884c17b895-execute_sql-1779224728002.txt"
)
OUT_CSV = REPO_ROOT / "tmp" / "texas_naic_mapping.csv"

# ---------- normalization for fuzzy match ----------
SUFFIX_NOISE = re.compile(
    r"\b(insurance|company|companies|co|corp|corporation|inc|incorporated|"
    r"llc|ltd|group|grp|the|and|of|a)\b",
    re.IGNORECASE,
)
PUNCT = re.compile(r"[^a-z0-9 ]+")
WHITESPACE = re.compile(r"\s+")


def normalize(name: str) -> str:
    """Lowercase, strip punctuation, drop common corporate noise tokens."""
    s = name.lower()
    s = PUNCT.sub(" ", s)
    s = SUFFIX_NOISE.sub(" ", s)
    s = WHITESPACE.sub(" ", s).strip()
    return s


def similarity(a: str, b: str) -> float:
    """SequenceMatcher ratio on normalized forms. Range 0.0-1.0."""
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()


# ---------- load carriers from MCP tool-result file ----------
def load_carriers(path: Path) -> list[dict]:
    # The MCP saves results as JSON with shape {"result": "<long string>"} where
    # the long string contains <untrusted-data-...> markers wrapping the JSON
    # array. Parse the outer envelope first, then extract the inner array.
    envelope = json.loads(path.read_text(encoding="utf-8"))
    inner = envelope["result"]
    m = re.search(r"<untrusted-data-[^>]+>\s*(\[.*?\])\s*</untrusted-data-", inner, re.DOTALL)
    if not m:
        raise RuntimeError(f"Could not locate carrier JSON in {path}")
    return json.loads(m.group(1))


# ---------- load distinct (NAIC, name) pairs from Texas CSV ----------
def load_texas_pairs(path: Path) -> dict[tuple[str, str], int]:
    """Returns {(naic_id, csv_carrier_name): appearance_count}."""
    counts: Counter[tuple[str, str]] = Counter()
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            naic = (row.get("NAIC ID") or "").strip()
            name = (row.get("Insurance company name") or "").strip()
            if naic and name:
                counts[(naic, name)] += 1
    return dict(counts)


# ---------- main ----------
def main() -> None:
    print(f"Reading carriers snapshot from: {CARRIERS_SOURCE.name}")
    carriers = load_carriers(CARRIERS_SOURCE)
    print(f"  loaded {len(carriers)} carrier rows")

    print(f"Reading Texas CSV from: {TEXAS_CSV.name}")
    texas_pairs = load_texas_pairs(TEXAS_CSV)
    print(f"  found {len(texas_pairs)} distinct (NAIC, name) pairs")

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)

    # Sort pairs by NAIC for stable output
    sorted_pairs = sorted(texas_pairs.items(), key=lambda kv: (kv[0][0], kv[0][1]))

    with OUT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([
            "naic_id",
            "csv_carrier_name",
            "csv_appearance_count",
            "matched_carrier_id",
            "matched_carrier_name",
            "matched_group_name",
            "match_score",
            "action",
        ])

        action_counts: Counter[str] = Counter()

        for (naic, csv_name), appearances in sorted_pairs:
            best_score = 0.0
            best_carrier: dict | None = None
            for c in carriers:
                score = similarity(csv_name, c["name"])
                if score > best_score:
                    best_score = score
                    best_carrier = c

            if best_score >= 0.92:
                action = "map"
            elif best_score >= 0.75:
                action = "review"
            else:
                action = "create"

            action_counts[action] += 1

            writer.writerow([
                naic,
                csv_name,
                appearances,
                (best_carrier or {}).get("carrier_id", ""),
                (best_carrier or {}).get("name", ""),
                (best_carrier or {}).get("group_name", "") or "",
                f"{best_score:.3f}",
                action,
            ])

    print(f"\nWrote {len(sorted_pairs)} rows to {OUT_CSV}")
    print(f"  map    (>=0.92): {action_counts['map']}")
    print(f"  review (>=0.75): {action_counts['review']}")
    print(f"  create (<0.75):  {action_counts['create']}")


if __name__ == "__main__":
    main()
