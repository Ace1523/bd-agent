"""Save report content by appending to persistent files in data/."""

import fcntl
import json
from pathlib import Path
from typing import Union

from bd.models import Dossier, MarketSector, OutreachPackage, Prospect

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

DISCOVERY_FILE = DATA_DIR / "discovery.md"
RESEARCH_FILE = DATA_DIR / "research.md"
OUTREACH_FILE = DATA_DIR / "outreach.md"
MARKET_FILE = DATA_DIR / "market_intelligence.md"
SITE_DIR = Path(__file__).resolve().parent.parent / "docs"
DASHBOARD_JSON = DATA_DIR / "dashboard.json"
LOCK_FILE = DATA_DIR / ".dashboard.lock"


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
    return {"discovery_runs": [], "dossiers": [], "outreach_packages": [], "market_intelligence": []}


def _save_dashboard_json(data: dict) -> None:
    """Write dashboard JSON to both data/ and site/."""
    DATA_DIR.mkdir(exist_ok=True)
    content = json.dumps(data, indent=2, default=str)
    DASHBOARD_JSON.write_text(content)
    if SITE_DIR.exists():
        (SITE_DIR / "dashboard.json").write_text(content)


def _locked_update(update_fn) -> None:
    """Acquire a file lock, load dashboard.json, apply update_fn, and save.

    Prevents race conditions when parallel subagents write simultaneously.
    """
    DATA_DIR.mkdir(exist_ok=True)
    with open(LOCK_FILE, "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        try:
            data = _load_dashboard_json()
            update_fn(data)
            _save_dashboard_json(data)
        finally:
            fcntl.flock(lock, fcntl.LOCK_UN)


def save_discovery(report: str, prospects: Union[list[Prospect], None] = None) -> Path:
    """Append a discovery report to data/discovery.md and update JSON."""
    path = _append(DISCOVERY_FILE, report)
    if prospects:
        import datetime

        def update(data):
            data["discovery_runs"].append({
                "date": datetime.date.today().isoformat(),
                "prospects": [p.model_dump(mode="json") for p in prospects],
            })

        _locked_update(update)
    return path


def save_research(report: str, dossier: Union[Dossier, None] = None) -> Path:
    """Append a dossier report to data/research.md and update JSON."""
    path = _append(RESEARCH_FILE, report)
    if dossier:
        def update(data):
            data["dossiers"].append(dossier.model_dump(mode="json"))

        _locked_update(update)
    return path


def save_outreach(report: str, package: Union[OutreachPackage, None] = None) -> Path:
    """Append an outreach report to data/outreach.md and update JSON."""
    path = _append(OUTREACH_FILE, report)
    if package:
        def update(data):
            if "outreach_packages" not in data:
                data["outreach_packages"] = []
            data["outreach_packages"].append(package.model_dump(mode="json"))

        _locked_update(update)
    return path


def clear_outreach() -> None:
    """Remove all outreach data from outreach.md and dashboard.json."""
    if OUTREACH_FILE.exists():
        OUTREACH_FILE.write_text("")

    def update(data):
        data["outreach_packages"] = []
        data.pop("outreach_sequences", None)

    _locked_update(update)


def save_market_intelligence(
    report: str, sectors: Union[list[MarketSector], None] = None
) -> Path:
    """Replace market intelligence in market_intelligence.md and dashboard.json."""
    DATA_DIR.mkdir(exist_ok=True)
    MARKET_FILE.write_text(report)
    if sectors:
        def update(data):
            data["market_intelligence"] = [
                s.model_dump(mode="json") for s in sectors
            ]

        _locked_update(update)
    return MARKET_FILE


def clear_market_intelligence() -> None:
    """Remove all market intelligence data."""
    if MARKET_FILE.exists():
        MARKET_FILE.write_text("")

    def update(data):
        data["market_intelligence"] = []

    _locked_update(update)
