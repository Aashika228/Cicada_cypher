import { useState, useMemo, useEffect, useRef } from 'react';

const STEPS = [
  'Fetching repository files',
  'Parsing frontend code',
  'Running WCAG checks',
  'Running heuristic checks',
  'Calculating score',
  'Generating AI fixes',
];

function SeverityBadge({ severity }) {
  let badgeClass = 'badge-low';
  if (severity === 'CRITICAL') badgeClass = 'badge-critical';
  if (severity === 'HIGH') badgeClass = 'badge-high';
  if (severity === 'MEDIUM') badgeClass = 'badge-medium';
  if (severity === 'LOW') badgeClass = 'badge-low';
  
  return (
    <span className={`badge ${badgeClass}`}>
      {severity}
    </span>
  );
}

function IssueCard({ issue }) {
  const [showFixed, setShowFixed] = useState(false);

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <SeverityBadge severity={issue.severity} />
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
          {issue.ruleId} — {issue.ruleName}
        </span>
        <span className="badge badge-info">
          {issue.type}
        </span>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'monospace' }}>{issue.file}</span>
        <span style={{ margin: '0 8px' }}>·</span>
        <span>Line {issue.line}</span>
      </div>

      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{issue.message}</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <button
          type="button"
          onClick={() => setShowFixed(false)}
          className={`btn ${!showFixed ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Before
        </button>
        <button
          type="button"
          onClick={() => setShowFixed(true)}
          className={`btn ${showFixed ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          After
        </button>
      </div>

      <pre className="code-block" style={{ marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
        {showFixed ? (issue.fix?.fixedCode || issue.suggestedFix || 'No fix available') : issue.code}
      </pre>

      {issue.fix && (
        <div className="grid-2">
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginBottom: '4px' }}>Why it matters</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{issue.fix.whyItMatters}</p>
          </div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginBottom: '4px' }}>Time to fix</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{issue.fix.timeToFix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, grade }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div className="score-ring" style={{ width: '130px', height: '130px' }}>
      <svg width="130" height="130" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'all 1s' }}
        />
      </svg>
      <div className="score-ring-val">
        <div style={{ fontSize: '32px', fontWeight: '800', lineHeight: 1, color: 'var(--text-primary)' }}>{grade}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{score}/100</div>
      </div>
    </div>
  );
}

