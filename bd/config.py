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

# Data directory
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
