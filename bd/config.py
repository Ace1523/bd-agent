"""Configuration and settings."""

from pathlib import Path

# ICP Thresholds
ICP_REVENUE_MIN = 500_000_000  # $500M
ICP_REVENUE_MAX = 10_000_000_000  # $10B
ICP_EMPLOYEE_MIN = 500  # 500+ required; preference for 2,000+
ICP_EMPLOYEE_PREFERRED = 2_000

# Scoring weights (total = 100)
SCORE_REVENUE_MAX = 25
SCORE_EMPLOYEE_MAX = 20
SCORE_SIGNAL_MAX = 35
SCORE_FIT_MAX = 20

# Discovery defaults
DEFAULT_DISCOVER_LIMIT = 10
DEFAULT_MIN_SCORE = 0

# Signal types that indicate McChrystal Group fit
SIGNAL_TYPES = [
    "reorg",
    "m_and_a",
    "leadership_change",
    "earnings_miss",
    "rapid_growth",
    "transformation",
    "hiring_surge",
    "funding",
    "partnership",
]

# Industry tiers for prospect classification
TIER_1_INDUSTRIES = [
    "defense",
    "aerospace",
    "federal government",
    "financial services",
    "healthcare",
    "industrial",
    "manufacturing",
]

TIER_2_INDUSTRIES = [
    "technology",
    "private equity",
    "energy",
    "logistics",
    "supply chain",
    "professional services",
]

TIER_3_INDUSTRIES = [
    "sports",
    "media",
    "entertainment",
    "nonprofit",
    "ngo",
    "education",
    "agriculture",
    "law enforcement",
    "first responders",
    "infrastructure",
    "construction",
]

# Fit Rating Criteria
# Strong: problem directly maps to a McChrystal capability AND at least 2 of these:
#   - Active trigger event (last 6 months)
#   - Clear economic buyer identified
#   - Budget likely exists (revenue > $1B or known transformation spend)
#   - Low competitive barrier (no incumbent advisory relationship)
#   - Organizational urgency (crisis, deadline, board pressure)
#
# Moderate: clear McChrystal fit but engagement is uncertain due to at least 1 of:
#   - Financial distress that limits advisory spend (bankruptcy, restructuring)
#   - No clear entry point or economic buyer identified
#   - Trigger event is >12 months old or speculative
#   - Strong incumbent competitor already engaged
#   - Cultural resistance to external advisory likely
#
# Speculative: plausible fit but significant unknowns:
#   - Problem is inferred, not confirmed publicly
#   - Industry is Tier 3 with no prior McChrystal track record
#   - Organization size or budget may be below threshold
#   - Engagement would require significant education on McChrystal's model

# ═══════════════════════════════════════════
# Market Intelligence Search Parameters
# ═══════════════════════════════════════════
# Structured search lenses used when refreshing market intelligence.
# These ensure consistent, repeatable research across every refresh cycle.

# Signal keywords — search terms mapped to ICP signal types.
# When scanning articles, look for these terms to classify the opportunity.
SIGNAL_KEYWORDS = {
    "reorg": [
        "restructuring", "reorganization", "layoffs", "downsizing",
        "workforce reduction", "unit consolidation", "operating model redesign",
        "cost-cutting", "efficiency program", "streamlining operations",
        "organizational redesign", "flattening the org",
    ],
    "m_and_a": [
        "merger", "acquisition", "divestiture", "go-private", "carve-out",
        "spinoff", "spin-off", "sale of", "acquires", "to acquire",
        "takeover", "combined entity", "integration", "post-merger",
        "definitive agreement", "deal closes",
    ],
    "leadership_change": [
        "new CEO", "CEO appointed", "CEO departure", "CEO transition",
        "C-suite shakeup", "new CFO", "new COO", "new CTO", "new CHRO",
        "board shakeup", "executive turnover", "leadership transition",
        "interim CEO", "CEO search", "successor named", "steps down",
        "resigns", "fired", "ousted",
    ],
    "earnings_miss": [
        "earnings miss", "revenue shortfall", "guidance cut", "profit warning",
        "missed estimates", "below expectations", "EBITDA pressure",
        "activist investor", "shareholder pressure", "proxy fight",
        "stock decline", "downgrade", "underperformance",
    ],
    "rapid_growth": [
        "rapid growth", "revenue surge", "scaling", "hypergrowth",
        "market expansion", "international expansion", "new markets",
        "doubling revenue", "fastest-growing", "growth trajectory",
        "expanding operations", "opening new locations",
    ],
    "transformation": [
        "digital transformation", "business model pivot", "strategic overhaul",
        "modernization", "transformation initiative", "cloud migration",
        "operating model change", "agile transformation", "innovation lab",
        "strategic pivot", "reinvention", "turnaround", "transformation officer",
    ],
    "hiring_surge": [
        "hiring spree", "talent acquisition", "executive hiring",
        "new C-suite roles", "leadership team buildout", "chief transformation officer",
        "head of strategy", "VP hired", "building out team",
        "recruiting push", "new division", "headcount growth",
    ],
    "funding": [
        "IPO", "capital raise", "PE investment", "private equity",
        "funding round", "Series C", "Series D", "recapitalization",
        "debt restructuring", "credit facility", "secondary offering",
        "SPAC", "goes public", "take-private", "leveraged buyout",
    ],
    "partnership": [
        "strategic partnership", "joint venture", "alliance",
        "platform partnership", "collaboration agreement",
        "strategic alliance", "co-development", "licensing deal",
        "channel partnership", "ecosystem partner",
    ],
}