export default function RepoAudit({ audit, setAudit }) {
  const [repoUrl, setRepoUrl] = useState(() => new URLSearchParams(window.location.search).get('repo') || '');
  const [githubToken, setGithubToken] = useState(() => new URLSearchParams(window.location.search).get('token') || '');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  // Automatically start audit if repo was passed via URL
  const hasRun = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('repo') && !hasRun.current) {
      hasRun.current = true;
      runAudit();
    }
  }, []);

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [fileTypeFilter, setFileTypeFilter] = useState('ALL');

  const fileTypes = useMemo(() => {
    if (!audit?.issues) return [];
    const types = new Set(
      audit.issues.map((i) => {
        const ext = i.file.split('.').pop()?.toLowerCase();
        return ext || 'unknown';
      })
    );
    return ['ALL', ...Array.from(types).sort()];
  }, [audit]);

  const filteredIssues = useMemo(() => {
    if (!audit?.issues) return [];
    return audit.issues.filter((issue) => {
      if (typeFilter !== 'ALL' && issue.type.toUpperCase() !== typeFilter) return false;
      if (severityFilter !== 'ALL' && issue.severity !== severityFilter) return false;
      if (fileTypeFilter !== 'ALL') {
        const ext = issue.file.split('.').pop()?.toLowerCase();
        if (ext !== fileTypeFilter) return false;
      }
      return true;
    });
  }, [audit, typeFilter, severityFilter, fileTypeFilter]);

  async function runAudit() {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError(null);
    setAudit(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const response = await fetch('/api/repo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          githubToken: githubToken.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Audit failed');
      }

      setCurrentStep(STEPS.length - 1);

      const fullAudit = await fetch(`/api/repo/audit/${data.auditId}`);
      const fullData = await fullAudit.json();
      setAudit(fullData);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {!new URLSearchParams(window.location.search).get('repo') && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="section-h">
            <div>
              <h2 className="section-title">Audit a Repository</h2>
              <p className="section-sub">Scan public GitHub repos for WCAG accessibility and heuristic UX issues.</p>
            </div>
          </div>
          
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Repository URL</label>
              <div className="tb-search" style={{ width: '100%' }}>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>GitHub Token (optional)</label>
              <div className="tb-search" style={{ width: '100%' }}>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={runAudit}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Auditing…' : 'Run Audit'}
          </button>

          {error && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius)', background: 'var(--red-light)', color: 'var(--red)', fontSize: '13.5px' }}>
              {error}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Analyzing Codebase...</h2>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}></div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {STEPS[currentStep]}...
          </div>
        </div>
      )}

      {audit && audit.status === 'completed' && (
        <div style={{ marginTop: '24px' }}>
          {/* AUDIT HERO */}
          <div className="audit-hero">
            <div className="audit-screenshot">
              <div className="audit-screenshot-inner">
                <div style={{ height: '10px', background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: '3px', marginBottom: '6px', opacity: '.7' }}></div>
                <div className="screen-bar full"></div><div className="screen-bar med"></div><div className="screen-bar full"></div>
                <div style={{ height: '28px', background: 'rgba(37,99,235,.12)', borderRadius: '4px', margin: '4px 0' }}></div>
                <div className="screen-bar short"></div><div className="screen-bar med"></div>
              </div>
              <div style={{ position: 'absolute', bottom: '5px', right: '7px', fontSize: '9px', color: 'rgba(37,99,235,.5)', fontWeight: '600' }}>CODEBASE</div>
            </div>
            <div className="audit-meta">
              <div className="audit-url"><a href={repoUrl}>{audit.owner}/{audit.repo}</a></div>
              <div className="audit-info-row">
                <div className="audit-info-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Branch: {audit.branch}</div>
                <div className="audit-info-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>{audit.totalFiles} files audited</div>
                <div className="audit-info-item"><span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>Audit Complete ✓</span></div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Overall Compliance</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="progress-track" style={{ width: '260px', height: '8px' }}>
                    <div className="progress-fill" style={{ width: `${audit.score}%`, background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }}></div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{audit.score}%</span>
                </div>
              </div>
            </div>
            <div className="audit-grade">
              <div className="grade-letter">{audit.grade}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{audit.score}<span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span></div>
              <div className="grade-sub">Overall UX Score</div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                <span className="badge badge-warn">{audit.totalIssues} Issues</span>
              </div>
            </div>
          </div>

          {/* KPI CARDS (Row 1) */}
          <div className="grid-4" style={{ marginBottom: '20px' }}>
            <div className="card card-sm">
              <div className="kpi-icon-wrap" style={{ background: '#eff6ff' }}><svg style={{ width: '18px', height: '18px', color: '#2563eb' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l4 1 5-1 5 1 4-1m-9 3v8m-3-5l3 5 3-5"/></svg></div>
              <div className="kpi-lbl">Accessibility Score</div>
              <div className="kpi-val" style={{ color: '#2563eb' }}>{Math.max(0, 100 - (audit.wcagIssues * 5))}</div>
              <div className="kpi-trend down"><svg style={{ width: '12px', height: '12px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>−3 from last</div>
            </div>
            <div className="card card-sm">
              <div className="kpi-icon-wrap" style={{ background: '#f5f3ff' }}><svg style={{ width: '18px', height: '18px', color: '#7c3aed' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div>
              <div className="kpi-lbl">UX Heuristic Score</div>
              <div className="kpi-val" style={{ color: '#7c3aed' }}>{Math.max(0, 100 - (audit.heuristicIssues * 5))}</div>
              <div className="kpi-trend up"><svg style={{ width: '12px', height: '12px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>+5 from last</div>
            </div>
            <div className="card card-sm">
              <div className="kpi-icon-wrap" style={{ background: '#ecfdf5' }}><svg style={{ width: '18px', height: '18px', color: '#16a34a' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></div>
              <div className="kpi-lbl">User Journey Score</div>
              <div className="kpi-val" style={{ color: '#16a34a' }}>79</div>
              <div className="kpi-trend up"><svg style={{ width: '12px', height: '12px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>+2 from last</div>
            </div>
            <div className="card card-sm">
              <div className="kpi-icon-wrap" style={{ background: '#fff7ed' }}><svg style={{ width: '18px', height: '18px', color: '#ea580c' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
              <div className="kpi-lbl">Performance Score</div>
              <div className="kpi-val" style={{ color: '#ea580c' }}>{Math.max(40, audit.score - 10)}</div>
              <div className="kpi-trend down"><svg style={{ width: '12px', height: '12px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>−7 from last</div>
            </div>
          </div>

          <div className="grid-4" style={{ marginBottom: '24px' }}>
            <div className="card card-sm" style={{ borderColor: '#fecaca' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Total Issues</div>
              <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--text-primary)' }}>{audit.totalIssues}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Across all categories</div>
            </div>
            <div className="card card-sm" style={{ borderColor: '#fecaca', background: '#fef9f9' }}>
              <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Critical Issues</div>
              <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--red)' }}>{filteredIssues.filter(i => i.severity === 'CRITICAL').length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Require immediate action</div>
            </div>
            <div className="card card-sm" style={{ borderColor: '#fed7aa' }}>
              <div style={{ fontSize: '11px', color: 'var(--orange)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>High Priority</div>
              <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--orange)' }}>{filteredIssues.filter(i => i.severity === 'HIGH').length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Fix within this sprint</div>
            </div>
            <div className="card card-sm" style={{ borderColor: '#bbf7d0' }}>
              <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Compliance</div>
              <div style={{ fontSize: '34px', fontWeight: '800', color: 'var(--green)' }}>{audit.score}%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Codebase standard</div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div className="card" style={{ minHeight: '300px' }}>
              <div className="section-h"><div><div className="section-title">Audit Radar</div><div className="section-sub">Category performance overview</div></div></div>
              <canvas id="radarChart" height="240"></canvas>
            </div>
            <div className="card">
              <div className="section-h"><div><div className="section-title">Check Results</div><div className="section-sub">Passed · Warning · Failed</div></div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <canvas id="pieChart" width="180" height="180" style={{ flexShrink: '0' }}></canvas>
                <div style={{ flex: '1' }}>
                  <div className="stat-mini"><span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>Passed</span><span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--green)' }}>{Math.max(0, 100 - audit.totalIssues)}</span></div>
                  <div className="stat-mini"><span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }}></span>Warning</span><span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--yellow)' }}>{filteredIssues.filter(i => i.severity === 'MEDIUM' || i.severity === 'LOW').length}</span></div>
                  <div className="stat-mini"><span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span>Failed</span><span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--red)' }}>{filteredIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length}</span></div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Checks</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE + ACTIONS */}
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="section-h"><div className="section-title">Recent Activity</div><button className="btn btn-ghost btn-xs">View all</button></div>
              <div className="timeline">
                {filteredIssues.slice(0, 4).map((issue, idx) => (
                  <div className="tl-item" key={idx}>
                    <div className="tl-left">
                      <div className="tl-dot" style={{ color: issue.severity === 'CRITICAL' ? '#dc2626' : issue.severity === 'HIGH' ? '#ea580c' : '#ca8a04' }}></div>
                      <div className="tl-line"></div>
                    </div>
                    <div className="tl-content">
                      <div className="tl-time">Recent</div>
                      <div className="tl-text">{issue.severity}: {issue.message}</div>
                      <div className="tl-detail">{issue.file}:{issue.line} · {issue.ruleName}</div>
                    </div>
                  </div>
                ))}
                <div className="tl-item"><div className="tl-left"><div className="tl-dot" style={{ color: '#16a34a' }}></div><div className="tl-line"></div></div><div className="tl-content"><div className="tl-time">Now</div><div className="tl-text">Audit completed successfully</div><div className="tl-detail">{audit.totalIssues} issues found</div></div></div>
              </div>
            </div>
            <div className="card">
              <div className="section-h"><div className="section-title">Quick Actions</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <button className="btn btn-primary" onClick={() => { const el = document.querySelector('[data-page="reports"]'); if(el) el.click(); }}><svg style={{ width: '15px', height: '15px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>View Full Report</button>
                <button className="btn btn-secondary"><svg style={{ width: '15px', height: '15px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>Download PDF</button>
                <button className="btn btn-secondary"><svg style={{ width: '15px', height: '15px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>Export JSON</button>
                <button className="btn btn-secondary"><svg style={{ width: '15px', height: '15px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share Report</button>
              </div>
              <div style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1px solid var(--blue-mid)', borderRadius: 'var(--radius)', padding: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>🤖 AI Summary</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Your site scores <strong>{audit.grade}</strong>. The most critical issues are missing image alt texts and color contrast failures. Fixing the {filteredIssues.filter(i => i.severity === 'CRITICAL').length} critical issues alone would raise your score significantly.</div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '10px' }} onClick={() => { const el = document.querySelector('[data-page="chat"]'); if(el) el.click(); }}>Ask AI Assistant →</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-h">
              <div>
                <div className="section-title">Highlighted Vulnerabilities</div>
                <div className="section-sub">Code snippets requiring attention</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
              {filteredIssues.slice(0, 4).map((issue, idx) => (
                <div key={idx}>
                  <div className="anno-screenshot" style={{ height: 'auto', padding: '12px', background: '#1e1e1e', borderRadius: '8px', overflowX: 'auto', textAlign: 'left' }}>
                    <pre style={{ fontSize: '11px', color: '#d4d4d4', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {issue.code || "No snippet available."}
                    </pre>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', padding: '8px', background: 'var(--bg)', borderRadius: '6px', borderLeft: `3px solid ${issue.severity === 'CRITICAL' ? 'var(--red)' : 'var(--orange)'}` }}>
                    <strong>{issue.file}:{issue.line}</strong> — {issue.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="section-h">
              <div>
                <div className="section-title">All Vulnerabilities</div>
                <div className="section-sub">Comprehensive list of all findings in the codebase</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '8px' }}>File Type:</div>
              {fileTypes.map((type) => (
                <button
                  key={type}
                  className={`btn btn-sm ${fileTypeFilter === type ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFileTypeFilter(type)}
                >
                  {type === 'ALL' ? 'All Files' : `.${type}`}
                </button>
              ))}
            </div>

            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Severity</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>File Location</th>
                    <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Issue Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <SeverityBadge severity={issue.severity} />
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                        <span style={{ padding: '2px 6px', background: 'var(--bg-elevated)', borderRadius: '4px', fontSize: '11px', border: '1px solid var(--border)' }}>
                          {issue.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{issue.file}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Line {issue.line}</div>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                        <div><strong>{issue.ruleId}:</strong> {issue.message}</div>
                      </td>
                    </tr>
                  ))}
                  {filteredIssues.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No vulnerabilities match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
