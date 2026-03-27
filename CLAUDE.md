# McChrystal Overwatch Agent

## Project Overview
Overwatch is McChrystal Group's AI-powered business development platform. Claude Code performs research via web search, then uses the library modules to score prospects against the ICP, build dossiers, draft outreach, and track market intelligence.

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
9. **Deep McChrystal Group Fit Analysis** — the most important section. The full strategic case a Senior Partner reads to decide whether to pursue. Reference the Visa Inc. dossier as gold standard. Must include ALL 6 subsections:
   - **9a. Fit Dimensions** (3-6) — each with specific problem, why McChrystal vs. competitors (not "we're better" but "McKinsey solves strategy; we solve the operating model"), timing/urgency
   - **9b. Cumulative Case** — synthesize dimensions into thesis, reinforcing signal chain, revenue potential estimate ($X initial → $Y expanded → $Z ongoing)
   - **9c. Enterprise Issues** (5-8) — deep on specific organizational dysfunction mechanisms, each connected to a McChrystal capability
   - **9d. Expected Outcomes** (5-7) — measurable results a Senior Partner could put in a proposal (e.g., "reduce cross-functional decision cycle time by 40-60%")
   - **9e. Stakeholder & Business Unit Map** — table format (Business Unit | Leader | Function | McChrystal Relevance), all major units, engagement priority list
   - **9f. Opportunity Thesis** — signal convergence (why now), structural paradox (why McChrystal not McKinsey), phased engagement with dollar ranges, competitive displacement strategy, multi-threaded pursuit map (2-3 parallel outreach threads + warm intro vectors)

   Quality standard: every claim grounded in facts from earlier sections or web research — no generic assertions

**Fit Rating Criteria:**
- **Strong** — Problem directly maps to a McChrystal capability AND at least 2 of: active trigger event (last 6 months), clear economic buyer identified, budget likely exists (revenue >$1B or known transformation spend), low competitive barrier, organizational urgency (crisis, deadline, board pressure)
- **Moderate** — Clear McChrystal fit but engagement uncertain due to at least 1 of: financial distress limiting advisory spend, no clear entry point identified, trigger event >12 months old or speculative, strong incumbent competitor engaged, cultural resistance to external advisory likely
- **Speculative** — Plausible fit but significant unknowns: problem is inferred not confirmed, Tier 3 industry with no prior McChrystal track record, org size/budget may be below threshold, would require significant education on McChrystal's model

Quality standards: be specific (no generic filler), flag [INFERRED] vs. confirmed facts, say "unavailable" rather than fabricate, prioritize recency (24 months)

- Models: `Contact`, `Dossier`, `FitAssessment`, `TriggerEvent`, `ConversationEntry` in `bd/models.py`
- Report: `bd/research/report.py` — `generate_dossier_report()`

### PDF Dossier Generation
Branded PDF dossiers are auto-generated whenever `save_research()` writes a dossier to dashboard.json. PDFs output to `data/dossiers/{CompanyName}_Dossier.pdf`.

**How it works:**
- `save_research()` in `bd/save.py` calls `generate_pdf_from_dossier(dossier)` after updating dashboard.json
- PDF generation is wrapped in try/except — failures log a warning but never block dossier saving
- Standalone CLI: `python3 generate_dossier_pdf.py <CompanyName>` (reads from dashboard.json)
- Batch backfill: `generate_missing_pdfs()` from `bd/pipeline.py` generates PDFs for all dossiers missing them
- `pipeline_status()` tracks `pdfs` count and `missing_pdfs` list

**PDF architecture:**
- Uses `fpdf2` library (Latin-1 encoding — no Unicode font support)
- `DossierPDF` class extends `FPDF` with McChrystal branding (orange accents, cover page with ICP scoring methodology bars)
- `generate_pdf(dossier_dict)` renders all 10 dossier sections + cover page from a JSON dict
- `generate_pdf_from_dossier(dossier)` accepts Pydantic `Dossier` objects, converts via `model_dump(mode="json")`

