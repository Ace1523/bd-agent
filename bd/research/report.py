"""Generate Markdown dossier reports from research data."""

from bd.formatting import format_revenue, format_employees
from bd.models import Dossier
from bd.save import save_research


def generate_dossier_report(dossier: Dossier) -> str:
    """Render a Markdown dossier report for a single prospect."""
    p = dossier.prospect
    lines: list[str] = []

    # Header
    lines.append(f"# Research Dossier — {p.company_name}")
    lines.append("")

    # Section 1: Organization Snapshot
    lines.append("## Organization Snapshot")
    lines.append("")
    if dossier.legal_name:
        lines.append(f"- **Legal Name**: {dossier.legal_name}")
    if dossier.headquarters:
        lines.append(f"- **Headquarters**: {dossier.headquarters}")
    if dossier.founded_year:
        lines.append(f"- **Founded**: {dossier.founded_year}")
    lines.append(f"- **Industry**: {p.industry or 'Unknown'}")
    lines.append(f"- **Revenue**: {format_revenue(p.revenue_estimate)}")
    lines.append(f"- **Employees**: {format_employees(p.employee_count)}")
    if dossier.ownership_structure:
        lines.append(f"- **Ownership**: {dossier.ownership_structure}")
    if dossier.geographic_footprint:
        lines.append(f"- **Geographic Footprint**: {dossier.geographic_footprint}")
    lines.append(f"- **ICP Score**: {p.score:.0f}")
    if p.tier:
        tier_label = p.tier.value.replace("_", " ").title()
        lines.append(f"- **Tier**: {tier_label}")
    lines.append("")

    # Section 2: Financial Health & Growth Stage
    if dossier.financial_health:
        lines.append("## Financial Health & Growth Stage")
        lines.append("")
        lines.append(dossier.financial_health)
        lines.append("")
    elif dossier.budget_context:
        lines.append("## Financial Health & Growth Stage")
        lines.append("")
        lines.append(dossier.budget_context)
        lines.append("")

    # Section 3: Leadership Team Profiles
    if dossier.key_contacts:
        lines.append("## Leadership Team Profiles")
        lines.append("")

        # Priority targets first
        priority = [c for c in dossier.key_contacts if c.is_priority_target]
        if priority:
            lines.append("### Priority Targets for Outreach")
            lines.append("")
            for c in priority:
                lines.append(f"**{c.name}** — {c.title}")
                if c.tenure:
                    lines.append(f"- Tenure: {c.tenure}")
                if c.background:
                    lines.append(f"- Background: {c.background}")
                if c.priority_rationale:
                    lines.append(f"- Why target: {c.priority_rationale}")
                if c.notes:
                    lines.append(f"- Notes: {c.notes}")
                lines.append("")

        # Full team table
        lines.append("### Full C-Suite & Key Leaders")
        lines.append("")
        lines.append("| Name | Title | Tenure | Background | Notes |")
        lines.append("|------|-------|--------|------------|-------|")
        for c in dossier.key_contacts:
            li = f"[Profile]({c.linkedin})" if c.linkedin else ""
            tenure = c.tenure or "—"
            bg = c.background or "—"
            notes_parts = []
            if c.notes:
                notes_parts.append(c.notes)
            if li:
                notes_parts.append(li)
            notes_str = "; ".join(notes_parts) if notes_parts else "—"
            lines.append(f"| {c.name} | {c.title} | {tenure} | {bg} | {notes_str} |")
        lines.append("")

    # Section 4: Organizational Culture & Structure Signals
    if dossier.org_structure or dossier.culture_signals:
        lines.append("## Organizational Culture & Structure Signals")
        lines.append("")
        if dossier.org_structure:
            lines.append(f"**Structure**: {dossier.org_structure}")
            lines.append("")
        if dossier.culture_signals:
            lines.append(dossier.culture_signals)
            lines.append("")

    # Section 5: Recent News & Trigger Events
    if dossier.trigger_events:
        lines.append("## Recent News & Trigger Events")
        lines.append("")
        for evt in dossier.trigger_events:
            date_str = f"[{evt.date}]" if evt.date else "[Date unknown]"
            lines.append(f"- {date_str} — **{evt.event}** — {evt.relevance}")
            if evt.source:
                lines.append(f"  [source]({evt.source})")
        lines.append("")
    elif dossier.transformation_timeline:
        lines.append("## Recent News & Trigger Events")
        lines.append("")
        lines.append(dossier.transformation_timeline)
        lines.append("")

    # Section 6: McChrystal Fit Assessment
    if dossier.fit_assessment:
        fa = dossier.fit_assessment
        lines.append("## McChrystal Fit Assessment")
        lines.append("")
        lines.append(f"**Rating**: {fa.rating.value.title()}")
        if fa.rating_rationale:
            lines.append(f" — {fa.rating_rationale}")
        lines.append("")
        lines.append(f"**Primary Problem**: {fa.primary_problem}")
        lines.append("")
        lines.append(f"**Best Capability Fit**: {fa.best_capability_fit}")
        lines.append("")
        if fa.likely_objections:
            lines.append("**Likely Objections**")
            lines.append("")
            for obj in fa.likely_objections:
                lines.append(f"- {obj}")
            lines.append("")
        if fa.competitive_landscape:
            lines.append("**Competitive Landscape**")
            lines.append("")
            for comp in fa.competitive_landscape:
                lines.append(f"- {comp}")
            lines.append("")
    elif dossier.competitors_present:
        lines.append("## Competitive Landscape")
        lines.append("")
        for firm in dossier.competitors_present:
            lines.append(f"- {firm}")
        lines.append("")

    # Section 7: Conversation Entry Points
    if dossier.conversation_entries:
        lines.append("## Conversation Entry Points")
        lines.append("")
        for entry in dossier.conversation_entries:
            lines.append(f"- **Q**: {entry.opening_question}")
            if entry.framing:
                lines.append(f"  *Framing*: {entry.framing}")
        lines.append("")
        if dossier.recommended_meeting_framing:
            lines.append(f"**Recommended First Meeting Framing**: {dossier.recommended_meeting_framing}")
            lines.append("")

    # Legacy: Pain Points (if populated but no fit_assessment)
    if dossier.pain_points and not dossier.fit_assessment:
        lines.append("## Pain Points")
        lines.append("")
        for point in dossier.pain_points:
            lines.append(f"- {point}")
        lines.append("")

    # Legacy: Detailed Analysis (if populated)
    if dossier.detailed_analysis:
        lines.append("## Analysis")
        lines.append("")
        lines.append(dossier.detailed_analysis)
        lines.append("")

    report = "\n".join(lines)
    save_research(report, dossier)
    return report
