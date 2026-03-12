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

## Scoring Model

Total ICP fit score: 0–100 points across four components.

| Component | Max Points | What It Measures |
|-----------|-----------|-----------------|
| Signals | 35 | Count of signals (top 4) + recency bonus |
| Revenue | 25 | Fit within $500M–$10B sweet spot |
| Employees | 20 | 2,000+ preferred, 500+ minimum |
| McChrystal Fit | 20 | High-fit signal types + signal diversity |

**Revenue scoring curve:**
- Sweet spot $500M–$10B → 70–100% of 25 pts (peak at midpoint)
- Below $500M → pro-rata × 0.5
- Above $10B → 60%
- Unknown → 30%

**Employee scoring:**
- Below 500 → pro-rata × 0.3
- 500–2,000 → 50–70%
- 2,000+ → 70–100% (diminishing returns)
- Unknown → 30%

**Signal scoring:**
- Top 4 signals count (cap prevents signal-stuffing)
- Each signal: base (60%) + recency bonus
- Recency: <30 days = 40%, <90 days = 30%, <180 days = 20%, older = 10%, unknown date = 15%

**Fit scoring:**
- HIGH_FIT_SIGNALS: `reorg`, `transformation`, `m_and_a`, `hiring_surge`, `funding`, `partnership` → 5 pts each (max 12)
- Signal diversity: 2 pts per unique signal type (max 8)

**Formula:** `score = revenue + employees + signals + fit`

### Signal Type Definitions

All 9 signal types used during discovery to classify organizational moments:

| Signal Type | Definition |
|-------------|-----------|
| `reorg` | Restructuring, downsizing, organizational redesign |
| `m_and_a` | Mergers, acquisitions, divestitures, go-private deals |
| `leadership_change` | C-suite departures, new CEO/COO/CTO appointments |
| `earnings_miss` | Revenue shortfall, guidance cuts, EBITDA pressure |
| `rapid_growth` | Revenue surge, rapid scaling, market expansion |
| `transformation` | Digital transformation, business model pivot, strategic overhaul |
| `hiring_surge` | Aggressive hiring, talent acquisition push, new division buildout |
| `funding` | IPO, capital raise, PE investment, debt restructuring |
| `partnership` | Strategic alliances, joint ventures, platform partnerships |

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
Comprehensive dossiers a Senior Partner can read in under 10 minutes. Ten sections:
1. **Organization Snapshot** — legal name, HQ, founding year, ownership, geographic footprint
1b. **Company Overview** — in-depth narrative (3-5 sentences) covering what the company does, how it makes money, ownership history, major recent events (mergers, spinoffs, PE transactions), and current strategic direction. This is the first thing a reader sees after the snapshot — it must stand alone as a complete introduction for someone who has never heard of the company. Populates the `company_overview` field on the Prospect object embedded in the Dossier.
2. **Financial Health & Growth Stage** — revenue trajectory, profitability, analyst sentiment, key pressures/tailwinds
3. **Leadership Team Profiles** — C-suite + board with tenure, background (flag military/gov service), public persona, LinkedIn activity, known McChrystal connections. Identify 1-2 priority targets — target VP/SVP/Chief Transformation Officer/Head of Strategy (someone who feels the pain daily and can champion internally), NOT the CEO. CEO should be listed as a contact but marked as "executive sponsor" not "outreach target". The `is_priority_target` flag should go to the champion-level contact
4. **Organizational Culture & Structure Signals** — hierarchy vs. flat, Glassdoor patterns, known transformation programs, culture fit/problems
5. **Recent News & Trigger Events** — 5-7 most relevant developments (last 18 months) with date, event, and why it matters for McChrystal
6. **McChrystal Fit Assessment** — primary problem, best capability fit, likely objections, competitive landscape (McKinsey OrgDesign, Korn Ferry, etc.), rating (Strong/Moderate/Speculative)
7. **Conversation Entry Points** — 2-3 opening questions for a Senior Partner, mutual connections, recommended first meeting framing
8. **Brand Insights & Market Positioning** — deep analysis of the company's current brand strategy, market positioning, and what it reveals about organizational challenges McChrystal can address. Covers:
   - **Brand value & competitive standing** — rankings, brand equity metrics, how the brand compares to direct competitors
   - **Brand identity evolution** — how the company's brand positioning is shifting (or needs to shift) and what that means organizationally. Is the brand promising something the organization can't yet deliver?
   - **Marketing leadership & strategy** — CMO vision, recent campaigns, brand ambition level. Marketing leaders are potential influencer contacts if their agenda aligns with McChrystal's capability
   - **Brand threats** — competitive disintermediation, invisibility risks, market perception gaps. Where is the brand vulnerable, and does that vulnerability trace back to an organizational problem?
   - **Major brand investments** — sponsorships, partnerships, campaigns that create organizational coordination demands (e.g., global event activations requiring cross-functional teamwork)
   - The through-line: brand insights should connect back to McChrystal fit — brands that promise cross-functional agility, global coordination, or cultural transformation but lack the operating model to deliver are prime engagement targets
