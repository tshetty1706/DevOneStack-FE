import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RiSearchLine,
  RiStickyNoteLine,
  RiFileTextLine,
  RiCodeSSlashLine,
  RiLightbulbLine,
  RiRobot2Line,
  RiGitRepositoryLine,
  RiTeamLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiCloseLine,
  RiFileCopyLine,
  RiCheckLine,
  RiPushpinFill,
  RiShareForwardLine,
  RiEyeLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import { message, Tooltip } from 'antd';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { usePinnedResources } from '../../hooks/useDashboard';
import SpaceIcon from '../spaces/SpaceIcon';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { resolveFileUrl, isPdfFile, isImageFile } from '../../utils/fileResolver';

const TYPE_META = {
  note: { label: 'Note', icon: RiStickyNoteLine, color: '#10b981', section: 'notes', bg: 'rgba(16,185,129,0.12)' },
  doc: { label: 'Doc', icon: RiFileTextLine, color: '#60a5fa', section: 'docs', bg: 'rgba(59,130,246,0.12)' },
  image: { label: 'Image', icon: RiFileTextLine, color: '#06b6d4', section: 'docs', bg: 'rgba(6,182,212,0.12)' },
  snippet: { label: 'Snippet', icon: RiCodeSSlashLine, color: '#818cf8', section: 'snippets', bg: 'rgba(99,102,241,0.12)' },
  learning: { label: 'Learning', icon: RiLightbulbLine, color: '#eab308', section: 'learnings', bg: 'rgba(234,179,8,0.12)' },
  prompt: { label: 'Prompt', icon: RiRobot2Line, color: '#f472b6', section: 'prompts', bg: 'rgba(236,72,153,0.12)' },
  repo: { label: 'Repo', icon: RiGitRepositoryLine, color: '#fb923c', section: 'repos', bg: 'rgba(249,115,22,0.12)' },
  community: { label: 'Community', icon: RiTeamLine, color: '#a855f7', section: 'communities', bg: 'rgba(168,85,247,0.12)' },
};

