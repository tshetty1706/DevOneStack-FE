import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiAddLine, RiSearchLine, RiEqualizerLine, RiArrowDownSLine, RiLayoutGridLine, RiCloseLine } from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import ToolSpaceCard from './ToolSpaceCard';

function EditSpaceModal({ space, open, onClose }) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (space) {
      setName(space.name || '');
      setTags(space.tags ? space.tags.join(', ') : '');
      setError('');
    }
  }, [space]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/api/spaces/${space._id || space.id}`, {
        name: name.trim(),
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
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
      }} />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          position: 'relative', width: '100%', maxWidth: '440px',
          background: isLight ? '#ffffff' : '#111116',
          border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '16px', padding: '24px', zIndex: 3001,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Space Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px',
                border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
                background: isLight ? '#ffffff' : '#1a1a22',
                color: 'var(--text-color)', fontSize: '14px', fontFamily: 'var(--font-body)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              style={{
                width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px',
                border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
                background: isLight ? '#ffffff' : '#1a1a22',
                color: 'var(--text-color)', fontSize: '14px', fontFamily: 'var(--font-body)',
                outline: 'none'
              }}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: '38px', borderRadius: '8px', border: 'none',
              background: 'var(--accent-color)', color: '#ffffff', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ToolSpacesGrid({ spaces, onAddSpaceClick }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const textMuted = 'var(--text-secondary)';
  const dashBorder = isLight ? '#e5e5e5' : '#222222';
  const textPrimary = 'var(--text-color)';

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pinned', 'alphabetical'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'pinned', label: 'Pinned Only' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  const currentFilterLabel = filterOptions.find(opt => opt.value === filter)?.label || 'All';

  // Filter spaces by search query
  const searchedSpaces = spaces.filter(space => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatches = space.name.toLowerCase().includes(query);
    const tagsMatches = space.tags && space.tags.some(tag => tag.toLowerCase().includes(query));
    return nameMatches || tagsMatches;
  });

  // Apply filters / sorting
  let finalSpaces = [...searchedSpaces];
  if (filter === 'pinned') {
    finalSpaces = finalSpaces.filter(space => space.isPinned);
  } else if (filter === 'alphabetical') {
    finalSpaces.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // default backend sorting (isPinned desc, updatedAt desc)
    finalSpaces.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Redesigned Header with Search and Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-color)'
          }}>
            <RiLayoutGridLine size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', margin: 0, color: textPrimary }}>
              Your Spaces
            </h2>
            <p style={{ fontSize: '13px', color: textMuted, margin: '2px 0 0 0' }}>
              All the spaces you're building and organizing.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', width: '220px' }}>
            <RiSearchLine size={14} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: isLight ? '#999999' : '#666676'
            }} />
            <input
              type="text"
              placeholder="Search spaces..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', height: '36px', padding: '0 12px 0 34px',
                borderRadius: '10px',
                border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
                background: isLight ? '#ffffff' : '#111116',
                color: textPrimary, fontSize: '13px',
                fontFamily: 'var(--font-body)', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
              onBlur={e => e.currentTarget.style.borderColor = isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Filter dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                height: '36px', padding: '0 14px', borderRadius: '10px',
                border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
                background: isLight ? '#ffffff' : '#111116',
                color: textPrimary, cursor: 'pointer',
                fontSize: '13px', fontWeight: 500,
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = isLight ? '#B2B2B2' : 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}
            >
              <RiEqualizerLine size={14} style={{ color: isLight ? '#555' : '#b2b2b2' }} />
              <span>{currentFilterLabel}</span>
              <RiArrowDownSLine size={16} style={{ color: isLight ? '#999' : '#666' }} />
            </button>

            {showFilterDropdown && (
              <>
                <div onClick={() => setShowFilterDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
                <div style={{
                  position: 'absolute', top: '42px', right: 0,
                  background: isLight ? '#ffffff' : '#111116',
                  border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '10px', minWidth: '140px', padding: '4px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 1000,
                }}>
                  {filterOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilter(opt.value);
                        setShowFilterDropdown(false);
                      }}
                      style={{
                        width: '100%', padding: '8px 12px', border: 'none',
                        background: filter === opt.value
                          ? (isLight ? 'rgba(79,70,229,0.05)' : 'rgba(99,102,241,0.08)')
                          : 'transparent',
                        color: filter === opt.value ? 'var(--accent-color)' : textPrimary,
                        textAlign: 'left', cursor: 'pointer', fontSize: '13px',
                        borderRadius: '6px', fontWeight: filter === opt.value ? 600 : 500,
                        fontFamily: 'var(--font-body)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => {
                        if (filter !== opt.value) {
                          e.currentTarget.style.background = isLight ? '#f5f5f5' : 'rgba(255,255,255,0.04)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (filter !== opt.value) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {opt.label}
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        width: '100%',
      }}>
        {finalSpaces.map((space, i) => (
          <ToolSpaceCard
            key={space._id || space.id}
            space={space}
            index={i}
            onEditClick={() => setEditingSpace(space)}
          />
        ))}

        {/* Redesigned Add tool space card */}
        <motion.div
          onClick={onAddSpaceClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + spaces.length * 0.08, duration: 0.4 }}
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
            minHeight: '180px',
            background: isLight ? '#fafafa' : 'rgba(255,255,255,0.01)',
            transition: 'border-color 0.2s ease, background 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.background = isLight ? 'rgba(79,70,229,0.02)' : 'rgba(99,102,241,0.02)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = dashBorder;
            e.currentTarget.style.background = isLight ? '#fafafa' : 'rgba(255,255,255,0.01)';
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: `2px solid ${isLight ? '#4f46e5' : '#818cf8'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isLight ? '#4f46e5' : '#818cf8',
            fontSize: '20px', fontWeight: 500,
          }}>
            <RiAddLine />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: textPrimary, margin: '0 0 4px 0' }}>
              Add tool space
            </h4>
            <p style={{ fontSize: '12px', color: textMuted, margin: 0, maxWidth: '180px', lineHeight: 1.4 }}>
              Create a new space for any tool or topic
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
