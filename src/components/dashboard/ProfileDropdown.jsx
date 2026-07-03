import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  RiUserLine, RiStackLine, RiStarLine, RiSettings3Line,
  RiAccessibilityLine, RiLogoutBoxLine,
} from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ProfileDropdown({ onClose }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isLight = theme === 'light';

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

  const bg = isLight ? '#ffffff' : '#111111';
  const border = isLight ? '#e5e5e5' : '#222222';
  const textPrimary = isLight ? '#111111' : '#ffffff';
  const textMuted = isLight ? '#666666' : '#999999';
  const hoverBg = isLight ? '#f5f5f5' : '#1a1a1a';
  const divider = isLight ? '#e5e5e5' : '#1a1a1a';

  const itemStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '7px 12px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '13px', color: textPrimary, border: 'none',
    background: 'transparent', width: '100%', textAlign: 'left',
    fontFamily: 'var(--font-body)', transition: 'background 0.15s ease',
  };

  const handleMenuItemClick = (label) => {
    onClose();
    if (label === 'Profile') {
      navigate('/profile');
    } else if (label === 'My Spaces') {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const MENU_GROUPS = [
    [
      { icon: <RiUserLine />, label: 'Profile' },
      { icon: <RiStackLine />, label: 'My Spaces' },
      { icon: <RiStarLine />, label: 'Starred Stacks' }
    ],
    [
      { icon: <RiSettings3Line />, label: 'Settings' },
      { icon: <RiAccessibilityLine />, label: 'Accessibility' },
    ],
  ];

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        minWidth: '220px', zIndex: 2000,
        background: bg, border: `1px solid ${border}`,
        borderRadius: '12px', boxShadow: isLight
          ? '0 8px 30px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)'
          : '0 8px 30px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      {/* User header */}
      <div style={{
        padding: '12px', display: 'flex',
        alignItems: 'center', gap: '10px'
      }}>
        {avatarVal ? (
          <img
            src={avatarVal}
            alt={userName}
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: `1px solid ${isLight ? '#e5e5e5' : '#333333'}` }}
          />
        ) : (
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
            background: isLight
              ? 'linear-gradient(135deg, #333333, #666666)'
              : 'linear-gradient(135deg, #4C4C4C, #999999)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: '#ffffff',
          }}>
            {initials}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: textPrimary, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userName}
          </div>
          <div style={{ fontSize: '11px', color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
        </div>
      </div>

      {/* Menu groups */}
      {MENU_GROUPS.map((group, gi) => (
        <React.Fragment key={gi}>
          <div style={{ height: '1px', background: divider, margin: '0 4px' }} />
          <div style={{ padding: '4px' }}>
            {group.map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => handleMenuItemClick(label)}
                style={itemStyle}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '15px', color: textMuted, display: 'flex' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* Sign out */}
      <div style={{ height: '1px', background: divider, margin: '0 4px' }} />
      <div style={{ padding: '4px' }}>
        <button
          onClick={handleLogout}
          style={{ ...itemStyle, color: isLight ? '#333333' : '#E5E5E5' }}
          onMouseEnter={e => e.currentTarget.style.background = hoverBg}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '15px', color: textMuted, display: 'flex' }}>
            <RiLogoutBoxLine />
          </span>
          Sign out
        </button>
      </div>
    </motion.div>
  );
}
