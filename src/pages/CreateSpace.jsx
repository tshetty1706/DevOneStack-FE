import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import api from '../api/axios';
import Logo from '../components/layout/Logo';
import SpaceThumbnail from '../components/common/SpaceThumbnail';
import ToolSpaceCard from '../components/dashboard/ToolSpaceCard';
import { TEMPLATES, getTemplateById, ALL_MODULES, getModuleById } from '../constants/templates';
import {
  RiArrowLeftLine,
  RiLockLine,
  RiGlobalLine,
  RiLinkM,
  RiAddLine,
  RiCloseLine,
  RiInformationLine,
  RiUpload2Line,
  RiDeleteBinLine,
  RiLoader4Line,
  RiImageLine,
  RiSparklingLine,
  RiCheckLine,
  RiLayoutGridLine,
  RiCompass3Line,
} from 'react-icons/ri';

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
  const [selectedTemplateId, setSelectedTemplateId] = useState('blank');
  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [visibility, setVisibility] = useState('private');
  const [tags, setTags] = useState(['Frontend', 'Notes', 'Projects']);
  const [tagInput, setTagInput] = useState('');

  // Submission State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Active Template object
  const selectedTemplate = useMemo(() => {
    return getTemplateById(selectedTemplateId);
  }, [selectedTemplateId]);

  // Current effective thumbnail: null means default theme-aware DevOneStack thumbnail
  const activeThumbnail = customThumbnail || null;

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

    // Instant local preview for immediate visual feedback
    const localPreviewUrl = URL.createObjectURL(file);
    const previousThumb = customThumbnail;
    setCustomThumbnail(localPreviewUrl);
    setUploadingThumbnail(true);

    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const res = await api.post('/api/spaces/upload-thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        setCustomThumbnail(res.data.url);
        message.success('Custom thumbnail uploaded successfully!');
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err) {
      console.error('Custom thumbnail upload failed:', err);
      // Rollback to previous thumbnail
      setCustomThumbnail(previousThumb);
      const errText = err?.response?.data?.error || 'Unable to upload thumbnail. Please try again.';
      message.error(errText);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Remove custom thumbnail and revert to default
  const handleRemoveCustomThumbnail = () => {
    setCustomThumbnail(null);
    message.info('Reverted to DevOneStack default theme thumbnail.');
  };

  // Add Tag
  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (!clean) return;

    // Duplicate check
    if (tags.some(t => t.toLowerCase() === clean.toLowerCase())) {
      message.warning(`Tag "${clean}" is already added.`);
      setTagInput('');
      return;
    }

    // Maximum 8 tags
    if (tags.length >= 8) {
      message.warning('Maximum 8 tags per Space.');
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
        thumbnail: customThumbnail || '',
        visibility: visibility,
        tags: tags,
        template: selectedTemplateId,
        enabledModules: selectedTemplate.modules,
        iconKey: 'lucide:stack',
      };

      const response = await api.post('/api/spaces', payload);

      // Invalidate queries so My Spaces & Dashboard stay in sync
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

  // Color tokens matching DevOneStack design system
  const bg = 'var(--bg-color)';
  const cardBg = isLight ? '#ffffff' : '#0e0e14';
  const cardBorder = isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.08)';
  const inputBg = isLight ? '#ffffff' : '#14141c';
  const inputBorder = isLight ? '#d1d5db' : 'rgba(255, 255, 255, 0.12)';
  const textPrimary = isLight ? '#111827' : '#f8fafc';
  const textSecondary = isLight ? '#64748b' : '#94a3b8';

  // Live preview space object
  const previewSpaceData = {
    name: spaceName.trim() || 'New Space',
    description: description.trim() || 'Create notes, snippets, documentation, and technical resources in this space.',
    thumbnail: activeThumbnail,
    visibility: visibility,
    tags: tags.length > 0 ? tags : ['Notes', 'Docs', 'Snippets'],
    starsCount: 0,
    viewsCount: 0,
    sharesCount: 0,
    contributorsCount: 1,
    isPinned: false,
    iconKey: 'lucide:stack',
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
          background: isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(8, 8, 12, 0.88)',
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
              padding: '7px 14px',
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
          maxWidth: '1240px',
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
            <RiSparklingLine size={14} />
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
            lineHeight: 1.5,
          }}>
            Choose how you want to start organizing your Space. Select a starting template and customize your modules.
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                }}>
                  1
                </div>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: textPrimary,
                  margin: 0,
                }}>
                  Space Details
                </h2>
              </div>

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
                  placeholder="e.g. System Architecture, React Notes, Backend Masterclass"
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
                  placeholder="Document patterns, code snippets, architectural decisions, and resources."
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
                    minHeight: '76px',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                  onBlur={e => e.target.style.borderColor = inputBorder}
                />
              </div>
            </div>

            {/* SECTION 2: Space Template Selection */}
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}>
                    2
                  </div>
                  <h2 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: textPrimary,
                    margin: 0,
                  }}>
                    Space Template
                  </h2>
                </div>
                <p style={{ margin: '4px 0 0 34px', fontSize: '12.5px', color: textSecondary }}>
                  Choose how you want to start organizing your Space. You can add more modules anytime.
                </p>
              </div>

              {/* Template Selection Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: '10px',
              }}>
                {TEMPLATES.map(tpl => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const Icon = tpl.icon;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: isSelected
                          ? '2px solid var(--accent-color)'
                          : `1px solid ${inputBorder}`,
                        background: isSelected
                          ? (isLight ? 'rgba(79, 70, 229, 0.06)' : 'rgba(99, 102, 241, 0.12)')
                          : (isLight ? '#f9fafb' : '#14141c'),
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = isLight ? '#c7d2fe' : 'rgba(99, 102, 241, 0.35)';
                          e.currentTarget.style.background = isLight ? '#ffffff' : '#181824';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = inputBorder;
                          e.currentTarget.style.background = isLight ? '#f9fafb' : '#14141c';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isSelected
                            ? 'var(--accent-color)'
                            : (isLight ? '#f1f5f9' : '#1f1f2c'),
                          color: isSelected ? '#ffffff' : (isLight ? '#4f46e5' : '#818cf8'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                        }}>
                          <Icon size={16} />
                        </div>

                        {isSelected ? (
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'var(--accent-color)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <RiCheckLine size={12} />
                          </div>
                        ) : (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: `2px solid ${textSecondary}`,
                          }} />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: textPrimary }}>
                            {tpl.name}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
                          color: 'var(--accent-color)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          display: 'inline-block',
                          marginBottom: '4px',
                        }}>
                          {tpl.badge}
                        </span>
                        <p style={{ margin: 0, fontSize: '11.5px', color: textSecondary, lineHeight: 1.35 }}>
                          {tpl.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
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

            {/* SECTION 3: Space Thumbnail (Default Theme Artwork OR Custom Upload) */}
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}>
                    3
                  </div>
                  <h2 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: textPrimary,
                    margin: 0,
                  }}>
                    Space Thumbnail
                  </h2>
                </div>
                <p style={{ margin: '4px 0 0 34px', fontSize: '12.5px', color: textSecondary }}>
                  Choose a default image or upload your own.
                </p>
              </div>

              {/* Thumbnail Container & Management Card */}
              <div style={{
                borderRadius: '14px',
                border: `1px solid ${cardBorder}`,
                background: isLight ? '#f9fafb' : '#14141c',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
              }}>
                {/* Aspect Ratio 16:9 Thumbnail Preview */}
                <div style={{
                  width: '160px',
                  aspectRatio: '16 / 9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: `1px solid ${cardBorder}`,
                  background: isLight ? '#f1f5f9' : '#07070b',
                  position: 'relative',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  <SpaceThumbnail
                    thumbnail={customThumbnail || ''}
                    theme={theme}
                    style={{ width: '100%', height: '100%' }}
                    objectFit="cover"
                  />
                  {uploadingThumbnail && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(3px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      <RiLoader4Line size={20} className="animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Actions & Specs Column */}
                <div style={{
                  flex: 1,
                  minWidth: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  justifyContent: 'center',
                }}>
                  {/* Action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={uploadingThumbnail}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--accent-color)',
                        background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent-color)',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: uploadingThumbnail ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: uploadingThumbnail ? 0.7 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!uploadingThumbnail) {
                          e.currentTarget.style.background = 'var(--accent-color)';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!uploadingThumbnail) {
                          e.currentTarget.style.background = isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)';
                          e.currentTarget.style.color = 'var(--accent-color)';
                        }
                      }}
                    >
                      {uploadingThumbnail ? <RiLoader4Line size={15} className="animate-spin" /> : <RiUpload2Line size={15} />}
                      <span>{customThumbnail ? 'Replace Custom Image' : 'Upload Custom Thumbnail'}</span>
                    </button>

                    {customThumbnail && (
                      <button
                        type="button"
                        onClick={handleRemoveCustomThumbnail}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${inputBorder}`,
                          background: isLight ? '#ffffff' : '#1e1e28',
                          color: isLight ? '#dc2626' : '#f87171',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.15)';
                          e.currentTarget.style.borderColor = isLight ? '#fca5a5' : '#ef4444';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = isLight ? '#ffffff' : '#1e1e28';
                          e.currentTarget.style.borderColor = inputBorder;
                        }}
                      >
                        <RiDeleteBinLine size={14} />
                        <span>Use Default</span>
                      </button>
                    )}
                  </div>

                  {/* Format & Size Specs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{
                      fontSize: '11.5px',
                      color: textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <RiImageLine size={13} />
                      <span>Recommended: 1600 × 900 • PNG, JPG, WEBP • Max 10MB</span>
                    </div>

                    <p style={{ margin: 0, fontSize: '11.5px', color: textSecondary, opacity: 0.85 }}>
                      {customThumbnail
                        ? 'Custom image uploaded from your device.'
                        : 'You can change this anytime.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Visibility Selection */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}>
                    4
                  </div>
                  <h2 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    color: textPrimary,
                    margin: 0,
                  }}>
                    Space Visibility
                  </h2>
                </div>
                <p style={{ margin: '4px 0 0 34px', fontSize: '12.5px', color: textSecondary }}>
                  Control who can discover and access this space.
                </p>
              </div>

              {/* 2 Visibility Options: Private & Public */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  {
                    id: 'private',
                    label: 'Private',
                    icon: RiLockLine,
                    color: isLight ? '#059669' : '#34d399',
                    description: 'Only you and accepted collaborators can access this space.',
                    recommended: true,
                  },
                  {
                    id: 'public',
                    label: 'Public',
                    icon: RiGlobalLine,
                    color: isLight ? '#4f46e5' : '#818cf8',
                    description: 'Anyone can discover, view, and star this Space in the Community.',
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

            {/* SECTION 5: Technology Tags */}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}>
                      5
                    </div>
                    <h2 style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      color: textPrimary,
                      margin: 0,
                    }}>
                      Technology Tags
                    </h2>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: tags.length >= 8 ? '#ef4444' : textSecondary }}>
                    {tags.length}/8 tags
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 34px', fontSize: '12.5px', color: textSecondary }}>
                  Add up to 8 keywords to categorize, search, and filter this space.
                </p>
              </div>

              {/* Tag Input Field */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Type a tag (e.g. React, Architecture, Spring, APIs) and press Enter"
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
                  disabled={tags.length >= 8}
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
                    cursor: tags.length >= 8 ? 'not-allowed' : 'pointer',
                    opacity: tags.length >= 8 ? 0.6 : 1,
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
                        alignItems: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = textSecondary}
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
                {loading ? (
                  <>
                    <RiLoader4Line size={16} className="animate-spin" />
                    <span>Creating Space...</span>
                  </>
                ) : (
                  <span>Create Space →</span>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Live Space Card Preview & Initial Sidebar Preview */}
          <div style={{
            position: 'sticky',
            top: '84px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* 1. Space Card Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RiSparklingLine size={16} style={{ color: 'var(--accent-color)' }} />
                <h3 style={{
                  fontSize: '13px',
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

              {/* Reusable Real Rendered SpaceCard */}
              <div style={{ maxWidth: '380px', width: '100%' }}>
                <ToolSpaceCard
                  space={previewSpaceData}
                  isPreview={true}
                  customValues={previewSpaceData}
                />
              </div>
            </div>

            {/* 2. Initial Sidebar Module Preview */}
            <div style={{
              maxWidth: '380px',
              width: '100%',
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: textPrimary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  Initial Sidebar Structure
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-color)',
                }}>
                  {selectedTemplate.name}
                </span>
              </div>

              {/* Sidebar simulation */}
              <div style={{
                background: isLight ? '#f8fafc' : '#08080c',
                border: `1px solid ${cardBorder}`,
                borderRadius: '10px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}>
                {selectedTemplate.modules.map(modId => {
                  const mod = getModuleById(modId);
                  if (!mod) return null;
                  const ModIcon = mod.icon;
                  const isExplorer = mod.isFixed;
                  return (
                    <div
                      key={mod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: isExplorer
                          ? (isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)')
                          : 'transparent',
                        color: isExplorer ? 'var(--accent-color)' : textPrimary,
                        fontSize: '12.5px',
                        fontWeight: isExplorer ? 600 : 500,
                        borderLeft: isExplorer ? '3px solid var(--accent-color)' : '3px solid transparent',
                      }}
                    >
                      <ModIcon size={15} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{mod.label}</span>
                      {isExplorer && (
                        <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.75, textTransform: 'uppercase' }}>Fixed</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanatory helper note */}
              <div style={{
                fontSize: '11.5px',
                color: textSecondary,
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
              }}>
                <RiInformationLine size={14} style={{ color: 'var(--accent-color)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  These are your starting modules. You can add more modules after creating the Space.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
