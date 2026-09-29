import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiCloseLine, RiStackLine, RiSparklingLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

export default function NewSpaceModal({ open, onClose }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  const [spaceName, setSpaceName] = useState('');
  const [description, setDescription] = useState('');
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
      setSpaceName('');
      setDescription('');
      setTags('');
      setError('');
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalName = spaceName.trim();
    if (!finalName) {
      setError('Space name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/spaces', {
        name: finalName,
        description: description.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        iconKey: 'lucide:stack'
      });

      // Invalidate spaces + history queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['spaces'] });
      await queryClient.invalidateQueries({ queryKey: ['history'] });

      // Close modal
      onClose();

      // Redirect to the newly created space dashboard
      navigate(`/u/${encodeURIComponent(user?.username || 'user')}/spaces/${response.data._id}`);
    } catch (err) {
      console.error('Failed to create space:', err);
      setError(err.response?.data?.error || 'Failed to create space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bg = isLight ? '#ffffff' : '#111116';
  const border = isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.08)';
  const overlay = isLight ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.7)';
  const textMuted = isLight ? '#64748b' : '#94a3b8';
  const textPrimary = isLight ? '#111827' : '#f8fafc';
  const inputBg = isLight ? '#ffffff' : '#181820';
  const inputBorder = isLight ? '#d1d5db' : 'rgba(255, 255, 255, 0.12)';
  const accentColor = 'var(--accent-color)';

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
              borderRadius: '16px',
              boxShadow: isLight
                ? '0 20px 60px rgba(0,0,0,0.12)'
                : '0 25px 65px rgba(0,0,0,0.7)',
              overflow: 'hidden',
              fontFamily: 'var(--font-body)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px', borderBottom: `1px solid ${border}`, flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <RiStackLine size={16} />
                </div>
                <h3 style={{
                  margin: 0, fontSize: '16px', fontWeight: 700,
                  color: textPrimary, fontFamily: 'var(--font-display)'
                }}>
                  Create New Space
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '26px', height: '26px', borderRadius: '6px',
                  border: 'none', background: 'transparent',
                  cursor: 'pointer', color: textMuted, fontSize: '18px',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; }}
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSubmit}
              data-lenis-prevent
              style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}
            >
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px',
                  background: isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${isLight ? '#fca5a5' : 'rgba(239, 68, 68, 0.25)'}`,
                  color: isLight ? '#b91c1c' : '#f87171',
                  fontSize: '12.5px', fontWeight: 500
                }}>
                  {error}
                </div>
              )}

              {/* Space Name Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                  Space Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Architecture, React Projects, Algorithms..."
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  style={{
                    width: '100%', height: '40px', padding: '0 12px',
                    borderRadius: '8px', border: `1px solid ${inputBorder}`,
                    background: inputBg, color: textPrimary, outline: 'none',
                    fontSize: '13.5px', fontFamily: 'var(--font-body)',
                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>

              {/* Description Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Document patterns, code snippets, architectural notes and resources."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px',
                    borderRadius: '8px', border: `1px solid ${inputBorder}`,
                    background: inputBg, color: textPrimary, outline: 'none',
                    fontSize: '13px', fontFamily: 'var(--font-body)',
                    boxSizing: 'border-box', resize: 'vertical',
                    minHeight: '64px', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: textPrimary }}>
                  Tags (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. frontend, backend, notes"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  style={{
                    width: '100%', height: '38px', padding: '0 12px',
                    borderRadius: '8px', border: `1px solid ${inputBorder}`,
                    background: inputBg, color: textPrimary, outline: 'none',
                    fontSize: '13px', fontFamily: 'var(--font-body)',
                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>

              {/* Advanced Customization Link */}
              <div style={{ textAlign: 'center', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/u/${encodeURIComponent(user?.username || 'user')}/spaces/create`);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: accentColor,
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Open Full Space Creator (Custom Thumbnail & Live Preview) →
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    height: '38px', padding: '0 16px', borderRadius: '8px',
                    border: `1px solid ${border}`, background: 'transparent',
                    color: textPrimary, fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: '38px', padding: '0 20px', borderRadius: '8px',
                    border: 'none', background: accentColor,
                    color: '#ffffff', fontSize: '13px', fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.2s', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
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
