import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  RiPushpin2Fill, RiFileCopyLine, RiCheckLine, RiExternalLinkLine,
  RiFileTextLine, RiCodeLine, RiLink, RiFilePdfLine, RiImageLine,
  RiGithubLine, RiGitlabLine, RiRobotLine, RiDiscordLine, RiRedditLine,
  RiSlackLine, RiTwitterLine, RiYoutubeLine, RiMailLine, RiTeamLine, RiEyeLine
} from 'react-icons/ri';
import { SiBitbucket } from 'react-icons/si';
import { useTheme } from '../../context/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Tag, Tooltip, message } from 'antd';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../../api/axios';

const getAge = (dateStr) => {
  if (!dateStr) return 'today';
  const elapsed = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

export default function PinnedBoilerplates() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [copiedId, setCopiedId] = useState(null);
  const [viewingSnippet, setViewingSnippet] = useState(null);
  const [snippetCodeText, setSnippetCodeText] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState(null);

  // Fetch pinned resources across all types
  const { data, isLoading } = useQuery({
    queryKey: ['pinned', 'all'],
    queryFn: () => api.get('/api/dashboard/pinned').then(r => r.data),
  });

  const notes = data?.notes?.map(x => ({ ...x, itemType: 'note' })) || [];
  const snippets = data?.snippets?.map(x => ({ ...x, itemType: 'snippet' })) || [];
  const docs = data?.docs?.map(x => ({ ...x, itemType: 'doc' })) || [];
  const repos = data?.repos?.map(x => ({ ...x, itemType: 'repo' })) || [];
  const prompts = data?.prompts?.map(x => ({ ...x, itemType: 'prompt' })) || [];
  const communities = data?.communities?.map(x => ({ ...x, itemType: 'community' })) || [];

  const pinnedItems = [
    ...notes,
    ...snippets,
    ...docs,
    ...repos,
    ...prompts,
    ...communities,
  ];

  // Colors aligned with dashboard theme
  const bg = 'var(--card-bg)';
  const border = 'var(--card-border)';
  const cardBg = isLight ? '#f9fafb' : '#121214';
  const cardBorder = isLight ? '#ebebeb' : '#1f1f23';
  const codeBg = isLight ? '#f3f4f6' : '#0b0b0d';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const textSub = isLight ? '#9ca3af' : '#4b5563';
  const tagBg = isLight ? '#f3f4f6' : '#1a1a1f';
  const tagBorder = isLight ? '#e5e7eb' : '#27272a';

  const accentColor = isLight ? '#4f46e5' : '#818cf8';
  const accentBg = isLight ? 'rgba(79,70,229,0.06)' : 'rgba(99,102,241,0.09)';
  const accentBorder = isLight ? 'rgba(79,70,229,0.4)' : 'rgba(99,102,241,0.5)';

  const handleCopyPrompt = async (id, body) => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
      message.success('Prompt copied!');
    } catch {
      message.error('Failed to copy prompt');
    }
  };

  const handleCopySnippet = async (id, spaceId) => {
    try {
      const realSpaceId = spaceId?._id || spaceId;
      const { data } = await api.get(`/api/spaces/${realSpaceId}/snippets/${id}/content`);
      await navigator.clipboard.writeText(data.code || '');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
      message.success('Snippet code copied!');
    } catch {
      message.error('Failed to retrieve snippet code');
    }
  };

  const handleViewSnippetCode = async (snippet) => {
    setViewingSnippet(snippet);
    setLoadingCode(true);
    try {
      const realSpaceId = snippet.spaceId?._id || snippet.spaceId;
      const { data } = await api.get(`/api/spaces/${realSpaceId}/snippets/${snippet._id}/content`);
      setSnippetCodeText(data.code || '');
    } catch {
      message.error('Failed to fetch code content');
      setViewingSnippet(null);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleDocOpen = async (doc) => {
    const realSpaceId = doc.spaceId?._id || doc.spaceId;
    if (doc.type === 'url') {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    } else {
      try {
        const { data } = await api.get(`/api/spaces/${realSpaceId}/docs/${doc._id}/signed-url`);
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } catch {
        message.error('Failed to retrieve file URL');
      }
    }
  };

  const handleCardClick = (item) => {
    const realSpaceId = item.spaceId?._id || item.spaceId;
    if (item.itemType === 'note') {
      navigate(`/spaces/${realSpaceId}?section=notes&noteId=${item._id}`);
    } else if (item.itemType === 'snippet') {
      navigate(`/spaces/${realSpaceId}?section=snippets&id=${item._id}`);
    } else if (item.itemType === 'prompt') {
      navigate(`/spaces/${realSpaceId}?section=prompts&id=${item._id}`);
    } else if (item.itemType === 'doc') {
      handleDocOpen(item);
    } else if (item.itemType === 'repo') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.itemType === 'community') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getItemIcon = (item) => {
    switch (item.itemType) {
      case 'note':
        return <RiFileTextLine size={16} style={{ color: '#818cf8' }} />;
      case 'snippet':
        return <RiCodeLine size={16} style={{ color: '#34d399' }} />;
      case 'doc':
        if (item.type === 'pdf') return <RiFilePdfLine size={16} style={{ color: '#f87171' }} />;
        if (item.type === 'image') return <RiImageLine size={16} style={{ color: '#fb7185' }} />;
        return <RiLink size={16} style={{ color: '#60a5fa' }} />;
      case 'repo':
        if (item.platform === 'github') return <RiGithubLine size={16} style={{ color: '#94a3b8' }} />;
        if (item.platform === 'gitlab') return <RiGitlabLine size={16} style={{ color: '#f97316' }} />;
        if (item.platform === 'bitbucket') return <SiBitbucket size={14} style={{ color: '#2563eb' }} />;
        return <RiLink size={16} style={{ color: '#a78bfa' }} />;
      case 'prompt':
        return <RiRobotLine size={16} style={{ color: '#fbbf24' }} />;
      case 'community':
        if (item.platform === 'discord') return <RiDiscordLine size={16} style={{ color: '#5865f2' }} />;
        if (item.platform === 'reddit') return <RiRedditLine size={16} style={{ color: '#ff4500' }} />;
        if (item.platform === 'slack') return <RiSlackLine size={16} style={{ color: '#4a154b' }} />;
        return <RiLink size={16} style={{ color: '#ec4899' }} />;
      default:
        return <RiLink size={16} />;
    }
  };

  const getItemTypeBadge = (item) => {
    switch (item.itemType) {
      case 'note':
        return 'Note';
      case 'snippet':
        return item.language || 'Snippet';
      case 'doc':
        return item.type?.toUpperCase() || 'Doc';
      case 'repo':
        return item.platform?.toUpperCase() || 'Repo';
      case 'prompt':
        return item.model || 'AI Prompt';
      case 'community':
        return item.platform?.toUpperCase() || 'Community';
      default:
        return 'Item';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.02)' : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiPushpin2Fill size={15} style={{ color: accentColor }} />
          <span style={{
            fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: textMuted, fontWeight: 600,
          }}>
            Pinned Items
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 600, padding: '2px 7px',
            borderRadius: '20px', background: tagBg,
            border: `1px solid ${tagBorder}`, color: textMuted, letterSpacing: '0.06em',
          }}>
            {pinnedItems.length} PINNED
          </span>
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${isLight ? '#cccccc' : '#2a2a2a'} transparent`,
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            {[1, 2, 3].map(x => (
              <div key={x} style={{ minWidth: '240px', height: '160px', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '10px', padding: '16px', opacity: 0.6 }} />
            ))}
          </div>
        ) : pinnedItems.length === 0 ? (
          <div style={{ textAlign: 'center', width: '100%', padding: '40px 0', color: textMuted, fontSize: '13px' }}>
            No pinned items yet. Pin docs, notes, snippets, repos, prompts, or communities inside your spaces to see them here!
          </div>
        ) : (
          pinnedItems.map((item, i) => {
            const isCopied = copiedId === item._id;
            const title = item.title || item.name || 'Untitled';
            const spaceName = item.spaceId?.name || 'Space';

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.05, duration: 0.35 }}
                onClick={() => handleCardClick(item)}
                style={{
                  minWidth: '240px',
                  maxWidth: '240px',
                  background: cardBg,
                  border: `1px solid ${isCopied ? accentBorder : cardBorder}`,
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isCopied) e.currentTarget.style.borderColor = accentColor;
                  e.currentTarget.style.boxShadow = isLight 
                    ? '0 6px 16px rgba(0, 0, 0, 0.04)' 
                    : '0 6px 16px rgba(99, 102, 241, 0.08)';
                }}
                onMouseLeave={e => {
                  if (!isCopied) e.currentTarget.style.borderColor = cardBorder;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Top header: Type & Space info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getItemIcon(item)}
                    <span style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: textMuted,
                      fontWeight: 700
                    }}>
                      {getItemTypeBadge(item)}
                    </span>
                  </div>
                  <Tag color="purple" style={{ margin: 0, fontSize: '9px', fontWeight: 600 }}>{spaceName}</Tag>
                </div>

                {/* Body: Title & Caption */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: textPrimary,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {title}
                  </div>
                  {item.caption && (
                    <div style={{
                      fontSize: '11px',
                      color: textMuted,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {item.caption}
                    </div>
                  )}
                  {item.itemType === 'note' && item.preview && (
                    <div style={{
                      fontSize: '11px',
                      color: textMuted,
                      lineHeight: 1.4,
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {item.preview}
                    </div>
                  )}
                  {item.itemType === 'prompt' && item.body && (
                    <div style={{
                      fontSize: '11px',
                      color: textMuted,
                      background: codeBg,
                      borderRadius: '4px',
                      padding: '4px 6px',
                      fontFamily: 'monospace',
                      maxHeight: '44px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {item.body}
                    </div>
                  )}
                </div>

                {/* Footer: Copy / View Code / External Links */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  borderTop: `1px solid ${isLight ? '#f3f4f6' : '#1d1d22'}`,
                  paddingTop: '8px'
                }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {item.itemType === 'prompt' && (
                      <>
                        <button
                          onClick={() => handleCopyPrompt(item._id, item.body)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                            border: `1px solid ${isCopied ? accentBorder : (isLight ? '#e0e0e0' : '#2a2a2a')}`,
                            background: isCopied ? accentBg : 'transparent',
                            color: isCopied ? accentColor : textMuted,
                            fontSize: '11px', fontWeight: 500,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isCopied ? <RiCheckLine size={12} /> : <RiFileCopyLine size={12} />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => setViewingPrompt(item)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                            border: `1px solid ${isLight ? '#e0e0e0' : '#2a2a2a'}`,
                            background: 'transparent',
                            color: textMuted,
                            fontSize: '11px', fontWeight: 500,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = accentColor}
                          onMouseLeave={e => e.currentTarget.style.color = textMuted}
                        >
                          <RiEyeLine size={12} />
                          View
                        </button>
                      </>
                    )}

                    {item.itemType === 'snippet' && (
                      <>
                        <button
                          onClick={() => handleCopySnippet(item._id, item.spaceId)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                            border: `1px solid ${isCopied ? accentBorder : (isLight ? '#e0e0e0' : '#2a2a2a')}`,
                            background: isCopied ? accentBg : 'transparent',
                            color: isCopied ? accentColor : textMuted,
                            fontSize: '11px', fontWeight: 500,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isCopied ? <RiCheckLine size={12} /> : <RiFileCopyLine size={12} />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleViewSnippetCode(item)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                            border: `1px solid ${isLight ? '#e0e0e0' : '#2a2a2a'}`,
                            background: 'transparent',
                            color: textMuted,
                            fontSize: '11px', fontWeight: 500,
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = accentColor}
                          onMouseLeave={e => e.currentTarget.style.color = textMuted}
                        >
                          <RiEyeLine size={12} />
                          Code
                        </button>
                      </>
                    )}

                    {(item.itemType === 'doc' || item.itemType === 'repo' || item.itemType === 'community') && (
                      <button
                        onClick={() => handleCardClick(item)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                          border: `1px solid ${isLight ? '#e0e0e0' : '#2a2a2a'}`,
                          background: 'transparent',
                          color: textMuted,
                          fontSize: '11px', fontWeight: 500,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = accentColor}
                        onMouseLeave={e => e.currentTarget.style.color = textMuted}
                      >
                        <RiExternalLinkLine size={12} />
                        Open
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: textSub }}>{getAge(item.updatedAt || item.createdAt)}</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Snippet Code Viewer Modal */}
      <Modal
        title={`Snippet Code: ${viewingSnippet?.name}`}
        open={!!viewingSnippet}
        onCancel={() => { setViewingSnippet(null); setSnippetCodeText(''); }}
        footer={[
          <Button key="close" onClick={() => { setViewingSnippet(null); setSnippetCodeText(''); }}>
            Close
          </Button>
        ]}
        width={720}
      >
        <div style={{ borderRadius: '8px', overflow: 'hidden', fontSize: '12px', marginTop: '16px' }}>
          <SyntaxHighlighter
            language={viewingSnippet?.language || 'javascript'}
            style={isLight ? coy : vscDarkPlus}
            customStyle={{ margin: 0, padding: '12px' }}
          >
            {loadingCode ? 'Loading code content...' : snippetCodeText || 'No code preview available'}
          </SyntaxHighlighter>
        </div>
      </Modal>

      {/* Prompt Viewer Modal */}
      <Modal
        title={`View AI Prompt: ${viewingPrompt?.title}`}
        open={!!viewingPrompt}
        onCancel={() => setViewingPrompt(null)}
        footer={[
          <Button key="close" onClick={() => setViewingPrompt(null)}>
            Close
          </Button>
        ]}
        width={650}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Model</span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#111' : '#fff', marginTop: '4px' }}>
              {viewingPrompt?.model || 'AI Model'}
            </div>
          </div>
          {viewingPrompt?.caption && (
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Description</span>
              <p style={{ fontSize: '13px', color: isLight ? '#333' : '#ccc', margin: '4px 0 0', lineHeight: 1.5 }}>
                {viewingPrompt.caption}
              </p>
            </div>
          )}
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Prompt Body</span>
            <div style={{
              background: isLight ? '#f3f4f6' : '#18181b',
              border: `1px solid ${isLight ? '#e5e7eb' : '#27272a'}`,
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: isLight ? '#111' : '#e4e4e7',
              whiteSpace: 'pre-wrap',
              maxHeight: '350px',
              overflowY: 'auto',
              marginTop: '4px',
              lineHeight: 1.5
            }}>
              {viewingPrompt?.body}
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