**Encoding & text handling (`clean_text()`):**
- Dashes: em/en/figure dashes → ASCII hyphens
- Quotes: smart quotes → straight quotes
- Bullets: bullet/circle/triangle/square → "-"
- Arrows: → becomes "->", ← becomes "<-"
- Symbols: ellipsis → "...", NBSP → space, zero-width space → removed
- Legal: ® → "(R)", ™ → "(TM)", © → "(c)"
- Markdown: `**bold**` markers stripped, `#`/`##`/`###` headers stripped to plain text
- Fallback: remaining non-Latin-1 characters replaced via `encode("latin-1", errors="replace")`

**Section 9 markdown table handling:**
Deep fit analysis contains markdown tables (stakeholder maps, business unit tables). The renderer detects `|`-delimited rows, captures headers, skips separator lines, and renders data rows as structured blocks (first cell bold, remaining as labeled key-value pairs).

**Missing field handling:**
Every section checks for `None`/empty before rendering. Missing sections are silently skipped — critical because subagent research may not populate every field.

**Known gotchas (bugs we hit during development):**
1. **`relevance` not `significance`** — `TriggerEvent` model field is `relevance`, but the PDF originally read `significance`. Now fixed with fallback: `t.get("relevance", "") or t.get("significance", "")`
2. **Multi-table state bleed in Section 9** — `pdf._table_headers` tracks the current table's header row but is only set once (`if pdf._table_headers is None`). If Section 9 has multiple markdown tables, the second table's header gets treated as a data row using the first table's column labels. Reset `_table_headers = None` when encountering a new `##` or `###` header to fix
3. **fpdf2 Latin-1 only** — `fpdf2` cannot render Unicode. Any character not in Latin-1 (0x00–0xFF) causes `UnicodeEncodeError`. The `clean_text()` method handles this with explicit replacements + a fallback `encode("latin-1", errors="replace")`. If you see `?` characters in output, add the missing character to the replacements dict
4. **fpdf2 `ln=True` deprecation** — `cell(..., ln=True)` produces deprecation warnings. The replacement is `new_x=XPos.LMARGIN, new_y=YPos.NEXT` but we haven't migrated yet. Cosmetic only — does not affect PDF output
5. **Bar chart text placement** — when a cover page bar is too narrow for the point label text, it renders outside the bar in dark color instead of white-on-fill. The threshold is `pts_w < fill_w - 2`
6. **`clean_text()` accepts lists** — dossier fields may be `list[str]` instead of `str` (e.g., `pain_points`). `clean_text()` handles this by joining with newlines, but callers should be aware

**QA checklist for PDF changes:**
1. Test with a fully populated dossier and a minimal dossier (missing sections should skip silently)
2. Run against a company with international characters in the name
3. Verify Section 5 trigger events show the relevance description text
4. Check Section 9 tables render correctly — especially if there are multiple tables
5. Check page breaks — `section_header()` and `sub_header()` check remaining space before rendering
6. Verify cover page ICP scoring bars render at correct proportional widths
7. Open the PDF and visually scan for `?` characters (indicates unhandled Unicode)

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
1. Run `python3 populate_markets.py --status` to check freshness of all sectors
2. Claude Code performs web searches for each sector (last 30 days of news)
3. Builds `MarketSector` objects with 5-10 articles each, diverse sources, and `prospect_candidates` listing companies showing ICP signals
4. Calls `generate_market_report(sectors)` — saves Markdown + replaces `market_intelligence` in dashboard.json
5. Push to GitHub to deploy

Replace semantics ensure stale articles are removed on refresh.

**Cross-pollination loop:** Market intelligence feeds discovery. Each sector's `prospect_candidates` field captures companies mentioned in articles that show ICP signals. Before running a discovery cycle, mine these candidates for high-fit prospects, cross-reference against existing pipeline to avoid duplicates, then include the best candidates alongside fresh web research targets.

- Models: `SectorCategory`, `MarketArticle`, `MarketSector` in `bd/models.py`
- Report: `bd/market/report.py` — `generate_market_report()`
- Save: `bd/save.py` — `save_market_intelligence()`, `clear_market_intelligence()`
- Status: `python3 populate_markets.py --status` — prints freshness table for all sectors
- Candidate scan: `python3 scan_candidates.py` — shows new vs. already-tracked prospect candidates from market intel

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

**Step 0: Mine Market Intelligence** — scan `market_intelligence` in `dashboard.json` for prospect candidates, cross-reference against existing pipeline to avoid duplicates. Use `python3 scan_candidates.py` for a quick view. Best candidates become Source A; fresh web research becomes Source B.

