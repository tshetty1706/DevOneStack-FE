import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RiExternalLinkLine, RiSearchLine } from 'react-icons/ri';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import SpaceIcon from '../spaces/SpaceIcon';

// Helper to parse domain from URL
function getDomain(urlStr) {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace('www.', '');
  } catch {
    return 'docs';
  }
}

export default function PinnedResources() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');

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

  const allPinnedItems = [
    ...notes,
    ...snippets,
    ...docs,
    ...repos,
    ...prompts,
    ...communities,
  ];

  const filteredPinnedItems = allPinnedItems.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const titleText = (item.title || item.name || '').toLowerCase();
    const isUrlDoc = item.itemType === 'doc' && item.type === 'url';
    const tagText = (isUrlDoc && item.url ? getDomain(item.url) : (item.spaceId?.name || 'space')).toLowerCase();
    
    return titleText.includes(query) || tagText.includes(query);
  });

  const handleOpen = (item) => {
    const realSpaceId = item.spaceId?._id || item.spaceId;
    if (item.itemType === 'note') {
      window.open(`/spaces/${realSpaceId}?section=notes&noteId=${item._id}`, '_self');
    } else if (item.itemType === 'snippet') {
      window.open(`/spaces/${realSpaceId}?section=snippets&id=${item._id}`, '_self');
    } else if (item.itemType === 'prompt') {
      window.open(`/spaces/${realSpaceId}?section=prompts&id=${item._id}`, '_self');
    } else if (item.itemType === 'doc') {
      if (item.type === 'url' && item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      } else {
        window.open(`/spaces/${realSpaceId}?section=docs`, '_self');
      }
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const textMuted = 'var(--text-secondary)';
  const textPrimary = 'var(--text-color)';
  const border = 'var(--card-border)';
  const cardBg = 'var(--card-bg)';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: textPrimary, margin: 0 }}>
          Pinned Resources
        </h3>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <RiSearchLine size={14} style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          color: isLight ? '#999999' : '#666676'
        }} />
        <input
          type="text"
          placeholder="Search pinned items..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', height: '32px', padding: '0 10px 0 30px',
            borderRadius: '8px',
            border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
            background: isLight ? '#ffffff' : '#111116',
            color: textPrimary, fontSize: '12px',
            fontFamily: 'var(--font-body)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
          onBlur={e => e.currentTarget.style.borderColor = isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ color: textMuted, fontSize: '13px', padding: '12px 0' }}>Loading pinned resources...</div>
      ) : filteredPinnedItems.length === 0 ? (
        <div style={{ color: textMuted, fontSize: '13px', padding: '24px 0', textAlign: 'center' }}>
          {searchQuery ? 'No matching pinned resources.' : 'No pinned resources yet.'}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '230px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}>
          {filteredPinnedItems.map((item) => {
            const isUrlDoc = item.itemType === 'doc' && item.type === 'url';
            const tagText = isUrlDoc && item.url ? getDomain(item.url) : (item.spaceId?.name || 'space');
            const iconKey = item.spaceId?.iconKey || 'folder';

            return (
              <div
                key={item._id}
                onClick={() => handleOpen(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  minWidth: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Left: Icon & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <SpaceIcon iconKey={iconKey} size={16} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: textPrimary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.title || item.name || 'Untitled'}
                  </span>
                </div>

                {/* Right: Tag & Link Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: isLight ? '#f0f2f5' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)'}`,
                    color: textMuted,
                  }}>
                    {tagText}
                  </span>
                  <RiExternalLinkLine size={14} style={{ color: textMuted }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
