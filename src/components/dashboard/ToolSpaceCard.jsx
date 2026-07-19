import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import SpaceIcon from '../spaces/SpaceIcon';
import { getIconKeyByName } from '../../utils/iconMapping';
import {
  RiPushpinLine, RiPushpinFill, RiMore2Line, RiTimeLine,
  RiArrowRightLine, RiEditLine, RiDeleteBinLine
} from 'react-icons/ri';

const getSpaceColorPalette = (name, theme) => {
  const isLight = theme === 'light';
  const palettes = [
    {
      bg: '#1e1b4b', text: '#c7d2fe', border: 'rgba(99, 102, 241, 0.3)', 
      solidBg: '#4f46e5', solidText: '#ffffff',
      tagBg: isLight ? 'rgba(79, 70, 229, 0.05)' : 'rgba(99, 102, 241, 0.1)',
      tagText: isLight ? '#4f46e5' : '#a5b4fc',
      tagBorder: isLight ? 'rgba(79, 70, 229, 0.15)' : 'rgba(99, 102, 241, 0.2)'
    },
    {
      bg: '#3b0764', text: '#f3e8ff', border: 'rgba(168, 85, 247, 0.3)',
      solidBg: '#8b5cf6', solidText: '#ffffff',
      tagBg: isLight ? 'rgba(139, 92, 246, 0.05)' : 'rgba(168, 85, 247, 0.1)',
      tagText: isLight ? '#8b5cf6' : '#d8b4fe',
      tagBorder: isLight ? 'rgba(139, 92, 246, 0.15)' : 'rgba(168, 85, 247, 0.2)'
    },
    {
      bg: '#0c4a6e', text: '#e0f2fe', border: 'rgba(14, 165, 233, 0.3)',
      solidBg: '#0284c7', solidText: '#ffffff',
      tagBg: isLight ? 'rgba(2, 132, 199, 0.05)' : 'rgba(14, 165, 233, 0.1)',
      tagText: isLight ? '#0284c7' : '#7dd3fc',
      tagBorder: isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(14, 165, 233, 0.2)'
    },
    {
      bg: '#064e3b', text: '#d1fae5', border: 'rgba(16, 185, 129, 0.3)',
      solidBg: '#10b981', solidText: '#ffffff',
      tagBg: isLight ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.1)',
      tagText: isLight ? '#059669' : '#6ee7b7',
      tagBorder: isLight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.2)'
    },
    {
      bg: '#451a03', text: '#fef3c7', border: 'rgba(217, 119, 6, 0.3)',
      solidBg: '#f59e0b', solidText: '#ffffff',
      tagBg: isLight ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.1)',
      tagText: isLight ? '#d97706' : '#fde68a',
      tagBorder: isLight ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.2)'
    },
    {
      bg: '#4c0519', text: '#ffe4e6', border: 'rgba(225, 29, 72, 0.3)',
      solidBg: '#f43f5e', solidText: '#ffffff',
      tagBg: isLight ? 'rgba(244, 63, 94, 0.05)' : 'rgba(244, 63, 94, 0.1)',
      tagText: isLight ? '#e11d48' : '#fda4af',
      tagBorder: isLight ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.2)'
    }
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Updated recently';
  const now = new Date();
  const updated = new Date(dateString);
  const diffMs = now - updated;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Updated just now';
  if (diffMins < 60) return `Updated ${diffMins}m ago`;
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  return `Updated ${diffDays}d ago`;
};

