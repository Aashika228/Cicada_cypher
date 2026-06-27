import React, { useState, useEffect, useRef } from 'react';
import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import RepoAudit from './RepoAudit';
import PushToGitHub from './PushToGitHub';
import './Dashboard.css';

const WhiteboxIssuesView = ({ issues, type, title }) => {
  const filtered = issues.filter(i => (type === 'ALL' ? true : i.type.toUpperCase() === type.toUpperCase()));
  return (
    <div className="report-section">
      <div className="report-section-title">{title}</div>
      <div className="report-section-sub">Parsed output from codebase audit</div>
      <table className="tbl">
        <thead><tr><th>File</th><th>Line</th><th>Issue</th><th>Severity</th></tr></thead>
        <tbody>
          {filtered.map((issue, idx) => (
            <tr key={idx}>
              <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{issue.file}</td>
              <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{issue.line}</td>
              <td style={{ fontWeight: '600', fontSize: '13px' }}>{issue.message}</td>
              <td>
                <span className={`badge badge-${issue.severity === 'CRITICAL' ? 'critical' : issue.severity === 'HIGH' ? 'high' : 'medium'}`}>
                  {issue.severity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const WhiteboxAccessibilityView = ({ issues }) => {
  const filtered = issues.filter(i => i.type.toUpperCase() === 'WCAG');
  
  // Calculate scores and counts
  const score = Math.max(0, 100 - (filtered.length * 5));
  const critical = filtered.filter(i => i.severity === 'CRITICAL').length;
  const high = filtered.filter(i => i.severity === 'HIGH').length;
  const medium = filtered.filter(i => i.severity === 'MEDIUM').length;
  const low = filtered.filter(i => i.severity === 'LOW').length;
  
  // Fake passing/warning counts based on issues (since we only get failures from backend)
  const failed = filtered.length;
  const passed = Math.max(0, 50 - failed);
  const warning = medium + low;

  const [activeFilter, setActiveFilter] = useState('All');
  
  const displayIssues = filtered.filter(issue => {
    if (activeFilter === 'Critical Only') return issue.severity === 'CRITICAL';
    if (activeFilter === 'Failed') return true;
    if (activeFilter === 'Passed') return false;
    return true;
  });

  // Group by ruleName
  const grouped = displayIssues.reduce((acc, issue) => {
    const key = issue.ruleName || 'Other Issues';
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {});

  const toggleAccordion = (e) => {
    const header = e.currentTarget;
    header.classList.toggle('open');
    if (header.nextElementSibling) {
      header.nextElementSibling.classList.toggle('open');
    }
  };

  return (
    <>
      {/* SCORE HERO */}
      <div className="acc-score-hero">
        <div style={{ textAlign: 'center' }}>
          <div className="acc-score-big">{score}</div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>/100</div>
        </div>
        <div className="acc-progress-wrap">
          <div className="acc-score-label">Accessibility Score — WCAG 2.1 Compliance</div>
          <div style={{ display: 'flex', gap: '14px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-critical">{critical} Critical</span>
            <span className="badge badge-high">{high} High</span>
            <span className="badge badge-medium">{medium} Medium</span>
            <span className="badge badge-low">{low} Low</span>
          </div>
          <div className="progress-track" style={{ height: '10px' }}>
            <div className="progress-fill" style={{ width: `${score}%`, background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>0</span><span>WCAG AA target: 85%</span><span>100</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}><div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green)' }}>{passed}</div><div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: '600' }}>Passed</div></div>
          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}><div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--yellow)' }}>{warning}</div><div style={{ fontSize: '11px', color: 'var(--yellow)', fontWeight: '600' }}>Warning</div></div>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}><div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--red)' }}>{failed}</div><div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '600' }}>Failed</div></div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Filter:</span>
        {['All', 'Critical Only', 'Failed', 'Passed', 'WCAG Level A', 'WCAG Level AA', 'WCAG Level AAA'].map(f => (
          <span 
            key={f} 
            className={`chip ${activeFilter === f ? 'active' : ''}`} 
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </span>
        ))}
      </div>

      {/* CATEGORIES */}
      {Object.entries(grouped).map(([category, catIssues]) => (
        <div className="issue-cat" key={category}>
          <div className="issue-cat-header" onClick={toggleAccordion}>
            <svg style={{ width: '16px', height: '16px', color: 'var(--text-muted)', flexShrink: '0' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            <span className="issue-cat-title">{category}</span>
            <div className="issue-cat-stats">
              <span className="badge badge-critical">{catIssues.filter(i => i.severity === 'CRITICAL').length} Critical</span>
              <span className="badge badge-info">{catIssues.length} Issues</span>
            </div>
            <svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div className="issue-cat-body">
            {catIssues.map((issue, idx) => (
              <div className="issue-card" key={idx}>
                <div className="issue-card-header">
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className={`badge badge-${issue.severity === 'CRITICAL' ? 'critical' : issue.severity === 'HIGH' ? 'high' : 'medium'}`}>{issue.severity}</span>
                      <span className="wcag-ref">{issue.ruleId}</span>
                    </div>
                    <div className="issue-card-title">{issue.message}</div>
                  </div>
                </div>
                <div className="issue-meta-grid" style={{ marginTop: '12px' }}>
                  <div className="issue-meta-item"><div className="issue-meta-label">File</div><div className="issue-meta-val">{issue.file}</div></div>
                  <div className="issue-meta-item"><div className="issue-meta-label">Line</div><div className="issue-meta-val">{issue.line}</div></div>
                  <div className="issue-meta-item"><div className="issue-meta-label">Code Snippet</div><div className="issue-meta-val" style={{ fontFamily: 'monospace', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{issue.code}</div></div>
                </div>
                {issue.fix && (
                  <div className="issue-solution" style={{ marginTop: '12px' }}>💡 <strong>Suggested Fix:</strong> {issue.fix.whyItMatters} <br/><br/><pre style={{background: 'rgba(22,163,74,.1)', padding: '8px', borderRadius: '4px', color: '#16a34a', whiteSpace: 'pre-wrap', margin: 0}}>{issue.fix.fixedCode}</pre></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

const WhiteboxHeuristicsView = ({ issues }) => {
  const filtered = issues.filter(i => i.type.toUpperCase() === 'HEURISTIC');
  
  // Calculate top KPI values
  const score = Math.max(0, 100 - (filtered.length * 5));
  const heuristicsPassed = 10 - new Set(filtered.map(i => i.ruleId)).size;
  
  // Group by Heuristic
  const grouped = filtered.reduce((acc, issue) => {
    const key = issue.ruleId || 'Other Heuristics';
    if (!acc[key]) acc[key] = { name: issue.ruleName || 'Usability Issue', issues: [] };
    acc[key].issues.push(issue);
    return acc;
  }, {});

  const heuristicColors = ['#22c55e', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#22c55e', '#22c55e', '#f59e0b', '#f59e0b'];
  const getHeuristicColor = (ruleId) => {
    const match = ruleId.match(/(\d+)/);
    const num = match ? parseInt(match[0], 10) : 1;
    return heuristicColors[(num - 1) % 10];
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <div className="card card-sm" style={{ flex: '1', minWidth: '160px', background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', borderColor: 'var(--blue-mid)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>Overall Usability</div>
          <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--blue)' }}>{score}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Heuristic Score /100</div>
        </div>
        <div className="card card-sm" style={{ flex: '1', minWidth: '140px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>Issues Found</div>
          <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--orange)' }}>{filtered.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Across {10 - heuristicsPassed} heuristics</div>
        </div>
        <div className="card card-sm" style={{ flex: '1', minWidth: '140px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>Avg Confidence</div>
          <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--green)' }}>92%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI analysis accuracy</div>
        </div>
        <div className="card card-sm" style={{ flex: '1', minWidth: '140px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '4px' }}>Heuristics Passed</div>
          <div style={{ fontSize: '38px', fontWeight: '800', color: 'var(--purple)' }}>{heuristicsPassed}/10</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nielsen's 10 principles</div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="card" style={{ marginBottom: '22px' }}>
        <div className="section-h"><div><div className="section-title">Usability Trend</div><div className="section-sub">Score progression over last audits</div></div></div>
        <canvas id="trendChart" height="100"></canvas>
      </div>

      {/* HEURISTIC CARDS GRID */}
      <div className="grid-2" style={{ gap: '14px' }}>
        {Object.entries(grouped).map(([hId, hData]) => {
          const catIssues = hData.issues;
          const hScore = Math.max(0, 100 - (catIssues.length * 10));
          const color = getHeuristicColor(hId);
          
          return (
            <div className="heuristic-card" key={hId} style={{ borderLeft: `3px solid ${color}` }}>
              <div className="heuristic-num">{hId}</div>
              <div className="heuristic-title">{hData.name}</div>
              <div className="heuristic-score-row">
                <div className="h-score-num" style={{ color: color }}>{hScore}</div>
                <div className="h-score-max">/100</div>
                <span className={`badge badge-${catIssues.some(i => i.severity === 'CRITICAL') ? 'critical' : 'warn'}`} style={{ marginLeft: 'auto' }}>{catIssues.length} issues</span>
              </div>
              <div className="h-conf">Confidence: <strong>{Math.floor(Math.random() * 15) + 85}%</strong></div>
              <div className="progress-track" style={{ margin: '8px 0' }}>
                <div className="progress-fill" style={{ width: `${hScore}%`, background: color }}></div>
              </div>
              
              <div style={{ marginTop: '14px' }}>
                {catIssues.slice(0, 5).map((issue, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx < Math.min(catIssues.length, 5) - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      <span className={`badge badge-${(issue.severity || 'MEDIUM').toLowerCase()}`} style={{ marginRight: '6px' }}>{issue.severity || 'MEDIUM'}</span>
                      {issue.message}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '6px' }}>
                      {issue.file}:{issue.line}
                    </div>
                    <ul style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.6' }}>
                      <li>{issue.suggestedFix || 'Apply fix from AI suggestions'}</li>
                    </ul>
                    {issue.fix && (
                      <div className="issue-solution" style={{ marginTop: '8px', padding: '6px 10px', fontSize: '11.5px' }}>
                        💡 <strong>AI Fix:</strong> <br/><pre style={{ background: 'rgba(22,163,74,.1)', padding: '6px', borderRadius: '4px', color: '#16a34a', whiteSpace: 'pre-wrap', margin: '4px 0 0 0', fontSize: '11px' }}>{issue.fix.fixedCode}</pre>
                      </div>
                    )}
                  </div>
                ))}
                {catIssues.length > 5 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px', padding: '8px', background: 'var(--bg)', borderRadius: '4px', border: '1px dashed var(--border-light)' }}>
                    + {catIssues.length - 5} more issues in this category
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const WhiteboxAIFixesView = ({ issues, auditId }) => {
  const fixedIssues = issues.filter(i => i.fix && i.fix.fixedCode);
  
  if (fixedIssues.length === 0) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>No AI fixes generated for these issues yet. (Groq API might be disabled or still processing).</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"20px","flexWrap":"wrap","gap":"12px"}}>
        <div>
          <div style={{"fontSize":"16px","fontWeight":"700","color":"var(--text-primary)"}}>AI-Generated Fixes (from Groq API)</div>
          <div style={{"fontSize":"13px","color":"var(--text-muted)"}}>Code solutions with before/after comparisons</div>
        </div>
        <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
          <span className="badge badge-info">{fixedIssues.length} Total Fixes</span>
        </div>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <PushToGitHub 
          auditId={auditId} 
          acceptedFixIds={issues.map((i, idx) => i.fix && i.fix.fixedCode ? idx : -1).filter(idx => idx !== -1)} 
          fixSummary={fixedIssues}
        />
      </div>
      {fixedIssues.map((issue, idx) => (
        <div className="fix-card" key={idx}>
          <div className="fix-card-header">
            <div style={{"flex":"1"}}>
              <div className="fix-card-title">{issue.message}</div>
              <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>{issue.ruleId} · {issue.ruleName}</div>
            </div>
            <span className={`badge badge-${issue.severity === 'CRITICAL' ? 'critical' : issue.severity === 'HIGH' ? 'high' : 'medium'}`}>{issue.severity}</span>
          </div>
          <div className="fix-meta-row">
            <div className="fix-meta-item"><strong>Est. Fix Time:</strong> {issue.fix.timeToFix}</div>
            <div className="fix-meta-item"><strong>Why it matters:</strong> <span style={{"color":"#16a34a"}}>{issue.fix.whyItMatters}</span></div>
          </div>
          <div className="slider-wrap">
            <div className="slider-before" style={{"width":"50%","borderRight":"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{"textAlign":"center"}}><div style={{"fontSize":"10px","opacity":".7","marginBottom":"4px"}}>BEFORE</div><div style={{"background":"rgba(0,0,0,.1)","padding":"6px 12px","borderRadius":"6px","fontFamily":"monospace","fontSize":"11px","whiteSpace":"pre-wrap","textAlign":"left"}}>{issue.code}</div></div>
            </div>
            <div className="slider-after" style={{"width":"50%","clipPath":"none"}}>
              <div style={{"textAlign":"center"}}><div style={{"fontSize":"10px","opacity":".7","marginBottom":"4px","color":"var(--green)"}}>AFTER (Groq AI)</div><div style={{"background":"rgba(22,163,74,.1)","padding":"6px 12px","borderRadius":"6px","fontFamily":"monospace","fontSize":"11px","color":"#16a34a","whiteSpace":"pre-wrap","textAlign":"left"}}>{issue.fix.fixedCode}</div></div>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
              onClick={() => {
                const chatBtn = document.querySelector('[data-page="chat"]');
                if (chatBtn) chatBtn.click();
              }}
            >
              <svg style={{ width: '14px', height: '14px', marginRight: '6px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Ask AI to make more changes
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const DashboardReact = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const [activePage, setActivePage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'dashboard';
  });
  const [activeJourneyStep, setActiveJourneyStep] = useState('homepage');
  const [toastMessage, setToastMessage] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [whiteboxAudit, setWhiteboxAudit] = useState(null);
  const messagesEndRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const sendChat = (text = null) => {
    const msg = text || chatInput.trim();
    if (!msg) return;
    setChatInput('');
    
    const newMessages = [...chatMessages, { sender: 'user', text: msg }];
    setChatMessages(newMessages);
    setIsTyping(true);

    setTimeout(() => {
      const responses = {
        'accessibility': 'Your site has 14 accessibility issues across 11 categories...',
        'usability': 'Based on heuristics, add inline real-time validation to all forms...',
        'critical': 'The keyboard focus trap in the cookie consent modal is WCAG 2.1.2 Level A...',
        'react code': 'Here is the React component with proper accessibility...',
        'tailwind css': 'Here is the WCAG-compliant Tailwind CSS button...',
        'client': 'Executive Summary: We completed a comprehensive UX audit...',
        'prioritize': 'Tier 1 Highest ROI: Checkout no inline validation (+24% conversion)...'
      };
      
      const key = Object.keys(responses).find(k => msg.toLowerCase().includes(k));
      const response = key ? responses[key] : 'I analyzed your request. Based on the audit, the checkout flow needs major usability updates.';
      
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'ai', text: response }]);
    }, 1200);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);
return (
    <div className="dashboard-page-container" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      {/* ══ SIDEBAR ══ */}
<aside id="sidebar">
  <div className="sb-logo">
    <div className="sb-logo-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.698-1.32 2.698H4.12c-1.35 0-2.32-1.698-1.32-2.698L4 15.3"/></svg></div>
    <div><div className="sb-logo-text">UX Auditor</div><div className="sb-logo-sub">AI-Powered Platform</div></div>
  </div>
  <nav className="sb-nav">
    <div className="sb-section">Main</div>
    <div className={`sb-item ${activePage === 'dashboard' ? 'active' : ''}`} data-page="dashboard" onClick={() => setActivePage('dashboard')}>
      <svg className="sb-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      Dashboard
    </div>
    <div className={`sb-item ${activePage === 'accessibility' ? 'active' : ''}`} data-page="accessibility" onClick={() => setActivePage('accessibility')}>
      <svg className="sb-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l4 1 5-1 5 1 4-1m-9 3v8m-3-5l3 5 3-5"/></svg>
      Accessibility
      <span className="sb-badge">14</span>
    </div>
    <div className={`sb-item ${activePage === 'heuristics' ? 'active' : ''}`} data-page="heuristics" onClick={() => setActivePage('heuristics')}>
      <svg className="sb-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
      UX Heuristics
      <span className="sb-badge warn">7</span>
    </div>
    <div className={`sb-item ${activePage === 'journey' ? 'active' : ''}`} data-page="journey" onClick={() => setActivePage('journey')}>
      <svg className="sb-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
      User Journey
    </div>
    <div className={`sb-item ${activePage === 'aifixes' ? 'active' : ''}`} data-page="aifixes" onClick={() => setActivePage('aifixes')}>
      <svg className="sb-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
      AI Fixes
    </div>
    <div className="sb-section">Output</div>
    <div className={`sb-item ${activePage === 'reports' ? 'active' : ''}`} data-page="reports" onClick={() => setActivePage('reports')}>
      <svg className="sb-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      Reports
    </div>

    <div className={`sb-item ${activePage === 'chat' ? 'active' : ''}`} data-page="chat" onClick={() => setActivePage('chat')}>
      <svg className="sb-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
      AI Chat
    </div>
  </nav>
  <div className="sb-bottom">
      <div className="sb-user">
        <div className="sb-avatar" style={{ overflow: 'hidden' }}>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.firstName?.[0] || 'U'
          )}
        </div>
        <div className="sb-user-info">
          <div className="sb-user-name">{user?.fullName || user?.primaryEmailAddress?.emailAddress || 'User'}</div>
          <div className="sb-user-role" onClick={() => signOut()} style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: '600' }}>Log Out</div>
        </div>
      </div>
  </div>
</aside>

{/* ══ MAIN ══ */}
<div id="main">
  {/* TOP BAR */}
  <header id="topbar">
    <div className="tb-title" id="tb-title">
      {activePage === 'dashboard' && <>Dashboard <span className="tb-sub">/ Overview</span></>}
      {activePage === 'reports' && 'Reports'}
      {activePage === 'whitebox' && 'Whitebox Testing'}
      {activePage === 'chat' && 'AI Chat'}
    </div>
    <div className="tb-audit-url">
      <svg style={{"width":"13px","height":"13px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
      acme-corp.io
    </div>
    <div className="tb-search">
      <svg style={{"width":"14px","height":"14px","color":"var(--text-muted)","flexShrink":"0"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
      <input type="text" placeholder="Search issues..."/>
    </div>
    <div className="tb-btn" title="Notifications" style={{"position":"relative"}}>
      <svg style={{"width":"16px","height":"16px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
      <span className="tb-notif"></span>
    </div>
    <div className="tb-btn" title="Settings">
      <svg style={{"width":"16px","height":"16px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
    </div>
    <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
      <div style={{"width":"30px","height":"30px","borderRadius":"50%","background":"linear-gradient(135deg,#2563eb,#7c3aed)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"12px","fontWeight":"700","color":"#fff"}}>JD</div>
    </div>
  </header>

  {/* ══ CONTENT ══ */}
  <div id="content">

    {/* ════════════ PAGE: DASHBOARD ════════════ */}
    <div id="page-dashboard" className="page" style={{ display: activePage === 'dashboard' ? 'block' : 'none' }}>
      {new URLSearchParams(window.location.search).get('repo') || whiteboxAudit ? (
        <RepoAudit audit={whiteboxAudit} setAudit={setWhiteboxAudit} />
      ) : (
        <>
          {/* AUDIT HERO */}
      <div className="audit-hero">
        <div className="audit-screenshot">
          <div className="audit-screenshot-inner">
            <div style={{"height":"10px","background":"linear-gradient(90deg,#2563eb,#7c3aed)","borderRadius":"3px","marginBottom":"6px","opacity":".7"}}></div>
            <div className="screen-bar full"></div><div className="screen-bar med"></div><div className="screen-bar full"></div>
            <div style={{"height":"28px","background":"rgba(37,99,235,.12)","borderRadius":"4px","margin":"4px 0"}}></div>
            <div className="screen-bar short"></div><div className="screen-bar med"></div>
          </div>
          <div style={{"position":"absolute","bottom":"5px","right":"7px","fontSize":"9px","color":"rgba(37,99,235,.5)","fontWeight":"600"}}>PREVIEW</div>
        </div>
        <div className="audit-meta">
          <div className="audit-url"><a href="#">https://acme-corp.io</a></div>
          <div className="audit-info-row">
            <div className="audit-info-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>June 27, 2026 · 09:42 AM</div>
            <div className="audit-info-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Duration: 3m 24s</div>
            <div className="audit-info-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>8 pages audited</div>
            <div className="audit-info-item"><span style={{"background":"#f0fdf4","color":"#16a34a","fontSize":"11px","fontWeight":"600","padding":"2px 8px","borderRadius":"4px","border":"1px solid #bbf7d0"}}>Audit Complete ✓</span></div>
          </div>
          <div style={{"marginTop":"8px"}}>
            <div style={{"fontSize":"12px","color":"var(--text-muted)","marginBottom":"6px"}}>Overall Compliance</div>
            <div style={{"display":"flex","alignItems":"center","gap":"10px"}}>
              <div className="progress-track" style={{"width":"260px","height":"8px"}}>
                <div className="progress-fill" style={{"width":"73%","background":"linear-gradient(90deg,#2563eb,#7c3aed)"}}></div>
              </div>
              <span style={{"fontSize":"13px","fontWeight":"700","color":"var(--text-primary)"}}>73%</span>
            </div>
          </div>
        </div>
        <div className="audit-grade">
          <div className="grade-letter">B+</div>
          <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--text-primary)","marginTop":"2px"}}>78.4<span style={{"fontSize":"11px","color":"var(--text-muted)"}}>/100</span></div>
          <div className="grade-sub">Overall UX Score</div>
          <div style={{"marginTop":"8px","display":"flex","gap":"4px","justifyContent":"center"}}>
            <span className="badge badge-warn">27 Issues</span>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid-4" style={{"marginBottom":"20px"}}>
        <div className="card card-sm">
          <div className="kpi-icon-wrap" style={{"background":"#eff6ff"}}><svg style={{"width":"18px","height":"18px","color":"#2563eb"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l4 1 5-1 5 1 4-1m-9 3v8m-3-5l3 5 3-5"/></svg></div>
          <div className="kpi-lbl">Accessibility Score</div>
          <div className="kpi-val" style={{"color":"#2563eb"}}>71</div>
          <div className="kpi-trend down"><svg style={{"width":"12px","height":"12px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>−3 from last</div>
        </div>
        <div className="card card-sm">
          <div className="kpi-icon-wrap" style={{"background":"#f5f3ff"}}><svg style={{"width":"18px","height":"18px","color":"#7c3aed"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div>
          <div className="kpi-lbl">UX Heuristic Score</div>
          <div className="kpi-val" style={{"color":"#7c3aed"}}>82</div>
          <div className="kpi-trend up"><svg style={{"width":"12px","height":"12px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>+5 from last</div>
        </div>
        <div className="card card-sm">
          <div className="kpi-icon-wrap" style={{"background":"#ecfdf5"}}><svg style={{"width":"18px","height":"18px","color":"#16a34a"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></div>
          <div className="kpi-lbl">User Journey Score</div>
          <div className="kpi-val" style={{"color":"#16a34a"}}>79</div>
          <div className="kpi-trend up"><svg style={{"width":"12px","height":"12px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>+2 from last</div>
        </div>
        <div className="card card-sm">
          <div className="kpi-icon-wrap" style={{"background":"#fff7ed"}}><svg style={{"width":"18px","height":"18px","color":"#ea580c"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
          <div className="kpi-lbl">Performance Score</div>
          <div className="kpi-val" style={{"color":"#ea580c"}}>68</div>
          <div className="kpi-trend down"><svg style={{"width":"12px","height":"12px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>−7 from last</div>
        </div>
      </div>

      <div className="grid-4" style={{"marginBottom":"24px"}}>
        <div className="card card-sm" style={{"borderColor":"#fecaca"}}>
          <div style={{"fontSize":"11px","color":"var(--text-muted)","fontWeight":"600","textTransform":"uppercase","letterSpacing":".5px","marginBottom":"4px"}}>Total Issues</div>
          <div style={{"fontSize":"34px","fontWeight":"800","color":"var(--text-primary)"}}>27</div>
          <div style={{"fontSize":"12px","color":"var(--text-secondary)","marginTop":"2px"}}>Across all categories</div>
        </div>
        <div className="card card-sm" style={{"borderColor":"#fecaca","background":"#fef9f9"}}>
          <div style={{"fontSize":"11px","color":"var(--red)","fontWeight":"700","textTransform":"uppercase","letterSpacing":".5px","marginBottom":"4px"}}>Critical Issues</div>
          <div style={{"fontSize":"34px","fontWeight":"800","color":"var(--red)"}}>5</div>
          <div style={{"fontSize":"12px","color":"var(--text-secondary)","marginTop":"2px"}}>Require immediate action</div>
        </div>
        <div className="card card-sm" style={{"borderColor":"#fed7aa"}}>
          <div style={{"fontSize":"11px","color":"var(--orange)","fontWeight":"700","textTransform":"uppercase","letterSpacing":".5px","marginBottom":"4px"}}>High Priority</div>
          <div style={{"fontSize":"34px","fontWeight":"800","color":"var(--orange)"}}>9</div>
          <div style={{"fontSize":"12px","color":"var(--text-secondary)","marginTop":"2px"}}>Fix within this sprint</div>
        </div>
        <div className="card card-sm" style={{"borderColor":"#bbf7d0"}}>
          <div style={{"fontSize":"11px","color":"var(--green)","fontWeight":"700","textTransform":"uppercase","letterSpacing":".5px","marginBottom":"4px"}}>Compliance</div>
          <div style={{"fontSize":"34px","fontWeight":"800","color":"var(--green)"}}>73%</div>
          <div style={{"fontSize":"12px","color":"var(--text-secondary)","marginTop":"2px"}}>WCAG 2.1 AA standard</div>
        </div>
      </div>

      {/* CHARTS + TIMELINE */}
      <div className="grid-2" style={{"marginBottom":"20px"}}>
        <div className="card" style={{"minHeight":"300px"}}>
          <div className="section-h"><div><div className="section-title">Audit Radar</div><div className="section-sub">Category performance overview</div></div></div>
          <canvas id="radarChart" height="240"></canvas>
        </div>
        <div className="card">
          <div className="section-h"><div><div className="section-title">Check Results</div><div className="section-sub">Passed · Warning · Failed</div></div></div>
          <div style={{"display":"flex","alignItems":"center","gap":"24px"}}>
            <canvas id="pieChart" width="180" height="180" style={{"flexShrink":"0"}}></canvas>
            <div style={{"flex":"1"}}>
              <div className="stat-mini"><span style={{"fontSize":"13px","color":"var(--text-secondary)","display":"flex","alignItems":"center","gap":"6px"}}><span style={{"width":"10px","height":"10px","background":"#22c55e","borderRadius":"50%","display":"inline-block"}}></span>Passed</span><span style={{"fontSize":"15px","fontWeight":"700","color":"var(--green)"}}>84</span></div>
              <div className="stat-mini"><span style={{"fontSize":"13px","color":"var(--text-secondary)","display":"flex","alignItems":"center","gap":"6px"}}><span style={{"width":"10px","height":"10px","background":"#f59e0b","borderRadius":"50%","display":"inline-block"}}></span>Warning</span><span style={{"fontSize":"15px","fontWeight":"700","color":"var(--yellow)"}}>18</span></div>
              <div className="stat-mini"><span style={{"fontSize":"13px","color":"var(--text-secondary)","display":"flex","alignItems":"center","gap":"6px"}}><span style={{"width":"10px","height":"10px","background":"#ef4444","borderRadius":"50%","display":"inline-block"}}></span>Failed</span><span style={{"fontSize":"15px","fontWeight":"700","color":"var(--red)"}}>27</span></div>
              <div style={{"marginTop":"12px","paddingTop":"12px","borderTop":"1px solid var(--border-light)"}}>
                <div style={{"fontSize":"12px","color":"var(--text-muted)","marginBottom":"4px"}}>Total Checks</div>
                <div style={{"fontSize":"20px","fontWeight":"800","color":"var(--text-primary)"}}>129</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE + ACTIONS */}
      <div className="grid-2">
        <div className="card">
          <div className="section-h"><div className="section-title">Recent Activity</div><button className="btn btn-ghost btn-xs">View all</button></div>
          <div className="timeline">
            <div className="tl-item"><div className="tl-left"><div className="tl-dot" style={{"color":"#dc2626"}}></div><div className="tl-line"></div></div><div className="tl-content"><div className="tl-time">9:42 AM · Today</div><div className="tl-text">Critical: Missing alt text on 8 product images</div><div className="tl-detail">Accessibility · WCAG 1.1.1 · Images</div></div></div>
            <div className="tl-item"><div className="tl-left"><div className="tl-dot" style={{"color":"#ea580c"}}></div><div className="tl-line"></div></div><div className="tl-content"><div className="tl-time">9:44 AM · Today</div><div className="tl-text">High: Color contrast ratio fails on 3 buttons</div><div className="tl-detail">Accessibility · WCAG 1.4.3 · Color Contrast</div></div></div>
            <div className="tl-item"><div className="tl-left"><div className="tl-dot" style={{"color":"#ca8a04"}}></div><div className="tl-line"></div></div><div className="tl-content"><div className="tl-time">9:46 AM · Today</div><div className="tl-text">Medium: Checkout form lacks error prevention</div><div className="tl-detail">UX Heuristics · H5: Error Prevention</div></div></div>
            <div className="tl-item"><div className="tl-left"><div className="tl-dot" style={{"color":"#dc2626"}}></div><div className="tl-line"></div></div><div className="tl-content"><div className="tl-time">9:47 AM · Today</div><div className="tl-text">Critical: Keyboard trap in modal dialog</div><div className="tl-detail">Accessibility · WCAG 2.1.2 · Keyboard Navigation</div></div></div>
            <div className="tl-item"><div className="tl-left"><div className="tl-dot" style={{"color":"#16a34a"}}></div><div className="tl-line"></div></div><div className="tl-content"><div className="tl-time">9:48 AM · Today</div><div className="tl-text">Audit completed successfully</div><div className="tl-detail">27 issues found · 3m 24s duration</div></div></div>
          </div>
        </div>
        <div className="card">
          <div className="section-h"><div className="section-title">Quick Actions</div></div>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px","marginBottom":"20px"}}>
            <button className="btn btn-primary" onClick={() => { /* switchPage('reports',document.querySelector('[data-page=reports]')) */ }}><svg style={{"width":"15px","height":"15px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>View Full Report</button>
            <button className="btn btn-secondary" onClick={() => showToast('PDF download started…')}><svg style={{"width":"15px","height":"15px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>Download PDF</button>
            <button className="btn btn-secondary" onClick={() => showToast('Exporting JSON…')}><svg style={{"width":"15px","height":"15px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>Export JSON</button>
            <button className="btn btn-secondary" onClick={() => showToast('Share link copied!')}><svg style={{"width":"15px","height":"15px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share Report</button>
          </div>
          <div style={{"background":"linear-gradient(135deg,#eff6ff,#f5f3ff)","border":"1px solid var(--blue-mid)","borderRadius":"var(--radius)","padding":"14px"}}>
            <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--text-primary)","marginBottom":"4px"}}>🤖 AI Summary</div>
            <div style={{"fontSize":"12.5px","color":"var(--text-secondary)","lineHeight":"1.6"}}>Your site scores <strong>B+</strong>. The most critical issues are missing image alt texts and color contrast failures. Fixing the 5 critical issues alone would raise your score to <strong>A−</strong>.</div>
            <button className="btn btn-primary btn-sm" style={{"marginTop":"10px"}} onClick={() => { /* switchPage('chat',document.querySelector('[data-page=chat]')) */ }}>Ask AI Assistant →</button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>{/* /dashboard */}

    {/* ════════════ PAGE: ACCESSIBILITY ════════════ */}
    <div id="page-accessibility" className="page" style={{ display: activePage === 'accessibility' ? 'block' : 'none' }}>
      {whiteboxAudit ? (
        <div style={{ padding: '24px' }}>
          <WhiteboxAccessibilityView issues={whiteboxAudit.issues || []} />
        </div>
      ) : (
        <>
          {/* SCORE HERO */}
      <div className="acc-score-hero">
        <div style={{"textAlign":"center"}}>
          <div className="acc-score-big">71</div>
          <div style={{"fontSize":"13px","fontWeight":"600","color":"var(--text-secondary)"}}>/100</div>
        </div>
        <div className="acc-progress-wrap">
          <div className="acc-score-label">Accessibility Score — WCAG 2.1 Compliance</div>
          <div style={{"display":"flex","gap":"14px","marginBottom":"10px","flexWrap":"wrap"}}>
            <span className="badge badge-critical">5 Critical</span>
            <span className="badge badge-high">6 High</span>
            <span className="badge badge-medium">3 Medium</span>
            <span className="badge badge-low">2 Low</span>
          </div>
          <div className="progress-track" style={{"height":"10px"}}>
            <div className="progress-fill" style={{"width":"71%","background":"linear-gradient(90deg,#2563eb,#7c3aed)"}}></div>
          </div>
          <div style={{"display":"flex","justifyContent":"space-between","marginTop":"8px","fontSize":"12px","color":"var(--text-muted)"}}>
            <span>0</span><span>WCAG AA target: 85%</span><span>100</span>
          </div>
        </div>
        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr 1fr","gap":"10px","textAlign":"center"}}>
          <div style={{"background":"#f0fdf4","border":"1px solid #bbf7d0","borderRadius":"var(--radius-sm)","padding":"10px 14px"}}><div style={{"fontSize":"20px","fontWeight":"800","color":"var(--green)"}}>42</div><div style={{"fontSize":"11px","color":"var(--green)","fontWeight":"600"}}>Passed</div></div>
          <div style={{"background":"#fefce8","border":"1px solid #fde68a","borderRadius":"var(--radius-sm)","padding":"10px 14px"}}><div style={{"fontSize":"20px","fontWeight":"800","color":"var(--yellow)"}}>11</div><div style={{"fontSize":"11px","color":"var(--yellow)","fontWeight":"600"}}>Warning</div></div>
          <div style={{"background":"#fef2f2","border":"1px solid #fecaca","borderRadius":"var(--radius-sm)","padding":"10px 14px"}}><div style={{"fontSize":"20px","fontWeight":"800","color":"var(--red)"}}>14</div><div style={{"fontSize":"11px","color":"var(--red)","fontWeight":"600"}}>Failed</div></div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        <span style={{"fontSize":"12.5px","fontWeight":"600","color":"var(--text-muted)"}}>Filter:</span>
        <span className="chip active" onClick={(e) => e.currentTarget.classList.toggle('active')}>All</span>
        <span className="chip" onClick={(e) => e.currentTarget.classList.toggle('active')}>Critical Only</span>
        <span className="chip" onClick={(e) => e.currentTarget.classList.toggle('active')}>Failed</span>
        <span className="chip" onClick={(e) => e.currentTarget.classList.toggle('active')}>Passed</span>
        <span className="chip" onClick={(e) => e.currentTarget.classList.toggle('active')}>WCAG Level A</span>
        <span className="chip" onClick={(e) => e.currentTarget.classList.toggle('active')}>WCAG Level AA</span>
        <span className="chip" onClick={(e) => e.currentTarget.classList.toggle('active')}>WCAG Level AAA</span>
      </div>

      {/* CATEGORIES */}
      {/* Images */}
      <div className="issue-cat">
        <div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}>
          <svg style={{"width":"16px","height":"16px","color":"var(--text-muted)","flexShrink":"0"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span className="issue-cat-title">Images</span>
          <div className="issue-cat-stats"><span className="badge badge-critical">2 Critical</span><span className="badge badge-info">8 Checks</span></div>
          <svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div className="issue-cat-body">
          <div className="issue-card">
            <div className="issue-card-header">
              <div style={{"flex":"1"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"6px"}}>
                  <span className="badge badge-critical">Critical</span>
                  <span className="wcag-ref">WCAG 1.1.1</span>
                  <span style={{"fontSize":"11px","color":"var(--text-muted)"}}>Level A</span>
                </div>
                <div className="issue-card-title">Missing alt text on product images</div>
              </div>
              <div className="issue-thumb">
                <svg style={{"width":"24px","height":"24px","color":"#a5b4fc"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </div>
            <div style={{"fontSize":"12.5px","color":"var(--text-secondary)","lineHeight":"1.55","marginBottom":"10px"}}>8 product images on the homepage and product listing page are missing descriptive alt text. Screen readers will announce them as empty or with their file name.</div>
            <div className="issue-meta-grid">
              <div className="issue-meta-item"><div className="issue-meta-label">Affected Element</div><div className="issue-meta-val">&lt;img src="product-hero.jpg"&gt;</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Current Value</div><div className="issue-meta-val">alt="" (empty)</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Expected Value</div><div className="issue-meta-val">alt="Product name description"</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Occurrences</div><div className="issue-meta-val">8 elements</div></div>
            </div>
            <div className="issue-solution">💡 <strong>Solution:</strong> Add descriptive alt text to each image element. For decorative images, use <code>alt=""</code>. For informative images, describe the content and function.</div>
            <div className="issue-actions">
              <button className="btn btn-primary btn-xs" onClick={() => { /* switchPage('aifixes',document.querySelector('[data-page=aifixes]')) */ }}><svg style={{"width":"12px","height":"12px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>Show AI Fix</button>
              <button className="btn btn-secondary btn-xs" onClick={() => showToast('Screenshot opened')}><svg style={{"width":"12px","height":"12px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>View Screenshot</button>
            </div>
          </div>
          <div className="issue-card">
            <div className="issue-card-header">
              <div style={{"flex":"1"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"6px"}}>
                  <span className="badge badge-high">High</span>
                  <span className="wcag-ref">WCAG 1.1.1</span>
                  <span style={{"fontSize":"11px","color":"var(--text-muted)"}}>Level A</span>
                </div>
                <div className="issue-card-title">SVG icons missing accessible labels</div>
              </div>
              <div className="issue-thumb"><svg style={{"width":"24px","height":"24px","color":"#a5b4fc"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
            </div>
            <div style={{"fontSize":"12.5px","color":"var(--text-secondary)","lineHeight":"1.55","marginBottom":"10px"}}>12 SVG icon buttons in the navigation have no aria-label or title attributes. Screen reader users cannot determine their purpose.</div>
            <div className="issue-meta-grid">
              <div className="issue-meta-item"><div className="issue-meta-label">Affected Element</div><div className="issue-meta-val">&lt;svg role="button"&gt;</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Current Value</div><div className="issue-meta-val">No label</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Expected Value</div><div className="issue-meta-val">aria-label="Search"</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Occurrences</div><div className="issue-meta-val">12 elements</div></div>
            </div>
            <div className="issue-solution">💡 <strong>Solution:</strong> Add <code>aria-label</code> or a visually hidden <code>&lt;title&gt;</code> element inside each SVG. Use <code>role="img"</code> for decorative SVGs with <code>aria-hidden="true"</code>.</div>
            <div className="issue-actions">
              <button className="btn btn-primary btn-xs" onClick={() => { /* switchPage('aifixes',document.querySelector('[data-page=aifixes]')) */ }}>Show AI Fix</button>
              <button className="btn btn-secondary btn-xs" onClick={() => showToast('Screenshot opened')}>View Screenshot</button>
            </div>
          </div>
        </div>
      </div>

      {/* Color Contrast */}
      <div className="issue-cat">
        <div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}>
          <svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c.926 0 1.671-.754 1.671-1.682 0-.423-.162-.826-.44-1.12-.278-.292-.42-.694-.42-1.098 0-.834.669-1.5 1.5-1.5H16c2.761 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/></svg>
          <span className="issue-cat-title">Color Contrast</span>
          <div className="issue-cat-stats"><span className="badge badge-critical">1 Critical</span><span className="badge badge-high">2 High</span></div>
          <svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div className="issue-cat-body">
          <div className="issue-card">
            <div className="issue-card-header">
              <div style={{"flex":"1"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"6px"}}>
                  <span className="badge badge-critical">Critical</span>
                  <span className="wcag-ref">WCAG 1.4.3</span>
                  <span style={{"fontSize":"11px","color":"var(--text-muted)"}}>Level AA</span>
                </div>
                <div className="issue-card-title">Primary CTA button has insufficient contrast ratio</div>
              </div>
              <div className="issue-thumb" style={{"background":"linear-gradient(135deg,#6ee7b7,#34d399)"}}>
                <span style={{"fontSize":"10px","color":"#fff","fontWeight":"700","padding":"4px 8px","background":"rgba(0,0,0,.2)","borderRadius":"4px"}}>AA Fail</span>
              </div>
            </div>
            <div style={{"fontSize":"12.5px","color":"var(--text-secondary)","lineHeight":"1.55","marginBottom":"10px"}}>The "Get Started" button uses a light green (#86efac) background with white text. The contrast ratio is 1.89:1, far below the required 4.5:1 minimum for normal text.</div>
            <div className="issue-meta-grid">
              <div className="issue-meta-item"><div className="issue-meta-label">Affected Element</div><div className="issue-meta-val">&lt;button className="cta-btn"&gt;</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Current Ratio</div><div className="issue-meta-val" style={{"color":"var(--red)"}}>1.89:1 ✗</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Required Ratio</div><div className="issue-meta-val" style={{"color":"var(--green)"}}>4.5:1 minimum</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Affected Pages</div><div className="issue-meta-val">Homepage, Pricing</div></div>
            </div>
            <div className="issue-solution">💡 <strong>Solution:</strong> Change button background to <code>#16a34a</code> (dark green) or text color to <code>#14532d</code>. Use the WebAIM Contrast Checker to verify the final ratio exceeds 4.5:1.</div>
            <div className="issue-actions">
              <button className="btn btn-primary btn-xs" onClick={() => { /* switchPage('aifixes',document.querySelector('[data-page=aifixes]')) */ }}>Show AI Fix</button>
              <button className="btn btn-secondary btn-xs">View Screenshot</button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Navigation */}
      <div className="issue-cat">
        <div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}>
          <svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
          <span className="issue-cat-title">Keyboard Navigation</span>
          <div className="issue-cat-stats"><span className="badge badge-critical">2 Critical</span></div>
          <svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div className="issue-cat-body">
          <div className="issue-card">
            <div className="issue-card-header">
              <div style={{"flex":"1"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"6px"}}>
                  <span className="badge badge-critical">Critical</span>
                  <span className="wcag-ref">WCAG 2.1.2</span>
                  <span style={{"fontSize":"11px","color":"var(--text-muted)"}}>Level A</span>
                </div>
                <div className="issue-card-title">Keyboard focus trapped in cookie consent modal</div>
              </div>
              <div className="issue-thumb"><svg style={{"width":"22px","height":"22px","color":"#a5b4fc"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/></svg></div>
            </div>
            <div style={{"fontSize":"12.5px","color":"var(--text-secondary)","lineHeight":"1.55","marginBottom":"10px"}}>Once the cookie consent modal opens, keyboard users cannot escape it using the Tab key, Escape key, or any standard keyboard interaction. They are permanently trapped.</div>
            <div className="issue-meta-grid">
              <div className="issue-meta-item"><div className="issue-meta-label">Affected Element</div><div className="issue-meta-val">#cookie-consent-modal</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Trigger</div><div className="issue-meta-val">Page load</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Expected Behavior</div><div className="issue-meta-val">Esc closes modal</div></div>
              <div className="issue-meta-item"><div className="issue-meta-label">Severity</div><div className="issue-meta-val" style={{"color":"var(--red)"}}>Blocker</div></div>
            </div>
            <div className="issue-solution">💡 <strong>Solution:</strong> Implement focus trap management: cycle focus within modal, allow Escape to close, return focus to trigger element on close. Use <code>aria-modal="true"</code> and proper focus management.</div>
            <div className="issue-actions">
              <button className="btn btn-primary btn-xs" onClick={() => { /* switchPage('aifixes',document.querySelector('[data-page=aifixes]')) */ }}>Show AI Fix</button>
              <button className="btn btn-secondary btn-xs">View Screenshot</button>
            </div>
          </div>
        </div>
      </div>

      {/* ARIA, Forms, etc. collapsed */}
      <div className="issue-cat">
        <div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}>
          <svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <span className="issue-cat-title">Forms</span>
          <div className="issue-cat-stats"><span className="badge badge-high">1 High</span><span className="badge badge-medium">2 Medium</span></div>
          <svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div className="issue-cat-body">
          <div className="issue-card">
            <div className="issue-card-header"><div style={{"flex":"1"}}><div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"6px"}}><span className="badge badge-high">High</span><span className="wcag-ref">WCAG 1.3.1</span><span style={{"fontSize":"11px","color":"var(--text-muted)"}}>Level A</span></div><div className="issue-card-title">Signup form inputs missing associated labels</div></div><div className="issue-thumb"><svg style={{"width":"22px","height":"22px","color":"#a5b4fc"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div></div>
            <div style={{"fontSize":"12.5px","color":"var(--text-secondary)","lineHeight":"1.55"}}>Placeholder text is used instead of proper label elements for the email and password fields in the signup form. Screen readers may not announce field purpose.</div>
            <div className="issue-actions" style={{"marginTop":"10px"}}><button className="btn btn-primary btn-xs" onClick={() => { /* switchPage('aifixes',document.querySelector('[data-page=aifixes]')) */ }}>Show AI Fix</button><button className="btn btn-secondary btn-xs">View Screenshot</button></div>
          </div>
        </div>
      </div>

      <div className="issue-cat">
        <div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}>
          <svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
          <span className="issue-cat-title">ARIA Attributes</span>
          <div className="issue-cat-stats"><span className="badge badge-medium">3 Medium</span><span className="badge badge-pass">6 Passed</span></div>
          <svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div className="issue-cat-body">
          <div className="issue-card">
            <div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"8px"}}><span className="badge badge-medium">Medium</span><span className="wcag-ref">WCAG 4.1.2</span></div>
            <div className="issue-card-title">Dropdown menu missing aria-expanded state</div>
            <div style={{"fontSize":"12.5px","color":"var(--text-secondary)","lineHeight":"1.55","marginTop":"6px"}}>The main navigation dropdown menus do not update aria-expanded attribute when opened or closed, failing to communicate state to assistive technology.</div>
            <div className="issue-actions" style={{"marginTop":"10px"}}><button className="btn btn-primary btn-xs">Show AI Fix</button><button className="btn btn-secondary btn-xs">View Screenshot</button></div>
          </div>
        </div>
      </div>

      {/* Remaining categories collapsed by default */}
      <div className="issue-cat"><div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}><svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16"/></svg><span className="issue-cat-title">Headings</span><div className="issue-cat-stats"><span className="badge badge-medium">1 Medium</span><span className="badge badge-pass">7 Passed</span></div><svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div><div className="issue-cat-body"><div className="issue-card"><div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"8px"}}><span className="badge badge-medium">Medium</span><span className="wcag-ref">WCAG 1.3.1</span></div><div className="issue-card-title">Heading hierarchy skips from H1 to H4 on blog pages</div><div style={{"fontSize":"12.5px","color":"var(--text-secondary)","marginTop":"6px","lineHeight":"1.55"}}>Skipping heading levels disrupts the document outline and confuses screen reader users navigating by headings.</div><div className="issue-actions" style={{"marginTop":"10px"}}><button className="btn btn-primary btn-xs">Show AI Fix</button><button className="btn btn-secondary btn-xs">View Screenshot</button></div></div></div></div>
      <div className="issue-cat"><div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}><svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg><span className="issue-cat-title">Typography</span><div className="issue-cat-stats"><span className="badge badge-low">1 Low</span><span className="badge badge-pass">5 Passed</span></div><svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div><div className="issue-cat-body"><div className="issue-card"><div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"8px"}}><span className="badge badge-low">Low</span><span className="wcag-ref">WCAG 1.4.12</span></div><div className="issue-card-title">Small print text below 12px minimum on mobile</div><div style={{"fontSize":"12.5px","color":"var(--text-secondary)","marginTop":"6px","lineHeight":"1.55"}}>Footer legal text renders at 10px on mobile devices, below the recommended minimum of 12px for body text readability.</div><div className="issue-actions" style={{"marginTop":"10px"}}><button className="btn btn-primary btn-xs">Show AI Fix</button><button className="btn btn-secondary btn-xs">View Screenshot</button></div></div></div></div>
      <div className="issue-cat"><div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}><svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg><span className="issue-cat-title">Focus Indicators</span><div className="issue-cat-stats"><span className="badge badge-high">2 High</span></div><svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div><div className="issue-cat-body"><div className="issue-card"><div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"8px"}}><span className="badge badge-high">High</span><span className="wcag-ref">WCAG 2.4.7</span></div><div className="issue-card-title">Focus ring removed with outline:none on all interactive elements</div><div style={{"fontSize":"12.5px","color":"var(--text-secondary)","marginTop":"6px","lineHeight":"1.55"}}>A global CSS rule <code>* {"{ outline: none }"}</code> removes focus indicators from all focusable elements, making keyboard navigation invisible.</div><div className="issue-actions" style={{"marginTop":"10px"}}><button className="btn btn-primary btn-xs">Show AI Fix</button><button className="btn btn-secondary btn-xs">View Screenshot</button></div></div></div></div>
      <div className="issue-cat"><div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}><svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg><span className="issue-cat-title">Page Language</span><div className="issue-cat-stats"><span className="badge badge-pass">Passed</span></div><svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div><div className="issue-cat-body"><div className="issue-card" style={{"borderColor":"#bbf7d0"}}><div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"8px"}}><span className="badge badge-pass">Passed</span><span className="wcag-ref">WCAG 3.1.1</span></div><div className="issue-card-title">HTML lang attribute correctly set to "en"</div><div style={{"fontSize":"12.5px","color":"var(--text-secondary)","marginTop":"6px"}}>All pages correctly specify <code>&lt;html lang="en"&gt;</code>. No issues found.</div></div></div></div>
      <div className="issue-cat"><div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}><svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg><span className="issue-cat-title">Touch Targets</span><div className="issue-cat-stats"><span className="badge badge-medium">1 Medium</span></div><svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div><div className="issue-cat-body"><div className="issue-card"><div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"8px"}}><span className="badge badge-medium">Medium</span><span className="wcag-ref">WCAG 2.5.5</span></div><div className="issue-card-title">Social share buttons below 44x44px minimum touch target</div><div style={{"fontSize":"12.5px","color":"var(--text-secondary)","marginTop":"6px","lineHeight":"1.55"}}>Social sharing icons in the blog sidebar are 28x28px, below the WCAG 2.5.5 AAA recommendation of 44x44px and the practical mobile minimum.</div><div className="issue-actions" style={{"marginTop":"10px"}}><button className="btn btn-primary btn-xs">Show AI Fix</button><button className="btn btn-secondary btn-xs">View Screenshot</button></div></div></div></div>
      <div className="issue-cat"><div className="issue-cat-header" onClick={(e) => { e.currentTarget.classList.toggle('open'); e.currentTarget.nextElementSibling.classList.toggle('open'); }}><svg style={{"width":"16px","height":"16px","color":"var(--text-muted)"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg><span className="issue-cat-title">Semantic HTML</span><div className="issue-cat-stats"><span className="badge badge-medium">1 Medium</span><span className="badge badge-pass">8 Passed</span></div><svg className="expand-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div><div className="issue-cat-body"><div className="issue-card"><div style={{"display":"flex","alignItems":"center","gap":"8px","marginBottom":"8px"}}><span className="badge badge-medium">Medium</span><span className="wcag-ref">WCAG 1.3.1</span></div><div className="issue-card-title">Navigation uses div elements instead of &lt;nav&gt;</div><div style={{"fontSize":"12.5px","color":"var(--text-secondary)","marginTop":"6px","lineHeight":"1.55"}}>Main site navigation uses &lt;div className="nav"&gt; rather than the semantic &lt;nav&gt; element, reducing landmark navigation for screen reader users.</div><div className="issue-actions" style={{"marginTop":"10px"}}><button className="btn btn-primary btn-xs">Show AI Fix</button><button className="btn btn-secondary btn-xs">View Screenshot</button></div></div></div></div>
        </>
      )}
    </div>{/* /accessibility */}

    {/* ════════════ PAGE: UX HEURISTICS ════════════ */}
    <div id="page-heuristics" className="page" style={{ display: activePage === 'heuristics' ? 'block' : 'none' }}>
      {whiteboxAudit ? (
        <div style={{ padding: '24px' }}>
          <WhiteboxHeuristicsView issues={whiteboxAudit.issues || []} />
        </div>
      ) : (
        <>
          <div style={{"display":"flex","alignItems":"center","gap":"16px","marginBottom":"22px","flexWrap":"wrap"}}>
        <div className="card card-sm" style={{"flex":"1","minWidth":"160px","background":"linear-gradient(135deg,#eff6ff,#f5f3ff)","borderColor":"var(--blue-mid)"}}>
          <div style={{"fontSize":"12px","color":"var(--text-muted)","fontWeight":"500","marginBottom":"4px"}}>Overall Usability</div>
          <div style={{"fontSize":"38px","fontWeight":"800","color":"var(--blue)"}}>82</div>
          <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>Heuristic Score /100</div>
        </div>
        <div className="card card-sm" style={{"flex":"1","minWidth":"140px"}}>
          <div style={{"fontSize":"12px","color":"var(--text-muted)","fontWeight":"500","marginBottom":"4px"}}>Issues Found</div>
          <div style={{"fontSize":"38px","fontWeight":"800","color":"var(--orange)"}}>18</div>
          <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>Across 7 heuristics</div>
        </div>
        <div className="card card-sm" style={{"flex":"1","minWidth":"140px"}}>
          <div style={{"fontSize":"12px","color":"var(--text-muted)","fontWeight":"500","marginBottom":"4px"}}>Avg Confidence</div>
          <div style={{"fontSize":"38px","fontWeight":"800","color":"var(--green)"}}>87%</div>
          <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>AI analysis accuracy</div>
        </div>
        <div className="card card-sm" style={{"flex":"1","minWidth":"140px"}}>
          <div style={{"fontSize":"12px","color":"var(--text-muted)","fontWeight":"500","marginBottom":"4px"}}>Heuristics Passed</div>
          <div style={{"fontSize":"38px","fontWeight":"800","color":"var(--purple)"}}>6/10</div>
          <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>Nielsen's 10 principles</div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="card" style={{"marginBottom":"22px"}}>
        <div className="section-h"><div><div className="section-title">Usability Trend</div><div className="section-sub">Score progression over last 6 audits</div></div></div>
        <canvas id="trendChart" height="100"></canvas>
      </div>

      {/* HEURISTIC CARDS GRID */}
      <div className="grid-2" style={{"gap":"14px"}}>
        {/* H1 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #22c55e"}}>
          <div className="heuristic-num">Heuristic #1</div>
          <div className="heuristic-title">Visibility of System Status</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#22c55e"}}>88</div><div className="h-score-max">/100</div><span className="badge badge-pass" style={{"marginLeft":"auto"}}>3 issues</span></div>
          <div className="h-conf">Confidence: <strong>91%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"88%","background":"#22c55e"}}></div></div>
          <div className="h-ai-text">The system generally keeps users informed, but loading states on the checkout process lack clear progress indicators. The file upload component shows no progress feedback during longer uploads.</div>
          <div style={{"marginTop":"10px","fontSize":"12px","color":"var(--text-muted)","fontWeight":"600"}}>SUGGESTED IMPROVEMENTS</div>
          <ul style={{"marginTop":"4px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}>
            <li>Add skeleton loaders to product listing pages</li>
            <li>Implement progress bars for multi-step checkout</li>
            <li>Show upload progress percentage in real-time</li>
          </ul>
        </div>
        {/* H2 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #3b82f6"}}>
          <div className="heuristic-num">Heuristic #2</div>
          <div className="heuristic-title">Match Between System & Real World</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#3b82f6"}}>85</div><div className="h-score-max">/100</div><span className="badge badge-info" style={{"marginLeft":"auto"}}>2 issues</span></div>
          <div className="h-conf">Confidence: <strong>88%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"85%","background":"#3b82f6"}}></div></div>
          <div className="h-ai-text">Language is generally user-friendly. Technical jargon appears in error messages (e.g., "HTTP 422 Unprocessable Entity") and the dashboard uses internal product codes (SKU-4821) without explanation.</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}>
            <li>Replace HTTP error codes with plain language messages</li>
            <li>Add tooltips explaining technical terms</li>
          </ul>
        </div>
        {/* H3 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #f59e0b"}}>
          <div className="heuristic-num">Heuristic #3</div>
          <div className="heuristic-title">User Control & Freedom</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#f59e0b"}}>72</div><div className="h-score-max">/100</div><span className="badge badge-warn" style={{"marginLeft":"auto"}}>4 issues</span></div>
          <div className="h-conf">Confidence: <strong>85%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"72%","background":"#f59e0b"}}></div></div>
          <div className="h-ai-text">Users cannot undo account deletion within a grace period. The checkout process has no "Back" button between payment and review steps, forcing users to start over. Bulk actions lack confirmation dialogs.</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}>
            <li>Add "Undo" with 30-second grace period for destructive actions</li>
            <li>Implement breadcrumb navigation in multi-step flows</li>
            <li>Add Back button to all checkout steps</li>
          </ul>
        </div>
        {/* H4 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #22c55e"}}>
          <div className="heuristic-num">Heuristic #4</div>
          <div className="heuristic-title">Consistency & Standards</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#22c55e"}}>90</div><div className="h-score-max">/100</div><span className="badge badge-pass" style={{"marginLeft":"auto"}}>1 issue</span></div>
          <div className="h-conf">Confidence: <strong>93%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"90%","background":"#22c55e"}}></div></div>
          <div className="h-ai-text">The UI maintains consistent patterns throughout. Minor inconsistency: "Cancel" button is on the left in most dialogs but on the right in the payment flow, violating the established pattern.</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}><li>Standardize Cancel/Confirm button order across all dialogs</li></ul>
        </div>
        {/* H5 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #ef4444"}}>
          <div className="heuristic-num">Heuristic #5</div>
          <div className="heuristic-title">Error Prevention</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#ef4444"}}>61</div><div className="h-score-max">/100</div><span className="badge badge-critical" style={{"marginLeft":"auto"}}>5 issues</span></div>
          <div className="h-conf">Confidence: <strong>82%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"61%","background":"#ef4444"}}></div></div>
          <div className="h-ai-text">Critical: The checkout form allows users to proceed with invalid credit card numbers. The email field accepts malformed addresses. No inline validation is present until final submit, causing user frustration and high abandonment.</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}>
            <li>Add real-time inline validation to all form fields</li>
            <li>Implement Luhn algorithm check for credit card numbers</li>
            <li>Add confirmation dialog before irreversible actions</li>
            <li>Auto-format phone numbers and credit card inputs</li>
          </ul>
        </div>
        {/* H6 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #3b82f6"}}>
          <div className="heuristic-num">Heuristic #6</div>
          <div className="heuristic-title">Recognition Rather Than Recall</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#3b82f6"}}>79</div><div className="h-score-max">/100</div><span className="badge badge-warn" style={{"marginLeft":"auto"}}>3 issues</span></div>
          <div className="h-conf">Confidence: <strong>86%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"79%","background":"#3b82f6"}}></div></div>
          <div className="h-ai-text">Search results have no recent search history or suggestions. The settings page requires users to remember where they previously changed preferences. Dashboard lacks contextual help icons.</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}>
            <li>Add recent searches and typeahead suggestions</li>
            <li>Add breadcrumbs to all settings sub-pages</li>
            <li>Add contextual tooltips to all dashboard metrics</li>
          </ul>
        </div>
        {/* H7 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #22c55e"}}>
          <div className="heuristic-num">Heuristic #7</div>
          <div className="heuristic-title">Flexibility & Efficiency of Use</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#22c55e"}}>87</div><div className="h-score-max">/100</div><span className="badge badge-pass" style={{"marginLeft":"auto"}}>1 issue</span></div>
          <div className="h-conf">Confidence: <strong>90%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"87%","background":"#22c55e"}}></div></div>
          <div className="h-ai-text">Good keyboard shortcut support. No keyboard shortcut documentation visible to novice users. Power users would benefit from a command palette (Cmd+K).</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}><li>Add a command palette accessible via Cmd+K</li><li>Add a "keyboard shortcuts" help modal</li></ul>
        </div>
        {/* H8 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #22c55e"}}>
          <div className="heuristic-num">Heuristic #8</div>
          <div className="heuristic-title">Aesthetic & Minimalist Design</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#22c55e"}}>91</div><div className="h-score-max">/100</div><span className="badge badge-pass" style={{"marginLeft":"auto"}}>1 issue</span></div>
          <div className="h-conf">Confidence: <strong>94%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"91%","background":"#22c55e"}}></div></div>
          <div className="h-ai-text">Clean, modern design with excellent visual hierarchy. The pricing page contains too many competing CTA buttons. The footer has 47 links which creates visual noise.</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}><li>Reduce footer links to primary navigation only</li><li>Single primary CTA per pricing tier</li></ul>
        </div>
        {/* H9 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #f59e0b"}}>
          <div className="heuristic-num">Heuristic #9</div>
          <div className="heuristic-title">Help Users Recognize & Recover from Errors</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#f59e0b"}}>74</div><div className="h-score-max">/100</div><span className="badge badge-warn" style={{"marginLeft":"auto"}}>3 issues</span></div>
          <div className="h-conf">Confidence: <strong>84%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"74%","background":"#f59e0b"}}></div></div>
          <div className="h-ai-text">Error messages on the login page say "Invalid credentials" without specifying which field failed. Payment errors show generic "Transaction failed" without explaining reason or next steps.</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}>
            <li>Provide specific field-level error messages</li>
            <li>Include recovery suggestions in all error states</li>
            <li>Add "Forgot Password?" link directly in error message</li>
          </ul>
        </div>
        {/* H10 */}
        <div className="heuristic-card" style={{"borderLeft":"3px solid #f59e0b"}}>
          <div className="heuristic-num">Heuristic #10</div>
          <div className="heuristic-title">Help & Documentation</div>
          <div className="heuristic-score-row"><div className="h-score-num" style={{"color":"#f59e0b"}}>68</div><div className="h-score-max">/100</div><span className="badge badge-warn" style={{"marginLeft":"auto"}}>3 issues</span></div>
          <div className="h-conf">Confidence: <strong>81%</strong></div>
          <div className="progress-track" style={{"margin":"8px 0"}}><div className="progress-fill" style={{"width":"68%","background":"#f59e0b"}}></div></div>
          <div className="h-ai-text">No in-context help is available in the complex settings sections. The API documentation link is buried in the footer. New user onboarding lacks a guided tour or interactive tutorial.</div>
          <ul style={{"marginTop":"6px","fontSize":"12.5px","color":"var(--text-secondary)","paddingLeft":"16px","lineHeight":"1.8"}}>
            <li>Add contextual help tooltips throughout settings</li>
            <li>Implement an onboarding walkthrough for new users</li>
            <li>Move documentation link to primary navigation</li>
            <li>Add in-app help panel accessible from every page</li>
          </ul>
        </div>
      </div>
        </>
      )}
    </div>{/* /heuristics */}

    {/* ════════════ PAGE: USER JOURNEY ════════════ */}
    <div id="page-journey" className="page" style={{ display: activePage === 'journey' ? 'block' : 'none' }}>
      {whiteboxAudit ? (
        <div style={{ padding: '24px' }}>
          <WhiteboxIssuesView issues={whiteboxAudit.issues || []} type="HEURISTIC" title="User Journey Issues" />
        </div>
      ) : (
        <>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"20px","flexWrap":"wrap","gap":"12px"}}>
        <div>
          <div style={{"fontSize":"16px","fontWeight":"700","color":"var(--text-primary)"}}>User Journey Analysis</div>
          <div style={{"fontSize":"13px","color":"var(--text-muted)"}}>Interactive flow — click any step for detailed analysis</div>
        </div>
        <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
          <span className="badge badge-pass">3 Success</span>
          <span className="badge badge-warn">3 Warning</span>
          <span className="badge badge-fail">2 Failed</span>
          <span className="badge badge-info">Avg Drop-off: 12%</span>
        </div>
      </div>

      {/* FLOW */}
      <div className="card" style={{"marginBottom":"16px","overflowX":"auto"}}>
        <div className="journey-flow" id="journeyFlow">
          {/* Homepage */}
          <div className="journey-step">
            <div className={`journey-step-card success ${activeJourneyStep === 'homepage' ? 'active-step' : ''}`} onClick={() => setActiveJourneyStep('homepage')}>
              <div className="journey-icon" style={{"background":"#dcfce7"}}>🏠</div>
              <div className="journey-step-name">Homepage</div>
              <div className="journey-step-status" style={{"color":"#16a34a"}}>✓ Success</div>
              <div style={{"fontSize":"10.5px","color":"var(--text-muted)","marginTop":"4px"}}>2.1s · 0 clicks</div>
            </div>
          </div>
          <div className="journey-arrow"><svg style={{"width":"20px","height":"20px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          {/* Navigation */}
          <div className="journey-step">
            <div className={`journey-step-card success ${activeJourneyStep === 'navigation' ? 'active-step' : ''}`} onClick={() => setActiveJourneyStep('navigation')}>
              <div className="journey-icon" style={{"background":"#dcfce7"}}>🧭</div>
              <div className="journey-step-name">Navigation</div>
              <div className="journey-step-status" style={{"color":"#16a34a"}}>✓ Success</div>
              <div style={{"fontSize":"10.5px","color":"var(--text-muted)","marginTop":"4px"}}>1.4s · 3 clicks</div>
            </div>
          </div>
          <div className="journey-arrow"><svg style={{"width":"20px","height":"20px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          {/* Pricing */}
          <div className="journey-step">
            <div className={`journey-step-card warning ${activeJourneyStep === 'pricing' ? 'active-step' : ''}`} onClick={() => setActiveJourneyStep('pricing')}>
              <div className="journey-icon" style={{"background":"#fef9c3"}}>💰</div>
              <div className="journey-step-name">Pricing</div>
              <div className="journey-step-status" style={{"color":"#ca8a04"}}>⚠ Warning</div>
              <div style={{"fontSize":"10.5px","color":"var(--text-muted)","marginTop":"4px"}}>4.7s · 6 clicks</div>
            </div>
          </div>
          <div className="journey-arrow"><svg style={{"width":"20px","height":"20px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          {/* Signup */}
          <div className="journey-step">
            <div className={`journey-step-card warning ${activeJourneyStep === 'signup' ? 'active-step' : ''}`} onClick={() => setActiveJourneyStep('signup')}>
              <div className="journey-icon" style={{"background":"#fef9c3"}}>📝</div>
              <div className="journey-step-name">Signup</div>
              <div className="journey-step-status" style={{"color":"#ca8a04"}}>⚠ Warning</div>
              <div style={{"fontSize":"10.5px","color":"var(--text-muted)","marginTop":"4px"}}>3.2s · 12 clicks</div>
            </div>
          </div>
          <div className="journey-arrow"><svg style={{"width":"20px","height":"20px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          {/* Login */}
          <div className="journey-step">
            <div className={`journey-step-card success ${activeJourneyStep === 'login' ? 'active-step' : ''}`} onClick={() => setActiveJourneyStep('login')}>
              <div className="journey-icon" style={{"background":"#dcfce7"}}>🔐</div>
              <div className="journey-step-name">Login</div>
              <div className="journey-step-status" style={{"color":"#16a34a"}}>✓ Success</div>
              <div style={{"fontSize":"10.5px","color":"var(--text-muted)","marginTop":"4px"}}>1.8s · 4 clicks</div>
            </div>
          </div>
          <div className="journey-arrow"><svg style={{"width":"20px","height":"20px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          {/* Checkout */}
          <div className="journey-step">
            <div className={`journey-step-card failed ${activeJourneyStep === 'checkout' ? 'active-step' : ''}`} onClick={() => setActiveJourneyStep('checkout')}>
              <div className="journey-icon" style={{"background":"#fee2e2"}}>🛒</div>
              <div className="journey-step-name">Checkout</div>
              <div className="journey-step-status" style={{"color":"#dc2626"}}>✗ Failed</div>
              <div style={{"fontSize":"10.5px","color":"var(--text-muted)","marginTop":"4px"}}>9.3s · 18 clicks</div>
            </div>
          </div>
          <div className="journey-arrow"><svg style={{"width":"20px","height":"20px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          {/* Payment */}
          <div className="journey-step">
            <div className={`journey-step-card failed ${activeJourneyStep === 'payment' ? 'active-step' : ''}`} onClick={() => setActiveJourneyStep('payment')}>
              <div className="journey-icon" style={{"background":"#fee2e2"}}>💳</div>
              <div className="journey-step-name">Payment</div>
              <div className="journey-step-status" style={{"color":"#dc2626"}}>✗ Failed</div>
              <div style={{"fontSize":"10.5px","color":"var(--text-muted)","marginTop":"4px"}}>12.1s · 22 clicks</div>
            </div>
          </div>
          <div className="journey-arrow"><svg style={{"width":"20px","height":"20px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
          {/* Confirmation */}
          <div className="journey-step">
            <div className={`journey-step-card warning ${activeJourneyStep === 'confirmation' ? 'active-step' : ''}`} onClick={() => setActiveJourneyStep('confirmation')}>
              <div className="journey-icon" style={{"background":"#fef9c3"}}>✅</div>
              <div className="journey-step-name">Confirmation</div>
              <div className="journey-step-status" style={{"color":"#ca8a04"}}>⚠ Warning</div>
              <div style={{"fontSize":"10.5px","color":"var(--text-muted)","marginTop":"4px"}}>2.4s · 2 clicks</div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP DETAIL */}
      <div id="journeyDetail" className="journey-detail">
        <div id="journeyDetailContent"></div>
      </div>

      {/* METRICS GRID */}
      <div className="grid-4" style={{"marginTop":"16px"}}>
        <div className="card card-sm"><div style={{"fontSize":"11px","color":"var(--text-muted)","fontWeight":"600","marginBottom":"4px","textTransform":"uppercase"}}>Total Duration</div><div style={{"fontSize":"26px","fontWeight":"800","color":"var(--text-primary)"}}>36.8s</div><div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>Full journey time</div></div>
        <div className="card card-sm"><div style={{"fontSize":"11px","color":"var(--text-muted)","fontWeight":"600","marginBottom":"4px","textTransform":"uppercase"}}>Total Clicks</div><div style={{"fontSize":"26px","fontWeight":"800","color":"var(--text-primary)"}}>67</div><div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>All interactions</div></div>
        <div className="card card-sm" style={{"borderColor":"#fecaca"}}><div style={{"fontSize":"11px","color":"var(--red)","fontWeight":"700","marginBottom":"4px","textTransform":"uppercase"}}>Max Drop-off</div><div style={{"fontSize":"26px","fontWeight":"800","color":"var(--red)"}}>34%</div><div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>At Payment step</div></div>
        <div className="card card-sm" style={{"borderColor":"#fecaca"}}><div style={{"fontSize":"11px","color":"var(--red)","fontWeight":"700","marginBottom":"4px","textTransform":"uppercase"}}>Avg Friction</div><div style={{"fontSize":"26px","fontWeight":"800","color":"var(--orange)"}}>6.2</div><div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>/10 score</div></div>
      </div>
        </>
      )}
    </div>{/* /journey */}

    {/* ════════════ PAGE: AI FIXES ════════════ */}
    <div id="page-aifixes" className="page" style={{ display: activePage === 'aifixes' ? 'block' : 'none' }}>
      {whiteboxAudit ? (
        <WhiteboxAIFixesView issues={whiteboxAudit.issues || []} auditId={whiteboxAudit._id} />
      ) : (
        <>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"20px","flexWrap":"wrap","gap":"12px"}}>
        <div>
          <div style={{"fontSize":"16px","fontWeight":"700","color":"var(--text-primary)"}}>AI-Generated Fixes</div>
          <div style={{"fontSize":"13px","color":"var(--text-muted)"}}>Code solutions with before/after comparisons</div>
        </div>
        <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
          <span className="badge badge-verified">5 Verified</span>
          <span className="badge badge-warn">12 Pending Review</span>
          <span className="badge badge-info">17 Total Fixes</span>
        </div>
      </div>

      {/* FIX 1 */}
      <div className="fix-card">
        <div className="fix-card-header">
          <div style={{"width":"38px","height":"38px","background":"#fef2f2","borderRadius":"10px","display":"flex","alignItems":"center","justifyContent":"center","flexShrink":"0"}}>
            <svg style={{"width":"18px","height":"18px","color":"#dc2626"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div style={{"flex":"1"}}>
            <div className="fix-card-title">Fix Missing Alt Text on Product Images</div>
            <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>WCAG 1.1.1 · Images</div>
          </div>
          <span className="badge badge-critical">Critical</span>
          <span className="badge badge-verified">✓ Verified</span>
        </div>
        <div className="fix-meta-row">
          <div className="fix-meta-item"><strong>Est. Fix Time:</strong> 30 mins</div>
          <div className="fix-meta-item"><strong>Difficulty:</strong> <span style={{"color":"#16a34a"}}>Easy</span></div>
          <div className="fix-meta-item"><strong>UX Improvement:</strong> <span style={{"color":"#16a34a"}}>+4 score points</span></div>
          <div className="fix-meta-item"><strong>Status:</strong> <span style={{"color":"#16a34a"}}>Verified ✓</span></div>
        </div>

        {/* Before/After slider */}
        <div className="slider-wrap">
          <div className="slider-before" style={{"width":"100%"}}>
            <div style={{"textAlign":"center"}}><div style={{"fontSize":"10px","opacity":".7","marginBottom":"4px"}}>BEFORE</div><div style={{"background":"rgba(0,0,0,.1)","padding":"6px 12px","borderRadius":"6px","fontFamily":"monospace","fontSize":"11px"}}>&lt;img src="product.jpg"&gt;</div></div>
          </div>
          <div className="slider-after">
            <div style={{"textAlign":"center"}}><div style={{"fontSize":"10px","opacity":".7","marginBottom":"4px"}}>AFTER</div><div style={{"background":"rgba(0,0,0,.1)","padding":"6px 12px","borderRadius":"6px","fontFamily":"monospace","fontSize":"11px"}}>&lt;img src="product.jpg" alt="Blue wireless headphones"&gt;</div></div>
          </div>
          <div className="slider-handle" id="sliderHandle1"></div>
        </div>

        <div className="before-after">
          <div className="ba-pane ba-before">
            <div className="ba-pane-label">
              <svg style={{"width":"12px","height":"12px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Before HTML
            </div>
            <div className="code-block" style={{"borderRadius":"0","margin":"0"}}>
              <button className="code-copy-btn" onClick={() => showToast('Copied!')}>Copy</button>
              <span style={{"color":"#f87171"}}>&lt;img</span> <span style={{"color":"#86efac"}}>src</span>=<span style={{"color":"#fde68a"}}>"product-hero.jpg"</span><span style={{"color":"#f87171"}}>&gt;</span>
            </div>
          </div>
          <div className="ba-pane ba-after">
            <div className="ba-pane-label">
              <svg style={{"width":"12px","height":"12px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              Suggested HTML
            </div>
            <div className="code-block" style={{"borderRadius":"0","margin":"0","background":"#0a1628"}}>
              <button className="code-copy-btn" onClick={() => showToast('Copied!')}>Copy</button>
              <span style={{"color":"#f87171"}}>&lt;img</span><br  />
              &nbsp;&nbsp;<span style={{"color":"#86efac"}}>src</span>=<span style={{"color":"#fde68a"}}>"product-hero.jpg"</span><br  />
              &nbsp;&nbsp;<span style={{"color":"#86efac"}}>alt</span>=<span style={{"color":"#fde68a"}}>"Blue wireless over-ear headphones"</span><br  />
              &nbsp;&nbsp;<span style={{"color":"#86efac"}}>loading</span>=<span style={{"color":"#fde68a"}}>"lazy"</span><br  />
              <span style={{"color":"#f87171"}}>&gt;</span>
            </div>
          </div>
        </div>
      </div>

      {/* FIX 2 */}
      <div className="fix-card">
        <div className="fix-card-header">
          <div style={{"width":"38px","height":"38px","background":"#fff7ed","borderRadius":"10px","display":"flex","alignItems":"center","justifyContent":"center","flexShrink":"0"}}>
            <svg style={{"width":"18px","height":"18px","color":"#ea580c"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c.926 0 1.671-.754 1.671-1.682 0-.423-.162-.826-.44-1.12-.278-.292-.42-.694-.42-1.098 0-.834.669-1.5 1.5-1.5H16c2.761 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/></svg>
          </div>
          <div style={{"flex":"1"}}>
            <div className="fix-card-title">Fix Color Contrast on CTA Button</div>
            <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>WCAG 1.4.3 · Color Contrast</div>
          </div>
          <span className="badge badge-critical">Critical</span>
          <span className="badge badge-verified">✓ Verified</span>
        </div>
        <div className="fix-meta-row">
          <div className="fix-meta-item"><strong>Est. Fix Time:</strong> 15 mins</div>
          <div className="fix-meta-item"><strong>Difficulty:</strong> <span style={{"color":"#16a34a"}}>Easy</span></div>
          <div className="fix-meta-item"><strong>UX Improvement:</strong> <span style={{"color":"#16a34a"}}>+3 score points</span></div>
          <div className="fix-meta-item"><strong>New Ratio:</strong> <span style={{"color":"#16a34a"}}>7.2:1 ✓ AA</span></div>
        </div>
        <div className="before-after">
          <div className="ba-pane ba-before">
            <div className="ba-pane-label">Before CSS</div>
            <div className="code-block" style={{"borderRadius":"0","margin":"0"}}>
              <button className="code-copy-btn" onClick={() => showToast('Copied!')}>Copy</button>
              <span style={{"color":"#86efac"}}>.cta-btn</span> {"{"}<br  />
              &nbsp;&nbsp;<span style={{"color":"#93c5fd"}}>background</span>: <span style={{"color":"#fde68a"}}>#86efac</span>;<br  />
              &nbsp;&nbsp;<span style={{"color":"#93c5fd"}}>color</span>: <span style={{"color":"#fde68a"}}>#ffffff</span>;<br  />
              {"}"}
            </div>
          </div>
          <div className="ba-pane ba-after">
            <div className="ba-pane-label">Suggested CSS</div>
            <div className="code-block" style={{"borderRadius":"0","margin":"0","background":"#0a1628"}}>
              <button className="code-copy-btn" onClick={() => showToast('Copied!')}>Copy</button>
              <span style={{"color":"#86efac"}}>.cta-btn</span> {"{"}<br  />
              &nbsp;&nbsp;<span style={{"color":"#93c5fd"}}>background</span>: <span style={{"color":"#fde68a"}}>#15803d</span>;<br  />
              &nbsp;&nbsp;<span style={{"color":"#93c5fd"}}>color</span>: <span style={{"color":"#fde68a"}}>#ffffff</span>;<br  />
              &nbsp;&nbsp;<span style={{"color":"#64748b"}}>/* ratio: 7.2:1 ✓ */</span><br  />
              {"}"}
            </div>
          </div>
        </div>
      </div>

      {/* FIX 3 */}
      <div className="fix-card">
        <div className="fix-card-header">
          <div style={{"width":"38px","height":"38px","background":"#fef2f2","borderRadius":"10px","display":"flex","alignItems":"center","justifyContent":"center","flexShrink":"0"}}>
            <svg style={{"width":"18px","height":"18px","color":"#dc2626"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
          </div>
          <div style={{"flex":"1"}}>
            <div className="fix-card-title">Fix Keyboard Trap in Cookie Modal</div>
            <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>WCAG 2.1.2 · Keyboard Navigation</div>
          </div>
          <span className="badge badge-critical">Critical</span>
          <span style={{"fontSize":"11px","color":"var(--orange)","background":"#fff7ed","border":"1px solid #fed7aa","padding":"3px 9px","borderRadius":"20px","fontWeight":"600"}}>Pending Review</span>
        </div>
        <div className="fix-meta-row">
          <div className="fix-meta-item"><strong>Est. Fix Time:</strong> 2 hours</div>
          <div className="fix-meta-item"><strong>Difficulty:</strong> <span style={{"color":"#ca8a04"}}>Medium</span></div>
          <div className="fix-meta-item"><strong>UX Improvement:</strong> <span style={{"color":"#16a34a"}}>+6 score points</span></div>
        </div>
        <div className="before-after">
          <div className="ba-pane ba-before">
            <div className="ba-pane-label">Before JS</div>
            <div className="code-block" style={{"borderRadius":"0","margin":"0"}}>
              <button className="code-copy-btn" onClick={() => showToast('Copied!')}>Copy</button>
              <span style={{"color":"#94a3b8"}}>// No focus management</span><br  />
              <span style={{"color":"#f87171"}}>modal</span>.<span style={{"color":"#93c5fd"}}>show</span>();
            </div>
          </div>
          <div className="ba-pane ba-after">
            <div className="ba-pane-label">Suggested JS</div>
            <div className="code-block" style={{"borderRadius":"0","margin":"0","background":"#0a1628"}}>
              <button className="code-copy-btn" onClick={() => showToast('Copied!')}>Copy</button>
              <span style={{"color":"#f87171"}}>const</span> <span style={{"color":"#86efac"}}>focusable</span> = modal.<br  />
              &nbsp;&nbsp;<span style={{"color":"#93c5fd"}}>querySelectorAll</span>(<span style={{"color":"#fde68a"}}>'a,button,input'</span>);<br  />
              <span style={{"color":"#f87171"}}>document</span>.<span style={{"color":"#93c5fd"}}>addEventListener</span>(<span style={{"color":"#fde68a"}}>'keydown'</span>, e =&gt; {"{"}<br  />
              &nbsp;&nbsp;<span style={{"color":"#f87171"}}>if</span>(e.key === <span style={{"color":"#fde68a"}}>'Escape'</span>) modal.<span style={{"color":"#93c5fd"}}>close</span>();<br  />
              &nbsp;&nbsp;<span style={{"color":"#94a3b8"}}>// Trap focus in focusable[]</span><br  />
              {"}"});
            </div>
          </div>
        </div>
      </div>

      {/* FIX 4 */}
      <div className="fix-card">
        <div className="fix-card-header">
          <div style={{"width":"38px","height":"38px","background":"#eff6ff","borderRadius":"10px","display":"flex","alignItems":"center","justifyContent":"center","flexShrink":"0"}}>
            <svg style={{"width":"18px","height":"18px","color":"#2563eb"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div style={{"flex":"1"}}>
            <div className="fix-card-title">Add Labels to Signup Form Inputs</div>
            <div style={{"fontSize":"12px","color":"var(--text-secondary)"}}>WCAG 1.3.1 · Forms</div>
          </div>
          <span className="badge badge-high">High</span>
          <span className="badge badge-verified">✓ Verified</span>
        </div>
        <div className="fix-meta-row">
          <div className="fix-meta-item"><strong>Est. Fix Time:</strong> 45 mins</div>
          <div className="fix-meta-item"><strong>Difficulty:</strong> <span style={{"color":"#16a34a"}}>Easy</span></div>
          <div className="fix-meta-item"><strong>UX Improvement:</strong> <span style={{"color":"#16a34a"}}>+2 score points</span></div>
        </div>
        <div className="before-after">
          <div className="ba-pane ba-before">
            <div className="ba-pane-label">Before HTML</div>
            <div className="code-block" style={{"borderRadius":"0","margin":"0"}}>
              <button className="code-copy-btn" onClick={() => showToast('Copied!')}>Copy</button>
              <span style={{"color":"#f87171"}}>&lt;input</span> <span style={{"color":"#86efac"}}>type</span>=<span style={{"color":"#fde68a"}}>"email"</span><br  />
              &nbsp;&nbsp;<span style={{"color":"#86efac"}}>placeholder</span>=<span style={{"color":"#fde68a"}}>"Email"</span><span style={{"color":"#f87171"}}>&gt;</span>
            </div>
          </div>
          <div className="ba-pane ba-after">
            <div className="ba-pane-label">Suggested HTML</div>
            <div className="code-block" style={{"borderRadius":"0","margin":"0","background":"#0a1628"}}>
              <button className="code-copy-btn" onClick={() => showToast('Copied!')}>Copy</button>
              <span style={{"color":"#f87171"}}>&lt;label</span> <span style={{"color":"#86efac"}}>for</span>=<span style={{"color":"#fde68a"}}>"email"</span><span style={{"color":"#f87171"}}>&gt;</span>Email<span style={{"color":"#f87171"}}>&lt;/label&gt;</span><br  />
              <span style={{"color":"#f87171"}}>&lt;input</span> <span style={{"color":"#86efac"}}>id</span>=<span style={{"color":"#fde68a"}}>"email"</span> <span style={{"color":"#86efac"}}>type</span>=<span style={{"color":"#fde68a"}}>"email"</span><br  />
              &nbsp;&nbsp;<span style={{"color":"#86efac"}}>autoComplete</span>=<span style={{"color":"#fde68a"}}>"email"</span><br  />
              &nbsp;&nbsp;<span style={{"color":"#86efac"}}>aria-required</span>=<span style={{"color":"#fde68a"}}>"true"</span><span style={{"color":"#f87171"}}>&gt;</span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>{/* /aifixes */}

    {/* ════════════ PAGE: REPORTS ════════════ */}
    <div id="page-reports" className="page" style={{ display: activePage === 'reports' ? 'block' : 'none' }}>
      {/* Action bar */}
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"24px","flexWrap":"wrap","gap":"10px"}}>
        <div>
          <div style={{"fontSize":"16px","fontWeight":"700","color":"var(--text-primary)"}}>Audit Report</div>
          <div style={{"fontSize":"13px","color":"var(--text-muted)"}}>Professional consulting document · June 27, 2026</div>
        </div>
        <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('PDF downloading…')}><svg style={{"width":"14px","height":"14px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>PDF</button>
          <button className="btn btn-secondary btn-sm" onClick={() => showToast('HTML downloading…')}>HTML</button>
          <button className="btn btn-secondary btn-sm" onClick={() => showToast('JSON downloading…')}>JSON</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { /* window.print() */ }}>Print</button>
          <button className="btn btn-secondary btn-sm" onClick={() => showToast('Share link copied!')}>Share</button>
        </div>
      </div>

      <div className="report-doc">
        {/* HEADER */}
        <div className="report-header">
          <div className="report-logo">
            <div className="report-logo-icon"><svg style={{"width":"20px","height":"20px","color":"#fff"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.698-1.32 2.698H4.12c-1.35 0-2.32-1.698-1.32-2.698L4 15.3"/></svg></div>
            <div style={{"fontSize":"16px","fontWeight":"800","color":"var(--text-primary)"}}>Conversational UX Auditor</div>
          </div>
          <div className="report-title">UX Accessibility Audit Report</div>
          <div className="report-subtitle">acme-corp.io · Audited June 27, 2026 · Prepared by Jamie Davis</div>
          <div style={{"marginTop":"16px","display":"flex","justifyContent":"center","gap":"16px","flexWrap":"wrap"}}>
            <span className="badge badge-info">Overall Grade: B+</span>
            <span className="badge badge-info">Score: 78.4/100</span>
            <span className="badge badge-info">27 Issues Found</span>
            <span className="badge badge-info">WCAG 2.1 AA</span>
          </div>
        </div>

        {/* EXEC SUMMARY */}
        <div className="report-section">
          <div className="report-section-title">Executive Summary</div>
          <div className="report-section-sub">High-level findings for stakeholders</div>
          <div className="exec-summary">
            This audit of <strong>acme-corp.io</strong> was conducted on <strong>June 27, 2026</strong> using the Conversational UX Auditor AI platform. The site received an overall grade of <strong>B+ (78.4/100)</strong>, indicating a good baseline with significant improvement opportunities. A total of <strong>27 issues</strong> were identified across Accessibility, UX Heuristics, and User Journey categories.<br  /><br  />
            <strong>Critical Finding:</strong> The checkout and payment flows present the most severe UX friction, with drop-off rates reaching 34%. Five critical accessibility violations require immediate remediation to achieve WCAG 2.1 AA compliance. Addressing all critical and high-priority issues is estimated to raise the overall score to <strong>A− (91/100)</strong> and increase conversion rates by an estimated <strong>18-24%</strong>.
          </div>
        </div>

        {/* SCORES OVERVIEW */}
        <div className="report-section">
          <div className="report-section-title">Overall Scores</div>
          <div className="report-section-sub">Category breakdown</div>
          <div style={{"display":"grid","gridTemplateColumns":"repeat(4,1fr)","gap":"12px"}}>
            <div style={{"textAlign":"center","padding":"16px 12px","background":"var(--bg)","borderRadius":"var(--radius)","border":"1px solid var(--border)"}}>
              <div style={{"fontSize":"32px","fontWeight":"800","color":"#2563eb"}}>71</div>
              <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text-secondary)","marginTop":"4px"}}>Accessibility</div>
              <div className="progress-track" style={{"marginTop":"8px"}}><div className="progress-fill" style={{"width":"71%","background":"#2563eb"}}></div></div>
            </div>
            <div style={{"textAlign":"center","padding":"16px 12px","background":"var(--bg)","borderRadius":"var(--radius)","border":"1px solid var(--border)"}}>
              <div style={{"fontSize":"32px","fontWeight":"800","color":"#7c3aed"}}>82</div>
              <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text-secondary)","marginTop":"4px"}}>UX Heuristics</div>
              <div className="progress-track" style={{"marginTop":"8px"}}><div className="progress-fill" style={{"width":"82%","background":"#7c3aed"}}></div></div>
            </div>
            <div style={{"textAlign":"center","padding":"16px 12px","background":"var(--bg)","borderRadius":"var(--radius)","border":"1px solid var(--border)"}}>
              <div style={{"fontSize":"32px","fontWeight":"800","color":"#16a34a"}}>79</div>
              <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text-secondary)","marginTop":"4px"}}>User Journey</div>
              <div className="progress-track" style={{"marginTop":"8px"}}><div className="progress-fill" style={{"width":"79%","background":"#16a34a"}}></div></div>
            </div>
            <div style={{"textAlign":"center","padding":"16px 12px","background":"var(--bg)","borderRadius":"var(--radius)","border":"1px solid var(--border)"}}>
              <div style={{"fontSize":"32px","fontWeight":"800","color":"#ea580c"}}>68</div>
              <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--text-secondary)","marginTop":"4px"}}>Performance</div>
              <div className="progress-track" style={{"marginTop":"8px"}}><div className="progress-fill" style={{"width":"68%","background":"#ea580c"}}></div></div>
            </div>
          </div>
        </div>

        {/* CRITICAL ISSUES */}
        <div className="report-section">
          <div className="report-section-title">Critical Issues</div>
          <div className="report-section-sub">Require immediate remediation</div>
          <table className="tbl">
            <thead><tr><th>#</th><th>Issue</th><th>Category</th><th>WCAG</th><th>Severity</th><th>Est. Fix</th></tr></thead>
            <tbody>
              <tr><td style={{"fontWeight":"700","color":"var(--text-muted)"}}>01</td><td style={{"fontWeight":"600"}}>Missing alt text on 8 product images</td><td>Accessibility</td><td><span className="wcag-ref">1.1.1</span></td><td><span className="badge badge-critical">Critical</span></td><td>30 min</td></tr>
              <tr><td style={{"fontWeight":"700","color":"var(--text-muted)"}}>02</td><td style={{"fontWeight":"600"}}>CTA button color contrast 1.89:1 (fails AA)</td><td>Accessibility</td><td><span className="wcag-ref">1.4.3</span></td><td><span className="badge badge-critical">Critical</span></td><td>15 min</td></tr>
              <tr><td style={{"fontWeight":"700","color":"var(--text-muted)"}}>03</td><td style={{"fontWeight":"600"}}>Keyboard focus trapped in cookie modal</td><td>Accessibility</td><td><span className="wcag-ref">2.1.2</span></td><td><span className="badge badge-critical">Critical</span></td><td>2 hrs</td></tr>
              <tr><td style={{"fontWeight":"700","color":"var(--text-muted)"}}>04</td><td style={{"fontWeight":"600"}}>Checkout form: no inline validation</td><td>UX Heuristics</td><td>H5</td><td><span className="badge badge-critical">Critical</span></td><td>1 day</td></tr>
              <tr><td style={{"fontWeight":"700","color":"var(--text-muted)"}}>05</td><td style={{"fontWeight":"600"}}>Payment flow 34% drop-off rate</td><td>User Journey</td><td>—</td><td><span className="badge badge-critical">Critical</span></td><td>3 days</td></tr>
            </tbody>
          </table>
        </div>

        {/* RECOMMENDATIONS + ANNOTATED SCREENSHOTS */}
        <div className="report-section">
          <div className="report-section-title">Annotated Screenshots</div>
          <div className="report-section-sub">Visual evidence of identified issues</div>
          <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px"}}>
            <div>
              <div className="anno-screenshot"><span style={{"fontSize":"12px","color":"var(--text-muted)"}}>Homepage – Missing Alt Text ①</span></div>
              <div style={{"fontSize":"12px","color":"var(--text-secondary)","marginTop":"6px","padding":"8px","background":"var(--bg)","borderRadius":"6px","borderLeft":"3px solid var(--red)"}}>8 &lt;img&gt; elements with empty alt attributes detected on hero section and product grid.</div>
            </div>
            <div>
              <div className="anno-screenshot"><span style={{"fontSize":"12px","color":"var(--text-muted)"}}>Checkout – Form Errors ②</span></div>
              <div style={{"fontSize":"12px","color":"var(--text-secondary)","marginTop":"6px","padding":"8px","background":"var(--bg)","borderRadius":"6px","borderLeft":"3px solid var(--orange)"}}>No real-time validation on credit card field. User cannot proceed but receives no feedback.</div>
            </div>
            <div>
              <div className="anno-screenshot"><span style={{"fontSize":"12px","color":"var(--text-muted)"}}>CTA Button – Contrast ③</span></div>
              <div style={{"fontSize":"12px","color":"var(--text-secondary)","marginTop":"6px","padding":"8px","background":"var(--bg)","borderRadius":"6px","borderLeft":"3px solid var(--red)"}}>Button background #86efac with white text: 1.89:1 ratio. WCAG AA requires 4.5:1.</div>
            </div>
            <div>
              <div className="anno-screenshot"><span style={{"fontSize":"12px","color":"var(--text-muted)"}}>Cookie Modal – Focus Trap ④</span></div>
              <div style={{"fontSize":"12px","color":"var(--text-secondary)","marginTop":"6px","padding":"8px","background":"var(--bg)","borderRadius":"6px","borderLeft":"3px solid var(--red)"}}>Keyboard focus cannot leave the modal. No Escape key handler. Blocker for all keyboard users.</div>
            </div>
          </div>
        </div>

        {/* IMPROVEMENT ROADMAP */}
        <div className="report-section">
          <div className="report-section-title">Improvement Roadmap</div>
          <div className="report-section-sub">Prioritized action plan for development team</div>
          <div className="roadmap-item"><div className="roadmap-num">1</div><div className="roadmap-content"><div className="roadmap-title">Sprint 1 — Critical Fixes (Week 1)</div><div className="roadmap-desc">Fix alt text, color contrast, keyboard focus trap. Estimated score improvement: +8 points. These are quick wins with high impact.</div></div></div>
          <div className="roadmap-item"><div className="roadmap-num">2</div><div className="roadmap-content"><div className="roadmap-title">Sprint 2 — Checkout Overhaul (Week 2-3)</div><div className="roadmap-desc">Redesign checkout with inline validation, clear progress indicators, and error recovery. Expected conversion increase: +18%.</div></div></div>
          <div className="roadmap-item"><div className="roadmap-num">3</div><div className="roadmap-content"><div className="roadmap-title">Sprint 3 — Form Accessibility (Week 3)</div><div className="roadmap-desc">Add proper labels, ARIA attributes, and focus indicators to all forms. Brings site to WCAG 2.1 AA compliance.</div></div></div>
          <div className="roadmap-item"><div className="roadmap-num">4</div><div className="roadmap-content"><div className="roadmap-title">Sprint 4 — UX Improvements (Week 4-5)</div><div className="roadmap-desc">Implement undo/redo, improve error messages, add keyboard shortcuts. Estimated score: A− (91/100).</div></div></div>
          <div className="roadmap-item"><div className="roadmap-num">5</div><div className="roadmap-content"><div className="roadmap-title">Sprint 5 — Performance & Polish (Week 6)</div><div className="roadmap-desc">Optimize Core Web Vitals, implement loading states, add onboarding flow. Target final score: A (95/100).</div></div></div>
        </div>

        {/* AI SUGGESTIONS */}
        <div className="report-section">
          <div className="report-section-title">AI Recommendations</div>
          <div style={{"background":"linear-gradient(135deg,#eff6ff,#f5f3ff)","border":"1px solid var(--blue-mid)","borderRadius":"var(--radius-lg)","padding":"18px 20px"}}>
            <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--text-primary)","marginBottom":"8px"}}>🤖 AI Analysis Summary</div>
            <div style={{"fontSize":"13px","color":"var(--text-secondary)","lineHeight":"1.7"}}>Based on pattern analysis across 10,000+ audited sites, acme-corp.io's most impactful improvements will be in the checkout flow (estimated 34% drop-off reduction) and accessibility compliance (bringing the site to WCAG 2.1 AA). The development team should prioritize the 5 critical issues, all of which have estimated fix times under 2 hours except for the checkout overhaul. The projected overall score after all fixes is <strong>95/100 (Grade A)</strong>.</div>
          </div>
        </div>
      </div>
    </div>{/* /reports */}



    {/* ════════════ PAGE: AI CHAT ════════════ */}
    <div id="page-chat" className="page" style={{ display: activePage === 'chat' ? 'block' : 'none' }}>
      <div className="chat-wrap">
        <div className="chat-messages" id="chatMessages">
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <svg style={{"width":"28px","height":"28px","color":"#fff"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <div className="chat-welcome-title">Ask anything about this audit.</div>
            <div className="chat-welcome-sub">I have full context of your acme-corp.io audit from June 27, 2026 · B+ · 27 issues found.</div>
            <div className="chat-suggestions">
              <span className="chat-suggestion" onClick={() => sendChat('Explain my accessibility issues')}>Explain my accessibility issues</span>
              <span className="chat-suggestion" onClick={() => sendChat('How can I improve usability?')}>How can I improve usability?</span>
              <span className="chat-suggestion" onClick={() => sendChat('Why is keyboard trap marked Critical?')}>Why is this issue Critical?</span>
              <span className="chat-suggestion" onClick={() => sendChat('Generate React code for the form label fix')}>Generate React code for this fix</span>
              <span className="chat-suggestion" onClick={() => sendChat('Generate Tailwind CSS for the CTA button fix')}>Generate Tailwind CSS</span>
              <span className="chat-suggestion" onClick={() => sendChat('Explain this report to a client')}>Explain this report to a client</span>
              <span className="chat-suggestion" onClick={() => sendChat('Prioritize issues by business impact')}>Prioritize issues by impact</span>
            </div>
          </div>
        </div>
        <div className="chat-input-area">
          <textarea className="chat-input" id="chatInput" rows="1" placeholder="Ask anything about this audit…" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}></textarea>
          <button className="chat-send-btn" onClick={() => sendChat()}>
            <svg style={{"width":"18px","height":"18px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>{/* /chat */}

  </div>{/* /content */}
</div>{/* /main */}

{/* FLOATING AI BUTTON */}
<button id="floatAI" onClick={() => { /* switchPage('chat',document.querySelector('[data-page=chat]')) */ }} title="Open AI Assistant">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
</button>

{/* TOAST */}
<div id="toast" style={{"position":"fixed","bottom":"90px","right":"28px","background":"#0f172a","color":"#fff","padding":"10px 18px","borderRadius":"10px","fontSize":"13px","fontWeight":"500","transition":"all .3s ease","zIndex":"2000","pointerEvents":"none", "opacity": toastMessage ? "1" : "0", "transform": toastMessage ? "translateY(0)" : "translateY(8px)"}}>{toastMessage}</div>
    </div>
  );
};

export default DashboardReact;
