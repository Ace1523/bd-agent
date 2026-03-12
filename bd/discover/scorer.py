"""ICP fit scoring logic for prospects."""

from __future__ import annotations

from datetime import date, timedelta

from bd.config import (
    ICP_EMPLOYEE_MIN,
    ICP_EMPLOYEE_PREFERRED,
    ICP_REVENUE_MAX,
    ICP_REVENUE_MIN,
    SCORE_EMPLOYEE_MAX,
    SCORE_FIT_MAX,
    SCORE_REVENUE_MAX,
    SCORE_SIGNAL_MAX,
)
from bd.models import Prospect, SignalType

# Signal types that strongly indicate McChrystal Group fit
HIGH_FIT_SIGNALS = {SignalType.reorg, SignalType.transformation, SignalType.m_and_a}


def score_revenue(prospect: Prospect) -> float:
    """Score revenue fit (0–25). Sweet spot is $500M–$10B."""
    rev = prospect.revenue_estimate
    if rev is None:
        return SCORE_REVENUE_MAX * 0.3  # Partial credit for unknown

    if ICP_REVENUE_MIN <= rev <= ICP_REVENUE_MAX:
        # Full marks in the sweet spot; peak score in middle of range
        midpoint = (ICP_REVENUE_MIN + ICP_REVENUE_MAX) / 2
        distance = abs(rev - midpoint) / midpoint
        return SCORE_REVENUE_MAX * max(0.7, 1.0 - distance * 0.3)

    if rev < ICP_REVENUE_MIN:
        ratio = rev / ICP_REVENUE_MIN
        return SCORE_REVENUE_MAX * ratio * 0.5

    # Over $10B — still a fit, just slightly less ideal
    return SCORE_REVENUE_MAX * 0.6


def score_employees(prospect: Prospect) -> float:
    """Score employee count fit (0–20). 500+ required, 2K+ preferred."""
    count = prospect.employee_count
    if count is None:
        return SCORE_EMPLOYEE_MAX * 0.3

    if count < ICP_EMPLOYEE_MIN:
        ratio = count / ICP_EMPLOYEE_MIN
        return SCORE_EMPLOYEE_MAX * ratio * 0.3

    if count < ICP_EMPLOYEE_PREFERRED:
        # Between 500 and 2000 — partial credit
        ratio = (count - ICP_EMPLOYEE_MIN) / (ICP_EMPLOYEE_PREFERRED - ICP_EMPLOYEE_MIN)
        return SCORE_EMPLOYEE_MAX * (0.5 + ratio * 0.2)

    # 2000+ — full credit with diminishing returns
    bonus = min((count - ICP_EMPLOYEE_PREFERRED) / 50_000, 1.0) * 0.3
    return SCORE_EMPLOYEE_MAX * min(0.7 + bonus, 1.0)


def score_signals(prospect: Prospect) -> float:
    """Score signal strength (0–35). More signals and more recent = higher."""
    if not prospect.signals:
        return 0.0

    today = date.today()
    total = 0.0
    max_per_signal = SCORE_SIGNAL_MAX / 3  # ~11.67 per signal, cap at 3 counting

    for i, signal in enumerate(prospect.signals[:4]):
        # Base score per signal
        base = max_per_signal * 0.6

        # Recency bonus
        if signal.date:
            days_ago = (today - signal.date).days
            if days_ago < 30:
                base += max_per_signal * 0.4
            elif days_ago < 90:
                base += max_per_signal * 0.3
            elif days_ago < 180:
                base += max_per_signal * 0.2
            else:
                base += max_per_signal * 0.1
        else:
            base += max_per_signal * 0.15  # Unknown date, small bonus

        total += base

    return min(total, SCORE_SIGNAL_MAX)


def score_fit(prospect: Prospect) -> float:
    """Score McChrystal Group fit (0–20). High-fit signals and complexity."""
    if not prospect.signals:
        return 0.0

    # Count high-fit signal types
    high_fit_count = sum(1 for s in prospect.signals if s.type in HIGH_FIT_SIGNALS)
    signal_diversity = len({s.type for s in prospect.signals})

    fit = 0.0
    # High-fit signals
    fit += min(high_fit_count * 5, 12)
    # Diversity of signals suggests complex situation
    fit += min(signal_diversity * 2, 8)

    return min(fit, SCORE_FIT_MAX)


def score_prospect(prospect: Prospect) -> Prospect:
    """Calculate total ICP fit score for a prospect. Mutates and returns it."""
    prospect.score = round(
        score_revenue(prospect)
        + score_employees(prospect)
        + score_signals(prospect)
        + score_fit(prospect),
        1,
    )
    return prospect
