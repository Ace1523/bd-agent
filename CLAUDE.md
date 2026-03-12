# BD Agent — McChrystal Group Business Development Tool

## Project Overview
Python library for scoring and reporting on business development prospects for McChrystal Group. Claude Code performs research via web search, then uses the library modules to score prospects against the ICP and generate reports.

## McChrystal Group Context
McChrystal Group is a leadership advisory and organizational effectiveness firm founded by General Stanley McChrystal. Their differentiated POV: organizations today operate in VUCA (volatile, uncertain, complex, ambiguous) environments that require decentralized authority, shared consciousness, and empowered execution — the same principles that transformed Joint Special Operations Command in Iraq.

Core offerings:
- **Leadership development** and executive coaching
- **Organizational design** and transformation
- **Team of Teams** operating model implementation
- **Cross-functional alignment** and adaptability consulting
- **Crisis leadership** and high-stakes decision-making
- **Culture change** and trust-building at scale

## Ideal Customer Profile (ICP)

### Firmographics
- **Revenue**: $500M–$10B (sweet spot); premium boutique engagements ($500K–$5M+)
- **Employees**: 500+ required, 2,000+ preferred

### Fit Signals — what tells us they need McChrystal Group
- Navigating rapid scale, transformation, or disruption
- Leadership or culture problems masquerading as strategy problems
- Hierarchical or siloed structures failing in fast-moving markets
- High-stakes operating environments where failure has real consequences
- Leaders who respect mission-driven, no-BS advisory relationships
- C-suite changes, activist investor pressure, mergers/acquisitions, public organizational failures
- Earnings misses or strategic pivots
- Digital/operational transformation initiatives

### Industry Aperture — Three Tiers

**Tier 1 — Conventional (proven hunting ground)**
- Defense contractors and aerospace
- Federal agencies and government (civilian agencies in transformation)
- Financial services under regulatory or competitive pressure
- Healthcare systems undergoing M&A or digital transformation
- Large industrials and manufacturing

**Tier 2 — Adjacent (natural expansion)**
- Technology companies scaling past 500 employees and losing agility
- Private equity portfolio companies post-acquisition integration
- Energy transition companies (utilities, renewables, new energy at scale)
- Logistics and supply chain firms
- Professional services firms competing on talent and speed

**Tier 3 — Unconventional (high-upside bets)**
- Professional/collegiate sports organizations (front offices, coaching staff, multi-team ownership)
- Hospitals and trauma centers — high-stakes, time-pressured team dynamics
- Media and entertainment companies in platform disruption
- International organizations and NGOs operating in fragile environments
- First responder agencies (large metro fire/police undergoing culture reform)
- Venture-backed companies at Series C+ with founder-to-CEO transition challenges
- Agriculture and food systems companies scaling complex operations
- Collegiate/university systems (presidents navigating restructuring)
- Major infrastructure projects (construction programs, transit authorities)

## Workflow

### Phase 1: Discover (implemented)
1. **Research**: Claude Code searches the web for organizations showing ICP signals across all three industry tiers
2. **Profile**: For each prospect, capture:
   - Organization name and industry
   - **Why they fit** — specific challenge or transformation signal mapping to McChrystal capabilities
   - **Entry point** — who to target (title/function) and why they're the right economic buyer or champion
   - **Conversation hook** — one compelling, non-generic reason to reach out NOW
   - **Fit tier** — Tier 1 (conventional), Tier 2 (adjacent), or Tier 3 (unconventional)
3. **Score**: Build `Prospect` objects with `Signal` entries, assign tier, then call `score_prospect()` for ICP fit (0–100 scale)
4. **Report**: Pass scored prospects to `generate_report()` — output grouped by tier (Tier 1 → Tier 2 → Tier 3), saved to `data/`

**Research quality standards:**
- Prioritize orgs with publicly visible leadership challenges, transitions, or transformation initiatives
- Flag recent C-suite changes, activist investor pressure, M&A, or public organizational failures as high-priority
- For each Tier 3 prospect, include a one-sentence "why this is worth the unconventional bet" rationale
- Do NOT target organizations already known to be McChrystal Group clients

### Phase 2: Research (implemented)
Comprehensive dossiers a Senior Partner can read in under 10 minutes. Seven sections:
1. **Organization Snapshot** — legal name, HQ, founding year, ownership, geographic footprint
2. **Financial Health & Growth Stage** — revenue trajectory, profitability, analyst sentiment, key pressures/tailwinds
3. **Leadership Team Profiles** — C-suite + board with tenure, background (flag military/gov service), public persona, LinkedIn activity, known McChrystal connections. Identify 1-2 priority targets (economic buyer or champion) with rationale
4. **Organizational Culture & Structure Signals** — hierarchy vs. flat, Glassdoor patterns, known transformation programs, culture fit/problems
5. **Recent News & Trigger Events** — 5-7 most relevant developments (last 18 months) with date, event, and why it matters for McChrystal
6. **McChrystal Fit Assessment** — primary problem, best capability fit, likely objections, competitive landscape (McKinsey OrgDesign, Korn Ferry, etc.), rating (Strong/Moderate/Speculative)
7. **Conversation Entry Points** — 2-3 opening questions for a Senior Partner, mutual connections, recommended first meeting framing