**Step 1: Discover (sequential, main conversation)** — Claude Code performs web research directly (NOT subagents — requires judgment and deduplication). Verify each prospect with multiple sources, confirm revenue/employees, identify trigger events with dates. No generic Fortune 500 — every prospect needs a specific, current reason to reach out NOW. Build `Prospect` objects → `score_prospect()` → `generate_report()`.

**Step 2: Research (parallel subagents, main conversation saves)** — batch 3-4 companies per subagent (2-3 in parallel). Subagents do web research only (no Bash). Prompt must include company details + full dossier section requirements from Phase 2. Subagents must cover: recent news, leadership bios, Glassdoor/culture, financials, competitor presence, brand insights (Sec 8), and deep fit analysis (Sec 9 — all 6 subsections at Visa Inc. quality). Main conversation builds `Dossier` objects and calls `generate_dossier_report()`.

**Step 3: Outreach (main conversation)** — no web research needed, dossier data already in `dashboard.json`. Build `OutreachPackage` objects in batches of 5 using inline Python. Each: 3 `ColdEmail` versions (A/B/C) + 1 `LinkedInMessage`. Target champion-level contacts (VP/SVP/CTO), NOT the CEO.

**Step 4: Verify & Deploy** — `pipeline_status()` to confirm completeness, push to GitHub.

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
- `bd/pipeline.py` — `get_existing_prospects()`, `pipeline_status()`, `clear_phase()`, `generate_missing_pdfs()` for orchestration
- `bd/save.py` — saves Markdown reports + updates dashboard JSON + auto-generates PDF dossiers; `clear_outreach()` resets outreach data; `save_market_intelligence()` / `clear_market_intelligence()` for market data
- `generate_dossier_pdf.py` — `generate_pdf()`, `generate_pdf_from_dossier()`, `find_dossier()` — branded PDF dossier generation with McChrystal branding, ICP scoring methodology, and Latin-1 text handling
- `scan_candidates.py` — extracts `prospect_candidates` from market intelligence sectors, fuzzy-matches against existing pipeline, prints new vs. already-tracked candidates grouped by sector. Run: `python3 scan_candidates.py`
- `import_linkedin.py` — reads ATL_BD enriched Excel workbooks, writes `docs/connections.json`. Run: `python3 import_linkedin.py`. Includes multi-board leader propagation: if a leader appears at multiple target companies and has an MG contact at one, that contact is automatically applied to all their companies. Excludes companies in `EXCLUDED_COMPANIES` list (currently: Booz Allen Hamilton) and partners in `EXCLUDED_PARTNERS` list (currently: Brendan Fitzgibbon)
- `docs/` — static HTML/CSS/JS dashboard, deployed via GitHub Pages at https://ace1523.github.io/bd-agent/
- `docs/connections.html` — standalone LinkedIn Connections page (light theme), also embedded in main dashboard via iframe
- `docs/connections.json` — generated LinkedIn connection data (regions, companies, leaders, connections, military affiliations). **CRITICAL field name:** the region-level partner summary is stored as `partner_breakdown` (array of `{partner, company_count}` objects). This is the field `connections.html` reads for the sidebar. Do NOT use a field called `partners` — it will not render. When manually editing connections.json, always write to `partner_breakdown`
- `data/` — generated reports (Markdown + dashboard.json)
- `data/proposals/` — reference folder for past proposals, SOWs, contracts (Phase 4 input)

## Dashboard
- **Personal URL**: https://ace1523.github.io/bd-agent/ (auto-deploys from `docs/` on push to main)
- **Personal Repo**: https://github.com/Ace1523/bd-agent
- **Enterprise URL**: https://mcchrystal-group.github.io/BD_Pipeline-/
- **Enterprise Repo**: https://github.com/McChrystal-Group/BD_Pipeline- (private repo, public Pages)
- After any data or dashboard changes, push to main to update the personal site
- **Enterprise sync** (from work machine PowerShell — cannot push from personal machine):
  ```
  cd $HOME\bd-agent
  git pull origin main
  git push mg-pipeline main
  ```
  Remotes on work machine: `origin` = Ace1523/bd-agent, `mg-pipeline` = McChrystal-Group/BD_Pipeline-