export default function ToolSpaceCard({ space, index, onEditClick }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  const [showDropdown, setShowDropdown] = useState(false);

  const cardBg = isLight ? '#ffffff' : '#111116';
  const cardBorder = isLight ? '#e5e5e5' : 'rgba(255,255,255,0.06)';
  const cardBorderHover = isLight ? '#b2b2b2' : 'rgba(255,255,255,0.18)';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';

  const palette = getSpaceColorPalette(space.name, theme);

  // Auto-detect custom brand icon
  let iconKeyToUse = space.iconKey;
  if (!iconKeyToUse || iconKeyToUse === 'folder' || iconKeyToUse === 'lucide:folder') {
    iconKeyToUse = getIconKeyByName(space.name);
  }
  const hasCustomIcon = iconKeyToUse && iconKeyToUse !== 'folder' && iconKeyToUse !== 'lucide:folder';

  // Apply neutral background for brand icons, and solid theme colors for fallback initials
  const boxBg = hasCustomIcon
    ? (isLight ? '#f1f5f9' : '#1e293b') // Slate-100 / Slate-800
    : palette.solidBg;

  const boxText = hasCustomIcon
    ? (isLight ? '#475569' : '#f8fafc')
    : '#ffffff';

  const initials = space.name ? space.name.substring(0, 2).toLowerCase() : 'sp';

  const metaText = space.meta || 
    `${space.learningsCount || 0} learnings · ${space.snippetsCount || 0} snippets · ${space.docsCount || 0} docs`;

  // Real-time ticking relative time state
  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(space.updatedAt || space.createdAt));

  useEffect(() => {
    setRelativeTime(formatRelativeTime(space.updatedAt || space.createdAt));
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(space.updatedAt || space.createdAt));
    }, 15000); // Update every 15 seconds for snappiness
    return () => clearInterval(interval);
  }, [space.updatedAt, space.createdAt]);

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/spaces/${space._id || space.id}`, {
        isPinned: !space.isPinned
      });
      await queryClient.invalidateQueries({ queryKey: ['spaces'] });
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleDeleteSpace = async (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    if (window.confirm(`Are you sure you want to delete space "${space.name}"? This will permanently delete all contents inside this space.`)) {
      try {
        await api.delete(`/api/spaces/${space._id || space.id}`);
        await queryClient.invalidateQueries({ queryKey: ['spaces'] });
        await queryClient.invalidateQueries({ queryKey: ['history'] });
      } catch (err) {
        console.error('Failed to delete space:', err);
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    if (onEditClick) onEditClick();
  };

  return (
    <motion.div
      onClick={() => navigate(`/spaces/${space._id || space.id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = cardBorderHover;
        e.currentTarget.style.boxShadow = isLight
          ? '0 6px 20px rgba(0,0,0,0.06)'
          : '0 6px 20px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = cardBorder;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header Row: Icon, Title & Stats, Controls */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {/* Hashed colored avatar container */}
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: boxBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'}`,
            flexShrink: 0
          }}>
            {hasCustomIcon ? (
              <SpaceIcon iconKey={iconKeyToUse} size={24} />
            ) : (
              <span style={{ fontSize: '14px', fontWeight: 700, color: boxText, fontFamily: 'var(--font-display)', textTransform: 'lowercase' }}>
                {initials}
              </span>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 700, color: textPrimary,
              fontFamily: 'var(--font-display)', margin: '0 0 3px 0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {space.name}
            </h3>
            <p style={{ fontSize: '12px', color: textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {metaText}
            </p>
          </div>
        </div>

        {/* Right Buttons: Pinned and Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={handleTogglePin}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: space.isPinned ? '#818cf8' : (isLight ? '#999' : '#555'),
              padding: '6px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: space.isPinned ? 'rotate(-45deg)' : 'none',
              transition: 'color 0.2s, transform 0.2s, background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f5f5f5' : 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {space.isPinned ? <RiPushpinFill size={16} /> : <RiPushpinLine size={16} />}
          </button>

          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: isLight ? '#666' : '#999', padding: '6px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f5f5f5' : 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <RiMore2Line size={16} />
          </button>

          {/* Ellipsis Actions Dropdown */}
          {showDropdown && (
            <>
              <div onClick={() => setShowDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
              <div style={{
                position: 'absolute', top: '32px', right: 0,
                background: isLight ? '#ffffff' : '#16161c',
                border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', minWidth: '130px', padding: '4px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 1000,
              }}>
                <button
                  onClick={handleTogglePin}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '8px 10px', border: 'none', background: 'transparent',
                    color: textPrimary, fontSize: '12px', fontWeight: 500,
                    borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-body)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f5f5f5' : 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <RiPushpinLine size={14} style={{ color: textMuted }} />
                  {space.isPinned ? 'Unpin' : 'Pin'}
                </button>

                <button
                  onClick={handleEdit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '8px 10px', border: 'none', background: 'transparent',
                    color: textPrimary, fontSize: '12px', fontWeight: 500,
                    borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-body)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f5f5f5' : 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <RiEditLine size={14} style={{ color: textMuted }} />
                  Edit Space
                </button>

                <div style={{ height: '1px', background: isLight ? '#e5e5e5' : 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                <button
                  onClick={handleDeleteSpace}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '8px 10px', border: 'none', background: 'transparent',
                    color: '#ef4444', fontSize: '12px', fontWeight: 500,
                    borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-body)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <RiDeleteBinLine size={14} />
                  Delete Space
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tags section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {space.tags && space.tags.length > 0 ? space.tags.map(tag => (
          <span key={tag} style={{
            fontSize: '11px', fontWeight: 600,
            padding: '2px 8px', borderRadius: '20px',
            background: palette.tagBg, border: `1px solid ${palette.tagBorder}`,
            color: palette.tagText,
          }}>
            {tag}
          </span>
        )) : (
          <span style={{ fontSize: '11px', color: textMuted, fontStyle: 'italic' }}>
            no tags
          </span>
        )}
      </div>

      {/* Bottom Row: Last Updated & Open Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: textMuted }}>
          <RiTimeLine size={14} />
          <span style={{ fontSize: '12px' }}>
            {relativeTime}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/spaces/${space._id || space.id}`);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px',
            border: `1px solid ${isLight ? 'rgba(79, 70, 229, 0.15)' : 'rgba(129, 140, 248, 0.2)'}`,
            background: isLight ? 'rgba(79, 70, 229, 0.02)' : 'rgba(129, 140, 248, 0.02)',
            color: isLight ? '#4f46e5' : '#818cf8',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isLight ? '#4f46e5' : '#818cf8';
            e.currentTarget.style.borderColor = isLight ? '#4f46e5' : '#818cf8';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isLight ? 'rgba(79, 70, 229, 0.02)' : 'rgba(129, 140, 248, 0.02)';
            e.currentTarget.style.borderColor = isLight ? 'rgba(79, 70, 229, 0.15)' : 'rgba(129, 140, 248, 0.2)';
            e.currentTarget.style.color = isLight ? '#4f46e5' : '#818cf8';
          }}
        >
          <span>Open</span>
          <RiArrowRightLine size={13} />
        </button>
      </div>
    </motion.div>
  );
}