9. **Deep McChrystal Group Fit Analysis** — the most important section. Goes beyond the Sec 6 Fit Assessment to build the full strategic case a Senior Partner reads to decide whether to pursue. Must include ALL of the following subsections (reference the Visa Inc. dossier as the gold standard):

   **9a. Fit Dimensions (3-6 reinforcing dimensions)**
   - Each dimension gets its own `### Fit Dimension N: Title` subsection
   - For each: the specific problem, why McChrystal is uniquely positioned vs. competitors (McKinsey, Deloitte, Korn Ferry, etc.), and timing/urgency factors
   - Competitor displacement logic per dimension — not "we're better than McKinsey" but "McKinsey solves strategy; we solve the operating model that lets strategy execute"

   **9b. Cumulative Case — Why [Company] Is a Top Pipeline Opportunity**
   - Synthesize all dimensions into a clear thesis
   - List the reinforcing signal chain (how each dimension amplifies the others)
   - Include revenue potential estimate ($X initial, $Y expanded, $Z ongoing)

   **9c. Enterprise Issues & Organizational Challenges**
   - 5-8 detailed problem areas, each its own numbered subsection with a bold title
   - Go deep on the specific organizational dysfunction — not generic "they have silos" but the exact mechanism of how the dysfunction manifests (e.g., "eliminated scrum masters during a layoff that demanded more coordination, not less")
   - Connect each issue to a McChrystal capability

   **9d. Expected Outcomes from McChrystal Group Engagement**
   - 5-7 concrete, measurable outcomes a Senior Partner could put in a proposal
   - Each outcome: bold title, 2-3 sentence description of what McChrystal would deliver, specific measurable result (e.g., "reduce cross-functional decision-making cycle time by 40-60%")

   **9e. Key Stakeholders & Business Unit Map**
   - Table format: Business Unit | Leader | Function | McChrystal Relevance
   - Cover all major business units, not just the C-suite
   - Flag which units are priority engagement targets and why
   - Include a stakeholder engagement priority list (numbered, with rationale for each)

   **9f. Opportunity Thesis**
   - **Strategic Signal Convergence — Why Now**: explain how multiple signals compound each other's organizational impact. Use a signal chain showing causation (→ arrows)
   - **The Structural Paradox — Why McChrystal, Not McKinsey**: articulate why incumbent advisors can't solve this problem. Be specific about which firms are likely engaged and why they leave a gap
   - **Phased Engagement Hypothesis — Land and Expand**: 3-phase plan with dollar ranges, timelines, and specific scope for each phase. Phase 1 must be a bounded beachhead. Explain why this specific beachhead (not just "start small")
   - **Competitive Displacement Strategy**: how to get past procurement, bypass incumbent advisor relationships, and position McChrystal as a complement not a competitor
   - **Multi-Threaded Pursuit Map**: 2-3 parallel outreach threads targeting different contacts with different angles, plus warm introduction vectors (McChrystal personal network, board connections, conference proximity, military/veteran angles)

   Quality standard: every claim must be grounded in specific facts from earlier dossier sections or web research — no generic assertions about "McChrystal's unique capabilities"

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

### Market Intelligence (living feed)
Market/sector intelligence reports with curated news articles. Covers niche markets (PE-backed roll-ups, post-merger integrations, defense consolidation, etc.) and general markets.

**Sector List:**

*Niche:* PE-Backed Roll-Ups, Post-Merger Integrations, Defense Consolidation, Healthcare M&A, Energy Transition, Tech Spinoffs & Carve-outs, Government Transformation, Sports & Entertainment Ownership

*General:* Technology & AI, Financial Services, Industrial & Manufacturing, Healthcare Systems, Energy & Utilities

