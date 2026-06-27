import React from 'react';

export const WorkflowJourneys = () => (
  <>
    <section className="workflow" id="workflow">
      <div className="section__container">
        <div className="section__header animate-in">
          <span className="section__overline">End-to-End Pipeline</span>
          <h2 className="section__title">From URL to <span className="text-gradient">Verified Fixes</span></h2>
          <p className="section__desc">A fully automated pipeline that scans, analyzes, scores, fixes, and verifies — all without manual effort.</p>
        </div>
        <div className="workflow__pipeline animate-in">
          <div className="workflow__step" data-step="1">
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <span className="workflow__step-label">Enter URL</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line"></div></div>
          <div className="workflow__step" data-step="2">
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span className="workflow__step-label">Browser Scan</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line"></div></div>
          <div className="workflow__step" data-step="3">
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <span className="workflow__step-label">Data Extract</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line"></div></div>
          <div className="workflow__step" data-step="4">
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <span className="workflow__step-label">WCAG + UX</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line"></div></div>
          <div className="workflow__step" data-step="5">
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span className="workflow__step-label">Journeys</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line"></div></div>
          <div className="workflow__step" data-step="6">
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <span className="workflow__step-label">AI Fixes</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line"></div></div>
          <div className="workflow__step" data-step="7">
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span className="workflow__step-label">Verified</span>
          </div>
        </div>
      </div>
    </section>

    <section className="journeys" id="journeys">
      <div className="section__container">
        <div className="section__header animate-in">
          <span className="section__overline">User Journey Simulation</span>
          <h2 className="section__title">Simulate <span className="text-gradient">Real User Flows</span></h2>
          <p className="section__desc">Our engine simulates 6 critical user journeys to identify friction points, abandonment risks, and usability bottlenecks.</p>
        </div>
        <div className="journeys__grid">
          <div className="journey-card animate-in">
            <div className="journey-card__icon">🏠</div>
            <h4 className="journey-card__title">Homepage Browsing</h4>
            <p className="journey-card__desc">First impressions, load time, visual hierarchy, CTA visibility, and content discoverability.</p>
            <div className="journey-card__meter"><div className="journey-card__meter-fill" style={{width: '85%'}}></div></div>
            <span className="journey-card__score">85/100</span>
          </div>
          <div className="journey-card animate-in">
            <div className="journey-card__icon">💰</div>
            <h4 className="journey-card__title">Finding Pricing</h4>
            <p className="journey-card__desc">Navigation path to pricing, clarity of plans, comparison ease, and hidden costs.</p>
            <div className="journey-card__meter"><div className="journey-card__meter-fill journey-card__meter-fill--amber" style={{width: '68%'}}></div></div>
            <span className="journey-card__score">68/100</span>
          </div>
          <div className="journey-card animate-in">
            <div className="journey-card__icon">📝</div>
            <h4 className="journey-card__title">Signing Up</h4>
            <p className="journey-card__desc">Form complexity, field validation, error messaging, social login options, and completion rate.</p>
            <div className="journey-card__meter"><div className="journey-card__meter-fill" style={{width: '78%'}}></div></div>
            <span className="journey-card__score">78/100</span>
          </div>
          <div className="journey-card animate-in">
            <div className="journey-card__icon">🔑</div>
            <h4 className="journey-card__title">Logging In</h4>
            <p className="journey-card__desc">Login form accessibility, password recovery flow, session handling, and MFA experience.</p>
            <div className="journey-card__meter"><div className="journey-card__meter-fill" style={{width: '90%'}}></div></div>
            <span className="journey-card__score">90/100</span>
          </div>
          <div className="journey-card animate-in">
            <div className="journey-card__icon">💬</div>
            <h4 className="journey-card__title">Contact Support</h4>
            <p className="journey-card__desc">Support page findability, contact methods, response expectations, and help documentation.</p>
            <div className="journey-card__meter"><div className="journey-card__meter-fill journey-card__meter-fill--rose" style={{width: '52%'}}></div></div>
            <span className="journey-card__score">52/100</span>
          </div>
          <div className="journey-card animate-in">
            <div className="journey-card__icon">🛒</div>
            <h4 className="journey-card__title">Checkout Flow</h4>
            <p className="journey-card__desc">Cart experience, payment form, trust indicators, error handling, and confirmation clarity.</p>
            <div className="journey-card__meter"><div className="journey-card__meter-fill journey-card__meter-fill--amber" style={{width: '61%'}}></div></div>
            <span className="journey-card__score">61/100</span>
          </div>
        </div>
      </div>
    </section>
  </>
);

