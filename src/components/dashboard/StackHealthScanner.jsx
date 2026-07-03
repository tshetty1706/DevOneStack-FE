import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiMicroscopeLine, RiRefreshLine, RiCloseLine, RiAlertLine, RiCheckLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';

const HEALTH_DATA = [
  { stack: 'React',      status: 'warn',    msg: '2 resources added but no boilerplates yet' },
  { stack: 'Node.js',    status: 'warn',    msg: "Stack hasn't been updated in 14 days" },
  { stack: 'MongoDB',    status: 'warn',    msg: 'No notes added yet — stack is empty' },
  { stack: 'TypeScript', status: 'healthy', msg: 'Stack looks healthy' },
];

const WARN_STACKS = HEALTH_DATA.filter(h => h.status === 'warn').slice(0, 2);

export default function StackHealthScanner() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const bg = 'var(--card-bg)';
  const border = 'var(--card-border)';
  const hoverBorder = 'var(--card-hover-border)';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const textSub = isLight ? '#9ca3af' : '#4b5563';
  const dividerColor = isLight ? '#f3f4f6' : '#18181b';
  const rowHoverBg = isLight ? '#f9fafb' : '#121214';
  const focusBorder = isLight ? '#0a0a0a' : '#ffffff';

  const [scanning, setScanning] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('dos_scanner_dismissed') === 'true'
  );

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1200);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('dos_scanner_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  const ghostBtn = {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '6px', cursor: 'pointer',
    border: `1px solid ${border}`, background: 'transparent',
    color: textMuted, fontSize: '12px', fontWeight: 500,
    fontFamily: 'var(--font-body)', transition: 'border-color 0.15s ease, color 0.15s ease',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.02)' : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = hoverBorder;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isLight 
          ? '0 12px 30px rgba(0, 0, 0, 0.04)' 
          : '0 12px 30px rgba(99, 102, 241, 0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = border;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isLight ? '0 4px 20px rgba(0, 0, 0, 0.02)' : 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RiMicroscopeLine size={14} style={{ color: textMuted }} />
          <span style={{
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
            color: textMuted, fontWeight: 600,
          }}>Stack Health Scanner</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleScan}
            disabled={scanning}
            style={ghostBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}
          >
            <RiRefreshLine
              size={12}
              style={{ animation: scanning ? 'spin 0.8s linear infinite' : 'none' }}
            />
            Scan now
          </button>
          <button
            onClick={handleDismiss}
            style={ghostBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}
          >
            <RiCloseLine size={12} /> Dismiss
          </button>
        </div>
      </div>

      {/* Last scanned */}
      <div style={{ fontSize: '11px', color: textSub, marginBottom: '14px' }}>
        Last scanned: just now
      </div>

      {/* Health rows */}
      <div>
        {scanning ? (
          /* Shimmer skeleton */
          <div>
            <style>{`
              @keyframes shimmer-scan {
                0% { background-position: -600px 0; }
                100% { background-position: 600px 0; }
              }
              .scan-shimmer {
                background: linear-gradient(90deg,
                  ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'} 25%,
                  ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'} 50%,
                  ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)'} 75%
                );
                background-size: 600px 100%;
                animation: shimmer-scan 1.2s infinite linear;
                border-radius: 6px; height: 14px;
              }
            `}</style>
            {HEALTH_DATA.map((_, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: `1px solid ${dividerColor}`, display: 'flex', gap: '12px' }}>
                <div className="scan-shimmer" style={{ width: '14px', flexShrink: 0 }} />
                <div className="scan-shimmer" style={{ width: '72px' }} />
                <div className="scan-shimmer" style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {HEALTH_DATA.map((row, i) => (
              <motion.div
                key={row.stack}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 8px', borderBottom: `1px solid ${dividerColor}`,
                  cursor: 'default', borderRadius: '4px',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = rowHoverBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Status icon */}
                <span style={{ flexShrink: 0, display: 'flex', fontSize: '15px' }}>
                  {row.status === 'warn'
                    ? <RiAlertLine style={{ color: isLight ? '#999999' : '#cccccc' }} />
                    : <RiCheckLine style={{ color: isLight ? '#666666' : '#E5E5E5' }} />
                  }
                </span>

                {/* Stack name */}
                <span style={{ fontSize: '14px', fontWeight: 500, color: textPrimary, minWidth: '90px' }}>
                  {row.stack}
                </span>

                {/* Message */}
                <span style={{ fontSize: '13px', color: textMuted, flex: 1 }}>
                  {row.msg}
                </span>

                {/* Fix arrow */}
                <span style={{ fontSize: '12px', color: textSub }}>→</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        {WARN_STACKS.map(({ stack }) => (
          <button
            key={stack}
            style={{
              padding: '6px 14px', borderRadius: '100px', cursor: 'pointer',
              border: `1px solid ${border}`, background: 'transparent',
              color: textMuted, fontSize: '12px', fontWeight: 500,
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}
          >
            Fix {stack} →
          </button>
        ))}
      </div>

      {/* Keyframe for scan spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
