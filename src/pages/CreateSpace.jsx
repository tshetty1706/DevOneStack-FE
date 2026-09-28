import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import api from '../api/axios';
import Logo from '../components/layout/Logo';
import SpaceIcon from '../components/spaces/SpaceIcon';
import SpaceThumbnail from '../components/common/SpaceThumbnail';
import ToolSpaceCard from '../components/dashboard/ToolSpaceCard';
import {
  TOOLS,
  TOOL_CATEGORIES,
  getToolById,
  getDefaultThumbnail,
  resolveThumbnail,
  getToolThumbnail,
} from '../constants/tools';
import {
  RiArrowLeftLine,
  RiCheckLine,
  RiLockLine,
  RiGlobalLine,
  RiLinkM,
  RiSearchLine,
  RiImageEditLine,
  RiMagicLine,
  RiAddLine,
  RiCloseLine,
  RiInformationLine,
  RiRefreshLine,
  RiFolder5Line,
  RiUpload2Line,
  RiDeleteBinLine,
  RiLoader4Line,
  RiImageLine,
} from 'react-icons/ri';

/**
 * Modal to customize/edit the Space Thumbnail
 */
function ThumbnailPickerModal({
  open,
  onClose,
  currentThumbnail,
  selectedTool,
  onSelectThumbnail,
  onUploadCustomClick,
  onRemoveCustom,
  isCustomActive,
  uploadingCustom,
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesSearch = !search.trim() ||
        tool.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        tool.slug.toLowerCase().includes(search.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  if (!open) return null;

  const bg = isLight ? '#ffffff' : '#111116';
  const border = isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.08)';
  const textPrimary = isLight ? '#111827' : '#f8fafc';
  const textSecondary = isLight ? '#64748b' : '#94a3b8';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '18px',
          padding: '24px',
          zIndex: 3001,
          boxShadow: isLight
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            : '0 25px 60px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)', color: textPrimary }}>
              Choose Space Thumbnail
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: textSecondary }}>
              Select a {isLight ? 'Light Mode' : 'Dark Mode'} 3D artwork, upload your own, or reset to default.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: textSecondary,
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
            }}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Custom Upload Banner inside Modal */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: '12px',
          background: isCustomActive
            ? (isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)')
            : (isLight ? '#f8fafc' : '#161620'),
          border: `1px solid ${isCustomActive ? 'var(--accent-color)' : border}`,
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: isLight ? '#ffffff' : '#0e0e14',
              border: `1px solid ${border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {isCustomActive ? (
                <img
                  src={currentThumbnail}
                  alt="Custom preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <RiUpload2Line size={18} style={{ color: 'var(--accent-color)' }} />
              )}
            </div>
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: textPrimary, display: 'block' }}>
                {isCustomActive ? 'Custom Upload Active' : 'Custom Space Thumbnail'}
              </span>
              <span style={{ fontSize: '11px', color: textSecondary }}>
                {isCustomActive ? 'Stored securely via Cloudinary' : 'Upload PNG, JPG, or WEBP from your device'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={uploadingCustom}
              onClick={onUploadCustomClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--accent-color)',
                background: 'var(--accent-color)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: uploadingCustom ? 'not-allowed' : 'pointer',
                opacity: uploadingCustom ? 0.7 : 1,
              }}
            >
              {uploadingCustom ? <RiLoader4Line size={14} className="animate-spin" /> : <RiUpload2Line size={14} />}
              <span>{isCustomActive ? 'Replace from Device' : 'Upload from Device'}</span>
            </button>

            {isCustomActive && (
              <button
                type="button"
                onClick={onRemoveCustom}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1px solid ${border}`,
                  background: isLight ? '#ffffff' : '#1f1f2a',
                  color: isLight ? '#dc2626' : '#f87171',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RiDeleteBinLine size={14} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Default Controls */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1,
            minWidth: '180px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <RiSearchLine
              size={15}
              style={{ position: 'absolute', left: '12px', color: textSecondary }}
            />
            <input
              type="text"
              placeholder="Search 3D artwork..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px 0 36px',
                borderRadius: '9px',
                border: `1px solid ${border}`,
                background: isLight ? '#f9fafb' : '#181820',
                color: textPrimary,
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectThumbnail(getDefaultThumbnail(theme), null);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 14px',
              borderRadius: '9px',
              border: `1px solid ${border}`,
              background: isLight ? '#f9fafb' : '#181820',
              color: textPrimary,
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <RiRefreshLine size={14} />
            Theme Default
          </button>
        </div>

        {/* Category Tabs */}
        <div
          data-lenis-prevent
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '10px',
          }}
        >
          {['All', ...Object.values(TOOL_CATEGORIES).filter(c => c !== 'All')].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 11px',
                borderRadius: '20px',
                border: selectedCategory === cat
                  ? `1px solid var(--accent-color)`
                  : `1px solid ${border}`,
                background: selectedCategory === cat
                  ? (isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)')
                  : 'transparent',
                color: selectedCategory === cat ? 'var(--accent-color)' : textSecondary,
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Thumbnail Visual Grid */}
        <div
          data-lenis-prevent
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '10px',
            overflowY: 'auto',
            padding: '4px',
            flex: 1,
            maxHeight: '320px',
          }}
        >
          {filteredTools.map(tool => {
            const toolThemedThumb = resolveThumbnail(tool.id, theme);
            const isSelected = !isCustomActive && (currentThumbnail === tool.id || currentThumbnail === toolThemedThumb || currentThumbnail === tool.thumbnail);
            return (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectThumbnail(tool.id, tool);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 8px',
                  borderRadius: '12px',
                  border: isSelected
                    ? '2px solid var(--accent-color)'
                    : `1px solid ${border}`,
                  background: isSelected
                    ? (isLight ? 'rgba(79, 70, 229, 0.06)' : 'rgba(99, 102, 241, 0.12)')
                    : (isLight ? '#fafafa' : '#15151c'),
                  cursor: 'pointer',
                  gap: '8px',
                  position: 'relative',
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = isLight ? '#c7d2fe' : 'rgba(99, 102, 241, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SpaceThumbnail
                    thumbnail={tool.id}
                    theme={theme}
                    aspectRatio="1"
                    objectFit="contain"
                    style={{ background: 'transparent' }}
                  />
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: textPrimary,
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                }}>
                  {tool.name}
                </span>
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--accent-color)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RiCheckLine size={11} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default function CreateSpace() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isLight = theme === 'light';

  const fileInputRef = useRef(null);

  // Form State
  const [spaceName, setSpaceName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedToolId, setSelectedToolId] = useState('react');
  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [visibility, setVisibility] = useState('private');
  const [tags, setTags] = useState(['Frontend', 'Interview', 'Learning', 'Projects']);
  const [tagInput, setTagInput] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [toolSearch, setToolSearch] = useState('');

  // Submission State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const selectedTool = useMemo(() => {
    return getToolById(selectedToolId) || TOOLS[0];
  }, [selectedToolId]);

  // Current effective thumbnail
  const activeThumbnail = customThumbnail || (selectedToolId ? resolveThumbnail(selectedToolId, theme) : getDefaultThumbnail(theme));

  // Handle Custom Thumbnail File Upload to Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input value so selecting the same file triggers onChange
    e.target.value = '';

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      message.error('Thumbnail image size cannot exceed 10MB.');
      return;
    }

    // Instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    const previousThumb = customThumbnail;
    setCustomThumbnail(localPreviewUrl);
    setUploadingThumbnail(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const res = await api.post('/api/spaces/upload-thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        setCustomThumbnail(res.data.url);
        message.success('Custom thumbnail uploaded to Cloudinary!');
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err) {
      console.error('Custom thumbnail upload failed:', err);
      // Rollback to previous
      setCustomThumbnail(previousThumb);
      const errText = err?.response?.data?.error || 'Unable to upload thumbnail. Please try again.';
      setUploadError(errText);
      message.error(errText);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Handle Tool Selection (Predefined tool becomes active as per Requirement 12)
  const handleSelectTool = (tool) => {
    setSelectedToolId(tool.id);
    setCustomThumbnail(null);
    setUploadError(null);

    // If space name is blank or standard default, auto-populate with helpful title
    if (!spaceName.trim() || spaceName.endsWith('Mastery') || spaceName.endsWith('Stack') || spaceName.endsWith('Essentials')) {
      setSpaceName(`${tool.name} Mastery`);
    }
    // Auto populate description if empty
    if (!description.trim() && tool.defaultDescription) {
      setDescription(tool.defaultDescription);
    }
    // Suggest relevant default tags
    if (tool.defaultTags && tool.defaultTags.length > 0) {
      setTags(tool.defaultTags);
    }

    if (errors.spaceName) {
      setErrors(prev => ({ ...prev, spaceName: null }));
    }
  };

  // Add Tag
  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (!clean) return;
    if (tags.some(t => t.toLowerCase() === clean.toLowerCase())) {
      setTagInput('');
      return;
    }
    if (tags.length >= 8) {
      message.warning('Maximum 8 tags per Space');
      return;
    }
    setTags(prev => [...prev, clean]);
    setTagInput('');
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    const trimmedName = spaceName.trim();
    if (!trimmedName) {
      errs.spaceName = 'Space Name is required';
    } else if (trimmedName.length > 80) {
      errs.spaceName = 'Space Name cannot exceed 80 characters';
    }

    if (description.trim().length > 500) {
      errs.description = 'Description cannot exceed 500 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: spaceName.trim(),
        description: description.trim(),
        tool: selectedTool?.name || '',
        thumbnail: activeThumbnail,
        visibility: visibility,
        tags: tags,
        iconKey: selectedTool?.iconKey || 'lucide:folder',
      };

      const response = await api.post('/api/spaces', payload);

      // Invalidate queries so My Spaces & Dashboard stay perfectly in sync
      await queryClient.invalidateQueries({ queryKey: ['spaces'] });
      await queryClient.invalidateQueries({ queryKey: ['history'] });

      message.success(`Space "${spaceName.trim()}" created successfully!`);

      // Redirect to newly created space dashboard
      const username = user?.username || 'user';
      const newSpaceId = response.data._id || response.data.id;
      navigate(`/u/${encodeURIComponent(username)}/spaces/${newSpaceId}`);
    } catch (err) {
      console.error('Failed to create space:', err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Unable to create Space. Please try again.';
      message.error(errMsg);
      setErrors(prev => ({ ...prev, server: errMsg }));
    } finally {
      setLoading(false);
    }
  };

  // Cancel Handler
  const handleCancel = () => {
    const isDirty = spaceName.trim() !== '' || description.trim() !== '';
    if (isDirty) {
      if (window.confirm('Discard unsaved changes and return to My Spaces?')) {
        navigate(`/u/${encodeURIComponent(user?.username || 'user')}/dashboard?view=spaces`);
      }
    } else {
      navigate(`/u/${encodeURIComponent(user?.username || 'user')}/dashboard?view=spaces`);
    }
  };

  // Filter tools for the creation tool selector
  const filteredTools = useMemo(() => {
    const q = toolSearch.toLowerCase().trim();
    if (!q) return TOOLS;
    return TOOLS.filter(t => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }, [toolSearch]);

  // Color tokens
  const bg = 'var(--bg-color)';
  const cardBg = isLight ? '#ffffff' : '#0e0e14';
  const cardBorder = isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.07)';
  const inputBg = isLight ? '#ffffff' : '#14141c';
  const inputBorder = isLight ? '#d1d5db' : 'rgba(255, 255, 255, 0.12)';
  const textPrimary = isLight ? '#111827' : '#f8fafc';
  const textSecondary = isLight ? '#64748b' : '#94a3b8';

  // Live preview dummy space object
  const previewSpaceData = {
    name: spaceName.trim() || `${selectedTool?.name || 'Technology'} Mastery`,
    description: description.trim() || selectedTool?.defaultDescription || 'Create notes, snippets and resources for this technology stack.',
    tool: selectedTool?.name || 'React',
    thumbnail: activeThumbnail,
    visibility: visibility,
    tags: tags.length > 0 ? tags : (selectedTool?.defaultTags || ['Frontend']),
    starsCount: 0,
    viewsCount: 0,
    sharesCount: 0,
    contributorsCount: 1,
    iconKey: selectedTool?.iconKey || 'simple-icons:react',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* Background Flowing Glow Orbs */}
      <div className="hero-background-flow" style={{ opacity: isLight ? 0.02 : 0.04 }}>
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      {/* Top Navigation Bar */}
      <header
        style={{
          height: '64px',
          borderBottom: `1px solid ${cardBorder}`,
          background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(8, 8, 12, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 36px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: textSecondary,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = textPrimary;
              e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = textSecondary;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <RiArrowLeftLine size={16} />
            <span>Back to My Spaces</span>
          </button>
        </div>

        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Logo />
        </div>
      </header>

      {/* Main Page Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(20px, 3.5vw, 36px) clamp(16px, 3vw, 32px) 80px',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Page Title & Breadcrumbs */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent-color)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '6px',
          }}>
            <RiMagicLine size={14} />
            <span>New Workspace</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(24px, 3.5vw, 32px)',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: textPrimary,
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}>
            Create a New Space
          </h1>
          <p style={{
            fontSize: '14px',
            color: textSecondary,
            margin: 0,
            maxWidth: '640px',
          }}>
            Create a dedicated workspace for your technology, projects, documentation, and knowledge repository.
          </p>
        </div>

        {/* Server error alert if any */}
        {errors.server && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isLight ? '#fca5a5' : 'rgba(239, 68, 68, 0.25)'}`,
            color: isLight ? '#b91c1c' : '#f87171',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <RiInformationLine size={18} />
            <span>{errors.server}</span>
          </div>
        )}

        {/* Two-Column Form & Live Preview Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Left Column: Form Controls */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* SECTION 1: Space Details */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.02)' : '0 4px 20px rgba(0,0,0,0.2)',
            }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: textPrimary,
                margin: 0,
              }}>
                1. Space Details
              </h2>

              {/* Space Name Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: textPrimary }}>
                    Space Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11px', color: textSecondary }}>
                    {spaceName.length}/80
                  </span>
                </div>

                <input
                  type="text"
                  required
                  maxLength={80}
                  placeholder="e.g. Spring Boot Mastery, React Systems, Python Automation"
                  value={spaceName}
                  onChange={(e) => {
                    setSpaceName(e.target.value);
                    if (errors.spaceName) setErrors(prev => ({ ...prev, spaceName: null }));
                  }}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: errors.spaceName
                      ? '1px solid #ef4444'
                      : `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textPrimary,
                    fontSize: '14px',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                  onBlur={e => e.target.style.borderColor = errors.spaceName ? '#ef4444' : inputBorder}
                />
                {errors.spaceName && (
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
                    {errors.spaceName}
                  </span>
                )}
              </div>

              {/* Description Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: textPrimary }}>
                    Description
                  </label>
                  <span style={{ fontSize: '11px', color: textSecondary }}>
                    {description.length}/500
                  </span>
                </div>

                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Backend development notes, code implementations, architectures and practical resources."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textPrimary,
                    fontSize: '13.5px',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>
            </div>

            {/* Hidden File Input for Custom Thumbnail Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {/* SECTION 2: Primary Technology Selection */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.02)' : '0 4px 20px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: textPrimary,
                    margin: 0,
                  }}>
                    2. Primary Technology / Tool
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: textSecondary }}>
                    Selecting a tool automatically sets theme-aware 3D artwork, or upload your own image.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Upload Custom Button */}
                  <button
                    type="button"
                    disabled={uploadingThumbnail}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      height: '32px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--accent-color)',
                      background: isLight ? 'rgba(79, 70, 229, 0.06)' : 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--accent-color)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: uploadingThumbnail ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: uploadingThumbnail ? 0.7 : 1,
                    }}
                  >
                    {uploadingThumbnail ? <RiLoader4Line size={14} className="animate-spin" /> : <RiUpload2Line size={14} />}
                    <span>{uploadingThumbnail ? 'Uploading...' : 'Upload Custom'}</span>
                  </button>

                  {/* Search Tools */}
                  <div style={{ position: 'relative', width: '160px' }}>
                    <RiSearchLine size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                    <input
                      type="text"
                      placeholder="Find tool..."
                      value={toolSearch}
                      onChange={e => setToolSearch(e.target.value)}
                      style={{
                        width: '100%',
                        height: '32px',
                        padding: '0 8px 0 30px',
                        borderRadius: '8px',
                        border: `1px solid ${inputBorder}`,
                        background: inputBg,
                        color: textPrimary,
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Technology Grid */}
              <div
                data-lenis-prevent
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                  gap: '8px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  padding: '2px',
                }}
              >
                {/* Upload Custom Card inside grid */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: customThumbnail
                      ? '2px solid var(--accent-color)'
                      : `1px dashed ${isLight ? '#c7d2fe' : 'rgba(99, 102, 241, 0.4)'}`,
                    background: customThumbnail
                      ? (isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.16)')
                      : (isLight ? '#f5f7ff' : '#13131e'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                    {uploadingThumbnail ? <RiLoader4Line size={18} className="animate-spin" /> : <RiUpload2Line size={18} />}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--accent-color)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    textAlign: 'center',
                  }}>
                    {uploadingThumbnail ? 'Uploading...' : (customThumbnail ? 'Custom Active' : '+ Custom')}
                  </span>
                </button>

                {filteredTools.map(tool => {
                  const isSelected = !customThumbnail && selectedToolId === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleSelectTool(tool)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 6px',
                        borderRadius: '10px',
                        border: isSelected
                          ? '2px solid var(--accent-color)'
                          : `1px solid ${inputBorder}`,
                        background: isSelected
                          ? (isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.16)')
                          : (isLight ? '#f9fafb' : '#14141c'),
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = isLight ? '#c7d2fe' : 'rgba(99, 102, 241, 0.4)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = inputBorder;
                        }
                      }}
                    >
                      <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SpaceIcon iconKey={tool.iconKey} size={20} />
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--accent-color)' : textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        textAlign: 'center',
                      }}>
                        {tool.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Thumbnail Preview and Edit Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                background: isLight ? '#f8fafc' : '#14141c',
                border: `1px solid ${cardBorder}`,
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: isLight ? '#ffffff' : '#0e0e14',
                    border: `1px solid ${cardBorder}`,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <SpaceThumbnail
                      thumbnail={activeThumbnail}
                      theme={theme}
                      style={{ width: '100%', height: '100%' }}
                      objectFit="cover"
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: textPrimary }}>
                        {customThumbnail ? 'Custom Device Thumbnail' : 'Selected Thumbnail'}
                      </span>
                      {customThumbnail && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'var(--accent-color)',
                          color: '#ffffff',
                        }}>
                          Cloudinary
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11.5px', color: textSecondary }}>
                      {customThumbnail
                        ? 'Custom image uploaded from device'
                        : `${selectedTool?.name || 'Predefined'} Artwork (${isLight ? 'Light Mode' : 'Dark Mode'})`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {customThumbnail ? (
                    <>
                      <button
                        type="button"
                        disabled={uploadingThumbnail}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${inputBorder}`,
                          background: isLight ? '#ffffff' : '#1e1e28',
                          color: textPrimary,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {uploadingThumbnail ? <RiLoader4Line size={14} className="animate-spin" /> : <RiUpload2Line size={14} />}
                        <span>Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomThumbnail(null);
                          message.info('Custom thumbnail removed. Predefined tool thumbnail active.');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${inputBorder}`,
                          background: isLight ? '#ffffff' : '#1e1e28',
                          color: isLight ? '#dc2626' : '#f87171',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <RiDeleteBinLine size={14} />
                        <span>Remove</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--accent-color)',
                          background: 'transparent',
                          color: 'var(--accent-color)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <RiImageEditLine size={14} />
                        <span>Browse 3D Gallery</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={uploadingThumbnail}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${inputBorder}`,
                          background: isLight ? '#ffffff' : '#1e1e28',
                          color: textPrimary,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {uploadingThumbnail ? <RiLoader4Line size={14} className="animate-spin" /> : <RiUpload2Line size={14} />}
                        <span>Upload Custom</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${inputBorder}`,
                          background: isLight ? '#ffffff' : '#1e1e28',
                          color: textPrimary,
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--accent-color)';
                          e.currentTarget.style.color = 'var(--accent-color)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = inputBorder;
                          e.currentTarget.style.color = textPrimary;
                        }}
                      >
                        <RiImageEditLine size={15} />
                        <span>Edit Thumbnail</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Visibility Selection */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.02)' : '0 4px 20px rgba(0,0,0,0.2)',
            }}>
              <div>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: textPrimary,
                  margin: 0,
                }}>
                  3. Space Visibility
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: textSecondary }}>
                  Control who can discover and access this space.
                </p>
              </div>

              {/* 3 Visibility Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  {
                    id: 'private',
                    label: 'Private',
                    icon: RiLockLine,
                    color: isLight ? '#059669' : '#34d399',
                    description: 'Only you and explicitly authorized collaborators can access this space.',
                    recommended: true,
                  },
                  {
                    id: 'public',
                    label: 'Public',
                    icon: RiGlobalLine,
                    color: isLight ? '#4f46e5' : '#818cf8',
                    description: 'Anyone can discover, view, and star this Space.',
                  },
                  {
                    id: 'unlisted',
                    label: 'Unlisted',
                    icon: RiLinkM,
                    color: isLight ? '#d97706' : '#fbbf24',
                    description: 'Anyone with the direct link can view, but hidden from public search.',
                  },
                ].map(opt => {
                  const isSelected = visibility === opt.id;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setVisibility(opt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: isSelected
                          ? `2px solid var(--accent-color)`
                          : `1px solid ${inputBorder}`,
                        background: isSelected
                          ? (isLight ? 'rgba(79, 70, 229, 0.05)' : 'rgba(99, 102, 241, 0.1)')
                          : (isLight ? '#fafafa' : '#14141c'),
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Radio Circle */}
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isSelected
                          ? `5px solid var(--accent-color)`
                          : `2px solid ${textSecondary}`,
                        background: '#ffffff',
                        flexShrink: 0,
                      }} />

                      {/* Icon */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isLight ? '#ffffff' : '#1f1f2a',
                        border: `1px solid ${cardBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: opt.color,
                        flexShrink: 0,
                      }}>
                        <Icon size={16} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: textPrimary }}>
                            {opt.label}
                          </span>
                          {opt.recommended && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: isLight ? 'rgba(5, 150, 105, 0.1)' : 'rgba(52, 211, 153, 0.15)',
                              color: isLight ? '#059669' : '#34d399',
                              textTransform: 'uppercase',
                            }}>
                              Default
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: textSecondary, lineHeight: 1.4 }}>
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: Tags */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.02)' : '0 4px 20px rgba(0,0,0,0.2)',
            }}>
              <div>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: textPrimary,
                  margin: 0,
                }}>
                  4. Technology Tags
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: textSecondary }}>
                  Add up to 8 keywords to categorize and filter this space.
                </p>
              </div>

              {/* Tag Input Field */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Type a tag (e.g. Hooks, REST API, Dockerfile) and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  style={{
                    flex: 1,
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '9px',
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textPrimary,
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '38px',
                    padding: '0 14px',
                    borderRadius: '9px',
                    border: 'none',
                    background: 'var(--accent-color)',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RiAddLine size={15} />
                  <span>Add</span>
                </button>
              </div>

              {/* Tag Pills List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${cardBorder}`,
                      color: textPrimary,
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: textSecondary,
                        padding: 0,
                        display: 'flex',
                      }}
                    >
                      <RiCloseLine size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Form Bottom Action Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '8px',
              flexWrap: 'wrap',
            }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  borderRadius: '10px',
                  border: `1px solid ${cardBorder}`,
                  background: 'transparent',
                  color: textSecondary,
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = textPrimary;
                  e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = textSecondary;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '44px',
                  padding: '0 28px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'var(--accent-color)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{loading ? 'Creating Space...' : 'Create Space →'}</span>
              </button>
            </div>
          </form>

          {/* Right Column: Live Space Card Preview */}
          <div style={{
            position: 'sticky',
            top: '84px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RiMagicLine size={16} style={{ color: 'var(--accent-color)' }} />
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: textPrimary,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Live Space Card Preview
                </h3>
              </div>
            </div>

            {/* Real Rendered SpaceCard */}
            <div style={{ maxWidth: '380px', width: '100%' }}>
              <ToolSpaceCard
                space={previewSpaceData}
                isPreview={true}
                customValues={previewSpaceData}
              />
            </div>

            {/* Informational helper note */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: isLight ? 'rgba(79, 70, 229, 0.04)' : 'rgba(99, 102, 241, 0.06)',
              border: `1px solid ${isLight ? 'rgba(79, 70, 229, 0.12)' : 'rgba(99, 102, 241, 0.15)'}`,
              color: textSecondary,
              fontSize: '12px',
              lineHeight: 1.45,
              maxWidth: '380px',
            }}>
              <RiInformationLine size={16} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Your Space is ready to go.</strong><br></br>
                After creation, you can add Docs, Snippets, Learnings, Repositories, Resources, and more.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Thumbnail Edit Modal */}
      <AnimatePresence>
        {isPickerOpen && (
          <ThumbnailPickerModal
            open={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            currentThumbnail={activeThumbnail}
            selectedTool={selectedTool}
            onSelectThumbnail={(thumb, tool) => {
              if (tool) {
                setSelectedToolId(tool.id);
                setCustomThumbnail(null);
              } else {
                setCustomThumbnail(thumb);
              }
            }}
            onUploadCustomClick={() => {
              fileInputRef.current?.click();
            }}
            onRemoveCustom={() => {
              setCustomThumbnail(null);
              message.info('Custom thumbnail removed. Predefined tool thumbnail active.');
            }}
            isCustomActive={Boolean(customThumbnail)}
            uploadingCustom={uploadingThumbnail}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
