import React from 'react';
import { RiLoader4Line } from 'react-icons/ri';

/**
 * Common Spinner component for loading states.
 */
export default function Spinner({
  size = 24,
  color = 'var(--accent-color, #6366f1)',
  className = '',
  style = {},
  fullPage = false,
  message = '',
}) {
  const spinnerElement = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        ...style,
      }}
      className={className}
    >
      <RiLoader4Line
        size={size}
        style={{
          color,
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && (
        <span style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 500 }}>
          {message}
        </span>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '280px',
          width: '100%',
          padding: '40px 20px',
        }}
      >
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}
