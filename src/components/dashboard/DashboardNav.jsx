import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { RiSearchLine, RiQuestionLine, RiNotification3Line, RiMenuLine } from 'react-icons/ri';
import ProfileDropdown from '../dashboard/ProfileDropdown';
import InboxModal from '../inbox/InboxModal';
import { inboxApi } from '../../api/inboxApi';
import { Tooltip, message } from 'antd';

export default function DashboardNav({ onSearchOpen, onNewSpaceClick, onToggleSidebar }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const isLight = theme === 'light';
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      inboxApi.getUnreadCount()
        .then((data) => setUnreadTotal(data.totalUnread || 0))
        .catch(() => {});
    }
  }, [user]);

  const [localAvatar, setLocalAvatar] = useState(() => localStorage.getItem('dos_profile_avatar') || '');
  const [localName, setLocalName] = useState(() => localStorage.getItem('dos_profile_name') || '');

  // Listen for global profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      setLocalAvatar(localStorage.getItem('dos_profile_avatar') || '');
      setLocalName(localStorage.getItem('dos_profile_name') || '');
    };
    window.addEventListener('profile_update', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile_update', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const avatarVal = user?.avatarUrl !== undefined ? user.avatarUrl : (localAvatar || '');
  const userName = user?.displayName || user?.username || localName || 'Your Name';
  const nameParts = userName.trim().split(/\s+/);
  const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0][0] || 'YD').toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleHelpClick = () => {
    message.info({ content: 'Help & Documentation: Press ⌘K or Ctrl+K to search anytime.', duration: 3 });
  };

  const handleNotificationClick = () => {
    message.info({ content: 'All caught up! No unread notifications.', duration: 2.5 });
  };

  return (
    <header style={{
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(12px, 3vw, 28px)',
      gap: '12px',
      background: isLight ? '#ffffff' : '#08080c',
      borderBottom: `1px solid ${isLight ? '#ebebeb' : 'rgba(255,255,255,0.05)'}`,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Left side: Mobile Sidebar Toggle button */}
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="dashboard-sidebar-mobile-toggle"
          aria-label="Toggle workspace navigation"
          style={{
            display: 'none', // Shown via CSS media query on mobile/tablet
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
            background: isLight ? '#f9fafb' : '#111116',
            color: 'var(--text-color)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <RiMenuLine size={20} />
        </button>
      )}

      {/* Center Search bar */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <button
          type="button"
          onClick={onSearchOpen}
          aria-label="Search spaces and shortcuts (Press Ctrl+K or Cmd+K)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            maxWidth: '380px',
            height: '36px',
            padding: '0 12px',
            borderRadius: '20px',
            border: `1px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}`,
            background: isLight ? '#f9fafb' : '#111116',
            color: isLight ? '#999999' : '#666676',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            minWidth: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = isLight ? '#e5e5e5' : 'rgba(255,255,255,0.08)'}
        >
          <RiSearchLine size={15} style={{ flexShrink: 0 }} />
          <span style={{
            flex: 1,
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            Search spaces, notes, snippets…
          </span>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: isLight ? '#eeeeee' : '#1a1a20',
            border: `1px solid ${isLight ? '#e0e0e0' : 'rgba(255,255,255,0.08)'}`,
            color: isLight ? '#888888' : '#888899',
            flexShrink: 0,
          }}>
            ⌘K
          </span>
        </button>
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 16px)', flexShrink: 0 }}>
        <Tooltip title="Help & Quick Tips" placement="bottom">
          <button
            type="button"
            onClick={handleHelpClick}
            aria-label="Help and shortcuts"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-color)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <RiQuestionLine size={20} />
          </button>
        </Tooltip>

        <Tooltip title="Inbox" placement="bottom">
          <button
            type="button"
            onClick={() => setInboxOpen(true)}
            aria-label="View inbox and notifications"
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-color)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <RiNotification3Line size={20} />
            {unreadTotal > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                borderRadius: '8px',
                background: 'var(--accent-color)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Profile Avatar & Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen(v => !v)}
            aria-label="Open profile menu"
            aria-expanded={dropdownOpen}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: avatarVal ? 'transparent' : 'linear-gradient(135deg, #6366f1, #a78bfa)',
              border: `2px solid ${isLight ? '#e5e5e5' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#ffffff',
              overflow: 'hidden',
              padding: 0,
              transition: 'transform 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = isLight ? '#e5e5e5' : 'rgba(255,255,255,0.1)'}
          >
            {avatarVal ? (
              <img src={avatarVal} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '44px',
              zIndex: 100,
              minWidth: '220px',
            }}>
              <ProfileDropdown onClose={() => setDropdownOpen(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Inbox Modal */}
      <InboxModal
        visible={inboxOpen}
        onClose={() => setInboxOpen(false)}
        onUnreadCountChange={setUnreadTotal}
      />
    </header>
  );
}