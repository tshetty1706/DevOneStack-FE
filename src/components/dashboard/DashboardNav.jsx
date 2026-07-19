import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { RiSearchLine, RiQuestionLine, RiNotification3Line } from 'react-icons/ri';
import ProfileDropdown from '../dashboard/ProfileDropdown'

export default function DashboardNav({ onSearchOpen, onNewSpaceClick }) {
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