import { useState, useMemo } from 'react';

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

export default function RepoAudit() {
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState(null);

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
    <div className="dashboard-page-container" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <aside id="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div>
            <div className="sb-logo-text">UX Auditor</div>
            <div className="sb-logo-sub">RepoScan Engine</div>
          </div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">MAIN</div>
          <div className="sb-item active">
            <svg className="sb-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            Repository Scan
          </div>
        </nav>
      </aside>
      
      <div id="main">
        <header id="topbar">
          <div className="tb-title">GitHub Repository UX Auditor</div>
        </header>

        <div id="content">
          <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
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

              {loading && (
                <div style={{ marginTop: '20px' }}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}></div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {STEPS[currentStep]}...
                  </div>
                </div>
              )}
            </div>

            {audit && audit.status === 'completed' && (
              <>
                <div className="audit-hero" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px' }}>
                  <ScoreRing score={audit.score} grade={audit.grade} />
                  <div>
                    <div className="audit-url">{audit.owner}/{audit.repo}</div>
                    <div className="audit-info-row" style={{ marginTop: '8px' }}>
                      <div className="audit-info-item">Branch: {audit.branch}</div>
                      <div className="audit-info-item">{audit.totalFiles} files scanned</div>
                    </div>
                    
                    <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div>
                        <div className="kpi-val" style={{ color: 'var(--blue)' }}>{audit.wcagIssues || 0}</div>
                        <div className="kpi-lbl">WCAG Issues</div>
                      </div>
                      <div>
                        <div className="kpi-val" style={{ color: 'var(--purple)' }}>{audit.heuristicIssues || 0}</div>
                        <div className="kpi-lbl">Heuristic Issues</div>
                      </div>
                    </div>
                  </div>
                </div>

                {audit.worstFiles?.length > 0 && (
                  <div className="card" style={{ marginBottom: '24px' }}>
                    <h2 className="section-title" style={{ marginBottom: '12px' }}>Worst Files</h2>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>File</th>
                          <th>Issues Found</th>
                        </tr>
                      </thead>
                      <tbody>
                        {audit.worstFiles.map(({ file, count }) => (
                          <tr key={file}>
                            <td style={{ fontFamily: 'monospace' }}>{file}</td>
                            <td><span className="badge badge-fail">{count} issues</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="card">
                  <div className="section-h">
                    <h2 className="section-title">
                      Issues ({filteredIssues.length} of {audit.totalIssues})
                    </h2>
                  </div>

                  <div className="filter-bar">
                    {['ALL', 'WCAG', 'HEURISTIC'].map((f) => (
                      <div
                        key={f}
                        onClick={() => setTypeFilter(f)}
                        className={`chip ${typeFilter === f ? 'active' : ''}`}
                      >
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="filter-bar">
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
                      <div
                        key={f}
                        onClick={() => setSeverityFilter(f)}
                        className={`chip ${severityFilter === f ? 'active' : ''}`}
                      >
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="filter-bar">
                    {fileTypes.map((f) => (
                      <div
                        key={f}
                        onClick={() => setFileTypeFilter(f)}
                        className={`chip ${fileTypeFilter === f ? 'active' : ''}`}
                      >
                        .{f === 'ALL' ? 'all' : f}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    {filteredIssues.length === 0 ? (
                      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No issues match the current filters.
                      </div>
                    ) : (
                      filteredIssues.map((issue, i) => (
                        <IssueCard key={`${issue.file}-${issue.line}-${issue.ruleId}-${i}`} issue={issue} />
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
