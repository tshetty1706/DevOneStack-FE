import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import {
  RiEditLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPin2Line,
  RiGlobalLine,
  RiGithubLine,
  RiLinkedinLine,
  RiTwitterXLine,
  RiBookOpenLine,
  RiAddLine,
  RiArrowLeftLine,
  RiCalendarLine,
  RiLayoutGridLine,
  RiStarLine,
  RiEyeLine,
  RiCameraLine,
  RiBriefcaseLine
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DashboardNav from '../components/dashboard/DashboardNav';
import NewSpaceModal from '../components/dashboard/NewSpaceModal';
import CommandPalette from '../components/dashboard/CommandPalette';
import ToolSpaceCard from '../components/dashboard/ToolSpaceCard';
import ContributionHeatmap from '../components/profile/ContributionHeatmap';
import EditProfileModal from '../components/profile/EditProfileModal';
import AvatarUploadModal from '../components/profile/AvatarUploadModal';
import { useSpaces } from '../hooks/useSpaces';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editProfileTab, setEditProfileTab] = useState('about');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Spaces sorting
  const [sortBy] = useState('updated');

  const { data: rawSpaces = [] } = useSpaces();

  // Filter and sort spaces
  const spaces = useMemo(() => {
    const list = Array.isArray(rawSpaces) ? [...rawSpaces] : [];
    if (sortBy === 'stars') {
      list.sort((a, b) => (b.starsCount || 0) - (a.starsCount || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      // recently updated
      list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }
    return list;
  }, [rawSpaces, sortBy]);

  // Dynamic statistics calculated from actual user data
  const totalStarsReceived = useMemo(() => {
    return (Array.isArray(rawSpaces) ? rawSpaces : []).reduce((acc, s) => acc + (s.starsCount || 0), 0);
  }, [rawSpaces]);

  const totalViews = useMemo(() => {
    return (Array.isArray(rawSpaces) ? rawSpaces : []).reduce((acc, s) => acc + (s.viewsCount || 0), 0);
  }, [rawSpaces]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
        <div className="skeleton-shimmer" style={{ width: '200px', height: '40px', borderRadius: '8px' }} />
      </div>
    );
  }

  // User initials
  const displayName = user.displayName || user.username || 'Developer';
  const nameParts = displayName.trim().split(/\s+/);
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0][0] || 'D').toUpperCase();

  // Formatted joined date
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  // Theme variables
  const bg = 'var(--bg-color)';
  const cardBg = 'var(--card-bg)';
  const border = 'var(--card-border)';
  const textPrimary = 'var(--text-color)';
  const textMuted = 'var(--text-secondary)';
  const textSub = isLight ? '#9ca3af' : '#64748b';
  const divider = isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.06)';
  const accentColor = isLight ? '#4f46e5' : '#6366f1';
  const pillBg = isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.12)';

  const cardStyle = {
    background: cardBg,
    border: `1px solid ${border}`,
    borderRadius: '16px',
    padding: '24px',
    position: 'relative',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const openEditTab = (tabName) => {
    setEditProfileTab(tabName);
    setEditProfileOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, transition: 'background 0.3s ease', position: 'relative' }}>

      {/* Subtle Background Glow Orbs */}
      <div className="hero-background-flow" style={{ opacity: isLight ? 0.015 : 0.04 }}>
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      <DashboardNav
        onSearchOpen={() => setPaletteOpen(true)}
        onNewSpaceClick={() => setNewSpaceOpen(true)}
      />

      <main style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: 'clamp(20px, 3vw, 32px) clamp(16px, 3vw, 24px) 80px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box',
        width: '100%',
      }}>

        {/* Top Breadcrumb Link */}
        <div style={{ alignSelf: 'flex-start' }}>
          <Button
            type="link"
            onClick={() => navigate(`/u/${encodeURIComponent(user?.username || 'user')}/dashboard`)}
            icon={<RiArrowLeftLine />}
            style={{
              color: textMuted,
              display: 'inline-flex',
              alignItems: 'center',
              padding: 0,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onMouseEnter={e => e.currentTarget.style.color = textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = textMuted}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* ── 2-COLUMN DEVELOPER PROFILE LAYOUT ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '24px',
          alignItems: 'start',
          width: '100%',
        }}>

          {/* ══════════════════════════════════════════════════════
              LEFT / MAIN COLUMN (~68% on wide viewports)
             ══════════════════════════════════════════════════════ */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            minWidth: 0,
            gridColumn: 'span 2',
          }}>

            {/* 1. Profile Header Card */}
            <div
              style={{
                ...cardStyle,
                padding: 'clamp(20px, 3vw, 28px)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}
            >
              {/* Subtle top banner glow line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${accentColor}, #a855f7, transparent)`,
              }} />

              {/* Profile Top Row: Avatar, User Details, Edit Button */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>

                  {/* Avatar Container with Camera Button */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={displayName}
                        style={{
                          width: '92px',
                          height: '92px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `3px solid ${isLight ? '#e5e7eb' : '#272732'}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '92px',
                        height: '92px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${accentColor}, #9333ea)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '34px',
                        fontWeight: 700,
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}>
                        {initials}
                      </div>
                    )}

                    <Tooltip title="Update Profile Photo">
                      <button
                        type="button"
                        onClick={() => setAvatarModalOpen(true)}
                        aria-label="Edit Profile Photo"
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: accentColor,
                          border: `2.5px solid ${isLight ? '#ffffff' : '#111116'}`,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <RiCameraLine size={15} />
                      </button>
                    </Tooltip>
                  </div>

                  {/* Details */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h2 style={{
                        fontSize: 'clamp(20px, 3vw, 24px)',
                        fontWeight: 700,
                        color: textPrimary,
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                      }}>
                        {displayName}
                      </h2>
                      {user.role && (
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: pillBg,
                          border: `1px solid ${isLight ? 'rgba(79,70,229,0.2)' : 'rgba(99,102,241,0.25)'}`,
                          color: accentColor,
                        }}>
                          {user.role}
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      fontSize: '13px',
                      color: textMuted,
                      marginBottom: '8px',
                    }}>
                      {user.username && (
                        <span style={{ color: accentColor, fontWeight: 600 }}>
                          @{user.username}
                        </span>
                      )}
                      {user.username && <span>•</span>}
                      <span>{user.email}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                      fontSize: '12.5px',
                      color: textMuted,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <RiCalendarLine size={14} style={{ color: textSub }} />
                        <span>Joined on {joinedDate}</span>
                      </div>
                      {user.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <RiMapPin2Line size={14} style={{ color: textSub }} />
                          <span>{user.location}</span>
                        </div>
                      )}
                    </div>

                    {user.bio ? (
                      <p style={{
                        fontSize: '13.5px',
                        color: isLight ? '#475569' : '#cbd5e1',
                        margin: '12px 0 0',
                        lineHeight: 1.5,
                        maxWidth: '600px',
                      }}>
                        "{user.bio}" ✨
                      </p>
                    ) : (
                      <p style={{
                        fontSize: '13px',
                        color: textSub,
                        fontStyle: 'italic',
                        margin: '10px 0 0',
                      }}>
                        No bio added yet. Click Edit Profile to add an introduction.
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit Profile Button */}
                <Button
                  icon={<RiEditLine size={14} />}
                  onClick={() => openEditTab('about')}
                  style={{
                    height: '36px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    borderColor: border,
                    background: isLight ? '#f9fafb' : '#14141c',
                    color: textPrimary,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                  }}
                >
                  Edit Profile
                </Button>
              </div>

              {/* Stats Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: `1px solid ${divider}`,
              }}>
                {/* Stat 1: Spaces */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isLight ? '#f9fafb' : '#14141a',
                  border: `1px solid ${border}`,
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)',
                    color: accentColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <RiLayoutGridLine size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}>
                      {spaces.length}
                    </div>
                    <div style={{ fontSize: '11px', color: textMuted, fontWeight: 500 }}>Spaces Owned</div>
                  </div>
                </div>

                {/* Stat 2: Views */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isLight ? '#f9fafb' : '#14141a',
                  border: `1px solid ${border}`,
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(234, 179, 8, 0.1)',
                    color: '#eab308',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <RiEyeLine size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}>
                      {totalViews}
                    </div>
                    <div style={{ fontSize: '11px', color: textMuted, fontWeight: 500 }}>Total Views</div>
                  </div>
                </div>

                {/* Stat 3: Stars Received */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isLight ? '#f9fafb' : '#14141a',
                  border: `1px solid ${border}`,
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <RiStarLine size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}>
                      {totalStarsReceived}
                    </div>
                    <div style={{ fontSize: '11px', color: textMuted, fontWeight: 500 }}>Stars Received</div>
                  </div>
                </div>

                {/* Stat 4: Education / Skills Count */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isLight ? '#f9fafb' : '#14141a',
                  border: `1px solid ${border}`,
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <RiBriefcaseLine size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}>
                      {user.skills?.length || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: textMuted, fontWeight: 500 }}>Skills Logged</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Dynamic Server-Driven Contribution Heatmap */}
            <ContributionHeatmap username={user.username} />

            {/* 3. Spaces Section (ONLY Spaces - no other module tabs) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Spaces Header & Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: textPrimary,
                      margin: 0,
                      fontFamily: 'var(--font-display)',
                    }}>
                      My Spaces
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: pillBg,
                      color: accentColor,
                    }}>
                      {spaces.length}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: textMuted, margin: '2px 0 0 0' }}>
                    Personal and collaborative workspaces you've created.
                  </p>
                </div>

              </div>

              {/* Spaces Grid / Empty State */}
              {spaces.length === 0 ? (
                <div style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: '50px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: pillBg,
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RiLayoutGridLine size={28} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: textPrimary, margin: '0 0 4px' }}>
                      No spaces yet
                    </h4>
                    <p style={{ fontSize: '13px', color: textMuted, margin: 0, maxWidth: '360px' }}>
                      Create your first space to start organizing your notes, code snippets, docs, and learnings.
                    </p>
                  </div>
                  <Button
                    type="primary"
                    icon={<RiAddLine />}
                    onClick={() => setNewSpaceOpen(true)}
                    style={{ background: accentColor, borderColor: accentColor, borderRadius: '8px', marginTop: '4px' }}
                  >
                    Create New Space
                  </Button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: '16px',
                  width: '100%',
                }}>
                  {spaces.map((space, idx) => (
                    <ToolSpaceCard key={space._id || space.id} space={space} index={idx} />
                  ))}

                  {/* Create New Space Dashed Card */}
                  <div
                    onClick={() => setNewSpaceOpen(true)}
                    style={{
                      border: `2px dashed ${isLight ? '#cbd5e1' : 'rgba(255,255,255,0.12)'}`,
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      minHeight: '220px',
                      background: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = accentColor;
                      e.currentTarget.style.background = isLight ? 'rgba(79,70,229,0.02)' : 'rgba(99,102,241,0.04)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)';
                    }}
                  >
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: pillBg,
                      color: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <RiAddLine size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: textPrimary, marginBottom: '4px' }}>
                        Create a new space
                      </div>
                      <div style={{ fontSize: '12px', color: textMuted, maxWidth: '200px' }}>
                        Organize your learnings, projects and resources.
                      </div>
                    </div>
                    <Button
                      size="small"
                      type="primary"
                      icon={<RiAddLine />}
                      style={{ background: accentColor, borderColor: accentColor, borderRadius: '6px', fontSize: '12px' }}
                    >
                      New Space
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>


          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN (~32% on wide viewports, stacks responsively)
             ══════════════════════════════════════════════════════ */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            minWidth: 0,
            gridColumn: 'span 1',
          }}>

            {/* 1. About Me Card */}
            <div
              style={cardStyle}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: textPrimary,
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.04em',
                }}>
                  About Me
                </h3>
                <button
                  type="button"
                  onClick={() => openEditTab('about')}
                  aria-label="Edit About Me"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: textMuted,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = accentColor}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <RiEditLine />
                </button>
              </div>

              {/* Bio Content */}
              {user.bio ? (
                <p style={{ fontSize: '13px', color: isLight ? '#374151' : '#cbd5e1', lineHeight: 1.6, margin: '0 0 16px' }}>
                  {user.bio}
                </p>
              ) : (
                <p style={{ fontSize: '12.5px', color: textSub, fontStyle: 'italic', margin: '0 0 16px' }}>
                  Add a short introduction about yourself.
                </p>
              )}

              {/* Skills / Technologies Tags */}
              <div>
                <div style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Skills & Technologies
                </div>
                {user.skills && user.skills.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {user.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 500,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                          color: textPrimary,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: textSub }}>No skills listed yet.</span>
                )}
              </div>
            </div>

            {/* 2. Personal Information Card */}
            <div
              style={cardStyle}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: textPrimary,
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.04em',
                }}>
                  Personal Information
                </h3>
                <button
                  type="button"
                  onClick={() => openEditTab('personal')}
                  aria-label="Edit Personal Information"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: textMuted,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = accentColor}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <RiEditLine />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: textMuted, flexShrink: 0
                  }}>
                    <RiMailLine size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Email</div>
                    <div style={{ fontSize: '13px', color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: textMuted, flexShrink: 0
                  }}>
                    <RiPhoneLine size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Phone</div>
                    <div style={{ fontSize: '13px', color: user.phone ? textPrimary : textSub }}>
                      {user.phone || 'Not added'}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: textMuted, flexShrink: 0
                  }}>
                    <RiMapPin2Line size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
                    <div style={{ fontSize: '13px', color: user.location ? textPrimary : textSub }}>
                      {user.location || 'Not added'}
                    </div>
                  </div>
                </div>

                {/* Joined */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: textMuted, flexShrink: 0
                  }}>
                    <RiCalendarLine size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '10.5px', color: textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Joined On</div>
                    <div style={{ fontSize: '13px', color: textPrimary }}>
                      {joinedDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Social Profiles Card */}
            <div
              style={cardStyle}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: textPrimary,
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.04em',
                }}>
                  Social Profiles
                </h3>
                <button
                  type="button"
                  onClick={() => openEditTab('socials')}
                  aria-label="Edit Social Profiles"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: textMuted,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = accentColor}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <RiEditLine />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* GitHub */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RiGithubLine size={18} style={{ color: textPrimary }} />
                    <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>GitHub</span>
                  </div>
                  {user.socials?.github ? (
                    <a href={user.socials.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12.5px', color: accentColor, fontWeight: 600, textDecoration: 'none' }}>
                      Connected &rarr;
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                  )}
                </div>

                {/* LinkedIn */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RiLinkedinLine size={18} style={{ color: '#0a66c2' }} />
                    <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>LinkedIn</span>
                  </div>
                  {user.socials?.linkedin ? (
                    <a href={user.socials.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12.5px', color: accentColor, fontWeight: 600, textDecoration: 'none' }}>
                      Connected &rarr;
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                  )}
                </div>

                {/* Twitter / X */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RiTwitterXLine size={17} style={{ color: textPrimary }} />
                    <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>Twitter / X</span>
                  </div>
                  {user.socials?.twitter ? (
                    <a href={user.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12.5px', color: accentColor, fontWeight: 600, textDecoration: 'none' }}>
                      Connected &rarr;
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                  )}
                </div>

                {/* Website */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RiGlobalLine size={18} style={{ color: accentColor }} />
                    <span style={{ fontSize: '13px', color: textPrimary, fontWeight: 500 }}>Website</span>
                  </div>
                  {user.socials?.website || user.website ? (
                    <a href={user.socials?.website || user.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12.5px', color: accentColor, fontWeight: 600, textDecoration: 'none' }}>
                      Visit &rarr;
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: textSub }}>Not linked</span>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Education Card */}
            <div
              style={cardStyle}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-hover-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: textPrimary,
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.04em',
                }}>
                  Education
                </h3>
                <button
                  type="button"
                  onClick={() => openEditTab('education')}
                  aria-label="Edit Education"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: textMuted,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '4px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = accentColor}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <RiEditLine />
                </button>
              </div>

              {user.education && user.education.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {user.education.map((edu, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: pillBg,
                        color: accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '2px'
                      }}>
                        <RiBookOpenLine size={16} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {edu.degree || edu.institution}
                        </div>
                        {edu.degree && edu.institution && (
                          <div style={{ fontSize: '12px', color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {edu.institution}
                          </div>
                        )}
                        <div style={{ fontSize: '11.5px', color: textSub, marginTop: '2px' }}>
                          {edu.fieldOfStudy ? `${edu.fieldOfStudy} • ` : ''}
                          {edu.startYear && edu.endYear ? `${edu.startYear} - ${edu.endYear}` : edu.startYear || edu.endYear || ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '12.5px', color: textSub, fontStyle: 'italic', margin: 0 }}>
                  No education details added yet.
                </p>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* ── Modals ── */}
      <EditProfileModal
        open={editProfileOpen}
        defaultTab={editProfileTab}
        onClose={() => setEditProfileOpen(false)}
      />

      <AvatarUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
      />

      <NewSpaceModal
        open={newSpaceOpen}
        onClose={() => setNewSpaceOpen(false)}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />

    </div>
  );
}
