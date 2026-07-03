import React from 'react';
import { motion } from 'motion/react';
import { RiHistoryLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';

export default function RecentActivity() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const textMuted = isLight ? '#666666' : '#666666';
  const textPrimary = isLight ? '#333333' : '#B2B2B2';
  const emptyBg = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)';
  const emptyBorder = isLight ? '#e5e5e5' : '#1a1a1a';

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <p style={{
          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
          color: textMuted, fontWeight: 600, margin: 0,
        }}>
          Recent activity
        </p>
        <span style={{
          fontSize: '10px', fontWeight: 600, padding: '2px 7px',
          borderRadius: '20px', letterSpacing: '0.06em', textTransform: 'uppercase',
          background: isLight ? '#f0f0f0' : '#1a1a1a',
          border: `1px solid ${isLight ? '#e5e5e5' : '#222222'}`,
          color: textMuted,
        }}>
          Live
        </span>
      </div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          border: `2px dashed ${emptyBorder}`,
          borderRadius: '14px',
          background: emptyBg,
          padding: '56px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '12px',
        }}
      >
        <RiHistoryLine size={52} style={{ color: isLight ? '#B2B2B2' : '#333333' }} />
        <div>
          <p style={{
            fontSize: '15px', fontWeight: 600, color: textPrimary,
            margin: '0 0 6px', fontFamily: 'var(--font-display)',
          }}>
            No activity yet
          </p>
          <p style={{
            fontSize: '13px', color: textMuted, maxWidth: '360px',
            lineHeight: 1.55, margin: 0,
          }}>
            Start adding spaces, notes, and resources — your activity will show up here.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
