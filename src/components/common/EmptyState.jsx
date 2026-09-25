import React from 'react';
import { RiAddLine } from 'react-icons/ri';

/**
 * Reusable EmptyState component with icon, title, description, and optional action button
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = RiAddLine,
  style = {},
  className = '',
}) {
  return (
    <div
      className={`common-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        gap: '14px',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {Icon && (
        <div
          style={{
            color: 'var(--text-muted)',
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '4px',
          }}
        >
          <Icon size={44} />
        </div>
      )}

      {title && (
        <p
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-color)',
            margin: '0',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </p>
      )}

      {description && (
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            maxWidth: '360px',
            margin: '0',
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            borderRadius: '8px',
            border: '1px solid var(--card-border)',
            background: 'transparent',
            color: 'var(--accent-color)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            marginTop: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--card-border)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {ActionIcon && <ActionIcon size={16} />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
