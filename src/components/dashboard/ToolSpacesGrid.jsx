import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  RiAddLine,
  RiSearchLine,
  RiEqualizerLine,
  RiArrowDownSLine,
  RiLayoutGridLine,
  RiListCheck2,
  RiCloseLine,
  RiMagicLine,
  RiFolder5Line
} from 'react-icons/ri';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import ToolSpaceCard from './ToolSpaceCard';

function EditSpaceModal({ space, open, onClose }) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (space) {
      setName(space.name || '');
      setDescription(space.description || '');
      setVisibility(space.visibility || 'private');
      setTags(space.tags ? space.tags.join(', ') : '');
      setError('');
    }
  }, [space]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Space name is required');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/api/spaces/${space._id || space.id}`, {
        name: name.trim(),
        description: description.trim(),
        visibility: visibility,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      await queryClient.invalidateQueries({ queryKey: ['spaces'] });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update space');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)'
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          position: 'relative', width: '100%', maxWidth: '460px',
          background: isLight ? '#ffffff' : '#111116',
          border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '16px', padding: '24px', zIndex: 3001,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          fontFamily: 'var(--font-body)'
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: isLight ? '#666' : '#999'
        }}>
          <RiCloseLine size={20} />
        </button>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-color)', fontFamily: 'var(--font-display)' }}>
          Edit Space
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Space Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px',
                border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
                background: isLight ? '#ffffff' : '#1a1a22',
                color: 'var(--text-color)', fontSize: '13.5px', fontFamily: 'var(--font-body)',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px',
                border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
                background: isLight ? '#ffffff' : '#1a1a22',
                color: 'var(--text-color)', fontSize: '13px', fontFamily: 'var(--font-body)',
                outline: 'none', boxSizing: 'border-box', resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Visibility
            </label>
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
              style={{
                width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px',
                border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
                background: isLight ? '#ffffff' : '#1a1a22',
                color: 'var(--text-color)', fontSize: '13px', fontFamily: 'var(--font-body)',
                outline: 'none', boxSizing: 'border-box'
              }}
            >
              <option value="private">Private (Only you & collaborators)</option>
              <option value="public">Public (Anyone can discover & view)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              style={{
                width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px',
                border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}`,
                background: isLight ? '#ffffff' : '#1a1a22',
                color: 'var(--text-color)', fontSize: '13.5px', fontFamily: 'var(--font-body)',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '12.5px' }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: '40px', borderRadius: '8px', border: 'none',
              background: 'var(--accent-color)', color: '#ffffff', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1, marginTop: '4px'
            }}
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ToolSpacesGrid({ spaces = [], onAddSpaceClick }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  const textMuted = 'var(--text-secondary)';
  const dashBorder = isLight ? '#d1d5db' : '#22222e';
  const textPrimary = 'var(--text-color)';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'mine', 'shared', 'starred', 'archived'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'stars', 'views'
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  const currentUserId = user?._id || user?.id;

  // Tab counts
  const tabCounts = useMemo(() => {
    const all = spaces.length;
    const mine = spaces.filter(s => {
      const ownerId = typeof s.owner === 'object' ? s.owner?._id || s.owner?.id : s.owner;
      return (!ownerId || (currentUserId && ownerId.toString() === currentUserId.toString())) && !s.isArchived;
    }).length;
    const shared = spaces.filter(s => {
      const ownerId = typeof s.owner === 'object' ? s.owner?._id || s.owner?.id : s.owner;
      return ownerId && currentUserId && ownerId.toString() !== currentUserId.toString();
    }).length;
    const starred = spaces.filter(s => {
      return s.starredBy && currentUserId && s.starredBy.some(id => (typeof id === 'object' ? id._id || id.id : id)?.toString() === currentUserId.toString());
    }).length;
    const archived = spaces.filter(s => s.isArchived).length;

    return { all, mine, shared, starred, archived };
  }, [spaces, currentUserId]);

  // Tab Filter
  const tabFilteredSpaces = useMemo(() => {
    return spaces.filter(s => {
      const ownerId = typeof s.owner === 'object' ? s.owner?._id || s.owner?.id : s.owner;
      const isOwner = !ownerId || (currentUserId && ownerId.toString() === currentUserId.toString());

      if (activeTab === 'mine') {
        return isOwner && !s.isArchived;
      }
      if (activeTab === 'shared') {
        return !isOwner;
      }
      if (activeTab === 'starred') {
        return s.starredBy && currentUserId && s.starredBy.some(id => (typeof id === 'object' ? id._id || id.id : id)?.toString() === currentUserId.toString());
      }
      if (activeTab === 'archived') {
        return s.isArchived;
      }
      // 'all'
      return !s.isArchived;
    });
  }, [spaces, activeTab, currentUserId]);

  // Search Filter
  const searchedSpaces = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tabFilteredSpaces;
    return tabFilteredSpaces.filter(space => {
      const nameMatches = space.name?.toLowerCase().includes(q);
      const toolMatches = space.tool?.toLowerCase().includes(q);
      const descMatches = space.description?.toLowerCase().includes(q);
      const tagsMatches = space.tags && space.tags.some(tag => tag.toLowerCase().includes(q));
      return nameMatches || toolMatches || descMatches || tagsMatches;
    });
  }, [tabFilteredSpaces, searchQuery]);

  // Sort
  const sortedSpaces = useMemo(() => {
    const list = [...searchedSpaces];
    if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'stars') {
      list.sort((a, b) => (b.starsCount || 0) - (a.starsCount || 0));
    } else if (sortBy === 'views') {
      list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else {
      // 'recent'
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      });
    }
    return list;
  }, [searchedSpaces, sortBy]);

  const sortLabels = {
    recent: 'Recently Updated',
    name: 'Alphabetical',
    stars: 'Most Starred',
    views: 'Most Viewed',
  };

  const handleCreateSpaceClick = () => {
    if (onAddSpaceClick) {
      onAddSpaceClick();
    } else {
      navigate(`/u/${encodeURIComponent(user?.username || 'user')}/spaces/create`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '20px' }}>
      {/* Top Header Row matching reference design */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        width: '100%',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(24px, 3.5vw, 28px)',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            margin: '0 0 4px 0',
            color: textPrimary,
            letterSpacing: '-0.02em',
          }}>
            My Spaces
          </h1>
          <p style={{ fontSize: '13.5px', color: textMuted, margin: 0 }}>
            All your technology spaces in one place. Organize, learn, build and share.
          </p>
        </div>

        {/* Primary Create New Space Button */}
        <button
          type="button"
          onClick={handleCreateSpaceClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--accent-color)',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            minHeight: '42px',
          }}
          onMouseEnter={e => e.currentTarget.style.background = isLight ? '#4338ca' : '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-color)'}
        >
          <RiAddLine size={18} />
          <span>Create New Space</span>
        </button>
      </div>

      {/* Tabs and Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        paddingBottom: '4px',
      }}>
        {/* Left: Tab Pills */}
        <div
          data-lenis-prevent
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {[
            { id: 'all', label: `All (${tabCounts.all})` },
            { id: 'mine', label: `My Spaces (${tabCounts.mine})` },
            { id: 'shared', label: `Shared (${tabCounts.shared})` },
            { id: 'starred', label: `Starred (${tabCounts.starred})` },
            { id: 'archived', label: `Archived (${tabCounts.archived})` },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isActive
                    ? `1px solid var(--accent-color)`
                    : `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.06)'}`,
                  background: isActive
                    ? (isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.18)')
                    : (isLight ? '#ffffff' : 'rgba(255,255,255,0.02)'),
                  color: isActive ? 'var(--accent-color)' : textMuted,
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Search & Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', width: '210px' }}>
            <RiSearchLine size={14} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: isLight ? '#9ca3af' : '#64748b'
            }} />
            <input
              type="text"
              placeholder="Search spaces..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', height: '36px', padding: '0 12px 0 34px',
                borderRadius: '10px',
                border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
                background: isLight ? '#ffffff' : '#111116',
                color: textPrimary, fontSize: '13px',
                fontFamily: 'var(--font-body)', outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
              onBlur={e => e.currentTarget.style.borderColor = isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowSortDropdown(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                height: '36px', padding: '0 14px', borderRadius: '10px',
                border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
                background: isLight ? '#ffffff' : '#111116',
                color: textPrimary, cursor: 'pointer',
                fontSize: '12.5px', fontWeight: 500,
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.2s',
              }}
            >
              <span>Sort: {sortLabels[sortBy]}</span>
              <RiArrowDownSLine size={15} style={{ color: textMuted }} />
            </button>

            {showSortDropdown && (
              <>
                <div onClick={() => setShowSortDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                <div style={{
                  position: 'absolute', top: '42px', right: 0,
                  background: isLight ? '#ffffff' : '#14141c',
                  border: `1px solid ${isLight ? '#e5e7eb' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '10px', minWidth: '160px', padding: '4px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)', zIndex: 1000,
                }}>
                  {Object.entries(sortLabels).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSortBy(key);
                        setShowSortDropdown(false);
                      }}
                      style={{
                        width: '100%', padding: '8px 12px', border: 'none',
                        background: sortBy === key
                          ? (isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)')
                          : 'transparent',
                        color: sortBy === key ? 'var(--accent-color)' : textPrimary,
                        textAlign: 'left', cursor: 'pointer', fontSize: '12.5px',
                        borderRadius: '6px', fontWeight: sortBy === key ? 600 : 500,
                        fontFamily: 'var(--font-body)',
                        transition: 'background 0.2s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid of space cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 360px))',
        gap: '20px',
        width: '100%',
      }}>
        {sortedSpaces.map((space, i) => (
          <ToolSpaceCard
            key={space._id || space.id}
            space={space}
            index={i}
            onEditClick={() => setEditingSpace(space)}
          />
        ))}

        {/* Dashed Create New Space Card matching reference */}
        <motion.div
          onClick={handleCreateSpaceClick}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + sortedSpaces.length * 0.04, duration: 0.35 }}
          whileHover={{ y: -4 }}
          style={{
            border: `2px dashed ${dashBorder}`,
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '12px',
            minHeight: '260px',
            background: isLight ? '#fafafa' : 'rgba(255,255,255,0.01)',
            transition: 'border-color 0.25s ease, background 0.25s ease, transform 0.25s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.background = isLight ? 'rgba(79,70,229,0.03)' : 'rgba(99,102,241,0.03)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = dashBorder;
            e.currentTarget.style.background = isLight ? '#fafafa' : 'rgba(255,255,255,0.01)';
          }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            border: `2px solid ${isLight ? '#4f46e5' : '#818cf8'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isLight ? '#4f46e5' : '#818cf8',
            fontSize: '22px', fontWeight: 600,
          }}>
            <RiAddLine />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: textPrimary, margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>
              Create New Space
            </h4>
            <p style={{ fontSize: '12.5px', color: textMuted, margin: 0, maxWidth: '200px', lineHeight: 1.45 }}>
              Start organizing your knowledge for a new technology
            </p>
          </div>
        </motion.div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingSpace && (
          <EditSpaceModal
            space={editingSpace}
            open={!!editingSpace}
            onClose={() => setEditingSpace(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
