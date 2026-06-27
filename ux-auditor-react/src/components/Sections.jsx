import React from 'react';

export const Features = () => (
  <section className="features" id="features">
    <div className="section__container">
      <div className="section__header animate-in">
        <span className="section__overline">Capabilities</span>
        <h2 className="section__title">Everything You Need to<br/><span className="text-gradient">Perfect Your UX</span></h2>
        <p className="section__desc">A comprehensive AI-powered platform that goes beyond basic accessibility checks to deliver actionable, verified improvements.</p>
      </div>
      <div className="features__grid">
        <div className="feature-card animate-in">
          <div className="feature-card__icon feature-card__icon--indigo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
            </svg>
          </div>
          <h3 className="feature-card__title">Browser Automation</h3>
          <p className="feature-card__desc">Playwright opens your site like a real user — captures screenshots, extracts DOM, HTML, CSS, forms, buttons, images, navigation, and more.</p>
        </div>
        <div className="feature-card animate-in">
          <div className="feature-card__icon feature-card__icon--emerald">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <h3 className="feature-card__title">WCAG Validation</h3>
          <p className="feature-card__desc">Deep accessibility analysis checking alt text, contrast ratios, heading hierarchy, form labels, ARIA attributes, keyboard nav, and focus indicators.</p>
        </div>
        <div className="feature-card animate-in">
          <div className="feature-card__icon feature-card__icon--amber">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h3 className="feature-card__title">Heuristic Evaluation</h3>
          <p className="feature-card__desc">Nielsen's 10 usability heuristics applied automatically — navigation clarity, consistency, error prevention, visual hierarchy, and more.</p>
        </div>
        <div className="feature-card animate-in">
          <div className="feature-card__icon feature-card__icon--rose">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3 className="feature-card__title">Journey Simulation</h3>
          <p className="feature-card__desc">Simulates real user flows — browsing, pricing, signup, login, support, checkout — identifying friction points and abandonment risks.</p>
        </div>
        <div className="feature-card animate-in">
          <div className="feature-card__icon feature-card__icon--cyan">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <h3 className="feature-card__title">AI Fix Generation</h3>
          <p className="feature-card__desc">Generates production-ready HTML & CSS fixes with clear explanations. Every fix is deployable — not just advice, but actual code.</p>
        </div>
        <div className="feature-card animate-in">
          <div className="feature-card__icon feature-card__icon--violet">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h3 className="feature-card__title">Auto-Verification</h3>
          <p className="feature-card__desc">Every generated fix is re-validated by WCAG and Heuristic engines automatically. Only verified fixes earn the "Verified" badge.</p>
        </div>
      </div>
    </div>
  </section>
);

export const Engines = () => (
  <section className="engines" id="engines">
    <div className="section__container">
      <div className="section__header animate-in">
        <span className="section__overline">Dual-Engine Analysis</span>
        <h2 className="section__title">Two Independent Engines.<br/><span className="text-gradient">Zero Blind Spots.</span></h2>
        <p className="section__desc">Your website is analyzed by two specialized engines simultaneously, ensuring comprehensive coverage of both technical compliance and real-world usability.</p>
      </div>
      <div className="engines__grid">
        <div className="engine-card animate-in">
          <div className="engine-card__header">
            <div className="engine-card__icon engine-card__icon--accessibility">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/>
              </svg>
            </div>
            <div>
              <h3 className="engine-card__title">WCAG Accessibility Engine</h3>
              <span className="engine-card__tag">Standards-Based Validation</span>
            </div>
          </div>
          <ul className="engine-card__list">
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Image alt text detection</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Color contrast ratio (AA/AAA)</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Heading hierarchy validation</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Form label associations</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Keyboard accessibility</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Touch target sizes (≥44px)</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Semantic HTML usage</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>ARIA attributes validation</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Page language declaration</span></li>
            <li className="engine-card__item"><span className="engine-card__check">✓</span><span>Focus indicators</span></li>
          </ul>
        </div>
        <div className="engine-card animate-in">
          <div className="engine-card__header">
            <div className="engine-card__icon engine-card__icon--heuristic">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <h3 className="engine-card__title">UX Heuristic Engine</h3>
              <span className="engine-card__tag">Nielsen's 10 Heuristics</span>
            </div>
          </div>
          <ul className="engine-card__list">
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>Navigation clarity</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>Visibility of system status</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>Error prevention & recovery</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>User control & freedom</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>Interface consistency</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>Recognition over recall</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>Visual hierarchy analysis</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>Form complexity scoring</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>CTA visibility & placement</span></li>
            <li className="engine-card__item"><span className="engine-card__check engine-card__check--amber">✓</span><span>Feedback & help systems</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);