export const BottomSections = () => (
  <>
    <section className="dashboard-section" id="dashboard">
      <div className="section__container">
        <div className="section__header animate-in">
          <span className="section__overline">Interactive Dashboard</span>
          <h2 className="section__title">Everything In One<br/><span className="text-gradient">Beautiful Dashboard</span></h2>
          <p className="section__desc">Scores, reports, annotated screenshots, before/after comparisons, AI fixes, verification badges, interactive charts, and downloadable reports — all in one place.</p>
        </div>
        <div className="dashboard-features animate-in">
          <div className="dashboard-feature"><div className="dashboard-feature__icon">📊</div><span>Interactive Charts</span></div>
          <div className="dashboard-feature"><div className="dashboard-feature__icon">📸</div><span>Annotated Screenshots</span></div>
          <div className="dashboard-feature"><div className="dashboard-feature__icon">🔀</div><span>Before vs After</span></div>
          <div className="dashboard-feature"><div className="dashboard-feature__icon">🤖</div><span>AI-Generated Fixes</span></div>
          <div className="dashboard-feature"><div className="dashboard-feature__icon">✅</div><span>Verified Badges</span></div>
          <div className="dashboard-feature"><div className="dashboard-feature__icon">📥</div><span>PDF Reports</span></div>
        </div>
      </div>
    </section>

    <section className="chat-section" id="chat">
      <div className="section__container">
        <div className="section__header animate-in">
          <span className="section__overline">AI Chat Assistant</span>
          <h2 className="section__title">Ask Anything About<br/><span className="text-gradient">Your Audit Results</span></h2>
          <p className="section__desc">An integrated conversational AI that understands your audit context and can explain issues, suggest improvements, and generate code fixes on demand.</p>
        </div>
        <div className="chat-demo animate-in">
          <div className="chat-demo__window">
            <div className="chat-demo__header">
              <div className="chat-demo__header-dot"></div>
              <span>UX Auditor AI Assistant</span>
            </div>
            <div className="chat-demo__messages" id="chatMessages">
              <div className="chat-msg chat-msg--ai">
                <div className="chat-msg__avatar">AI</div>
                <div className="chat-msg__bubble">Hi! I've analyzed your audit results. I found <strong>27 issues</strong> across accessibility, usability, and user journeys. How can I help you understand or fix them?</div>
              </div>
              <div className="chat-msg chat-msg--user">
                <div className="chat-msg__bubble">Why is color contrast important?</div>
              </div>
              <div className="chat-msg chat-msg--ai">
                <div className="chat-msg__avatar">AI</div>
                <div className="chat-msg__bubble">Color contrast ensures text is readable for everyone, including people with low vision or color blindness. WCAG requires a <strong>minimum 4.5:1 ratio</strong> for normal text and <strong>3:1 for large text</strong>. Your CTA button currently has a 2.8:1 ratio — here's the fix:</div>
              </div>
              <div className="chat-msg chat-msg--ai">
                <div className="chat-msg__avatar">AI</div>
                <div className="chat-msg__bubble chat-msg__bubble--code">
                  <code>{`/* Before */
.cta-btn { color: #999; background: #f0f0f0; }

/* After — Ratio: 5.2:1 ✓ */
.cta-btn { color: #1a1a2e; background: #e0e7ff; }`}</code>
                </div>
              </div>
            </div>
            <div className="chat-demo__input-area">
              <div className="chat-demo__suggestions">
                <button className="chat-demo__suggestion">Explain this issue simply</button>
                <button className="chat-demo__suggestion">Generate React fix</button>
                <button className="chat-demo__suggestion">Suggest UX improvements</button>
              </div>
              <div className="chat-demo__input-row">
                <input type="text" className="chat-demo__input" placeholder="Ask about your audit results..." />
                <button className="chat-demo__send">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="cta-section">
      <div className="section__container">
        <div className="cta-card animate-in">
          <h2 className="cta-card__title">Ready to Audit Your Website?</h2>
          <p className="cta-card__desc">Enter any URL and get a comprehensive UX & Accessibility audit with AI-powered fixes in under 60 seconds.</p>
          <div className="cta-card__input-wrap">
            <input type="url" className="cta-card__input" placeholder="https://yourwebsite.com" />
            <button className="btn btn--primary btn--lg">Start Free Audit</button>
          </div>
        </div>
      </div>
    </section>

    <footer className="footer">
      <div className="section__container">
        <div className="footer__inner">
          <div className="footer__brand">
            <a href="#" className="nav__logo">
              <div className="nav__logo-icon">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#logoGrad2)" strokeWidth="2.5"/>
                  <path d="M10 16.5L14 20.5L22 12.5" stroke="url(#logoGrad2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="24" cy="8" r="3" fill="#a78bfa"/>
                  <defs><linearGradient id="logoGrad2" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#c084fc"/></linearGradient></defs>
                </svg>
              </div>
              <span className="nav__logo-text">UX Auditor</span>
            </a>
            <p className="footer__tagline">AI-powered UX & Accessibility intelligence.</p>
          </div>
          <div className="footer__links">
            <div className="footer__col">
              <h4 className="footer__col-title">Product</h4>
              <a href="#features" className="footer__link">Features</a>
              <a href="#engines" className="footer__link">Engines</a>
              <a href="#workflow" className="footer__link">Workflow</a>
              <a href="#dashboard" className="footer__link">Dashboard</a>
            </div>
            <div className="footer__col">
              <h4 className="footer__col-title">Resources</h4>
              <a href="#" className="footer__link">Documentation</a>
              <a href="#" className="footer__link">API Reference</a>
              <a href="#" className="footer__link">WCAG Guide</a>
              <a href="#" className="footer__link">Blog</a>
            </div>
            <div className="footer__col">
              <h4 className="footer__col-title">Company</h4>
              <a href="#" className="footer__link">About</a>
              <a href="#" className="footer__link">Careers</a>
              <a href="#" className="footer__link">Contact</a>
              <a href="#" className="footer__link">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 Conversational UX Auditor. All rights reserved.</span>
        </div>
      </div>
    </footer>
  </>
);
