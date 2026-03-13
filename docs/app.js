/* McChrystal Overwatch Agent — Client-side SPA */

let dashboardData = null;

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupScrollTop();
  setupMarketsSidebar();
  loadData();
});

function setupTabs() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.view);
      // Close hamburger menu on mobile after selection
      document.getElementById("nav-tabs").classList.remove("open");
    });
  });

  // Hamburger toggle
  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      document.getElementById("nav-tabs").classList.toggle("open");
    });
  }
}

function switchTab(view) {
  document
    .querySelectorAll(".nav-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  const navTab = document.querySelector(`.nav-tab[data-view="${view}"]`);
  if (navTab) navTab.classList.add("active");
  document.getElementById(`view-${view}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupScrollTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 300);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

async function loadData() {
  const views = ["home", "pipeline", "research", "outreach", "proposals", "how-it-works", "future", "markets"];
  views.forEach((v) => {
    document.getElementById(`view-${v}`).innerHTML =
      '<div class="loading">Loading data...</div>';
  });

  try {
    const resp = await fetch("dashboard.json");
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    dashboardData = await resp.json();
    renderAll();
  } catch (err) {
    views.forEach((v) => {
      document.getElementById(`view-${v}`).innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">!</div>
          <div class="empty-state-text">
            Could not load dashboard data.<br>
            Run <code>python -m bd.dashboard</code> to generate data/dashboard.json
          </div>
        </div>`;
    });
    console.error("Failed to load dashboard data:", err);
  }
}

function renderAll() {
  renderHome();
  renderPipeline();
  renderResearch();
  renderOutreach();
  renderMarketsSidebar();
  renderMarkets();
  renderProposals();
  renderHowItWorks();
  renderFuture();
  updateMeta();
}

// ── Helpers ──
function formatRevenue(rev) {
  if (!rev) return "\u2014";
  if (rev >= 1e9) return `$${(rev / 1e9).toFixed(1)}B`;
  if (rev >= 1e6) return `$${Math.round(rev / 1e6)}M`;
  return `$${rev.toLocaleString()}`;
}

function formatEmployees(count) {
  if (!count) return "\u2014";
  if (count >= 1000) return `${Math.floor(count / 1000)}K+`;
  return count.toString();
}

function scoreClass(score) {
  if (score >= 75) return "score-green";
  if (score >= 60) return "score-amber";
  return "score-gray";
}

function signalLabel(type) {
  const labels = {
    reorg: "Reorg",
    m_and_a: "M&A",
    leadership_change: "Leadership",
    earnings_miss: "Earnings Miss",
    rapid_growth: "Rapid Growth",
    transformation: "Transformation",
  };
  return labels[type] || type;
}

function tierLabel(tier) {
  const labels = {
    tier_1: "Tier 1",
    tier_2: "Tier 2",
    tier_3: "Tier 3",
  };
  return labels[tier] || "";
}

function tierClass(tier) {
  if (tier === "tier_1") return "tier-1";
  if (tier === "tier_2") return "tier-2";
  if (tier === "tier_3") return "tier-3";
  return "";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ── Industry category mapping ──
const CATEGORIES = [
  "Healthcare",
  "Defense & Government",
  "Technology & Fintech",
  "Industrial & Logistics",
  "Energy",
  "Home & Business Services",
  "Media & Consumer",
];

function categoryOf(industry) {
  if (!industry) return "Media & Consumer";
  const ind = industry.toLowerCase();
  if (ind.includes("health") || ind.includes("dental") || ind.includes("pharma") || ind.includes("drug")) return "Healthcare";
  if (ind.includes("defense") || ind.includes("government") || ind.includes("federal") || ind.includes("aerospace")) return "Defense & Government";
  if (ind.includes("tech") || ind.includes("fintech") || ind.includes("software") || ind.includes("semiconductor") || ind.includes("gaming") || ind.includes("telecom") || ind.includes("optical") || ind.includes("network")) return "Technology & Fintech";
  if (ind.includes("industrial") || ind.includes("logistics") || ind.includes("auto") || ind.includes("chemical") || ind.includes("material") || ind.includes("parts") || ind.includes("collision") || ind.includes("fleet") || ind.includes("manufacturing") || ind.includes("supply chain")) return "Industrial & Logistics";
  if (ind.includes("energy") || ind.includes("oil") || ind.includes("gas") || ind.includes("utilit") || ind.includes("renewable") || ind.includes("power")) return "Energy";
  if (ind.includes("home") || ind.includes("service") || ind.includes("hvac") || ind.includes("plumbing") || ind.includes("residential")) return "Home & Business Services";
  if (ind.includes("media") || ind.includes("entertainment") || ind.includes("consumer") || ind.includes("retail") || ind.includes("apparel") || ind.includes("sport") || ind.includes("talent")) return "Media & Consumer";
  return "Media & Consumer";
}

function renderFilterBar(containerId, onFilter) {
  const pills = ["All", ...CATEGORIES];
  const bar = document.createElement("div");
  bar.className = "filter-bar";
  bar.innerHTML = pills
    .map(
      (cat, i) =>
        `<button class="filter-pill${i === 0 ? " active" : ""}" data-category="${cat}">${cat}</button>`
    )
    .join("");
  bar.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      bar.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      onFilter(pill.dataset.category);
    });
  });
  const container = document.getElementById(containerId);
  const header = container.querySelector(".section-header");
  if (header) header.after(bar);
}

function groupByCategory(items, industryAccessor) {
  const groups = {};
  for (const cat of CATEGORIES) groups[cat] = [];
  for (const item of items) {
    const cat = categoryOf(industryAccessor(item));
    groups[cat].push(item);
  }
  return groups;
}

// ══════════════════════════════════════════
// HOME VIEW
// ══════════════════════════════════════════

function renderHome() {
  const container = document.getElementById("view-home");

  // Gather counts
  const prospectMap = new Map();
  for (const run of dashboardData.discovery_runs || []) {
    for (const p of run.prospects || []) {
      const existing = prospectMap.get(p.company_name);
      if (!existing || p.score > existing.score) {
        prospectMap.set(p.company_name, p);
      }
    }
  }
  const prospectCount = prospectMap.size;
  const dossierCount = (dashboardData.dossiers || []).length;
  const sequenceCount = (dashboardData.outreach_packages || dashboardData.outreach_sequences || []).length;

  // Compute KPI stats
  const allProspects = [...prospectMap.values()];
  const avgScore = allProspects.length
    ? Math.round(allProspects.reduce((sum, p) => sum + (p.score || 0), 0) / allProspects.length)
    : 0;

  // Fit rating breakdown from dossiers
  const fitCounts = { strong: 0, moderate: 0, speculative: 0 };
  for (const d of dashboardData.dossiers || []) {
    const rating = d.fit_assessment?.rating;
    if (rating && fitCounts.hasOwnProperty(rating)) fitCounts[rating]++;
  }

  container.innerHTML = `
    <div class="hero">
      <div class="hero-title">McChrystal Overwatch Agent</div>
      <div class="hero-subtitle">
        AI-powered business development pipeline that identifies, researches, and crafts
        personalized outreach for high-fit prospects.
      </div>
      <div class="hero-org">McChrystal Group</div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Pipeline Summary</div>
      <div class="icp-grid">
        <div class="icp-card">
          <div class="icp-value">${prospectCount}</div>
          <div class="icp-label">Total Prospects</div>
        </div>
        <div class="icp-card">
          <div class="icp-value">${avgScore}</div>
          <div class="icp-label">Avg ICP Score</div>
        </div>
        <div class="icp-card">
          <div class="icp-value" style="font-size:14px; line-height:1.6;">
            <span style="color:var(--green);">${fitCounts.strong} Strong</span><br>
            <span style="color:var(--amber);">${fitCounts.moderate} Moderate</span><br>
            <span style="color:var(--text-muted);">${fitCounts.speculative} Speculative</span>
          </div>
          <div class="icp-label">Fit Ratings</div>
        </div>
        <div class="icp-card">
          <div class="icp-value">${sequenceCount}</div>
          <div class="icp-label">Outreach Packages</div>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Core Capabilities</div>
      <div class="method-grid">
        <div class="method-card">
          <div class="method-card-icon" style="color:#da6123;">&#9733;</div>
          <h3>Team of Teams</h3>
          <p>Operating model implementation built on shared consciousness and empowered execution \u2014 the framework that transformed Joint Special Operations Command.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">&#9650;</div>
          <h3>Leadership & Executive Coaching</h3>
          <p>Developing leaders who drive transformation in VUCA environments. Decentralized authority with aligned intent.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#e8c547;">&#11044;</div>
          <h3>Organizational Design</h3>
          <p>Redesigning structures for adaptability and speed. Breaking hierarchies and silos that fail in fast-moving markets.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#c75d5d;">&#9878;</div>
          <h3>Crisis & High-Stakes Leadership</h3>
          <p>Decision-making under pressure. Culture change and trust-building at scale when failure has real consequences.</p>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">How It Works</div>
      <div style="border-left: 3px solid #da6123; padding: 12px 16px; margin-bottom: 20px; background: rgba(218,97,35,0.06); border-radius: 0 6px 6px 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
        <strong style="color: var(--text-primary);">One command. Full pipeline.</strong> Say \u201Crun discovery for 10 new prospects\u201D and the agent mines market intelligence for leads, searches the web for transformation signals, scores every prospect against the ICP, spins up parallel subagents to build 10-section dossiers, drafts 3 cold email versions per prospect, and deploys everything to a live dashboard. No manual handoffs, no CRM, no data entry.
      </div>
      <div style="border-left: 3px solid #da6123; padding: 12px 16px; margin-bottom: 20px; background: rgba(218,97,35,0.06); border-radius: 0 6px 6px 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
        <strong style="color: var(--text-primary);">Discovery is weighted toward unique opportunities.</strong> The algorithm prioritizes non-obvious companies \u2014 PE-backed roll-ups, fresh spinoffs, post-merger integrations, and niche industry leaders with strong transformation signals \u2014 over household-name Fortune 500s that any firm would think of. F500 companies still surface when signals are compelling, but the real value is in what others miss. Research parameters can always be refined to shift targeting.
      </div>
      <div class="method-grid">
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">&#9889;</div>
          <h3>One-Command Execution</h3>
          <p>\u201CRun discovery for 10\u201D fires the full pipeline: market mining \u2192 ICP scoring \u2192 parallel dossier research \u2192 outreach drafting \u2192 deployment. End-to-end with no human intervention between phases.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#da6123;">&#8635;</div>
          <h3>Market Intelligence \u2192 Discovery</h3>
          <p>Market news feeds prospect discovery. 13 sector feeds are scanned for companies showing ICP signals, cross-referenced against the pipeline, and the best candidates surface alongside fresh web research.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#6bc9a0;">&#9906;</div>
          <h3>Autonomous Discovery</h3>
          <p>Searches the web for organizations showing transformation signals. Validates revenue, employees, trigger events. Deduplicates against existing pipeline. Only prospects with a specific, current reason to reach out advance.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#e8c547;">&#9878;</div>
          <h3>ICP Scoring Engine</h3>
          <p>100-point model: signal count &amp; recency (35 pts), revenue fit (25 pts), employee scale (20 pts), McChrystal-specific fit (20 pts). Prospects below threshold are dropped and replaced.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#a78bdb;">&#9881;</div>
          <h3>Parallel Subagent Research</h3>
          <p>Prospects batched (3\u20134 per agent) and delegated to parallel subagents. Each builds a complete 10-section dossier simultaneously.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#da6123;">&#9993;</div>
          <h3>Parallel Subagent Outreach</h3>
          <p>Subagents draft 3 cold email versions (A/B/C) plus LinkedIn message per prospect. Each targets a champion-level contact with a genuinely different angle.</p>
        </div>
      </div>
      <div style="margin-top:16px; text-align:center;">
        <a href="#" class="deep-dive-link" onclick="event.preventDefault(); switchTab('how-it-works');">See the deep dive \u2192</a>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Industry Tiers</div>
      <div class="method-grid">
        <div class="method-card" style="border-left: 3px solid #7ab8f5;">
          <h3 style="color: #7ab8f5;">Tier 1 \u2014 Conventional</h3>
          <p>Proven hunting ground. Defense & aerospace, federal agencies, financial services, healthcare systems, large industrials & manufacturing.</p>
        </div>
        <div class="method-card" style="border-left: 3px solid var(--purple);">
          <h3 style="color: var(--purple);">Tier 2 \u2014 Adjacent</h3>
          <p>Natural expansion. Tech companies losing agility at scale, PE portfolio companies post-acquisition, energy transition, logistics & supply chain, professional services.</p>
        </div>
        <div class="method-card" style="border-left: 3px solid var(--amber);">
          <h3 style="color: var(--amber);">Tier 3 \u2014 Unconventional</h3>
          <p>High-upside bets. Sports organizations, trauma centers, media & entertainment, NGOs, first responders, Series C+ startups, universities, infrastructure projects.</p>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Fit Signals</div>
      <div class="signal-grid">
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--amber);">Reorg</div>
          <div class="signal-card-desc">Restructuring, layoffs, unit consolidation. Immediate need for cross-functional alignment.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: #7ab8f5;">M&A</div>
          <div class="signal-card-desc">Mergers and acquisitions creating integration challenges across cultures, teams, and systems.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: #db4c9c;">Leadership Change</div>
          <div class="signal-card-desc">New C-suite seeking transformation. Fresh mandate, window of openness to external advisory.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--red);">Earnings Miss</div>
          <div class="signal-card-desc">Guidance shortfalls, activist pressure, public struggles. Leadership problems masquerading as strategy problems.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--green);">Rapid Growth</div>
          <div class="signal-card-desc">Scaling past structures. Coordination breaks down, silos form, hierarchies can't keep pace.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--purple);">Transformation</div>
          <div class="signal-card-desc">Digital, operational, or strategic pivots. New operating models requiring organization-wide change.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: #2db7b7;">Hiring Surge</div>
          <div class="signal-card-desc">Executive hiring waves, new C-suite roles created, talent acquisition patterns signaling strategic shifts.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: #5aafff;">Funding</div>
          <div class="signal-card-desc">PE recaps, funding rounds, credit facilities, secondary offerings. Capital infusion often precedes transformation.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--accent);">Partnership</div>
          <div class="signal-card-desc">Strategic partnerships, joint ventures, platform alliances. New relationships that change how the org operates.</div>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Scoring Model (100 points)</div>
      <div class="scoring-bars">
        <div class="score-bar-row">
          <div class="score-bar-label">Signals</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-signals" style="width: 35%;">35</div>
          </div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">Revenue Fit</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-revenue" style="width: 25%;">25</div>
          </div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">Employee Count</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-employees" style="width: 20%;">20</div>
          </div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">McChrystal Fit</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-fit" style="width: 20%;">20</div>
          </div>
        </div>
      </div>
    </div>

  `;
}

