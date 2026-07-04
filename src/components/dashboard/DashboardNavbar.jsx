import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiStackLine, RiBookmarkLine, RiCompassLine, RiAddLine,
  RiNotification3Line, RiSearchLine,
} from 'react-icons/ri';
import Logo from '../layout/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

export default function DashboardNavbar({ onSearchOpen, onNewSpaceClick }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  const [userName, setUserName] = useState('Your Name');
  const [avatarVal, setAvatarVal] = useState('');

  const loadProfile = () => {
    if (user) {
      setUserName(localStorage.getItem('dos_profile_name') || user.displayName || user.username || 'Your Name');
      setAvatarVal(localStorage.getItem('dos_profile_avatar') || user.avatarUrl || '');
    }
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener('profile_update', loadProfile);
    return () => window.removeEventListener('profile_update', loadProfile);
  }, [user]);

  const nameParts = userName.trim().split(/\s+/);
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0][0] || 'YD').toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        avatarRef.current && !avatarRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isLight = theme === 'light';

  const navStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    background: isLight ? 'rgba(245,245,245,0.88)' : 'rgba(10,10,10,0.88)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${isLight ? '#e5e5e5' : '#1a1a1a'}`,
    transition: 'background 0.3s ease, border-color 0.3s ease',
  };

  const innerStyle = {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const iconBtnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '32px', height: '32px', borderRadius: '8px',
    cursor: 'pointer', border: 'none', background: 'transparent',
    color: isLight ? '#4C4C4C' : '#999999',
    fontSize: '18px', transition: 'background 0.15s ease, color 0.15s ease',
  };

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>
        {/* Left: Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '20px',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <Logo />
        </Link>

        {/* Center: Search */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onSearchOpen}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', maxWidth: '360px', height: '32px',
              padding: '0 12px', borderRadius: '20px',
              border: `1px solid ${isLight ? '#e5e5e5' : '#222222'}`,
              background: isLight ? '#ffffff' : '#111111',
              color: isLight ? '#999999' : '#666666',
              cursor: 'pointer', fontSize: '13px',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = isLight ? '#B2B2B2' : '#333333'}
            onMouseLeave={e => e.currentTarget.style.borderColor = isLight ? '#e5e5e5' : '#222222'}
          >
            <RiSearchLine size={14} />
            <span style={{ flex: 1, textAlign: 'left' }}>Search spaces, notes, snippets…</span>
            <span style={{
              fontSize: '11px', padding: '1px 6px', borderRadius: '4px',
              background: isLight ? '#f5f5f5' : '#1a1a1a',
              border: `1px solid ${isLight ? '#e5e5e5' : '#222222'}`,
              color: isLight ? '#B2B2B2' : '#4C4C4C',
            }}>⌘K</span>
          </button>
        </div>

        {/* Right: Icon row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {[
            { icon: <RiBookmarkLine />, tip: 'Saved' },
            { icon: <RiCompassLine />, tip: 'Discover — coming soon' },
            { icon: <RiAddLine />, tip: 'New Space', onClick: onNewSpaceClick },
            { icon: <RiNotification3Line />, tip: 'Notifications' },
          ].map(({ icon, tip, onClick }) => (
            <Tooltip key={tip} title={tip} placement="bottom">
              <button
                onClick={onClick}
                style={iconBtnStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.background = isLight ? '#f0f0f0' : '#1a1a1a';
                  e.currentTarget.style.color = isLight ? '#111111' : '#ffffff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isLight ? '#4C4C4C' : '#999999';
                }}
              >
                {icon}
              </button>
            </Tooltip>
          ))}

          {/* Avatar */}
          <div style={{ position: 'relative', marginLeft: '4px' }}>
            <button
              ref={avatarRef}
              onClick={() => setDropdownOpen(v => !v)}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: avatarVal ? 'transparent' : (isLight
                  ? 'linear-gradient(135deg, #333333, #666666)'
                  : 'linear-gradient(135deg, #4C4C4C, #999999)'),
                border: `2px solid ${dropdownOpen ? (isLight ? '#333333' : '#ffffff') : (isLight ? '#e5e5e5' : '#333333')}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px', fontWeight: 700,
                color: '#ffffff', letterSpacing: '0.03em',
                transition: 'border-color 0.2s ease',
                overflow: 'hidden', padding: 0
              }}
            >
              {avatarVal ? (
                <img src={avatarVal} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <div ref={dropdownRef}>
                  <ProfileDropdown onClose={() => setDropdownOpen(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
