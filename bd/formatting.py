"""Shared formatting helpers for Overwatch reports."""


def format_revenue(rev: float | None) -> str:
    if rev is None:
        return "Unknown"
    if rev >= 1_000_000_000:
        return f"${rev / 1_000_000_000:.1f}B"
    if rev >= 1_000_000:
        return f"${rev / 1_000_000:.0f}M"
    return f"${rev:,.0f}"


def format_employees(count: int | None) -> str:
    if count is None:
        return "Unknown"
    if count >= 1_000:
        return f"{count // 1_000}K+"
    return str(count)
