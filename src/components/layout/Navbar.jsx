import React from 'react';
import { Button } from 'antd';
import ViewCounter from './ViewCounter';

export default function Navbar() {
  const navLinks = ['Product', 'Docs', 'Solutions', 'Pricing', 'Company'];

  return (
    <header className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900 }}>

      <div className="navbar-container">
        {/* Left: Logo */}
        <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <svg
            width="26"
            height="26"
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

        {/* Center: Nav links & View Counter */}
        <nav className="navbar-menu">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="navbar-link"
              onClick={(e) => {
                e.preventDefault();
                const section = document.getElementById(link.toLowerCase());
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                } else {
                  console.log(`Navigate to placeholder section: ${link}`);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {link}
              {link === 'Product' && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </a>
          ))}
          <ViewCounter />
        </nav>

        {/* Right: Auth buttons */}
        <div className="navbar-actions">
          <Button
            type="text"
            style={{
              color: 'var(--text-color)',
            }}
            onClick={() => console.log('Auth: Log in button clicked')}
          >
            Log in
          </Button>
          <Button
            type="primary"
            style={{
              background: 'var(--accent-color)',
              borderColor: 'var(--accent-color)',
              borderRadius: '24px', // pill shape
            }}
            onClick={() => console.log('Auth: Sign up button clicked')}
          >
            Sign up
          </Button>
        </div>
      </div>
    </header>
  );
}
