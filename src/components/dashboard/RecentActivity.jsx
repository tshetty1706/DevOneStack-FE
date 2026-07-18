import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RiHistoryLine, RiSpeedLine, RiTerminalBoxLine, RiFileTextLine, RiCodeSSlashLine, RiPriceTag3Line } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';

const ACTION_ICON = {
  created_space: <RiTerminalBoxLine size={15} />,
  created_note: <RiFileTextLine size={15} />,
  created_snippet: <RiCodeSSlashLine size={15} />,
  created_doc: <RiFileTextLine size={15} />,
  created_repo: <RiCodeSSlashLine size={15} />,
  created_prompt: <RiSpeedLine size={15} />,
  created_community: <RiSpeedLine size={15} />,
  created_tag: <RiPriceTag3Line size={15} />,
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RecentActivity() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const { data } = await api.get('/api/history');
      return data.slice(0, 5);
    },
    staleTime: 1000 * 30, // refetch every 30 s
  });

  const textMuted = 'var(--text-secondary)';
  const textPrimary = 'var(--text-color)';
  const border = 'var(--card-border)';
  const cardBg = 'var(--card-bg)';
  const accentColor = isLight ? '#4f46e5' : '#6366f1';

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: textPrimary, margin: 0 }}>
          Recent Activity
        </h3>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ color: textMuted, fontSize: '13px', padding: '12px 0' }}>Loading activity...</div>
      ) : history.length === 0 ? (
        <div style={{ color: textMuted, fontSize: '13px', padding: '24px 0', textAlign: 'center' }}>
          No activity yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((item) => (
            <div
              key={item._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                transition: 'background 0.2s',
                minWidth: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Left icon */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                background: isLight ? 'rgba(79,70,229,0.06)' : 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accentColor,
              }}>
                {ACTION_ICON[item.action] || <RiHistoryLine size={14} />}
              </div>

              {/* Text label */}
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                color: textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}>
                {item.label}
              </span>

              {/* Right: time */}
              <span style={{ fontSize: '11px', color: textMuted, flexShrink: 0, marginLeft: '8px' }}>
                {timeAgo(item.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
