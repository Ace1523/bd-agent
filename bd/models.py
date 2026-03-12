"""Pydantic models for BD Agent data structures."""

import datetime
from typing import Union
from enum import Enum

from pydantic import BaseModel, Field


class SignalType(str, Enum):
    reorg = "reorg"
    m_and_a = "m_and_a"
    leadership_change = "leadership_change"
    earnings_miss = "earnings_miss"
    rapid_growth = "rapid_growth"
    transformation = "transformation"
    hiring_surge = "hiring_surge"
    funding = "funding"
    partnership = "partnership"


class FitTier(str, Enum):
    """Prospect fit tier based on industry and opportunity type."""
    tier_1 = "tier_1"  # Strong/conventional fit — proven hunting ground
    tier_2 = "tier_2"  # Emerging/adjacent fit — natural expansion
    tier_3 = "tier_3"  # Unconventional/high-upside bet


class Signal(BaseModel):
    type: SignalType
    description: str
    date: Union[datetime.date, None] = None
    source: Union[str, None] = None


class Prospect(BaseModel):
    company_name: str
    revenue_estimate: Union[float, None] = Field(
        default=None, description="Estimated annual revenue in USD"
    )
    employee_count: Union[int, None] = Field(
        default=None, description="Estimated number of employees"
    )
    industry: Union[str, None] = None
    tier: Union[FitTier, None] = Field(
        default=None,
        description="Fit tier: tier_1 (conventional), tier_2 (adjacent), tier_3 (unconventional)",
    )
    signals: list[Signal] = Field(default_factory=list)
    score: float = 0.0
    source_urls: list[str] = Field(default_factory=list)
    company_overview: Union[str, None] = Field(
        default=None, description="Brief overview of what the company does (2-3 sentences)"
    )
    summary: Union[str, None] = Field(
        default=None, description="Brief summary of why this prospect fits the ICP"
    )
    entry_point: Union[str, None] = Field(
        default=None,
        description="Who to target (title/function) and why they'd be the right buyer or champion",
    )
    conversation_hook: Union[str, None] = Field(
        default=None,
        description="One compelling, non-generic reason to reach out NOW",
    )


class Contact(BaseModel):
    """A key decision-maker at a prospect company."""

    name: str
    title: str
    tenure: Union[str, None] = None
    background: Union[str, None] = Field(
        default=None, description="Military, consulting, operator, etc."
    )
    linkedin: Union[str, None] = None
    notes: Union[str, None] = None
    is_priority_target: bool = Field(
        default=False,
        description="True if this person is a likely economic buyer or internal champion",
    )
    priority_rationale: Union[str, None] = Field(
        default=None, description="Why this person is the right entry point"
    )


class FitRating(str, Enum):
    """Overall McChrystal fit assessment rating."""
    strong = "strong"
    moderate = "moderate"
    speculative = "speculative"


class TriggerEvent(BaseModel):
    """A recent news event relevant to McChrystal Group engagement."""
    date: Union[datetime.date, None] = None
    event: str
    relevance: str = Field(description="Why it matters for McChrystal Group")
    source: Union[str, None] = None


class FitAssessment(BaseModel):
    """McChrystal Group fit assessment for a prospect."""
    primary_problem: str = Field(
        description="Specific problem this org likely needs solved"
    )
    best_capability_fit: str = Field(
        description="Which McChrystal capability is the strongest fit and why"
    )
    likely_objections: list[str] = Field(default_factory=list)
    competitive_landscape: list[str] = Field(
        default_factory=list,
        description="Who else might be pursuing this account",
    )
    rating: FitRating = FitRating.moderate
    rating_rationale: Union[str, None] = None


class ConversationEntry(BaseModel):
    """A suggested conversation entry point for outreach."""
    opening_question: str
    framing: Union[str, None] = Field(
        default=None, description="How to frame the first meeting"
    )


class Dossier(BaseModel):
    """Comprehensive research dossier on a prospect (7 sections)."""

    prospect: Prospect

    # Section 1: Organization Snapshot
    legal_name: Union[str, None] = None
    headquarters: Union[str, None] = None
    founded_year: Union[int, None] = None
    ownership_structure: Union[str, None] = Field(
        default=None, description="Public, private, PE-backed, nonprofit, government"
    )
    geographic_footprint: Union[str, None] = None

    # Section 2: Financial Health & Growth Stage
    financial_health: Union[str, None] = Field(
        default=None,
        description="Revenue trajectory, profitability, analyst sentiment, key pressures/tailwinds",
    )

    # Section 3: Leadership Team Profiles
    key_contacts: list[Contact] = Field(default_factory=list)

    # Section 4: Organizational Culture & Structure Signals
    org_structure: Union[str, None] = Field(
        default=None, description="Hierarchical, flat, matrixed, decentralized"
    )
    culture_signals: Union[str, None] = Field(
        default=None,
        description="Glassdoor patterns, press coverage, employee sentiment, culture challenges",
    )

    # Section 5: Recent News & Trigger Events
    trigger_events: list[TriggerEvent] = Field(default_factory=list)

    # Section 6: McChrystal Fit Assessment
    fit_assessment: Union[FitAssessment, None] = None

    # Section 7: Conversation Entry Points
    conversation_entries: list[ConversationEntry] = Field(default_factory=list)
    recommended_meeting_framing: Union[str, None] = None

    # Legacy fields (still populated for backward compatibility)
    pain_points: list[str] = Field(default_factory=list)
    competitors_present: list[str] = Field(default_factory=list)
    transformation_timeline: Union[str, None] = None
    budget_context: Union[str, None] = None
    detailed_analysis: str = ""


class Email(BaseModel):
    """A single outreach email in a sequence (legacy)."""

    sequence_number: int
    subject: str
    body: str
    send_delay_days: int = Field(
        description="Days after previous email to send this one"
    )
    hook: str = Field(
        description="The specific signal or pain point this email leverages"
    )


class OutreachSequence(BaseModel):
    """A multi-email outreach sequence tied to a research dossier (legacy)."""

    dossier: Dossier
    emails: list[Email] = Field(default_factory=list)


class ColdEmail(BaseModel):
    """One of 3 independent cold email versions (A/B/C)."""

    version: str  # "A", "B", or "C"
    label: str  # "Trigger-based", "Insight-based", "Warm angle"
    subject: str
    body: str
    hook: str = Field(
        description="The specific signal/angle this version leverages"
    )


class LinkedInMessage(BaseModel):
    """A LinkedIn outreach message (connection request or InMail)."""

    message_type: str = Field(
        description="'connection_request' or 'inmail'"
    )
    subject: Union[str, None] = Field(
        default=None, description="InMail subject line (not used for connection requests)"
    )
    body: str
    hook: str = Field(
        description="The specific angle this message leverages"
    )


class OutreachPackage(BaseModel):
    """3 independent cold email versions + LinkedIn message targeting a champion-level contact."""

    dossier: Dossier
    target_contact: Contact
    cold_emails: list[ColdEmail] = Field(default_factory=list)
    linkedin_message: Union[LinkedInMessage, None] = None
