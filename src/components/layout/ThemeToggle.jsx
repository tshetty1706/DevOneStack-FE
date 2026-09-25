import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button, Tooltip } from 'antd';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip title={label} placement="left">
      <Button
        onClick={toggleTheme}
        type="default"
        shape="circle"
        aria-label={label}
        id="global-theme-toggle-btn"
        style={{
          position: 'fixed',
          bottom: '22px',
          right: '22px',
          zIndex: 1000,
          width: '46px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--card-border, rgba(255,255,255,0.12))',
          background: 'var(--card-bg, rgba(15,17,25,0.9))',
          color: 'var(--text-color, #ffffff)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(99, 102, 241, 0.15)'
            : '0 8px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'all 0.25s ease',
        }}
        className="global-theme-toggle-btn"
      >
        {isDark ? (
          // Sun Icon for swapping to light
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M4.93 4.93l1.41 1.41" />
            <path d="M17.66 17.66l1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="M6.34 17.66l-1.41 1.41" />
            <path d="M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          // Moon Icon for swapping to dark
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </Button>
    </Tooltip>
  );
}