// ══════════════════════════════════════════
// PIPELINE VIEW
// ══════════════════════════════════════════

function renderPipeline() {
  const container = document.getElementById("view-pipeline");

  const prospectMap = new Map();
  for (const run of dashboardData.discovery_runs || []) {
    for (const p of run.prospects || []) {
      const existing = prospectMap.get(p.company_name);
      if (!existing || p.score > existing.score) {
        prospectMap.set(p.company_name, p);
      }
    }
  }

  const prospects = [...prospectMap.values()].sort((a, b) => b.score - a.score);

  if (!prospects.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#128202;</div>
        <div class="empty-state-text">No discovery data yet. Run a discovery scan first.</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Pipeline</h2>
      <span class="expand-hint">click a tile to expand</span>
      <span class="section-count">${prospects.length} prospects</span>
    </div>
    <div class="card-grid"></div>`;

  renderFilterBar("view-pipeline", (cat) => renderPipelineCards(prospects, cat));
  renderPipelineCards(prospects, "All");
}

function renderPipelineCards(prospects, category) {
  const container = document.querySelector("#view-pipeline .card-grid");
  if (category === "All") {
    const groups = groupByCategory(prospects, (p) => p.industry);
    let html = "";
    for (const cat of CATEGORIES) {
      if (!groups[cat].length) continue;
      html += `<div class="category-header">${cat}</div>`;
      html += groups[cat].map((p) => prospectCard(p)).join("");
    }
    container.innerHTML = html;
  } else {
    const filtered = prospects.filter((p) => categoryOf(p.industry) === category);
    container.innerHTML = filtered.map((p) => prospectCard(p)).join("");
  }
  attachCardToggle(document.getElementById("view-pipeline"));
}

function truncateToSentences(text, max) {
  if (!text) return "";
  // Grab up to `max` sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, max).join(" ").trim();
}

function prospectCard(p) {
  const signals = p.signals || [];
  const blurb = truncateToSentences(p.summary, 2);

  return `
    <div class="card">
      <div class="card-header">
        <div class="card-company">${escapeHtml(p.company_name)}</div>
        <div class="card-badges">
          ${p.tier ? `<span class="tier-badge ${tierClass(p.tier)}">${tierLabel(p.tier)}</span>` : ""}
          <span class="score-badge ${scoreClass(p.score)}">${Math.round(p.score)}</span>
        </div>
      </div>
      <div class="card-meta">
        <span>${formatRevenue(p.revenue_estimate)}</span>
        <span>${formatEmployees(p.employee_count)} employees</span>
        ${p.industry ? `<span>${escapeHtml(p.industry)}</span>` : ""}
      </div>
      ${blurb ? `<div class="card-blurb">${escapeHtml(blurb)}</div>` : ""}
      <div class="card-detail">
        ${p.company_overview ? `
          <div class="detail-section">
            <div class="detail-section-label">Company Overview</div>
            <div class="detail-section-text">${escapeHtml(p.company_overview)}</div>
          </div>` : ""}
        ${p.entry_point ? `
          <div class="detail-section">
            <div class="detail-section-label">Entry Point</div>
            <div class="detail-section-text">${escapeHtml(p.entry_point)}</div>
          </div>` : ""}
        ${p.conversation_hook ? `
          <div class="detail-section">
            <div class="detail-section-label">Conversation Hook</div>
            <div class="detail-section-text">${escapeHtml(p.conversation_hook)}</div>
          </div>` : ""}
        ${signals.map((s) => signalItem(s)).join("")}
        ${p.summary ? `<div class="card-summary">${escapeHtml(p.summary)}</div>` : ""}
      </div>
    </div>`;
}

function signalItem(s) {
  return `
    <div class="signal-item">
      <div class="signal-type">${signalLabel(s.type)}
        ${s.date ? `<span class="signal-date"> \u2014 ${s.date}</span>` : ""}
      </div>
      <div class="signal-desc">${escapeHtml(s.description)}</div>
      ${s.source ? `<div class="signal-source"><a href="${escapeHtml(s.source)}" target="_blank" rel="noopener">Source \u2197</a></div>` : ""}
    </div>`;
}

// ══════════════════════════════════════════
// RESEARCH VIEW
// ══════════════════════════════════════════

function renderResearch() {
  const container = document.getElementById("view-research");
  const dossiers = dashboardData.dossiers || [];

  if (!dossiers.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#128269;</div>
        <div class="empty-state-text">No research dossiers yet.</div>
      </div>`;
    return;
  }

  // Sort dossiers by score descending
  const sorted = [...dossiers].sort((a, b) => (b.prospect?.score || 0) - (a.prospect?.score || 0));

  container.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Research Dossiers</h2>
      <span class="expand-hint">click a tile to expand</span>
      <span class="section-count">${sorted.length} dossiers</span>
    </div>
    <div class="card-grid"></div>`;

  renderFilterBar("view-research", (cat) => renderResearchCards(sorted, cat));
  renderResearchCards(sorted, "All");
}

function renderResearchCards(dossiers, category) {
  const container = document.querySelector("#view-research .card-grid");
  if (category === "All") {
    const groups = groupByCategory(dossiers, (d) => d.prospect?.industry);
    let html = "";
    for (const cat of CATEGORIES) {
      if (!groups[cat].length) continue;
      html += `<div class="category-header">${cat}</div>`;
      html += groups[cat].map((d) => dossierCard(d)).join("");
    }
    container.innerHTML = html;
  } else {
    const filtered = dossiers.filter((d) => categoryOf(d.prospect?.industry) === category);
    container.innerHTML = filtered.map((d) => dossierCard(d)).join("");
  }
  attachCardToggle(document.getElementById("view-research"));
}

function dossierCard(d) {
  const p = d.prospect || {};
  const contacts = d.key_contacts || [];
  const pains = d.pain_points || [];
  const competitors = d.competitors_present || [];
  const triggers = d.trigger_events || [];
  const fa = d.fit_assessment;
  const convos = d.conversation_entries || [];
  const hasOutreach = (dashboardData.outreach_packages || dashboardData.outreach_sequences || []).some(
    (s) => s.dossier?.prospect?.company_name === p.company_name
  );

  // Build a blurb from fit assessment or legacy analysis
  const blurb = fa
    ? truncateToSentences(fa.primary_problem, 2)
    : truncateToSentences(d.detailed_analysis, 2);

  // Fit rating badge
  const ratingClass = fa
    ? fa.rating === "strong" ? "score-green" : fa.rating === "moderate" ? "score-amber" : "score-gray"
    : "";
  const ratingLabel = fa ? fa.rating.charAt(0).toUpperCase() + fa.rating.slice(1) : "";

  return `
    <div class="card">
      <div class="card-header">
        <div class="card-company">${escapeHtml(p.company_name || "Unknown")}</div>
        <div class="card-badges">
          ${fa ? `<span class="tier-badge ${ratingClass}" style="font-size:11px;">${ratingLabel}</span>` : ""}
          <span class="score-badge ${scoreClass(p.score || 0)}">${Math.round(p.score || 0)}</span>
        </div>
      </div>
      <div class="card-meta">
        <span>${formatRevenue(p.revenue_estimate)}</span>
        <span>${formatEmployees(p.employee_count)} employees</span>
        ${p.industry ? `<span>${escapeHtml(p.industry)}</span>` : ""}
        ${hasOutreach ? `<a href="#" class="outreach-link" onclick="event.stopPropagation(); switchTab('outreach'); return false;" style="color:var(--ui-bright); font-size:12px; margin-left:auto;">View Outreach &rsaquo;</a>` : ""}
      </div>
      ${blurb ? `<div class="card-blurb">${escapeHtml(blurb)}</div>` : ""}
      <div class="dossier-detail">
        ${orgSnapshotSection(d)}
        ${companyOverviewSection(d)}
        ${d.financial_health ? textSection("Financial Health", d.financial_health) : ""}
        ${contacts.length ? contactsSection(contacts) : ""}
        ${(d.org_structure || d.culture_signals) ? cultureSection(d) : ""}
        ${triggers.length ? triggerEventsSection(triggers) : ""}
        ${fa ? fitAssessmentSection(fa) : ""}
        ${convos.length ? conversationSection(convos, d.recommended_meeting_framing) : ""}
        ${d.brand_insights ? richTextSection("Brand Insights & Market Positioning", d.brand_insights) : ""}
        ${d.deep_fit_analysis ? richTextSection("Deep McChrystal Group Fit Analysis", d.deep_fit_analysis) : ""}
        ${pains.length && !fa ? painPointsSection(pains) : ""}
        ${competitors.length && !fa ? competitorsSection(competitors) : ""}
        ${d.transformation_timeline && !triggers.length ? textSection("Timeline", d.transformation_timeline) : ""}
        ${d.budget_context && !d.financial_health ? textSection("Budget Context", d.budget_context) : ""}
        ${d.detailed_analysis ? textSection("Analysis", d.detailed_analysis) : ""}
      </div>
    </div>`;
}

function orgSnapshotSection(d) {
  const parts = [];
  if (d.headquarters) parts.push(`<span>HQ: ${escapeHtml(d.headquarters)}</span>`);
  if (d.ownership_structure) parts.push(`<span>${escapeHtml(d.ownership_structure)}</span>`);
  if (d.founded_year) parts.push(`<span>Est. ${d.founded_year}</span>`);
  if (d.geographic_footprint) parts.push(`<span>${escapeHtml(d.geographic_footprint)}</span>`);
  if (!parts.length) return "";
  return `
    <div class="dossier-section">
      <h4>Organization Snapshot</h4>
      <div class="snapshot-meta">${parts.join(" &middot; ")}</div>
    </div>`;
}

function companyOverviewSection(d) {
  const p = d.prospect || {};
  // Build an in-depth overview from the dossier's prospect company_overview field
  // plus ownership, geographic footprint, and industry context
  const overview = p.company_overview;
  if (!overview && !d.ownership_structure && !d.geographic_footprint) return "";

  let html = '<div class="dossier-section"><h4>Company Overview</h4>';
  if (overview) {
    html += `<div class="detail-section-text" style="margin-bottom:8px;">${escapeHtml(overview)}</div>`;
  }
  const details = [];
  if (d.ownership_structure) details.push(`<strong>Ownership:</strong> ${escapeHtml(d.ownership_structure)}`);
  if (d.geographic_footprint) details.push(`<strong>Footprint:</strong> ${escapeHtml(d.geographic_footprint)}`);
  if (p.industry) details.push(`<strong>Industry:</strong> ${escapeHtml(p.industry)}`);
  if (details.length) {
    html += `<div class="overview-details">${details.map(d => `<div class="overview-detail-item">${d}</div>`).join("")}</div>`;
  }
  html += '</div>';
  return html;
}

function contactsSection(contacts) {
  const priority = contacts.filter((c) => c.is_priority_target);
  const hasPriority = priority.length > 0;

  let html = '<div class="dossier-section"><h4>Leadership Team</h4>';

  if (hasPriority) {
    html += '<div class="priority-targets">';
    for (const c of priority) {
      html += `<div class="priority-target">
        <div class="detail-section-label">Priority Target</div>
        <strong>${escapeHtml(c.name)}</strong> \u2014 ${escapeHtml(c.title)}
        ${c.priority_rationale ? `<div class="detail-section-text">${escapeHtml(c.priority_rationale)}</div>` : ""}
      </div>`;
    }
    html += "</div>";
  }

  html += `<table class="contacts-table">
    <thead><tr><th>Name</th><th>Title</th><th>Background</th><th>Notes</th></tr></thead>
    <tbody>
      ${contacts
        .map(
          (c) => `
        <tr${c.is_priority_target ? ' style="color: var(--ui-bright);"' : ""}>
          <td><strong>${escapeHtml(c.name)}</strong></td>
          <td>${escapeHtml(c.title)}</td>
          <td>${c.background ? escapeHtml(c.background) : "\u2014"}</td>
          <td>${c.notes ? escapeHtml(c.notes) : "\u2014"}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table></div>`;
  return html;
}

function cultureSection(d) {
  let html = '<div class="dossier-section"><h4>Culture & Structure</h4>';
  if (d.org_structure) {
    html += `<div class="detail-section-text" style="margin-bottom:8px;"><strong>Structure:</strong> ${escapeHtml(d.org_structure)}</div>`;
  }
  if (d.culture_signals) {
    html += `<div class="dossier-text">${escapeHtml(d.culture_signals)}</div>`;
  }
  html += "</div>";
  return html;
}

function triggerEventsSection(events) {
  return `
    <div class="dossier-section">
      <h4>Recent Trigger Events</h4>
      ${events
        .map(
          (e) => `
        <div class="signal-item">
          <div class="signal-type">${e.date || "Recent"}
            ${e.source ? `<a href="${escapeHtml(e.source)}" target="_blank" rel="noopener" class="signal-source" style="margin-left:8px;">source \u2197</a>` : ""}
          </div>
          <div class="signal-desc"><strong>${escapeHtml(e.event)}</strong></div>
          <div class="detail-section-text">${escapeHtml(e.relevance)}</div>
        </div>`
        )
        .join("")}
    </div>`;
}

function fitAssessmentSection(fa) {
  const ratingColor = fa.rating === "strong" ? "var(--green)" : fa.rating === "moderate" ? "var(--amber)" : "var(--text-muted)";
  return `
    <div class="dossier-section">
      <h4>McChrystal Fit Assessment</h4>
      <div style="margin-bottom:12px;">
        <span style="color:${ratingColor}; font-weight:700; text-transform:uppercase; font-size:13px;">${fa.rating}</span>
        ${fa.rating_rationale ? `<span style="color:var(--text-secondary); font-size:13px;"> \u2014 ${escapeHtml(fa.rating_rationale)}</span>` : ""}
      </div>
      <div class="detail-section" style="margin-bottom:10px;">
        <div class="detail-section-label">Primary Problem</div>
        <div class="detail-section-text">${escapeHtml(fa.primary_problem)}</div>
      </div>
      <div class="detail-section" style="margin-bottom:10px;">
        <div class="detail-section-label">Best Capability Fit</div>
        <div class="detail-section-text">${escapeHtml(fa.best_capability_fit)}</div>
      </div>
      ${fa.likely_objections?.length ? `
        <div class="detail-section" style="margin-bottom:10px;">
          <div class="detail-section-label">Likely Objections</div>
          <ul class="pain-points-list">
            ${fa.likely_objections.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}
          </ul>
        </div>` : ""}
      ${fa.competitive_landscape?.length ? `
        <div class="detail-section">
          <div class="detail-section-label">Competitive Landscape</div>
          <div class="competitor-tags">
            ${fa.competitive_landscape.map((c) => `<span class="competitor-tag">${escapeHtml(c)}</span>`).join("")}
          </div>
        </div>` : ""}
    </div>`;
}

function conversationSection(entries, meetingFraming) {
  return `
    <div class="dossier-section">
      <h4>Conversation Entry Points</h4>
      ${entries
        .map(
          (e) => `
        <div class="signal-item">
          <div class="signal-desc"><strong>Q:</strong> ${escapeHtml(e.opening_question)}</div>
          ${e.framing ? `<div class="detail-section-text" style="font-style:italic;">${escapeHtml(e.framing)}</div>` : ""}
        </div>`
        )
        .join("")}
      ${meetingFraming ? `
        <div style="margin-top:12px;">
          <div class="detail-section-label">Recommended Meeting Framing</div>
          <div class="dossier-text">${escapeHtml(meetingFraming)}</div>
        </div>` : ""}
    </div>`;
}

function painPointsSection(pains) {
  return `
    <div class="dossier-section">
      <h4>Pain Points</h4>
      <ul class="pain-points-list">
        ${pains.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
      </ul>
    </div>`;
}

function competitorsSection(competitors) {
  return `
    <div class="dossier-section">
      <h4>Competitive Landscape</h4>
      <div class="competitor-tags">
        ${competitors.map((c) => `<span class="competitor-tag">${escapeHtml(c)}</span>`).join("")}
      </div>
    </div>`;
}

function textSection(title, content) {
  if (!content) return "";
  return `
    <div class="dossier-section">
      <h4>${escapeHtml(title)}</h4>
      <div class="dossier-text">${escapeHtml(content)}</div>
    </div>`;
}

function richTextSection(title, content) {
  if (!content) return "";
  // Convert Markdown tables to HTML tables, then handle inline formatting
  const lines = content.split("\n");
  const processed = [];
  let i = 0;
  while (i < lines.length) {
    // Detect markdown table: line with |, next line is separator |---|
    if (lines[i].includes("|") && i + 1 < lines.length && /^\|[\s-:|]+\|$/.test(lines[i + 1].trim())) {
      let tableHtml = '<table style="width:100%; border-collapse:collapse; font-size:13px; margin:12px 0;">';
      // Header row
      const headers = lines[i].split("|").filter(c => c.trim()).map(c => c.trim());
      tableHtml += "<thead><tr>" + headers.map(h =>
        `<th style="text-align:left; padding:8px 10px; border-bottom:2px solid var(--border); color:var(--ui-bright); font-weight:600;">${escapeHtml(h).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</th>`
      ).join("") + "</tr></thead><tbody>";
      i += 2; // skip header + separator
      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i].split("|").filter(c => c.trim()).map(c => c.trim());
        tableHtml += "<tr>" + cells.map(c =>
          `<td style="padding:8px 10px; border-bottom:1px solid var(--border-light); vertical-align:top;">${escapeHtml(c).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</td>`
        ).join("") + "</tr>";
        i++;
      }
      tableHtml += "</tbody></table>";
      processed.push(tableHtml);
    } else {
      processed.push(lines[i]);
      i++;
    }
  }
  let html = escapeHtml(processed.join("\n"))
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.+)$/gm, '<h5 style="margin:12px 0 4px; color:var(--ui-bright);">$1</h5>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:16px;">$1</li>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  // Restore table HTML that got escaped
  processed.forEach(p => {
    if (p.startsWith("<table")) {
      html = html.replace(escapeHtml(p), p);
    }
  });
  return `
    <div class="dossier-section">
      <h4>${escapeHtml(title)}</h4>
      <div class="dossier-text"><p>${html}</p></div>
    </div>`;
}

