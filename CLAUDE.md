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
- Executive hiring surges — new C-suite roles, leadership team buildouts signaling strategic shifts
- Funding events — PE recapitalizations, funding rounds, credit facilities, secondary offerings
- Strategic partnerships, joint ventures, or platform alliances that force operating model changes

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
   - **Company overview** — 2-3 sentence description of what the company does, its market position, and ownership structure (populates `company_overview` field on Prospect)
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
- **Prioritize non-obvious, creative companies** — avoid household names (Boeing, Amazon, Google, etc.) that anyone would think of. The value is surfacing companies people wouldn't find on their own: PE-backed roll-ups, spinoffs, fresh mergers, niche industry leaders with strong transformation signals

### Phase 2: Research (implemented)
Comprehensive dossiers a Senior Partner can read in under 10 minutes. Eight sections:
1. **Organization Snapshot** — legal name, HQ, founding year, ownership, geographic footprint
1b. **Company Overview** — in-depth narrative (3-5 sentences) covering what the company does, how it makes money, ownership history, major recent events (mergers, spinoffs, PE transactions), and current strategic direction. This is the first thing a reader sees after the snapshot — it must stand alone as a complete introduction for someone who has never heard of the company. Populates the `company_overview` field on the Prospect object embedded in the Dossier.
2. **Financial Health & Growth Stage** — revenue trajectory, profitability, analyst sentiment, key pressures/tailwinds
3. **Leadership Team Profiles** — C-suite + board with tenure, background (flag military/gov service), public persona, LinkedIn activity, known McChrystal connections. Identify 1-2 priority targets — target VP/SVP/Chief Transformation Officer/Head of Strategy (someone who feels the pain daily and can champion internally), NOT the CEO. CEO should be listed as a contact but marked as "executive sponsor" not "outreach target". The `is_priority_target` flag should go to the champion-level contact
4. **Organizational Culture & Structure Signals** — hierarchy vs. flat, Glassdoor patterns, known transformation programs, culture fit/problems
5. **Recent News & Trigger Events** — 5-7 most relevant developments (last 18 months) with date, event, and why it matters for McChrystal
6. **McChrystal Fit Assessment** — primary problem, best capability fit, likely objections, competitive landscape (McKinsey OrgDesign, Korn Ferry, etc.), rating (Strong/Moderate/Speculative)
7. **Conversation Entry Points** — 2-3 opening questions for a Senior Partner, mutual connections, recommended first meeting framing

**Fit Rating Criteria:**
- **Strong** — Problem directly maps to a McChrystal capability AND at least 2 of: active trigger event (last 6 months), clear economic buyer identified, budget likely exists (revenue >$1B or known transformation spend), low competitive barrier, organizational urgency (crisis, deadline, board pressure)
- **Moderate** — Clear McChrystal fit but engagement uncertain due to at least 1 of: financial distress limiting advisory spend, no clear entry point identified, trigger event >12 months old or speculative, strong incumbent competitor engaged, cultural resistance to external advisory likely
- **Speculative** — Plausible fit but significant unknowns: problem is inferred not confirmed, Tier 3 industry with no prior McChrystal track record, org size/budget may be below threshold, would require significant education on McChrystal's model

Quality standards: be specific (no generic filler), flag [INFERRED] vs. confirmed facts, say "unavailable" rather than fabricate, prioritize recency (24 months)

- Models: `Contact`, `Dossier`, `FitAssessment`, `TriggerEvent`, `ConversationEntry` in `bd/models.py`
- Report: `bd/research/report.py` — `generate_dossier_report()`

### Phase 3: Outreach (implemented)
3 independent cold email versions (A/B/C) per prospect, each with a genuinely different opening strategy. NOT sequential follow-ups — pick whichever version resonates most.

**Version structure:**
1. **Version A — Trigger-based**: Lead with a specific, recent trigger event from the dossier. Connect it directly to a McChrystal capability. Show we've done our homework.
2. **Version B — Insight-based**: Open with an industry trend or pattern, then pivot to how it maps to the prospect's specific situation. Position McChrystal as seeing the landscape, not just the company.
3. **Version C — Warm angle**: Find a human connection — shared network, military background, mutual board member, alma mater, conference appearance. Use that warmth to earn the first read.

**Email structure (all 3 versions follow this):**
1. Opening hook — specific, relevant, human (2-3 sentences)
2. Bridge — why McChrystal Group is reaching out now (2-3 sentences)
3. Credibility signal — one concrete proof point (1-2 sentences)
4. Soft ask — 20-minute call, low-friction (1-2 sentences)
5. Signature block

**Tone & voice:**
- Warm but credible, peer-to-peer — not salesy or vendor-to-buyer
- No buzzwords, no firm bragging in the first half of the email
- Reference McChrystal Group's military/special operations DNA only when it maps naturally (e.g., veteran contacts, crisis situations)
- No jargon-stuffing — use McChrystal concepts sparingly and only when they genuinely fit

