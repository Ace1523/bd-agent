"""Market intelligence refresh tool — seed data and freshness status for all 13 sectors."""

import argparse
import datetime
import json
import os
from bd.models import SectorCategory, MarketArticle, MarketSector
from bd.market.report import generate_market_report

TODAY = datetime.date(2026, 3, 12)

sectors = [
    # ========== NICHE SECTORS ==========

    MarketSector(
        name="PE-Backed Roll-Ups",
        category=SectorCategory.niche,
        overview="Private equity roll-up activity is accelerating into 2026 with renewed deal flow after a 2023-2024 pause, but the strategy is hitting maturity challenges in saturated verticals like dental, veterinary, and HVAC. PE firms are shifting from pure financial engineering to operational value creation as higher interest rates eliminate leverage-driven returns. The accounting sector has become the newest high-velocity roll-up frontier, with fewer than 200 PE investments spawning over 900 subsequent transactions in 2025. Home services platforms like Apex Service Partners (200+ acquisitions, $2.2B revenue) and PE-backed RIA aggregators (controlling nearly $6 trillion in AUM) represent the scale these consolidation plays now reach. Integration complexity — merging cultures, systems, and talent across dozens of acquired entities — is the dominant challenge and the primary source of value destruction.",
        key_trends=[
            "Accounting firm consolidation exploding — Baker Tilly/Moss Adams $7B merger created the largest PE-backed CPA firm; PE investments in accounting led to 900+ subsequent transactions in 2025",
            "Home services platforms reaching massive scale — Apex Service Partners hit $2.2B revenue across 200+ acquisitions; Alpine Investors closed a $3.4B continuation vehicle to fund further growth",
            "RIA wealth management consolidation at record pace — 466 announced transactions in 2025 (up 27%), PE involved in 70-79% of all deals, PE-backed RIAs now control 23% of industry assets",
            "Shift from financial engineering to operational value creation — higher rates force PE firms to drive genuine operational improvements rather than relying on leverage and multiple expansion",
            "Integration complexity becoming the primary value destroyer — cultural misalignment, systems fragmentation, and talent attrition during integration periods undermining roll-up economics",
        ],
        mcchrystal_angle="PE-backed roll-ups are a natural hunting ground for McChrystal Group. Every roll-up creates the exact organizational dysfunction McChrystal specializes in solving: dozens of formerly independent businesses forced into a shared operating model, founder-entrepreneurs clashing with corporate standardization, siloed cultures resisting integration, and leadership teams stretched thin across rapid acquisitions. The Team of Teams operating model directly addresses the central roll-up challenge — how to maintain entrepreneurial agility while achieving the coordination and shared consciousness needed to realize synergies. PE sponsors increasingly recognize that operational value creation (not financial engineering) drives returns, and McChrystal's cross-functional alignment and culture change capabilities are precisely what's needed to turn a collection of acquired businesses into a unified, high-performing organization.",
        articles=[
            MarketArticle(
                title="PE-backed public accounting consolidation picks up steam",
                url="https://www.cfobrew.com/stories/2026/03/04/pe-backed-public-accounting-consolidation-picks-up-steam",
                source="CFO Brew",
                date=datetime.date(2026, 3, 4),
                summary="PE investment in accountancy has led to a dramatically higher number of roll-up transactions, with fewer than 200 PE investments in accounting firms spawning some 900 subsequent transactions in 2025. The accounting sector is now one of the fastest-consolidating professional services industries.",
                relevance_note="Accounting roll-ups face acute integration challenges — merging partner-driven cultures, standardizing audit methodologies, and retaining talent across dozens of acquired firms.",
            ),
            MarketArticle(
                title="Alpine Closes $3.4B Single-Asset Continuation Transaction",
                url="https://alpineinvestors.com/update/single-asset-continuation-transaction-apex-service-partners/",
                source="Alpine Investors",
                date=datetime.date(2025, 5, 15),
                summary="Alpine Investors closed a $3.4 billion single-asset secondary market transaction to continue investing in Apex Service Partners, the HVAC, plumbing, and electrical services platform that has acquired over 200 companies across 43 states with $2.2B in combined revenue.",
                relevance_note="Apex represents the archetypal PE roll-up at scale — 200+ acquisitions creating enormous organizational complexity. Maintaining service quality and culture across 43 states is exactly the cross-functional alignment challenge McChrystal Group solves.",
            ),
            MarketArticle(
                title="PE Deal Tracker Update: Alan Whitman Plants a Flag in the Private Equity Landscape",
                url="https://cpatrendlines.com/2026/02/16/cornerstone-pe-deal-tracker-pe-update-alan-whitman-plants-a-flag-in-the-private-equity-landscape-2020-2026/",
                source="CPA Trendlines",
                date=datetime.date(2026, 2, 16),
                summary="Year-to-date 2026 has already seen three new PE platform formations and three add-on acquisitions in the accounting space, demonstrating the increasingly complex multi-capability platforms PE firms are building.",
                relevance_note="Multi-capability platform formations create immediate organizational design challenges — different professional cultures, billing models, and client relationships that need to be unified under a common operating model.",
            ),
            MarketArticle(
                title="RIA Sector Poised for PE Growth, Mergers, Breakaways in 2026",
                url="https://www.wealthmanagement.com/ria-news/ria-crystal-ball-reveals-creative-pe-funding-mid-market-mergers-and-big-breakaways",
                source="Wealth Management",
                date=datetime.date(2026, 1, 15),
                summary="PE-backed RIA count rose 16% year-over-year to 295 firms, with total AUM climbing to nearly $6 trillion — representing 23% of all $100M+ RIA assets. The 2025 record of 466 announced transactions is expected to carry forward into 2026.",
                relevance_note="RIA roll-ups face a unique integration challenge: financial advisors are relationship-driven professionals who resist standardization. Retaining advisor talent while building scalable operations is a leadership and culture problem.",
            ),
            MarketArticle(
                title="Private Equity Risks in the Home Services Industry",
                url="https://www.cbh.com/insights/articles/transaction-risks-in-the-home-services-industry/",
                source="Cherry Bekaert",
                date=datetime.date(2026, 1, 20),
                summary="Home services PE roll-ups face significant integration risks including cultural misalignment between acquired entities, technology systems fragmentation, and the challenge of standardizing operations across independently managed local businesses.",
                relevance_note="This article directly identifies the organizational dysfunctions — culture clash, talent attrition, knowledge loss — that McChrystal Group's culture change and cross-functional alignment capabilities address.",
            ),
            MarketArticle(
                title="Accelerated Roll-Up Strategies: Opportunities and Risks",
                url="https://www.crowe.com/insights/accelerated-roll-up-strategies-opportunities-and-risks",
                source="Crowe LLP",
                date=datetime.date(2026, 2, 1),
                summary="As PE firms accelerate acquisition pace, post-close integration is becoming the critical bottleneck. Companies that fail to integrate cultures, systems, and leadership teams across rapid acquisitions are seeing value destruction rather than value creation.",
                relevance_note="The shift from deal velocity to integration quality as the primary value driver creates demand for exactly what McChrystal sells — organizational transformation and operating model design.",
            ),
            MarketArticle(
                title="2026 Private Equity Outlook: From recalibration to execution",
                url="https://www.cohnreznick.com/insights/pe-outlook-2026-trends-strategies",
                source="CohnReznick",
                date=datetime.date(2026, 1, 10),
                summary="PE firms are entering 2026 with renewed energy after a two-year recalibration period. The outlook emphasizes that operational value creation — not financial engineering — is now the primary return driver.",
                relevance_note="The industry-wide pivot from financial engineering to operational value creation opens a direct engagement path for McChrystal Group with PE operating partners.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Post-Merger Integrations",
        category=SectorCategory.niche,
        overview="2026 is seeing a wave of major mergers entering the critical integration phase, with several landmark deals closed in late 2025 and early 2026 now testing whether promised synergies can be realized. The $35B Capital One-Discover merger is navigating a complex network migration with $4.3B in integration costs exceeding original estimates. Fifth Third completed its $12.3B acquisition of Comerica in February 2026 to become the 9th largest US bank, facing systems conversion and culture integration. The SpaceX-xAI merger — the largest in history — is experiencing co-founder departures and culture clashes. Google's $32B Wiz acquisition closed March 11, 2026, beginning the challenge of integrating a startup into a 180,000-person enterprise.",
        key_trends=[
            "Banking mega-mergers creating integration complexity at scale — Fifth Third/Comerica ($12.3B), Huntington/Cadence ($7.4B), and Capital One/Discover ($35B) all in active integration phases simultaneously",
            "Integration costs consistently exceeding estimates — Capital One's integration costs ballooned from $2.8B to $4.3B+, highlighting persistent underestimation of organizational complexity",
            "Tech acquisitions testing culture integration — Google/Wiz ($32B) and SpaceX/xAI ($1.25T) both face the classic startup-into-enterprise integration challenge",
            "Systems conversion as a critical risk moment — Fifth Third planning Labor Day weekend for Comerica systems conversion, Capital One migrating cards to Discover Network",
            "Cross-industry M&A accelerating — PwC and KPMG both project continued deal flow in 2026, with financial services, technology, and healthcare as most active sectors",
        ],
        mcchrystal_angle="Post-merger integration is perhaps the single highest-value application of McChrystal Group's capabilities. Every major merger creates the conditions McChrystal was built to address: two organizations with different cultures, leadership styles, and operating models forced to function as one entity under time pressure, with billions of dollars in synergies at stake. The Team of Teams model directly addresses the #1 integration failure mode — siloed organizations that cannot achieve shared consciousness across legacy boundaries. McChrystal's crisis leadership expertise maps to the high-stakes, time-pressured nature of systems conversions and Day 1 readiness.",
        articles=[
            MarketArticle(
                title="Capital One (COF) Earnings Reflect Discovery Acquisition Success",
                url="https://markets.financialcontent.com/stocks/article/marketminute-2026-3-11-capital-one-cof-earnings-reflect-discovery-acquisition-success",
                source="Market Minute",
                date=datetime.date(2026, 3, 11),
                summary="Capital One's first full year of combined operations with Discover shows integration yielding synergies faster than projected, but integration costs surpassed the original $2.8B estimate with a $4.3B second-quarter loss.",
                relevance_note="Capital One's integration cost overrun ($2.8B to $4.3B+) signals organizational complexity was underestimated. The network migration requires the kind of cross-functional coordination McChrystal specializes in.",
            ),
            MarketArticle(
                title="Fifth Third Completes Merger with Comerica to Become 9th Largest U.S. Bank",
                url="https://ir.53.com/news/news-details/2026/Fifth-Third-Completes-Merger-with-Comerica-to-Become-9th-Largest-U-S--Bank/default.aspx",
                source="Fifth Third Bancorp",
                date=datetime.date(2026, 2, 2),
                summary="Fifth Third completed its $12.3 billion acquisition of Comerica, creating the 9th largest US bank with a 35% increase in total assets. Systems conversion planned for Labor Day weekend 2026.",
                relevance_note="A 35% asset increase and Labor Day systems conversion create a 6-month window of intense organizational stress — exactly the kind of integration challenge McChrystal addresses.",
            ),
            MarketArticle(
                title="Huntington Bank Completes Merger with Cadence Bank",
                url="https://www.prnewswire.com/news-releases/huntington-bank-completes-merger-with-cadence-bank-expanding-presence-across-texas-and-the-south-302676243.html",
                source="PR Newswire",
                date=datetime.date(2026, 2, 2),
                summary="Huntington Bancshares completed its $7.4 billion merger with Cadence Bank, becoming the 8th largest bank in Texas. Systems conversion expected mid-2026.",
                relevance_note="Geographic expansion into Texas and the South means integrating teams with different market cultures — a high-stakes moment where McChrystal's crisis leadership applies.",
            ),
            MarketArticle(
                title="Musk announces xAI re-org following co-founder departures, SpaceX merger",
                url="https://www.cnbc.com/2026/02/11/musk-announces-xai-re-org-following-key-departures-spacex-merger.html",
                source="CNBC",
                date=datetime.date(2026, 2, 11),
                summary="Following the SpaceX-xAI merger, multiple xAI co-founders departed. Musk announced an xAI reorganization as the company navigates culture clashes between xAI's flat startup culture and SpaceX's more structured engineering organization.",
                relevance_note="The largest merger in history is experiencing textbook post-merger failure patterns — key talent departing due to culture clash. The flat-hierarchy-meets-structured-hierarchy dynamic is what McChrystal's Team of Teams model resolves.",
            ),
            MarketArticle(
                title="Google completes $32B acquisition of Wiz",
                url="https://techcrunch.com/2026/03/11/google-completes-32b-acquisition-of-wiz/",
                source="TechCrunch",
                date=datetime.date(2026, 3, 11),
                summary="Google completed its $32 billion acquisition of cloud security startup Wiz, its largest acquisition ever. Wiz will maintain its brand and continue providing security solutions across AWS, Azure, and Oracle Cloud.",
                relevance_note="The Google/Wiz integration presents the classic scale-vs-agility tension — maintaining startup independence while embedding within a 180,000-person enterprise is a Team of Teams problem.",
            ),
            MarketArticle(
                title="The Era of the Mega-Regional: Fifth Third Bancorp Finalizes $12.3 Billion Acquisition of Comerica",
                url="https://www.financialcontent.com/article/marketminute-2026-2-16-the-era-of-the-mega-regional-fifth-third-bancorp-finalizes-123-billion-acquisition-of-comerica",
                source="Market Minute",
                date=datetime.date(2026, 2, 16),
                summary="The Fifth Third-Comerica merger signals a new era of 'mega-regional' banking. The integration challenge centers on maintaining Comerica's specialized industry expertise while achieving the 9% EPS boost promised by 2027.",
                relevance_note="The mega-regional banking trend will produce more integrations requiring preserved specialization with scale — a nuanced organizational design challenge McChrystal addresses.",
            ),
            MarketArticle(
                title="2026 M&A trends and solutions for financial institutions",
                url="https://www.wtwco.com/en-us/insights/2026/02/the-2026-m-and-a-landscape-for-financial-institutions",
                source="WTW",
                date=datetime.date(2026, 2, 1),
                summary="WTW identifies talent retention, cultural integration, and technology migration as the three highest-risk elements of post-merger integration, noting key executives may depart amid uncertainty.",
                relevance_note="WTW's identification of talent, culture, and organizational complexity as the top integration risks validates McChrystal's value proposition in financial services M&A.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Defense Consolidation",
        category=SectorCategory.niche,
        overview="The defense sector is undergoing simultaneous consolidation and disruption in 2026, driven by surging global defense budgets (European NATO spending up 12.6%), DOGE-driven Pentagon restructuring forcing organizational upheaval, and the rapid rise of defense tech disruptors like Anduril ($60B valuation) challenging traditional prime contractors. The Pentagon's first-ever independent AI budget line of $13.4 billion in FY2026 is accelerating capability-driven M&A. Meanwhile, DOGE cuts have terminated 390+ contracts and plan to reduce the Pentagon civilian workforce by 50,000-60,000. European defense consolidation could unlock 9 billion euros in annual cost synergies but requires overcoming deep national fragmentation.",
        key_trends=[
            "DOGE cuts creating organizational chaos — 390+ contracts terminated, 50,000-60,000 civilian workforce reductions planned, critical Pentagon IT units hobbled",
            "European defense spending surge driving consolidation — 12.6% increase in 2025, new NATO target of 5% GDP by 2035, projected 300B euro increase by 2030",
            "Defense tech disruptors forcing prime contractor adaptation — Anduril ($60B valuation), Shield AI ($5.3B), Palantir/Anduril consortium challenging traditional acquisition models",
            "Pentagon's $13.4B AI budget line creating new acquisition dynamics — largest single-year AI investment in US defense history",
            "Mid-tier defense firms consolidating for scale — Ondas/Mistral merger giving drone company prime contractor status; PE funds deploying record capital into defense carve-outs",
        ],
        mcchrystal_angle="Defense consolidation is McChrystal Group's home turf — General McChrystal's transformation of Joint Special Operations Command is the origin story of the Team of Teams model. DOGE-driven workforce reductions create exactly the organizational dysfunction McChrystal addressed at JSOC: fewer people, more complexity, higher stakes, and a need for decentralized authority with shared consciousness. Defense contractors navigating the transition from traditional hierarchical program management to agile, AI-native operating models need the cross-functional alignment McChrystal delivers. European defense consolidation requires overcoming national silos to achieve interoperability — a Team of Teams problem at multinational scale.",
        articles=[
            MarketArticle(
                title="DOGE Cuts 'Unexpectedly and Significantly Impacted' Critical Pentagon Unit",
                url="https://theintercept.com/2026/01/19/doge-cuts-pentagon-it-military/",
                source="The Intercept",
                date=datetime.date(2026, 1, 19),
                summary="DOGE-driven staffing cuts hobbled DISA's Command, Control, Communications, and Computers Enterprise Directorate to the point it could not obtain software for maintaining secure channels connecting the Pentagon to military assets worldwide.",
                relevance_note="Crisis-level organizational failure caused by workforce restructuring — precisely the kind of high-stakes situation McChrystal's crisis leadership expertise was built for.",
            ),
            MarketArticle(
                title="DOGE drives civil sector slowdown; defense contractors gear up as Trump's budget shifts billions to military priorities",
                url="https://tbri.com/blog/doge-drives-civil-sector-slowdown-defense-contractors-gear-up-as-trumps-budget-shifts-billions-to-military-priorities/",
                source="TBRI",
                date=datetime.date(2026, 2, 20),
                summary="DOGE cuts are creating a bifurcated defense market: civilian-facing segments contracting while military-facing segments expand. Contractors must simultaneously manage contraction in one segment and growth in another.",
                relevance_note="The bifurcated market creates the organizational paradox McChrystal specializes in — simultaneous contraction and expansion requiring adaptive organizational design.",
            ),
            MarketArticle(
                title="The Great Consolidation Is Back: Why 2026 Is Shaping Up as a 'Mega-Deal Year' for Aerospace & Defence",
                url="https://aero-space.eu/2026/01/03/the-great-consolidation-is-back-why-2026-is-shaping-up-as-a-mega-deal-year-for-aerospace-defence/",
                source="Aero-Space.eu",
                date=datetime.date(2026, 1, 3),
                summary="2026 is being characterized as a potential mega-deal year for aerospace and defense, with eight megadeals exceeding $10 billion completed globally in Q3 2025 alone — the highest quarterly figure since 2018.",
                relevance_note="Mega-deals create mega-integration challenges. Every large defense merger forces combination of classified programs, security-cleared workforces, and complex government relationships.",
            ),
            MarketArticle(
                title="Ondas Reaches Merger Agreement with U.S. Defense Prime Contractor Mistral Inc.",
                url="https://finance.yahoo.com/news/ondas-reaches-merger-agreement-u-130000873.html",
                source="Yahoo Finance",
                date=datetime.date(2026, 3, 11),
                summary="Drone and autonomous systems company Ondas Holdings reached a merger agreement with Mistral Inc., a U.S. defense prime contractor with over $1 billion in existing DoD contract vehicles.",
                relevance_note="Mid-tier defense consolidation creates integration challenges between tech-native startups and traditional defense contractors — different cultures, security requirements, and operating tempos.",
            ),
            MarketArticle(
                title="Opportunities through consolidation in the European defense industry",
                url="https://www.mckinsey.com/industries/aerospace-and-defense/our-insights/opportunities-through-consolidation-in-the-european-defense-industry",
                source="McKinsey & Company",
                date=datetime.date(2026, 2, 15),
                summary="European defense spending is projected to reach 800 billion euros by 2030, but the industry remains deeply fragmented along national lines. McKinsey estimates supply chain consolidation could unlock 9 billion euros in annual cost synergies.",
                relevance_note="European defense consolidation is a Team of Teams problem at multinational scale — national defense industries must achieve shared consciousness while preserving sovereign capabilities.",
            ),
            MarketArticle(
                title="Aerospace and defense: US Deals 2026 outlook",
                url="https://www.pwc.com/us/en/industries/industrial-products/library/aerospace-defense-deals-outlook.html",
                source="PwC",
                date=datetime.date(2026, 1, 15),
                summary="PwC's 2026 defense M&A outlook highlights proliferating collaborations in AI, cyber, autonomy, and electronic warfare, with prime contractors favoring minority stakes, JVs, and targeted tuck-ins.",
                relevance_note="The shift to JVs and minority stakes creates coordination-without-control challenges — McChrystal's Team of Teams model maps perfectly to JV-style defense consolidation.",
            ),
            MarketArticle(
                title="Europe boosts military spending as global defense budgets continue to grow",
                url="https://www.stripes.com/theaters/europe/2026-02-25/global-defense-spending-20870512.html",
                source="Stars and Stripes",
                date=datetime.date(2026, 2, 25),
                summary="European military spending rose 12.6% in 2025, with NATO allies committing to a new 5% of GDP benchmark for defense spending by 2035, up from the previous 2% target.",
                relevance_note="Surging European defense budgets create organizational scaling challenges — defense ministries must rapidly absorb increased funding and integrate with NATO allies.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Healthcare M&A",
        category=SectorCategory.niche,
        overview="Healthcare M&A is rebounding sharply in 2026 after a slower 2025, driven by private equity dry powder, stabilizing interest rates, and AI-enabled platform acquisitions. Deal value hit $46 billion in 2025, but activity is accelerating with mega-deals like Danaher's $9.9B acquisition of Masimo and the $23.7B Walgreens take-private by Sycamore Partners. Private equity is shifting focus from reimbursement-exposed assets toward software, AI telehealth platforms, and revenue cycle management tools. Hospital-to-hospital mergers are resuming as health systems gain clarity on federal policy.",
        key_trends=[
            "Private equity healthcare dealmaking hit record $191B in disclosed deal value in 2025, setting stage for aggressive 2026 deployment in home health, behavioral health, and AI-enabled care platforms",
            "Hospital M&A rebounding after 2025 slowdown (only 46 deals), with Q4 2025 surge including four mergers exceeding $1B in annual revenue per party",
            "AI-based acquisitions accelerating — buyers targeting telehealth platforms, revenue cycle management, workforce optimization as core margin expansion plays",
            "Take-private mega-deals dominating: Walgreens ($23.7B by Sycamore), Hologic ($18.3B by Blackstone/TPG)",
            "Regulatory environment easing with return to traditional antitrust approach, though PE deals and physician practice consolidation face increased scrutiny",
        ],
        mcchrystal_angle="Healthcare M&A creates acute organizational complexity — integrating clinical cultures, navigating physician autonomy vs. corporate standardization, and building cross-functional alignment between legacy health systems and newly acquired platforms. PE-backed healthcare roll-ups face the classic Team of Teams challenge: decentralized clinical operations that must coordinate on shared infrastructure without crushing clinical autonomy. Post-merger integration in healthcare is uniquely high-stakes — patient safety, regulatory compliance, and workforce retention all depend on leadership alignment and culture change.",
        articles=[
            MarketArticle(
                title="Danaher To Acquire Masimo Corporation",
                url="https://investors.danaher.com/2026-02-17-Danaher-To-Acquire-Masimo-Corporation",
                source="Danaher",
                date=datetime.date(2026, 2, 17),
                summary="Danaher announced a definitive agreement to acquire Masimo for $9.9B total enterprise value. Masimo will become a standalone operating company within Danaher's Diagnostics segment alongside Radiometer, Leica Biosystems, Cepheid, and Beckman Coulter.",
                relevance_note="Danaher's integration of Masimo into an already complex multi-brand diagnostics portfolio creates significant organizational design challenges — coordinating five standalone operating companies within one segment.",
            ),
            MarketArticle(
                title="Signed and Scrubbed: February 2026 hospital M&A",
                url="https://www.healthcare-brew.com/stories/2026/03/04/signed-scrubbed-february-2026-hospital-mergers-acquisitions",
                source="Healthcare Brew",
                date=datetime.date(2026, 3, 4),
                summary="Monthly roundup of February 2026 hospital M&A activity, including Community Health Systems' divestiture of three Pennsylvania hospitals and UConn Health's acquisition of 225-bed Waterbury Hospital.",
                relevance_note="Hospital divestitures and acquisitions by non-traditional buyers create leadership vacuum and culture clash scenarios where McChrystal's crisis leadership applies.",
            ),
            MarketArticle(
                title="Healthcare M&A projected to grow in 2026",
                url="https://www.healthcarefinancenews.com/news/healthcare-ma-projected-grow-2026",
                source="Healthcare Finance News",
                date=datetime.date(2026, 2, 10),
                summary="Healthcare M&A is projected to accelerate in 2026, driven by stabilizing interest rates, accumulated PE dry powder, and sustained demographic demand. Health system M&A rebounded in Q4 2025 with 17 announced transactions.",
                relevance_note="The projected wave of healthcare deals means more organizations entering the turbulent post-merger integration phase where leadership alignment and culture integration become critical.",
            ),
            MarketArticle(
                title="Hospital, private equity M&A expected to rise in 2026",
                url="https://www.modernhealthcare.com/providers/mh-hospital-private-equity-mergers-acquisitions-2026/",
                source="Modern Healthcare",
                date=datetime.date(2026, 1, 27),
                summary="Hospital and PE M&A is expected to increase in 2026 as healthcare leaders gain clarity on federal policy under the Trump administration. Merger talks have accelerated.",
                relevance_note="PE-backed hospital roll-ups face unique organizational challenges — balancing financial discipline with clinical autonomy across geographically distributed systems.",
            ),
            MarketArticle(
                title="The 2026 Healthcare M&A Forecast: Private Equity's Next Wave",
                url="https://www.stoneridgepartners.com/2026/01/14/2026-healthcare-ma-forecast-private-equity/",
                source="Stoneridge Partners",
                date=datetime.date(2026, 1, 14),
                summary="PE investors are pivoting toward home health and behavioral health platforms as the next consolidation frontier, driven by favorable reimbursement trends and demographic tailwinds.",
                relevance_note="Home health and behavioral health roll-ups represent a new PE consolidation wave with extreme operational complexity — distributed workforces, regulatory variation by state, and clinician retention challenges.",
            ),
            MarketArticle(
                title="Key trends that will shape healthcare M&A activity in 2026: PwC",
                url="https://www.fiercehealthcare.com/finance/key-trends-will-shape-healthcare-ma-activity-2026-pwc",
                source="Fierce Healthcare",
                date=datetime.date(2026, 2, 4),
                summary="PwC identifies AI-enabled platforms, cross-border dealmaking, and health system portfolio rationalization as the key forces shaping 2026 healthcare M&A.",
                relevance_note="Portfolio rationalization and AI platform integration signal organizations navigating simultaneous transformation on multiple fronts — the exact VUCA environment where McChrystal's model creates value.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Energy Transition",
        category=SectorCategory.niche,
        overview="The energy transition sector in early 2026 is defined by a collision of forces: surging power demand from AI data centers, geopolitical shock from the Iran conflict driving oil above $100/barrel, and a massive wave of utility M&A as companies race to secure generation and grid assets. U.S. data center demand is projected to reach 75.8 GW in 2026, nearly tripling to 134 GW by 2030, while utilities face a projected 49 GW shortfall. Energy M&A deal value surged nearly fivefold in 2025 to $142B, and 2026 is seeing continued mega-deals as companies seek scale.",
        key_trends=[
            "AI data center power demand creating a generation capacity crisis — U.S. electricity consumption projected to rise from 4,110B kWh in 2024 to 4,260B kWh in 2026",
            "Iran conflict disrupting 20% of global oil supplies through Strait of Hormuz closure, oil past $100/barrel for first time since 2022",
            "Utility M&A accelerating: Engie's $14.2B acquisition of UK Power Networks, Constellation's $29B acquisition of Calpine, NRG's $12.5B purchase of LS Power",
            "Policy shifts recalibrating incentives away from renewables toward conventional generation and grid infrastructure",
            "EU mobilizing massive clean energy investment — $660B annually needed through 2030",
        ],
        mcchrystal_angle="Energy companies are navigating simultaneous transformation vectors — integrating acquired assets, building new capabilities for AI/data center customers, managing geopolitical supply disruptions, and redesigning grid operations. These are quintessential VUCA environments requiring the cross-functional alignment, decentralized authority, and shared consciousness McChrystal Group enables. The sector's massive M&A wave means dozens of newly combined utilities face post-merger integration challenges of unifying operational cultures, safety systems, and regulatory compliance.",
        articles=[
            MarketArticle(
                title="Iran war threatens prolonged impact on energy markets as oil prices rise",
                url="https://www.aljazeera.com/news/2026/3/8/iran-war-threatens-prolonged-impact-on-energy-markets-as-oil-prices-rise",
                source="Al Jazeera",
                date=datetime.date(2026, 3, 8),
                summary="The U.S.-Israeli conflict with Iran has disrupted 20% of global oil supplies through the closure of the Strait of Hormuz, pushing oil prices past $100/barrel. The IEA warned this constitutes the largest supply disruption in oil market history.",
                relevance_note="Energy market crisis creates urgent need for crisis leadership and rapid organizational adaptation — exactly the high-stakes environment where McChrystal Group's capabilities differentiate.",
            ),
            MarketArticle(
                title="Engie Jumps After £10.5 Billion Deal to Buy UK Power Networks",
                url="https://www.energyconnects.com/news/gas-lng/2026/february/engie-jumps-after-105-billion-deal-to-buy-uk-power-networks/",
                source="Energy Connects",
                date=datetime.date(2026, 2, 26),
                summary="French utility Engie announced the acquisition of UK Power Networks from CK Infrastructure for £10.5B ($14.2B), its largest acquisition to date, positioning Engie as a major player in UK electricity distribution.",
                relevance_note="Cross-border utility mega-acquisitions create massive integration challenges — different regulatory frameworks, operating cultures, and safety systems.",
            ),
            MarketArticle(
                title="Energy Markets Race to Solve the AI Power Bottleneck",
                url="https://www.morganstanley.com/insights/articles/powering-ai-energy-market-outlook-2026",
                source="Morgan Stanley",
                date=datetime.date(2026, 2, 18),
                summary="Morgan Stanley analysis of how energy markets are adapting to surging AI data center demand, with utilities facing a projected 49 GW shortfall in available power access by 2028.",
                relevance_note="The convergence of tech and energy creates unprecedented cross-industry organizational challenges — utilities must build new capabilities to serve hyperscaler customers while managing legacy regulated operations.",
            ),
            MarketArticle(
                title="The Energy Transition in 2026: 10 Trends to Watch",
                url="https://rmi.org/the-energy-transition-in-2026-10-trends-to-watch/",
                source="RMI",
                date=datetime.date(2026, 1, 15),
                summary="RMI's annual outlook identifies key forces shaping energy transition in 2026, including the tension between accelerating clean energy deployment and policy shifts toward conventional generation.",
                relevance_note="Organizations navigating competing strategic imperatives face the kind of complex tradeoff management that McChrystal's cross-functional alignment model helps leaders navigate.",
            ),
            MarketArticle(
                title="2026 Predictions: AI Sparks Data Center Power Revolution",
                url="https://www.datacenterknowledge.com/operations-and-management/2026-predictions-ai-sparks-data-center-power-revolution",
                source="Data Center Knowledge",
                date=datetime.date(2026, 1, 8),
                summary="AI workloads scaling from pilots to production will test the limits of data center energy infrastructure in 2026, forcing data center operators and utilities to innovate on energy sourcing, storage, and efficiency.",
                relevance_note="Data center operators and utilities being forced into cross-functional collaboration they never planned for — McChrystal's Team of Teams model is purpose-built for this.",
            ),
            MarketArticle(
                title="Leidos to acquire power design firm ENTRUST",
                url="https://www.prnewswire.com/news-releases/leidos-to-acquire-power-design-firm-entrust-bolstering-its-energy-infrastructure-portfolio-302669349.html",
                source="PR Newswire",
                date=datetime.date(2026, 1, 28),
                summary="Leidos signed a definitive agreement to acquire ENTRUST Solutions Group for approximately $2.4B, accelerating its position as a leading engineering solutions provider for utilities.",
                relevance_note="Leidos is a defense/government contractor expanding into energy through acquisition — the cross-industry pivot creates organizational identity and culture integration challenges.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Tech Spinoffs & Carve-outs",
        category=SectorCategory.niche,
        overview="Corporate carve-outs are set to define global M&A in 2026 as boards simplify portfolios under geopolitical pressure and AI disruption. KPMG's survey of 700 M&A decision-makers shows 57% of corporate dealmakers and 71% of PE firms are actively pursuing portfolio rationalization. Technology is the most targeted sector (43% of dealmakers). Honeywell's three-way breakup (filing Form 10 for Aerospace spinoff in March 2026) exemplifies the trend, while the TikTok US spinoff represents a new category of geopolitically-forced corporate separation.",
        key_trends=[
            "KPMG survey shows 57% of corporates and 71% of PE firms pursuing portfolio rationalization; 51% expect carve-out activity to rise moderately to significantly",
            "Technology most targeted sector (43% of dealmakers), with 48% of tech CEOs planning a divestiture in next 12 months",
            "Honeywell advancing three-way breakup: Aerospace unit filed Form 10 in March 2026, $16B senior notes offering launched, Q3 2026 spinoff target",
            "TikTok US spinoff completed January 2026 — ByteDance retained 19.9% stake, 80.1% transferred to American/global investors at $14B valuation",
            "AI disruption accelerating carve-out decisions: technology disentanglement and 'spaghetti architecture' identified as most demanding execution challenge",
        ],
        mcchrystal_angle="Carve-outs and spinoffs are among the most organizationally complex transactions in business — they require untangling shared services, separating technology platforms, standing up independent leadership teams, and building new operating cultures from scratch, all while maintaining business continuity. The 2026 surge creates a target-rich environment for McChrystal Group: every carve-out produces two organizations in simultaneous transformation. The 'spaghetti architecture' problem is fundamentally an organizational design challenge, not just a technical one.",
        articles=[
            MarketArticle(
                title="Carve-Outs Take Center Stage in M&A in 2026, KPMG Survey Shows",
                url="https://www.bloomberg.com/news/articles/2026-02-11/carve-outs-take-center-stage-in-m-a-in-2026-kpmg-survey-shows",
                source="Bloomberg",
                date=datetime.date(2026, 2, 11),
                summary="KPMG's Global M&A Outlook 2026 finds carve-outs will define global M&A as boards simplify portfolios. 57% of corporate dealmakers and 71% of PE firms are pursuing portfolio rationalization, with technology as the most targeted sector.",
                relevance_note="KPMG data validates carve-outs as a massive pipeline opportunity — every carve-out creates two organizations needing leadership alignment and operating model design.",
            ),
            MarketArticle(
                title="Honeywell Announces Filing of Form 10 for Planned Spin-Off of Honeywell Aerospace",
                url="https://www.honeywell.com/us/en/press/2026/03/honeywell-announces-filing-of-form-10-registration-statement-for-planned-spin-off-of-honeywell-aerospace",
                source="Honeywell",
                date=datetime.date(2026, 3, 3),
                summary="Honeywell filed its Form 10 for the planned spinoff of Honeywell Aerospace, which generated $17.4B in net sales and $4.3B pro forma EBIT in 2025. The spinoff is targeted for Q3 2026.",
                relevance_note="Honeywell's three-way breakup is one of the largest corporate separations in years — standing up three independent companies is an organizational design challenge that maps directly to McChrystal capabilities.",
            ),
            MarketArticle(
                title="The deal to secure TikTok's future in the US has finally closed",
                url="https://www.cnn.com/2026/01/22/tech/tiktok-us-deal-closes",
                source="CNN Business",
                date=datetime.date(2026, 1, 22),
                summary="TikTok's US spinoff closed as ByteDance transferred 80.1% of US operations to American and global investors while retaining 19.9%, valuing the business at $14B. The new entity must retrain TikTok's algorithm on US data.",
                relevance_note="TikTok US spinoff is a novel case of geopolitically-mandated corporate separation under extreme time pressure — the cross-functional coordination demands are enormous.",
            ),
            MarketArticle(
                title="Divestitures and carve-outs: Untangling spaghetti",
                url="https://www.citrix.com/blogs/2026/02/17/divestitures-and-carve-outs-untangling-spaghetti",
                source="Citrix",
                date=datetime.date(2026, 2, 17),
                summary="Analysis identifying 'spaghetti architecture' (commingled technology systems) as the most demanding challenge in carve-outs. Technology separation and stranded cost management are consistently underestimated.",
                relevance_note="The spaghetti architecture problem is about cross-functional coordination — IT, finance, operations, and business units must align on separation priorities. McChrystal's shared consciousness model directly addresses this.",
            ),
            MarketArticle(
                title="Enterprise software carve-out strategies",
                url="https://www.ey.com/en_us/insights/tech-sector/enterprise-software-carve-out-strategies",
                source="EY",
                date=datetime.date(2026, 1, 20),
                summary="EY analysis finding that successful software divestitures can turn TSR laggards into leaders. Key requirements include software disentanglement, pricing model alignment, and streamlined operations.",
                relevance_note="Enterprise software carve-outs require simultaneous transformation across technology, pricing, operations, and talent — demanding the adaptive operating model McChrystal Group builds.",
            ),
            MarketArticle(
                title="Honeywell Advances Breakup Plan As Aerospace Unit Files To Go Solo",
                url="https://www.benzinga.com/markets/large-cap/26/03/51005977/honeywell-advances-breakup-plan-as-aerospace-unit-files-to-go-solo",
                source="Benzinga",
                date=datetime.date(2026, 3, 6),
                summary="Honeywell advanced its breakup plan with the Aerospace unit launching a $16B senior notes offering. The filing provided detailed financial projections for the three independent companies.",
                relevance_note="The $16B debt offering adds financial complexity to the separation — new capital structures require new governance and risk management capabilities to be built from scratch.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Government Transformation",
        category=SectorCategory.niche,
        overview="The federal government is undergoing the most dramatic organizational restructuring in modern history, driven by DOGE-initiated workforce reductions that eliminated over 300,000 federal employees and ongoing agency consolidation mandated by executive order. Agencies like GSA (down 40%), EPA (down 25%), and the Education Department (down 69%) are scrambling to rebuild operational capacity through AI tools and selective hiring. The USAID merger into the State Department — losing 97% of its staff — stands as the most extreme example of organizational disruption. The White House has reaffirmed that continued workforce reduction remains 'priority number one.'",
        key_trends=[
            "Agencies deploying AI and automation tools to compensate for massive workforce losses, with GSA standing up an Office of Digital Finance to centralize process optimization",
            "Schedule Policy/Career conversions transforming thousands of civil servants into at-will employees, fundamentally changing employment relationships and organizational culture",
            "Senior Executive Service reduced 9.4%, creating a leadership vacuum between political appointees and career staff",
            "Agency reorganization plans consolidating functions — Interior Department moving bureau employees into the Office of the Secretary, State Department absorbing USAID",
            "Federal union membership collapsed from 56.2% to 37.9%, reshaping labor-management dynamics across government",
        ],
        mcchrystal_angle="This is a once-in-a-generation opportunity for McChrystal Group. Federal agencies face the exact organizational challenges McChrystal specializes in: rebuilding operational capacity with fewer people requires the kind of cross-functional alignment and shared consciousness that defined JSOC. Agencies must redesign workflows, flatten hierarchies out of necessity, and develop leaders who can operate in radical uncertainty. The 'chilling effect' on career leadership is a textbook trust and culture problem. McChrystal Group's crisis leadership and organizational design capabilities map directly to helping agencies that must do more with dramatically less.",
        articles=[
            MarketArticle(
                title="After deep staffing cuts, agencies seek mix of hiring and AI tools to rebuild capacity",
                url="https://federalnewsnetwork.com/workforce/2026/03/after-deep-staffing-cuts-agencies-seek-mix-of-hiring-and-ai-tools-to-rebuild-capacity/",
                source="Federal News Network",
                date=datetime.date(2026, 3, 9),
                summary="Over 386,000 federal employees have departed under the Trump administration. Agencies like GSA (down 40%) and EPA (down 25%) are adopting AI tools to optimize remaining staff rather than relying solely on hiring.",
                relevance_note="Agencies rebuilding operational capacity with fewer people is a direct McChrystal Group engagement scenario — organizational redesign, workflow optimization, and leadership development for managers navigating radical change.",
            ),
            MarketArticle(
                title="Continuing to shed federal workers remains 'priority number one,' White House official says",
                url="https://www.govexec.com/workforce/2026/03/continuing-shed-federal-workers-remains-priority-number-one-white-house-official-says/411907/",
                source="Government Executive",
                date=datetime.date(2026, 3, 5),
                summary="OMB Deputy Director Eric Ueland reaffirmed workforce reduction as the administration's top priority, with over 300,000 federal employees already eliminated. The administration is pushing agencies toward AI and system consolidation.",
                relevance_note="Sustained organizational disruption creates ongoing demand for advisory firms that can help agencies redesign operations — McChrystal Group's crisis leadership capabilities are directly relevant.",
            ),
            MarketArticle(
                title="The tail wagging the dog: Snapshots of the public service a year into the second Trump administration",
                url="https://www.govexec.com/workforce/2026/02/tail-wagging-dog-snapshots-public-service-year-second-trump-administration/411224/",
                source="Government Executive",
                date=datetime.date(2026, 2, 5),
                summary="Comprehensive analysis showing a 9% civilian workforce reduction (209,775 employees), with cuts ranging from minimal at DHS to 69% at the Department of Education. Senior Executive Service reduced 9.4%.",
                relevance_note="The SES leadership vacuum and union membership collapse signal deep organizational culture disruption — the kind of trust-rebuilding and leadership development challenge McChrystal Group addresses.",
            ),
            MarketArticle(
                title="Former USAID employees mark one year since major agency cuts",
                url="https://federalnewsnetwork.com/workforce/2026/02/former-usaid-employees-mark-one-year-since-major-agency-cuts/",
                source="Federal News Network",
                date=datetime.date(2026, 2, 1),
                summary="One year after USAID was effectively dismantled and merged into the State Department, losing 97% of its staff, former employees reflect on the organizational impact.",
                relevance_note="The USAID-State merger is the most extreme case of forced organizational integration in recent federal history — a potential case study and engagement opportunity for McChrystal Group.",
            ),
            MarketArticle(
                title="How staffing cuts in 2025 transformed the federal workforce",
                url="https://federalnewsnetwork.com/workforce/2026/01/how-staffing-cuts-in-2025-transformed-the-federal-workforce/",
                source="Federal News Network",
                date=datetime.date(2026, 1, 15),
                summary="Analysis of how the 2025 workforce reductions fundamentally changed the composition and culture of the federal workforce, with OPM reporting approximately 352,000 employee exits.",
                relevance_note="The scale of workforce transformation represents a multi-year organizational challenge that advisory firms with organizational design expertise can help navigate.",
            ),
            MarketArticle(
                title="2026 Government Agencies Trends",
                url="https://guidehouse.com/insights/trends-guide/2026/government-agencies",
                source="Guidehouse",
                date=datetime.date(2026, 1, 10),
                summary="Federal agencies are accelerating AI adoption but with uneven maturity across departments, while leaders embrace integrated, centralized support structures to streamline procurement and administrative functions.",
                relevance_note="Uneven AI maturity and centralization efforts create organizational design challenges that require cross-functional alignment — a core McChrystal Group capability.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Sports & Entertainment Ownership",
        category=SectorCategory.niche,
        overview="Professional sports ownership is in the midst of a historic reshuffling driven by record-breaking franchise valuations, loosened private equity rules across all major leagues, and a generational transfer of wealth. The Seattle Seahawks have formally begun their sale process following Super Bowl LX, with expectations of surpassing the $10 billion Lakers sale record. The NBA has further liberalized PE ownership rules, the NFL is seeing its first PE minority stakes close, and tech-sector ownership has surged from 6% to 20% of major franchise holders since 2022. Front offices are experiencing massive coaching and leadership turnover.",
        key_trends=[
            "Record franchise valuations creating unprecedented ownership transition complexity — Lakers at $10B, Seahawks expected to exceed that",
            "Private equity rules loosening across all major leagues, with NBA expanding PE ownership from 5 to 8 teams per fund and NFL closing first 10% stakes",
            "Tech billionaires now controlling 20% of major franchise ownership, bringing Silicon Valley operating philosophies to traditional sports organizations",
            "NFL coaching carousel producing wholesale front office restructurings — Atlanta Falcons fired coach, GM, and CEO simultaneously",
            "Multi-stage ownership transactions becoming standard, requiring sophisticated organizational integration as ownership groups grow larger",
        ],
        mcchrystal_angle="Sports franchise ownership transitions create exactly the organizational complexity McChrystal Group thrives in. New ownership groups — especially PE-backed and tech-operator owners — inherit legacy organizational structures and must transform them into professionally managed, cross-functional enterprises. The Atlanta Falcons' simultaneous firing of coach, GM, and CEO is a textbook organizational reset requiring new leadership alignment and culture rebuilding. McChrystal Group's military-to-sports translation is natural, and veteran owners/executives are common in this space.",
        articles=[
            MarketArticle(
                title="Seattle Seahawks begin sale process after Super Bowl win",
                url="https://www.cnbc.com/2026/02/18/seattle-seahawks-sale-super-bowl.html",
                source="CNBC",
                date=datetime.date(2026, 2, 18),
                summary="The Estate of Paul G. Allen has formally begun the sale process for the Seattle Seahawks following Super Bowl LX victory. The franchise is expected to set a new record, potentially exceeding the $10 billion Lakers sale.",
                relevance_note="A $7-10B franchise sale will bring new ownership that must integrate into an existing organizational structure — new owners typically reshape front office leadership, coaching staff, and operational processes.",
            ),
            MarketArticle(
                title="Why Pro Sports Team Valuations Will Keep Climbing in 2026",
                url="https://frontofficesports.com/pro-sports-team-valuations-rise-2026/",
                source="Front Office Sports",
                date=datetime.date(2026, 1, 4),
                summary="Analysis of structural factors driving record franchise valuations: scarcity, the NBA's new $77 billion media-rights deal, strong historical returns (13.2% annualized), and expanded investor access through PE minority stakes.",
                relevance_note="Rising valuations attract sophisticated institutional investors who demand professional management and organizational optimization — natural buyers of advisory services.",
            ),
            MarketArticle(
                title="From Five to Eight: NBA Further Loosens Private Equity Ownership Rules",
                url="https://www.cliffordchance.com/briefings/2026/01/from-five-to-eight--nba-further-loosens-private-equity-ownership.html",
                source="Clifford Chance",
                date=datetime.date(2026, 1, 15),
                summary="The NBA expanded its PE ownership rules, allowing funds to hold passive equity interests in up to eight teams (up from five). Individual fund ownership of a single franchise remains capped at 20%.",
                relevance_note="PE ownership expansion means more franchises will have institutional investors demanding operational improvements and governance changes — creating advisory engagement opportunities.",
            ),
            MarketArticle(
                title="Atlanta Falcons Staff Tracker: Front Office and Coaching Changes 2026",
                url="https://www.atlantafalcons.com/news/atlanta-falcons-front-office-coaching-staff-tracker-2026",
                source="Atlanta Falcons",
                date=datetime.date(2026, 1, 20),
                summary="The Atlanta Falcons conducted a wholesale organizational restructuring, firing head coach Raheem Morris, GM Terry Fontenot, and CEO Rich McKay simultaneously. They hired Matt Ryan as president of football and Kevin Stefanski as head coach.",
                relevance_note="A simultaneous C-suite/coaching/GM reset is the sports equivalent of a corporate organizational transformation — new leadership alignment and culture rebuilding are exactly what McChrystal Group delivers.",
            ),
            MarketArticle(
                title="February 2026 Sports Investing Report",
                url="https://www.dakota.com/reports-blog/february-2026-sports-investing-report",
                source="Dakota",
                date=datetime.date(2026, 2, 1),
                summary="Monthly report tracking institutional capital flows into professional sports, covering PE minority stakes, media rights valuations, and the growing professionalization of sports franchise management.",
                relevance_note="Institutional investors entering sports demand operational transformation from legacy management structures — McChrystal Group's organizational design work maps directly to this transition.",
            ),
            MarketArticle(
                title="Tech Billionaires Now Own 20% of Pro Sports Teams",
                url="https://nexairi.com/article/Sports/tech-companies-sports-ownership-2026/",
                source="Nexairi",
                date=datetime.date(2026, 1, 22),
                summary="Tech-sector wealth has jumped from 6% of major franchise ownership in 2022 to 20% by 2025. Tech operators view teams as strategic platforms rather than passive investments, bringing data-driven management philosophies.",
                relevance_note="Tech owners bring operational philosophies that clash with traditional sports culture — bridging that gap is a leadership and culture challenge McChrystal Group is built for.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    # ========== GENERAL SECTORS ==========

    MarketSector(
        name="Technology & AI",
        category=SectorCategory.general,
        overview="Enterprise AI in 2026 has hit an inflection point: adoption is surging (worker access to AI rose 50% in 2025) but organizational execution is falling behind. Deloitte's State of AI survey of 3,235 leaders found that while 74% aspire to grow revenue through AI, only 20% are doing so — most organizations remain 'pilot-heavy and deployment-light.' The core bottleneck has shifted from technology to organizational readiness: talent readiness is at just 20%, governance trails at 30%, and only 21% have proper governance for autonomous AI agents despite 75% planning to deploy them.",
        key_trends=[
            "Organizational readiness is the primary AI bottleneck: talent readiness at 20%, governance at 30%, technical infrastructure at 43% (Deloitte 2026 survey)",
            "'Pilot purgatory' persists — productivity gains reported at individual level but fewer organizations have moved beyond experimentation into widespread operationalization",
            "Chief AI Officer role evolving from standalone innovator to cross-functional orchestrator; 38% of companies have appointed a CAIO",
            "Autonomous AI agents becoming the next frontier — 75% of organizations plan to deploy within 2 years, but only 21% have governance in place",
            "Workforce redesign, not just job adjustment, emerging as imperative — roles, skills, and career paths need to be rebuilt AI-native",
        ],
        mcchrystal_angle="The AI transformation challenge in 2026 is fundamentally an organizational design problem, not a technology problem. Deloitte's data shows the gap between AI ambition and execution traces directly to leadership alignment, governance structures, cross-functional coordination, and workforce redesign — all core McChrystal Group capabilities. Organizations stuck in 'pilot purgatory' lack the operating model to scale AI. The CAIO role's evolution into a 'cross-functional orchestrator' mirrors McChrystal's Team of Teams philosophy. Every company deploying autonomous AI agents without governance is creating a crisis-in-waiting.",
        articles=[
            MarketArticle(
                title="Deloitte's State of AI 2026: Why Enterprise Execution Is Falling Behind Adoption",
                url="https://www.hpcwire.com/aiwire/2026/03/04/deloittes-state-of-ai-2026-why-enterprise-execution-is-falling-behind-adoption/",
                source="AIwire / HPCwire",
                date=datetime.date(2026, 3, 4),
                summary="Deloitte's survey of 3,235 senior leaders shows AI adoption accelerating rapidly but data infrastructure, governance, and talent redesign lagging significantly. Only 20% report talent readiness, and just 21% have governance for autonomous AI agents.",
                relevance_note="The execution-adoption gap is an organizational design problem — companies that can't scale AI past pilots need operating model transformation, not more technology investment.",
            ),
            MarketArticle(
                title="Five Trends in AI and Data Science for 2026",
                url="https://sloanreview.mit.edu/article/five-trends-in-ai-and-data-science-for-2026/",
                source="MIT Sloan Management Review",
                date=datetime.date(2026, 1, 15),
                summary="MIT Sloan identifies the shift from experimentation to operationalization as the defining challenge of 2026. Organizations are equipping workers with AI tools but fewer have moved beyond experiments into widespread production.",
                relevance_note="MIT Sloan's focus on operationalization validates that AI transformation is a leadership and organizational challenge — scaling from pilots to production requires cross-functional alignment.",
            ),
            MarketArticle(
                title="From Org Chart to AI-Ready: How to Redesign Roles Without Losing Your Best People",
                url="https://www.themindfinders.com/2026/03/11/from-org-chart-to-ai-ready-how-to-redesign-roles-without-losing-your-best-people/",
                source="MindFinders",
                date=datetime.date(2026, 3, 11),
                summary="Analysis of how organizations should redesign roles and structures for AI, arguing the approach should be AI-native rather than layering AI onto legacy processes. Workforce transformation requires rebuilding career paths.",
                relevance_note="Organizational redesign for AI is a change management and culture challenge — retaining talent while transforming how work gets done requires leadership alignment and trust-building at scale.",
            ),
            MarketArticle(
                title="AI Trends for 2026: Building 'Change Fitness' and Balancing Trade-Offs",
                url="https://www.library.hbs.edu/working-knowledge/ai-trends-for-2026-building-change-fitness-and-balancing-trade-offs",
                source="Harvard Business School",
                date=datetime.date(2026, 1, 22),
                summary="HBS research identifies 'change fitness' — an organization's capacity to continuously adapt — as the critical capability for 2026. Highlights tradeoffs between automation and augmentation, speed and safety.",
                relevance_note="'Change fitness' maps directly to McChrystal's organizational adaptability model — building organizations that can absorb continuous disruption without losing alignment.",
            ),
            MarketArticle(
                title="Action items for AI decision makers in 2026",
                url="https://mitsloan.mit.edu/ideas-made-to-matter/action-items-ai-decision-makers-2026",
                source="MIT Sloan",
                date=datetime.date(2026, 2, 5),
                summary="MIT Sloan framework emphasizing governance, organizational alignment, and workforce transformation are more critical than technology selection. Enterprises where senior leadership actively shapes AI governance achieve greater business value.",
                relevance_note="The finding that senior leadership engagement drives AI business value validates McChrystal's approach — leadership alignment at the top is the prerequisite for organizational transformation.",
            ),
            MarketArticle(
                title="Enterprise Transformation in 2026: CEO Perspectives on AI and Organizational Readiness",
                url="https://bizzdesign.com/blog/2026-enterprise-transformation-outlook-qa-bert-van-der-zwan",
                source="BiZZdesign",
                date=datetime.date(2026, 2, 12),
                summary="CEO perspectives reveal 2026 is the moment to rethink how business runs — redesigning operating models, governance structures, and cross-functional coordination rather than fine-tuning legacy processes.",
                relevance_note="When CEOs acknowledge the organization is the bottleneck, not the technology, it validates the entire McChrystal value proposition.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Financial Services",
        category=SectorCategory.general,
        overview="Financial services in 2026 is experiencing a convergence of deregulation, accelerating M&A, and fintech consolidation. U.S. bank deal volume could double 2025's approximately 181 deals. Santander's $12.3B acquisition of Webster Financial creates a top-10 U.S. retail bank, while Capital One's $5.15B acquisition of Brex represents the largest bank-fintech deal ever. The era of the independent fintech unicorn is giving way to 'the great integration' — large banks consuming fintechs for their AI capabilities and digital-native customer bases.",
        key_trends=[
            "Bank M&A entering rare alignment of favorable conditions: deal volume could double 2025's 181 deals, with faster regulatory approvals",
            "Bank-fintech convergence accelerating: Capital One's $5.15B Brex acquisition, 'the great integration' era replacing independent fintech unicorns",
            "Mega-mergers reshaping competitive landscape: Santander-Webster ($12.3B) creates top-10 U.S. bank, OceanFirst-Flushing ($579M) with Warburg Pincus investment",
            "Deregulation gaining momentum: Basel III endgame softening, digital asset frameworks removing uncertainty, FDIC 'rightsizing regulation'",
            "AI-driven deals dominating fintech M&A: fraud prevention, identity verification, and embedded finance capabilities as primary targets",
        ],
        mcchrystal_angle="Financial services M&A creates enormous organizational complexity — integrating legacy banking cultures with fintech speed, building unified technology platforms, and navigating regulatory complexity. Santander's Webster acquisition requires merging a global European bank's operating model with a U.S. regional bank's culture. Capital One's Brex deal forces a traditional credit card company to absorb a startup's AI-native culture. Every bank merger and fintech acquisition creates the silos-vs-agility tension that McChrystal's Team of Teams model resolves.",
        articles=[
            MarketArticle(
                title="Santander to acquire Webster Bank for $12.2 billion",
                url="https://www.santander.com/en/press-room/press-releases/2026/02/santander-acquires-webster-bank",
                source="Santander",
                date=datetime.date(2026, 2, 3),
                summary="Banco Santander agreed to acquire Webster Financial in a $12.3B cash-and-stock deal, creating a top-10 U.S. retail and commercial bank with $327B in assets and $800M in targeted cost synergies.",
                relevance_note="Cross-border bank mega-merger combining Spanish global bank culture with Connecticut community bank DNA — prime McChrystal engagement territory for post-merger transformation.",
            ),
            MarketArticle(
                title="Capital One is buying startup Brex for $5.15 billion",
                url="https://www.cnbc.com/2026/01/22/capital-one-is-buying-startup-brex-for-5point15-billion-in-credit-card-firms-latest-deal.html",
                source="CNBC",
                date=datetime.date(2026, 1, 22),
                summary="Capital One entered a definitive agreement to acquire Brex, the AI-native corporate card and expense management platform, for $5.15B. The deal is a steep discount to Brex's $12.3B peak private valuation.",
                relevance_note="Capital One absorbing Brex's AI-native startup culture into a regulated banking environment is a textbook culture clash scenario requiring organizational design.",
            ),
            MarketArticle(
                title="The Great Integration: Why 2026 is the Year of the Bank-Fintech Fire Sale",
                url="https://markets.financialcontent.com/stocks/article/marketminute-2026-2-11-the-great-integration-why-2026-is-the-year-of-the-bank-fintech-fire-sale",
                source="Market Minute",
                date=datetime.date(2026, 2, 11),
                summary="Analysis of the structural shift from independent fintechs to bank-fintech integration. Larger banks are consuming fintechs with differentiated AI capabilities in what's being called 'survival of the smartest.'",
                relevance_note="The bank-fintech integration wave creates a massive pipeline of organizations in cultural transformation — every acquisition forces startup DNA into regulated banking structures.",
            ),
            MarketArticle(
                title="M&A in 2026 may put more distance between big, small banks",
                url="https://www.bankingdive.com/news/2026-bank-mergers-acquisitions-outlook-faster-approval-regionals-midterm-elections-buyer-pool/809514/",
                source="Banking Dive",
                date=datetime.date(2026, 2, 18),
                summary="U.S. bank M&A outlook predicts deal volume could double 2025's numbers, with dramatically reduced regulatory approval lag times. Consolidation is widening the gap between large and small banks.",
                relevance_note="Regional bank consolidation pressure creates leadership uncertainty and organizational anxiety — exactly the environment where McChrystal's crisis leadership capabilities help.",
            ),
            MarketArticle(
                title="OceanFirst and Flushing Financial Announce Merger with Warburg Pincus Investment",
                url="https://finance.yahoo.com/news/oceanfirst-financial-corp-flushing-financial-234500786.html",
                source="Yahoo Finance",
                date=datetime.date(2025, 12, 27),
                summary="OceanFirst and Flushing Financial announced a $579M all-stock merger creating a $23B regional bank, backed by a $225M strategic investment from Warburg Pincus.",
                relevance_note="PE-backed bank merger adds private equity governance overlay to already complex post-merger integration — three-way alignment between two bank cultures and a PE investor's value creation timeline.",
            ),
            MarketArticle(
                title="4 banking trends to watch in 2026",
                url="https://www.bankingdive.com/news/2026-banking-trends-artificial-intelligence-ai-mergers-acquisitions-regulation-bank-charters/808818/",
                source="Banking Dive",
                date=datetime.date(2026, 1, 6),
                summary="Banking Dive identifies AI adoption, M&A acceleration, regulatory reset, and new bank charters as the four defining trends for 2026. The convergence of deregulation and technology transformation creates both opportunity and complexity.",
                relevance_note="The convergence of four simultaneous transformation forces creates the multi-vector VUCA environment where McChrystal's organizational adaptability model is most valuable.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Industrial & Manufacturing",
        category=SectorCategory.general,
        overview="U.S. manufacturing is navigating unprecedented uncertainty as tariff policy, reshoring imperatives, workforce shortages, and AI adoption converge simultaneously. Over 24% of manufacturers are actively near-shoring or reshoring production — nearly double last year — yet only 2% have completed the transition. Tariff uncertainty remains the dominant concern for 78% of manufacturers. The workforce crisis is acute: nearly 500,000 manufacturing jobs remain unfilled, with projections of 2 million unfilled by 2033.",
        key_trends=[
            "Tariff uncertainty driving 78% of manufacturers to cite trade policy as primary concern, with input costs rising an average of 5.4%",
            "Reshoring momentum accelerating (24% actively reshoring) but execution lagging — only 2% have completed plans despite 81% of CEOs committing",
            "Nearly 500,000 manufacturing jobs unfilled with 2 million projected unfilled by 2033, creating structural workforce crisis",
            "Agentic AI deployment accelerating across trade analytics, predictive maintenance, and workforce knowledge capture to compensate for labor shortages",
            "Shifting immigration policies threatening the labor pool — immigrant workers filled nearly 1 in 4 U.S. manufacturing production jobs in 2024",
        ],
        mcchrystal_angle="Manufacturing companies attempting to reshore, integrate AI, and rebuild workforces simultaneously face the kind of multi-dimensional organizational challenge that overwhelms traditional hierarchical management. These companies need cross-functional alignment between operations, supply chain, HR, IT, and finance under extreme trade policy uncertainty. McChrystal Group's Team of Teams model is built for this: decentralized execution within shared consciousness. The gap between CEO reshoring ambitions (81%) and execution (2% complete) reveals a classic strategy-to-execution failure that McChrystal's operating model work directly addresses.",
        articles=[
            MarketArticle(
                title="5 manufacturing trends to watch in 2026",
                url="https://www.manufacturingdive.com/news/5-trends-watch-2026-tariffs-uncertainty-ai-workforce-chemical-investments/809109/",
                source="Manufacturing Dive",
                date=datetime.date(2026, 1, 8),
                summary="Comprehensive analysis of forces reshaping U.S. manufacturing: tariff uncertainty, AI integration, workforce skills gaps, chemical sector investments, and evolving PFAS/TSCA regulatory compliance demands.",
                relevance_note="The convergence of tariff uncertainty, AI adoption, and workforce challenges creates organizational complexity that requires cross-functional leadership alignment.",
            ),
            MarketArticle(
                title="2026 Manufacturing Industry Outlook",
                url="https://www.deloitte.com/us/en/insights/industry/manufacturing-industrial-products/manufacturing-industry-outlook.html",
                source="Deloitte Insights",
                date=datetime.date(2025, 12, 15),
                summary="78% of manufacturers cite trade uncertainty as primary concern with input costs projected to rise 5.4%. Highlights agentic AI as essential for competitiveness and a 'build, buy or borrow' workforce planning framework.",
                relevance_note="The workforce planning framework signals organizational transformation needs — manufacturers fundamentally restructuring talent strategies require advisory support.",
            ),
            MarketArticle(
                title="Manufacturing Modernization: Four Trends to Watch in 2026",
                url="https://www.forvismazars.us/forsights/2026/02/manufacturing-modernization-four-trends-to-watch-in-2026",
                source="Forvis Mazars",
                date=datetime.date(2026, 2, 10),
                summary="Analysis of manufacturing modernization including smart manufacturing investment, digital twin adoption, supply chain diversification, and organizational challenges of integrating new technologies into legacy environments.",
                relevance_note="Manufacturing modernization requires organizational change management at scale — integrating new technologies into legacy environments is as much a culture and leadership challenge as a technical one.",
            ),
            MarketArticle(
                title="Manufacturing Labor Shortages in 2026",
                url="https://www.madicorp.com/blog/manufacturing-labor-shortage-2026",
                source="MADI Corp",
                date=datetime.date(2026, 1, 20),
                summary="Deep dive into the structural manufacturing labor shortage with nearly 500,000 jobs unfilled and projections of 2 million by 2033. Modern factories require digital, robotics, and AI skills that current training pipelines cannot supply.",
                relevance_note="The labor shortage is forcing manufacturers to fundamentally redesign how work gets done — organizational redesign and culture change to attract younger workers are McChrystal engagement opportunities.",
            ),
            MarketArticle(
                title="2026 Manufacturing Outlook: Key Economic Drivers",
                url="https://friedmancorp.com/blog/2026-manufacturing-outlook-economic-drivers/",
                source="Friedman Corp",
                date=datetime.date(2026, 1, 5),
                summary="Analysis of the gap between reshoring ambitions (81% of CEOs) and execution (only 2% completed), with tariff-driven cost pressures forcing margin management decisions.",
                relevance_note="The 81% ambition vs. 2% execution gap is a strategy-to-execution failure that McChrystal Group's operating model work directly addresses.",
            ),
            MarketArticle(
                title="Reshoring Reinvented: How Tariffs Are Changing Manufacturing",
                url="https://worldclassind.com/reshoring-reinvented-how-tariffs-are-changing-the-u-s-manufacturing-landscape-heading-into-2026/",
                source="World Class Industries",
                date=datetime.date(2026, 1, 12),
                summary="How tariff policy is accelerating reshoring decisions but creating new organizational complexity as manufacturers must simultaneously build domestic capacity, manage supplier transitions, and retrain workforces.",
                relevance_note="Reshoring requires organizational transformation across operations, HR, finance, and strategy — exactly the cross-functional alignment McChrystal Group enables.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Healthcare Systems",
        category=SectorCategory.general,
        overview="Healthcare M&A is poised for a rebound in 2026 after hitting a 15-year low of just 46 announced hospital deals in 2025. The sector is being reshaped by PE-backed health system failures creating distressed asset acquisitions (Prospect Medical bankruptcy), large system strategic pivots toward ambulatory care (Ascension's $3.9B AmSurg acquisition), and massive executive turnover with 402 leadership changes tracked since mid-December 2025. Financial pressure from tight margins, Medicaid uncertainty, and workforce costs compounds the challenge.",
        key_trends=[
            "Hospital M&A rebounding from 15-year low, with four mergers closing on January 1, 2026 alone and analysts projecting accelerated deal volume",
            "PE-backed health system failures (Prospect Medical bankruptcy, Steward Health aftermath) creating distressed asset acquisitions and regulatory backlash",
            "Ascension's $3.9B AmSurg deal signaling strategic pivot from inpatient to ambulatory care, adding 250+ surgery centers across 34 states",
            "Massive executive turnover — 402 leadership changes tracked since mid-December 2025, including CEO transitions at OSF HealthCare, OU Health, and multiple systems",
            "PE firms shifting from physician practice consolidation toward healthcare IT, AI platforms, and revenue cycle management acquisitions",
        ],
        mcchrystal_angle="Healthcare systems undergoing M&A, executive transitions, and strategic pivots face some of the most complex organizational challenges in any industry. Absorbing distressed assets from bankrupt competitors requires integrating cultures, aligning clinical operations, and rebuilding trust with staff and communities. The sheer volume of leadership transitions (402 in three months) signals industry-wide organizational instability where new executives need to quickly assess, align, and mobilize teams. McChrystal Group's experience with high-stakes team dynamics, crisis leadership, and organizational integration maps directly to health systems navigating transformation with lives at stake.",
        articles=[
            MarketArticle(
                title="Hospital, private equity M&A expected to rise in 2026",
                url="https://www.modernhealthcare.com/providers/mh-hospital-private-equity-mergers-acquisitions-2026/",
                source="Modern Healthcare",
                date=datetime.date(2025, 12, 18),
                summary="Merger talks are accelerating as healthcare organizations gain clarity on federal and state policy. Ascension's $3.9B AmSurg bid exemplifies the shift toward ambulatory care.",
                relevance_note="Accelerating M&A creates post-merger integration challenges requiring organizational design and leadership alignment — McChrystal Group's core capability.",
            ),
            MarketArticle(
                title="Healthcare services M&A could rise in 2026: PwC",
                url="https://www.healthcaredive.com/news/health-services-mergers-acquistions-rise-2026-pwc/808176/",
                source="Healthcare Dive",
                date=datetime.date(2025, 12, 18),
                summary="PwC forecasts a rebound in healthcare services M&A volume and value in 2026, driven by policy clarity, financial pressure on standalone systems, and PE capital redeployment.",
                relevance_note="The M&A rebound creates a wave of organizational integration challenges — health systems need advisory support to align leadership teams and integrate operations.",
            ),
            MarketArticle(
                title="Former Steward Health Care hospitals drag down new owners",
                url="https://www.bostonglobe.com/2026/02/18/business/steward-hospitals-boston-medical-center/",
                source="Boston Globe",
                date=datetime.date(2026, 2, 18),
                summary="Boston Medical Center, which acquired two former Steward Health Care hospitals, is struggling with integration as both facilities have lost patients and require millions in infrastructure improvements.",
                relevance_note="Failed PE-backed health system aftermath creates crisis leadership scenarios — exactly the organizational turnaround scenario McChrystal Group addresses.",
            ),
            MarketArticle(
                title="More hospital mergers expected in 2026, but uncertainty persists",
                url="https://www.chiefhealthcareexecutive.com/view/more-hospital-mergers-expected-in-2026-but-uncertainty-persists",
                source="Chief Healthcare Executive",
                date=datetime.date(2026, 1, 8),
                summary="Despite the lowest merger count in 15 years during 2025, analysts expect acceleration in 2026 as financial pressures mount and standalone systems recognize the need for scale.",
                relevance_note="Hospital systems pursuing mergers under regulatory uncertainty need advisory support for post-merger organizational integration.",
            ),
            MarketArticle(
                title="Ascension CEO says ASC megadeal opens new markets, partnership opportunities",
                url="https://www.fiercehealthcare.com/providers/jpm26-ascension-ceo-says-asc-megadeal-opens-new-markets-partnership-opportunities",
                source="Fierce Healthcare",
                date=datetime.date(2026, 1, 13),
                summary="Ascension's CEO outlined how the $3.9B AmSurg acquisition will add 250+ ambulatory surgery centers across 34 states while simultaneously divesting underperforming hospitals, shrinking from 140 to 91 wholly owned facilities.",
                relevance_note="Ascension's simultaneous acquisition and divestiture strategy is a massive organizational transformation — adding 250+ facilities while shedding 49 hospitals requires operating model redesign.",
            ),
            MarketArticle(
                title="43 recent hospital, health system executive moves",
                url="https://www.beckershospitalreview.com/hospital-executive-moves/43-recent-hospital-health-system-executive-moves-2/",
                source="Becker's Hospital Review",
                date=datetime.date(2026, 2, 25),
                summary="Tracking of 43 recent executive leadership changes across hospital and health systems, reflecting the industry's intense leadership churn spanning CEO appointments, retirements, and restructuring-driven reorganizations.",
                relevance_note="The volume of leadership transitions creates demand for executive alignment and organizational design advisory — new healthcare executives need to quickly build leadership teams.",
            ),
            MarketArticle(
                title="Prospect Medical Holdings files for bankruptcy",
                url="https://www.cbsnews.com/news/prospect-medical-holdings-bankruptcy-private-equity/",
                source="CBS News",
                date=datetime.date(2026, 1, 23),
                summary="Prospect Medical Holdings' bankruptcy and the scramble to find buyers for its safety-net hospitals highlights the organizational devastation of PE-backed health system failures. Hartford HealthCare's $86.1M acquisition of two Prospect hospitals closed January 1.",
                relevance_note="PE-backed health system failures create crisis leadership scenarios where acquiring systems must rapidly stabilize operations and rebuild staff trust — high-stakes challenges that map to McChrystal Group's DNA.",
            ),
        ],
        last_refreshed=TODAY,
    ),

    MarketSector(
        name="Energy & Utilities",
        category=SectorCategory.general,
        overview="The energy sector is undergoing structural transformation driven by AI data center electricity demand, which could reach 176 GW by 2035 (a fivefold jump from 2024), forcing the largest grid investment cycle in history. Constellation Energy's $16.4 billion Calpine acquisition created a 60-GW clean energy titan, while NRG Energy's $12.5 billion LS Power purchase underscores the race for dispatchable generation capacity. NERC warned of elevated risk of summer electricity shortfalls in 2026, making grid reliability a national security concern. BP appointed a new CEO (Meg O'Neill, effective April 2026).",
        key_trends=[
            "Data center electricity demand driving unprecedented grid investment — 176 GW projected by 2035, utility interconnection queues holding 2 TW of capacity",
            "Mega-mergers reshaping the sector: Constellation-Calpine ($16.4B), NRG-LS Power ($12.5B), Devon-Coterra ($26B in oil & gas)",
            "Grid reliability emerging as national security concern — NERC warning of elevated summer shortfall risk as 104 GW of coal/gas generation retires by 2030",
            "Data centers shifting from passive consumers to grid stakeholders, co-investing in infrastructure (Google-Intersect Power-TPG $20B partnership)",
            "Leadership transitions at major energy companies: BP appointing new CEO Meg O'Neill (April 2026), continued executive reshuffling",
        ],
        mcchrystal_angle="Energy utilities face a classic VUCA environment: volatile demand from data centers, uncertain regulatory landscapes, complex grid modernization requiring coordination across generation/transmission/distribution, and ambiguous technology bets. The mega-mergers create organizational integration challenges at massive scale — Constellation absorbing Calpine's 60 GW portfolio requires integrating thousands of employees across different generation technologies. Grid modernization itself is a cross-functional coordination problem that overwhelms siloed utility structures: engineering, regulatory, finance, and customer operations must all operate with shared consciousness.",
        articles=[
            MarketArticle(
                title="Constellation Energy Finalizes $16.4 Billion Calpine Acquisition",
                url="https://markets.financialcontent.com/stocks/article/marketminute-2026-3-10-constellation-energy-finalizes-164-billion-calpine-acquisition-solidifying-lead-in-ai-data-center-power-race",
                source="Market Minute",
                date=datetime.date(2026, 3, 10),
                summary="Constellation Energy completed its $16.4 billion acquisition of Calpine, creating a clean energy company with 60 GW of generation capacity. CEO Joe Dominguez described it as a 'one-stop shop' for the global data economy.",
                relevance_note="A $16.4B merger creating a 60-GW energy giant requires massive organizational integration — combining different generation technologies and operating cultures is a direct McChrystal engagement scenario.",
            ),
            MarketArticle(
                title="Devon Energy CEO: 'Stars align' to acquire Coterra for nearly $26 billion",
                url="https://fortune.com/2026/02/02/devon-energy-ceo-stars-align-coterra-acquisition-26-billion-delaware-basin-oilfield/",
                source="Fortune",
                date=datetime.date(2026, 2, 2),
                summary="Devon Energy is acquiring Coterra Energy for nearly $26 billion in a combination of near-equals, continuing the trend of oil and gas serial acquisitions driven by scale economics and basin consolidation.",
                relevance_note="Merger-of-equals integrations are among the most organizationally complex deals — 'near equals' must resolve leadership, culture, and operating model conflicts without a clear acquirer-target dynamic.",
            ),
            MarketArticle(
                title="2026 Power and Utilities Industry Outlook",
                url="https://www.deloitte.com/us/en/insights/industry/power-and-utilities/power-and-utilities-industry-outlook.html",
                source="Deloitte Insights",
                date=datetime.date(2025, 10, 29),
                summary="Deloitte projects data center demand could reach 176 GW by 2035 (5x 2024 levels), with the power sector requiring over $1.4 trillion in capital investment through 2030. Approximately 2 TW of capacity sits in interconnection queues.",
                relevance_note="The scale of infrastructure transformation required will force utilities to fundamentally redesign their organizational structures and cross-functional coordination.",
            ),
            MarketArticle(
                title="Who will own the power? AI data centers drive power and utilities M&A",
                url="https://www.deloitte.com/us/en/insights/industry/power-and-utilities/mergers-and-acquisitions-power-sector.html",
                source="Deloitte Insights",
                date=datetime.date(2026, 1, 15),
                summary="Analysis of how AI data center demand is reshaping power sector M&A, with Constellation-Calpine and NRG-LS Power illustrating the race for dispatchable generation capacity.",
                relevance_note="Power sector consolidation creates organizational integration challenges at unprecedented scale — utilities combining must align operations and regulatory strategies across diverse asset portfolios.",
            ),
            MarketArticle(
                title="BP announces leadership transition: Meg O'Neill appointed CEO",
                url="https://www.bp.com/en/global/corporate/news-and-insights/press-releases/bp-plc-announces-leadership-transition.html",
                source="BP",
                date=datetime.date(2026, 2, 25),
                summary="BP appointed Meg O'Neill as its next CEO effective April 1, 2026. O'Neill oversaw Woodside Energy's transformative acquisition of BHP Petroleum and grew it into Australia's largest listed energy company.",
                relevance_note="CEO transitions at major energy companies create organizational realignment opportunities — new leaders often seek external advisory to accelerate strategic shifts and drive culture change.",
            ),
            MarketArticle(
                title="Energy industry dealmaking soared in 2025 on large utility, IPP mergers",
                url="https://www.utilitydive.com/news/energy-industry-utility-ipp-mergers-pwc/808228/",
                source="Utility Dive",
                date=datetime.date(2026, 1, 10),
                summary="PwC analysis showing energy industry dealmaking surged in 2025, driven by load growth from electrification and data centers, regulated utility mergers, and infrastructure fund capital deployment.",
                relevance_note="Sustained M&A momentum means ongoing post-merger integration needs — utilities combining operations and workforces need organizational alignment and leadership development.",
            ),
            MarketArticle(
                title="How AI is reshaping utilities and the power grid",
                url="https://www.kyndryl.com/us/en/insights/articles/2026/02/ai-utilties-modernization",
                source="Kyndryl",
                date=datetime.date(2026, 2, 15),
                summary="Analysis of how AI is transforming utility operations through edge devices, smart sensors, and machine learning for real-time load forecasting, predictive outage prevention, and automated diagnostics.",
                relevance_note="AI integration into legacy utility operations is as much an organizational and cultural challenge as a technical one — utilities need to restructure teams and workflows to leverage AI.",
            ),
        ],
        last_refreshed=TODAY,
    ),
]

def print_status():
    """Print freshness table for all sectors from dashboard.json."""
    dashboard_path = os.path.join(os.path.dirname(__file__), "data", "dashboard.json")
    if not os.path.exists(dashboard_path):
        print("No dashboard.json found. Run without --status to populate.")
        return

    with open(dashboard_path) as f:
        data = json.load(f)

    mi = data.get("market_intelligence", [])
    if not mi:
        print("No market intelligence data in dashboard.json.")
        return

    today = datetime.date.today()
    print(f"\n{'Sector':<40} {'Articles':>8}  {'Last Refreshed':>15}  {'Freshness':>10}")
    print("-" * 80)
    for sector in mi:
        name = sector.get("name", "Unknown")
        article_count = len(sector.get("articles", []))
        last_refreshed = sector.get("last_refreshed")
        if last_refreshed:
            lr_date = datetime.date.fromisoformat(last_refreshed)
            days_old = (today - lr_date).days
            if days_old <= 7:
                freshness = "\033[32mFresh\033[0m"
            elif days_old <= 30:
                freshness = "\033[33mAmber\033[0m"
            else:
                freshness = "\033[90mStale\033[0m"
        else:
            last_refreshed = "N/A"
            freshness = "\033[90mUnknown\033[0m"
        print(f"{name:<40} {article_count:>8}  {last_refreshed:>15}  {freshness:>19}")

    total_articles = sum(len(s.get("articles", [])) for s in mi)
    print(f"\nTotal: {len(mi)} sectors, {total_articles} articles")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Market intelligence refresh tool")
    parser.add_argument("--status", action="store_true", help="Print freshness table and exit")
    args = parser.parse_args()

    if args.status:
        print_status()
    else:
        report = generate_market_report(sectors)
        print(f"Generated market intelligence report for {len(sectors)} sectors")
        print(f"Total articles: {sum(len(s.articles) for s in sectors)}")
