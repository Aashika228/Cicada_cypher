import React from 'react';

const DashboardPreview = () => {
  return (
    <div className="hero__preview animate-in">
      <div className="hero__preview-window">
        <div className="preview-bar">
          <span className="preview-dot preview-dot--red"></span>
          <span className="preview-dot preview-dot--yellow"></span>
          <span className="preview-dot preview-dot--green"></span>
          <span className="preview-bar__url">uxauditor.ai/dashboard</span>
        </div>
        <div className="preview-body">
          {/* Score cards row */}
          <div className="preview-scores">
            <div className="preview-score-card">
              <svg className="preview-ring" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="rgba(129,140,248,0.15)" strokeWidth="6" fill="none"/>
                <circle cx="40" cy="40" r="34" stroke="url(#ring1)" strokeWidth="6" fill="none" strokeDasharray="170 214" strokeLinecap="round" className="preview-ring__fill"/>
                <defs>
                  <linearGradient id="ring1" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#818cf8"/>
                    <stop offset="1" stopColor="#c084fc"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="preview-score-value">79</span>
              <span className="preview-score-label">Overall</span>
            </div>
            <div className="preview-score-card">
              <svg className="preview-ring" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="rgba(52,211,153,0.15)" strokeWidth="6" fill="none"/>
                <circle cx="40" cy="40" r="34" stroke="#34d399" strokeWidth="6" fill="none" strokeDasharray="185 214" strokeLinecap="round" className="preview-ring__fill"/>
              </svg>
              <span className="preview-score-value" style={{color: '#34d399'}}>86</span>
              <span className="preview-score-label">Accessibility</span>
            </div>
            <div className="preview-score-card">
              <svg className="preview-ring" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="rgba(251,191,36,0.15)" strokeWidth="6" fill="none"/>
                <circle cx="40" cy="40" r="34" stroke="#fbbf24" strokeWidth="6" fill="none" strokeDasharray="155 214" strokeLinecap="round" className="preview-ring__fill"/>
              </svg>
              <span className="preview-score-value" style={{color: '#fbbf24'}}>72</span>
              <span className="preview-score-label">Usability</span>
            </div>
            <div className="preview-score-card">
              <svg className="preview-ring" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="rgba(248,113,113,0.15)" strokeWidth="6" fill="none"/>
                <circle cx="40" cy="40" r="34" stroke="#f87171" strokeWidth="6" fill="none" strokeDasharray="140 214" strokeLinecap="round" className="preview-ring__fill"/>
              </svg>
              <span className="preview-score-value" style={{color: '#f87171'}}>65</span>
              <span className="preview-score-label">Journeys</span>
            </div>
          </div>
          
          {/* Charts row */}
          <div className="preview-charts">
            <div className="preview-chart-card">
              <div className="preview-chart-title">Issues by Severity</div>
              <div className="preview-bars">
                <div className="preview-bar-item">
                  <span className="preview-bar-label">Critical</span>
                  <div className="preview-bar-track">
                    <div className="preview-bar-fill preview-bar-fill--critical" style={{width: '25%'}}></div>
                  </div>
                  <span className="preview-bar-val">3</span>
                </div>
                <div className="preview-bar-item">
                  <span className="preview-bar-label">High</span>
                  <div className="preview-bar-track">
                    <div className="preview-bar-fill preview-bar-fill--high" style={{width: '50%'}}></div>
                  </div>
                  <span className="preview-bar-val">7</span>
                </div>
                <div className="preview-bar-item">
                  <span className="preview-bar-label">Medium</span>
                  <div className="preview-bar-track">
                    <div className="preview-bar-fill preview-bar-fill--medium" style={{width: '75%'}}></div>
                  </div>
                  <span className="preview-bar-val">12</span>
                </div>
                <div className="preview-bar-item">
                  <span className="preview-bar-label">Low</span>
                  <div className="preview-bar-track">
                    <div className="preview-bar-fill preview-bar-fill--low" style={{width: '40%'}}></div>
                  </div>
                  <span className="preview-bar-val">5</span>
                </div>
              </div>
            </div>
            
            <div className="preview-chart-card">
              <div className="preview-chart-title">Heuristic Radar</div>
              <div className="preview-radar">
                <svg viewBox="0 0 200 200" className="preview-radar-svg">
                  <polygon points="100,20 170,55 170,145 100,180 30,145 30,55" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1.5"/>
                  <polygon points="100,45 155,70 155,130 100,155 45,130 45,70" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                  <polygon points="100,70 135,85 135,115 100,130 65,115 65,85" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                  <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                  <line x1="30" y1="55" x2="170" y2="145" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                  <line x1="30" y1="145" x2="170" y2="55" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                  <defs>
                    <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)"/>
                      <stop offset="100%" stopColor="rgba(99, 102, 241, 0.2)"/>
                    </linearGradient>
                  </defs>
                  <polygon points="100,30 160,60 150,140 100,170 40,135 50,55" fill="url(#radarGrad)" stroke="#a855f7" strokeWidth="2.5" strokeLinejoin="round"/>
                  <circle cx="100" cy="30" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="160" cy="60" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="150" cy="140" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="100" cy="170" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="40" cy="135" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="50" cy="55" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Extra Charts row: Heatmap & Trend */}
          <div className="preview-charts preview-extra-charts">
            <div className="preview-chart-card">
              <div className="preview-chart-title">Click Heatmap</div>
              <div className="preview-heatmap">
                <div className="preview-heatmap-grid">
                  <div className="heat-cell heat-low"></div><div className="heat-cell heat-low"></div><div className="heat-cell heat-med"></div><div className="heat-cell heat-low"></div><div className="heat-cell heat-none"></div>
                  <div className="heat-cell heat-none"></div><div className="heat-cell heat-low"></div><div className="heat-cell heat-high"></div><div className="heat-cell heat-med"></div><div className="heat-cell heat-low"></div>
                  <div className="heat-cell heat-low"></div><div className="heat-cell heat-med"></div><div className="heat-cell heat-max"></div><div className="heat-cell heat-high"></div><div className="heat-cell heat-med"></div>
                  <div className="heat-cell heat-none"></div><div className="heat-cell heat-low"></div><div className="heat-cell heat-med"></div><div className="heat-cell heat-low"></div><div className="heat-cell heat-none"></div>
                </div>
              </div>
            </div>
            <div className="preview-chart-card">
              <div className="preview-chart-title">Accessibility Trend</div>
              <div className="preview-trend">
                <svg viewBox="0 0 200 100" className="preview-trend-svg" preserveAspectRatio="none">
                  <line x1="0" y1="25" x2="200" y2="25" stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="4 4"/>
                  <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="4 4"/>
                  <line x1="0" y1="75" x2="200" y2="75" stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="4 4"/>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)"/>
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0)"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,80 L40,60 L80,70 L120,40 L160,30 L200,10 L200,100 L0,100 Z" fill="url(#trendGrad)" />
                  <path d="M0,80 L40,60 L80,70 L120,40 L160,30 L200,10" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="40" cy="60" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="80" cy="70" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="120" cy="40" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="160" cy="30" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                  <circle cx="200" cy="10" r="4.5" fill="#fff" stroke="#a855f7" strokeWidth="2.5"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Issue row */}
          <div className="preview-issues">
            <div className="preview-issue">
              <span className="preview-issue-badge preview-issue-badge--critical">Critical</span>
              <span className="preview-issue-text">Missing alt text on 4 images</span>
              <span className="preview-issue-fix">✨ Fix Available</span>
            </div>
            <div className="preview-issue">
              <span className="preview-issue-badge preview-issue-badge--high">High</span>
              <span className="preview-issue-text">Color contrast ratio 2.8:1 on CTA</span>
              <span className="preview-issue-fix">✨ Fix Available</span>
            </div>
            <div className="preview-issue">
              <span className="preview-issue-badge preview-issue-badge--medium">Medium</span>
              <span className="preview-issue-text">Heading hierarchy skips h3</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