**Email quality standards:**
- Address the target contact by first name
- 150–200 words max per version — busy executives won't read more
- Every email must reference something specific to THIS prospect — never generic
- Subject lines: short (<60 chars), specific, no clickbait
- Hook field on each ColdEmail object should name the specific signal/angle that version leverages
- The 3 versions must be genuinely different — not the same email with swapped openers
- Should not be detectable as AI-generated
- Flag [GAP] if a version can't find a real angle rather than forcing a weak one
- Do NOT mention competitors by name
- Do NOT promise specific ROI or outcomes

**Targeting logic:**
- Target champion-level contacts (VP, SVP, Chief Transformation Officer, Head of Strategy) — NOT the CEO
- These are people who feel the pain daily and can champion McChrystal internally
- CEO stays as a contact but is marked "executive sponsor," not outreach target
- If the target contact is a veteran, lean into the military connection

**LinkedIn message:**
- Each outreach package also includes one LinkedIn message (connection request or InMail)
- 50–100 words max — shorter and more casual than email
- No signature block, no formal structure — should feel like a real person reaching out
- Reference one specific thing about the contact or their company
- Use `message_type`: "connection_request" (300 char limit, no subject) or "inmail" (has subject line)
- Prefer connection request unless the contact's profile suggests InMail is needed

- Models: `ColdEmail`, `LinkedInMessage`, `OutreachPackage` in `bd/models.py`
- Report: `bd/outreach/drafter.py` — `generate_outreach_report()`

### Phase 4: Proposals (coming soon)
AI-drafted proposals using McChrystal Group's historical proposals as reference material. Claude Code is the engine — no training pipeline, no APIs.

**How it works:**
1. Past proposals, SOWs, pricing sheets, and contracts are stored in `data/proposals/` (PDFs, Word docs, text files)
2. When drafting for a prospect, Claude Code reads relevant reference proposals + the prospect's dossier
3. Generates a first draft matching McChrystal's voice, scope structure, staffing models, and pricing patterns
4. Senior Partners review and correct; Claude Code learns from the feedback over time

