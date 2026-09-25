import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import api from '../../api/axios';
import SpaceIcon from '../spaces/SpaceIcon';
import { getIconKeyByName } from '../../utils/iconMapping';
import { resolveThumbnail, getDefaultThumbnail, getToolById, findToolByKeyword } from '../../constants/tools';
import {
  RiLockLine,
  RiGlobalLine,
  RiLinkM,
  RiStarLine,
  RiStarFill,
  RiMoreFill,
  RiEyeLine,
  RiShareLine,
  RiTeamLine,
  RiPushpinLine,
  RiPushpinFill,
  RiEditLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiExternalLinkLine
} from 'react-icons/ri';

/**
 * Format numbers cleanly (e.g., 1200 -> 1.2K, 24000 -> 24K)
 */
const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};

export default function ToolSpaceCard({
  space,
  index = 0,
  onEditClick,
  isPreview = false,
  customValues = null
}) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  // Merge custom values for live preview if provided
  const data = customValues ? { ...space, ...customValues } : space || {};

  const spaceId = data._id || data.id;
  const name = data.name || 'Untitled Space';
  const description = data.description || '';
  const toolName = data.tool || '';
  const visibility = data.visibility || 'private';
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const isPinned = Boolean(data.isPinned);

  // Statistics
  const viewsCount = data.viewsCount || 0;
  const sharesCount = data.sharesCount || 0;
  const contributorsCount = data.contributorsCount || 1;

  // Star status
  const currentUserId = user?._id || user?.id;
  const isInitiallyStarred = Boolean(
    data.starredBy && currentUserId &&
    data.starredBy.some(id => (typeof id === 'object' ? id._id || id.id : id)?.toString() === currentUserId.toString())
  );

  const [isStarred, setIsStarred] = useState(isInitiallyStarred);
  const [starsCount, setStarsCount] = useState(data.starsCount || 0);
  const [starLoading, setStarLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setIsStarred(isInitiallyStarred);
    setStarsCount(data.starsCount || 0);
  }, [data.starredBy, data.starsCount, isInitiallyStarred]);

  // Resolve Thumbnail Image
  const resolvedThumb = resolveThumbnail(data.thumbnail || toolName || name, theme);
  const finalThumbnail = imgError ? getDefaultThumbnail(theme) : resolvedThumb;

  // Auto-detect icon
  let iconKeyToUse = data.iconKey;
  if (!iconKeyToUse || iconKeyToUse === 'folder' || iconKeyToUse === 'lucide:folder') {
    const matchedTool = getToolById(toolName) || findToolByKeyword(toolName || name);
    iconKeyToUse = matchedTool?.iconKey || getIconKeyByName(toolName || name);
  }

  // Card theme styling tokens
  const cardBg = isLight ? '#ffffff' : '#0d0d12';
  const cardBorder = isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.07)';
  const cardHoverBorder = isLight ? '#c7d2fe' : 'rgba(99, 102, 241, 0.4)';
  const textPrimary = isLight ? '#111827' : '#f3f4f6';
  const textSecondary = isLight ? '#64748b' : '#94a3b8';

  // Visibility Badge Config
  const visibilityConfig = {
    public: {
      label: 'Public',
      icon: RiGlobalLine,
      color: isLight ? '#4f46e5' : '#818cf8',
      bg: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.14)',
      border: isLight ? 'rgba(79, 70, 229, 0.2)' : 'rgba(99, 102, 241, 0.25)',
    },
    private: {
      label: 'Private',
      icon: RiLockLine,
      color: isLight ? '#059669' : '#34d399',
      bg: isLight ? 'rgba(5, 150, 105, 0.08)' : 'rgba(52, 211, 153, 0.14)',
      border: isLight ? 'rgba(5, 150, 105, 0.2)' : 'rgba(52, 211, 153, 0.25)',
    },
    unlisted: {
      label: 'Unlisted',
      icon: RiLinkM,
      color: isLight ? '#d97706' : '#fbbf24',
      bg: isLight ? 'rgba(217, 119, 6, 0.08)' : 'rgba(251, 191, 36, 0.14)',
      border: isLight ? 'rgba(217, 119, 6, 0.2)' : 'rgba(251, 191, 36, 0.25)',
    },
  }[visibility] || {
    label: 'Private',
    icon: RiLockLine,
    color: isLight ? '#059669' : '#34d399',
    bg: isLight ? 'rgba(5, 150, 105, 0.08)' : 'rgba(52, 211, 153, 0.14)',
    border: isLight ? 'rgba(5, 150, 105, 0.2)' : 'rgba(52, 211, 153, 0.25)',
  };

  const VisibilityIcon = visibilityConfig.icon;

  // Star Click Handler with optimistic update
  const handleToggleStar = async (e) => {
    e.stopPropagation();
    if (isPreview || !spaceId || starLoading) return;

    const previousStarred = isStarred;
    const previousCount = starsCount;

    // Optimistic UI update
    setIsStarred(!previousStarred);
    setStarsCount(previousStarred ? Math.max(0, previousCount - 1) : previousCount + 1);
    setStarLoading(true);

    try {
      await api.post(`/api/spaces/${spaceId}/star`);
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    } catch (err) {
      // Rollback on error
      setIsStarred(previousStarred);
      setStarsCount(previousCount);
      message.error(err?.response?.data?.error || 'Failed to update star');
    } finally {
      setStarLoading(false);
    }
  };

  // Toggle Pin Handler
  const handleTogglePin = async (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    if (isPreview || !spaceId) return;

    try {
      await api.patch(`/api/spaces/${spaceId}`, {
        isPinned: !isPinned,
      });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      message.success(isPinned ? 'Space unpinned' : 'Space pinned');
    } catch (err) {
      message.error(err?.response?.data?.error || 'Failed to update pin');
    }
  };

  // Delete Space Handler
  const handleDeleteSpace = async (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    if (isPreview || !spaceId) return;

    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/spaces/${spaceId}`);
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
        message.success('Space deleted successfully');
      } catch (err) {
        message.error(err?.response?.data?.error || 'Failed to delete space');
      }
    }
  };

  // Copy Link Handler
  const handleCopyLink = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    const url = `${window.location.origin}/u/${encodeURIComponent(user?.username || 'user')}/spaces/${spaceId}`;
    navigator.clipboard.writeText(url);
    message.success('Space link copied to clipboard!');
  };

  // Open Space Navigation
  const handleCardClick = () => {
    if (isPreview || !spaceId) return;
    navigate(`/u/${encodeURIComponent(user?.username || 'user')}/spaces/${spaceId}`);
  };

  // Visible tags slice (display up to 3, with +N count badge for remainder)
  const maxVisibleTags = 3;
  const visibleTags = tags.slice(0, maxVisibleTags);
  const remainingTagsCount = Math.max(0, tags.length - maxVisibleTags);

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isPreview ? {} : { y: -4 }}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: isPreview ? 'default' : 'pointer',
        boxShadow: isLight
          ? '0 2px 8px rgba(0, 0, 0, 0.03)'
          : '0 4px 20px rgba(0, 0, 0, 0.35)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
        width: '100%',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => {
        if (!isPreview) {
          e.currentTarget.style.borderColor = cardHoverBorder;
          e.currentTarget.style.boxShadow = isLight
            ? '0 8px 24px rgba(79, 70, 229, 0.08)'
            : '0 8px 30px rgba(99, 102, 241, 0.15)';
        }
      }}
      onMouseLeave={e => {
        if (!isPreview) {
          e.currentTarget.style.borderColor = cardBorder;
          e.currentTarget.style.boxShadow = isLight
            ? '0 2px 8px rgba(0, 0, 0, 0.03)'
            : '0 4px 20px rgba(0, 0, 0, 0.35)';
        }
      }}
    >
      {/* Full-width Top Banner Section with Edge-to-Edge Fitting */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9.2',
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px',
          overflow: 'hidden',
          position: 'relative',
          background: isLight ? '#f1f5f9' : '#07070b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={finalThumbnail}
          alt={`${name} thumbnail`}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'transform 0.35s ease',
          }}
          onMouseEnter={e => {
            if (!isPreview) e.currentTarget.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={e => {
            if (!isPreview) e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {/* Subtle gradient vignette at bottom of banner to blend with card body */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '24px',
            background: `linear-gradient(to bottom, transparent, ${cardBg})`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Top Header Row Overlaid on Top of Banner: Visibility Badge, Star & More Menu */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {/* Visibility Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            color: visibilityConfig.color,
            background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(10, 10, 16, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: `1px solid ${visibilityConfig.border}`,
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.01em',
            textTransform: 'capitalize',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            pointerEvents: 'auto',
          }}
        >
          <VisibilityIcon size={12} />
          <span>{visibilityConfig.label}</span>
        </div>

        {/* Right Actions: Star Button + More Menu */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', zIndex: 60, pointerEvents: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Star Button */}
          <button
            type="button"
            onClick={handleToggleStar}
            disabled={isPreview}
            title={isStarred ? 'Unstar Space' : 'Star Space'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
              background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(10, 10, 16, 0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: isStarred ? '#eab308' : (isLight ? '#6b7280' : '#94a3b8'),
              cursor: isPreview ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
            onMouseEnter={e => {
              if (!isPreview && !isStarred) {
                e.currentTarget.style.color = '#eab308';
                e.currentTarget.style.background = isLight ? '#ffffff' : '#1e1e28';
              }
            }}
            onMouseLeave={e => {
              if (!isPreview && !isStarred) {
                e.currentTarget.style.color = isLight ? '#6b7280' : '#94a3b8';
                e.currentTarget.style.background = isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(10, 10, 16, 0.88)';
              }
            }}
          >
            {isStarred ? <RiStarFill size={16} /> : <RiStarLine size={16} />}
          </button>

          {/* More Options Dropdown */}
          {!isPreview && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowDropdown(v => !v)}
                title="More options"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
                  background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(10, 10, 16, 0.88)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: isLight ? '#4b5563' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }}
                onMouseEnter={e => {
                  if (!showDropdown) {
                    e.currentTarget.style.background = isLight ? '#ffffff' : '#1e1e28';
                    e.currentTarget.style.color = textPrimary;
                  }
                }}
                onMouseLeave={e => {
                  if (!showDropdown) {
                    e.currentTarget.style.background = isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(10, 10, 16, 0.88)';
                    e.currentTarget.style.color = isLight ? '#4b5563' : '#94a3b8';
                  }
                }}
              >
                <RiMoreFill size={18} />
              </button>

              {showDropdown && (
                <>
                  <div
                    onClick={() => setShowDropdown(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '36px',
                      right: 0,
                      background: isLight ? '#ffffff' : '#14141c',
                      border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: '10px',
                      minWidth: '150px',
                      padding: '5px',
                      boxShadow: isLight
                        ? '0 12px 30px rgba(0,0,0,0.15)'
                        : '0 16px 40px rgba(0,0,0,0.8)',
                      zIndex: 1000,
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleCardClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        border: 'none',
                        background: 'transparent',
                        color: textPrimary,
                        fontSize: '12.5px',
                        fontWeight: 500,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <RiExternalLinkLine size={14} style={{ color: textSecondary }} />
                      Open Space
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        border: 'none',
                        background: 'transparent',
                        color: textPrimary,
                        fontSize: '12.5px',
                        fontWeight: 500,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <RiFileCopyLine size={14} style={{ color: textSecondary }} />
                      Copy Link
                    </button>

                    <button
                      type="button"
                      onClick={handleTogglePin}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        border: 'none',
                        background: 'transparent',
                        color: textPrimary,
                        fontSize: '12.5px',
                        fontWeight: 500,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {isPinned ? (
                        <>
                          <RiPushpinFill size={14} style={{ color: 'var(--accent-color)' }} />
                          Unpin Space
                        </>
                      ) : (
                        <>
                          <RiPushpinLine size={14} style={{ color: textSecondary }} />
                          Pin Space
                        </>
                      )}
                    </button>

                    {onEditClick && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(false);
                          onEditClick();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 10px',
                          border: 'none',
                          background: 'transparent',
                          color: textPrimary,
                          fontSize: '12.5px',
                          fontWeight: 500,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--font-body)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <RiEditLine size={14} style={{ color: textSecondary }} />
                        Edit Space
                      </button>
                    )}

                    <div style={{ height: '1px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={handleDeleteSpace}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(239, 68, 68, 0.06)' : 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <RiDeleteBinLine size={14} />
                      Delete Space
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Body Section: Icon + Title, Description, Statistics, Tags */}
      <div
        style={{
          padding: '14px 16px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
        }}
      >
        {/* Space Identity Row: Tool Icon + Space Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Rounded square tool icon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isLight ? '#f1f5f9' : '#1e1e28',
              border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SpaceIcon iconKey={iconKeyToUse} size={18} />
          </div>

          {/* Space Title */}
          <h3
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: textPrimary,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {name}
          </h3>
        </div>

        {/* Description */}
        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            color: textSecondary,
            lineHeight: 1.45,
            fontFamily: 'var(--font-body)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '36px',
          }}
        >
          {description || (toolName ? `Knowledge, snippets and documentation for ${toolName}.` : 'Organize notes, code snippets and resources.')}
        </p>

        {/* Statistics Row: Stars, Views, Shares, Contributors */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '12px',
            color: isLight ? '#64748b' : '#94a3b8',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            paddingTop: '2px',
            flexWrap: 'wrap',
          }}
        >
          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RiStarFill size={13} style={{ color: '#eab308' }} />
            <span>{formatNumber(starsCount)}</span>
          </div>

          {/* Views */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RiEyeLine size={14} style={{ color: isLight ? '#64748b' : '#94a3b8' }} />
            <span>{formatNumber(viewsCount)}</span>
          </div>

          {/* Shares */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RiShareLine size={13} style={{ color: isLight ? '#64748b' : '#94a3b8' }} />
            <span>{formatNumber(sharesCount)}</span>
          </div>

          {/* Contributors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RiTeamLine size={14} style={{ color: isLight ? '#64748b' : '#94a3b8' }} />
            <span>{formatNumber(contributorsCount)}</span>
          </div>
        </div>

        {/* Tags Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: 'auto',
            paddingTop: '4px',
          }}
        >
          {visibleTags.length > 0 ? (
            <>
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)'}`,
                    color: isLight ? '#475569' : '#cbd5e1',
                    fontFamily: 'var(--font-body)',
                    whiteSpace: 'nowrap',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tag}
                </span>
              ))}
              {remainingTagsCount > 0 && (
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.12)',
                    border: `1px solid ${isLight ? 'rgba(79, 70, 229, 0.2)' : 'rgba(99, 102, 241, 0.25)'}`,
                    color: 'var(--accent-color)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  +{remainingTagsCount}
                </span>
              )}
            </>
          ) : (
            <span
              style={{
                fontSize: '11px',
                fontStyle: 'italic',
                color: isLight ? '#94a3b8' : '#64748b',
              }}
            >
              No tags
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
