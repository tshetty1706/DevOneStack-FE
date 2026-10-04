import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../layout/Logo';
import {
  RiHomeLine,
  RiDashboardLine,
  RiCompassLine,
  RiFolder5Line,
  RiArticleLine,
  RiBookmarkLine,
  RiStarLine,
  RiSettingsLine,
} from 'react-icons/ri';

export default function DashboardSidebar({ activeView = 'community', setActiveView }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isLight = theme === 'light';
  const navigate = useNavigate();

  const menuItems = [
    { id: 'spaces', label: 'My Spaces', icon: RiFolder5Line },
    { id: 'my-posts', label: 'My Posts', icon: RiArticleLine },
    { id: 'starred', label: 'Starred Stacks', icon: RiStarLine },
    { id: 'templates', label: 'Templates', icon: RiBookmarkLine },
    { id: 'explore', label: 'Explore', icon: RiCompassLine },
    { id: 'settings', label: 'Settings', icon: RiSettingsLine }
  ];

  const handleItemClick = (id) => {
    if (setActiveView) {
      setActiveView(id);
    } else {
      const username = user?.username || 'user';
      navigate(`/u/${encodeURIComponent(username)}/dashboard?view=${id}`);
    }
  };

  const handleDashboardClick = () => {
    if (setActiveView) {
      setActiveView('dashboard');
    } else {
      const username = user?.username || 'user';
      navigate(`/u/${encodeURIComponent(username)}/dashboard`);
    }
  };

  return (
    <aside style={{
      width: '240px',
      borderRight: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: isLight ? '#ffffff' : '#08080c',
      flexShrink: 0,
      zIndex: 30,
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

        {/* Dashboard Link */}
        <button
          onClick={handleDashboardClick}
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
            background: activeView === 'community'
              ? (isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)')
              : 'transparent',
            color: activeView === 'community' ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: activeView === 'community' ? 600 : 500,
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            if (activeView !== 'community') {
              e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'var(--text-color)';
            }
          }}
          onMouseLeave={e => {
            if (activeView !== 'community') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
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
              onClick={() => handleItemClick(item.id)}
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
