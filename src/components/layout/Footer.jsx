import React, { useState } from 'react';
import GetStarted from './GetStarted';
import OnlyLogo from './OnlyLogo'

export default function Footer() {
  const handleAiSummary = (e) => {
    e.preventDefault();
    alert('DevOneStack is a unified developer workspace manager. It integrates your documentation, code snippets, notes, task boards, repositories, prompts, and developer communities into organized, tool-specific workspaces. This page demonstrates our minimal, premium landing page, complete with a floating-icon visual centerpiece, tool compatibility strip, dynamic stats counter, and structural product walkthrough.');
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer-container">
        {/* Centerpiece Separator Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '50px',
          width: '100%',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              fontSize: '22px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              userSelect: 'none',
              paddingTop: '6px'
            }}>
              “
            </div>
            <span style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-color)',
              fontFamily: 'var(--font-body)',
              letterSpacing: '-0.01em'
            }}>
              Build better. Stay organized.
            </span>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
        </div>

        <div className="footer-grid">
          <div className="footer-logo-col">
            <div className="footer-logo">
              <OnlyLogo className='footer-only-logo' />
              <span>DevOneStack</span>
            </div>
            <p className="footer-tagline">
              One workspace for every tool you learn.
            </p>

            <GetStarted />

          </div>

          <div className="footer-links-col">
            <h4 className="footer-links-title">Product</h4>
            <ul className="footer-links-list">
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="#pricing" className="footer-link">Pricing</a></li>
              <li><a href="#changelog" className="footer-link">Changelog</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-links-title">Resources</h4>
            <ul className="footer-links-list">
              <li><a href="#docs" className="footer-link">Docs</a></li>
              <li><a href="#blog" className="footer-link">Blog</a></li>
              <li><a href="#community" className="footer-link">Community</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-links-title">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#about" className="footer-link">About</a></li>
              <li><a href="#careers" className="footer-link">Careers</a></li>
              <li><a href="#contact" className="footer-link">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} DevOneStack. All rights reserved.
          </p>

          <div className="footer-bottom-right">
            <div className="footer-socials">
              <a href="https://github.com" className="footer-social-icon" target="_blank" rel="noreferrer">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="https://x.com" className="footer-social-icon" target="_blank" rel="noreferrer">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://discord.com" className="footer-social-icon" target="_blank" rel="noreferrer">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.873-.894.077.077 0 01-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 01.077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 01.078.009c.12.099.246.195.373.289a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                </svg>
              </a>
            </div>

            <a href="#summary" className="footer-ai-link" onClick={handleAiSummary}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              Get an AI summary of this page
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
