import { useState, useEffect } from 'react';

const steps = [
  { label: 'Browser Scan', status: 'Connecting to Playwright instance...' },
  { label: 'Data Extract', status: 'Extracting DOM, CSS, and interactive elements...' },
  { label: 'WCAG + UX', status: 'Running WCAG 2.1 & Nielsen Heuristics validation...' },
  { label: 'Journeys', status: 'Simulating keyboard and screen reader journeys...' },
  { label: 'AI Fixes', status: 'Generating verified code fixes...' },
  { label: 'Verified', status: 'Audit complete. Preparing report...' }
];

const AuditModal = ({ isOpen, targetUrl, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setCurrentStep(0);
      setIsClosing(false);
      
      const advanceStep = () => {
        setCurrentStep((prev) => {
          if (prev < steps.length) {
            timer = setTimeout(advanceStep, 1200);
            return prev + 1;
          }
          return prev;
        });
      };
      
      // Start the sequence
      timer = setTimeout(advanceStep, 800);
    }
    
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCurrentStep(0);
    }, 400); // Wait for fade-out animation
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`audit-modal ${isOpen && !isClosing ? 'active' : ''}`} id="auditModal">
      <div className="audit-modal__content">
        <div className="audit-modal__close" onClick={handleClose}>×</div>
        
        <div className="audit-modal__header">
          <span className="section__overline">End-to-End Pipeline</span>
          <h2 className="audit-modal__title">From URL to <span className="text-gradient">Verified Fixes</span></h2>
          <p className="audit-modal__desc">A fully automated pipeline scanning <span className="font-mono text-indigo">{targetUrl}</span></p>
        </div>

        <div className="workflow__pipeline audit-modal__pipeline">
          {/* Step 1 */}
          <div className={`workflow__step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <span className="workflow__step-label">Browser Scan</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line" style={{ transform: `scaleX(${currentStep > 1 ? 1 : 0})` }}></div></div>
          
          {/* Step 2 */}
          <div className={`workflow__step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <span className="workflow__step-label">Data Extract</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line" style={{ transform: `scaleX(${currentStep > 2 ? 1 : 0})` }}></div></div>
          
          {/* Step 3 */}
          <div className={`workflow__step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <span className="workflow__step-label">WCAG + UX</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line" style={{ transform: `scaleX(${currentStep > 3 ? 1 : 0})` }}></div></div>
          
          {/* Step 4 */}
          <div className={`workflow__step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span className="workflow__step-label">Journeys</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line" style={{ transform: `scaleX(${currentStep > 4 ? 1 : 0})` }}></div></div>
          
          {/* Step 5 */}
          <div className={`workflow__step ${currentStep >= 5 ? 'active' : ''} ${currentStep > 5 ? 'completed' : ''}`}>
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <span className="workflow__step-label">AI Fixes</span>
          </div>
          <div className="workflow__connector"><div className="workflow__connector-line" style={{ transform: `scaleX(${currentStep > 5 ? 1 : 0})` }}></div></div>
          
          {/* Step 6 */}
          <div className={`workflow__step ${currentStep >= 6 ? 'active' : ''} ${currentStep > 6 ? 'completed' : ''}`}>
            <div className="workflow__step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span className="workflow__step-label">Verified</span>
          </div>
        </div>
        
        <div className="audit-modal__progress-container" style={{ marginBottom: '24px' }}>
          <div 
            className="audit-modal__progress-bar" 
            style={{ width: `${(Math.min(currentStep, 6) / 6) * 100}%` }}
          ></div>
        </div>
        
        <div style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#10b981', textAlign: 'left', height: '140px', overflowY: 'auto', border: '1px solid #1e293b', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
          {currentStep >= 0 && <div>{'>'} Initializing engine...</div>}
          {currentStep >= 0 && <div>{'>'} Connecting to Playwright instance...</div>}
          {currentStep >= 1 && <div>{'>'} Browser instance ready. Navigating to {targetUrl}...</div>}
          {currentStep >= 1 && <div>{'>'} Extracting DOM tree and CSS rules...</div>}
          {currentStep >= 2 && <div>{'>'} Running WCAG 2.1 evaluation on 1,420 nodes...</div>}
          {currentStep >= 2 && <div>{'>'} Checking contrast ratios and ARIA labels...</div>}
          {currentStep >= 3 && <div>{'>'} Evaluating 10 UX heuristics...</div>}
          {currentStep >= 3 && <div>{'>'} Simulating keyboard navigation and screen reader...</div>}
          {currentStep >= 4 && <div>{'>'} Analyzing user journey paths for friction points...</div>}
          {currentStep >= 5 && <div>{'>'} Generating verified HTML/CSS code fixes...</div>}
          {currentStep >= 5 && <div>{'>'} Validating AI patches...</div>}
          {currentStep >= 6 && <div>{'>'} Audit complete. Compiling final report...</div>}
          <div style={{ display: 'inline-block', width: '8px', height: '14px', background: '#10b981', marginTop: '4px', opacity: currentStep >= 6 ? 0 : 1 }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;
