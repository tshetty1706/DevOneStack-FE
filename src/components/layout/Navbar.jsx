import React from 'react';
import { Button } from 'antd';

export default function Navbar() {
  const navLinks = ['Product', 'Resources', 'Solutions', 'Pricing', 'Company'];

  return (
    <header className="navbar">
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

        {/* Center: Nav links */}
        <nav className="navbar-menu">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="navbar-link"
              onClick={(e) => {
                e.preventDefault();
                // Smooth scroll to section if it exists, or just log
                const section = document.getElementById(link.toLowerCase());
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                } else {
                  console.log(`Navigate to placeholder section: ${link}`);
                }
              }}
            >
              {link}
            </a>
          ))}
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
