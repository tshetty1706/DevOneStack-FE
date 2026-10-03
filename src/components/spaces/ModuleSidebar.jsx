import React, { useState, useMemo } from 'react';
import { Button, Tooltip } from 'antd';
import {
  RiSearchLine,
  RiAddLine,
  RiMenuFoldLine,
  RiStickyNoteLine,
  RiLightbulbLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiRobot2Line,
  RiGitRepositoryLine,
  RiImageLine,
  RiTeamLine
} from 'react-icons/ri';
import SharedFolderTree from './SharedFolderTree';

const DEFAULT_TYPE_ICONS = {
  note: { icon: RiStickyNoteLine, color: '#10b981' },
  learning: { icon: RiLightbulbLine, color: '#eab308' },
  snippet: { icon: RiCodeSSlashLine, color: '#818cf8' },
  doc: { icon: RiFileTextLine, color: '#60a5fa' },
  prompt: { icon: RiRobot2Line, color: '#f472b6' },
  repo: { icon: RiGitRepositoryLine, color: '#fb923c' },
  image: { icon: RiImageLine, color: '#ec4899' },
  community: { icon: RiTeamLine, color: '#38bdf8' },
};

/**
 * Single Canonical Module Sidebar
 * Follows the Notes sidebar reference design & behavior across all Space modules.
 */
export default function ModuleSidebar({
  spaceId,
  title = 'Explorer',
  icon: HeaderIcon = RiStickyNoteLine,
  addButtonLabel = 'New Item',
  itemType = 'note',
  items = [],
  selectedFolderId = null,
  onSelectFolder,
  selectedItemId = null,
  onSelectItem,
  onAddItem,
  isLight = false,
  isMobile = false,
  isSidebarCollapsed = false,
  onCloseSidebar,
  mobileSidebarVisible = true,
  hasActiveItem = false,
  customHeaderRight = null,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'recent'
  const [searchQuery, setSearchQuery] = useState('');

  // DevOneStack Theme Tokens
  const cardBorder = isLight ? '#ebebeb' : 'rgba(255,255,255,0.06)';
  const sidebarBg = isLight ? '#fafafa' : '#0a0a0f';
  const textColor = isLight ? '#111827' : '#ffffff';
  const textMuted = '#64748b';
  const accent = isLight ? '#4f46e5' : '#6366f1';

  // Compute recently modified items for this module
  const recentItems = useMemo(() => {
    let list = [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => (item.title || item.name || '').toLowerCase().includes(q));
    }
    return list.slice(0, 10);
  }, [items, searchQuery]);

  // If sidebar is collapsed on desktop, or hidden on mobile when an item is active
  if (isSidebarCollapsed || (isMobile && hasActiveItem && !mobileSidebarVisible)) {
    return null;
  }

  const typeMeta = DEFAULT_TYPE_ICONS[itemType] || DEFAULT_TYPE_ICONS.note;
  const ItemIcon = typeMeta.icon;
  const itemIconColor = typeMeta.color;

  return (
    <aside
      data-lenis-prevent
      style={{
        width: isMobile ? '100%' : '260px',
        minWidth: isMobile ? '100%' : '240px',
        maxWidth: isMobile ? '100%' : '300px',
        borderRight: isMobile ? 'none' : `1px solid ${cardBorder}`,
        background: sidebarBg,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── Section Header ── */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: `1px solid ${cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <HeaderIcon size={17} style={{ color: accent, flexShrink: 0 }} />
          <span
            style={{
              fontSize: '13.5px',
              fontWeight: 700,
              color: textColor,
              fontFamily: 'var(--font-display)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {customHeaderRight ? (
            customHeaderRight
          ) : (
            <Button
              type="primary"
              size="small"
              icon={<RiAddLine />}
              onClick={() => onAddItem?.(selectedFolderId || null)}
              style={{
                background: accent,
                borderColor: accent,
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              {addButtonLabel}
            </Button>
          )}

          {onCloseSidebar && (
            <Tooltip title="Close sidebar">
              <button
                type="button"
                onClick={onCloseSidebar}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = textColor)}
                onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
              >
                <RiMenuFoldLine size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ── Search Input ── */}
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${cardBorder}`, flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <RiSearchLine
            size={13}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: textMuted,
            }}
          />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 28px',
              borderRadius: '6px',
              border: `1px solid ${isLight ? '#e5e5e5' : '#2a2a2a'}`,
              background: isLight ? '#ffffff' : '#1a1a1a',
              color: textColor,
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* ── Tabs: All / Recent ── */}
      <div style={{ display: 'flex', padding: '6px 12px', gap: '6px', borderBottom: `1px solid ${cardBorder}`, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            flex: 1,
            padding: '4px 0',
            borderRadius: '5px',
            border: 'none',
            background: activeTab === 'all' ? (isLight ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.2)') : 'transparent',
            color: activeTab === 'all' ? accent : textMuted,
            fontWeight: activeTab === 'all' ? 700 : 500,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recent')}
          style={{
            flex: 1,
            padding: '4px 0',
            borderRadius: '5px',
            border: 'none',
            background: activeTab === 'recent' ? (isLight ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.2)') : 'transparent',
            color: activeTab === 'recent' ? accent : textMuted,
            fontWeight: activeTab === 'recent' ? 700 : 500,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Recent
        </button>
      </div>

      {/* ── Tab Content: Recent or SharedFolderTree ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 2px', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'recent' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '6px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: textMuted,
                padding: '4px 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Recently Modified
            </div>
            {recentItems.length === 0 ? (
              <div style={{ padding: '12px 8px', fontSize: '12px', color: textMuted, textAlign: 'center' }}>
                No recent items
              </div>
            ) : (
              recentItems.map(item => {
                const isSelected = selectedItemId === item._id;
                return (
                  <button
                    type="button"
                    key={item._id}
                    onClick={() => onSelectItem?.(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isSelected ? (isLight ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.18)') : 'transparent',
                      color: isSelected ? accent : textColor,
                      fontSize: '12.5px',
                      fontWeight: isSelected ? 600 : 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <ItemIcon size={14} style={{ flexShrink: 0, color: itemIconColor }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title || item.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <SharedFolderTree
            spaceId={spaceId}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onSelectItem={onSelectItem}
            onAddItem={onAddItem}
            selectedItemId={selectedItemId}
            filterItemType={itemType}
            isLight={isLight}
            showHeader={true}
            showSearch={false}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </aside>
  );
}
