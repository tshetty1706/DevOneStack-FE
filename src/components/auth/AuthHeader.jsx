import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import Logo from '../layout/Logo';

const NAV_LINKS = [
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Features', id: 'features' },
  { label: 'Contact', id: 'contact' },
];

export default function AuthHeader({ activePage = 'login' }) {
  const navigate = useNavigate();

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollToId: targetId } });
    }
  };

  return (
    <header className="auth-nav-header">
      <div className="auth-nav-container">
        {/* Left: Brand Logo */}
        <div className="auth-nav-logo">
          <Logo />
        </div>

        {/* Center: Navigation Links (hidden on smaller tablet/mobile) */}
        <nav className="auth-nav-links" aria-label="Main Navigation">
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              className="auth-nav-link"
              onClick={(e) => handleNavClick(e, item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: GitHub & Auth Actions */}
        <div className="auth-nav-actions">
          <a
            href="https://github.com/devonestack/DevOneStack"
            target="_blank"
            rel="noopener noreferrer"
            className="auth-nav-github-btn"
            aria-label="DevOneStack GitHub Repository"
            title="GitHub"
          >
            <FaGithub size={18} />
          </a>

          {activePage === 'login' ? (
            <>
              <span className="auth-nav-link active desktop-only">Log in</span>
              <Link to="/signup" className="auth-nav-btn-pill">
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-nav-link desktop-only">
                Log in
              </Link>
              <Link to="/login" className="auth-nav-btn-pill mobile-only">
                Log in
              </Link>
              <span className="auth-nav-btn-pill active desktop-only">
                Sign up
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
