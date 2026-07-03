import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from 'antd';
import { RiInboxLine, RiLinkM, RiCloseLine, RiCornerDownLeftLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

function detectType(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return 'YouTube';
  if (/github\.com/.test(url)) return 'GitHub';
  if (/notion\.so/.test(url)) return 'Notion';
  return 'Link';
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export default function QuickInbox() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const bg = 'var(--card-bg)';
  const border = 'var(--card-border)';
  const hoverBorder = 'var(--card-hover-border)';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const textSub = isLight ? '#9ca3af' : '#4b5563';
  const inputBg = isLight ? '#f3f4f6' : '#121214';
  const dividerColor = isLight ? '#f3f4f6' : '#18181b';
  const tagBg = isLight ? '#f3f4f6' : '#1a1a1f';
  const tagBorder = isLight ? '#e5e7eb' : '#27272a';
  const focusBorder = isLight ? '#0a0a0a' : '#ffffff';

  const [url, setUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  // Queries & Mutations
  const { data: items = [] } = useQuery({
    queryKey: ['inbox'],
    queryFn: () => api.get('/api/inbox').then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (newVal) => api.post('/api/inbox', newVal).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }) => api.put(`/api/inbox/${id}`, { title }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/inbox/${id}`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    saveMutation.mutate({
      url: trimmed,
      type: detectType(trimmed),
    });
    setUrl('');
  };

  const handleDelete = (id) => deleteMutation.mutate(id);

  const handleTitleChange = (id, val) => {
    updateMutation.mutate({ id, title: val });
  };

  const ghostBtn = {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '3px 8px', borderRadius: '6px', cursor: 'pointer',
    border: `1px solid ${border}`, background: 'transparent',
    color: textMuted, fontSize: '12px', fontFamily: 'var(--font-body)',
    transition: 'border-color 0.15s ease, color 0.15s ease',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.02)' : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = hoverBorder;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isLight 
          ? '0 12px 30px rgba(0, 0, 0, 0.04)' 
          : '0 12px 30px rgba(99, 102, 241, 0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = border;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isLight ? '0 4px 20px rgba(0, 0, 0, 0.02)' : 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RiInboxLine size={14} style={{ color: textMuted }} />
          <span style={{
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
            color: textMuted, fontWeight: 600,
          }}>Quick Inbox</span>
        </div>
        {items.length > 0 && (
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
            background: tagBg, border: `1px solid ${tagBorder}`,
            color: textMuted, fontWeight: 500,
          }}>
            {items.length} unsorted
          </span>
        )}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <Input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onPressEnter={handleSave}
          placeholder="Paste a URL, YouTube, Notion, GitHub link..."
          prefix={<RiLinkM size={13} style={{ color: textMuted }} />}
          style={{
            flex: 1, background: inputBg,
            borderColor: border, color: textPrimary, fontSize: '13px',
          }}
          styles={{ input: { color: textPrimary } }}
        />
        <button
          onClick={handleSave}
          style={{
            ...ghostBtn,
            borderColor: isLight ? '#e0e0e0' : '#333333',
            padding: '0 12px', height: '32px',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.color = textPrimary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = isLight ? '#e0e0e0' : '#333333'; e.currentTarget.style.color = textMuted; }}
        >
          <RiCornerDownLeftLine size={13} /> Save
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '28px 0', gap: '8px',
        }}>
          <RiInboxLine size={32} style={{ color: textSub }} />
          <span style={{ fontSize: '13px', color: textMuted }}>
            Nothing here yet — paste a link above
          </span>
        </div>
      ) : (
        <div style={{
          maxHeight: '180px', overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${isLight ? '#cccccc' : '#333333'} transparent`,
        }}>
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 0', borderBottom: `1px solid ${dividerColor}`,
                }}>
                  {/* Bullet */}
                  <span style={{ color: textSub, fontSize: '12px', flexShrink: 0 }}>▸</span>

                  {/* URL + title */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <a
                        href={/^https?:\/\//.test(item.url) ? item.url : `https://${item.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px', color: textPrimary,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '160px', textDecoration: 'none', display: 'block',
                          transition: 'opacity 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        {truncate(item.url, 35)}
                      </a>
                      <span style={{
                        fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                        background: tagBg, border: `1px solid ${tagBorder}`,
                        color: textMuted, flexShrink: 0,
                      }}>
                        {item.type}
                      </span>
                    </div>
                    {editingId === item._id ? (
                      <input
                        autoFocus
                        defaultValue={item.title}
                        onBlur={e => { handleTitleChange(item._id, e.target.value); setEditingId(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                        style={{
                          fontSize: '11px', color: textMuted, background: 'transparent',
                          border: 'none', outline: 'none', width: '100%',
                          fontFamily: 'var(--font-body)', marginTop: '2px',
                          borderBottom: `1px solid ${border}`,
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => setEditingId(item._id)}
                        style={{
                          fontSize: '11px', color: item.title ? textMuted : textSub,
                          cursor: 'text', display: 'block', marginTop: '2px',
                        }}
                      >
                        {item.title || 'Add a title…'}
                      </span>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      color: textSub, fontSize: '13px',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = textPrimary}
                    onMouseLeave={e => e.currentTarget.style.color = textSub}
                  >
                    <RiCloseLine />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom CTA */}
      {items.length > 0 && (
        <div style={{ fontSize: '12px', color: textSub }}>
          Assign to a stack →
        </div>
      )}
    </motion.div>
  );
}
