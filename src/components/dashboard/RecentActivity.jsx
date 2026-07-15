import React from 'react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { RiHistoryLine, RiSpeedLine, RiTerminalBoxLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';

const ACTION_ICON = {
  created_space: <RiTerminalBoxLine size={16} />,
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

  const textMuted = isLight ? '#666666' : '#666666';
  const textPrimary = isLight ? '#333333' : '#B2B2B2';
  const emptyBg = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)';
  const emptyBorder = isLight ? '#e5e5e5' : '#1a1a1a';
  const cardBg = isLight ? '#ffffff' : '#111111';
  const cardBorder = isLight ? '#e5e5e5' : '#1e1e1e';
  const accentColor = isLight ? '#4f46e5' : '#6366f1';

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <p style={{
          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
          color: textMuted, fontWeight: 600, margin: 0,
        }}>
          Recent activity
        </p>
        <span style={{
          fontSize: '10px', fontWeight: 600, padding: '2px 7px',
          borderRadius: '20px', letterSpacing: '0.06em', textTransform: 'uppercase',
          background: isLight ? '#f0f0f0' : '#1a1a1a',
          border: `1px solid ${isLight ? '#e5e5e5' : '#222222'}`,
          color: textMuted,
        }}>
          Live
        </span>
      </div>

      {isLoading ? (
        <div style={{ color: textMuted, fontSize: '13px', padding: '12px 0' }}>Loading activity...</div>
      ) : history.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            border: `2px dashed ${emptyBorder}`,
            borderRadius: '14px',
            background: emptyBg,
            padding: '56px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '12px',
          }}
        >
          <RiHistoryLine size={52} style={{ color: isLight ? '#B2B2B2' : '#333333' }} />
          <div>
            <p style={{
              fontSize: '15px', fontWeight: 600, color: textPrimary,
              margin: '0 0 6px', fontFamily: 'var(--font-display)',
            }}>
              No activity yet
            </p>
            <p style={{
              fontSize: '13px', color: textMuted, maxWidth: '360px',
              lineHeight: 1.55, margin: 0,
            }}>
              Start adding spaces, notes, and resources — your activity will show up here.
            </p>
          </div>
        </motion.div>
      ) : (
        /* Activity list */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {(history || []).slice(0, 5).map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px',
                background: cardBg, border: `1px solid ${cardBorder}`,
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accentColor,
              }}>
                {ACTION_ICON[item.action] || <RiSpeedLine size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: textPrimary }}>
                  {item.label}
                </p>
                {item.meta?.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {item.meta.tags.map(t => (
                      <span key={t} style={{
                        fontSize: '10px', padding: '1px 7px', borderRadius: '20px',
                        background: isLight ? '#f0f0f0' : '#1a1a1a',
                        color: textMuted, border: `1px solid ${emptyBorder}`
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '11px', color: textMuted, flexShrink: 0 }}>
                {timeAgo(item.createdAt)}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
