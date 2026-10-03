import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Tooltip } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cloneApi } from '../../api/cloneApi';
import {
  RiStarFill,
  RiEyeLine,
  RiGitBranchLine,
  RiExternalLinkLine,
  RiStackLine,
  RiCodeSSlashLine,
  RiDatabase2Line,
  RiServerLine,
  RiTerminalBoxLine,
} from 'react-icons/ri';

const ICONS = [RiStackLine, RiCodeSSlashLine, RiDatabase2Line, RiServerLine, RiTerminalBoxLine];
const ICON_BG_COLORS = [
  'rgba(16, 185, 129, 0.12)', // emerald
  'rgba(99, 102, 241, 0.12)', // indigo
  'rgba(236, 72, 153, 0.12)', // pink
  'rgba(245, 158, 11, 0.12)', // amber
  'rgba(59, 130, 246, 0.12)', // blue
];
const ICON_COLORS = ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#3b82f6'];

function formatMetric(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}

export default function PublicSpaceCard({ space, onCloned, variant = 'attached' }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  const [cloning, setCloning] = useState(false);
  const [cloneProgress, setCloneProgress] = useState(null);

  if (!space) return null;

  const isOwner = user && (user._id === (space.owner?._id || space.owner) || user.id === (space.owner?._id || space.owner));
  const ownerUsername = space.owner?.username || space.ownerUsername || 'creator';

  const hash = (space.name || space.title || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const iconIdx = Math.abs(hash) % ICONS.length;
  const FallbackIcon = ICONS[iconIdx];
  const iconBg = ICON_BG_COLORS[iconIdx];
  const iconColor = ICON_COLORS[iconIdx];

  const handleClone = async (e) => {
    e.stopPropagation();
    if (!user) {
      message.info('Please log in to clone this Space to your workspace.');
      navigate('/login');
      return;
    }

    try {
      setCloning(true);
      setCloneProgress('Cloning...');
      const res = await cloneApi.clonePublicSpace(space._id);
      message.success('Space cloned successfully! Opening your new private copy...');
      if (onCloned) onCloned(res.space);
      navigate(`/u/${encodeURIComponent(user.username || 'user')}/spaces/${res.space._id}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to clone Space. Please try again.';
      message.error(errMsg);
    } finally {
      setCloning(false);
      setCloneProgress(null);
    }
  };

  const handleOpenSpace = () => {
    if (user) {
      navigate(`/u/${encodeURIComponent(user.username || 'user')}/spaces/${space._id}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      onClick={handleOpenSpace}
      style={{
        background: isLight ? '#f8fafc' : '#0e1017',
        border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : 'rgba(99, 102, 241, 0.35)';
        e.currentTarget.style.boxShadow = isLight ? '0 4px 16px rgba(0,0,0,0.05)' : '0 4px 20px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Left Icon / Thumbnail Box */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: space.thumbnail ? 'transparent' : (isLight ? '#ffffff' : iconBg),
          border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
          overflow: 'hidden',
          boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        {space.thumbnail ? (
          <img src={space.thumbnail} alt={space.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <FallbackIcon size={28} />
        )}
      </div>

      {/* Right Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Top Space badge + Owner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isLight ? '#6366f1' : '#818cf8',
                background: isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.14)',
                padding: '1px 7px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              @ Space
            </span>
          </div>

          <span style={{ fontSize: '12px', color: isLight ? '#64748b' : '#94a3b8' }}>
            by @{ownerUsername}
          </span>
        </div>

        {/* Space Title */}
        <h4
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 700,
            color: isLight ? '#0f172a' : '#ffffff',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {space.name || space.title}
        </h4>

        {/* Description */}
        {space.description && (
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: isLight ? '#64748b' : '#94a3b8',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {space.description}
          </p>
        )}

        {/* Tags Row */}
        {Array.isArray(space.tags) && space.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
            {space.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isLight ? '#ffffff' : '#171923',
                  color: isLight ? '#475569' : '#cbd5e1',
                  border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Metrics & Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: `1px solid ${isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)'}`,
            marginTop: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: isLight ? '#64748b' : '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RiStarFill size={13} color="#f59e0b" />
              {formatMetric(space.starsCount || 0)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RiEyeLine size={14} />
              {formatMetric(space.viewsCount || 0)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {space.allowCloning !== false && !isOwner && (
              <button
                type="button"
                disabled={cloning}
                onClick={handleClone}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: isLight ? '#4f46e5' : '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: cloning ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: cloning ? 0.7 : 1,
                }}
              >
                <RiGitBranchLine size={12} />
                {cloning ? (cloneProgress || 'Cloning...') : 'Clone'}
              </button>
            )}

            <span
              style={{
                fontSize: '11.5px',
                color: isLight ? '#4f46e5' : '#818cf8',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              Open <RiExternalLinkLine size={11} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
