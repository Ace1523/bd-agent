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
  const sequenceCount = (dashboardData.outreach_sequences || []).length;

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
          <div class="icp-label">Outreach Sequences</div>
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
      <div class="home-section-title">Who We Target</div>
      <div class="icp-grid">
        <div class="icp-card">
          <div class="icp-value">$500M\u2013$10B</div>
          <div class="icp-label">Annual Revenue</div>
        </div>
        <div class="icp-card">
          <div class="icp-value">2,000+</div>
          <div class="icp-label">Employees</div>
        </div>
        <div class="icp-card">
          <div class="icp-value">$500K\u2013$5M+</div>
          <div class="icp-label">Engagement Size</div>
        </div>
        <div class="icp-card">
          <div class="icp-value">C-Suite</div>
          <div class="icp-label">Decision Makers</div>
        </div>
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
    <div class="card-grid">
      ${prospects.map((p, i) => prospectCard(p, i)).join("")}
    </div>`;

  attachCardToggle(container);
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

  container.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Research Dossiers</h2>
      <span class="expand-hint">click a tile to expand</span>
      <span class="section-count">${dossiers.length} dossiers</span>
    </div>
    <div class="card-grid">
      ${dossiers.map((d) => dossierCard(d)).join("")}
    </div>`;

  attachCardToggle(container);
}

function dossierCard(d) {
  const p = d.prospect || {};
  const contacts = d.key_contacts || [];
  const pains = d.pain_points || [];
  const competitors = d.competitors_present || [];
  const triggers = d.trigger_events || [];
  const fa = d.fit_assessment;
  const convos = d.conversation_entries || [];
  const hasOutreach = (dashboardData.outreach_sequences || []).some(
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
  const sequences = dashboardData.outreach_sequences || [];

  if (!sequences.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#9993;</div>
        <div class="empty-state-text">No outreach sequences yet.</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Outreach Sequences</h2>
      <span class="expand-hint">click a tile to expand</span>
      <span class="section-count">${sequences.length} sequences</span>
    </div>
    <div class="card-grid">
      ${sequences.map((s) => outreachCard(s)).join("")}
    </div>`;

  attachCardToggle(container, true);
}

function outreachCard(seq) {
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
              <strong style="color:var(--text-primary); font-size:13px;">${escapeHtml(c.name)}</strong>
              <span style="color:var(--text-secondary); font-size:12px;"> \u2014 ${escapeHtml(c.title)}</span>
            </div>
          `).join("")}
        </div>
      ` : ""}
      <div class="email-sequence">
        ${emails.map((e, i) => emailCard(e, i)).join("")}
      </div>
    </div>`;
}

