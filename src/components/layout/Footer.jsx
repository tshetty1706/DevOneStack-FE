import React, { useState } from 'react';
import { Button } from 'antd';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log(`Newsletter subscription attempt: ${email}`);
    setEmail('');
    alert(`Thank you! Early access notifications will be sent to: ${email}`);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: Logo & Email subscription */}
          <div className="footer-logo-col">
            <div className="footer-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ color: 'var(--accent-color)' }}
              >
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span>DevOneStack</span>
            </div>
            <p className="footer-tagline">
              One workspace for every tool you learn. Organize your developer knowledge loop.
            </p>
            <form className="footer-email-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email..."
                required
                className="footer-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                type="primary" 
                htmlType="submit"
                style={{
                  background: 'var(--accent-color)',
                  borderColor: 'var(--accent-color)',
                  height: 38,
                }}
              >
                Notify me
              </Button>
            </form>
          </div>

          {/* Column 2: Product */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Product</h4>
            <ul className="footer-links-list">
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="#pricing" className="footer-link">Pricing</a></li>
              <li><a href="#changelog" className="footer-link">Changelog</a></li>
              <li><a href="#roadmap" className="footer-link">Roadmap</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Resources</h4>
            <ul className="footer-links-list">
              <li><a href="#docs" className="footer-link">Docs</a></li>
              <li><a href="#blog" className="footer-link">Blog</a></li>
              <li><a href="#community" className="footer-link">Community</a></li>
              <li><a href="#help" className="footer-link">Help Center</a></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="footer-links-col">
            <h4 className="footer-links-title">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#about" className="footer-link">About</a></li>
              <li><a href="#careers" className="footer-link">Careers</a></li>
              <li><a href="#contact" className="footer-link">Contact</a></li>
              <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & socials */}
        <div className="footer-bottom">
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} DevOneStack Inc. All rights reserved.
          </div>

          <div className="footer-bottom-right">
            {/* Social Icons */}
            <div className="footer-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="X (Twitter)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Discord">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z" />
                  <path d="M10 12h.01M14 12h.01" />
                  <path d="M6 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
                </svg>
              </a>
            </div>

            {/* AI Summary Micro-Link */}
            <a 
              href="#ai-summary" 
              className="footer-ai-link"
              onClick={(e) => {
                e.preventDefault();
                console.log('AI Summary request triggered');
                alert('AI Summary: "DevOneStack coordinates all developer tooling knowledge spaces (notes, prompts, snippets, documentation, repositories) into a sleek, dark-themed responsive index featuring theme preferences, clean navigation grids, and interactive stat meters."');
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Get an AI summary of this page
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