// ══════════════════════════════════════════
// OUTREACH VIEW
// ══════════════════════════════════════════

function renderOutreach() {
  const container = document.getElementById("view-outreach");
  // Support new outreach_packages with fallback to legacy outreach_sequences
  const packages = dashboardData.outreach_packages || [];
  const legacySequences = dashboardData.outreach_sequences || [];
  const allItems = packages.length ? packages : legacySequences;
  const isLegacy = !packages.length && legacySequences.length > 0;

  if (!allItems.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#9993;</div>
        <div class="empty-state-text">No outreach packages yet.</div>
      </div>`;
    return;
  }

  const sorted = [...allItems].sort((a, b) => (b.dossier?.prospect?.score || 0) - (a.dossier?.prospect?.score || 0));

  container.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Outreach Packages</h2>
      <span class="expand-hint">click a tile to expand</span>
      <span class="section-count">${sorted.length} packages</span>
    </div>
    <div class="card-grid"></div>`;

  renderFilterBar("view-outreach", (cat) => renderOutreachCards(sorted, cat, isLegacy));
  renderOutreachCards(sorted, "All", isLegacy);
}

function renderOutreachCards(items, category, isLegacy) {
  const container = document.querySelector("#view-outreach .card-grid");
  const cardFn = isLegacy ? legacyOutreachCard : outreachCard;
  if (category === "All") {
    const groups = groupByCategory(items, (s) => s.dossier?.prospect?.industry);
    let html = "";
    for (const cat of CATEGORIES) {
      if (!groups[cat].length) continue;
      html += `<div class="category-header">${cat}</div>`;
      html += groups[cat].map((s) => cardFn(s)).join("");
    }
    container.innerHTML = html;
  } else {
    const filtered = items.filter((s) => categoryOf(s.dossier?.prospect?.industry) === category);
    container.innerHTML = filtered.map((s) => cardFn(s)).join("");
  }
  attachCardToggle(document.getElementById("view-outreach"), true);
}

function outreachCard(pkg) {
  const p = pkg.dossier?.prospect || {};
  const tc = pkg.target_contact || {};
  const coldEmails = pkg.cold_emails || [];
  const fa = pkg.dossier?.fit_assessment;
  const ratingClass = fa
    ? fa.rating === "strong" ? "score-green" : fa.rating === "moderate" ? "score-amber" : "score-gray"
    : "";
  const ratingLabel = fa ? fa.rating.charAt(0).toUpperCase() + fa.rating.slice(1) : "";

  return `
    <div class="card">
      <div class="card-header">
        <div class="card-company">${escapeHtml(p.company_name || "Unknown")}</div>
        <div class="card-badges">
          ${fa ? `<span class="tier-badge ${ratingClass}" style="font-size:11px;">${ratingLabel}</span>` : ""}
          <span class="score-badge ${scoreClass(p.score || 0)}">${Math.round(p.score || 0)}</span>
        </div>
      </div>
      <div class="card-meta">
        <span>${formatRevenue(p.revenue_estimate)}</span>
        <span>${coldEmails.length} versions${pkg.linkedin_message ? " + LinkedIn" : ""}</span>
      </div>
      ${tc.name ? `
        <div style="margin-top:10px; padding:10px 12px; background:var(--bg-surface); border-radius:var(--radius-sm); border-left:3px solid var(--accent);">
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--ui-bright); margin-bottom:6px;">Target Contact</div>
          <div style="margin-bottom:4px;">
            <strong style="color:var(--text); font-size:14px;">${escapeHtml(tc.name)}</strong>
            <span style="color:var(--text-secondary); font-size:13px;"> \u2014 ${escapeHtml(tc.title || "")}</span>
          </div>
          ${tc.priority_rationale ? `<div style="font-size:12px; color:var(--text-muted); margin-top:4px; font-style:italic;">Why: ${escapeHtml(tc.priority_rationale)}</div>` : ""}
        </div>
      ` : ""}
      <div class="email-sequence">
        ${coldEmails.map((e, i) => coldEmailCard(e, i)).join("")}
        ${pkg.linkedin_message ? linkedInCard(pkg.linkedin_message) : ""}
      </div>
    </div>`;
}