export default function PinnedResources() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewerMaximized, setIsViewerMaximized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch pinned resources across all types for the current user
  const { data, isLoading } = usePinnedResources();

  // Consolidate all pinned items
  const allPinnedItems = useMemo(() => {
    if (!data) return [];
    const directItems = data.items || [];
    if (directItems.length > 0) return directItems;

    const notes = data.notes?.map(x => ({ ...x, type: 'note' })) || [];
    const learnings = data.learnings?.map(x => ({ ...x, type: 'learning' })) || [];
    const snippets = data.snippets?.map(x => ({ ...x, type: 'snippet' })) || [];
    const docs = data.docs?.map(x => ({ ...x, type: x.type || 'doc' })) || [];
    const repos = data.repos?.map(x => ({ ...x, type: 'repo' })) || [];
    const prompts = data.prompts?.map(x => ({ ...x, type: 'prompt' })) || [];
    const communities = data.communities?.map(x => ({ ...x, type: 'community' })) || [];

    return [...notes, ...learnings, ...snippets, ...docs, ...repos, ...prompts, ...communities];
  }, [data]);

  // Unpin mutation directly from dashboard
  const unpinMutation = useMutation({
    mutationFn: async (item) => {
      const spaceId = item.spaceId?._id || item.spaceId;
      const res = await api.patch(`/api/spaces/${spaceId}/items/${item._id}/pin`);
      return res.data;
    },
    onSuccess: (_, item) => {
      message.success(`Unpinned "${item.title || item.name || 'item'}"`);
      const spaceId = item.spaceId?._id || item.spaceId;
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'pinned'] });
      if (spaceId) {
        queryClient.invalidateQueries({ queryKey: ['items', spaceId] });
      }
      if (selectedItem?._id === item._id) {
        setSelectedItem(null);
      }
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to unpin item');
    },
  });

  const handleCopyText = (text, label = 'Content') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered pinned list
  const filteredItems = useMemo(() => {
    return allPinnedItems.filter((item) => {
      const itemType = item.type || 'doc';
      const matchesType = selectedType === 'all' || itemType === selectedType;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesType;

      const title = (item.title || item.name || '').toLowerCase();
      const caption = (item.caption || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const spaceName = (item.spaceId?.name || '').toLowerCase();
      const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : (item.tags || '').toLowerCase();

      const matchesSearch = title.includes(q) || caption.includes(q) || content.includes(q) || spaceName.includes(q) || tags.includes(q);
      return matchesType && matchesSearch;
    });
  }, [allPinnedItems, selectedType, searchQuery]);

  // Navigation to space detail
  const handleOpenInSpace = (e, item) => {
    e.stopPropagation();
    const spaceId = item.spaceId?._id || item.spaceId;
    const meta = TYPE_META[item.type] || TYPE_META.doc;
    window.location.href = `/spaces/${spaceId}?section=${meta.section}&id=${item._id}`;
  };

  const textMuted = 'var(--text-secondary)';
  const textPrimary = 'var(--text-color)';
  const border = 'var(--card-border)';
  const cardBg = 'var(--card-bg)';
  const accent = 'var(--accent-color)';

  const typeCounts = useMemo(() => {
    const counts = { all: allPinnedItems.length };
    allPinnedItems.forEach((i) => {
      const t = i.type || 'doc';
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [allPinnedItems]);

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiPushpinFill size={17} style={{ color: '#eab308' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: textPrimary, margin: 0 }}>
            Pinned Resources
          </h3>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '12px',
              background: isLight ? 'rgba(234,179,8,0.12)' : 'rgba(234,179,8,0.2)',
              color: '#ca8a04',
            }}
          >
            {allPinnedItems.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <RiSearchLine
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isLight ? '#999999' : '#666676',
            }}
          />
          <input
            type="text"
            placeholder="Search pinned items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '32px',
              padding: '0 10px 0 30px',
              borderRadius: '8px',
              border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
              background: isLight ? '#ffffff' : '#111116',
              color: textPrimary,
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
            onBlur={(e) => (e.currentTarget.style.borderColor = isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)')}
          />
        </div>

        {/* Type Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
          }}
        >
          {['all', 'note', 'doc', 'snippet', 'learning', 'prompt', 'repo', 'community'].map((typeKey) => {
            const count = typeCounts[typeKey] || 0;
            if (typeKey !== 'all' && count === 0) return null;
            const isSelected = selectedType === typeKey;

            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedType(typeKey)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  border: `1px solid ${isSelected ? accent : border}`,
                  background: isSelected
                    ? (isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.15)')
                    : 'transparent',
                  color: isSelected ? accent : textMuted,
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{typeKey === 'all' ? 'All' : `${typeKey}s`}</span>
                <span style={{ fontSize: '10px', opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned Items List */}
      {isLoading ? (
        <div style={{ color: textMuted, fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
          Loading pinned resources...
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ color: textMuted, fontSize: '13px', padding: '28px 0', textAlign: 'center' }}>
          {searchQuery ? 'No matching pinned resources.' : 'No pinned resources yet. Pin items in your spaces to access them quickly here.'}
        </div>
      ) : (
        <div
          data-lenis-prevent
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '340px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {filteredItems.map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.doc;
            const ItemIcon = meta.icon;
            const spaceName = item.spaceId?.name || 'Space';
            const iconKey = item.spaceId?.iconKey || 'folder';

            return (
              <div
                key={item._id}
                onClick={() => {
                  setSelectedItem(item);
                  setIsViewerMaximized(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: `1px solid ${border}`,
                  background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.15s ease',
                  gap: '12px',
                  minWidth: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isLight ? '#f9fafb' : 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isLight ? '#ffffff' : 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = border;
                }}
              >
                {/* Left: Icon & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: meta.bg,
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ItemIcon size={15} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: textPrimary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title || item.name || 'Untitled'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: meta.bg,
                          color: meta.color,
                          textTransform: 'uppercase',
                        }}
                      >
                        {meta.label}
                      </span>
                      <span style={{ fontSize: '11px', color: textMuted }}>•</span>
                      <span style={{ fontSize: '11px', color: textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {spaceName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <Tooltip title="View in Explorer preview">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setIsViewerMaximized(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: textMuted,
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                    >
                      <RiEyeLine size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Open in Space module">
                    <button
                      type="button"
                      onClick={(e) => handleOpenInSpace(e, item)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: textMuted,
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = meta.color)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                    >
                      <RiShareForwardLine size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Unpin item">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        unpinMutation.mutate(item);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#eab308',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <RiPushpinFill size={15} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Active Pinned Item In-Place Full-Screen / Modal Viewer (Explorer Style) ── */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isViewerMaximized ? '0' : '24px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedItem(null);
            }
          }}
        >
          <div
            data-lenis-prevent
            style={{
              width: isViewerMaximized ? '100vw' : '960px',
              maxWidth: isViewerMaximized ? '100vw' : '95vw',
              height: isViewerMaximized ? '100vh' : '88vh',
              maxHeight: isViewerMaximized ? '100vh' : '90vh',
              background: isLight ? '#ffffff' : '#0d0d14',
              border: isViewerMaximized ? 'none' : `1px solid ${border}`,
              borderRadius: isViewerMaximized ? '0' : '16px',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Viewer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 24px',
                borderBottom: `1px solid ${border}`,
                background: isLight ? '#f9fafb' : '#12121c',
                flexShrink: 0,
                gap: '14px',
              }}
            >
              {/* Left: Type Pill & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: TYPE_META[selectedItem.type]?.bg || 'rgba(99,102,241,0.1)',
                    color: TYPE_META[selectedItem.type]?.color || accent,
                    flexShrink: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedItem.type}
                </span>

                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 700,
                    color: textPrimary,
                    fontFamily: 'var(--font-display)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedItem.title || selectedItem.name || 'Untitled'}
                </h3>

                {selectedItem.spaceId?.name && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
                      color: textMuted,
                      flexShrink: 0,
                    }}
                  >
                    {selectedItem.spaceId.name}
                  </span>
                )}
              </div>

              {/* Right: Actions (Open in space, Unpin, Maximize/Minimize, Close) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {/* Open in space module */}
                <button
                  type="button"
                  onClick={(e) => handleOpenInSpace(e, selectedItem)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${border}`,
                    background: 'transparent',
                    color: accent,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RiShareForwardLine size={14} />
                  <span>Open in {TYPE_META[selectedItem.type]?.label || 'Space'}s</span>
                </button>

                {/* Unpin button */}
                <Tooltip title="Unpin from dashboard">
                  <button
                    type="button"
                    onClick={() => unpinMutation.mutate(selectedItem)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${border}`,
                      background: 'rgba(234,179,8,0.1)',
                      color: '#eab308',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RiPushpinFill size={14} />
                    <span>Unpin</span>
                  </button>
                </Tooltip>

                {/* Maximize / Minimize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsViewerMaximized(!isViewerMaximized)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${border}`,
                    color: textPrimary,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  title={isViewerMaximized ? 'Minimize Window' : 'Full Screen'}
                >
                  {isViewerMaximized ? (
                    <>
                      <RiFullscreenExitLine size={15} />
                      <span>Minimize</span>
                    </>
                  ) : (
                    <>
                      <RiFullscreenLine size={15} />
                      <span>Full Screen</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: textMuted,
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                >
                  <RiCloseLine size={22} />
                </button>
              </div>
            </div>

            {/* Item Content Preview */}
            <div
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: isViewerMaximized ? '32px 48px' : '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Note */}
              {selectedItem.type === 'note' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
                  <MarkdownRenderer content={selectedItem.content || '*No content written yet.*'} isLight={isLight} />
                </div>
              )}

              {/* Snippet */}
              {selectedItem.type === 'snippet' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isLight ? '#f3f4f6' : '#161622',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: accent,
                          background: 'rgba(99,102,241,0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {selectedItem.language || 'javascript'}
                      </span>
                      {selectedItem.caption && (
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: textMuted,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {selectedItem.caption}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedItem.content, 'Snippet')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${copied ? '#10b981' : border}`,
                        background: copied ? 'rgba(16,185,129,0.15)' : (isLight ? '#ffffff' : '#20202e'),
                        color: copied ? '#10b981' : textPrimary,
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copied ? (
                        <>
                          <RiCheckLine size={14} style={{ color: '#10b981' }} />
                          <span style={{ color: '#10b981' }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <RiFileCopyLine size={14} />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <MarkdownRenderer
                    content={`\`\`\`${selectedItem.language || 'javascript'}\n${selectedItem.content || ''}\n\`\`\``}
                    isLight={isLight}
                  />
                </div>
              )}

              {/* Learning */}
              {selectedItem.type === 'learning' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '14px', color: textPrimary, margin: 0, lineHeight: 1.6 }}>
                    {selectedItem.content}
                  </p>
                  {selectedItem.codeExample?.code && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedItem.codeExample.code, 'Code Example')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '5px',
                            border: `1px solid ${border}`,
                            background: 'transparent',
                            color: textPrimary,
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <RiFileCopyLine size={13} />
                          <span>Copy Code</span>
                        </button>
                      </div>
                      <MarkdownRenderer
                        content={`\`\`\`${selectedItem.codeExample.language || 'javascript'}\n${selectedItem.codeExample.code}\n\`\`\``}
                        isLight={isLight}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Prompt */}
              {selectedItem.type === 'prompt' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: isLight ? '#f9fafb' : '#14141e', padding: '18px', borderRadius: '10px', border: `1px solid ${border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: textMuted }}>
                        SYSTEM / USER PROMPT ({selectedItem.model || 'AI'}):
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedItem.content, 'Prompt')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '5px',
                          border: `1px solid ${border}`,
                          background: isLight ? '#ffffff' : '#1e1e2c',
                          color: textPrimary,
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <RiFileCopyLine size={13} />
                        <span>Copy Prompt</span>
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: textPrimary, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {selectedItem.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Doc / PDF / Web Link */}
              {selectedItem.type === 'doc' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                  {isPdfFile(selectedItem) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', minHeight: isViewerMaximized ? 'calc(100vh - 160px)' : '550px' }}>
                      <div style={{ flex: 1, minHeight: isViewerMaximized ? 'calc(100vh - 190px)' : '500px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${border}` }}>
                        <iframe
                          src={`${resolveFileUrl(selectedItem, selectedItem.spaceId?._id || selectedItem.spaceId)}#toolbar=1`}
                          title={selectedItem.title}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <a
                          href={resolveFileUrl(selectedItem, selectedItem.spaceId?._id || selectedItem.spaceId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: accent, fontSize: '13px', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          Open in full tab
                        </a>
                      </div>
                    </div>
                  ) : selectedItem.url ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontSize: '14px', textDecoration: 'underline', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>{selectedItem.url}</span>
                        <RiExternalLinkLine size={14} />
                      </a>
                      {selectedItem.caption && <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>{selectedItem.caption}</p>}
                      {selectedItem.content && <MarkdownRenderer content={selectedItem.content} isLight={isLight} />}
                    </div>
                  ) : (
                    <div>
                      {selectedItem.caption && <p style={{ fontSize: '13px', color: textMuted, margin: '0 0 10px' }}>{selectedItem.caption}</p>}
                      {selectedItem.content && <MarkdownRenderer content={selectedItem.content} isLight={isLight} />}
                    </div>
                  )}
                </div>
              )}

              {/* Repo */}
              {selectedItem.type === 'repo' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontSize: '16px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <RiGitRepositoryLine size={18} />
                    <span>{selectedItem.url || selectedItem.title}</span>
                    <RiExternalLinkLine size={14} />
                  </a>
                  {selectedItem.caption && <p style={{ fontSize: '13.5px', color: textMuted, margin: 0 }}>{selectedItem.caption}</p>}
                </div>
              )}

              {/* Community */}
              {selectedItem.type === 'community' && (
                <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', textTransform: 'capitalize' }}>
                      {selectedItem.platform || 'Community'}
                    </span>
                    {selectedItem.memberCount && (
                      <span style={{ fontSize: '12px', color: textMuted }}>
                        {selectedItem.memberCount} members
                      </span>
                    )}
                  </div>
                  <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontSize: '16px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>{selectedItem.url || selectedItem.title}</span>
                    <RiExternalLinkLine size={14} />
                  </a>
                  {selectedItem.caption && <p style={{ fontSize: '13.5px', color: textMuted, margin: 0 }}>{selectedItem.caption}</p>}
                </div>
              )}

              {/* Image */}
              {(selectedItem.type === 'image' || isImageFile(selectedItem)) && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                  <img
                    src={resolveFileUrl(selectedItem, selectedItem.spaceId?._id || selectedItem.spaceId)}
                    alt={selectedItem.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: isViewerMaximized ? '80vh' : '550px',
                      borderRadius: '10px',
                      objectFit: 'contain',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
