import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

const PUSH_STEPS = [
  { label: 'Creating branch', icon: '🌿' },
  { label: 'Patching files', icon: '📝' },
  { label: 'Pushing commits', icon: '⬆️' },
  { label: 'Opening Pull Request', icon: '🔀' },
];

export default function PushToGitHub({ auditId, acceptedFixIds = [], fixSummary = [] }) {
  const { getToken } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | pushing | success | error
  const [userGithubToken, setUserGithubToken] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePush = async () => {
    if (!auditId || acceptedFixIds.length === 0) {
      setError('No accepted fixes to push.');
      setStatus('error');
      return;
    }

    setStatus('pushing');
    setError(null);
    setResult(null);
    setCurrentStep(0);

    // Animate through steps
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < PUSH_STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);

    try {
      // Get the standard Clerk session token to authorize our backend request
      const token = await getToken();
      if (!token) {
        throw new Error('GitHub not connected. Please sign in with GitHub.');
      }

      const response = await fetch('http://localhost:5000/api/repo/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ auditId, acceptedFixIds, githubToken: userGithubToken }),
      });

      const data = await response.json();

      clearInterval(stepTimer);
      setCurrentStep(PUSH_STEPS.length - 1);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Push failed');
      }

      setResult(data);
      setStatus('success');
    } catch (err) {
      clearInterval(stepTimer);
      setError(err.message);
      setStatus('error');
    }
  };

  // ─── IDLE STATE ──────────────────────────────────────────

  if (status === 'idle') {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg style={{ width: '22px', height: '22px', color: '#fff' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Push Fixes to GitHub</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Creates a new branch and opens a Pull Request — never pushes to main</div>
          </div>
        </div>

        {/* Fix Summary */}
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
          padding: '14px 16px', marginBottom: '16px', border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.5px' }}>Fixes</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--blue)' }}>{acceptedFixIds.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.5px' }}>Files</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--purple)' }}>
                {new Set(fixSummary.map((f) => f.file)).size || '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.5px' }}>Branch</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--green)', marginTop: '6px', fontFamily: 'monospace' }}>breakpoint/ux-fixes-*</div>
            </div>
          </div>
        </div>

        {/* Fix List Preview */}
        {fixSummary.length > 0 && (
          <div style={{ marginBottom: '16px', maxHeight: '180px', overflowY: 'auto' }}>
            {fixSummary.slice(0, 8).map((fix, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 0', borderBottom: '1px solid var(--border-light)',
                fontSize: '12.5px',
              }}>
                <span className={`badge badge-${(fix.severity || 'medium').toLowerCase()}`} style={{ fontSize: '10px' }}>{fix.severity}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px' }}>{fix.file}:{fix.line}</span>
                <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fix.ruleId}</span>
              </div>
            ))}
            {fixSummary.length > 8 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                + {fixSummary.length - 8} more fixes
              </div>
            )}
          </div>
        )}

        {/* Token Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
            GitHub Personal Access Token
          </label>
          <input
            type="password"
            value={userGithubToken}
            onChange={(e) => setUserGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
              fontFamily: 'monospace'
            }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Token requires the <strong>repo</strong> scope. Leave empty to use server default.
          </div>
        </div>

        <button
          type="button"
          onClick={handlePush}
          className="btn btn-primary"
          disabled={acceptedFixIds.length === 0}
          style={{
            width: '100%', justifyContent: 'center', padding: '12px',
            fontSize: '14px', fontWeight: '700', gap: '8px',
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Create Pull Request
        </button>
      </div>
    );
  }

  // ─── PUSHING STATE ───────────────────────────────────────

  if (status === 'pushing') {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
          Pushing to GitHub…
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PUSH_STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: 'var(--radius)',
                background: isActive ? 'rgba(37,99,235,.06)' : 'transparent',
                border: isActive ? '1px solid rgba(37,99,235,.2)' : '1px solid transparent',
                transition: 'all .3s ease',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0,
                  background: isDone ? '#16a34a' : isActive ? '#2563eb' : 'var(--border)',
                  color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                  transition: 'all .3s ease',
                }}>
                  {isDone ? '✓' : step.icon}
                </div>
                <span style={{
                  fontSize: '13.5px', fontWeight: isActive ? '600' : '400',
                  color: isDone ? 'var(--green)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {step.label}{isActive ? '…' : ''}
                </span>
                {isActive && (
                  <div style={{
                    marginLeft: 'auto', width: '18px', height: '18px',
                    border: '2px solid var(--blue)', borderTopColor: 'transparent',
                    borderRadius: '50%', animation: 'spin 1s linear infinite',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── SUCCESS STATE ───────────────────────────────────────

  if (status === 'success' && result) {
    return (
      <div className="card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0,
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Pull Request Created!</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your fixes are ready for review on GitHub</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
          padding: '16px 18px', marginBottom: '16px',
          border: '1px solid var(--green)', borderLeftWidth: '3px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <svg style={{ width: '18px', height: '18px', color: 'var(--green)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9v6a3 3 0 003 3h6" />
            </svg>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              PR #{result.prNumber}
            </span>
            <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Open</span>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Branch: <code style={{ background: 'rgba(37,99,235,.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '11.5px', color: 'var(--blue)' }}>{result.branch}</code>
            <span style={{ margin: '0 8px' }}>·</span>
            {result.filesChanged} file{result.filesChanged !== 1 ? 's' : ''} changed
          </div>

          <a
            href={result.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              width: '100%', justifyContent: 'center', padding: '10px',
              fontSize: '13.5px', fontWeight: '600', gap: '8px',
              textDecoration: 'none',
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Pull Request on GitHub
          </a>
        </div>

        {result.commits && result.commits.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Commits
            </div>
            {result.commits.map((c, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 0', fontSize: '12px',
                borderBottom: idx < result.commits.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <span style={{ color: 'var(--green)', fontFamily: 'monospace', fontSize: '10px' }}>
                  {c.commitSHA?.substring(0, 7)}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{c.file}</span>
                <span className="badge badge-info" style={{ marginLeft: 'auto', fontSize: '10px' }}>
                  {c.fixCount} fix{c.fixCount !== 1 ? 'es' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── ERROR STATE ─────────────────────────────────────────

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: '#fef2f2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '20px', flexShrink: 0,
        }}>
          ✗
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--red)' }}>Push Failed</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Something went wrong</div>
        </div>
      </div>

      <div style={{
        background: '#fef2f2', borderRadius: 'var(--radius)',
        padding: '12px 14px', marginBottom: '16px',
        border: '1px solid #fecaca', fontSize: '13px',
        color: '#991b1b', lineHeight: '1.55',
      }}>
        {error}
      </div>

      <button
        type="button"
        onClick={() => { setStatus('idle'); setError(null); }}
        className="btn btn-secondary"
        style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
      >
        Try Again
      </button>
    </div>
  );
}
