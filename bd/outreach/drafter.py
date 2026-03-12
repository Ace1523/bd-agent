"""Generate Markdown outreach reports from email sequences."""

from bd.formatting import format_revenue
from bd.models import OutreachSequence
from bd.save import save_outreach


def generate_outreach_report(sequence: OutreachSequence) -> str:
    """Render a Markdown report of a full outreach email sequence."""
    p = sequence.dossier.prospect
    lines: list[str] = []

    lines.append(f"# Outreach Sequence — {p.company_name}")
    lines.append("")
    lines.append(f"- **Target**: {p.company_name}")
    lines.append(f"- **Revenue**: {format_revenue(p.revenue_estimate)}")
    lines.append(f"- **ICP Score**: {p.score:.0f}")
    lines.append(f"- **Emails in sequence**: {len(sequence.emails)}")
    lines.append("")

    for email in sequence.emails:
        lines.append(f"## Email {email.sequence_number}")
        lines.append("")
        lines.append(f"- **Subject**: {email.subject}")
        lines.append(f"- **Timing**: +{email.send_delay_days} days")
        lines.append(f"- **Hook**: {email.hook}")
        lines.append("")
        lines.append(email.body)
        lines.append("")
        lines.append("---")
        lines.append("")

    report = "\n".join(lines)
    save_outreach(report, sequence)
    return report
