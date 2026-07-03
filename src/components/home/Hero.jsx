import React from 'react';
import { Button } from 'antd';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardMockup from './DashboardMockup';

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleScrollToSteps = (e) => {
    e.preventDefault();
    const stepsElement = document.getElementById('how-it-works');
    if (stepsElement) {
      stepsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      {/* Background Flowing Orbs and Grids */}
      <div className="hero-background-flow">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
        <div className="grid-bg-overlay" />
      </div>

      <div className="hero-grid" style={{ gridTemplateColumns: '1fr 1.1fr', gap: '40px' }}>
        {/* Left Side Content */}
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top Pill Badge */}
          <div className="hero-pill-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            <span>Organize.Build.Learn</span>
          </div>

          <h1 className="hero-headline">
            Every tool you learn.
            <br />
            One place to keep it.
          </h1>

          <p className="hero-subheading">
            Store your docs, notes, snippets, repos, prompts, and communities
            in one clean workspace — so you can focus on building, not searching.
          </p>

          <div className="hero-ctas">
            <Button
              type="primary"
              size="large"
              style={{
                background: 'var(--accent-color)',
                borderColor: 'var(--accent-color)',
                height: '48px',
                padding: '0 24px',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffffff',
              }}
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
            >
              {user ? 'Go to Dashboard' : 'Get started for free'}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Button>

            <Button
              type="default"
              size="large"
              style={{
                height: '48px',
                padding: '0 24px',
                fontSize: '15px',
                background: 'transparent',
                borderColor: 'var(--card-border)',
                color: 'var(--text-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onClick={handleScrollToSteps}
            >
              See how it works
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
            </Button>
          </div>

          {/* Social Proof Stars */}
          <div className="hero-social-proof">
            <div className="hero-avatars">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" alt="Developer Avatar 1" className="hero-avatar" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" alt="Developer Avatar 2" className="hero-avatar" />
              <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80" alt="Developer Avatar 3" className="hero-avatar" />
            </div>
            <div className="hero-rating-info">
              <div className="hero-stars">
                {'★'.repeat(5)}
              </div>
              <div className="hero-rating-text">Loved by 25,000+ developers</div>
            </div>
          </div>
        </motion.div>

        {/* Right Side Visual - Dashboard Mockup */}
        <motion.div
          className="hero-visual-wrapper"
          style={{ width: '100%', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