Quality standards: be specific (no generic filler), flag [INFERRED] vs. confirmed facts, say "unavailable" rather than fabricate, prioritize recency (24 months)

- Models: `Contact`, `Dossier`, `FitAssessment`, `TriggerEvent`, `ConversationEntry` in `bd/models.py`
- Report: `bd/research/report.py` — `generate_dossier_report()`

### Phase 3: Outreach (implemented)
3-email sequences per prospect, built from dossier data. Each sequence escalates from insight to ask.

**Sequence structure:**
1. **Email 1 — Trigger-based opener** (send_delay_days=0): Reference a specific, recent trigger event from the dossier. Connect it to one McChrystal capability. Demonstrate that we've done our homework — no generic "I'd love to connect."
2. **Email 2 — Value-add follow-up** (send_delay_days=5): Share a relevant framework, insight, or parallel example (e.g., "When we worked with a similar organization facing X..."). Position McChrystal as a thought partner, not a vendor. No hard ask yet.
3. **Email 3 — Direct ask** (send_delay_days=10): Propose a specific, low-commitment next step (30-min call, diagnostic conversation, introduce to a relevant Senior Partner). Create urgency tied to their timeline.

**Tone & voice:**
- Write as a Senior Partner, not a sales rep — peer-to-peer, not vendor-to-buyer
- Confident but not pushy; direct but respectful of their time
- Reference McChrystal Group's military/special operations DNA only when it maps naturally (e.g., veteran contacts, crisis situations, Team of Teams)
- No jargon-stuffing — use McChrystal concepts (shared consciousness, empowered execution, Team of Teams) sparingly and only when they genuinely fit the prospect's situation

**Email quality standards:**
- Address the primary priority contact by first name
- 150–250 words per email body — busy executives won't read more
- Every email must reference something specific to THIS prospect (trigger event, leadership change, financial data, Glassdoor signal) — never generic
- Subject lines: short (<60 chars), specific, no clickbait. Pattern: "[Company-specific thing] + [McChrystal angle]"
- Hook field on each Email object should name the specific signal or pain point that email leverages
- Do NOT mention competitors by name in outreach emails
- Do NOT promise specific ROI or outcomes — McChrystal sells advisory relationships, not deliverables

**Targeting logic:**
- Default to the #1 priority contact from the dossier (economic buyer or internal champion)
- If the priority contact is a veteran, lean into the military connection
- If the prospect has a Chief Transformation Officer or similar role, consider them as primary target over the CEO

- Models: `Email`, `OutreachSequence` in `bd/models.py`
- Report: `bd/outreach/drafter.py` — `generate_outreach_report()`

## Pipeline Orchestration
Claude Code can run the full BD pipeline (discover -> research -> outreach) with a single instruction using helpers in `bd/pipeline.py`:

1. `get_existing_prospects()` — load all scored prospects from dashboard.json
2. `pipeline_status()` — see counts by phase and which prospects are missing dossiers or outreach
3. `clear_phase(phase)` — reset a phase ('discovery', 'research', or 'outreach') before regenerating

**Single-command workflow**: Claude Code should discover prospects, score them, build dossiers for each, generate outreach sequences, and update the dashboard — all in one pass. Use `pipeline_status()` to verify completeness.

## Key Modules
- `bd/models.py` — `Prospect`, `Signal`, `SignalType`, `FitTier`, `Contact`, `Dossier`, `FitAssessment`, `FitRating`, `TriggerEvent`, `ConversationEntry`, `Email`, `OutreachSequence`
- `bd/discover/scorer.py` — `score_prospect()` and component scoring functions
- `bd/discover/report.py` — `generate_report()` produces Markdown reports (grouped by tier)
- `bd/config.py` — ICP thresholds, scoring weights, signal types, industry tiers
- `bd/formatting.py` — shared formatting helpers (revenue, employee counts)
- `bd/research/report.py` — `generate_dossier_report()` produces Markdown dossiers
- `bd/outreach/drafter.py` — `generate_outreach_report()` produces Markdown email sequences
- `bd/dashboard.py` — JSON export for dashboard; `python -m bd.dashboard` bootstraps from Markdown
- `bd/pipeline.py` — `get_existing_prospects()`, `pipeline_status()`, `clear_phase()` for orchestration
- `bd/save.py` — saves Markdown reports + updates dashboard JSON; `clear_outreach()` resets outreach data
- `site/` — static HTML/CSS/JS dashboard (serve with `python -m http.server 8080 --directory site`)
- `data/` — generated reports (Markdown + dashboard.json)

## Tech Stack
- Python 3.11+, Pydantic, Rich

## Project Conventions
- Pydantic models for all data structures
- Type hints on all functions
- All discovery/research/outreach runs via Claude Code — no CLI, no API keys needed
