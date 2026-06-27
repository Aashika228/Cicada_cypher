import { useState } from 'react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import DashboardPreview from './DashboardPreview';

const Hero = ({ onStartAudit }) => {
  const [url, setUrl] = useState('');
  const [testingMode, setTestingMode] = useState(() => new URLSearchParams(window.location.search).get('mode') || null);
  const [githubUrl, setGithubUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');

  const handleStartAudit = () => {
    if (url) {
      onStartAudit(url);
    }
  };

  const handleWhiteboxSubmit = () => {
    if (githubUrl) {
      window.location.href = `/dashboard?page=dashboard&repo=${encodeURIComponent(githubUrl)}&token=${encodeURIComponent(githubToken)}`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (testingMode === 'whitebox') {
        handleWhiteboxSubmit();
      } else {
        handleStartAudit();
      }
    }
  };

  const setSuggestion = (suggestedUrl) => {
    setUrl(suggestedUrl);
  };

  return (
    <header className="hero" id="hero">
      
      <div className="hero__badge animate-in">
        <span className="hero__badge-dot"></span> AI-Powered UX Intelligence Platform
      </div>
      
      <h1 className="hero__title animate-in">
        Audit Any Website's<br/>
        <span className="hero__title-gradient">UX & Accessibility</span><br/>
        In Seconds
      </h1>
      
      <p className="hero__subtitle animate-in">
        Enter a URL and let our AI engines automatically analyze WCAG compliance,
        usability heuristics, and real user journeys — then generate verified fixes instantly.
      </p>

      {/* Testing Modes */}
      {testingMode === null && (
        <div className="hero__testing-modes animate-in" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/?mode=whitebox">
              <button className="btn btn--primary" style={{ padding: '12px 24px', fontSize: '15px' }}>Whitebox Testing</button>
            </SignInButton>
            <SignInButton mode="modal" forceRedirectUrl="/?mode=blackbox">
              <button className="btn btn--primary" style={{ padding: '12px 24px', fontSize: '15px' }}>Blackbox Testing</button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <button className="btn btn--primary" onClick={() => setTestingMode('whitebox')} style={{ padding: '12px 24px', fontSize: '15px' }}>Whitebox Testing</button>
            <button className="btn btn--primary" onClick={() => setTestingMode('blackbox')} style={{ padding: '12px 24px', fontSize: '15px' }}>Blackbox Testing</button>
          </SignedIn>
        </div>
      )}

      {/* Inputs */}
      <div className="hero__input-wrap animate-in">
        {testingMode === 'whitebox' ? (
          <>
            <div className="hero__input-container" style={{ marginBottom: '16px' }}>
              <div className="hero__input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </div>
              <input
                type="url"
                className="hero__input"
                placeholder="GitHub Repository URL"
                autoComplete="off"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="hero__input-container">
              <div className="hero__input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input
                type="password"
                className="hero__input"
                placeholder="GitHub Token (optional)"
                autoComplete="off"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="hero__input-btn" onClick={handleWhiteboxSubmit}>
                <span>Run Audit</span>
              </button>
            </div>
          </>
        ) : (
          <div className="hero__input-container" id="urlInputContainer">
            <div className="hero__input-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <input
              type="url"
              className="hero__input"
              id="urlInput"
              placeholder="Enter your website"
              autoComplete="off"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="hero__input-btn" id="auditBtn" onClick={handleStartAudit}>
              <span>Get insights</span>
            </button>
          </div>
        )}
        <div className="hero__input-suggestions">
          <span className="hero__suggestion" onClick={() => setSuggestion('https://example.com')}>example.com</span>
          <span className="hero__suggestion" onClick={() => setSuggestion('https://github.com')}>github.com</span>
          <span className="hero__suggestion" onClick={() => setSuggestion('https://stripe.com')}>stripe.com</span>
        </div>
      </div>

      {/* Trust stats */}
      <div className="hero__stats animate-in">
        <div className="hero__stat">
          <span className="hero__stat-number" data-count="0">0%</span>
          <span className="hero__stat-label">Sites Audited</span>
        </div>
        <div className="hero__stat-divider"></div>
        <div className="hero__stat">
          <span className="hero__stat-number" data-count="0">0%</span>
          <span className="hero__stat-label">Issues Found</span>
        </div>
        <div className="hero__stat-divider"></div>
        <div className="hero__stat">
          <span className="hero__stat-number" data-count="0">0%</span>
          <span className="hero__stat-label">Fixes Generated</span>
        </div>
        <div className="hero__stat-divider"></div>
        <div className="hero__stat">
          <span className="hero__stat-number" data-count="0">0%</span>
          <span className="hero__stat-label">% Accuracy</span>
        </div>
      </div>

      <DashboardPreview />
    </header>
  );
};

export default Hero;
