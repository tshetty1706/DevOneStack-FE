import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/layout/Logo';
import ProfileDropdown from '../components/dashboard/ProfileDropdown';
import ContinueWorking from '../components/dashboard/ContinueWorking';
import RecentActivity from '../components/dashboard/RecentActivity';
import PinnedResources from '../components/dashboard/PinnedResources';
import NewSpaceModal from '../components/dashboard/NewSpaceModal';
import ThemeToggle from '../components/layout/ThemeToggle';
import { useSpaces } from '../hooks/useSpaces';
import ToolSpacesGrid from '../components/dashboard/ToolSpacesGrid';
import {
  RiSearchLine, RiQuestionLine, RiNotification3Line, RiAddLine,
  RiDashboardLine, RiFolder5Line, RiTeamLine, RiBookmarkLine, RiCompassLine, RiStarLine,
  RiSettingsLine
} from 'react-icons/ri';

function DashboardSidebar({ activeView, setActiveView }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
      background: isLight ? '#ffffff' : '#08080c',
      borderRight: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Brand Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '20px 24px 18px',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '18px',
        color: 'var(--text-color)',
      }}>
        <Logo />
      </div>

      {/* Navigation */}
      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
              ? (isLight ? 'rgba(79,70,229,0.05)' : 'rgba(99,102,241,0.08)')
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
                  ? (isLight ? 'rgba(79,70,229,0.05)' : 'rgba(99,102,241,0.08)')
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

function DashboardHeader({ onSearchOpen, onNewSpaceClick }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isLight = theme === 'light';

  const userName = localStorage.getItem('dos_profile_name') || user?.displayName || user?.username || 'Your Name';
  const nameParts = userName.trim().split(/\s+/);
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0][0] || 'YD').toUpperCase();
  const avatarVal = localStorage.getItem('dos_profile_avatar') || user?.avatarUrl || '';

  return (
    <header style={{
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: isLight ? '#ffffff' : '#08080c',
      borderBottom: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Center Search bar */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onSearchOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', maxWidth: '380px', height: '32px',
            padding: '0 12px', borderRadius: '20px',
            border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
            background: isLight ? '#ffffff' : '#111116',
            color: isLight ? '#999999' : '#666676',
            cursor: 'pointer', fontSize: '13px',
            fontFamily: 'var(--font-body)',
            transition: 'border-color 0.2s ease',
          }}
        >
          <RiSearchLine size={14} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search spaces, notes, snippets…</span>
          <span style={{
            fontSize: '11px', padding: '1px 6px', borderRadius: '4px',
            background: isLight ? '#f5f5f5' : '#1a1a20',
            border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
            color: isLight ? '#B2B2B2' : '#4c4c5c',
          }}>⌘K</span>
        </button>
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <RiQuestionLine size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <RiNotification3Line size={20} style={{ color: 'var(--text-secondary)' }} />
          <span style={{
            position: 'absolute', top: '-1px', right: '-1px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--accent-color)'
          }} />
        </div>

        {/* Profile Avatar */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: avatarVal ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a78bfa)',
              border: `2px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '11px', fontWeight: 700,
              color: '#ffffff', overflow: 'hidden', padding: 0
            }}
          >
            {avatarVal ? (
              <img src={avatarVal} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </button>

          {dropdownOpen && (
            <div style={{ position: 'absolute', right: 0, top: '40px', zIndex: 100 }}>
              <ProfileDropdown onClose={() => setDropdownOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DashboardContent() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState('dashboard');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);

  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();

  const isLight = theme === 'light';
  const bg = 'var(--bg-color)';
  const textMuted = 'var(--text-secondary)';

  const userName = localStorage.getItem('dos_profile_name') || user?.displayName || user?.username || 'Developer';

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

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: bg, overflow: 'hidden', position: 'relative' }}>

      {/* Background Flowing Orbs - dimmed down for a clean flat aesthetic */}
      <div className="hero-background-flow" style={{ opacity: isLight ? 0.01 : 0.03 }}>
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      {/* Left Sidebar */}
      <DashboardSidebar activeView={activeView} setActiveView={handleSetView} />

      {/* Right Main Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Top Navbar Header */}
        <DashboardHeader onSearchOpen={() => setPaletteOpen(true)} onNewSpaceClick={() => setNewSpaceOpen(true)} />

        {/* Scrollable Main Area */}
        <motion.main
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 40px 80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
          }}
        >
          {activeView === 'dashboard' ? (
            <>
              {/* Welcome Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                <div>
                  <h1 style={{
                    fontSize: '26px',
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
                  onClick={() => setNewSpaceOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--accent-color)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                    transition: 'background 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? '#4338ca' : '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-color)'}
                >
                  <RiAddLine size={16} /> Create New Space
                </button>
              </div>

              {/* Continue working where you left off */}
              <ContinueWorking />

              {/* Side-by-Side: Recent Activity and Pinned Resources */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
                <div style={{ color: textMuted, fontSize: '14px', padding: '24px 0' }}>Loading spaces...</div>
              ) : (
                <ToolSpacesGrid spaces={spaces} onAddSpaceClick={() => setNewSpaceOpen(true)} />
              )}
            </div>
          ) : (
            <div style={{ color: textMuted, padding: '80px 40px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-color)', marginBottom: '8px' }}>Coming Soon</h3>
              <p style={{ fontSize: '14px', color: textMuted }}>This workspace view is under construction.</p>
            </div>
          )}
        </motion.main>
      </div>

      <ThemeToggle />

      <NewSpaceModal open={newSpaceOpen} onClose={() => setNewSpaceOpen(false)} />
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
