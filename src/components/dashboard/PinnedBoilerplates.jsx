import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  RiPushpin2Line, RiFileCopyLine, RiCheckLine,
  RiFilter3Line, RiAddLine,
} from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const getAge = (dateStr) => {
  if (!dateStr) return 'today';
  const elapsed = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

export default function PinnedBoilerplates() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [copied, setCopied] = useState(null);

  // Queries & Mutations
  const { data: boilerplates = [] } = useQuery({
    queryKey: ['boilerplates', 'pinned'],
    queryFn: () => api.get('/api/boilerplates?pinned=true').then(r => r.data),
  });

  // Colors aligned with homepage premium styles
  const bg = 'var(--card-bg)';
  const border = 'var(--card-border)';
  const cardBg = isLight ? '#f9fafb' : '#121214';
  const cardBorder = isLight ? '#e5e7eb' : '#1f1f23';
  const codeBg = isLight ? '#f3f4f6' : '#0b0b0d';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const textSub = isLight ? '#9ca3af' : '#4b5563';
  const tagBg = isLight ? '#f3f4f6' : '#1a1a1f';
  const tagBorder = isLight ? '#e5e7eb' : '#27272a';
  // Purple accent from CSS vars
  const accentHover = 'var(--card-hover-border)';
  const accentColor = isLight ? '#4f46e5' : '#818cf8';
  const accentBg = isLight ? 'rgba(79,70,229,0.06)' : 'rgba(99,102,241,0.09)';
  const accentBorder = isLight ? 'rgba(79,70,229,0.4)' : 'rgba(99,102,241,0.5)';

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const ghostBtn = {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '5px 11px', borderRadius: '8px', cursor: 'pointer',
    border: `1px solid ${border}`, background: 'transparent',
    color: textMuted, fontSize: '12px', fontWeight: 500,
    fontFamily: 'var(--font-body)', transition: 'all 0.15s ease',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.02)' : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accentHover;
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
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiPushpin2Line size={14} style={{ color: textMuted }} />
          <span style={{
            fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: textMuted, fontWeight: 600,
          }}>
            Pinned Boilerplates
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 600, padding: '2px 7px',
            borderRadius: '20px', background: tagBg,
            border: `1px solid ${tagBorder}`, color: textMuted, letterSpacing: '0.06em',
          }}>
            {boilerplates.length} PINNED
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={ghostBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = textPrimary; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}
          >
            <RiFilter3Line size={12} /> Filter
          </button>
          <button
            style={ghostBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = textPrimary; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}
          >
            <RiAddLine size={12} /> Add snippet
          </button>
        </div>
      </div>

      {/* Horizontal scroll track — fade on right edge to hint more cards */}
      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '6px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${isLight ? '#cccccc' : '#2a2a2a'} transparent`,
        maskImage: 'linear-gradient(to right, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, black 88%, transparent 100%)',
      }}>
        {boilerplates.map((bp, i) => {
          const isCopied = copied === bp._id;
          const subtitleStr = bp.language + (bp.tags?.length ? ' · ' + bp.tags.join(' · ') : '');
          return (
            <motion.div
              key={bp._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.35 }}
              style={{
                minWidth: '200px', maxWidth: '200px',
                background: cardBg,
                border: `1px solid ${isCopied ? accentBorder : cardBorder}`,
                borderRadius: '10px', padding: '13px',
                display: 'flex', flexDirection: 'column', gap: '9px',
                flexShrink: 0,
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isCopied) e.currentTarget.style.borderColor = isLight ? '#bbb' : '#333';
              }}
              onMouseLeave={e => {
                if (!isCopied) e.currentTarget.style.borderColor = cardBorder;
              }}
            >
              {/* Stack label + status dot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '10px', textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: textMuted, fontWeight: 600,
                }}>{bp.stack || 'CODE'}</span>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                  background: isLight ? '#cccccc' : '#2a2a2a',
                }} />
              </div>

              {/* Title + subtitle */}
              <div>
                <div style={{
                  fontSize: '13px', fontWeight: 600, color: textPrimary,
                  lineHeight: 1.3, marginBottom: '2px',
                }}>{bp.name}</div>
                <div style={{ fontSize: '11px', color: textMuted }}>{subtitleStr}</div>
              </div>

              {/* Code preview */}
              <div style={{
                background: codeBg, borderRadius: '6px',
                padding: '8px 10px', flex: 1, overflow: 'hidden', maxHeight: '82px',
              }}>
                <pre style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '10px',
                  color: isLight ? '#444444' : '#888888',
                  margin: 0, lineHeight: 1.55,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                }}>{bp.code}</pre>
              </div>

              {/* Footer: Copy button + age */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginTop: '2px',
              }}>
                <button
                  onClick={() => handleCopy(bp._id, bp.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
                    border: `1px solid ${isCopied ? accentBorder : (isLight ? '#e0e0e0' : '#2a2a2a')}`,
                    background: isCopied ? accentBg : 'transparent',
                    color: isCopied ? accentColor : textMuted,
                    fontSize: '11px', fontWeight: 500,
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isCopied
                    ? <><RiCheckLine size={11} /> Copied!</>
                    : <><RiFileCopyLine size={11} /> Copy</>
                  }
                </button>
                <span style={{ fontSize: '10px', color: textSub }}>{getAge(bp.createdAt)}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Trailing spacer so last card isn't fully masked */}
        <div style={{ minWidth: '32px', flexShrink: 0 }} />
      </div>
    </motion.div>
  );
}
