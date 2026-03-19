#!/usr/bin/env python3
"""Generate a branded PDF dossier for a specific company from dashboard.json."""

import json
import os
import sys
import textwrap
from datetime import date

from fpdf import FPDF

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "dashboard.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data", "dossiers")

# McChrystal brand colors
ORANGE = (196, 90, 28)
DARK = (26, 26, 26)
GRAY = (100, 100, 100)
LIGHT_GRAY = (180, 180, 180)
BG_ACCENT = (252, 247, 242)
WHITE = (255, 255, 255)


class DossierPDF(FPDF):
    def __init__(self, company_name):
        super().__init__()
        self.company_name = company_name
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        if self.page_no() == 1:
            return  # Cover page has its own header
        # Top accent line
        self.set_draw_color(*ORANGE)
        self.set_line_width(0.8)
        self.line(15, 12, self.w - 15, 12)
        # Company name in header
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(*GRAY)
        self.set_y(14)
        self.cell(0, 5, self.company_name, align="L")
        self.set_font("Helvetica", "", 8)
        self.cell(0, 5, "McChrystal Group", align="R")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*LIGHT_GRAY)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def cover_page(self, prospect, fit_assessment):
        self.add_page()
        # Orange accent bar at top
        self.set_fill_color(*ORANGE)
        self.rect(0, 0, self.w, 4, "F")

        # Company name
        self.set_y(50)
        self.set_font("Helvetica", "B", 32)
        self.set_text_color(*DARK)
        self.multi_cell(0, 14, self.company_name, align="L")
        self.ln(4)

        # Subtitle line
        self.set_font("Helvetica", "", 13)
        self.set_text_color(*GRAY)
        self.cell(0, 8, "Business Development Dossier", ln=True)
        self.ln(8)

        # Orange divider
        self.set_draw_color(*ORANGE)
        self.set_line_width(0.6)
        self.line(15, self.get_y(), 80, self.get_y())
        self.ln(10)

        # Key facts grid
        facts = []
        if prospect.get("industry"):
            facts.append(("Industry", prospect["industry"]))
        if prospect.get("revenue_estimate"):
            rev = prospect["revenue_estimate"]
            if rev >= 1_000_000_000:
                facts.append(("Revenue", f"${rev/1_000_000_000:.1f}B".replace(".0B", "B")))
            elif rev >= 1_000_000:
                facts.append(("Revenue", f"${rev/1_000_000:.0f}M"))
            elif rev >= 1000:
                # Legacy: stored in millions
                facts.append(("Revenue", f"${rev/1000:.1f}B".replace(".0B", "B")))
            else:
                facts.append(("Revenue", f"${rev}M"))
        if prospect.get("employee_count"):
            emp = prospect["employee_count"]
            if emp >= 1000:
                facts.append(("Employees", f"{emp:,}"))
            else:
                facts.append(("Employees", str(emp)))
        if prospect.get("score"):
            facts.append(("Ideal Customer Profile Score", str(round(prospect["score"]))))

        self.set_font("Helvetica", "", 10)
        # Calculate max label width to align values
        max_label_w = 0
        for label, _ in facts:
            w = self.get_string_width(label) + 10
            if w > max_label_w:
                max_label_w = w
        for label, value in facts:
            self.set_text_color(*GRAY)
            self.set_font("Helvetica", "", 10)
            self.cell(max_label_w, 7, label, align="L")
            self.set_text_color(*DARK)
            self.set_font("Helvetica", "B", 10)
            self.cell(0, 7, value, ln=True, align="L")

        # ── ICP Scoring Methodology ──
        self.ln(10)

        # Section label
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*ORANGE)
        self.cell(0, 5, "ICP SCORING MODEL", ln=True)
        self.ln(3)

        # Bar chart — each component gets a distinct color
        bar_x = 15
        label_w = 48
        track_w = 100
        bar_h = 7
        bar_gap = 3

        BAR_ORANGE = (196, 90, 28)
        BAR_TEAL = (52, 131, 151)
        BAR_SLATE = (88, 110, 130)
        BAR_GOLD = (180, 140, 50)

        components = [
            ("Signals", 35, BAR_ORANGE),
            ("Revenue Fit", 25, BAR_TEAL),
            ("Employee Scale", 20, BAR_SLATE),
            ("McChrystal Fit", 20, BAR_GOLD),
        ]

        for label, max_pts, color in components:
            y = self.get_y()
            # Label
            self.set_font("Helvetica", "", 8)
            self.set_text_color(*GRAY)
            self.set_xy(bar_x, y)
            self.cell(label_w, bar_h, label)

            # Gray track (full width)
            track_x = bar_x + label_w
            self.set_fill_color(230, 230, 230)
            self.rect(track_x, y + 0.5, track_w, bar_h - 1, "F")

            # Colored fill proportional to weight
            fill_w = track_w * (max_pts / 35)
            self.set_fill_color(*color)
            self.rect(track_x, y + 0.5, fill_w, bar_h - 1, "F")

            # Points label inside the bar
            pts_text = f"{max_pts} pts"
            self.set_font("Helvetica", "B", 7)
            self.set_text_color(*WHITE)
            pts_w = self.get_string_width(pts_text) + 2
            self.set_xy(track_x + fill_w - pts_w - 1, y)
            self.cell(pts_w, bar_h, pts_text, align="R")

            self.set_y(y + bar_h + bar_gap)

        # ── Formula line (monospace) ──
        self.ln(3)
        self.set_font("Courier", "B", 8)
        self.set_text_color(*DARK)
        self.set_x(15)
        self.cell(0, 5, "ICP = Signals + Revenue + Employees + Fit   (max 100)", ln=True)
        self.ln(2)

        # ── Component descriptions (algorithmic style) ──
        desc_label_w = 32
        desc_x = 15
        descs = [
            ("Signals (0-35)", "Top 4 signals scored; each = base(60%) + recency bonus",
             "<30d: 40% | <90d: 30% | <180d: 20% | older: 10%"),
            ("Revenue (0-25)", "$500M-$10B sweet spot -> 70-100% of 25 pts",
             "Below $500M -> pro-rata x 0.5 | Above $10B -> 60%"),
            ("Employees (0-20)", "2,000+ preferred (70-100%) | 500-2K partial (50-70%)",
             "Below 500 -> pro-rata x 0.3"),
            ("Fit (0-20)", "High-fit types: reorg, transformation, M&A, hiring,",
             "funding, partnership -> 5 pts ea (max 12) + diversity 2/type (max 8)"),
        ]

        for label, line1, line2 in descs:
            self.set_font("Helvetica", "B", 6.5)
            self.set_text_color(*GRAY)
            self.set_x(desc_x)
            self.cell(desc_label_w, 3.8, label)
            self.set_font("Helvetica", "", 6.5)
            self.set_text_color(60, 60, 60)
            self.cell(0, 3.8, line1, ln=True)
            self.set_x(desc_x + desc_label_w)
            self.cell(0, 3.8, line2, ln=True)
            self.ln(0.8)

        # Date
        self.ln(8)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*LIGHT_GRAY)
        self.cell(0, 7, f"Prepared {date.today().strftime('%B %d, %Y')}", ln=True)

        # McChrystal Group at bottom
        self.set_y(-45)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*ORANGE)
        self.cell(0, 8, "McChrystal Group", ln=True)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*GRAY)
        self.cell(0, 5, "Leadership Advisory & Organizational Effectiveness", ln=True)

    def section_header(self, number, title):
        self.ln(4)
        # Check if we need a new page (at least 30mm needed for header + some content)
        if self.get_y() > self.h - 50:
            self.add_page()
        self.set_font("Helvetica", "B", 7)
        self.set_text_color(*ORANGE)
        self.cell(0, 4, f"SECTION {number}", ln=True)
        self.set_font("Helvetica", "B", 15)
        self.set_text_color(*DARK)
        self.cell(0, 9, title, ln=True)
        # Accent underline
        self.set_draw_color(*ORANGE)
        self.set_line_width(0.4)
        self.line(15, self.get_y() + 1, 60, self.get_y() + 1)
        self.ln(5)

    def clean_text(self, text):
        if isinstance(text, list):
            text = "\n".join(str(t) for t in text)
        text = str(text)
        replacements = {
            "\u2014": " - ", "\u2013": " - ", "\u2012": "-",
            "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
            "\u2022": "-", "\u25cf": "-", "\u2023": "-", "\u25aa": "-",
            "\u2192": "->", "\u2190": "<-", "\u2194": "<->",
            "\u2026": "...", "\u00a0": " ", "\u200b": "",
            "\u2010": "-", "\u2011": "-",
            "\u00d7": "x", "\u00b7": "-",
            "\u2032": "'", "\u2033": '"',
            "\u201a": ",", "\u201e": '"',
            "\u2039": "<", "\u203a": ">",
            "\u00ab": "<<", "\u00bb": ">>",
            "\u2605": "*", "\u2606": "*",
            "\u2713": "[x]", "\u2717": "[ ]",
            "\u00ae": "(R)", "\u2122": "(TM)", "\u00a9": "(c)",
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        # Strip markdown bold markers
        text = text.replace("**", "")
        # Strip markdown headers at line starts
        lines = text.split("\n")
        cleaned = []
        for line in lines:
            stripped = line.lstrip()
            if stripped.startswith("### "):
                cleaned.append(stripped[4:])
            elif stripped.startswith("## "):
                cleaned.append(stripped[3:])
            elif stripped.startswith("# "):
                cleaned.append(stripped[2:])
            else:
                cleaned.append(line)
        text = "\n".join(cleaned)
        # Fallback: strip any remaining non-latin-1 characters
        text = text.encode("latin-1", errors="replace").decode("latin-1")
        return text

    def body_text(self, text):
        if not text:
            return
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*DARK)
        self.set_x(15)
        text = self.clean_text(text)
        self.multi_cell(self.w - 30, 5.5, text)
        self.ln(3)

    def sub_header(self, title):
        if self.get_y() > self.h - 40:
            self.add_page()
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*DARK)
        self.cell(0, 7, self.clean_text(title), ln=True)
        self.ln(1)

    def label_value(self, label, value):
        if not value:
            return
        value = self.clean_text(value)
        self.set_x(15)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*GRAY)
        label_w = max(35, self.get_string_width(label) + 8)
        self.cell(label_w, 6, label)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*DARK)
        remaining = self.w - 15 - label_w - self.l_margin
        if len(value) > 60 or self.get_string_width(value) > remaining:
            self.ln()
            self.set_x(15)
            self.multi_cell(self.w - 30, 5.5, value)
        else:
            self.cell(0, 6, value, ln=True)

    def accent_box(self, text):
        if not text:
            return
        self.set_fill_color(*BG_ACCENT)
        self.set_draw_color(*ORANGE)
        x = self.get_x()
        y = self.get_y()
        self.set_line_width(0.5)
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(*DARK)
        text = self.clean_text(text)
        self.set_x(18)
        self.multi_cell(self.w - 36, 5.5, text, fill=True)
        y2 = self.get_y()
        self.line(15, y, 15, y2)
        self.ln(3)


