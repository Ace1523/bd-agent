"""Generate Markdown outreach reports from outreach packages."""

from bd.formatting import format_revenue
from bd.models import OutreachPackage
from bd.save import save_outreach


def generate_outreach_report(package: OutreachPackage) -> str:
    """Render a Markdown report of an outreach package (3 cold email versions)."""
    p = package.dossier.prospect
    tc = package.target_contact
    fa = package.dossier.fit_assessment
    rating = fa.rating.value if fa else "N/A"
    lines: list[str] = []

    lines.append(f"# Outreach Package — {p.company_name}")
    lines.append("")
    lines.append(f"**Target**: {tc.name}, {tc.title}")
    lines.append(f"**Why this contact**: {tc.priority_rationale or 'N/A'}")
    lines.append(f"**Company**: {p.company_name} | **Score**: {p.score:.0f} | **Fit**: {rating}")
    lines.append("")
    lines.append("---")
    lines.append("")

    for email in package.cold_emails:
        lines.append(f"## Version {email.version} — {email.label}")
        lines.append(f"**Subject**: {email.subject}")
        lines.append(f"**Hook**: {email.hook}")
        lines.append("")
        lines.append(email.body)
        lines.append("")
        lines.append("---")
        lines.append("")

    if package.linkedin_message:
        lm = package.linkedin_message
        lines.append("## LinkedIn Message")
        lines.append(f"**Type**: {lm.message_type}")
        if lm.subject:
            lines.append(f"**Subject**: {lm.subject}")
        lines.append(f"**Hook**: {lm.hook}")
        lines.append("")
        lines.append(lm.body)
        lines.append("")
        lines.append("---")
        lines.append("")

    report = "\n".join(lines)
    save_outreach(report, package)
    return report