# McChrystal capability keywords — terms indicating a company needs
# what MG sells. These map to organizational pain points, not signal types.
CAPABILITY_KEYWORDS = {
    "cross_functional_alignment": [
        "silos", "siloed", "cross-functional", "collaboration breakdown",
        "information sharing", "lack of coordination", "misalignment",
        "organizational friction", "handoff failures", "interdepartmental",
    ],
    "leadership_development": [
        "leadership crisis", "leadership gap", "executive development",
        "leadership pipeline", "succession planning", "coaching",
        "leader readiness", "emerging leaders", "talent bench",
    ],
    "culture_change": [
        "toxic culture", "culture overhaul", "employee engagement",
        "Glassdoor reviews", "workplace culture", "trust deficit",
        "morale", "attrition", "retention crisis", "culture transformation",
        "psychological safety", "employee satisfaction",
    ],
    "operating_model": [
        "operating model", "org design", "organizational effectiveness",
        "team of teams", "decentralized", "empowered execution",
        "shared consciousness", "agility", "decision-making speed",
        "bureaucracy", "command and control",
    ],
    "crisis_leadership": [
        "crisis management", "high-stakes", "incident response",
        "crisis leadership", "under fire", "public scrutiny",
        "regulatory action", "congressional hearing", "investigation",
        "scandal", "safety incident", "data breach",
    ],
    "post_merger_integration": [
        "integration challenges", "merger integration", "cultural clash",
        "combined entity", "Day 1 readiness", "synergy realization",
        "integration PMO", "two cultures", "integration failure",
    ],
    "scale_challenges": [
        "growing pains", "scaling challenges", "what got us here",
        "founder transition", "startup to enterprise", "professionalizing",
        "process maturity", "outgrowing", "complexity",
    ],
}

# Source tiers — prioritize high-quality, credible outlets.
# Tier 1 sources are preferred; Tier 3 are acceptable if nothing else is available.
SOURCE_TIERS = {
    "tier_1": [
        "Wall Street Journal", "Reuters", "Bloomberg", "Financial Times",
        "New York Times", "Associated Press",
    ],
    "tier_2": [
        "CNBC", "Forbes", "Fortune", "Business Insider", "The Information",
        "Axios", "Politico", "Defense News", "Modern Healthcare",
        "S&P Global", "PitchBook", "PE Hub", "Mergermarket",
    ],
    "tier_3": [
        "Industry trade publications", "Company press releases",
        "Regional business journals", "Seeking Alpha", "Yahoo Finance",
    ],
}

# Search query templates — structured queries per sector category.
# Use these as the base search strings, appending the sector name.
# Each template targets a different angle on the same sector.
SEARCH_QUERY_TEMPLATES = {
    "signal_scan": [
        '"{sector}" restructuring OR merger OR acquisition OR "new CEO" 2026',
        '"{sector}" transformation OR "operating model" OR "organizational change" 2026',
        '"{sector}" layoffs OR "workforce reduction" OR "cost-cutting" 2026',
        '"{sector}" "private equity" OR "capital raise" OR IPO OR "go-private" 2026',
    ],
    "leadership_moves": [
        '"{sector}" "CEO appointed" OR "CEO departs" OR "new chief" OR "steps down" 2026',
        '"{sector}" "board of directors" shakeup OR activist OR "proxy fight" 2026',
        '"{sector}" "chief transformation officer" OR "head of strategy" hired 2026',
    ],
    "macro_shifts": [
        '"{sector}" industry trends OR disruption OR "market shift" 2026',
        '"{sector}" regulation OR "regulatory change" OR compliance pressure 2026',
        '"{sector}" AI OR automation OR "digital disruption" impact 2026',
        '"{sector}" tariffs OR "trade policy" OR "supply chain" disruption 2026',
    ],
    "org_challenges": [
        '"{sector}" "organizational challenges" OR culture OR silos OR alignment 2026',
        '"{sector}" integration challenges OR "post-merger" OR "growing pains" 2026',
        '"{sector}" "leadership development" OR "succession planning" OR "talent gap" 2026',
    ],
}

# Article inclusion criteria — what makes an article worth capturing.
ARTICLE_CRITERIA = {
    "must_have_one_of": [
        "Names a specific company (not just industry-level commentary)",
        "Describes a specific event with a date (not vague trend piece)",
        "References a leadership change, deal, or organizational shift",
        "Contains data points (revenue, headcount, deal size, timeline)",
    ],
    "exclude": [
        "Pure opinion/editorial with no factual anchor",
        "Press releases with no third-party validation",
        "Articles older than 45 days (30-day target, 15-day grace)",
        "Duplicate coverage of the same event already captured",
        "Paywalled articles where the summary doesn't contain enough signal",
        "Company announcements that are routine (quarterly earnings with no miss, standard board appointments)",
    ],
    "prefer": [
        "Articles naming companies in the $500M-$10B revenue range",
        "Multi-company trend pieces that surface several prospects at once",
        "Deep investigative pieces revealing organizational dysfunction",
        "Articles mentioning PE-backed companies, roll-ups, or post-merger situations",
        "Coverage of companies not already in the pipeline",
    ],
}

# Freshness thresholds for market intelligence
FRESHNESS_GREEN_DAYS = 7   # green badge: refreshed within 7 days
FRESHNESS_AMBER_DAYS = 30  # amber badge: refreshed within 30 days
# > 30 days = gray/stale

# Data directory
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
