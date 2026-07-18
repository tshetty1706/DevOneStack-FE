import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiCloseLine, RiTerminalBoxLine, RiSearchLine, RiFolder5Line, RiArrowDownSLine, RiArrowUpSLine, RiRefreshLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import SpaceIcon from '../spaces/SpaceIcon';
import { ICON_MAPPING, getIconKeyByName } from '../../utils/iconMapping';

export default function NewSpaceModal({ open, onClose }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  const [spaceName, setSpaceName] = useState('');
  const [tags, setTags] = useState('');
  const [iconKey, setIconKey] = useState('lucide:folder');
  const [isCustomIcon, setIsCustomIcon] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
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
      setTags('');
      setIconKey('lucide:folder');
      setIsCustomIcon(false);
      setSearchQuery('');
      setShowIconPicker(false);
      setError('');
      setLoading(false);
    }
  }, [open]);

  // Auto-detect icon based on space name if user hasn't chosen a custom one
  useEffect(() => {
    if (!isCustomIcon) {
      setIconKey(getIconKeyByName(spaceName));
    }
  }, [spaceName, isCustomIcon]);

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
        tags: tags,
        iconKey: iconKey
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

  const handleSelectIcon = (slug) => {
    setIconKey(slug);
    setIsCustomIcon(true);
  };

  const handleResetIcon = () => {
    setIsCustomIcon(false);
    setIconKey(getIconKeyByName(spaceName));
  };

  // Filter available icons based on search
  const filteredIcons = Object.values(ICON_MAPPING).filter(icon => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return icon.name.toLowerCase().includes(q) || icon.keywords.some(kw => kw.includes(q));
  });

  const bg = isLight ? '#ffffff' : '#111111';
  const border = isLight ? '#e5e5e5' : '#222222';
  const overlay = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.7)';
  const textMuted = isLight ? '#999999' : '#666666';
  const textPrimary = isLight ? '#111111' : '#E5E5E5';
  const inputBg = isLight ? '#ffffff' : '#18181b';
  const inputBorder = isLight ? '#e5e5e5' : '#27272a';
  const accentColor = isLight ? '#4f46e5' : '#6366f1';
  const pickerHoverBg = isLight ? '#f3f4f6' : '#18181b';
  const selectedBg = isLight ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.15)';

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
              position: 'fixed', top: '10%',
              left: '50%', transform: 'translate(-50%, 0)',
              width: '90%', maxWidth: '480px', zIndex: 3001,
              background: bg, border: `1px solid ${border}`,
              borderRadius: '14px',
              boxShadow: isLight
                ? '0 20px 60px rgba(0,0,0,0.1)'
                : '0 20px 60px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              fontFamily: 'var(--font-body)',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: `1px solid ${border}`, flexShrink: 0
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
                type="button"
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
            <form
              onSubmit={handleSubmit}
              data-lenis-prevent
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}
            >
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

              {/* Space Name Input & Live Icon Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Space Name
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React Native, System Design, Personal Notes..."
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    style={{
                      flex: 1, height: '38px', padding: '0 12px',
                      borderRadius: '8px', border: `1px solid ${inputBorder}`,
                      background: inputBg, color: textPrimary, outline: 'none',
                      fontSize: '13px', fontFamily: 'var(--font-body)',
                      boxSizing: 'border-box', transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = accentColor}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '8px',
                    border: `1px solid ${border}`, background: inputBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: textPrimary, position: 'relative', flexShrink: 0
                  }}>
                    <SpaceIcon iconKey={iconKey} size={22} />
                  </div>
                </div>
              </div>

              {/* Collapsible Icon Picker Trigger */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    background: inputBg, border: `1px solid ${border}`,
                    color: textPrimary, cursor: 'pointer', fontSize: '12px',
                    fontWeight: 600, transition: 'background 0.2s'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Icon: <code style={{ color: accentColor, fontWeight: 700 }}>{iconKey}</code>
                    {isCustomIcon && <span style={{ fontSize: '10px', color: textMuted, fontStyle: 'italic' }}>(Custom)</span>}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {showIconPicker ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
                  </span>
                </button>

                {/* Expanded Icon Picker */}
                <AnimatePresence>
                  {showIconPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        overflow: 'hidden', border: `1px solid ${border}`,
                        borderRadius: '8px', background: inputBg, padding: '12px',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                      }}
                    >
                      {/* Search & Reset */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                          flex: 1, height: '32px', display: 'flex', alignItems: 'center',
                          gap: '6px', border: `1px solid ${inputBorder}`, borderRadius: '6px',
                          padding: '0 8px', background: bg
                        }}>
                          <RiSearchLine size={13} style={{ color: textMuted }} />
                          <input
                            type="text"
                            placeholder="Search tech logo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                              flex: 1, border: 'none', background: 'transparent',
                              color: textPrimary, fontSize: '12px', outline: 'none'
                            }}
                          />
                        </div>
                        {isCustomIcon && (
                          <button
                            type="button"
                            onClick={handleResetIcon}
                            style={{
                              height: '32px', padding: '0 8px', borderRadius: '6px',
                              border: `1px solid ${border}`, background: 'transparent',
                              color: textMuted, cursor: 'pointer', fontSize: '11px',
                              display: 'flex', alignItems: 'center', gap: '4px',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = accentColor}
                            onMouseLeave={e => e.currentTarget.style.color = textMuted}
                          >
                            <RiRefreshLine size={12} /> Auto
                          </button>
                        )}
                      </div>

                      {/* Icon Grid */}
                      <div
                        data-lenis-prevent
                        style={{
                          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '6px', maxHeight: '160px', overflowY: 'auto',
                          paddingRight: '4px'
                        }}
                      >
                        {/* Default Folder Option */}
                        <div
                          onClick={() => handleSelectIcon('lucide:folder')}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '8px 4px', borderRadius: '6px',
                            cursor: 'pointer', gap: '4px',
                            background: iconKey === 'lucide:folder' ? selectedBg : 'transparent',
                            border: `1px solid ${iconKey === 'lucide:folder' ? accentColor : 'transparent'}`,
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => { if (iconKey !== 'lucide:folder') e.currentTarget.style.background = pickerHoverBg; }}
                          onMouseLeave={e => { if (iconKey !== 'lucide:folder') e.currentTarget.style.background = 'transparent'; }}
                        >
                          <RiFolder5Line size={18} style={{ color: textMuted }} />
                          <span style={{ fontSize: '9px', fontWeight: 500, color: textPrimary, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                            Default
                          </span>
                        </div>

                        {/* Technology Logos */}
                        {filteredIcons.slice(0, 48).map(icon => {
                          const isSelected = iconKey === icon.slug;
                          return (
                            <div
                              key={icon.slug}
                              onClick={() => handleSelectIcon(icon.slug)}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', padding: '8px 4px', borderRadius: '6px',
                                cursor: 'pointer', gap: '4px',
                                background: isSelected ? selectedBg : 'transparent',
                                border: `1px solid ${isSelected ? accentColor : 'transparent'}`,
                                transition: 'background 0.15s'
                              }}
                              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = pickerHoverBg; }}
                              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <SpaceIcon iconKey={icon.slug} size={18} />
                              <span style={{ fontSize: '9px', fontWeight: 500, color: textPrimary, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                                {icon.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', flexShrink: 0 }}>
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
