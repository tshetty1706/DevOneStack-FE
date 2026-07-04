import React from 'react';
import { Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../layout/Logo'
export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavClick = (e, label) => {
    e.preventDefault();
    console.log(`Navigation click: ${label}`);
    if (label === 'Login') {
      navigate('/login');
    } else if (label === 'Signup') {
      navigate('/signup');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          {/* Custom SVG Logo Mark */}
          <Logo />
        </Link>

        <div className="navbar-menu">
          {['Product', 'Resources', 'Solutions', 'Pricing', 'Company'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="navbar-link"
              onClick={(e) => handleNavClick(e, item)}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Viewer count with eye icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              marginRight: '8px',
              userSelect: 'none',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>43.3k</span>
          </div>

          {user ? (
            <Button
              type="primary"
              style={{
                background: 'var(--accent-color)',
                borderColor: 'var(--accent-color)',
                color: '#ffffff',
              }}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                type="text"
                className="navbar-link"
                style={{ border: 'none', background: 'transparent' }}
                onClick={(e) => handleNavClick(e, 'Login')}
              >
                Log in
              </Button>
              <Button
                type="primary"
                style={{
                  background: 'var(--accent-color)',
                  borderColor: 'var(--accent-color)',
                  color: '#ffffff',
                }}
                onClick={(e) => handleNavClick(e, 'Signup')}
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