function linkedInCard(msg) {
  const id = `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const typeLabel = msg.message_type === "inmail" ? "InMail" : "Connection Request";

  return `
    <div class="email-card" style="border-left: 3px solid #0a66c2;">
      <div class="email-header">
        <span class="email-number" style="color:#0a66c2;">LinkedIn ${typeLabel}</span>
      </div>
      ${msg.subject ? `<div class="email-subject">${escapeHtml(msg.subject)}</div>` : ""}
      <div class="email-hook">Hook: ${escapeHtml(msg.hook)}</div>
      <div class="email-body" id="${id}">${escapeHtml(msg.body)}</div>
      <button class="copy-btn" onclick="copyEmail('${id}', this)">Copy</button>
    </div>`;
}

function coldEmailCard(email, index) {
  const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${index}`;
  const versionColors = { A: "var(--green)", B: "var(--amber)", C: "#7ab8f5" };
  const color = versionColors[email.version] || "var(--ui-bright)";

  return `
    <div class="email-card">
      <div class="email-header">
        <span class="email-number" style="color:${color};">Version ${escapeHtml(email.version)} \u2014 ${escapeHtml(email.label)}</span>
      </div>
      <div class="email-subject">${escapeHtml(email.subject)}</div>
      <div class="email-hook">Hook: ${escapeHtml(email.hook)}</div>
      <div class="email-body" id="${id}">${escapeHtml(email.body)}</div>
      <button class="copy-btn" onclick="copyEmail('${id}', this)">Copy</button>
    </div>`;
}

function legacyOutreachCard(seq) {
  const p = seq.dossier?.prospect || {};
  const emails = seq.emails || [];
  const fa = seq.dossier?.fit_assessment;
  const contacts = (seq.dossier?.key_contacts || []).filter((c) => c.is_priority_target);
  const ratingClass = fa
    ? fa.rating === "strong" ? "score-green" : fa.rating === "moderate" ? "score-amber" : "score-gray"
    : "";
  const ratingLabel = fa ? fa.rating.charAt(0).toUpperCase() + fa.rating.slice(1) : "";

  return `
    <div class="card">
      <div class="card-header">
        <div class="card-company">${escapeHtml(p.company_name || "Unknown")}</div>
        <div class="card-badges">
          ${fa ? `<span class="tier-badge ${ratingClass}" style="font-size:11px;">${ratingLabel}</span>` : ""}
          <span class="score-badge ${scoreClass(p.score || 0)}">${Math.round(p.score || 0)}</span>
        </div>
      </div>
      <div class="card-meta">
        <span>${formatRevenue(p.revenue_estimate)}</span>
        <span>${emails.length} emails</span>
      </div>
      ${contacts.length ? `
        <div style="margin-top:10px; padding:10px 12px; background:var(--bg-surface); border-radius:var(--radius-sm); border-left:3px solid var(--border);">
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--ui-bright); margin-bottom:6px;">Target Contacts</div>
          ${contacts.map((c) => `
            <div style="margin-bottom:4px;">
              <strong style="color:var(--text); font-size:13px;">${escapeHtml(c.name)}</strong>
              <span style="color:var(--text-secondary); font-size:12px;"> \u2014 ${escapeHtml(c.title)}</span>
            </div>
          `).join("")}
        </div>
      ` : ""}
      <div class="email-sequence">
        ${emails.map((e, i) => legacyEmailCard(e, i)).join("")}
      </div>
    </div>`;
}

function legacyEmailCard(email, index) {
  const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${index}`;
  const timing =
    email.send_delay_days === 0
      ? "Send immediately"
      : `+${email.send_delay_days} days`;

  return `
    <div class="email-card">
      <div class="email-header">
        <span class="email-number">Email ${email.sequence_number}</span>
        <span class="email-timing">${timing}</span>
      </div>
      <div class="email-subject">${escapeHtml(email.subject)}</div>
      <div class="email-hook">Hook: ${escapeHtml(email.hook)}</div>
      <div class="email-body" id="${id}">${escapeHtml(email.body)}</div>
      <button class="copy-btn" onclick="copyEmail('${id}', this)">Copy</button>
    </div>`;
}

// ══════════════════════════════════════════
// MARKETS VIEW
// ══════════════════════════════════════════

const MARKET_CATEGORIES = ["All", "Niche", "General"];

function freshnessBadge(lastRefreshed) {
  if (!lastRefreshed) return '<span class="freshness-badge freshness-gray">No data</span>';
  const refreshDate = new Date(lastRefreshed);
  const now = new Date();
  const daysDiff = Math.floor((now - refreshDate) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 7) return `<span class="freshness-badge freshness-green">${daysDiff}d ago</span>`;
  if (daysDiff <= 30) return `<span class="freshness-badge freshness-amber">${daysDiff}d ago</span>`;
  return `<span class="freshness-badge freshness-gray">${daysDiff}d ago</span>`;
}

function renderMarketsSidebar() {
  const container = document.getElementById("markets-sidebar-content");
  const sectors = dashboardData.market_intelligence || [];

  if (!sectors.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:30px 10px;">
        <div class="empty-state-icon">&#127758;</div>
        <div class="empty-state-text">No market intelligence yet. Run a market research scan to populate.</div>
      </div>`;
    return;
  }

  // Flatten all articles across sectors, attach sector name
  const allArticles = [];
  for (const sector of sectors) {
    for (const article of sector.articles || []) {
      allArticles.push({ ...article, _sectorName: sector.name, _sectorCategory: sector.category });
    }
  }

  // Sort by date (newest first), articles without dates go to bottom
  allArticles.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  const top10 = allArticles.slice(0, 10);
  const hasMore = allArticles.length > 10;

  let html = `<a href="#" class="sidebar-view-all" onclick="event.preventDefault(); switchTab('markets'); closeSidebarGlobal();">Explore All Markets &rsaquo;</a>`;

  if (!top10.length) {
    html += '<div style="color:var(--text-muted); font-size:12px; text-align:center; padding:20px 0;">No articles yet.</div>';
  } else {
    html += top10.map(a => `
      <div class="sidebar-news-item">
        <a class="article-link" href="${escapeHtml(a.url)}" target="_blank" rel="noopener">${escapeHtml(a.title)}</a>
        <div class="article-meta">
          <span>${escapeHtml(a.source)}${a.date ? ' &middot; ' + a.date : ''}</span>
          <span class="sidebar-section-label">${escapeHtml(a._sectorName)}</span>
        </div>
        <div class="article-summary">${escapeHtml(a.summary)}</div>
      </div>
    `).join("");
  }

  if (hasMore) {
    html += `<a href="#" class="sidebar-bottom-link" onclick="event.preventDefault(); switchTab('markets'); closeSidebarGlobal();">View all ${allArticles.length} articles in Markets &rsaquo;</a>`;
  }

  container.innerHTML = html;
}

// ══════════════════════════════════════════
// FULL MARKETS PAGE
// ══════════════════════════════════════════

