import { useState, useMemo } from 'react';

const STEPS = [
  'Fetching repository files',
  'Parsing frontend code',
  'Running WCAG checks',
  'Running heuristic checks',
  'Calculating score',
  'Generating AI fixes',
];

const SEVERITY_STYLES = {
  CRITICAL: 'severity-critical',
  HIGH: 'severity-high',
  MEDIUM: 'severity-medium',
  LOW: 'severity-low',
};

function SeverityBadge({ severity }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW}`}>
      {severity}
    </span>
  );
}

function IssueCard({ issue }) {
  const [showFixed, setShowFixed] = useState(false);

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={issue.severity} />
        <span className="text-sm font-medium text-white/80">
          {issue.ruleId} — {issue.ruleName}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60 uppercase">
          {issue.type}
        </span>
      </div>

      <div className="text-sm text-white/50">
        <span className="font-mono text-white/70">{issue.file}</span>
        <span className="mx-2">·</span>
        <span>Line {issue.line}</span>
      </div>

      <p className="text-sm text-white/70">{issue.message}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowFixed(false)}
          className={`px-3 py-1.5 text-xs rounded-lg transition ${!showFixed ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
        >
          Before
        </button>
        <button
          type="button"
          onClick={() => setShowFixed(true)}
          className={`px-3 py-1.5 text-xs rounded-lg transition ${showFixed ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
        >
          After
        </button>
      </div>

      <pre className={`p-4 rounded-xl text-sm font-mono overflow-x-auto ${showFixed ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
        {showFixed ? (issue.fix?.fixedCode || issue.suggestedFix || 'No fix available') : issue.code}
      </pre>

      {issue.fix && (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/40 text-xs mb-1">Why it matters</p>
            <p className="text-white/80">{issue.fix.whyItMatters}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-white/40 text-xs mb-1">Time to fix</p>
            <p className="text-white/80">{issue.fix.timeToFix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, grade }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
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
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{grade}</span>
        <span className="text-sm text-white/50">{score}/100</span>
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
            GitHub Repository UX Auditor
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Repo<span className="text-blue-400">Scan</span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Audit any public GitHub repo for WCAG accessibility violations and Nielsen heuristic UX issues — with AI-powered fixes.
          </p>
        </header>

        <div className="glass-card p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/50 mb-1.5">GitHub Repository URL</label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5">GitHub Token (optional)</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={runAudit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
          >
            {loading ? 'Auditing…' : 'Run Audit'}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-3 pt-2">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStep ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/30'
                    }`}
                  >
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={i <= currentStep ? 'text-white' : 'text-white/30'}>{step}</span>
                  {i === currentStep && (
                    <span className="ml-auto w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {audit && audit.status === 'completed' && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass-card p-6 flex items-center gap-6 md:col-span-1">
                <ScoreRing score={audit.score} grade={audit.grade} />
                <div>
                  <p className="text-white/50 text-sm">Repository</p>
                  <p className="font-semibold">{audit.owner}/{audit.repo}</p>
                  <p className="text-white/40 text-xs mt-1">Branch: {audit.branch}</p>
                  <p className="text-white/40 text-xs">{audit.totalFiles} files scanned</p>
                </div>
              </div>

              <div className="glass-card p-6 md:col-span-2">
                <h2 className="text-sm font-medium text-white/50 mb-4">Severity Breakdown</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'critical', label: 'CRITICAL', color: 'text-reposcan-critical' },
                    { key: 'high', label: 'HIGH', color: 'text-reposcan-high' },
                    { key: 'medium', label: 'MEDIUM', color: 'text-reposcan-medium' },
                    { key: 'low', label: 'LOW', color: 'text-reposcan-low' },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="bg-white/5 rounded-xl p-4 text-center">
                      <p className={`text-2xl font-bold ${color}`}>{audit.breakdown?.[key] || 0}</p>
                      <p className="text-xs text-white/40 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-400">{audit.wcagIssues || 0}</p>
                    <p className="text-xs text-white/40">WCAG Issues</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-2xl font-bold text-purple-400">{audit.heuristicIssues || 0}</p>
                    <p className="text-xs text-white/40">Heuristic Issues</p>
                  </div>
                </div>
              </div>
            </div>

            {audit.worstFiles?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-sm font-medium text-white/50 mb-4">Worst Files</h2>
                <div className="space-y-2">
                  {audit.worstFiles.map(({ file, count }) => (
                    <div key={file} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
                      <span className="font-mono text-sm text-white/70 truncate">{file}</span>
                      <span className="text-sm text-red-400 font-semibold">{count} issues</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">
                  Issues
                  <span className="ml-2 text-sm font-normal text-white/40">
                    ({filteredIssues.length} of {audit.totalIssues})
                  </span>
                </h2>

                <div className="flex flex-wrap gap-2">
                  {['ALL', 'WCAG', 'HEURISTIC'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setTypeFilter(f)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                        typeFilter === f
                          ? 'bg-white/15 border-white/20 text-white'
                          : 'border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSeverityFilter(f)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                      severityFilter === f
                        ? 'bg-white/15 border-white/20 text-white'
                        : 'border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {fileTypes.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFileTypeFilter(f)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                      fileTypeFilter === f
                        ? 'bg-white/15 border-white/20 text-white'
                        : 'border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    .{f === 'ALL' ? 'all' : f}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredIssues.length === 0 ? (
                  <p className="text-center text-white/40 py-8">No issues match the current filters.</p>
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
  );
}