**Refresh workflow:**
1. Claude Code performs web searches for each sector (last 30 days of news)
2. Builds `MarketSector` objects with 5-10 articles each, diverse sources
3. Calls `generate_market_report(sectors)` — saves Markdown + replaces `market_intelligence` in dashboard.json
4. Push to GitHub to deploy

Replace semantics ensure stale articles are removed on refresh.

- Models: `SectorCategory`, `MarketArticle`, `MarketSector` in `bd/models.py`
- Report: `bd/market/report.py` — `generate_market_report()`
- Save: `bd/save.py` — `save_market_intelligence()`, `clear_market_intelligence()`

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
- Each subagent: performs deep web research on its companies, builds `Dossier` objects with all 10 sections populated, calls `generate_dossier_report()`
- Each subagent must search for: recent news (last 6 months), leadership bios, Glassdoor/culture signals, financial data, competitor presence, McChrystal-specific fit angles, brand value/rankings, CMO/marketing strategy, brand campaigns, sponsorships, and competitive brand positioning
- Subagent prompt must include: company name, industry, revenue, employee count, tier, signals, and the full dossier section requirements from Phase 2
- **Brand Insights (Sec 8)** — subagents must research the company's brand value (Kantar, Interbrand rankings if available), current brand strategy and campaigns, CMO vision, brand threats (competitive disintermediation, market perception gaps), and major brand investments (sponsorships, partnerships). Connect every insight back to an organizational coordination challenge McChrystal can address
- **Deep McChrystal Fit Analysis (Sec 9)** — this is the most critical section and must match the depth of the Visa Inc. dossier. Subagents must produce ALL six subsections (9a–9f): fit dimensions with competitor displacement logic, cumulative case with revenue estimate, enterprise issues (5-8 detailed problems), expected outcomes (5-7 measurable deliverables), key stakeholders & business unit map (table format covering all major units), and full opportunity thesis (signal convergence, structural paradox, phased engagement with dollar ranges, competitive displacement strategy, multi-threaded pursuit map with 2-3 parallel outreach threads). This is the section a Senior Partner reads to decide whether to pursue — it must be specific, strategic, and non-generic. Every claim grounded in facts from earlier sections or web research

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
- `bd/models.py` — `Prospect`, `Signal`, `SignalType`, `FitTier`, `Contact`, `Dossier`, `FitAssessment`, `FitRating`, `TriggerEvent`, `ConversationEntry`, `ColdEmail`, `LinkedInMessage`, `OutreachPackage`, `SectorCategory`, `MarketArticle`, `MarketSector` (legacy: `Email`, `OutreachSequence`)
- `bd/discover/scorer.py` — `score_prospect()` and component scoring functions
- `bd/discover/report.py` — `generate_report()` produces Markdown reports (grouped by tier)
- `bd/config.py` — ICP thresholds, scoring weights, signal types, industry tiers
- `bd/formatting.py` — shared formatting helpers (revenue, employee counts)
- `bd/research/report.py` — `generate_dossier_report()` produces Markdown dossiers
- `bd/outreach/drafter.py` — `generate_outreach_report()` produces Markdown outreach packages (3 cold email versions A/B/C)
- `bd/market/report.py` — `generate_market_report()` produces Markdown market intelligence reports
- `bd/dashboard.py` — JSON export for dashboard; `python -m bd.dashboard` bootstraps from Markdown
- `bd/pipeline.py` — `get_existing_prospects()`, `pipeline_status()`, `clear_phase()` for orchestration
- `bd/save.py` — saves Markdown reports + updates dashboard JSON; `clear_outreach()` resets outreach data; `save_market_intelligence()` / `clear_market_intelligence()` for market data
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
- **Research** — Dossier cards grouped by industry category, with filter pills. Full 10-section detail on expand (including in-depth Company Overview); "View Outreach" link if outreach exists
- **Outreach** — Outreach package cards grouped by industry category, with filter pills. Target contact (champion-level, not CEO), fit rating badge, 3 cold email versions (A/B/C) with copy-to-clipboard
- **Markets** — Right-side sliding sidebar panel (not a tab). Toggled via "Markets" button in nav bar. Overlays main content without pushing it. Filter pills (All/Niche/General) inside sidebar. Collapsed: sector name, category badge, freshness badge (green ≤7d, amber ≤30d, gray >30d), article count. Expanded: overview, key trends, McChrystal angle, top articles with clickable links, last refreshed date. Close via X button, overlay click, or Escape key. Search results for sectors open the sidebar and expand the matching card
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
