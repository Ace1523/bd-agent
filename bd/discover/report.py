"""Generate Markdown reports from discovery runs."""

import datetime

from bd.formatting import format_revenue, format_employees
from bd.models import FitTier, Prospect
from bd.save import save_discovery


TIER_LABELS = {
    FitTier.tier_1: "Tier 1 — Conventional",
    FitTier.tier_2: "Tier 2 — Adjacent",
    FitTier.tier_3: "Tier 3 — Unconventional",
}


def generate_report(prospects: list[Prospect]) -> str:
    """Render a Markdown report string from scored prospects."""
    now = datetime.datetime.now()
    scores = [p.score for p in prospects]

    lines: list[str] = []

    # Header
    lines.append(f"# Discovery Report — {now.strftime('%B %d, %Y %H:%M')}")
    lines.append("")
    lines.append(f"- **Prospects found**: {len(prospects)}")
    if scores:
        lines.append(f"- **Score range**: {min(scores):.0f}–{max(scores):.0f}")
    lines.append("")

    # Summary table
    lines.append("## Summary")
    lines.append("")
    lines.append("| # | Company | Tier | Score | Revenue | Employees | Signals |")
    lines.append("|---|---------|------|------:|--------:|----------:|---------|")
    for i, p in enumerate(prospects, 1):
        signal_types = [s.type.value.replace("_", " ").title() for s in p.signals]
        unique = list(dict.fromkeys(signal_types))
        signals_str = ", ".join(unique[:4])
        tier_str = p.tier.value.replace("_", " ").title() if p.tier else "—"
        lines.append(
            f"| {i} | {p.company_name} | {tier_str} | {p.score:.0f} "
            f"| {format_revenue(p.revenue_estimate)} "
            f"| {format_employees(p.employee_count)} "
            f"| {signals_str} |"
        )
    lines.append("")

    # Detail sections — grouped by tier
    for tier in [FitTier.tier_1, FitTier.tier_2, FitTier.tier_3, None]:
        tier_prospects = [p for p in prospects if p.tier == tier]
        if not tier_prospects:
            continue

        if tier:
            lines.append(f"## {TIER_LABELS[tier]}")
        else:
            lines.append("## Unclassified")
        lines.append("")

        for p in tier_prospects:
            lines.append(f"### {p.company_name} — Score {p.score:.0f}")
            lines.append("")
            lines.append(f"- **Revenue**: {format_revenue(p.revenue_estimate)}")
            lines.append(f"- **Employees**: {format_employees(p.employee_count)}")
            if p.industry:
                lines.append(f"- **Industry**: {p.industry}")
            if p.tier:
                lines.append(f"- **Tier**: {TIER_LABELS.get(p.tier, p.tier.value)}")
            lines.append("")

            if p.signals:
                lines.append("**Signals**")
                lines.append("")
                for s in p.signals:
                    date_str = f" ({s.date})" if s.date else ""
                    source_str = f" — [source]({s.source})" if s.source else ""
                    lines.append(f"- **{s.type.value.replace('_', ' ').title()}**{date_str}: {s.description}{source_str}")
                lines.append("")

            if p.entry_point:
                lines.append("**Entry Point**")
                lines.append("")
                lines.append(p.entry_point)
                lines.append("")

            if p.conversation_hook:
                lines.append("**Conversation Hook**")
                lines.append("")
                lines.append(p.conversation_hook)
                lines.append("")

            if p.summary:
                lines.append("**Why They Fit**")
                lines.append("")
                lines.append(p.summary)
                lines.append("")

    report = "\n".join(lines)
    save_discovery(report, prospects)
    return report
