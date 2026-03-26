#!/usr/bin/env python3
"""Scan market intelligence for prospect candidates and cross-reference against pipeline."""

import json
from pathlib import Path


DATA_DIR = Path(__file__).parent / "data"
DASHBOARD_JSON = DATA_DIR / "dashboard.json"


def fuzzy_match(candidate: str, prospect_names: set[str]) -> str | None:
    """Check if a candidate matches any existing prospect (case-insensitive, substring)."""
    lower = candidate.strip().lower()
    for p in prospect_names:
        if lower == p or lower in p or p in lower:
            return p
    return None


def scan() -> None:
    data = json.loads(DASHBOARD_JSON.read_text()) if DASHBOARD_JSON.exists() else {}

    # Gather prospect names from discovery runs
    prospect_names: set[str] = set()
    for run in data.get("discovery_runs", []):
        for p in run.get("prospects", []):
            name = p.get("company_name", "").strip()
            if name:
                prospect_names.add(name)

    prospect_names_lower = {n.lower() for n in prospect_names}

    # Extract candidates from market intelligence sectors
    sectors = data.get("market_intelligence", [])
    if not sectors:
        print("No market intelligence data found in dashboard.json.")
        return

    new_by_sector: dict[str, list[str]] = {}
    already_in_pipeline: list[tuple[str, str]] = []  # (candidate, sector)
    total = 0

    for sector in sectors:
        sector_name = sector.get("name", "Unknown Sector")
        candidates = sector.get("prospect_candidates", [])
        for candidate in candidates:
            total += 1
            match = fuzzy_match(candidate, prospect_names_lower)
            if match:
                already_in_pipeline.append((candidate, sector_name))
            else:
                new_by_sector.setdefault(sector_name, []).append(candidate)

    new_count = sum(len(v) for v in new_by_sector.values())
    existing_count = len(already_in_pipeline)

    # Print results
    print("\n\u2550\u2550 Market Intel \u2192 Prospect Candidates \u2550\u2550\n")

    if new_by_sector:
        print("NEW (not in pipeline):")
        for sector, names in new_by_sector.items():
            print(f"  {sector}")
            for name in sorted(names):
                print(f"    \u2022 {name}")
        print()

    if already_in_pipeline:
        print(f"ALREADY IN PIPELINE ({existing_count} of {total}):")
        for candidate, sector in sorted(already_in_pipeline):
            print(f"    \u2022 {candidate} ({sector})")
        print()

    print(f"Total: {total} candidates, {new_count} new, {existing_count} already tracked")


if __name__ == "__main__":
    scan()