function renderMarkets() {
  const container = document.getElementById("view-markets");
  const sectors = dashboardData.market_intelligence || [];

  if (!sectors.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#127758;</div>
        <div class="empty-state-text">No market intelligence yet. Run a market research scan to populate.</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Market Intelligence</h2>
      <span class="expand-hint">click a sector to expand</span>
      <span class="section-count">${sectors.length} sectors</span>
    </div>
    <div class="filter-bar" id="markets-page-filter-bar"></div>
    <div class="card-grid" id="markets-page-card-grid"></div>`;

  // Build filter pills
  const filterBar = document.getElementById("markets-page-filter-bar");
  filterBar.innerHTML = MARKET_CATEGORIES.map((cat, i) =>
    `<button class="filter-pill${i === 0 ? " active" : ""}" data-category="${cat}">${cat}</button>`
  ).join("");
  filterBar.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      filterBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderMarketsPageCards(sectors, pill.dataset.category);
    });
  });

  renderMarketsPageCards(sectors, "All");
}

function renderMarketsPageCards(sectors, category) {
  const grid = document.getElementById("markets-page-card-grid");
  if (category === "All") {
    const niche = sectors.filter(s => s.category === "niche");
    const general = sectors.filter(s => s.category === "general");
    let html = "";
    if (niche.length) {
      html += '<div class="category-header">Niche Sectors</div>';
      html += niche.map(s => marketCard(s)).join("");
    }
    if (general.length) {
      html += '<div class="category-header">General Sectors</div>';
      html += general.map(s => marketCard(s)).join("");
    }
    grid.innerHTML = html;
  } else {
    const catKey = category.toLowerCase();
    const filtered = sectors.filter(s => s.category === catKey);
    grid.innerHTML = filtered.map(s => marketCard(s)).join("");
  }
  attachCardToggle(document.getElementById("view-markets"));
}

function renderMarketCards(sectors, category) {
  const grid = document.getElementById("market-card-grid");
  if (category === "All") {
    const niche = sectors.filter(s => s.category === "niche");
    const general = sectors.filter(s => s.category === "general");
    let html = "";
    if (niche.length) {
      html += '<div class="category-header">Niche Sectors</div>';
      html += niche.map(s => marketCard(s)).join("");
    }
    if (general.length) {
      html += '<div class="category-header">General Sectors</div>';
      html += general.map(s => marketCard(s)).join("");
    }
    grid.innerHTML = html;
  } else {
    const catKey = category.toLowerCase();
    const filtered = sectors.filter(s => s.category === catKey);
    grid.innerHTML = filtered.map(s => marketCard(s)).join("");
  }
  attachMarketCardToggle();
}

function marketCard(sector) {
  const articleCount = (sector.articles || []).length;
  const catClass = sector.category === "niche" ? "category-niche" : "category-general";
  const catLabel = sector.category === "niche" ? "Niche" : "General";

  return `
    <div class="card" data-sector-name="${escapeHtml(sector.name)}">
      <div class="card-header">
        <div class="card-company">${escapeHtml(sector.name)}</div>
        <div class="card-badges">
          <span class="category-badge ${catClass}">${catLabel}</span>
          ${freshnessBadge(sector.last_refreshed)}
        </div>
      </div>
      <div class="card-meta">
        <span>${articleCount} article${articleCount !== 1 ? "s" : ""}</span>
      </div>
      <div class="card-detail">
        <div class="dossier-section">
          <h4>Overview</h4>
          <div class="dossier-text">${escapeHtml(sector.overview)}</div>
        </div>
        ${sector.key_trends && sector.key_trends.length ? `
          <div class="dossier-section">
            <h4>Key Trends</h4>
            <ul class="trend-list">
              ${sector.key_trends.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
            </ul>
          </div>` : ""}
        <div class="dossier-section">
          <h4>McChrystal Angle</h4>
          <div class="dossier-text">${escapeHtml(sector.mcchrystal_angle)}</div>
        </div>
        ${sector.articles && sector.articles.length ? `
          <div class="dossier-section">
            <h4>Top Articles</h4>
            ${sector.articles.map(a => articleItem(a)).join("")}
          </div>` : ""}
        ${sector.prospect_candidates && sector.prospect_candidates.length ? `
          <div class="prospect-candidates-box">
            <h5>Companies to Watch</h5>
            <div class="prospect-candidates-tags">
              ${sector.prospect_candidates.map(c => `<span class="prospect-candidate-tag">${escapeHtml(c)}</span>`).join("")}
            </div>
          </div>` : ""}
        ${sector.last_refreshed ? `
          <div style="font-size:11px; color:var(--text-muted); margin-top:12px;">
            Last refreshed: ${sector.last_refreshed}
          </div>` : ""}
      </div>
    </div>`;
}

function articleItem(article) {
  const dateStr = article.date || "Recent";
  return `
    <div class="article-item">
      <a class="article-link" href="${escapeHtml(article.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation();">${escapeHtml(article.title)}</a>
      <div class="article-meta">${escapeHtml(article.source)} &middot; ${dateStr}</div>
      <div class="article-summary">${escapeHtml(article.summary)}</div>
      ${article.relevance_note ? `<div class="article-relevance">McChrystal relevance: ${escapeHtml(article.relevance_note)}</div>` : ""}
    </div>`;
}

function attachMarketCardToggle() {
  const container = document.getElementById("markets-sidebar-content");
  if (!container) return;
  container.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {
      // Don't collapse when clicking article links
      if (e.target.closest(".article-link")) return;
      const wasExpanded = card.classList.contains("expanded");
      container.querySelectorAll(".card.expanded").forEach(c => c.classList.remove("expanded"));
      if (!wasExpanded) card.classList.add("expanded");
    });
  });
}

function setupMarketsSidebar() {
  const toggle = document.getElementById("markets-toggle");
  const sidebar = document.getElementById("markets-sidebar");
  const overlay = document.getElementById("markets-overlay");
  const closeBtn = document.getElementById("markets-close");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    toggle.classList.add("active");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    toggle.classList.remove("active");
  }

  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
  });

  const collapseTab = document.getElementById("sidebar-collapse-tab");

  closeBtn.addEventListener("click", closeSidebar);
  if (collapseTab) collapseTab.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) closeSidebar();
  });

  // Expose for search integration and sidebar news feed links
  window.openMarketsSidebar = openSidebar;
  window.closeSidebarGlobal = closeSidebar;
}

// ══════════════════════════════════════════
// PROPOSALS VIEW
// ══════════════════════════════════════════

function renderProposals() {
  const container = document.getElementById("view-proposals");

  container.innerHTML = `
    <div class="home-section">
      <div class="hero" style="padding: 40px 20px 32px;">
        <div class="hero-title" style="font-size: 32px;">Proposal Engine</div>
        <div class="hero-subtitle" style="max-width: 640px;">
          Drop past proposals into a folder. Claude Code reads them, learns the patterns, and drafts new proposals from your dossier data. No training, no APIs \u2014 just files and AI.
        </div>
        <div style="margin-top: 16px; display: inline-block; padding: 4px 14px; border-radius: 20px; border: 1px solid var(--amber); color: var(--amber); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Coming Soon</div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">What This Will Become</div>
      <p style="color:var(--text-secondary); font-size:14px; line-height:1.7; margin-bottom:24px;">
        The Proposal Engine will learn from every proposal McChrystal Group has written \u2014 wins and losses \u2014 to generate first drafts that match your voice, pricing patterns, and scope structures. It bridges the gap between outreach and signed engagement.
      </p>
      <div class="method-grid">
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--green);">1</div>
          <h3>Learn from History</h3>
          <p>Drop past proposals, SOWs, and pricing sheets into <code>data/proposals/</code>. Claude Code reads them directly \u2014 no training step, no database. It learns McChrystal\u2019s language, scope structures, and how engagements are framed.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--amber);">2</div>
          <h3>Draft from Dossier</h3>
          <p>Pull directly from the research dossier to generate a tailored proposal. Maps the prospect\u2019s specific challenge to the right capability, scoping approach, team composition, and pricing tier \u2014 no blank page.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--purple);">3</div>
          <h3>Refine & Iterate</h3>
          <p>Senior Partners review and edit. The agent learns from corrections \u2014 adjusting tone, scope, pricing, and structure over time. Each iteration makes the next draft sharper.</p>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Pipeline Integration</div>
      <p style="color:var(--text-secondary); font-size:14px; line-height:1.7; margin-bottom:24px;">
        Proposals become Phase 4 of the BD pipeline. The full flow:
      </p>
      <div class="pipeline-grid">
        <div class="pipeline-card" onclick="switchTab('pipeline')">
          <div class="pipeline-card-step">Phase 1</div>
          <div class="pipeline-card-title">Discover</div>
          <div class="pipeline-card-desc">Identify high-fit prospects</div>
        </div>
        <div class="pipeline-card" onclick="switchTab('research')">
          <div class="pipeline-card-step">Phase 2</div>
          <div class="pipeline-card-title">Research</div>
          <div class="pipeline-card-desc">Build 10-section dossiers</div>
        </div>
        <div class="pipeline-card" onclick="switchTab('outreach')">
          <div class="pipeline-card-step">Phase 3</div>
          <div class="pipeline-card-title">Outreach</div>
          <div class="pipeline-card-desc">Cold email packages (A/B/C)</div>
        </div>
        <div class="pipeline-card" style="border-color: var(--amber);">
          <div class="pipeline-card-step" style="color: var(--amber);">Phase 4</div>
          <div class="pipeline-card-title">Propose</div>
          <div class="pipeline-card-desc">AI-drafted proposals from dossier data + historical patterns</div>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">What the Agent Will Need</div>
      <div class="method-grid">
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--ui-bright);">\u2197</div>
          <h3>Past Proposals</h3>
          <p>PDFs, Word docs, or text files in <code>data/proposals/</code>. Both wins and losses. Claude Code reads them on demand \u2014 the more examples, the better the output.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--ui-bright);">\u2696</div>
          <h3>Pricing Guidelines</h3>
          <p>Rate cards, engagement tier structures, staffing models, and any pricing guardrails. The agent won\u2019t guess \u2014 it needs boundaries.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--ui-bright);">\u2713</div>
          <h3>Win/Loss Context</h3>
          <p>What made winning proposals work? Why did losses fall short? This feedback loop is what separates a template filler from a proposal engine that improves.</p>
        </div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════
// HOW IT WORKS VIEW
// ══════════════════════════════════════════

