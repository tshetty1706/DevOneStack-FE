import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiCloseLine, RiTerminalBoxLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const COMMON_TOOLS = [
  { value: 'React', label: 'React' },
  { value: 'Docker', label: 'Docker' },
  { value: 'Node.js', label: 'Node.js' },
  { value: 'MongoDB', label: 'MongoDB' },
  { value: 'Python', label: 'Python' },
  { value: 'Kubernetes', label: 'Kubernetes' },
  { value: 'AWS', label: 'AWS' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
  { value: 'Tailwind CSS', label: 'Tailwind CSS' },
  { value: 'custom', label: 'Create Custom Space...' }
];

export default function NewSpaceModal({ open, onClose }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  const [spaceName, setSpaceName] = useState('React');
  const [customName, setCustomName] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSpaceName('React');
      setCustomName('');
      setTags('');
      setError('');
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalName = spaceName === 'custom' ? customName.trim() : spaceName;
    if (!finalName) {
      setError('Space name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/spaces', {
        name: finalName,
        tags: tags
      });

      // Invalidate spaces + history queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['spaces'] });
      await queryClient.invalidateQueries({ queryKey: ['history'] });

      // Close modal
      onClose();

      // Redirect to the newly created space dashboard
      navigate(`/spaces/${response.data._id}`);
    } catch (err) {
      console.error('Failed to create space:', err);
      setError(err.response?.data?.error || 'Failed to create space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bg = isLight ? '#ffffff' : '#111111';
  const border = isLight ? '#e5e5e5' : '#222222';
  const overlay = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.7)';
  const textMuted = isLight ? '#999999' : '#666666';
  const textPrimary = isLight ? '#111111' : '#E5E5E5';
  const inputBg = isLight ? '#ffffff' : '#18181b';
  const inputBorder = isLight ? '#e5e5e5' : '#27272a';
  const inputBorderHover = isLight ? '#bbbbbb' : '#3f3f46';
  const accentColor = isLight ? '#4f46e5' : '#6366f1';

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

          {/* Modal Content */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: '15%',
              left: '50%', transform: 'translate(-50%, 0)',
              width: '90%', maxWidth: '480px', zIndex: 3001,
              background: bg, border: `1px solid ${border}`,
              borderRadius: '14px',
              boxShadow: isLight
                ? '0 20px 60px rgba(0,0,0,0.1)'
                : '0 20px 60px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              fontFamily: 'var(--font-body)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RiTerminalBoxLine size={18} style={{ color: accentColor }} />
                <h3 style={{
                  margin: 0, fontSize: '15px', fontWeight: 700,
                  color: textPrimary, fontFamily: 'var(--font-display)'
                }}>
                  Create New Space
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '6px',
                  border: 'none', background: 'transparent',
                  cursor: 'pointer', color: textMuted, fontSize: '18px',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isLight ? '#f5f5f5' : '#222'; e.currentTarget.style.color = textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; }}
              >
                <RiCloseLine />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div style={{
                  padding: '10px 12px', borderRadius: '6px',
                  background: isLight ? '#fef2f2' : '#450a0a',
                  border: `1px solid ${isLight ? '#fca5a5' : '#991b1b'}`,
                  color: isLight ? '#b91c1c' : '#f87171',
                  fontSize: '12px', fontWeight: 500
                }}>
                  {error}
                </div>
              )}

              {/* Space Name Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Space Name / Tool
                </label>
                <select
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  style={{
                    width: '100%', height: '36px', padding: '0 10px',
                    borderRadius: '8px', border: `1px solid ${inputBorder}`,
                    background: inputBg, color: textPrimary, outline: 'none',
                    fontSize: '13px', fontFamily: 'var(--font-body)',
                    cursor: 'pointer', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                >
                  {COMMON_TOOLS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Space Name Input */}
              {spaceName === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 600, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Custom Space Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Svelte, Rust, PyTorch..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{
                      width: '100%', height: '36px', padding: '0 12px',
                      borderRadius: '8px', border: `1px solid ${inputBorder}`,
                      background: inputBg, color: textPrimary, outline: 'none',
                      fontSize: '13px', fontFamily: 'var(--font-body)',
                      boxSizing: 'border-box', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = accentColor}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                </motion.div>
              )}



              {/* Tags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tags (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. frontend, backend, database"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  style={{
                    width: '100%', height: '36px', padding: '0 12px',
                    borderRadius: '8px', border: `1px solid ${inputBorder}`,
                    background: inputBg, color: textPrimary, outline: 'none',
                    fontSize: '13px', fontFamily: 'var(--font-body)',
                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    height: '36px', padding: '0 16px', borderRadius: '8px',
                    border: `1px solid ${border}`, background: 'transparent',
                    color: textPrimary, fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f5f5f5' : '#1c1c1e'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: '36px', padding: '0 18px', borderRadius: '8px',
                    border: 'none', background: accentColor,
                    color: '#ffffff', fontSize: '13px', fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Space'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