**What's needed to activate:**
- Past proposals dropped into `data/proposals/` — both wins and losses
- Pricing guidelines and rate cards
- Win/loss context (what worked, what didn't)

## Pipeline Orchestration
Claude Code can run the full BD pipeline (discover -> research -> outreach) with a single instruction using helpers in `bd/pipeline.py`:

1. `get_existing_prospects()` — load all scored prospects from dashboard.json
2. `pipeline_status()` — see counts by phase and which prospects are missing dossiers or outreach
3. `clear_phase(phase)` — reset a phase ('discovery', 'research', or 'outreach') before regenerating

**Single-command workflow**: Claude Code should discover prospects, score them, build dossiers for each, generate outreach packages, and update the dashboard — all in one pass. Use `pipeline_status()` to verify completeness.

### Execution Strategy

**Step 1: Discover (sequential, thorough)**
- Claude Code performs web research to identify prospects — this is NOT delegated to subagents because prospect selection requires judgment, cross-referencing, and deduplication against existing prospects in `dashboard.json`
- For each prospect: verify with multiple sources, confirm revenue/employee data, identify specific trigger events with dates, find named leadership contacts
- Do NOT select generic Fortune 500 companies — every prospect must have a specific, current reason McChrystal Group should reach out NOW
- Build `Prospect` objects, score with `score_prospect()`, generate report with `generate_report()`

**Step 2: Research (parallel subagents)**
- Split prospects into batches of 3-4 companies
- Launch 2-3 subagents in parallel, each responsible for its batch
- Each subagent: performs deep web research on its companies, builds `Dossier` objects with all 7 sections populated, calls `generate_dossier_report()`
- Each subagent must search for: recent news (last 6 months), leadership bios, Glassdoor/culture signals, financial data, competitor presence, and McChrystal-specific fit angles
- Subagent prompt must include: company name, industry, revenue, employee count, tier, signals, and the full dossier section requirements from Phase 2

**Step 3: Outreach (parallel subagents)**
- Split prospects into batches of 5 companies
- Launch 2 subagents in parallel, each responsible for its batch
- Each subagent: loads dossier data from `dashboard.json`, performs additional web research for freshest hooks, builds `OutreachPackage` objects with 3 `ColdEmail` versions (A/B/C) + 1 `LinkedInMessage` each, calls `generate_outreach_report()`
- Target contact must be a champion-level contact (VP/SVP/CTO/Head of Strategy), NOT the CEO
- Subagent prompt must include: the full outreach requirements from Phase 3 (version structure, email structure, LinkedIn message, tone, quality standards, targeting logic)

**Step 4: Verify & Deploy**
- Run `pipeline_status()` to confirm all prospects have dossiers and outreach
- Verify `dashboard.json` has the correct count of outreach packages
- Push to GitHub to update the live dashboard

**Research quality gates (every step):**
- Every fact should come from a web search, not from model knowledge — model knowledge is used to frame and contextualize, not as a primary source
- Dates must be specific (month/year minimum), not "recently" or "in recent years"
- Revenue and employee figures must be sourced or marked [INFERRED]
- If a prospect turns out to have no compelling current signal upon deeper research, drop it and find a replacement — do not force-fit

## Key Modules
- `bd/models.py` — `Prospect`, `Signal`, `SignalType`, `FitTier`, `Contact`, `Dossier`, `FitAssessment`, `FitRating`, `TriggerEvent`, `ConversationEntry`, `ColdEmail`, `LinkedInMessage`, `OutreachPackage` (legacy: `Email`, `OutreachSequence`)
- `bd/discover/scorer.py` — `score_prospect()` and component scoring functions
- `bd/discover/report.py` — `generate_report()` produces Markdown reports (grouped by tier)
- `bd/config.py` — ICP thresholds, scoring weights, signal types, industry tiers
- `bd/formatting.py` — shared formatting helpers (revenue, employee counts)
- `bd/research/report.py` — `generate_dossier_report()` produces Markdown dossiers
- `bd/outreach/drafter.py` — `generate_outreach_report()` produces Markdown outreach packages (3 cold email versions A/B/C)
- `bd/dashboard.py` — JSON export for dashboard; `python -m bd.dashboard` bootstraps from Markdown
- `bd/pipeline.py` — `get_existing_prospects()`, `pipeline_status()`, `clear_phase()` for orchestration
- `bd/save.py` — saves Markdown reports + updates dashboard JSON; `clear_outreach()` resets outreach data
- `docs/` — static HTML/CSS/JS dashboard, deployed via GitHub Pages at https://ace1523.github.io/bd-agent/
- `data/` — generated reports (Markdown + dashboard.json)
- `data/proposals/` — reference folder for past proposals, SOWs, contracts (Phase 4 input)

## Dashboard
- **URL**: https://ace1523.github.io/bd-agent/ (auto-deploys from `docs/` on push to main)
- **Repo**: https://github.com/Ace1523/bd-agent
- After any data or dashboard changes, push to main to update the live site

**Views:**
- **Home** — Pipeline Summary KPIs (prospect count, avg ICP score, fit rating breakdown, outreach count), core capabilities, who we target, industry tiers, fit signals, scoring model
- **Pipeline** — Prospect cards grouped by industry category, with filter pills. Sorted by score within each group. Each card shows Company Overview on expand.
- **Research** — Dossier cards grouped by industry category, with filter pills. Full 8-section detail on expand (including in-depth Company Overview); "View Outreach" link if outreach exists
- **Outreach** — Outreach package cards grouped by industry category, with filter pills. Target contact (champion-level, not CEO), fit rating badge, 3 cold email versions (A/B/C) with copy-to-clipboard
- **Proposals** — Phase 4 (coming soon): AI-assisted proposal writing trained on McChrystal Group's historical proposals, SOWs, and pricing. Will draft from dossier data + learned patterns
- **How It Works** — Pipeline workflow, scoring model, signal types, dossier structure, outreach logic, plus collapsible prompt blocks showing the actual AI instructions for each phase

**Industry Categories** (used for filtering/grouping in Pipeline, Research, Outreach):
| Category | Covers |
|----------|--------|
| Healthcare | Dental, pharma, skilled nursing, consumer healthcare |
| Defense & Government | Defense contractors, federal agencies, government IT |
| Technology & Fintech | Software, fintech, semiconductors, gaming, networking/telecom |
| Industrial & Logistics | Auto parts, collision repair, logistics, manufacturing, specialty materials, supply chain |
| Energy | Oil & gas, utilities, renewables, power |
| Home & Business Services | HVAC, plumbing, electrical, residential services |
| Media & Consumer | Entertainment, sports, retail, apparel, talent management |

Categories are derived at render time from the existing `industry` field via `categoryOf()` in `docs/app.js` — no new data field needed. When adding new prospects, assign an `industry` value that maps naturally to one of these categories via keyword matching.

**UI features:**
- Industry category filter pills on Pipeline, Research, and Outreach views — "All" groups cards by category with subheaders; clicking a category filters to just those cards
- Company search bar (top-right nav) — searches across all views, clicking a result navigates and auto-expands the card
- Click-to-expand cards on Pipeline, Research, and Outreach views
- All data reads from `docs/dashboard.json` which is synced from `data/dashboard.json` by `save.py`
- Color palette: McChrystal orange (`#da6123`) for brand accents, muted neutrals for UI elements

## Tech Stack
- Python 3.11+, Pydantic, Rich

## Project Conventions
- Pydantic models for all data structures
- Type hints on all functions
- All discovery/research/outreach runs via Claude Code — no CLI, no API keys needed