function renderHowItWorks() {
  const container = document.getElementById("view-how-it-works");

  container.innerHTML = `
    <div class="home-section">
      <div class="home-section-title">Pipeline Workflow</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Overwatch is a fully automated BD engine. One command \u2014 \u201Crun discovery for 10 new prospects\u201D \u2014 triggers the entire pipeline: market intelligence mining, web research, ICP scoring, parallel subagent dossier research, outreach drafting, and live dashboard deployment. No manual handoffs between phases.
      </p>
      <div class="pipeline-grid">
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 1</div>
          <div class="pipeline-card-title">Discovery</div>
          <div class="pipeline-card-desc">
            Mines 13 market sector feeds for ICP signals, then searches the web for organizations showing transformation triggers. Each prospect is scored on a 100-point model and deduplicated against the existing pipeline.
          </div>
        </div>
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 2</div>
          <div class="pipeline-card-title">Research</div>
          <div class="pipeline-card-desc">
            Parallel subagents build 10-section dossiers: org snapshot, company overview, financials, leadership profiles, culture signals, trigger events, fit assessment, conversation entry points, brand insights &amp; market positioning, and deep McChrystal fit analysis.
          </div>
        </div>
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 3</div>
          <div class="pipeline-card-title">Outreach</div>
          <div class="pipeline-card-desc">
            Parallel subagents draft 3 independent cold email versions (A/B/C) plus LinkedIn messages per prospect, each with a genuinely different opening strategy. Targets champion-level contacts, not CEOs.
          </div>
        </div>
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 4</div>
          <div class="pipeline-card-title">Proposals</div>
          <div class="pipeline-card-desc">
            AI-drafted proposals using McChrystal Group\u2019s historical proposals, SOWs, and pricing as reference material. Matches voice, scope structure, staffing models, and pricing patterns. <span style="color:var(--amber-text); font-size:11px; font-weight:700;">Coming Soon</span>
          </div>
        </div>
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 5</div>
          <div class="pipeline-card-title">Future Enablement</div>
          <div class="pipeline-card-desc">
            Closed-loop learning, CRM integration, competitive intelligence monitoring, and automated pipeline nurturing. Outcomes feed back into scoring and outreach to sharpen every future recommendation. <span style="color:var(--amber-text); font-size:11px; font-weight:700;">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Discovery Engine</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Discovery starts by mining 13 market sector feeds for companies showing ICP signals, then searches the web for additional targets. Runs sequentially in a single context window \u2014 NOT delegated to subagents. Prospect selection requires judgment, cross-referencing, and deduplication that benefits from unified context.
      </p>

      <div class="method-grid" style="margin-bottom:20px;">
        <div class="method-card">
          <div class="method-card-icon" style="color:#da6123;">&#8635;</div>
          <h3>Market Intel Mining</h3>
          <p>Scans market intelligence for prospect candidates before web research. Each sector\u2019s \u201CCompanies to Watch\u201D is cross-referenced against existing pipeline. Best candidates become Source A; fresh web research becomes Source B.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">&#9906;</div>
          <h3>Web Research</h3>
          <p>Searches across all 3 industry tiers \u2014 Conventional, Adjacent, and Unconventional. Multiple sources cross-referenced per prospect. Prioritizes non-obvious, creative companies over household names.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--green);">&#10003;</div>
          <h3>Validation</h3>
          <p>Revenue and employee data confirmed or marked [INFERRED]. Specific trigger events with dates (month/year minimum). Named leadership contacts identified for each prospect.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--purple);">&#9851;</div>
          <h3>Deduplication</h3>
          <p>Every new prospect checked against existing dashboard.json to avoid re-discovering known companies. Ensures the pipeline only surfaces net-new opportunities.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--amber);">&#9888;</div>
          <h3>Quality Gates</h3>
          <p>No generic Fortune 500s. Every prospect needs a current, specific reason to reach out NOW. Model knowledge used to frame and contextualize, not as a primary source of facts.</p>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Why Sequential?</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          Discovery is NOT delegated to subagents. Prospect selection requires judgment and cross-referencing that benefits from a single context window \u2014 the agent needs to see all candidates at once to avoid duplicates, balance industry mix, and ensure each pick has a compelling, differentiated reason for outreach.
        </div>
      </div>

      <div class="home-section-title" style="margin-top:24px;">Scoring Model (100 points)</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Every prospect is scored across four dimensions. The weights reflect McChrystal Group\u2019s value drivers \u2014 signals matter most because they indicate timing and urgency.
      </p>
      <div class="scoring-bars">
        <div class="score-bar-row">
          <div class="score-bar-label">Signals</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-signals" style="width: 35%;">35</div>
          </div>
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">Top 4 signals scored on base (60%) + recency bonus (40% if &lt;30d, 30% &lt;90d, 20% &lt;180d, 10% older)</div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">Revenue Fit</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-revenue" style="width: 25%;">25</div>
          </div>
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">$500M\u2013$10B sweet spot (70\u2013100%); below pro-rata \u00d7 0.5; above $10B 60%; unknown 30%</div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">Employee Count</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-employees" style="width: 20%;">20</div>
          </div>
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">2,000+ preferred (70\u2013100%); 500\u20132K partial (50\u201370%); below 500 pro-rata \u00d7 0.3</div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">McChrystal Fit</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-fit" style="width: 20%;">20</div>
          </div>
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">High-fit signals (reorg, transformation, M&A, hiring, funding, partnership) 5 pts each (max 12) + diversity bonus 2 pts/type (max 8)</div>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-top:16px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Scoring Details</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.8;">
          <strong>Signal cap:</strong> Only the top 4 signals count \u2014 prevents signal-stuffing and keeps the model balanced.<br>
          <strong>Recency weighting:</strong> Recent signals score higher. A leadership change last month is worth more than one from a year ago.<br>
          <strong>High-fit signals:</strong> Reorg, transformation, M&A, hiring surge, funding, and partnership map directly to McChrystal capabilities and score 5 pts each in the fit component (capped at 12).<br>
          <strong>Signal diversity:</strong> Prospects with multiple different signal types score a 2 pt bonus per unique type (capped at 8). Diverse signals suggest complex situations \u2014 McChrystal\u2019s sweet spot.<br>
          <strong>Formula:</strong> <code style="background:var(--bg-card); padding:2px 6px; border-radius:3px; font-size:12px;">score = revenue + employees + signals + fit</code>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Research Subagent Architecture</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Prospects are split into batches and delegated to parallel subagents. Each subagent performs deep web research and builds complete dossiers autonomously. If subagents can\u2019t execute the save pipeline directly, the main agent builds dossiers in sequential batches \u2014 same research depth, same output quality.
      </p>

      <div class="method-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:20px;">
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">3\u20134</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Companies per batch</div>
        </div>
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">2\u20133</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Parallel subagents</div>
        </div>
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">10</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Dossier sections each</div>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:20px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Subagent Prompt Construction</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          Each subagent receives: company name, industry, revenue, employee count, tier, signals, and the full 10-section dossier requirements. Per-company research includes: recent news (last 6 months), leadership bios &amp; LinkedIn presence, Glassdoor/culture signals, financial data &amp; analyst sentiment, competitor presence, McChrystal-specific fit angles, brand value/rankings &amp; CMO strategy, and multi-dimensional fit analysis with competitor displacement logic and deal sizing.
        </div>
      </div>

      <div class="home-section-title" style="margin-top:24px;">Dossier Sections</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Each dossier follows a standardized 10-section format. The goal: a Senior Partner can read it in under 10 minutes and walk into a meeting prepared.
      </p>
      <div class="method-grid">
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">1</div>
          <h3>Organization Snapshot</h3>
          <p>Legal name, HQ, founding year, ownership structure, geographic footprint. The basics a partner needs before the first call.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">1b</div>
          <h3>Company Overview</h3>
          <p>In-depth narrative (3\u20135 sentences) covering what the company does, how it makes money, ownership history, major recent events, and current strategic direction. Stands alone as a complete introduction.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--green);">2</div>
          <h3>Financial Health</h3>
          <p>Revenue trajectory, profitability, analyst sentiment. Key pressures and tailwinds that shape the conversation.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--purple);">3</div>
          <h3>Leadership Profiles</h3>
          <p>C-suite and board with tenure, background, and public persona. 1\u20132 priority targets at champion level (VP/SVP/CTO/Head of Strategy) \u2014 not the CEO. CEO listed as executive sponsor; champion-level contacts flagged as outreach targets.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--amber);">4</div>
          <h3>Culture &amp; Structure</h3>
          <p>Hierarchy vs. flat, Glassdoor patterns, known transformation programs. Where the org\u2019s structure is helping or hurting.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--red);">5</div>
          <h3>Trigger Events</h3>
          <p>5\u20137 most relevant developments from the last 18 months. Each event includes date, description, and why it matters for McChrystal.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#db4c9c;">6</div>
          <h3>Fit Assessment</h3>
          <p>Primary problem, best capability fit, likely objections, competitive landscape. Rated Strong, Moderate, or Speculative.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--text-secondary);">7</div>
          <h3>Conversation Entry Points</h3>
          <p>2\u20133 opening questions for a Senior Partner, mutual connections, recommended first meeting framing.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#da6123;">8</div>
          <h3>Brand Insights &amp; Market Positioning</h3>
          <p>Brand value and competitive standing, identity evolution, CMO strategy and campaigns, brand threats (disintermediation, invisibility), and major brand investments. Every insight connects back to an organizational challenge McChrystal can address.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#c75d5d;">9</div>
          <h3>Deep McChrystal Fit Analysis</h3>
          <p>The most critical section \u2014 6 subsections: fit dimensions with competitor displacement logic (9a), cumulative case with revenue estimate (9b), enterprise issues &amp; organizational challenges (9c), expected outcomes with measurable deliverables (9d), key stakeholders &amp; business unit map (9e), and opportunity thesis with phased engagement plan and multi-threaded pursuit map (9f).</p>
        </div>
      </div>

      <div class="home-section-title" style="margin-top:24px;">Fit Rating Criteria</div>
      <div class="method-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:20px;">
        <div class="method-card" style="border-left: 3px solid var(--green);">
          <h3 style="color: var(--green);">Strong</h3>
          <p>Problem directly maps to a McChrystal capability AND at least 2 of: active trigger event (last 6 months), clear economic buyer identified, budget likely exists (revenue >$1B or known transformation spend), low competitive barrier, organizational urgency.</p>
        </div>
        <div class="method-card" style="border-left: 3px solid var(--amber);">
          <h3 style="color: var(--amber);">Moderate</h3>
          <p>Clear McChrystal fit but engagement uncertain due to at least 1 of: financial distress limiting advisory spend, no clear entry point, trigger event >12 months old or speculative, strong incumbent competitor, cultural resistance to external advisory.</p>
        </div>
        <div class="method-card" style="border-left: 3px solid var(--text-muted);">
          <h3 style="color: var(--text-muted);">Speculative</h3>
          <p>Plausible fit but significant unknowns: problem is inferred not confirmed, Tier 3 industry with no prior McChrystal track record, org size/budget may be below threshold, would require significant education on McChrystal\u2019s model.</p>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border);">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Quality Standards</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          Flag [INFERRED] vs. confirmed facts. Say \u201Cunavailable\u201D rather than fabricate. Prioritize recency (24 months). Every fact should come from a web search, not model knowledge.
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Outreach Subagent Architecture</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Prospects are split into batches of 5 and delegated to 2 parallel subagents. Each loads dossier data and drafts 3 independent cold email versions. If subagents are unavailable, the main agent builds all outreach packages directly \u2014 dossier data is already in the pipeline, so no additional web research is needed.
      </p>

      <div class="method-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:20px;">
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">5</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Companies per batch</div>
        </div>
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">2</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Parallel subagents</div>
        </div>
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">3</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Versions per package</div>
        </div>
      </div>

      <div class="home-section-title" style="margin-top:24px;">Cold Email Versions (A/B/C)</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:16px;">
        Each outreach package contains 3 independent cold email versions with genuinely different opening strategies. Pick whichever resonates most for each prospect.
      </p>
      <div class="method-grid" style="margin-bottom:20px;">
        <div class="method-card" style="border-left: 3px solid var(--green);">
          <h3 style="color: var(--green);">Version A \u2014 Trigger-based</h3>
          <p>Leads with a specific, recent event from the dossier (restructuring announcement, leadership change, earnings miss). Connects it directly to a McChrystal capability. Shows we\u2019ve done our homework.</p>
        </div>
        <div class="method-card" style="border-left: 3px solid var(--amber);">
          <h3 style="color: var(--amber);">Version B \u2014 Insight-based</h3>
          <p>Opens with an industry trend or pattern, then pivots to how it maps to the prospect\u2019s situation. Positions McChrystal as someone who sees the landscape, not just the company.</p>
        </div>
        <div class="method-card" style="border-left: 3px solid #7ab8f5;">
          <h3 style="color: #7ab8f5;">Version C \u2014 Warm angle</h3>
          <p>Finds a human connection: shared network, military background, mutual board member, alma mater, conference appearance. Uses that warmth to earn the first read.</p>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Email Structure (all versions)</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.8;">
          1. <strong>Opening hook</strong> \u2014 specific, relevant, human (2\u20133 sentences)<br>
          2. <strong>Bridge</strong> \u2014 why McChrystal Group is reaching out now (2\u20133 sentences)<br>
          3. <strong>Credibility signal</strong> \u2014 one concrete proof point (1\u20132 sentences)<br>
          4. <strong>Soft ask</strong> \u2014 20-minute call, low-friction (1\u20132 sentences)<br>
          5. <strong>Signature block</strong>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Targeting Logic</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          Target champion-level contacts (VP, SVP, Chief Transformation Officer, Head of Strategy) \u2014 NOT the CEO. These are the people who feel the pain daily and can champion McChrystal internally. CEO stays as a contact but is marked \u201Cexecutive sponsor,\u201D not outreach target.
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Tone &amp; Quality Standards</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          150\u2013200 words max per version. Warm but credible, peer-to-peer \u2014 not salesy. No buzzwords, no firm bragging in the first half. The 3 versions must be genuinely different \u2014 not the same email with swapped openers. Should not be detectable as AI-generated. Flag [GAP] if a version can\u2019t find a real angle.
        </div>
      </div>

      <div class="home-section-title" style="margin-top:24px;">LinkedIn Message</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:16px;">
        Each outreach package also includes one LinkedIn message \u2014 a short, conversational touchpoint a Senior Partner can copy-paste directly into LinkedIn.
      </p>
      <div class="method-grid" style="margin-bottom:20px;">
        <div class="method-card" style="border-left: 3px solid #0a66c2;">
          <h3 style="color: #0a66c2;">Connection Request or InMail</h3>
          <p>50\u2013100 words max. More casual than email \u2014 no signature block, no formal structure. Should feel like a real person reaching out, not a template. References one specific thing about the contact or their company.</p>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Market Intelligence</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        A living feed of curated market and sector intelligence across 13 sectors \u2014 8 niche and 5 general. AI searches the web for the latest developments, curates 5\u201310 articles per sector, and connects every story back to McChrystal Group\u2019s BD pipeline.
      </p>

      <div class="method-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:20px;">
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">13</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Tracked sectors</div>
        </div>
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">5\u201310</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Articles per sector</div>
        </div>
        <div class="method-card" style="text-align:center;">
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">30d</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Rolling freshness window</div>
        </div>
      </div>

      <div class="home-section-title" style="margin-top:24px;">Sector Coverage</div>
      <div class="method-grid" style="margin-bottom:20px;">
        <div class="method-card" style="border-left: 3px solid var(--accent);">
          <h3 style="color: var(--accent);">Niche Sectors</h3>
          <p>PE-Backed Roll-Ups, Post-Merger Integrations, Defense Consolidation, Healthcare M&A, Energy Transition, Tech Spinoffs & Carve-outs, Government Transformation, Sports & Entertainment Ownership</p>
        </div>
        <div class="method-card" style="border-left: 3px solid var(--green);">
          <h3 style="color: var(--green);">General Sectors</h3>
          <p>Technology & AI, Financial Services, Industrial & Manufacturing, Healthcare Systems, Energy & Utilities</p>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">How It Works</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.8;">
          1. <strong>Research</strong> \u2014 AI performs web searches across all 13 sectors for news from the last 30 days<br>
          2. <strong>Curate</strong> \u2014 5\u201310 articles selected per sector from diverse sources (WSJ, Reuters, Bloomberg, industry trades)<br>
          3. <strong>Analyze</strong> \u2014 Each sector gets an overview thesis, key trends, and a McChrystal angle explaining why it matters for BD<br>
          4. <strong>Connect</strong> \u2014 Every article gets a relevance note tying it back to McChrystal Group\u2019s capabilities and pipeline<br>
          5. <strong>Deploy</strong> \u2014 Data flows to dashboard.json, powering both the sidebar news feed and full Markets page
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Two Views, One Dataset</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          <strong>Sidebar (quick scan):</strong> Click \u201CMarkets\u201D in the nav bar to open a sliding panel with the 10 most recent articles across all sectors. Compact feed with sector badges and one-line summaries.<br><br>
          <strong>Full Markets page (deep dive):</strong> All 13 sectors grouped by Niche/General with filter pills. Each sector card expands to show overview, key trends, McChrystal angle, all articles with clickable links, and freshness badges (green \u22647d, amber \u226430d, gray >30d).
        </div>
      </div>

      <div style="border-left: 3px solid #da6123; padding: 12px 16px; background: rgba(218,97,35,0.06); border-radius: 0 6px 6px 0; font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
        <strong style="color: var(--text-primary);">Cross-Pollination Loop</strong><br>
        Market intelligence isn\u2019t just a news feed \u2014 it feeds the discovery pipeline. Each sector\u2019s \u201CCompanies to Watch\u201D captures organizations showing ICP signals. Before a discovery cycle, the agent mines these candidates, cross-references against the existing pipeline, and includes the best alongside fresh web research targets.
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Proposal Engine <span style="background:var(--amber-bg); color:var(--amber-text); font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; margin-left:12px; text-transform:none; letter-spacing:0;">Coming Soon</span></div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Phase 4 of the BD pipeline \u2014 bridges outreach to signed engagement. AI-drafted proposals using McChrystal Group\u2019s historical proposals as reference material.
      </p>

      <div class="method-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:20px;">
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">1</div>
          <h3>Reference Library</h3>
          <p>Past proposals, SOWs, pricing sheets, and contracts stored in <code style="background:var(--bg); padding:2px 6px; border-radius:4px; font-size:12px;">data/proposals/</code>. Both wins and losses, with context on what worked.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--green);">2</div>
          <h3>AI Draft Generation</h3>
          <p>Claude Code reads relevant reference proposals + the prospect\u2019s dossier, then generates a first draft matching McChrystal\u2019s voice, scope structure, staffing models, and pricing patterns.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--purple);">3</div>
          <h3>Review & Learn</h3>
          <p>Senior Partners review and correct. Claude Code learns from the feedback over time, improving draft quality with each iteration.</p>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border);">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">What\u2019s Needed to Activate</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          Past proposals dropped into <code style="background:var(--bg); padding:2px 6px; border-radius:4px; font-size:12px;">data/proposals/</code> \u2014 both wins and losses. Pricing guidelines and rate cards. Win/loss context (what worked, what didn\u2019t).
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Pipeline Orchestration</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        One instruction runs the full pipeline. Say \u201Cexecute new discovery for 10\u201D and the agent handles market mining, web research, ICP scoring, subagent batching for dossiers and outreach, verification, and deployment \u2014 all without human intervention between phases.
      </p>

      <div class="method-grid" style="margin-bottom:20px;">
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--accent);">&#9654;</div>
          <h3>Single-Command Flow</h3>
          <p>Market Mining \u2192 Discover \u2192 Research \u2192 Outreach from one instruction. No manual handoffs between phases \u2014 the agent orchestrates the full pipeline end-to-end.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--green);">&#9881;</div>
          <h3>Orchestration Helpers</h3>
          <p><code style="background:var(--bg); padding:2px 6px; border-radius:4px; font-size:12px;">get_existing_prospects()</code> loads current state. <code style="background:var(--bg); padding:2px 6px; border-radius:4px; font-size:12px;">pipeline_status()</code> shows counts by phase. <code style="background:var(--bg); padding:2px 6px; border-radius:4px; font-size:12px;">clear_phase()</code> resets a phase before regenerating.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--purple);">&#10003;</div>
          <h3>Verification</h3>
          <p><code style="background:var(--bg); padding:2px 6px; border-radius:4px; font-size:12px;">pipeline_status()</code> confirms all prospects have dossiers and outreach. Gaps are flagged before deployment.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">&#9729;</div>
          <h3>Deployment</h3>
          <p>Push to GitHub \u2192 auto-deploys to live dashboard via GitHub Pages. Data flows from Markdown reports \u2192 dashboard.json \u2192 static site.</p>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:12px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">What \u201COne Command\u201D Actually Does</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.8;">
          1. Mines market intelligence for prospect candidates<br>
          2. Searches the web for additional companies showing ICP signals<br>
          3. Scores each prospect on the 100-point ICP model<br>
          4. Splits scored prospects into batches of 3\u20134<br>
          5. Launches parallel subagents \u2014 each builds a full 10-section dossier<br>
          6. Splits dossier\u2019d prospects into batches of 5<br>
          7. Launches parallel subagents \u2014 each drafts 3 cold emails + LinkedIn message<br>
          8. Runs pipeline_status() to verify completeness<br>
          9. Pushes to GitHub \u2192 live dashboard updates automatically
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border);">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Quality Gates (applied at every step)</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.8;">
          \u2022 Every fact should come from a web search, not model knowledge<br>
          \u2022 Dates must be specific (month/year minimum), not \u201Crecently\u201D or \u201Cin recent years\u201D<br>
          \u2022 Revenue and employee figures must be sourced or marked [INFERRED]<br>
          \u2022 If a prospect has no compelling current signal upon deeper research, drop it and find a replacement
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Signal Types</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Signals are the primary scoring driver. Each indicates a specific organizational moment where McChrystal Group\u2019s capabilities are most relevant.
      </p>
      <div class="signal-grid">
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--amber);">Reorg</div>
          <div class="signal-card-desc">Restructuring, layoffs, unit consolidation. The org chart is in flux \u2014 cross-functional alignment is critical before silos harden in the new structure.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: #7ab8f5;">M&A</div>
          <div class="signal-card-desc">Mergers and acquisitions. Two cultures, two operating models, one deadline. Integration failures are leadership failures.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: #db4c9c;">Leadership Change</div>
          <div class="signal-card-desc">New CEO, C-suite turnover, board shakeup. Fresh mandate creates a window of openness to external advisory \u2014 but the window closes fast.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--red);">Earnings Miss</div>
          <div class="signal-card-desc">Guidance shortfalls, activist pressure, public struggles. Often a leadership or culture problem masquerading as a strategy problem.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--green);">Rapid Growth</div>
          <div class="signal-card-desc">Scaling past structures. What worked at 500 people breaks at 2,000. Coordination collapses, silos form, decision-making slows.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--purple);">Transformation</div>
          <div class="signal-card-desc">Digital, operational, or strategic pivots. New operating models that require organization-wide change \u2014 not just new technology.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: #2db7b7;">Hiring Surge</div>
          <div class="signal-card-desc">Executive hiring waves, new C-suite roles created, talent acquisition patterns. When companies build new leadership teams, they\u2019re signaling a strategic shift that needs alignment.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: #5aafff;">Funding</div>
          <div class="signal-card-desc">PE recapitalizations, funding rounds, credit facilities, secondary offerings. Capital infusion often precedes transformation \u2014 the money arrives, then the hard organizational work begins.</div>
        </div>
        <div class="signal-card">
          <div class="signal-card-name" style="color: var(--accent);">Partnership</div>
          <div class="signal-card-desc">Strategic partnerships, joint ventures, platform alliances. New external relationships that force internal operating model changes \u2014 coordination challenges multiply with each partner.</div>
        </div>
      </div>
    </div>
  `;
}

