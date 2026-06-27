import { useState } from 'react';

const AuthModal = ({ isOpen, initialMode, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState(initialMode || 'login'); // 'login' or 'signup'
  const [isClosing, setIsClosing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400); // Wait for fade-out animation
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  const handleSocialLogin = (provider) => {
    setIsAuthenticating(provider);
    
    // Set mock state so they are logged in if they hit 'back' in browser
    localStorage.setItem('ux_auditor_logged_in', 'true');
    
    // Redirect to the actual provider's login page
    setTimeout(() => {
      setIsAuthenticating(null);
      if (provider === 'google') {
        window.location.href = 'https://accounts.google.com/signin';
      } else if (provider === 'github') {
        window.location.href = 'https://github.com/login';
      } else {
        onLoginSuccess();
      }
    }, 800);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`auth-modal-overlay ${isOpen && !isClosing ? 'active' : ''}`} onClick={handleClose}>
      <div className={`auth-modal ${isOpen && !isClosing ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="auth-modal__close" onClick={handleClose} disabled={isAuthenticating}>×</button>
        
        <div className="auth-modal__header">
          <div className="auth-modal__icon">
            <svg viewBox="0 0 32 32" fill="none" width="40" height="40">
              <rect x="2" y="2" width="28" height="28" rx="8" stroke="#a855f7" strokeWidth="2.5"/>
              <path d="M10 16.5L14 20.5L22 12.5" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
          <p>{mode === 'login' ? 'Log in to view your latest audits.' : 'Start your journey to perfect UX.'}</p>
        </div>

        <div className="auth-modal__social">
          <button 
            className="auth-modal__social-btn" 
            onClick={() => handleSocialLogin('google')}
            disabled={isAuthenticating}
            style={{ opacity: isAuthenticating && isAuthenticating !== 'google' ? 0.5 : 1 }}
          >
            {isAuthenticating === 'google' ? (
              <span className="loading-spinner">Connecting to Google...</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          <button 
            className="auth-modal__social-btn"
            onClick={() => handleSocialLogin('github')}
            disabled={isAuthenticating}
            style={{ opacity: isAuthenticating && isAuthenticating !== 'github' ? 0.5 : 1 }}
          >
            {isAuthenticating === 'github' ? (
              <span className="loading-spinner">Connecting to GitHub...</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </>
            )}
          </button>
        </div>

        <div className="auth-modal__divider">
          <span>or continue with email</span>
        </div>

        <form className="auth-modal__form" onSubmit={(e) => { e.preventDefault(); handleSocialLogin('email'); }}>
          {mode === 'signup' && (
            <div className="auth-modal__input-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" />
            </div>
          )}
          <div className="auth-modal__input-group">
            <label>Email Address</label>
            <input type="email" placeholder="john@company.com" />
          </div>
          <div className="auth-modal__input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn--primary auth-modal__submit">
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-modal__footer">
          {mode === 'login' ? (
            <p>Don't have an account? <span onClick={toggleMode}>Sign up</span></p>
          ) : (
            <p>Already have an account? <span onClick={toggleMode}>Log in</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
