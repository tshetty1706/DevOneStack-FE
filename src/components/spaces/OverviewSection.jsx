import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RiHome4Line,
  RiStickyNoteLine,
  RiFileTextLine,
  RiLightbulbLine,
  RiCodeSSlashLine,
  RiGitRepositoryLine,
  RiRobot2Line,
  RiFolderLine,
  RiFolderOpenLine,
  RiTimeLine,
  RiLockLine,
  RiGlobalLine,
  RiLinkM,
  RiPriceTag3Line,
  RiCompass3Line,
  RiUser3Line,
  RiCheckLine,
  RiArrowRightSLine,
  RiEditLine,
  RiSparklingLine,
  RiDeleteBinLine,
} from 'react-icons/ri';
import { Tag, Tooltip, Avatar } from 'antd';
import api from '../../api/axios';

const STAT_CONFIG = [
  { key: 'notesCount', section: 'notes', label: 'Notes', icon: RiStickyNoteLine, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'docsCount', section: 'docs', label: 'Docs', icon: RiFileTextLine, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  { key: 'learningsCount', section: 'learnings', label: 'Learnings', icon: RiLightbulbLine, color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  { key: 'snippetsCount', section: 'snippets', label: 'Snippets', icon: RiCodeSSlashLine, color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
  { key: 'reposCount', section: 'repos', label: 'Repos', icon: RiGitRepositoryLine, color: '#fb923c', bg: 'rgba(249,115,22,0.12)' },
  { key: 'promptsCount', section: 'prompts', label: 'Prompts', icon: RiRobot2Line, color: '#f472b6', bg: 'rgba(236,72,153,0.12)' },
];

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getActivityIcon(action) {
  if (!action) return { icon: RiSparklingLine, color: '#818cf8' };
  const lower = action.toLowerCase();

  if (lower.includes('note')) return { icon: RiStickyNoteLine, color: '#10b981' };
  if (lower.includes('doc')) return { icon: RiFileTextLine, color: '#60a5fa' };
  if (lower.includes('snippet')) return { icon: RiCodeSSlashLine, color: '#818cf8' };
  if (lower.includes('learning')) return { icon: RiLightbulbLine, color: '#eab308' };
  if (lower.includes('prompt')) return { icon: RiRobot2Line, color: '#f472b6' };
  if (lower.includes('repo')) return { icon: RiGitRepositoryLine, color: '#fb923c' };
  if (lower.includes('image')) return { icon: RiImageLine, color: '#06b6d4' };
  if (lower.includes('folder')) return { icon: RiFolderLine, color: '#a855f7' };
  if (lower.includes('readme') || lower.includes('space')) return { icon: RiEditLine, color: '#38bdf8' };
  if (lower.includes('delete')) return { icon: RiDeleteBinLine, color: '#ef4444' };

  return { icon: RiSparklingLine, color: '#818cf8' };
}

export default function OverviewSection({ space, isLight, onNavigateSection }) {
  // Fetch Space-specific activity (limit 5 for Overview)
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['history', 'space', space?._id, 5],
    queryFn: async () => {
      if (!space?._id) return [];
      const res = await api.get(`/api/history?spaceId=${space._id}&limit=5`);
      return res.data || [];
    },
    enabled: !!space?._id,
  });

  const cardBg = 'var(--card-bg)';
  const cardBorder = 'var(--card-border)';
  const textColor = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const accent = 'var(--accent-color)';

  const visibilityConfig = {
    private: { label: 'Private', icon: RiLockLine, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
    public: { label: 'Public', icon: RiGlobalLine, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    unlisted: { label: 'Unlisted', icon: RiLinkM, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  };

  const currentVisibility = visibilityConfig[space?.visibility] || visibilityConfig.private;
  const VisibilityIcon = currentVisibility.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Space Header Banner ── */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 'clamp(20px, 3.5vw, 26px)',
                fontWeight: 800,
                color: textColor,
                margin: 0,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-display)',
                wordBreak: 'break-word',
              }}>
                {space?.name || 'Space Overview'}
              </h1>
              
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: currentVisibility.color,
                background: currentVisibility.bg,
                border: `1px solid ${currentVisibility.color}33`,
              }}>
                <VisibilityIcon size={12} />
                <span>{currentVisibility.label}</span>
              </span>
            </div>

            <p style={{
              fontSize: '14px',
              color: textMuted,
              margin: '0 0 12px',
              lineHeight: 1.55,
              maxWidth: '800px',
              wordBreak: 'break-word',
            }}>
              {space?.description || 'Your development workspace in one place.'}
            </p>

            {/* Tags list */}
            {Array.isArray(space?.tags) && space.tags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                <RiPriceTag3Line size={13} style={{ color: textMuted }} />
                {space.tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11.5px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${cardBorder}`,
                      color: textColor,
                      fontWeight: 500,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Owner info & Quick Explorer Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {space?.owner && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${cardBorder}`,
                borderRadius: '10px',
              }}>
                <Avatar
                  size={24}
                  src={space.owner.avatarUrl}
                  icon={!space.owner.avatarUrl && <RiUser3Line />}
                  style={{ background: accent }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>
                  {space.owner.displayName || space.owner.username || 'Owner'}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigateSection('explorer')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                background: accent,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
              }}
            >
              <RiCompass3Line size={16} />
              <span>Browse Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary / Stat Cards Grid ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: textColor,
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Contents
          </h2>
          <span style={{ fontSize: '12px', color: textMuted }}>
            Click a card to open that section
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
          gap: '12px',
          width: '100%',
        }}>
          {STAT_CONFIG.map((stat) => {
            const Icon = stat.icon;
            const count = space?.[stat.key] || 0;

            return (
              <button
                key={stat.key}
                type="button"
                onClick={() => onNavigateSection(stat.section)}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '14px',
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = stat.color;
                  e.currentTarget.style.boxShadow = `0 6px 16px ${stat.color}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = cardBorder;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}>
                    <Icon size={18} />
                  </div>
                  <RiArrowRightSLine size={16} style={{ color: textMuted, opacity: 0.7 }} />
                </div>

                <div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: textColor,
                    lineHeight: 1.1,
                    fontFamily: 'var(--font-display)',
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: textMuted,
                    marginTop: '2px',
                  }}>
                    {stat.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recent Activity Feed ── */}
      <div style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RiTimeLine size={18} style={{ color: accent }} />
            <h2 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: textColor,
              margin: 0,
              letterSpacing: '-0.01em',
            }}>
              Recent Activity
            </h2>
          </div>
          {activities.length > 0 && (
            <span style={{ fontSize: '11.5px', color: textMuted, fontWeight: 500 }}>
              {activities.length} recent update{activities.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {activitiesLoading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: textMuted, fontSize: '13px' }}>
            Loading activity...
          </div>
        ) : activities.length === 0 ? (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: textMuted,
              marginBottom: '4px',
            }}>
              <RiTimeLine size={22} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>
              No activity yet
            </div>
            <div style={{ fontSize: '12.5px', color: textMuted, maxWidth: '320px' }}>
              Changes you make in this Space will appear here.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activities.map((act) => {
              const { icon: ActIcon, color: actColor } = getActivityIcon(act.action);
              const actorName = act.owner?.displayName || act.owner?.username || 'You';
              const timeFormatted = formatRelativeTime(act.createdAt);

              // Interactive click target if metadata points to an item or section
              const targetSection = act.meta?.type ? `${act.meta.type}s` : (act.meta?.folderId ? 'explorer' : null);
              const isClickable = !!(targetSection || act.meta?.folderId || act.meta?.itemId);

              return (
                <div
                  key={act._id}
                  onClick={() => {
                    if (isClickable) {
                      if (act.meta?.type === 'note' && act.meta?.itemId) {
                        onNavigateSection('notes', act.meta.itemId);
                      } else if (act.meta?.folderId) {
                        onNavigateSection('explorer', null, act.meta.folderId);
                      } else if (targetSection) {
                        onNavigateSection(targetSection, act.meta?.itemId);
                      }
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isLight ? '#fbfcfe' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)'}`,
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.borderColor = cardBorder;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.background = isLight ? '#fbfcfe' : 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: `${actColor}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: actColor,
                      flexShrink: 0,
                    }}>
                      <ActIcon size={16} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: textColor,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {act.label || act.action}
                      </div>
                      <div style={{ fontSize: '11px', color: textMuted }}>
                        by {actorName}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '11.5px',
                    color: textMuted,
                    flexShrink: 0,
                    fontWeight: 500,
                  }}>
                    {timeFormatted}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
