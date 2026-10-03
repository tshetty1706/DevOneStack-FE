import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/layout/Logo';
import DashboardNav from '../components/dashboard/DashboardNav';
import ContinueWorking from '../components/dashboard/ContinueWorking';
import RecentActivity from '../components/dashboard/RecentActivity';
import PinnedResources from '../components/dashboard/PinnedResources';
import CommandPalette from '../components/dashboard/CommandPalette';
import { useSpaces } from '../hooks/useSpaces';
import ToolSpacesGrid from '../components/dashboard/ToolSpacesGrid';
import {
  RiAddLine,
  RiDashboardLine, RiFolder5Line, RiTeamLine, RiBookmarkLine, RiCompassLine, RiStarLine,
  RiSettingsLine, RiHomeLine
} from 'react-icons/ri';

function DashboardSidebar({ activeView, setActiveView }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();

  const menuItems = [
    { id: 'spaces', label: 'My Spaces', icon: RiFolder5Line },
    { id: 'shared', label: 'Shared with me', icon: RiTeamLine },
    { id: 'templates', label: 'Templates', icon: RiBookmarkLine },
    { id: 'explore', label: 'Explore', icon: RiCompassLine },
    { id: 'starred', label: 'Starred Stacks', icon: RiStarLine },
    { id: 'settings', label: 'Settings', icon: RiSettingsLine }
  ];

  return (
    <aside style={{
      width: '240px',
      borderRight: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: isLight ? '#ffffff' : '#08080c',
      flexShrink: 0,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Brand Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '20px 24px 18px',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '18px',
        color: 'var(--text-color)',
        borderBottom: `1px solid ${isLight ? '#f0f0f0' : 'rgba(255,255,255,0.04)'}`,
        cursor: 'pointer',
      }} onClick={() => navigate('/')}>
        <Logo />
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
        {/* Home Link */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = 'var(--text-color)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <RiHomeLine size={18} />
          <span>Home</span>
        </button>

        {/* Active Dashboard Link */}
        <button
          onClick={() => setActiveView('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeView === 'dashboard'
              ? (isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)')
              : 'transparent',
            color: activeView === 'dashboard' ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: activeView === 'dashboard' ? 600 : 500,
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            if (activeView !== 'dashboard') {
              e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'var(--text-color)';
            }
          }}
          onMouseLeave={e => {
            if (activeView !== 'dashboard') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <RiDashboardLine size={18} />
          <span>Dashboard</span>
        </button>

        {/* Community Link */}
        <button
          onClick={() => navigate('/community')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = 'var(--text-color)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <RiCompassLine size={18} />
          <span>Community</span>
        </button>

        {/* WORKSPACES Header */}
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          margin: '20px 0 6px 14px',
        }}>
          Workspaces
        </div>

        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.label}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive
                  ? (isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)')
                  : 'transparent',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--text-color)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function DashboardContent() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState('dashboard');
  const [paletteOpen, setPaletteOpen] = useState(false);

  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();

  const isLight = theme === 'light';
  const bg = 'var(--bg-color)';
  const textMuted = 'var(--text-secondary)';

  const userName = localStorage.getItem('dos_profile_name') || user?.displayName || user?.username || 'Developer';

  // Keyboard shortcut: Cmd+K / Ctrl+K to open CommandPalette
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

  useEffect(() => {
    const view = searchParams.get('view') || searchParams.get('tab');
    if (view === 'spaces') {
      setActiveView('spaces');
    } else if (view && view !== 'dashboard') {
      setActiveView(view);
    } else {
      setActiveView('dashboard');
    }
  }, [searchParams]);

  const handleSetView = (view) => {
    setActiveView(view);
    setSearchParams({ view });
  };

  const handleNavigateCreateSpace = () => {
    navigate(`/u/${encodeURIComponent(user?.username || 'user')}/spaces/create`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: bg, overflow: 'hidden', position: 'relative' }}>

      {/* Background Flowing Orbs */}
      <div className="hero-background-flow" style={{ opacity: isLight ? 0.01 : 0.03 }}>
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      {/* Left Sidebar */}
      <DashboardSidebar
        activeView={activeView}
        setActiveView={handleSetView}
      />

      {/* Right Main Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        minWidth: 0,
      }}>
        {/* Top Navbar Header */}
        <DashboardNav
          onSearchOpen={() => setPaletteOpen(true)}
          onNewSpaceClick={handleNavigateCreateSpace}
        />

        {/* Scrollable Main Area */}
        <motion.main
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(20px, 3.5vw, 36px) clamp(16px, 4vw, 40px) 80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {activeView === 'dashboard' ? (
            <>
              {/* Welcome Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '4px',
              }}>
                <div style={{ minWidth: '220px' }}>
                  <h1 style={{
                    fontSize: 'clamp(22px, 3.5vw, 26px)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                    marginBottom: '4px',
                    color: isLight ? "#16161a" : "#fff"
                  }}>
                    Welcome back, {userName}! 👋
                  </h1>
                  <p style={{ fontSize: '13px', color: textMuted, margin: 0 }}>
                    Let's continue building and organizing your knowledge.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNavigateCreateSpace}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--accent-color)',
                    color: '#ffffff',
                    fontSize: '13px',
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
                  <RiAddLine size={17} />
                  <span>Create New Space</span>
                </button>
              </div>

              {/* Continue working where you left off */}
              <ContinueWorking />

              {/* Side-by-Side: Recent Activity and Pinned Resources */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '24px',
                width: '100%',
              }}>
                <RecentActivity />
                <PinnedResources />
              </div>
            </>
          ) : activeView === 'spaces' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
              {spacesLoading ? (
                <div style={{ color: textMuted, fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>
                  Loading spaces...
                </div>
              ) : (
                <ToolSpacesGrid
                  spaces={spaces}
                  onAddSpaceClick={handleNavigateCreateSpace}
                />
              )}
            </div>
          ) : (
            <div style={{ color: textMuted, padding: '80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-color)', marginBottom: '8px' }}>Coming Soon</h3>
              <p style={{ fontSize: '14px', color: textMuted }}>This workspace view is under construction.</p>
            </div>
          )}
        </motion.main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