function renderFuture() {
  const container = document.getElementById("view-future");

  container.innerHTML = `
    <div class="home-section">
      <div class="hero" style="padding: 40px 20px 32px;">
        <div class="hero-title" style="font-size: 32px;">Future Possibilities</div>
        <div class="hero-subtitle" style="max-width: 660px;">
          Where this platform is headed \u2014 from structured research and outreach toward a proactive, always-on decision-support system.
        </div>
      </div>
    </div>

    <div class="home-section">
      <div style="border-left: 4px solid var(--accent); padding: 16px 20px; background: rgba(218,97,35,0.06); border-radius: 0 8px 8px 0; margin-bottom: 32px;">
        <p style="color:var(--text-secondary); font-size:14px; line-height:1.7; margin:0;">
          Today Overwatch runs when you tell it to \u2014 discover, research, draft outreach. The next evolution is a system that watches the market continuously, surfaces opportunities before anyone asks, and learns from every win and loss to get sharper over time. The features below represent the path from a powerful tool to an intelligent partner.
        </p>
      </div>

      <div class="method-grid">
        <div class="method-card">
          <div class="method-card-icon" style="color: #6bc9a0;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10"/>
              <path d="M2 12h20"/>
              <path d="M12 2v20"/>
            </svg>
          </div>
          <h3>Signal-Triggered Opportunity Discovery</h3>
          <p>Continuous monitoring of news feeds, SEC filings, funding announcements, and leadership changes. When a signal fires \u2014 a CEO departure, a PE recapitalization, a major reorg \u2014 the system auto-surfaces the company, scores it against the ICP, and initiates the research workflow without waiting for a human prompt.</p>
        </div>

        <div class="method-card">
          <div class="method-card-icon" style="color: #a78bdb;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </div>
          <h3>Automated Dossier Enrichment</h3>
          <p>Dossiers go stale fast. This capability periodically refreshes every company profile \u2014 checking for new leadership appointments, earnings reports, funding events, hiring surges, and strategic announcements. Stale sections get flagged, updated data gets merged, and the fit rating adjusts automatically.</p>
        </div>

        <div class="method-card">
          <div class="method-card-icon" style="color: #7ab8f5;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
            </svg>
          </div>
          <h3>Contact Discovery & Identification</h3>
          <p>Analyzing public sources \u2014 LinkedIn, conference speakers, published articles, board filings \u2014 to identify the right decision-makers at each prospect. Contacts are prioritized by role relevance to the opportunity thesis: transformation leads, strategy chiefs, and operational leaders who feel the pain daily.</p>
          <p style="margin-top:10px; font-size:12px; color:var(--text-tertiary); border-top:1px solid var(--border); padding-top:8px;">
            <strong>Planned integration:</strong> Apollo.io for contact database enrichment \u2014 verified emails, direct dials, and org chart mapping at scale.
          </p>
        </div>

        <div class="method-card">
          <div class="method-card-icon" style="color: #e8c547;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M7 16l4-8 4 4 4-8"/>
            </svg>
          </div>
          <h3>Adaptive Opportunity Scoring</h3>
          <p>The current scoring model uses fixed weights. The next version learns from historical outcomes \u2014 which signal combinations actually converted, which revenue bands closed fastest, which industries had the highest engagement rates \u2014 and continuously refines the scoring criteria to surface better prospects.</p>
        </div>

        <div class="method-card">
          <div class="method-card-icon" style="color: #da6123;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4"/>
              <path d="M12 18v4"/>
              <path d="M4.93 4.93l2.83 2.83"/>
              <path d="M16.24 16.24l2.83 2.83"/>
              <path d="M2 12h4"/>
              <path d="M18 12h4"/>
              <path d="M4.93 19.07l2.83-2.83"/>
              <path d="M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h3>Pipeline Learning & Feedback Integration</h3>
          <p>Closing the loop. When a prospect converts (or doesn\u2019t), that outcome feeds back into the system. Over time, the agent learns which dossier patterns predict success, which outreach angles get responses, and which fit assessments were right \u2014 making every future recommendation sharper.</p>
        </div>

        <div class="method-card">
          <div class="method-card-icon" style="color: #5b9bd5;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6l-4 5-4-5c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
              <path d="M4.5 16.5L2 22h20l-2.5-5.5"/>
            </svg>
          </div>
          <h3>Strategic BD Intelligence Layer</h3>
          <p>The synthesis layer. Instead of individual prospect reports, the system generates portfolio-level insights: market trends across the pipeline, emerging industry clusters, competitive advisor movements, and strategic recommendations for where McChrystal Group should focus BD resources. Reduces manual overhead and supports informed, high-level decisions.</p>
        </div>

        <div class="method-card">
          <div class="method-card-icon" style="color: #c9a06b;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="5" cy="6" r="2"/>
              <circle cx="19" cy="6" r="2"/>
              <circle cx="12" cy="18" r="2"/>
              <circle cx="12" cy="6" r="2"/>
              <circle cx="5" cy="18" r="2"/>
              <circle cx="19" cy="18" r="2"/>
              <line x1="7" y1="6" x2="10" y2="6"/>
              <line x1="14" y1="6" x2="17" y2="6"/>
              <line x1="6.5" y1="7.5" x2="10.5" y2="16.5"/>
              <line x1="17.5" y1="7.5" x2="13.5" y2="16.5"/>
              <line x1="5" y1="16" x2="5" y2="8"/>
              <line x1="19" y1="16" x2="19" y2="8"/>
            </svg>
          </div>
          <h3>Opportunity Network Mapping</h3>
          <p>Visualizing the hidden connections between companies, executives, investors, board members, and partners across the pipeline. Surface warm introduction paths \u2014 shared board members, PE firms with multiple portfolio companies in the pipeline, executives who\u2019ve moved between prospects \u2014 turning cold outreach into warm conversations.</p>
        </div>
      </div>
    </div>
  `;
}

