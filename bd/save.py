"""Save report content by appending to persistent files in data/."""

import json
from pathlib import Path
from typing import Union

from bd.models import Dossier, OutreachPackage, OutreachSequence, Prospect

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

DISCOVERY_FILE = DATA_DIR / "discovery.md"
RESEARCH_FILE = DATA_DIR / "research.md"
OUTREACH_FILE = DATA_DIR / "outreach.md"
SITE_DIR = Path(__file__).resolve().parent.parent / "docs"
DASHBOARD_JSON = DATA_DIR / "dashboard.json"


def _append(path: Path, content: str) -> Path:
    """Append content to a file, creating it if needed. Returns the path."""
    DATA_DIR.mkdir(exist_ok=True)
    separator = "\n\n---\n\n"
    if path.exists() and path.read_text().strip():
        with open(path, "a") as f:
            f.write(separator + content)
    else:
        path.write_text(content)
    return path


def _load_dashboard_json() -> dict:
    """Load existing dashboard.json or return empty structure."""
    if DASHBOARD_JSON.exists():
        return json.loads(DASHBOARD_JSON.read_text())
    return {"discovery_runs": [], "dossiers": [], "outreach_packages": []}


def _save_dashboard_json(data: dict) -> None:
    """Write dashboard JSON to both data/ and site/."""
    DATA_DIR.mkdir(exist_ok=True)
    content = json.dumps(data, indent=2, default=str)
    DASHBOARD_JSON.write_text(content)
    if SITE_DIR.exists():
        (SITE_DIR / "dashboard.json").write_text(content)


def save_discovery(report: str, prospects: Union[list[Prospect], None] = None) -> Path:
    """Append a discovery report to data/discovery.md and update JSON."""
    path = _append(DISCOVERY_FILE, report)
    if prospects:
        import datetime

        data = _load_dashboard_json()
        data["discovery_runs"].append({
            "date": datetime.date.today().isoformat(),
            "prospects": [p.model_dump(mode="json") for p in prospects],
        })
        _save_dashboard_json(data)
    return path


def save_research(report: str, dossier: Union[Dossier, None] = None) -> Path:
    """Append a dossier report to data/research.md and update JSON."""
    path = _append(RESEARCH_FILE, report)
    if dossier:
        data = _load_dashboard_json()
        data["dossiers"].append(dossier.model_dump(mode="json"))
        _save_dashboard_json(data)
    return path


def save_outreach(report: str, package: Union[OutreachPackage, None] = None) -> Path:
    """Append an outreach report to data/outreach.md and update JSON."""
    path = _append(OUTREACH_FILE, report)
    if package:
        data = _load_dashboard_json()
        if "outreach_packages" not in data:
            data["outreach_packages"] = []
        data["outreach_packages"].append(package.model_dump(mode="json"))
        _save_dashboard_json(data)
    return path


def clear_outreach() -> None:
    """Remove all outreach data from outreach.md and dashboard.json."""
    if OUTREACH_FILE.exists():
        OUTREACH_FILE.write_text("")
    data = _load_dashboard_json()
    data["outreach_packages"] = []
    # Also clear legacy key if present
    data.pop("outreach_sequences", None)
    _save_dashboard_json(data)
