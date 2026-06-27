import { useState } from 'react';
import DashboardPreview from './DashboardPreview';

const Hero = ({ onStartAudit }) => {
  const [url, setUrl] = useState('');

  const handleStartAudit = () => {
    if (url) {
      onStartAudit(url);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleStartAudit();
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

      {/* URL Input */}
      <div className="hero__input-wrap animate-in">
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
