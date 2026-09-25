import React from 'react';
import { Tooltip } from 'antd';
import { RiPushpinLine, RiPushpin2Fill } from 'react-icons/ri';

/**
 * Reusable Pin/Unpin Toggle Button component
 */
export default function PinButton({
  isPinned,
  onToggle,
  size = 14,
  titlePinned = 'Unpin',
  titleUnpinned = 'Pin',
  className = '',
  style = {},
}) {
  return (
    <Tooltip title={isPinned ? titlePinned : titleUnpinned} placement="top">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.(e);
        }}
        aria-label={isPinned ? titlePinned : titleUnpinned}
        className={`common-pin-button ${className}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: isPinned ? 'var(--accent-color)' : 'var(--text-secondary)',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.15s ease, transform 0.15s ease',
          zIndex: 20,
          ...style,
        }}
      >
        {isPinned ? <RiPushpin2Fill size={size} /> : <RiPushpinLine size={size} />}
      </button>
    </Tooltip>
  );
}