def find_dossier(company_name):
    with open(DATA_PATH) as f:
        data = json.load(f)
    for d in data.get("dossiers", []):
        p = d.get("prospect", {})
        name = p.get("company_name", "")
        if company_name.lower() in name.lower() or name.lower() in company_name.lower():
            return d
    return None


def generate_pdf(dossier):
    p = dossier.get("prospect", {})
    fa = dossier.get("fit_assessment", {})
    company_name = p.get("company_name", "Unknown Company")
    short_name = company_name.split(" (")[0].split(",")[0].strip()

    pdf = DossierPDF(company_name)

    # Cover page
    pdf.cover_page(p, fa)

    # ── Section 1: Organization Snapshot ──
    pdf.add_page()
    pdf.section_header("1", "Organization Snapshot")
    pdf.label_value("Legal Name", dossier.get("legal_name"))
    pdf.label_value("Headquarters", dossier.get("headquarters"))
    pdf.label_value("Founded", dossier.get("founded_year"))
    pdf.label_value("Ownership", dossier.get("ownership_structure"))
    pdf.label_value("Footprint", dossier.get("geographic_footprint"))

    # ── Section 1b: Company Overview ──
    if p.get("company_overview"):
        pdf.ln(6)
        pdf.section_header("1b", "Company Overview")
        pdf.body_text(p["company_overview"])

    # ── Section 2: Financial Health ──
    if dossier.get("financial_health"):
        pdf.section_header("2", "Financial Health & Growth Stage")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(0, 5, f"Understanding {short_name}'s financial position and trajectory is critical to framing any engagement conversation.")
        pdf.ln(4)
        pdf.body_text(dossier["financial_health"])

    # ── Section 3: Leadership Profiles ──
    contacts = dossier.get("key_contacts", [])
    if contacts:
        pdf.section_header("3", "Leadership Team Profiles")
        priority_contacts = [c for c in contacts if c.get("is_priority_target")]
        other_contacts = [c for c in contacts if not c.get("is_priority_target")]

        if priority_contacts:
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(*GRAY)
            pdf.multi_cell(0, 5, "The following contacts are recommended as primary outreach targets - champion-level leaders who feel the organizational pain daily and can sponsor McChrystal internally.")
            pdf.ln(4)
            for c in priority_contacts:
                _render_contact(pdf, c, is_priority=True)

        if other_contacts:
            if priority_contacts:
                pdf.ln(2)
                pdf.set_font("Helvetica", "I", 9)
                pdf.set_text_color(*GRAY)
                pdf.multi_cell(0, 5, "Additional leadership team members relevant to the engagement:")
                pdf.ln(4)
            for c in other_contacts:
                _render_contact(pdf, c, is_priority=False)

    # ── Section 4: Culture & Structure ──
    if dossier.get("org_structure") or dossier.get("culture_signals"):
        pdf.section_header("4", "Organizational Culture & Structure")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(0, 5, f"Culture and structure are often where McChrystal Group finds the deepest leverage. The following signals indicate how {short_name} operates today and where friction exists.")
        pdf.ln(4)
        if dossier.get("org_structure"):
            pdf.sub_header("Organizational Structure")
            pdf.body_text(dossier["org_structure"])
        if dossier.get("culture_signals"):
            pdf.sub_header("Culture Signals")
            pdf.body_text(dossier["culture_signals"])

    # ── Section 5: Trigger Events ──
    triggers = dossier.get("trigger_events", [])
    if triggers:
        pdf.section_header("5", "Recent News & Trigger Events")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(0, 5, f"The following developments from the past 18 months create urgency and provide natural conversation entry points for engaging {short_name}.")
        pdf.ln(4)
        for i, t in enumerate(triggers):
            event_date = t.get("date", "")
            event = pdf.clean_text(t.get("event", ""))
            significance = pdf.clean_text(t.get("significance", ""))
            # Numbered event with date
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*DARK)
            pdf.set_x(15)
            pdf.multi_cell(pdf.w - 30, 6, f"{i+1}. {event_date} - {event}")
            if significance:
                pdf.set_font("Helvetica", "", 9.5)
                pdf.set_text_color(*GRAY)
                pdf.set_x(20)
                pdf.multi_cell(pdf.w - 35, 5.2, significance)
            pdf.ln(3)

    # ── Section 6: Fit Assessment ──
    if fa:
        pdf.section_header("6", "McChrystal Fit Assessment")
        pdf.ln(1)

        if fa.get("rating_rationale"):
            rationale = fa["rating_rationale"]
            # Strip leading rating word (e.g. "Moderate: ..." or "Strong: ...")
            for prefix in ["Strong:", "Moderate:", "Speculative:"]:
                if rationale.strip().startswith(prefix):
                    rationale = rationale.strip()[len(prefix):].strip()
                    break
            pdf.accent_box(rationale)
            pdf.ln(2)

        if fa.get("primary_problem"):
            pdf.sub_header("Primary Problem")
            pdf.body_text(fa["primary_problem"])
        if fa.get("best_capability_fit"):
            pdf.sub_header("Best McChrystal Capability Fit")
            pdf.body_text(fa["best_capability_fit"])
        if fa.get("likely_objections"):
            pdf.sub_header("Likely Objections to Engagement")
            pdf.body_text(fa["likely_objections"])
        if fa.get("competitive_landscape"):
            pdf.sub_header("Competitive Advisory Landscape")
            pdf.body_text(fa["competitive_landscape"])

    # ── Section 7: Conversation Entry Points ──
    convos = dossier.get("conversation_entries", [])
    if convos:
        pdf.section_header("7", "Conversation Entry Points")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(0, 5, "These questions are designed for a Senior Partner's first conversation. Each opens a thread that naturally leads to McChrystal Group's capabilities without a direct pitch.")
        pdf.ln(4)
        for i, c in enumerate(convos):
            question = pdf.clean_text(c.get("opening_question", "") or c.get("question", ""))
            context = pdf.clean_text(c.get("framing", "") or c.get("context", ""))
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*DARK)
            pdf.multi_cell(0, 6, f"{i+1}. {question}")
            if context:
                pdf.set_font("Helvetica", "", 9.5)
                pdf.set_text_color(*GRAY)
                pdf.set_x(20)
                pdf.multi_cell(pdf.w - 35, 5.2, context)
            pdf.ln(3)
        if dossier.get("recommended_meeting_framing"):
            pdf.ln(2)
            pdf.sub_header("Recommended Meeting Framing")
            pdf.body_text(dossier["recommended_meeting_framing"])

    # ── Section 8: Brand Insights ──
    if dossier.get("brand_insights"):
        pdf.section_header("8", "Brand Insights & Market Positioning")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(0, 5, f"Brand strategy reveals organizational priorities and coordination challenges. The following analysis connects {short_name}'s market positioning to potential McChrystal engagement opportunities.")
        pdf.ln(4)
        pdf.body_text(dossier["brand_insights"])

    # ── Section 9: Deep Fit Analysis ──
    if dossier.get("deep_fit_analysis"):
        pdf.section_header("9", "Deep McChrystal Group Fit Analysis")
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(0, 5, f"This is the strategic case for pursuing {short_name}. It synthesizes findings from all previous sections into a comprehensive engagement thesis with specific fit dimensions, expected outcomes, stakeholder mapping, and a phased pursuit strategy.")
        pdf.ln(6)

        text = dossier["deep_fit_analysis"]
        # Process line by line for better control
        lines = text.split("\n")
        i = 0
        paragraph_buffer = []
        pdf._table_headers = None

        def flush_paragraph():
            if paragraph_buffer:
                combined = " ".join(paragraph_buffer)
                pdf.body_text(combined)
                paragraph_buffer.clear()

        while i < len(lines):
            line = lines[i].strip()
            i += 1

            if not line:
                flush_paragraph()
                continue

            # Markdown headers
            if line.startswith("###"):
                flush_paragraph()
                pdf.sub_header(line.lstrip("#").strip())
            elif line.startswith("##"):
                flush_paragraph()
                pdf.ln(4)
                pdf.sub_header(line.lstrip("#").strip())
            # Table separator lines — skip
            elif all(c in "-| :" for c in line) and "|" in line:
                continue
            # Table rows — collect and render as structured blocks
            elif line.startswith("|") and line.endswith("|"):
                flush_paragraph()
                cells = [c.strip() for c in line.strip("|").split("|")]
                cells = [c for c in cells if c.strip()]
                if not cells:
                    continue
                # Check if this is the header row (first table row we encounter)
                if pdf._table_headers is None:
                    pdf._table_headers = cells
                    continue
                # Render as a structured block: first cell bold, rest as labeled lines
                headers = pdf._table_headers or []
                pdf.set_font("Helvetica", "B", 10)
                pdf.set_text_color(*DARK)
                pdf.set_x(15)
                # First cell is the business unit / primary identifier
                primary = pdf.clean_text(cells[0]) if cells else ""
                pdf.multi_cell(pdf.w - 30, 6, primary)
                # Remaining cells as label: value pairs
                for j, cell in enumerate(cells[1:], 1):
                    cell_text = pdf.clean_text(cell)
                    if not cell_text:
                        continue
                    label = pdf.clean_text(headers[j]) if j < len(headers) else ""
                    pdf.set_font("Helvetica", "", 9)
                    pdf.set_text_color(*GRAY)
                    pdf.set_x(20)
                    if label:
                        pdf.multi_cell(pdf.w - 35, 5, f"{label}: {cell_text}")
                    else:
                        pdf.multi_cell(pdf.w - 35, 5, cell_text)
                pdf.ln(3)
            # Bullet items
            elif line.startswith("- ") or line.startswith("* "):
                flush_paragraph()
                bullet_text = line.lstrip("-* ").strip()
                pdf.set_font("Helvetica", "", 9.5)
                pdf.set_text_color(*DARK)
                pdf.set_x(20)
                pdf.multi_cell(pdf.w - 35, 5.2, pdf.clean_text(f"- {bullet_text}"))
                pdf.ln(1)
            # Numbered items (1. 2. etc)
            elif len(line) > 2 and line[0].isdigit() and line[1] in ".)":
                flush_paragraph()
                pdf.set_font("Helvetica", "", 9.5)
                pdf.set_text_color(*DARK)
                pdf.set_x(15)
                pdf.multi_cell(pdf.w - 30, 5.2, pdf.clean_text(line))
                pdf.ln(1)
            else:
                # Regular text — accumulate into paragraph
                paragraph_buffer.append(line)

        flush_paragraph()

    # ── Output ──
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    safe_name = company_name.replace(" ", "_").replace("/", "_").replace(".", "")
    output_path = os.path.join(OUTPUT_DIR, f"{safe_name}_Dossier.pdf")
    pdf.output(output_path)
    return output_path


