"""Pipeline helpers for orchestrating discover -> research -> outreach."""

import json
from pathlib import Path
from typing import Union

from bd.models import Prospect
from bd.save import (
    DATA_DIR,
    DASHBOARD_JSON,
    DISCOVERY_FILE,
    OUTREACH_FILE,
    RESEARCH_FILE,
    _load_dashboard_json,
    _save_dashboard_json,
)


def get_existing_prospects() -> list[Prospect]:
    """Read all unique prospects from dashboard.json, highest score wins."""
    data = _load_dashboard_json()
    best: dict[str, dict] = {}
    for run in data.get("discovery_runs", []):
        for p in run.get("prospects", []):
            name = p.get("company_name", "")
            existing = best.get(name)
            if not existing or p.get("score", 0) > existing.get("score", 0):
                best[name] = p
    return [Prospect.model_validate(v) for v in best.values()]


def pipeline_status() -> dict:
    """Return counts and coverage for each pipeline phase."""
    data = _load_dashboard_json()

    prospect_names: set[str] = set()
    for run in data.get("discovery_runs", []):
        for p in run.get("prospects", []):
            prospect_names.add(p.get("company_name", ""))

    dossier_names = {
        d["prospect"]["company_name"]
        for d in data.get("dossiers", [])
        if d.get("prospect")
    }

    # Support both new outreach_packages and legacy outreach_sequences
    outreach_names: set[str] = set()
    for pkg in data.get("outreach_packages", []):
        name = pkg.get("dossier", {}).get("prospect", {}).get("company_name")
        if name:
            outreach_names.add(name)
    for seq in data.get("outreach_sequences", []):
        name = seq.get("dossier", {}).get("prospect", {}).get("company_name")
        if name:
            outreach_names.add(name)

    missing_dossiers = prospect_names - dossier_names
    missing_outreach = dossier_names - outreach_names

    return {
        "prospects": len(prospect_names),
        "dossiers": len(dossier_names),
        "outreach_packages": len(outreach_names),
        "missing_dossiers": sorted(missing_dossiers),
        "missing_outreach": sorted(missing_outreach),
    }


def clear_phase(phase: str) -> None:
    """Clear data for a pipeline phase: 'discovery', 'research', or 'outreach'."""
    data = _load_dashboard_json()

    if phase == "discovery":
        data["discovery_runs"] = []
        if DISCOVERY_FILE.exists():
            DISCOVERY_FILE.write_text("")
    elif phase == "research":
        data["dossiers"] = []
        if RESEARCH_FILE.exists():
            RESEARCH_FILE.write_text("")
    elif phase == "outreach":
        data["outreach_packages"] = []
        data.pop("outreach_sequences", None)
        if OUTREACH_FILE.exists():
            OUTREACH_FILE.write_text("")
    else:
        raise ValueError(f"Unknown phase: {phase!r}. Use 'discovery', 'research', or 'outreach'.")

    _save_dashboard_json(data)
