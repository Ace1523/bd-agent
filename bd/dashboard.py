"""Export Pydantic models to JSON for the dashboard and bootstrap from Markdown."""

import json
import re
import datetime
from pathlib import Path
from typing import Union

from bd.models import (
    ColdEmail,
    Contact,
    Dossier,
    FitAssessment,
    FitRating,
    FitTier,
    LinkedInMessage,
    OutreachPackage,
    Prospect,
    Signal,
    SignalType,
    TriggerEvent,
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SITE_DIR = Path(__file__).resolve().parent.parent / "site"
DASHBOARD_JSON = DATA_DIR / "dashboard.json"


def _load_dashboard() -> dict:
    """Load existing dashboard.json or return empty structure."""
    if DASHBOARD_JSON.exists():
        return json.loads(DASHBOARD_JSON.read_text())
    return {"discovery_runs": [], "dossiers": [], "outreach_packages": []}


def _save_dashboard(data: dict) -> Path:
    """Write dashboard data to JSON (both data/ and site/ copies)."""
    DATA_DIR.mkdir(exist_ok=True)
    content = json.dumps(data, indent=2, default=str)
    DASHBOARD_JSON.write_text(content)
    # Also write a copy into site/ so the static server can serve it
    if SITE_DIR.exists():
        (SITE_DIR / "dashboard.json").write_text(content)
    return DASHBOARD_JSON


def export_dashboard_json(
    prospects: Union[list[Prospect], None] = None,
    dossiers: Union[list[Dossier], None] = None,
    outreach_packages: Union[list[OutreachPackage], None] = None,
) -> Path:
    """Export all data to dashboard.json, merging with existing data."""
    data = _load_dashboard()

    if prospects:
        run = {
            "date": datetime.date.today().isoformat(),
            "prospects": [p.model_dump(mode="json") for p in prospects],
        }
        data["discovery_runs"].append(run)

    if dossiers:
        for d in dossiers:
            data["dossiers"].append(d.model_dump(mode="json"))

    if outreach_packages:
        if "outreach_packages" not in data:
            data["outreach_packages"] = []
        for pkg in outreach_packages:
            data["outreach_packages"].append(pkg.model_dump(mode="json"))

    return _save_dashboard(data)


# ---------------------------------------------------------------------------
# Markdown bootstrap parsers — reconstruct Pydantic objects from existing .md
# ---------------------------------------------------------------------------

SIGNAL_TYPE_MAP = {
    "reorg": SignalType.reorg,
    "restructuring": SignalType.reorg,
    "m&a": SignalType.m_and_a,
    "m_and_a": SignalType.m_and_a,
    "leadership change": SignalType.leadership_change,
    "leadership_change": SignalType.leadership_change,
    "earnings miss": SignalType.earnings_miss,
    "earnings_miss": SignalType.earnings_miss,
    "rapid growth": SignalType.rapid_growth,
    "rapid_growth": SignalType.rapid_growth,
    "transformation": SignalType.transformation,
    "hiring surge": SignalType.hiring_surge,
    "hiring_surge": SignalType.hiring_surge,
    "hiring": SignalType.hiring_surge,
    "funding": SignalType.funding,
    "fundraising": SignalType.funding,
    "partnership": SignalType.partnership,
    "partnerships": SignalType.partnership,
    "joint venture": SignalType.partnership,
}


def _parse_signal_type(text: str) -> SignalType:
    key = text.strip().lower()
    return SIGNAL_TYPE_MAP.get(key, SignalType.transformation)


def _parse_revenue(text: str) -> Union[float, None]:
    m = re.search(r"\$([0-9.]+)([BMK])", text, re.IGNORECASE)
    if not m:
        return None
    val = float(m.group(1))
    suffix = m.group(2).upper()
    if suffix == "B":
        return val * 1_000_000_000
    if suffix == "M":
        return val * 1_000_000
    if suffix == "K":
        return val * 1_000
    return val


def _parse_employees(text: str) -> Union[int, None]:
    m = re.search(r"([0-9,]+)K\+", text)
    if m:
        return int(m.group(1).replace(",", "")) * 1000
    m = re.search(r"([0-9,]+)\+?", text)
    if m:
        return int(m.group(1).replace(",", ""))
    return None


def _parse_date(text: str) -> Union[datetime.date, None]:
    m = re.search(r"(\d{4}-\d{2}-\d{2})", text)
    if m:
        return datetime.date.fromisoformat(m.group(1))
    return None


def _extract_source_url(text: str) -> Union[str, None]:
    m = re.search(r"\[source\]\((.*?)\)", text)
    return m.group(1) if m else None


def parse_discovery_markdown(md: str) -> list[list[Prospect]]:
    """Parse discovery.md into lists of prospects (one list per run)."""
    runs = re.split(r"^# Discovery Report", md, flags=re.MULTILINE)
    all_runs = []

    for run_text in runs:
        if not run_text.strip():
            continue

        company_blocks = re.split(r"^### \d+\.\s+", run_text, flags=re.MULTILINE)
        prospects = []

        for block in company_blocks[1:]:  # skip preamble
            lines = block.strip().split("\n")
            # First line: "CompanyName — Score NN"
            header = lines[0]
            name_match = re.match(r"(.+?)\s*—\s*Score\s+(\d+)", header)
            if not name_match:
                continue

            company_name = name_match.group(1).strip()
            score = float(name_match.group(2))

            revenue = None
            employees = None
            industry = None
            signals = []
            source_urls = []
            summary = None

            in_signals = False
            in_justification = False
            justification_lines = []

            for line in lines[1:]:
                stripped = line.strip()

                if stripped.startswith("- **Revenue**"):
                    revenue = _parse_revenue(stripped)
                elif stripped.startswith("- **Employees**"):
                    employees = _parse_employees(stripped)
                elif stripped.startswith("- **Industry**"):
                    industry = stripped.split(":", 1)[1].strip() if ":" in stripped else None
                elif stripped == "**Signals**":
                    in_signals = True
                    in_justification = False
                elif stripped == "**Justification**":
                    in_justification = True
                    in_signals = False
                elif in_signals and stripped.startswith("- **"):
                    # Parse signal line: - **Type** (date): description — [source](url)
                    sig_match = re.match(
                        r"- \*\*(.+?)\*\*\s*(?:\(([^)]*)\))?\s*:\s*(.*)", stripped
                    )
                    if sig_match:
                        sig_type = _parse_signal_type(sig_match.group(1))
                        sig_date = _parse_date(sig_match.group(2) or "")
                        sig_desc = sig_match.group(3).strip()
                        sig_source = _extract_source_url(sig_desc)
                        # Clean description of source link
                        sig_desc = re.sub(
                            r"\s*—?\s*\[source\]\(.*?\)\s*$", "", sig_desc
                        ).strip()
                        signals.append(
                            Signal(
                                type=sig_type,
                                description=sig_desc,
                                date=sig_date,
                                source=sig_source,
                            )
                        )
                        if sig_source:
                            source_urls.append(sig_source)
                elif in_justification and stripped:
                    justification_lines.append(stripped)

            if justification_lines:
                summary = " ".join(justification_lines)

            prospects.append(
                Prospect(
                    company_name=company_name,
                    revenue_estimate=revenue,
                    employee_count=employees,
                    industry=industry,
                    signals=signals,
                    score=score,
                    source_urls=source_urls,
                    summary=summary,
                )
            )

        if prospects:
            all_runs.append(prospects)

    return all_runs


def parse_research_markdown(md: str) -> list[Dossier]:
    """Parse research.md into Dossier objects."""
    dossier_blocks = re.split(r"^# Research Dossier", md, flags=re.MULTILINE)
    dossiers = []

    for block in dossier_blocks:
        if not block.strip():
            continue

        # Company name from first line
        first_line = block.strip().split("\n")[0]
        name_match = re.match(r"\s*—\s*(.+)", first_line)
        company_name = name_match.group(1).strip() if name_match else "Unknown"

        # Parse overview fields
        revenue = None
        employees = None
        industry = None
        score = 0.0

        overview_match = re.search(
            r"## Company Overview\s*\n(.*?)(?=\n## )", block, re.DOTALL
        )
        if overview_match:
            overview = overview_match.group(1)
            for line in overview.split("\n"):
                if "Revenue" in line:
                    revenue = _parse_revenue(line)
                elif "Employees" in line:
                    employees = _parse_employees(line)
                elif "Industry" in line and ":" in line:
                    industry = line.split(":", 1)[1].strip().strip("*")
                elif "ICP Score" in line:
                    m = re.search(r"(\d+)", line)
                    if m:
                        score = float(m.group(1))

        # Parse contacts
        contacts = []
        contacts_match = re.search(
            r"## Key Contacts\s*\n(.*?)(?=\n## )", block, re.DOTALL
        )
        if contacts_match:
            table_text = contacts_match.group(1)
            for row in table_text.strip().split("\n"):
                if row.startswith("|") and not row.startswith("| Name") and "---" not in row:
                    cols = [c.strip() for c in row.split("|")[1:-1]]
                    if len(cols) >= 2 and cols[0]:
                        contacts.append(
                            Contact(
                                name=cols[0],
                                title=cols[1] if len(cols) > 1 else "",
                                linkedin=cols[2] if len(cols) > 2 and cols[2] != "—" else None,
                                notes=cols[3] if len(cols) > 3 and cols[3] != "—" else None,
                            )
                        )

        # Parse pain points
        pain_points = []
        pain_match = re.search(
            r"## Pain Points\s*\n(.*?)(?=\n## )", block, re.DOTALL
        )
        if pain_match:
            for line in pain_match.group(1).split("\n"):
                line = line.strip()
                if line.startswith("- "):
                    pain_points.append(line[2:].strip())

        # Parse competitors
        competitors = []
        comp_match = re.search(
            r"## Competitive Landscape\s*\n(.*?)(?=\n## )", block, re.DOTALL
        )
        if comp_match:
            for line in comp_match.group(1).split("\n"):
                line = line.strip()
                if line.startswith("- ") and "No specific" not in line and "typically" not in line.lower():
                    competitors.append(line[2:].strip())

        # Parse timeline
        timeline = None
        timeline_match = re.search(
            r"## Transformation Timeline\s*\n(.*?)(?=\n## )", block, re.DOTALL
        )
        if timeline_match:
            timeline = timeline_match.group(1).strip()

        # Parse budget
        budget = None
        budget_match = re.search(
            r"## Budget Context\s*\n(.*?)(?=\n## )", block, re.DOTALL
        )
        if budget_match:
            budget = budget_match.group(1).strip()

        # Parse analysis
        analysis = ""
        analysis_match = re.search(r"## Analysis\s*\n(.*?)(?=\n---|\Z)", block, re.DOTALL)
        if analysis_match:
            analysis = analysis_match.group(1).strip()

        # Parse brand insights
        brand_insights = None
        brand_match = re.search(
            r"## Brand Insights & Market Positioning\s*\n(.*?)(?=\n## |\n---|\Z)",
            block,
            re.DOTALL,
        )
        if brand_match:
            brand_insights = brand_match.group(1).strip()

        # Parse deep fit analysis
        deep_fit_analysis = None
        fit_match = re.search(
            r"## Deep McChrystal Group Fit Analysis\s*\n(.*?)(?=\n## |\n---|\Z)",
            block,
            re.DOTALL,
        )
        if fit_match:
            deep_fit_analysis = fit_match.group(1).strip()

        prospect = Prospect(
            company_name=company_name,
            revenue_estimate=revenue,
            employee_count=employees,
            industry=industry,
            score=score,
        )

        dossiers.append(
            Dossier(
                prospect=prospect,
                key_contacts=contacts,
                pain_points=pain_points,
                competitors_present=competitors,
                transformation_timeline=timeline,
                budget_context=budget,
                detailed_analysis=analysis,
                brand_insights=brand_insights,
                deep_fit_analysis=deep_fit_analysis,
            )
        )

    return dossiers


def parse_outreach_markdown(md: str) -> list[OutreachPackage]:
    """Parse outreach.md into OutreachPackage objects."""
    pkg_blocks = re.split(r"^# Outreach Package", md, flags=re.MULTILINE)
    packages = []

    for block in pkg_blocks:
        if not block.strip():
            continue

        # Company name from first line: " — CompanyName"
        first_line = block.strip().split("\n")[0]
        name_match = re.match(r"\s*—\s*(.+)", first_line)
        company_name = name_match.group(1).strip() if name_match else "Unknown"

        # Parse target contact
        target_name = ""
        target_title = ""
        target_rationale = ""
        score = 0.0
        rating = ""

        for line in block.split("\n")[:10]:
            stripped = line.strip()
            if stripped.startswith("**Target**:"):
                parts = stripped.replace("**Target**:", "").strip()
                if "," in parts:
                    target_name, target_title = parts.split(",", 1)
                    target_name = target_name.strip()
                    target_title = target_title.strip()
            elif stripped.startswith("**Why this contact**:"):
                target_rationale = stripped.replace("**Why this contact**:", "").strip()
            elif "**Score**:" in stripped:
                m = re.search(r"\*\*Score\*\*:\s*(\d+)", stripped)
                if m:
                    score = float(m.group(1))
                m2 = re.search(r"\*\*Fit\*\*:\s*(\w+)", stripped)
                if m2:
                    rating = m2.group(1).lower()

        # Parse cold email versions
        cold_emails = []
        version_blocks = re.split(r"^## Version ([ABC])\s*—\s*(.+)$", block, flags=re.MULTILINE)

        # version_blocks: [preamble, "A", "Trigger-based", content, "B", "Insight-based", content, ...]
        i = 1
        while i + 2 < len(version_blocks):
            version = version_blocks[i]
            label = version_blocks[i + 1].strip()
            content = version_blocks[i + 2]

            subject = ""
            hook = ""
            body_lines = []

            lines = content.strip().split("\n")
            in_body = False

            for line in lines:
                stripped = line.strip()
                if stripped.startswith("**Subject**:"):
                    subject = stripped.replace("**Subject**:", "").strip()
                elif stripped.startswith("**Hook**:"):
                    hook = stripped.replace("**Hook**:", "").strip()
                elif stripped == "---":
                    break
                elif not stripped.startswith("**") and stripped:
                    in_body = True
                    body_lines.append(line)
                elif in_body:
                    body_lines.append(line)

            if subject:
                cold_emails.append(
                    ColdEmail(
                        version=version,
                        label=label,
                        subject=subject,
                        body="\n".join(body_lines).strip(),
                        hook=hook,
                    )
                )

            i += 3

        # Parse LinkedIn message
        linkedin_message = None
        li_match = re.search(
            r"^## LinkedIn Message\s*\n(.*?)(?=\n---|\n## |\Z)", block,
            re.MULTILINE | re.DOTALL,
        )
        if li_match:
            li_text = li_match.group(1)
            li_type = "connection_request"
            li_subject = None
            li_hook = ""
            li_body_lines = []

            for line in li_text.strip().split("\n"):
                stripped = line.strip()
                if stripped.startswith("**Type**:"):
                    li_type = stripped.replace("**Type**:", "").strip()
                elif stripped.startswith("**Subject**:"):
                    li_subject = stripped.replace("**Subject**:", "").strip()
                elif stripped.startswith("**Hook**:"):
                    li_hook = stripped.replace("**Hook**:", "").strip()
                elif not stripped.startswith("**") and stripped:
                    li_body_lines.append(line)

            if li_body_lines:
                linkedin_message = LinkedInMessage(
                    message_type=li_type,
                    subject=li_subject,
                    body="\n".join(li_body_lines).strip(),
                    hook=li_hook,
                )

        # Create minimal prospect/dossier
        prospect = Prospect(company_name=company_name, score=score)
        dossier = Dossier(prospect=prospect)

        target_contact = Contact(
            name=target_name or "Unknown",
            title=target_title or "Unknown",
            priority_rationale=target_rationale or None,
            is_priority_target=True,
        )

        packages.append(
            OutreachPackage(
                dossier=dossier,
                target_contact=target_contact,
                cold_emails=cold_emails,
                linkedin_message=linkedin_message,
            )
        )

    return packages


def bootstrap_from_markdown() -> Path:
    """Parse existing Markdown reports and export to dashboard.json."""
    data = {"discovery_runs": [], "dossiers": [], "outreach_packages": []}

    # Parse discovery
    discovery_path = DATA_DIR / "discovery.md"
    if discovery_path.exists():
        md = discovery_path.read_text()
        runs = parse_discovery_markdown(md)
        for prospects in runs:
            data["discovery_runs"].append({
                "date": datetime.date.today().isoformat(),
                "prospects": [p.model_dump(mode="json") for p in prospects],
            })

    # Parse research
    research_path = DATA_DIR / "research.md"
    if research_path.exists():
        md = research_path.read_text()
        dossiers = parse_research_markdown(md)
        for d in dossiers:
            data["dossiers"].append(d.model_dump(mode="json"))

    # Parse outreach
    outreach_path = DATA_DIR / "outreach.md"
    if outreach_path.exists():
        md = outreach_path.read_text()
        packages = parse_outreach_markdown(md)
        for pkg in packages:
            data["outreach_packages"].append(pkg.model_dump(mode="json"))

    return _save_dashboard(data)


if __name__ == "__main__":
    path = bootstrap_from_markdown()
    print(f"Dashboard JSON exported to {path}")
