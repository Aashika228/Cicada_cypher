import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import DashboardPreview from './DashboardPreview';

const Dashboard = ({ onLogout }) => {
  return (
    <div className="dashboard-page" style={{ minHeight: '100vh', padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', padding: '20px 40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="nav__logo-icon" style={{ width: '40px', height: '40px' }}>
            <svg viewBox="0 0 32 32" fill="none" style={{ width: '100%', height: '100%' }}>
              <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#logoGrad)" strokeWidth="2.5"/>
              <path d="M10 16.5L14 20.5L22 12.5" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="8" r="3" fill="#a78bfa"/>
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>UX Auditor Dashboard</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <UserButton />
        </div>
      </header>
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--text-primary)' }}>Your Audits</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Here is a detailed breakdown of your recent website UX audits.</p>
        
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          <DashboardPreview />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
