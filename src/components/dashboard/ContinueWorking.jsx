import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSpaces } from '../../hooks/useSpaces';
import SpaceIcon from '../spaces/SpaceIcon';
import { RiArrowRightLine, RiHistoryLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} min ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
}

export default function ContinueWorking() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { data: activeSpaces = [], isLoading } = useSpaces();
  const isLight = theme === 'light';

  const textMuted = 'var(--text-secondary)';

  const displayedSpaces = useMemo(() => {
    if (isLoading || !activeSpaces.length) return [];
    if (!user?._id) return activeSpaces.slice(0, 3); // simple fallback

    try {
      const key = `dos_recent_spaces_${user._id}`;
      const recentVisits = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Map and filter active spaces based on visits
      const mapped = recentVisits
        .map(visit => {
          const matchedSpace = activeSpaces.find(s => s._id === visit._id);
          if (!matchedSpace) return null;
          return {
            ...matchedSpace,
            openedAt: visit.openedAt,
          };
        })
        .filter(Boolean);

      // If we have fewer than 3 recent spaces, fill up with other active spaces sorted by updatedAt descending
      if (mapped.length < 3) {
        const remaining = activeSpaces
          .filter(s => !mapped.some(m => m._id === s._id))
          .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        
        const filler = remaining.slice(0, 3 - mapped.length);
        return [...mapped, ...filler].slice(0, 3);
      }

      return mapped.slice(0, 3);
    } catch (err) {
      console.error('Error parsing recent spaces:', err);
      return activeSpaces.slice(0, 3);
    }
  }, [activeSpaces, user, isLoading]);

  if (isLoading) {
    return null; 
  }

  if (!displayedSpaces.length) {
    return null; 
  }

  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      <h2 style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: textMuted,
        fontWeight: 600,
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <RiHistoryLine size={13} style={{ color: textMuted }} /> Continue Where You Left Off
      </h2>

      <div className="continue-card-container">
        {displayedSpaces.map((space) => {
          const detailText = space.openedAt 
            ? `Last opened • ${timeAgo(space.openedAt)}`
            : (space.snippetsCount > 0 && space.updatedAt)
              ? `Added ${space.snippetsCount} snippet${space.snippetsCount === 1 ? '' : 's'} recently`
              : space.updatedAt 
                ? `Last edited • ${timeAgo(space.updatedAt)}` 
                : 'Active workspace';

          return (
            <div 
              key={space._id} 
              className="dashboard-continue-card"
              onClick={() => navigate(`/spaces/${space._id}`)}
            >
              {/* Header: Icon Box + Space Name / Metadata */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                {/* Square Icon Container */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: isLight ? '#f3f4f6' : '#16161c',
                  border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <SpaceIcon iconKey={space.iconKey || space.icon} size={20} />
                </div>

                {/* Text: Name and subtext */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                  <span style={{
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: 'var(--text-color)',
                    fontFamily: 'var(--font-display)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {space.name}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: textMuted,
                  }}>
                    {detailText}
                  </span>
                </div>
              </div>

              {/* Divider Line */}
              <div style={{
                height: '1px',
                background: isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)',
                margin: '14px 0 10px 0',
                width: '100%',
              }} />

              {/* Action */}
              <div className="continue-link">
                Continue <RiArrowRightLine size={13} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
