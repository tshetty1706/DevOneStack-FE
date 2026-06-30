import React from 'react';

export default function ViewCounter() {
  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        background: 'var(--badge-bg)',
        border: '1px solid var(--card-border)',
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        fontFamily: 'monospace',
      }}
    >
      <span style={{ fontSize: '13px', lineHeight: 1 }}>👁</span>
      <span>2,481</span>
    </div>
  );
}
