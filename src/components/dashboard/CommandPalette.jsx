import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';

export default function CommandPalette({ open, onClose }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const bg = isLight ? '#ffffff' : '#111111';
  const border = isLight ? '#e5e5e5' : '#222222';
  const overlay = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.7)';
  const textMuted = isLight ? '#999999' : '#4C4C4C';
  const textPrimary = isLight ? '#111111' : '#E5E5E5';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 3000,
              background: overlay, backdropFilter: 'blur(4px)',
            }}
          />

          {/* Palette panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: '80px',
              left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: '560px', zIndex: 3001,
              background: bg, border: `1px solid ${border}`,
              borderRadius: '14px',
              boxShadow: isLight
                ? '0 20px 60px rgba(0,0,0,0.14)'
                : '0 20px 60px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
          >
            {/* Search input row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 16px',
              borderBottom: `1px solid ${border}`,
            }}>
              <RiSearchLine size={18} style={{ color: textMuted, flexShrink: 0 }} />
              <input
                autoFocus
                placeholder="Search spaces, learnings, snippets…"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: '15px',
                  color: textPrimary, fontFamily: 'var(--font-body)',
                  '::placeholder': { color: textMuted },
                }}
              />
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '6px',
                  border: `1px solid ${border}`, background: 'transparent',
                  cursor: 'pointer', color: textMuted, fontSize: '14px',
                }}
              >
                <RiCloseLine />
              </button>
            </div>

            {/* Empty state hint */}
            <div style={{ padding: '40px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: textMuted }}>
                Type to search — full search coming soon.
              </p>
            </div>

            {/* Footer hint */}
            <div style={{
              padding: '10px 16px', borderTop: `1px solid ${border}`,
              display: 'flex', gap: '16px',
              fontSize: '11px', color: textMuted,
            }}>
              <span><kbd style={{ fontFamily: 'var(--font-body)' }}>↑↓</kbd> navigate</span>
              <span><kbd style={{ fontFamily: 'var(--font-body)' }}>↵</kbd> open</span>
              <span><kbd style={{ fontFamily: 'var(--font-body)' }}>Esc</kbd> close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