- Remind user to sync to enterprise after major work sessions

**Views:**
- **Home** — Pipeline Summary KPIs (prospect count, avg ICP score, fit rating breakdown, outreach count), core capabilities, who we target, industry tiers, fit signals, scoring model
- **Pipeline** — Prospect cards grouped by industry category, with filter pills. Sorted by score within each group. Each card shows Company Overview on expand.
- **Research** — Dossier cards grouped by industry category, with filter pills. Full 10-section detail on expand (including in-depth Company Overview); PDF download button and "View Outreach" link if outreach exists
- **Outreach** — Outreach package cards grouped by industry category, with filter pills. Target contact (champion-level, not CEO), fit rating badge, 3 cold email versions (A/B/C) with copy-to-clipboard
- **Connections** — LinkedIn connection intelligence from ATL_BD enrichment project. Embedded via iframe (`connections.html?embed=1`) with its own light theme. Region sub-tabs (All Regions, DC, Atlanta, NYC, Chicago — NYC/CHI are placeholders). Two data views per region:
  - **Key Connections** — leaders with direct MG Point of Contact (column D from enriched Excel). Sortable by company, leader, role, MG contact. Type-ahead search for leader names
  - **All Company Connections** — every LinkedIn connection at target companies, grouped by MG partner. Sortable by company, connection, position, partner. Type-ahead search for connection names. Seniority filter (All Levels / Senior Leadership)
  - MG Leadership filter in sticky left sidebar (vertical pill list, not horizontal row) — label is "MG Leadership" not "Partners" since not all are partners
  - Pipeline badge in flags column is clickable — deep links to Research tab on main dashboard, auto-expands the matching dossier card (uses URL params: `?view=research&company=Name`)
  - Data sourced from `connections.json` generated by `import_linkedin.py`
  - **Adding new partners:** Raw LinkedIn exports (CSV converted to xlsx) go in `ATL_BD/linkedin_exports/`. To add a new partner's connections: read the export, fuzzy-match connection companies against existing target companies in `connections.json`, add matching connections as `company_connections` entries with `mg_partner` set to the partner name. Then rebuild ALL derived fields: `connection_count`, `has_connections`, `partner_names` (per company), `partner_breakdown` (per region — this is the field `connections.html` reads for the sidebar), and `partner_count` (top level). The `partners` field does NOT exist in the canonical schema — only `partner_breakdown`
  - Standalone light-theme version also available at `connections.html` (direct access with full nav)
  - Deep link URL params supported in `app.js`: `?view=<tab>&company=<name>` switches tab and auto-expands card
- **Markets** — Two-level experience:
  - **Sidebar (news feed)**: Right-side sliding panel toggled via "Markets" button in nav bar. Shows the 10 most recent articles across all sectors as a compact feed (title, source, date, sector badge, 1-line summary). "Explore All Markets" link at top navigates to the full Markets page. Close via X button, overlay click, or Escape key
  - **Full Markets page**: Dedicated view (no nav tab — accessed via sidebar links or search). Filter pills (All/Niche/General), expandable sector cards grouped by category. Each sector card shows overview, key trends, McChrystal angle, "Companies to Watch" callout with prospect candidate pills (when populated), all articles with clickable links, freshness badge (green ≤7d, amber ≤30d, gray >30d), and last refreshed date. Search results for sectors open this page and expand the matching card
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
- **Warm Path auto-matching** — on page load, `buildWarmPathsMap()` indexes all companies from `connections.json`, then every Pipeline/Research/Outreach card calls `getWarmPaths(companyName)` with fuzzy substring matching. If a prospect matches a LinkedIn connections company, a "Warm Path" badge appears showing MG partner names and connection counts, with a deep link to the Connections tab. Star (★) indicates executive-level MG contact. Fully automatic — any new prospect added to the pipeline is checked against connections on next render
- All data reads from `docs/dashboard.json` which is synced from `data/dashboard.json` by `save.py`
- Color palette: McChrystal orange (`#da6123`) for brand accents, muted neutrals for UI elements

## Tech Stack
- Python 3.11+, Pydantic, Rich

## Project Conventions
- Pydantic models for all data structures
- Type hints on all functions
- All discovery/research/outreach runs via Claude Code — no CLI, no API keys needed
