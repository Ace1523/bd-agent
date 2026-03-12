"""Generate Markdown reports for market intelligence sectors."""

import datetime

from bd.models import MarketSector
from bd.save import save_market_intelligence


def generate_market_report(sectors: list[MarketSector]) -> str:
    """Render market intelligence sectors as Markdown and save."""
    lines = [
        f"# Market Intelligence Report — {datetime.date.today().isoformat()}",
        "",
    ]

    for sector in sectors:
        lines.append(f"## {sector.name}")
        lines.append(f"**Category:** {sector.category.value.title()}")
        if sector.last_refreshed:
            lines.append(f"**Last Refreshed:** {sector.last_refreshed.isoformat()}")
        lines.append("")
        lines.append("### Overview")
        lines.append(sector.overview)
        lines.append("")

        if sector.key_trends:
            lines.append("### Key Trends")
            for trend in sector.key_trends:
                lines.append(f"- {trend}")
            lines.append("")

        lines.append("### McChrystal Angle")
        lines.append(sector.mcchrystal_angle)
        lines.append("")

        if sector.articles:
            lines.append("### Top Articles")
            for article in sector.articles:
                date_str = article.date.isoformat() if article.date else "Recent"
                lines.append(f"- **[{article.title}]({article.url})** — {article.source} ({date_str})")
                lines.append(f"  {article.summary}")
                if article.relevance_note:
                    lines.append(f"  *McChrystal relevance: {article.relevance_note}*")
            lines.append("")

        lines.append("---")
        lines.append("")

    report = "\n".join(lines)
    save_market_intelligence(report, sectors)
    return report
