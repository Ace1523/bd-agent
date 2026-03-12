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

# Data directory
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