// ── Shared utilities ──

function attachCardToggle(container, skipCopyBtn = false) {
  container.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (skipCopyBtn && e.target.closest(".copy-btn")) return;
      const wasExpanded = card.classList.contains("expanded");
      container
        .querySelectorAll(".card.expanded")
        .forEach((c) => c.classList.remove("expanded"));
      if (!wasExpanded) card.classList.add("expanded");
    });
  });
}

async function copyEmail(elementId, btn) {
  const el = document.getElementById(elementId);
  if (!el) return;

  try {
    await navigator.clipboard.writeText(el.textContent);
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    showToast("Copied to clipboard");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 2000);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("copy");
    sel.removeAllRanges();
    btn.textContent = "Copied!";
    showToast("Copied to clipboard");
    setTimeout(() => {
      btn.textContent = "Copy";
    }, 2000);
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function updateMeta() {
  // Search setup
  const input = document.getElementById("nav-search-input");
  const resultsDiv = document.getElementById("nav-search-results");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { resultsDiv.innerHTML = ""; resultsDiv.classList.remove("show"); return; }

    const matches = [];

    // Search prospects
    for (const run of dashboardData.discovery_runs || []) {
      for (const p of run.prospects || []) {
        if (p.company_name.toLowerCase().includes(q) && !matches.find(m => m.name === p.company_name)) {
          matches.push({ name: p.company_name, score: p.score, views: ["pipeline"] });
        }
      }
    }

    // Check dossiers & outreach
    for (const d of dashboardData.dossiers || []) {
      const name = d.prospect?.company_name;
      if (name?.toLowerCase().includes(q)) {
        const existing = matches.find(m => m.name === name);
        if (existing) { existing.views.push("research"); }
        else { matches.push({ name, score: d.prospect?.score || 0, views: ["research"] }); }
      }
    }
    for (const s of dashboardData.outreach_packages || dashboardData.outreach_sequences || []) {
      const name = s.dossier?.prospect?.company_name;
      if (name?.toLowerCase().includes(q)) {
        const existing = matches.find(m => m.name === name);
        if (existing && !existing.views.includes("outreach")) { existing.views.push("outreach"); }
        else if (!existing) { matches.push({ name, score: s.dossier?.prospect?.score || 0, views: ["outreach"] }); }
      }
    }

    // Search market sectors
    for (const sector of dashboardData.market_intelligence || []) {
      if (sector.name?.toLowerCase().includes(q) && !matches.find(m => m.name === sector.name)) {
        matches.push({ name: sector.name, score: 0, views: ["markets"] });
      }
    }

    if (!matches.length) {
      resultsDiv.innerHTML = '<div class="search-result-item search-empty">No matches</div>';
      resultsDiv.classList.add("show");
      return;
    }

    resultsDiv.innerHTML = matches.map(m => `
      <div class="search-result-item" data-company="${escapeHtml(m.name)}">
        <span class="search-result-name">${escapeHtml(m.name)}</span>
        <span class="search-result-meta">${Math.round(m.score)} &middot; ${m.views.join(", ")}</span>
      </div>
    `).join("");
    resultsDiv.classList.add("show");

    resultsDiv.querySelectorAll(".search-result-item[data-company]").forEach(item => {
      item.addEventListener("click", () => {
        const company = item.dataset.company;
        const match = matches.find(m => m.name === company);
        const views = match?.views || [];
        input.value = "";
        resultsDiv.innerHTML = "";
        resultsDiv.classList.remove("show");

        // If it's a market sector, open the full Markets page and expand matching card
        if (views.includes("markets")) {
          closeSidebarGlobal();
          switchTab("markets");
          setTimeout(() => {
            const marketsContainer = document.getElementById("view-markets");
            if (!marketsContainer) return;
            marketsContainer.querySelectorAll(".card").forEach(card => {
              const nameEl = card.querySelector(".card-company");
              if (nameEl && nameEl.textContent.trim() === company) {
                card.classList.add("expanded");
                card.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            });
          }, 100);
          return;
        }

        const targetView = views.includes("research") ? "research" : views.includes("outreach") ? "outreach" : "pipeline";
        switchTab(targetView);

        // Expand the matching card
        setTimeout(() => {
          const container = document.getElementById("view-" + targetView);
          container.querySelectorAll(".card").forEach(card => {
            const nameEl = card.querySelector(".card-company");
            if (nameEl && nameEl.textContent.trim() === company) {
              card.classList.add("expanded");
              card.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          });
        }, 100);
      });
    });
  });

  // Close results on click outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-search")) {
      resultsDiv.innerHTML = "";
      resultsDiv.classList.remove("show");
    }
  });
}
