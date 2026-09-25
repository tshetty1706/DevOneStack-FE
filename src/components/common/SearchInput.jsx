import React from 'react';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';

/**
 * Common SearchInput component with clear button, icon, and standardized dark/glass styling.
 */
export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  size = 'md',
  className = '',
  style = {},
  autoFocus = false,
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '6px 12px 6px 32px', fontSize: '12px', height: '32px' },
    md: { padding: '8px 14px 8px 36px', fontSize: '13px', height: '38px' },
    lg: { padding: '10px 16px 10px 40px', fontSize: '14px', height: '44px' },
  };

  const iconSizes = { sm: 14, md: 16, lg: 18 };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', ...style }}>
      <RiSearchLine
        size={iconSizes[size]}
        style={{
          position: 'absolute',
          left: size === 'sm' ? '10px' : size === 'md' ? '12px' : '14px',
          color: 'var(--text-muted, #64748b)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
        style={{
          width: '100%',
          background: 'var(--input-bg, rgba(255,255,255,0.04))',
          border: '1px solid var(--card-border, rgba(255,255,255,0.1))',
          borderRadius: '10px',
          color: 'var(--text-color, #ffffff)',
          fontFamily: 'var(--font-body, inherit)',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          ...sizeStyles[size],
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-color, #6366f1)';
          e.currentTarget.style.background = 'var(--input-focus-bg, rgba(99,102,241,0.06))';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--card-border, rgba(255,255,255,0.1))';
          e.currentTarget.style.background = 'var(--input-bg, rgba(255,255,255,0.04))';
        }}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={onClear || (() => onChange({ target: { value: '' } }))}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted, #64748b)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
          }}
        >
          <RiCloseLine size={iconSizes[size]} />
        </button>
      )}
    </div>
  );
}
