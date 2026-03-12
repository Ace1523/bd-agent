/* BD Agent Dashboard — Client-side SPA */

let dashboardData = null;

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
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
  document
    .querySelector(`.nav-tab[data-view="${view}"]`)
    .classList.add("active");
  document.getElementById(`view-${view}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadData() {
  const views = ["home", "pipeline", "research", "outreach", "proposals", "how-it-works"];
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
  renderProposals();
  renderHowItWorks();
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
      <div class="hero-title">McChrystal Group BD Agent</div>
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
          <div class="method-card-icon">&#9670;</div>
          <h3>Team of Teams</h3>
          <p>Operating model implementation built on shared consciousness and empowered execution \u2014 the framework that transformed Joint Special Operations Command.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon">&#9650;</div>
          <h3>Leadership & Executive Coaching</h3>
          <p>Developing leaders who drive transformation in VUCA environments. Decentralized authority with aligned intent.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon">&#9724;</div>
          <h3>Organizational Design</h3>
          <p>Redesigning structures for adaptability and speed. Breaking hierarchies and silos that fail in fast-moving markets.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon">&#9675;</div>
          <h3>Crisis & High-Stakes Leadership</h3>
          <p>Decision-making under pressure. Culture change and trust-building at scale when failure has real consequences.</p>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">How It Works</div>
      <div class="method-grid">
        <div class="method-card">
          <div class="method-card-icon">&#9670;</div>
          <h3>Autonomous Discovery</h3>
          <p>Claude Code searches the web for organizations showing transformation signals. Each prospect is scored against a 100-point ICP model across 4 dimensions. No human input required \u2014 the agent identifies, validates, and ranks prospects independently.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon">&#9650;</div>
          <h3>Parallel Research Subagents</h3>
          <p>Prospects are split into batches and delegated to parallel subagents, each performing deep web research. Every subagent builds a complete 8-section dossier \u2014 from org snapshot and financials to leadership profiles and fit assessment. Multiple agents run simultaneously to cover 20 companies in minutes.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon">&#9724;</div>
          <h3>AI-Drafted Outreach</h3>
          <p>Subagents generate 3-email sequences per prospect, each tailored to specific trigger events and leadership contacts from the dossier. Written in Senior Partner voice \u2014 peer-to-peer, not sales copy.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon">&#9675;</div>
          <h3>Single-Command Pipeline</h3>
          <p>The entire flow (discover \u2192 research \u2192 outreach) runs from a single instruction. Pipeline orchestration tracks completeness, verifies quality gates, and deploys to a live dashboard automatically.</p>
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
          <div class="pipeline-card-desc">Build 7-section dossiers</div>
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
        BD Agent runs a three-phase pipeline entirely through AI. No manual data entry, no CRM integrations \u2014 Claude Code researches, scores, and writes everything.
      </p>
      <div class="pipeline-grid">
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 1</div>
          <div class="pipeline-card-title">Discover</div>
          <div class="pipeline-card-desc">
            AI searches the web for organizations showing transformation signals \u2014 leadership changes, M&A, restructuring, earnings pressure. Each prospect is scored against the Ideal Customer Profile on a 0\u2013100 scale.
          </div>
        </div>
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 2</div>
          <div class="pipeline-card-title">Research</div>
          <div class="pipeline-card-desc">
            Parallel subagents build 8-section dossiers: org snapshot, company overview, financials, leadership profiles, culture signals, trigger events, fit assessment, and conversation entry points. Designed to be read by a Senior Partner in under 10 minutes.
          </div>
        </div>
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 3</div>
          <div class="pipeline-card-title">Outreach</div>
          <div class="pipeline-card-desc">
            Parallel subagents draft 3 independent cold email versions (A/B/C) per prospect, each with a genuinely different opening strategy. Targets champion-level contacts, not CEOs.
          </div>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Discovery Engine</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Discovery runs sequentially in a single context window \u2014 NOT delegated to subagents. Prospect selection requires judgment, cross-referencing, and deduplication that benefits from unified context.
      </p>

      <div class="method-grid" style="margin-bottom:20px;">
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">&#9906;</div>
          <h3>Search Strategy</h3>
          <p>Web search across all 3 industry tiers \u2014 Conventional, Adjacent, and Unconventional. Multiple sources cross-referenced per prospect. Prioritizes non-obvious, creative companies over household names.</p>
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
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">Reorgs, M&A, leadership changes, earnings misses, transformation, hiring surges, funding, partnerships</div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">Revenue Fit</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-revenue" style="width: 25%;">25</div>
          </div>
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">$500M\u2013$10B sweet spot for premium advisory engagements</div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">Employee Count</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-employees" style="width: 20%;">20</div>
          </div>
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">2,000+ preferred \u2014 organizational complexity drives need</div>
        </div>
        <div class="score-bar-row">
          <div class="score-bar-label">McChrystal Fit</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-fit" style="width: 20%;">20</div>
          </div>
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">Industry tier weighting \u2014 Tier 1 (conventional) scores highest</div>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Research Subagent Architecture</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Prospects are split into batches and delegated to parallel subagents. Each subagent performs deep web research and builds complete dossiers autonomously.
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
          <div style="font-size:28px; font-weight:800; color:var(--text); margin-bottom:4px;">8</div>
          <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Dossier sections each</div>
        </div>
      </div>

      <div style="padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:20px;">
        <div style="color:var(--accent); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:700;">Subagent Prompt Construction</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          Each subagent receives: company name, industry, revenue, employee count, tier, signals, and the full 8-section dossier requirements. Per-company research includes: recent news (last 6 months), leadership bios &amp; LinkedIn presence, Glassdoor/culture signals, financial data &amp; analyst sentiment, competitor presence, and McChrystal-specific fit angles.
        </div>
      </div>

      <div class="home-section-title" style="margin-top:24px;">Dossier Sections</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Each dossier follows a standardized 8-section format. The goal: a Senior Partner can read it in under 10 minutes and walk into a meeting prepared.
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
          <p>C-suite and board with tenure, background, and public persona. 1\u20132 priority targets identified (economic buyer or champion) with rationale.</p>
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
        Prospects are split into batches of 5 and delegated to 2 parallel subagents. Each subagent performs additional web searches for the freshest hooks before drafting 3 independent cold email versions.
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
        The entire BD pipeline runs from a single instruction. Orchestration helpers track state, verify completeness, and deploy results.
      </p>

      <div class="method-grid" style="margin-bottom:20px;">
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--accent);">&#9654;</div>
          <h3>Single-Command Flow</h3>
          <p>Discover \u2192 Research \u2192 Outreach from one instruction. No manual handoffs between phases \u2014 the agent orchestrates the full pipeline end-to-end.</p>
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
        const views = matches.find(m => m.name === company)?.views || [];
        const targetView = views.includes("research") ? "research" : views.includes("outreach") ? "outreach" : "pipeline";
        switchTab(targetView);
        input.value = "";
        resultsDiv.innerHTML = "";
        resultsDiv.classList.remove("show");

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