def _render_contact(pdf, contact, is_priority=False):
    """Render a single contact entry with proper formatting."""
    name = pdf.clean_text(contact.get("name", ""))
    title = pdf.clean_text(contact.get("title", ""))

    # Name and title
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*DARK)
    label = f"{name} - {title}"
    if is_priority:
        label += "  [PRIORITY TARGET]"
    pdf.cell(0, 6, label, ln=True)

    # Background
    if contact.get("background"):
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(80, 80, 80)
        pdf.multi_cell(0, 5.2, pdf.clean_text(contact["background"]))

    # Priority rationale in accent box style
    if contact.get("priority_rationale") and is_priority:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*ORANGE)
        pdf.set_x(15)
        pdf.multi_cell(pdf.w - 30, 5, f"Outreach rationale: {pdf.clean_text(contact['priority_rationale'])}")

    pdf.ln(4)


def main():
    company = sys.argv[1] if len(sys.argv) > 1 else "RTX"
    print(f"Looking for dossier: {company}")
    dossier = find_dossier(company)
    if not dossier:
        print(f"No dossier found for '{company}'")
        sys.exit(1)
    p = dossier["prospect"]
    print(f"Found: {p['company_name']}")
    path = generate_pdf(dossier)
    print(f"Generated: {path}")


if __name__ == "__main__":
    main()