function emailCard(email, index) {
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
          <div class="pipeline-card-desc">3-email sequences</div>
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
            For each scored prospect, AI builds a 7-section dossier: org snapshot, financials, leadership profiles, culture signals, trigger events, fit assessment, and conversation entry points. Designed to be read by a Senior Partner in under 10 minutes.
          </div>
        </div>
        <div class="pipeline-card">
          <div class="pipeline-card-step">Phase 3</div>
          <div class="pipeline-card-title">Outreach</div>
          <div class="pipeline-card-desc">
            AI drafts a 3-email sequence per prospect, each tailored to the specific situation surfaced in the dossier. Tone is peer-to-peer Senior Partner voice \u2014 not sales copy.
          </div>
        </div>
      </div>

      <div style="margin-top:32px;">
        <details class="prompt-block">
          <summary>View Discover Prompt</summary>
          <div class="prompt-content">
<strong>Firmographics</strong>
\u2022 Revenue: $500M\u2013$10B (sweet spot); premium boutique engagements ($500K\u2013$5M+)
\u2022 Employees: 500+ required, 2,000+ preferred

<strong>Fit Signals \u2014 what tells us they need McChrystal Group</strong>
\u2022 Navigating rapid scale, transformation, or disruption
\u2022 Leadership or culture problems masquerading as strategy problems
\u2022 Hierarchical or siloed structures failing in fast-moving markets
\u2022 High-stakes operating environments where failure has real consequences
\u2022 Leaders who respect mission-driven, no-BS advisory relationships
\u2022 C-suite changes, activist investor pressure, mergers/acquisitions, public organizational failures
\u2022 Earnings misses or strategic pivots
\u2022 Digital/operational transformation initiatives

<strong>Industry Aperture \u2014 Three Tiers</strong>

<span style="color:#7ab8f5;">Tier 1 \u2014 Conventional (proven hunting ground)</span>
Defense &amp; aerospace, federal agencies, financial services, healthcare systems, large industrials &amp; manufacturing

<span style="color:var(--purple);">Tier 2 \u2014 Adjacent (natural expansion)</span>
Tech companies losing agility at scale, PE portfolio companies post-acquisition, energy transition, logistics &amp; supply chain, professional services

<span style="color:var(--amber);">Tier 3 \u2014 Unconventional (high-upside bets)</span>
Sports organizations, trauma centers, media &amp; entertainment, NGOs, first responders, Series C+ startups, universities, infrastructure projects

<strong>Workflow</strong>
1. Search the web for organizations showing ICP signals across all three industry tiers
2. For each prospect, capture: organization name &amp; industry, why they fit, entry point (who to target), conversation hook, fit tier
3. Build Prospect objects with Signal entries, assign tier, score for ICP fit (0\u2013100)
4. Generate report grouped by tier (Tier 1 \u2192 Tier 2 \u2192 Tier 3)

<strong>Quality Standards</strong>
\u2022 Prioritize orgs with publicly visible leadership challenges, transitions, or transformation initiatives
\u2022 Flag recent C-suite changes, activist investor pressure, M&amp;A, or public organizational failures as high-priority
\u2022 For each Tier 3 prospect, include a one-sentence \u201Cwhy this is worth the unconventional bet\u201D rationale
\u2022 Do NOT target organizations already known to be McChrystal Group clients
          </div>
        </details>

        <details class="prompt-block">
          <summary>View Research Prompt</summary>
          <div class="prompt-content">
<strong>Objective</strong>
Comprehensive dossiers a Senior Partner can read in under 10 minutes. Seven sections:

<strong>1. Organization Snapshot</strong>
Legal name, HQ, founding year, ownership, geographic footprint

<strong>2. Financial Health &amp; Growth Stage</strong>
Revenue trajectory, profitability, analyst sentiment, key pressures/tailwinds

<strong>3. Leadership Team Profiles</strong>
C-suite + board with tenure, background (flag military/gov service), public persona, LinkedIn activity, known McChrystal connections. Identify 1\u20132 priority targets (economic buyer or champion) with rationale.

<strong>4. Organizational Culture &amp; Structure Signals</strong>
Hierarchy vs. flat, Glassdoor patterns, known transformation programs, culture fit/problems

<strong>5. Recent News &amp; Trigger Events</strong>
5\u20137 most relevant developments (last 18 months) with date, event, and why it matters for McChrystal

<strong>6. McChrystal Fit Assessment</strong>
Primary problem, best capability fit, likely objections, competitive landscape (McKinsey OrgDesign, Korn Ferry, etc.), rating (Strong / Moderate / Speculative)

<strong>7. Conversation Entry Points</strong>
2\u20133 opening questions for a Senior Partner, mutual connections, recommended first meeting framing

<strong>Quality Standards</strong>
\u2022 Be specific \u2014 no generic filler
\u2022 Flag [INFERRED] vs. confirmed facts
\u2022 Say \u201Cunavailable\u201D rather than fabricate
\u2022 Prioritize recency (24 months)
          </div>
        </details>

        <details class="prompt-block">
          <summary>View Outreach Prompt</summary>
          <div class="prompt-content">
<strong>Sequence Structure</strong>
3-email sequences per prospect, built from dossier data. Each sequence escalates from insight to ask.

1. <span style="color:var(--green);">Email 1 \u2014 Trigger-based opener</span> (Day 0): Reference a specific, recent trigger event from the dossier. Connect it to one McChrystal capability. Demonstrate homework \u2014 no generic \u201CI\u2019d love to connect.\u201D

2. <span style="color:var(--amber);">Email 2 \u2014 Value-add follow-up</span> (Day 5): Share a relevant framework, insight, or parallel example. Position McChrystal as a thought partner, not a vendor. No hard ask yet.

3. <span style="color:#7ab8f5;">Email 3 \u2014 Direct ask</span> (Day 10): Propose a specific, low-commitment next step (30-min call, diagnostic conversation, introduce to a relevant Senior Partner). Create urgency tied to their timeline.

<strong>Tone &amp; Voice</strong>
\u2022 Write as a Senior Partner, not a sales rep \u2014 peer-to-peer, not vendor-to-buyer
\u2022 Confident but not pushy; direct but respectful of their time
\u2022 Reference McChrystal Group\u2019s military/special operations DNA only when it maps naturally (veteran contacts, crisis situations, Team of Teams)
\u2022 No jargon-stuffing \u2014 use McChrystal concepts sparingly and only when they genuinely fit

<strong>Email Quality Standards</strong>
\u2022 Address the primary priority contact by first name
\u2022 150\u2013250 words per email body \u2014 busy executives won\u2019t read more
\u2022 Every email must reference something specific to THIS prospect \u2014 never generic
\u2022 Subject lines: short (&lt;60 chars), specific, no clickbait
\u2022 Do NOT mention competitors by name
\u2022 Do NOT promise specific ROI or outcomes

<strong>Targeting Logic</strong>
\u2022 Default to the #1 priority contact from the dossier (economic buyer or internal champion)
\u2022 If the priority contact is a veteran, lean into the military connection
\u2022 If the prospect has a Chief Transformation Officer, consider them as primary target over the CEO
          </div>
        </details>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Scoring Model (100 points)</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Every prospect is scored across four dimensions. The weights reflect McChrystal Group\u2019s value drivers \u2014 signals matter most because they indicate timing and urgency.
      </p>
      <div class="scoring-bars">
        <div class="score-bar-row">
          <div class="score-bar-label">Signals</div>
          <div class="score-bar-track">
            <div class="score-bar-fill bar-signals" style="width: 35%;">35</div>
          </div>
          <div style="color:var(--text-secondary); font-size:12px; margin-left:12px; min-width:200px;">Reorgs, M&A, leadership changes, earnings misses, transformation initiatives</div>
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
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Research Dossier Structure</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Each dossier follows a standardized 7-section format. The goal: a Senior Partner can read it in under 10 minutes and walk into a meeting prepared.
      </p>
      <div class="method-grid">
        <div class="method-card">
          <div class="method-card-icon" style="color:#7ab8f5;">1</div>
          <h3>Organization Snapshot</h3>
          <p>Legal name, HQ, founding year, ownership structure, geographic footprint. The basics a partner needs before the first call.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--green);">2</div>
          <h3>Financial Health</h3>
          <p>Revenue trajectory, profitability, analyst sentiment. Key pressures and tailwinds that shape the conversation.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--purple);">3</div>
          <h3>Leadership Profiles</h3>
          <p>C-suite and board with tenure, background, and public persona. Priority targets identified with rationale for why they\u2019re the right entry point.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--amber);">4</div>
          <h3>Culture & Structure</h3>
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
          <p>Primary problem, best capability fit, likely objections, competitive landscape. Rated Strong, Moderate, or Speculative with rationale.</p>
        </div>
        <div class="method-card">
          <div class="method-card-icon" style="color:var(--text-secondary);">7</div>
          <h3>Conversation Entry Points</h3>
          <p>2\u20133 opening questions for a Senior Partner, mutual connections, recommended first meeting framing.</p>
        </div>
      </div>
    </div>

    <div class="home-section">
      <div class="home-section-title">Outreach Sequence Logic</div>
      <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">
        Each prospect gets a 3-email sequence that escalates from insight to ask. Written in Senior Partner voice \u2014 peer-to-peer, not vendor-to-buyer. Every email references something specific to that prospect.
      </p>
      <div class="method-grid">
        <div class="method-card" style="border-left: 3px solid var(--green);">
          <h3 style="color: var(--green);">Email 1 \u2014 Trigger Opener</h3>
          <p><strong>Day 0.</strong> References a specific recent event from the dossier (CEO departure, restructuring announcement, earnings miss). Connects it to one McChrystal capability. Demonstrates homework \u2014 no generic \u201CI\u2019d love to connect.\u201D</p>
        </div>
        <div class="method-card" style="border-left: 3px solid var(--amber);">
          <h3 style="color: var(--amber);">Email 2 \u2014 Value-Add</h3>
          <p><strong>Day 5.</strong> Shares a relevant framework, insight, or parallel example. Positions McChrystal as a thought partner, not a vendor. No hard ask \u2014 builds credibility and keeps the thread warm.</p>
        </div>
        <div class="method-card" style="border-left: 3px solid #7ab8f5;">
          <h3 style="color: #7ab8f5;">Email 3 \u2014 Direct Ask</h3>
          <p><strong>Day 10.</strong> Proposes a specific, low-commitment next step: 30-minute call, diagnostic conversation, or introduction to a relevant Senior Partner. Creates urgency tied to the prospect\u2019s own timeline.</p>
        </div>
      </div>
      <div style="margin-top:20px; padding:16px; background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border);">
        <div style="color:var(--text-secondary); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Tone Guidelines</div>
        <div style="color:var(--text-secondary); font-size:13px; line-height:1.6;">
          150\u2013250 words per email. Address the priority contact by first name. Reference McChrystal\u2019s military DNA only when it maps naturally (veteran contacts, crisis situations). No competitor mentions. No promised ROI. Every sentence must earn its place.
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
    for (const s of dashboardData.outreach_sequences || []) {
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
